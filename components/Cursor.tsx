'use client'
import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)
  const mouseRef  = useRef({ x: 0, y: 0 })
  const ringPos   = useRef({ x: 0, y: 0 })
  const rafRef    = useRef<number>(0)
  const frameSkip = useRef(0)

  useEffect(() => {
    mouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    ringPos.current  = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    const dot  = dotRef.current
    const ring = ringRef.current
    const spot = spotRef.current
    if (!dot || !ring || !spot) return

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      dot.style.left  = e.clientX + 'px'
      dot.style.top   = e.clientY + 'px'
      spot.style.left = e.clientX + 'px'
      spot.style.top  = e.clientY + 'px'
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      // Only update ring every 2nd frame for performance
      frameSkip.current = (frameSkip.current + 1) % 2
      if (frameSkip.current === 0) {
        ringPos.current.x = lerp(ringPos.current.x, mouseRef.current.x, 0.12)
        ringPos.current.y = lerp(ringPos.current.y, mouseRef.current.y, 0.12)
        ring.style.left = ringPos.current.x + 'px'
        ring.style.top  = ringPos.current.y + 'px'
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const onEnterLink = () => {
      dot.style.width  = '14px'
      dot.style.height = '14px'
      dot.style.background   = 'var(--accent2)'
      ring.style.width       = '50px'
      ring.style.height      = '50px'
      ring.style.borderColor = 'rgba(109,145,151,0.35)'
    }
    const onLeaveLink = () => {
      dot.style.width  = '8px'
      dot.style.height = '8px'
      dot.style.background   = 'var(--accent)'
      ring.style.width       = '36px'
      ring.style.height      = '36px'
      ring.style.borderColor = 'rgba(109,145,151,0.40)'
    }

    const bindLinks = () => {
      document.querySelectorAll('a, button, [role="button"], input, [tabindex]').forEach(el => {
        el.addEventListener('mouseenter', onEnterLink)
        el.addEventListener('mouseleave', onLeaveLink)
      })
    }

    bindLinks()
    const observer = new MutationObserver(bindLinks)
    observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('mousemove', onMove, { passive: true })
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '8px', height: '8px',
          background: 'var(--accent)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%,-50%)',
          transition: 'width 0.2s var(--ease-spring), height 0.2s var(--ease-spring), background 0.2s',
        }}
      />
      {/* Trailing ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '36px', height: '36px',
          border: '1px solid rgba(109,145,151,0.40)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: 'translate(-50%,-50%)',
          transition: 'width 0.3s var(--ease-spring), height 0.3s var(--ease-spring), border-color 0.2s',
        }}
      />
      {/* Ambient spot glow — smaller for performance */}
      <div
        ref={spotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '340px', height: '340px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109,145,151,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
          transform: 'translate(-50%,-50%)',
        }}
      />
    </>
  )
}
