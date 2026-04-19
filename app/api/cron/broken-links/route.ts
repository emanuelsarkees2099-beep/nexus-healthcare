import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Cron: Broken Link Checker ───────────────────────────────────────────────────
// Runs biweekly via Vercel Cron. Checks external URLs used throughout the app
// (program links, resource pages, external references) for 404s or errors.
// Schedule: every other Monday at 3 AM UTC (see vercel.json)

const getSupabaseClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// All critical external URLs used in the NEXUS app
const LINKS_TO_CHECK = [
  // Programs page
  { name: 'Medicaid enrollment', url: 'https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/', page: '/programs' },
  { name: 'HRSA Find a Health Center', url: 'https://findahealthcenter.hrsa.gov', page: '/programs' },
  { name: 'ACA Marketplace enrollment', url: 'https://www.healthcare.gov/apply-and-enroll/start-enrollment/', page: '/programs' },
  { name: 'NeedyMeds PAP', url: 'https://www.needymeds.org/pap', page: '/programs' },
  // Rights page
  { name: 'EMTALA info (CMS)', url: 'https://www.cms.gov/medicare/provider-enrollment-and-certification/surveycertificationgeninfo/policy-and-memos-to-states-and-regions-items/cms1340124', page: '/rights' },
  // Resources
  { name: 'Healthcare.gov', url: 'https://healthcare.gov', page: 'global' },
  { name: 'HRSA API main', url: 'https://findahealthcenter.hrsa.gov', page: '/api/clinics' },
  { name: 'NeedyMeds main', url: 'https://www.needymeds.org', page: 'global' },
  { name: 'Benefits.gov', url: 'https://www.benefits.gov', page: 'global' },
  { name: 'GoodRx main', url: 'https://www.goodrx.com', page: 'global' },
  // NAFC clinics — spot check a few
  { name: 'Venice Family Clinic', url: 'https://venicefamilyclinic.org', page: '/search' },
  { name: 'Church Health Center Memphis', url: 'https://churchhealth.org', page: '/search' },
  { name: 'CrossOver Healthcare Richmond', url: 'https://crossoverministry.org', page: '/search' },
  { name: 'Siloam Health Nashville', url: 'https://siloamhealth.org', page: '/search' },
  { name: 'Lawndale Christian Health', url: 'https://lawndalechc.org', page: '/search' },
]

async function checkURL(name: string, url: string): Promise<{ name: string; url: string; status: number | null; ok: boolean; error?: string }> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(url, {
      method: 'HEAD', // Lightweight — don't download body
      headers: { 'User-Agent': 'NEXUS-LinkChecker/1.0 contact@nexus.health' },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeout)

    return {
      name,
      url,
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
    }
  } catch (err) {
    const errMsg = String(err)
    return {
      name,
      url,
      status: null,
      ok: false,
      error: errMsg.includes('AbortError') ? 'Timeout (10s)' : errMsg.slice(0, 80),
    }
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
    // Check all links in parallel (reasonable to do all at once since they're lightweight HEAD requests)
    const results = await Promise.all(
      LINKS_TO_CHECK.map(link => checkURL(link.name, link.url))
    )

    const broken = results.filter(r => !r.ok)
    const healthy = results.filter(r => r.ok)

    const summary = {
      ran_at: new Date().toISOString(),
      total_checked: results.length,
      healthy: healthy.length,
      broken: broken.length,
      broken_links: broken,
      duration_ms: Date.now() - startTime,
    }

    // Log to Supabase
    try {
      await getSupabaseClient().from('cron_logs').insert({
        job_name: 'broken-links',
        ran_at: summary.ran_at,
        result: summary,
        success: true,
      })
    } catch { /* ignore */ }

    // If broken links found, log them prominently
    if (broken.length > 0) {
      console.warn('[BrokenLinks] Found', broken.length, 'broken links:', broken.map(b => b.url).join(', '))
    } else {
      console.log('[BrokenLinks] All', healthy.length, 'links healthy')
    }

    return NextResponse.json(summary)
  } catch (err) {
    const errMsg = String(err)
    console.error('[BrokenLinks] Error:', errMsg)

    try {
      await getSupabaseClient().from('cron_logs').insert({
        job_name: 'broken-links',
        ran_at: new Date().toISOString(),
        result: { error: errMsg, duration_ms: Date.now() - startTime },
        success: false,
      })
    } catch { /* ignore */ }

    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
