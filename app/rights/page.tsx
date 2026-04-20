'use client'
export const dynamic = 'force-dynamic'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { smoothScrollTo } from '@/utils/smoothScroll'
import { submitForm } from '@/utils/submitForm'
import { createClientClient } from '@/lib/auth-client'
import { Scale, Shield, AlertCircle, CheckCircle, ChevronDown, Phone, ArrowRight, FileText, Search } from 'lucide-react'

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    if (ref.current) obs.observe(ref.current)
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

const pill: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '4px 12px', borderRadius: '100px',
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
  background: 'rgba(110,231,183,0.08)', color: 'var(--accent)',
  border: '1px solid rgba(110,231,183,0.18)',
}

const RIGHTS = [
  {
    title: 'EMTALA: Emergency Care for Everyone',
    badge: 'Federal Law',
    body: 'The Emergency Medical Treatment and Labor Act (EMTALA) requires any hospital receiving Medicare funding — that\'s almost every hospital in the US — to provide a medical screening exam and stabilizing treatment to any patient who arrives with an emergency medical condition, regardless of their ability to pay, insurance status, citizenship, or immigration status. Hospitals that violate EMTALA face fines up to $50,000 per violation.',
    action: 'If a hospital emergency room turns you away or fails to screen you, you have the right to file a complaint with the Centers for Medicare & Medicaid Services (CMS) at 1-800-MEDICARE.',
  },
  {
    title: 'ACA Protections: Pre-existing Conditions',
    badge: 'Federal Law',
    body: 'The Affordable Care Act prohibits health insurance companies from denying coverage or charging higher premiums because of pre-existing conditions. It also eliminates annual and lifetime coverage limits, requires coverage of preventive services at no cost-sharing, and allows young adults to stay on parents\' plans until age 26.',
    action: 'If an insurer denies a claim citing a pre-existing condition, file an appeal immediately. You have at least 180 days to appeal most insurance decisions.',
  },
  {
    title: 'Medicaid Emergency Coverage',
    badge: 'Federal Program',
    body: 'Even if you are not enrolled in Medicaid, you may qualify for Emergency Medicaid — coverage for the cost of emergency care that can be applied retroactively up to 3 months before the application date. This applies in all 50 states and includes undocumented immigrants for emergency services.',
    action: 'Apply for Medicaid at your state\'s Medicaid agency within 90 days of receiving emergency care. Ask the hospital\'s financial counselor to help you apply.',
  },
  {
    title: 'The No Surprises Act: Surprise Billing Protection',
    badge: 'Federal Law (2022)',
    body: 'The No Surprises Act, effective January 2022, bans surprise billing for emergency care and certain non-emergency care at in-network facilities. If you receive care at an in-network facility, out-of-network providers at that facility cannot bill you more than your in-network cost-sharing amounts. This protects you from receiving unexpected bills from anesthesiologists, radiologists, and other specialists you didn\'t choose.',
    action: 'If you receive an unexpected bill from an out-of-network provider after in-network care, dispute it immediately. Contact your insurer and file a complaint with CMS if necessary.',
  },
  {
    title: 'HIPAA: Your Medical Privacy Rights',
    badge: 'Federal Law',
    body: 'HIPAA gives you the right to access your medical records (usually within 30 days of request), request corrections, know who has accessed your records, and restrict certain uses of your information. Healthcare providers cannot share your records without your written authorization except in specific circumstances.',
    action: 'To request your records, send a written request to your provider. They can charge a reasonable copying fee but cannot deny you access. File a complaint with the HHS Office for Civil Rights if denied.',
  },
]

const LEGAL_AID_BY_STATE: Record<string, { name: string; specialty: string; phone: string }[]> = {
  AZ: [
    { name: 'Community Legal Services (Phoenix)', specialty: 'Medical debt & billing disputes', phone: '602-258-3434' },
    { name: 'Southern Arizona Legal Aid', specialty: 'HIPAA violations, insurance denials', phone: '520-622-4914' },
  ],
  CA: [
    { name: 'Neighborhood Legal Services of LA', specialty: 'Medical debt, insurance appeals', phone: '800-433-6251' },
    { name: 'Bay Area Legal Aid', specialty: 'All healthcare legal issues', phone: '415-982-1300' },
  ],
  TX: [
    { name: 'Lone Star Legal Aid', specialty: 'Medical debt, EMTALA complaints', phone: '713-652-0077' },
    { name: 'Texas Legal Services Center', specialty: 'Insurance disputes, billing', phone: '512-477-6000' },
  ],
  NY: [
    { name: 'Legal Aid Society of NYC', specialty: 'All healthcare legal issues', phone: '212-577-3300' },
    { name: 'Empire Justice Center', specialty: 'Medicaid, ACA appeals', phone: '585-454-4060' },
  ],
  DEFAULT: [
    { name: 'National Health Law Program', specialty: 'Healthcare civil rights', phone: '202-289-7661' },
    { name: 'Patient Advocate Foundation', specialty: 'Insurance appeals & billing', phone: '800-532-5274' },
  ],
}

const TIPS = [
  { title: 'Ask for an itemized bill', desc: 'You have the right to a detailed list of every charge. Billing errors are common — average error rate is 80% in studies.' },
  { title: 'Request a financial assistance application', desc: 'Every non-profit hospital must have a financial assistance policy. Ask for it before you agree to a payment plan.' },
  { title: 'Know your appeal rights', desc: 'Insurance denials can be appealed — twice (internal then external). External appeals succeed over 40% of the time.' },
  { title: 'Get everything in writing', desc: 'Verbal agreements with hospitals or insurers are difficult to enforce. Always confirm payment arrangements in writing.' },
  { title: 'Bring a patient advocate', desc: 'You have the right to bring any person you trust to medical appointments. Advocates catch errors and help communication.' },
  { title: 'Document everything', desc: 'Keep records of every call, every form, every person\'s name and date. This documentation can be decisive in disputes.' },
]

export default function RightsPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const legalRef = useRef<HTMLDivElement>(null)
  const [openRight, setOpenRight] = useState<number | null>(0)
  const [selectedState, setSelectedState] = useState('')
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean | null>>({})
  const [showResults, setShowResults] = useState(false)
  const [form, setForm] = useState({ issue: '', state: '', description: '', email: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [words, setWords] = useState<boolean[]>([])

  const TITLE = 'Know your rights. Use them.'.split(' ')

  // Pre-fill email from logged-in user
  useEffect(() => {
    const supabase = createClientClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        supabase.from('user_profiles').select('email').eq('id', data.session.user.id).single()
          .then(({ data: p }) => { if (p?.email) setForm(f => ({ ...f, email: p.email ?? '' })) })
      }
    })
  }, [])

  useEffect(() => {
    TITLE.forEach((_, i) => {
      setTimeout(() => setWords(w => { const n = [...w]; n[i] = true; return n }), 120 + i * 80)
    })
  }, [])

  const legalAid = LEGAL_AID_BY_STATE[selectedState] || LEGAL_AID_BY_STATE.DEFAULT

  const handleQuizAnswer = (q: number, ans: boolean) => {
    setQuizAnswers(prev => ({ ...prev, [q]: ans }))
    if (Object.keys({ ...quizAnswers, [q]: ans }).length >= 3) setShowResults(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.description) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await submitForm('legal', {
        email: form.email,
        issue: form.issue,
        state: form.state || selectedState,
        description: form.description,
      })
      setSubmitted(true)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const relevantRights: string[] = []
  if (quizAnswers[0] === true) relevantRights.push('EMTALA — you cannot be turned away from an ER', 'File a complaint with CMS at 1-800-MEDICARE')
  if (quizAnswers[1] === true) relevantRights.push('Emergency Medicaid — may cover retroactively up to 90 days', 'Request financial assistance application from the hospital')
  if (quizAnswers[2] === true) relevantRights.push('No Surprises Act — dispute the bill immediately', 'Contact your insurer and file an external appeal if needed')

  return (
    <AppShell>
      {/* ── HERO ── */}
      <section style={{ minHeight: '80dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '100px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(110,231,183,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ ...pill, marginBottom: '24px' }}><Scale size={10} strokeWidth={1.5} /> Rights & Legal Aid</div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '24px', maxWidth: '700px' }}>
          {TITLE.map((w, i) => (
            <span key={i} style={{ display: 'inline-block', marginRight: '0.25em', opacity: words[i] ? 1 : 0, transform: words[i] ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)', color: w === 'rights.' ? 'var(--accent)' : 'inherit' }}>{w}</span>
          ))}
        </h1>

        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', maxWidth: '500px', lineHeight: 1.7, marginBottom: '40px' }}>
          Federal law protects your right to emergency care regardless of insurance or ability to pay. Most people don't know this. Now you do.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
          {[['Federal law', 'protects you'], ['2,800+', 'legal aid partners'], ['Free', 'consultations']].map(([v, l]) => (
            <div key={l} style={{ padding: '10px 20px', background: 'rgba(110,231,183,0.07)', border: '1px solid rgba(110,231,183,0.18)', borderRadius: '100px', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.01em' }}>{v}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => legalRef.current && smoothScrollTo(legalRef.current)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '100px', background: 'var(--accent)', color: '#07070F', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 4px 20px rgba(110,231,183,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}
          >
            <Search size={14} strokeWidth={2} /> Find legal aid
          </button>
          <button
            onClick={() => formRef.current && smoothScrollTo(formRef.current)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '100px', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(110,231,183,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
          >
            Get help now
          </button>
        </div>
      </section>

      {/* ── RIGHTS ACCORDION ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><Shield size={10} strokeWidth={1.5} /> Your rights</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Federal protections that apply to you</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', marginTop: '16px', lineHeight: 1.65 }}>These rights exist regardless of your insurance status, income, or immigration status.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {RIGHTS.map((r, i) => (
              <RevealBlock key={i} delay={i * 60}>
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: openRight === i ? 'rgba(110,231,183,0.3)' : 'rgba(255,255,255,0.07)', background: openRight === i ? 'rgba(110,231,183,0.04)' : 'transparent', transition: 'all 0.25s', marginBottom: '4px' }}>
                  <button
                    onClick={() => setOpenRight(openRight === i ? null : i)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', textAlign: 'left', gap: '16px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '100px', background: 'rgba(110,231,183,0.1)', color: 'var(--accent)', border: '1px solid rgba(110,231,183,0.2)', fontWeight: 600, flexShrink: 0 }}>{r.badge}</span>
                      <span style={{ fontSize: '15px', fontWeight: 600, lineHeight: 1.35 }}>{r.title}</span>
                    </div>
                    <ChevronDown size={16} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.4)', transform: openRight === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                  </button>
                  <div style={{ maxHeight: openRight === i ? '600px' : '0', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                    <div style={{ padding: '0 24px 24px' }}>
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: '16px' }}>{r.body}</p>
                      <div style={{ padding: '14px 16px', background: 'rgba(110,231,183,0.05)', borderRadius: '10px', borderLeft: '2px solid rgba(110,231,183,0.3)', fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>What to do: </span>{r.action}
                      </div>
                    </div>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEGAL AID FINDER ── */}
      <section ref={legalRef} style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><Search size={10} strokeWidth={1.5} /> Legal aid finder</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Find free legal help near you</h2>
            </div>
          </RevealBlock>

          <RevealBlock delay={80}>
            <div style={{ padding: '1.5px', borderRadius: '12px', background: 'rgba(110,231,183,0.12)', marginBottom: '32px', maxWidth: '320px' }}>
              <select value={selectedState} onChange={e => setSelectedState(e.target.value)} style={{ width: '100%', background: '#0d1618', border: 'none', borderRadius: '11px', padding: '13px 16px', color: selectedState ? '#eef4f5' : 'rgba(255,255,255,0.4)', fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                <option value="">Select your state...</option>
                {[['AZ', 'Arizona'], ['CA', 'California'], ['TX', 'Texas'], ['NY', 'New York']].map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {legalAid.map((org, i) => (
              <RevealBlock key={org.name} delay={i * 80}>
                <div style={{ padding: '2px', background: 'linear-gradient(135deg, rgba(110,231,183,0.18), rgba(110,231,183,0.04))', borderRadius: '18px' }}>
                  <div style={{ background: '#0d1618', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.3 }}>{org.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--accent)', margin: 0 }}>{org.specialty}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} strokeWidth={1.5} />{org.phone}</span>
                      <button onClick={() => window.open(`tel:${org.phone.replace(/[-()]/g, '')}`)} style={{ padding: '7px 14px', borderRadius: '100px', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(110,231,183,0.2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(110,231,183,0.1)')}
                      >
                        Get help
                      </button>
                    </div>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── KNOW YOUR RIGHTS QUIZ ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}>Rights in your situation</div>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>Which rights apply to you?</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.42)', marginTop: '12px', lineHeight: 1.65 }}>Answer 3 quick questions to see which protections are relevant to your situation.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'Did a hospital or ER refuse to see you or turn you away?',
              'Did you receive emergency care but cannot afford the bill?',
              'Did you receive a bill from an out-of-network provider after in-network care?',
            ].map((q, i) => (
              <RevealBlock key={i} delay={i * 80}>
                <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '14px', lineHeight: 1.45 }}>{q}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {(['Yes', 'No'] as const).map(ans => (
                      <button key={ans} onClick={() => handleQuizAnswer(i, ans === 'Yes')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid', borderColor: quizAnswers[i] === (ans === 'Yes') ? 'rgba(110,231,183,0.4)' : 'rgba(255,255,255,0.1)', background: quizAnswers[i] === (ans === 'Yes') ? 'rgba(110,231,183,0.12)' : 'rgba(255,255,255,0.03)', color: quizAnswers[i] === (ans === 'Yes') ? 'var(--accent)' : 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                        {ans}
                      </button>
                    ))}
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>

          {showResults && relevantRights.length > 0 && (
            <RevealBlock delay={100}>
              <div style={{ marginTop: '24px', padding: '24px', background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.2)', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--accent)' }}>Rights that apply to your situation:</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {relevantRights.map((r, i) => (
                    <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
                      <CheckCircle size={14} strokeWidth={2} style={{ color: '#4ade80', flexShrink: 0, marginTop: '2px' }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealBlock>
          )}
        </div>
      </section>

      {/* ── TIPS ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}>Before you go</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Know before you go</h2>
            </div>
          </RevealBlock>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {TIPS.map((t, i) => (
              <RevealBlock key={t.title} delay={i * 60}>
                <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', height: '100%', boxSizing: 'border-box', transition: 'border-color 0.25s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(110,231,183,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>{t.title}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>{t.desc}</p>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEGAL HELP FORM ── */}
      <section ref={formRef} style={{ padding: '100px 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ ...pill, marginBottom: '24px' }}><FileText size={10} strokeWidth={1.5} /> Get legal help</div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '16px' }}>We'll connect you with a legal aid partner</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, marginBottom: '36px' }}>Describe your issue and we'll match you with the right legal aid organization within 24 hours.</p>
          </RevealBlock>

          {submitted ? (
            <RevealBlock>
              <div style={{ textAlign: 'center', padding: '48px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '20px' }}>
                <CheckCircle size={40} strokeWidth={1.5} style={{ color: '#4ade80', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Request received</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>We'll connect you with a legal aid partner within 24 hours at <strong style={{ color: '#eef4f5' }}>{form.email}</strong>.</p>
              </div>
            </RevealBlock>
          ) : (
            <RevealBlock delay={80}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <RightsField label="Your email" placeholder="your@email.com" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>Issue type</label>
                  <select value={form.issue} onChange={e => setForm(p => ({ ...p, issue: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '11px 14px', color: form.issue ? '#eef4f5' : 'rgba(255,255,255,0.3)', fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(110,231,183,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110,231,183,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <option value="">Select issue type…</option>
                    {['Billing Dispute', 'Denial of Emergency Care', 'Insurance Claim Denial', 'HIPAA Violation', 'Surprise Bill', 'Medicaid Application', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <RightsField label="State" placeholder="AZ" value={form.state} onChange={v => setForm(p => ({ ...p, state: v }))} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>Describe your situation</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="What happened? When did it occur? Who was involved?" rows={4}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '11px 14px', color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', caretColor: 'var(--accent)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(110,231,183,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110,231,183,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>

                {submitError && (
                  <p style={{ fontSize: '13px', color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '10px 14px', margin: 0 }}>{submitError}</p>
                )}
                <button type="submit" disabled={submitting} style={{ marginTop: '8px', padding: '15px', borderRadius: '12px', background: submitting ? 'rgba(110,231,183,0.5)' : 'var(--accent)', color: '#07070F', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(110,231,183,0.3)', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s' }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(110,231,183,0.45)' } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(110,231,183,0.3)' }}
                >
                  {submitting ? 'Submitting…' : 'Connect me with legal aid →'}
                </button>
              </form>
            </RevealBlock>
          )}
        </div>
      </section>
    </AppShell>
  )
}

function RightsField({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${focused ? 'rgba(110,231,183,0.45)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(110,231,183,0.08)' : 'none',
          borderRadius: '9px', padding: '11px 14px',
          color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit',
          outline: 'none', boxSizing: 'border-box', caretColor: 'var(--accent)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      />
    </div>
  )
}
