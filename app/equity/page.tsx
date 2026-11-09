'use client'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { Global, TrendUp, Chart2, Danger, ArrowRight, ArrowDown2 } from 'iconsax-react'

/* ── reveal helper ── */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(true)
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
          background: 'var(--accent)',
          borderRadius: '100px',
          transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: 'none',
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
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0', textTransform: 'none', fontFamily: 'var(--font-inter)', marginBottom: '16px' }}>{title}</div>
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
/* Uninsured rate, total population, 2024 — KFF analysis of the U.S. Census
   Bureau's American Community Survey (KFF State Health Facts). */
const STATE_DATA_UNINSURED = [
  { label: 'TX', value: 16.8 }, { label: 'GA', value: 12 }, { label: 'OK', value: 11.7 }, { label: 'NV', value: 11.4 },
  { label: 'AK', value: 11.1 }, { label: 'FL', value: 10.9 }, { label: 'AZ', value: 10.2 }, { label: 'NM', value: 10.2 },
  { label: 'MS', value: 9.7 }, { label: 'TN', value: 9.7 }, { label: 'WY', value: 9.7 }, { label: 'AR', value: 9.3 },
  { label: 'SC', value: 9.1 }, { label: 'ID', value: 9 }, { label: 'KS', value: 8.6 }, { label: 'MT', value: 8.6 },
  { label: 'NC', value: 8.6 }, { label: 'UT', value: 8.3 }, { label: 'AL', value: 8.2 }, { label: 'SD', value: 7.9 },
  { label: 'CO', value: 7.8 }, { label: 'NJ', value: 7.7 }, { label: 'LA', value: 7.6 }, { label: 'MO', value: 7.6 },
  { label: 'NE', value: 7.6 }, { label: 'IN', value: 7.4 }, { label: 'DE', value: 6.9 }, { label: 'KY', value: 6.9 },
  { label: 'IL', value: 6.8 }, { label: 'VA', value: 6.8 }, { label: 'OH', value: 6.7 }, { label: 'WA', value: 6.5 },
  { label: 'MD', value: 6.2 }, { label: 'ND', value: 6 }, { label: 'PA', value: 6 }, { label: 'CA', value: 5.9 },
  { label: 'WV', value: 5.9 }, { label: 'CT', value: 5.7 }, { label: 'IA', value: 5.7 }, { label: 'ME', value: 5.6 },
  { label: 'WI', value: 5.4 }, { label: 'MN', value: 5.3 }, { label: 'OR', value: 5.2 }, { label: 'MI', value: 5 },
  { label: 'NY', value: 4.9 }, { label: 'RI', value: 4.8 }, { label: 'DC', value: 4.7 }, { label: 'NH', value: 4.7 },
  { label: 'VT', value: 4.3 }, { label: 'HI', value: 3.3 }, { label: 'MA', value: 2.8 },
].map(d => ({ ...d, color: '#f87171' }))

/* Uninsured rates for people ages 0–64, 2024 — KFF analysis of the ACS. */
const DISPARITIES = [
  { label: 'Black people vs. white people', white: 6.8, poc: 10.1, color: '#4F8EF0' },
  { label: 'Hispanic people vs. white people', white: 6.8, poc: 18.4, color: '#4F8EF0' },
  { label: 'American Indian & Alaska Native people vs. white people', white: 6.8, poc: 18.9, color: '#4F8EF0' },
]

const STORIES = [
  {
    headline: 'The Uninsured Crisis: Letter from Arizona',
    subhead: 'Who goes without coverage, and why',
    readTime: '7 min read',
    tag: 'Investigation',
    color: '#4F8EF0',
    body: "Arizona's 10.3% uninsured rate isn't random. It clusters in the counties, industries, and communities that policy has excluded for decades.",
  },
  {
    headline: 'America Is Running Out of Doctors',
    subhead: 'A shortage built by policy',
    readTime: '7 min read',
    tag: 'Investigation',
    color: '#F87171',
    body: "More than 83 million Americans live where there aren't enough clinicians, and rural areas feel it first. A residency cap frozen since 1997 is a big reason why.",
  },
  {
    headline: 'The Drug Changing Medicine',
    subhead: 'GLP-1s and who can afford them',
    readTime: '6 min read',
    tag: 'Data Story',
    color: '#4F8EF0',
    body: "The same GLP-1 prescription can cost $50 or $1,300 a month depending on what coverage, if any, you have. The people who'd benefit most often can't get it.",
  },
]

const FACT_CARDS = [
  { stat: '26.7M', label: 'Uninsured all year', context: 'People in the U.S. with no health insurance for all of 2025 (7.9%). Source: U.S. Census Bureau', color: '#F87171' },
  { stat: '20+ yrs', label: 'Life expectancy gap', context: 'Between U.S. counties with the highest and lowest life expectancy. Source: JAMA Internal Medicine, 2017', color: '#4F8EF0' },
  { stat: '41%', label: 'Have health care debt', context: 'Share of U.S. adults with debt from medical or dental bills — about 100 million people. Source: KFF, 2022', color: '#4F8EF0' },
  { stat: '16.8%', label: 'Uninsured in Texas', context: 'The highest rate of any state in 2024, compared with 2.8% in Massachusetts. Source: KFF analysis of Census data', color: '#4F8EF0' },
]

const POLICY_TIMELINE = [
  { year: '1965', event: 'Medicare & Medicaid established', impact: 'First federal healthcare safety net', color: '#4F8EF0' },
  { year: '1986', event: 'EMTALA enacted', impact: 'Hospital ERs must screen and stabilize anyone, regardless of ability to pay', color: '#4F8EF0' },
  { year: '2010', event: 'Affordable Care Act signed', impact: 'Medicaid expansion, pre-existing conditions banned', color: '#4F8EF0' },
  { year: '2014', event: 'ACA marketplaces open and Medicaid expansion begins', impact: 'About 8 million people signed up during the first open enrollment', color: '#4F8EF0' },
  { year: '2021', event: 'American Rescue Plan', impact: 'Enlarged premium tax credits and removed the 400% FPL cutoff', color: '#4F8EF0' },
  { year: '2022', event: 'Inflation Reduction Act', impact: 'Extended enhanced subsidies through 2025', color: '#4F8EF0' },
  { year: '2025', event: 'Enhanced subsidies expire', impact: 'The larger tax credits ended Dec 31, 2025, raising premiums for many enrollees in 2026', color: '#F87171' },
]

const pill: React.CSSProperties = {
  // Plain section label — no colored badge
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  fontSize: '13px', fontWeight: 600, color: 'var(--text-2)',
}

export default function EquityPage() {
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
          background: 'transparent',
          pointerEvents: 'none',
        }} />

        <Reveal>
          <div style={{ ...pill, background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.25)', color: '#f87171', marginBottom: '24px' }}>
            <Global size={14} variant="Linear" /> Healthcare Equity Lab
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, margin: '0 0 18px', color: 'var(--text)' }}>Gaps in health coverage across the U.S.</h1>
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
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.08)' }} />
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
              <div style={{ ...pill, marginBottom: '20px' }}><Chart2 size={14} variant="Linear" /> State-by-State Data</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '16px' }}>
                How every state stacks up
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', maxWidth: '480px', lineHeight: 1.65 }}>
                Hover a state to see its rate. Darker means a higher share of people without health insurance.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <HeatGrid
              title="Uninsured rate by state, 2024 (%)"
              data={STATE_DATA_UNINSURED}
            />
          </Reveal>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(248,113,113,0.3)' }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)' }}>Low</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#f87171' }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)' }}>High</span>
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-inter)', marginLeft: '8px' }}>
              Source: KFF analysis of the U.S. Census Bureau American Community Survey, 2024
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
                <Danger size={14} variant="Linear" /> Racial Disparities
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
                  <div className="equity-bar-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px', fontFamily: 'var(--font-inter)' }}>White Americans</div>
                      <Bar pct={d.white * 5} color="#4F8EF0" label={`${d.white}% uninsured`} value={`${d.white}%`} />
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
                    {' '}Ages 0–64. Source: KFF analysis of the 2024 American Community Survey.
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
              <div style={{ ...pill, marginBottom: '20px' }}>From the editorial</div>
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
                  background: 'rgba(255,255,255,0.06)',
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
                      <span style={{ fontSize: '10px', fontWeight: 600, color: s.color, letterSpacing: '0', textTransform: 'none', fontFamily: 'var(--font-inter)' }}>{s.tag}</span>
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
                      Read the story <ArrowRight size={13} variant="Linear" />
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
              <div style={{ ...pill, marginBottom: '20px' }}><TrendUp size={14} variant="Linear" /> Policy Timeline</div>
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
                    fontFamily: 'var(--font-inter)', letterSpacing: '0.04em',
                    textAlign: 'right',
                  }}>{item.year}</div>
                  {/* Dot */}
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: item.color, flexShrink: 0,
                    marginTop: '5px', position: 'relative', zIndex: 1,
                    boxShadow: 'none',
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

      {/* ── ACTION CTA ── */}
      <section style={{ padding: '80px 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <Reveal>
            <div style={{
              padding: '4px', borderRadius: '28px',
              background: 'rgba(255,255,255,0.06)',
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
                  Every person in this data could be helped today, at low or no cost, by clinics that already exist in their community.
                </p>
                <a href="/search" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '14px 26px', borderRadius: '100px',
                  background: 'rgba(255,255,255,0.94)', color: '#07070F',
                  fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  boxShadow: 'none',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(79,142,240,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(79,142,240,0.15)' }}
                >
                  Find free care now <ArrowRight size={14} color="#07070F" variant="Linear" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  )
}
