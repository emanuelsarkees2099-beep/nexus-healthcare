/**
 * In-memory US places index — every city (29,542) and ZIP (40,979).
 * Compiled from GeoNames (CC-BY 4.0 — geonames.org) by
 * scripts/build-places.mjs. Loaded once per server instance.
 *
 * Powers:
 *   • /api/places — typeahead over EVERY US city/ZIP (no dead-end
 *     suggestions: the clinic search auto-widens its radius, so a pick
 *     with no local clinics still resolves to the nearest results)
 *   • /api/clinics — instant local geocoding (replaces the ~1s
 *     Nominatim round-trip for ZIPs and City, ST queries)
 */
import placesData from '@/lib/data/us-places.json'

type CityTuple = [name: string, state: string, lat: number, lng: number, zipCount: number]
type ZipTuple  = [zip: string, cityIdx: number, lat: number, lng: number]

const CITIES = (placesData as unknown as { cities: CityTuple[] }).cities
const ZIPS   = (placesData as unknown as { zips: ZipTuple[] }).zips

/* ── Lookup maps (built once at module load, ~5ms) ── */
const zipMap = new Map<string, ZipTuple>()
for (const z of ZIPS) zipMap.set(z[0], z)

const cityMap = new Map<string, CityTuple>() // "name|ST" lowercase
for (const c of CITIES) cityMap.set(`${c[0].toLowerCase()}|${c[1]}`, c)

const STATE_NAMES: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS',
  kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA',
  michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT',
  nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
  ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI',
  'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX',
  utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA',
  'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
  'district of columbia': 'DC',
}

export type Place = {
  label: string
  value: string
  type: 'city' | 'state' | 'zip'
  lat?: number
  lng?: number
}

/** Typeahead over every US city, state, and ZIP. */
export function searchPlaces(rawQ: string, limit = 7): Place[] {
  const q = rawQ.trim()
  if (q.length < 2) return []
  const out: Place[] = []

  /* ZIP prefix */
  if (/^\d{2,5}$/.test(q)) {
    for (const z of ZIPS) {
      if (z[0].startsWith(q)) {
        const c = CITIES[z[1]]
        out.push({ label: `${z[0]} — ${c[0]}, ${c[1]}`, value: z[0], type: 'zip', lat: z[2], lng: z[3] })
        if (out.length >= limit) break
      }
    }
    return out
  }

  const qLower = q.toLowerCase()

  /* States (full-name prefix or exact 2-letter abbrev) */
  for (const [name, abbrev] of Object.entries(STATE_NAMES)) {
    if (name.startsWith(qLower) || abbrev === q.toUpperCase()) {
      const display = name.replace(/\b[a-z]/g, ch => ch.toUpperCase())
      out.push({ label: `${display} (${abbrev})`, value: display, type: 'state' })
      if (out.length >= 2) break
    }
  }

  /* Cities — supports "chandler" and "chandler, az" / "chandler az".
     Ranked by zipCount (proxy for size) so Chandler AZ beats Chandler IN. */
  const m = qLower.match(/^(.+?)[,\s]+([a-z]{2})$/)
  const nameQ  = (m ? m[1] : qLower).trim()
  const stateQ = m ? m[2].toUpperCase() : null

  const matches: Array<{ c: CityTuple; score: number }> = []
  for (const c of CITIES) {
    const cl = c[0].toLowerCase()
    if (!cl.startsWith(nameQ)) continue
    if (stateQ && c[1] !== stateQ) continue
    matches.push({ c, score: c[4] + (cl === nameQ ? 1000 : 0) })
  }
  matches.sort((a, b) => b.score - a.score)
  for (const { c } of matches.slice(0, limit - out.length)) {
    out.push({ label: `${c[0]}, ${c[1]}`, value: `${c[0]}, ${c[1]}`, type: 'city', lat: c[2], lng: c[3] })
  }
  return out.slice(0, limit)
}

/** Instant local geocode for ZIPs, "City, ST", and state names.
    Returns null when the query needs a full geocoder (street addresses). */
export function geocodePlace(rawLoc: string): { lat: number; lng: number; zip: string; city: string; state: string } | null {
  const loc = rawLoc.trim()

  /* Exact ZIP */
  const zipM = loc.match(/^(\d{5})(?:-\d{4})?$/)
  if (zipM) {
    const z = zipMap.get(zipM[1])
    if (z) {
      const c = CITIES[z[1]]
      return { lat: z[2], lng: z[3], zip: z[0], city: c[0], state: c[1] }
    }
    return null
  }

  /* "City, ST" or "City ST" */
  const m = loc.toLowerCase().match(/^(.+?)[,\s]+([a-z]{2})$/)
  if (m) {
    const c = cityMap.get(`${m[1].trim()}|${m[2].toUpperCase()}`)
    if (c) return { lat: c[2], lng: c[3], zip: '', city: c[0], state: c[1] }
  }

  /* "City, State Name" */
  const m2 = loc.toLowerCase().match(/^(.+?),\s*([a-z .]+)$/)
  if (m2 && STATE_NAMES[m2[2].trim()]) {
    const c = cityMap.get(`${m2[1].trim()}|${STATE_NAMES[m2[2].trim()]}`)
    if (c) return { lat: c[2], lng: c[3], zip: '', city: c[0], state: c[1] }
  }

  /* Bare city name — pick the largest match */
  const bare = loc.toLowerCase()
  let best: CityTuple | null = null
  for (const c of CITIES) {
    if (c[0].toLowerCase() === bare && (!best || c[4] > best[4])) best = c
  }
  if (best) return { lat: best[2], lng: best[3], zip: '', city: best[0], state: best[1] }

  return null
}
