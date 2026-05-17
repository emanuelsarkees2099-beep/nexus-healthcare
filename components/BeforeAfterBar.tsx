'use client'
import { useEffect, useRef, useState } from 'react'

/* ── Animated counter hook ── */
function useCountUp(target: number, decimals = 0, enabled = false, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!enabled) return
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [enabled, target, decimals, duration])
  return value
}

const BEFORE = [
  { label: 'Calls to find a clinic',          value: 14,    unit: 'calls',  decimals: 0 },
  { label: 'Days to get an appointment',       value: 6,     unit: 'days',   decimals: 0 },
  { label: 'Avg. out-of-pocket cost',          value: 1847,  unit: '$',      decimals: 0, prefix: '$' },
  { label: 'Patients who found care',          value: 34,    unit: '%',      decimals: 0 },
]

const AFTER = [
  { label: 'Calls to find a clinic',          value: 1.2,   unit: 'calls',  decimals: 1, improvement: '12×' },
  { label: 'Time to get an appointment',      value: 4,     unit: 'hours',  decimals: 0, improvement: '36×' },
  { label: 'Cost with NEXUS',                 value: 0,     unit: 'to $40', decimals: 0, improvement: '98%', prefix: '$' },
  { label: 'Patients who found care',         value: 91,    unit: '%',      decimals: 0, improvement: '2.7×' },
]

/* Ratio of before→after for the visual bar (0–1 scale, capped) */
const RATIOS = [1.2 / 14, 4 / (6 * 24), 20 / 1847, 91 / 34]

function BeforeRow({ label, value, unit, decimals, prefix, enabled }: {
  label: string; value: number; unit: string; decimals: number; prefix?: string; enabled: boolean
}) {
  const animated = useCountUp(value, decimals, enabled)
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
      fontSize: '13px', gap: '8px',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{label}</span>
      <span style={{ color: '#f87171', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', whiteSpace: 'nowrap' }}>
        {prefix}{decimals === 0 ? animated.toLocaleString() : animated.toFixed(decimals)}
        {!prefix && <span style={{ fontWeight: 400, fontSize: '11px', marginLeft: '3px' }}>{unit}</span>}
        {prefix && <span style={{ fontWeight: 400, fontSize: '11px', marginLeft: '3px' }}>{unit}</span>}
      </span>
    </div>
  )
}

function AfterRow({ label, value, unit, decimals, prefix, improvement, enabled }: {
  label: string; value: number; unit: string; decimals: number; prefix?: string; improvement: string; enabled: boolean
}) {
  const animated = useCountUp(value, decimals, enabled)
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
      fontSize: '13px', gap: '8px',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{label}</span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', whiteSpace: 'nowrap' }}>
          {prefix}{decimals === 0 ? animated.toLocaleString() : animated.toFixed(decimals)}
          {!prefix && <span style={{ fontWeight: 400, fontSize: '11px', marginLeft: '3px' }}>{unit}</span>}
          {prefix && <span style={{ fontWeight: 400, fontSize: '11px', marginLeft: '3px' }}>{unit}</span>}
        </span>
        <span style={{
          padding: '2px 7px', borderRadius: '5px',
          background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.25)',
          fontSize: '10px', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          {improvement} better
        </span>
      </div>
    </div>
  )
}

export default function BeforeAfterBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [barsVisible, setBarsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          setTimeout(() => setBarsVisible(true), 300)
          obs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      style={{
        padding: 'clamp(60px, 8vw, 100px) 24px',
        maxWidth: '900px',
        margin: '0 auto',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)',
          fontSize: '11px', fontWeight: 600, color: 'var(--accent)',
          letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          The difference NEXUS makes
        </div>
        <h2 style={{
          fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.15,
          marginBottom: '14px',
        }}>
          NEXUS vs. the old way
        </h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
          Finding free care used to mean hours of calls and dead ends.
          NEXUS changes that — in seconds.
        </p>
      </div>

      {/* Comparison grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Before column */}
        <div style={{
          padding: '28px', borderRadius: '20px',
          background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateX(0)' : 'translateX(-20px)',
          transition: 'opacity 0.6s 0.15s ease, transform 0.6s 0.15s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '11px', fontWeight: 700, color: '#f87171',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            Without NEXUS
          </div>
          {BEFORE.map((item, i) => (
            <BeforeRow key={i} {...item} enabled={visible} />
          ))}
        </div>

        {/* After column */}
        <div style={{
          padding: '28px', borderRadius: '20px',
          background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.2)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateX(0)' : 'translateX(20px)',
          transition: 'opacity 0.6s 0.25s ease, transform 0.6s 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '11px', fontWeight: 700, color: 'var(--accent)',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="9,12 11,14 15,10"/>
            </svg>
            With NEXUS
          </div>
          {AFTER.map((item, i) => (
            <AfterRow key={i} {...item} enabled={visible} />
          ))}
        </div>
      </div>

      {/* Visual comparison bars */}
      <div style={{
        marginTop: '32px', padding: '24px 28px', borderRadius: '16px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s 0.4s ease',
      }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Relative improvement
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {BEFORE.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', width: '180px', flexShrink: 0, lineHeight: 1.3 }}>{item.label}</span>
              <div style={{ flex: 1, height: '6px', borderRadius: '100px', background: 'rgba(248,113,113,0.15)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '100px',
                  background: 'linear-gradient(90deg, rgba(74,144,217,0.9), rgba(74,144,217,0.5))',
                  width: barsVisible ? `${Math.min(RATIOS[i] * 100, 100)}%` : '0%',
                  transition: `width 1.2s ${0.5 + i * 0.1}s cubic-bezier(0.16,1,0.3,1)`,
                }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, width: '50px', textAlign: 'right', flexShrink: 0 }}>
                {AFTER[i].improvement}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footnote */}
      <p style={{ marginTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.5 }}>
        * Based on internal platform data and published research on uninsured patient care-seeking behavior.
      </p>
    </section>
  )
}
