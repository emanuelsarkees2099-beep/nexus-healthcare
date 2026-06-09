'use client'
import { useEffect, useRef, useState } from 'react'
import type React from 'react'

/* ─────────────────────────────────────────────────────────────────────────
   LuxeReveal — Premium character-by-character "velvet" reveal animation.

   Each character materialises from blur+scale into sharp focus with a
   spring-eased stagger. Once fully settled, a single glass-light gleam
   sweeps left→right using mix-blend-mode:overlay for a polished, lustrous
   finish — the same technique used on high-end product marketing pages.

   Usage:
     <LuxeReveal text="Your health" trigger={inView} delay={200} />

   • Runs once when `trigger` flips false → true
   • Respects prefers-reduced-motion (instant reveal, no gleam)
   ───────────────────────────────────────────────────────────────────────── */

export interface LuxeRevealProps {
  text: string
  /** Delay before animation starts (ms). Default 0. */
  delay?: number
  /** Stagger delay per character (ms). Default 30. */
  charDelay?: number
  className?: string
  style?: React.CSSProperties
  /** Set true to trigger the reveal. Default true. */
  trigger?: boolean
}

type Phase = 'hidden' | 'rising' | 'gleaming'

export default function LuxeReveal({
  text,
  delay = 0,
  charDelay = 30,
  className,
  style,
  trigger = true,
}: LuxeRevealProps) {
  const [phase, setPhase] = useState<Phase>('hidden')
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    /* Reduced motion: instant reveal, skip gleam */
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (trigger) setPhase('gleaming')
      return
    }

    if (!trigger) {
      setPhase('hidden')
      return
    }

    if (t1.current) clearTimeout(t1.current)
    if (t2.current) clearTimeout(t2.current)

    t1.current = setTimeout(() => {
      setPhase('rising')
      /* Start gleam after all chars finish their individual transitions
         (last char offset + transition duration) */
      const nonSpaceCount = text.replace(/ /g, '').length
      const lastCharOffset = Math.max(0, nonSpaceCount - 1) * charDelay
      const settleTime = lastCharOffset + 720  /* 720ms = longest char transition */
      t2.current = setTimeout(() => setPhase('gleaming'), settleTime)
    }, delay)

    return () => {
      if (t1.current) clearTimeout(t1.current)
      if (t2.current) clearTimeout(t2.current)
    }
  }, [trigger, delay, text, charDelay])

  const chars = text.split('')
  let nonSpaceIdx = -1

  return (
    <span
      className={className}
      style={{ position: 'relative', display: 'inline', ...style }}
      aria-label={text}
    >
      {/* ── Glass gleam — sweeps once after reveal ── */}
      {phase === 'gleaming' && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-0.05em',
            bottom: '-0.05em',
            left: '-90%',
            width: '70%',
            background: 'linear-gradient(105deg, transparent 10%, rgba(255,255,255,0.22) 38%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.05) 62%, transparent 78%)',
            mixBlendMode: 'overlay',
            animation: 'luxe-gleam 1.15s cubic-bezier(0.4,0,0.2,1) forwards',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}

      {/* ── Characters ── */}
      <span aria-hidden="true">
        {chars.map((char, i) => {
          if (char === ' ') {
            return (
              <span key={i} style={{ display: 'inline-block', width: '0.27em' }}>
                {' '}
              </span>
            )
          }
          nonSpaceIdx++
          const staggerMs = nonSpaceIdx * charDelay

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                willChange: 'opacity, filter, transform',
                opacity: phase === 'hidden' ? 0 : 1,
                filter: phase === 'hidden' ? 'blur(7px)' : 'blur(0px)',
                transform: phase === 'hidden' ? 'scale(0.88)' : 'scale(1)',
                transition: phase !== 'hidden'
                  ? [
                      `opacity 0.55s ${staggerMs}ms cubic-bezier(0.22,1,0.36,1)`,
                      `filter 0.50s ${staggerMs}ms cubic-bezier(0.22,1,0.36,1)`,
                      `transform 0.70s ${staggerMs}ms cubic-bezier(0.34,1.56,0.64,1)`,
                    ].join(', ')
                  : 'none',
              }}
            >
              {char}
            </span>
          )
        })}
      </span>

      <style>{`
        @keyframes luxe-gleam {
          0%   { left: -90%;  opacity: 0; }
          8%   { opacity: 1; }
          88%  { opacity: 1; }
          100% { left: 115%; opacity: 0; }
        }
      `}</style>
    </span>
  )
}
