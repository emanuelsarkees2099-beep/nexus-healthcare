'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap-st'
import {
  ShieldTick, SecuritySafe, Eye, Profile2User,
  Star1, SecurityUser,
} from 'iconsax-react'
registerGSAP()

const BADGES = [
  {
    icon: ShieldTick,
    label: 'HRSA Data Source',
    desc: 'Clinic data sourced directly from HRSA federal API',
    color: 'var(--accent)',
  },
  {
    icon: SecuritySafe,
    label: 'Zero Data Sold',
    desc: 'We have never sold user data and structurally cannot',
    color: '#60a5fa',
  },
  {
    icon: Eye,
    label: '100% Anonymous',
    desc: 'No account required. Searches leave no trace.',
    color: '#60a5fa',
  },
  {
    icon: Profile2User,
    label: 'NACHC Network',
    desc: 'Aligned with National Assoc. of Community Health Centers',
    color: '#a78bfa',
  },
  {
    icon: Star1,
    label: 'Always Free',
    desc: 'NEXUS will never charge patients. Ever.',
    color: '#fbbf24',
  },
  {
    icon: SecurityUser,
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
      /* Badge entrance: scale+translate-Y reveal with spring stagger */
      gsap.set('.trust-badge', { y: 36, opacity: 0, scale: 0.88 })
      gsap.to('.trust-badge', {
        y: 0, opacity: 1, scale: 1,
        duration: 0.7, ease: 'back.out(1.6)', stagger: 0.075,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
      })

      /* Icon bounce-in: fires slightly after the badge itself */
      gsap.from('.trust-badge-icon', {
        scale: 0.35, rotation: -25, opacity: 0,
        duration: 0.55, ease: 'back.out(2.5)', stagger: 0.075,
        delay: 0.12,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
      })

      /* Attribution row: clip-wipe from left */
      gsap.from('.trust-attribution', {
        clipPath: 'inset(0 100% 0 0)', opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.trust-attribution', start: 'top 92%', once: true },
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
        background: 'linear-gradient(90deg, transparent, rgba(74,144,217,0.18) 30%, rgba(74,144,217,0.18) 70%, transparent)',
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
            fontFamily: 'var(--font-inter)', fontWeight: 400,
            lineHeight: 1.7, maxWidth: '420px', margin: '0 auto',
          }}>
            Your health searches are anonymous, your data is not sold, and the entire system is built to protect — not exploit — the people who need help most.{' '}
            <Link href="/privacy" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 400 }}>
              Full privacy policy &rarr;
            </Link>
          </p>
        </div>

        {/* Badges grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}>
          {BADGES.map(b => {
            const IconComp = b.icon
            return (
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
                <div
                  className="trust-badge-icon"
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: `${b.color}14`,
                    border: `1px solid ${b.color}28`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComp size={18} color={b.color} variant="TwoTone" />
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
                    fontFamily: 'var(--font-inter)', fontWeight: 400,
                    lineHeight: 1.5,
                  }}>
                    {b.desc}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Government data attribution */}
        <div className="trust-attribution" style={{
          marginTop: '2.5rem',
          padding: '1rem 1.5rem',
          background: 'rgba(74,144,217,0.03)',
          border: '1px solid rgba(74,144,217,0.10)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
          clipPath: 'inset(0 0% 0 0)',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--accent)', flexShrink: 0,
            boxShadow: '0 0 8px rgba(74,144,217,0.6)',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} aria-hidden="true" />
          <p style={{
            fontSize: '12px', color: 'var(--text-3)',
            fontFamily: 'var(--font-inter)', fontWeight: 400,
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
