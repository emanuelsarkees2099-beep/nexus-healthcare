'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap-st'
import type React from 'react'
registerGSAP()

/* ─────────────────────────────────────────────────────────────────────────
   SplitText — Word-by-word masked reveal (the Linear / Stripe technique).

   Each word is wrapped in a clip-mask container; the inner word slides up
   from translateY(110%) → 0 with a stagger. The invisible "floor" of each
   wrapper hides the word until it animates into view — producing the
   premium "words rising up" reveal.

   Usage:
     <SplitText stagger={0.05} triggerStart="top 85%">
       Your section heading here
     </SplitText>

   • ScrollTrigger: fires once per page load when element enters viewport
   • Respects prefers-reduced-motion (no animation, text shows immediately)
   • Works inside h1, h2, p — any text container
   ───────────────────────────────────────────────────────────────────────── */

interface SplitTextProps {
  children: string
  className?: string
  style?: React.CSSProperties
  /** GSAP stagger in seconds between each word. Default 0.045. */
  stagger?: number
  /** GSAP delay before first word starts (seconds). Default 0. */
  delay?: number
  /** ScrollTrigger start position. Default "top 88%". */
  triggerStart?: string
  /** Split by "words" (default) or "chars". */
  mode?: 'words' | 'chars'
  /** Y offset to start from (px). Default 28. */
  fromY?: number
}

export default function SplitText({
  children,
  className,
  style,
  stagger = 0.045,
  delay = 0,
  triggerStart = 'top 88%',
  mode = 'words',
  fromY = 28,
}: SplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const units = mode === 'words' ? children.split(' ') : children.split('')

  useEffect(() => {
    /* No animation if user prefers reduced motion */
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return

    const ctx = gsap.context(() => {
      const innerSpans = containerRef.current?.querySelectorAll<HTMLElement>('.st-inner')
      if (!innerSpans?.length) return

      gsap.set(innerSpans, { y: fromY, opacity: 0 })
      gsap.to(innerSpans, {
        y: 0,
        opacity: 1,
        duration: 0.72,
        ease: 'power3.out',
        stagger,
        delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: triggerStart,
          once: true,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [stagger, delay, triggerStart, fromY, children])

  return (
    <span
      ref={containerRef}
      className={className}
      style={{ display: 'inline', ...style }}
    >
      {units.map((unit, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'bottom',
            /* Tiny padding prevents descender clipping (g, y, p) */
            paddingBottom: '0.08em',
            marginBottom: '-0.08em',
          }}
        >
          <span className="st-inner" style={{ display: 'inline-block' }}>
            {unit}
            {/* Re-insert the space between words */}
            {mode === 'words' && i < units.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </span>
  )
}
