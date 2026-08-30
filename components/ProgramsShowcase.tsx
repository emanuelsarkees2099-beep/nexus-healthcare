'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ShieldTick, Profile2User, DollarCircle, Hospital,
  Heart, ArrowRight, TickCircle,
} from 'iconsax-react'

/* A focused set of the real programs the eligibility tool checks — the
   list is intentionally trimmed to five so the two columns stay balanced;
   the full set (SNAP, 340B, Extra Help, and more) lives on /eligibility. */
const PROGRAMS = [
  { name: 'Medicaid',        icon: ShieldTick,   desc: 'Full coverage for low-income adults, children, and pregnant individuals.' },
  { name: 'CHIP',            icon: Profile2User, desc: 'Children’s coverage for families just above the Medicaid line.' },
  { name: 'ACA Marketplace', icon: DollarCircle, desc: 'Premium tax credits that can bring monthly plans to $0.' },
  { name: 'HRSA Clinics',    icon: Hospital,     desc: 'Federally funded health centers — sliding-scale care for everyone.' },
  { name: 'Ryan White',      icon: Heart,        desc: 'HIV medical care and medications at little or no cost.' },
]

export default function ProgramsShowcase() {
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
      aria-labelledby="programs-showcase-title"
      style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', margin: '0 auto', padding: 'clamp(80px, 12vh, 130px) clamp(20px, 5vw, 40px) 0' }}
    >
      {/* Two-column editorial layout: a sticky-feeling intro on the left,
          a hairline-separated index of programs on the right — deliberately
          NOT another grid of cards. */}
      <div className="programs-layout" style={{ display: 'grid', gridTemplateColumns: '0.92fr 1fr', gap: 'clamp(32px, 6vw, 72px)', alignItems: 'center' }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)', transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
          <p style={{ fontSize: '11px', fontWeight: 650, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
            Coverage &amp; savings
          </p>
          <h2 id="programs-showcase-title" style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4.4vw, 3.4rem)',
            fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '20px',
            color: 'var(--text)', textWrap: 'balance',
          }}>
            Every program,<br />one search
          </h2>
          <p style={{ fontSize: 'clamp(1rem, 1.35vw, 1.12rem)', color: 'var(--text-2)', lineHeight: 1.72, fontFamily: 'var(--font-inter)', marginBottom: '24px', maxWidth: '30ch' }}>
            Answer a few questions and AXVO scans the major federal and state
            programs you might qualify for — then shows you exactly where to apply.
          </p>
          {/* honest reassurance line — also lengthens the left column to
              match the list on the right */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginBottom: '28px' }}>
            {['Free to check', 'No account needed', 'Calculated in your browser'].map(t => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
                <TickCircle size={13} color="var(--accent)" variant="Bulk" /> {t}
              </span>
            ))}
          </div>
          <Link href="/eligibility" className="btn btn-primary btn-lg" style={{ padding: '14px 30px', fontSize: '15px' }}>
            Check what you qualify for
            <ArrowRight size={16} color="currentColor" variant="Linear" />
          </Link>
        </div>

        <div>
          {PROGRAMS.map((p, i) => {
            const Icon = p.icon
            return (
              <div key={p.name} className="program-row" style={{
                display: 'flex', alignItems: 'flex-start', gap: '16px',
                padding: '18px 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(14px)',
                transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 55}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 55}ms`,
              }}>
                <Icon size={22} variant="Bulk" color="var(--accent)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <div style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', marginBottom: '3px' }}>{p.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.55, fontFamily: 'var(--font-inter)' }}>{p.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 780px) {
          .programs-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  )
}
