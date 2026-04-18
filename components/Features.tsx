'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { MapPin, BrainCircuit, ReceiptText, BarChart2, Users, CalendarDays, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const cardBase: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border2)',
  borderRadius: '20px',
  padding: '2rem',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.35s cubic-bezier(0.32,0.72,0,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
}

function BentoIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div aria-hidden="true" style={{
      width: '40px', height: '40px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '1.5rem',
      color: 'rgba(255,255,255,0.65)',
    }}>
      {icon}
    </div>
  )
}

function BentoTag({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-block',
      marginTop: '1.25rem',
      fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '5px',
      padding: '3px 9px',
      fontFamily: 'var(--font-inter)',
    }}>
      {children}
    </div>
  )
}

function ExploreLink() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      marginTop: '1.25rem',
      fontSize: '12px', color: 'var(--accent)',
      fontFamily: 'var(--font-inter)', fontWeight: 500,
      letterSpacing: '0.02em',
    }}>
      Explore feature <ArrowRight size={12} strokeWidth={2} />
    </div>
  )
}

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.section-intro', {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.section-intro', start: 'top 85%' },
      })

      const cardDefs = [
        { sel: '.bc-1', from: { x: -60, y: 30, opacity: 0 } },
        { sel: '.bc-2', from: { x: 40, y: -30, opacity: 0 } },
        { sel: '.bc-3', from: { x: 60, y: 20, opacity: 0 } },
        { sel: '.bc-4', from: { x: -40, y: 40, opacity: 0 } },
        { sel: '.bc-5', from: { x: -50, y: -20, opacity: 0 } },
        { sel: '.bc-6', from: { x: 60, y: 10, opacity: 0 } },
      ]
      cardDefs.forEach(({ sel, from }) => {
        gsap.from(sel, {
          ...from,
          scrollTrigger: { trigger: '.bento-grid', start: 'top 82%', end: 'top 30%', scrub: 1 },
        })
      })

      // Mouse tilt + spotlight
      document.querySelectorAll<HTMLElement>('.bento-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect()
          const lx = e.clientX - r.left
          const ly = e.clientY - r.top
          card.style.setProperty('--mouse-x', `${lx}px`)
          card.style.setProperty('--mouse-y', `${ly}px`)
          gsap.to(card, {
            rotateX: -(ly / r.height - 0.5) * 5,
            rotateY: (lx / r.width - 0.5) * 5,
            transformStyle: 'preserve-3d',
            duration: 0.4, ease: 'power2.out',
          })
        })
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' })
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="features"
      aria-labelledby="features-title"
      className="dot-grid-bg"
      style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '120px 3rem', overflow: 'visible' }}
    >
      <div className="section-glow-left" aria-hidden="true" style={{ top: '10%' }} />
      <div className="section-glow-right" aria-hidden="true" style={{ top: '50%' }} />

      {/* Section header */}
      <div className="section-intro" style={{ marginBottom: '4rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontSize: '11px', fontWeight: 400, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--accent)',
          marginBottom: '1.25rem', fontFamily: 'var(--font-inter)',
        }}>
          <span style={{ display: 'inline-block', width: '16px', height: '1px', background: 'var(--accent)' }} aria-hidden="true" />
          What NEXUS offers
        </div>
        <h2
          id="features-title"
          style={{
            fontFamily: 'var(--font-sora)', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
            fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em',
            marginBottom: '1.25rem',
          }}
        >
          Built for people the<br />system <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>overlooked</em>
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--text-2)', maxWidth: '480px', fontWeight: 400, lineHeight: 1.85, fontFamily: 'var(--font-inter)' }}>
          Every feature was designed around one question: what does an uninsured adult actually need to get care today?
        </p>
      </div>

      {/* ── BENTO GRID ── */}
      <div
        className="bento-grid"
        role="list"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px' }}
      >
        {/* BC-1: Clinic Finder — large, not linked (search-based) */}
        <div
          className="bento-card bc-1"
          role="listitem"
          style={{ ...cardBase, gridColumn: 'span 5', gridRow: 'span 2', minHeight: '340px' }}
        >
          <div className="card-depth-overlay" aria-hidden="true" />
          <BentoIcon icon={<MapPin size={18} strokeWidth={1.5} />} />
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', fontFamily: 'var(--font-sora)' }}>Clinic Finder</div>
          <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75, fontFamily: 'var(--font-inter)' }}>
            12,000+ federally qualified health centers, free clinics, and sliding-scale providers — searchable by specialty, language, wait time, and walk-in availability.
          </div>
          <BentoTag>Core feature</BentoTag>
          <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '8px', fontFamily: 'var(--font-inter)' }}>3 results · Phoenix, AZ</div>
            {[
              { name: 'Clinica Adelante', dist: '1.2 mi', active: true },
              { name: 'Valle del Sol Health', dist: '2.8 mi', active: false },
              { name: 'Mountain Park Health', dist: '4.1 mi', active: false },
            ].map(c => (
              <div key={c.name} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '12px', padding: '8px 10px',
                background: c.active ? 'rgba(109,145,151,0.06)' : 'rgba(255,255,255,0.02)',
                border: c.active ? '1px solid rgba(109,145,151,0.15)' : '1px solid transparent',
                borderRadius: '8px', marginBottom: '6px',
                fontFamily: 'var(--font-inter)',
              }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.active ? '#5a8a90' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                <span style={{ color: c.active ? 'var(--text)' : 'var(--text-2)', flex: 1, fontWeight: c.active ? 500 : 400 }}>{c.name}</span>
                <span style={{ color: 'var(--text-3)', fontSize: '11px' }}>{c.dist}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BC-2: AI Care Pathways */}
        <Link
          href="/pathways"
          className="bc-2"
          style={{ gridColumn: 'span 7', minHeight: '160px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="bento-card" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
              <BentoIcon icon={<BrainCircuit size={18} strokeWidth={1.5} />} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem', fontFamily: 'var(--font-sora)' }}>AI-Powered Care Pathways</div>
                <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75, fontFamily: 'var(--font-inter)' }}>
                  Our model predicts which clinic will actually see you based on your symptoms, zip code, and insurance — then routes you there instantly.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem' }}>
                  <BentoTag>AI-powered</BentoTag>
                  <ExploreLink />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* BC-3: Programs */}
        <Link
          href="/programs"
          className="bc-3"
          style={{ gridColumn: 'span 4', minHeight: '160px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="bento-card" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <BentoIcon icon={<ReceiptText size={18} strokeWidth={1.5} />} />
            <div style={{ fontFamily: 'var(--font-sora)', fontSize: '4rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.4rem', opacity: 0.9 }}>40+</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '0.3rem', fontFamily: 'var(--font-sora)' }}>Programs checked</div>
            <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.7, fontFamily: 'var(--font-inter)' }}>Medicaid, ACA, HRSA — all scanned instantly.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.75rem' }}>
              <BentoTag>Clearinghouse</BentoTag>
              <ExploreLink />
            </div>
          </div>
        </Link>

        {/* BC-4: Outcomes Tracker */}
        <Link
          href="/outcomes"
          className="bc-4"
          style={{ gridColumn: 'span 3', minHeight: '160px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="bento-card" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <BentoIcon icon={<BarChart2 size={18} strokeWidth={1.5} />} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '0.35rem', fontFamily: 'var(--font-sora)' }}>Outcomes Tracker</div>
            <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.7, fontFamily: 'var(--font-inter)' }}>47K+ visits powering publishable research.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.75rem' }}>
              <BentoTag>Research</BentoTag>
              <ExploreLink />
            </div>
          </div>
        </Link>

        {/* BC-5: CHW Network */}
        <Link
          href="/chw"
          className="bc-5"
          style={{ gridColumn: 'span 5', minHeight: '160px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="bento-card" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
              <BentoIcon icon={<Users size={18} strokeWidth={1.5} />} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem', fontFamily: 'var(--font-sora)' }}>CHW Network</div>
                <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75, fontFamily: 'var(--font-inter)' }}>
                  340+ verified Community Health Workers. Speak your language, know your neighborhood, navigate the system with you.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem' }}>
                  <BentoTag>Community</BentoTag>
                  <ExploreLink />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* BC-6: Preventive Care Calendar */}
        <Link
          href="/calendar"
          className="bc-6"
          style={{ gridColumn: 'span 7', minHeight: '160px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="bento-card" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
              <BentoIcon icon={<CalendarDays size={18} strokeWidth={1.5} />} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem', fontFamily: 'var(--font-sora)' }}>Preventive Care Calendar</div>
                <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75, fontFamily: 'var(--font-inter)' }}>
                  Your personalized screening schedule plus live free clinic events — dental days, mammography vans, vaccine drives.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem' }}>
                  <BentoTag>Events</BentoTag>
                  <ExploreLink />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

        {/* ── Also included pill row ── */}
        <div style={{ marginTop: '40px', paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>Also included</span>
          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
          {[
            { href: '/provider',      label: 'Provider Dashboard' },
            { href: '/impact',        label: 'Impact Dashboard' },
            { href: '/accessibility', label: 'Accessibility' },
            { href: '/stories',       label: 'Stories' },
            { href: '/rights',        label: 'Rights & Legal' },
            { href: '/advocacy',      label: 'Advocacy' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', color: 'rgba(255,255,255,0.45)',
                fontFamily: 'var(--font-inter)',
                textDecoration: 'none',
                padding: '5px 12px',
                borderRadius: '100px',
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.02)',
                transition: 'color 0.2s, border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                e.currentTarget.style.borderColor = 'rgba(109,145,151,0.3)'
                e.currentTarget.style.background = 'rgba(109,145,151,0.06)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              }}
            >
              {item.label} <ArrowRight size={10} strokeWidth={2} />
            </Link>
          ))}
        </div>

      <style>{`
        @media (max-width: 768px) {
          .bento-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .bc-1,.bc-2,.bc-3,.bc-4,.bc-5,.bc-6 { grid-column: span 1 !important; grid-row: span 1 !important; min-height: unset !important; }
        }
      `}</style>
    </section>
  )
}
