import { NextRequest, NextResponse } from 'next/server'
import { getNAFCClinicsNear, type NAFCClinic } from '@/lib/nafc-clinics'

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
function fingerprint(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12)
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

// ── Parse Overpass XML ────────────────────────────────────────────────────────
function parseOverpassXML(xml: string): Array<{ id: number; lat: number; lon: number; tags: Record<string, string> }> {
  const results: Array<{ id: number; lat: number; lon: number; tags: Record<string, string> }> = []

  const nodeRx = /<node\s+id="(\d+)"\s+lat="([\d.-]+)"\s+lon="([\d.-]+)"[^>]*>([\s\S]*?)<\/node>/g
  let m: RegExpExecArray | null
  while ((m = nodeRx.exec(xml)) !== null && results.length < 200) {
    const tags = extractTags(m[4])
    if (tags.name && (tags.amenity || tags.healthcare || tags.social_facility))
      results.push({ id: +m[1], lat: +m[2], lon: +m[3], tags })
  }

  const wayRx = /<way\s+id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g
  while ((m = wayRx.exec(xml)) !== null && results.length < 200) {
    const inner = m[2]
    const tags = extractTags(inner)
    const ctrM = inner.match(/<center\s+lat="([\d.-]+)"\s+lon="([\d.-]+)"/)
    if (ctrM && tags.name && (tags.amenity || tags.healthcare))
      results.push({ id: +m[1], lat: +ctrM[1], lon: +ctrM[2], tags })
  }

  return results
}

function extractTags(block: string): Record<string, string> {
  const tags: Record<string, string> = {}
  const rx = /<tag\s+k="([^"]+)"\s+v="([^"]*)"\s*\/?>/g
  let m: RegExpExecArray | null
  while ((m = rx.exec(block)) !== null) tags[m[1]] = m[2]
  return tags
}

// ── Overpass query ────────────────────────────────────────────────────────────
async function queryOverpass(lat: number, lng: number, radiusMiles: number): Promise<Clinic[]> {
  const degOffset = (radiusMiles * 1.2) / 69.0
  const south = (lat - degOffset).toFixed(6)
  const west  = (lng - degOffset).toFixed(6)
  const north = (lat + degOffset).toFixed(6)
  const east  = (lng + degOffset).toFixed(6)

  const ql = `[bbox:${south},${west},${north},${east}];(node["amenity"="clinic"]["name"];node["amenity"="hospital"]["name"];node["amenity"="doctors"]["name"];node["amenity"="dentist"]["name"];node["healthcare"]["name"];node["social_facility"="outreach"]["name"];way["amenity"="clinic"]["name"];way["amenity"="hospital"]["name"];way["healthcare"]["name"];);out center tags;`

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'NEXUS-Healthcare/1.0' },
      body: `data=${encodeURIComponent(ql)}`,
      next: { revalidate: 7200 },
    })

    if (!res.ok) return []

    const xml = await res.text()
    const nodes = parseOverpassXML(xml)

    return nodes
      .map(n => {
        const tags = n.tags
        const rawName = (tags.name || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim()
        if (!rawName) return null

        const { score, label, reasons } = scoreAffordability(rawName, tags)
        const dist = distanceMiles(lat, lng, n.lat, n.lon)
        const street = tags['addr:housenumber'] ? `${tags['addr:housenumber']} ${tags['addr:street'] || ''}`.trim() : (tags['addr:street'] || '')

        return {
          id: String(n.id),
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
          mapsUrl: `https://www.openstreetmap.org/?lat=${n.lat}&lon=${n.lon}&zoom=18`,
          hours: tags.opening_hours || '',
          openNow: null,
          type: tags.amenity === 'hospital' ? 'Hospital' : 'Clinic',
          lat: n.lat,
          lng: n.lon,
        } as Clinic
      })
      .filter((c): c is Clinic => c !== null && isOrganization(c.name))
      .sort((a, b) =>
        b.affordability_score !== a.affordability_score
          ? b.affordability_score - a.affordability_score
          : parseFloat(a.distance) - parseFloat(b.distance)
      )
      .slice(0, 60)
  } catch {
    return []
  }
}

// ── HRSA: primary source — federally qualified health centers ─────────────────
async function fetchHRSAClinics(zip: string, radiusMiles: number): Promise<Clinic[]> {
  const clean = zip.replace(/\D/g, '').slice(0, 5)
  if (!clean) return []

  const endpoints = [
    `https://findahealthcenter.hrsa.gov/api/v1/healthcenter/FindHealthCenters?zipcode=${clean}&radius=${radiusMiles}`,
    `https://findahealthcenter.hrsa.gov/api/v1.0/FindHealthCenters?ZipCode=${clean}&Radius=${radiusMiles}`,
    `https://findahealthcenter.hrsa.gov/api/HealthCenterFinder/FindHealthCenters?zipcode=${clean}&radius=${radiusMiles}`,
  ]

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'NEXUS-Healthcare/1.0 contact@nexus.health' },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue

      const raw: unknown = await res.json()

      let list: Record<string, unknown>[] = []
      if (Array.isArray(raw)) {
        list = raw as Record<string, unknown>[]
      } else if (raw && typeof raw === 'object') {
        const r = raw as Record<string, unknown>
        list = (r.Results ?? r.HealthCenters ?? r.Sites ?? r.results ?? []) as Record<string, unknown>[]
      }

      if (list.length === 0) continue

      const clinics: Clinic[] = list
        .map((c): Clinic | null => {
          const name = String(c.SiteName ?? c.HealthCenterName ?? c.Name ?? c.name ?? '').trim()
          if (!name) return null

          const dist = Number(c.SiteDistance ?? c.Distance ?? c.Miles ?? c.distance ?? 0)
          const addr = String(c.SiteAddress ?? c.Address ?? c.SiteStreetAddress ?? c.HealthCenterAddress ?? '')
          const city = String(c.SiteCity ?? c.City ?? '')
          const state = String(c.SiteState ?? c.State ?? '')
          const zipCode = String(c.SiteZipCode ?? c.ZipCode ?? c.SiteZip ?? clean)
          const phone = String(c.SitePhoneNumber ?? c.SiteTelephone ?? c.PhoneNumber ?? c.Phone ?? '')
          const website = String(c.SiteWebAddress ?? c.WebAddress ?? c.URL ?? c.url ?? '')
          const hours = String(c.HoursOfOperation ?? c.Hours ?? '')
          const lat = parseFloat(String(c.Latitude ?? c.SiteLatitude ?? c.lat ?? '0')) || undefined
          const lng = parseFloat(String(c.Longitude ?? c.SiteLongitude ?? c.lng ?? '0')) || undefined

          const desc = String(c.SiteServiceDescription ?? c.ServiceCategory ?? c.Services ?? '').toLowerCase()
          const services: string[] = []
          if (/primary|general|family|internal/i.test(desc)) services.push('Primary care')
          if (/mental|behav|psych|counsel/i.test(desc)) services.push('Mental health')
          if (/dental/i.test(desc)) services.push('Dental')
          if (/women|maternal|ob|gynec/i.test(desc)) services.push("Women's health")
          if (/pediatric|child/i.test(desc)) services.push('Pediatrics')
          if (/vision|eye|optom/i.test(desc)) services.push('Vision')
          if (services.length === 0) services.push(...guessServices(name))

          const id = `hrsa-${String(c.SiteId ?? c.BPHCId ?? c.HealthCenterId ?? Math.random()).replace(/\./g, '')}`

          return {
            id, name,
            address: addr, city, state,
            zip: zipCode,
            phone: phone.replace(/[^\d()\-+\s]/g, '').trim(),
            distance: dist.toFixed(1),
            services: [...new Set(services)],
            accepting: true,
            free: true,
            sliding_scale: true,
            isFreeOrDiscounted: true,
            affordability_score: 95,
            affordability_label: 'likely-free' as AffordabilityLabel,
            affordability_reasons: ['FQHC – federally required to serve all patients on sliding scale'],
            url: website,
            mapsUrl: addr
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${addr} ${city} ${state}`)}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city} ${state}`)}`,
            hours,
            openNow: null,
            type: 'FQHC',
            lat,
            lng,
          }
        })
        .filter((c): c is Clinic => c !== null)
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))

      console.log('[NEXUS] HRSA %s → %d FQHCs', url.split('?')[0].split('/').pop(), clinics.length)
      return clinics
    } catch (e) {
      console.warn('[NEXUS] HRSA endpoint failed:', String(e).slice(0, 80))
      continue
    }
  }

  console.warn('[NEXUS] All HRSA endpoints failed for zip=%s', clean)
  return []
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
function detectState(formatted: string): string {
  const stateMap: Record<string, string> = {
    'California': 'CA', 'Texas': 'TX', 'New York': 'NY', 'Florida': 'FL', 'Illinois': 'IL',
    ' CA,': 'CA', ' TX,': 'TX', ' NY,': 'NY', ' FL,': 'FL', ' IL,': 'IL',
  }
  for (const [key, code] of Object.entries(stateMap)) {
    if (formatted.includes(key)) return code
  }
  return ''
}

// ── Main GET handler ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  let rawLoc = searchParams.get('location') || searchParams.get('zip') || ''
  const radiusMiles = Math.min(parseInt(searchParams.get('radius') || '25'), 50)
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
  const [hrsaClinics, nafcClinics, osmClinics, googleClinics, stateClinics] = await Promise.all([
    fetchHRSAClinics(zip, radiusMiles),
    Promise.resolve(fetchNAFCClinics(geo.lat, geo.lng, radiusMiles)),
    queryOverpass(geo.lat, geo.lng, radiusMiles),
    fetchGooglePlacesClinics(geo.lat, geo.lng, radiusMiles),
    detectedState ? fetchStateHealthClinics(geo.lat, geo.lng, detectedState, radiusMiles) : Promise.resolve([]),
  ])

  console.log('[NEXUS] Sources: HRSA=%d NAFC=%d OSM=%d Google=%d State=%d',
    hrsaClinics.length, nafcClinics.length, osmClinics.length, googleClinics.length, stateClinics.length)

  // 3. Deduplicate: build fingerprint set starting with HRSA (most authoritative)
  const seen = new Set<string>()
  const addIfNew = (clinics: Clinic[], out: Clinic[]) => {
    for (const c of clinics) {
      const fp = fingerprint(c.name)
      if (!seen.has(fp)) {
        seen.add(fp)
        out.push(c)
      }
    }
  }

  const merged: Clinic[] = []
  addIfNew(hrsaClinics, merged)   // 1st: HRSA (federally verified)
  addIfNew(nafcClinics, merged)   // 2nd: NAFC (volunteer free clinics)
  addIfNew(stateClinics, merged)  // 3rd: State health dept
  addIfNew(googleClinics, merged) // 4th: Google Places (keyed, optional)
  // OSM: supplemental only if score ≥ 55
  addIfNew(osmClinics.filter(c => c.affordability_score >= 55), merged)

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
    osmClinics.length > 0 ? 'osm' : 'empty'

  return NextResponse.json({
    clinics: finalList.slice(0, 100),
    source: sourceLabel,
    total: finalList.length,
    specialty_matched: !specialtyMissed,
    location: { lat: geo.lat, lng: geo.lng, zip: geo.zip, formatted: geo.formatted },
    sources: {
      hrsa: hrsaClinics.length,
      nafc: nafcClinics.length,
      state: stateClinics.length,
      google: googleClinics.length,
      osm: osmClinics.length,
    },
  })
}
