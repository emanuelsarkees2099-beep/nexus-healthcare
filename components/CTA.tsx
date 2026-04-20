'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: '12,400+', label: 'Free clinics mapped' },
  { value: '50',      label: 'States covered' },
  { value: '$0',      label: 'Cost to use NEXUS' },
]

export default function CTA() {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef    = useRef<HTMLDivElement>(null)
  const rightRef   = useRef<HTMLDivElement>(null)
  const stat1Ref   = useRef<HTMLDivElement>(null)
  const stat2Ref   = useRef<HTMLDivElement>(null)
  const stat3Ref   = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(47318)
  const [displayedStats, setDisplayedStats] = useState({ clinics: '0', states: '0', cost: '$0' })

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3))
    }, 2800)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(leftRef.current, {
        x: -40, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
      gsap.from(rightRef.current, {
        x: 40, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.15,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
      gsap.from('.cta-stat', {
        y: 24, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: rightRef.current, start: 'top 80%' },
      })

      /* Animate stat counters */
      gsap.to({ clinics: 0, states: 0 }, {
        clinics: 12400,
        states: 50,
        duration: 2.2,
        ease: 'power2.out',
        scrollTrigger: { trigger: rightRef.current, start: 'top 75%' },
        onUpdate: function() {
          const vals = this.targets()[0]
          setDisplayedStats({
            clinics: Math.floor(vals.clinics).toLocaleString() + '+',
            states: Math.floor(vals.states).toString(),
            cost: '$0',
          })
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="cta-title"
      style={{ position: 'relative', zIndex: 2, padding: '0 2rem 120px' }}
    >
      {/* Full-width container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
      }}>

        {/* Top border line */}
        <div aria-hidden="true" style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(110,231,183,0.4) 30%, rgba(110,231,183,0.4) 70%, transparent)',
          marginBottom: '80px',
        }} />

        {/* Two-column layout */}
        <div id="cta-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
        }}>

          {/* ── LEFT: headline + description + buttons ── */}
          <div ref={leftRef}>

            {/* Live pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(110,231,183,0.07)',
              border: '1px solid rgba(110,231,183,0.16)',
              borderRadius: '100px',
              padding: '5px 14px',
              fontSize: '12px', fontWeight: 400,
              color: 'var(--text-3)',
              fontFamily: 'var(--font-inter)',
              marginBottom: '1.75rem',
            }}>
              <span aria-hidden="true" style={{
                display: 'inline-block', width: '6px', height: '6px',
                borderRadius: '50%', background: 'var(--accent)',
                animation: 'pulse-dot 1.8s ease-in-out infinite',
              }} />
              <span aria-live="polite">
                <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>
                  {count.toLocaleString()}
                </strong>
                {' '}found care this month
              </span>
            </div>

            {/* Headline */}
            <h2
              id="cta-title"
              style={{
                fontFamily: 'var(--font-sora)',
                fontSize: 'clamp(2.4rem, 3.8vw, 3.8rem)',
                fontWeight: 700,
                lineHeight: 1.04,
                letterSpacing: '-0.03em',
                marginBottom: '1.5rem',
              }}
            >
              Your health{' '}
              <em style={{
                fontStyle: 'italic',
                color: 'var(--accent)',
              }}>
                doesn&apos;t wait.
              </em>
              <br />
              Neither should you.
            </h2>

            {/* Description */}
            <p style={{
              fontSize: '16px',
              color: 'var(--text-2)',
              fontFamily: 'var(--font-inter)',
              fontWeight: 300,
              lineHeight: 1.85,
              maxWidth: '440px',
              marginBottom: '2.25rem',
            }}>
              NEXUS finds free clinics, hidden programs, and real care within
              miles of you — in seconds. No insurance, no signup, no cost.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <button
                className="btn-shimmer"
                style={{
                  background: 'var(--accent)',
                  color: '#07070F',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 30px',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sora)',
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 4px 24px rgba(110,231,183,0.30)',
                  transition: 'transform 0.2s var(--ease-spring), box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 8px 36px rgba(110,231,183,0.45)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(110,231,183,0.30)'
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
                onClick={() => router.push('/pathways')}
                aria-label="Find free care near you"
              >
                Find free care near me
              </button>
              <button
                style={{
                  background: 'transparent',
                  color: 'var(--text-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '14px 26px',
                  fontSize: '15px',
                  fontWeight: 400,
                  fontFamily: 'var(--font-inter)',
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s, transform 0.2s var(--ease-spring)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text)'
                  e.currentTarget.style.borderColor = 'rgba(110,231,183,0.35)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-2)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = ''
                }}
                onClick={() => { const el = document.getElementById('how'); if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 80; window.scrollTo({ top: y, behavior: 'smooth' }) } else { router.push('/#how') } }}
              >
                How it works
              </button>
            </div>

            {/* Trust row */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {['No signup', '100% anonymous', 'Always free'].map(label => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', color: 'var(--text-3)',
                  fontFamily: 'var(--font-inter)', fontWeight: 300,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: stat cards ── */}
          <div ref={rightRef} style={{ position: 'relative' }}>

            {/* Ambient glow */}
            <div aria-hidden="true" style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '400px', height: '400px',
              background: 'radial-gradient(circle, rgba(110,231,183,0.08) 0%, transparent 65%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }} />

            {/* Stats grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              position: 'relative',
            }}>

              {/* Large main stat — spans full width */}
              <div className="cta-stat animated-border" style={{
                gridColumn: '1 / -1',
                background: 'linear-gradient(145deg, var(--bg2), var(--bg3))',
                borderRadius: '20px',
                padding: '2rem 2.25rem',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div aria-hidden="true" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(110,231,183,0.35), transparent)',
                }} />
                <div style={{
                  fontSize: 'clamp(2.8rem, 5vw, 4rem)',
                  fontFamily: 'var(--font-sora)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  color: 'var(--text)',
                  lineHeight: 1,
                  marginBottom: '0.5rem',
                }}>
                  30<span style={{ color: 'var(--accent)' }}>M</span>
                </div>
                <div style={{
                  fontSize: '14px', color: 'var(--text-2)',
                  fontFamily: 'var(--font-inter)', fontWeight: 300, lineHeight: 1.6,
                }}>
                  uninsured Americans who deserve access to the care they need
                </div>
              </div>

              {/* Two smaller stats — with animated counters */}
              <div className="cta-stat" ref={stat1Ref} style={{
                background: 'linear-gradient(145deg, var(--bg2), var(--bg3))',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div aria-hidden="true" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(110,231,183,0.25), transparent)',
                }} />
                <div style={{
                  fontSize: '1.9rem',
                  fontFamily: 'var(--font-sora)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: 'var(--accent)',
                  lineHeight: 1,
                  marginBottom: '0.4rem',
                }}>{displayedStats.clinics}</div>
                <div style={{
                  fontSize: '12px', color: 'var(--text-3)',
                  fontFamily: 'var(--font-inter)', fontWeight: 300,
                }}>{STATS[0].label}</div>
              </div>

              <div className="cta-stat" ref={stat2Ref} style={{
                background: 'linear-gradient(145deg, var(--bg2), var(--bg3))',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div aria-hidden="true" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(110,231,183,0.25), transparent)',
                }} />
                <div style={{
                  fontSize: '1.9rem',
                  fontFamily: 'var(--font-sora)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: 'var(--accent)',
                  lineHeight: 1,
                  marginBottom: '0.4rem',
                }}>{displayedStats.states}</div>
                <div style={{
                  fontSize: '12px', color: 'var(--text-3)',
                  fontFamily: 'var(--font-inter)', fontWeight: 300,
                }}>{STATS[1].label}</div>
              </div>

              {/* Third stat — full width bottom */}
              <div className="cta-stat" style={{
                gridColumn: '1 / -1',
                background: 'rgba(110,231,183,0.05)',
                border: '1px solid rgba(110,231,183,0.14)',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{
                    fontSize: '1.6rem',
                    fontFamily: 'var(--font-sora)',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    color: 'var(--text)',
                    lineHeight: 1,
                    marginBottom: '0.3rem',
                  }}>{STATS[2].value}</div>
                  <div style={{
                    fontSize: '12px', color: 'var(--text-3)',
                    fontFamily: 'var(--font-inter)', fontWeight: 300,
                  }}>{STATS[2].label}</div>
                </div>
                <div style={{
                  fontSize: '12px', color: 'var(--accent)',
                  fontFamily: 'var(--font-inter)', fontWeight: 400,
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--border)',
                  borderRadius: '100px',
                  padding: '4px 14px',
                  letterSpacing: '0.02em',
                }}>
                  No insurance needed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom mobile styles */}
        <style>{`
          @media (max-width: 768px) {
            #cta-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  )
}
