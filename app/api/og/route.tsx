/**
 * D9 — Dynamic OG image generation via @vercel/og
 *
 * Usage:
 *   /api/og                         → Default app OG image
 *   /api/og?title=Free+Dental&sub=Phoenix+AZ   → Custom title/subtitle
 *   /api/og?clinic=Clinica+Adelante&city=Phoenix → Clinic card OG
 *   /api/og?page=triage              → Triage page OG
 *   /api/og?page=crisis              → Crisis page OG
 *
 * Add to any page's generateMetadata():
 *   openGraph: { images: [{ url: `${base}/api/og?title=...` }] }
 */

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

/* ── Design tokens (must be inline — edge runtime has no CSS) ── */
const BG    = '#050B16'
const BG2   = '#08090F'
const BG3   = '#0C0D18'
const ACC   = '#4A8FD4'
const ACC2  = '#7EB5E8'
const TEXT  = '#FFFFFF'
const TEXT2 = 'rgba(255,255,255,0.60)'
const TEXT3 = 'rgba(255,255,255,0.38)'

/* Page-specific config */
const PAGE_CONFIG: Record<string, { title: string; sub: string; accent: string }> = {
  triage:      { title: 'Symptom Guide',         sub: 'Describe symptoms → get care direction. Always free.',     accent: ACC  },
  crisis:      { title: 'Crisis Resources',       sub: 'Immediate help for mental health & medical emergencies.', accent: '#f87171' },
  programs:    { title: 'Programs & Benefits',    sub: 'Medicaid, CHIP, Ryan White, 340B, and more.',              accent: ACC  },
  search:      { title: 'Find Free Care',         sub: 'Search 18,000+ free clinics, FQHCs, and programs.',       accent: ACC  },
  eligibility: { title: 'Check Eligibility',      sub: 'Find programs you qualify for in under 60 seconds.',      accent: ACC2 },
  medications: { title: 'Medication Finder',      sub: 'GoodRx, NeedyMeds, PAPs, and 340B savings programs.',    accent: ACC  },
  impact:      { title: 'Our Impact',             sub: '18,900+ free and sliding-scale clinics, mapped and searchable.', accent: ACC  },
  equity:      { title: 'Health Equity Lab',      sub: 'Data-driven analysis of healthcare access disparities.',  accent: '#a78bfa' },
  pathways:    { title: 'Care Pathways',          sub: 'Step-by-step guides to finding the right care.',          accent: ACC  },
  rights:      { title: 'Know Your Rights',       sub: 'EMTALA, HIPAA, and your healthcare protections.',        accent: ACC  },
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const page    = searchParams.get('page') ?? ''
  const title   = searchParams.get('title') ?? ''
  const sub     = searchParams.get('sub') ?? ''
  const clinic  = searchParams.get('clinic') ?? ''
  const city    = searchParams.get('city') ?? ''

  /* Resolve display content */
  const cfg = PAGE_CONFIG[page] ?? null
  const displayTitle = clinic ? clinic : (title || cfg?.title || 'NEXUS')
  const displaySub   = city
    ? `Free healthcare in ${city} · No insurance required`
    : (sub || cfg?.sub || 'Free healthcare, found in seconds. No insurance required.')
  const accentColor = cfg?.accent ?? ACC

  /* Clinic card variant */
  const isClinic = Boolean(clinic)

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px', height: '630px',
          display: 'flex', flexDirection: 'column',
          background: BG,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* ── Background gradient ── */}
        <div style={{
          position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
          width: '900px', height: '600px', borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accentColor}22 0%, ${accentColor}08 40%, transparent 70%)`,
          filter: 'blur(80px)',
          display: 'flex',
        }} />

        {/* ── Grid lines ── */}
        <div style={{ position: 'absolute', width: '100%', height: '1px', background: `${accentColor}12`, top: '28%', display: 'flex' }} />
        <div style={{ position: 'absolute', width: '100%', height: '1px', background: `${accentColor}09`, bottom: '32%', display: 'flex' }} />
        <div style={{ position: 'absolute', width: '1px', height: '100%', background: `${accentColor}09`, left: '18%', display: 'flex' }} />
        <div style={{ position: 'absolute', width: '1px', height: '100%', background: `${accentColor}07`, right: '18%', display: 'flex' }} />

        {/* ── Content ── */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 72px', height: '100%',
          position: 'relative', zIndex: 1,
        }}>
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hexagon glyph */}
            <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
              <polygon points="10,1 18,5.5 18,14.5 10,19 2,14.5 2,5.5" stroke={accentColor} strokeWidth="1.4" fill={`${accentColor}14`}/>
              <path d="M6.5 13.5V6.5L10 13l3.5-6.5V13.5" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 400, letterSpacing: '0.42em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>
              NEXUS
            </span>
            {/* Free badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: `${accentColor}0F`, border: `1px solid ${accentColor}35`,
              borderRadius: '100px', padding: '4px 12px',
              fontSize: '11px', color: ACC2, fontWeight: 400, letterSpacing: '0.06em',
            }}>
              Free · Private · Always
            </div>
          </div>

          {/* Main headline block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
            {/* Pre-label (clinic city, page type) */}
            {(isClinic || page) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '14px', color: TEXT3, fontWeight: 400, letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: accentColor }} />
                {isClinic ? (city || 'Free Clinic') : (page.charAt(0).toUpperCase() + page.slice(1))}
              </div>
            )}

            {/* Title */}
            <div style={{
              fontSize: isClinic ? '52px' : '68px',
              fontWeight: 800,
              color: TEXT,
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
            }}>
              {displayTitle}
            </div>

            {/* Subtitle */}
            <div style={{
              fontSize: '22px', fontWeight: 300,
              color: TEXT2, lineHeight: 1.5,
              maxWidth: '700px',
            }}>
              {displaySub}
            </div>
          </div>

          {/* Bottom row — stats + domain */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {[
                { n: '284K+', label: 'Patients helped' },
                { n: '18K+',  label: 'Free clinics'    },
                { n: '50+',   label: 'States covered'  },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>{s.n}</div>
                  <div style={{ fontSize: '12px', color: TEXT3, fontWeight: 300 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Domain badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: BG2, border: `1px solid ${accentColor}22`,
              borderRadius: '10px', padding: '10px 18px',
              fontSize: '14px', color: TEXT2,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
                <rect width="11" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              nexus.health
            </div>
          </div>
        </div>

        {/* ── Accent border line at top ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: `linear-gradient(90deg, transparent, ${accentColor}, ${ACC2}, transparent)`,
        }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
