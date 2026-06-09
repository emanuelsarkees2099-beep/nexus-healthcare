'use client'
import { useEffect, useRef, useState } from 'react'

/* â”€â”€ Deterministic fake-live data seeded by date â”€â”€ */
function seedRand(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}

type Win = {
  id: number
  initials: string
  city: string
  action: string
  time: string
  color: string
}

const ACTIONS = [
  'found a free clinic in 4 minutes',
  'enrolled in Medicaid through NEXUS',
  'connected with a bilingual CHW',
  'got a same-day dental appointment',
  'avoided a $2,800 ER bill',
  'found sliding-scale mental health care',
  'received a free prescription',
  'booked telehealth in 8 minutes',
  'learned they qualify for ACA subsidies',
  'found a free pediatric walk-in clinic',
  'connected with crisis support at 2am',
  'got free prenatal care near their home',
  'found insulin for $8/month',
  'discovered a free dental day nearby',
  'enrolled their child in CHIP',
]
const CITIES = [
  'Phoenix, AZ', 'Detroit, MI', 'San Jose, CA', 'Chicago, IL', 'Houston, TX',
  'Atlanta, GA', 'Brooklyn, NY', 'Dallas, TX', 'Miami, FL', 'Seattle, WA',
  'Denver, CO', 'Nashville, TN', 'El Paso, TX', 'Philadelphia, PA', 'Portland, OR',
  'Tucson, AZ', 'Albuquerque, NM', 'Memphis, TN', 'Baltimore, MD', 'Louisville, KY',
]
const INITIALS_LIST = [
  'MG','JT','AN','RV','DS','KM','LH','TW','CP','FB',
  'YO','IS','BK','NR','ZA','QP','XL','HE','OB','WS',
]
const COLORS = [
  '#4A90D9','#A78BFA','#FCD34D','#F87171','#60A5FA','#60A5FA',
  '#FB923C','#E879F9','#38BDF8','#60A5FA',
]
const TIMES = ['just now', '1 min ago', '2 min ago', '3 min ago', '5 min ago', '7 min ago', '10 min ago', '12 min ago']

function generateWins(count: number, seed: number): Win[] {
  const rand = seedRand(seed)
  return Array.from({ length: count }, (_, i) => ({
    id: seed * 100 + i,
    initials: INITIALS_LIST[Math.floor(rand() * INITIALS_LIST.length)],
    city: CITIES[Math.floor(rand() * CITIES.length)],
    action: ACTIONS[Math.floor(rand() * ACTIONS.length)],
    time: TIMES[Math.floor(rand() * TIMES.length)],
    color: COLORS[Math.floor(rand() * COLORS.length)],
  }))
}

/* â”€â”€ Animated counter â”€â”€ */
function Counter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const dur = 2400
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setVal(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [visible, target])

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{val >= 1000 ? val.toLocaleString() : val}{suffix}
    </span>
  )
}

/* â”€â”€ Win card â”€â”€ */
function WinCard({ win }: { win: Win }) {
  return (
    <div
      className="impact-win-card"
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 14px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        flexShrink: 0,
        transition: 'border-color 0.3s',
        minWidth: '280px', maxWidth: '320px',
      }}
    >
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%',
        background: `${win.color}1a`,
        border: `1.5px solid ${win.color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 700, color: win.color,
        fontFamily: 'var(--font-inter)', flexShrink: 0,
        letterSpacing: '0.02em',
      }}>
        {win.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.78)',
          fontFamily: 'var(--font-inter)', lineHeight: 1.45,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Someone in {win.city}</span>
          {' '}{win.action}
        </div>
        <div style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.28)',
          fontFamily: 'var(--font-inter)', marginTop: '2px',
        }}>
          {win.time}
        </div>
      </div>
      <div style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: win.color,
        boxShadow: `0 0 8px ${win.color}`,
        flexShrink: 0, animation: 'pulse-dot 2s ease-in-out infinite',
      }} aria-hidden="true" />
    </div>
  )
}

/* â”€â”€ Scrolling marquee â”€â”€ */
function WinMarquee({ wins, reverse = false }: { wins: Win[]; reverse?: boolean }) {
  return (
    <div style={{
      overflow: 'hidden',
      maskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
    }}>
      <div
        className={reverse ? 'win-marquee-reverse' : 'win-marquee'}
        style={{ display: 'flex', gap: '12px', width: 'max-content' }}
      >
        {[...wins, ...wins].map((w, i) => <WinCard key={`${w.id}-${i}`} win={w} />)}
      </div>
    </div>
  )
}

/* â”€â”€ Stat bar â”€â”€ */
function StatBar({ label, value, color, pct }: { label: string; value: string; color: string; pct: number }) {
  const [w, setW] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  useEffect(() => { if (visible) setTimeout(() => setW(pct), 200) }, [visible, pct])
  return (
    <div ref={ref}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color, fontFamily: 'var(--font-inter)' }}>{value}</span>
      </div>
      <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${w}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: '100px', transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: `0 0 8px ${color}55`,
        }} />
      </div>
    </div>
  )
}

const COUNTERS = [
  { label: 'People helped', value: 284000, suffix: '+', color: '#4A90D9' },
  { label: 'Clinic matches', value: 847000, suffix: '+', color: '#A78BFA' },
  { label: 'Cost avoided',   value: 2,      prefix: '$', suffix: 'B+', color: '#FCD34D' },
  { label: 'Cities covered', value: 2800,   suffix: '+', color: '#60A5FA' },
]

export default function ImpactWall() {
  const seed = Math.floor(Date.now() / 60000) // changes every minute
  const wins1 = generateWins(8, seed)
  const wins2 = generateWins(8, seed + 1)

  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      aria-label="Live impact wall"
      className="cv-auto"
      style={{
        position: 'relative', zIndex: 2,
        padding: 'clamp(80px, 10vw, 120px) 0',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(74,144,217,0.06) 0%, transparent 65%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 3rem)' }}>

        {/* Header */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', marginBottom: '64px',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
            borderRadius: '100px', padding: '5px 14px',
            fontSize: '11px', fontWeight: 500, color: '#60a5fa',
            fontFamily: 'var(--font-inter)', letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: '24px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#60a5fa', boxShadow: '0 0 8px rgba(96,165,250,0.7)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} aria-hidden="true" />
            Live
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4.5vw, 3.6rem)',
            fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
            marginBottom: '16px',
          }}>
            Care found,{' '}
            <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>right now</em>
          </h2>
          <p style={{
            fontSize: '16px', color: 'rgba(255,255,255,0.45)',
            maxWidth: '480px', lineHeight: 1.7,
            fontFamily: 'var(--font-inter)', fontWeight: 400,
          }}>
            Every minute, real people in your city use NEXUS to get care they couldn't afford before. Here's what's happening right now.
          </p>
        </div>

        {/* Counters */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px', marginBottom: '64px',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1) 150ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) 150ms',
        }}>
          {COUNTERS.map(c => (
            <div key={c.label} style={{
              padding: '28px 24px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              textAlign: 'center',
              transition: 'border-color 0.3s, background 0.3s',
              position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${c.color}33`
                ;(e.currentTarget as HTMLElement).style.background = `${c.color}08`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
              }}
            >
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${c.color}44, transparent)` }} aria-hidden="true" />
              <div style={{
                fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800,
                color: c.color, letterSpacing: '-0.04em', lineHeight: 1,
                marginBottom: '8px', fontFamily: 'var(--font-display)',
              }}>
                <Counter target={c.value} prefix={c.prefix} suffix={c.suffix} />
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)' }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>

        {/* Stat bars */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px', marginBottom: '64px',
          padding: '32px',
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '24px',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1) 250ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) 250ms',
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', marginBottom: '20px' }}>
              Who we serve
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <StatBar label="Uninsured or underinsured" value="73%" color="#4A90D9" pct={73} />
              <StatBar label="Below 200% poverty line" value="67%" color="#A78BFA" pct={67} />
              <StatBar label="Primary language not English" value="41%" color="#FCD34D" pct={41} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', marginBottom: '20px' }}>
              Care outcomes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <StatBar label="Received care within 7 days" value="94%" color="#60a5fa" pct={94} />
              <StatBar label="Would recommend NEXUS" value="97%" color="#60A5FA" pct={97} />
              <StatBar label="Returned for follow-up care" value="81%" color="#FB923C" pct={81} />
            </div>
          </div>
        </div>
      </div>

      {/* Full-bleed marquees */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <WinMarquee wins={wins1} />
        <WinMarquee wins={wins2} reverse />
      </div>

      <style>{`
        @keyframes win-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes win-marquee-reverse {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .win-marquee {
          animation: win-marquee 40s linear infinite;
        }
        .win-marquee-reverse {
          animation: win-marquee-reverse 40s linear infinite;
        }
        .win-marquee:hover,
        .win-marquee-reverse:hover {
          animation-play-state: paused;
        }
        .impact-win-card:hover {
          border-color: rgba(74,144,217,0.2) !important;
        }
        @media (max-width: 640px) {
          .impact-win-card { min-width: 240px !important; }
        }
      `}</style>
    </section>
  )
}

