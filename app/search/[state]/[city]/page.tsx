/**
 * AXVO — City hub page
 * /search/[state]/[city] — e.g. /search/tx/houston
 *
 * WHY THIS EXISTS: per the SEO roadmap, a static page with real written
 * content and a real clinic list ranks far better for "free clinic in
 * [city]" than a query-param search result ever will. This is one of the
 * top-10 cities picked in lib/city-hubs.ts. Every number on this page is a
 * live count from the real clinics table -- unlike the old "City Guides"
 * section on /editorial, which had hardcoded, never-verified clinic counts
 * per city (fixed in the same batch as this page).
 */
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import JsonLd, { breadcrumbSchema } from '@/components/JsonLd'
import { findCityHub, CITY_HUBS } from '@/lib/city-hubs'
import { Location, Call, Global, TickCircle, ArrowRight2 } from 'iconsax-react'

export const revalidate = 86400 // Daily -- clinic data doesn't change hour to hour

export function generateStaticParams() {
  return CITY_HUBS.map(h => ({ state: h.stateSlug, city: h.citySlug }))
}

type ClinicRow = {
  source: string; source_id: string; name: string; type: string | null
  address: string | null; phone: string | null; website: string | null
  free: boolean | null; sliding_scale: boolean | null; affordability_score: number | null
  services: string[] | null
}

async function getClinics(city: string, state: string): Promise<ClinicRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  if (!url || !key) return []
  try {
    const supabase = createClient(url, key)
    const { data, error } = await supabase
      .from('clinics')
      .select('source, source_id, name, type, address, phone, website, free, sliding_scale, affordability_score, services')
      .ilike('city', city)
      .eq('state', state)
      .order('affordability_score', { ascending: false })
      .limit(30)
    if (error) { console.error('[city-hub] query failed:', error.message); return [] }
    return (data as ClinicRow[]) ?? []
  } catch (e) {
    console.error('[city-hub] unexpected error:', e)
    return []
  }
}

interface PageProps {
  params: Promise<{ state: string; city: string }>
}

export default async function CityHubPage({ params }: PageProps) {
  const { state, city } = await params
  const hub = findCityHub(state, city)
  if (!hub) notFound()

  const clinics = await getClinics(hub.city, hub.state)
  const freeCount = clinics.filter(c => c.free).length

  return (
    <AppShell>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', url: 'https://www.axvohealth.com' },
          { name: 'Search', url: 'https://www.axvohealth.com/search' },
          { name: `${hub.city}, ${hub.state}`, url: `https://www.axvohealth.com/search/${hub.stateSlug}/${hub.citySlug}` },
        ])}
        id="schema-breadcrumb-cityhub"
      />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '56px 24px 80px' }}>
        {/* Hero */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '12px' }}>
            {hub.stateName}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '16px', color: 'var(--text)' }}>
            Free Clinics in {hub.city}, {hub.state}
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: '640px', marginBottom: '20px' }}>
            {hub.context} AXVO indexes {clinics.length > 0 ? `${clinics.length}+` : ''} federally qualified health centers, free clinics, and sliding-scale providers serving {hub.city} — sourced from HRSA and public data, not invented.
          </p>
          <Link
            href={`/search?location=${encodeURIComponent(`${hub.city}, ${hub.state}`)}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '100px', background: 'var(--accent)', color: '#07070F', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}
          >
            Search all of {hub.city} <ArrowRight2 size={14} variant="Linear" />
          </Link>
        </div>

        {/* Real stats -- no invented numbers */}
        {clinics.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <div style={{ padding: '14px 20px', borderRadius: '12px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent)' }}>{clinics.length}+</div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Clinics indexed in {hub.city}</div>
            </div>
            {freeCount > 0 && (
              <div style={{ padding: '14px 20px', borderRadius: '12px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent)' }}>{freeCount}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Offer entirely free care</div>
              </div>
            )}
          </div>
        )}

        {/* Clinic list */}
        {clinics.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '48px' }}>
            {clinics.map(c => {
              const clinicId = `${c.source}-${c.source_id}`
              return (
                <div key={clinicId} style={{ padding: '20px 22px', borderRadius: '14px', background: 'var(--bg2)', border: '1px solid var(--border2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <Link href={`/clinics/${encodeURIComponent(clinicId)}`} style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>
                      {c.name}
                    </Link>
                    {c.free && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--accent)', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '100px', padding: '3px 10px' }}>
                        <TickCircle size={11} variant="Bold" /> Free care
                      </span>
                    )}
                  </div>
                  {c.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-3)', marginBottom: '4px' }}>
                      <Location size={13} variant="Linear" /> {c.address}, {hub.city}, {hub.state}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>
                        <Call size={13} variant="Linear" /> {c.phone}
                      </a>
                    )}
                    {c.website && (
                      <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>
                        <Global size={13} variant="Linear" /> Website
                      </a>
                    )}
                    <Link href={`/clinics/${encodeURIComponent(clinicId)}`} style={{ fontSize: '13px', color: 'var(--text-3)', textDecoration: 'none' }}>
                      Full details →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ padding: '32px', borderRadius: '14px', background: 'var(--bg2)', border: '1px solid var(--border)', textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>
              Live listings for {hub.city} are loading — use the full search below to find clinics near you right now.
            </p>
          </div>
        )}

        <p style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.6 }}>
          Not medical advice. Clinic details change — confirm hours, services, and eligibility directly with the clinic. Emergency? Call 911.
        </p>
      </div>
    </AppShell>
  )
}
