'use client'
import React, { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import JsonLd, { medicalPageSchema, breadcrumbSchema } from '@/components/JsonLd'
import Link from 'next/link'
import { Phone, MapPin, Heart, AlertTriangle, ChevronRight, Clock, Navigation, Mic } from 'lucide-react'

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

export default function CrisisPage() {
  const [breathePhase, setBreathePhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [breatheCount, setBreatheCount] = useState(0)
  const [showBreathe, setShowBreathe] = useState(false)

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
        .crisis-call-btn:hover { transform: scale(1.03) !important; }
        .crisis-resource:hover { border-color: rgba(255,255,255,0.2) !important; background: rgba(255,255,255,0.04) !important; }
      `}</style>

      {/* Hero — stark, immediate */}
      <section style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '80px 24px 60px', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 50% 10%, rgba(248,113,113,0.06) 0%, transparent 70%)',
      }}>
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
          letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: '24px',
          maxWidth: '700px',
        }}>
          You&apos;re not alone.<br />
          <span style={{ color: '#f87171' }}>Help is one call away.</span>
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
            display: 'inline-flex', alignItems: 'center', gap: '14px',
            padding: '22px 44px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #dc2626, #f87171)',
            color: '#fff', fontSize: '22px', fontWeight: 800,
            textDecoration: 'none', letterSpacing: '-0.01em',
            boxShadow: '0 0 60px rgba(248,113,113,0.35), 0 20px 40px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1)',
          }}
          aria-label="Call 988 Crisis Lifeline"
        >
          <Phone size={24} fill="white" />
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
              <Heart size={14} /> Start guided breathing exercise
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
                  <Phone size={14} color={r.color} style={{ flexShrink: 0, marginTop: '1px' }} />
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.01em' }}>
                  {r.number}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  {r.desc}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Nearest ERs */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px',
          }}>
            {/* Emergency Rooms */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(248,113,113,0.1)',
                  border: '1px solid rgba(248,113,113,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertTriangle size={15} color="#f87171" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Nearest Emergency Rooms</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {NEARBY_ER.map(er => (
                  <div key={er.name} style={{
                    padding: '16px 18px', borderRadius: '12px',
                    background: 'rgba(248,113,113,0.04)',
                    border: '1px solid rgba(248,113,113,0.15)',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f5f5f5' }}>{er.name}</div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Navigation size={10} /> {er.dist}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {er.wait} wait
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PulsingDot color="#60a5fa" /> Open now
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mental Health Walk-ins */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(129,140,248,0.1)',
                  border: '1px solid rgba(129,140,248,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Heart size={15} color="#818cf8" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Mental Health Walk-ins</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {NEARBY_MH.map(mh => (
                  <div key={mh.name} style={{
                    padding: '16px 18px', borderRadius: '12px',
                    background: 'rgba(129,140,248,0.04)',
                    border: '1px solid rgba(129,140,248,0.15)',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f5f5f5' }}>{mh.name}</div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Navigation size={10} /> {mh.dist}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {mh.hours}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                <MapPin size={13} /> Find a free clinic near me
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
