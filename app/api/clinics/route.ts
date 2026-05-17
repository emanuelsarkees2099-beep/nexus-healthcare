import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getNAFCClinicsNear, type NAFCClinic } from '@/lib/nafc-clinics'
import { rateLimit } from '@/lib/rate-limit'

// ── Supabase (server-side, anon key) ──────────────────────────────────────────
const sbUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL    ?? ''
const sbAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const supabase  = createClient(sbUrl, sbAnonKey)

// ── Types ──────────────────────────────────────────────────────────────────────
export type AffordabilityLabel = 'likely-free' | 'low-cost' | 'standard'

export type Clinic = {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  distance: string
  services: string[]
  accepting: boolean
  free: boolean
  sliding_scale: boolean
  isFreeOrDiscounted: boolean
  affordability_score: number
  affordability_label: AffordabilityLabel
  affordability_reasons: string[]
  url?: string
  mapsUrl?: string
  hours?: string
  openNow?: boolean | null
  type?: string
  lat?: number
  lng?: number
  cal_link?: string  // N3: provider-submitted booking URL (from clinic_overrides)
  languages?: string[]
}

// ── Haversine distance ─────────────────────────────────────────────────────────
function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Affordability scoring (0–100) ─────────────────────────────────────────────
function scoreAffordability(
  name: string,
  tags: Record<string, string>
): { score: number; label: AffordabilityLabel; reasons: string[] } {
  let score = 40
  const lower = name.toLowerCase()
  const reasons: string[] = []

  if (/fqhc|federally qualified health/i.test(lower)) {
    score += 50; reasons.push('FQHC')
  } else if (/free clinic|free care|free health/i.test(lower)) {
    score += 45; reasons.push('free clinic')
  } else if (/sliding[\s-]?scale/i.test(lower)) {
    score += 40; reasons.push('sliding scale')
  } else if (/community health (center|clinic)/i.test(lower)) {
    score += 38; reasons.push('community health center')
  }

  if (/county health|public health|dept\.?\s*of health|health department/i.test(lower)) {
    score += 28; reasons.push('public/county health')
  }
  if (/low[\s-]?cost|low[\s-]?income|income[\s-]?based|affordable care/i.test(lower)) {
    score += 25; reasons.push('low-cost / income-based')
  }
  if (/community (health|medical|clinic|care)/i.test(lower)) {
    score += 20; reasons.push('community care')
  }
  if (/planned parenthood/i.test(lower)) { score += 22; reasons.push('Planned Parenthood') }
  if (/mission|outreach|neighborhood health|barrio|migrant|farmworker/i.test(lower)) {
    score += 18; reasons.push('mission/outreach')
  }
  if (/family health (center|clinic)|family medicine center/i.test(lower)) {
    score += 15; reasons.push('family health center')
  }
  if (/tribal|indian health|native american health/i.test(lower)) {
    score += 25; reasons.push('tribal health')
  }
  if (/veterans|va clinic|va health/i.test(lower)) { score += 20; reasons.push('veterans / VA') }

  const opType = (tags['operator:type'] || '').toLowerCase()
  if (opType === 'government') { score += 20; reasons.push('government operated') }
  else if (['ngo', 'nonprofit', 'non-profit', 'religious', 'charity'].includes(opType)) {
    score += 18; reasons.push('nonprofit / NGO')
  }

  if (tags.fee === 'no') { score += 30; reasons.push('fee: none (OSM)') }
  else if (tags.fee === 'yes') { score -= 10 }

  if (tags['healthcare:speciality'] === 'general') score += 10
  if (tags['social_facility'] === 'outreach') { score += 20; reasons.push('outreach facility') }
  if (tags['access'] === 'public') score += 8
  if (tags['operator'] && /county|city of|department/i.test(tags['operator'])) {
    score += 15; reasons.push('city/county operator')
  }

  if (/urgent care/i.test(lower)) score -= 20
  if (/cosmetic|aesthetic|plastic surg/i.test(lower)) score -= 35
  if (/concierge|boutique|luxury|vip/i.test(lower)) score -= 35
  if (/private practice/i.test(lower)) score -= 20
  if (/specialty (clinic|center)/i.test(lower) && !/community specialty/i.test(lower)) score -= 15

  score = Math.max(0, Math.min(100, score))
  const label: AffordabilityLabel = score >= 70 ? 'likely-free' : score >= 45 ? 'low-cost' : 'standard'
  return { score, label, reasons }
}

// ── Guess offered services ────────────────────────────────────────────────────
function guessServices(name: string, tags: Record<string, string> = {}): string[] {
  const lower = name.toLowerCase()
  const services: string[] = []

  if (/primary|family|general|internal med/i.test(lower) || tags.amenity === 'doctors')
    services.push('Primary care')
  if (/mental|psych|behav|counsel|therapy/i.test(lower)) services.push('Mental health')
  if (/dental|dentist|orthodont/i.test(lower) || tags.amenity === 'dentist') services.push('Dental')
  if (/women|maternal|obgyn|ob-gyn|gynec|midwife/i.test(lower)) services.push("Women's health")
  if (/pediatric|children|child|infant/i.test(lower)) services.push('Pediatrics')
  if (/vision|eye care|optic|optom|ophth/i.test(lower)) services.push('Vision')
  if (/pharmacy|pharmac/i.test(lower) || tags.amenity === 'pharmacy') services.push('Pharmacy')
  if (/substance|addiction|rehab|recovery/i.test(lower)) services.push('Substance use')
  if (/hiv|std|sexual health|reproductive/i.test(lower)) services.push('Sexual health')

  if (services.length === 0) services.push('Primary care')
  return [...new Set(services)]
}

// ── Filter out solo practitioners ─────────────────────────────────────────────
function isOrganization(name: string): boolean {
  if (/^dr\.?\s+\w+(\s+\w+)?\s*(md|do|dds|dpm|np|pa|rn)?\s*$/i.test(name.trim())) return false
  if (/\b(md|do|dds|dpm)\s*$/.test(name.trim())) return false
  const orgKeywords = [
    'clinic', 'hospital', 'health', 'medical', 'care', 'center', 'centre',
    'services', 'wellness', 'community', 'family', 'urgent', 'pharmacy',
    'dentist', 'dental', 'vision', 'eye', 'optom', 'pediatric', 'children',
    'mental', 'behavioral', 'recovery', 'rehab', 'outreach', 'mission',
  ]
  return orgKeywords.some(kw => name.toLowerCase().includes(kw))
}

// ── Specialty filter ──────────────────────────────────────────────────────────
function matchesSpecialty(clinic: Clinic, specialty: string): boolean {
  if (!specialty || specialty === 'all') return true
  const patterns: Record<string, RegExp> = {
    primary:    /primary|family|general|internal\s*med|health\s*(center|clinic)/i,
    mental:     /mental|psych|behav|counsel|therapy|psychiatry|substance|addiction/i,
    dental:     /dental|dentist|tooth|orthodont/i,
    womens:     /women|maternal|ob.?gyn|gynec|midwife|reproductive/i,
    pediatrics: /pediatric|children|child|infant/i,
    vision:     /vision|eye\s*care|optic|optom|ophth/i,
  }
  const rx = patterns[specialty]
  if (!rx) return true
  return rx.test(clinic.name) || clinic.services.some(s => rx.test(s))
}

// ── Name fingerprint for deduplication ───────────────────────────────────────
// Uses 18 chars of name + zip so two "Community Health Center" locations in
// different ZIP codes are NOT collapsed into one result.
function fingerprint(name: string, zip = ''): string {
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18)
  return zip ? `${n}|${zip.slice(0, 5)}` : n
}

// ── Geocode with Nominatim ────────────────────────────────────────────────────
async function geocode(location: string): Promise<{ lat: number; lng: number; zip: string; formatted: string } | null> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=json` +
      `&q=${encodeURIComponent(location)}&countrycodes=us&addressdetails=1&limit=1`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'NEXUS-Healthcare/1.0 contact@nexus.health' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    const data: Record<string, unknown>[] = await res.json()
    if (!data?.[0]) return null

    const r = data[0] as Record<string, unknown>
    const address = r.address as Record<string, string> | undefined
    return {
      lat: parseFloat(String(r.lat)),
      lng: parseFloat(String(r.lon)),
      zip: address?.postcode || location.replace(/\D/g, '').slice(0, 5) || '',
      formatted: String(r.display_name || location),
    }
  } catch {
    return null
  }
}

// ── Overpass query (JSON output — no regex XML parsing bug) ──────────────────
async function queryOverpass(lat: number, lng: number, radiusMiles: number): Promise<Clinic[]> {
  const radiusMeters = Math.round(radiusMiles * 1609.34)

  // [out:json] is simpler and avoids the attribute-order bug in XML regex parsing
  const ql = [
    `[out:json][timeout:25];`,
    `(`,
    `node(around:${radiusMeters},${lat},${lng})["amenity"~"^(clinic|hospital|doctors|dentist|health_post|nursing_home)$"]["name"];`,
    `node(around:${radiusMeters},${lat},${lng})["healthcare"]["name"];`,
    `node(around:${radiusMeters},${lat},${lng})["healthcare:speciality"]["name"];`,
    `node(around:${radiusMeters},${lat},${lng})["social_facility"~"outreach|health_care|healthcare"]["name"];`,
    `node(around:${radiusMeters},${lat},${lng})["office"="healthcare"]["name"];`,
    `way(around:${radiusMeters},${lat},${lng})["amenity"~"^(clinic|hospital|doctors|dentist)$"]["name"];`,
    `way(around:${radiusMeters},${lat},${lng})["healthcare"]["name"];`,
    `way(around:${radiusMeters},${lat},${lng})["office"="healthcare"]["name"];`,
    `);`,
    `out center tags;`,
  ].join('')

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'NEXUS-Healthcare/1.0' },
      body: `data=${encodeURIComponent(ql)}`,
      next: { revalidate: 7200 },
      signal: AbortSignal.timeout(28000),
    })

    if (!res.ok) return []

    type OsmElement = {
      type: string; id: number
      lat?: number; lon?: number
      center?: { lat: number; lon: number }
      tags?: Record<string, string>
    }
    const data = await res.json() as { elements?: OsmElement[] }
    const elements = data?.elements ?? []

    return elements
      .slice(0, 200)
      .map((el): Clinic | null => {
        const tags = el.tags ?? {}
        const rawName = (tags.name || '').trim()
        if (!rawName) return null

        // Resolve lat/lon — nodes have direct coords, ways use center
        const eLat = el.lat ?? el.center?.lat
        const eLon = el.lon ?? el.center?.lon
        if (!eLat || !eLon) return null

        const { score, label, reasons } = scoreAffordability(rawName, tags)
        const dist = distanceMiles(lat, lng, eLat, eLon)
        const street = tags['addr:housenumber']
          ? `${tags['addr:housenumber']} ${tags['addr:street'] || ''}`.trim()
          : (tags['addr:street'] || '')

        return {
          id: String(el.id),
          name: rawName,
          address: street,
          city: tags['addr:city'] || '',
          state: tags['addr:state'] || '',
          zip: tags['addr:postcode'] || '',
          phone: tags.phone || tags['contact:phone'] || '',
          distance: dist.toFixed(1),
          services: guessServices(rawName, tags),
          accepting: true,
          free: score >= 70,
          sliding_scale: score >= 45,
          isFreeOrDiscounted: score >= 45,
          affordability_score: score,
          affordability_label: label,
          affordability_reasons: reasons,
          url: tags.website || tags['contact:website'] || tags.url || '',
          mapsUrl: `https://www.openstreetmap.org/?mlat=${eLat}&mlon=${eLon}&zoom=18`,
          hours: tags.opening_hours || '',
          openNow: null,
          type: tags.amenity === 'hospital' ? 'Hospital' : 'Clinic',
          lat: eLat,
          lng: eLon,
        } as Clinic
      })
      .filter((c): c is Clinic => c !== null && isOrganization(c.name))
      .sort((a, b) =>
        b.affordability_score !== a.affordability_score
          ? b.affordability_score - a.affordability_score
          : parseFloat(a.distance) - parseFloat(b.distance)
      )
      .slice(0, 100)
  } catch {
    return []
  }
}

// ── HRSA FQHCs via FQHC ArcGIS public layer ──────────────────────────────────
// The old findahealthcenter.hrsa.gov API is internal-only (returns 404 publicly).
// HRSA publishes FQHC locations via ArcGIS REST, which IS publicly accessible.
async function fetchHRSAClinics(lat: number, lng: number, radiusMiles: number): Promise<Clinic[]> {
  try {
    // HRSA FQHC sites via publicly accessible ArcGIS Feature Service
    const url = new URL('https://services1.arcgis.com/4yjifSiIG17X0gW4/arcgis/rest/services/FQHC_Locations/FeatureServer/0/query')
    url.searchParams.set('where', '1=1')
    url.searchParams.set('geometry', JSON.stringify({ x: lng, y: lat }))
    url.searchParams.set('geometryType', 'esriGeometryPoint')
    url.searchParams.set('spatialRel', 'esriSpatialRelIntersects')
    url.searchParams.set('distance', String(radiusMiles))
    url.searchParams.set('units', 'esriSRUnit_StatuteMile')
    url.searchParams.set('inSR', '4326')
    url.searchParams.set('outSR', '4326')
    url.searchParams.set('outFields', 'Site_Name,Site_Address,Site_City,Site_State,Site_Postal_Code,Site_Phone_Number,Site_Web_Address,Health_Center_Type,Latitude,Longitude')
    url.searchParams.set('returnGeometry', 'false')
    url.searchParams.set('resultRecordCount', '100')
    url.searchParams.set('f', 'json')

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json', 'User-Agent': 'NEXUS-Healthcare/1.0 contact@nexus.health' },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []

    const data = await res.json() as { features?: { attributes: Record<string, unknown> }[]; error?: unknown }
    if (data.error || !Array.isArray(data.features) || data.features.length === 0) return []

    const clinics: Clinic[] = data.features
      .map((f): Clinic | null => {
        const a = f.attributes
        const name = String(a.Site_Name ?? '').trim()
        if (!name) return null

        const fLat = parseFloat(String(a.Latitude ?? 0)) || lat
        const fLng = parseFloat(String(a.Longitude ?? 0)) || lng
        const dist = distanceMiles(lat, lng, fLat, fLng)
        const addr = String(a.Site_Address ?? '')
        const city = String(a.Site_City ?? '')
        const state = String(a.Site_State ?? '')
        const zip = String(a.Site_Postal_Code ?? '').slice(0, 5)
        const phone = String(a.Site_Phone_Number ?? '').replace(/[^\d()\-+\s]/g, '').trim()
        const website = String(a.Site_Web_Address ?? '')
        const hcType = String(a.Health_Center_Type ?? '')

        const services = guessServices(name)
        if (/migrant|farmworker/i.test(hcType)) services.push('Primary care')
        if (/homeless/i.test(hcType)) services.push('Primary care')
        if (/mental/i.test(hcType)) services.push('Mental health')

        return {
          id: `hrsa-${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14)}-${zip}`,
          name, address: addr, city, state, zip, phone,
          distance: dist.toFixed(1),
          services: [...new Set(services)],
          accepting: true, free: true, sliding_scale: true, isFreeOrDiscounted: true,
          affordability_score: 95,
          affordability_label: 'likely-free' as AffordabilityLabel,
          affordability_reasons: ['FQHC – federally required sliding-scale care for all patients'],
          url: website,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${addr} ${city} ${state}`)}`,
          hours: '', openNow: null, type: 'FQHC',
          lat: fLat, lng: fLng,
        }
      })
      .filter((c): c is Clinic => c !== null)
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))

    console.log('[NEXUS] HRSA ArcGIS → %d FQHCs', clinics.length)
    return clinics
  } catch (e) {
    console.warn('[NEXUS] HRSA ArcGIS failed:', String(e).slice(0, 80))
    return []
  }
}

// ── NAFC: secondary source — volunteer free clinics ──────────────────────────
function fetchNAFCClinics(lat: number, lng: number, radiusMiles: number): Clinic[] {
  const nearby = getNAFCClinicsNear(lat, lng, radiusMiles)
  return nearby.map((c: NAFCClinic): Clinic => {
    const dist = distanceMiles(lat, lng, c.lat, c.lng)
    return {
      id: c.id,
      name: c.name,
      address: c.address,
      city: c.city,
      state: c.state,
      zip: c.zip,
      phone: c.phone,
      distance: dist.toFixed(1),
      services: c.services,
      accepting: true,
      free: true,
      sliding_scale: true,
      isFreeOrDiscounted: true,
      affordability_score: 90,
      affordability_label: 'likely-free',
      affordability_reasons: ['NAFC member – volunteer-run free clinic, $0 cost'],
      url: c.url,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name} ${c.city} ${c.state}`)}`,
      hours: c.hours,
      openNow: null,
      type: 'Free Clinic',
      lat: c.lat,
      lng: c.lng,
    }
  })
}

// ── Google Places: tertiary source (optional, keyed) ─────────────────────────
async function fetchGooglePlacesClinics(lat: number, lng: number, radiusMiles: number): Promise<Clinic[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return []

  const radiusMeters = Math.round(radiusMiles * 1609.34)
  const keywords = ['free clinic', 'community health center', 'FQHC']
  const allResults: Clinic[] = []
  const seen = new Set<string>()

  for (const keyword of keywords) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&keyword=${encodeURIComponent(keyword)}&type=health&key=${apiKey}`
      const res = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) })
      if (!res.ok) continue
      const data = await res.json() as { results?: Record<string, unknown>[] }
      if (!data.results) continue

      for (const place of data.results.slice(0, 10)) {
        const name = String(place.name ?? '')
        const fp = fingerprint(name)
        if (seen.has(fp) || !name) continue
        seen.add(fp)

        const loc = (place.geometry as Record<string, unknown>)?.location as Record<string, number> | undefined
        const placeLat = loc?.lat ?? lat
        const placeLng = loc?.lng ?? lng
        const dist = distanceMiles(lat, lng, placeLat, placeLng)
        const { score, label, reasons } = scoreAffordability(name, {})

        // Only include if reasonably affordable
        if (score < 45) continue

        const placeId = String(place.place_id ?? '')
        allResults.push({
          id: `gplaces-${placeId || fp}`,
          name,
          address: String(place.vicinity ?? ''),
          city: '',
          state: '',
          zip: '',
          phone: '',
          distance: dist.toFixed(1),
          services: guessServices(name),
          accepting: true,
          free: score >= 70,
          sliding_scale: score >= 45,
          isFreeOrDiscounted: score >= 45,
          affordability_score: score,
          affordability_label: label,
          affordability_reasons: [...reasons, 'Google Places'],
          url: placeId ? `https://www.google.com/maps/place/?q=place_id:${placeId}` : undefined,
          mapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
          hours: '',
          openNow: (place.opening_hours as Record<string, unknown>)?.open_now as boolean ?? null,
          type: 'Clinic',
          lat: placeLat,
          lng: placeLng,
        })
      }
    } catch {
      // Google Places is optional — fail silently
    }
  }

  return allResults.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
}

// ── State Health Department APIs (CA, TX, NY, FL, IL) ────────────────────────
// These states expose public clinic directories via data.gov or state portals.
async function fetchStateHealthClinics(lat: number, lng: number, state: string, radiusMiles: number): Promise<Clinic[]> {
  const stateEndpoints: Record<string, string> = {
    // California OSHPD Licensed Clinic data (data.ca.gov)
    'CA': `https://data.ca.gov/api/3/action/datastore_search?resource_id=7c38b3e0-9659-4e35-9e8c-3680b36af90e&limit=50&q=clinic`,
    // Texas DSHS Provider Directory (via THCIC open data)
    'TX': `https://data.texas.gov/resource/nadb-8m72.json?$limit=50&$where=within_circle(location,${lat},${lng},${radiusMiles * 1609})`,
    // New York Health Facility data (NY Open Data)
    'NY': `https://health.data.ny.gov/resource/vn5v-hh5r.json?$limit=30&$where=within_circle(location,${lat},${lng},${radiusMiles * 1609})`,
    // Florida AHCA facility data
    'FL': `https://data.florida.gov/api/views/d346-3h4b/rows.json?accessType=DOWNLOAD`,
    // Illinois IDPH Federally Qualified Health Centers
    'IL': `https://data.illinois.gov/api/views/6u9f-p59g/rows.json?accessType=DOWNLOAD`,
  }

  const endpoint = stateEndpoints[state.toUpperCase()]
  if (!endpoint) return []

  try {
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': 'NEXUS-Healthcare/1.0' },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []

    const raw = await res.json() as Record<string, unknown>
    let records: Record<string, unknown>[] = []

    if (Array.isArray(raw)) {
      records = raw as Record<string, unknown>[]
    } else if (raw.result && typeof raw.result === 'object') {
      const result = raw.result as Record<string, unknown>
      records = (result.records as Record<string, unknown>[]) ?? []
    } else if (raw.data && Array.isArray(raw.data)) {
      records = raw.data as Record<string, unknown>[]
    }

    const clinics: Clinic[] = []
    for (const r of records.slice(0, 20)) {
      const name = String(r.facility_name ?? r.name ?? r.Name ?? r.FACILITY_NAME ?? '').trim()
      if (!name || !isOrganization(name)) continue

      const { score, label, reasons } = scoreAffordability(name, {})
      if (score < 40) continue

      const rLat = parseFloat(String(r.latitude ?? r.lat ?? r.Latitude ?? '0')) || lat
      const rLng = parseFloat(String(r.longitude ?? r.lng ?? r.Longitude ?? '0')) || lng
      const dist = distanceMiles(lat, lng, rLat, rLng)
      if (dist > radiusMiles) continue

      clinics.push({
        id: `state-${state.toLowerCase()}-${String(r.id ?? r.ID ?? Math.random()).replace(/\./g, '')}`,
        name,
        address: String(r.address ?? r.Address ?? r.street_address ?? ''),
        city: String(r.city ?? r.City ?? ''),
        state: state,
        zip: String(r.zip ?? r.Zip ?? r.postal_code ?? ''),
        phone: String(r.phone ?? r.Phone ?? r.telephone ?? ''),
        distance: dist.toFixed(1),
        services: guessServices(name),
        accepting: true,
        free: score >= 70,
        sliding_scale: score >= 45,
        isFreeOrDiscounted: score >= 45,
        affordability_score: score,
        affordability_label: label,
        affordability_reasons: [...reasons, `${state} State Health Dept`],
        url: String(r.website ?? r.Website ?? r.url ?? ''),
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + state)}`,
        hours: '',
        openNow: null,
        type: 'Community Clinic',
        lat: rLat,
        lng: rLng,
      })
    }

    console.log('[NEXUS] State(%s) → %d clinics', state, clinics.length)
    return clinics
  } catch {
    return []
  }
}

// ── Detect state from geocode result ─────────────────────────────────────────
const STATE_MAP: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
}

function detectState(formatted: string): string {
  for (const [name, code] of Object.entries(STATE_MAP)) {
    if (formatted.includes(name)) return code
  }
  // Fallback: look for 2-letter state abbreviation pattern ", XX " or ", XX,"
  const m = formatted.match(/,\s*([A-Z]{2})[, ]/)
  return m ? m[1] : ''
}

// ── CMS Rural Health Clinics — new CMS Open Data API (Socrata deprecated) ────
async function fetchCMSRuralHealthClinics(lat: number, lng: number, state: string, radiusMiles: number): Promise<Clinic[]> {
  if (!state) return []
  try {
    // New CMS Open Data API (replaces deprecated Socrata endpoint)
    const url = `https://data.cms.gov/api/1/datastore/query/mj5m-pzi6/0?conditions[0][property]=state&conditions[0][value]=${encodeURIComponent(state)}&conditions[0][operator]=%3D&limit=150&results=true&schema=false&keys=true&format=json&rowIds=false`
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'NEXUS-Healthcare/1.0 contact@nexus.health' },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    type CmsResponse = { results?: Record<string, string>[]; data?: Record<string, string>[] }
    const raw = await res.json() as CmsResponse
    const data: Record<string, string>[] = raw.results ?? raw.data ?? (Array.isArray(raw) ? raw as Record<string, string>[] : [])
    if (!Array.isArray(data) || data.length === 0) return []

    const clinics: Clinic[] = []
    for (const r of data) {
      const name = String(r.provider_name ?? '').trim()
      if (!name || !isOrganization(name)) continue

      const addr  = String(r.street_address ?? '')
      const city  = String(r.city ?? '')
      const st    = String(r.state ?? state)
      const zip   = String(r.zip_code ?? '').replace(/\D/g, '').slice(0, 5)
      const phone = String(r.phone_number ?? '').replace(/[^\d()\-+\s]/g, '').trim()
      const { score, label, reasons } = scoreAffordability(name, {})
      if (score < 35) continue

      clinics.push({
        id: `cms-rhc-${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14)}-${zip}`,
        name, address: addr, city, state: st, zip, phone,
        distance: '?',
        services: guessServices(name),
        accepting: true,
        free: score >= 70, sliding_scale: true, isFreeOrDiscounted: true,
        affordability_score: Math.max(score, 60), // RHCs must accept Medicare/Medicaid
        affordability_label: label,
        affordability_reasons: [...reasons, 'CMS Rural Health Clinic — accepts Medicare & Medicaid'],
        url: '',
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${addr} ${city} ${st}`)}`,
        hours: '', openNow: null, type: 'Rural Health Clinic',
        lat: undefined, lng: undefined,
      } as unknown as Clinic)
    }

    console.log('[NEXUS] CMS-RHC(%s) → %d clinics', state, clinics.length)
    return clinics.slice(0, 40)
  } catch {
    return []
  }
}

// ── SAMHSA — no public API available (findtreatment.gov is a React SPA) ──────
// The backend is AWS-internal. Stubbed out — returns [] until a real API exists.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchSAMHSAClinics(_lat: number, _lng: number, _radiusMiles: number): Promise<Clinic[]> {
  return []
}

// ── Yelp Fusion — free tier (500 req/day, no payment required) ───────────────
// Sign up free at https://www.yelp.com/developers — add YELP_API_KEY to .env.local
async function fetchYelpClinics(lat: number, lng: number, radiusMiles: number): Promise<Clinic[]> {
  const apiKey = process.env.YELP_API_KEY
  if (!apiKey) return []

  const radiusMeters = Math.min(Math.round(radiusMiles * 1609.34), 40000) // Yelp max 40km
  const terms = ['free clinic', 'community health center', 'federally qualified health center']
  const seen  = new Set<string>()
  const all: Clinic[] = []

  for (const term of terms) {
    try {
      const url = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}&radius=${radiusMeters}&term=${encodeURIComponent(term)}&categories=health,medcenters&limit=20&sort_by=distance`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}`, 'User-Agent': 'NEXUS-Healthcare/1.0' },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) continue

      const data = await res.json() as { businesses?: Record<string, unknown>[] }
      for (const b of (data.businesses ?? []).slice(0, 20)) {
        const name = String(b.name ?? '').trim()
        const fp   = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14)
        if (!name || seen.has(fp)) continue
        seen.add(fp)

        const loc    = b.location as Record<string, unknown> ?? {}
        const coords = b.coordinates as Record<string, number> ?? {}
        const addr   = String(loc.address1 ?? '')
        const city   = String(loc.city ?? '')
        const state  = String(loc.state ?? '')
        const zip    = String(loc.zip_code ?? '').slice(0, 5)
        const phone  = String(b.phone ?? b.display_phone ?? '').replace(/[^\d()\-+\s]/g, '').trim()
        const rLat   = coords.latitude  ?? lat
        const rLng   = coords.longitude ?? lng
        const dist   = distanceMiles(lat, lng, rLat, rLng)
        const { score, label, reasons } = scoreAffordability(name, {})
        if (score < 40) continue

        all.push({
          id: `yelp-${String(b.id ?? fp)}`,
          name, address: addr, city, state, zip, phone,
          distance: dist.toFixed(1),
          services: guessServices(name),
          accepting: true,
          free: score >= 70, sliding_scale: score >= 45, isFreeOrDiscounted: score >= 45,
          affordability_score: score, affordability_label: label,
          affordability_reasons: [...reasons, 'Yelp'],
          url: String(b.url ?? ''),
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${addr} ${city} ${state}`)}`,
          hours: '', openNow: (b.hours as Record<string, unknown>[] | undefined)?.[0]
            ? null : null,
          type: 'Clinic', lat: rLat, lng: rLng,
        })
      }
    } catch { /* fail silently per term */ }
  }

  console.log('[NEXUS] Yelp → %d clinics', all.length)
  return all
}

// ── FindHelp (211) — free tier, requires FINDHELP_API_KEY ────────────────────
// Get a free key at https://company.findhelp.com/api — takes ~3 business days.
// This is the largest social-services database in the US (~1.5M records),
// covering mobile clinics, faith-based free clinics, sliding-scale practices,
// dental days, and many FQHCs not in the HRSA database.
async function fetchFindHelpClinics(lat: number, lng: number, zip: string, radiusMiles: number): Promise<Clinic[]> {
  const apiKey = process.env.FINDHELP_API_KEY
  if (!apiKey) return []

  // FindHelp uses category codes — HLTH covers all health-related programs
  // subs: HLTH-MNTL (mental health), HLTH-DNTL (dental), HLTH-MDCN (medical)
  const categories = ['HLTH-MDCN', 'HLTH-MNTL', 'HLTH-DNTL', 'HLTH']
  const seen  = new Set<string>()
  const all: Clinic[] = []

  for (const category of categories) {
    try {
      // FindHelp REST API v2 — search by lat/lng + radius + category
      const url = new URL('https://api.findhelp.com/v2/programs')
      url.searchParams.set('lat',      String(lat))
      url.searchParams.set('lng',      String(lng))
      url.searchParams.set('postal',   zip)
      url.searchParams.set('distance', String(radiusMiles))
      url.searchParams.set('category', category)
      url.searchParams.set('cost',     'free,reduced_fee,sliding_scale') // filter to affordable only
      url.searchParams.set('per_page', '50')

      const res = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept':        'application/json',
          'User-Agent':    'NEXUS-Healthcare/1.0 contact@nexus.health',
        },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) {
        console.warn('[NEXUS] FindHelp %s → HTTP %d', category, res.status)
        continue
      }

      const raw = await res.json() as Record<string, unknown>

      // FindHelp wraps results in { programs: [...] } or { data: [...] }
      const programs: Record<string, unknown>[] =
        (Array.isArray(raw) ? raw :
         Array.isArray(raw.programs) ? raw.programs as Record<string, unknown>[] :
         Array.isArray(raw.data)     ? raw.data     as Record<string, unknown>[] :
         [])

      for (const p of programs) {
        // Program name — may be nested under agency or at top level
        const agency  = p.agency  as Record<string, unknown> | undefined
        const name    = String(p.program_name ?? p.name ?? agency?.name ?? '').trim()
        if (!name || !isOrganization(name)) continue

        const fp = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18)
        if (seen.has(fp)) continue
        seen.add(fp)

        // Location — may be nested
        const loc     = (p.location ?? p.address ?? {}) as Record<string, unknown>
        const addr    = String(loc.address1 ?? loc.street ?? p.street_address ?? '')
        const city    = String(loc.city     ?? p.city    ?? '')
        const state   = String(loc.state    ?? p.state   ?? '')
        const pZip    = String(loc.zip      ?? loc.postal_code ?? p.zip_code ?? zip).slice(0, 5)
        const phone   = String(p.phone ?? agency?.phone ?? '').replace(/[^\d()\-+\s]/g, '').trim()
        const website = String(p.url ?? p.website ?? agency?.url ?? '')

        const rLat  = parseFloat(String(loc.latitude  ?? p.latitude  ?? lat))  || lat
        const rLng  = parseFloat(String(loc.longitude ?? p.longitude ?? lng))  || lng
        const dist  = distanceMiles(lat, lng, rLat, rLng)
        if (dist > radiusMiles * 1.1) continue   // small buffer for geo imprecision

        // Cost / affordability
        const costStr  = String(p.cost ?? p.fees ?? p.payment_options ?? '').toLowerCase()
        const isFree   = /free|no cost|no charge/i.test(costStr)
        const isSlide  = /sliding|reduced|income/i.test(costStr)
        const { score, label, reasons } = scoreAffordability(name, {})
        const adjScore = isFree ? Math.max(score, 80) : isSlide ? Math.max(score, 65) : score

        // Hours
        const hours = String(p.hours ?? p.schedule ?? '')

        // Services — infer from category + name
        const services = guessServices(name)
        if (/mental|behav|psych|counsel/i.test(category)) services.unshift('Mental health')
        if (/dental|dntl/i.test(category)) services.unshift('Dental')

        all.push({
          id: `findhelp-${String(p.id ?? p.program_id ?? fp).replace(/\./g, '')}`,
          name,
          address: addr, city, state, zip: pZip, phone,
          distance: dist.toFixed(1),
          services: [...new Set(services)],
          accepting: true,
          free: isFree || adjScore >= 70,
          sliding_scale: isSlide || adjScore >= 55,
          isFreeOrDiscounted: adjScore >= 55,
          affordability_score: adjScore,
          affordability_label: label,
          affordability_reasons: [...reasons, '211 / FindHelp directory', ...(isFree ? ['free program'] : isSlide ? ['sliding scale'] : [])],
          url: website,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${addr} ${city} ${state}`)}`,
          hours,
          openNow: null,
          type: /mental|behav|psych/i.test(category) ? 'Mental Health Center'
               : /dental/i.test(category) ? 'Dental Clinic'
               : 'Community Health',
          lat: rLat,
          lng: rLng,
        })
      }
    } catch (e) {
      console.warn('[NEXUS] FindHelp %s error: %s', category, String(e).slice(0, 80))
    }
  }

  console.log('[NEXUS] FindHelp/211 → %d programs', all.length)
  return all.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
}

// ── VA Facility Locator — free, instant key at developer.va.gov ───────────────
// Covers VA medical centers, community clinics, and Vet Centers.
// Many VA community care sites also serve low-income non-veterans.
// Key is free and emailed instantly — no review, no payment.
async function fetchVAClinics(lat: number, lng: number, radiusMiles: number): Promise<Clinic[]> {
  const apiKey = process.env.VA_API_KEY
  if (!apiKey) return []

  try {
    // VA Facilities API v1 — health facilities within radius
    const url = new URL('https://api.va.gov/services/va_facilities/v1/facilities')
    url.searchParams.set('lat',      String(lat))
    url.searchParams.set('long',     String(lng))   // VA uses "long" not "lng"
    url.searchParams.set('radius',   String(Math.min(radiusMiles, 50)))
    url.searchParams.set('type',     'health')
    url.searchParams.set('per_page', '50')

    const res = await fetch(url.toString(), {
      headers: {
        'apikey':     apiKey,
        'Accept':     'application/json',
        'User-Agent': 'NEXUS-Healthcare/1.0 contact@nexus.health',
      },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.warn('[NEXUS] VA Facilities API → HTTP %d', res.status)
      return []
    }

    const raw = await res.json() as { data?: Record<string, unknown>[] }
    const facilities = raw?.data ?? []
    if (!Array.isArray(facilities) || facilities.length === 0) return []

    const clinics: Clinic[] = facilities
      .map((f): Clinic | null => {
        const attrs   = f.attributes as Record<string, unknown> | undefined
        if (!attrs) return null

        const name    = String(attrs.name ?? '').trim()
        if (!name) return null

        const physAddr = (attrs.address as Record<string, unknown>)?.physical as Record<string, string> | undefined
        const addr    = String(physAddr?.address_1 ?? physAddr?.address1 ?? '')
        const city    = String(physAddr?.city  ?? '')
        const state   = String(physAddr?.state ?? '')
        const zip     = String(physAddr?.zip   ?? '').slice(0, 5)

        const phoneObj = attrs.phone as Record<string, string> | undefined
        const phone   = String(phoneObj?.main ?? phoneObj?.mental_health ?? '').replace(/[^\d()\-+\s]/g, '').trim()

        const rLat    = parseFloat(String(attrs.lat  ?? attrs.latitude  ?? lat)) || lat
        const rLng    = parseFloat(String(attrs.long ?? attrs.longitude ?? lng)) || lng
        const dist    = distanceMiles(lat, lng, rLat, rLng)

        const website = String(attrs.website ?? attrs.url ?? '')

        // Build hours string from VA's day-keyed object
        const hoursObj = attrs.hours as Record<string, string> | undefined
        const hours    = hoursObj
          ? Object.entries(hoursObj)
              .filter(([, v]) => v && v !== 'Closed')
              .map(([k, v]) => `${k.slice(0, 3)}: ${v}`)
              .join(' | ')
          : ''

        // VA services list
        const svcGroups = (attrs.services as Record<string, unknown> | undefined)?.health
        const vaServices: string[] = Array.isArray(svcGroups)
          ? svcGroups.map((s: unknown) => String((s as Record<string, string>).name ?? s)).filter(Boolean)
          : []

        const services = guessServices(name)
        if (vaServices.some(s => /mental|psych|behav/i.test(s))) services.push('Mental health')
        if (vaServices.some(s => /dental/i.test(s)))             services.push('Dental')
        if (vaServices.some(s => /women/i.test(s)))              services.push("Women's health")

        const facilityType = String(attrs.facility_type ?? f.type ?? '')
        const isVetCenter  = /vet_center/i.test(facilityType)

        return {
          id: `va-${String(f.id ?? name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14))}`,
          name,
          address: addr, city, state, zip, phone,
          distance: dist.toFixed(1),
          services: [...new Set(services)],
          accepting: true,
          free: true,       // VA care is free or very low cost for eligible veterans
          sliding_scale: true,
          isFreeOrDiscounted: true,
          affordability_score: 85,
          affordability_label: 'likely-free',
          affordability_reasons: [
            isVetCenter ? 'VA Vet Center — free readjustment counseling' : 'VA Health Facility — free/low-cost for veterans',
            'Federal VA system',
          ],
          url: website,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${addr} ${city} ${state}`)}`,
          hours,
          openNow: null,
          type: isVetCenter ? 'Vet Center' : 'VA Clinic',
          lat: rLat,
          lng: rLng,
        }
      })
      .filter((c): c is Clinic => c !== null)
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))

    console.log('[NEXUS] VA Facilities → %d clinics', clinics.length)
    return clinics
  } catch (e) {
    console.warn('[NEXUS] VA Facilities error: %s', String(e).slice(0, 80))
    return []
  }
}

// ── Cache search results (fire-and-forget, non-blocking) ─────────────────────
async function cacheClinicsBg(clinics: Clinic[], source: string): Promise<void> {
  if (!sbUrl || clinics.length === 0) return
  try {
    const rows = clinics.map(c => ({
      clinic_id:   c.id,
      clinic_data: c as unknown as Record<string, unknown>,
      source,
    }))
    await supabase
      .from('clinic_cache')
      .upsert(rows, { onConflict: 'clinic_id', ignoreDuplicates: false })
  } catch {
    // Background cache — never let this block or throw
  }
}

// ── Single clinic lookup by ID ────────────────────────────────────────────────
async function lookupClinicById(id: string): Promise<Clinic | null> {
  if (!sbUrl) return null
  try {
    // 1. Get base clinic from cache
    const { data: cacheRow } = await supabase
      .from('clinic_cache')
      .select('clinic_data, source')
      .eq('clinic_id', id)
      .single()

    if (!cacheRow?.clinic_data) return null
    const clinic = cacheRow.clinic_data as Clinic

    // 2. Merge any admin-approved overrides (cal_link, corrected hours, etc.)
    const { data: override } = await supabase
      .from('clinic_overrides')
      .select('cal_link, phone, hours')
      .eq('clinic_id', id)
      .single()

    if (override) {
      if (override.cal_link) clinic.cal_link = override.cal_link
      if (override.phone)    clinic.phone    = override.phone
      if (override.hours)    clinic.hours    = override.hours
    }

    return clinic
  } catch {
    return null
  }
}

// ── Main GET handler ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Rate-limit: 60 clinic searches per minute per IP
  const rl = rateLimit(req as unknown as Request, { limit: 60, windowMs: 60_000, namespace: 'clinics' })
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429, headers: rl.headers })
  }

  const { searchParams } = new URL(req.url)

  // ── Single clinic lookup by ID (for clinic detail page) ───────────────────
  const clinicId = searchParams.get('id')
  if (clinicId) {
    const clinic = await lookupClinicById(clinicId)
    if (!clinic) return NextResponse.json({ clinic: null, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ clinic })
  }

  let rawLoc = searchParams.get('location') || searchParams.get('zip') || ''
  const radiusMiles = Math.min(parseInt(searchParams.get('radius') || '25'), 75)
  const specialty = searchParams.get('specialty') || 'all'

  try { rawLoc = decodeURIComponent(rawLoc) } catch { /* already decoded */ }
  rawLoc = rawLoc.trim()

  if (!rawLoc) {
    return NextResponse.json({ clinics: [], source: 'no-location', total: 0 })
  }

  // 1. Geocode
  const geo = await geocode(rawLoc)
  if (!geo) {
    return NextResponse.json({ clinics: [], source: 'no-location', total: 0 })
  }

  const zip = geo.zip || rawLoc.replace(/\D/g, '').slice(0, 5)
  const detectedState = detectState(geo.formatted)
  console.log('[NEXUS] Geocoded "%s" → lat=%.4f lng=%.4f zip=%s state=%s', rawLoc, geo.lat, geo.lng, zip, detectedState)

  // 2. Run all sources in parallel
  let [hrsaClinics, nafcClinics, osmClinics, googleClinics, stateClinics, cmsClinics, samhsaClinics, yelpClinics, findHelpClinics, vaClinics] = await Promise.all([
    fetchHRSAClinics(geo.lat, geo.lng, radiusMiles),
    Promise.resolve(fetchNAFCClinics(geo.lat, geo.lng, radiusMiles)),
    queryOverpass(geo.lat, geo.lng, radiusMiles),
    fetchGooglePlacesClinics(geo.lat, geo.lng, radiusMiles),
    detectedState ? fetchStateHealthClinics(geo.lat, geo.lng, detectedState, radiusMiles) : Promise.resolve([]),
    detectedState ? fetchCMSRuralHealthClinics(geo.lat, geo.lng, detectedState, radiusMiles) : Promise.resolve([]),
    fetchSAMHSAClinics(geo.lat, geo.lng, radiusMiles),
    fetchYelpClinics(geo.lat, geo.lng, radiusMiles),
    fetchFindHelpClinics(geo.lat, geo.lng, zip, radiusMiles),
    fetchVAClinics(geo.lat, geo.lng, radiusMiles),
  ])

  console.log('[NEXUS] Sources: HRSA=%d NAFC=%d OSM=%d Google=%d State=%d CMS=%d SAMHSA=%d Yelp=%d FindHelp=%d VA=%d',
    hrsaClinics.length, nafcClinics.length, osmClinics.length, googleClinics.length,
    stateClinics.length, cmsClinics.length, samhsaClinics.length, yelpClinics.length,
    findHelpClinics.length, vaClinics.length)

  // 2b. Auto-expand radius if results are sparse (rural / underserved areas)
  const initialCount = hrsaClinics.length + nafcClinics.length + osmClinics.length + stateClinics.length + cmsClinics.length + samhsaClinics.length + findHelpClinics.length + vaClinics.length
  if (initialCount < 8 && radiusMiles <= 40) {
    const expandedRadius = Math.min(radiusMiles * 2, 75)
    console.log('[NEXUS] Sparse results (%d) — auto-expanding to %d miles', initialCount, expandedRadius)
    const [h2, n2, o2, c2, s2, y2, f2, v2] = await Promise.all([
      fetchHRSAClinics(geo.lat, geo.lng, expandedRadius),
      Promise.resolve(fetchNAFCClinics(geo.lat, geo.lng, expandedRadius)),
      queryOverpass(geo.lat, geo.lng, expandedRadius),
      detectedState ? fetchCMSRuralHealthClinics(geo.lat, geo.lng, detectedState, expandedRadius) : Promise.resolve([]),
      fetchSAMHSAClinics(geo.lat, geo.lng, expandedRadius),
      fetchYelpClinics(geo.lat, geo.lng, expandedRadius),
      fetchFindHelpClinics(geo.lat, geo.lng, zip, expandedRadius),
      fetchVAClinics(geo.lat, geo.lng, expandedRadius),
    ])
    hrsaClinics     = [...hrsaClinics,     ...h2]
    nafcClinics     = [...nafcClinics,     ...n2]
    osmClinics      = [...osmClinics,      ...o2]
    cmsClinics      = [...cmsClinics,      ...c2]
    samhsaClinics   = [...samhsaClinics,   ...s2]
    yelpClinics     = [...yelpClinics,     ...y2]
    findHelpClinics = [...findHelpClinics, ...f2]
    vaClinics       = [...vaClinics,       ...v2]
    console.log('[NEXUS] After expansion: HRSA=%d NAFC=%d OSM=%d CMS=%d SAMHSA=%d Yelp=%d FindHelp=%d VA=%d',
      hrsaClinics.length, nafcClinics.length, osmClinics.length, cmsClinics.length,
      samhsaClinics.length, yelpClinics.length, findHelpClinics.length, vaClinics.length)
  }

  // 3. Deduplicate: fingerprint = name(18 chars) + zip so same-name different-location clinics
  //    are NOT collapsed. Priority: HRSA > NAFC > State > CMS > Google > OSM
  const seen = new Set<string>()
  const addIfNew = (clinics: Clinic[], out: Clinic[]) => {
    for (const c of clinics) {
      const fp = fingerprint(c.name, c.zip)
      if (!seen.has(fp)) {
        seen.add(fp)
        out.push(c)
      }
    }
  }

  const merged: Clinic[] = []
  addIfNew(hrsaClinics,    merged) // 1st: HRSA FQHCs (federally verified)
  addIfNew(nafcClinics,    merged) // 2nd: NAFC free clinics
  addIfNew(vaClinics,      merged) // 3rd: VA facilities (free/low-cost for veterans)
  addIfNew(findHelpClinics,merged) // 4th: 211 / FindHelp (largest social-services DB)
  addIfNew(stateClinics,   merged) // 5th: State health dept
  addIfNew(cmsClinics,     merged) // 6th: CMS Rural Health Clinics
  addIfNew(samhsaClinics,  merged) // 7th: SAMHSA treatment centers (free federal API)
  addIfNew(yelpClinics,    merged) // 8th: Yelp (free tier, optional — requires YELP_API_KEY)
  addIfNew(googleClinics,  merged) // 9th: Google Places (keyed, optional)
  // OSM: include if score ≥ 40 (lowered from 55 — catches more legitimate clinics)
  addIfNew(osmClinics.filter(c => c.affordability_score >= 25), merged)

  // 4. Apply specialty filter
  const filtered = specialty && specialty !== 'all'
    ? merged.filter(c => matchesSpecialty(c, specialty))
    : merged

  const finalList = filtered.length > 0 ? filtered : merged
  const specialtyMissed = filtered.length === 0 && specialty !== 'all'

  // 5. Determine source label for UI
  const sourceLabel =
    hrsaClinics.length > 0 && nafcClinics.length > 0 ? 'hrsa+nafc' :
    hrsaClinics.length > 0 ? 'hrsa' :
    nafcClinics.length > 0 ? 'nafc' :
    samhsaClinics.length > 0 ? 'samhsa' :
    osmClinics.length > 0 ? 'osm' : 'empty'

  // Background: cache returned clinics so the detail page can look them up by ID
  void cacheClinicsBg(finalList.slice(0, 150), sourceLabel)

  return NextResponse.json({
    clinics: finalList.slice(0, 150),
    source: sourceLabel,
    total: finalList.length,
    specialty_matched: !specialtyMissed,
    location: { lat: geo.lat, lng: geo.lng, zip: geo.zip, formatted: geo.formatted },
    sources: {
      hrsa:     hrsaClinics.length,
      nafc:     nafcClinics.length,
      va:       vaClinics.length,
      findhelp: findHelpClinics.length,
      state:    stateClinics.length,
      cms:      cmsClinics.length,
      samhsa:   samhsaClinics.length,
      yelp:     yelpClinics.length,
      google:   googleClinics.length,
      osm:      osmClinics.length,
    },
  })
}
