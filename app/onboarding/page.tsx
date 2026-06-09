'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight2, Location, Heart, Shield, Profile2User, ArrowRight, TickCircle, MagicStar, Hospital, Health, Activity, Eye, Danger, Buildings2, DollarCircle, Global, Clock, DocumentText, InfoCircle, Car } from 'iconsax-react'

type Question = {
  id: string
  question: string
  subtext: string
  options: { value: string; label: string; icon: React.ReactNode; insight?: string }[]
  multi?: boolean
}

const QUESTIONS: Question[] = [
  {
    id: 'situation',
    question: 'What best describes your situation?',
    subtext: 'This helps us find the right programs and clinics for you. You can always change this later.',
    options: [
      { value: 'uninsured',    label: 'I have no health insurance',       icon: <Danger size={18} color="currentColor" variant="TwoTone" />,        insight: '30.4 million Americans are in the same situation. You are not alone.' },
      { value: 'underinsured', label: 'My insurance doesn\'t cover enough', icon: <DocumentText size={18} color="currentColor" variant="TwoTone" />,  insight: '44% of insured adults are "underinsured." NEXUS can still help with gaps.' },
      { value: 'transition',   label: 'I lost my coverage recently',       icon: <Clock size={18} color="currentColor" variant="TwoTone" />,          insight: 'You may qualify for special enrollment. We\'ll check for you.' },
      { value: 'helper',       label: 'I\'m helping someone else find care', icon: <Heart size={18} color="currentColor" variant="TwoTone" />,         insight: 'NEXUS works great for caregivers and family members helping others navigate.' },
    ],
  },
  {
    id: 'needs',
    question: 'What kind of care are you looking for?',
    subtext: 'Select all that apply.',
    multi: true,
    options: [
      { value: 'primary',       label: 'Primary / preventive care',    icon: <Hospital size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'dental',        label: 'Dental care',                  icon: <Health size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'mental',        label: 'Mental health / therapy',      icon: <Activity size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'vision',        label: 'Vision care',                  icon: <Eye size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'prescriptions', label: 'Prescription medications',     icon: <Health size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'specialist',    label: 'Specialist care',              icon: <MagicStar size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'pregnancy',     label: 'Pregnancy / maternal care',    icon: <Heart size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'emergency',     label: 'Emergency / urgent care',      icon: <Danger size={18} color="currentColor" variant="TwoTone" /> },
    ],
  },
  {
    id: 'location',
    question: 'Where are you located?',
    subtext: 'We use this only to find nearby clinics — never stored or shared.',
    options: [
      { value: 'urban',    label: 'In a city',    icon: <Buildings2 size={18} color="currentColor" variant="TwoTone" />, insight: '93% of cities have at least one FQHC within 2 miles.' },
      { value: 'suburban', label: 'Suburbs',      icon: <Location size={18} color="currentColor" variant="TwoTone" />,   insight: 'Telehealth may expand your options significantly.' },
      { value: 'rural',    label: 'Rural area',   icon: <Location size={18} color="currentColor" variant="TwoTone" />,   insight: 'Rural Health Clinics and mobile health units specifically serve your area.' },
      { value: 'tribal',   label: 'Tribal land',  icon: <Location size={18} color="currentColor" variant="TwoTone" />,   insight: 'IHS (Indian Health Service) facilities may be your primary resource.' },
    ],
  },
  {
    id: 'barriers',
    question: 'What has stopped you from getting care before?',
    subtext: 'This helps us proactively address your specific challenges. No judgment.',
    multi: true,
    options: [
      { value: 'cost',          label: 'Cost / can\'t afford it',            icon: <DollarCircle size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'transport',     label: 'Transportation',                     icon: <Car size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'language',      label: 'Language barrier',                   icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'time',          label: 'Work schedule / time',               icon: <Clock size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'fear',          label: 'Fear or past bad experience',        icon: <Heart size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'documentation', label: 'Concerns about documentation',       icon: <DocumentText size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'knowledge',     label: 'Didn\'t know options existed',       icon: <InfoCircle size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'none',          label: 'None — just exploring',              icon: <MagicStar size={18} color="currentColor" variant="TwoTone" /> },
    ],
  },
  {
    id: 'language',
    question: 'What language do you prefer?',
    subtext: 'We\'ll filter for providers who speak your language.',
    options: [
      { value: 'english', label: 'English',             icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'spanish', label: 'Spanish / Español',   icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'chinese', label: 'Chinese / 中文',       icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'arabic',  label: 'Arabic / عربي',       icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'tagalog', label: 'Tagalog / Filipino',  icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
      { value: 'other',   label: 'Other language',      icon: <Global size={18} color="currentColor" variant="TwoTone" /> },
    ],
  },
]

const INSIGHTS: Record<string, string[]> = {
  uninsured: ['76% of people in your area are also navigating this.', 'FQHCs must see you regardless of insurance. That\'s federal law.'],
  underinsured: ['44% of insured Americans still face cost barriers.', 'Sliding-scale clinics accept patients with high-deductible plans.'],
  transition: ['You may qualify for Medicaid or ACA special enrollment.', 'Your 60-day window just started — act quickly.'],
  urban: ['23 clinics within 5 miles of your area.', 'Average wait time: 2.1 days.'],
  rural: ['Mobile health units visit 87% of rural counties monthly.', 'Telehealth closes 60% of rural access gaps.'],
  cost: ['FQHC visits average $0–$40 for uninsured patients.', '340B prescription discounts save patients 85% on medications.'],
}

function ProgressRing({ step, total }: { step: number; total: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const offset = circ - (step / total) * circ

  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <circle
        cx="22" cy="22" r={r} fill="none"
        stroke="var(--accent)" strokeWidth="2"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
        style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <text x="22" y="26" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f5f5f5" fontFamily="var(--font-inter)">
        {step}/{total}
      </text>
    </svg>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [transitioning, setTransitioning] = useState(false)
  const [done, setDone] = useState(false)
  const [activeInsight, setActiveInsight] = useState<string | null>(null)

  const q = QUESTIONS[step]

  const getValue = (id: string) => answers[id]
  const isSelected = (qId: string, val: string) => {
    const v = getValue(qId)
    if (Array.isArray(v)) return v.includes(val)
    return v === val
  }

  const select = (val: string) => {
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
      // Show insight then advance
      const opt = q.options.find(o => o.value === val)
      if (opt?.insight) {
        setActiveInsight(opt.insight)
        setTimeout(advance, 2200)
      } else {
        setTimeout(advance, 300)
      }
    }
  }

  const advance = () => {
    setActiveInsight(null)
    if (step < QUESTIONS.length - 1) {
      setTransitioning(true)
      setTimeout(() => { setStep(s => s + 1); setTransitioning(false) }, 300)
    } else {
      // Persist onboarding answers so eligibility, programs, and search can use them
      try {
        localStorage.setItem('nexus_onboarding', JSON.stringify({
          answers,
          completedAt: new Date().toISOString(),
          version: 1,
        }))
      } catch { /* ignore — Safari private mode blocks localStorage */ }
      setDone(true)
    }
  }

  if (done) {
    const topNeeds = (answers['needs'] as string[] | undefined) || []
    const barriers = (answers['barriers'] as string[] | undefined) || []
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '80px 24px', background: '#0d1117',
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(74,144,217,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <MagicStar size={40} color="var(--accent)" style={{ marginBottom: '24px' }} />
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>
          Your personalized care plan is ready.
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', maxWidth: '440px', lineHeight: 1.7, marginBottom: '40px' }}>
          Based on your answers, we&apos;ve found resources tailored to you.
          {barriers.includes('cost') && ' We\'ve prioritized zero-cost options.'}
          {barriers.includes('language') && ' We\'ve filtered for bilingual providers.'}
          {barriers.includes('transport') && ' Telehealth options are included.'}
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px', maxWidth: '600px', width: '100%', marginBottom: '40px',
        }}>
          {[
            { href: '/search', label: 'Find your clinic', icon: <Location size={16} />, color: '#60a5fa' },
            { href: '/programs', label: 'Check eligibility', icon: <Shield size={16} />, color: '#818cf8' },
            { href: '/triage', label: 'AI symptom check', icon: <Heart size={16} />, color: '#f472b6' },
            { href: '/gps', label: 'Step-by-step guide', icon: <ArrowRight size={16} />, color: '#fbbf24' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '14px 18px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              textDecoration: 'none', color: item.color, fontWeight: 600, fontSize: '14px',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        <Link href="/search" style={{
          padding: '15px 36px', borderRadius: '100px',
          background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.3)',
          color: 'var(--accent)', fontSize: '15px', fontWeight: 700,
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          Find a free clinic near me <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="ob-panel" style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', background: '#0d1117',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        .ob-option:hover { border-color: rgba(74,144,217,0.35) !important; background: rgba(74,144,217,0.04) !important; }
        .ob-option { transition: all 0.18s; }
        @media (max-width: 600px) {
          .ob-options-grid { grid-template-columns: 1fr !important; }
          .ob-option { padding: 12px 14px !important; }
        }
        @media (max-width: 480px) {
          .ob-panel { padding: 20px 16px !important; }
        }
      `}</style>

      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 70% 60% at 50% ${(step / QUESTIONS.length) * 80 + 10}%, rgba(74,144,217,0.05) 0%, transparent 70%)`,
        pointerEvents: 'none', transition: 'all 0.8s ease',
      }} />

      <div style={{ width: '100%', maxWidth: '580px', position: 'relative' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            ← Skip for now
          </Link>
          <ProgressRing step={step + 1} total={QUESTIONS.length} />
        </div>

        {/* Question */}
        <div style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(12px)' : 'translateY(0)',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <h2 style={{
            fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '10px',
          }}>
            {q.question}
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '28px' }}>
            {q.subtext}
          </p>

          {/* Insight callout */}
          {activeInsight && (
            <div style={{
              padding: '14px 18px', borderRadius: '12px', marginBottom: '20px',
              background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.25)',
              fontSize: '13px', color: 'rgba(74,144,217,0.9)', lineHeight: 1.65,
              animation: 'fadeIn 0.4s ease both',
            }}>
              <span style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <InfoCircle size={14} color="rgba(74,144,217,0.9)" variant="TwoTone" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                <span>{activeInsight}</span>
              </span>
            </div>
          )}

          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          {/* Options */}
          <div className="ob-options-grid" style={{
            display: 'grid',
            gridTemplateColumns: q.options.length > 4 ? 'repeat(auto-fill, minmax(240px, 1fr))' : '1fr',
            gap: '8px', marginBottom: '24px',
          }}>
            {q.options.map(opt => (
              <button
                key={opt.value}
                className="ob-option"
                onClick={() => select(opt.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 18px', borderRadius: '14px', textAlign: 'left',
                  background: isSelected(q.id, opt.value) ? 'rgba(74,144,217,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSelected(q.id, opt.value) ? 'rgba(74,144,217,0.4)' : 'rgba(255,255,255,0.09)'}`,
                  cursor: 'pointer', fontFamily: 'inherit', color: 'inherit', width: '100%',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', flexShrink: 0 }}>{opt.icon}</span>
                <span style={{
                  fontSize: '14px', fontWeight: isSelected(q.id, opt.value) ? 600 : 400,
                  color: isSelected(q.id, opt.value) ? 'var(--accent)' : '#f5f5f5',
                  flex: 1,
                }}>
                  {opt.label}
                </span>
                {isSelected(q.id, opt.value) && (
                  <TickCircle size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>

          {/* Continue for multi-select */}
          {q.multi && (
            <button
              onClick={advance}
              disabled={!answers[q.id] || (answers[q.id] as string[]).length === 0}
              style={{
                padding: '13px 28px', borderRadius: '100px',
                background: answers[q.id] && (answers[q.id] as string[]).length > 0 ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${answers[q.id] && (answers[q.id] as string[]).length > 0 ? 'rgba(74,144,217,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: answers[q.id] && (answers[q.id] as string[]).length > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.25)',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
              }}
            >
              Continue <ArrowRight2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
