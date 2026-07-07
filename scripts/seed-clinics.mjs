/**
 * NEXUS — Clinic database seeder
 *
 * Seeds public.clinics from the HRSA Health Center Service Delivery and
 * Look-Alike Sites file (~19k active FQHC sites, pre-geocoded by HRSA).
 *
 * Usage:
 *   node scripts/seed-clinics.mjs             # download + upsert to Supabase
 *   node scripts/seed-clinics.mjs --dry       # parse only, write data/clinics-seed.json
 *   node scripts/seed-clinics.mjs --file X.csv# use a local CSV instead of downloading
 *
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * Prereq:   supabase/migrations/20260706_clinics_master.sql applied
 *
 * Zero dependencies — includes a minimal RFC-4180 CSV parser.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const HRSA_URL = 'https://data.hrsa.gov/DataDownload/DD_Files/Health_Center_Service_Delivery_and_LookAlike_Sites.csv'

/* ── env ── */
function loadEnv() {
  const env = {}
  try {
    for (const line of readFileSync(resolve(ROOT, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m) env[m[1]] = m[2].trim().replace(/\r$/, '').replace(/^"|"$/g, '')
    }
  } catch { /* no .env.local */ }
  return env
}

/* ── minimal RFC-4180 CSV parser (handles quoted fields, embedded commas/newlines) ── */
function parseCSV(text) {
  const rows = []
  let row = [], field = '', inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += ch
    } else if (ch === '"') inQuotes = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = '' }
    else field += ch
  }
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row) }
  return rows
}

/* ── HRSA row → clinics row ── */
function mapHRSA(header, row) {
  const col = (name) => {
    const idx = header.indexOf(name)
    return idx >= 0 ? (row[idx] ?? '').trim() : ''
  }
  if (col('Site Status Description') !== 'Active') return null

  const name = col('Site Name')
  if (!name) return null

  const lng = parseFloat(col('Geocoding Artifact Address Primary X Coordinate'))
  const lat = parseFloat(col('Geocoding Artifact Address Primary Y Coordinate'))
  const typeDesc = col('Health Center Type') || col('Health Center Type Description')
  const isLookAlike = /look-?alike/i.test(typeDesc)
  const weeklyHours = parseFloat(col('Operating Hours per Week')) || null
  const siteId = col('BPS Assigned Number') || col('BPHC Assigned Number') ||
    `${col('BHCMIS Organization Identification Number')}-${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24)}`

  return {
    source: 'hrsa',
    source_id: siteId,
    name,
    type: isLookAlike ? 'FQHC Look-Alike' : 'FQHC',
    address: col('Site Address'),
    city: col('Site City'),
    state: col('Site State Abbreviation'),
    zip: col('Site Postal Code').slice(0, 5),
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    phone: col('Site Telephone Number'),
    website: col('Site Web Address'),
    hours: weeklyHours ? `${weeklyHours} hrs/week` : null,
    weekly_hours: weeklyHours,
    free: false,
    sliding_scale: true,                       // FQHCs: sliding scale required by law
    affordability_score: 95,
    services: ['Primary care'],
    languages: [],
    verified_at: new Date().toISOString(),     // file is current as of download
  }
}

/* ── upsert in batches via PostgREST ── */
async function upsertBatches(env, rows) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local')

  const BATCH = 500
  let done = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const res = await fetch(`${url}/rest/v1/clinics?on_conflict=source,source_id`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(batch),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Batch ${i / BATCH + 1} failed: HTTP ${res.status} — ${body.slice(0, 300)}`)
    }
    done += batch.length
    process.stdout.write(`\r  upserted ${done}/${rows.length}`)
  }
  console.log('')
}

/* ── main ── */
async function main() {
  const args = process.argv.slice(2)
  const dry = args.includes('--dry')
  const fileArgIdx = args.indexOf('--file')
  const localFile = fileArgIdx >= 0 ? args[fileArgIdx + 1] : null

  console.log('NEXUS clinic seeder — HRSA Health Center sites')

  let csvText
  if (localFile) {
    console.log(`  reading local file: ${localFile}`)
    csvText = readFileSync(localFile, 'utf8')
  } else {
    console.log('  downloading HRSA file (~14MB)…')
    const res = await fetch(HRSA_URL)
    if (!res.ok) throw new Error(`HRSA download failed: HTTP ${res.status}`)
    csvText = await res.text()
  }

  console.log('  parsing CSV…')
  const rowsRaw = parseCSV(csvText)
  const header = rowsRaw[0]
  const mapped = []
  const seen = new Set()
  for (let i = 1; i < rowsRaw.length; i++) {
    const r = mapHRSA(header, rowsRaw[i])
    if (!r) continue
    const key = `${r.source}|${r.source_id}`
    if (seen.has(key)) continue                 // duplicate BPS ids → keep first
    seen.add(key)
    mapped.push(r)
  }
  const withCoords = mapped.filter(r => r.lat !== null && r.lng !== null)
  console.log(`  parsed: ${rowsRaw.length - 1} raw → ${mapped.length} active unique → ${withCoords.length} geocoded`)

  if (dry) {
    const out = resolve(ROOT, 'data')
    if (!existsSync(out)) mkdirSync(out)
    writeFileSync(resolve(out, 'clinics-seed.json'), JSON.stringify(mapped, null, 1))
    console.log(`  DRY RUN — wrote data/clinics-seed.json (${mapped.length} rows). No DB writes.`)
    return
  }

  const env = loadEnv()
  console.log('  upserting to Supabase…')
  await upsertBatches(env, mapped)
  console.log(`✓ done — ${mapped.length} clinics in public.clinics`)
}

main().catch(e => { console.error(`\n✗ ${e.message}`); process.exit(1) })
