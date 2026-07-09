import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

/**
 * GET /api/places?q=chandler — location typeahead for clinic search.
 *
 * Backed by our own clinics table (18,938 HRSA sites), which means every
 * suggested place is GUARANTEED to have clinics near it — unlike generic
 * geocoders that happily suggest towns with zero results.
 *
 * Matches, in priority order:
 *   1. States   — "ariz"  → Arizona (AZ)          (static list)
 *   2. ZIPs     — "8502"  → 85023 — Phoenix, AZ    (numeric input only)
 *   3. Cities   — "chand" → Chandler, AZ · Chandler, TX · Chandler, IN
 *                 ranked by clinic count (most-served city first)
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

const STATES: Array<[name: string, abbrev: string]> = [
  ['Alabama', 'AL'], ['Alaska', 'AK'], ['Arizona', 'AZ'], ['Arkansas', 'AR'],
  ['California', 'CA'], ['Colorado', 'CO'], ['Connecticut', 'CT'], ['Delaware', 'DE'],
  ['Florida', 'FL'], ['Georgia', 'GA'], ['Hawaii', 'HI'], ['Idaho', 'ID'],
  ['Illinois', 'IL'], ['Indiana', 'IN'], ['Iowa', 'IA'], ['Kansas', 'KS'],
  ['Kentucky', 'KY'], ['Louisiana', 'LA'], ['Maine', 'ME'], ['Maryland', 'MD'],
  ['Massachusetts', 'MA'], ['Michigan', 'MI'], ['Minnesota', 'MN'], ['Mississippi', 'MS'],
  ['Missouri', 'MO'], ['Montana', 'MT'], ['Nebraska', 'NE'], ['Nevada', 'NV'],
  ['New Hampshire', 'NH'], ['New Jersey', 'NJ'], ['New Mexico', 'NM'], ['New York', 'NY'],
  ['North Carolina', 'NC'], ['North Dakota', 'ND'], ['Ohio', 'OH'], ['Oklahoma', 'OK'],
  ['Oregon', 'OR'], ['Pennsylvania', 'PA'], ['Rhode Island', 'RI'], ['South Carolina', 'SC'],
  ['South Dakota', 'SD'], ['Tennessee', 'TN'], ['Texas', 'TX'], ['Utah', 'UT'],
  ['Vermont', 'VT'], ['Virginia', 'VA'], ['Washington', 'WA'], ['West Virginia', 'WV'],
  ['Wisconsin', 'WI'], ['Wyoming', 'WY'], ['District of Columbia', 'DC'],
]

export type PlaceSuggestion = {
  /** What to show in the dropdown */
  label: string
  /** What to put in the input / send to search */
  value: string
  type: 'state' | 'zip' | 'city'
}

/** Title-case a DB city name (stored as-is from HRSA, usually clean) */
function tc(s: string): string {
  return s.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase())
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req as unknown as Request, { limit: 120, windowMs: 60_000, namespace: 'places' })
  if (!rl.ok) {
    return NextResponse.json({ suggestions: [] }, { status: 429, headers: rl.headers })
  }

  const q = (new URL(req.url).searchParams.get('q') ?? '').trim()
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  const suggestions: PlaceSuggestion[] = []

  try {
    /* ── ZIP prefix (numeric input) ── */
    if (/^\d{2,5}$/.test(q)) {
      const { data } = await supabase
        .from('clinics')
        .select('zip, city, state')
        .like('zip', `${q}%`)
        .not('zip', 'is', null)
        .limit(300)

      const byZip = new Map<string, { city: string; state: string; count: number }>()
      for (const r of data ?? []) {
        if (!r.zip || r.zip.length !== 5) continue
        const cur = byZip.get(r.zip)
        if (cur) cur.count++
        else byZip.set(r.zip, { city: r.city ?? '', state: r.state ?? '', count: 1 })
      }
      const zips = [...byZip.entries()]
        .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
        .slice(0, 6)
      for (const [zip, meta] of zips) {
        suggestions.push({
          label: meta.city ? `${zip} — ${tc(meta.city)}, ${meta.state}` : zip,
          value: zip,
          type: 'zip',
        })
      }
      return NextResponse.json(
        { suggestions },
        { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
      )
    }

    /* ── States (name prefix or exact abbreviation) ── */
    const qLower = q.toLowerCase()
    const qUpper = q.toUpperCase()
    for (const [name, abbrev] of STATES) {
      if (name.toLowerCase().startsWith(qLower) || abbrev === qUpper) {
        suggestions.push({ label: `${name} (${abbrev})`, value: name, type: 'state' })
        if (suggestions.length >= 2) break
      }
    }

    /* ── Cities (prefix match, ranked by clinic count) ── */
    const { data } = await supabase
      .from('clinics')
      .select('city, state')
      .ilike('city', `${q}%`)
      .not('city', 'is', null)
      .limit(400)

    const byCity = new Map<string, number>()
    for (const r of data ?? []) {
      if (!r.city || !r.state) continue
      const key = `${tc(r.city)}, ${r.state}`
      byCity.set(key, (byCity.get(key) ?? 0) + 1)
    }
    const cities = [...byCity.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6 - Math.min(suggestions.length, 2))
    for (const [label] of cities) {
      suggestions.push({ label, value: label, type: 'city' })
    }

    return NextResponse.json(
      { suggestions: suggestions.slice(0, 7) },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
    )
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
