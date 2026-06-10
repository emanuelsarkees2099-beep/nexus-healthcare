'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CloseSquare, Location } from 'iconsax-react'

const SESSION_KEY = 'nexus_exit_shown'

export default function ExitIntent() {
  const [visible, setVisible] = useState(false)
  const shownRef = useRef(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Only show once per session
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) return

    // Wait 30s before enabling — user must be genuinely engaged — don't fire immediately
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
    }, 30000)

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
          background: 'rgba(8,13,26,0.82)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(74,144,217,0.12)',
          borderRadius: '24px',
          padding: '2.25rem 2.5rem',
          boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(74,144,217,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
          animation: 'exit-slide-up 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        {/* Top accent line */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(74,144,217,0.5), transparent)',
        }} />

        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', padding: '6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          <CloseSquare size={16} color="var(--text-2)" variant="Linear" />
        </button>

        {/* Icon */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: 'var(--accent-dim)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.25rem', color: 'var(--accent)',
        }}>
          <Location size={22} color="currentColor" variant="TwoTone" />
        </div>

        {/* Content */}
        <h2 id="exit-title" style={{
          fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700,
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
          Federally-funded free clinics are within reach in most U.S. cities. No insurance card, no signup, no cost — ever.
          Most people find care within minutes.
        </p>

        {/* CTA row */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            style={{
              flex: 1,
              background: 'var(--accent)', color: '#07070F',
              border: 'none', borderRadius: '12px', padding: '13px 20px',
              fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', minWidth: '160px',
              boxShadow: '0 4px 20px rgba(74,144,217,0.30)',
              transition: 'transform 0.2s var(--ease-spring), box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(74,144,217,0.45)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(74,144,217,0.30)'
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
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-2)'
              e.currentTarget.style.borderColor = 'rgba(74,144,217,0.25)'
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
