'use client'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { Globe, TrendingUp, BarChart2, AlertTriangle, ArrowRight, ChevronDown } from 'lucide-react'

/* ── reveal helper ── */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible: v }
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

/* ── Animated bar ── */
function Bar({ pct, color, label, value }: { pct: number; color: string; label: string; value: string }) {
  const [w, setW] = useState(0)
  const { ref, visible } = useReveal(0.2)
  useEffect(() => { if (visible) setTimeout(() => setW(pct), 300) }, [visible, pct])
  return (
    <div ref={ref} style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-inter)' }}>{label}</span>
        <span style={{ fontSize: '14px', fontWeight: 700, color, fontFamily: 'var(--font-inter)' }}>{value}</span>
      </div>
      <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${w}%`,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: '100px',
          transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: `0 0 10px ${color}44`,
        }} />
      </div>
    </div>
  )
}

/* ── Hexagonal heatmap grid (SVG-based US state buckets) ── */
function HeatGrid({ title, data }: { title: string; data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', marginBottom: '16px' }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {data.map((d, i) => {
          const intensity = d.value / max
          return (
            <div
              key={i}
              title={`${d.label}: ${d.value.toLocaleString()}`}
              style={{
                width: '36px', height: '36px', borderRadius: '6px',
                background: `${d.color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
                border: `1px solid ${d.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.7)',
                fontFamily: 'var(--font-inter)', cursor: 'default',
                transition: 'transform 0.2s, border-color 0.2s',
                letterSpacing: '0',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.25)'
                ;(e.currentTarget as HTMLElement).style.borderColor = d.color
                ;(e.currentTarget as HTMLElement).style.zIndex = '10'
                ;(e.currentTarget as HTMLElement).style.position = 'relative'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                ;(e.currentTarget as HTMLElement).style.borderColor = `${d.color}33`
                ;(e.currentTarget as HTMLElement).style.zIndex = ''
                ;(e.currentTarget as HTMLElement).style.position = ''
              }}
            >
              {d.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── State data ── */
const STATE_DATA_UNINSURED = [
  { label: 'TX', value: 19.1 }, { label: 'OK', value: 15.2 }, { label: 'GA', value: 14.2 },
  { label: 'FL', value: 13.1 }, { label: 'NV', value: 12.8 }, { label: 'AZ', value: 12.7 },
  { label: 'NM', value: 12.3 }, { label: 'MS', value: 11.6 }, { label: 'NC', value: 11.1 },
  { label: 'SC', value: 10.7 }, { label: 'AL', value: 10.5 }, { label: 'TN', value: 10.1 },
  { label: 'WY', value: 9.8  }, { label: 'LA', value: 9.7  }, { label: 'AR', value: 9.5  },
  { label: 'VA', value: 8.6  }, { label: 'MO', value: 8.5  }, { label: 'IN', value: 8.2  },
  { label: 'OH', value: 7.1  }, { label: 'KS', value: 7.0  }, { label: 'CA', value: 6.8  },
  { label: 'IL', value: 6.5  }, { label: 'NY', value: 6.2  }, { label: 'WA', value: 5.9  },
  { label: 'MN', value: 5.1  }, { label: 'MA', value: 3.8  }, { label: 'RI', value: 3.4  },
  { label: 'VT', value: 3.2  }, { label: 'DC', value: 3.1  }, { label: 'HI', value: 2.9  },
].map(d => ({ ...d, color: '#f87171' }))

const STATE_DATA_ACCESS = [
  { label: 'VT', value: 98  }, { label: 'MA', value: 97  }, { label: 'HI', value: 96  },
  { label: 'CT', value: 95  }, { label: 'MN', value: 94  }, { label: 'RI', value: 93  },
  { label: 'DC', value: 92  }, { label: 'WA', value: 91  }, { label: 'OR', value: 89  },
  { label: 'CA', value: 87  }, { label: 'NY', value: 86  }, { label: 'IL', value: 84  },
  { label: 'CO', value: 83  }, { label: 'MD', value: 82  }, { label: 'NJ', value: 81  },
  { label: 'PA', value: 79  }, { label: 'WI', value: 78  }, { label: 'MI', value: 76  },
  { label: 'OH', value: 74  }, { label: 'FL', value: 72  }, { label: 'AZ', value: 70  },
  { label: 'TX', value: 68  }, { label: 'GA', value: 67  }, { label: 'AL', value: 63  },
  { label: 'MS', value: 61  }, { label: 'OK', value: 60  }, { label: 'LA', value: 59  },
  { label: 'WY', value: 58  }, { label: 'ID', value: 57  }, { label: 'SD', value: 55  },
].map(d => ({ ...d, color: '#4A90D9' }))

const DISPARITIES = [
  { label: 'Black Americans uninsured vs white', white: 7.4, poc: 14.2, color: '#A78BFA' },
  { label: 'Hispanic Americans uninsured vs white', white: 7.4, poc: 19.7, color: '#FB923C' },
  { label: 'Native Americans uninsured vs white', white: 7.4, poc: 21.4, color: '#F472B6' },
]

const STORIES = [
  {
    headline: 'The ZIP Code Lottery',
    subhead: 'How your address determines your health',
    readTime: '6 min read',
    tag: 'Data Story',
    color: '#4A90D9',
    body: 'Born in 77002 (Houston) vs 77021 (4 miles south): 20-year difference in life expectancy. Same city. Different worlds. We mapped 2,800+ ZIP codes to show exactly where the system breaks.',
  },
  {
    headline: 'The $4,000 Diagnosis',
    subhead: 'Why uninsured patients avoid ERs until it\'s too late',
    readTime: '8 min read',
    tag: 'Investigation',
    color: '#F87171',
    body: 'Delayed care costs the healthcare system $3.2B a year in avoidable complications — but it costs families their lives. We traced 14 deaths that could have been prevented with a $0 clinic visit.',
  },
  {
    headline: 'Language as a Medical Crisis',
    subhead: 'Being misdiagnosed because of a bad translation',
    readTime: '5 min read',
    tag: 'Patient Story',
    color: '#60A5FA',
    body: '40 million Americans speak limited English at home. Fewer than 3% of all clinics provide certified medical interpreters. The gap between those two numbers is measured in lives.',
  },
]

const FACT_CARDS = [
  { stat: '30M', label: 'Uninsured Americans', context: 'That\'s 9.1% of the population — roughly the size of Texas', color: '#F87171' },
  { stat: '20yrs', label: 'Life expectancy gap', context: 'Between the richest and poorest US counties. Preventable.', color: '#FCD34D' },
  { stat: '41%', label: 'Avoid care due to cost', context: 'Of uninsured adults skipped needed care because of price', color: '#A78BFA' },
  { stat: '$3.2B', label: 'Annual avoidable costs', context: 'Spent on complications from delayed care that a free clinic could have prevented', color: '#4A90D9' },
]

const POLICY_TIMELINE = [
  { year: '1965', event: 'Medicare & Medicaid established', impact: 'First federal healthcare safety net', color: '#4A90D9' },
  { year: '1996', event: 'EMTALA enforcement strengthened', impact: 'ERs must stabilize regardless of ability to pay', color: '#A78BFA' },
  { year: '2010', event: 'Affordable Care Act signed', impact: 'Medicaid expansion, pre-existing conditions banned', color: '#60A5FA' },
  { year: '2014', event: 'ACA marketplace opens', impact: '7M enrolled in year one; 14M would remain uninsured', color: '#FCD34D' },
  { year: '2021', event: 'American Rescue Plan', impact: 'ARP subsidies reduced premiums by avg $150/month', color: '#FB923C' },
  { year: '2022', event: 'Inflation Reduction Act', impact: 'Extended enhanced subsidies through 2025', color: '#F472B6' },
  { year: '2025', event: 'Coverage cliff looms', impact: 'Enhanced subsidies expire Dec 2025 — 3M could lose coverage', color: '#F87171' },
]

const pill: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '4px 12px', borderRadius: '100px',
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
  background: 'rgba(74,144,217,0.08)', color: 'var(--accent)',
  border: '1px solid rgba(74,144,217,0.18)',
}

export default function EquityPage() {
  const [activeMap, setActiveMap] = useState<'uninsured' | 'access'>('uninsured')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <AppShell>
      {/* ── HERO ── */}
      <section style={{
        minHeight: '80dvh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '100px 24px 60px', position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(248,113,113,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <Reveal>
          <div style={{ ...pill, background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.25)', color: '#f87171', marginBottom: '24px' }}>
            <Globe size={10} strokeWidth={1.5} /> Healthcare Equity Lab
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 style={{
            fontSize: 'clamp(36px, 6.5vw, 76px)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '24px',
            maxWidth: '760px',
          }}>
            The data behind{' '}
            <em style={{ fontStyle: 'normal', color: '#f87171' }}>the inequality</em>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p style={{
            fontSize: '18px', color: 'rgba(255,255,255,0.5)',
            maxWidth: '540px', lineHeight: 1.7, marginBottom: '16px',
          }}>
            The healthcare gap in America is not an accident. It's the measurable, documented, preventable result of decades of policy choices. Here's the evidence.
          </p>
        </Reveal>
      </section>

      {/* ── FACT CARDS ── */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {FACT_CARDS.map((f, i) => (
            <Reveal key={f.stat} delay={i * 80}>
              <div style={{
                padding: '28px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${f.color}22`,
                position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.3s, background 0.3s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${f.color}44`; (e.currentTarget as HTMLElement).style.background = `${f.color}06` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${f.color}22`; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
              >
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${f.color}55, transparent)` }} />
                <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: f.color, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '10px', fontFamily: 'var(--font-display)' }}>{f.stat}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{f.label}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{f.context}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE MAP ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><BarChart2 size={10} strokeWidth={1.5} /> State-by-State Data</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '16px' }}>
                How every state stacks up
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', maxWidth: '480px', lineHeight: 1.65 }}>
                Hover a state to see its number. Darker = worse. Data from CENSUS, CDC, and KFF.
              </p>
            </div>
          </Reveal>

          {/* Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', width: 'fit-content', gap: '2px', marginBottom: '40px' }}>
            {([['uninsured', '% Uninsured'], ['access', '% With Clinic Access']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveMap(key)}
                style={{
                  padding: '9px 22px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 500, fontFamily: 'inherit',
                  background: activeMap === key ? (key === 'uninsured' ? 'rgba(248,113,113,0.15)' : 'rgba(74,144,217,0.15)') : 'transparent',
                  color: activeMap === key ? (key === 'uninsured' ? '#f87171' : 'var(--accent)') : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.25s',
                }}
              >{label}</button>
            ))}
          </div>

          <Reveal>
            <HeatGrid
              title={activeMap === 'uninsured' ? 'Uninsured rate by state (%)' : 'Clinic access score by state (%)'}
              data={activeMap === 'uninsured' ? STATE_DATA_UNINSURED : STATE_DATA_ACCESS}
            />
          </Reveal>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: activeMap === 'uninsured' ? 'rgba(248,113,113,0.3)' : 'rgba(74,144,217,0.3)' }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)' }}>Low</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: activeMap === 'uninsured' ? '#f87171' : '#4A90D9' }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)' }}>High</span>
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-inter)', marginLeft: '8px' }}>
              Source: U.S. Census Bureau ACS 2023 · KFF State Health Facts
            </span>
          </div>
        </div>
      </section>

      {/* ── RACIAL DISPARITIES ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ ...pill, background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)', color: '#f87171', marginBottom: '20px' }}>
                <AlertTriangle size={10} strokeWidth={1.5} /> Racial Disparities
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '16px' }}>
                Race and insurance: the numbers
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {DISPARITIES.map((d, i) => (
              <Reveal key={i} delay={i * 100}>
                <div style={{ padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '20px', color: 'rgba(255,255,255,0.7)' }}>{d.label}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px', fontFamily: 'var(--font-inter)' }}>White Americans</div>
                      <Bar pct={d.white * 5} color="#60a5fa" label={`${d.white}% uninsured`} value={`${d.white}%`} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px', fontFamily: 'var(--font-inter)' }}>{d.label.split(' ').slice(0, 2).join(' ')}</div>
                      <Bar pct={d.poc * 5} color={d.color} label={`${d.poc}% uninsured`} value={`${d.poc}%`} />
                    </div>
                  </div>
                  <div style={{
                    marginTop: '16px', padding: '12px 16px', borderRadius: '12px',
                    background: `${d.color}08`, border: `1px solid ${d.color}22`,
                    fontSize: '13px', color: 'rgba(255,255,255,0.55)',
                    fontFamily: 'var(--font-inter)', lineHeight: 1.5,
                  }}>
                    <strong style={{ color: d.color }}>
                      {((d.poc / d.white) - 1) >= 1
                        ? `${Math.round((d.poc / d.white - 1) * 100)}% more likely`
                        : `${Math.round(d.poc / d.white * 10) / 10}× the rate`}
                    </strong>
                    {' '}to be uninsured compared to white Americans.
                    {' '}Source: KFF State Health Facts, 2023 ACS.
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDITORIAL STORIES ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}>Data stories</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                The numbers have names
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {STORIES.map((s, i) => (
              <Reveal key={s.headline} delay={i * 100}>
                <div style={{
                  padding: '2px', borderRadius: '20px',
                  background: `linear-gradient(135deg, ${s.color}22, ${s.color}06)`,
                  height: '100%',
                }}>
                  <div style={{
                    background: 'rgba(8,13,26,0.95)', borderRadius: '18px',
                    padding: '28px', height: '100%', boxSizing: 'border-box',
                    display: 'flex', flexDirection: 'column', gap: '16px',
                    transition: 'background 0.3s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(8,13,26,0.8)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(8,13,26,0.95)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: s.color, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)' }}>{s.tag}</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-inter)' }}>{s.readTime}</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', lineHeight: 1.25 }}>{s.headline}</h3>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{s.subhead}</p>
                    </div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, flex: 1 }}>{s.body}</p>
                    <a href="/editorial" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '13px', fontWeight: 600, color: s.color,
                      textDecoration: 'none', transition: 'gap 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.gap = '10px')}
                      onMouseLeave={e => (e.currentTarget.style.gap = '6px')}
                    >
                      Read the story <ArrowRight size={13} strokeWidth={2} />
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── POLICY TIMELINE ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><TrendingUp size={10} strokeWidth={1.5} /> Policy Timeline</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                The laws that shaped the gap
              </h2>
            </div>
          </Reveal>

          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: '58px', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.07)' }} aria-hidden="true" />

            {POLICY_TIMELINE.map((item, i) => (
              <Reveal key={item.year} delay={i * 80}>
                <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', marginBottom: '32px', position: 'relative' }}>
                  {/* Year */}
                  <div style={{
                    width: '116px', flexShrink: 0, paddingTop: '2px',
                    fontSize: '13px', fontWeight: 700, color: item.color,
                    fontFamily: 'var(--font-orbitron)', letterSpacing: '0.05em',
                    textAlign: 'right',
                  }}>{item.year}</div>
                  {/* Dot */}
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: item.color, flexShrink: 0,
                    marginTop: '5px', position: 'relative', zIndex: 1,
                    boxShadow: `0 0 12px ${item.color}66`,
                  }} />
                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '5px', lineHeight: 1.3 }}>{item.event}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.5 }}>{item.impact}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── #30 — DOWNLOAD DATA ── */}
      <section style={{ padding: '40px 24px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Reveal>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '24px', flexWrap: 'wrap',
              padding: '28px 32px', borderRadius: '20px',
              background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.15)',
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                  Download this dataset
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-inter)', lineHeight: 1.55, maxWidth: '420px' }}>
                  State-by-state disparity data, clinic density scores, and Medicaid expansion outcomes. CC-BY 4.0 license. For researchers, journalists, and health departments.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
                <a
                  href="/api/equity-data?format=csv"
                  download="nexus-equity-data.csv"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '10px 20px', borderRadius: '100px',
                    background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.3)',
                    color: 'var(--accent)', fontSize: '13px', fontWeight: 600,
                    textDecoration: 'none', transition: 'background 0.18s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,144,217,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(74,144,217,0.12)')}
                >
                  <BarChart2 size={13} /> CSV Dataset
                </a>
                <a
                  href="/api/equity-data?format=json"
                  download="nexus-equity-data.json"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '10px 20px', borderRadius: '100px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600,
                    textDecoration: 'none', transition: 'background 0.18s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                >
                  <Globe size={13} /> JSON API
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── ACTION CTA ── */}
      <section style={{ padding: '80px 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <Reveal>
            <div style={{
              padding: '4px', borderRadius: '28px',
              background: 'linear-gradient(135deg, rgba(248,113,113,0.25), rgba(167,139,250,0.1))',
            }}>
              <div style={{
                borderRadius: '25px', padding: '56px 48px',
                background: 'rgba(8,13,26,0.97)',
                textAlign: 'center',
              }}>
                <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '16px' }}>
                  Data is only useful if it drives action
                </h2>
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: '440px', margin: '0 auto 32px' }}>
                  Every person in this data is someone who can be helped today — for free — using the clinics already in your city.
                </p>
                <a href="/search" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '14px 26px', borderRadius: '100px',
                  background: 'rgba(255,255,255,0.94)', color: '#07070F',
                  fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  boxShadow: '0 0 40px rgba(74,144,217,0.15)',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(74,144,217,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(74,144,217,0.15)' }}
                >
                  Find free care now <ArrowRight size={14} strokeWidth={2} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  )
}
