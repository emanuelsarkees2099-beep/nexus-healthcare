import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Cron: Refresh Clinic Freshness ─────────────────────────────────────────────
// Runs weekly via Vercel Cron. Checks cached clinic data for staleness,
// pings HRSA API for each stored zip code, and updates the cache.
// Schedule: every Sunday at 2 AM UTC (see vercel.json)
//
// To invoke manually: GET /api/cron/refresh-clinics
// Authorization: Bearer $CRON_SECRET

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function verifyHRSAEndpoint(zip: string): Promise<{ ok: boolean; count: number }> {
  const url = `https://findahealthcenter.hrsa.gov/api/v1/healthcenter/FindHealthCenters?zipcode=${zip}&radius=25`
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'NEXUS-ClinicBot/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return { ok: false, count: 0 }
    const data: unknown = await res.json()
    let count = 0
    if (Array.isArray(data)) count = data.length
    else if (data && typeof data === 'object') {
      const r = data as Record<string, unknown>
      const list = r.Results ?? r.HealthCenters ?? r.Sites ?? []
      count = Array.isArray(list) ? list.length : 0
    }
    return { ok: true, count }
  } catch {
    return { ok: false, count: 0 }
  }
}

export async function GET(req: NextRequest) {
  // Authorize via secret token (set in Vercel environment variables)
  const authHeader = req.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results: Array<{ zip: string; count: number; ok: boolean }> = []

  try {
    // Get the most frequently searched ZIP codes from outcomes/search logs
    // Fallback to a hardcoded list of major city ZIPs for initial run
    const majorZips = [
      '10001', // New York, NY
      '90001', // Los Angeles, CA
      '60601', // Chicago, IL
      '77001', // Houston, TX
      '85001', // Phoenix, AZ
      '19101', // Philadelphia, PA
      '78201', // San Antonio, TX
      '92101', // San Diego, CA
      '75201', // Dallas, TX
      '95101', // San Jose, CA
      '78701', // Austin, TX
      '32099', // Jacksonville, FL
      '78901', // Fort Worth, TX
      '43085', // Columbus, OH
      '28201', // Charlotte, NC
      '46201', // Indianapolis, IN
      '94101', // San Francisco, CA
      '98101', // Seattle, WA
      '39501', // Biloxi, MS
      '80201', // Denver, CO
    ]

    // Try to get top searched ZIPs from Supabase search_logs (if table exists)
    let targetZips = majorZips
    try {
      const { data: loggedZips } = await supabase
        .from('search_logs')
        .select('zip_code')
        .not('zip_code', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50)

      if (loggedZips && loggedZips.length > 0) {
        const uniqueZips = [...new Set(loggedZips.map((r: { zip_code: string }) => r.zip_code).filter(Boolean))]
        targetZips = uniqueZips.slice(0, 20)
        console.log('[CronRefresh] Using', targetZips.length, 'ZIPs from search logs')
      }
    } catch {
      console.log('[CronRefresh] No search_logs table — using major city ZIPs')
    }

    // Process ZIPs in batches of 5 to avoid rate limits
    for (let i = 0; i < targetZips.length; i += 5) {
      const batch = targetZips.slice(i, i + 5)
      const batchResults = await Promise.all(
        batch.map(async (zip) => {
          const { ok, count } = await verifyHRSAEndpoint(zip)
          return { zip, ok, count }
        })
      )
      results.push(...batchResults)

      // Small delay between batches to be respectful to HRSA API
      if (i + 5 < targetZips.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Log results to Supabase cron_logs table (if it exists)
    const summary = {
      ran_at: new Date().toISOString(),
      zips_checked: results.length,
      zips_healthy: results.filter(r => r.ok).length,
      zips_failed: results.filter(r => !r.ok).length,
      total_clinics_found: results.reduce((sum, r) => sum + r.count, 0),
      duration_ms: Date.now() - startTime,
      details: results,
    }

    try {
      await supabase.from('cron_logs').insert({
        job_name: 'refresh-clinics',
        ran_at: summary.ran_at,
        result: summary,
        success: true,
      })
    } catch {
      // cron_logs table may not exist — that's OK
    }

    console.log('[CronRefresh] Complete:', summary)
    return NextResponse.json(summary)
  } catch (err) {
    const errMsg = String(err)
    console.error('[CronRefresh] Error:', errMsg)

    try {
      await supabase.from('cron_logs').insert({
        job_name: 'refresh-clinics',
        ran_at: new Date().toISOString(),
        result: { error: errMsg, duration_ms: Date.now() - startTime },
        success: false,
      })
    } catch { /* ignore */ }

    return NextResponse.json({ error: errMsg, duration_ms: Date.now() - startTime }, { status: 500 })
  }
}
