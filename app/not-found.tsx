'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
      {/* Logo */}
      <div style={{ marginBottom: '48px' }}>
        <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: '13px', fontWeight: 400, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.6)' }}>NEXUS</span>
      </div>

      {/* 404 display */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <p style={{ fontSize: 'clamp(80px, 18vw, 160px)', fontWeight: 900, color: 'rgba(109,145,151,0.08)', letterSpacing: '-0.05em', lineHeight: 1, margin: 0, userSelect: 'none' }}>404</p>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(109,145,151,0.1)', border: '1px solid rgba(109,145,151,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6d9197" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>
      </div>

      <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
        Page not found
      </h1>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '380px', lineHeight: 1.65, marginBottom: '36px' }}>
        The page you're looking for doesn't exist or may have moved. Let's get you back on track.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/dashboard" style={{ padding: '12px 24px', background: '#6d9197', color: '#07070F', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
          Go to dashboard
        </Link>
        <Link href="/" style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
          Home
        </Link>
      </div>
    </div>
  )
}
