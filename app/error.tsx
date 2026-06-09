'use client'
import { useEffect } from 'react'
import { Warning2, Home2 } from 'iconsax-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[NEXUS] Global error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '40px 24px',
    }}>
      {/* Aurora glow */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 40% at 50% 0%, rgba(248,113,113,0.06) 0%, transparent 65%)',
      }} />

      <div style={{ marginBottom: '40px', position: 'relative', zIndex: 1 }}>
        <span style={{
          fontFamily: 'var(--font-orbitron, monospace)',
          fontSize: '13px', fontWeight: 400,
          letterSpacing: '0.45em', color: 'rgba(255,255,255,0.6)',
        }}>NEXUS</span>
      </div>

      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: 'rgba(248,113,113,0.10)',
        border: '1px solid rgba(248,113,113,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px', position: 'relative', zIndex: 1,
      }}>
        <Warning2 size={28} color="#f87171" variant="TwoTone" />
      </div>

      <h1 style={{
        fontSize: '28px', fontWeight: 700,
        color: 'var(--text)', marginBottom: '12px',
        fontFamily: 'var(--font-display)', letterSpacing: '-0.025em',
        position: 'relative', zIndex: 1,
      }}>
        Something went wrong
      </h1>
      <p style={{
        fontSize: '14px', color: 'var(--text-3)',
        maxWidth: '360px', lineHeight: 1.65, marginBottom: '8px',
        fontFamily: 'var(--font-inter)',
        position: 'relative', zIndex: 1,
      }}>
        An unexpected error occurred. Our team has been notified.
      </p>
      {error.digest && (
        <p style={{
          fontSize: '11px', color: 'var(--text-3)', opacity: 0.5,
          fontFamily: 'monospace', marginBottom: '32px',
          position: 'relative', zIndex: 1,
        }}>
          Error ID: {error.digest}
        </p>
      )}

      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap',
        justifyContent: 'center', marginTop: '24px',
        position: 'relative', zIndex: 1,
      }}>
        <button
          onClick={reset}
          style={{
            padding: '12px 24px',
            background: 'var(--accent)', color: '#fff',
            borderRadius: '10px', border: 'none',
            fontWeight: 700, fontSize: '14px',
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(79,142,240,0.35)',
            transition: 'transform 0.18s, box-shadow 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,142,240,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,142,240,0.35)' }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'var(--text-2)',
            borderRadius: '10px', textDecoration: 'none',
            fontWeight: 600, fontSize: '14px',
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            transition: 'background 0.18s, border-color 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
        >
          <Home2 size={14} color="currentColor" variant="Linear" />
          Home
        </a>
      </div>
    </div>
  )
}
