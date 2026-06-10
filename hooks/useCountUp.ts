'use client'
import type React from 'react'
/**
 * useCountUp — animates a number from 0 → target when element enters viewport.
 *
 * Usage:
 *   const { ref, displayValue } = useCountUp({ target: 12400, suffix: '+' })
 *   <div ref={ref}>{displayValue}</div>  // "12,400+"
 *
 * Options:
 *   target    — the final number to count to
 *   duration  — animation duration in ms (default: 1800)
 *   decimals  — decimal places (default: 0)
 *   prefix    — string prepended before the number (e.g. "$")
 *   suffix    — string appended after  the number (e.g. "M", "+", "%")
 *   separator — thousands separator (default: ",")
 *   threshold — IntersectionObserver threshold (default: 0.4)
 *   once      — only animate once (default: true)
 *   easing    — custom easing fn (default: easeOutExpo)
 */
import { useEffect, useRef, useState } from 'react'

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export interface CountUpOptions {
  target: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  separator?: string
  threshold?: number
  once?: boolean
  easing?: 'expo' | 'cubic' | ((t: number) => number)
}

export function useCountUp<T extends HTMLElement = HTMLDivElement>({
  target,
  duration = 1800,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  threshold = 0.4,
  once = true,
  easing = 'expo',
}: CountUpOptions) {
  const ref = useRef<T>(null)
  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`)
  const animatingRef = useRef(false)
  const doneRef = useRef(false)

  // Resolve easing fn
  const easeFn = typeof easing === 'function'
    ? easing
    : easing === 'cubic'
    ? easeOutCubic
    : easeOutExpo

  // Formatter — adds thousands separators + decimals
  function format(n: number): string {
    const fixed = n.toFixed(decimals)
    if (!separator) return `${prefix}${fixed}${suffix}`
    const [integer, decimal] = fixed.split('.')
    const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return `${prefix}${formatted}${decimal !== undefined ? '.' + decimal : ''}${suffix}`
  }

  useEffect(() => {
    // Don't animate if prefers-reduced-motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplayValue(format(target))
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        if (once && doneRef.current) return
        if (animatingRef.current) return

        animatingRef.current = true
        if (once) observer.disconnect()

        const startTime = performance.now()

        const tick = (now: number) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = easeFn(progress)
          const current = eased * target

          setDisplayValue(format(current))

          if (progress < 1) {
            requestAnimationFrame(tick)
          } else {
            setDisplayValue(format(target))
            animatingRef.current = false
            doneRef.current = true
          }
        }

        requestAnimationFrame(tick)
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  // Cast to allow attaching to any HTMLElement subtype without TypeScript warnings
  return { ref: ref as React.RefObject<T>, displayValue }
}
