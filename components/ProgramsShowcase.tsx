'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ShieldTick, Profile2User, DollarCircle, Hospital,
  Heart, Flash, TrendUp, RefreshCircle, ArrowRight,
} from 'iconsax-react'

/* Real federal / state programs the eligibility tool actually checks. */
const PROGRAMS = [
  { name: 'Medicaid',         icon: ShieldTick,    desc: 'Full coverage for low-income adults, children, and pregnant individuals.' },
  { name: 'CHIP',             icon: Profile2User,  desc: 'Children’s coverage for families just above the Medicaid line.' },
  { name: 'ACA Marketplace',  icon: DollarCircle,  desc: 'Premium tax credits that can bring monthly plans to $0.' },
  { name: 'HRSA Clinics',     icon: Hospital,      desc: 'Federally funded health centers — sliding-scale care for everyone.' },
  { name: 'Ryan White',       icon: Heart,         desc: 'HIV medical care and medications at little or no cost.' },
  { name: 'Extra Help (LIS)', icon: Flash,         desc: 'Help paying Medicare Part D prescription drug costs.' },
  { name: 'SNAP',             icon: TrendUp,       desc: 'Food assistance — and a fast track to Medicaid in many states.' },
  { name: '340B Pricing',     icon: RefreshCircle, desc: '25–50% off prescriptions at participating clinics.' },
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
      <div className="programs-layout" style={{ display: 'grid', gridTemplateColumns: '0.72fr 1fr', gap: 'clamp(32px, 6vw, 80px)', alignItems: 'start' }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)', transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
          <p style={{ fontSize: '11px', fontWeight: 650, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>
            Coverage &amp; savings
          </p>
          <h2 id="programs-showcase-title" style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)',
            fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: '16px',
            color: 'var(--text)', textWrap: 'balance',
          }}>
            Every program, one search
          </h2>
          <p style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)', color: 'var(--text-2)', lineHeight: 1.7, fontFamily: 'var(--font-inter)', marginBottom: '26px' }}>
            Answer a few questions and NEXUS scans the major federal and state
            programs you might qualify for — then shows you exactly where to apply.
          </p>
          <Link href="/eligibility" className="btn btn-primary" style={{ padding: '12px 26px', fontSize: '14px' }}>
            Check what you qualify for
            <ArrowRight size={15} color="currentColor" variant="Linear" />
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
