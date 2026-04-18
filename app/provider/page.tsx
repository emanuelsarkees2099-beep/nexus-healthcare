'use client'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { smoothScrollTo } from '@/utils/smoothScroll'
import { submitForm } from '@/utils/submitForm'
import { Stethoscope, TrendingUp, Users, BarChart2, ArrowRight, CheckCircle, ShieldCheck, DollarSign, Zap, Star, ChevronDown } from 'lucide-react'

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

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const { ref, visible } = useReveal(0.3)
  useEffect(() => {
    if (!visible) return
    const dur = 1800
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, target])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

const pill: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '4px 12px', borderRadius: '100px',
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
  background: 'rgba(109,145,151,0.08)', color: '#6d9197',
  border: '1px solid rgba(109,145,151,0.18)',
}

const card: React.CSSProperties = {
  padding: '2px',
  background: 'linear-gradient(135deg, rgba(109,145,151,0.2), rgba(109,145,151,0.04))',
  borderRadius: '20px',
}

const cardInner: React.CSSProperties = {
  background: '#0d1618',
  borderRadius: '18px',
  padding: '28px',
  height: '100%',
  boxSizing: 'border-box',
}

const METRICS = [
  { label: 'Patients Seen This Month', value: 1247, suffix: '', icon: <Users size={16} strokeWidth={1.5} /> },
  { label: 'Revenue Recovery Rate',   value: 87,   suffix: '%', icon: <DollarSign size={16} strokeWidth={1.5} /> },
  { label: 'Community Health Score',  value: 94,   suffix: '/100', icon: <Star size={16} strokeWidth={1.5} /> },
  { label: 'Appointments Scheduled',  value: 312,  suffix: '', icon: <BarChart2 size={16} strokeWidth={1.5} /> },
]

const FEATURES = [
  {
    icon: <Zap size={20} strokeWidth={1.5} />,
    title: 'Patient Matching Engine',
    desc: "Routes patients who need exactly the services your clinic offers. No more mismatched visits that drain staff time. Our model weighs specialty, language, insurance, and distance.",
    tag: 'AI-powered',
  },
  {
    icon: <DollarSign size={20} strokeWidth={1.5} />,
    title: 'Revenue Recovery Tools',
    desc: "Identify missed billing opportunities, facilitate retroactive Medicaid enrollment, and connect uninsured patients to programs that cover their visit — before they leave.",
    tag: 'Financial',
  },
  {
    icon: <BarChart2 size={20} strokeWidth={1.5} />,
    title: 'Outcome Reporting Suite',
    desc: "HEDIS-aligned outcome tracking, community benefit reporting for non-profit status, and exportable dashboards for grant applications and board reporting.",
    tag: 'Analytics',
  },
]

const STEPS = [
  { n: '01', title: 'Register your clinic', body: 'Submit your clinic profile, service list, and insurance acceptance in under 10 minutes.' },
  { n: '02', title: 'Connect your EHR (optional)', body: 'Optional FHIR integration for real-time availability and scheduling. Works with Epic, Athena, eClinicalWorks.' },
  { n: '03', title: 'Start receiving matched patients', body: 'Patients searching NEXUS near you are routed to your clinic based on availability and specialty match.' },
  { n: '04', title: 'Track outcomes and revenue', body: 'Your provider dashboard shows visit volume, outcomes, revenue recovery, and community impact in real time.' },
]

export default function ProviderPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState({ clinic: '', contact: '', email: '', clinicType: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [words, setWords] = useState<boolean[]>([])

  const TITLE = 'Where clinics meet the community they serve'.split(' ')

  useEffect(() => {
    TITLE.forEach((_, i) => {
      setTimeout(() => setWords(w => { const n = [...w]; n[i] = true; return n }), 120 + i * 75)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clinic || !form.email) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await submitForm('provider', {
        clinic: form.clinic,
        contact: form.contact,
        email: form.email,
        clinicType: form.clinicType,
      })
      setSubmitted(true)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      {/* ── HERO ── */}
      <section style={{ minHeight: '88dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '100px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(109,145,151,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ ...pill, marginBottom: '24px' }}><Stethoscope size={10} strokeWidth={1.5} /> For Healthcare Providers</div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '24px', maxWidth: '800px' }}>
          {TITLE.map((w, i) => (
            <span key={i} style={{ display: 'inline-block', marginRight: w === 'meet' || w === 'the' || w === 'community' || w === 'they' ? '0.25em' : '0.25em', opacity: words[i] ? 1 : 0, transform: words[i] ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)', color: w === 'community' ? '#6d9197' : 'inherit' }}>{w}</span>
          ))}
        </h1>

        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', lineHeight: 1.7, marginBottom: '40px' }}>
          Join 2,400+ partner clinics tracking outcomes, recovering revenue, and connecting with the patients who need them most.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '56px' }}>
          {[['2,400+', 'partner clinics'], ['$18M', 'revenue recovered'], ['94%', 'patient retention']].map(([v, l]) => (
            <div key={l} style={{ padding: '10px 20px', background: 'rgba(109,145,151,0.07)', border: '1px solid rgba(109,145,151,0.18)', borderRadius: '100px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#6d9197', letterSpacing: '-0.02em' }}>{v}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => formRef.current && smoothScrollTo(formRef.current)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '100px', background: 'rgba(255,255,255,0.93)', color: '#07070F', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
        >
          Join as a Provider <ArrowRight size={14} strokeWidth={2} />
        </button>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><BarChart2 size={10} strokeWidth={1.5} /> Live dashboard</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Your clinic's performance,<br /><em style={{ fontStyle: 'normal', color: '#6d9197' }}>at a glance</em></h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', marginTop: '16px', maxWidth: '400px', margin: '16px auto 0', lineHeight: 1.65 }}>Every metric your team needs — from patient volume to revenue recovery — in one real-time dashboard.</p>
            </div>
          </RevealBlock>

          <div className="grid-4" style={{ gap: '16px' }}>
            {METRICS.map((m, i) => (
              <RevealBlock key={m.label} delay={i * 80}>
                <div style={card}>
                  <div style={cardInner}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(109,145,151,0.1)', border: '1px solid rgba(109,145,151,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6d9197', marginBottom: '16px' }}>{m.icon}</div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#eef4f5', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '8px' }}>
                      <Counter target={m.value} suffix={m.suffix} />
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{m.label}</div>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><CheckCircle size={10} strokeWidth={1.5} /> Setup process</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, maxWidth: '500px' }}>Four steps to full integration</h2>
            </div>
          </RevealBlock>

          <div className="grid-4" style={{ gap: '16px' }}>
            {STEPS.map((s, i) => (
              <RevealBlock key={s.n} delay={i * 80}>
                <div style={{ padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', height: '100%', boxSizing: 'border-box', transition: 'border-color 0.25s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(109,145,151,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#6d9197', letterSpacing: '0.12em', marginBottom: '16px' }}>{s.n}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', lineHeight: 1.35 }}>{s.title}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, margin: 0 }}>{s.body}</p>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><Zap size={10} strokeWidth={1.5} /> Platform features</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, maxWidth: '500px' }}>Everything a community clinic needs</h2>
            </div>
          </RevealBlock>

          <div className="grid-3" style={{ gap: '16px' }}>
            {FEATURES.map((f, i) => (
              <RevealBlock key={f.title} delay={i * 80}>
                <div style={card}>
                  <div style={{ ...cardInner, minHeight: '220px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(109,145,151,0.1)', border: '1px solid rgba(109,145,151,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6d9197', marginBottom: '20px' }}>{f.icon}</div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '10px', lineHeight: 1.3 }}>{f.title}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: '16px' }}>{f.desc}</p>
                    <span style={{ ...pill, fontSize: '10px', padding: '3px 10px' }}>{f.tag}</span>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>


      {/* ── JOIN FORM ── */}
      <section ref={formRef} style={{ padding: '100px 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ ...pill, marginBottom: '24px' }}><ShieldCheck size={10} strokeWidth={1.5} /> Join as a provider</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '16px' }}>Ready to connect with your community?</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, marginBottom: '40px' }}>Tell us about your clinic. We'll reach out within 2 business days to set up your provider dashboard.</p>
          </RevealBlock>

          {submitted ? (
            <RevealBlock>
              <div style={{ textAlign: 'center', padding: '48px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '20px' }}>
                <CheckCircle size={40} strokeWidth={1.5} style={{ color: '#4ade80', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Application received</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>We'll reach out to <strong style={{ color: '#eef4f5' }}>{form.email}</strong> within 2 business days to schedule your onboarding.</p>
              </div>
            </RevealBlock>
          ) : (
            <RevealBlock delay={100}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { key: 'clinic',   label: 'Clinic Name',    placeholder: 'Clinica Adelante' },
                  { key: 'contact',  label: 'Contact Name',   placeholder: 'Dr. Maria Reyes' },
                  { key: 'email',    label: 'Email Address',  placeholder: 'mreyes@clinicaadelante.org' },
                ].map(f => (
                  <ProviderField key={f.key} label={f.label} placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={v => setForm(prev => ({ ...prev, [f.key]: v }))} />
                ))}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>Clinic Type</label>
                  <select value={form.clinicType} onChange={e => setForm(prev => ({ ...prev, clinicType: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '11px 14px', color: form.clinicType ? '#eef4f5' : 'rgba(255,255,255,0.3)', fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(109,145,151,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(109,145,151,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <option value="">Select clinic type…</option>
                    {['Federally Qualified Health Center (FQHC)', 'Free Clinic', 'Urgent Care', 'Hospital / Health System', 'Specialty Clinic', 'Mental Health Center'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                {submitError && (
                  <p style={{ fontSize: '13px', color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '10px 14px', margin: 0 }}>{submitError}</p>
                )}
                <button type="submit" disabled={submitting} style={{ marginTop: '8px', padding: '15px 28px', borderRadius: '12px', background: submitting ? 'rgba(109,145,151,0.5)' : '#6d9197', color: '#07070F', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s', boxShadow: '0 4px 20px rgba(109,145,151,0.3)' }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(109,145,151,0.45)' } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(109,145,151,0.3)' }}
                >
                  {submitting ? 'Submitting…' : 'Submit application →'}
                </button>
              </form>
            </RevealBlock>
          )}
        </div>
      </section>
    </AppShell>
  )
}

function ProviderField({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
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
          border: `1px solid ${focused ? 'rgba(109,145,151,0.45)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(109,145,151,0.08)' : 'none',
          borderRadius: '9px', padding: '11px 14px',
          color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit',
          outline: 'none', boxSizing: 'border-box', caretColor: '#6d9197',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      />
    </div>
  )
}
