import { NextRequest, NextResponse } from 'next/server'

/**
 * Nominatim reverse-geocoding proxy
 *
 * Why this exists:
 *  - Nominatim enforces a 1 req/sec per IP rate limit.
 *  - If the client calls Nominatim directly, high-traffic spikes will get
 *    throttled or blocked.
 *  - This proxy runs server-side (single server IP), adds a 15-min in-memory
 *    cache keyed by rounded lat/lng (3 decimal places ≈ 111 m grid), and sets
 *    the correct User-Agent the Nominatim policy requires.
 *
 * Usage: GET /api/geocode?lat=33.4484&lon=-112.0740
 * Returns: { city, state, zip, display_name }
 */

type CacheEntry = {
  data: GeoResult
  expiresAt: number
}

type GeoResult = {
  city: string
  state: string
  zip: string
  display_name: string
}

// In-memory cache (resets on server restart — acceptable for geocoding)
const cache = new Map<string, CacheEntry>()
const TTL_MS = 15 * 60 * 1000 // 15 minutes

function roundCoord(n: number): string {
  return n.toFixed(3)
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const rawLat = searchParams.get('lat')
  const rawLon = searchParams.get('lon')

  if (!rawLat || !rawLon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 })
  }

  const lat = parseFloat(rawLat)
  const lon = parseFloat(rawLon)

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const cacheKey = `${roundCoord(lat)},${roundCoord(lon)}`

  // Return cached result if still valid
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=900' },
    })
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&countrycodes=us`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'NEXUS-Health-App/1.0 (https://nexushealth.app; contact@nexushealth.app)',
        'Accept-Language': 'en',
      },
      // Next.js fetch cache — deduplicate concurrent requests in the same render
      next: { revalidate: 900 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding service unavailable' }, { status: 502 })
    }

    const d = await res.json()
    const addr = d.address ?? {}

    const result: GeoResult = {
      city: addr.city || addr.town || addr.village || addr.county || '',
      state: addr.state_code || addr.state || '',
      zip: addr.postcode || '',
      display_name: d.display_name || '',
    }

    // Store in cache
    cache.set(cacheKey, { data: result, expiresAt: Date.now() + TTL_MS })

    // Evict stale entries when cache grows large (keep it bounded)
    if (cache.size > 500) {
      const now = Date.now()
      for (const [k, v] of cache.entries()) {
        if (v.expiresAt <= now) cache.delete(k)
      }
    }

    return NextResponse.json(result, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=900' },
    })
  } catch (err) {
    console.error('[/api/geocode] fetch error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
