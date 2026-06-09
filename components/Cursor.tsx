'use client'
import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef       = useRef<HTMLDivElement>(null)
  const ringRef      = useRef<HTMLDivElement>(null)
  const spotRef      = useRef<HTMLDivElement>(null)
  const mouseRef     = useRef({ x: 0, y: 0 })
  const ringPos      = useRef({ x: 0, y: 0 })
  const rafRef       = useRef<number>(0)
  const frameSkip    = useRef(0)
  const lastTrailRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Automatically disable custom cursor for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Gate cursor: none behind this attribute so it only hides the system
    // cursor after the custom cursor is actually rendered (no flash on SSR).
    document.documentElement.setAttribute('data-custom-cursor', 'true')

    mouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    ringPos.current  = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    const dot  = dotRef.current
    const ring = ringRef.current
    const spot = spotRef.current
    if (!dot || !ring || !spot) return

    const TRAIL_THRESHOLD = 28 // px of movement before spawning a trail dot

    const spawnTrailDot = (x: number, y: number) => {
      const el = document.createElement('div')
      el.className = 'cursor-trail-dot'
      const size = 2 + Math.random() * 2.5
      el.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;`
      document.body.appendChild(el)
      // Clean up after the 500ms animation completes
      setTimeout(() => el.remove(), 520)
    }

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      dot.style.left  = e.clientX + 'px'
      dot.style.top   = e.clientY + 'px'
      spot.style.left = e.clientX + 'px'
      spot.style.top  = e.clientY + 'px'

      // Spawn a trail dot if mouse has moved far enough from last trail point
      const dx = e.clientX - lastTrailRef.current.x
      const dy = e.clientY - lastTrailRef.current.y
      if (Math.sqrt(dx * dx + dy * dy) > TRAIL_THRESHOLD) {
        lastTrailRef.current = { x: e.clientX, y: e.clientY }
        spawnTrailDot(e.clientX, e.clientY)
      }
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
      dot.style.width      = '12px'
      dot.style.height     = '12px'
      dot.style.background = 'var(--accent2)'
      dot.style.boxShadow  = '0 0 14px rgba(130,180,248,0.95), 0 0 32px rgba(130,180,248,0.55)'
      ring.style.width       = '52px'
      ring.style.height      = '52px'
      ring.style.borderColor = 'rgba(79,142,240,0.50)'
    }
    const onLeaveLink = () => {
      dot.style.width      = '8px'
      dot.style.height     = '8px'
      dot.style.background = 'var(--accent)'
      dot.style.boxShadow  = '0 0 10px rgba(79,142,240,0.9), 0 0 24px rgba(79,142,240,0.45)'
      ring.style.width       = '36px'
      ring.style.height      = '36px'
      ring.style.borderColor = 'rgba(79,142,240,0.45)'
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
      document.documentElement.removeAttribute('data-custom-cursor')
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
          boxShadow: '0 0 10px rgba(79,142,240,0.9), 0 0 24px rgba(79,142,240,0.45)',
          transition: 'width 0.2s var(--ease-spring), height 0.2s var(--ease-spring), background 0.2s, box-shadow 0.2s',
        }}
      />
      {/* Trailing ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '36px', height: '36px',
          border: '1.5px solid rgba(79,142,240,0.45)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: 'translate(-50%,-50%)',
          backdropFilter: 'blur(1px)',
          transition: 'width 0.3s var(--ease-spring), height 0.3s var(--ease-spring), border-color 0.2s',
        }}
      />
      {/* Ambient spot glow — soft, large */}
      <div
        ref={spotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '420px', height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,142,240,0.055) 0%, rgba(79,142,240,0.015) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
          transform: 'translate(-50%,-50%)',
          filter: 'blur(2px)',
        }}
      />
    </>
  )
}
