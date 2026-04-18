'use client'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[NEXUS] Global error:', error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: '13px', fontWeight: 400, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.6)' }}>NEXUS</span>
      </div>

      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Something went wrong</h1>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', maxWidth: '360px', lineHeight: 1.65, marginBottom: '8px' }}>
        An unexpected error occurred. Our team has been notified.
      </p>
      {error.digest && (
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', marginBottom: '32px' }}>
          Error ID: {error.digest}
        </p>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
        <button
          onClick={reset}
          style={{ padding: '12px 24px', background: '#6d9197', color: '#07070F', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Try again
        </button>
        <a href="/dashboard" style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
          Dashboard
        </a>
      </div>
    </div>
  )
}
