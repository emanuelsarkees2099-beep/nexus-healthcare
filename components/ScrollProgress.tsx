'use client'
import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar  = barRef.current
    const glow = glowRef.current
    if (!bar || !glow) return

    const update = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct = total > 0 ? Math.min((scrolled / total) * 100, 100) : 0
      bar.style.width  = pct + '%'
      glow.style.width = pct + '%'
    }

    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', top: 0, left: 0,
        height: '2px', zIndex: 9997,
        width: '100%', background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      {/* Glow layer */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          height: '100%', width: '0%',
          background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
          filter: 'blur(3px)',
          opacity: 0.7,
          transition: 'width 0.1s linear',
        }}
      />
      {/* Solid bar */}
      <div
        ref={barRef}
        style={{
          position: 'relative',
          height: '100%', width: '0%',
          background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
          boxShadow: '0 0 6px rgba(109,145,151,0.7)',
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  )
}
