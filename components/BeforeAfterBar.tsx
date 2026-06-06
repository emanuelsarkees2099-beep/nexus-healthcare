'use client'
import { useEffect, useRef, useState } from 'react'

function useCountUp(target: number, decimals = 0, enabled = false, duration = 1200) {
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

const METRICS = [
  {
    label:       'Calls to find a clinic',
    before:      { value: 14,   unit: 'calls', decimals: 0 },
    after:       { value: 1.2,  unit: 'calls', decimals: 1 },
    improvement: '12×',
  },
  {
    label:       'Time to appointment',
    before:      { value: 6,    unit: 'days',  decimals: 0 },
    after:       { value: 4,    unit: 'hours', decimals: 0 },
    improvement: '36×',
  },
  {
    label:       'Out-of-pocket cost',
    before:      { value: 1847, unit: '',      decimals: 0, prefix: '$' },
    after:       { value: 0,    unit: 'to $40',decimals: 0, prefix: '$' },
    improvement: '98%',
  },
  {
    label:       'Patients who found care',
    before:      { value: 34,   unit: '%',     decimals: 0 },
    after:       { value: 91,   unit: '%',     decimals: 0 },
    improvement: '2.7×',
  },
]

function MetricRow({
  label, before, after, improvement, enabled, isLast,
}: (typeof METRICS)[0] & { enabled: boolean; isLast: boolean }) {
  const bv = useCountUp(before.value, before.decimals, enabled)
  const av = useCountUp(after.value,  after.decimals,  enabled, 1400)

  const fmt = (v: number, dec: number, pfx?: string, unit?: string) => {
    const num = dec === 0 ? Math.floor(v).toLocaleString() : v.toFixed(dec)
    return `${pfx ?? ''}${num}${unit ? ` ${unit}` : ''}`
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 110px 28px 110px 72px',
      alignItems: 'center',
      gap: '0 12px',
      padding: '13px 0',
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.045)',
    }}>
      {/* Label */}
      <span style={{
        fontSize: '13px',
        color: 'rgba(255,255,255,0.50)',
        fontFamily: 'var(--font-inter)',
        fontWeight: 400,
        letterSpacing: '-0.005em',
      }}>
        {label}
      </span>

      {/* Before */}
      <span style={{
        fontSize: '13px',
        fontFamily: 'var(--font-mono, monospace)',
        color: 'rgba(248,113,113,0.75)',
        fontWeight: 500,
        textAlign: 'right',
        letterSpacing: '-0.02em',
        textDecoration: 'line-through',
        textDecorationColor: 'rgba(248,113,113,0.35)',
      }}>
        {fmt(bv, before.decimals, before.prefix, before.unit)}
      </span>

      {/* Arrow */}
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.25, flexShrink: 0, margin: '0 auto' }}>
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      {/* After */}
      <span style={{
        fontSize: '13px',
        fontFamily: 'var(--font-mono, monospace)',
        color: 'var(--accent)',
        fontWeight: 600,
        letterSpacing: '-0.02em',
      }}>
        {fmt(av, after.decimals, after.prefix, after.unit)}
      </span>

      {/* Improvement chip */}
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3px 8px',
        borderRadius: 'var(--r-sm)',
        background: 'rgba(74,144,217,0.08)',
        border: '1px solid rgba(74,144,217,0.16)',
        fontSize: '11px',
        fontWeight: 600,
        color: 'rgba(74,144,217,0.8)',
        fontFamily: 'var(--font-mono, monospace)',
        letterSpacing: '0',
        whiteSpace: 'nowrap',
      }}>
        ↑ {improvement}
      </span>
    </div>
  )
}

export default function BeforeAfterBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      style={{
        padding: 'clamp(48px, 6vw, 80px) 24px',
        maxWidth: '780px',
        margin: '0 auto',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
          fontFamily: 'var(--font-inter)', marginBottom: '10px',
        }}>
          <span style={{ width: '14px', height: '1px', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
          Impact metrics
        </div>
        <h2 style={{
          fontSize: 'clamp(18px, 2.2vw, 22px)',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          lineHeight: 1.2,
          margin: '0 0 8px',
          fontFamily: 'var(--font-display)',
          color: 'var(--text)',
        }}>
          The difference NEXUS makes
        </h2>
        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.35)',
          fontFamily: 'var(--font-inter)',
          fontWeight: 400,
          margin: 0,
          lineHeight: 1.6,
        }}>
          Finding free care used to mean hours of calls and dead ends.
        </p>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 110px 28px 110px 72px',
        gap: '0 12px',
        padding: '0 0 8px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '4px',
      }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-inter)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Metric</span>
        <span style={{ fontSize: '10px', color: 'rgba(248,113,113,0.4)', fontFamily: 'var(--font-inter)', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'right' }}>Before</span>
        <span />
        <span style={{ fontSize: '10px', color: 'rgba(74,144,217,0.5)', fontFamily: 'var(--font-inter)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>With NEXUS</span>
        <span />
      </div>

      {/* Metric rows */}
      {METRICS.map((m, i) => (
        <MetricRow key={i} {...m} enabled={visible} isLast={i === METRICS.length - 1} />
      ))}

      {/* Footnote */}
      <p style={{
        marginTop: '20px',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.16)',
        fontFamily: 'var(--font-inter)',
        lineHeight: 1.5,
      }}>
        Based on internal platform data and published research on uninsured patient care-seeking behavior.
      </p>

      <style>{`
        @media (max-width: 600px) {
          .bab-grid { grid-template-columns: 1fr auto !important; }
        }
      `}</style>
    </section>
  )
}
