'use client'
import { useEffect, useRef, useState } from 'react'

type Source = {
  id: string
  label: string
  sublabel: string
  color: string
  angle: number
}

const SOURCES: Source[] = [
  { id: 'hrsa', label: 'HRSA API',          sublabel: 'Federal FQHC registry',    color: '#60a5fa',  angle: 0 },
  { id: 'nafc', label: 'NAFC Database',      sublabel: 'Free clinic network',      color: '#818cf8',  angle: 60 },
  { id: 'chw',  label: 'CHW Confirmation',   sublabel: 'On-ground verification',   color: '#fbbf24',  angle: 120 },
  { id: 'user', label: 'User Reports',       sublabel: 'Community-sourced data',   color: '#f472b6',  angle: 180 },
  { id: 'call', label: 'Phone Verification', sublabel: 'Direct clinic calls',      color: '#fb923c',  angle: 240 },
  { id: 'map',  label: 'Mapping Data',       sublabel: 'Location & hours',         color: '#38bdf8',  angle: 300 },
]

export default function VerificationDiagram() {
  const [active, setActive] = useState<number>(-1)
  const [visible, setVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const cx = 200, cy = 120, r = 85

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.3 })
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let i = 0
    const t = setInterval(() => { setActive(i % SOURCES.length); i++ }, 800)
    return () => clearInterval(t)
  }, [visible])

  return (
    <div ref={containerRef} style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      <style>{`@keyframes vd-spin { to { stroke-dashoffset: -200; } }`}</style>
      <svg viewBox={`0 0 ${cx * 2} ${cy * 2}`} style={{ width: '280px', height: '200px', overflow: 'visible' }}>
        {/* Orbit ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(74,144,217,0.2)" strokeWidth="1" strokeDasharray="8 12"
          style={{ animation: 'vd-spin 6s linear infinite' }} />

        {/* Center NEXUS node */}
        <circle cx={cx} cy={cy} r="24" fill="rgba(74,144,217,0.1)" stroke="rgba(74,144,217,0.3)" strokeWidth="1.5" />
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="8" fontWeight="700" fill="rgba(74,144,217,0.9)" fontFamily="var(--font-display)">NEXUS</text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="var(--font-inter,sans-serif)">Verified</text>

        {SOURCES.map((src, i) => {
          const angleRad = (src.angle - 90) * (Math.PI / 180)
          const nx = cx + r * Math.cos(angleRad)
          const ny = cy + r * Math.sin(angleRad)
          const isActive = active === i

          return (
            <g key={src.id} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(-1)}>
              {/* Connection line */}
              <line
                x1={cx} y1={cy} x2={nx} y2={ny}
                stroke={isActive ? src.color : 'rgba(255,255,255,0.06)'}
                strokeWidth={isActive ? 1.5 : 1}
                strokeOpacity={isActive ? 0.7 : 1}
                style={{ transition: 'all 0.3s' }}
              />
              {/* Dot on center */}
              {isActive && (
                <circle cx={cx} cy={cy} r="3" fill={src.color} fillOpacity="0.8" />
              )}
              {/* Source node */}
              <circle
                cx={nx} cy={ny} r="14"
                fill={isActive ? `${src.color}20` : 'rgba(255,255,255,0.04)'}
                stroke={isActive ? src.color : 'rgba(255,255,255,0.1)'}
                strokeWidth="1"
                style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              />
              <text x={nx} y={ny + 4} textAnchor="middle" fontSize="9" fill={isActive ? src.color : 'rgba(255,255,255,0.4)'} fontFamily="var(--font-inter,sans-serif)" style={{ transition: 'fill 0.3s', pointerEvents: 'none', fontWeight: 600 }}>
                {src.label.slice(0, 4)}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Verification sources
        </div>
        {SOURCES.map((src, i) => (
          <div
            key={src.id}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(-1)}
            style={{
              display: 'flex', gap: '10px', alignItems: 'center', cursor: 'default',
              opacity: active === -1 || active === i ? 1 : 0.45,
              transition: 'opacity 0.2s',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: src.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#f5f5f5' }}>{src.label}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{src.sublabel}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
