'use client'
/**
 * Root-level error boundary. app/error.tsx only catches errors inside the
 * page tree — this catches failures in the root layout itself, which
 * would otherwise show a blank white screen. Must render its own
 * <html>/<body> and use inline styles (globals.css may not be available).
 */
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Sentry auto-captures unhandled errors when its DSN is set.
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#050609', color: '#F8F9FF', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '440px' }}>
          <div style={{ fontSize: '13px', letterSpacing: '0.42em', color: 'rgba(248,249,255,0.6)', marginBottom: '28px' }}>NEXUS</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Something went wrong.</h1>
          <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'rgba(248,249,255,0.62)', marginBottom: '28px' }}>
            The page failed to load. You can try again — and if you need care right now,
            these still work:
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
            <button
              onClick={reset}
              style={{ padding: '11px 22px', borderRadius: '100px', border: 'none', background: '#4F8EF0', color: '#04121D', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
            >
              Try again
            </button>
            <a href="/search" style={{ padding: '11px 22px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.14)', color: '#F8F9FF', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Find care
            </a>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(248,249,255,0.42)', lineHeight: 1.7 }}>
            Medical emergency? Call <a href="tel:911" style={{ color: '#F59E0B', fontWeight: 600, textDecoration: 'none' }}>911</a>.
            Mental-health crisis? Call or text <a href="tel:988" style={{ color: '#F59E0B', fontWeight: 600, textDecoration: 'none' }}>988</a>.
          </p>
        </div>
      </body>
    </html>
  )
}
