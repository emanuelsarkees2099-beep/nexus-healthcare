'use client'
import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react'

type AffordabilityLabel = 'likely-free' | 'low-cost' | 'standard'

type Props = {
  score: number
  label: AffordabilityLabel
  reasons?: string[]
  compact?: boolean
}

const LABEL_CONFIG = {
  'likely-free': {
    text:    'Likely Free',
    cls:     'aff-free',
    color:   'var(--accent)',
    bg:      'rgba(110,231,183,0.10)',
    border:  'rgba(110,231,183,0.22)',
  },
  'low-cost': {
    text:    'Low Cost',
    cls:     'aff-low',
    color:   'var(--amber)',
    bg:      'rgba(252,211,77,0.10)',
    border:  'rgba(252,211,77,0.22)',
  },
  'standard': {
    text:    'Standard Cost',
    cls:     'aff-standard',
    color:   'var(--coral)',
    bg:      'rgba(248,113,113,0.10)',
    border:  'rgba(248,113,113,0.22)',
  },
}

const DEFAULT_REASONS: Record<AffordabilityLabel, string[]> = {
  'likely-free': [
    'Sliding scale fee confirmed',
    'HRSA-funded health center',
    'No insurance required',
    'Below 200% FPL accepted',
  ],
  'low-cost': [
    'Sliding scale available',
    'Community health center',
    'Reduced-cost visits',
  ],
  'standard': [
    'Standard billing applies',
    'Insurance recommended',
  ],
}

export default function AffordabilityBar({ score, label, reasons, compact = false }: Props) {
  const cfg = LABEL_CONFIG[label]
  const displayReasons = reasons?.length ? reasons : DEFAULT_REASONS[label]
  const [expanded, setExpanded] = useState(false)
  const [animated, setAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  /* Animate fill on scroll-into-view */
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true) },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (compact) {
    return (
      <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Label pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          borderRadius: '100px', padding: '3px 10px',
        }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.color }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: cfg.color, fontFamily: 'var(--font-inter),sans-serif', whiteSpace: 'nowrap' }}>
            {cfg.text}
          </span>
        </div>
        {/* Score mono */}
        <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-mono),monospace', whiteSpace: 'nowrap' }}>
          {score}/100
        </span>
      </div>
    )
  }

  return (
    <div ref={ref}>
      {/* Score header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            borderRadius: '100px', padding: '4px 12px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: cfg.color, fontFamily: 'var(--font-inter),sans-serif' }}>
              {cfg.text}
            </span>
          </div>
          <span style={{
            fontFamily: 'var(--font-mono),monospace',
            fontSize: '13px', fontWeight: 600, color: cfg.color,
          }}>
            {score}<span style={{ color: 'var(--text-3)', fontWeight: 400 }}>/100</span>
          </span>
        </div>

        <button
          onClick={() => setExpanded(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter),sans-serif',
          }}
          aria-expanded={expanded}
          aria-label={expanded ? 'Hide score breakdown' : 'Show score breakdown'}
        >
          Why?
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Progress bar */}
      <div className="aff-bar-track">
        <div
          className={`aff-bar-fill ${cfg.cls}`}
          style={{ width: animated ? `${score}%` : '0%' }}
        />
      </div>

      {/* Expanded reasons breakdown */}
      {expanded && (
        <div style={{
          marginTop: '12px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '10px',
          padding: '12px',
          animation: 'cmd-slide-in 0.2s ease',
        }}>
          <div style={{
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: 'var(--text-3)',
            fontFamily: 'var(--font-inter),sans-serif', marginBottom: '8px',
          }}>
            Affordability Score Breakdown
          </div>
          {displayReasons.map((reason, i) => {
            const pts = i === 0 ? 30 : i === 1 ? 25 : i === 2 ? 20 : 15
            const isPositive = label !== 'standard'
            return (
              <div key={i} className="aff-reason-row">
                {isPositive
                  ? <CheckCircle2 size={12} className="aff-check" />
                  : <MinusCircle size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                }
                <span>{reason}</span>
                {isPositive && <span className="aff-pts">+{pts}</span>}
              </div>
            )
          })}
          <div style={{
            marginTop: '8px', paddingTop: '8px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter),sans-serif' }}>
              Total Affordability Score
            </span>
            <span style={{
              fontFamily: 'var(--font-mono),monospace',
              fontSize: '12px', fontWeight: 600, color: cfg.color,
            }}>
              {score} / 100
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
