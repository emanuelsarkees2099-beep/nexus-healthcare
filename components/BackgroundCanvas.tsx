'use client'
import { useEffect, useRef, useState } from 'react'

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

interface Orb {
  x: number; y: number
  vx: number; vy: number
  r: number
  phaseX: number; phaseY: number
  speedX: number; speedY: number
  r1: string; r2: string; r3: string // rgb values for gradient stops
}

const ORBS: Orb[] = [
  { x: 0.20, y: 0.30, vx: 0, vy: 0, r: 0.50, phaseX: 0.00, phaseY: 1.10, speedX: 0.00028, speedY: 0.00022, r1: '42,82,190', r2: '59,106,212',  r3: '79,142,240' },
  { x: 0.75, y: 0.20, vx: 0, vy: 0, r: 0.45, phaseX: 2.10, phaseY: 0.50, speedX: 0.00021, speedY: 0.00031, r1: '72,52,170', r2: '99,78,220',   r3: '130,100,240' },
  { x: 0.55, y: 0.65, vx: 0, vy: 0, r: 0.42, phaseX: 4.20, phaseY: 3.10, speedX: 0.00033, speedY: 0.00018, r1: '20,90,160', r2: '40,120,200',  r3: '70,160,230' },
  { x: 0.10, y: 0.75, vx: 0, vy: 0, r: 0.35, phaseX: 1.50, phaseY: 5.40, speedX: 0.00019, speedY: 0.00027, r1: '90,40,130', r2: '110,60,170',  r3: '140,90,210' },
]

function isMobileOrLowEnd(): boolean {
  if (typeof window === 'undefined') return false
  // Coarse pointer = touch device (phones/tablets)
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  // Low CPU count — Qualcomm 4xx series, older Snapdragons
  const lowCPU = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 8) <= 2
  return isTouch || lowCPU
}

export default function BackgroundCanvas() {
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const orbsRef   = useRef<Orb[]>(ORBS.map(o => ({ ...o })))

  // Skip WebGL on touch devices and low-end hardware — saves battery + GPU
  if (reducedMotion || isMobileOrLowEnd()) return null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      for (const orb of orbsRef.current) {
        orb.phaseX += orb.speedX
        orb.phaseY += orb.speedY

        const cx = (orb.x + Math.sin(orb.phaseX) * 0.22) * W
        const cy = (orb.y + Math.cos(orb.phaseY) * 0.18) * H
        const radius = orb.r * Math.min(W, H)

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        grad.addColorStop(0,    `rgba(${orb.r3},0.055)`)
        grad.addColorStop(0.35, `rgba(${orb.r2},0.030)`)
        grad.addColorStop(0.70, `rgba(${orb.r1},0.012)`)
        grad.addColorStop(1,    `rgba(${orb.r1},0)`)

        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    let cleanupFn: (() => void) | null = null
    const boot = () => {
      resize()
      window.addEventListener('resize', resize, { passive: true })
      rafRef.current = requestAnimationFrame(draw)
      cleanupFn = () => {
        cancelAnimationFrame(rafRef.current)
        window.removeEventListener('resize', resize)
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
