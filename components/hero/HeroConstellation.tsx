'use client'
/**
 * Hero constellation — "the network of care."
 * Sparse drifting nodes (clinics) that link up when they pass near each
 * other. Whisper-volume: low node count, low alpha, 30fps cap.
 *
 * Engineering:
 * • 2D canvas, no WebGL — ~40 nodes is nothing for the CPU
 * • IntersectionObserver pauses the loop when the hero is offscreen
 * • Disabled entirely for prefers-reduced-motion and small screens
 *   (phones get the aurora only — GPU and battery come first)
 */
import { useEffect, useRef } from 'react'

const NODE_COUNT = 42
const LINK_DIST = 130
const SPEED = 0.12
const FPS_INTERVAL = 1000 / 30

type Node = { x: number; y: number; vx: number; vy: number; r: number }

export default function HeroConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.innerWidth < 768) return // aurora only on phones

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let nodes: Node[] = []
    let raf = 0
    let running = false
    let last = 0
    let W = 0, H = 0

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = rect.width
      H = rect.height
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (nodes.length === 0) {
        nodes = Array.from({ length: NODE_COUNT }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * SPEED,
          vy: (Math.random() - 0.5) * SPEED,
          r: 0.8 + Math.random() * 1.2,
        }))
      }
    }

    const tick = (ts: number) => {
      if (!running) return
      raf = requestAnimationFrame(tick)
      if (ts - last < FPS_INTERVAL) return
      last = ts

      ctx.clearRect(0, 0, W, H)

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < -10) n.x = W + 10; else if (n.x > W + 10) n.x = -10
        if (n.y < -10) n.y = H + 10; else if (n.y > H + 10) n.y = -10
      }

      // Links first (under the dots)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < LINK_DIST * LINK_DIST) {
            const a = (1 - Math.sqrt(d2) / LINK_DIST) * 0.10
            ctx.strokeStyle = `rgba(79,142,240,${a})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = 'rgba(130,180,248,0.30)'
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(tick) } }
    const stop  = () => { running = false; cancelAnimationFrame(raf) }

    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    const io = new IntersectionObserver(
      ([e]) => { e.isIntersecting ? start() : stop() },
      { threshold: 0.05 }
    )
    io.observe(canvas)

    return () => { stop(); ro.disconnect(); io.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
