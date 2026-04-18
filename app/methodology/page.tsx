import AppShell from '@/components/AppShell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Methodology — NEXUS Healthcare Platform',
  description: 'How NEXUS sources, scores, and ranks free and affordable healthcare facilities. A transparent account of our data pipeline, affordability model, and quality standards.',
}

export default function MethodologyPage() {
  const section: React.CSSProperties = {
    padding: '80px 24px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    maxWidth: '860px',
    margin: '0 auto',
  }
  const h2: React.CSSProperties = {
    fontSize: 'clamp(22px, 3vw, 32px)',
    fontWeight: 700,
    letterSpacing: '-0.025em',
    marginBottom: '16px',
    lineHeight: 1.2,
  }
  const h3: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '10px',
    marginTop: '36px',
    color: 'rgba(255,255,255,0.85)',
  }
  const p: React.CSSProperties = {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.8,
    marginBottom: '16px',
  }
  const pill: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    background: 'rgba(109,145,151,0.08)',
    color: 'var(--accent)',
    border: '1px solid rgba(109,145,151,0.18)',
    marginBottom: '20px',
  }
  const table: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
    marginBottom: '24px',
  }
  const th: React.CSSProperties = {
    textAlign: 'left' as const,
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.35)',
    fontSize: '11px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    fontWeight: 500,
  }
  const td: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.55)',
    verticalAlign: 'top' as const,
  }
  const callout: React.CSSProperties = {
    background: 'rgba(109,145,151,0.05)',
    border: '1px solid rgba(109,145,151,0.2)',
    borderLeft: '3px solid rgba(109,145,151,0.5)',
    borderRadius: '10px',
    padding: '16px 20px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.75,
    margin: '24px 0',
  }
  const code: React.CSSProperties = {
    fontFamily: 'monospace',
    background: 'rgba(255,255,255,0.06)',
    padding: '2px 7px',
    borderRadius: '5px',
    fontSize: '13px',
    color: '#6d9197',
  }

  return (
    <AppShell>
      {/* ── Hero ── */}
      <section style={{ padding: '100px 24px 60px', maxWidth: '860px', margin: '0 auto' }}>
        <span style={pill}>Methodology · v2.0 · April 2026</span>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px' }}>
          How NEXUS finds, scores, and ranks free healthcare
        </h1>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '640px' }}>
          A transparent, academic-quality account of the data sources, scoring models, deduplication logic, and quality safeguards that power the NEXUS clinic finder. No black boxes.
        </p>
      </section>

      {/* ── Table of Contents ── */}
      <section style={{ ...section, paddingTop: '0', borderTop: 'none' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px 28px' }}>
          <h3 style={{ ...h3, marginTop: 0, fontSize: '14px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Contents</h3>
          <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['1', 'Data Sources & Collection Pipeline'],
              ['2', 'Affordability Scoring Model'],
              ['3', 'Deduplication & Merge Logic'],
              ['4', 'Specialty Classification'],
              ['5', 'Geographic Resolution'],
              ['6', 'Data Freshness & Quality Assurance'],
              ['7', 'Privacy & Data Ethics'],
              ['8', 'Limitations & Known Gaps'],
              ['9', 'Citing NEXUS'],
            ].map(([n, title]) => (
              <li key={n} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                <a href={`#section-${n}`} style={{ color: '#6d9197', textDecoration: 'none' }}>
                  {n}. {title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Section 1: Data Sources ── */}
      <section id="section-1" style={section}>
        <span style={{ ...pill, marginBottom: '12px' }}>Section 1</span>
        <h2 style={h2}>Data Sources &amp; Collection Pipeline</h2>
        <p style={p}>
          NEXUS aggregates healthcare facility data from four independent sources, ordered by authority and verification level. Each source covers a distinct population of clinics that the others miss.
        </p>

        <h3 style={h3}>1.1 HRSA Health Center Finder (Primary)</h3>
        <p style={p}>
          The Health Resources and Services Administration (HRSA) maintains a database of all federally qualified health centers (FQHCs) — the approximately 1,400 HRSA-designated grantees operating 14,000+ delivery sites across the United States. FQHCs are legally required under Section 330 of the Public Health Service Act to provide care on a sliding-fee scale regardless of a patient's ability to pay, and cannot turn away any patient for inability to pay.
        </p>
        <div style={callout}>
          <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Legal foundation:</strong> Under 42 U.S.C. § 254b and 42 CFR Part 51c, all HRSA-funded health centers must offer a sliding-fee discount program. Patient fees are capped at a percentage of the Federal Poverty Level (FPL). Patients below 100% FPL typically pay $0.
        </div>
        <p style={p}>
          We query the HRSA API sequentially against three known endpoint variants (the HRSA API has changed endpoints across versions) and parse all known response shapes:
        </p>
        <ul style={{ ...p, paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}><span style={code}>findahealthcenter.hrsa.gov/api/v1/healthcenter/FindHealthCenters</span></li>
          <li style={{ marginBottom: '8px' }}><span style={code}>findahealthcenter.hrsa.gov/api/v1.0/FindHealthCenters</span></li>
          <li style={{ marginBottom: '8px' }}><span style={code}>findahealthcenter.hrsa.gov/api/HealthCenterFinder/FindHealthCenters</span></li>
        </ul>
        <p style={p}>
          HRSA results are assigned an affordability score of 95/100 and are always ranked before supplementary sources. Response caching is set to 1 hour (3,600 seconds) via Next.js ISR.
        </p>

        <h3 style={h3}>1.2 NAFC Member Clinics (Secondary)</h3>
        <p style={p}>
          The National Association of Free &amp; Charitable Clinics (NAFC) represents 1,200+ volunteer-run free clinics that are <em>not</em> federally qualified — meaning they do not appear in HRSA's database. These clinics charge $0 to patients and operate on donations and volunteer labor. They fill a critical gap for patients in rural areas and underserved urban neighborhoods.
        </p>
        <p style={p}>
          NEXUS maintains a curated static database of 130+ verified NAFC member clinics compiled from the NAFC member directory, individual clinic websites, and Google Places verification. Each entry is manually reviewed for accuracy. This database is stored in <span style={code}>lib/nafc-clinics.ts</span> and queried in-memory using a Haversine distance calculation — zero latency, zero API dependency.
        </p>
        <p style={p}>
          NAFC clinics receive an affordability score of 90/100. They are labeled "FREE CLINIC" in the UI to distinguish them from FQHCs.
        </p>

        <h3 style={h3}>1.3 OpenStreetMap Overpass API (Supplementary)</h3>
        <p style={p}>
          OpenStreetMap (OSM) provides crowd-sourced location data for healthcare facilities. We query the Overpass API for nodes and ways tagged with <span style={code}>amenity=clinic</span>, <span style={code}>amenity=hospital</span>, <span style={code}>healthcare=*</span>, and <span style={code}>social_facility=outreach</span> within a bounding box around the user's location.
        </p>
        <p style={p}>
          OSM data quality varies significantly. We apply the affordability scoring model (Section 2) to each result and only include OSM clinics with a score ≥ 55/100 in the merged output, ensuring low-confidence results are excluded. OSM results are always ranked after HRSA and NAFC. Response caching is 2 hours (7,200 seconds).
        </p>

        <h3 style={h3}>1.4 Google Places API (Optional Tertiary)</h3>
        <p style={p}>
          When a <span style={code}>GOOGLE_PLACES_API_KEY</span> environment variable is configured, NEXUS runs a tertiary search against the Google Places Nearby Search API using keywords "free clinic" and "community health center". Results are filtered to affordability score ≥ 45/100 before inclusion. This source is strictly optional and not required for core functionality.
        </p>

        <h3 style={h3}>1.5 State Health Department Directories</h3>
        <p style={p}>
          For searches in California, Texas, New York, Florida, and Illinois — the five states with the largest uninsured populations — NEXUS queries public clinic directories exposed via data.gov and state open-data portals. These are scraped at query time with results cached for 24 hours and filtered by proximity and affordability score.
        </p>

        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Source</th>
              <th style={th}>Coverage</th>
              <th style={th}>Affording Score</th>
              <th style={th}>Cache TTL</th>
              <th style={th}>Authority</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['HRSA FQHC', '14,000+ sites nationwide', '95 / 100', '1 hour', 'Federal (legal guarantee)'],
              ['NAFC Members', '130+ curated clinics', '90 / 100', 'Static', 'Manually verified'],
              ['State Depts (5 states)', 'CA, TX, NY, FL, IL', 'Computed', '24 hours', 'State govt open data'],
              ['Google Places', 'Variable (optional)', 'Computed (≥45)', '1 hour', 'Commercial (optional key)'],
              ['OpenStreetMap', 'Global crowd-sourced', 'Computed (≥55)', '2 hours', 'Community volunteers'],
            ].map(row => (
              <tr key={row[0]}>
                {row.map((cell, i) => <td key={i} style={td}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── Section 2: Affordability Scoring ── */}
      <section id="section-2" style={section}>
        <span style={{ ...pill, marginBottom: '12px' }}>Section 2</span>
        <h2 style={h2}>Affordability Scoring Model</h2>
        <p style={p}>
          Every non-HRSA clinic is scored on a 0–100 affordability scale. This score determines whether a clinic appears in results, its sort order relative to other clinics, and the label shown in the UI (LIKELY FREE / LOW COST / STANDARD).
        </p>
        <p style={p}>
          The model begins with a base score of 40 and applies additive and subtractive adjustments based on signals extracted from the clinic name and OpenStreetMap tags. Each signal is derived from published research on how clinic naming conventions correlate with care affordability.
        </p>

        <h3 style={h3}>2.1 Name-Based Signals (additive)</h3>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Pattern</th>
              <th style={th}>Score Delta</th>
              <th style={th}>Rationale</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['"FQHC" or "Federally Qualified"', '+50', 'Federal legal guarantee of sliding-scale care'],
              ['"Free Clinic" / "Free Care"', '+45', 'Explicit no-cost mission'],
              ['"Sliding Scale"', '+40', 'Explicit income-based pricing'],
              ['"Community Health Center/Clinic"', '+38', 'CHC designation strongly correlates with FQHC status'],
              ['County/Public Health / Health Dept', '+28', 'Government-operated facilities are generally low-cost'],
              ['"Low Cost" / "Low Income" / "Income-Based"', '+25', 'Explicit affordability language'],
              ['"Tribal" / "Indian Health" / "Native American"', '+25', 'IHS-affiliated clinics serve members at no cost'],
              ['"Veterans" / "VA Clinic"', '+20', 'VA care is free for enrolled veterans'],
              ['"Community" + health/medical/clinic', '+20', 'Community-serving mission indicator'],
              ['Planned Parenthood', '+22', 'Uses sliding-scale fees, federally designated Title X'],
              ['"Mission" / "Outreach" / "Migrant" / "Farmworker"', '+18', 'Charitable or outreach mission indicator'],
              ['"Family Health Center"', '+15', 'FQHC naming convention'],
            ].map(row => (
              <tr key={row[0]}>
                {row.map((cell, i) => <td key={i} style={td}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={h3}>2.2 Tag-Based Signals (additive)</h3>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>OSM Tag</th>
              <th style={th}>Value</th>
              <th style={th}>Score Delta</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['operator:type', 'government', '+20'],
              ['operator:type', 'ngo / nonprofit / charity', '+18'],
              ['fee', 'no', '+30'],
              ['social_facility', 'outreach', '+20'],
              ['operator', 'county / city of / department', '+15'],
              ['access', 'public', '+8'],
            ].map(row => (
              <tr key={row[0] + row[1]}>
                {row.map((cell, i) => <td key={i} style={td}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={h3}>2.3 Exclusion Signals (subtractive)</h3>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Pattern</th>
              <th style={th}>Score Delta</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['"Urgent Care"', '-20'],
              ['"Cosmetic" / "Aesthetic" / "Plastic Surgery"', '-35'],
              ['"Concierge" / "Boutique" / "Luxury" / "VIP"', '-35'],
              ['"Private Practice"', '-20'],
              ['"Specialty Clinic/Center" (non-community)', '-15'],
              ['fee: yes (OSM tag)', '-10'],
            ].map(row => (
              <tr key={row[0]}>
                {row.map((cell, i) => <td key={i} style={td}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={h3}>2.4 Label Thresholds</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            { label: 'LIKELY FREE', range: '≥ 70 / 100', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', desc: 'FQHC, NAFC free clinic, or name strongly indicates $0 care' },
            { label: 'LOW COST', range: '45–69 / 100', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', desc: 'Community health, income-based fees, sliding scale available' },
            { label: 'STANDARD', range: '< 45 / 100', color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.03)', desc: 'Unknown affordability — may not offer reduced-cost care' },
          ].map(t => (
            <div key={t.label} style={{ background: t.bg, border: `1px solid ${t.color}25`, borderRadius: '12px', padding: '16px 20px', flex: '1', minWidth: '200px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: t.color, letterSpacing: '0.08em', marginBottom: '6px' }}>{t.label}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>{t.range}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Deduplication ── */}
      <section id="section-3" style={section}>
        <span style={{ ...pill, marginBottom: '12px' }}>Section 3</span>
        <h2 style={h2}>Deduplication &amp; Merge Logic</h2>
        <p style={p}>
          The same physical clinic often appears in multiple data sources under slightly different names. Without deduplication, a user would see the same clinic listed 3–4 times with slightly different data, degrading trust and usability.
        </p>
        <p style={p}>
          NEXUS uses a <strong style={{ color: 'rgba(255,255,255,0.75)' }}>name fingerprinting</strong> approach: each clinic name is normalized to its first 12 lowercase alphanumeric characters, forming a fingerprint. A hash set of seen fingerprints is maintained as sources are merged in priority order. The first occurrence of each fingerprint wins.
        </p>
        <div style={callout}>
          <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Merge priority order:</strong><br/>
          1. HRSA (highest authority — federally verified)<br/>
          2. NAFC (manually curated — volunteer free clinics)<br/>
          3. State health department directories<br/>
          4. Google Places (optional, commercially sourced)<br/>
          5. OpenStreetMap (community-sourced, score ≥ 55 only)
        </div>
        <p style={p}>
          When HRSA returns a clinic, any NAFC or OSM entry with a matching fingerprint is suppressed — HRSA's data (phone, address, hours) is treated as authoritative. This ensures that federally-verified data is never overwritten by crowd-sourced approximations.
        </p>
      </section>

      {/* ── Section 4: Specialty Classification ── */}
      <section id="section-4" style={section}>
        <span style={{ ...pill, marginBottom: '12px' }}>Section 4</span>
        <h2 style={h2}>Specialty Classification</h2>
        <p style={p}>
          NEXUS classifies clinics into six specialty categories used by the search filter: Primary care, Mental health, Dental, Women's health, Pediatrics, and Vision. Classification uses a name-and-tag pattern matching approach:
        </p>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Specialty</th>
              <th style={th}>Regex Pattern (simplified)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Primary care', '/primary|family|general|internal\\s*med|health\\s*(center|clinic)/i'],
              ['Mental health', '/mental|psych|behav|counsel|therapy|psychiatry|substance|addiction/i'],
              ['Dental', '/dental|dentist|tooth|orthodont/i'],
              ["Women's health", '/women|maternal|ob.?gyn|gynec|midwife|reproductive/i'],
              ['Pediatrics', '/pediatric|children|child|infant/i'],
              ['Vision', '/vision|eye\\s*care|optic|optom|ophth/i'],
            ].map(row => (
              <tr key={row[0]}>
                {row.map((cell, i) => <td key={i} style={{ ...td, fontFamily: i === 1 ? 'monospace' : 'inherit', fontSize: i === 1 ? '12px' : '14px' }}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <p style={p}>
          When a specialty filter is applied and returns zero results, NEXUS falls back to the full unfiltered list and surfaces a warning: "No exact [specialty] match — showing nearby clinics." This prevents users from seeing an empty results page when only a few clinics in the area don't match the pattern.
        </p>
        <p style={p}>
          For HRSA clinics, specialty data is also derived from the <span style={code}>SiteServiceDescription</span> field in the API response where available, supplementing name-based inference.
        </p>
      </section>

      {/* ── Section 5: Geographic Resolution ── */}
      <section id="section-5" style={section}>
        <span style={{ ...pill, marginBottom: '12px' }}>Section 5</span>
        <h2 style={h2}>Geographic Resolution</h2>
        <p style={p}>
          User location input (ZIP code, city name, or address) is geocoded using the Nominatim API (OpenStreetMap's free geocoder, US-constrained). Nominatim returns a latitude/longitude centroid, which is used for:
        </p>
        <ul style={{ ...p, paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>HRSA API queries (ZIP code parameter)</li>
          <li style={{ marginBottom: '8px' }}>Haversine distance calculation for NAFC and OSM results</li>
          <li style={{ marginBottom: '8px' }}>Overpass API bounding box construction (±1.2× radius in degrees)</li>
          <li style={{ marginBottom: '8px' }}>Map panel centering</li>
        </ul>
        <p style={p}>
          The <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Haversine formula</strong> is used for all distance calculations. It computes the great-circle distance between two points on a sphere (Earth radius = 3,958.8 miles):
        </p>
        <div style={{ ...callout, fontFamily: 'monospace', fontSize: '13px', color: '#6d9197' }}>
          d = 2R · arctan2(√a, √(1−a))<br/>
          where a = sin²(Δlat/2) + cos(lat₁)·cos(lat₂)·sin²(Δlng/2)
        </div>
        <p style={p}>
          The user's ZIP code is also persisted to <span style={code}>localStorage</span> under the key <span style={code}>nexus_zip</span>, enabling pre-fill across the Pathways, Calendar, and Search pages without requiring an account.
        </p>
      </section>

      {/* ── Section 6: Data Freshness ── */}
      <section id="section-6" style={section}>
        <span style={{ ...pill, marginBottom: '12px' }}>Section 6</span>
        <h2 style={h2}>Data Freshness &amp; Quality Assurance</h2>

        <h3 style={h3}>6.1 ISR Caching Tiers</h3>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Data type</th>
              <th style={th}>Cache TTL</th>
              <th style={th}>Rationale</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['HRSA clinic data', '1 hour', 'Balances freshness with HRSA rate limit compliance'],
              ['OSM Overpass results', '2 hours', 'OSM changes infrequently; reduces API load'],
              ['Nominatim geocode', '24 hours', 'Addresses rarely change'],
              ['State health dept APIs', '24 hours', 'State directories update at most weekly'],
              ['NAFC static database', 'Static (build time)', 'Manually curated; updated with code deploys'],
            ].map(row => (
              <tr key={row[0]}>
                {row.map((cell, i) => <td key={i} style={td}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={h3}>6.2 Automated Freshness Monitoring</h3>
        <p style={p}>
          Three Vercel Cron jobs run automatically to maintain data quality:
        </p>
        <ul style={{ ...p, paddingLeft: '20px' }}>
          <li style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Clinic Freshness Bot</strong> (weekly, Sunday 2 AM UTC): Re-validates HRSA availability for the 20 most-searched ZIP codes. Flags any ZIP codes where HRSA returns zero results when historical data suggests there should be clinics nearby.</li>
          <li style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Broken Link Checker</strong> (biweekly, Monday 3 AM UTC): Sends HTTP HEAD requests to all external URLs in the platform (program links, NAFC clinic websites, external references). Flags any returning 4xx/5xx or timing out.</li>
          <li style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Weekly Impact Digest</strong> (weekly, Monday 8 AM UTC): Compiles aggregate usage metrics (searches, outcomes logged, new users) into an email digest sent via Resend.</li>
        </ul>
      </section>

      {/* ── Section 7: Privacy ── */}
      <section id="section-7" style={section}>
        <span style={{ ...pill, marginBottom: '12px' }}>Section 7</span>
        <h2 style={h2}>Privacy &amp; Data Ethics</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {[
            { title: 'No PHI stored', desc: 'NEXUS never collects, stores, or transmits Protected Health Information. Search queries are not logged to any database. ZIP codes in localStorage are stored only on the user\'s own device.', color: '#4ade80' },
            { title: 'Outcome data is opt-in', desc: 'The outcome logging feature is entirely voluntary. When a user logs an outcome (e.g. "I visited a clinic"), only the event type and optionally ZIP code are stored — no names, dates of birth, diagnosis, or insurance information.', color: '#60a5fa' },
            { title: 'No tracking pixels', desc: 'NEXUS does not use advertising trackers, cross-site cookies, or third-party analytics. Vercel Speed Insights is used for performance measurement only and does not expose individual user data.', color: '#a78bfa' },
            { title: 'IRB-adjacent posture', desc: 'All data collection is designed to comply with the spirit of IRB minimal-risk standards: data is anonymized, consent is explicit, and collection is proportionate to the research question.', color: '#fbbf24' },
          ].map(item => (
            <div key={item.title} style={{ background: `${item.color}08`, border: `1px solid ${item.color}20`, borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: item.color, marginBottom: '8px' }}>{item.title}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 8: Limitations ── */}
      <section id="section-8" style={section}>
        <span style={{ ...pill, marginBottom: '12px' }}>Section 8</span>
        <h2 style={h2}>Limitations &amp; Known Gaps</h2>
        <p style={p}>
          We document known limitations transparently. Users and researchers should be aware of the following:
        </p>
        <ul style={{ ...p, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>HRSA API reliability:</strong> The HRSA Find a Health Center API has experienced intermittent outages and endpoint changes. NEXUS tries three known endpoint variants but cannot guarantee availability. In HRSA outage conditions, the platform falls back to NAFC and OSM data.</li>
          <li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Rural gaps:</strong> In counties with no HRSA grantee, FQHC look-alike, or NAFC member clinic within 25 miles, NEXUS returns OSM results that may include non-free clinics. The affordability score attempts to filter these, but false positives are possible.</li>
          <li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Hours and availability:</strong> Clinic hours change frequently. While the platform displays hours when available from HRSA or OSM tags, these may be stale. Users should always call ahead to confirm hours and appointment availability.</li>
          <li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>NAFC completeness:</strong> The static NAFC database includes 130+ manually verified entries out of 1,200+ NAFC members. Clinics not in this database may still exist in users' areas. The NAFC member locator at nafc.org is recommended as a supplementary resource.</li>
          <li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Name-based affordability scoring:</strong> The scoring model is heuristic-based. A clinic named "Eastside Medical Center" with no affordability signals would score 40/100 (STANDARD) even if it is FQHC-affiliated. Scores should be interpreted as affordability probability indicators, not guarantees.</li>
          <li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Specialty classification accuracy:</strong> Specialty detection is name-pattern-based only. A community health center that offers dental care but does not include "dental" in its name will not surface in dental-filtered searches.</li>
        </ul>
      </section>

      {/* ── Section 9: Citing ── */}
      <section id="section-9" style={section}>
        <span style={{ ...pill, marginBottom: '12px' }}>Section 9</span>
        <h2 style={h2}>Citing NEXUS</h2>
        <p style={p}>
          If you use NEXUS data or methodology in academic work, presentations, or grant applications, please cite as follows:
        </p>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px 24px', fontFamily: 'monospace', fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, userSelect: 'text', marginBottom: '28px' }}>
          NEXUS Healthcare Platform. (2026). <em>Free and Affordable Clinic Finder: Methodology v2.0</em>. Retrieved from https://nexus.health/methodology
        </div>

        <div style={callout}>
          <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Data attribution:</strong> Clinic data sourced from HRSA (U.S. Dept. of Health and Human Services), NAFC (National Association of Free &amp; Charitable Clinics), and OpenStreetMap contributors (© OpenStreetMap contributors, ODbL 1.0). Program eligibility data based on 2024 Federal Poverty Level guidelines published by the U.S. Dept. of Health and Human Services.
        </div>

        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.7 }}>
          Questions about methodology? Reach out via the feedback form or contact the NEXUS research team. We welcome collaboration with public health researchers, academic institutions, and policy organizations studying healthcare access disparities.
        </p>
      </section>
    </AppShell>
  )
}
