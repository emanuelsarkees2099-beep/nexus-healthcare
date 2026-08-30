'use client'
import { useEffect, useRef, useState } from 'react'

/* A single large statement — the mission, stated plainly. Gives the long
   scroll a moment of pause between the stats and the how-it-works steps. */
export default function MissionBand() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.3 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      aria-label="Our mission"
      style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', padding: 'clamp(90px, 14vh, 150px) clamp(20px, 5vw, 40px) 0', textAlign: 'center' }}
    >
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.7rem, 4vw, 3.1rem)',
        fontWeight: 700, lineHeight: 1.18, letterSpacing: '-0.03em',
        color: 'var(--text)', textWrap: 'balance', margin: 0,
        opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
      }}>
        Getting care shouldn&apos;t depend on luck, income, or knowing the right{' '}
        <span style={{ color: 'var(--accent)' }}>paperwork.</span>
      </p>
      <p style={{
        fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)', color: 'var(--text-2)',
        lineHeight: 1.7, fontFamily: 'var(--font-inter)', maxWidth: '520px',
        margin: '1.75rem auto 0',
        opacity: visible ? 1 : 0, transition: 'opacity 0.9s ease 0.2s',
      }}>
        Tens of millions of Americans go without care every year — not because
        help doesn&apos;t exist, but because it&apos;s buried. AXVO surfaces it.
      </p>
    </section>
  )
}
