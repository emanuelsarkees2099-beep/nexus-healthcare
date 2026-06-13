'use client'
/**
 * CrisisDetectionBanner — Phase 7.1
 * Monitors a string input for crisis-related language and surfaces a
 * non-intrusive, dismissible banner linking to 988 and /crisis.
 * Never blocks the user's flow.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, CloseCircle } from 'iconsax-react'

const CRISIS_PATTERNS = [
  /\b(suicid|end my life|kill myself|don't want to live|want to die|no reason to live)\b/i,
  /\b(overdos|hurt myself|self.?harm|cutting myself)\b/i,
  /\b(hopeless|no point|can't go on|give up on life)\b/i,
  /\b(crisis|mental breakdown|panic attack)\b/i,
]

interface Props {
  /** Text to scan for crisis language (e.g. a symptom input value) */
  text: string
  /** Extra style overrides for the outer wrapper */
  className?: string
}

export default function CrisisDetectionBanner({ text, className }: Props) {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return
    const isCrisis = CRISIS_PATTERNS.some(p => p.test(text))
    setShow(isCrisis)
  }, [text, dismissed])

  if (!show || dismissed) return null

  return (
    <div
      className={className}
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 12,
        background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)',
        animation: 'crisis-banner-in 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <style>{`
        @keyframes crisis-banner-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Heart size={13} color="#f87171" variant="Bold" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
          If you&apos;re in crisis, help is one tap away —{' '}
        </span>
        <a
          href="tel:988"
          style={{ fontSize: 13, fontWeight: 700, color: '#f87171', textDecoration: 'none' }}
        >
          call or text 988
        </a>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          {' '}· free, 24/7.{' '}
        </span>
        <Link
          href="/crisis"
          style={{ fontSize: 13, color: 'rgba(248,113,113,0.75)', textDecoration: 'underline' }}
        >
          All resources →
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss crisis banner"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.3)', padding: 2, flexShrink: 0,
          display: 'flex', alignItems: 'center',
        }}
      >
        <CloseCircle size={16} color="currentColor" variant="Linear" />
      </button>
    </div>
  )
}
