'use client'
/**
 * CustomCursor — premium cursor replacement for desktop.
 *
 * Design language: Linear / Vercel style.
 *  • Small white dot (8px) that follows the mouse with spring lag
 *  • Expands to a blurred ring (32px) on hoverable elements
 *  • Shrinks to 4px on click (physical press feedback)
 *  • Hides on mobile (touch devices via CSS)
 *  • Respects prefers-reduced-motion (disabled when active)
 *
 * Mounted once in GlobalClientComponents. Sets data-custom-cursor on <html>
 * which triggers `cursor: none` for the whole page.
 */
import { useEffect, useRef, useState } from 'react'

type CursorState = 'default' | 'hover' | 'click' | 'text'

const SPRING = 0.14     // lower = more lag (feels heavier/premium)
const SPRING_RING = 0.08 // ring trails more slowly than the dot

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  // Actual mouse position
  const mousePos  = useRef({ x: -200, y: -200 })
  // Interpolated positions
  const dotPos    = useRef({ x: -200, y: -200 })
  const ringPos   = useRef({ x: -200, y: -200 })
  const rafId     = useRef<number>(0)

  const [state, setState] = useState<CursorState>('default')
  const stateRef = useRef<CursorState>('default')

  // Update ref when state changes (to avoid stale closure in rAF)
  useEffect(() => { stateRef.current = state }, [state])

  // Check for touch device or reduced motion — bail out entirely
  const [active, setActive] = useState(false)
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isTouch && !reducedMotion) {
      setActive(true)
      document.documentElement.setAttribute('data-custom-cursor', 'true')
    }
    return () => document.documentElement.removeAttribute('data-custom-cursor')
  }, [])

  useEffect(() => {
    if (!active) return

    // Track mouse position
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }

    // Detect hoverable elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('[data-cursor="hover"]')
      ) {
        setState('hover')
      } else if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        setState('text')
      } else {
        setState('default')
      }
    }

    const onMouseDown = () => setState('click')
    const onMouseUp   = () => {
      // Return to whatever the hover state was
      const el = document.elementFromPoint(mousePos.current.x, mousePos.current.y) as HTMLElement
      if (el?.closest('a') || el?.closest('button') || el?.closest('[role="button"]')) {
        setState('hover')
      } else {
        setState('default')
      }
    }

    // Hide when cursor leaves window
    const onMouseLeave = () => {
      if (dotRef.current)  dotRef.current.style.opacity  = '0'
      if (ringRef.current) ringRef.current.style.opacity = '0'
    }
    const onMouseEnter = () => {
      if (dotRef.current)  dotRef.current.style.opacity  = '1'
      if (ringRef.current) ringRef.current.style.opacity = '1'
    }

    document.addEventListener('mousemove',  onMouseMove,  { passive: true })
    document.addEventListener('mouseover',  onMouseOver,  { passive: true })
    document.addEventListener('mousedown',  onMouseDown)
    document.addEventListener('mouseup',    onMouseUp)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    // Spring animation loop
    const animate = () => {
      const dot  = dotRef.current
      const ring = ringRef.current
      if (!dot || !ring) { rafId.current = requestAnimationFrame(animate); return }

      // Interpolate dot (faster spring)
      dotPos.current.x  += (mousePos.current.x - dotPos.current.x)  * (SPRING * 1.6)
      dotPos.current.y  += (mousePos.current.y - dotPos.current.y)  * (SPRING * 1.6)

      // Interpolate ring (slower spring)
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * SPRING_RING
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * SPRING_RING

      const s = stateRef.current

      // Dot: small sharp center dot
      const dotSize = s === 'click' ? 4 : s === 'hover' ? 4 : 8
      dot.style.transform = `translate(${dotPos.current.x - dotSize / 2}px, ${dotPos.current.y - dotSize / 2}px)`
      dot.style.width  = `${dotSize}px`
      dot.style.height = `${dotSize}px`
      dot.style.opacity = s === 'text' ? '0.3' : '1'

      // Ring: larger diffused trailing circle
      const ringSize   = s === 'hover' ? 44  : s === 'click' ? 22 : 32
      const ringOpacity = s === 'hover' ? 0.55 : s === 'click' ? 0.3 : 0.18
      const ringBorderColor = s === 'hover'
        ? 'rgba(79,142,240,0.70)'
        : s === 'click'
        ? 'rgba(255,255,255,0.60)'
        : 'rgba(255,255,255,0.28)'
      const ringBg = s === 'hover'
        ? 'rgba(79,142,240,0.07)'
        : 'transparent'

      ring.style.transform    = `translate(${ringPos.current.x - ringSize / 2}px, ${ringPos.current.y - ringSize / 2}px)`
      ring.style.width        = `${ringSize}px`
      ring.style.height       = `${ringSize}px`
      ring.style.opacity      = String(ringOpacity)
      ring.style.borderColor  = ringBorderColor
      ring.style.background   = ringBg

      rafId.current = requestAnimationFrame(animate)
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId.current)
      document.removeEventListener('mousemove',  onMouseMove)
      document.removeEventListener('mouseover',  onMouseOver)
      document.removeEventListener('mousedown',  onMouseDown)
      document.removeEventListener('mouseup',    onMouseUp)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [active])

  if (!active) return null

  return (
    <>
      {/* Outer ring — trails behind */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.28)',
          background: 'transparent',
          width: '32px',
          height: '32px',
          opacity: 0.18,
          transition: 'width 0.22s cubic-bezier(0.34,1.56,0.64,1), height 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease, background 0.22s ease, border-color 0.22s ease',
          willChange: 'transform',
          backdropFilter: 'blur(0px)',
        }}
      />
      {/* Inner dot — snappier, precise */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          pointerEvents: 'none',
          zIndex: 100000,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.90)',
          width: '8px',
          height: '8px',
          opacity: 1,
          transition: 'width 0.12s cubic-bezier(0.34,1.56,0.64,1), height 0.12s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s ease',
          willChange: 'transform',
          boxShadow: '0 0 6px rgba(255,255,255,0.4)',
        }}
      />

      {/* Hide the native cursor when data-custom-cursor is set */}
      <style>{`
        [data-custom-cursor="true"] *,
        [data-custom-cursor="true"] {
          cursor: none !important;
        }
        /* Re-show on touch / mobile */
        @media (hover: none) and (pointer: coarse) {
          [data-custom-cursor="true"] *,
          [data-custom-cursor="true"] {
            cursor: auto !important;
          }
        }
      `}</style>
    </>
  )
}
