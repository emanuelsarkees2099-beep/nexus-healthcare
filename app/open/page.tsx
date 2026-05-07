'use client'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { TrendingUp, CheckCircle, Clock, Zap, GitBranch, Globe, MessageSquare, ArrowRight, ExternalLink } from 'lucide-react'

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
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      {children}
    </div>
  )
}

const pill: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '4px 12px', borderRadius: '100px',
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
  background: 'rgba(110,231,183,0.08)', color: 'var(--accent)',
  border: '1px solid rgba(110,231,183,0.18)',
}

const CHANGELOG = [
  {
    version: '2.4.0',
    date: 'April 2025',
    tag: 'Major',
    color: '#6EE7B7',
    changes: [
      { type: 'new', text: 'Command palette (⌘K) with voice input + fuzzy search across all 13 pages' },
      { type: 'new', text: 'Healthcare Equity Lab — state-by-state racial disparity data + interactive heatmaps' },
      { type: 'new', text: 'Live Impact Wall — real-time wins feed + animated counters' },
      { type: 'new', text: 'Cost Calculator — before/after ER vs free clinic comparison' },
      { type: 'improved', text: 'Pathways wizard upgraded: real HRSA + Google Maps API integration' },
      { type: 'improved', text: 'Trust Markers on all clinic cards: HRSA verification badge + acceptance rate' },
    ],
  },
  {
    version: '2.3.0',
    date: 'March 2025',
    tag: 'Feature',
    color: '#A78BFA',
    changes: [
      { type: 'new', text: 'Care Pathways page — AI-powered 3-step clinic finder with outcomes data' },
      { type: 'new', text: 'Crisis mode — EmergencyEscalation component, 911 / 988 / Crisis Text Line' },
      { type: 'new', text: 'Supabase Auth — email + Google OAuth for user accounts' },
      { type: 'improved', text: 'Search: sticky filter bar, filter pills, animated empty state with SVG illustration' },
      { type: 'improved', text: 'Hero: cycling word animation, trending searches carousel, GSAP scroll-out pin' },
    ],
  },
  {
    version: '2.2.0',
    date: 'February 2025',
    tag: 'Feature',
    color: '#60A5FA',
    changes: [
      { type: 'new', text: 'HowItWorks: 3-panel interactive demo with auto-cycling and progress bar' },
      { type: 'new', text: 'Telehealth page — 5 verified partners, same-day availability, 40+ languages' },
      { type: 'new', text: 'Preventive Care Calendar — free clinic events, vaccine drives, dental days' },
      { type: 'improved', text: 'Mobile dock navigation — thumb-friendly bottom bar on mobile' },
      { type: 'fixed', text: 'PageTransition reduced from 650ms → 450ms; bento cards now navigable' },
    ],
  },
  {
    version: '2.1.0',
    date: 'January 2025',
    tag: 'Foundation',
    color: '#FCD34D',
    changes: [
      { type: 'new', text: 'HRSA API integration — 1,400+ federally qualified health centers with live data' },
      { type: 'new', text: 'Impact Dashboard — live counters, equity breakdown, regional data, open dataset download' },
      { type: 'new', text: 'Stories page — community forum, upvotes, categories, story submission form' },
      { type: 'improved', text: 'Nav: authenticated state, mobile responsive, Cmd+K shortcut hint' },
    ],
  },
  {
    version: '1.0.0',
    date: 'December 2024',
    tag: 'Launch',
    color: '#FB923C',
    changes: [
      { type: 'new', text: 'NEXUS launches: find free clinics, know your rights, connect with CHWs' },
      { type: 'new', text: 'Programs & Eligibility checker for Medicaid, ACA, HRSA, 340B and 40+ programs' },
      { type: 'new', text: 'Advocacy page — active campaigns, petition integration, policy contact tools' },
    ],
  },
]

type ChangeType = 'new' | 'improved' | 'fixed'

const CHANGE_COLORS: Record<ChangeType, string> = {
  new:      '#6EE7B7',
  improved: '#60A5FA',
  fixed:    '#FCD34D',
}
const CHANGE_LABELS: Record<ChangeType, string> = {
  new: 'New', improved: 'Improved', fixed: 'Fixed',
}

const ROADMAP = [
  {
    status: 'live',
    quarter: 'Q1 2025',
    title: 'Core platform',
    items: ['Clinic search (12,000+)', 'Programs eligibility', 'CHW connections', 'Know your rights', 'Stories community', 'Advocacy campaigns'],
    color: '#6EE7B7',
  },
  {
    status: 'live',
    quarter: 'Q2 2025',
    title: 'Intelligence layer',
    items: ['AI care pathways', 'Outcome tracking', 'Telehealth options', 'Preventive calendar', 'User accounts', 'Impact dashboard'],
    color: '#A78BFA',
  },
  {
    status: 'building',
    quarter: 'Q3 2025',
    title: 'Community & data',
    items: ['Healthcare Equity Lab', 'Editorial journalism', 'Public impact wall', 'Cost calculator', 'Trust Markers', 'Open API v1'],
    color: '#FCD34D',
  },
  {
    status: 'planned',
    quarter: 'Q4 2025',
    title: 'Network effects',
    items: ['Verify-a-clinic flow', 'Crowdsourced wait times', 'Community mutual aid', 'Health passport (encrypted)', 'SMS-first interface', 'Provider dashboard v2'],
    color: '#60A5FA',
  },
]

const PRINCIPLES = [
  { icon: '🔒', title: 'Privacy first', body: 'No ads. No data brokers. No selling anything ever. Everything you do is anonymous unless you create an account.' },
  { icon: '🆓', title: 'Free forever', body: 'NEXUS will never charge patients. Funded by grants and mission-driven partners who believe in health equity.' },
  { icon: '📊', title: 'Radical transparency', body: 'Every metric we publish is audited. Every methodology change is versioned. You\'re looking at it right now.' },
  { icon: '🤝', title: 'Community-built', body: 'Clinics are verified by community members. Stories are real people. Improvement requests come from patients.' },
]

const STATS = [
  { val: '12,847', label: 'Verified clinics', color: '#6EE7B7' },
  { val: '284K+', label: 'People helped', color: '#A78BFA' },
  { val: '50', label: 'States covered', color: '#60A5FA' },
  { val: '48', label: 'Languages', color: '#FCD34D' },
  { val: '4hrs', label: 'Data refresh rate', color: '#FB923C' },
  { val: '$0', label: 'Cost to patients', color: '#4ade80' },
]

export default function OpenPage() {
  const [activeVersion, setActiveVersion] = useState<string | null>(null)

  return (
    <AppShell>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '70dvh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '100px 24px 60px', position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(110,231,183,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <Reveal>
          <div style={{ ...pill, marginBottom: '24px' }}><GitBranch size={10} strokeWidth={1.5} /> Open Roadmap</div>
        </Reveal>
        <Reveal delay={80}>
          <h1 style={{ fontSize: 'clamp(36px, 6.5vw, 76px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '24px', maxWidth: '720px' }}>
            We build in{' '}
            <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>public</em>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '540px', lineHeight: 1.7, marginBottom: '40px' }}>
            Every feature we ship, every decision we make, every metric we track — it's all here. Open roadmap, public changelog, and the principles that guide us.
          </p>
        </Reveal>

        {/* Stats row */}
        <Reveal delay={200}>
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'var(--font-display)' }}>{s.val}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', fontFamily: 'var(--font-inter)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── PRINCIPLES ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}>Our principles</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>What we believe</h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <div style={{ padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', height: '100%', transition: 'border-color 0.3s, background 0.3s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(110,231,183,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(110,231,183,0.03)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '14px' }}>{p.icon}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>{p.title}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><TrendingUp size={10} strokeWidth={1.5} /> Roadmap</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Where we're headed</h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {ROADMAP.map((r, i) => (
              <Reveal key={r.quarter} delay={i * 80}>
                <div style={{
                  padding: '2px', borderRadius: '22px',
                  background: r.status === 'live'
                    ? `linear-gradient(135deg, ${r.color}33, ${r.color}0a)`
                    : r.status === 'building'
                    ? `linear-gradient(135deg, ${r.color}22, ${r.color}06)`
                    : 'rgba(255,255,255,0.05)',
                }}>
                  <div style={{ background: 'rgba(8,13,26,0.97)', borderRadius: '20px', padding: '24px', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: r.color, fontFamily: 'var(--font-inter)',
                      }}>{r.quarter}</span>
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px',
                        background: r.status === 'live' ? `${r.color}18` : r.status === 'building' ? 'rgba(252,211,77,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${r.status === 'live' ? r.color + '33' : r.status === 'building' ? 'rgba(252,211,77,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        color: r.status === 'live' ? r.color : r.status === 'building' ? '#FCD34D' : 'rgba(255,255,255,0.35)',
                        fontFamily: 'var(--font-inter)',
                      }}>
                        {r.status === 'live' ? '✓ Live' : r.status === 'building' ? '⚡ Building' : '○ Planned'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>{r.title}</h3>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {r.items.map(item => (
                        <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)' }}>
                          <span style={{ color: r.status === 'live' ? r.color : r.status === 'building' ? '#FCD34D' : 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: '2px' }}>
                            {r.status === 'live' ? '✓' : r.status === 'building' ? '·' : '○'}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHANGELOG ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><Clock size={10} strokeWidth={1.5} /> Changelog</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>What we've shipped</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginTop: '16px', lineHeight: 1.65 }}>Every release, every improvement, in reverse chronological order.</p>
            </div>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {CHANGELOG.map((entry, i) => {
              const isOpen = activeVersion === entry.version || (activeVersion === null && i === 0)
              return (
                <Reveal key={entry.version} delay={i * 60}>
                  <div style={{
                    borderRadius: '18px', overflow: 'hidden',
                    border: '1px solid', marginBottom: '6px',
                    borderColor: isOpen ? `${entry.color}33` : 'rgba(255,255,255,0.06)',
                    background: isOpen ? `${entry.color}06` : 'transparent',
                    transition: 'all 0.3s',
                  }}>
                    <button
                      onClick={() => setActiveVersion(isOpen && i !== 0 ? null : entry.version)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer',
                        color: 'inherit', fontFamily: 'inherit', textAlign: 'left',
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-orbitron)', fontSize: '14px', fontWeight: 600,
                        color: entry.color, letterSpacing: '0.05em', flexShrink: 0,
                        minWidth: '60px',
                      }}>
                        {entry.version}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{`${entry.changes.length} changes`}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', fontFamily: 'var(--font-inter)' }}>{entry.date}</div>
                      </div>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px',
                        background: `${entry.color}15`, border: `1px solid ${entry.color}33`, color: entry.color,
                        fontFamily: 'var(--font-inter)', letterSpacing: '0.06em', flexShrink: 0,
                      }}>{entry.tag}</span>
                      <div style={{ color: 'rgba(255,255,255,0.3)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </button>
                    <div style={{ maxHeight: isOpen ? '600px' : '0', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                      <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {entry.changes.map((c, j) => {
                          const ct = c.type as ChangeType
                          return (
                            <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                              <span style={{
                                fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                                background: `${CHANGE_COLORS[ct]}15`,
                                border: `1px solid ${CHANGE_COLORS[ct]}33`,
                                color: CHANGE_COLORS[ct],
                                fontFamily: 'var(--font-inter)', letterSpacing: '0.05em',
                                flexShrink: 0, marginTop: '1px',
                              }}>
                                {CHANGE_LABELS[ct]}
                              </span>
                              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-inter)', lineHeight: 1.5 }}>
                                {c.text}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── GET INVOLVED ── */}
      <section style={{ padding: '80px 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><MessageSquare size={10} strokeWidth={1.5} /> Get involved</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '16px' }}>
                Help us build this
              </h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, maxWidth: '480px', margin: '0 auto' }}>
                NEXUS is built by a small team with a large mission. We need your input, your feedback, and your stories.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {[
              { icon: <CheckCircle size={18} strokeWidth={1.5} />, title: 'Submit a feature request', body: 'Have an idea that could help someone get care? Tell us.', href: '/advocacy', color: '#6EE7B7', cta: 'Submit idea' },
              { icon: <Globe size={18} strokeWidth={1.5} />, title: 'Verify or add a clinic', body: 'Know a free clinic that isn\'t in our database? Help us add it.', href: '/search', color: '#60A5FA', cta: 'Add clinic' },
              { icon: <Zap size={18} strokeWidth={1.5} />, title: 'Share your story', body: 'Your experience navigating care without insurance can help someone else.', href: '/stories', color: '#A78BFA', cta: 'Share story' },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 80}>
                <a href={card.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '28px', borderRadius: '20px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    height: '100%', transition: 'border-color 0.3s, background 0.3s, transform 0.3s',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${card.color}33`; el.style.background = `${card.color}06`; el.style.transform = 'translateY(-3px)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.06)'; el.style.background = 'rgba(255,255,255,0.02)'; el.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${card.color}15`, border: `1px solid ${card.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, marginBottom: '16px' }}>
                      {card.icon}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>{card.title}</h3>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, marginBottom: '16px' }}>{card.body}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: card.color }}>
                      {card.cta} <ArrowRight size={13} strokeWidth={2} />
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  )
}
