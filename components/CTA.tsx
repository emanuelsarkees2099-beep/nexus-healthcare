'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap-st'
import { TickCircle } from 'iconsax-react'
import TextScramble from '@/components/TextScramble'
registerGSAP()

export default function CTA() {
  const router      = useRouter()
  const sectionRef  = useRef<HTMLElement>(null)
  const innerRef    = useRef<HTMLDivElement>(null)
  const [count,   setCount]   = useState(47318)
  const [inView,  setInView]  = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3))
    }, 2800)
    return () => clearInterval(id)
  }, [])

  /* Trigger TextScramble when section enters viewport */
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { threshold: 0.25 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cta-line', {
        y: 60, opacity: 0, duration: 1.1, ease: 'power4.out', stagger: 0.14,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      })
      gsap.from('.cta-proof', {
        y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', once: true },
      })
      gsap.from('.cta-actions', {
        y: 20, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', once: true },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="cta-title"
      style={{ position: 'relative', zIndex: 2, padding: '0 2rem 140px' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Separator line */}
        <div aria-hidden="true" style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(79,142,240,0.35) 30%, rgba(79,142,240,0.35) 70%, transparent)',
          marginBottom: '100px',
        }} />

        {/* Live pill eyebrow */}
        <div className="cta-line" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(79,142,240,0.07)', border: '1px solid rgba(79,142,240,0.16)',
            borderRadius: '100px', padding: '6px 16px',
            fontSize: '13px', fontWeight: 400, color: 'var(--text-3)',
            fontFamily: 'var(--font-inter)',
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
              {' '}people found care this month
            </span>
          </div>
        </div>

        {/* Headline — full width, centered, cinematic */}
        <div ref={innerRef} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2
            id="cta-title"
            className="cta-line"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 6.5vw, 6rem)',
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              marginBottom: 0,
            }}
          >
            <TextScramble
              text="Your health"
              trigger={inView}
              delay={200}
              duration={600}
              style={{ fontFamily: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit' }}
            />
            {' '}
            <em className="text-shimmer" style={{ fontStyle: 'italic' }}>
              doesn&apos;t wait.
            </em>
          </h2>
          <h2
            className="cta-line"
            aria-hidden="true"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 6.5vw, 6rem)',
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: 'var(--text-2)',
            }}
          >
            <TextScramble
              text="Neither should you."
              trigger={inView}
              delay={550}
              duration={700}
              style={{ fontFamily: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit' }}
            />
          </h2>
        </div>

        {/* Subline */}
        <p className="cta-line" style={{
          textAlign: 'center',
          fontSize: 'clamp(16px, 1.8vw, 19px)',
          color: 'var(--text-2)',
          fontFamily: 'var(--font-inter)',
          fontWeight: 400,
          lineHeight: 1.75,
          maxWidth: '520px',
          margin: '0 auto 3.5rem',
        }}>
          Free clinics, hidden programs, real care — found in seconds.
          No insurance, no signup, no cost.
        </p>

        {/* Primary CTA */}
        <div className="cta-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <button
            className="btn-shimmer magnetic-btn-full"
            style={{
              padding: '18px 52px',
              fontSize: '17px',
              fontFamily: 'var(--font-display)',
              color: '#fff',
              letterSpacing: '-0.01em',
            }}
            onMouseMove={e => {
              const btn = e.currentTarget
              const r = btn.getBoundingClientRect()
              const dx = e.clientX - (r.left + r.width  / 2)
              const dy = e.clientY - (r.top  + r.height / 2)
              const dist = Math.sqrt(dx * dx + dy * dy)
              btn.style.transform = dist < 110
                ? `translate(${dx * (1 - dist / 110) * 0.35}px, ${dy * (1 - dist / 110) * 0.35}px) translateY(-1px)`
                : 'translateY(-1px)'
            }}
            onMouseLeave={e => { e.currentTarget.style.transform = '' }}
            onClick={() => router.push('/pathways')}
            aria-label="Find free care near you"
          >
            Find free care near me
          </button>

          {/* Ghost secondary */}
          <button
            style={{
              background: 'transparent', color: 'var(--text-3)',
              border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 400,
              fontFamily: 'var(--font-inter)',
              transition: 'color 0.2s',
              padding: '4px 0',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(248,249,255,0.18)',
              textUnderlineOffset: '3px',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)' }}
            onClick={() => {
              const el = document.getElementById('how')
              if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 80; window.scrollTo({ top: y, behavior: 'smooth' }) }
              else { router.push('/#how') }
            }}
          >
            See how it works
          </button>
        </div>

        {/* Proof strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0', marginTop: '4rem',
          flexWrap: 'wrap',
        }}>
          {[
            { value: '30M',    label: 'uninsured Americans we serve' },
            { value: '12,400+', label: 'free clinics mapped' },
            { value: '50',     label: 'states covered' },
            { value: '$0',     label: 'cost to use NEXUS' },
          ].map((stat, i, arr) => (
            <div key={stat.value} className="cta-proof" style={{
              textAlign: 'center', padding: '0 2.5rem',
              borderRight: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <div style={{
                fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--text)',
                lineHeight: 1,
                marginBottom: '0.35rem',
              }}>{stat.value}</div>
              <div style={{
                fontSize: '12px', color: 'var(--text-3)',
                fontFamily: 'var(--font-inter)', fontWeight: 400,
                letterSpacing: '0.01em',
              }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Trust row */}
        <div className="cta-proof" style={{
          display: 'flex', gap: '24px', justifyContent: 'center',
          flexWrap: 'wrap', marginTop: '2.5rem',
        }}>
          {['No signup required', '100% anonymous', 'Always free'].map(label => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', color: 'var(--text-3)',
              fontFamily: 'var(--font-inter)', fontWeight: 400,
            }}>
              <TickCircle size={12} color="var(--accent)" variant="TwoTone" aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 640px) {
            .cta-proof { padding: 1rem 1.5rem !important; border-right: none !important; border-bottom: 1px solid var(--border-subtle); }
            .cta-proof:last-child { border-bottom: none; }
          }
        `}</style>
      </div>
    </section>
  )
}
