import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/geoip — coarse IP-level location for the Living Proof panel.
 *
 * Production (Vercel): reads x-vercel-ip-* headers — zero external calls,
 * zero cost, city-level only.
 * Dev fallback: one server-side ipapi.co lookup (the dev machine's IP).
 * Never errors — returns { located: false } when unknown.
 */
export async function GET(req: NextRequest) {
  // Vercel edge headers (present in production)
  const city    = req.headers.get('x-vercel-ip-city')
  const region  = req.headers.get('x-vercel-ip-country-region')
  const country = req.headers.get('x-vercel-ip-country')

  if (city && country === 'US') {
    const decodedCity = decodeURIComponent(city)
    return NextResponse.json(
      {
        located: true,
        city: decodedCity,
        // Nominatim-friendly query string for /api/clinics
        location: region ? `${decodedCity}, ${region}` : decodedCity,
      },
      { headers: { 'Cache-Control': 'private, max-age=3600' } }
    )
  }

  // Dev / non-Vercel fallback: server-side lookup of the caller's IP
  if (process.env.NODE_ENV !== 'production') {
    try {
      const res = await fetch('https://ipapi.co/json/', {
        headers: { 'User-Agent': 'NEXUS-Healthcare/1.0' },
        signal: AbortSignal.timeout(4000),
      })
      if (res.ok) {
        const j = await res.json() as { city?: string; region_code?: string; postal?: string; country_code?: string }
        if (j.country_code === 'US' && (j.postal || j.city)) {
          return NextResponse.json({
            located: true,
            city: j.city ?? '',
            location: j.postal || `${j.city}, ${j.region_code ?? ''}`.trim(),
          })
        }
      }
    } catch { /* offline — fall through */ }
  }

  return NextResponse.json({ located: false })
}
