'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 12000, suffix: '+', label: 'Free clinics indexed', prefix: '' },
  { value: 4, suffix: ' min', label: 'Time to find care', prefix: 'avg ' },
  { value: 48, suffix: '', label: 'Languages supported', prefix: '' },
  { value: 0, suffix: '', label: 'Cost to use NEXUS', prefix: '$' },
]

export default function Stats() {
  const rowRef = useRef<HTMLDivElement>(null)
  const numRefs = useRef<(HTMLSpanElement | null)[]>([])
  const animated = useRef(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax entrance
      gsap.from('.stat-item', {
        y: 50, opacity: 0, stagger: 0.1,
        scrollTrigger: {
          trigger: rowRef.current,
          start: 'top 88%',
          end: 'top 50%',
          scrub: 1,
        },
      })

      // Counter animation
      ScrollTrigger.create({
        trigger: rowRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          if (animated.current) return
          animated.current = true
          numRefs.current.forEach((el, i) => {
            if (!el) return
            const stat = STATS[i]
            const dur = 1800
            let start: number | null = null
            const step = (ts: number) => {
              if (!start) start = ts
              const p = Math.min((ts - start) / dur, 1)
              const eased = 1 - Math.pow(1 - p, 4)
              const v = Math.floor(eased * stat.value)
              el.textContent = stat.value > 100 ? v.toLocaleString() : String(v)
              if (p < 1) requestAnimationFrame(step)
            }
            requestAnimationFrame(step)
          })
        },
      })
    }, rowRef)
    return () => ctx.revert()
  }, [])

  return (
    <div
      role="region"
      aria-label="Key statistics"
      style={{
        position: 'relative', zIndex: 2,
        borderTop: '1px solid var(--border2)',
        borderBottom: '1px solid var(--border2)',
        padding: '3rem 0',
      }}
    >
      <div
        ref={rowRef}
        id="stats-row"
        style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '0 3rem',
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="stat-item"
            style={{
              textAlign: 'center',
              borderRight: i < STATS.length - 1 ? '1px solid var(--border2)' : 'none',
              padding: '0 2rem',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-sora)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginBottom: '6px',
            }}>
              {s.prefix}
              <span ref={el => { numRefs.current[i] = el }}>0</span>
              <span style={{ color: 'var(--accent)' }}>{s.suffix}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: 400, fontFamily: 'var(--font-inter)', letterSpacing: '0.02em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          #stats-row {
            grid-template-columns: repeat(2, 1fr) !important;
            padding: 0 1.25rem !important;
            gap: 1.5rem !important;
          }
          .stat-item { border-right: none !important; border-bottom: 1px solid var(--border2); padding: 1rem !important; }
          .stat-item:nth-child(odd) { border-right: 1px solid var(--border2) !important; }
          .stat-item:nth-last-child(-n+2) { border-bottom: none !important; }
        }
      `}</style>
    </div>
  )
}
