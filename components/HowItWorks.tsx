'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    num: '01',
    title: 'Search your location or symptom',
    body: "Enter your zip code, city, or describe what you're experiencing. Completely anonymous — no account required, ever.",
  },
  {
    num: '02',
    title: 'Get matched to the right care',
    body: 'Our AI surfaces the best options — free clinics, telehealth, eligibility programs — ranked by distance and fit.',
  },
  {
    num: '03',
    title: 'Book, call, or walk in',
    body: 'See live hours, wait times, and directions. Book directly or get turn-by-turn directions in your language.',
  },
]

function Panel0() {
  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '1rem', fontFamily: 'var(--font-inter)' }}>
        Describe what you&apos;re looking for
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'var(--bg3)', border: '1px solid rgba(109,145,151,0.18)',
        borderRadius: '12px', padding: '12px 16px', marginBottom: '1rem',
      }}>
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <span style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', flex: 1 }}>
          Primary care near me...
        </span>
        <span style={{ fontSize: '13px', color: 'var(--accent)', animation: 'cursor-blink 1s step-end infinite' }}>|</span>
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'rgba(109,145,151,0.07)', border: '1px solid rgba(109,145,151,0.16)',
        borderRadius: '8px', padding: '8px 12px',
        fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-inter)',
      }}>
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Anonymous — no account needed
      </div>
    </div>
  )
}

function Panel1() {
  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{
        background: 'var(--bg3)', border: '1px solid rgba(109,145,151,0.14)',
        borderRadius: '12px', padding: '1rem', marginBottom: '1rem',
        fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)',
        fontStyle: 'italic', lineHeight: 1.7,
      }}>
        &ldquo;I&apos;ve had a persistent cough for two weeks and mild fever...&rdquo;
      </div>
      <div style={{
        background: 'rgba(109,145,151,0.06)', border: '1px solid rgba(109,145,151,0.16)',
        borderRadius: '12px', padding: '1rem',
      }}>
        <div style={{
          fontSize: '11px', color: 'var(--accent)', fontWeight: 500,
          letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px',
          fontFamily: 'var(--font-inter)',
        }}>
          NEXUS recommends
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500, marginBottom: '4px', fontFamily: 'var(--font-inter)' }}>
          Free clinic visit — not an ER
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)' }}>
          Avg ER cost $1,500 vs $0 at a FQHC
        </div>
      </div>
    </div>
  )
}

function Panel2() {
  const router = useRouter()
  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        background: 'rgba(109,145,151,0.04)', border: '1px solid rgba(109,145,151,0.16)',
        borderRadius: '12px', padding: '14px', marginBottom: '1rem',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'var(--accent-dim)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 600, color: 'var(--accent)',
          fontFamily: 'var(--font-sora)', flexShrink: 0,
        }} aria-hidden="true">CA</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--font-inter)', marginBottom: '2px' }}>
            Clinica Adelante
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
            Open now · 1.2 mi · ~20 min wait
          </div>
        </div>
        <div style={{
          marginLeft: 'auto', fontSize: '10px', fontWeight: 500,
          background: 'rgba(109,145,151,0.12)', color: 'var(--accent)',
          borderRadius: '5px', padding: '3px 9px', fontFamily: 'var(--font-inter)',
          flexShrink: 0,
        }}>Open</div>
      </div>
      <button
        onClick={() => router.push('/pathways')}
        style={{
          width: '100%', background: 'var(--accent)', color: '#07070F',
          border: 'none', borderRadius: '10px', padding: '12px',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          fontFamily: 'var(--font-inter)', marginBottom: '10px',
          boxShadow: '0 4px 16px rgba(109,145,151,0.25)',
        }}>
        Book appointment →
      </button>
      <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
        Available in 48 languages
      </div>
    </div>
  )
}

const PANELS = [<Panel0 key={0} />, <Panel1 key={1} />, <Panel2 key={2} />]

export default function HowItWorks() {
  const [active, setActive]       = useState(0)
  const [panelKey, setPanelKey]   = useState(0)
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const barRef      = useRef<HTMLDivElement>(null)
  const sectionRef  = useRef<HTMLElement>(null)
  const stepsRef    = useRef<HTMLDivElement>(null)
  const panelRef    = useRef<HTMLDivElement>(null)

  const activateStep = (i: number) => {
    setActive(i)
    setPanelKey(k => k + 1)
    if (barRef.current) {
      barRef.current.style.transition = 'none'
      barRef.current.style.width = '0%'
      void barRef.current.offsetWidth
      barRef.current.style.transition = 'width 3.5s linear'
      barRef.current.style.width = '100%'
    }
  }

  const startCycle = () => {
    timerRef.current = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % STEPS.length
        activateStep(next)
        return next
      })
    }, 3500)
  }

  useEffect(() => {
    activateStep(0)
    startCycle()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger steps in from left
      gsap.from('.hiw-step', {
        x: -30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: stepsRef.current, start: 'top 80%' },
      })
      // Panel slides in from right
      gsap.from(panelRef.current, {
        x: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: stepsRef.current, start: 'top 80%' },
      })
      // Section header
      gsap.from('.hiw-header', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="how"
      aria-labelledby="how-title"
      style={{
        position: 'relative', zIndex: 2,
        maxWidth: '1200px', margin: '0 auto',
        padding: 'clamp(80px, 10vw, 120px) clamp(1.25rem, 4vw, 3rem)',
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(2rem, 5vw, 6rem)',
        alignItems: 'center',
      }}>

        {/* ── LEFT: steps ── */}
        <div>
          <div className="hiw-header" style={{ marginBottom: '2.5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '11px', fontWeight: 400, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--accent)',
              marginBottom: '1.25rem', fontFamily: 'var(--font-inter)',
            }}>
              <span style={{ display: 'inline-block', width: '16px', height: '1px', background: 'var(--accent)' }} aria-hidden="true" />
              How it works
            </div>
            <h2 id="how-title" style={{
              fontFamily: 'var(--font-sora)',
              fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
              fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}>
              Three steps to{' '}
              <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>real</em> care
            </h2>
            <p style={{
              fontSize: '15px', color: 'var(--text-2)', maxWidth: '440px',
              fontWeight: 300, lineHeight: 1.85, fontFamily: 'var(--font-inter)',
            }}>
              No account. No insurance card. No cost. Just type and go.
            </p>
          </div>

          <div ref={stepsRef} role="tablist" aria-label="How it works steps">
            {STEPS.map((s, i) => (
              <div
                key={s.num}
                className="hiw-step"
                role="tab"
                aria-selected={active === i}
                tabIndex={0}
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current)
                  activateStep(i)
                  startCycle()
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (timerRef.current) clearInterval(timerRef.current)
                    activateStep(i)
                    startCycle()
                  }
                }}
                style={{
                  display: 'grid', gridTemplateColumns: '48px 1fr',
                  gap: '1.25rem', padding: '1.5rem 0',
                  borderBottom: i < STEPS.length - 1 ? '1px solid var(--border2)' : 'none',
                  cursor: 'pointer',
                  opacity: active === i ? 1 : 0.55,
                  transition: 'opacity 0.3s',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '1.1rem', fontWeight: 400,
                  color: active === i ? 'var(--accent)' : 'var(--text-3)',
                  lineHeight: 1.2, transition: 'color 0.3s', paddingTop: '2px',
                  letterSpacing: '0.05em',
                }} aria-hidden="true">
                  {s.num}
                </div>
                <div>
                  <div style={{
                    fontSize: '15px', fontWeight: 500,
                    color: active === i ? 'var(--text)' : 'var(--text-2)',
                    transition: 'color 0.3s', fontFamily: 'var(--font-inter)',
                    marginBottom: 0,
                  }}>
                    {s.title}
                  </div>
                  <div style={{
                    fontSize: '13px', color: 'var(--text-3)',
                    lineHeight: 1.75, fontFamily: 'var(--font-inter)',
                    maxHeight: active === i ? '80px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.45s ease, margin-top 0.3s',
                    marginTop: active === i ? '0.5rem' : '0',
                  }}>
                    {s.body}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div aria-hidden="true" style={{
            height: '2px', background: 'var(--bg3)',
            borderRadius: '2px', marginTop: '1.5rem', overflow: 'hidden',
          }}>
            <div ref={barRef} style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
              borderRadius: '2px', width: '0%',
              boxShadow: '0 0 6px rgba(109,145,151,0.5)',
            }} />
          </div>
        </div>

        {/* ── RIGHT: dynamic panel ── */}
        <div ref={panelRef} style={{ position: 'relative' }}>
          {/* Ambient glow */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: '300px', height: '300px',
            background: 'radial-gradient(circle, rgba(109,145,151,0.08) 0%, transparent 65%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }} />

          <div style={{
            background: 'var(--bg2)',
            border: '1px solid rgba(109,145,151,0.14)',
            borderRadius: '24px', overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          }}>
            {/* Top accent line */}
            <div aria-hidden="true" style={{
              position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(109,145,151,0.35), transparent)',
            }} />

            <div style={{
              background: 'var(--bg3)', padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{
                fontSize: '11px', color: 'var(--text-3)',
                fontFamily: 'var(--font-inter)', letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {['Search', 'AI Triage', 'Book Care'][active]}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} aria-hidden="true" style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: i === active ? 'var(--accent)' : 'var(--bg4)',
                    border: '1px solid var(--border)',
                    transition: 'background 0.3s',
                    boxShadow: i === active ? '0 0 6px rgba(109,145,151,0.5)' : 'none',
                  }} />
                ))}
              </div>
            </div>

            <div key={panelKey} style={{ animation: 'panel-in 0.4s var(--ease-out-expo)' }}>
              {PANELS[active]}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes panel-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @media (max-width: 768px) {
          #how > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
