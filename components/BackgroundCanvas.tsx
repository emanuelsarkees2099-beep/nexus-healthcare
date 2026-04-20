'use client'
import { useEffect, useRef } from 'react'

interface Dot {
  x: number
  y: number
  baseAlpha: number
  alpha: number
  phase: number
  speed: number
}

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)
  const GRID = 44

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const buildDots = () => {
      dotsRef.current = []
      const cols = Math.ceil(canvas.width / GRID)
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
          })
        }
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
      buildDots()
    }

    const draw = () => {
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
        ctx.beginPath()
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(110,231,183,${finalAlpha})`
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouse)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="bg-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
