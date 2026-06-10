'use client'
/**
 * ScrollReveal — lightweight IntersectionObserver-based reveal system.
 *
 * How to use:
 *   1. Wrap your app (or a section) with <ScrollReveal />
 *   2. Add className="reveal-fade" (or reveal-clip, reveal-scale, etc.)
 *      to any element you want animated on scroll
 *   3. Optionally add data-stagger="1" through data-stagger="6" for
 *      staggered reveals within a group
 *
 * The component adds the "revealed" class when an element enters the
 * viewport, triggering the CSS transitions defined in globals.css.
 * Respects prefers-reduced-motion automatically (CSS handles it).
 */

import { useEffect } from 'react'

const REVEAL_SELECTORS = [
  '.reveal-fade',
  '.reveal-clip',
  '.reveal-scale',
  '.reveal-left',
  '.reveal-right',
].join(', ')

export default function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            // Once revealed, stop observing (no re-animation on scroll back)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        // Start the animation when 12% of the element is visible
        threshold: 0.12,
        // Start slightly before the element enters viewport (60px earlier)
        rootMargin: '0px 0px -60px 0px',
      }
    )

    // Observe all existing reveal elements
    const observe = () => {
      document.querySelectorAll(REVEAL_SELECTORS).forEach(el => {
        // Skip if already revealed
        if (!el.classList.contains('revealed')) {
          observer.observe(el)
        }
      })
    }

    observe()

    // Re-observe after any dynamic content (e.g. route changes)
    const mutationObserver = new MutationObserver(() => observe())
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  // This component renders nothing — it's a pure side-effect component
  return null
}
