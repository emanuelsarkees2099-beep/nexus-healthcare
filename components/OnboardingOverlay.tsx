'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, ReceiptText, Users, AlertTriangle, X, Heart,
} from 'lucide-react'

const OPTIONS = [
  {
    id: 'clinic',
    href: '/search',
    label: 'Find a free clinic near me',
    description: 'Search 12,000+ free and sliding-scale providers',
    icon: <MapPin size={18} strokeWidth={2} />,
    cls: 'ob-mint',
  },
  {
    id: 'programs',
    href: '/programs',
    label: 'Check programs I qualify for',
    description: 'Medicaid, ACA, HRSA — scanned in under 60 seconds',
    icon: <ReceiptText size={18} strokeWidth={2} />,
    cls: 'ob-amber',
  },
  {
    id: 'chw',
    href: '/chw',
    label: 'Connect with a health worker',
    description: 'Verified CHWs who speak your language',
    icon: <Users size={18} strokeWidth={2} />,
    cls: 'ob-violet',
  },
  {
    id: 'emergency',
    href: '/search?urgent=true',
    label: 'I need help right now',
    description: 'Urgent care, crisis lines, emergency resources',
    icon: <AlertTriangle size={18} strokeWidth={2} />,
    cls: 'ob-coral',
  },
]

const STORAGE_KEY = 'nexus_onboarded_v2'

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    /* Show once per device — delay 2 s so hero can render first */
    if (typeof window === 'undefined') return
    const done = localStorage.getItem(STORAGE_KEY)
    if (done) return
    const t = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  const choose = (href: string) => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
    router.push(href)
  }

  if (!visible) return null

  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-label="Get started with NEXUS">
      <div className="onboarding-panel">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginBottom: '10px',
              background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.18)',
              borderRadius: '100px', padding: '4px 10px',
            }}>
              <Heart size={11} color="var(--accent)" />
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent)', fontFamily: 'var(--font-inter),sans-serif' }}>
                Free. Always.
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-sora),sans-serif',
              fontSize: 'clamp(1.4rem,4vw,1.75rem)',
              fontWeight: 700, lineHeight: 1.15,
              letterSpacing: '-0.02em', color: 'var(--text)',
              marginBottom: '6px',
            }}>
              What do you need<br />most right now?
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-inter),sans-serif', lineHeight: 1.6 }}>
              No account needed. No insurance required.
            </p>
          </div>
          <button
            onClick={dismiss}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', padding: '4px', display: 'flex',
              borderRadius: '8px', transition: 'color 0.2s',
              flexShrink: 0, marginLeft: '12px',
            }}
            aria-label="Dismiss"
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Options */}
        <nav aria-label="Quick start options">
          {OPTIONS.map(opt => (
            <button
              key={opt.id}
              className={`onboarding-option ${opt.cls}`}
              onClick={() => choose(opt.href)}
              style={{ width: '100%', textAlign: 'left', fontFamily: 'var(--font-inter),sans-serif' }}
            >
              <div className="ob-icon">{opt.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  {opt.description}
                </div>
              </div>
              <div style={{ color: 'var(--text-3)', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          marginTop: '1.25rem', paddingTop: '1.25rem',
          borderTop: '1px solid var(--border2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter),sans-serif' }}>
            This won't show again on this device
          </p>
          <button
            onClick={dismiss}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-inter),sans-serif',
              padding: '4px 8px', borderRadius: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
