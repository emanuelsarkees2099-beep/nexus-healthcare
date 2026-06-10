'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap-st'
registerGSAP()

const STATS = [
  { num: '30M+',   label: 'Americans without coverage',  color: 'var(--accent)' },
  { num: '18,400', label: 'free clinics mapped',          color: 'var(--success)' },
  { num: '$0',     label: 'forever — for every patient',  color: 'var(--text)' },
]

/* Split headline into words with line breaks preserved */
const LINE_1 = ['30', 'million', 'Americans']
const LINE_2 = ["can't", 'afford', 'healthcare.']
const LINE_3_PREFIX = ['This', 'is', 'for']
const LINE_3_ACCENT = 'them.'

export default function TrustBadges() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Eyebrow rule fades in */
      gsap.from('.impact-eyebrow', {
        opacity: 0, y: 18, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
      })

      /* Words materialise: blur-in + rise, staggered */
      gsap.set('.impact-word', { opacity: 0, y: 36, filter: 'blur(10px)' })
      gsap.to('.impact-word', {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 0.95, ease: 'power4.out', stagger: 0.055,
        scrollTrigger: { trigger: '.impact-headline', start: 'top 82%', once: true },
      })

      /* Stats pop up with spring */
      gsap.from('.impact-stat', {
        opacity: 0, y: 48, scale: 0.82,
        duration: 0.9, ease: 'back.out(1.7)', stagger: 0.12,
        scrollTrigger: { trigger: '.impact-stats-row', start: 'top 86%', once: true },
      })

      /* Divider lines wipe from center */
      gsap.from('.impact-divider', {
        scaleX: 0, opacity: 0, duration: 1.1, ease: 'power3.out',
        transformOrigin: 'center',
        scrollTrigger: { trigger: '.impact-stats-row', start: 'top 88%', once: true },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="impact-title"
      style={{
        position: 'relative', zIndex: 2,
        padding: 'clamp(80px, 10vw, 130px) clamp(1.5rem, 4vw, 3rem)',
        textAlign: 'center', overflow: 'hidden',
      }}
    >
      {/* Ambient top glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(79,142,240,0.055) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      {/* Eyebrow */}
      <div className="impact-eyebrow" style={{
        display: 'inline-flex', alignItems: 'center', gap: '14px',
        marginBottom: '3.5rem',
      }}>
        <span aria-hidden="true" style={{
          display: 'block', width: '36px', height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--border))',
        }} />
        <span style={{
          fontSize: '11px', fontWeight: 400, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'var(--text-3)',
          fontFamily: 'var(--font-inter)',
        }}>
          The mission
        </span>
        <span aria-hidden="true" style={{
          display: 'block', width: '36px', height: '1px',
          background: 'linear-gradient(90deg, var(--border), transparent)',
        }} />
      </div>

      {/* Headline */}
      <div
        id="impact-title"
        className="impact-headline"
        style={{ maxWidth: '960px', margin: '0 auto 5rem' }}
      >
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.6rem, 6.5vw, 6rem)',
          fontWeight: 800,
          lineHeight: 1.0,
          letterSpacing: '-0.04em',
        }}>
          {/* Line 1 */}
          <div style={{ overflow: 'hidden', marginBottom: '0.06em', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.22em' }}>
            {LINE_1.map((w, i) => (
              <span key={i} className="impact-word" style={{ display: 'inline-block', color: 'var(--text)' }}>
                {w}
              </span>
            ))}
          </div>
          {/* Line 2 */}
          <div style={{ overflow: 'hidden', marginBottom: '0.06em', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.22em' }}>
            {LINE_2.map((w, i) => (
              <span key={i} className="impact-word" style={{ display: 'inline-block', color: 'rgba(248,249,255,0.48)' }}>
                {w}
              </span>
            ))}
          </div>
          {/* Line 3 */}
          <div style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.22em' }}>
            {LINE_3_PREFIX.map((w, i) => (
              <span key={i} className="impact-word" style={{ display: 'inline-block', color: 'rgba(248,249,255,0.48)' }}>
                {w}
              </span>
            ))}
            <span className="impact-word" style={{ display: 'inline-block', color: 'var(--accent)', fontStyle: 'italic' }}>
              {LINE_3_ACCENT}
            </span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="impact-stats-row" style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: '0', flexWrap: 'wrap',
        maxWidth: '680px', margin: '0 auto',
      }}>
        {STATS.map((s, i) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
            <div className="impact-stat" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '6px', padding: '0 clamp(1.5rem, 4vw, 3rem)',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
                fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1,
                color: s.color,
              }}>
                {s.num}
              </div>
              <div style={{
                fontSize: '13px', color: 'var(--text-3)',
                fontFamily: 'var(--font-inter)', fontWeight: 400,
                letterSpacing: '0.01em', lineHeight: 1.4,
                maxWidth: '120px', textAlign: 'center',
              }}>
                {s.label}
              </div>
            </div>
            {/* Vertical divider between stats */}
            {i < STATS.length - 1 && (
              <div className="impact-divider" aria-hidden="true" style={{
                width: '1px', height: '48px', flexShrink: 0,
                background: 'linear-gradient(180deg, transparent, var(--border), transparent)',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Bottom rule */}
      <div className="impact-divider" aria-hidden="true" style={{
        height: '1px', maxWidth: '240px', margin: '4.5rem auto 0',
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
      }} />

      <style>{`
        @media (max-width: 600px) {
          .impact-stats-row { flex-direction: column; gap: 2rem; }
          .impact-stats-row [aria-hidden="true"] { display: none; }
        }
      `}</style>
    </section>
  )
}
