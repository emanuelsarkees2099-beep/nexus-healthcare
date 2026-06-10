'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/* NOTE: This wrapper must NOT use transform, filter, or will-change: transform.
   Those properties create a new CSS containing block which breaks position:fixed
   nav elements (they'd be positioned relative to this div, not the viewport).
   Opacity-only animation is safe — it creates a stacking context but doesn't
   affect the containing block for fixed-position descendants. */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    gsap.fromTo(el,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power3.out' }
    )
  }, [])

  return (
    <div ref={ref}>
      {children}
    </div>
  )
}
