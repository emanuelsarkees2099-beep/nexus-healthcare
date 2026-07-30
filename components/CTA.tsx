'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap-st'
import { TickCircle, ArrowRight } from 'iconsax-react'
registerGSAP()

/* ═══════════════════════════════════════════════════════════════════
   CLOSING CTA — calm, confident, consistent.
   Redesigned away from the char-by-char LuxeReveal + scaling "ignite"
   glow (too dramatic for the app's tone) to a single gentle fade-up.
   Numbers unified to the same "18,900+" the rest of the page uses —
   the old proof strip ("30M we serve", "12,400+") was both inconsistent
   and an overclaim, so it's gone.
═══════════════════════════════════════════════════════════════════ */
export default function CTA() {
  const router     = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('.cta-rise', {
        y: 18, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.09,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="cta-title"
      style={{ position: 'relative', zIndex: 2, padding: '0 2rem 140px', overflow: 'hidden' }}
    >
      {/* Soft ambient glow — static, just a gentle fade-in (no scaling drama) */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: '50%', top: '34%',
        width: 'min(760px, 110vw)', height: '420px',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse, rgba(79,142,240,0.10) 0%, rgba(79,142,240,0.04) 45%, transparent 70%)',
        filter: 'blur(60px)',
        opacity: inView ? 1 : 0,
        transition: 'opacity 1s ease',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', textAlign: 'center' }}>

        {/* Separator */}
        <div aria-hidden="true" style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(79,142,240,0.30) 30%, rgba(79,142,240,0.30) 70%, transparent)',
          marginBottom: '90px',
        }} />

        {/* Live pill eyebrow — consistent clinic count */}
        <div className="cta-rise" style={{ marginBottom: '2.25rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(79,142,240,0.07)', border: '1px solid rgba(79,142,240,0.16)',
            borderRadius: '100px', padding: '6px 16px',
            fontSize: '13px', fontWeight: 400, color: 'var(--text-2)',
            fontFamily: 'var(--font-inter)',
          }}>
            <span aria-hidden="true" style={{
              display: 'inline-block', width: '6px', height: '6px',
              borderRadius: '50%', background: 'var(--accent)',
              animation: 'pulse-dot 1.8s ease-in-out infinite',
            }} />
            <span><strong style={{ color: 'var(--text)', fontWeight: 600 }}>18,900+</strong> free &amp; sliding-scale clinics, verified and live</span>
          </div>
        </div>

        {/* Headline — calm, no per-character reveal */}
        <h2
          id="cta-title"
          className="cta-rise"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.6rem, 5.5vw, 4.6rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            margin: '0 0 1.75rem',
            color: 'var(--text)',
            textWrap: 'balance',
          }}
        >
          Your health doesn&apos;t wait.<br />
          <span style={{ color: 'var(--text-3)' }}>Neither should you.</span>
        </h2>

        {/* Subline */}
        <p className="cta-rise" style={{
          fontSize: 'clamp(15px, 1.7vw, 18px)',
          color: 'var(--text-2)',
          fontFamily: 'var(--font-inter)',
          fontWeight: 400,
          lineHeight: 1.75,
          maxWidth: '480px',
          margin: '0 auto 2.75rem',
        }}>
          Free clinics, hidden programs, real care — found in seconds.
          No insurance, no signup, no cost.
        </p>

        {/* Actions */}
        <div className="cta-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <button
            className="btn btn-primary btn-lg"
            style={{ padding: '15px 40px', fontSize: '16px' }}
            onClick={() => router.push('/search')}
            aria-label="Find free care near you"
          >
            Find free care near me
            <ArrowRight size={17} color="currentColor" variant="Linear" />
          </button>

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

        {/* Trust row */}
        <div className="cta-rise" style={{
          display: 'flex', gap: '22px', justifyContent: 'center',
          flexWrap: 'wrap', marginTop: '2.75rem',
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
      </div>
    </section>
  )
}
