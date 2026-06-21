'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Map1 } from 'iconsax-react'

export default function OfflinePage() {
  const [cachedClinics, setCachedClinics] = useState<{ name: string; address: string; phone: string }[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nexus_last_results')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setCachedClinics(parsed.slice(0, 5))
      }
    } catch { /* ignore */ }
  }, [])

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#020409',
      color: '#F4F8FF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
    }}>
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(74,144,217,0.07) 0%, transparent 65%)',
      }} />

      <div style={{
        width: '72px', height: '72px', borderRadius: '20px',
        background: 'rgba(74,144,217,0.08)',
        border: '1px solid rgba(74,144,217,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.75rem', position: 'relative', zIndex: 1,
      }}>
        <Map1 size={32} color="#4A90D9" variant="TwoTone" aria-hidden="true" />
      </div>

      <div style={{
        fontSize: '11px', fontWeight: 400, letterSpacing: '0.5em',
        textTransform: 'uppercase', color: '#E8E0FF',
        marginBottom: '1.5rem', opacity: 0.7, position: 'relative', zIndex: 1,
      }}>
        NEXUS
      </div>

      <h1 style={{
        fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
        fontWeight: 800, lineHeight: 1.1,
        letterSpacing: '-0.03em',
        marginBottom: '1rem',
        maxWidth: '480px',
        position: 'relative', zIndex: 1,
      }}>
        You&apos;re offline right now
      </h1>

      <p style={{
        fontSize: '15px', color: 'rgba(240,253,248,0.5)',
        lineHeight: 1.7, maxWidth: '400px', marginBottom: '2.5rem',
        position: 'relative', zIndex: 1,
      }}>
        No connection detected. Check your network and try again.
        If you searched for clinics recently, your last results appear below.
      </p>

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '14px 28px', borderRadius: '12px',
          background: '#4A90D9', color: '#07070F',
          border: 'none', cursor: 'pointer',
          fontSize: '15px', fontWeight: 700,
          marginBottom: '1.5rem',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 20px rgba(74,144,217,0.3)',
          position: 'relative', zIndex: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(74,144,217,0.45)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(74,144,217,0.3)' }}
      >
        Try again
      </button>

      <div style={{
        padding: '14px 20px', borderRadius: '12px',
        background: 'rgba(248,113,113,0.07)',
        border: '1px solid rgba(248,113,113,0.18)',
        marginBottom: '2.5rem', maxWidth: '380px',
        position: 'relative', zIndex: 1,
      }}>
        <p style={{ fontSize: '13px', color: 'rgba(248,113,113,0.9)', margin: 0, lineHeight: 1.6 }}>
          <strong>Medical emergency?</strong> Call{' '}
          <a href="tel:911" style={{ color: '#f87171', fontWeight: 700 }}>911</a>
          {' '}immediately. For mental health crisis, call or text{' '}
          <a href="tel:988" style={{ color: '#f87171', fontWeight: 700 }}>988</a>.
        </p>
      </div>

      {cachedClinics.length > 0 && (
        <div style={{ width: '100%', maxWidth: '500px', position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: '11px', color: 'rgba(240,253,248,0.3)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: '12px', fontWeight: 500,
          }}>
            Your last search results
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cachedClinics.map((clinic, i) => (
              <div key={i} style={{
                padding: '14px 16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#F4F8FF', marginBottom: '4px' }}>{clinic.name}</div>
                {clinic.address && <div style={{ fontSize: '12px', color: 'rgba(240,253,248,0.4)', marginBottom: '3px' }}>{clinic.address}</div>}
                {clinic.phone && (
                  <a href={`tel:${clinic.phone}`} style={{ fontSize: '12px', color: '#4A90D9', textDecoration: 'none', fontWeight: 500 }}>
                    {clinic.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(240,253,248,0.2)', marginTop: '10px' }}>
            Cached from your last connection
          </p>
        </div>
      )}

      {cachedClinics.length === 0 && (
        <p style={{ fontSize: '12px', color: 'rgba(240,253,248,0.2)', maxWidth: '400px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
          Tip: After your first search, NEXUS caches your nearest 5 clinics so they&apos;re always visible — even without signal.
        </p>
      )}

      {/* Emergency contacts — always available offline (hardcoded) */}
      <div style={{
        marginTop: '2rem', width: '100%', maxWidth: '500px',
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '1.5rem',
      }}>
        <p style={{ fontSize: '11px', color: 'rgba(240,253,248,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>
          Emergency contacts (always available)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: '911 — Emergency services',     tel: '911',          color: '#f87171' },
            { label: '988 — Mental health crisis',   tel: '988',          color: '#a78bfa' },
            { label: '211 — Community resources',    tel: '211',          color: '#34d399' },
            { label: 'Poison Control',               tel: '18002221222',  color: '#fbbf24' },
            { label: 'RAINN (sexual assault)',        tel: '18006564673',  color: '#60a5fa' },
          ].map(e => (
            <a key={e.tel} href={`tel:${e.tel}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              textDecoration: 'none', color: e.color, fontWeight: 600,
              fontSize: '14px',
            }}>
              <span style={{ color: 'rgba(240,253,248,0.7)', fontSize: '13px' }}>{e.label}</span>
              <span>{e.tel.replace(/^1/, '1-').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</span>
            </a>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2rem', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ fontSize: '13px', color: 'rgba(240,253,248,0.3)', textDecoration: 'none' }}>
          ← Back to NEXUS
        </Link>
      </div>
    </div>
  )
}
