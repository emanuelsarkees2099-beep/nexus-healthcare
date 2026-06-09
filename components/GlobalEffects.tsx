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

  /* ── 3. Inject ambient orbs into key sections ── */
  useEffect(() => {
    const sectionOrbs: { id: string; orbs: { size: string; top?: string; left?: string; right?: string; bottom?: string; color: string; delay: string }[] }[] = [
      {
        id: 'features',
        orbs: [
          { size: '500px', top: '10%', left: '-100px', color: 'rgba(79,142,240,0.10)', delay: '0s' },
          { size: '400px', bottom: '15%', right: '-80px', color: 'rgba(130,180,248,0.07)', delay: '-8s' },
        ],
      },
      {
        id: 'how',
        orbs: [
          { size: '350px', top: '20%', right: '5%', color: 'rgba(79,142,240,0.08)', delay: '-4s' },
        ],
      },
      {
        id: 'testimonials',
        orbs: [
          { size: '600px', top: '0', left: '50%', color: 'rgba(99,102,241,0.07)', delay: '-12s' },
        ],
      },
    ]

    sectionOrbs.forEach(({ id, orbs }) => {
      const section = document.getElementById(id)
      if (!section) return
      const existing = section.querySelectorAll('.ambient-orb-injected')
      if (existing.length) return // already injected

      // Ensure position:relative on section
      const cs = getComputedStyle(section)
      if (cs.position === 'static') section.style.position = 'relative'
      section.style.overflow = section.style.overflow || 'visible'

      orbs.forEach(orb => {
        const el = document.createElement('div')
        el.className = 'ambient-orb ambient-orb-injected'
        el.setAttribute('aria-hidden', 'true')
        el.style.cssText = [
          `width: ${orb.size}`,
          `height: ${orb.size}`,
          orb.top    ? `top: ${orb.top}`       : '',
          orb.bottom ? `bottom: ${orb.bottom}` : '',
          orb.left   ? `left: ${orb.left}`     : '',
          orb.right  ? `right: ${orb.right}`   : '',
          `background: radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          `animation-delay: ${orb.delay}`,
          'filter: blur(80px)',
        ].filter(Boolean).join(';')
        section.insertBefore(el, section.firstChild)
      })
    })
  }, [])

  return null // no DOM output
}
