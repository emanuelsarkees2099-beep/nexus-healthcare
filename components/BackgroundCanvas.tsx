'use client'
import { useEffect, useRef, useState } from 'react'

type DotColor = 'mint' | 'violet' | 'amber'
interface Dot {
  x: number; y: number
  baseAlpha: number; alpha: number
  phase: number; speed: number
  color: DotColor
}

/* ── P1: prefers-reduced-motion guard ────────────────────────────
   If the user has requested reduced motion we skip the canvas entirely.
   This also eliminates the JS cost — not just the visual output.
   ─────────────────────────────────────────────────────────────── */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

export default function BackgroundCanvas() {
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef   = useRef<Dot[]>([])
  const mouseRef  = useRef({ x: -9999, y: -9999 })
  const rafRef    = useRef<number>(0)
  const pausedRef = useRef(false)
  const GRID = 44

  /* P1: skip entirely when reduced motion is active */
  if (reducedMotion) return null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 80% mint, 12% violet, 8% amber — richer atmosphere (#26)
    const pickColor = (): DotColor => {
      const r = Math.random()
      if (r < 0.80) return 'mint'
      if (r < 0.92) return 'violet'
      return 'amber'
    }

    const buildDots = () => {
      dotsRef.current = []
      const cols = Math.ceil(canvas.width  / GRID)
      const rows = Math.ceil(canvas.height / GRID)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dotsRef.current.push({
            x: c * GRID + GRID / 2,
            y: r * GRID + GRID / 2,
            baseAlpha: 0.04 + Math.random() * 0.04,
            alpha: 0,
            phase: Math.random() * Math.PI * 2,
            speed: 0.002 + Math.random() * 0.003,
            color: pickColor(),
          })
        }
      }
    }

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
      buildDots()
    }

    const draw = () => {
      if (!pausedRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const scrollY = window.scrollY
        for (const d of dotsRef.current) {
          d.phase += d.speed
          d.alpha = d.baseAlpha + Math.sin(d.phase) * 0.025
          const screenY = d.y - scrollY
          const dx = d.x - mouseRef.current.x
          const dy = screenY - mouseRef.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const glow = Math.max(0, 1 - dist / 260)
          const finalAlpha = Math.min(d.alpha + glow * 0.32, 0.65)
          // Multi-color dots: mint / violet / amber (#26)
          const rgb = d.color === 'violet' ? '167,139,250'
                    : d.color === 'amber'  ? '252,211,77'
                    : '110,231,183'
          ctx.beginPath()
          ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${rgb},${finalAlpha})`
          ctx.fill()
        }
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    /* ── Pause RAF when canvas is not in the viewport ── */
    const visObs = new IntersectionObserver(
      ([entry]) => { pausedRef.current = !entry.isIntersecting },
      { rootMargin: '300px' }
    )
    visObs.observe(canvas)

    /* ── P1: defer canvas boot until after first paint ─────────────
       requestIdleCallback fires after the browser has painted and the
       main thread is free, eliminating LCP blocking. Fallback to
       setTimeout(200) in Safari which lacks rIC.
       ─────────────────────────────────────────────────────────────── */
    let cleanupFn: (() => void) | null = null

    const boot = () => {
      resize()
      window.addEventListener('resize', resize, { passive: true })
      window.addEventListener('mousemove', onMouse, { passive: true })
      rafRef.current = requestAnimationFrame(draw)

      cleanupFn = () => {
        cancelAnimationFrame(rafRef.current)
        window.removeEventListener('resize', resize)
        window.removeEventListener('mousemove', onMouse)
        visObs.disconnect()
      }
    }

    let idleHandle: number | ReturnType<typeof setTimeout>
    if ('requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(boot, { timeout: 1000 })
    } else {
      idleHandle = setTimeout(boot, 200)
    }

    return () => {
      if ('cancelIdleCallback' in window && typeof idleHandle === 'number') {
        window.cancelIdleCallback(idleHandle as number)
      } else {
        clearTimeout(idleHandle as ReturnType<typeof setTimeout>)
      }
      cleanupFn?.()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="bg-canvas"
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
