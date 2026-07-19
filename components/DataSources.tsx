'use client'
/**
 * DataSources — the honest replacement for the removed fake-testimonial wall.
 *
 * Instead of inventing patient quotes, we show the real, verifiable
 * foundation of the product: the authoritative public datasets NEXUS is
 * built on. This is what actually earns trust in healthcare — provenance,
 * not manufactured social proof.
 */
import { useEffect, useRef, useState } from 'react'
import { ShieldTick } from 'iconsax-react'

const SOURCES: { name: string; full: string; what: string }[] = [
  { name: 'HRSA', full: 'Health Resources & Services Administration', what: '18,900+ Federally Qualified Health Center sites' },
  { name: 'NAFC', full: 'National Association of Free & Charitable Clinics', what: 'Volunteer-run free clinics' },
  { name: 'NPI Registry', full: 'National Provider Identifier (CMS)', what: 'Verified provider organizations' },
  { name: 'SAMHSA', full: 'Substance Abuse & Mental Health Services Admin', what: 'Behavioral health & treatment services' },
  { name: 'GeoNames', full: 'Open geographic database', what: 'Every US city & ZIP for instant search' },
]

export default function DataSources() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      aria-labelledby="sources-title"
      style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', margin: '0 auto', padding: 'clamp(72px, 11vh, 120px) clamp(20px, 5vw, 32px) 0', textAlign: 'center' }}
    >
      <p style={{ fontSize: '12px', fontWeight: 650, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px', fontFamily: 'var(--font-mono)', opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        Built on verified public data
      </p>
      <h2 id="sources-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 3.4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.12, marginBottom: '14px', color: 'var(--text)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
        Every clinic, from a source you can check.
      </h2>
      <p style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto 44px', fontFamily: 'var(--font-inter)', opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease 0.1s' }}>
        We don&apos;t invent numbers or testimonials. NEXUS is built on authoritative,
        publicly verifiable healthcare datasets — the same ones federal agencies and
        researchers use.
      </p>

      <div className="sources-grid" style={{ textAlign: 'left' }}>
        {SOURCES.map((s, i) => (
          <div key={s.name} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-card)', padding: '20px',
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 70}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 70}ms`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
              <ShieldTick size={15} variant="Bold" color="var(--accent)" aria-hidden="true" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{s.name}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: '10px', lineHeight: 1.4 }}>{s.full}</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-2)', lineHeight: 1.5, fontFamily: 'var(--font-inter)' }}>{s.what}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
