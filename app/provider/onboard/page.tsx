'use client'
import React, { useState } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { TickCircle, Building, DocumentText, ArrowRight2, InfoCircle, ShieldTick, SearchNormal1 } from 'iconsax-react'

export const dynamic = 'force-dynamic'

type Step = 'npi' | 'confirm' | 'services' | 'access' | 'done'

const SERVICES = [
  'Primary Care', 'Mental / Behavioral Health', 'Dental', 'Vision',
  "Women's Health / OB-GYN", 'Pediatrics', 'Substance Use Treatment',
  'Pharmacy / 340B', 'Specialist Referrals', 'HIV/AIDS Care', 'Lab / Imaging',
]
const INSURANCE = [
  'Medicaid', 'CHIP', 'ACA Marketplace Plans', 'Medicare',
  'Private Insurance', 'Uninsured / Sliding Scale', 'No-cost / Free',
]
const LANGUAGES = [
  'Spanish / Español', 'Chinese (Mandarin)', 'Arabic', 'Vietnamese',
  'Tagalog / Filipino', 'Haitian Creole', 'Somali', 'Polish',
  'Russian', 'Hindi', 'Korean', 'ASL / Sign Language',
]

const STEP_ORDER: Step[] = ['npi', 'confirm', 'services', 'access', 'done']

function Chip({ label, on, onClick, color = 'var(--accent)' }: { label: string; on: boolean; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick} type="button" style={{
      padding: '5px 12px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      background: on ? `${color}14` : 'rgba(255,255,255,0.04)',
      color: on ? color : 'var(--text-4)',
      fontSize: 12, fontWeight: on ? 600 : 400,
      outline: on ? `1.5px solid ${color}35` : '1.5px solid rgba(255,255,255,0.06)',
      transition: 'all 0.14s',
    }}>{label}</button>
  )
}

const MOCK_NPI_LOOKUP: Record<string, { name: string; type: string; address: string; city: string; state: string; zip: string; phone: string }> = {
  '1234567890': { name: 'Valley Community Health Center', type: 'FQHC', address: '1200 S Central Ave', city: 'Phoenix', state: 'AZ', zip: '85004', phone: '(602) 555-0200' },
  '0987654321': { name: 'South Side Free Clinic', type: 'Free Clinic', address: '400 W Cermak Rd', city: 'Chicago', state: 'IL', zip: '60616', phone: '(312) 555-0110' },
}

export default function ProviderOnboard() {
  const [step, setStep] = useState<Step>('npi')
  const [npi, setNpi] = useState('')
  const [npiLoading, setNpiLoading] = useState(false)
  const [npiError, setNpiError] = useState('')
  const [npiData, setNpiData] = useState<typeof MOCK_NPI_LOOKUP[string] | null>(null)
  const [contactEmail, setContactEmail] = useState('')
  const [contactName, setContactName] = useState('')
  const [services, setServices] = useState<Set<string>>(new Set())
  const [insurance, setInsurance] = useState<Set<string>>(new Set())
  const [languages, setLanguages] = useState<Set<string>>(new Set())
  const [isFQHC, setIsFQHC] = useState(false)
  const [sliding, setSliding] = useState(false)
  const [free, setFree] = useState(false)
  const [attestation, setAttestation] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const stepIdx = STEP_ORDER.indexOf(step)

  const lookupNpi = async () => {
    if (npi.trim().length !== 10) { setNpiError('NPI must be exactly 10 digits.'); return }
    setNpiLoading(true); setNpiError('')
    await new Promise(r => setTimeout(r, 900))
    const result = MOCK_NPI_LOOKUP[npi.trim()]
    if (result) {
      setNpiData(result)
      setNpiLoading(false)
      setStep('confirm')
    } else {
      setNpiError('NPI not found in NPPES registry. Double-check the number or contact HRSA.')
      setNpiLoading(false)
    }
  }

  const next = () => {
    const i = STEP_ORDER.indexOf(step)
    if (i < STEP_ORDER.length - 1) setStep(STEP_ORDER[i + 1])
  }

  const prev = () => {
    const i = STEP_ORDER.indexOf(step)
    if (i > 0) setStep(STEP_ORDER[i - 1])
  }

  const toggleSet = (set: Set<string>, item: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set)
    if (next.has(item)) next.delete(item); else next.add(item)
    setter(next)
  }

  const submit = () => {
    setSubmitted(true)
    setStep('done')
  }

  const STEPS_META = [
    { id: 'npi',     label: 'NPI lookup' },
    { id: 'confirm', label: 'Confirm details' },
    { id: 'services',label: 'Services' },
    { id: 'access',  label: 'Submit' },
  ]

  return (
    <AppShell>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(60px,8vw,100px) 24px 96px' }}>

        {/* Back */}
        <Link href="/provider" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-4)', textDecoration: 'none', marginBottom: 32 }}>
          <ArrowRight2 size={11} color="currentColor" style={{ transform: 'rotate(180deg)' }} /> Back to Provider Hub
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 100, background: 'rgba(79,142,240,0.1)', border: '1px solid rgba(79,142,240,0.2)', fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>
            <Building size={11} color="currentColor" /> New listing
          </div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>List your clinic on NEXUS</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.65, maxWidth: 480 }}>Free for FQHCs, free clinics, and nonprofit health centers. We verify your NPI to protect patients.</p>
        </div>

        {/* Progress */}
        {step !== 'done' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
            {STEPS_META.map((s, i) => {
              const done = i < stepIdx; const active = s.id === step
              return (
                <React.Fragment key={s.id}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: done ? 'rgba(52,211,153,0.12)' : active ? 'rgba(79,142,240,0.12)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${done ? '#34d399' : active ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`, color: done ? '#34d399' : active ? 'var(--accent)' : 'var(--text-4)' }}>
                      {done ? <TickCircle size={11} color="#34d399" variant="Bold" /> : i + 1}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? 'var(--text)' : 'var(--text-4)', whiteSpace: 'nowrap' }}>{s.label}</span>
                  </div>
                  {i < STEPS_META.length - 1 && <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 6px', marginBottom: 16 }} />}
                </React.Fragment>
              )
            })}
          </div>
        )}

        {/* Card */}
        <div style={{ borderRadius: 18, padding: 28, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Step 1: NPI lookup */}
          {step === 'npi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Look up your NPI</h2>
                <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65 }}>Enter your 10-digit National Provider Identifier. We verify it against the NPPES registry to pre-fill your details.</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, borderRadius: 10, padding: '1.5px', background: npiError ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.08)', transition: 'background 0.2s' }}>
                  <input
                    value={npi}
                    onChange={e => { setNpi(e.target.value.replace(/\D/g, '').slice(0, 10)); setNpiError('') }}
                    placeholder="1234567890"
                    style={{ width: '100%', background: 'var(--bg)', border: 'none', outline: 'none', borderRadius: 9, padding: '12px 14px', fontSize: 14, color: 'var(--text)', fontFamily: 'monospace', letterSpacing: '0.12em', boxSizing: 'border-box' }}
                  />
                </div>
                <button onClick={lookupNpi} disabled={npiLoading || npi.length !== 10} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, border: 'none', cursor: npi.length === 10 ? 'pointer' : 'default', background: npi.length === 10 ? 'var(--accent)' : 'rgba(255,255,255,0.07)', color: npi.length === 10 ? '#fff' : 'var(--text-4)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.2s' }}>
                  <SearchNormal1 size={13} color="currentColor" />
                  {npiLoading ? 'Looking up…' : 'Verify NPI'}
                </button>
              </div>
              {npiError && <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{npiError}</p>}
              <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(79,142,240,0.05)', border: '1px solid rgba(79,142,240,0.14)', display: 'flex', gap: 8 }}>
                <InfoCircle size={13} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                  Don't know your NPI? Find it at <strong style={{ color: 'var(--accent)' }}>nppes.cms.hhs.gov</strong>. For demo, try <strong style={{ color: 'var(--accent)' }}>1234567890</strong>.
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Confirm NPI data */}
          {step === 'confirm' && npiData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)' }}>
                <ShieldTick size={16} color="#34d399" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>NPI verified — NPPES registry match found</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Confirm your organization</h2>
              {[
                { label: 'Organization name', val: npiData.name },
                { label: 'Type', val: npiData.type },
                { label: 'Address', val: `${npiData.address}, ${npiData.city}, ${npiData.state} ${npiData.zip}` },
                { label: 'Phone', val: npiData.phone },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-4)' }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{row.val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-4)' }}>Your name & role</label>
                <div style={{ borderRadius: 10, padding: '1.5px', background: 'rgba(255,255,255,0.08)' }}>
                  <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="e.g. Jane Smith, Operations Manager" style={{ width: '100%', background: 'var(--bg)', border: 'none', outline: 'none', borderRadius: 9, padding: '12px 14px', fontSize: 14, color: 'var(--text)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-4)' }}>Work email</label>
                <div style={{ borderRadius: 10, padding: '1.5px', background: 'rgba(255,255,255,0.08)' }}>
                  <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="you@clinic.org" style={{ width: '100%', background: 'var(--bg)', border: 'none', outline: 'none', borderRadius: 9, padding: '12px 14px', fontSize: 14, color: 'var(--text)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {step === 'services' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Services, insurance & languages</h2>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Services offered</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {SERVICES.map(s => <Chip key={s} label={s} on={services.has(s)} onClick={() => toggleSet(services, s, setServices)} />)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Insurance & payment</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {INSURANCE.map(s => <Chip key={s} label={s} on={insurance.has(s)} onClick={() => toggleSet(insurance, s, setInsurance)} color="#34d399" />)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Non-English languages spoken by staff</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {LANGUAGES.map(s => <Chip key={s} label={s} on={languages.has(s)} onClick={() => toggleSet(languages, s, setLanguages)} color="#a78bfa" />)}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Access options</div>
                {[
                  { label: 'FQHC or FQHC Look-Alike', val: isFQHC, set: setIsFQHC },
                  { label: 'Sliding scale fees',       val: sliding,  set: setSliding  },
                  { label: 'Free care available',       val: free,     set: setFree     },
                ].map(item => (
                  <label key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
                    <div onClick={() => item.set(!item.val)} style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, background: item.val ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${item.val ? '#34d399' : 'rgba(255,255,255,0.14)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      {item.val && <TickCircle size={9} color="#34d399" variant="Bold" />}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Access / submit */}
          {step === 'access' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Review & submit</h2>
              <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Organization', val: npiData?.name ?? '—' },
                  { label: 'NPI', val: npi },
                  { label: 'Services', val: services.size ? `${services.size} selected` : '—' },
                  { label: 'Insurance', val: insurance.size ? `${insurance.size} selected` : '—' },
                  { label: 'Languages', val: languages.size ? `${languages.size} selected` : 'English only' },
                  { label: 'Access flags', val: [isFQHC && 'FQHC', sliding && 'Sliding scale', free && 'Free care'].filter(Boolean).join(', ') || '—' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{row.val}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.14)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#34d399', marginBottom: 8 }}>After submission</div>
                {['NPI verified with NPPES (1 business day)', 'NEXUS team contacts you to confirm details', 'Clinic goes live on the directory within 3–5 days'].map((s, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>· {s}</div>
                ))}
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
                <div onClick={() => setAttestation(!attestation)} style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, marginTop: 1, background: attestation ? 'rgba(79,142,240,0.12)' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${attestation ? 'var(--accent)' : 'rgba(255,255,255,0.14)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {attestation && <TickCircle size={9} color="var(--accent)" variant="Bold" />}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>I'm an authorized representative of this organization and all information is accurate.</span>
              </label>
            </div>
          )}

          {/* Done */}
          {step === 'done' && submitted && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px', background: 'rgba(52,211,153,0.1)', border: '2px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TickCircle size={24} color="#34d399" variant="Bold" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Application submitted!</h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65, maxWidth: 380, margin: '0 auto 24px' }}>
                We&apos;ve received the listing for <strong>{npiData?.name}</strong>. Expect an email at <strong>{contactEmail}</strong> within 1 business day.
              </p>
              <Link href="/provider" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, textDecoration: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                Go to Provider Hub <ArrowRight2 size={12} color="currentColor" />
              </Link>
            </div>
          )}

          {/* Navigation */}
          {step !== 'done' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {step !== 'npi' ? (
                <button onClick={prev} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-3)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Back</button>
              ) : <span />}
              {step === 'access' ? (
                <button onClick={submit} disabled={!attestation} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 10, border: 'none', background: attestation ? '#34d399' : 'rgba(255,255,255,0.07)', color: attestation ? '#000' : 'var(--text-4)', fontSize: 13, fontWeight: 600, cursor: attestation ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                  <DocumentText size={13} color="currentColor" /> Submit listing
                </button>
              ) : step !== 'npi' ? (
                <button onClick={next} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Continue <ArrowRight2 size={12} color="currentColor" />
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
