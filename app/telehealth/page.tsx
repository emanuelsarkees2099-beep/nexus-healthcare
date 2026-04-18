'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'
import { Video, Phone, MessageCircle, Clock, Shield, Globe, ChevronRight, ExternalLink, CheckCircle, AlertCircle, Hospital, Pill, Landmark, Brain, PhoneCall, HeartPulse } from 'lucide-react'

const PROVIDERS = [
  {
    name: 'Teladoc Health',
    logo: <Hospital size={22} strokeWidth={1.5} />,
    cost: 'Free – $75',
    wait: '< 10 min',
    available: '24/7',
    accepts: ['Uninsured', 'Medicaid', 'Medicare', 'Most insurance'],
    specialties: ['Primary care', 'Mental health', 'Dermatology', 'Nutrition'],
    languages: ['English', 'Español', 'French'],
    url: 'https://www.teladoc.com',
    note: 'Sliding scale available for uninsured patients',
    verified: true,
  },
  {
    name: 'MDLIVE',
    logo: <Pill size={22} strokeWidth={1.5} />,
    cost: 'Free – $82',
    wait: '< 15 min',
    available: '24/7',
    accepts: ['Uninsured', 'Medicaid', 'Most insurance'],
    specialties: ['Urgent care', 'Mental health', 'Dermatology'],
    languages: ['English', 'Español'],
    url: 'https://www.mdlive.com',
    note: 'MDLIVE Cares program offers reduced fees',
    verified: true,
  },
  {
    name: 'Federally Qualified Health Centers (FQHC)',
    logo: <Landmark size={22} strokeWidth={1.5} />,
    cost: '$0 – sliding scale',
    wait: '1–3 days',
    available: 'By appointment',
    accepts: ['Uninsured', 'Medicaid', 'Medicare', 'CHIP'],
    specialties: ['Primary care', 'Behavioral health', 'OB/GYN', 'Dental', 'Pediatrics'],
    languages: ['English', 'Español', '+ 40 languages'],
    url: 'https://findahealthcenter.hrsa.gov',
    note: 'Required by law to serve everyone regardless of ability to pay',
    verified: true,
  },
  {
    name: 'Open Path Collective',
    logo: <Brain size={22} strokeWidth={1.5} />,
    cost: '$30 – $80 per session',
    wait: '2–5 days',
    available: 'By appointment',
    accepts: ['Uninsured', 'Self-pay'],
    specialties: ['Mental health', 'Therapy', 'Couples counseling', 'Teen support'],
    languages: ['English', 'Español', 'Mandarin', 'Arabic'],
    url: 'https://openpathcollective.org',
    note: 'Licensed therapists at below-market rates',
    verified: true,
  },
  {
    name: 'Crisis Text Line',
    logo: <HeartPulse size={22} strokeWidth={1.5} />,
    cost: 'Free',
    wait: 'Instant',
    available: '24/7',
    accepts: ['Everyone'],
    specialties: ['Mental health crisis', 'Suicide prevention', 'Anxiety', 'Depression'],
    languages: ['English', 'Español'],
    url: 'https://www.crisistextline.org',
    note: 'Text HOME to 741741 — free, confidential, 24/7',
    verified: true,
  },
  {
    name: 'SAMHSA Helpline',
    logo: <PhoneCall size={22} strokeWidth={1.5} />,
    cost: 'Free',
    wait: 'Instant',
    available: '24/7 365 days',
    accepts: ['Everyone'],
    specialties: ['Substance use', 'Mental health', 'Treatment referrals'],
    languages: ['English', 'Español'],
    url: 'https://www.samhsa.gov/find-help/national-helpline',
    note: 'Call 1-800-662-4357 — confidential, free, no insurance needed',
    verified: true,
  },
]

const HOW_IT_WORKS = [
  { step: '01', icon: <Globe size={18} strokeWidth={1.5} />, title: 'Choose a provider', body: 'Browse real telehealth services that accept uninsured and low-income patients. Every provider listed is verified.' },
  { step: '02', icon: <Shield size={18} strokeWidth={1.5} />, title: 'Confirm eligibility', body: 'Most services accept patients regardless of insurance. FQHC clinics are federally required to serve everyone.' },
  { step: '03', icon: <Video size={18} strokeWidth={1.5} />, title: 'Connect from anywhere', body: 'Visit by phone, video, or secure message. No commute, no waiting room — just care from where you are.' },
  { step: '04', icon: <CheckCircle size={18} strokeWidth={1.5} />, title: 'Follow-up support', body: 'After your visit, your CHW can help you understand prescriptions, referrals, and next steps.' },
]

const EMERGENCY = {
  crisis: { label: 'Mental Health Crisis', action: 'Call or text 988', href: 'tel:988', color: '#f87171' },
  emergency: { label: 'Medical Emergency', action: 'Call 911', href: 'tel:911', color: '#fb923c' },
  poison: { label: 'Poison Control', action: 'Call 1-800-222-1222', href: 'tel:18002221222', color: '#facc15' },
}

export default function TelehealthPage() {
  const [filter, setFilter] = useState<'all' | 'free' | 'mental' | 'crisis'>('all')
  const [expanded, setExpanded] = useState<number | null>(null)

  const filtered = PROVIDERS.filter(p => {
    if (filter === 'free') return p.cost.startsWith('Free') || p.cost.startsWith('$0')
    if (filter === 'mental') return p.specialties.some(s => s.toLowerCase().includes('mental') || s.toLowerCase().includes('ther') || s.toLowerCase().includes('crisis'))
    if (filter === 'crisis') return p.available === '24/7' || p.available.includes('24/7')
    return true
  })

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: '#07070F', paddingTop: '100px' }}>

        {/* ── HERO ─────────────────────────────── */}
        <section style={{ padding: '60px 24px 40px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(109,145,151,0.1)', border: '1px solid rgba(109,145,151,0.2)', borderRadius: '100px', fontSize: '11px', color: '#6d9197', letterSpacing: '0.06em', marginBottom: '24px' }}>
              <Video size={10} strokeWidth={1.5} /> TELEHEALTH ACCESS
            </span>
            <h1 style={{ fontSize: 'clamp(34px, 6vw, 64px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px', color: '#fff' }}>
              See a doctor.<br />
              <span style={{ color: '#6d9197' }}>From anywhere.</span>
            </h1>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: '36px' }}>
              Real telehealth services that accept uninsured and low-income patients. No insurance required. Many are free or sliding-scale.
            </p>

            {/* Emergency banner */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
              {Object.values(EMERGENCY).map(e => (
                <a key={e.label} href={e.href} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: `${e.color}15`, border: `1px solid ${e.color}40`, borderRadius: '10px', textDecoration: 'none', color: e.color, fontSize: '13px', fontWeight: 600 }}>
                  <AlertCircle size={13} /> {e.label} — {e.action}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────── */}
        <section style={{ padding: '60px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '32px', color: '#fff' }}>How it works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {HOW_IT_WORKS.map((step) => (
                <div key={step.step} style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(109,145,151,0.5)', fontWeight: 700 }}>{step.step}</span>
                    <span style={{ color: '#6d9197' }}>{step.icon}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#eef4f5', marginBottom: '8px' }}>{step.title}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{step.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROVIDERS ────────────────────────── */}
        <section style={{ padding: '60px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Verified providers</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['all', 'free', 'mental', 'crisis'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid', transition: 'all 0.2s', background: filter === f ? '#6d9197' : 'transparent', color: filter === f ? '#07070F' : 'rgba(255,255,255,0.5)', borderColor: filter === f ? '#6d9197' : 'rgba(255,255,255,0.1)' }}>
                    {f === 'all' ? 'All' : f === 'free' ? 'Free / $0' : f === 'mental' ? 'Mental health' : '24/7 Crisis'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map((p, i) => (
                <div key={p.name} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(109,145,151,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>

                  {/* Header row */}
                  <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === i ? null : i)}>
                    <span style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(109,145,151,0.1)', border: '1px solid rgba(109,145,151,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6d9197', flexShrink: 0 }}>{p.logo}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#eef4f5' }}>{p.name}</span>
                        {p.verified && <span style={{ fontSize: '10px', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '2px 7px', borderRadius: '100px', border: '1px solid rgba(74,222,128,0.2)' }}>✓ Verified</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: '#6d9197', fontWeight: 600 }}>{p.cost}</span>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Wait: {p.wait}</span>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>{p.available}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.3)', transform: expanded === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>

                  {/* Expanded details */}
                  {expanded === i && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ paddingTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.05em' }}>ACCEPTS</div>
                          {p.accepts.map(a => <div key={a} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>• {a}</div>)}
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.05em' }}>SPECIALTIES</div>
                          {p.specialties.map(s => <div key={s} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>• {s}</div>)}
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.05em' }}>LANGUAGES</div>
                          {p.languages.map(l => <div key={l} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>• {l}</div>)}
                        </div>
                      </div>

                      {p.note && (
                        <div style={{ padding: '10px 14px', background: 'rgba(109,145,151,0.06)', borderRadius: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', borderLeft: '2px solid rgba(109,145,151,0.3)' }}>
                          <span style={{ color: '#6d9197', fontWeight: 600 }}>Note: </span>{p.note}
                        </div>
                      )}

                      <a href={p.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: '#6d9197', color: '#07070F', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
                        Access {p.name} <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUICK CONTACTS ───────────────────── */}
        <section style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Need help right now?</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '28px' }}>Free hotlines — available 24/7, no insurance needed</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Suicide & Crisis Lifeline', number: '988', href: 'tel:988', color: '#f87171' },
                { label: 'Crisis Text Line', number: 'Text HOME to 741741', href: 'sms:741741?body=HOME', color: '#fb923c' },
                { label: 'SAMHSA Substance Use', number: '1-800-662-4357', href: 'tel:18006624357', color: '#facc15' },
                { label: 'National Domestic Violence', number: '1-800-799-7233', href: 'tel:18007997233', color: '#a78bfa' },
                { label: 'FQHC Health Center Finder', number: 'findahealthcenter.hrsa.gov', href: 'https://findahealthcenter.hrsa.gov', color: '#6d9197' },
                { label: 'Medicaid Enrollment Help', number: '1-800-318-2596', href: 'tel:18003182596', color: '#34d399' },
              ].map(c => (
                <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = `${c.color}30` }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{c.label}</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: c.color }}>{c.number}</div>
                  </div>
                  <Phone size={16} style={{ color: c.color, opacity: 0.6 }} />
                </a>
              ))}
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  )
}
