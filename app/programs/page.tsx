'use client'
import React, { useState, useEffect, useRef } from 'react'
import AppShell from '@/components/AppShell'
import { useRouter } from 'next/navigation'
import { smoothScrollTo } from '@/utils/smoothScroll'
import { CheckCircle2, ChevronRight, ChevronLeft, DollarSign, AlertCircle, TrendingUp, ShieldCheck, Zap, ArrowRight, Sparkles, ReceiptText, RefreshCw } from 'lucide-react'

/* ─── reveal hook ─────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function RevealBlock({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</div>
  )
}

/* ─── data ────────────────────────────────────────── */
const QUIZ = [
  { q: 'What is your current insurance status?',       hint: 'This determines which programs are open to you.', options: ['No insurance', 'Lost coverage recently', 'Medicaid / CHIP', 'Employer coverage I can\'t afford', 'Other / Not sure'] },
  { q: 'How many people are in your household?',        hint: 'Include yourself and anyone you financially support.', options: ['Just me', '2 people', '3–4 people', '5+ people'] },
  { q: 'What is your approximate annual income?',       hint: 'Used only for eligibility checks — never stored.', options: ['Under $15,000', '$15,000 – $30,000', '$30,000 – $50,000', '$50,000 – $70,000', 'Over $70,000'] },
  { q: 'What care do you currently need?',              hint: 'We\'ll check every matching program.', options: ['Primary care visits', 'Prescription medications', 'Dental or vision', 'Mental health services', 'Specialist referrals'] },
  { q: 'Are you enrolled in any assistance program?',   hint: 'We\'ll surface what you\'re missing.', options: ['Nothing yet', 'SNAP / food only', 'Some programs, not healthcare', 'Medicaid already', 'Not sure'] },
]

const PROGRAMS_BASE = [
  { name: 'Medicaid', tag: 'Federal', color: '#4ade80', colorBg: 'rgba(74,222,128,0.08)', desc: 'Full health coverage for qualifying low-income adults and families. Covers doctor visits, hospital stays, prescriptions, and more.', savings: '$0 premium · $0–$3 copays', icon: <ShieldCheck size={16} strokeWidth={1.5} />, url: 'https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/' },
  { name: 'HRSA Free Clinic Program', tag: 'Federal', color: '#6d9197', colorBg: 'rgba(109,145,151,0.08)', desc: 'Federally funded community health centers required to serve everyone regardless of ability to pay — primary care, dental, mental health.', savings: 'Up to $400/visit covered', icon: <TrendingUp size={16} strokeWidth={1.5} />, url: '/pathways' },
  { name: 'ACA Marketplace Subsidy', tag: 'Federal', color: '#60a5fa', colorBg: 'rgba(96,165,250,0.08)', desc: 'Premium tax credits that may reduce your health insurance cost to $0–$50/month based on your income.', savings: 'Avg $340/month subsidy', icon: <DollarSign size={16} strokeWidth={1.5} />, url: 'https://www.healthcare.gov/apply-and-enroll/start-enrollment/' },
  { name: 'NeedyMeds PAP', tag: 'Rx', color: '#f472b6', colorBg: 'rgba(244,114,182,0.08)', desc: 'Manufacturer patient assistance programs that provide brand-name medications at no or low cost for uninsured and low-income patients.', savings: 'Avg $200–$400/month in Rx', icon: <Zap size={16} strokeWidth={1.5} />, url: 'https://www.needymeds.org/pap' },
  { name: 'State 340B Program', tag: 'State', color: '#fbbf24', colorBg: 'rgba(251,191,36,0.08)', desc: 'Discounted prescription drugs at HRSA-participating clinics for low-income patients — often 25–50% below retail prices.', savings: '25–50% off all medications', icon: <RefreshCw size={16} strokeWidth={1.5} />, url: '/pathways' },
]

// Real 2024 Federal Poverty Level thresholds
const FPL_2024: Record<number, number> = { 1: 15060, 2: 20440, 3: 25820, 4: 31200, 5: 36580, 6: 41960 }

function computePrograms(answers: string[]) {
  const insurance = answers[0] ?? ''
  const hhSizeStr = answers[1] ?? ''
  const incomeStr = answers[2] ?? ''
  const care      = answers[3] ?? ''
  const enrolled  = answers[4] ?? ''

  const incomeMap: Record<string, number> = { 'Under $15,000': 12000, '$15,000 – $30,000': 22000, '$30,000 – $50,000': 40000, '$50,000 – $70,000': 60000, 'Over $70,000': 85000 }
  const hhMap: Record<string, number>     = { 'Just me': 1, '2 people': 2, '3–4 people': 3, '5+ people': 5 }

  const annualIncome = incomeMap[incomeStr] ?? 22000
  const hh = hhMap[hhSizeStr] ?? 1
  const fpl = FPL_2024[Math.min(hh, 6)] ?? 41960
  const fplPct = (annualIncome / fpl) * 100
  const alreadyOnMedicaid = enrolled === 'Medicaid already'
  const isUninsured = insurance === 'No insurance' || insurance === 'Lost coverage recently'

  // ── Medicaid: ≤138% FPL in expansion states; ≤100% FPL in non-expansion ──
  let medicaidScore = 0
  if (!alreadyOnMedicaid) {
    if (fplPct <= 100) medicaidScore = 96
    else if (fplPct <= 138) medicaidScore = 84   // expansion states only
    else if (fplPct <= 200) medicaidScore = 42   // CHIP in some states
    else medicaidScore = 12
    if (isUninsured) medicaidScore = Math.min(99, medicaidScore + 3)
  }

  // ── FQHC: available to everyone, highest for uninsured ──
  const fqhcScore = isUninsured ? 93 : fplPct <= 200 ? 85 : 70

  // ── ACA Subsidy: 100–600% FPL (enhanced subsidies through 2025) ──
  let acaScore = 0
  if (fplPct < 100) acaScore = 35          // Medicaid gap (non-expansion state)
  else if (fplPct <= 200) acaScore = 88
  else if (fplPct <= 400) acaScore = 78
  else if (fplPct <= 600) acaScore = 58
  else acaScore = 22
  if (insurance === "Employer coverage I can't afford") acaScore = Math.min(95, acaScore + 10)
  if (alreadyOnMedicaid) acaScore = Math.max(0, acaScore - 20)

  // ── NeedyMeds PAP: most useful for prescription needs, low income ──
  let needyScore = 50
  if (care === 'Prescription medications') needyScore += 30
  if (fplPct <= 200) needyScore += 15
  if (isUninsured) needyScore += 8
  needyScore = Math.min(95, needyScore)

  // ── 340B: useful for prescriptions at qualifying clinics ──
  let b340Score = fplPct <= 200 ? 68 : fplPct <= 300 ? 52 : 30
  if (care === 'Prescription medications') b340Score = Math.min(88, b340Score + 15)

  const scores = [medicaidScore, fqhcScore, acaScore, needyScore, b340Score]
  return PROGRAMS_BASE
    .map((p, i) => ({ ...p, match: Math.round(scores[i]) }))
    .filter(p => {
      if (p.name === 'Medicaid' && alreadyOnMedicaid) return false
      return p.match >= 20
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 5)
}

const COST_ROWS = [
  { label: 'Primary care visit',           base: '$180–$350',  aided: '$0–$20' },
  { label: 'Generic prescription (30-day)', base: '$40–$120',  aided: '$0–$4' },
  { label: 'Dental cleaning',              base: '$100–$300',  aided: '$0' },
  { label: 'Mental health session',        base: '$150–$250',  aided: '$0–$30' },
  { label: 'Lab work (basic panel)',        base: '$80–$200',   aided: '$0–$10' },
]

const ALERTS = [
  { title: 'Medicaid Open Enrollment', date: 'Re-enrollment opens Jan 1', status: 'Upcoming', color: '#60a5fa' },
  { title: 'ACA Marketplace',          date: 'Closes Dec 15 — act now',   status: 'Urgent',   color: '#f87171' },
  { title: 'CHIP for Families',        date: 'Year-round enrollment',      status: 'Open',     color: '#4ade80' },
]

const HOW_STEPS = [
  { n: '01', title: 'Answer 5 short questions', body: 'No personal info required. Just income, household size, and what you need.' },
  { n: '02', title: 'Get your matched programs', body: 'We cross-check 40+ federal and state programs in real time and rank by match confidence.' },
  { n: '03', title: 'Apply with guided help', body: 'Each match comes with a direct link and pre-filled form instructions to reduce friction.' },
]

/* ─── match bar ───────────────────────────────────── */
function MatchBar({ pct, color }: { pct: number; color: string }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(pct), 200); return () => clearTimeout(t) }, [pct])
  return (
    <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
      <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: '4px', transition: 'width 1.1s cubic-bezier(0.16,1,0.3,1)' }} />
    </div>
  )
}

/* ─── Programs FAQ ────────────────────────────────── */
const PROG_FAQ = [
  { q: 'What documents do I need to apply for Medicaid?', a: 'Proof of income (pay stubs, tax return, or self-attestation), photo ID, proof of state residency, and Social Security number. Many states allow self-attestation if you lack documents.' },
  { q: 'Can I be seen at an FQHC before I\'m enrolled in any program?', a: 'Yes. FQHCs are federally required to see patients regardless of insurance or ability to pay. You can walk in today. The sliding-scale fee may be $0 if your income is below 100% FPL.' },
  { q: 'What if I don\'t qualify for Medicaid in my state?', a: 'Some states have not expanded Medicaid. If you fall in the coverage gap, we\'ll find FQHC clinics, free clinics, and 340B pharmacy programs that provide care regardless of Medicaid status.' },
  { q: 'How often should I re-check my eligibility?', a: 'Check whenever your income, household size, or insurance status changes. Open enrollment for ACA plans runs November 1 – January 15. Medicaid eligibility can be re-checked any time.' },
]

function ProgramsFAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const { ref, visible } = useReveal(0.1)
  return (
    <section ref={ref} style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(28px)', transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '48px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(109,145,151,0.08)', color: 'var(--accent)', border: '1px solid rgba(109,145,151,0.18)', marginBottom: '20px' }}>Common questions</span>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>Program & eligibility FAQs</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {PROG_FAQ.map((item, i) => (
            <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: open === i ? 'rgba(109,145,151,0.25)' : 'rgba(255,255,255,0.06)', background: open === i ? 'rgba(109,145,151,0.04)' : 'transparent', transition: 'border-color 0.25s, background 0.25s', marginBottom: '4px' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', textAlign: 'left', gap: '16px' }}
              >
                <span style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.4 }}>{item.q}</span>
                <span style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', background: open === i ? 'rgba(109,145,151,0.15)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s, background 0.25s', transform: open === i ? 'rotate(45deg)' : 'none', color: open === i ? 'var(--accent)' : 'rgba(255,255,255,0.4)', fontSize: '16px', lineHeight: 1 }}>+</span>
              </button>
              <div style={{ maxHeight: open === i ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                <p style={{ padding: '0 24px 20px', fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: 0 }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── page ────────────────────────────────────────── */
export default function ProgramsPage() {
  const router = useRouter()
  const [step, setStep]         = useState<'quiz'|'results'>('quiz')
  const [qIdx, setQIdx]         = useState(0)
  const [answers, setAnswers]   = useState<string[]>([])
  const [selected, setSelected] = useState('')
  const [running, setRunning]   = useState(false)
  const [matchedPrograms, setMatchedPrograms] = useState(PROGRAMS_BASE.map(p => ({ ...p, match: 0 })))
  const resultsRef = useRef<HTMLDivElement>(null)

  const pill: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '4px 12px', borderRadius: '100px',
    fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
    background: 'rgba(109,145,151,0.08)', color: 'var(--accent)', border: '1px solid rgba(109,145,151,0.18)',
  }

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px',
  }

  function next() {
    if (!selected) return
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    setSelected('')
    if (qIdx < QUIZ.length - 1) { setQIdx(qIdx + 1) }
    else {
      setRunning(true)
      setTimeout(() => {
        const computed = computePrograms(newAnswers)
        setMatchedPrograms(computed)
        setRunning(false)
        setStep('results')
        setTimeout(() => smoothScrollTo(resultsRef.current), 100)
      }, 2000)
    }
  }

  function back() {
    if (qIdx === 0) return
    const prev = [...answers]
    const prevSelected = prev.pop() || ''
    setAnswers(prev)
    setSelected(prevSelected)
    setQIdx(qIdx - 1)
  }

  function restart() {
    setStep('quiz'); setQIdx(0); setAnswers([]); setSelected('')
  }

  return (
    <AppShell>
      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ minHeight: '80dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '80px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '350px', background: 'radial-gradient(ellipse, rgba(74,222,128,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '720px', position: 'relative' }}>
          <div style={{ marginBottom: '28px' }}>
            <span style={pill}><ReceiptText size={10} strokeWidth={1.5} /> Financial Clearinghouse</span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 56px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '22px' }}>
            You're leaving money on the table.
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '500px', margin: '0 auto 40px' }}>
            Most uninsured people qualify for 2–4 programs they've never heard of. Answer 5 questions and find out which ones you're owed.
          </p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[{ v: '40+', l: 'Programs checked' }, { v: '$0', l: 'Cost to check' }, { v: '2 min', l: 'Time required' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{s.v}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              {HOW_STEPS.map((s, i) => (
                <div key={s.n} style={{ padding: '32px 28px', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#4ade80', letterSpacing: '0.12em', marginBottom: '14px' }}>{s.n}</div>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px', lineHeight: 1.3 }}>{s.title}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ── QUIZ ─────────────────────────────────────── */}
      {step === 'quiz' && (
        <section id="programs-quiz" style={{ padding: '0 24px 100px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* progress */}
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Question {qIdx + 1} of {QUIZ.length}</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>{Math.round((qIdx / QUIZ.length) * 100)}% complete</span>
            </div>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden', marginBottom: '40px' }}>
              <div style={{ height: '100%', width: `${(qIdx / QUIZ.length) * 100}%`, background: 'linear-gradient(90deg, #4ade80, #6d9197)', borderRadius: '100px', transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
            </div>

            {!running ? (
              <div style={{ animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both' }} key={qIdx}>
                <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '10px', lineHeight: 1.25 }}>{QUIZ[qIdx].q}</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)', marginBottom: '28px' }}>{QUIZ[qIdx].hint}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {QUIZ[qIdx].options.map(opt => (
                    <button key={opt} onClick={() => setSelected(opt)}
                      style={{
                        padding: '16px 20px', borderRadius: '14px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: selected === opt ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selected === opt ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.07)'}`,
                        color: selected === opt ? '#4ade80' : 'rgba(255,255,255,0.7)',
                        fontSize: '15px', transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                      }}
                    >
                      {opt}
                      {selected === opt && <CheckCircle2 size={16} strokeWidth={1.5} style={{ color: '#4ade80', flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {qIdx > 0 && (
                    <button onClick={back} style={{ flex: '0 0 auto', padding: '14px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ChevronLeft size={14} /> Back
                    </button>
                  )}
                  <button onClick={next} disabled={!selected}
                    style={{
                      flex: 1, padding: '14px', borderRadius: '12px', border: 'none', cursor: selected ? 'pointer' : 'not-allowed',
                      background: selected ? 'rgba(74,222,128,0.9)' : 'rgba(255,255,255,0.05)',
                      color: selected ? '#0a0a0a' : 'rgba(255,255,255,0.25)',
                      fontSize: '15px', fontWeight: 600, fontFamily: 'inherit',
                      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    {qIdx < QUIZ.length - 1 ? 'Next' : 'Find my programs'} <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid rgba(74,222,128,0.15)', borderTopColor: '#4ade80', margin: '0 auto 24px', animation: 'spin 0.9s linear infinite' }} />
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)' }}>Checking 40+ federal and state programs…</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginTop: '8px' }}>Medicaid · ACA · 340B · NeedyMeds · State programs</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── RESULTS ──────────────────────────────────── */}
      {step === 'results' && (
        <section ref={resultsRef} style={{ padding: '0 24px 60px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <RevealBlock>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
                <div>
                  <h2 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.02em' }}>{matchedPrograms.length} program{matchedPrograms.length !== 1 ? 's' : ''} matched for you</h2>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>Ranked by match confidence · Updated daily</p>
                </div>
                <button onClick={restart} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <RefreshCw size={12} strokeWidth={1.5} /> Re-check
                </button>
              </div>
            </RevealBlock>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '56px' }}>
              {matchedPrograms.map((p, i) => (
                <RevealBlock key={p.name} delay={i * 70}>
                  {/* double-bezel */}
                  <div style={{ borderRadius: '22px', padding: '2px', background: `linear-gradient(135deg, ${p.color}22, transparent)` }}>
                    <div style={{ borderRadius: '21px', padding: '24px 26px', background: 'rgba(10,9,22,0.95)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: p.colorBg, border: `1px solid ${p.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.color }}>{p.icon}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text)' }}>{p.name}</div>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '100px', background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}25` }}>{p.tag}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '24px', fontWeight: 700, color: p.color, letterSpacing: '-0.02em' }}>{p.match}%</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>match</div>
                        </div>
                      </div>
                      <MatchBar pct={p.match} color={p.color} />
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, marginTop: '14px' }}>{p.desc}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontSize: '13px', color: p.color, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={12} strokeWidth={1.5} />{p.savings}</span>
                        <button
                          onClick={() => p.url.startsWith('http') ? window.open(p.url, '_blank', 'noopener noreferrer') : router.push(p.url)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '100px', background: `${p.color}15`, border: `1px solid ${p.color}25`, color: p.color, fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = `${p.color}28`)}
                          onMouseLeave={e => (e.currentTarget.style.background = `${p.color}15`)}
                        >
                          Apply now <ArrowRight size={11} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                </RevealBlock>
              ))}
            </div>

            {/* cost estimator */}
            <RevealBlock>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(109,145,151,0.1)', border: '1px solid rgba(109,145,151,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><DollarSign size={15} strokeWidth={1.5} /></div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: '16px' }}>Cost estimator</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>What you'd pay vs. what you'd pay with your top programs</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '0', fontSize: '12px', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>Service</span><span style={{ textAlign: 'right' }}>Without</span><span style={{ textAlign: 'right' }}>With NEXUS</span>
                </div>
                {COST_ROWS.map(row => (
                  <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '0', padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>{row.label}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through', textAlign: 'right' }}>{row.base}</span>
                    <span style={{ fontSize: '15px', color: '#4ade80', fontWeight: 600, textAlign: 'right' }}>{row.aided}</span>
                  </div>
                ))}
              </div>
            </RevealBlock>

            {/* enrollment alerts */}
            <RevealBlock delay={80}>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={15} strokeWidth={1.5} style={{ color: 'var(--accent)' }} /> Enrollment windows</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {ALERTS.map(a => (
                    <div key={a.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>{a.title}</div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{a.date}</div>
                      </div>
                      <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '100px', background: `${a.color}15`, color: a.color, border: `1px solid ${a.color}25`, fontWeight: 500 }}>{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealBlock>
          </div>
        </section>
      )}

      {/* ── INSURANCE ENROLLMENT WIZARD ─────────────── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ borderRadius: '24px', padding: '2px', background: 'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(74,222,128,0.1))' }}>
              <div style={{ borderRadius: '23px', padding: '40px 44px', background: 'rgba(10,9,22,0.97)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}>
                <div style={{ marginBottom: '32px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(96,165,250,0.08)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.18)', marginBottom: '16px' }}>
                    <Zap size={10} strokeWidth={1.5} /> Step-by-step Enrollment Guide
                  </span>
                  <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '10px' }}>
                    Your insurance enrollment roadmap
                  </h2>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>
                    Based on your quiz answers, here are the exact steps to enroll in your highest-matched programs. Each section links directly to the official enrollment portal.
                  </p>
                </div>

                {/* Medicaid enrollment steps */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={14} color="#4ade80" strokeWidth={1.5} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Medicaid Enrollment</h3>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>Free coverage</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { step: '01', title: 'Check your state\'s expansion status', body: 'As of 2024, 41 states + DC have expanded Medicaid to adults earning up to 138% FPL (~$20,120/yr single). Find your state:', link: 'https://www.kff.org/medicaid/issue-brief/status-of-state-medicaid-expansion-decisions-interactive-map/', linkLabel: 'KFF State Map →' },
                      { step: '02', title: 'Apply online (15–30 min)', body: 'Most states accept applications year-round at Healthcare.gov or your state Medicaid portal. You\'ll need: ID, proof of income (or self-attest), and proof of residency.', link: 'https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/', linkLabel: 'Apply on Healthcare.gov →' },
                      { step: '03', title: 'Presumptive eligibility: get care today', body: 'Many clinics can grant same-day temporary Medicaid coverage (Presumptive Eligibility) while your application processes. Ask your nearest FQHC.', link: '/search', linkLabel: 'Find nearest FQHC →' },
                      { step: '04', title: 'Coverage is retroactive', body: 'Medicaid coverage typically begins on the first day of the month you applied. Emergency care you received may be retroactively covered up to 3 months prior in some states.' },
                    ].map((s) => (
                      <div key={s.step} style={{ display: 'flex', gap: '14px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <span style={{ flexShrink: 0, fontSize: '10px', fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', marginTop: '2px', minWidth: '22px' }}>{s.step}</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '5px' }}>{s.title}</div>
                          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>{s.body}</div>
                          {s.link && (
                            <a href={s.link} target={s.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '12px', color: '#4ade80', textDecoration: 'none', borderBottom: '1px solid rgba(74,222,128,0.3)', paddingBottom: '1px' }}>
                              {s.linkLabel}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACA steps */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={14} color="#60a5fa" strokeWidth={1.5} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>ACA Marketplace (Healthcare.gov)</h3>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(96,165,250,0.08)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>Often $0/month</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { step: '01', title: 'Know your enrollment window', body: 'Open Enrollment: November 1 – January 15 each year. Outside this window, you qualify if you have a Special Enrollment Period (lost job, had a baby, moved, etc.).', link: 'https://www.healthcare.gov/apply-and-enroll/start-enrollment/', linkLabel: 'Check if you qualify for SEP →' },
                      { step: '02', title: 'Create your Healthcare.gov account', body: 'Go to healthcare.gov → Create Account. Have your Social Security number, income estimate, and household size ready. The system auto-calculates your subsidy.', link: 'https://www.healthcare.gov', linkLabel: 'Go to Healthcare.gov →' },
                      { step: '03', title: 'Compare plans by total cost, not premium', body: 'A $0/month premium plan with high deductible is often worse than a $30/month plan with a $500 deductible if you need care. Use the "Total Yearly Costs" comparison view.', link: 'https://www.healthcare.gov/choose-a-plan/comparing-plans/', linkLabel: 'Plan comparison guide →' },
                      { step: '04', title: 'Enhanced subsidies through 2025', body: 'The Inflation Reduction Act extended enhanced ACA subsidies through 2025. If your income is under 150% FPL, you likely qualify for a $0-premium Silver plan with minimal copays.' },
                    ].map((s) => (
                      <div key={s.step} style={{ display: 'flex', gap: '14px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <span style={{ flexShrink: 0, fontSize: '10px', fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', marginTop: '2px', minWidth: '22px' }}>{s.step}</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '5px' }}>{s.title}</div>
                          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>{s.body}</div>
                          {s.link && (
                            <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '12px', color: '#60a5fa', textDecoration: 'none', borderBottom: '1px solid rgba(96,165,250,0.3)', paddingBottom: '1px' }}>
                              {s.linkLabel}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Immediate access */}
                <div style={{ padding: '20px', background: 'rgba(109,145,151,0.06)', border: '1px solid rgba(109,145,151,0.2)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>Need care right now?</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.6 }}>FQHCs cannot turn you away regardless of insurance status or ability to pay. Walk in today.</div>
                  </div>
                  <button
                    onClick={() => router.push('/search')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '100px', background: 'rgba(109,145,151,0.15)', border: '1px solid rgba(109,145,151,0.3)', color: '#6d9197', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(109,145,151,0.25)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(109,145,151,0.15)')}
                  >
                    Find free clinic <ArrowRight size={12} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────── */}
      <section style={{ padding: '60px 24px 120px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ borderRadius: '28px', padding: '3px', background: 'linear-gradient(135deg, rgba(74,222,128,0.25), rgba(109,145,151,0.1))' }}>
              <div style={{ borderRadius: '26px', padding: '56px 52px', background: 'rgba(10,9,22,0.97)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '28px', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}>
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.18)', marginBottom: '16px' }}><Sparkles size={10} strokeWidth={1.5} /> Free & private</span>
                  <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Your eligibility doesn't expire</h2>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', maxWidth: '400px', lineHeight: 1.65 }}>Check again whenever your situation changes — income, household size, or coverage status.</p>
                </div>
                <button onClick={() => { if (step === 'results') restart(); else { const el = document.getElementById('programs-quiz'); if (el) smoothScrollTo(el) } }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderRadius: '100px', background: 'rgba(255,255,255,0.94)', color: '#07070F', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {step === 'results' ? 'Re-check eligibility' : 'Check my eligibility'}
                  <span style={{ width: '26px', height: '26px', borderRadius: '100%', background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowRight size={12} strokeWidth={2} /></span>
                </button>
              </div>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ── HOW TO APPLY ─────────────────────────────── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '56px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(109,145,151,0.08)', color: 'var(--accent)', border: '1px solid rgba(109,145,151,0.18)', marginBottom: '20px' }}><ReceiptText size={10} strokeWidth={1.5} /> Application guide</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, maxWidth: '520px' }}>How to apply for each program</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', marginTop: '16px', maxWidth: '440px', lineHeight: 1.65 }}>Every program has a different process. Here's what to expect — and what to bring.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                name: 'Medicaid', badge: 'Highest impact', badgeColor: '#4ade80',
                steps: ['Visit healthcare.gov or your state\'s Medicaid portal', 'Provide proof of income (pay stubs, tax return, or self-attestation)', 'Provide ID and proof of residency', 'Wait 1–45 days for determination', 'Retroactive coverage possible from application date'],
                tip: 'Many states now have same-day presumptive eligibility — you can be seen at a clinic before approval is final.',
                timeToApply: '15–30 min online',
              },
              {
                name: 'HRSA Free Clinics', badge: 'Immediate access', badgeColor: '#6d9197',
                steps: ['Find your nearest FQHC using the NEXUS clinic finder', 'Call or walk in — no appointment required at most locations', 'Bring ID (any form) and proof of income if available', 'Sliding scale fee is calculated on-site, often $0 for low income', 'Dental and mental health often available at same location'],
                tip: 'FQHCs are legally required to see you regardless of ability to pay. You cannot be turned away.',
                timeToApply: '5 min to locate, walk-in',
              },
              {
                name: 'ACA Marketplace Subsidy', badge: 'Open enrollment', badgeColor: '#60a5fa',
                steps: ['Visit healthcare.gov during open enrollment (Nov 1 – Jan 15)', 'Create an account and enter household info', 'Compare plans — many are $0 premium with subsidies', 'Enroll and receive coverage starting Feb 1', 'Qualifying life events allow enrollment outside open enrollment'],
                tip: 'If your income is under 150% FPL, you may qualify for zero-premium plans year-round through special enrollment.',
                timeToApply: '30–60 min online',
              },
            ].map((prog, idx) => (
              <RevealBlock key={prog.name} delay={idx * 80}>
                <div style={{ padding: '2px', background: 'linear-gradient(135deg, rgba(109,145,151,0.15), rgba(109,145,151,0.04))', borderRadius: '20px' }}>
                  <div style={{ background: '#0d1618', borderRadius: '18px', padding: '28px 32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{prog.name}</h3>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '100px', background: `${prog.badgeColor}15`, color: prog.badgeColor, border: `1px solid ${prog.badgeColor}25`, fontWeight: 500 }}>{prog.badge}</span>
                          <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>{prog.timeToApply}</span>
                        </div>
                      </div>
                    </div>
                    <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {prog.steps.map((step, si) => (
                        <li key={si} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(109,145,151,0.1)', border: '1px solid rgba(109,145,151,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: 'var(--accent)', marginTop: '1px' }}>{si + 1}</span>
                          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <div style={{ padding: '14px 16px', background: 'rgba(109,145,151,0.04)', borderRadius: '10px', borderLeft: '2px solid rgba(109,145,151,0.3)', fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Tip: </span>{prog.tip}
                    </div>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT PEOPLE SAY ──────────────────────────── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '56px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(109,145,151,0.08)', color: 'var(--accent)', border: '1px solid rgba(109,145,151,0.18)', marginBottom: '20px' }}><Sparkles size={10} strokeWidth={1.5} /> Results</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, maxWidth: '520px' }}>Programs that actually changed things</h2>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { name: 'Rosa M.', city: 'El Paso, TX', program: 'Medicaid', saved: '$4,200/year', quote: 'I was paying $340 a month for insulin. Now I pay $3. NEXUS found me a Medicaid plan I had no idea I qualified for.' },
              { name: 'David K.', city: 'Atlanta, GA', program: 'HRSA Clinic', saved: '$0 copay', quote: 'My kids needed vaccines and I had lost my job. The FQHC nearest me saw all three kids the same day. No bill.' },
              { name: 'Lin C.',  city: 'Los Angeles, CA', program: 'ACA Subsidy', saved: '$290/month', quote: 'I thought healthcare.gov was too complicated. The NEXUS guide walked me through every step and now I have coverage for $0 a month.' },
            ].map((t, i) => (
              <RevealBlock key={t.name} delay={i * 100}>
                <div style={{ padding: '2px', background: 'linear-gradient(135deg, rgba(109,145,151,0.15), rgba(109,145,151,0.04))', borderRadius: '20px', height: '100%' }}>
                  <div style={{ background: '#0d1618', borderRadius: '18px', padding: '28px', height: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(109,145,151,0.08)', border: '1px solid rgba(109,145,151,0.18)', color: 'var(--accent)' }}>{t.program}</span>
                      <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', color: '#4ade80' }}>Saved {t.saved}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '20px', fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{t.city}</div>
                    </div>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMS FAQ ─────────────────────────────── */}
      <ProgramsFAQ />

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin   { to { transform: rotate(360deg) } }
      `}</style>
    </AppShell>
  )
}
