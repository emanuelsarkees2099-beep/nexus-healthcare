'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Search, Home } from 'lucide-react'

const EmergencyEscalation = dynamic(() => import('@/components/EmergencyEscalation'), { ssr: false })

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #020409)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>

      {/* Logo */}
      <div style={{ marginBottom: '52px' }}>
        <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: '13px', fontWeight: 400, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.6)' }}>NEXUS</span>
      </div>

      {/* 404 display */}
      <div style={{ position: 'relative', marginBottom: '36px' }}>
        <p style={{ fontSize: 'clamp(80px, 18vw, 160px)', fontWeight: 900, color: 'rgba(110,231,183,0.06)', letterSpacing: '-0.05em', lineHeight: 1, margin: 0, userSelect: 'none', fontFamily: 'var(--font-mono, monospace)' }}>404</p>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={22} strokeWidth={1.5} style={{ color: 'var(--accent, #6EE7B7)' }} />
          </div>
        </div>
      </div>

      <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
        Page not found
      </h1>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '380px', lineHeight: 1.65, marginBottom: '36px' }}>
        The page you're looking for doesn't exist or may have moved. Let's get you back on track.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}>
        <Link
          href="/search"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', background: 'var(--accent, #6EE7B7)', color: '#020409', borderRadius: '100px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', transition: 'opacity 0.2s' }}
        >
          <Search size={14} strokeWidth={2} /> Find a clinic
        </Link>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.7)', borderRadius: '100px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}
        >
          <Home size={14} strokeWidth={1.5} /> Home
        </Link>
      </div>

      {/* Emergency escalation — always visible on 404 per the vision spec */}
      <div style={{ maxWidth: '420px', width: '100%' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginBottom: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Need immediate help?</p>
        <EmergencyEscalation compact />
      </div>
    </div>
  )
}
