'use client'
/**
 * GlobalEffects — wires up page-wide visual enhancements that require
 * DOM access post-mount. Imported by HomeClientShell.
 *
 * Effects managed here:
 *   1. Section H2 word-reveal via IntersectionObserver + CSS class
 *   2. count-up for any [data-count-to] elements
 *   3. Ambient orb injection for key sections
 */
import { useEffect } from 'react'

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

function countUp(el: HTMLElement, target: number, duration = 1600) {
  let start: number | null = null
  const prefix = el.dataset.countPrefix ?? ''
  const suffix = el.dataset.countSuffix ?? ''
  const step = (ts: number) => {
    if (!start) start = ts
    const p = Math.min((ts - start) / duration, 1)
    const v = Math.floor(easeOutQuart(p) * target)
    el.textContent = prefix + (target > 999 ? v.toLocaleString() : String(v)) + suffix
    if (p < 1) requestAnimationFrame(step)
    else el.textContent = prefix + (target > 999 ? target.toLocaleString() : String(target)) + suffix
  }
  requestAnimationFrame(step)
}

export default function GlobalEffects() {
  /* ── 1. Word-reveal for .reveal-h2 ── */
  useEffect(() => {
    const headings = document.querySelectorAll<HTMLElement>('.reveal-h2')
    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )
    headings.forEach(h => observer.observe(h))
    return () => observer.disconnect()
  }, [])

  /* ── 2. Count-up for [data-count-to] elements ── */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-count-to]')
    if (!els.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          const target = parseInt(el.dataset.countTo ?? '0', 10)
          if (!isNaN(target)) countUp(el, target)
          observer.unobserve(el)
        })
      },
      { threshold: 0.5 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null // no DOM output
}
