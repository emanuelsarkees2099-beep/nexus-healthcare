'use client'
import { useEffect, useRef, useState } from 'react'
import type React from 'react'

/* ─────────────────────────────────────────────────────────────────────────
   TextScramble — Matrix-style character scramble reveal.

   Characters rapidly cycle through random ASCII before settling on the
   real letter, producing the "hacker terminal" reveal seen on award-
   winning tech sites (Vercel, Linear, Awwwards winners).

   Usage:
     <TextScramble text="Free healthcare, unlocked" trigger={inView} />

   • Runs once each time `trigger` flips false → true
   • Respects prefers-reduced-motion (shows text immediately)
   • fontVariantNumeric: tabular-nums prevents layout jitter
   ───────────────────────────────────────────────────────────────────────── */

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&!?'

export interface TextScrambleProps {
  text: string
  /** Delay before animation starts (ms). Default 0. */
  delay?: number
  /** Duration of the full reveal (ms). Default 700. */
  duration?: number
  className?: string
  style?: React.CSSProperties
  /** Set true to trigger the scramble. Default true (runs on mount). */
  trigger?: boolean
}

export default function TextScramble({
  text,
  delay = 0,
  duration = 700,
  className,
  style,
  trigger = true,
}: TextScrambleProps) {
  const [display, setDisplay] = useState(text)
  const rafRef   = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    /* Reduced-motion: show text immediately, no animation */
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplay(text)
      return
    }

    if (!trigger) {
      /* Not yet triggered — show invisible placeholder to hold layout */
      setDisplay(text.replace(/\S/g, ' '))
      return
    }

    /* Clean up any running animation from previous renders */
    if (rafRef.current)   cancelAnimationFrame(rafRef.current)
    if (timerRef.current) clearTimeout(timerRef.current)
    startRef.current = null

    timerRef.current = setTimeout(() => {
      const frame = (ts: number) => {
        if (!startRef.current) startRef.current = ts
        const elapsed  = ts - startRef.current
        const progress = Math.min(elapsed / duration, 1)
        /* Ease-out cubic — characters settle from left → right */
        const eased    = 1 - Math.pow(1 - progress, 3)
        const revealed = Math.floor(eased * text.length)

        setDisplay(
          text
            .split('')
            .map((char, i) => {
              /* Preserve whitespace exactly */
              if (char === ' ' || char === '\n') return char
              /* Already revealed characters are locked */
              if (i < revealed) return char
              /* Scramble unrevealed characters */
              return CHARS[Math.floor(Math.random() * CHARS.length)]
            })
            .join('')
        )

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(frame)
        }
      }
      rafRef.current = requestAnimationFrame(frame)
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (rafRef.current)   cancelAnimationFrame(rafRef.current)
    }
  }, [trigger, text, delay, duration])

  return (
    <span
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: 'inherit', ...style }}
      aria-label={text}
    >
      <span aria-hidden="true">{display}</span>
    </span>
  )
}
