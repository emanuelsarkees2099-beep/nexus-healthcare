'use client'
import { useEffect, useState } from 'react'

/* A live dot showing current searches — seeded deterministically */
function seeded(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}

type Dot = { x: number; y: number; age: number; id: number }

/* Cities with approximate world map SVG coords (0-100 scale) */
const HOT_CITIES = [
  [25, 38], [22, 35], [28, 42], // USA Southwest
  [24, 32], [26, 36], [23, 40], // USA South
  [30, 35], [32, 33], [29, 38], // USA East
  [50, 25], [52, 22], [55, 28], // UK/Europe
  [60, 40], [62, 38], [58, 42], // Middle East
  [75, 35], [78, 32], [80, 40], // India/Asia
  [38, 55], [40, 52], [42, 57], // Africa
]

export default function GlobalDot() {
  const [dots, setDots] = useState<Dot[]>([])
  const [searchCount, setSearchCount] = useState(247)
  const idRef = { current: 0 }

  useEffect(() => {
    const seed = Math.floor(Date.now() / 60000)
    const rng = seeded(seed)

    // Initial dots
    const initial: Dot[] = Array.from({ length: 12 }, (_, i) => {
      const city = HOT_CITIES[Math.floor(rng() * HOT_CITIES.length)]
      return {
        id: i,
        x: city[0] + (rng() - 0.5) * 4,
        y: city[1] + (rng() - 0.5) * 4,
        age: Math.floor(rng() * 60),
      }
    })
    setDots(initial)
    idRef.current = initial.length

    // Add new dots periodically
    const dotInterval = setInterval(() => {
      const city = HOT_CITIES[Math.floor(Math.random() * HOT_CITIES.length)]
      const newDot: Dot = {
        id: idRef.current++,
        x: city[0] + (Math.random() - 0.5) * 6,
        y: city[1] + (Math.random() - 0.5) * 6,
        age: 0,
      }
      setDots(prev => [...prev.slice(-20), newDot])
    }, 1800)

    // Age dots
    const ageInterval = setInterval(() => {
      setDots(prev => prev.map(d => ({ ...d, age: d.age + 1 })).filter(d => d.age < 80))
    }, 500)

    // Update count
    const countInterval = setInterval(() => {
      setSearchCount(c => Math.max(220, Math.min(290, c + (Math.random() > 0.5 ? 1 : -1))))
    }, 2500)

    return () => {
      clearInterval(dotInterval)
      clearInterval(ageInterval)
      clearInterval(countInterval)
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ position: 'relative', width: '160px', height: '90px' }}>
        {/* Simple world map outline — very rough */}
        <svg viewBox="0 0 100 60" style={{ width: '100%', height: '100%', opacity: 0.15 }}>
          {/* North America */}
          <ellipse cx="20" cy="28" rx="14" ry="12" fill="rgba(74,144,217,0.4)" />
          {/* South America */}
          <ellipse cx="26" cy="47" rx="7" ry="9" fill="rgba(74,144,217,0.4)" />
          {/* Europe/Africa */}
          <ellipse cx="48" cy="28" rx="7" ry="8" fill="rgba(74,144,217,0.4)" />
          <ellipse cx="50" cy="44" rx="8" ry="10" fill="rgba(74,144,217,0.4)" />
          {/* Asia */}
          <ellipse cx="72" cy="26" rx="18" ry="10" fill="rgba(74,144,217,0.4)" />
          {/* Australia */}
          <ellipse cx="80" cy="46" rx="7" ry="5" fill="rgba(74,144,217,0.4)" />
        </svg>

        {/* Live dots */}
        {dots.map(dot => {
          const opacity = dot.age < 10 ? dot.age / 10 : dot.age > 65 ? (80 - dot.age) / 15 : 1
          return (
            <div
              key={dot.id}
              style={{
                position: 'absolute',
                left: `${dot.x}%`,
                top: `${dot.y * 1.5}%`,
                width: dot.age < 5 ? '8px' : '5px',
                height: dot.age < 5 ? '8px' : '5px',
                borderRadius: '50%',
                background: '#4A90D9',
                transform: 'translate(-50%, -50%)',
                opacity,
                transition: 'width 0.3s, height 0.3s, opacity 0.5s',
                boxShadow: dot.age < 8 ? '0 0 8px rgba(74,144,217,0.7)' : '0 0 3px rgba(74,144,217,0.4)',
              }}
            />
          )
        })}
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.5 }}>
        <span style={{ color: '#f5f5f5', fontWeight: 600 }}>{searchCount}</span> people searching right now
      </div>
    </div>
  )
}
