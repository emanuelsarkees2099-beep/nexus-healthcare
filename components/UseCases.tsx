'use client'
import { useEffect, useRef, useState } from 'react'
import {
  CloseCircle, Briefcase, Health, Global, Book1, Profile2User,
} from 'iconsax-react'

/* Honest scenarios — the real situations that bring people to NEXUS.
   No personas invented for effect; each maps to a coverage gap the
   product genuinely helps with. */
const CASES = [
  { icon: CloseCircle,  title: 'No insurance at all',   body: 'Find free and sliding-scale clinics that treat you regardless of coverage or ability to pay.' },
  { icon: Briefcase,    title: 'Between jobs',          body: 'Lost employer coverage? See ACA special-enrollment options and interim free care.' },
  { icon: Health,       title: 'Underinsured',          body: 'High deductible eating you alive? Find lower-cost care and prescription assistance.' },
  { icon: Global,       title: 'New to the country',    body: 'HRSA-funded health centers serve everyone, regardless of immigration status.' },
  { icon: Book1,        title: 'Student or gig worker', body: 'No W-2 benefits? Check Medicaid, ACA subsidies, and campus or community options.' },
  { icon: Profile2User, title: 'Helping someone else',  body: 'Searching for a parent, child, or friend? NEXUS needs no account to look.' },
]

export default function UseCases() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.15 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      aria-labelledby="usecases-title"
      style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto', padding: 'clamp(80px, 12vh, 130px) clamp(20px, 5vw, 40px) 0' }}
    >
      <div style={{ marginBottom: '3.5rem', maxWidth: '560px' }}>
        <p style={{ fontSize: '11px', fontWeight: 650, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px', fontFamily: 'var(--font-mono)', opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
          Who it&apos;s for
        </p>
        <h2 id="usecases-title" style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)',
          fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: '14px',
          color: 'var(--text)', textWrap: 'balance',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)',
          transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}>
          Whatever brought you here
        </h2>
        <p style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)', color: 'var(--text-2)', lineHeight: 1.7, fontFamily: 'var(--font-inter)', opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease 0.1s' }}>
          Most people find NEXUS at a stressful moment. It&apos;s built to meet you at yours.
        </p>
      </div>

      <div className="usecases-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {CASES.map((c, i) => {
          const Icon = c.icon
          return (
            <div key={c.title} style={{
              background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-card)', padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px',
              opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms`,
            }}>
              <Icon size={22} variant="Bulk" color="var(--accent)" />
              <div style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{c.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, fontFamily: 'var(--font-inter)' }}>{c.body}</div>
            </div>
          )
        })}
      </div>

      <style>{`
        @media (max-width: 860px) { .usecases-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .usecases-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
