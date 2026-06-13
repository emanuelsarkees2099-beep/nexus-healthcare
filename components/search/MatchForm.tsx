'use client'
/**
 * Phase 2.1 — Guided Match Form
 *
 * A bottom-sheet modal that collects 3 preference questions + ZIP,
 * then navigates to /search with match params so the match engine
 * can sort results by relevance.
 *
 * Steps:
 *   1. What care do you need? (multi-select, 6 options)
 *   2. Preferred language? (6 options)
 *   3. Insurance situation? (4 options)
 *   4. Your ZIP code
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CloseCircle, ArrowRight, ArrowLeft, TickCircle,
  Health, Heart, Eye, Profile, Routing, Personalcard,
  Global, SearchNormal1,
} from 'iconsax-react'

interface Props {
  onClose: () => void
  initialZip?: string
}

// ─── Step data ────────────────────────────────────────────────────────────────

const NEEDS_OPTIONS = [
  { id: 'primary',    label: 'Primary care',   icon: <Personalcard size={18} variant="TwoTone" />,  desc: 'Check-ups, sick visits' },
  { id: 'mental',     label: 'Mental health',  icon: <Health size={18} variant="TwoTone" />,        desc: 'Therapy, counseling' },
  { id: 'dental',     label: 'Dental',         icon: <Heart size={18} variant="TwoTone" />,         desc: 'Cleanings, fillings' },
  { id: 'vision',     label: 'Vision',         icon: <Eye size={18} variant="TwoTone" />,           desc: 'Eye exams, glasses' },
  { id: 'womens',     label: "Women's health", icon: <Heart size={18} variant="TwoTone" />,         desc: 'OB/GYN, prenatal' },
  { id: 'pediatrics', label: 'Pediatrics',     icon: <Profile size={18} variant="TwoTone" />,       desc: 'Kids & teens' },
]

const LANGUAGE_OPTIONS = [
  { id: 'english', label: 'English',  flag: '🇺🇸' },
  { id: 'spanish', label: 'Spanish',  flag: '🇪🇸' },
  { id: 'chinese', label: 'Chinese',  flag: '🇨🇳' },
  { id: 'arabic',  label: 'Arabic',   flag: '🇸🇦' },
  { id: 'tagalog', label: 'Tagalog',  flag: '🇵🇭' },
  { id: 'other',   label: 'Other',    flag: '🌐' },
]

const INSURANCE_OPTIONS = [
  { id: 'none',     label: 'Uninsured',         desc: 'I have no coverage',            color: '#F87171' },
  { id: 'medicaid', label: 'Medicaid / CHIP',   desc: 'Government insurance',          color: '#34D399' },
  { id: 'aca',      label: 'Marketplace plan',  desc: 'Healthcare.gov plan',           color: '#60A5FA' },
  { id: 'private',  label: 'Private insurance', desc: 'Through employer or self-pay',  color: '#A78BFA' },
]

const STEP_TITLES = [
  'What care do you need?',
  'What language do you prefer?',
  'Insurance situation?',
  'Enter your ZIP code',
]
const STEP_SUBTEXTS = [
  'Select all that apply. We\'ll rank clinics that offer these services higher.',
  'We\'ll prioritize clinics with staff who speak your language.',
  'Helps us filter to clinics that accept your coverage (or have none required).',
  'We\'ll find the closest matched clinics to you.',
]
const TOTAL_STEPS = 4

export default function MatchForm({ onClose, initialZip = '' }: Props) {
  const router = useRouter()
  const [step,      setStep]      = useState(0)
  const [needs,     setNeeds]     = useState<string[]>([])
  const [language,  setLanguage]  = useState('')
  const [insurance, setInsurance] = useState('')
  const [zip,       setZip]       = useState(initialZip)
  const [zipError,  setZipError]  = useState('')
  const [done,      setDone]      = useState(false)

  const toggleNeed = (id: string) =>
    setNeeds(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id])

  const canAdvance =
    step === 0 ? needs.length > 0 :
    step === 1 ? !!language :
    step === 2 ? !!insurance :
    step === 3 ? /^\d{5}$/.test(zip.trim()) : false

  function advance() {
    if (step < TOTAL_STEPS - 1) { setStep(s => s + 1); return }
    // Final step — validate ZIP and navigate
    const z = zip.trim()
    if (!/^\d{5}$/.test(z)) { setZipError('Please enter a valid 5-digit ZIP code.'); return }
    setZipError('')
    setDone(true)
    // Build URL with match params
    const params = new URLSearchParams({ loc: z })
    if (needs.length > 0) params.set('needs', needs.join(','))
    if (language && language !== 'english') params.set('language', language)
    if (insurance) params.set('insurance', insurance)
    setTimeout(() => {
      router.push(`/search?${params}`)
      onClose()
    }, 700)
  }

  const progressPct = ((step + (done ? 1 : 0)) / TOTAL_STEPS) * 100

  return (
    /* Backdrop */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0',
      }}
      onClick={onClose}
    >
      {/* Sheet */}
      <div
        style={{
          width: '100%', maxWidth: '580px',
          background: '#0a0f1a',
          border: '1px solid rgba(255,255,255,0.10)',
          borderBottom: 'none',
          borderRadius: '24px 24px 0 0',
          padding: '32px 28px 40px',
          animation: 'sheet-in 0.38s cubic-bezier(0.16,1,0.3,1) both',
          maxHeight: '92dvh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes sheet-in {
            from { transform: translateY(100%); opacity: 0.6; }
            to   { transform: translateY(0);    opacity: 1;   }
          }
          .mf-option {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.15s;
            text-align: left;
          }
          .mf-option:hover { background: rgba(74,144,217,0.07); border-color: rgba(74,144,217,0.22); }
          .mf-option.selected { background: rgba(74,144,217,0.10); border-color: rgba(74,144,217,0.35); }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Back button */}
            {step > 0 && !done && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--text-2)' }}
              >
                <ArrowLeft size={14} color="rgba(255,255,255,0.5)" />
              </button>
            )}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--accent)', fontFamily: 'var(--font-inter)', marginBottom: '3px' }}>
                STEP {step + 1} OF {TOTAL_STEPS}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                {done ? 'Finding your matches…' : STEP_TITLES[step]}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
          >
            <CloseCircle size={16} color="rgba(255,255,255,0.45)" />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            background: 'var(--accent)',
            width: `${progressPct}%`,
            transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)',
          }} />
        </div>

        {done ? (
          /* Completion animation */
          <div style={{ textAlign: 'center', padding: '32px 0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <TickCircle size={52} color="var(--accent)" variant="TwoTone" />
            </div>
            <p style={{ fontSize: '15px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', lineHeight: 1.6 }}>
              Ranking clinics by your preferences…
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '20px', fontFamily: 'var(--font-inter)', lineHeight: 1.65 }}>
              {STEP_SUBTEXTS[step]}
            </p>

            {/* Step 0 — Needs (multi-select grid) */}
            {step === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
                {NEEDS_OPTIONS.map(o => {
                  const sel = needs.includes(o.id)
                  return (
                    <button
                      key={o.id}
                      onClick={() => toggleNeed(o.id)}
                      className={`mf-option${sel ? ' selected' : ''}`}
                      style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                    >
                      <span style={{ color: sel ? 'var(--accent)' : 'rgba(255,255,255,0.4)', flexShrink: 0, marginTop: '1px' }}>
                        {o.icon}
                      </span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: sel ? 'var(--text)' : 'var(--text-2)', fontFamily: 'var(--font-inter)', marginBottom: '2px' }}>
                          {o.label}
                          {sel && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--accent)' }}>✓</span>}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
                          {o.desc}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 1 — Language */}
            {step === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
                {LANGUAGE_OPTIONS.map(o => {
                  const sel = language === o.id
                  return (
                    <button
                      key={o.id}
                      onClick={() => setLanguage(o.id)}
                      className={`mf-option${sel ? ' selected' : ''}`}
                      style={{ padding: '14px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                    >
                      <span style={{ fontSize: '22px', lineHeight: 1 }}>{o.flag}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: sel ? 'var(--text)' : 'var(--text-2)', fontFamily: 'var(--font-inter)' }}>
                        {o.label}
                      </span>
                      {sel && <span style={{ fontSize: '10px', color: 'var(--accent)' }}>✓ Selected</span>}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 2 — Insurance */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {INSURANCE_OPTIONS.map(o => {
                  const sel = insurance === o.id
                  return (
                    <button
                      key={o.id}
                      onClick={() => setInsurance(o.id)}
                      className={`mf-option${sel ? ' selected' : ''}`}
                      style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: sel ? 'var(--text)' : 'var(--text-2)', fontFamily: 'var(--font-inter)' }}>
                          {o.label}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', marginTop: '2px' }}>
                          {o.desc}
                        </div>
                      </div>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${sel ? o.color : 'rgba(255,255,255,0.15)'}`,
                        background: sel ? o.color : 'transparent',
                        transition: 'all 0.18s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {sel && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#07070F' }} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 3 — ZIP input */}
            {step === 3 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${zipError ? 'var(--error,#F87171)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '14px', padding: '14px 18px',
                  transition: 'border-color 0.2s',
                }}>
                  <Routing size={16} color="var(--accent)" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{5}"
                    maxLength={5}
                    value={zip}
                    onChange={e => { setZip(e.target.value.replace(/\D/g, '')); setZipError('') }}
                    onKeyDown={e => { if (e.key === 'Enter' && canAdvance) advance() }}
                    placeholder="Enter ZIP code (e.g. 10001)"
                    autoFocus
                    style={{
                      flex: 1, background: 'none', border: 'none', outline: 'none',
                      color: 'var(--text)', fontSize: '20px', fontWeight: 600,
                      fontFamily: 'var(--font-mono),monospace', letterSpacing: '0.06em',
                      caretColor: 'var(--accent)',
                    }}
                  />
                  {zip.length === 5 && (
                    <TickCircle size={18} color="var(--success,#34D399)" variant="TwoTone" />
                  )}
                </div>
                {zipError && (
                  <p style={{ fontSize: '12px', color: 'var(--error,#F87171)', marginTop: '8px', fontFamily: 'var(--font-inter)' }}>
                    {zipError}
                  </p>
                )}

                {/* Summary of selections */}
                <div style={{ marginTop: '20px', padding: '14px 16px', background: 'rgba(74,144,217,0.05)', border: '1px solid rgba(74,144,217,0.14)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', color: 'var(--accent)', fontFamily: 'var(--font-inter)', marginBottom: '10px' }}>
                    YOUR MATCH PREFERENCES
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {needs.map(n => (
                      <span key={n} style={{ fontSize: '11px', fontFamily: 'var(--font-inter)', fontWeight: 500, padding: '3px 9px', borderRadius: '100px', background: 'rgba(74,144,217,0.10)', border: '1px solid rgba(74,144,217,0.25)', color: 'var(--accent)' }}>
                        {NEEDS_OPTIONS.find(o => o.id === n)?.label}
                      </span>
                    ))}
                    {language && (
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-inter)', fontWeight: 500, padding: '3px 9px', borderRadius: '100px', background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.25)', color: '#A78BFA' }}>
                        {LANGUAGE_OPTIONS.find(o => o.id === language)?.label}
                      </span>
                    )}
                    {insurance && (
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-inter)', fontWeight: 500, padding: '3px 9px', borderRadius: '100px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)', color: '#34D399' }}>
                        {INSURANCE_OPTIONS.find(o => o.id === insurance)?.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={advance}
              disabled={!canAdvance}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                background: canAdvance ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                border: 'none',
                color: canAdvance ? '#07070F' : 'rgba(255,255,255,0.25)',
                fontSize: '14px', fontWeight: 700, cursor: canAdvance ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-inter)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.18s',
              }}
            >
              {step < TOTAL_STEPS - 1 ? (
                <>Continue <ArrowRight size={14} /></>
              ) : (
                <><SearchNormal1 size={14} /> Find my matches</>
              )}
            </button>

            {/* Skip step */}
            {step < 3 && (
              <button
                onClick={() => setStep(s => s + 1)}
                style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '12px', fontFamily: 'var(--font-inter)', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >
                Skip this question →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
