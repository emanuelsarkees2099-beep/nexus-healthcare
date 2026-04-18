import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Cron: Weekly Impact Digest ─────────────────────────────────────────────────
// Runs every Monday at 8 AM UTC via Vercel Cron.
// Compiles platform-wide impact stats and optionally emails them via Resend.
// Schedule: every Monday at 8 AM UTC (see vercel.json)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface WeeklyStats {
  week_start: string
  week_end: string
  new_users: number
  clinic_searches: number
  outcomes_logged: number
  programs_discovered: number
  top_searched_zips: string[]
  top_outcome_events: Record<string, number>
}

async function compileWeeklyStats(): Promise<WeeklyStats> {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const since = weekAgo.toISOString()

  const stats: WeeklyStats = {
    week_start: since,
    week_end: now.toISOString(),
    new_users: 0,
    clinic_searches: 0,
    outcomes_logged: 0,
    programs_discovered: 0,
    top_searched_zips: [],
    top_outcome_events: {},
  }

  // New users this week
  try {
    const { count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since)
    stats.new_users = count ?? 0
  } catch { /* ignore */ }

  // Clinic searches this week
  try {
    const { count } = await supabase
      .from('search_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since)
    stats.clinic_searches = count ?? 0
  } catch { /* ignore */ }

  // Outcomes logged this week
  try {
    const { data: outcomes } = await supabase
      .from('outcomes')
      .select('event_type, zip_code')
      .gte('created_at', since)
    if (outcomes) {
      stats.outcomes_logged = outcomes.length
      const byType: Record<string, number> = {}
      const zipCounts: Record<string, number> = {}
      for (const o of outcomes) {
        byType[o.event_type] = (byType[o.event_type] || 0) + 1
        if (o.zip_code) zipCounts[o.zip_code] = (zipCounts[o.zip_code] || 0) + 1
      }
      stats.top_outcome_events = byType
      stats.top_searched_zips = Object.entries(zipCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([zip]) => zip)
    }
  } catch { /* ignore */ }

  return stats
}

async function sendDigestEmail(stats: WeeklyStats): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  const digestEmail = process.env.DIGEST_EMAIL || 'team@nexus.health'

  if (!resendKey) {
    console.log('[WeeklyDigest] No RESEND_API_KEY — skipping email')
    return false
  }

  const weekLabel = new Date(stats.week_start).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #07070F; color: #e8eaed; padding: 32px; }
      h1 { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
      .subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin-bottom: 32px; }
      .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
      .stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; }
      .stat-num { font-size: 32px; font-weight: 700; color: #4ade80; }
      .stat-label { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px; }
      .section { margin: 24px 0; }
      .section h2 { font-size: 16px; color: rgba(255,255,255,0.7); border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; }
      .footer { margin-top: 40px; font-size: 12px; color: rgba(255,255,255,0.25); }
    </style></head>
    <body>
      <h1>NEXUS Weekly Impact Digest</h1>
      <p class="subtitle">Week of ${weekLabel}</p>

      <div class="stat-grid">
        <div class="stat">
          <div class="stat-num">${stats.new_users}</div>
          <div class="stat-label">New users joined</div>
        </div>
        <div class="stat">
          <div class="stat-num">${stats.clinic_searches}</div>
          <div class="stat-label">Clinic searches</div>
        </div>
        <div class="stat">
          <div class="stat-num">${stats.outcomes_logged}</div>
          <div class="stat-label">Outcomes logged</div>
        </div>
        <div class="stat">
          <div class="stat-num">${Object.values(stats.top_outcome_events).reduce((a, b) => a + b, 0)}</div>
          <div class="stat-label">Total health events</div>
        </div>
      </div>

      ${Object.keys(stats.top_outcome_events).length > 0 ? `
      <div class="section">
        <h2>Outcome Events</h2>
        ${Object.entries(stats.top_outcome_events).map(([type, count]) =>
          `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:14px;">
            <span style="color:rgba(255,255,255,0.6)">${type.replace(/_/g, ' ')}</span>
            <span style="color:#4ade80;font-weight:600">${count}</span>
          </div>`
        ).join('')}
      </div>` : ''}

      ${stats.top_searched_zips.length > 0 ? `
      <div class="section">
        <h2>Top Searched ZIPs</h2>
        <p style="font-size:14px;color:rgba(255,255,255,0.5)">${stats.top_searched_zips.join(' · ')}</p>
      </div>` : ''}

      <div class="footer">
        Generated by NEXUS Impact Bot · <a href="https://nexus.health" style="color:#6d9197">nexus.health</a><br>
        This email is sent to the NEXUS team only. No patient data is included.
      </div>
    </body>
    </html>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NEXUS Impact <digest@nexus.health>',
        to: [digestEmail],
        subject: `NEXUS Weekly Impact — ${weekLabel}`,
        html,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  // Authorize
  const authHeader = req.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()

  try {
    const stats = await compileWeeklyStats()
    const emailSent = await sendDigestEmail(stats)

    const result = {
      ...stats,
      email_sent: emailSent,
      duration_ms: Date.now() - startTime,
    }

    // Log to Supabase
    try {
      await supabase.from('cron_logs').insert({
        job_name: 'weekly-digest',
        ran_at: new Date().toISOString(),
        result,
        success: true,
      })
    } catch { /* ignore */ }

    console.log('[WeeklyDigest] Complete:', result)
    return NextResponse.json(result)
  } catch (err) {
    const errMsg = String(err)
    console.error('[WeeklyDigest] Error:', errMsg)

    try {
      await supabase.from('cron_logs').insert({
        job_name: 'weekly-digest',
        ran_at: new Date().toISOString(),
        result: { error: errMsg, duration_ms: Date.now() - startTime },
        success: false,
      })
    } catch { /* ignore */ }

    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
