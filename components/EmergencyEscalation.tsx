'use client'
import { useState } from 'react'
import { Danger, Call, Location, MessageText1, Health, Cpu, CloseCircle, ArrowRight2 } from 'iconsax-react'

const RESOURCES = [
  {
    id: 'e911',
    label: 'Call 911',
    description: 'Life-threatening emergency',
    action: () => { window.location.href = 'tel:911' },
    color: 'var(--coral)',
    bg: 'rgba(248,113,113,0.10)',
    border: 'rgba(248,113,113,0.25)',
    icon: <Call size={16} variant="Linear" color="var(--coral)" />,
  },
  {
    id: 'er',
    label: 'Find Emergency Room',
    description: 'Nearest ER, sorted by distance',
    href: '/search?type=emergency&sort=distance',
    color: 'var(--amber)',
    bg: 'rgba(252,211,77,0.10)',
    border: 'rgba(252,211,77,0.25)',
    icon: <Location size={16} variant="Linear" color="var(--amber)" />,
  },
  {
    id: '988',
    label: 'Call or Text 988',
    description: 'Suicide & Crisis Lifeline — free, 24/7',
    action: () => { window.location.href = 'tel:988' },
    color: 'var(--violet)',
    bg: 'rgba(167,139,250,0.10)',
    border: 'rgba(167,139,250,0.25)',
    icon: <Cpu size={16} variant="Linear" color="var(--violet)" />,
  },
  {
    id: 'crisis-text',
    label: 'Crisis Text Line',
    description: 'Text HOME to 741741 — free, 24/7',
    action: () => { window.location.href = 'sms:741741?body=HOME' },
    color: 'var(--violet)',
    bg: 'rgba(167,139,250,0.10)',
    border: 'rgba(167,139,250,0.25)',
    icon: <MessageText1 size={16} variant="Linear" color="var(--violet)" />,
  },
  {
    id: 'poison',
    label: 'Poison Control',
    description: '1-800-222-1222 — free, 24/7',
    action: () => { window.location.href = 'tel:18002221222' },
    color: 'var(--accent)',
    bg: 'rgba(74,144,217,0.10)',
    border: 'rgba(74,144,217,0.25)',
    icon: <Health size={16} variant="Linear" color="var(--accent)" />,
  },
]

type Props = {
  compact?: boolean
}

export default function EmergencyEscalation({ compact = false }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        className="emergency-btn emergency-btn-pulse"
        onClick={() => setOpen(p => !p)}
        aria-expanded={open}
        aria-controls="emergency-panel"
      >
        <Danger size={14} variant="Linear" color="currentColor" />
        {compact ? 'Help Now' : 'I need help now'}
      </button>

      {/* Panel */}
      {open && (
        <div
          id="emergency-panel"
          className="emergency-panel"
          style={{
            position: compact ? 'absolute' : 'relative',
            bottom: compact ? 'calc(100% + 12px)' : undefined,
            left: compact ? '0' : undefined,
            marginTop: compact ? 0 : '12px',
            width: compact ? '320px' : '100%',
            zIndex: 100,
          }}
          role="region"
          aria-label="Emergency resources"
        >
          {/* Panel header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Danger size={15} color="var(--coral)" variant="Linear" />
              <span style={{
                fontSize: '13px', fontWeight: 700, color: 'var(--coral)',
                fontFamily: 'var(--font-inter),sans-serif', letterSpacing: '0.02em',
              }}>
                Immediate Options
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '2px', display: 'flex' }}
              aria-label="Close emergency panel"
            >
              <CloseCircle size={14} variant="Linear" color="var(--text-3)" />
            </button>
          </div>

          {/* Resource list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {RESOURCES.map(r => {
              const handleClick = () => {
                if (r.action) r.action()
                else if (r.href) window.location.href = r.href
              }
              return (
                <button
                  key={r.id}
                  onClick={handleClick}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 14px', border: `1px solid ${r.border}`,
                    background: r.bg, borderRadius: '12px', cursor: 'pointer',
                    textAlign: 'left', transition: 'opacity 0.2s, transform 0.15s',
                    width: '100%',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: r.color, flexShrink: 0,
                  }}>
                    {r.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: r.color, fontFamily: 'var(--font-inter),sans-serif' }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter),sans-serif', marginTop: '1px' }}>
                      {r.description}
                    </div>
                  </div>
                  <ArrowRight2 size={13} color="var(--text-3)" variant="Linear" />
                </button>
              )
            })}
          </div>

          <p style={{
            marginTop: '12px', fontSize: '11px', color: 'var(--text-3)',
            fontFamily: 'var(--font-inter),sans-serif', lineHeight: 1.6,
            borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px',
          }}>
            All resources are free. No insurance or ID required.
          </p>
        </div>
      )}
    </div>
  )
}
