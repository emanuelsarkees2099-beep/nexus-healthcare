'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ShieldTick, Profile2User, DollarCircle, Hospital,
  Heart, Flash, TrendUp, RefreshCircle, ArrowRight,
} from 'iconsax-react'

/* Real federal / state programs the eligibility tool actually checks.
   No invented programs, no invented numbers — each line matches what the
   /eligibility calculator evaluates. */
const PROGRAMS = [
  { name: 'Medicaid',        icon: ShieldTick,    desc: 'Full coverage for low-income adults, children, and pregnant individuals.' },
  { name: 'CHIP',            icon: Profile2User,  desc: 'Children’s coverage for families earning just above the Medicaid line.' },
  { name: 'ACA Marketplace', icon: DollarCircle,  desc: 'Premium tax credits that can bring monthly plans down to $0.' },
  { name: 'HRSA Clinics',    icon: Hospital,      desc: 'Federally funded health centers — sliding-scale care for everyone.' },
  { name: 'Ryan White',      icon: Heart,         desc: 'HIV medical care and medications, at little or no cost.' },
  { name: 'Extra Help (LIS)',icon: Flash,         desc: 'Help paying Medicare Part D prescription drug costs.' },
  { name: 'SNAP',            icon: TrendUp,       desc: 'Food assistance — and a fast track to Medicaid in many states.' },
  { name: '340B Pricing',    icon: RefreshCircle, desc: '25–50% off prescriptions at participating clinics.' },
]

export default function ProgramsShowcase() {
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
      aria-labelledby="programs-showcase-title"
      style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto', padding: 'clamp(80px, 12vh, 130px) clamp(20px, 5vw, 40px) 0' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <p style={{ fontSize: '11px', fontWeight: 650, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px', fontFamily: 'var(--font-mono)', opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
          Coverage &amp; savings
        </p>
        <h2 id="programs-showcase-title" style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)',
          fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: '14px',
          color: 'var(--text)', textWrap: 'balance',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)',
          transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}>
          Every program, checked in one search
        </h2>
        <p style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto', fontFamily: 'var(--font-inter)', opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease 0.1s' }}>
          Answer a few questions and NEXUS scans the major federal and state programs
          you might qualify for — then shows you exactly where to apply.
        </p>
      </div>

      <div className="programs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {PROGRAMS.map((p, i) => {
          const Icon = p.icon
          return (
            <div key={p.name} style={{
              background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-card)', padding: '20px', textAlign: 'left',
              opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 55}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 55}ms`,
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'rgba(79,142,240,0.10)', border: '1px solid rgba(79,142,240,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
              }}>
                <Icon size={19} variant="Bulk" color="var(--accent)" />
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', marginBottom: '6px' }}>{p.name}</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-2)', lineHeight: 1.55, fontFamily: 'var(--font-inter)' }}>{p.desc}</div>
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2.5rem', opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease 0.3s' }}>
        <Link href="/eligibility" className="btn btn-primary btn-lg" style={{ padding: '14px 34px', fontSize: '15px' }}>
          Check what you qualify for
          <ArrowRight size={16} color="currentColor" variant="Linear" />
        </Link>
      </div>

      <style>{`
        @media (max-width: 900px) { .programs-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 460px) { .programs-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
