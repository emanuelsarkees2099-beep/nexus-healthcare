'use client'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'iconsax-react'

function useCountUp(target: number, decimals = 0, enabled = false, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!enabled) return
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [enabled, target, decimals, duration])
  return value
}

const METRICS = [
  {
    label:  'Calls to find a clinic',
    before: { value: 14,   unit: 'calls', decimals: 0, prefix: '' },
    after:  { value: 1.2,  unit: 'calls', decimals: 1, prefix: '' },
    badge:  '12× fewer',
  },
  {
    label:  'Time to appointment',
    before: { value: 6,    unit: 'days',  decimals: 0, prefix: '' },
    after:  { value: 4,    unit: 'hrs',   decimals: 0, prefix: '' },
    badge:  '36× faster',
  },
  {
    label:  'Out-of-pocket cost',
    before: { value: 1847, unit: '',      decimals: 0, prefix: '$' },
    after:  { value: 0,    unit: 'to $40',decimals: 0, prefix: '$' },
    badge:  '98% less',
  },
  {
    label:  'Patients who found care',
    before: { value: 34,   unit: '%',     decimals: 0, prefix: '' },
    after:  { value: 91,   unit: '%',     decimals: 0, prefix: '' },
    badge:  '2.7× more',
  },
]

function MetricCard({
  label, before, after, badge, side, enabled, index,
}: (typeof METRICS)[0] & { side: 'before' | 'after'; enabled: boolean; index: number }) {
  const data     = side === 'before' ? before : after
  const cnt      = useCountUp(data.value, data.decimals, enabled, 1200 + index * 120)
  const num      = data.decimals === 0 ? Math.floor(cnt).toLocaleString() : cnt.toFixed(data.decimals)
  const isBefore = side === 'before'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: 'clamp(16px, 2vw, 22px) clamp(18px, 2.5vw, 28px)',
      background: isBefore ? 'rgba(248,113,113,0.04)' : 'rgba(79,142,240,0.05)',
      border: `1px solid ${isBefore ? 'rgba(248,113,113,0.12)' : 'rgba(79,142,240,0.14)'}`,
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Corner glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0,
        width: '120px', height: '80px',
        background: isBefore
          ? 'radial-gradient(ellipse at 0% 0%, rgba(248,113,113,0.09) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at 0% 0%, rgba(79,142,240,0.11) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Badge on after cards */}
      {!isBefore && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'rgba(79,142,240,0.12)',
          border: '1px solid rgba(79,142,240,0.22)',
          borderRadius: '100px', padding: '3px 10px',
          fontSize: '10px', fontWeight: 700, color: 'var(--accent)',
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}>
          ↑ {badge}
        </div>
      )}

      {/* Big number */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        color: isBefore ? 'rgba(248,113,113,0.65)' : 'var(--accent)',
        textDecoration: isBefore ? 'line-through' : 'none',
        textDecorationColor: 'rgba(248,113,113,0.32)',
      }}>
        {data.prefix}{num}{data.unit === '%' ? '%' : ''}
        {data.unit && data.unit !== '%' && data.unit !== '' && !data.unit.startsWith('to') && (
          <span style={{
            fontSize: '0.42em', fontWeight: 400, marginLeft: '6px',
            color: isBefore ? 'rgba(248,113,113,0.40)' : 'rgba(79,142,240,0.55)',
            letterSpacing: 0,
          }}>
            {data.unit}
          </span>
        )}
        {data.unit.startsWith('to') && (
          <span style={{
            fontSize: '0.38em', fontWeight: 400, marginLeft: '6px',
            color: 'rgba(79,142,240,0.55)',
            letterSpacing: 0,
          }}>
            {data.unit}
          </span>
        )}
      </div>

      {/* Label */}
      <div style={{
        fontSize: '12px',
        color: isBefore ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.44)',
        fontFamily: 'var(--font-inter)',
        fontWeight: 400,
        letterSpacing: '-0.005em',
        marginTop: '4px',
      }}>
        {label}
      </div>
    </div>
  )
}

export default function BeforeAfterBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      aria-label="Before and after NEXUS comparison"
      style={{
        position: 'relative',
        zIndex: 2,
        padding: 'clamp(80px, 8vw, 120px) 0',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(79,142,240,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(20px, 4vw, 48px)' }}>

        {/* Eyebrow */}
        <div style={{
          textAlign: 'center', marginBottom: '0.75rem',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            fontFamily: 'var(--font-inter)',
          }}>
            <span style={{ width: '22px', height: '1px', background: 'rgba(255,255,255,0.16)', display: 'inline-block' }} />
            Impact metrics
            <span style={{ width: '22px', height: '1px', background: 'rgba(255,255,255,0.16)', display: 'inline-block' }} />
          </div>
        </div>

        {/* Headline */}
        <h2 style={{
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.0,
          marginBottom: 'clamp(44px, 6vw, 80px)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.08s',
        }}>
          The{' '}
          <span style={{
            background: 'linear-gradient(90deg, #4F8EF0 0%, #a78bfa 50%, #4F8EF0 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: visible ? 'text-shimmer 4s linear infinite' : 'none',
          }}>
            transformation
          </span>
        </h2>

        {/* 3-column layout: Before | Divider | After */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 56px 1fr',
          gap: '0',
          alignItems: 'start',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: 'all 0.75s cubic-bezier(0.16,1,0.3,1) 0.18s',
        }}>

          {/* BEFORE column */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '16px', paddingBottom: '14px',
              borderBottom: '1px solid rgba(248,113,113,0.14)',
            }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: 'rgba(248,113,113,0.55)',
                boxShadow: '0 0 8px rgba(248,113,113,0.35)',
              }} />
              <span style={{
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.10em',
                textTransform: 'uppercase', color: 'rgba(248,113,113,0.55)',
                fontFamily: 'var(--font-inter)',
              }}>
                Before NEXUS
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {METRICS.map((m, i) => (
                <MetricCard key={i} {...m} side="before" enabled={visible} index={i} />
              ))}
            </div>
          </div>

          {/* CENTER divider */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative', alignSelf: 'stretch',
          }}>
            {/* Vertical glow line */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: '50%', transform: 'translateX(-50%)',
              width: '1px',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(79,142,240,0.35) 15%, rgba(79,142,240,0.35) 85%, transparent 100%)',
            }} />
            {/* Line bloom */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px', height: '280px',
              background: 'radial-gradient(ellipse, rgba(79,142,240,0.08) 0%, transparent 65%)',
              filter: 'blur(18px)', pointerEvents: 'none',
            }} />
            {/* Arrow badges */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '0',
              alignItems: 'center', position: 'relative', zIndex: 1,
              paddingTop: '52px',
            }}>
              {METRICS.map((_, i) => (
                <div key={i} style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'rgba(79,142,240,0.08)',
                  border: '1px solid rgba(79,142,240,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: i < METRICS.length - 1 ? 'calc(10px + clamp(16px, 2vw, 22px) + 10px + 16px)' : '0',
                }}>
                  <ArrowRight size={14} color="rgba(79,142,240,0.65)" variant="Linear" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>

          {/* AFTER column */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '16px', paddingBottom: '14px',
              borderBottom: '1px solid rgba(79,142,240,0.18)',
            }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 12px rgba(79,142,240,0.55)',
                animation: 'pulse-dot 1.8s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.10em',
                textTransform: 'uppercase', color: 'var(--accent)',
                fontFamily: 'var(--font-inter)',
              }}>
                With NEXUS
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {METRICS.map((m, i) => (
                <MetricCard key={i} {...m} side="after" enabled={visible} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p style={{
          textAlign: 'center', marginTop: '36px',
          fontSize: '11px', color: 'rgba(255,255,255,0.15)',
          fontFamily: 'var(--font-inter)', lineHeight: 1.5,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.6s ease 0.55s',
        }}>
          Based on internal platform data and published research on uninsured patient care-seeking behavior.
        </p>
      </div>

      <style>{`
        @media (max-width: 680px) {
          section[aria-label="Before and after NEXUS comparison"] > div > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
