'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const SESSION_KEY = 'nexus_exit_shown'

export default function ExitIntent() {
  const [visible, setVisible] = useState(false)
  const shownRef = useRef(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Only show once per session
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) return

    // Wait 8s before enabling — don't fire immediately
    const enableTimeout = setTimeout(() => {
      const onMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 4 && !shownRef.current) {
          shownRef.current = true
          setVisible(true)
          sessionStorage.setItem(SESSION_KEY, '1')
          document.removeEventListener('mouseleave', onMouseLeave)
        }
      }
      document.addEventListener('mouseleave', onMouseLeave)
      return () => document.removeEventListener('mouseleave', onMouseLeave)
    }, 8000)

    return () => clearTimeout(enableTimeout)
  }, [])

  const close = () => setVisible(false)

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 9990,
          background: 'rgba(7,7,15,0.75)',
          backdropFilter: 'blur(6px)',
          animation: 'exit-fade-in 0.35s ease forwards',
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-title"
        style={{
          position: 'fixed',
          bottom: '2rem', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9991,
          width: 'calc(100% - 2rem)',
          maxWidth: '520px',
          background: 'linear-gradient(160deg, var(--bg2), var(--bg3))',
          border: '1px solid rgba(109,145,151,0.20)',
          borderRadius: '24px',
          padding: '2.25rem 2.5rem',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(109,145,151,0.08)',
          animation: 'exit-slide-up 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        {/* Top accent line */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(109,145,151,0.5), transparent)',
        }} />

        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', cursor: 'none',
            color: 'var(--text-3)', padding: '6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: 'var(--accent-dim)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.25rem', color: 'var(--accent)',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        {/* Content */}
        <h2 id="exit-title" style={{
          fontFamily: 'var(--font-sora)', fontSize: '1.5rem', fontWeight: 700,
          letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.75rem',
        }}>
          Wait — free care is{' '}
          <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>still available</span>
          {' '}for you.
        </h2>

        <p style={{
          fontSize: '14px', color: 'var(--text-2)',
          fontFamily: 'var(--font-inter)', fontWeight: 300,
          lineHeight: 1.75, marginBottom: '1.75rem',
        }}>
          12,000+ free clinics are within reach. No insurance card, no signup, no cost — ever.
          Most people find care within 3 minutes.
        </p>

        {/* CTA row */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            style={{
              flex: 1,
              background: 'var(--accent)', color: '#07070F',
              border: 'none', borderRadius: '12px', padding: '13px 20px',
              fontFamily: 'var(--font-sora)', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', minWidth: '160px',
              boxShadow: '0 4px 20px rgba(109,145,151,0.30)',
              transition: 'transform 0.2s var(--ease-spring), box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(109,145,151,0.45)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(109,145,151,0.30)'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onClick={() => { close(); router.push('/pathways') }}
          >
            Find free care near me →
          </button>
          <button
            onClick={close}
            style={{
              background: 'transparent', color: 'var(--text-3)',
              border: '1px solid var(--border)', borderRadius: '12px', padding: '13px 20px',
              fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 400,
              cursor: 'none',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-2)'
              e.currentTarget.style.borderColor = 'rgba(109,145,151,0.25)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-3)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            Not now
          </button>
        </div>

        {/* Trust micro-copy */}
        <p style={{
          marginTop: '1rem', fontSize: '11px', color: 'var(--text-3)',
          fontFamily: 'var(--font-inter)', fontWeight: 300,
        }}>
          No email required · 100% anonymous · Always free
        </p>
      </div>

      <style>{`
        @keyframes exit-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes exit-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(40px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (max-width: 480px) {
          /* Exit modal full-width on small screens */
        }
      `}</style>
    </>
  )
}
