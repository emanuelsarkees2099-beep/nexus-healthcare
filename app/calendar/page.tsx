'use client'
import { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { smoothScrollTo } from '@/utils/smoothScroll'
import { CalendarDays, Bell, MapPin, Clock, ChevronRight, User, Activity, Shield, Stethoscope, AlertTriangle, CheckCircle, ArrowRight, Sparkles, Heart } from 'lucide-react'

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

function RevealBlock({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</div>
  )
}

/* ─── field component ─────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>{label}</label>
      {children}
    </div>
  )
}

function InputField({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ borderRadius: '12px', padding: '1.5px', background: focused ? 'linear-gradient(135deg, rgba(110,231,183,0.5), rgba(167,210,190,0.2))' : 'rgba(255,255,255,0.07)', transition: 'background 0.3s' }}>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ width: '100%', display: 'block', background: focused ? 'rgba(13,11,30,0.97)' : 'rgba(13,11,30,0.85)', border: 'none', outline: 'none', borderRadius: '10.5px', padding: '13px 15px', fontSize: '15px', color: 'var(--text)', fontFamily: 'inherit', transition: 'background 0.3s' }}
      />
    </div>
  )
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ borderRadius: '12px', padding: '1.5px', background: focused ? 'linear-gradient(135deg, rgba(110,231,183,0.5), rgba(167,210,190,0.2))' : 'rgba(255,255,255,0.07)', transition: 'background 0.3s' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ width: '100%', display: 'block', background: focused ? 'rgba(13,11,30,0.97)' : 'rgba(13,11,30,0.85)', border: 'none', outline: 'none', borderRadius: '10.5px', padding: '13px 15px', fontSize: '15px', color: value ? 'var(--text)' : 'rgba(255,255,255,0.35)', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none', transition: 'background 0.3s' }}
      >
        {options.map(o => <option key={o} value={o} style={{ background: '#0D0B1E' }}>{o}</option>)}
      </select>
    </div>
  )
}

/* ─── data ────────────────────────────────────────── */
type Screening = {
  name: string; freq: string; lastDone: string; due: string; status: 'due' | 'upcoming' | 'done'; priority: 'high' | 'medium' | 'low'; icon: React.ReactNode; link: string
}

function buildScreenings(age: string, sex: string, lastCheckup: string, conditions: string[]): Screening[] {
  const ageN = parseInt(age) || 30
  const screenings: Screening[] = []
  const hadRecentCheckup = lastCheckup === 'Within 1 year'
  const hadCheckup2yr    = lastCheckup === '1–2 years ago'
  const longOverdue      = lastCheckup === '3+ years ago' || lastCheckup === 'Never'

  // Annual physical / wellness visit
  const physicalStatus: Screening['status'] = hadRecentCheckup ? 'upcoming' : longOverdue ? 'due' : 'upcoming'
  const physicalDue = hadRecentCheckup ? '1 year from last visit' : longOverdue ? 'Schedule now' : 'Within 6 months'
  screenings.push({ name: 'Annual wellness visit', freq: 'Annually', lastDone: hadRecentCheckup ? 'Within 1 year' : 'Unknown', due: physicalDue, status: physicalStatus, priority: 'medium', icon: <Stethoscope size={14} strokeWidth={1.5} />, link: '/pathways' })

  // Blood pressure — every year 18+
  const bpStatus: Screening['status'] = hadRecentCheckup ? 'upcoming' : 'due'
  screenings.push({ name: 'Blood pressure check', freq: 'Annually', lastDone: hadRecentCheckup ? 'Within 1 year' : 'Unknown', due: hadRecentCheckup ? '1 year from last visit' : 'Schedule now', status: bpStatus, priority: 'medium', icon: <Activity size={14} strokeWidth={1.5} />, link: '/pathways' })

  // Cholesterol — every 4–6 years 20+, sooner with risk factors
  if (ageN >= 20) {
    const hasHeartRisk = conditions.includes('Heart disease')
    const cholStatus: Screening['status'] = (longOverdue || hasHeartRisk) ? 'due' : 'upcoming'
    screenings.push({ name: 'Cholesterol panel', freq: hasHeartRisk ? 'Annually (high risk)' : 'Every 4–6 years', lastDone: 'Unknown', due: hasHeartRisk || longOverdue ? 'Schedule now' : 'Within 2 years', status: cholStatus, priority: hasHeartRisk ? 'high' : 'medium', icon: <Shield size={14} strokeWidth={1.5} />, link: '/pathways' })
  }

  // Diabetes — 35+ or overweight/metabolic risk
  if (ageN >= 35 || conditions.includes('Diabetes')) {
    const diabStatus: Screening['status'] = conditions.includes('Diabetes') ? 'due' : longOverdue ? 'due' : 'upcoming'
    screenings.push({ name: 'Diabetes screening (A1C)', freq: conditions.includes('Diabetes') ? 'Every 3–6 months' : 'Every 3 years', lastDone: 'Unknown', due: diabStatus === 'due' ? 'Schedule now' : 'Within 1 year', status: diabStatus, priority: conditions.includes('Diabetes') ? 'high' : 'medium', icon: <AlertTriangle size={14} strokeWidth={1.5} />, link: '/pathways' })
  }

  // Female-specific
  if (sex === 'Female' || sex === 'Prefer not to say') {
    if (ageN >= 21) {
      const papStatus: Screening['status'] = (longOverdue || hadCheckup2yr) ? 'due' : 'upcoming'
      screenings.push({ name: 'Pap smear / HPV test', freq: 'Every 3 years (21–65)', lastDone: 'Unknown', due: papStatus === 'due' ? 'Schedule now' : 'Within 1–2 years', status: papStatus, priority: 'high', icon: <Heart size={14} strokeWidth={1.5} />, link: '/pathways' })
    }
    if (ageN >= 40) {
      screenings.push({ name: 'Mammogram', freq: 'Annually (40+)', lastDone: 'Unknown', due: 'Schedule now', status: 'due', priority: 'high', icon: <Heart size={14} strokeWidth={1.5} />, link: '/pathways' })
    }
  }

  // Colorectal — 45+
  if (ageN >= 45) {
    screenings.push({ name: 'Colorectal cancer screen', freq: 'Every 10 years (colonoscopy)', lastDone: 'Unknown', due: 'Schedule this year', status: 'due', priority: 'high', icon: <Activity size={14} strokeWidth={1.5} />, link: '/pathways' })
  }

  // Flu vaccine — everyone 6 months+
  const fluStatus: Screening['status'] = hadRecentCheckup ? 'upcoming' : 'due'
  screenings.push({ name: 'Flu vaccine', freq: 'Annually (every fall)', lastDone: hadRecentCheckup ? 'Recent' : 'Unknown', due: 'This coming October', status: fluStatus, priority: 'medium', icon: <Shield size={14} strokeWidth={1.5} />, link: '/pathways' })

  // Dental — everyone
  screenings.push({ name: 'Dental cleaning', freq: 'Every 6 months', lastDone: 'Unknown', due: 'Schedule now', status: 'due', priority: 'medium', icon: <CheckCircle size={14} strokeWidth={1.5} />, link: '/pathways' })

  // Vision — 18+
  screenings.push({ name: 'Vision exam', freq: 'Every 1–2 years', lastDone: 'Unknown', due: 'Within 1–2 years', status: 'upcoming', priority: 'low', icon: <User size={14} strokeWidth={1.5} />, link: '/pathways' })

  return screenings
}

const FREE_EVENTS = [
  { title: 'Community Health Fair', date: 'Sat Apr 19', time: '9am – 2pm', loc: 'Eastlake Community Center', tags: ['Free screenings', 'Flu shots', 'Dental'], badge: 'Free' },
  { title: 'Women\'s Wellness Day', date: 'Sat Apr 26', time: '10am – 1pm', loc: 'Valle del Sol Health Center', tags: ['Mammograms', 'Pap smears', 'Labs'], badge: 'Free' },
  { title: 'Diabetes Awareness Clinic', date: 'Thu May 1',  time: '1pm – 5pm',  loc: 'Mountain Park Health', tags: ['A1C test', 'Nutrition consult'], badge: 'Sliding scale' },
  { title: 'Blood Pressure Sunday', date: 'Sun May 4',  time: '11am – 3pm', loc: 'Phoenix Central Library', tags: ['BP check', 'Cholesterol', 'No appointment'], badge: 'Free' },
]

const WHY_ITEMS = [
  { title: 'Tailored to your profile',   body: 'We don\'t give you a generic list. Your age, sex, and history determine exactly what you need and when.' },
  { title: 'Free clinics only',          body: 'Every appointment we surface is at a free or sliding-scale clinic verified for your zip code.' },
  { title: 'Reminders that actually work', body: 'Set email or SMS reminders tied to your specific screenings — not generic health tips.' },
]

/* ─── page ────────────────────────────────────────── */
export default function CalendarPage() {
  const [step, setStep]           = useState<'form' | 'timeline'>('form')
  const [age, setAge]             = useState('')
  const [sex, setSex]             = useState('Select')
  const [lastCheckup, setLastCheckup] = useState('Select')
  const [conditions, setConditions] = useState<string[]>([])
  const [zip, setZip]             = useState('')
  const [remEmail, setRemEmail]   = useState('')
  const [remFreq, setRemFreq]     = useState('Monthly')
  const [remSet, setRemSet]       = useState(false)
  const timelineRef               = useRef<HTMLDivElement>(null)
  const formRef                   = useRef<HTMLElement>(null)

  const screenings = step === 'timeline' ? buildScreenings(age, sex, lastCheckup, conditions) : []
  const due = screenings.filter(s => s.status === 'due')
  const upcoming = screenings.filter(s => s.status === 'upcoming')
  const done = screenings.filter(s => s.status === 'done')

  const CONDITION_OPTIONS = ['Diabetes', 'Hypertension', 'Heart disease', 'Asthma / COPD', 'Cancer history', 'Mental health', 'None of these']

  function toggleCondition(c: string) {
    if (c === 'None of these') { setConditions(['None of these']); return }
    const updated = conditions.includes(c) ? conditions.filter(x => x !== c) : [...conditions.filter(x => x !== 'None of these'), c]
    setConditions(updated)
  }

  function generate() {
    if (!age || sex === 'Select') return
    setStep('timeline')
    setTimeout(() => smoothScrollTo(timelineRef.current), 100)
  }

  const pill: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '4px 12px', borderRadius: '100px',
    fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
    background: 'rgba(110,231,183,0.08)', color: 'var(--accent)', border: '1px solid rgba(110,231,183,0.18)',
  }

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px',
  }

  const statusMeta = {
    due:      { label: 'Overdue',  bg: 'rgba(248,113,113,0.1)',  color: '#f87171', border: 'rgba(248,113,113,0.25)' },
    upcoming: { label: 'Upcoming', bg: 'rgba(251,191,36,0.08)',  color: '#fbbf24', border: 'rgba(251,191,36,0.2)'  },
    done:     { label: 'Done',     bg: 'rgba(74,222,128,0.08)',  color: '#4ade80', border: 'rgba(74,222,128,0.2)'  },
  }

  return (
    <AppShell>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ minHeight: '85dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '80px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(110,231,183,0.11) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '720px', position: 'relative' }}>
          <div style={{ marginBottom: '28px' }}>
            <span style={pill}><CalendarDays size={10} strokeWidth={1.5} /> Preventive care</span>
          </div>
          <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '22px', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
            Your health calendar,<br />built around you.
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '500px', margin: '0 auto 40px', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 120ms both' }}>
            Most people skip preventive screenings because they don't know what they need or where to go. We fix both.
          </p>
          <div style={{ display: 'flex', gap: '36px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 200ms both' }}>
            {[{ v: '100%', l: 'Free to use' }, { v: '12K+', l: 'Free clinics indexed' }, { v: '60s', l: 'Setup time' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>{s.v}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ──────────────────────────────────────── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              {WHY_ITEMS.map((w, i) => (
                <div key={w.title} style={{ padding: '30px 28px', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', lineHeight: 1.3 }}>{w.title}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{w.body}</p>
                </div>
              ))}
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ── PROFILE FORM ─────────────────────────────── */}
      <section ref={formRef} id="cal-form" style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={pill}><User size={10} strokeWidth={1.5} /> Your profile</span>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', marginBottom: '10px' }}>
                Build your screening plan
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>
                Three fields. That's it. No account, no login.
              </p>
            </div>

            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Age">
                  <InputField value={age} onChange={setAge} placeholder="e.g. 42" type="number" />
                </Field>
                <Field label="Biological sex">
                  <SelectField value={sex} onChange={setSex} options={['Select', 'Male', 'Female', 'Prefer not to say']} />
                </Field>
              </div>

              <Field label="When did you last have a medical check-up?">
                <SelectField value={lastCheckup} onChange={setLastCheckup} options={['Select', 'Within 1 year', '1–2 years ago', '2–3 years ago', '3+ years ago', 'Never']} />
              </Field>

              <Field label="Your zip code">
                <InputField value={zip} onChange={setZip} placeholder="e.g. 85201" />
              </Field>

              <Field label="Any existing conditions? (optional)">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CONDITION_OPTIONS.map(c => (
                    <button key={c} onClick={() => toggleCondition(c)}
                      style={{
                        padding: '8px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                        background: conditions.includes(c) ? 'rgba(110,231,183,0.14)' : 'rgba(255,255,255,0.04)',
                        color: conditions.includes(c) ? 'var(--accent2)' : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${conditions.includes(c) ? 'rgba(110,231,183,0.35)' : 'rgba(255,255,255,0.07)'}`,
                        transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                      }}
                    >{c}</button>
                  ))}
                </div>
              </Field>

              <button
                onClick={generate}
                disabled={!age || sex === 'Select'}
                style={{
                  padding: '15px', borderRadius: '14px', border: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: 600,
                  cursor: age && sex !== 'Select' ? 'pointer' : 'not-allowed',
                  background: age && sex !== 'Select' ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                  color: age && sex !== 'Select' ? '#07070F' : 'rgba(255,255,255,0.25)',
                  transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                Generate my screening plan <ChevronRight size={15} />
              </button>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ── SCREENING TIMELINE ───────────────────────── */}
      {step === 'timeline' && (
        <section ref={timelineRef} style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <RevealBlock>
              <div style={{ marginBottom: '36px' }}>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>Your screening plan</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)' }}>
                  Based on age {age} · {sex} · {zip || 'No zip entered'}
                  &nbsp;&nbsp;·&nbsp;&nbsp;
                  <button onClick={() => setStep('form')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '14px', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Edit profile</button>
                </p>
              </div>
            </RevealBlock>

            {/* summary badges */}
            <RevealBlock delay={50}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                {[{ count: due.length, label: 'Overdue', color: '#f87171', bg: 'rgba(248,113,113,0.08)' }, { count: upcoming.length, label: 'Upcoming', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' }, { count: done.length, label: 'Up to date', color: '#4ade80', bg: 'rgba(74,222,128,0.08)' }].map(b => (
                  <div key={b.label} style={{ padding: '10px 18px', borderRadius: '12px', background: b.bg, border: `1px solid ${b.color}25`, display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: b.color, letterSpacing: '-0.02em' }}>{b.count}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </RevealBlock>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '52px' }}>
              {screenings.map((s, i) => {
                const meta = statusMeta[s.status]
                return (
                  <RevealBlock key={s.name} delay={i * 50}>
                    <div style={{ ...card, padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${meta.color}15`, border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, flexShrink: 0 }}>{s.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 600, fontSize: '15px' }}>{s.name}</span>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '100px', background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>{meta.label}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} strokeWidth={1.5} />{s.freq}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarDays size={10} strokeWidth={1.5} />Due: {s.due}</span>
                        </div>
                      </div>
                      {s.status !== 'done' && (
                        <a href={s.link} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        >Find clinic <ChevronRight size={11} strokeWidth={2} /></a>
                      )}
                    </div>
                  </RevealBlock>
                )
              })}
            </div>

            {/* reminder setup */}
            <RevealBlock>
              <div style={{ ...card, background: 'rgba(110,231,183,0.04)', border: '1px solid rgba(110,231,183,0.14)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                    <Bell size={15} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Set up reminders</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}>We'll remind you when screenings are due.</p>
                  </div>
                </div>

                {!remSet ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Field label="Email">
                        <InputField value={remEmail} onChange={setRemEmail} placeholder="you@example.com" />
                      </Field>
                      <Field label="Frequency">
                        <SelectField value={remFreq} onChange={setRemFreq} options={['Monthly', 'Quarterly', 'When due only']} />
                      </Field>
                    </div>
                    <button
                      onClick={() => { if (remEmail) setRemSet(true) }}
                      disabled={!remEmail}
                      style={{
                        padding: '13px', borderRadius: '12px', border: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
                        cursor: remEmail ? 'pointer' : 'not-allowed',
                        background: remEmail ? 'rgba(110,231,183,0.9)' : 'rgba(255,255,255,0.05)',
                        color: remEmail ? '#07070F' : 'rgba(255,255,255,0.25)',
                        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                      }}
                    >Enable reminders</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
                    <CheckCircle size={16} strokeWidth={1.5} style={{ color: '#4ade80' }} />
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>Reminders set for <strong style={{ color: 'var(--text)' }}>{remEmail}</strong> · {remFreq.toLowerCase()}</span>
                  </div>
                )}
              </div>
            </RevealBlock>
          </div>
        </section>
      )}

      {/* ── FREE EVENTS ──────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={pill}><MapPin size={10} strokeWidth={1.5} /> Near you</span>
                <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15 }}>Free screenings this month</h2>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', maxWidth: '240px', lineHeight: 1.6 }}>No appointment needed for most of these events.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '14px' }}>
            {FREE_EVENTS.map((ev, i) => (
              <RevealBlock key={ev.title} delay={i * 70}>
                <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{ev.title}</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarDays size={11} strokeWidth={1.5} />{ev.date}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} strokeWidth={1.5} />{ev.time}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '100px', background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', whiteSpace: 'nowrap' }}>{ev.badge}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={11} strokeWidth={1.5} />{ev.loc}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                    {ev.tags.map(t => <span key={t} style={{ fontSize: '12px', padding: '3px 9px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>{t}</span>)}
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  >Get directions <ArrowRight size={12} strokeWidth={1.5} /></button>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────── */}
      <section style={{ padding: '0 24px 120px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ borderRadius: '28px', padding: '3px', background: 'linear-gradient(135deg, rgba(110,231,183,0.22), rgba(167,210,190,0.06))' }}>
              <div style={{ borderRadius: '26px', padding: '56px 52px', background: 'rgba(10,9,22,0.97)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '28px', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}>
                <div>
                  <span style={pill}><Sparkles size={10} strokeWidth={1.5} /> Stay ahead</span>
                  <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '16px 0 10px', lineHeight: 1.2 }}>Prevention is the cheapest healthcare</h2>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', maxWidth: '420px', lineHeight: 1.65 }}>Most conditions that land people in the ER were preventable with a $0 screening a year earlier. Your plan is ready when you are.</p>
                </div>
                <button
                  onClick={() => { setStep('form'); setTimeout(() => smoothScrollTo(formRef.current), 50) }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderRadius: '100px', background: 'rgba(255,255,255,0.94)', color: '#07070F', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {step === 'timeline' ? 'Update my plan' : 'Build my plan'}
                  <span style={{ width: '26px', height: '26px', borderRadius: '100%', background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowRight size={12} strokeWidth={2} /></span>
                </button>
              </div>
            </div>
          </RevealBlock>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </AppShell>
  )
}
