'use client'
/**
 * The Pulse — NEXUS's signature.
 *
 * One continuous EKG line running the full height of the landing page,
 * drawn by the visitor's scroll (ScrollTrigger scrub). It starts beneath
 * the hero, weaves between sections, spikes into a heartbeat at each
 * section boundary, and terminates at the CTA. A glow dot rides the tip.
 *
 * Engineering notes:
 * • Path is generated from real section offsets (re-measured on resize)
 * • Draw = stroke-dashoffset scrub; dot = getPointAtLength — both cheap
 * • Mobile: straight left-gutter line, smaller spikes
 * • prefers-reduced-motion: renders fully drawn, no dot, no scrub
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGSAP } from '@/lib/gsap-st'

registerGSAP()

const VBW = 1000 // viewBox width units (maps to 100% page width)

/** EKG heartbeat segment at (x, y): flatline dip → tall spike → recover */
function spikeAt(x: number, y: number, scale = 1): string {
  const s = 26 * scale
  return [
    `L ${x - s * 2.2} ${y}`,
    `L ${x - s * 1.4} ${y}`,
    `L ${x - s * 0.9} ${y + s * 0.45}`,
    `L ${x - s * 0.3} ${y - s * 1.6}`,
    `L ${x + s * 0.3} ${y + s * 0.8}`,
    `L ${x + s * 0.8} ${y - s * 0.35}`,
    `L ${x + s * 1.5} ${y}`,
    `L ${x + s * 2.2} ${y}`,
  ].join(' ')
}

function buildPath(sections: { y: number }[], pageH: number, mobile: boolean): string {
  if (sections.length === 0) return ''
  const startY = sections[0].y
  const xs = mobile
    ? sections.map(() => 40)                                   // left gutter
    : sections.map((_, i) => (i % 2 === 0 ? 280 : VBW - 280))  // weave L/R

  let d = `M ${mobile ? 40 : VBW / 2} ${startY}`
  sections.forEach((s, i) => {
    const x = xs[i]
    const prevX = i === 0 ? (mobile ? 40 : VBW / 2) : xs[i - 1]
    const prevY = i === 0 ? startY : sections[i - 1].y
    const midY = (prevY + s.y) / 2
    // S-curve into the section, then heartbeat spike at its heading
    d += ` C ${prevX} ${midY}, ${x} ${midY}, ${x} ${s.y - 60}`
    d += ` L ${x} ${s.y}`
    d += spikeAt(x, s.y + 20, mobile ? 0.6 : 1)
    d += ` L ${x} ${s.y + 60}`
  })
  // Run out to the bottom of the page
  const lastX = xs[xs.length - 1]
  d += ` C ${lastX} ${pageH - 200}, ${mobile ? 40 : VBW / 2} ${pageH - 160}, ${mobile ? 40 : VBW / 2} ${pageH - 80}`
  return d
}

export default function PulseSpine() {
  const svgRef  = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const dotRef  = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const path = pathRef.current
    const dot = dotRef.current
    if (!svg || !path || !dot) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const main = document.getElementById('main-content')
    if (!main) return

    let trigger: ScrollTrigger | undefined
    let rafId = 0

    const measure = () => {
      const mainRect = main.getBoundingClientRect()
      const pageTop = mainRect.top + window.scrollY
      const pageH = main.scrollHeight

      // Anchor points: each landing section AFTER the hero
      const sectionEls = Array.from(
        main.querySelectorAll<HTMLElement>(':scope > *:not(#hero):not(script):not(style)')
      ).filter(el => el.offsetHeight > 100)

      const hero = document.getElementById('hero')
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight - 40 : 400

      const anchors = sectionEls
        .map(el => ({ y: el.offsetTop + Math.min(140, el.offsetHeight * 0.2) }))
        .filter(a => a.y > heroBottom)

      if (anchors.length === 0) return

      const mobile = window.innerWidth < 768
      svg.setAttribute('viewBox', `0 0 ${VBW} ${pageH}`)
      svg.style.height = `${pageH}px`
      svg.style.top = `${pageTop - (main.offsetTop ?? 0)}px`

      path.setAttribute('d', buildPath([{ y: heroBottom }, ...anchors], pageH, mobile))

      const len = path.getTotalLength()
      path.style.strokeDasharray = `${len}`

      if (reduced) {
        path.style.strokeDashoffset = '0'
        dot.style.display = 'none'
        return
      }

      path.style.strokeDashoffset = `${len}`
      trigger?.kill()
      trigger = gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: main,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: self => {
            cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(() => {
              try {
                const pt = path.getPointAtLength(len * self.progress)
                dot.setAttribute('cx', String(pt.x))
                dot.setAttribute('cy', String(pt.y))
                dot.style.opacity = self.progress > 0.005 && self.progress < 0.998 ? '1' : '0'
              } catch { /* path mid-regeneration */ }
            })
          },
        },
      }).scrollTrigger

      ScrollTrigger.refresh()
    }

    // Initial measure after layout settles, then re-measure on resize
    // (debounced — section heights shift as lazy content loads)
    const t = setTimeout(measure, 400)
    let debounce: ReturnType<typeof setTimeout> | undefined
    const ro = new ResizeObserver(() => {
      clearTimeout(debounce)
      debounce = setTimeout(measure, 250)
    })
    ro.observe(main)

    return () => {
      clearTimeout(t)
      clearTimeout(debounce)
      ro.disconnect()
      trigger?.kill()
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        <linearGradient id="pulse-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="rgba(79,142,240,0.5)" />
          <stop offset="55%" stopColor="rgba(79,142,240,0.4)" />
          <stop offset="100%" stopColor="rgba(45,212,191,0.5)" />
        </linearGradient>
        <filter id="pulse-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" /><feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        ref={pathRef}
        fill="none"
        stroke="url(#pulse-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        ref={dotRef}
        r="4"
        fill="#82B4F8"
        filter="url(#pulse-glow)"
        style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
      />
    </svg>
  )
}
