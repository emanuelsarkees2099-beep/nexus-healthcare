'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap-st'
registerGSAP()

const BADGES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    label: 'HRSA Data Source',
    desc: 'Clinic data sourced directly from HRSA federal API',
    color: 'var(--accent)',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="14" x="2" y="5" rx="2"/>
        <path d="M2 10h20"/>
        <path d="M6 15h2"/>
        <path d="M11 15h4"/>
      </svg>
    ),
    label: 'Zero Data Sold',
    desc: 'We have never sold user data and structurally cannot',
    color: '#4ade80',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
    label: '100% Anonymous',
    desc: 'No account required. Searches leave no trace.',
    color: '#60a5fa',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    label: 'NACHC Network',
    desc: 'Aligned with National Assoc. of Community Health Centers',
    color: '#a78bfa',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    label: 'Always Free',
    desc: 'NEXUS will never charge patients. Ever.',
    color: '#fbbf24',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3"/>
        <path d="M3 12h1m16 0h1m-9-9v1m0 16v1M5.6 5.6l.7.7m11.4-.7-.7.7m-11.4 11.4.7-.7m11.4.7-.7-.7"/>
      </svg>
    ),
    label: 'HIPAA-Aligned',
    desc: 'Built to the standard for health information privacy',
    color: '#f472b6',
  },
]

export default function TrustBadges() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(headerRef.current, { y: 30, opacity: 0 })
      gsap.to(headerRef.current, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headerRef.current, start: 'top 88%', once: true },
      })
      gsap.set('.trust-badge', { y: 24, opacity: 0 })
      gsap.to('.trust-badge', {
        y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="trust-title"
      style={{ position: 'relative', zIndex: 2, padding: '80px 2rem' }}
    >
      {/* Top separator line */}
      <div aria-hidden="true" style={{
        maxWidth: '1200px', margin: '0 auto 60px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(110,231,183,0.18) 30%, rgba(110,231,183,0.18) 70%, transparent)',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div ref={headerRef} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '11px', fontWeight: 400, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--accent)',
            marginBottom: '1rem', fontFamily: 'var(--font-inter)',
          }}>
            <span style={{ display: 'inline-block', width: '16px', height: '1px', background: 'var(--accent)' }} aria-hidden="true" />
            Built with trust
            <span style={{ display: 'inline-block', width: '16px', height: '1px', background: 'var(--accent)' }} aria-hidden="true" />
          </div>
          <h2 id="trust-title" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)',
            fontWeight: 700, lineHeight: 1.1,
            letterSpacing: '-0.025em',
            marginBottom: '0.6rem',
          }}>
            Privacy isn&apos;t a feature.{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>It&apos;s the foundation.</em>
          </h2>
          <p style={{
            fontSize: '14px', color: 'var(--text-2)',
            fontFamily: 'var(--font-inter)', fontWeight: 300,
            lineHeight: 1.7, maxWidth: '420px', margin: '0 auto',
          }}>
            Your health searches are anonymous, your data is not sold, and the entire system is built to protect — not exploit — the people who need help most.{' '}
            <Link href="/privacy" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 400 }}>
              Full privacy policy →
            </Link>
          </p>
        </div>

        {/* Badges grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}>
          {BADGES.map(b => (
            <div
              key={b.label}
              className="trust-badge"
              style={{
                background: 'linear-gradient(145deg, var(--bg2), var(--bg3))',
                border: '1px solid var(--border2)',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex', flexDirection: 'column', gap: '10px',
                transition: 'border-color 0.25s, transform 0.25s var(--ease-spring), box-shadow 0.25s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.borderColor = `${b.color}33`
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = `0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px ${b.color}18`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.borderColor = 'var(--border2)'
                el.style.transform = ''
                el.style.boxShadow = ''
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `${b.color}14`,
                border: `1px solid ${b.color}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: b.color, flexShrink: 0,
              }}>
                {b.icon}
              </div>
              <div>
                <div style={{
                  fontSize: '13px', fontWeight: 600, color: 'var(--text)',
                  fontFamily: 'var(--font-inter)', marginBottom: '4px',
                }}>
                  {b.label}
                </div>
                <div style={{
                  fontSize: '11px', color: 'var(--text-3)',
                  fontFamily: 'var(--font-inter)', fontWeight: 300,
                  lineHeight: 1.5,
                }}>
                  {b.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Government data attribution */}
        <div style={{
          marginTop: '2.5rem',
          padding: '1rem 1.5rem',
          background: 'rgba(110,231,183,0.03)',
          border: '1px solid rgba(110,231,183,0.10)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--accent)', flexShrink: 0,
            boxShadow: '0 0 8px rgba(110,231,183,0.6)',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} aria-hidden="true" />
          <p style={{
            fontSize: '12px', color: 'var(--text-3)',
            fontFamily: 'var(--font-inter)', fontWeight: 300,
            lineHeight: 1.7, margin: 0, flex: 1,
          }}>
            Clinic data is sourced from{' '}
            <a href="https://findahealthcenter.hrsa.gov" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 400 }}>
              HRSA&apos;s federal FQHC directory
            </a>
            {' '}(14,000+ federally qualified health centers),{' '}
            <a href="https://www.nafcclinics.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 400 }}>
              NAFC&apos;s free clinic network
            </a>
            , and OpenStreetMap community-maintained health data.
            All data is cross-verified and updated weekly.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .trust-badge { padding: 1rem !important; }
        }
        @media (max-width: 480px) {
          [aria-labelledby="trust-title"] > div > div:nth-child(2) {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
