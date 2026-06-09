'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Location, ReceiptText, Profile2User, Danger, CloseCircle, Heart, ArrowRight, ArrowLeft2, TickCircle, DollarCircle, Hospital, MedalStar } from 'iconsax-react'

const STORAGE_KEY = 'nexus_onboarded_v3'

type Step = 1 | 2 | 3 | 4 | 5

interface WizardData {
  intent: string
  zip: string
  insured: 'none' | 'partial' | 'full' | ''
  householdSize: string
  income: string
}

const INTENTS = [
  { id: 'clinic',     label: 'Find a free clinic',         icon: <Location size={16} variant="Linear" />,      href: '/search',        color: 'var(--accent)' },
  { id: 'programs',   label: 'Check my eligibility',       icon: <ReceiptText size={16} variant="Linear" />,   href: '/eligibility',   color: '#fbbf24' },
  { id: 'crisis',     label: 'Mental health crisis help',  icon: <Heart size={16} variant="Linear" />,         href: '/crisis',        color: '#f87171' },
  { id: 'chw',        label: 'Talk to a health worker',    icon: <Profile2User size={16} variant="Linear" />,  href: '/chw',           color: '#a78bfa' },
  { id: 'urgent',     label: 'I need help right now',      icon: <Danger size={16} variant="Linear" />,        href: '/crisis',        color: '#fb923c' },
  { id: 'meds',       label: 'Free medication help',       icon: <Hospital size={16} variant="Linear" />,      href: '/medications',   color: '#34d399' },
]

export default function OnboardingOverlay() {
  const [visible,   setVisible]   = useState(false)
  const [step,      setStep]      = useState<Step>(1)
  const [animOut,   setAnimOut]   = useState(false)
  const [data,      setData]      = useState<WizardData>({ intent: '', zip: '', insured: '', householdSize: '', income: '' })
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY)) return
    const t = setTimeout(() => setVisible(true), 15000)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setAnimOut(true)
    setTimeout(() => setVisible(false), 300)
  }

  const nextStep = () => setStep(s => (s < 5 ? (s + 1) as Step : s))
  const prevStep = () => setStep(s => (s > 1 ? (s - 1) as Step : s))

  const finish = (overrideHref?: string) => {
    localStorage.setItem(STORAGE_KEY, '1')
    const intent = INTENTS.find(i => i.id === data.intent)
    const href = overrideHref ?? intent?.href ?? '/search'
    // Append zip/context to search if available
    const finalHref = data.zip && href.includes('/search')
      ? `/search?loc=${encodeURIComponent(data.zip)}`
      : href
    setAnimOut(true)
    setTimeout(() => {
      setVisible(false)
      router.push(finalHref)
    }, 200)
  }

  // Compute quick eligibility hint
  const getEligibilityHints = () => {
    const hints: string[] = []
    const inc = parseFloat(data.income.replace(/[^0-9.]/g, ''))
    const hh  = parseInt(data.householdSize) || 1
    const fpl2024: Record<number, number> = { 1:15060, 2:20440, 3:25820, 4:31200, 5:36580, 6:41960 }
    const fpl = fpl2024[Math.min(hh, 6)] ?? 41960
    if (data.insured === 'none') {
      hints.push('FQHC free & sliding-scale care — available immediately')
      if (!isNaN(inc) && inc <= fpl * 1.38) hints.push('Medicaid — you may qualify (income check needed)')
      if (hh > 1 && !isNaN(inc) && inc <= fpl * 2.0) hints.push('CHIP — may cover children in your household')
    }
    hints.push('HRSA Health Centers — federally funded, open to all')
    return hints.slice(0, 3)
  }

  if (!visible) return null

  const progressPct = ((step - 1) / 4) * 100

  return (
    <div
      className="onboarding-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="NEXUS onboarding wizard"
      aria-live="polite"
      style={{ animation: animOut ? 'ob-fade-out 0.28s ease forwards' : undefined }}
    >
      <div className="onboarding-panel" style={{ maxWidth: 460 }}>
        <style>{`
          @keyframes ob-fade-out { to { opacity:0; transform:scale(0.96); } }
          @keyframes ob-step-in  { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {step > 1 && (
              <button
                onClick={prevStep}
                aria-label="Go back"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, display: 'flex', borderRadius: 6 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >
                <ArrowLeft2 size={16} variant="Linear" />
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Heart size={11} color="var(--accent)" variant="Linear" />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', fontFamily: 'var(--font-inter)' }}>
                {step} of 5
              </span>
            </div>
          </div>
          <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, display: 'flex', borderRadius: 6 }} aria-label="Close">
            <CloseCircle size={16} variant="Linear" />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: 'var(--accent)', width: `${progressPct}%`, transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)' }} />
        </div>

        {/* Step content */}
        <div style={{ animation: 'ob-step-in 0.28s cubic-bezier(0.16,1,0.3,1) both' }} key={step}>

          {/* STEP 1 — Intent */}
          {step === 1 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem,4vw,1.5rem)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 6 }}>
                What do you need right now?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-inter)', fontWeight: 300, marginBottom: 18, lineHeight: 1.5 }}>
                No account needed. No insurance required.
              </p>
              <nav aria-label="Intent options">
                {INTENTS.map(intent => (
                  <button
                    key={intent.id}
                    className={`onboarding-option ${data.intent === intent.id ? 'ob-mint' : ''}`}
                    onClick={() => { setData(d => ({ ...d, intent: intent.id })); nextStep() }}
                    style={{ width: '100%', textAlign: 'left', fontFamily: 'var(--font-inter)', marginBottom: 6 }}
                  >
                    <div className="ob-icon" style={{ color: intent.color }}>{intent.icon}</div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{intent.label}</div>
                    <ArrowRight size={13} color="var(--text-3)" variant="Linear" style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </nav>
            </>
          )}

          {/* STEP 2 — Location */}
          {step === 2 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem,4vw,1.5rem)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 6 }}>
                Where are you located?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-inter)', fontWeight: 300, marginBottom: 18, lineHeight: 1.5 }}>
                We&apos;ll find free clinics and programs near you. Your location is never stored.
              </p>
              <label htmlFor="ob-zip" style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-inter)', display: 'block', marginBottom: 8, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                ZIP code or city
              </label>
              <input
                id="ob-zip"
                type="text"
                value={data.zip}
                onChange={e => setData(d => ({ ...d, zip: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && nextStep()}
                placeholder="e.g. 85004 or Phoenix, AZ"
                autoFocus
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', fontFamily: 'var(--font-inter)', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 20 }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,144,217,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={nextStep}
                  disabled={!data.zip.trim()}
                  style={{ flex: 1, padding: '12px', borderRadius: 11, background: data.zip.trim() ? 'var(--accent)' : 'rgba(255,255,255,0.04)', border: 'none', color: data.zip.trim() ? '#07070F' : 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 600, cursor: data.zip.trim() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-inter)', transition: 'all 0.2s' }}
                >
                  Continue →
                </button>
                <button
                  onClick={nextStep}
                  style={{ padding: '12px 16px', borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
                >
                  Skip
                </button>
              </div>
            </>
          )}

          {/* STEP 3 — Insurance status */}
          {step === 3 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem,4vw,1.5rem)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 6 }}>
                What&apos;s your insurance situation?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-inter)', fontWeight: 300, marginBottom: 18, lineHeight: 1.5 }}>
                This helps us find the most relevant programs. You can always skip.
              </p>
              {[
                { id: 'none',    label: 'No insurance',                  sub: 'Uninsured — looking for free/low-cost options' },
                { id: 'partial', label: 'Some coverage',                 sub: 'High deductible, limited, or expired insurance' },
                { id: 'full',    label: 'I have insurance',              sub: 'Looking for supplemental help or programs' },
              ].map(opt => (
                <button
                  key={opt.id}
                  className={`onboarding-option ${data.insured === opt.id ? 'ob-mint' : ''}`}
                  onClick={() => { setData(d => ({ ...d, insured: opt.id as WizardData['insured'] })); nextStep() }}
                  style={{ width: '100%', textAlign: 'left', fontFamily: 'var(--font-inter)', marginBottom: 8 }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{opt.sub}</div>
                  </div>
                  {data.insured === opt.id && <TickCircle size={14} color="var(--accent)" variant="Linear" style={{ flexShrink: 0 }} />}
                </button>
              ))}
              <button onClick={nextStep} style={{ width: '100%', padding: '10px', marginTop: 4, borderRadius: 10, background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
                Skip this question
              </button>
            </>
          )}

          {/* STEP 4 — Quick eligibility */}
          {step === 4 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem,4vw,1.5rem)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 6 }}>
                Based on what you shared…
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-inter)', fontWeight: 300, marginBottom: 18, lineHeight: 1.5 }}>
                You may be eligible for these free programs:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {getEligibilityHints().map((hint, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', borderRadius: 12, background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.15)' }}>
                    <TickCircle size={14} color="var(--accent)" variant="Linear" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-inter)', lineHeight: 1.4 }}>{hint}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <DollarCircle size={14} color="#fbbf24" variant="Linear" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,200,60,0.8)', fontFamily: 'var(--font-inter)', lineHeight: 1.5 }}>
                    For a precise eligibility check, enter your income and household size on the next screen.
                  </span>
                </div>
              </div>
              <button
                onClick={nextStep}
                style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'var(--accent)', border: 'none', color: '#07070F', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                See my personalized plan <ArrowRight size={14} variant="Linear" />
              </button>
            </>
          )}

          {/* STEP 5 — Personalized plan */}
          {step === 5 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem,4vw,1.5rem)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                Your personalized next steps
                <MedalStar size={18} color="var(--accent)" variant="TwoTone" aria-hidden="true" />
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-inter)', fontWeight: 300, marginBottom: 18, lineHeight: 1.5 }}>
                Here&apos;s where to start based on your situation:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { label: 'Find free clinics' + (data.zip ? ` near ${data.zip}` : ' near you'), href: data.zip ? `/search?loc=${encodeURIComponent(data.zip)}` : '/search', primary: true },
                  data.insured !== 'full' ? { label: 'Check full eligibility (takes 2 min)', href: '/eligibility', primary: false } : null,
                  { label: 'Meet a Community Health Worker', href: '/chw', primary: false },
                ].filter(Boolean).map((action, i) => action && (
                  <button
                    key={i}
                    onClick={() => finish(action.href)}
                    className={action.primary ? '' : 'onboarding-option'}
                    style={{
                      width: '100%', padding: '13px 18px', borderRadius: 12,
                      background: action.primary ? 'var(--accent)' : 'transparent',
                      border: action.primary ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      color: action.primary ? '#07070F' : 'var(--text-2)',
                      fontSize: 13, fontWeight: action.primary ? 700 : 500,
                      cursor: 'pointer', fontFamily: 'var(--font-inter)',
                      textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.15s',
                    }}
                  >
                    {action.label}
                    <ArrowRight size={14} variant="Linear" style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
              <button onClick={dismiss} style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
                I&apos;ll explore on my own
              </button>
            </>
          )}

        </div>

        {/* Bottom disclaimer */}
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-inter)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
          Won&apos;t show again on this device · Data never leaves your browser
        </p>
      </div>
    </div>
  )
}
