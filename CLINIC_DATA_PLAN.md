# NEXUS — Clinic Data Plan: from 2 results to 20–100, everywhere

## Diagnosis (from reading app/api/clinics/route.ts)

Every search fans out to 10 live APIs at request time. In practice:

| Source | Status today | Why it underdelivers |
|---|---|---|
| NPI Registry (FQHC/RHC/Mental) | working | **matches by exact city string** — Phoenix search misses Tempe/Mesa/Scottsdale entirely; ZIP-centroid distances are approximate |
| NAFC static file | working | small curated subset |
| OpenStreetMap Overpass | working | clinics are poorly tagged in OSM; slow; flaky endpoints |
| State health depts (CA/TX/NY/FL/IL) | probably dead | dataset/resource IDs appear guessed; most return nothing |
| Google Places | **disabled** | no GOOGLE_PLACES_API_KEY |
| Yelp Fusion | **disabled** | no YELP_API_KEY |
| FindHelp / 211 | **disabled** | no FINDHELP_API_KEY |
| VA Facilities | **disabled** | no VA_API_KEY |

Root cause: we rent data per-request instead of owning it. Fix: seed our own
database once from authoritative bulk files, search it by radius in
milliseconds, and use live APIs only for enrichment and freshness.

---

## Phase 1 — Own the data (the big win)

### 1a. Schema: `clinics` master table in Supabase

```
clinics (
  id uuid pk, source text, source_id text,        -- provenance
  name text, type text,                            -- FQHC | RHC | Free Clinic | ...
  address, city, state, zip,
  lat double, lng double,                          -- geocoded once
  phone, website, hours,
  free bool, sliding_scale bool,
  affordability_score int,
  services text[], languages text[],
  verified_at timestamptz, updated_at,
  unique(source, source_id)
)
-- + GIST index on ll_to_earth(lat,lng) via earthdistance extension
-- + RPC: clinics_near(lat, lng, radius_m, limit) → ordered by distance
```

### 1b. Seed sources (all free, no keys, bulk downloadable)

1. **HRSA Health Center Service Delivery Sites** (data.hrsa.gov CSV)
   ~16,000 FQHC sites + look-alikes. Federally verified, sliding-scale BY LAW.
   Has name/address/phone/site type. The single most valuable file.
2. **CMS Provider of Services file** — Rural Health Clinics (~5,000) + hospital
   outpatient departments. Quarterly CSV.
3. **NPPES NPI extracts by taxonomy** (paginated API, state by state):
   - 261QF0400X Federally Qualified Health Center
   - 261QR1300X Rural Health Clinic
   - 261QC1500X Community Health
   - 261QM0801X Mental Health (community)
   - 261QP0904X Public Health, State or Local
   Catches orgs newer than the HRSA/CMS files.
4. **NAFC free-clinic list** — migrate the existing static lib into the table.
5. **SAMHSA Behavioral Health Treatment Services Locator download** (CSV) —
   substance use + mental health facilities with payment-assistance flags.

Estimated result: **30,000–45,000 unique rows** after dedupe. Any metro ZIP
returns 30–150 candidates; rural ZIPs return real results within 40 miles.

### 1c. Geocoding the seeds

**US Census Bureau batch geocoder** — free, no key, 10,000 addresses per batch,
built for exactly this. (Not Nominatim: 1 req/sec ToS makes bulk illegal.)
Rows that fail → ZIP centroid fallback (zippopotam, cached in a zip_centroids
table so we never re-fetch).

### 1d. Ingestion pipeline

`scripts/seed-clinics.ts` (run locally, once): download → normalize →
dedupe (name+zip fingerprint, prefer HRSA > CMS > NPI > SAMHSA > NAFC) →
geocode → upsert. Idempotent — safe to re-run.
Weekly freshness: repurpose the existing `refresh-clinics` cron to re-pull
HRSA/NPI deltas instead of pinging per-ZIP.

## Phase 2 — Rewrite the search path

`GET /api/clinics` becomes:
1. Geocode query location (keep Nominatim for single lookups, cached)
2. `clinics_near()` RPC — one indexed DB query, <50ms, radius 25mi
3. Auto-widen 25→50→75mi until ≥15 results (rural safety)
4. Keep affordability scoring + specialty filtering on the DB rows
5. Live APIs demoted to a **background top-up**: fire-and-forget merge of
   Overpass/NPI novelties into the table for next time (never blocks response)

Delete after cutover: state-endpoint fetchers (dead), per-request NPI fan-out,
per-request Overpass (moves to background), zippopotam per-request batching.

## Phase 3 — Quality & trust

- `verified_at` from source file dates → honest freshness badges
- Merge `clinic_overrides` (already exists) for corrections/booking links
- "Report an issue" on clinic detail → feeds overrides queue
- Optional Google Places *Details* on the detail page only (hours/phone
  verification for the one clinic being viewed — pennies, not per-search)

## Phase 4 — Optional paid/keyed upgrades (later, not blocking)

- FindHelp/211 API — biggest social-services DB; free tier requires an
  application (~3 business days) — worth doing for mobile/faith-based clinics
- VA Facilities key — free, instant, at developer.va.gov
- Google Places — $200/mo free credit covers detail-page enrichment easily

---

## YOUR to-dos

1. Nothing for Phase 1–2 except saying "go" — seeds are keyless and free.
   I'll run the seed script locally and the table lives in your existing
   Supabase project (30–45k rows ≈ 40–80MB — fine on your plan).
2. Optional, later: apply for FindHelp key; grab instant VA key; decide on
   Google Places budget for detail-page enrichment.
3. If Supabase `earthdistance` extension isn't enabled, one click in the
   dashboard (Database → Extensions) — I'll tell you when.

## Order of execution when you say go

1. Migration: clinics table + extension + RPC
2. seed-clinics.ts: HRSA file first (16k rows) → verify Phoenix/rural ZIP
3. Add CMS, NPI, SAMHSA, NAFC sources to the seeder
4. Rewrite /api/clinics to DB-first
5. Repoint refresh-clinics cron; delete dead fetchers
6. Verify: 10 test ZIPs (urban/suburban/rural) each return ≥15 quality results
