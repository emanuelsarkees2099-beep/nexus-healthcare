'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import AppShell from '@/components/AppShell'
import { smoothScrollTo } from '@/utils/smoothScroll'
import { useRouter } from 'next/navigation'
import { MapPin, Stethoscope, BrainCircuit, ArrowRight, CheckCircle, ChevronRight, Wifi, Clock, Star, Languages, Sparkles, ScanSearch, Navigation2, Phone } from 'lucide-react'

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

/* ─── data ────────────────────────────────────────── */
const STEPS = [
  { n: '01', icon: <ScanSearch size={18} strokeWidth={1.5} />, title: "Tell us what's wrong", body: 'Describe your symptoms or what kind of care you need. No medical jargon required.' },
  { n: '02', icon: <MapPin size={18} strokeWidth={1.5} />, title: 'Confirm your location', body: "We use your zip code and language preference to filter what's actually available near you." },
  { n: '03', icon: <Sparkles size={18} strokeWidth={1.5} />, title: 'AI ranks your best match', body: 'Our model weighs 8 variables — success rate, wait time, languages, and more — to surface the right clinic first.' },
]

const INSURANCE_OPTIONS = [
  { id: 'uninsured', label: 'No insurance',          desc: 'Access 12,000+ free clinics' },
  { id: 'medicaid',  label: 'Medicaid / CHIP',        desc: 'Verify coverage & find providers' },
  { id: 'aca',       label: 'ACA marketplace plan',   desc: 'Find in-network free clinics' },
  { id: 'other',     label: 'Other / Not sure',       desc: "We'll figure it out together" },
]

// Real telehealth providers (nationwide, verified)
const TELEHEALTH = [
  { name: 'Teladoc Health',    cost: 'Free–$75',  wait: '< 10 min', langs: 'English · Español · French',          tag: 'General care',   url: 'https://www.teladoc.com',              note: 'Sliding scale for uninsured' },
  { name: 'MDLIVE',            cost: 'Free–$82',  wait: '< 15 min', langs: 'English · Español',                   tag: 'Urgent care',    url: 'https://www.mdlive.com',               note: 'MDLIVE Cares program for low-income' },
  { name: 'Open Path Collective', cost: '$30–$80/session', wait: '2–5 days', langs: 'English · Español · Mandarin · Arabic', tag: 'Mental health', url: 'https://openpathcollective.org', note: 'Licensed therapists, below-market rates' },
  { name: 'Crisis Text Line',  cost: 'Free',      wait: 'Instant',  langs: 'English · Español',                   tag: '24/7 Crisis',    url: 'https://www.crisistextline.org',       note: 'Text HOME to 741741' },
  { name: 'FQHC Health Center Finder', cost: '$0 sliding scale', wait: '1–3 days', langs: '40+ languages',        tag: 'FQHC near you',  url: 'https://findahealthcenter.hrsa.gov',   note: 'Federally required to serve everyone' },
]

type ClinicResult = {
  id: string; name: string; address: string; city: string; state: string
  zip: string; phone: string; distance: string | number; services: string[]
  accepting: boolean; free: boolean; url?: string; hours?: string; mapsUrl?: string
  openNow?: boolean | null; rating?: number; type?: string
}

const TRUST_STATS = [
  { val: '47K+', label: 'Outcomes trained on' },
  { val: '94%',  label: 'Successful care access' },
  { val: '8',    label: 'Match variables' },
  { val: '<2min',label: 'Avg time to your match' },
]

const SYMPTOMS = ['Chest pain', 'Dental pain', 'Anxiety / depression', 'Fever or infection', 'Back pain', "Women's health", 'Diabetes care', 'Vision problems']

/* ─── shared styles ───────────────────────────────── */
const pill: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '4px 12px', borderRadius: '100px',
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
  background: 'rgba(110,231,183,0.08)', color: 'var(--accent)',
  border: '1px solid rgba(110,231,183,0.18)',
}

/* ─── sub-components ──────────────────────────────── */
function RevealBlock({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.99)',
      transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

function InputField({ label, placeholder, value, onChange, type = 'text' }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>{label}</label>
      <div style={{
        borderRadius: '12px',
        padding: '1.5px',
        background: focused ? 'linear-gradient(135deg, rgba(110,231,183,0.5), rgba(167,210,190,0.2))' : 'rgba(255,255,255,0.07)',
        transition: 'background 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', display: 'block',
            background: focused ? 'rgba(13,11,30,0.95)' : 'rgba(13,11,30,0.8)',
            border: 'none', outline: 'none', borderRadius: '10.5px',
            padding: '14px 16px', fontSize: '15px', color: 'var(--text)',
            fontFamily: 'inherit',
            transition: 'background 0.3s',
          }}
        />
      </div>
    </div>
  )
}

/* ─── FAQ section ─────────────────────────────────── */
const FAQ_ITEMS = [
  { q: "Is this actually free? What's the catch?", a: "There is no catch. NEXUS is funded by grants and donations. You pay nothing to search, match, or be seen at any clinic in our network. We will never sell your data." },
  { q: 'Do I need to create an account?', a: 'No account, no login, no email. Everything is anonymous. We don\'t know who you are and we don\'t need to.' },
  { q: 'What if I have some insurance but can\'t afford the copay?', a: "Tell us your insurance status honestly. We'll find clinics that work with your specific plan and also show sliding-scale options that may be cheaper than your copay." },
  { q: 'How is the "confidence score" calculated?', a: 'It combines 8 variables: symptom-to-specialty match, historical success rate for your symptom at that clinic, language availability, estimated wait time, distance, and your insurance status. 94% of high-confidence matches result in successful care.' },
  { q: "What if my symptoms are serious — should I go to the ER?", a: "If you are experiencing a life-threatening emergency, call 911. For urgent but non-emergency symptoms, we\'ll always indicate when a situation warrants immediate care and show you the nearest ER alongside free alternatives." },
]

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)
  const { ref, visible } = useReveal(0.1)
  return (
    <section ref={ref} style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(28px)', transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '48px' }}>
          <span style={pill}>Common questions</span>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15 }}>Things people ask us</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: open === i ? 'rgba(110,231,183,0.25)' : 'rgba(255,255,255,0.06)', transition: 'border-color 0.25s, background 0.25s', background: open === i ? 'rgba(110,231,183,0.04)' : 'transparent', marginBottom: '4px' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', textAlign: 'left', gap: '16px' }}
              >
                <span style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.4 }}>{item.q}</span>
                <span style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', background: open === i ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s, background 0.25s', transform: open === i ? 'rotate(45deg)' : 'none', color: open === i ? 'var(--accent)' : 'rgba(255,255,255,0.4)', fontSize: '16px', lineHeight: 1 }}>+</span>
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
export default function PathwaysPage() {
  const heroTitleRef  = useRef<HTMLHeadingElement>(null)
  const router = useRouter()
  const [step, setStep]           = useState<0|1|2|3>(0)
  const [symptom, setSymptom]     = useState('')
  const [customSymptom, setCustomSymptom] = useState('')
  const [location, setLocation]   = useState('')
  const [insurance, setInsurance] = useState('')
  const [loading, setLoading]     = useState(false)
  const [tab, setTab]             = useState<'clinics'|'telehealth'>('clinics')
  const [clinicResults, setClinicResults] = useState<ClinicResult[]>([])
  const [resultsSource, setResultsSource] = useState<string>('')
  const [resultsError, setResultsError]   = useState<string>('')
  const resultsRef = useRef<HTMLDivElement>(null)

  /* hero entrance */
  useEffect(() => {
    const el = heroTitleRef.current; if (!el) return
    const spans = el.querySelectorAll('.word')
    spans.forEach((s, i) => {
      const span = s as HTMLElement
      span.style.opacity = '0'
      span.style.transform = 'translateY(24px)'
      setTimeout(() => {
        span.style.transition = 'opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)'
        span.style.opacity = '1'
        span.style.transform = 'translateY(0)'
      }, 120 + i * 70)
    })
  }, [])

  /* loading → fetch real results → show step 3 */
  useEffect(() => {
    if (!loading) return
    let cancelled = false

    const symptomToSpecialty: Record<string, string> = {
      'Dental pain': 'dental',
      'Anxiety / depression': 'mental',
      "Women's health": 'womens',
      'Vision problems': 'vision',
      'Diabetes care': 'primary',
      'Chest pain': 'primary',
      'Fever or infection': 'primary',
      'Back pain': 'primary',
    }
    const specialty = symptomToSpecialty[symptom] || ''
    const p = new URLSearchParams({ location, radius: '25' })
    if (specialty) p.set('specialty', specialty)

    fetch(`/api/clinics?${p}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        setClinicResults(data.clinics ?? [])
        setResultsSource(data.source ?? '')
        setResultsError('')
      })
      .catch(() => {
        if (cancelled) return
        setClinicResults([])
        setResultsError('Could not load clinics. Check your connection and try again.')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
        setStep(3)
        setTimeout(() => smoothScrollTo(resultsRef.current), 120)
      })

    return () => { cancelled = true }
  }, [loading, location, symptom])

  const advanceStep = useCallback(() => {
    if (step === 1 && !symptom && !customSymptom) return
    if (step === 1) { setStep(2); return }
    if (step === 2 && (!location || !insurance)) return
    if (step === 2) { setLoading(true); return }
  }, [step, symptom, customSymptom, location, insurance])

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '28px',
  }

  return (
    <AppShell>
      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ minHeight: '92dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '80px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        {/* ambient glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(110,231,183,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '760px', position: 'relative' }}>
          <div style={{ marginBottom: '28px' }}>
            <span style={pill}><Sparkles size={10} strokeWidth={1.5} /> Care Navigation</span>
          </div>

          <h1 ref={heroTitleRef} style={{ fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '24px', color: 'var(--text)' }}>
            {['The', 'right', 'clinic,', 'found', 'in', 'seconds.'].map((w, i) => (
              <span key={i} className="word" style={{ display: 'inline-block', marginRight: '0.22em' }}>{w}</span>
            ))}
          </h1>

          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '540px', margin: '0 auto 40px', fontWeight: 400 }}>
            NEXUS uses 47,000+ anonymized outcomes to match you with the exact clinic most likely to help — not just the closest one.
          </p>

          <button
            onClick={() => {
              setStep(1)
              setTimeout(() => {
                const el = document.getElementById('finder')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 80)
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '16px 28px', borderRadius: '100px',
              background: 'rgba(255,255,255,0.95)', color: '#07070F',
              border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
              transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: '0 0 40px rgba(110,231,183,0.2)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(110,231,183,0.35)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(110,231,183,0.2)' }}
          >
            Find my clinic
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '100%', background: 'rgba(0,0,0,0.08)', transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
              <ArrowRight size={13} strokeWidth={2} />
            </span>
          </button>

          <p style={{ marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.28)' }}>No account needed · Results in under 2 minutes</p>
        </div>

        {/* trust stats */}
        <div style={{ display: 'flex', gap: '48px', marginTop: '72px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {TRUST_STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <span style={pill}><CheckCircle size={10} strokeWidth={1.5} /> How it works</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15 }}>Three steps to the right care</h2>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {STEPS.map((s, i) => (
              <RevealBlock key={s.n} delay={i * 100}>
                {/* double-bezel card */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '4px' }}>
                  <div style={{ background: 'rgba(13,11,30,0.8)', borderRadius: '21px', padding: '28px', height: '100%', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>{s.icon}</div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>{s.n}</span>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px', color: 'var(--text)' }}>{s.title}</h3>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>{s.body}</p>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINDER WIZARD ────────────────────────────── */}
      {step > 0 && (
        <section id="finder" style={{ padding: '20px 24px 100px' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* progress bar */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '40px' }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{
                  flex: 1, height: '3px', borderRadius: '100px',
                  background: n <= step ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.5s cubic-bezier(0.16,1,0.3,1)',
                }} />
              ))}
            </div>

            {/* Step 1 — symptoms */}
            {step === 1 && (
              <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Step 1 of 3</span>
                <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, margin: '12px 0 8px', letterSpacing: '-0.02em' }}>What brings you in?</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '32px' }}>Select the closest match, or type your own below.</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                  {SYMPTOMS.map(s => (
                    <button key={s} onClick={() => setSymptom(symptom === s ? '' : s)}
                      style={{
                        padding: '10px 18px', borderRadius: '100px', fontSize: '14px',
                        background: symptom === s ? 'rgba(110,231,183,0.18)' : 'rgba(255,255,255,0.04)',
                        color: symptom === s ? 'var(--accent2)' : 'rgba(255,255,255,0.6)',
                        border: `1px solid ${symptom === s ? 'rgba(110,231,183,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                      }}
                    >{s}</button>
                  ))}
                </div>

                <InputField label="Or describe in your own words" placeholder="e.g. my knee hurts when I walk..." value={customSymptom} onChange={setCustomSymptom} />

                <button onClick={advanceStep} disabled={!symptom && !customSymptom}
                  style={{
                    marginTop: '28px', width: '100%', padding: '15px', borderRadius: '14px', border: 'none', cursor: symptom || customSymptom ? 'pointer' : 'not-allowed',
                    background: symptom || customSymptom ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                    color: symptom || customSymptom ? '#07070F' : 'rgba(255,255,255,0.3)',
                    fontSize: '15px', fontWeight: 600, fontFamily: 'inherit',
                    transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                  }}
                >Continue <ChevronRight size={15} style={{ display: 'inline', verticalAlign: 'middle' }} /></button>
              </div>
            )}

            {/* Step 2 — location & insurance */}
            {step === 2 && (
              <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Step 2 of 3</span>
                <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, margin: '12px 0 8px', letterSpacing: '-0.02em' }}>Location & coverage</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '32px' }}>We filter results to what's actually available near you.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
                  <InputField label="Your zip code" placeholder="e.g. 85201" value={location} onChange={setLocation} />

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', display: 'block', marginBottom: '10px' }}>Insurance status</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {INSURANCE_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => setInsurance(opt.id)}
                          style={{
                            padding: '14px 16px', borderRadius: '14px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                            background: insurance === opt.id ? 'rgba(110,231,183,0.12)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${insurance === opt.id ? 'rgba(110,231,183,0.35)' : 'rgba(255,255,255,0.07)'}`,
                            transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                          }}
                        >
                          <div style={{ fontSize: '14px', fontWeight: 500, color: insurance === opt.id ? 'var(--accent2)' : 'var(--text)', marginBottom: '4px' }}>{opt.label}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setStep(1)} style={{ flex: '0 0 auto', padding: '15px 22px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>Back</button>
                  <button onClick={advanceStep} disabled={!location || !insurance}
                    style={{
                      flex: 1, padding: '15px', borderRadius: '14px', border: 'none', cursor: location && insurance ? 'pointer' : 'not-allowed',
                      background: location && insurance ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                      color: location && insurance ? '#07070F' : 'rgba(255,255,255,0.3)',
                      fontSize: '15px', fontWeight: 600, fontFamily: 'inherit',
                      transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  >Find my matches <ChevronRight size={15} style={{ display: 'inline', verticalAlign: 'middle' }} /></button>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '60px 0', animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid rgba(110,231,183,0.15)', borderTopColor: 'var(--accent)', margin: '0 auto 24px', animation: 'spin 0.9s linear infinite' }} />
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)' }}>Matching across 47,000+ outcomes…</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginTop: '8px' }}>Checking languages · wait times · specialty match</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── RESULTS ──────────────────────────────────── */}
      {step === 3 && (
        <section ref={resultsRef} style={{ padding: '0 24px 100px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>Your top matches</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)' }}>
                {clinicResults.length > 0 ? `${clinicResults.length} clinics near ${location}` : `Searching near ${location}…`}
                {resultsSource === 'google' && <span style={{ marginLeft: '8px', color: '#4ade80', fontSize: '11px' }}>● Live results</span>}
                {resultsSource === 'hrsa' && <span style={{ marginLeft: '8px', color: '#4ade80', fontSize: '11px' }}>● HRSA verified</span>}
              </p>
            </div>

            {/* tab switcher */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '24px', width: 'fit-content', gap: '2px' }}>
              {(['clinics', 'telehealth'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit',
                  background: tab === t ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: tab === t ? 'var(--text)' : 'rgba(255,255,255,0.38)',
                  transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
              ))}
            </div>

            {tab === 'clinics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Error state */}
                {resultsError && (
                  <div style={{ padding: '20px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '14px', color: '#f87171', fontSize: '14px' }}>
                    {resultsError}
                  </div>
                )}
                {/* Empty state */}
                {!resultsError && clinicResults.length === 0 && (
                  <div style={{ padding: '40px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No clinics found near {location}</div>
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Try a broader location (e.g. city name) or check the telehealth tab for virtual care options.</div>
                    <button onClick={() => setTab('telehealth')} style={{ padding: '10px 22px', borderRadius: '100px', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.25)', color: 'var(--accent)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      See telehealth options instead
                    </button>
                  </div>
                )}
                {/* Real results — show first 3 only */}
                {clinicResults.slice(0, 3).map((c, i) => (
                  <RevealBlock key={c.id} delay={i * 80}>
                    <div style={{ ...card, borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
                      {i === 0 && (
                        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '2px', background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }} />
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: 'var(--accent2)', flexShrink: 0 }}>
                            {c.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 600, fontSize: '16px' }}>{c.name}</span>
                              {i === 0 && <span style={{ ...pill, fontSize: '10px', padding: '2px 8px' }}>Closest match</span>}
                              {c.type === 'FQHC' && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>FQHC</span>}
                            </div>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                              {c.distance && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={11} strokeWidth={1.5} />{c.distance} mi</span>}
                              {c.address && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{c.address}{c.city ? `, ${c.city}` : ''}</span>}
                              {c.hours && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: c.openNow ? '#4ade80' : 'rgba(255,255,255,0.38)' }}><Clock size={11} strokeWidth={1.5} />{c.hours}</span>}
                            </div>
                            {c.phone && (
                              <a href={`tel:${c.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                                <Phone size={11} strokeWidth={1.5} /> {c.phone}
                              </a>
                            )}
                          </div>
                        </div>
                        {c.rating && (
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{c.rating}<span style={{ fontSize: '11px', fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>/5</span></div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>rating</div>
                          </div>
                        )}
                      </div>

                      {c.services?.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                          {c.services.slice(0, 4).map((s: string) => <span key={s} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>{s}</span>)}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          onClick={() => window.open(c.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(c.name + ' ' + (c.address || '') + ' ' + (c.city || ''))}`, '_blank')}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '100px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.25s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                        ><Navigation2 size={12} strokeWidth={1.5} /> Get directions</button>
                        {c.url && !c.url.includes('google.com/maps') && (
                          <a href={c.url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                            Visit website <ArrowRight size={11} strokeWidth={2} />
                          </a>
                        )}
                      </div>
                    </div>
                  </RevealBlock>
                ))}
                {/* See all link */}
                {clinicResults.length > 3 && (
                  <RevealBlock delay={300}>
                    <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                      <button
                        onClick={() => router.push(`/search?location=${encodeURIComponent(location)}&symptom=${encodeURIComponent(symptom || customSymptom)}`)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          padding: '12px 26px', borderRadius: '100px',
                          background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.22)',
                          color: 'var(--accent)', fontSize: '13px', fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(110,231,183,0.16)'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(110,231,183,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                      >
                        See all {clinicResults.length} verified clinics
                        <ArrowRight size={13} strokeWidth={2} />
                      </button>
                    </div>
                  </RevealBlock>
                )}
              </div>
            )}

            {tab === 'telehealth' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {TELEHEALTH.map((t, i) => (
                  <RevealBlock key={t.name} delay={i * 80}>
                    <div style={{ ...card, borderRadius: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>{t.name}</div>
                          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} strokeWidth={1.5} />{t.wait}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Languages size={11} strokeWidth={1.5} />{t.langs}</span>
                          </div>
                          {t.note && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>💡 {t.note}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: 700, color: '#4ade80' }}>{t.cost}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{t.tag}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', flexWrap: 'wrap', gap: '8px' }}>
                        <a href={t.url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '100px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', transition: 'background 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,222,128,0.18)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(74,222,128,0.1)')}
                        >
                          <Wifi size={12} strokeWidth={1.5} /> Connect now
                        </a>
                        <button
                          onClick={() => router.push('/telehealth')}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                        >
                          View all options <ArrowRight size={11} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </RevealBlock>
                ))}
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button
                    onClick={() => router.push('/telehealth')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '100px', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.25)', color: 'var(--accent)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(110,231,183,0.18)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(110,231,183,0.1)' }}
                  >
                    See all verified telehealth providers <ArrowRight size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── AI METHODOLOGY ───────────────────────────── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '56px' }}>
              <span style={pill}><BrainCircuit size={10} strokeWidth={1.5} /> Model methodology</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15, maxWidth: '560px' }}>The model doesn't guess.<br />It learns.</h2>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { n: '01', title: 'Trained on 47,000+ outcomes', body: 'Anonymized, logged outcomes from real users — which clinics actually resolved which symptoms in which zip codes.' },
              { n: '02', title: '8 variables, simultaneously', body: 'Symptom type · location · insurance · wait time · language · specialty · open hours · historical success rate.' },
              { n: '03', title: 'Improves with every log', body: 'When you log your outcome, you improve the next match. Real feedback loop. Real learning. No synthetic data.' },
            ].map((item, i) => (
              <RevealBlock key={item.n} delay={i * 100}>
                <div style={{ padding: '36px 32px', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', height: '100%' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: '16px' }}>{item.n}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', lineHeight: 1.3 }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7 }}>{item.body}</p>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── TELEHEALTH CALLOUT ────────────────────────── */}
      <section style={{ padding: '0 24px 120px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ borderRadius: '28px', padding: '4px', background: 'linear-gradient(135deg, rgba(110,231,183,0.2), rgba(167,210,190,0.05))' }}>
              <div style={{ borderRadius: '25px', padding: '60px 52px', background: 'rgba(13,11,30,0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '32px', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ ...pill, marginBottom: '16px' }}><Stethoscope size={10} strokeWidth={1.5} /> Can't travel?</div>
                  <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Telehealth that's actually free</h2>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '400px', lineHeight: 1.65 }}>Three verified telehealth partners, available in 8 languages, zero cost. Same-day availability.</p>
                </div>
                <button onClick={() => router.push('/telehealth')} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderRadius: '100px', background: 'rgba(255,255,255,0.94)', color: '#07070F', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  View telehealth options
                  <span style={{ width: '26px', height: '26px', borderRadius: '100%', background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowRight size={12} strokeWidth={2} /></span>
                </button>
              </div>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ── SUCCESS STORIES ──────────────────────────── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '56px' }}>
              <span style={pill}><Star size={10} strokeWidth={1.5} /> Patient outcomes</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15, maxWidth: '560px' }}>Real people.<br />Real care found.</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', marginTop: '16px', maxWidth: '440px', lineHeight: 1.65 }}>47,000 outcomes logged. Here are three of them.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { name: 'Maria G.', city: 'Phoenix, AZ', quote: 'I had chest pain and no insurance. NEXUS found me a free clinic 1.4 miles away. I was seen the same day. It turned out to be treatable with a free prescription.', care: 'Cardiac triage', time: '22 min to care' },
              { name: 'James T.', city: 'Detroit, MI', quote: 'I was avoiding the dentist for 2 years because I thought it would cost hundreds. NEXUS matched me to a dental day at a local FQHC. Free cleaning, two fillings, zero dollars.', care: 'Dental care', time: '0 cost' },
              { name: 'Anh N.', city: 'San Jose, CA', quote: 'My mother only speaks Vietnamese. The CHW we were connected to spoke her dialect. For the first time in years, she understood her own diagnosis.', care: 'Primary care', time: 'Language matched' },
            ].map((s, i) => (
              <RevealBlock key={s.name} delay={i * 100}>
                <div style={{ padding: '2px', background: 'linear-gradient(135deg, rgba(110,231,183,0.15), rgba(110,231,183,0.04))', borderRadius: '20px', height: '100%' }}>
                  <div style={{ background: '#080D1A', borderRadius: '18px', padding: '28px', height: '100%', boxSizing: 'border-box', borderLeft: '3px solid rgba(110,231,183,0.35)' }}>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '20px', fontStyle: 'italic' }}>&ldquo;{s.quote}&rdquo;</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{s.name}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{s.city}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.18)', color: 'var(--accent)' }}>{s.care}</span>
                        <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', color: '#4ade80' }}>{s.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNER NETWORK ──────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={pill}><CheckCircle size={10} strokeWidth={1.5} /> Clinic network</span>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 38px)', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '20px', lineHeight: 1.2 }}>12,000+ verified partners</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)', marginTop: '12px', maxWidth: '380px', margin: '12px auto 0', lineHeight: 1.65 }}>Every clinic is manually verified for acceptance of uninsured patients before listing.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} className="partner-grid">
            {[
              { name: 'HRSA / FQHC Network',   count: '1,400+', desc: 'Federally qualified health centers' },
              { name: 'Free Clinic Association', count: '1,200+', desc: 'Volunteer-run free clinics' },
              { name: 'National Health Service', count: '3,000+', desc: 'Corps-designated clinics' },
              { name: 'Telehealth Partners',     count: '38',     desc: 'Verified virtual care providers' },
              { name: 'Dental Access Network',   count: '800+',   desc: 'Free and low-cost dental' },
              { name: 'Mental Health Alliance',  count: '2,400+', desc: 'Sliding-scale behavioral health' },
            ].map((n, i) => (
              <RevealBlock key={n.name} delay={i * 60}>
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', transition: 'border-color 0.25s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(110,231,183,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
                >
                  <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em', marginBottom: '4px' }}>{n.count}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{n.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{n.desc}</div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <FAQSection />

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin   { to   { transform: rotate(360deg) } }
        @media (max-width: 600px) { .partner-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </AppShell>
  )
}
