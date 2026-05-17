'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'nexus_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      // Short delay so it doesn't flash immediately on first paint
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
  }

  if (!mounted) return null

  return (
    <>
      <div
        className={`cookie-banner${visible ? ' visible' : ''}`}
        role="region"
        aria-label="Cookie consent notice"
        aria-live="polite"
      >
        <p style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.65)',
          fontFamily: 'var(--font-inter)', fontWeight: 300, lineHeight: 1.6,
          margin: 0, flex: 1,
        }}>
          NEXUS uses essential cookies for authentication and performance analytics.
          We never sell your data.{' '}
          <Link
            href="/privacy"
            style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Privacy policy ↗
          </Link>
        </p>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={decline}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
              fontWeight: 500, fontFamily: 'var(--font-inter)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          >
            Decline
          </button>
          <button
            onClick={accept}
            style={{
              padding: '8px 18px', borderRadius: '8px', fontSize: '13px',
              fontWeight: 600, fontFamily: 'var(--font-inter)',
              background: 'var(--accent)',
              border: 'none',
              color: '#07070F',
              cursor: 'pointer', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Accept
          </button>
        </div>
      </div>
    </>
  )
}
