'use client'
import { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { TrendUp, Global, ShieldTick, TickCircle, SearchNormal1 } from 'iconsax-react'

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</div>
  )
}

/* The real problem NEXUS is built for — publicly documented facts,
   attributed to their source. No invented platform metrics. */
const PROBLEM = [
  { stat: '~26M', label: 'Americans are uninsured', src: 'KFF' },
  { stat: '~100M', label: 'carry some form of medical debt', src: 'KFF / CFPB' },
  { stat: '30M+', label: 'patients served yearly by community health centers', src: 'HRSA' },
]

/* What NEXUS actually provides today — verifiable facts about the product. */
const CAPABILITIES = [
  { icon: <ShieldTick size={18} variant="Bold" color="var(--accent)" />, title: '18,900+ clinics indexed', body: 'Federally Qualified Health Centers, free clinics, and sliding-scale providers — sourced from HRSA and verified public data.' },
  { icon: <Global size={18} variant="Bold" color="var(--accent)" />, title: '48 languages', body: 'The whole platform — search, triage, results — works in the language people actually speak.' },
  { icon: <TickCircle size={18} variant="Bold" color="var(--accent)" />, title: '$0 to use, no account', body: 'Search, triage, and eligibility all work anonymously. We never sell data and never charge patients.' },
]

export default function ImpactPage() {
  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Hero */}
        <section style={{ maxWidth: '820px', margin: '0 auto', padding: 'clamp(48px, 8vh, 96px) clamp(20px, 5vw, 32px) 0', textAlign: 'center' }}>
          <Reveal>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', background: 'rgba(79,142,240,0.08)', border: '1px solid rgba(79,142,240,0.22)', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>
              <TrendUp size={14} variant="Bold" /> Our Impact
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: '20px', color: 'var(--text)' }}>
              Built to measure what<br />actually matters.
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 1.4vw, 1.1rem)', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto', fontFamily: 'var(--font-inter)' }}>
              NEXUS is new. Rather than invent numbers, we&apos;ll publish real, transparent outcomes here
              as we grow — and hold ourselves to them. Here is the problem we exist to solve, and what
              the product does today.
            </p>
          </Reveal>
        </section>

        {/* The problem */}
        <section style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(48px, 8vh, 80px) clamp(20px, 5vw, 32px) 0' }}>
          <Reveal>
            <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: 650, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '28px', fontFamily: 'var(--font-mono)' }}>
              The problem we&apos;re built for
            </p>
          </Reveal>
          <div className="impact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {PROBLEM.map((p, i) => (
              <Reveal key={p.label} delay={i * 80}>
                <div style={{ textAlign: 'center', padding: '28px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-card)', height: '100%' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1, marginBottom: '10px' }}>{p.stat}</div>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-2)', lineHeight: 1.5, fontFamily: 'var(--font-inter)', marginBottom: '8px' }}>{p.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>Source: {p.src}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* What NEXUS provides */}
        <section style={{ maxWidth: '820px', margin: '0 auto', padding: 'clamp(56px, 9vh, 96px) clamp(20px, 5vw, 32px) 0' }}>
          <Reveal>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: '36px', color: 'var(--text)' }}>
              What NEXUS does today
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gap: '14px' }}>
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.title} delay={i * 70}>
                <div style={{ display: 'flex', gap: '16px', padding: '22px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-card)' }}>
                  <div style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: 'var(--r-md)', background: 'rgba(79,142,240,0.08)', border: '1px solid rgba(79,142,240,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', marginBottom: '5px' }}>{c.title}</h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-2)', lineHeight: 1.6, fontFamily: 'var(--font-inter)' }}>{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Commitment + CTA */}
        <section style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(56px, 9vh, 112px) clamp(20px, 5vw, 32px) clamp(64px, 10vh, 112px)', textAlign: 'center' }}>
          <Reveal>
            <p style={{ fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.75, marginBottom: '28px', fontFamily: 'var(--font-inter)' }}>
              Our commitment: every number we publish will be real, sourced, and independently verifiable.
              When we have outcomes data, it will live here — with its methodology in the open.
            </p>
            <a href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '48px', padding: '0 26px', background: 'var(--grad-vital)', color: '#04121D', borderRadius: 'var(--r-lg)', fontSize: '15px', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-inter)', boxShadow: '0 4px 20px rgba(79,142,240,0.25)' }}>
              <SearchNormal1 size={16} variant="Bold" color="#04121D" /> Find free care near me
            </a>
          </Reveal>
        </section>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .impact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppShell>
  )
}
