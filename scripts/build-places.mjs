/**
 * Compiles the GeoNames US postal-code file into a compact JSON bundle
 * used by /api/places (typeahead) and /api/clinics (local geocoding).
 *
 * Data: https://download.geonames.org/export/zip/US.zip (CC-BY 4.0,
 * attribution: GeoNames — geonames.org)
 *
 * Usage:
 *   node scripts/build-places.mjs path/to/US.txt
 *
 * Output: lib/data/us-places.json
 *   { cities: [[name, state, lat, lng, zipCount], ...],   // centroid = mean of its ZIPs
 *     zips:   [[zip, cityIdx, lat, lng], ...] }           // cityIdx → cities[]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = process.argv[2]
if (!src) { console.error('usage: node scripts/build-places.mjs <US.txt>'); process.exit(1) }

const lines = readFileSync(src, 'utf8').split('\n')

const cityKey = new Map() // "name|ST" → index into cities
const cities = []          // [name, state, latSum, lngSum, zipCount] → finalized later
const zips = []

for (const line of lines) {
  const f = line.split('\t')
  if (f.length < 11) continue
  const zip = f[1], city = f[2], state = f[4]
  const lat = parseFloat(f[9]), lng = parseFloat(f[10])
  if (!/^\d{5}$/.test(zip) || !city || !state || !Number.isFinite(lat) || !Number.isFinite(lng)) continue

  const key = `${city}|${state}`
  let idx = cityKey.get(key)
  if (idx === undefined) {
    idx = cities.length
    cityKey.set(key, idx)
    cities.push([city, state, 0, 0, 0])
  }
  const c = cities[idx]
  c[2] += lat; c[3] += lng; c[4] += 1
  zips.push([zip, idx, +lat.toFixed(4), +lng.toFixed(4)])
}

// Finalize city centroids
for (const c of cities) {
  c[2] = +(c[2] / c[4]).toFixed(4)
  c[3] = +(c[3] / c[4]).toFixed(4)
}

zips.sort((a, b) => a[0].localeCompare(b[0]))

const outDir = resolve(ROOT, 'lib', 'data')
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
const out = resolve(outDir, 'us-places.json')
writeFileSync(out, JSON.stringify({ cities, zips }))

const kb = Math.round(Buffer.byteLength(JSON.stringify({ cities, zips })) / 1024)
console.log(`✓ ${cities.length} cities, ${zips.length} ZIPs → lib/data/us-places.json (${kb} KB)`)
