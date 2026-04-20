'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const PROGRAMS = [
  { name: 'Medicaid / AHCCCS', sub: 'Free coverage for low-income individuals' },
  { name: 'ACA Marketplace', sub: 'Subsidized plans, $0 premium options' },
  { name: 'HRSA Sliding Scale', sub: 'Pay based on income at any FQHC' },
  { name: 'CHIP', sub: 'Free coverage for children under 19' },
  { name: '340B Drug Program', sub: 'Deeply discounted prescriptions' },
]

export default function Eligibility() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.elig-wrap', {
        y: 50, opacity: 0,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="eligibility"
      aria-labelledby="eligibility-title"
      style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '120px 3rem' }}
    >
      <div
        className="elig-wrap"
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: '28px', padding: '4rem',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '4rem', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Top gradient line */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '-1px', left: '15%', right: '15%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(110,231,183,0.5), transparent)',
        }} />

        {/* Depth overlay */}
        <div className="card-depth-overlay" aria-hidden="true" />

        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1.25rem', fontFamily: 'var(--font-inter)' }}>
            <span style={{ display: 'inline-block', width: '16px', height: '1px', background: 'var(--accent)' }} aria-hidden="true" />
            Eligibility navigator
          </div>
          <h2
            id="eligibility-title"
            style={{
              fontFamily: 'var(--font-sora)', fontSize: '2.2rem', fontWeight: 600,
              lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em',
            }}
          >
            You probably qualify<br />for <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>more than you think</em>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', fontWeight: 400, lineHeight: 1.85, marginBottom: '1.75rem' }}>
            Millions of uninsured Americans are eligible for free or low-cost programs and don&apos;t know it. Answer 5 questions. We show you exactly what you qualify for — no jargon.
          </p>
          <Link
            href="/programs"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'var(--accent)', color: 'var(--bg)',
              textDecoration: 'none', borderRadius: '10px',
              padding: '14px 24px', fontSize: '14px', fontWeight: 500,
              fontFamily: 'var(--font-inter)',
              transition: 'transform 0.2s, box-shadow 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 14px 36px rgba(110,231,183,0.35)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = ''
            }}
          >
            Check my eligibility
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PROGRAMS.map(p => (
            <Link
              key={p.name}
              href="/programs"
              role="listitem"
              tabIndex={0}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                borderRadius: '14px', padding: '14px 18px',
                transition: 'border-color 0.25s, transform 0.25s var(--ease-spring)',
                textDecoration: 'none', color: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(110,231,183,0.22)'
                e.currentTarget.style.transform = 'translateX(4px)'
                e.currentTarget.style.background = 'rgba(110,231,183,0.04)'
                const arrow = e.currentTarget.querySelector<HTMLElement>('[data-arrow]')
                if (arrow) { arrow.style.color = 'var(--accent)'; arrow.style.transform = 'translateX(3px)' }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border2)'
                e.currentTarget.style.transform = ''
                e.currentTarget.style.background = 'var(--bg3)'
                const arrow = e.currentTarget.querySelector<HTMLElement>('[data-arrow]')
                if (arrow) { arrow.style.color = 'var(--text-3)'; arrow.style.transform = '' }
              }}
            >
              <div aria-hidden="true" style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--font-inter)' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>{p.sub}</div>
              </div>
              <div data-arrow="true" aria-hidden="true" style={{ color: 'var(--text-3)', fontSize: '14px', transition: 'transform 0.2s, color 0.2s' }}>→</div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .elig-wrap { grid-template-columns: 1fr !important; padding: 2rem !important; }
          #eligibility { padding: 80px 1.25rem !important; }
        }
      `}</style>
    </section>
  )
}
