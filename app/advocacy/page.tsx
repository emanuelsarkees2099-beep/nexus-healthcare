'use client'
export const dynamic = 'force-dynamic'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { Speaker, TickCircle, Location, ArrowDown2, ExportSquare, Book1, Flash, Profile2User } from 'iconsax-react'

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function RevealBlock({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      {children}
    </div>
  )
}

/* ─── data ────────────────────────────────────────── */
/* Official, non-partisan lookup tools. AXVO does not run petitions,
   collect signatures, or lobby — this page points people to the real
   channels for contacting the officials who represent them. */
const ACTIONS = [
  { title: 'Contact your U.S. Representative', desc: 'Enter your ZIP code on the official House site to find your representative and their contact page.', url: 'https://www.house.gov/representatives/find-your-representative', cta: 'house.gov' },
  { title: 'Contact your U.S. Senators', desc: 'The Senate directory lists both of your senators with phone numbers and contact forms.', url: 'https://www.senate.gov/senators/senators-contact.htm', cta: 'senate.gov' },
  { title: 'Find your state legislators', desc: 'Medicaid expansion and many coverage rules are decided by state legislatures. Look up yours by address.', url: 'https://openstates.org/find_your_legislator/', cta: 'openstates.org' },
  { title: 'Look up any federal bill', desc: 'Congress.gov is the official record of every bill, its text, its sponsors, and every action taken on it.', url: 'https://www.congress.gov', cta: 'congress.gov' },
]

/* Issues currently affecting uninsured and low-income patients.
   Status lines are stated as of the date below; check the linked
   source for anything newer. */
const ISSUES_CHECKED = 'November 2026'
const ISSUES = [
  {
    id: 'aca-subsidies',
    title: 'Enhanced ACA Marketplace subsidies',
    status: 'Expired',
    statusColor: '#f87171',
    summary: 'The larger premium tax credits created in 2021 and extended through 2025 expired on December 31, 2025, which raised what many Marketplace enrollees pay. In January 2026 the House passed a three-year extension; the Senate has not passed it. The original ACA subsidies still exist for most people earning 100–400% of the federal poverty level.',
    url: 'https://www.congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22search%22%3A%22premium+tax+credit+extension%22%7D',
    linkLabel: 'Search Congress.gov',
  },
  {
    id: 'medicaid-gap',
    title: 'The Medicaid coverage gap',
    status: 'Ongoing',
    statusColor: '#4F8EF0',
    summary: 'Ten states have not adopted the ACA Medicaid expansion: Alabama, Florida, Georgia, Kansas, Mississippi, South Carolina, Tennessee, Texas, Wisconsin, and Wyoming. In most of them, adults can earn too much for Medicaid but too little to get Marketplace subsidies. Expansion is decided by each state’s legislature or, in some states, by ballot measure.',
    url: 'https://www.kff.org/medicaid/issue-brief/status-of-state-medicaid-expansion-decisions/',
    linkLabel: 'KFF expansion tracker',
  },
  {
    id: 'drug-negotiation',
    title: 'Medicare drug price negotiation',
    status: 'In effect',
    statusColor: '#4F8EF0',
    summary: 'The Inflation Reduction Act of 2022 let Medicare negotiate prices on some high-cost drugs for the first time. Negotiated prices for the first 10 drugs took effect January 1, 2026, and 15 more drugs were selected for prices starting in 2027.',
    url: 'https://www.cms.gov/inflation-reduction-act-and-medicare/medicare-drug-price-negotiation',
    linkLabel: 'CMS program page',
  },
  {
    id: 'health-centers',
    title: 'Community health center funding',
    status: 'Needs renewal',
    statusColor: '#4F8EF0',
    summary: 'Most federal funding for community health centers comes from the Community Health Center Fund, which Congress has to extend periodically. These centers must serve patients regardless of ability to pay, so lapses in that funding directly affect uninsured patients.',
    url: 'https://bphc.hrsa.gov/',
    linkLabel: 'HRSA Health Center Program',
  },
]

/* Real, documented state expansions of coverage. */
const POLICY_WINS = [
  { state: 'ME', name: 'Maine', win: 'First state to expand Medicaid by ballot measure', year: '2017', color: '#4F8EF0' },
  { state: 'UT', name: 'Utah, Idaho & Nebraska', win: 'Voters approved Medicaid expansion ballot measures', year: '2018', color: 'var(--accent)' },
  { state: 'MO', name: 'Missouri & Oklahoma', win: 'Voters wrote Medicaid expansion into their state constitutions', year: '2020', color: '#4F8EF0' },
  { state: 'SD', name: 'South Dakota', win: 'Voters approved a constitutional amendment expanding Medicaid', year: '2022', color: '#4F8EF0' },
  { state: 'NC', name: 'North Carolina', win: 'Legislature passed Medicaid expansion; coverage began Dec 1, 2023', year: '2023', color: '#4F8EF0' },
  { state: 'CA', name: 'California', win: 'Full Medi-Cal opened to income-eligible adults regardless of immigration status', year: '2024', color: '#4F8EF0' },
]

const FAQ = [
  { q: 'Do elected officials actually read constituent messages?', a: 'Congressional offices log constituent calls, emails, and letters by issue and report the volume to the member. You may not get a personal reply, but you are counted. Research from the Congressional Management Foundation has found that personal messages explaining how a policy affects you carry more weight with staff than identical form letters.' },
  { q: 'What should I say?', a: 'Keep it short: say you are a constituent, name the issue or bill, explain in a few sentences how it affects you or your family, and say what you want them to do. Calling the office is often the fastest way to be logged.' },
  { q: 'Does AXVO run petitions or lobby?', a: 'No. AXVO does not collect signatures, run campaigns, or lobby, and it is not affiliated with any advocacy organization. This page only points you to official tools for contacting the people who represent you.' },
  { q: 'I’m not a citizen. Can I still be involved?', a: 'Yes. Anyone can contact their elected officials regardless of immigration status, and you can share information and help others navigate the system. Your experience matters.' },
]

/* ─── page ────────────────────────────────────────── */
export default function AdvocacyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)

  const pill: React.CSSProperties = {
    // Plain section label — no colored badge
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', fontWeight: 600, color: 'var(--text-2)',
  }

  return (
    <AppShell>
      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '120px 24px 72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '800px', maxWidth: '100%', height: '500px', background: 'transparent', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '760px', position: 'relative' }}>
          <div style={{ marginBottom: '28px' }}><span style={pill}><Speaker size={14} variant="Linear" /> Advocacy</span></div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, margin: '0 0 18px', color: 'var(--text)' }}>Make your voice heard on health policy</h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '540px', margin: '0 auto', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 100ms both' }}>
            Whether you can get Medicaid, what a Marketplace plan costs, and how much funding your local health center gets all come down to decisions by elected officials. Here&apos;s how to reach yours, and what&apos;s worth paying attention to.
          </p>
        </div>
      </section>

      {/* ── TAKE ACTION ──────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '40px' }}>
              <span style={pill}><Profile2User size={14} variant="Linear" /> Take action</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15 }}>Reach the people who represent you</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.38)', marginTop: '10px', maxWidth: '480px', lineHeight: 1.6 }}>Official, non-partisan lookup tools. Each takes about a minute.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {ACTIONS.map((a, i) => (
              <RevealBlock key={a.title} delay={i * 70}>
                <a href={a.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', boxSizing: 'border-box', padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(79,142,240,0.3)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.3 }}>{a.title}</h3>
                  <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, flex: 1 }}>{a.desc}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>
                    {a.cta} <ExportSquare size={13} variant="Linear" />
                  </span>
                </a>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── ISSUES ───────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '40px' }}>
              <span style={pill}><Flash size={14} variant="Linear" /> Issues to follow</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15 }}>What affects uninsured patients right now</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.38)', marginTop: '10px', maxWidth: '520px', lineHeight: 1.6 }}>
                Status as of {ISSUES_CHECKED}. Each item links to an official or non-partisan source with the latest details.
              </p>
            </div>
          </RevealBlock>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ISSUES.map((issue, i) => (
              <RevealBlock key={issue.id} delay={i * 70}>
                <div id={issue.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                    aria-expanded={expandedIssue === issue.id}
                    style={{ width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', fontFamily: 'inherit', textAlign: 'left' }}>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '100px', background: `${issue.statusColor}15`, color: issue.statusColor, border: `1px solid ${issue.statusColor}30`, fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0 }}>
                      {issue.status}
                    </span>
                    <span style={{ flex: 1, fontSize: '15px', fontWeight: 700, color: '#eef4f5', lineHeight: 1.35 }}>{issue.title}</span>
                    <ArrowDown2 size={15} variant="Linear" style={{ color: 'rgba(255,255,255,0.35)', transform: expandedIssue === issue.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                  </button>

                  {expandedIssue === issue.id && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '16px 0 18px' }}>{issue.summary}</p>
                      <a href={issue.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'var(--accent)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                        <Book1 size={12} variant="Linear" /> {issue.linkLabel} <ExportSquare size={11} variant="Linear" />
                      </a>
                    </div>
                  )}
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── POLICY WINS ──────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '48px' }}>
              <span style={pill}><Location size={14} variant="Linear" /> It has worked before</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15 }}>States that expanded coverage</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.38)', marginTop: '10px', maxWidth: '480px', lineHeight: 1.6 }}>In several states, coverage expanded because voters put it on the ballot or pushed their legislature to act.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {POLICY_WINS.map((w, i) => (
              <RevealBlock key={w.state} delay={i * 70}>
                <div style={{ padding: '22px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start', height: '100%', boxSizing: 'border-box' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${w.color}15`, border: `1px solid ${w.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', color: w.color, flexShrink: 0, fontFamily: 'var(--font-inter)' }}>{w.state}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{w.name}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: '6px' }}>{w.win}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '4px' }}><TickCircle size={14} variant="Linear" /> {w.year}</div>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section style={{ padding: '80px 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '40px' }}>
              <span style={pill}>Common questions</span>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '20px' }}>Does contacting officials actually matter?</h2>
            </div>
          </RevealBlock>
          {FAQ.map((f, i) => (
            <RevealBlock key={f.q} delay={i * 50}>
              <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid', marginBottom: '6px', borderColor: openFaq === i ? 'rgba(79,142,240,0.2)' : 'rgba(255,255,255,0.06)', background: openFaq === i ? 'rgba(79,142,240,0.03)' : 'transparent', transition: 'all 0.25s' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', textAlign: 'left', gap: '16px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.4 }}>{f.q}</span>
                  <ArrowDown2 size={15} variant="Linear" style={{ flexShrink: 0, color: 'rgba(255,255,255,0.4)', transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                </button>
                <div style={{ maxHeight: openFaq === i ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                  <p style={{ padding: '0 22px 18px', fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: 0 }}>{f.a}</p>
                </div>
              </div>
            </RevealBlock>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </AppShell>
  )
}
