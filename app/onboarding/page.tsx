'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight2, Heart, Shield, Profile2User, ArrowRight,
  TickCircle, Hospital, Health, Activity, Eye, Danger,
  Buildings2, DollarCircle, Global, Clock, DocumentText,
  InfoCircle, Car, MagicStar, Location,
} from 'iconsax-react'
import { createClientClient } from '@/lib/auth-client'
import {
  computeEligibility,
  CONFIDENCE_COLORS,
  CONFIDENCE_LABELS,
  type IncomeBracket,
} from '@/lib/eligibility'

// ─── Types ──────────────────────────────────────────────────────────────────

type OptionItem = {
  value: string
  label: string
  sub?: string
  icon: React.ReactNode
  insight?: string
}

type Question =
  | {
      type: 'options'
      id: string
      question: string
      subtext: string
      unlock: string
      options: OptionItem[]
      multi?: boolean
    }
  | {
      type: 'text'
      id: string
      question: string
      subtext: string
      unlock: string
      placeholder: string
      inputMode: 'text' | 'numeric'
      maxLength: number
      validate: (v: string) => string | null
    }

// ─── Questions ───────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    type: 'options',
    id: 'situation',
    question: 'What best describes your situation?',
    subtext: 'This helps us find the right programs and clinics for you.',
    unlock: 'Personalized resources',
    options: [
      {
        value: 'uninsured',
        label: 'I have no health insurance',
        sub: '30.4 million Americans are in the same situation',
        icon: <Danger size={18} color="currentColor" variant="TwoTone" />,
        insight: 'FQHCs are required by federal law to see you regardless of insurance.',
      },
      {
        value: 'underinsured',
        label: 'My insurance doesn\'t cover enough',
        sub: '44% of insured adults face the same gap',
        icon: <DocumentText size={18} color="currentColor" variant="TwoTone" />,
        insight: 'Sliding-scale clinics fill coverage gaps — often at $0 for missed services.',
      },
      {
        value: 'transition',
        label: 'I lost my coverage recently',
        sub: 'Special enrollment may be available',
        icon: <Clock size={18} color="currentColor" variant="TwoTone" />,
        insight: 'You have a 60-day special enrollment window. We\'ll check ACA and Medicaid now.',
      },
      {
        value: 'helper',
        label: 'I\'m helping someone else find care',
        sub: 'Caregiver or family member',
        icon: <Heart size={18} color="currentColor" variant="TwoTone" />,
        insight: 'NEXUS works great for caregivers. We\'ll tailor suggestions for the person you\'re helping.',
      },
    ],
  },
  {
    type: 'options',
    id: 'needs',
    question: 'What kind of care are you looking for?',
    subtext: 'Select all that apply — we\'ll match providers for each.',
    unlock: 'Specialist matching',
    multi: true,
    options: [
      { value: 'primary',       label: 'Primary / preventive care',   icon: <Hospital size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'dental',        label: 'Dental care',                 icon: <Health size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'mental',        label: 'Mental health / therapy',     icon: <Activity size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'vision',        label: 'Vision care',                 icon: <Eye size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'prescriptions', label: 'Prescription medications',    icon: <DocumentText size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'specialist',    label: 'Specialist care',             icon: <MagicStar size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'pregnancy',     label: 'Pregnancy / maternal care',   icon: <Heart size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'emergency',     label: 'Emergency / urgent care',     icon: <Danger size={18} color="currentColor" variant="TwoTone" /> },
    ],
  },
  {
    type: 'text',
    id: 'zip',
    question: 'What\'s your ZIP code?',
    subtext: 'Used only to find clinics near you. Never shared or sold.',
    unlock: 'Clinic matching',
    placeholder: '90210',
    inputMode: 'numeric',
    maxLength: 5,
    validate: (v) => {
      if (v.length === 0) return null // allow empty (skippable)
      if (!/^\d{5}$/.test(v)) return 'Please enter a valid 5-digit ZIP code'
      return null
    },
  },
  {
    type: 'options',
    id: 'income_bracket',
    question: 'What\'s your household income?',
    subtext: 'Helps us find programs you qualify for. No exact number needed.',
    unlock: 'Program eligibility',
    options: [
      {
        value: 'under_20k',
        label: 'Under $20,000/year',
        sub: 'Likely eligible for Medicaid',
        icon: <DollarCircle size={18} color="currentColor" variant="TwoTone" />,
        insight: 'At this income level you likely qualify for Medicaid, CHIP, and full HRSA sliding scale.',
      },
      {
        value: '20k_40k',
        label: '$20,000 – $40,000/year',
        sub: 'May qualify for ACA subsidies',
        icon: <DollarCircle size={18} color="currentColor" variant="TwoTone" />,
        insight: 'ACA Marketplace subsidies can cut premiums significantly at this income level.',
      },
      {
        value: '40k_60k',
        label: '$40,000 – $60,000/year',
        sub: 'ACA subsidies available',
        icon: <DollarCircle size={18} color="currentColor" variant="TwoTone" />,
        insight: 'Marketplace subsidies are available. HRSA health centers serve all incomes.',
      },
      {
        value: '60k_plus',
        label: '$60,000 or more/year',
        sub: 'HRSA clinics open to everyone',
        icon: <DollarCircle size={18} color="currentColor" variant="TwoTone" />,
        insight: 'HRSA health centers are open to all incomes on a sliding scale. No one is turned away.',
      },
      {
        value: 'prefer_not_to_say',
        label: 'Prefer not to say',
        sub: 'We\'ll still show clinics and programs',
        icon: <Shield size={18} color="currentColor" variant="TwoTone" />,
      },
    ],
  },
  {
    type: 'options',
    id: 'household_size',
    question: 'How many people are in your household?',
    subtext: 'Includes yourself, your partner, and any dependents.',
    unlock: 'Coverage calculator',
    options: [
      {
        value: '1',
        label: 'Just me',
        sub: '1 person',
        icon: <Profile2User size={18} color="currentColor" variant="TwoTone" />,
      },
      {
        value: '2',
        label: '2 people',
        sub: 'You + 1 other',
        icon: <Profile2User size={18} color="currentColor" variant="TwoTone" />,
      },
      {
        value: '3',
        label: '3 people',
        sub: 'Family of 3',
        icon: <Profile2User size={18} color="currentColor" variant="TwoTone" />,
      },
      {
        value: '4_plus',
        label: '4 or more',
        sub: 'Larger household',
        icon: <Profile2User size={18} color="currentColor" variant="TwoTone" />,
        insight: 'Larger households qualify for higher income limits on Medicaid and CHIP.',
      },
    ],
  },
  {
    type: 'options',
    id: 'barriers',
    question: 'What has stopped you from getting care?',
    subtext: 'We\'ll proactively address your specific challenges. No judgment.',
    unlock: 'Barrier solutions',
    multi: true,
    options: [
      { value: 'cost',          label: 'Cost / can\'t afford it',        icon: <DollarCircle size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'transport',     label: 'Transportation',                 icon: <Car size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'language',      label: 'Language barrier',               icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'time',          label: 'Work schedule / time',           icon: <Clock size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'fear',          label: 'Fear or past bad experience',    icon: <Heart size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'documentation', label: 'Concerns about documentation',   icon: <DocumentText size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'knowledge',     label: 'Didn\'t know options existed',   icon: <InfoCircle size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'none',          label: 'None — just exploring',          icon: <MagicStar size={18} color="currentColor" variant="TwoTone" /> },
    ],
  },
  {
    type: 'options',
    id: 'language',
    question: 'What language do you prefer?',
    subtext: 'We\'ll filter for providers who speak your language.',
    unlock: 'Bilingual providers',
    options: [
      { value: 'english', label: 'English',            icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'spanish', label: 'Spanish / Español',  icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'chinese', label: 'Chinese / 中文',      icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'arabic',  label: 'Arabic / عربي',      icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'tagalog', label: 'Tagalog / Filipino', icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'other',   label: 'Other language',     icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
    ],
  },
]

const TOTAL = QUESTIONS.length

// ─── Small components ────────────────────────────────────────────────────────

function ProgressRing({ step, total, unlocked }: { step: number; total: number; unlocked: number }) {
  const r    = 18
  const circ = 2 * Math.PI * r
  const off  = circ - (step / total) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width="44" height="44" viewBox="0 0 44 44" aria-label={`Step ${step} of ${total}`}>
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
        <circle
          cx="22" cy="22" r={r} fill="none"
          stroke="var(--accent)" strokeWidth="2"
          strokeDasharray={circ} strokeDashoffset={off}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          style={{ transition: 'stroke-dashoffset 0.55s cubic-bezier(0.16,1,0.3,1)' }}
        />
        <text x="22" y="26" textAnchor="middle" fontSize="11" fontWeight="700" fill="rgba(248,249,255,0.85)" fontFamily="var(--font-inter)">
          {step}/{total}
        </text>
      </svg>
      {unlocked > 0 && (
        <span style={{
          fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(52,211,153,0.75)',
          whiteSpace: 'nowrap',
        }}>
          {unlocked} ready
        </span>
      )}
    </div>
  )
}

function UnlockPill({ label, visible }: { label: string; visible: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100,
      background: visible ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${visible ? 'rgba(52,211,153,0.22)' : 'rgba(255,255,255,0.07)'}`,
      fontSize: 11, fontWeight: 500,
      color: visible ? 'rgba(52,211,153,0.8)' : 'rgba(255,255,255,0.2)',
      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      whiteSpace: 'nowrap',
    }}>
      {visible && (
        <svg width="7" height="7" viewBox="0 0 7 7" fill="none" aria-hidden="true">
          <circle cx="3.5" cy="3.5" r="3.5" fill="rgba(52,211,153,0.6)" />
        </svg>
      )}
      {label}
    </div>
  )
}

// ─── Profile form ─────────────────────────────────────────────────────────────

function ProfileForm({
  onDone,
  userId,
}: {
  onDone: () => void
  userId: string | null
}) {
  const [fullName, setFullName] = useState('')
  const [phone,    setPhone]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) { setError('Please enter your name.'); return }
    if (!userId) { onDone(); return }
    setLoading(true); setError('')
    try {
      const supabase = createClientClient()
      const { error: dbErr } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName.trim(), phone: phone.trim() || null })
        .eq('id', userId)
      if (dbErr) throw dbErr
      onDone()
    } catch {
      setError('Couldn\'t save — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(79,142,240,0.10)', border: '1px solid rgba(79,142,240,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <Profile2User size={24} color="var(--accent)" variant="TwoTone" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 6, color: 'var(--text)' }}>
          Set up your profile
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>
          Takes 10 seconds — helps providers identify you
        </p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: 28,
      }}>
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 8, padding: '10px 12px', marginBottom: 16,
            color: '#f87171', fontSize: 13,
          }}>
            <InfoCircle size={14} color="#f87171" variant="TwoTone" />
            {error}
          </div>
        )}
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-3)', marginBottom: 6 }}>
              Full name <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              ref={inputRef}
              type="text" value={fullName}
              onChange={e => { setFullName(e.target.value); setError('') }}
              placeholder="Maria Garcia"
              autoComplete="name"
              className="ob-input"
              style={{
                width: '100%', padding: '11px 14px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 9, color: 'var(--text)', fontSize: 14,
                fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                caretColor: 'var(--accent)',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-3)', marginBottom: 6 }}>
              Phone <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-4)' }}>(optional)</span>
            </label>
            <input
              type="tel" value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(555) 000-0000"
              autoComplete="tel"
              className="ob-input"
              style={{
                width: '100%', padding: '11px 14px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 9, color: 'var(--text)', fontSize: 14,
                fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                caretColor: 'var(--accent)',
              }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              padding: '12px 16px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 9, fontWeight: 600, fontSize: 14,
              fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: 4,
              transition: 'opacity 0.15s, transform 0.15s',
            }}
          >
            {loading ? 'Saving…' : 'Continue →'}
          </button>
        </form>
      </div>
      <p style={{ textAlign: 'center', marginTop: 16 }}>
        <button
          onClick={onDone}
          style={{
            background: 'none', border: 'none', color: 'var(--text-4)', fontSize: 12,
            cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline',
          }}
        >
          Skip for now
        </button>
      </p>
    </div>
  )
}

// ─── Completion screen ────────────────────────────────────────────────────────

function CompletionScreen({
  answers,
}: {
  answers: Record<string, string | string[]>
}) {
  const careNeeds  = (answers['needs']          as string[] | undefined) ?? []
  const barriers   = (answers['barriers']       as string[] | undefined) ?? []
  const bracket    = answers['income_bracket']  as IncomeBracket | null ?? null
  const hhRaw      = answers['household_size']  as string | undefined
  const hhSize     = hhRaw === '4_plus' ? 4 : parseInt(hhRaw ?? '1') || 1
  const situation  = (answers['situation']      as string | undefined) ?? null

  const programs = computeEligibility({
    incomeBracket: bracket,
    householdSize: hhSize,
    careNeeds,
    situation,
  })

  const topPrograms = programs.slice(0, 3)

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '80px 24px', background: 'var(--bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(52,211,153,0.06) 0%, rgba(74,144,217,0.04) 40%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes ob-pop {
          from { opacity:0; transform: scale(0.88) translateY(12px); }
          to   { opacity:1; transform: scale(1)    translateY(0);    }
        }
        .ob-done-card { animation: ob-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      {/* Icon */}
      <div className="ob-done-card" style={{ marginBottom: 24, animationDelay: '0ms' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
        }}>
          <TickCircle size={28} color="rgba(52,211,153,0.9)" variant="TwoTone" />
        </div>
      </div>

      <h1 className="ob-done-card" style={{
        fontSize: 'clamp(26px,5vw,42px)', fontWeight: 800, letterSpacing: '-0.03em',
        lineHeight: 1.1, marginBottom: 12, maxWidth: 480,
        animationDelay: '60ms',
      }}>
        Your care plan is ready.
      </h1>

      <p className="ob-done-card" style={{
        fontSize: 15, color: 'var(--text-3)', maxWidth: 420,
        lineHeight: 1.7, marginBottom: 40, animationDelay: '120ms',
      }}>
        Based on your answers, we found{' '}
        <strong style={{ color: 'var(--text)' }}>{programs.length} program{programs.length !== 1 ? 's' : ''}</strong>
        {' '}you may qualify for.
        {barriers.includes('cost')      && ' We\'ve prioritized zero-cost options.'}
        {barriers.includes('language')  && ' We\'ve flagged bilingual providers.'}
        {barriers.includes('transport') && ' Telehealth options are included.'}
      </p>

      {/* Top program cards */}
      {topPrograms.length > 0 && (
        <div className="ob-done-card" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(topPrograms.length, 3)}, 1fr)`,
          gap: 10, maxWidth: 580, width: '100%', marginBottom: 40,
          animationDelay: '180ms',
        }}>
          {topPrograms.map(p => (
            <div key={p.id} style={{
              padding: '16px 18px', borderRadius: 14, textAlign: 'left',
              background: `${p.accentColor}0A`,
              border: `1px solid ${p.accentColor}22`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: CONFIDENCE_COLORS[p.confidence], flexShrink: 0,
                }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: CONFIDENCE_COLORS[p.confidence], letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {CONFIDENCE_LABELS[p.confidence]}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3, letterSpacing: '-0.01em' }}>
                {p.name}
              </div>
              <div style={{ fontSize: 12, color: p.accentColor, fontWeight: 600 }}>
                {p.valueLabel}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ob-done-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, animationDelay: '240ms' }}>
        <Link href="/dashboard" style={{
          padding: '14px 36px', borderRadius: 100,
          background: 'var(--accent)', color: '#fff',
          fontSize: 15, fontWeight: 700, textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 8,
          transition: 'opacity 0.15s, transform 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
        >
          Go to my dashboard <ArrowRight size={16} />
        </Link>
        <Link href="/search" style={{
          fontSize: 13, color: 'var(--text-3)', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Location size={12} color="currentColor" />
          Find a clinic near me
        </Link>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  /* ── Auth + profile check ─────────────────────────────────────── */
  const [userId,         setUserId]         = useState<string | null>(null)
  const [profileChecked, setProfileChecked] = useState(false)
  const [profileDone,    setProfileDone]    = useState(false)

  useEffect(() => {
    const supabase = createClientClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setProfileDone(true); setProfileChecked(true); return }
      setUserId(user.id)
      supabase.from('user_profiles').select('full_name').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.full_name) setProfileDone(true)
          setProfileChecked(true)
        })
    })
  }, [])

  /* ── Questionnaire state ──────────────────────────────────────── */
  const [step,          setStep]          = useState(0)
  const [answers,       setAnswers]       = useState<Record<string, string | string[]>>({})
  const [textValue,     setTextValue]     = useState('')
  const [textError,     setTextError]     = useState('')
  const [transitioning, setTransitioning] = useState(false)
  const [done,          setDone]          = useState(false)
  const [activeInsight, setActiveInsight] = useState<string | null>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  const q = QUESTIONS[step]

  // Count how many unlocks have been earned (answered questions)
  const unlockedCount = QUESTIONS.slice(0, step).filter(
    (q) => {
      const a = answers[q.id]
      if (!a) return false
      if (Array.isArray(a)) return a.length > 0
      return a.length > 0
    }
  ).length

  const isSelected = (qId: string, val: string) => {
    const v = answers[qId]
    if (Array.isArray(v)) return v.includes(val)
    return v === val
  }

  const advance = () => {
    setActiveInsight(null)
    if (step < TOTAL - 1) {
      setTransitioning(true)
      setTextValue('')
      setTextError('')
      setTimeout(() => { setStep(s => s + 1); setTransitioning(false) }, 280)
    } else {
      finishOnboarding()
    }
  }

  const finishOnboarding = async () => {
    // Always persist to localStorage
    try {
      localStorage.setItem('nexus_onboarding', JSON.stringify({
        answers,
        completedAt: new Date().toISOString(),
        version: 2,
      }))
    } catch { /* Safari private mode */ }

    // Persist to Supabase (requires migration 002)
    if (userId) {
      try {
        const supabase = createClientClient()
        const hhRaw   = answers['household_size'] as string | undefined
        const hhSize  = hhRaw === '4_plus' ? 4 : parseInt(hhRaw ?? '1') || null
        await supabase.from('user_profiles').update({
          zip_code:               (answers['zip']            as string | undefined) || null,
          income_bracket:          (answers['income_bracket'] as string | undefined) || null,
          household_size:          hhSize,
          care_needs:              (answers['needs']          as string[] | undefined) || null,
          barriers:                (answers['barriers']       as string[] | undefined) || null,
          preferred_language:      (answers['language']       as string | undefined) || null,
          situation:               (answers['situation']      as string | undefined) || null,
          onboarding_completed_at: new Date().toISOString(),
        }).eq('id', userId)
      } catch {
        // Migration 002 may not have run yet — data is safely in localStorage
      }
    }

    setDone(true)
  }

  const selectOption = (val: string) => {
    if (q.type !== 'options') return
    if (q.multi) {
      const current = (answers[q.id] as string[]) || []
      if (val === 'none') {
        setAnswers(prev => ({ ...prev, [q.id]: ['none'] }))
        return
      }
      const filtered = current.filter(v => v !== 'none')
      const next = filtered.includes(val)
        ? filtered.filter(v => v !== val)
        : [...filtered, val]
      setAnswers(prev => ({ ...prev, [q.id]: next }))
    } else {
      setAnswers(prev => ({ ...prev, [q.id]: val }))
      const opt = q.options.find(o => o.value === val)
      if (opt?.insight) {
        setActiveInsight(opt.insight)
        setTimeout(advance, 2000)
      } else {
        setTimeout(advance, 260)
      }
    }
  }

  const submitText = () => {
    if (q.type !== 'text') return
    const err = q.validate(textValue)
    if (err) { setTextError(err); return }
    if (textValue.trim()) {
      setAnswers(prev => ({ ...prev, [q.id]: textValue.trim() }))
    }
    advance()
  }

  // Focus text input when text step appears
  useEffect(() => {
    if (q?.type === 'text' && !transitioning) {
      setTimeout(() => textInputRef.current?.focus(), 350)
    }
  }, [step, transitioning, q?.type])

  /* ── Render guards ─────────────────────────────────────────────── */
  if (!profileChecked) return null

  if (!profileDone) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', background: 'var(--bg)',
      }}>
        <style>{`.ob-input:focus { border-color: rgba(79,142,240,0.45) !important; }`}</style>
        <ProfileForm onDone={() => setProfileDone(true)} userId={userId} />
      </div>
    )
  }

  if (done) {
    return <CompletionScreen answers={answers} />
  }

  /* ── Questionnaire ────────────────────────────────────────────── */
  const hasAnswer = (() => {
    const a = answers[q.id]
    if (q.type === 'text') return true // text steps are always skippable
    if (!a) return false
    if (Array.isArray(a)) return a.length > 0
    return true
  })()

  const multiReady = q.type === 'options' && q.multi
    ? (answers[q.id] as string[] | undefined)?.length ?? 0 > 0
    : false

  return (
    <div className="ob-panel" style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px 60px', background: 'var(--bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes ob-pop { from { opacity:0; transform: scale(0.94) } to { opacity:1; transform: scale(1) } }

        .ob-input { transition: border-color 0.15s; }
        .ob-input:focus { border-color: rgba(79,142,240,0.45) !important; }

        .ob-option { transition: background 0.15s, border-color 0.15s, transform 0.15s; }
        .ob-option:hover:not([aria-pressed="true"]) {
          border-color: rgba(74,144,217,0.30) !important;
          background: rgba(74,144,217,0.04) !important;
        }
        .ob-option:active { transform: scale(0.98); }

        .ob-text-btn { transition: background 0.15s, border-color 0.15s, color 0.15s; }
        .ob-text-btn:hover:not(:disabled) {
          background: rgba(74,144,217,0.14) !important;
          border-color: rgba(74,144,217,0.40) !important;
        }
        .ob-text-btn:disabled { cursor: not-allowed; }

        @media (max-width: 600px) {
          .ob-options-grid { grid-template-columns: 1fr !important; }
          .ob-option { padding: 12px 14px !important; }
          .ob-panel  { padding: 20px 16px 40px !important; }
        }
      `}</style>

      {/* Ambient glow that drifts with step */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 70% 60% at 50% ${(step / TOTAL) * 70 + 15}%, rgba(74,144,217,0.05) 0%, transparent 70%)`,
        transition: 'background 0.8s ease',
      }} />

      <div style={{ width: '100%', maxWidth: 580, position: 'relative' }}>

        {/* ── Top bar ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <Link href="/dashboard" style={{ fontSize: 12, color: 'var(--text-4)', textDecoration: 'none' }}>
            ← Skip for now
          </Link>
          <ProgressRing step={step + 1} total={TOTAL} unlocked={unlockedCount} />
        </div>

        {/* ── Feature unlock pills ──────────────────────────── */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28,
          minHeight: 26,
        }}>
          {QUESTIONS.map((q, i) => {
            const answered = (() => {
              const a = answers[q.id]
              if (!a) return false
              if (Array.isArray(a)) return a.length > 0
              return (a as string).length > 0
            })()
            return (
              <UnlockPill key={q.id} label={q.unlock} visible={answered || i < step} />
            )
          })}
        </div>

        {/* ── Question body ─────────────────────────────────── */}
        <div style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(14px)' : 'translateY(0)',
          transition: 'all 0.28s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <h2 style={{
            fontSize: 'clamp(21px,4vw,32px)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 9,
            color: 'var(--text)',
          }}>
            {q.question}
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 28 }}>
            {q.subtext}
          </p>

          {/* Insight callout */}
          {activeInsight && (
            <div style={{
              padding: '13px 17px', borderRadius: 12, marginBottom: 20,
              background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.22)',
              fontSize: 13, color: 'rgba(74,144,217,0.9)', lineHeight: 1.65,
              animation: 'fadeIn 0.4s ease both',
            }}>
              <span style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <InfoCircle size={14} color="rgba(74,144,217,0.9)" variant="TwoTone" style={{ flexShrink: 0, marginTop: 2 }} />
                {activeInsight}
              </span>
            </div>
          )}

          {/* ── Text input ─────────────────────────────────── */}
          {q.type === 'text' && (
            <div style={{ marginBottom: 24 }}>
              <input
                ref={textInputRef}
                type="text"
                inputMode={q.inputMode}
                maxLength={q.maxLength}
                value={textValue}
                placeholder={q.placeholder}
                onChange={e => {
                  setTextValue(e.target.value)
                  setTextError('')
                }}
                onKeyDown={e => { if (e.key === 'Enter') submitText() }}
                className="ob-input"
                style={{
                  width: '100%', padding: '14px 18px', fontSize: 20, fontWeight: 600,
                  letterSpacing: '0.08em', textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${textError ? 'rgba(248,113,113,0.45)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: 12, color: 'var(--text)', fontFamily: 'inherit',
                  outline: 'none', boxSizing: 'border-box', caretColor: 'var(--accent)',
                  transition: 'border-color 0.15s',
                }}
              />
              {textError && (
                <p style={{ margin: '7px 0 0', fontSize: 12, color: 'rgba(248,113,113,0.85)' }}>
                  {textError}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
                <button
                  onClick={submitText}
                  className="ob-text-btn"
                  style={{
                    padding: '12px 26px', borderRadius: 100,
                    background: 'rgba(74,144,217,0.10)', border: '1px solid rgba(74,144,217,0.28)',
                    color: 'var(--accent)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                >
                  Continue <ArrowRight2 size={14} />
                </button>
                <button
                  onClick={advance}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-4)',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* ── Option buttons ─────────────────────────────── */}
          {q.type === 'options' && (
            <>
              <div
                className="ob-options-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: q.options.length > 4 ? 'repeat(auto-fill, minmax(240px, 1fr))' : '1fr',
                  gap: 8, marginBottom: 24,
                }}
              >
                {q.options.map(opt => {
                  const selected = isSelected(q.id, opt.value)
                  return (
                    <button
                      key={opt.value}
                      className="ob-option"
                      onClick={() => selectOption(opt.value)}
                      aria-pressed={selected}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '13px 17px', borderRadius: 13, textAlign: 'left',
                        background: selected ? 'rgba(74,144,217,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selected ? 'rgba(74,144,217,0.38)' : 'rgba(255,255,255,0.09)'}`,
                        cursor: 'pointer', fontFamily: 'inherit', color: 'inherit', width: '100%',
                      }}
                    >
                      <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, flexShrink: 0,
                        color: selected ? 'var(--accent)' : 'rgba(255,255,255,0.40)',
                      }}>
                        {opt.icon}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          display: 'block', fontSize: 14, fontWeight: selected ? 600 : 400,
                          color: selected ? 'var(--text)' : 'rgba(248,249,255,0.75)',
                          letterSpacing: '-0.01em',
                        }}>
                          {opt.label}
                        </span>
                        {opt.sub && (
                          <span style={{
                            display: 'block', fontSize: 11.5, color: 'var(--text-4)',
                            marginTop: 1, lineHeight: 1.35,
                          }}>
                            {opt.sub}
                          </span>
                        )}
                      </span>
                      {selected && (
                        <TickCircle size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Multi-select Continue button */}
              {q.multi && (
                <button
                  onClick={advance}
                  disabled={!multiReady}
                  className="ob-text-btn"
                  style={{
                    padding: '12px 26px', borderRadius: 100,
                    background: multiReady ? 'rgba(74,144,217,0.10)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${multiReady ? 'rgba(74,144,217,0.28)' : 'rgba(255,255,255,0.07)'}`,
                    color: multiReady ? 'var(--accent)' : 'var(--text-4)',
                    fontSize: 14, fontWeight: 600, cursor: multiReady ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 7,
                    transition: 'all 0.2s',
                  }}
                >
                  Continue <ArrowRight2 size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
