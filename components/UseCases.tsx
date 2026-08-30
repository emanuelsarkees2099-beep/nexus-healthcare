'use client'
import { useEffect, useRef, useState } from 'react'
import {
  CloseCircle, Briefcase, Health, Global, Book1, Profile2User,
} from 'iconsax-react'

/* Honest scenarios that bring people to AXVO. */
const CASES = [
  { icon: CloseCircle,  title: 'No insurance at all',   body: 'Find free and sliding-scale clinics that treat you regardless of coverage.' },
  { icon: Briefcase,    title: 'Between jobs',          body: 'Lost employer coverage? See ACA special-enrollment options and interim care.' },
  { icon: Health,       title: 'Underinsured',          body: 'High deductible? Find lower-cost care and prescription assistance.' },
  { icon: Global,       title: 'New to the country',    body: 'HRSA health centers serve everyone, regardless of immigration status.' },
  { icon: Book1,        title: 'Student or gig worker', body: 'No W-2 benefits? Check Medicaid, ACA subsidies, and community options.' },
  { icon: Profile2User, title: 'Helping someone',       body: 'Searching for a parent, child, or friend? No account needed to look.' },
]

export default function UseCases() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.12 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      aria-labelledby="usecases-title"
      style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto', padding: 'clamp(80px, 12vh, 130px) clamp(20px, 5vw, 40px) 0', textAlign: 'center' }}
    >
      <div style={{ marginBottom: '3rem', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)', transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
        <p style={{ fontSize: '11px', fontWeight: 650, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>
          Who it&apos;s for
        </p>
        <h2 id="usecases-title" style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)',
          fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, color: 'var(--text)', textWrap: 'balance',
        }}>
          Whatever brought you here
        </h2>
      </div>

      {/* One unified panel divided by internal hairlines — reads as a single
          object, not a scatter of cards (that's the Programs/Features look). */}
      <div className="usecases-panel" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
        border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-card)',
        overflow: 'hidden', background: 'var(--border-subtle)',
        opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease 0.1s',
      }}>
        {CASES.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.title} style={{
              textAlign: 'left', padding: 'clamp(22px, 3vw, 32px)',
              background: 'var(--bg)',
              display: 'flex', flexDirection: 'column', gap: '11px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '11px',
                background: 'linear-gradient(140deg, rgba(95,158,249,0.20), rgba(79,142,240,0.06))',
                border: '1px solid rgba(95,158,249,0.22)',
                display: 'grid', placeItems: 'center',
              }}>
                <Icon size={20} variant="Bulk" color="var(--accent2)" />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{c.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, fontFamily: 'var(--font-inter)' }}>{c.body}</div>
            </div>
          )
        })}
      </div>

      <style>{`
        @media (max-width: 820px) { .usecases-panel { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .usecases-panel { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
