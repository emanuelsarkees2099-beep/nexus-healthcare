'use client'
import React, { useState, useEffect, useCallback } from 'react'
import AppShell from '@/components/AppShell'
import JsonLd, { medicalPageSchema, breadcrumbSchema } from '@/components/JsonLd'
import Link from 'next/link'
import { Call, Location, Heart, Danger, ArrowRight2, Clock, Routing, TickCircle, AddCircle, DocumentDownload, Shield } from 'iconsax-react'
import QuickExit from '@/components/QuickExit'
import DotGrid from '@/components/DotGrid'

const SAFETY_KEY = 'nexus_safety_plan'

type SafetySection = {
  id: string
  title: string
  placeholder: string
  items: string[]
}

const DEFAULT_PLAN: SafetySection[] = [
  { id: 'warning', title: '1. My warning signs', placeholder: 'What thoughts, feelings, or behaviors mean a crisis might be coming?', items: [] },
  { id: 'internal', title: '2. Internal coping strategies', placeholder: 'Things I can do on my own to take my mind off problems (walk, music, distraction)…', items: [] },
  { id: 'social', title: '3. People & places that provide distraction', placeholder: 'People I can call to talk about something other than the crisis…', items: [] },
  { id: 'help', title: '4. People I can ask for help', placeholder: 'Name and phone number of someone who can support me…', items: [] },
  { id: 'professionals', title: '5. Professionals & agencies to contact', placeholder: 'Therapist, crisis line, emergency services, clinic…', items: [] },
  { id: 'environment', title: '6. Making my environment safe', placeholder: 'Steps to reduce access to means (medications, firearms, other)…', items: [] },
]

const CRISIS_RESOURCES = [
  {
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    desc: 'Call or text 988. Available 24/7, free, confidential.',
    type: 'mental',
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.08)',
    border: 'rgba(129,140,248,0.25)',
  },
  {
    name: 'Crisis Text Line',
    number: 'Text HOME to 741741',
    desc: 'Text HOME to 741741. Real crisis counselors, 24/7.',
    type: 'mental',
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.08)',
    border: 'rgba(129,140,248,0.25)',
  },
  {
    name: '911 Emergency',
    number: '911',
    desc: 'Call 911 for life-threatening emergencies.',
    type: 'emergency',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.3)',
  },
  {
    name: 'Poison Control',
    number: '1-800-222-1222',
    desc: 'Poisoning, overdose, drug reactions. Free, 24/7.',
    type: 'medical',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.25)',
  },
  {
    name: 'Domestic Violence Hotline',
    number: '1-800-799-7233',
    desc: 'Call or text. Chat at thehotline.org. 24/7.',
    type: 'safety',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.25)',
  },
  {
    name: 'SAMHSA Treatment Locator',
    number: '1-800-662-4357',
    desc: 'Substance use treatment. Free, confidential, 24/7.',
    type: 'substance',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.25)',
  },
]

const NEARBY_ER = [
  { name: 'Banner University Medical Center', dist: '0.6 mi', wait: '~18 min', open: true },
  { name: 'St. Joseph\'s Hospital', dist: '1.4 mi', wait: '~31 min', open: true },
  { name: 'Valleywise Health Medical Center', dist: '2.1 mi', wait: '~24 min', open: true },
]

const RESPONSE_TIMES: Record<string, string> = {
  '988 Suicide & Crisis Lifeline': '< 2 min avg',
  'Crisis Text Line': '< 5 min avg',
  '911 Emergency': 'Immediate',
  'Poison Control': 'Immediate',
  'Domestic Violence Hotline': '< 3 min avg',
  'SAMHSA Treatment Locator': 'Same-day referral',
}

const NEARBY_MH = [
  { name: 'Valle del Sol Behavioral Health', dist: '0.9 mi', hours: 'Open until 8pm', open: true },
  { name: 'Terros Health Crisis Center', dist: '1.8 mi', hours: '24/7 walk-in', open: true },
]

function PulsingDot({ color }: { color: string }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: '10px', height: '10px' }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: color, opacity: 0.4,
        animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
      }} />
      <span style={{ position: 'relative', display: 'inline-flex', width: '10px', height: '10px', borderRadius: '50%', background: color }} />
    </span>
  )
}

type GeoState = {
  loading: boolean
  lat: number | null
  lon: number | null
  location: string | null  // "City, State"
  denied: boolean
}

export default function CrisisPage() {
  const [breathePhase, setBreathePhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [breatheCount, setBreatheCount] = useState(0)
  const [showBreathe, setShowBreathe] = useState(false)

  /* ── Safety planning tool ── */
  const [showSafetyPlan, setShowSafetyPlan] = useState(false)
  const [plan, setPlan] = useState<SafetySection[]>(() => {
    try {
      if (typeof window === 'undefined') return DEFAULT_PLAN
      const raw = localStorage.getItem(SAFETY_KEY)
      return raw ? JSON.parse(raw) as SafetySection[] : DEFAULT_PLAN
    } catch { return DEFAULT_PLAN }
  })
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [planSaved, setPlanSaved] = useState(false)

  const addItem = useCallback((sectionId: string) => {
    const text = (inputs[sectionId] ?? '').trim()
    if (!text) return
    setPlan(prev => prev.map(s => s.id === sectionId ? { ...s, items: [...s.items, text] } : s))
    setInputs(prev => ({ ...prev, [sectionId]: '' }))
  }, [inputs])

  const removeItem = useCallback((sectionId: string, idx: number) => {
    setPlan(prev => prev.map(s => s.id === sectionId ? { ...s, items: s.items.filter((_, i) => i !== idx) } : s))
  }, [])

  const savePlan = useCallback(() => {
    try { localStorage.setItem(SAFETY_KEY, JSON.stringify(plan)) } catch { /* ignore */ }
    setPlanSaved(true)
    setTimeout(() => setPlanSaved(false), 2500)
  }, [plan])

  /* ── GPS-based nearest center detection ── */
  const [geo, setGeo] = useState<GeoState>({ loading: false, lat: null, lon: null, location: null, denied: false })

  useEffect(() => {
    if (!navigator.geolocation) return
    setGeo(g => ({ ...g, loading: true }))
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        try {
          const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`)
          const data = await res.json()
          const location = data.city && data.state ? `${data.city}, ${data.state}` : null
          setGeo({ loading: false, lat, lon, location, denied: false })
        } catch {
          setGeo({ loading: false, lat, lon, location: null, denied: false })
        }
      },
      () => setGeo({ loading: false, lat: null, lon: null, location: null, denied: true }),
      { timeout: 8000, enableHighAccuracy: false }
    )
  }, [])

  useEffect(() => {
    if (!showBreathe) return
    const phases: Array<{ phase: 'inhale' | 'hold' | 'exhale'; dur: number }> = [
      { phase: 'inhale', dur: 4000 },
      { phase: 'hold', dur: 4000 },
      { phase: 'exhale', dur: 6000 },
    ]
    let i = 0
    const tick = () => {
      setBreathePhase(phases[i % 3].phase)
      setBreatheCount(c => c + 1)
      return phases[i++ % 3].dur
    }
    const run = () => {
      const dur = tick()
      const t = setTimeout(run, dur)
      return t
    }
    const t = run()
    return () => clearTimeout(t)
  }, [showBreathe])

  const circleScale = breathePhase === 'inhale' ? 1.3 : breathePhase === 'hold' ? 1.3 : 1

  return (
    <AppShell>
      <QuickExit />
      {/* 5.9 — Structured Data */}
      <JsonLd
        schema={medicalPageSchema(
          'Crisis & Emergency Resources — NEXUS',
          'Immediate help for mental health crises, domestic violence, substance abuse, and medical emergencies. Free hotlines, chat, and local resources.',
          'https://nexus.health/crisis',
        )}
        id="schema-medical-crisis"
      />
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home',   url: 'https://nexus.health' },
          { name: 'Crisis', url: 'https://nexus.health/crisis' },
        ])}
        id="schema-breadcrumb-crisis"
      />
      <style>{`
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes breathe-pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .crisis-call-btn:hover { transform: scale(1.03) !important; }
        .crisis-resource:hover { border-color: rgba(255,255,255,0.2) !important; background: rgba(255,255,255,0.04) !important; }
        @media (max-width: 768px) {
          .crisis-resources-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>

      {/* Hero — stark, immediate */}
      <section style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '80px 24px 60px', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 50% 10%, rgba(248,113,113,0.06) 0%, transparent 70%)',
      }}>
        <DotGrid opacity={0.35} />
        {/* Ambient red ring */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          border: '1px solid rgba(248,113,113,0.08)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '400px', height: '400px', borderRadius: '50%',
          border: '1px solid rgba(248,113,113,0.12)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', borderRadius: '100px',
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          marginBottom: '32px', fontSize: '12px', fontWeight: 600,
          color: '#f87171', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          <PulsingDot color="#f87171" />
          Crisis Support
        </div>

        <h1 style={{
          fontSize: 'clamp(38px, 7vw, 76px)', fontWeight: 900,
          letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '24px',
          maxWidth: '680px',
        }}>
          Real help,<br />
          <span style={{ color: '#f87171' }}>right now.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.55)',
          maxWidth: '480px', lineHeight: 1.7, marginBottom: '48px',
        }}>
          Whatever you&apos;re going through — health crisis, mental health emergency, or just feeling overwhelmed — real support is available right now, free, no insurance needed.
        </p>

        {/* BIG 988 BUTTON */}
        <a
          href="tel:988"
          className="crisis-call-btn"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '14px',
            width: 'auto', maxWidth: '100%',
            padding: '22px 44px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #dc2626, #f87171)',
            color: '#fff', fontSize: '22px', fontWeight: 800,
            textDecoration: 'none', letterSpacing: '-0.01em',
            boxShadow: '0 0 60px rgba(248,113,113,0.35), 0 20px 40px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1)',
          }}
          aria-label="Call 988 Crisis Lifeline"
        >
          <Call size={24} fill="white" />
          Call 988 Now
        </a>

        <p style={{ marginTop: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em' }}>
          Suicide &amp; Crisis Lifeline · Free · Confidential · 24/7
        </p>

        {/* Breathing exercise */}
        <div style={{ marginTop: '48px' }}>
          {!showBreathe ? (
            <button
              onClick={() => setShowBreathe(true)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '12px 20px', color: 'rgba(255,255,255,0.5)',
                fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}
            >
              <Heart size={14} color="rgba(255,255,255,0.5)" /> Start guided breathing exercise
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(129,140,248,0.3), rgba(129,140,248,0.05))',
                border: '2px solid rgba(129,140,248,0.4)',
                transform: `scale(${circleScale})`,
                transition: `transform ${breathePhase === 'inhale' ? 4 : breathePhase === 'hold' ? 0.1 : 6}s ease-in-out`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '13px', color: 'rgba(129,140,248,0.9)', fontWeight: 500 }}>
                  {breathePhase === 'inhale' ? 'Breathe in…' : breathePhase === 'hold' ? 'Hold…' : 'Breathe out…'}
                </span>
              </div>
              <button
                onClick={() => setShowBreathe(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Stop exercise
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Crisis Resources Grid */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.025em',
            marginBottom: '8px', textAlign: 'center',
          }}>
            All crisis resources
          </h2>
          <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '36px' }}>
            Every number below is free, confidential, and available 24/7
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
          }}>
            {CRISIS_RESOURCES.map(r => (
              <a
                key={r.name}
                href={r.number.startsWith('1-') || r.number === '988' || r.number === '911' ? `tel:${r.number.replace(/-/g, '')}` : '#'}
                className="crisis-resource"
                style={{
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  padding: '20px 22px', borderRadius: '16px',
                  background: r.bg, border: `1px solid ${r.border}`,
                  textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: r.color, letterSpacing: '0.01em' }}>
                    {r.name}
                  </span>
                  <Call size={14} color={r.color} style={{ flexShrink: 0, marginTop: '1px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.01em' }}>
                    {r.number}
                  </div>
                  {RESPONSE_TIMES[r.name] && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 700, color: r.color, opacity: 0.85, background: `${r.bg}`, border: `1px solid ${r.border}`, padding: '1px 7px', borderRadius: '100px' }}>
                      <Clock size={9} color="currentColor" /> {RESPONSE_TIMES[r.name]}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  {r.desc}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Nearest Centers — GPS-aware */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Location detection banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 18px', borderRadius: '12px', marginBottom: '28px',
            background: geo.loading
              ? 'rgba(255,255,255,0.03)'
              : geo.location
              ? 'rgba(74,144,217,0.05)'
              : 'rgba(255,255,255,0.02)',
            border: `1px solid ${geo.location ? 'rgba(74,144,217,0.15)' : 'rgba(255,255,255,0.07)'}`,
          }}>
            {geo.loading ? (
              <>
                <Routing size={13} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0, animation: 'spin 1.5s linear infinite' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)' }}>
                  Detecting your location to find nearest centers…
                </span>
              </>
            ) : geo.location ? (
              <>
                <Routing size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)' }}>
                  Your location: <strong style={{ color: '#eef4f5' }}>{geo.location}</strong>
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a
                    href={`https://findtreatment.gov/locator?lat=${geo.lat}&lng=${geo.lon}&sType=4&distance=25`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ padding: '5px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', color: '#818cf8', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    SAMHSA Treatment Locator →
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/mental+health+crisis+center/@${geo.lat},${geo.lon},13z`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ padding: '5px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)', color: 'var(--accent)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    Maps: Crisis centers →
                  </a>
                </div>
              </>
            ) : geo.denied ? (
              <>
                <Routing size={13} color="rgba(255,255,255,0.25)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)' }}>
                  Location access denied. Showing general resources.{' '}
                  <a href="https://findtreatment.gov" target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                    Search SAMHSA Locator →
                  </a>
                </span>
              </>
            ) : (
              <>
                <Routing size={13} color="rgba(255,255,255,0.25)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)' }}>
                  Allow location access above to find the 3 nearest in-person crisis centers.{' '}
                  <a href="https://www.211.org" target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                    Or dial 211 →
                  </a>
                </span>
              </>
            )}
          </div>

          <div className="crisis-resources-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Emergency Rooms */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Danger size={15} color="#f87171" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Nearest Emergency Rooms</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {geo.lat ? (
                  /* GPS available — link to real map search */
                  <a
                    href={`https://www.google.com/maps/search/emergency+room/@${geo.lat},${geo.lon},13z`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      padding: '18px 20px', borderRadius: '14px',
                      background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.18)',
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px',
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Location size={16} color="#f87171" />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f5f5f5', marginBottom: '3px' }}>Emergency Rooms Near You</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                        {geo.location ? `Search near ${geo.location}` : 'Open Google Maps'} · All ERs must treat you (EMTALA)
                      </div>
                    </div>
                  </a>
                ) : (
                  NEARBY_ER.map(er => (
                    <div key={er.name} style={{
                      padding: '16px 18px', borderRadius: '12px',
                      background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)',
                      display: 'flex', flexDirection: 'column', gap: '6px',
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f5f5f5' }}>{er.name}</div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Routing size={14} color="rgba(255,255,255,0.45)" /> {er.dist}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} color="rgba(255,255,255,0.45)" /> {er.wait} wait</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><PulsingDot color="#60a5fa" /> Open now</span>
                      </div>
                    </div>
                  ))
                )}
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: '4px 0 0', lineHeight: 1.5 }}>
                  All ERs are required by federal law (EMTALA) to stabilize emergencies regardless of insurance.
                </p>
              </div>
            </div>

            {/* Mental Health Walk-ins */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Heart size={15} color="#818cf8" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Mental Health Walk-ins</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {geo.lat ? (
                  /* GPS available — link to SAMHSA + map */
                  <>
                    <a
                      href={`https://findtreatment.gov/locator?lat=${geo.lat}&lng=${geo.lon}&sType=4&distance=25`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        padding: '18px 20px', borderRadius: '14px',
                        background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.18)',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px',
                      }}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Heart size={16} color="#818cf8" />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#f5f5f5', marginBottom: '3px' }}>SAMHSA Mental Health Locator</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                          {geo.location ? `Crisis centers near ${geo.location}` : 'Find in-person crisis centers'} · Free · No insurance
                        </div>
                      </div>
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/mental+health+crisis+center/@${geo.lat},${geo.lon},13z`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        padding: '14px 18px', borderRadius: '12px',
                        background: 'rgba(129,140,248,0.02)', border: '1px solid rgba(129,140,248,0.12)',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px',
                        fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)',
                      }}
                    >
                      <Location size={13} color="#818cf8" />
                      Also search Google Maps for crisis centers near you →
                    </a>
                  </>
                ) : (
                  NEARBY_MH.map(mh => (
                    <div key={mh.name} style={{
                      padding: '16px 18px', borderRadius: '12px',
                      background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.15)',
                      display: 'flex', flexDirection: 'column', gap: '6px',
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f5f5f5' }}>{mh.name}</div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Routing size={14} color="rgba(255,255,255,0.45)" /> {mh.dist}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} color="rgba(255,255,255,0.45)" /> {mh.hours}</span>
                      </div>
                    </div>
                  ))
                )}
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: '4px 0 0', lineHeight: 1.5 }}>
                  Text <strong>HOME to 741741</strong> (Crisis Text Line) for 24/7 support while you locate in-person care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Safety Planning Tool (Stanley-Brown SPI) ───────────────────── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            borderRadius: 20,
            background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.16)',
            overflow: 'hidden',
          }}>
            {/* Header — toggle */}
            <button
              onClick={() => setShowSafetyPlan(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '24px 28px', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: 'rgba(129,140,248,0.10)', border: '1px solid rgba(129,140,248,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={18} color="#818cf8" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
                  Personal Safety Plan
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                  Based on the Stanley-Brown Safety Planning Intervention · Saved privately on your device
                </div>
              </div>
              <ArrowRight2
                size={14} color="rgba(255,255,255,0.3)"
                style={{ transform: showSafetyPlan ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
              />
            </button>

            {showSafetyPlan && (
              <div style={{ padding: '0 28px 28px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: '20px 0 24px' }}>
                  A safety plan is a prioritized list of coping strategies and sources of support you can use during a crisis. Fill in as much or as little as you&apos;re comfortable with. It saves automatically to your device — no account needed.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {plan.map((section) => (
                    <div key={section.id} style={{
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                      padding: '18px 20px',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(129,140,248,0.9)', marginBottom: 12 }}>
                        {section.title}
                      </div>

                      {/* Existing items */}
                      {section.items.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                          {section.items.map((item, idx) => (
                            <div key={idx} style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '8px 12px', borderRadius: 8,
                              background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.14)',
                            }}>
                              <TickCircle size={13} color="rgba(129,140,248,0.7)" variant="Bold" style={{ flexShrink: 0 }} />
                              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>{item}</span>
                              <button
                                onClick={() => removeItem(section.id, idx)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'rgba(255,255,255,0.25)', fontFamily: 'inherit', fontSize: 13, lineHeight: 1 }}
                                aria-label="Remove item"
                              >×</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add item input */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={inputs[section.id] ?? ''}
                          onChange={e => setInputs(prev => ({ ...prev, [section.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') addItem(section.id) }}
                          placeholder={section.placeholder}
                          style={{
                            flex: 1, padding: '9px 12px', borderRadius: 8,
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                            color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
                          }}
                        />
                        <button
                          onClick={() => addItem(section.id)}
                          style={{
                            padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: 'rgba(129,140,248,0.12)', color: 'rgba(129,140,248,0.9)',
                            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
                            fontFamily: 'inherit',
                          }}
                          aria-label="Add item"
                        >
                          <AddCircle size={14} color="currentColor" /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
                  <button
                    onClick={savePlan}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '11px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: planSaved ? 'rgba(52,211,153,0.12)' : 'rgba(129,140,248,0.15)',
                      color: planSaved ? '#34d399' : 'rgba(129,140,248,0.95)',
                      fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                      transition: 'all 0.2s',
                    }}
                  >
                    {planSaved
                      ? <><TickCircle size={14} color="currentColor" variant="Bold" /> Saved!</>
                      : <><DocumentDownload size={14} color="currentColor" /> Save my plan</>
                    }
                  </button>
                  <button
                    onClick={() => window.print()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '11px 20px', borderRadius: 10, border: '1px solid rgba(129,140,248,0.2)', cursor: 'pointer',
                      background: 'transparent', color: 'rgba(129,140,248,0.7)',
                      fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(129,140,248,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(129,140,248,0.95)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(129,140,248,0.7)' }}
                  >
                    <DocumentDownload size={14} color="currentColor" /> Print / Save PDF
                  </button>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 'auto 0', lineHeight: 1.5 }}>
                    Stored only on this device. Share with your care team at your next appointment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 24-hour check-in */}
      <section style={{ padding: '0 24px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 28px', borderRadius: 20, background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.18)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(129,140,248,0.10)', border: '1px solid rgba(129,140,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={20} color="#818cf8" />
          </div>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Plan to check in within 24 hours</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
              Research shows that one follow-up contact within 24 hours significantly reduces crisis risk. Reach out to a trusted person, your therapist, or one of our CHW navigators — free, no insurance needed.
            </div>
          </div>
          <Link href="/chw" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.28)', color: '#818cf8', fontSize: 13, fontWeight: 700, textDecoration: 'none', flexShrink: 0, fontFamily: 'inherit' }}>
            Connect with a CHW <ArrowRight2 size={13} color="currentColor" />
          </Link>
        </div>
      </section>

      {/* You are not alone message */}
      <section style={{ padding: '0 24px 120px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            padding: '40px', borderRadius: '24px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <Heart size={24} color="#f87171" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
              You deserve care. You always have.
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: '24px' }}>
              The fact that you&apos;re looking for help is an act of courage. NEXUS exists because healthcare should be available to everyone, in their hardest moments, without barriers.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/search" style={{
                padding: '10px 22px', borderRadius: '100px',
                background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.25)',
                color: 'var(--accent)', fontSize: '13px', fontWeight: 600,
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <Location size={13} /> Find a free clinic near me
              </Link>
              <Link href="/chw" style={{
                padding: '10px 22px', borderRadius: '100px',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 400,
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                Talk to a CHW navigator
              </Link>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
