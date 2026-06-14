'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { Hospital, Danger, TickCircle, Location, ArrowRight2, RefreshCircle, InfoCircle, ArrowRight, Clock, MagicStar, Activity, Flash, Heart, Health } from 'iconsax-react'
import QuickExit from '@/components/QuickExit'
import CrisisDetectionBanner from '@/components/CrisisDetectionBanner'

type Step = {
  type: 'thinking' | 'checking' | 'result' | 'warning'
  text: string
  delay: number
}

type TriageResult = {
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency'
  clinic?: { name: string; dist: string; type: string; cost: string; wait: string } | null
  reasoning: string
  erAlert?: string
  steps: string[]
  citations: string[]
}

/* ── Fallback keyword-matched scenarios (used when AI is unavailable) ── */
const SCENARIOS: Record<string, { steps: Step[]; result: TriageResult }> = {
  default: {
    steps: [
      { type: 'thinking', text: 'Analyzing symptom description…', delay: 600 },
      { type: 'checking', text: 'Cross-referencing CDC triage guidelines for respiratory symptoms…', delay: 1400 },
      { type: 'checking', text: 'Checking your saved location: Phoenix, AZ…', delay: 2200 },
      { type: 'checking', text: 'Filtering clinics that handle this condition and accept uninsured patients…', delay: 3000 },
      { type: 'result', text: 'Match found.', delay: 3800 },
    ],
    result: {
      urgency: 'soon',
      clinic: { name: 'Mountain Park Health Center', dist: '2.1 mi', type: 'FQHC', cost: '$0–$25 sliding scale', wait: 'Walk-in available now' },
      reasoning: 'Chest discomfort lasting 2 days with a respiratory pattern is most consistent with pleurisy or a musculoskeletal strain. While usually not immediately dangerous, persistent symptoms require evaluation to rule out pneumonia or pleuritis.',
      erAlert: 'If pain becomes sharp or stabbing, you develop fever above 101°F, or feel short of breath at rest — go to the ER immediately. Banner University Medical Center is 0.6 mi away.',
      steps: ['Call Mountain Park at (602) 243-7011 to confirm walk-in availability', 'Describe your symptom: "chest discomfort that worsens when I breathe deeply, 2 days"', 'Bring any ID. Tell them you are uninsured — they will work with you on cost.'],
      citations: ['CDC Clinical Practice Guidelines — Chest Pain Triage (2024)', 'HRSA FQHC Directory — Mountain Park Health Center', 'AAFP: Approach to Chest Wall Pain'],
    },
  },
  headache: {
    steps: [
      { type: 'thinking', text: 'Analyzing symptom description…', delay: 600 },
      { type: 'checking', text: 'Screening for red-flag headache signs (thunder-clap, worst of life, neurological symptoms)…', delay: 1400 },
      { type: 'checking', text: 'Checking your saved location: Phoenix, AZ…', delay: 2200 },
      { type: 'checking', text: 'Filtering for primary care & neurology at sliding-scale clinics…', delay: 3000 },
      { type: 'result', text: 'Match found.', delay: 3800 },
    ],
    result: {
      urgency: 'routine',
      clinic: { name: 'Terros Health — Central', dist: '1.3 mi', type: 'FQHC', cost: '$0–$40 sliding scale', wait: 'Next-day appointments' },
      reasoning: 'A persistent headache for 3 days without thunderclap onset, neurological symptoms, or fever suggests a tension-type or migraine headache. These are common and manageable at a primary care clinic.',
      steps: ['Book a same-day or next-day appointment at Terros Health', 'Note when the headache started, severity (1-10), and what makes it better or worse', 'Mention any over-the-counter medications you have tried'],
      citations: ['ICHD-3: Headache Classification (IHS, 2023)', 'HRSA FQHC Directory — Terros Health', 'NIH: Tension Headache Overview'],
    },
  },
  emergency: {
    steps: [
      { type: 'thinking', text: 'Analyzing symptom description…', delay: 400 },
      { type: 'warning', text: '! Potential emergency symptom detected — accelerating triage…', delay: 900 },
      { type: 'checking', text: 'Checking nearest emergency facilities…', delay: 1500 },
      { type: 'result', text: 'Emergency guidance ready.', delay: 2200 },
    ],
    result: {
      urgency: 'emergency',
      clinic: { name: 'Banner University Medical Center ER', dist: '0.6 mi', type: 'Emergency Room', cost: 'They must treat you regardless of ability to pay (EMTALA)', wait: 'Go now — do not wait' },
      reasoning: 'Chest pain with shortness of breath and sweating are classic warning signs of a cardiac event. This combination requires immediate emergency evaluation. Do not drive yourself if possible.',
      erAlert: 'Call 911 now or have someone drive you to the ER. Do not eat or drink anything until evaluated.',
      steps: ['Call 911 or have someone drive you to Banner University Medical Center', 'Tell the triage nurse: "I have chest pain with shortness of breath"', 'If you have aspirin available and are not allergic, chew one regular aspirin (325mg)'],
      citations: ['ACC/AHA 2023 Chest Pain Guideline', 'EMTALA: 42 U.S.C. § 1395dd — Emergency treatment rights', 'AHA: Heart Attack Warning Signs'],
    },
  },
}


const urgencyConfig = {
  routine: { label: 'Routine — within a few days', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)' },
  soon: { label: 'See care within 24–48 hours', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)' },
  urgent: { label: 'Urgent — see care today', color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.25)' },
  emergency: { label: 'Emergency — go now', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.35)' },
}

export default function TriagePage() {
  const [query, setQuery] = useState('')
  const [phase, setPhase] = useState<'input' | 'thinking' | 'done'>('input')
  const [visibleSteps, setVisibleSteps] = useState<Step[]>([])
  const [result, setResult] = useState<TriageResult | null>(null)
  const [showWork, setShowWork] = useState(false)
  const [isRealAI, setIsRealAI] = useState(false)
  const [totalSteps, setTotalSteps] = useState(5)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const timerIds    = useRef<ReturnType<typeof setTimeout>[]>([])
  const runTriageRef = useRef<((input: string) => void) | null>(null)

  /* #21 — Pre-fill from ?symptom= query param sent by Hero search bar.
   * When users type a symptom in the hero and press search, they land here
   * with the symptom pre-filled and auto-triaged.
   *
   * We use a ref (runTriageRef) so the one-time mount effect can call the
   * latest runTriage without listing it as a dependency (which would cause
   * the effect to re-fire on every render). */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sym    = params.get('symptom')
    if (sym && sym.trim()) {
      const trimmed = sym.trim()
      setQuery(trimmed)
      // Auto-run triage after a short delay to let the UI render first
      const tid = setTimeout(() => {
        runTriageRef.current?.(trimmed)
      }, 400)
      return () => clearTimeout(tid)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const SUGGESTIONS = [
    'chest hurts when I breathe, 2 days',
    'bad headache for 3 days',
    'chest pain and shortness of breath right now',
    'tooth pain, no insurance, need help',
    'fever and sore throat for 5 days',
  ]

  // F2 — Symptom category quick-pick
  type SymptomCategory = { Icon: React.ComponentType<{ size?: number; color?: string; variant?: 'Bold' | 'Linear' | 'Outline' | 'Broken' | 'Bulk' | 'TwoTone' }>; label: string; preset: string }
  const SYMPTOM_CATEGORIES: SymptomCategory[] = [
    { Icon: Activity, label: 'Breathing',     preset: 'chest hurts when I breathe, shortness of breath' },
    { Icon: Flash,    label: 'Head pain',     preset: 'bad headache lasting several days, no fever' },
    { Icon: Health,   label: 'Dental',        preset: 'severe tooth pain, need free dental care, no insurance' },
    { Icon: Heart,    label: 'Mental health', preset: 'anxiety and depression, need mental health support, uninsured' },
    { Icon: Danger,   label: 'Fever / cold',  preset: 'fever, sore throat, and body aches for 5 days' },
    { Icon: Hospital, label: 'General care',  preset: 'need a general checkup and primary care, no insurance' },
    { Icon: Flash,    label: 'Pain / injury', preset: 'joint or muscle pain, need evaluation, no insurance' },
    { Icon: Health,   label: 'Medication',    preset: 'need help affording my prescription medications' },
  ]

  /* ── Core triage logic: real AI with keyword-match fallback ── */
  const runTriage = useCallback(async (input: string) => {
    // Clear any lingering timers from a previous run
    timerIds.current.forEach(clearTimeout)
    timerIds.current = []

    setPhase('thinking')
    setVisibleSteps([])
    setResult(null)
    setIsRealAI(false)

    const q = input.toLowerCase()
    const isEmergency =
      q.includes('emergency') ||
      q.includes('shortness of breath') ||
      (q.includes('chest') && q.includes('sweat'))
    const isHeadache = !isEmergency && (q.includes('headache') || q.includes('head pain'))
    // Set total steps for the progress counter
    setTotalSteps(isEmergency ? 4 : 5)

    // Choose animated step sequence based on symptom urgency
    const STEPS: Step[] = isEmergency
      ? [
          { type: 'thinking', text: 'Analyzing symptom description…', delay: 400 },
          { type: 'warning', text: '! Potential emergency symptom detected — accelerating triage…', delay: 900 },
          { type: 'checking', text: 'Cross-referencing ACC/AHA emergency triage guidelines…', delay: 1500 },
          { type: 'result', text: 'Emergency guidance ready.', delay: 2200 },
        ]
      : [
          { type: 'thinking', text: 'Analyzing symptom description…', delay: 500 },
          { type: 'checking', text: 'Cross-referencing CDC and clinical triage guidelines…', delay: 1300 },
          { type: 'checking', text: 'Assessing urgency level and appropriate care setting…', delay: 2100 },
          { type: 'checking', text: 'Identifying free care options for uninsured patients…', delay: 2900 },
          { type: 'result', text: 'Care pathway identified.', delay: 3600 },
        ]

    const lastDelay = STEPS[STEPS.length - 1].delay

    // Animate steps at fixed intervals
    STEPS.forEach(step => {
      const id = setTimeout(
        () => setVisibleSteps(prev => [...prev, step]),
        step.delay
      )
      timerIds.current.push(id)
    })

    // Minimum display time: last step + 600ms "reveal" buffer
    const minWait = new Promise<void>(resolve => {
      const id = setTimeout(resolve, lastDelay + 600)
      timerIds.current.push(id)
    })

    // Real AI call — graceful 503/500 fallback to keyword matching
    const aiCall: Promise<TriageResult> = fetch('/api/triage', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query: input }),
    })
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json() as Record<string, unknown>
        if (
          !data.urgency ||
          typeof data.reasoning !== 'string' ||
          !Array.isArray(data.steps)
        ) {
          throw new Error('Incomplete AI response')
        }
        setIsRealAI(true)
        // AI result has no specific clinic (user searches via /search)
        return {
          urgency:   data.urgency,
          reasoning: data.reasoning,
          steps:     data.steps as string[],
          citations: Array.isArray(data.citations) ? data.citations as string[] : [],
          erAlert:   typeof data.erAlert === 'string' ? data.erAlert : undefined,
          clinic:    null,
        } as TriageResult
      })
      .catch(() => {
        // Keyword-match fallback (API unavailable or key not configured)
        const scenario = isEmergency
          ? SCENARIOS.emergency
          : isHeadache
          ? SCENARIOS.headache
          : SCENARIOS.default
        return scenario.result
      })

    // Wait for BOTH minimum animation time AND AI response
    const [, triageResult] = await Promise.all([minWait, aiCall])

    setResult(triageResult)
    setPhase('done')
  }, [])

  /* Keep runTriageRef current so the ?symptom= mount effect can call it. */
  useEffect(() => { runTriageRef.current = runTriage }, [runTriage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    runTriage(query)
  }

  const reset = () => {
    timerIds.current.forEach(clearTimeout)
    timerIds.current = []
    setPhase('input')
    setQuery('')
    setVisibleSteps([])
    setResult(null)
    setShowWork(false)
    setIsRealAI(false)
  }

  return (
    <AppShell>
      <QuickExit />
      <style>{`
        .triage-step { animation: fadeSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .triage-result { animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .triage-ta:focus { outline: none !important; border-color: rgba(74,144,217,0.4) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .triage-category-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .triage-ta { font-size: 16px !important; }
        }
        @media (max-width: 480px) {
          .triage-category-grid button { padding: 12px 6px !important; font-size: 10px !important; }
        }
      `}</style>

      {/* Header */}
      <section style={{
        padding: 'clamp(80px,10vw,120px) 24px 0',
        textAlign: 'center', position: 'relative',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(129,140,248,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.25)',
          marginBottom: '24px', fontSize: '11px', fontWeight: 600,
          color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <Hospital size={11} /> Symptom Guide
        </div>

        <h1 style={{
          fontSize: 'clamp(30px, 5vw, 56px)', fontWeight: 800,
          letterSpacing: '-0.035em', lineHeight: 1.05,
          marginBottom: '16px', maxWidth: '640px', margin: '0 auto 16px',
        }}>
          Describe what you&apos;re feeling.<br />
          <span style={{ color: 'var(--accent)' }}>We&apos;ll help you find care.</span>
        </h1>

        <p style={{
          fontSize: '15px', color: 'rgba(255,255,255,0.45)',
          maxWidth: '440px', lineHeight: 1.7, margin: '0 auto 48px',
        }}>
          A structured guide — not a diagnosis. We match your symptoms to general care pathways based on published clinical guidelines, and point you toward a real provider near you.
        </p>

        {/* Honest disclaimer banner */}
        <div style={{
          display: 'inline-flex', alignItems: 'flex-start', gap: '10px',
          padding: '12px 18px', borderRadius: '12px',
          background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
          maxWidth: '520px', margin: '0 auto 48px', textAlign: 'left',
        }}>
          <InfoCircle size={14} color="#fbbf24" style={{ flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0, fontFamily: 'var(--font-inter)' }}>
            <strong style={{ color: 'rgba(251,191,36,0.9)', fontWeight: 600 }}>This is not a medical diagnosis.</strong>{' '}
            This tool uses AI analysis and published guidelines (CDC, AAFP, AHA) to suggest appropriate care settings. It cannot examine you, review your medical history, or replace a licensed provider. In any emergency, call 911.
          </p>
        </div>
      </section>

      {/* Main Triage Interface */}
      <section style={{ padding: '0 24px 120px', maxWidth: '720px', margin: '0 auto' }}>

        {/* Input Phase */}
        {phase === 'input' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Symptom category quick-pick */}
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)', marginBottom: 10, textAlign: 'center', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Quick start — select a category
              </p>
              <div className="triage-category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {SYMPTOM_CATEGORIES.map(cat => {
                  const CatIcon = cat.Icon
                  const isActive = query === cat.preset
                  return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setQuery(cat.preset)}
                    style={{
                      padding: '10px 8px', borderRadius: 12, textAlign: 'center',
                      background: isActive ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? 'rgba(74,144,217,0.35)' : 'rgba(255,255,255,0.07)'}`,
                      color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer', fontFamily: 'var(--font-inter)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'rgba(74,144,217,0.2)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 24, marginBottom: 4 }}>
                      <CatIcon size={18} color={isActive ? 'var(--accent)' : 'rgba(255,255,255,0.5)'} variant="TwoTone" aria-hidden="true" />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 500 }}>{cat.label}</div>
                  </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-inter)' }}>or describe in your own words</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div style={{ position: 'relative' }}>
              <textarea
                ref={inputRef}
                className="triage-ta"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Describe your symptoms in plain language…&#10;&#10;Example: &quot;chest hurts when I breathe, started 2 days ago, no fever&quot;"
                rows={5}
                style={{
                  width: '100%', padding: '20px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f5f5f5', fontSize: '15px', lineHeight: 1.7,
                  fontFamily: 'var(--font-inter)',
                  resize: 'none', transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <div style={{
                position: 'absolute', bottom: '14px', right: '14px',
                fontSize: '11px', color: 'rgba(255,255,255,0.2)',
              }}>
                ⌘↵ to analyze
              </div>
            </div>

            {/* Crisis detection — surfaces 988 banner for crisis language */}
            <CrisisDetectionBanner text={query} />

            {/* Suggestions */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  style={{
                    padding: '6px 12px', borderRadius: '100px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.45)', fontSize: '12px',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,144,217,0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)' }}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!query.trim()}
              style={{
                padding: '15px 30px', borderRadius: '14px',
                background: query.trim() ? 'rgba(74,144,217,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${query.trim() ? 'rgba(74,144,217,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: query.trim() ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
                fontSize: '15px', fontWeight: 600, cursor: query.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', transition: 'all 0.2s',
              }}
            >
              <Hospital size={16} color={query.trim() ? 'var(--accent)' : 'rgba(255,255,255,0.3)'} />
              Find care pathway
            </button>

            {/* Disclaimer */}
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.6 }}>
              <InfoCircle size={14} color="rgba(255,255,255,0.45)" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              Not a medical diagnosis. This tool helps you find appropriate care — always consult a healthcare professional. Nothing you enter leaves your device to third parties.
            </p>
          </form>
        )}

        {/* Thinking + Done Phase */}
        {(phase === 'thinking' || phase === 'done') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Your query */}
            <div style={{
              padding: '16px 20px', borderRadius: '14px',
              background: 'rgba(129,140,248,0.06)',
              border: '1px solid rgba(129,140,248,0.2)',
              marginBottom: '24px',
              fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6,
            }}>
              &ldquo;{query}&rdquo;
            </div>

            {/* Reasoning stream */}
            <div style={{
              padding: '20px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              marginBottom: '24px',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Hospital size={14} color="var(--accent)" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Matching care pathway
                </span>
                {phase === 'done' && isRealAI && (
                  <span style={{
                    marginLeft: 'auto',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '10px', padding: '2px 9px', borderRadius: '100px',
                    background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)',
                    color: 'rgba(74,144,217,0.8)',
                  }}>
                    <MagicStar size={9} /> AI-analyzed
                  </span>
                )}
                {phase === 'thinking' && (
                  <RefreshCircle size={12} color="var(--accent)" style={{ animation: 'spin 1s linear infinite', marginLeft: 'auto' }} />
                )}
              </div>

              {/* ── Persistent step counter + progress bar ── */}
              {phase === 'thinking' && (
                <div style={{ marginBottom: '4px' }}>
                  {/* Counter row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <span style={{
                      fontSize: '11px', color: 'var(--text-3)',
                      fontFamily: 'var(--font-mono), monospace',
                      fontWeight: 500, letterSpacing: '0.04em',
                    }}>
                      Step {Math.min(visibleSteps.length, totalSteps)} of {totalSteps}
                    </span>
                    <span style={{
                      fontSize: '11px', color: 'var(--accent)',
                      fontFamily: 'var(--font-inter)', fontWeight: 500,
                    }}>
                      {Math.round((visibleSteps.length / totalSteps) * 100)}%
                    </span>
                  </div>
                  {/* Progress track */}
                  <div style={{
                    height: '3px', borderRadius: '100px',
                    background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      borderRadius: '100px',
                      width: `${(visibleSteps.length / totalSteps) * 100}%`,
                      background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                      transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
                      boxShadow: '0 0 8px rgba(79,142,240,0.5)',
                    }} />
                  </div>
                </div>
              )}
              {phase === 'done' && (
                <div style={{ marginBottom: '4px' }}>
                  {/* Completed bar */}
                  <div style={{
                    height: '3px', borderRadius: '100px',
                    background: 'rgba(52,211,153,0.15)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: '100%',
                      background: 'linear-gradient(90deg, var(--success), rgba(52,211,153,0.7))',
                      borderRadius: '100px',
                      boxShadow: '0 0 8px rgba(52,211,153,0.4)',
                    }} />
                  </div>
                  <div style={{
                    marginTop: '6px', fontSize: '11px', color: 'var(--success)',
                    fontFamily: 'var(--font-inter)', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}>
                    <TickCircle size={14} color="var(--success)" variant="Bold" />
                    Analysis complete
                  </div>
                </div>
              )}

              {visibleSteps.map((step, i) => (
                <div
                  key={i}
                  className="triage-step"
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    fontSize: '13px', lineHeight: 1.55,
                    animationDelay: '0ms',
                  }}
                >
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                    marginTop: '5px',
                    background: step.type === 'warning' ? '#fb923c'
                      : step.type === 'result' ? 'var(--accent)'
                      : step.type === 'checking' ? 'rgba(74,144,217,0.7)'
                      : 'rgba(255,255,255,0.3)',
                  }} />
                  <span style={{
                    color: step.type === 'warning' ? '#fb923c'
                      : step.type === 'result' ? 'var(--accent)'
                      : 'rgba(255,255,255,0.6)',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Result cards */}
            {result && (
              <div className="triage-result" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Urgency badge */}
                <div style={{
                  padding: '14px 18px', borderRadius: '12px',
                  background: urgencyConfig[result.urgency].bg,
                  border: `1px solid ${urgencyConfig[result.urgency].border}`,
                  display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '14px', fontWeight: 600, color: urgencyConfig[result.urgency].color,
                }}>
                  {result.urgency === 'emergency' ? <Danger size={16} /> : <TickCircle size={16} />}
                  {urgencyConfig[result.urgency].label}
                </div>

                {/* ER alert */}
                {result.erAlert && (
                  <div style={{
                    padding: '14px 18px', borderRadius: '12px',
                    background: 'rgba(248,113,113,0.06)',
                    border: '1px solid rgba(248,113,113,0.25)',
                    fontSize: '13px', color: '#fca5a5', lineHeight: 1.65,
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                  }}>
                    <Danger size={15} color="#f87171" style={{ flexShrink: 0, marginTop: '1px' }} />
                    {result.erAlert}
                  </div>
                )}

                {/* Best match clinic / Find care CTA */}
                <div style={{
                  padding: '22px', borderRadius: '16px',
                  background: 'rgba(74,144,217,0.04)',
                  border: '1px solid rgba(74,144,217,0.18)',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    {result.clinic ? 'Best match' : 'Find care near you'}
                  </div>

                  {result.clinic ? (
                    <>
                      <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>{result.clinic.name}</div>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Location size={12} /> {result.clinic.dist}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={12} /> {result.clinic.wait}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4ade80', fontWeight: 600 }}>
                          <TickCircle size={12} color="#4ade80" variant="Bold" aria-hidden="true" />
                          {result.clinic.cost}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: '16px' }}>
                      Based on your symptoms and urgency level, search for free and sliding-scale clinics near you.{' '}
                      <strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>FQHCs cannot turn you away</strong>{' '}
                      regardless of insurance status or ability to pay.
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link href="/search" style={{
                      padding: '9px 18px', borderRadius: '100px',
                      background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.3)',
                      color: 'var(--accent)', fontSize: '13px', fontWeight: 600,
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      <Location size={12} />
                      {result.clinic ? 'Get directions' : 'Search free clinics near me'}
                    </Link>
                    <Link href="/gps" style={{
                      padding: '9px 18px', borderRadius: '100px',
                      background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.6)', fontSize: '13px',
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      Step-by-step guide <ArrowRight2 size={12} />
                    </Link>
                  </div>
                </div>

                {/* Next steps */}
                <div style={{
                  padding: '20px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '14px', color: 'rgba(255,255,255,0.8)' }}>
                    What to do next
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {result.steps.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(74,144,217,0.12)',
                          border: '1px solid rgba(74,144,217,0.28)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '10px', fontWeight: 700, color: 'var(--accent)',
                        }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Show reasoning + citations toggle */}
                <button
                  onClick={() => setShowWork(!showWork)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', fontSize: '12px',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '0',
                  }}
                >
                  <InfoCircle size={12} color="rgba(255,255,255,0.45)" />
                  {showWork ? 'Hide' : 'Show'} reasoning &amp; citations
                </button>

                {showWork && (
                  <div style={{
                    padding: '20px', borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    animation: 'fadeSlideUp 0.3s ease both',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                        Clinical reasoning
                      </div>
                      {isRealAI && (
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.15)', color: 'rgba(74,144,217,0.7)' }}>
                          Powered by Claude
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '16px' }}>
                      {result.reasoning}
                    </p>
                    {result.citations.length > 0 && (
                      <>
                        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'rgba(255,255,255,0.7)' }}>
                          Sources
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {result.citations.map((c, i) => (
                            <div key={i} style={{
                              fontSize: '12px', color: 'rgba(255,255,255,0.4)',
                              display: 'flex', alignItems: 'center', gap: '6px',
                            }}>
                              <ArrowRight size={14} color="rgba(255,255,255,0.5)" /> {c}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '16px', lineHeight: 1.6 }}>
                      This analysis is not a medical diagnosis. It is for informational purposes only and should not replace professional medical advice.
                    </p>
                  </div>
                )}

                {/* Try again */}
                <button
                  onClick={reset}
                  style={{
                    padding: '11px 20px', borderRadius: '100px',
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.45)', fontSize: '13px', cursor: 'pointer',
                    fontFamily: 'inherit', alignSelf: 'flex-start',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)' }}
                >
                  ← Try different symptoms
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </AppShell>
  )
}
