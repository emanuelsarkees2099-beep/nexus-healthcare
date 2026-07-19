'use client'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { smoothScrollTo } from '@/utils/smoothScroll'
import { submitForm } from '@/utils/submitForm'
import { Hospital, TrendUp, Profile2User, Chart2, ArrowRight, TickCircle, ShieldTick, DollarCircle, Flash, Star1, ArrowDown2, Call, Sms, Clock, Global, Camera, Calendar1, Edit, Location, InfoCircle } from 'iconsax-react'

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
  background: 'rgba(74,144,217,0.08)', color: 'var(--accent)',
  border: '1px solid rgba(74,144,217,0.18)',
}

const card: React.CSSProperties = {
  padding: '2px',
  background: 'linear-gradient(135deg, rgba(74,144,217,0.2), rgba(74,144,217,0.04))',
  borderRadius: '20px',
}

const cardInner: React.CSSProperties = {
  background: '#080D1A',
  borderRadius: '18px',
  padding: '28px',
  height: '100%',
  boxSizing: 'border-box',
}

const METRICS = [
  { label: 'Patients Seen This Month', value: 1247, suffix: '', icon: <Profile2User size={16} variant="Linear" /> },
  { label: 'Revenue Recovery Rate',   value: 87,   suffix: '%', icon: <DollarCircle size={16} variant="Linear" /> },
  { label: 'Community Health Score',  value: 94,   suffix: '/100', icon: <Star1 size={16} variant="Linear" /> },
  { label: 'Appointments Scheduled',  value: 312,  suffix: '', icon: <Chart2 size={16} variant="Linear" /> },
]

const FEATURES = [
  {
    icon: <Flash size={20} variant="Linear" />,
    title: 'Patient Matching Engine',
    desc: "Routes patients who need exactly the services your clinic offers. No more mismatched visits that drain staff time. Our model weighs specialty, language, insurance, and distance.",
    tag: 'AI-powered',
  },
  {
    icon: <DollarCircle size={20} variant="Linear" />,
    title: 'Revenue Recovery Tools',
    desc: "Identify missed billing opportunities, facilitate retroactive Medicaid enrollment, and connect uninsured patients to programs that cover their visit — before they leave.",
    tag: 'Financial',
  },
  {
    icon: <Chart2 size={20} variant="Linear" />,
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

/* ── Verification + listing management types ── */
type ClaimStep = 'idle' | 'verify-email' | 'verify-phone' | 'code' | 'verified'
type ManageTab = 'claim' | 'edit' | 'analytics' | 'appointments'

export default function ProviderPage() {
  const formRef    = useRef<HTMLDivElement>(null)
  const manageRef  = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState({ clinic: '', contact: '', email: '', clinicType: '' })
  const [submitted,   setSubmitted]   = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [words,       setWords]       = useState<boolean[]>([])

  /* ── Manage portal state ── */
  const [manageTab,     setManageTab]     = useState<ManageTab>('claim')
  const [claimStep,     setClaimStep]     = useState<ClaimStep>('idle')
  const [claimMethod,   setClaimMethod]   = useState<'email' | 'phone'>('email')
  const [claimInput,    setClaimInput]    = useState('')
  const [claimCode,     setClaimCode]     = useState('')
  const [claimSending,  setClaimSending]  = useState(false)
  const [claimError,    setClaimError]    = useState('')

  /* ── Listing edit state ── */
  const [listing, setListing] = useState({
    clinicName: '', phone: '', website: '', address: '',
    languages: 'English, Spanish',
    services: 'Primary care, Mental health, Dental',
    slidingScale: true, freeVisits: true,
    monOpen: '8:00 AM', monClose: '5:00 PM',
    satOpen: '9:00 AM', satClose: '1:00 PM',
    sunClosed: true,
    photos: [] as string[],
    acceptingAppts: true,
    calLink: '',   // N3: Cal.com, Calendly, or any booking URL for clinic detail page embed
  })
  const [listingSaved, setListingSaved] = useState(false)

  const TITLE = 'Built for the people who care.'.split(' ')

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

  const handleSendCode = async () => {
    const npi = claimInput.replace(/\D/g, '')
    if (npi.length !== 10) { setClaimError('Please enter a valid 10-digit NPI number.'); return }
    setClaimSending(true); setClaimError('')
    await new Promise(r => setTimeout(r, 1400)) // simulate NPPES lookup
    setClaimStep('code')
    setClaimSending(false)
  }

  const handleVerifyCode = async () => {
    if (!claimCode) { setClaimError('Please confirm your attestation.'); return }
    setClaimSending(true); setClaimError('')
    await new Promise(r => setTimeout(r, 900))
    setClaimStep('verified')
    setManageTab('edit')
    setClaimSending(false)
  }

  const handleSaveListing = async () => {
    setListingSaved(false)
    await new Promise(r => setTimeout(r, 800))
    setListingSaved(true)
    setTimeout(() => setListingSaved(false), 3000)
  }

  return (
    <AppShell>
      {/* ── HERO ── */}
      <section style={{ minHeight: '88dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '100px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(74,144,217,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ ...pill, marginBottom: '24px' }}><Hospital size={14} variant="Linear" /> For Healthcare Providers</div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '24px', maxWidth: '800px' }}>
          {TITLE.map((w, i) => (
            <span key={i} style={{ display: 'inline-block', marginRight: w === 'meet' || w === 'the' || w === 'community' || w === 'they' ? '0.25em' : '0.25em', opacity: words[i] ? 1 : 0, transform: words[i] ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)', color: w === 'community' ? 'var(--accent)' : 'inherit' }}>{w}</span>
          ))}
        </h1>

        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', lineHeight: 1.7, marginBottom: '40px' }}>
          Join 2,400+ partner clinics tracking outcomes, recovering revenue, and connecting with the patients who need them most.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '56px' }}>
          {[['2,400+', 'partner clinics'], ['$18M', 'revenue recovered'], ['94%', 'patient retention']].map(([v, l]) => (
            <div key={l} style={{ padding: '10px 20px', background: 'rgba(74,144,217,0.07)', border: '1px solid rgba(74,144,217,0.18)', borderRadius: '100px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{v}</div>
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
          Join as a Provider <ArrowRight size={14} variant="Linear" />
        </button>
      </section>

      {/* ── MANAGE YOUR LISTING PORTAL ── */}
      <section ref={manageRef} style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(74,144,217,0.015)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><Edit size={14} variant="Linear" /> Already a partner?</div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '12px' }}>
                Manage your NEXUS listing
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.65 }}>
                Claim your clinic, update hours and services, view patient analytics, and manage appointment requests.
              </p>
            </div>
          </RevealBlock>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
            {([
              { id: 'claim',        label: 'Claim listing',     icon: <ShieldTick size={13} /> },
              { id: 'edit',         label: 'Edit listing',      icon: <Edit size={13} />,        disabled: claimStep !== 'verified' },
              { id: 'analytics',   label: 'Analytics',         icon: <Chart2 size={13} />,    disabled: claimStep !== 'verified' },
              { id: 'appointments', label: 'Appointments',      icon: <Calendar1 size={13} />,     disabled: claimStep !== 'verified' },
            ] as { id: ManageTab; label: string; icon: React.ReactNode; disabled?: boolean }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setManageTab(tab.id)}
                style={{
                  flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '9px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                  fontFamily: 'var(--font-inter)', cursor: tab.disabled ? 'not-allowed' : 'pointer', border: 'none',
                  background: manageTab === tab.id ? 'rgba(74,144,217,0.12)' : 'transparent',
                  color: tab.disabled ? 'rgba(255,255,255,0.2)' : manageTab === tab.id ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s',
                }}
              >
                {tab.icon} <span style={{ display: 'none' }}>{/* label hidden on small screens */}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Claim tab ── */}
          {manageTab === 'claim' && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px' }}>
              {claimStep === 'verified' ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <TickCircle size={40} color="#60a5fa" variant="Linear" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Listing claimed</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>You now have full control. Use the tabs above to update your listing.</p>
                  <button onClick={() => setManageTab('edit')} style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '100px', background: 'var(--accent)', color: '#07070F', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit' }}>
                    Edit my listing →
                  </button>
                </div>
              ) : claimStep === 'code' ? (
                <div style={{ maxWidth: '440px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '10px', marginBottom: '24px' }}>
                    <TickCircle size={18} color="#60a5fa" variant="Linear" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#60a5fa' }}>NPI {claimInput.replace(/\D/g, '')} verified</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Found in NPPES registry</div>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Confirm your attestation</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px', lineHeight: 1.6 }}>
                    By claiming this listing you confirm that you are an authorized representative of this clinic and agree to NEXUS's provider terms.
                  </p>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '20px' }}>
                    <input
                      type="checkbox"
                      checked={!!claimCode}
                      onChange={e => setClaimCode(e.target.checked ? 'attested' : '')}
                      style={{ marginTop: '3px', accentColor: 'var(--accent)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>
                      I am an authorized representative of this clinic and confirm that the information I provide is accurate and up-to-date.
                    </span>
                  </label>
                  {claimError && <p style={{ fontSize: '13px', color: '#f87171', marginBottom: '12px' }}>{claimError}</p>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setClaimStep('idle'); setClaimCode('') }} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Back</button>
                    <button onClick={handleVerifyCode} disabled={claimSending || !claimCode} style={{ flex: 2, padding: '12px', borderRadius: '10px', background: claimSending || !claimCode ? 'rgba(74,144,217,0.4)' : 'var(--accent)', color: '#07070F', border: 'none', cursor: claimSending || !claimCode ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.2s' }}>
                      {claimSending ? 'Claiming…' : 'Claim listing'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: '440px', margin: '0 auto' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Verify with your NPI</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '24px', lineHeight: 1.6 }}>
                    Enter your 10-digit National Provider Identifier (NPI) to verify your identity instantly. Your NPI is public record and can be found at nppes.cms.hhs.gov.
                  </p>

                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>NPI NUMBER</label>
                  <input
                    value={claimInput}
                    onChange={e => { setClaimInput(e.target.value.replace(/\D/g, '').slice(0, 10)); setClaimError('') }}
                    placeholder="1234567890"
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px', padding: '12px 14px', color: '#eef4f5', fontSize: '18px', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.1em', outline: 'none', caretColor: 'var(--accent)', marginBottom: '8px', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,144,217,0.40)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                  />
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
                    Not sure of your NPI? <a href="https://nppes.cms.hhs.gov/#/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Look it up on NPPES →</a>
                  </p>
                  {claimError && <p style={{ fontSize: '12px', color: '#f87171', marginBottom: '8px' }}>{claimError}</p>}
                  <button onClick={handleSendCode} disabled={claimSending || claimInput.replace(/\D/g, '').length !== 10} style={{ width: '100%', marginTop: '4px', padding: '13px', borderRadius: '10px', background: claimSending || claimInput.replace(/\D/g, '').length !== 10 ? 'rgba(74,144,217,0.4)' : 'var(--accent)', color: '#07070F', border: 'none', cursor: claimSending ? 'wait' : claimInput.replace(/\D/g, '').length !== 10 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 4px 18px rgba(74,144,217,0.2)', transition: 'all 0.2s' }}>
                    {claimSending ? 'Looking up NPI…' : 'Verify NPI & continue'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Edit listing tab ── */}
          {manageTab === 'edit' && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="grid-2" style={{ gap: '16px' }}>
                {[
                  { label: 'Clinic name',  key: 'clinicName', placeholder: 'Clinica Adelante' },
                  { label: 'Phone number', key: 'phone',       placeholder: '+1 (602) 555-0100' },
                  { label: 'Website',      key: 'website',     placeholder: 'https://clinicaadelante.org' },
                  { label: 'Address',      key: 'address',     placeholder: '1234 S Central Ave, Phoenix, AZ 85004' },
                ].map(f => (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>{f.label.toUpperCase()}</label>
                    <input
                      value={listing[f.key as keyof typeof listing] as string}
                      onChange={e => setListing(l => ({ ...l, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '9px', padding: '10px 14px', color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit', outline: 'none', caretColor: 'var(--accent)', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,144,217,0.38)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
                    />
                  </div>
                ))}
              </div>

              {/* N7: Online booking URL (Cal.com / Calendly) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                  ONLINE BOOKING URL <span style={{ fontSize: '10px', fontWeight: 400, color: 'rgba(255,255,255,0.3)', letterSpacing: 0, textTransform: 'none' }}>(optional — Cal.com, Calendly, or your EHR scheduler)</span>
                </label>
                <input
                  value={listing.calLink}
                  onChange={e => setListing(l => ({ ...l, calLink: e.target.value }))}
                  placeholder="https://cal.com/your-clinic or https://calendly.com/your-clinic"
                  type="url"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '9px', padding: '10px 14px', color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit', outline: 'none', caretColor: 'var(--accent)', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,144,217,0.38)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
                />
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: '2px 0 0', fontFamily: 'var(--font-inter)', lineHeight: 1.6 }}>
                  When provided, patients will see an embedded calendar on your clinic&apos;s NEXUS page and can book directly without calling. Works with Cal.com (free), Calendly, or any embeddable booking URL your EHR provides.
                </p>
              </div>

              {/* Languages + Services */}
              <div className="grid-2" style={{ gap: '16px' }}>
                {[
                  { label: 'Languages spoken', key: 'languages', placeholder: 'English, Spanish, Somali…' },
                  { label: 'Services offered',  key: 'services',  placeholder: 'Primary care, Dental, Mental health…' },
                ].map(f => (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>{f.label.toUpperCase()}</label>
                    <textarea
                      value={listing[f.key as keyof typeof listing] as string}
                      onChange={e => setListing(l => ({ ...l, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      rows={3}
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '9px', padding: '10px 14px', color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', caretColor: 'var(--accent)', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,144,217,0.38)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
                    />
                  </div>
                ))}
              </div>

              {/* Affordability toggles */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>AFFORDABILITY OPTIONS</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'slidingScale', label: 'Sliding-scale fees' },
                    { key: 'freeVisits',   label: 'Free visits available' },
                    { key: 'acceptingAppts', label: 'Accepting appointments' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setListing(l => ({ ...l, [opt.key]: !l[opt.key as keyof typeof l] }))}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                        padding: '8px 16px', borderRadius: '100px', fontSize: '13px',
                        fontFamily: 'inherit', cursor: 'pointer', border: '1px solid',
                        transition: 'all 0.2s',
                        background: listing[opt.key as keyof typeof listing] ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.04)',
                        borderColor: listing[opt.key as keyof typeof listing] ? 'rgba(74,144,217,0.30)' : 'rgba(255,255,255,0.09)',
                        color: listing[opt.key as keyof typeof listing] ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: listing[opt.key as keyof typeof listing] ? 'var(--accent)' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>HOURS</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { day: 'Monday – Friday', openKey: 'monOpen', closeKey: 'monClose' },
                    { day: 'Saturday',        openKey: 'satOpen', closeKey: 'satClose' },
                  ].map(row => (
                    <div key={row.day} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', minWidth: '130px', fontFamily: 'var(--font-inter)' }}>{row.day}</span>
                      <input value={listing[row.openKey as keyof typeof listing] as string} onChange={e => setListing(l => ({ ...l, [row.openKey]: e.target.value }))} placeholder="8:00 AM" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', padding: '7px 12px', color: '#eef4f5', fontSize: '13px', fontFamily: 'inherit', outline: 'none', width: '110px', caretColor: 'var(--accent)' }} />
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>–</span>
                      <input value={listing[row.closeKey as keyof typeof listing] as string} onChange={e => setListing(l => ({ ...l, [row.closeKey]: e.target.value }))} placeholder="5:00 PM" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', padding: '7px 12px', color: '#eef4f5', fontSize: '13px', fontFamily: 'inherit', outline: 'none', width: '110px', caretColor: 'var(--accent)' }} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', minWidth: '130px' }}>Sunday</span>
                    <button onClick={() => setListing(l => ({ ...l, sunClosed: !l.sunClosed }))} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: listing.sunClosed ? 'rgba(248,113,113,0.08)' : 'rgba(74,144,217,0.08)', border: `1px solid ${listing.sunClosed ? 'rgba(248,113,113,0.25)' : 'rgba(74,144,217,0.25)'}`, color: listing.sunClosed ? '#f87171' : 'var(--accent)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                      {listing.sunClosed ? 'Closed' : 'Open'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>PHOTOS</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {listing.photos.map((p, i) => (
                    <div key={i} style={{ width: '80px', height: '80px', borderRadius: '10px', background: `rgba(74,144,217,0.${10 + i * 5})`, border: '1px solid rgba(74,144,217,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--accent)', position: 'relative' }}>
                      <Camera size={20} />
                      <button onClick={() => setListing(l => ({ ...l, photos: l.photos.filter((_, j) => j !== i) }))} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#f87171', border: 'none', borderRadius: '50%', width: '16px', height: '16px', color: '#fff', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                  <button
                    onClick={() => setListing(l => ({ ...l, photos: [...l.photos, `photo-${Date.now()}`] }))}
                    style={{ width: '80px', height: '80px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontFamily: 'inherit', transition: 'border-color 0.2s, color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(74,144,217,0.35)'; e.currentTarget.style.color = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
                  >
                    <Camera size={18} />
                    Add photo
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '8px', fontFamily: 'var(--font-inter)' }}>
                  JPEG or PNG · max 5MB each · up to 8 photos
                </p>
              </div>

              <button
                onClick={handleSaveListing}
                style={{ alignSelf: 'flex-start', padding: '12px 28px', borderRadius: '10px', background: listingSaved ? 'rgba(96,165,250,0.15)' : 'var(--accent)', color: listingSaved ? '#60a5fa' : '#07070F', border: listingSaved ? '1px solid rgba(96,165,250,0.35)' : 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.3s', boxShadow: listingSaved ? 'none' : '0 4px 18px rgba(74,144,217,0.28)' }}
              >
                {listingSaved ? '✓ Saved' : 'Save changes'}
              </button>
            </div>
          )}

          {/* ── Analytics tab ── */}
          {manageTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid-4" style={{ gap: '12px' }}>
                {[
                  { label: 'Profile views this month',  value: '1,247', delta: '+18%',  color: 'var(--accent)' },
                  { label: 'Patients referred via NEXUS', value: '84',   delta: '+12%',  color: '#60a5fa' },
                  { label: 'Bookmark saves',            value: '312',   delta: '+6%',   color: '#a78bfa' },
                  { label: 'Direction requests',        value: '97',    delta: '+23%',  color: '#fbbf24' },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#eef4f5', letterSpacing: '-0.02em', marginBottom: '6px', fontFamily: 'var(--font-mono, monospace)' }}>{stat.value}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', lineHeight: 1.4 }}>{stat.label}</div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: stat.color, background: `${stat.color}14`, border: `1px solid ${stat.color}28`, borderRadius: '100px', padding: '2px 8px' }}>{stat.delta} vs last month</span>
                  </div>
                ))}
              </div>

              {/* Search source breakdown */}
              <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#eef4f5' }}>How patients find you</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'NEXUS search',        pct: 58, color: 'var(--accent)' },
                    { label: 'Direct URL',          pct: 22, color: '#60a5fa' },
                    { label: 'Map pin click',       pct: 14, color: '#a78bfa' },
                    { label: 'Referral from CHW',   pct:  6, color: '#fbbf24' },
                  ].map(row => (
                    <div key={row.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginBottom: '5px' }}>
                        <span>{row.label}</span>
                        <span style={{ color: row.color, fontWeight: 600 }}>{row.pct}%</span>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${row.pct}%`, background: row.color, borderRadius: '5px', transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '14px 18px', background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.14)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <InfoCircle size={14} color="var(--accent)" />
                <p style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', lineHeight: 1.5, margin: 0 }}>
                  Analytics update daily at midnight UTC. Historical data available for the past 12 months. Export as CSV from your provider dashboard.
                </p>
              </div>
            </div>
          )}

          {/* ── Appointments tab ── */}
          {manageTab === 'appointments' && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#eef4f5', marginBottom: '4px' }}>Incoming appointment requests</h4>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>3 pending · accepting new patients</p>
                </div>
                <button onClick={() => setListing(l => ({ ...l, acceptingAppts: !l.acceptingAppts }))} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '100px', background: listing.acceptingAppts ? 'rgba(74,144,217,0.12)' : 'rgba(248,113,113,0.08)', border: `1px solid ${listing.acceptingAppts ? 'rgba(74,144,217,0.28)' : 'rgba(248,113,113,0.25)'}`, color: listing.acceptingAppts ? 'var(--accent)' : '#f87171', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                  {listing.acceptingAppts ? '● Accepting patients' : '○ Not accepting'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Anonymous Patient',  reason: 'Primary care – new patient', time: '2h ago',   urgent: false },
                  { name: 'Anonymous Patient',  reason: 'Mental health consultation',  time: '5h ago',   urgent: true  },
                  { name: 'Anonymous Patient',  reason: 'Dental pain',                 time: '1d ago',   urgent: true  },
                ].map((req, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--accent)', flexShrink: 0 }}>
                        {req.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#eef4f5', marginBottom: '2px' }}>{req.name}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                          {req.reason}
                          {req.urgent && <span style={{ marginLeft: '8px', fontSize: '10px', background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '4px', padding: '1px 6px', fontWeight: 600 }}>URGENT</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono, monospace)' }}>{req.time}</span>
                      <button style={{ padding: '6px 14px', borderRadius: '8px', background: 'var(--accent)', color: '#07070F', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit' }}>Schedule</button>
                      <button style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><Chart2 size={14} variant="Linear" /> Live dashboard</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Your clinic's performance,<br /><em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>at a glance</em></h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', marginTop: '16px', maxWidth: '400px', margin: '16px auto 0', lineHeight: 1.65 }}>Every metric your team needs — from patient volume to revenue recovery — in one real-time dashboard.</p>
            </div>
          </RevealBlock>

          <div className="grid-4" style={{ gap: '16px' }}>
            {METRICS.map((m, i) => (
              <RevealBlock key={m.label} delay={i * 80}>
                <div style={card}>
                  <div style={cardInner}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '16px' }}>{m.icon}</div>
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
              <div style={{ ...pill, marginBottom: '20px' }}><TickCircle size={14} variant="Linear" /> Setup process</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, maxWidth: '500px' }}>Four steps to full integration</h2>
            </div>
          </RevealBlock>

          <div className="grid-4" style={{ gap: '16px' }}>
            {STEPS.map((s, i) => (
              <RevealBlock key={s.n} delay={i * 80}>
                <div style={{ padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', height: '100%', boxSizing: 'border-box', transition: 'border-color 0.25s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(74,144,217,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: '16px' }}>{s.n}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', lineHeight: 1.35 }}>{s.title}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, margin: 0 }}>{s.body}</p>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── EHR INTEGRATION ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><Flash size={14} variant="Linear" /> EHR Integration</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, maxWidth: '580px' }}>Your EHR, connected to NEXUS</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', marginTop: '16px', maxWidth: '520px', lineHeight: 1.7 }}>
                NEXUS connects to major EHR systems via HL7 FHIR R4 APIs. New patients routed through NEXUS flow directly into your scheduling queue — no double-entry, no friction.
              </p>
            </div>
          </RevealBlock>

          <div className="grid-3" style={{ gap: '16px', marginBottom: '48px' }}>
            {[
              { name: 'Epic', icon: <Flash size={22} variant="Bulk" color="var(--accent)" />, desc: 'FHIR R4 Patient & Appointment APIs. New patient referrals appear in Epic\'s referral work queue automatically.', status: 'FHIR R4', color: '#4F8EF0' },
              { name: 'Cerner / Oracle Health', icon: <Hospital size={22} variant="Bulk" color="var(--accent)" />, desc: 'Millennium FHIR integration for scheduling and patient demographics sync.', status: 'FHIR R4', color: '#4F8EF0' },
              { name: 'athenahealth', icon: <Global size={22} variant="Bulk" color="var(--accent)" />, desc: 'athenaOne REST APIs for appointment booking and patient chart creation.', status: 'REST API', color: '#4F8EF0' },
              { name: 'eClinicalWorks', icon: <Chart2 size={22} variant="Bulk" color="var(--accent)" />, desc: 'SOAP/REST API integration for FQHC and community health center workflows.', status: 'REST API', color: '#4F8EF0' },
              { name: 'OpenEMR', icon: <Global size={22} variant="Bulk" color="var(--accent)" />, desc: 'Open-source EHR integration via FHIR R4 for free clinics and community health.', status: 'FHIR R4', color: '#4F8EF0' },
              { name: 'Custom / API', icon: <Edit size={22} variant="Bulk" color="var(--accent)" />, desc: 'Any HL7 FHIR R4 compliant system. We provide a webhook endpoint you configure in your EHR.', status: 'Webhook', color: '#4F8EF0' },
            ].map((ehr, i) => (
              <RevealBlock key={ehr.name} delay={i * 70}>
                <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', height: '100%', boxSizing: 'border-box', transition: 'border-color 0.25s', display: 'flex', flexDirection: 'column', gap: '12px' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `${ehr.color}30`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'inline-flex', flexShrink: 0 }}>{ehr.icon}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '100px', background: `${ehr.color}12`, color: ehr.color, border: `1px solid ${ehr.color}28`, letterSpacing: '0.06em' }}>{ehr.status}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#eef4f5' }}>{ehr.name}</div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, margin: 0 }}>{ehr.desc}</p>
                </div>
              </RevealBlock>
            ))}
          </div>

          <RevealBlock>
            <div style={{ padding: '32px 36px', background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.15)', borderRadius: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>How it works</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    'Patient searches NEXUS and requests appointment',
                    'NEXUS sends FHIR Patient resource to your EHR via webhook',
                    'Appointment appears in your scheduling queue',
                    'Patient receives confirmation with your intake forms',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Technical specs</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    ['Protocol', 'HL7 FHIR R4'],
                    ['Auth', 'OAuth 2.0 / SMART on FHIR'],
                    ['Resources', 'Patient, Appointment, Practitioner'],
                    ['Webhooks', 'HTTPS POST — your endpoint'],
                    ['Latency', '< 800ms p99'],
                    ['Uptime SLA', '99.9%'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                      <span style={{ color: '#eef4f5', fontWeight: 500, fontFamily: 'var(--font-mono, monospace)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><Flash size={14} variant="Linear" /> Platform features</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, maxWidth: '500px' }}>Everything a community clinic needs</h2>
            </div>
          </RevealBlock>

          <div className="grid-3" style={{ gap: '16px' }}>
            {FEATURES.map((f, i) => (
              <RevealBlock key={f.title} delay={i * 80}>
                <div style={card}>
                  <div style={{ ...cardInner, minHeight: '220px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '20px' }}>{f.icon}</div>
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
            <div style={{ ...pill, marginBottom: '24px' }}><ShieldTick size={14} variant="Linear" /> Join as a provider</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '16px' }}>Ready to connect with your community?</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, marginBottom: '40px' }}>Tell us about your clinic. We'll reach out within 2 business days to set up your provider dashboard.</p>
          </RevealBlock>

          {submitted ? (
            <RevealBlock>
              <div style={{ textAlign: 'center', padding: '48px', background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '20px' }}>
                <TickCircle size={40} variant="Linear" style={{ color: '#60a5fa', marginBottom: '16px' }} />
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
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(74,144,217,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <option value="">Select clinic type…</option>
                    {['Federally Qualified Health Center (FQHC)', 'Free Clinic', 'Urgent Care', 'Hospital / Health System', 'Specialty Clinic', 'Mental Health Center'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                {submitError && (
                  <p style={{ fontSize: '13px', color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '10px 14px', margin: 0 }}>{submitError}</p>
                )}
                <button type="submit" disabled={submitting} style={{ marginTop: '8px', padding: '15px 28px', borderRadius: '12px', background: submitting ? 'rgba(74,144,217,0.5)' : 'var(--accent)', color: '#07070F', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s', boxShadow: '0 4px 20px rgba(74,144,217,0.3)' }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(74,144,217,0.45)' } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(74,144,217,0.3)' }}
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
          border: `1px solid ${focused ? 'rgba(74,144,217,0.45)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(74,144,217,0.08)' : 'none',
          borderRadius: '9px', padding: '11px 14px',
          color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit',
          outline: 'none', boxSizing: 'border-box', caretColor: 'var(--accent)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      />
    </div>
  )
}
