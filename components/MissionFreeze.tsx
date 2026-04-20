'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const MAJOR_CITIES = [
  { id: 'seattle',     name: 'Seattle',       state: 'WA', x:  9, y: 15, clinics: 234,  delay: 0    },
  { id: 'sf',          name: 'San Francisco', state: 'CA', x:  6, y: 38, clinics: 412,  delay: 0.15 },
  { id: 'la',          name: 'Los Angeles',   state: 'CA', x:  9, y: 53, clinics: 687,  delay: 0.3  },
  { id: 'phoenix',     name: 'Phoenix',       state: 'AZ', x: 17, y: 61, clinics: 298,  delay: 0.45 },
  { id: 'denver',      name: 'Denver',        state: 'CO', x: 27, y: 41, clinics: 156,  delay: 0.6  },
  { id: 'dallas',      name: 'Dallas',        state: 'TX', x: 38, y: 67, clinics: 445,  delay: 0.75 },
  { id: 'houston',     name: 'Houston',       state: 'TX', x: 42, y: 76, clinics: 523,  delay: 0.9  },
  { id: 'chicago',     name: 'Chicago',       state: 'IL', x: 54, y: 31, clinics: 634,  delay: 0.3  },
  { id: 'detroit',     name: 'Detroit',       state: 'MI', x: 61, y: 27, clinics: 178,  delay: 0.45 },
  { id: 'dc',          name: 'Washington DC', state: 'DC', x: 71, y: 43, clinics: 289,  delay: 0.55 },
  { id: 'nyc',         name: 'New York',      state: 'NY', x: 74, y: 28, clinics: 1240, delay: 0.2  },
  { id: 'boston',      name: 'Boston',        state: 'MA', x: 78, y: 22, clinics: 312,  delay: 0.35 },
  { id: 'atlanta',     name: 'Atlanta',       state: 'GA', x: 62, y: 62, clinics: 367,  delay: 0.5  },
  { id: 'miami',       name: 'Miami',         state: 'FL', x: 65, y: 84, clinics: 445,  delay: 0.65 },
  { id: 'minneapolis', name: 'Minneapolis',   state: 'MN', x: 44, y: 21, clinics: 198,  delay: 0.4  },
]

const MINOR_CITIES = [
  { x:  8, y: 22 }, { x: 13, y: 50 }, { x: 20, y: 37 }, { x: 25, y: 62 },
  { x: 35, y: 75 }, { x: 44, y: 47 }, { x: 51, y: 45 }, { x: 58, y: 40 },
  { x: 63, y: 38 }, { x: 71, y: 34 }, { x: 57, y: 56 }, { x: 67, y: 54 },
  { x: 51, y: 77 }, { x: 54, y: 63 }, { x: 66, y: 34 }, { x: 55, y: 27 },
  { x: 70, y: 38 }, { x: 59, y: 48 }, { x: 30, y: 18 }, { x: 22, y: 52 },
]

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 6],  [5, 6],
  [4, 7], [7, 14],[7, 8], [8, 10],[10, 11], [10, 9],
  [9, 12],[12, 13],[5, 7],
]

export default function MissionFreeze() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)
  const mapRef     = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [hoveredCity, setHoveredCity]     = useState<string | null>(null)
  const [containerSize, setContainerSize] = useState({ w: 1140, h: 500 })

  /* ── Canvas animated dot-grid + regional glows ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      setContainerSize({ w: canvas.offsetWidth, h: canvas.offsetHeight })
    }
    resize()
    window.addEventListener('resize', resize)

    let frame: number
    let t = 0
    let running = false

    const draw = () => {
      if (!running) return
      t += 0.004
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      /* Dot grid */
      const cols = Math.ceil(canvas.width  / 32) + 1
      const rows = Math.ceil(canvas.height / 32) + 1
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x    = c * 32
          const y    = r * 32
          const wave = Math.sin(t + c * 0.3 + r * 0.4) * 0.5 + 0.5
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(110,231,183,${0.035 + wave * 0.04})`
          ctx.fill()
        }
      }

      /* Regional heat glows */
      const glows = [
        { x: 0.75, y: 0.30, r: 200 },
        { x: 0.55, y: 0.32, r: 180 },
        { x: 0.08, y: 0.45, r: 160 },
        { x: 0.63, y: 0.65, r: 140 },
      ]
      glows.forEach(g => {
        const gx    = g.x * canvas.width
        const gy    = g.y * canvas.height
        const pulse = Math.sin(t * 0.8) * 0.15 + 0.85
        const grad  = ctx.createRadialGradient(gx, gy, 0, gx, gy, g.r * pulse)
        grad.addColorStop(0,   'rgba(110,231,183,0.06)')
        grad.addColorStop(0.5, 'rgba(110,231,183,0.02)')
        grad.addColorStop(1,   'rgba(110,231,183,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(gx, gy, g.r * pulse, 0, Math.PI * 2)
        ctx.fill()
      })

      frame = requestAnimationFrame(draw)
    }

    // Only run canvas when visible in viewport
    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting
      if (running) draw()
    }, { threshold: 0.1 })
    observer.observe(canvas)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      observer.disconnect()
    }
  }, [])

  /* ── Scroll reveal ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: headerRef.current, start: 'top 85%' },
      })
      gsap.from(mapRef.current, {
        y: 60, opacity: 0, scale: 0.97, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: mapRef.current, start: 'top 82%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const px = (pct: number, dim: number) => (pct / 100) * dim

  return (
    <div
      ref={sectionRef}
      id="coverage"
      aria-label="Nationwide clinic coverage map"
      style={{ position: 'relative', zIndex: 2, padding: '100px 0 120px', overflow: 'hidden' }}
    >
      {/* Ambient section glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(110,231,183,0.05) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      {/* ── Header ── */}
      <div ref={headerRef} style={{ textAlign: 'center', maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 3rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontSize: '11px', fontWeight: 400, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--accent)',
          marginBottom: '1.25rem', fontFamily: 'var(--font-inter)',
        }}>
          <span style={{ display: 'inline-block', width: '16px', height: '1px', background: 'var(--accent)' }} aria-hidden="true" />
          Coverage
        </div>
        <h2 style={{
          fontFamily: 'var(--font-sora)',
          fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
          fontWeight: 700, lineHeight: 1.05,
          letterSpacing: '-0.03em', marginBottom: '1rem',
        }}>
          Free care,{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>everywhere</em>{' '}
          you are
        </h2>
        <p style={{
          fontSize: '15px', color: 'var(--text-2)',
          fontFamily: 'var(--font-inter)', fontWeight: 300,
          lineHeight: 1.85, maxWidth: '460px', margin: '0 auto',
        }}>
          12,000+ clinics across all 50 states. Wherever you live,
          care is closer than you think.
        </p>
      </div>

      {/* ── Map ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 3rem' }}>
        <div
          ref={mapRef}
          style={{
            position: 'relative', width: '100%', height: '500px',
            background: 'linear-gradient(145deg, var(--bg2) 0%, var(--bg3) 100%)',
            border: '1px solid var(--border2)',
            borderRadius: '24px', overflow: 'hidden',
            boxShadow: `
              0 40px 100px rgba(0,0,0,0.55),
              0 0 0 1px rgba(110,231,183,0.06),
              inset 0 1px 0 rgba(255,255,255,0.03)
            `,
          }}
        >
          {/* Canvas BG */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />

          {/* SVG connection lines */}
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${containerSize.w} ${containerSize.h}`}
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
          >
            <defs>
              <linearGradient id="conn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="rgba(110,231,183,0)"   />
                <stop offset="40%"  stopColor="rgba(110,231,183,0.22)" />
                <stop offset="60%"  stopColor="rgba(110,231,183,0.22)" />
                <stop offset="100%" stopColor="rgba(110,231,183,0)"   />
              </linearGradient>
            </defs>
            {CONNECTIONS.map(([a, b], i) => {
              const ca = MAJOR_CITIES[a]
              const cb = MAJOR_CITIES[b]
              const x1 = px(ca.x, containerSize.w)
              const y1 = px(ca.y, containerSize.h)
              const x2 = px(cb.x, containerSize.w)
              const y2 = px(cb.y, containerSize.h)
              const mx = (x1 + x2) / 2
              const my = (y1 + y2) / 2 - 28
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                  stroke="url(#conn-grad)"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="4 5"
                  style={{ animation: `dash-flow ${2.4 + i * 0.2}s linear infinite` }}
                />
              )
            })}
          </svg>

          {/* Minor dots */}
          {MINOR_CITIES.map((c, i) => (
            <div key={i} aria-hidden="true" style={{
              position: 'absolute',
              left: `${c.x}%`, top: `${c.y}%`,
              transform: 'translate(-50%,-50%)',
              width: '4px', height: '4px', borderRadius: '50%',
              background: 'rgba(110,231,183,0.30)',
              boxShadow: '0 0 4px rgba(110,231,183,0.15)',
              zIndex: 2,
            }} />
          ))}

          {/* Major city pings */}
          {MAJOR_CITIES.map(city => (
            <div
              key={city.id}
              role="button"
              tabIndex={0}
              aria-label={`${city.name}, ${city.state}: ${city.clinics} clinics`}
              onMouseEnter={() => setHoveredCity(city.id)}
              onMouseLeave={() => setHoveredCity(null)}
              onFocus={() => setHoveredCity(city.id)}
              onBlur={() => setHoveredCity(null)}
              style={{
                position: 'absolute',
                left: `${city.x}%`, top: `${city.y}%`,
                transform: 'translate(-50%,-50%)',
                cursor: 'none', zIndex: 4,
              }}
            >
              {/* Outer ring */}
              <div aria-hidden="true" style={{
                position: 'absolute', top: '50%', left: '50%',
                width: '10px', height: '10px', borderRadius: '50%',
                border: '1px solid var(--accent)',
                animation: `ping-outer ${2.2 + city.delay}s ease-out infinite`,
                animationDelay: `${city.delay}s`,
              }} />
              {/* Inner ring */}
              <div aria-hidden="true" style={{
                position: 'absolute', top: '50%', left: '50%',
                width: '10px', height: '10px', borderRadius: '50%',
                border: '1px solid var(--accent2)',
                animation: `ping-inner ${2.2 + city.delay}s ease-out infinite`,
                animationDelay: `${city.delay + 0.8}s`,
              }} />
              {/* Center dot */}
              <div aria-hidden="true" style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: hoveredCity === city.id ? 'var(--accent2)' : 'var(--accent)',
                boxShadow: `0 0 ${hoveredCity === city.id ? 16 : 8}px rgba(110,231,183,${hoveredCity === city.id ? 0.9 : 0.6})`,
                transition: 'all 0.2s ease',
                position: 'relative', zIndex: 3,
                animation: 'map-dot-pulse 2.5s ease-in-out infinite',
                animationDelay: `${city.delay}s`,
              }} />

              {/* Hover tooltip */}
              {hoveredCity === city.id && (
                <div role="tooltip" style={{
                  position: 'absolute',
                  bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(7,7,15,0.95)',
                  border: '1px solid rgba(110,231,183,0.28)',
                  borderRadius: '10px', padding: '8px 14px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 20px rgba(110,231,183,0.14)',
                  backdropFilter: 'blur(16px)', zIndex: 10,
                  animation: 'fadeUp 0.18s var(--ease-out-expo) forwards',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-sora)', letterSpacing: '-0.01em' }}>
                    {city.name}, {city.state}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-inter)', fontWeight: 300, marginTop: '2px' }}>
                    {city.clinics.toLocaleString()} free clinics
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Stats overlay */}
          <div style={{
            position: 'absolute', top: '20px', left: '20px',
            display: 'flex', flexDirection: 'column', gap: '8px',
            zIndex: 5, animation: 'map-card-float 4s ease-in-out infinite',
          }}>
            {[{ n: '12K+', label: 'Clinics indexed' }, { n: '50', label: 'States covered' }].map(s => (
              <div key={s.label} style={{
                background: 'rgba(7,7,15,0.88)',
                border: '1px solid rgba(110,231,183,0.18)',
                borderRadius: '12px', padding: '12px 16px',
                backdropFilter: 'blur(16px)', minWidth: '150px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4), 0 0 20px rgba(110,231,183,0.07)',
              }}>
                <div style={{ fontFamily: 'var(--font-sora)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '3px' }}>{s.n}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search demo card */}
          <div style={{
            position: 'absolute', bottom: '20px', right: '20px',
            background: 'rgba(7,7,15,0.92)',
            border: '1px solid rgba(110,231,183,0.22)',
            borderRadius: '14px', padding: '14px',
            backdropFilter: 'blur(20px)', width: '240px',
            zIndex: 5,
            boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 0 24px rgba(110,231,183,0.08)',
            animation: 'map-card-float 5s ease-in-out infinite 1s',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'var(--bg3)', border: '1px solid var(--border2)',
              borderRadius: '8px', padding: '7px 10px', marginBottom: '10px',
              fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Primary care · NY 10001
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 300, marginBottom: '8px' }}>4 results nearby</div>
            {[
              { initials: 'BC', name: 'Bellevue Community Clinic', dist: '0.4 mi' },
              { initials: 'WB', name: 'West Bronx Health',          dist: '1.1 mi' },
              { initials: 'CH', name: 'Community Health NYC',        dist: '1.8 mi' },
            ].map((r, i) => (
              <div key={r.name} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 0',
                borderBottom: i < 2 ? '1px solid var(--border2)' : 'none',
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '5px',
                  background: 'var(--accent-dim)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '8px', fontWeight: 600, color: 'var(--accent)',
                  fontFamily: 'var(--font-sora)', flexShrink: 0,
                }}>{r.initials}</div>
                <div style={{ flex: 1, fontSize: '11px', color: 'var(--text)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>{r.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>{r.dist}</div>
              </div>
            ))}
            <div style={{
              marginTop: '10px', background: 'var(--accent)', borderRadius: '8px',
              padding: '9px', textAlign: 'center',
              fontSize: '11px', color: 'var(--bg)', fontWeight: 500, fontFamily: 'var(--font-inter)',
              boxShadow: '0 4px 16px rgba(110,231,183,0.30)', cursor: 'default',
            }}>
              Find care near me →
            </div>
          </div>

          {/* Edge vignette */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, borderRadius: '24px',
            background: `
              linear-gradient(to right,  rgba(13,11,30,0.55) 0%,  transparent 9%,  transparent 91%,  rgba(13,11,30,0.55) 100%),
              linear-gradient(to bottom, rgba(13,11,30,0.30) 0%,  transparent 12%, transparent 88%, rgba(13,11,30,0.30) 100%)
            `,
            pointerEvents: 'none', zIndex: 3,
          }} />
        </div>
      </div>
    </div>
  )
}
