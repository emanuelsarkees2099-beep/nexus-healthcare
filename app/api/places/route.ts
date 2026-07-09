import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { searchPlaces } from '@/lib/us-places'

/**
 * GET /api/places?q=chandler — location typeahead for clinic search.
 *
 * Backed by the in-memory GeoNames index (lib/us-places.ts):
 * EVERY US city (29,542) and ZIP (40,979) is suggestible —
 *   "chandler" → Chandler, AZ · Chandler, TX · Chandler, IN …
 *   "8502"     → 85020 — Phoenix, AZ …
 *   "ariz"     → Arizona (AZ)
 * Cities are ranked by size (ZIP count), so the likeliest match leads.
 *
 * Dead-end safety: picks with no local clinics still resolve — the
 * clinic search auto-widens its radius (25→50→75mi) to the nearest
 * real results, so suggesting every place is safe.
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(req as unknown as Request, { limit: 120, windowMs: 60_000, namespace: 'places' })
  if (!rl.ok) {
    return NextResponse.json({ suggestions: [] }, { status: 429, headers: rl.headers })
  }

  const q = (new URL(req.url).searchParams.get('q') ?? '').trim()
  const suggestions = searchPlaces(q, 7).map(p => ({
    label: p.label,
    value: p.value,
    type: p.type,
  }))

  return NextResponse.json(
    { suggestions },
    { headers: { 'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000' } }
  )
}
