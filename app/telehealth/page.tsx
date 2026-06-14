'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'
import { Video, Call, MessageCircle, Clock, Shield, Global, ArrowRight2, ExportSquare, TickCircle, InfoCircle, Hospital, Health, Buildings, CallCalling, HeartCircle, Calendar1, Copy, ArrowDown2, MagicStar, Book1, Profile2User } from 'iconsax-react'

const PROVIDERS = [
  {
    name: 'Teladoc Health',
    logo: <Hospital size={22} variant="Linear" />,
    cost: 'Free – $75',
    wait: '< 10 min',
    available: '24/7',
    accepts: ['Uninsured', 'Medicaid', 'Medicare', 'Most insurance'],
    specialties: ['Primary care', 'Mental health', 'Dermatology', 'Nutrition'],
    specialtyTags: ['primary', 'mental', 'dermatology'],
    languages: ['English', 'Español', 'French'],
    url: 'https://www.teladoc.com',
    bookingUrl: 'https://member.teladoc.com/registrations/get_started',
    note: 'Sliding scale available for uninsured patients',
    verified: true,
  },
  {
    name: 'MDLIVE',
    logo: <Health size={22} variant="Linear" />,
    cost: 'Free – $82',
    wait: '< 15 min',
    available: '24/7',
    accepts: ['Uninsured', 'Medicaid', 'Most insurance'],
    specialties: ['Urgent care', 'Mental health', 'Dermatology'],
    specialtyTags: ['urgent', 'mental', 'dermatology'],
    languages: ['English', 'Español'],
    url: 'https://www.mdlive.com',
    bookingUrl: 'https://patient.mdlive.com/create_account',
    note: 'MDLIVE Cares program offers reduced fees for uninsured patients',
    verified: true,
  },
  {
    name: 'Federally Qualified Health Centers (FQHC)',
    logo: <Buildings size={22} variant="Linear" />,
    cost: '$0 – sliding scale',
    wait: '1–3 days',
    available: 'By appointment',
    accepts: ['Uninsured', 'Medicaid', 'Medicare', 'CHIP'],
    specialties: ['Primary care', 'Behavioral health', 'OB/GYN', 'Dental', 'Pediatrics'],
    specialtyTags: ['primary', 'mental', 'dental', 'ob-gyn', 'pediatric'],
    languages: ['English', 'Español', '+ 40 languages'],
    url: 'https://findahealthcenter.hrsa.gov',
    bookingUrl: 'https://findahealthcenter.hrsa.gov',
    note: 'Required by law to serve everyone regardless of ability to pay. Call your nearest FQHC to book.',
    verified: true,
  },
  {
    name: 'Open Path Collective',
    logo: <Health size={22} variant="Linear" />,
    cost: '$30 – $80 per session',
    wait: '2–5 days',
    available: 'By appointment',
    accepts: ['Uninsured', 'Self-pay'],
    specialties: ['Mental health', 'Therapy', 'Couples counseling', 'Teen support'],
    specialtyTags: ['mental', 'therapy'],
    languages: ['English', 'Español', 'Mandarin', 'Arabic'],
    url: 'https://openpathcollective.org',
    bookingUrl: 'https://openpathcollective.org/get-started/',
    note: 'Licensed therapists at below-market rates. One-time $65 membership, then $30–$80/session.',
    verified: true,
  },
  {
    name: 'Planned Parenthood Telehealth',
    logo: <Profile2User size={22} variant="Linear" />,
    cost: 'Free – sliding scale',
    wait: 'Same day – 1 day',
    available: 'Mon–Sat',
    accepts: ['Uninsured', 'Medicaid', 'Most insurance', 'Self-pay'],
    specialties: ['OB/GYN', 'Reproductive health', 'STI testing', 'Birth control', 'Prenatal referrals'],
    specialtyTags: ['ob-gyn', 'women', 'reproductive'],
    languages: ['English', 'Español'],
    url: 'https://www.plannedparenthood.org/get-care/telehealth',
    bookingUrl: 'https://www.plannedparenthood.org/get-care/telehealth',
    note: 'Accepts most Medicaid plans. Sliding scale fees for uninsured patients. Visit online for your state.',
    verified: true,
  },
  {
    name: 'Crisis Text Line',
    logo: <HeartCircle size={22} variant="Linear" />,
    cost: 'Free',
    wait: 'Instant',
    available: '24/7',
    accepts: ['Everyone'],
    specialties: ['Mental health crisis', 'Suicide prevention', 'Anxiety', 'Depression'],
    specialtyTags: ['mental', 'crisis'],
    languages: ['English', 'Español'],
    url: 'https://www.crisistextline.org',
    bookingUrl: null,
    note: 'Text HOME to 741741 — free, confidential, 24/7. No account needed.',
    verified: true,
  },
  {
    name: 'SAMHSA Helpline',
    logo: <CallCalling size={22} variant="Linear" />,
    cost: 'Free',
    wait: 'Instant',
    available: '24/7 365 days',
    accepts: ['Everyone'],
    specialties: ['Substance use', 'Mental health', 'Treatment referrals'],
    specialtyTags: ['substance', 'mental', 'crisis'],
    languages: ['English', 'Español'],
    url: 'https://www.samhsa.gov/find-help/national-helpline',
    bookingUrl: null,
    note: 'Call 1-800-662-4357 — confidential, free, no insurance or ID required.',
    verified: true,
  },
]

/* ── Specialty filter definitions ───────────────── */
const SPECIALTY_FILTERS = [
  { value: 'all',        label: 'All providers'    },
  { value: 'free',       label: 'Free / $0'        },
  { value: 'mental',     label: 'Mental health'    },
  { value: 'crisis',     label: '24/7 Crisis'      },
  { value: 'primary',    label: 'Primary care'     },
  { value: 'dental',     label: 'Dental'           },
  { value: 'ob-gyn',     label: 'OB/GYN'           },
  { value: 'pediatric',  label: 'Pediatric'        },
  { value: 'substance',  label: 'Substance use'    },
]

/* ── "What to say" insurance scripts ─────────────── */
const SCRIPTS = [
  {
    id: 'uninsured',
    title: 'When you have no insurance',
    badge: 'Most common',
    badgeColor: 'var(--accent)',
    steps: [
      { prompt: 'When asked about insurance, say:', script: '"I don\'t currently have insurance. Do you have a sliding-scale fee program or can you tell me the self-pay rate?"' },
      { prompt: 'If they say self-pay rates are high, ask:', script: '"Are you a Federally Qualified Health Center? I understand you\'re required to offer sliding-scale fees based on income."' },
      { prompt: 'To unlock Medicaid fast-track, ask:', script: '"I may qualify for Medicaid. Can you help me apply or connect me with a navigator while I wait for my appointment?"' },
    ],
  },
  {
    id: 'cobra',
    title: 'When you\'re on COBRA (too expensive)',
    badge: 'Recently uninsured',
    badgeColor: '#60a5fa',
    steps: [
      { prompt: 'Mention your recent coverage loss:', script: '"I recently lost my employer coverage and I\'m on COBRA, but I can\'t afford the premiums. I have a 60-day Special Enrollment Period — can you see me as self-pay while I sort out a marketplace plan?"' },
      { prompt: 'Ask about ACA options:', script: '"Can you refer me to an enrollment navigator who can help me find a marketplace plan with premium tax credits? My income may qualify me for subsidized coverage."' },
    ],
  },
  {
    id: 'medicaid-gap',
    title: 'If you\'re in the Medicaid coverage gap',
    badge: 'Non-expansion states',
    badgeColor: '#fbbf24',
    steps: [
      { prompt: 'Explain your situation:', script: '"I earn too much for Medicaid in my state, but not enough for an ACA subsidy. I\'m in what\'s called the \'coverage gap.\' What options do I have for affordable care?"' },
      { prompt: 'Ask about FQHC sliding scale:', script: '"Do you operate on a sliding-scale fee schedule? I understand federally funded health centers are required to serve patients at reduced rates based on income."' },
      { prompt: 'Ask about free care programs:', script: '"Are there any charity care programs or state-funded programs you can connect me with? Even a one-time visit credit would help."' },
    ],
  },
]

const HOW_IT_WORKS = [
  { step: '01', icon: <Global size={18} variant="Linear" />, title: 'Choose a provider', body: 'Browse real telehealth services that accept uninsured and low-income patients. Every provider listed is verified.' },
  { step: '02', icon: <Shield size={18} variant="Linear" />, title: 'Confirm eligibility', body: 'Most services accept patients regardless of insurance. FQHC clinics are federally required to serve everyone.' },
  { step: '03', icon: <Video size={18} variant="Linear" />, title: 'Connect from anywhere', body: 'Visit by phone, video, or secure message. No commute, no waiting room — just care from where you are.' },
  { step: '04', icon: <TickCircle size={18} variant="Linear" />, title: 'Follow-up support', body: 'After your visit, your CHW can help you understand prescriptions, referrals, and next steps.' },
]

const EMERGENCY = {
  crisis: { label: 'Mental Health Crisis', action: 'Call or text 988', href: 'tel:988', color: '#f87171' },
  emergency: { label: 'Medical Emergency', action: 'Call 911', href: 'tel:911', color: '#fb923c' },
  poison: { label: 'Poison Control', action: 'Call 1-800-222-1222', href: 'tel:18002221222', color: '#facc15' },
}

/* #29 — Language filter options */
const LANG_FILTERS = ['All languages', 'Español', 'French', '40+ languages']

export default function TelehealthPage() {
  const [filter,       setFilter]       = useState('all')
  const [langFilter,   setLangFilter]   = useState('All languages')
  const [expanded,     setExpanded]     = useState<number | null>(null)
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const [expandedScript, setExpandedScript] = useState<string | null>(null)

  const filtered = PROVIDERS.filter(p => {
    if (filter === 'all' && langFilter === 'All languages') return true
    const matchSpec = filter === 'all'
      ? true
      : filter === 'free'
      ? p.cost.startsWith('Free') || p.cost.startsWith('$0')
      : filter === 'crisis'
      ? p.available === '24/7' || p.available.includes('24/7')
      : p.specialtyTags.includes(filter)
    const matchLang = langFilter === 'All languages'
      ? true
      : p.languages.some(l => l.toLowerCase().includes(langFilter.toLowerCase()) || l.includes('+'))
    return matchSpec && matchLang
  })

  function copyScript(id: string, text: string) {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopiedScript(id)
    setTimeout(() => setCopiedScript(null), 2000)
  }

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: '#07070F', paddingTop: '100px' }}>

        {/* ── HERO ─────────────────────────────── */}
        <section style={{ padding: '60px 24px 40px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '100px', fontSize: '11px', color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: '24px' }}>
              <Video size={14} variant="Linear" /> TELEHEALTH ACCESS
            </span>
            <h1 style={{ fontSize: 'clamp(34px, 6vw, 64px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px', color: '#fff' }}>
              See a doctor.<br />
              <span style={{ color: 'var(--accent)' }}>From anywhere.</span>
            </h1>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: '36px' }}>
              Real telehealth services that accept uninsured and low-income patients. No insurance required. Many are free or sliding-scale.
            </p>

            {/* Emergency banner */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
              {Object.values(EMERGENCY).map(e => (
                <a key={e.label} href={e.href} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: `${e.color}15`, border: `1px solid ${e.color}40`, borderRadius: '10px', textDecoration: 'none', color: e.color, fontSize: '13px', fontWeight: 600 }}>
                  <InfoCircle size={13} /> {e.label} — {e.action}
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
                    <span style={{ fontSize: '11px', color: 'rgba(74,144,217,0.5)', fontWeight: 700 }}>{step.step}</span>
                    <span style={{ color: 'var(--accent)' }}>{step.icon}</span>
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
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Verified providers</h2>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {SPECIALTY_FILTERS.map(f => (
                    <button key={f.value} onClick={() => setFilter(f.value)} style={{ padding: '7px 13px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid', transition: 'all 0.18s', background: filter === f.value ? 'var(--accent)' : 'transparent', color: filter === f.value ? '#07070F' : 'rgba(255,255,255,0.5)', borderColor: filter === f.value ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* #29 — Language filter row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-inter)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Global size={11} color="rgba(255,255,255,0.45)" /> Language:
                </span>
                {LANG_FILTERS.map(l => (
                  <button
                    key={l}
                    onClick={() => setLangFilter(l)}
                    style={{
                      padding: '4px 11px', borderRadius: '100px', fontSize: '11px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit', border: '1px solid', transition: 'all 0.15s',
                      background: langFilter === l ? 'rgba(167,139,250,0.12)' : 'transparent',
                      color: langFilter === l ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                      borderColor: langFilter === l ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost guide */}
            <div style={{ marginBottom: '20px', padding: '16px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>What you'll pay</span>
              {([
                { range: '$0', label: 'With Medicaid / CHIP', color: '#34d399' },
                { range: '$0–$35', label: 'FQHC sliding scale', color: '#60a5fa' },
                { range: '$30–$80', label: 'Self-pay telehealth', color: '#fbbf24' },
              ] as const).map(tier => (
                <div key={tier.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: tier.color, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{tier.range}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>{tier.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '12px' }}>·</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map((p, i) => (
                <div key={p.name} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(74,144,217,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>

                  {/* Header row */}
                  <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === i ? null : i)}>
                    <span style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>{p.logo}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#eef4f5' }}>{p.name}</span>
                        {p.verified && <span style={{ fontSize: '10px', color: '#60a5fa', background: 'rgba(96,165,250,0.1)', padding: '2px 7px', borderRadius: '100px', border: '1px solid rgba(96,165,250,0.2)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><TickCircle size={9} variant="Bold" aria-hidden="true" /> Verified</span>}
                        {i === 0 && <span style={{ fontSize: '10px', color: '#34d399', background: 'rgba(52,211,153,0.10)', padding: '2px 7px', borderRadius: '100px', border: '1px solid rgba(52,211,153,0.22)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>★ Best match</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>{p.cost}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: p.wait === 'Instant' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.08)', color: p.wait === 'Instant' ? '#34d399' : '#fbbf24', border: `1px solid ${p.wait === 'Instant' ? 'rgba(52,211,153,0.30)' : 'rgba(251,191,36,0.20)'}` }}>
                          <Clock size={9} variant="Linear" /> {p.wait}
                        </span>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>{p.available}</span>
                      </div>
                    </div>
                    <ArrowRight2 size={16} style={{ color: 'rgba(255,255,255,0.3)', transform: expanded === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
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
                        <div style={{ padding: '10px 14px', background: 'rgba(74,144,217,0.06)', borderRadius: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', borderLeft: '2px solid rgba(74,144,217,0.3)' }}>
                          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Note: </span>{p.note}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {p.bookingUrl && (
                          <a href={p.bookingUrl} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: 'var(--accent)', color: '#07070F', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', transition: 'opacity 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                            <Calendar1 size={14} color="#07070F" variant="Linear" /> Book a visit <ExportSquare size={12} color="#07070F" />
                          </a>
                        )}
                        <a href={p.url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}>
                          Learn more <ExportSquare size={12} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT TO SAY SCRIPTS ──────────────── */}
        <section style={{ padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ marginBottom: '36px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '100px', fontSize: '11px', color: '#fbbf24', letterSpacing: '0.06em', marginBottom: '20px' }}>
                <MagicStar size={14} variant="Linear" /> WHAT TO SAY
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Calling without insurance? Use these scripts.
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.65, maxWidth: '520px' }}>
                The right words unlock sliding-scale fees, charity care, and Medicaid fast-tracks that aren't advertised. Copy these scripts and read them word-for-word.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SCRIPTS.map(script => (
                <div key={script.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', overflow: 'hidden', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(251,191,36,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                  <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
                    onClick={() => setExpandedScript(expandedScript === script.id ? null : script.id)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#eef4f5' }}>{script.title}</span>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', background: `${script.badgeColor}15`, border: `1px solid ${script.badgeColor}30`, color: script.badgeColor, fontWeight: 600 }}>{script.badge}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{script.steps.length} talking points</span>
                    </div>
                    <ArrowDown2 size={15} style={{ color: 'rgba(255,255,255,0.3)', transform: expandedScript === script.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', flexShrink: 0 }} />
                  </div>

                  {expandedScript === script.id && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
                        {script.steps.map((step, si) => (
                          <div key={si} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fbbf24', flexShrink: 0 }}>{si + 1}</span>
                              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{step.prompt}</span>
                            </div>
                            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <p style={{ flex: 1, fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{step.script}</p>
                              <button
                                onClick={() => copyScript(`${script.id}-${si}`, step.script)}
                                title="Copy to clipboard"
                                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid', background: copiedScript === `${script.id}-${si}` ? 'rgba(74,144,217,0.1)' : 'rgba(255,255,255,0.03)', color: copiedScript === `${script.id}-${si}` ? 'var(--accent)' : 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', borderColor: copiedScript === `${script.id}-${si}` ? 'rgba(74,144,217,0.3)' : 'rgba(255,255,255,0.08)', flexShrink: 0, fontFamily: 'inherit' }}>
                                {copiedScript === `${script.id}-${si}` ? <TickCircle size={13} color="var(--accent)" variant="Linear" /> : <Copy size={13} color="rgba(255,255,255,0.45)" variant="Linear" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)', borderRadius: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <Book1 size={13} style={{ color: '#fbbf24', marginTop: '1px', flexShrink: 0 }} variant="Linear" />
                        <span>These scripts are based on patient rights under federal law. FQHCs are required to offer sliding-scale fees under Section 330 of the Public Health Service Act.</span>
                      </div>
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
                { label: 'FQHC Health Center Finder', number: 'findahealthcenter.hrsa.gov', href: 'https://findahealthcenter.hrsa.gov', color: 'var(--accent)' },
                { label: 'Medicaid Enrollment Help', number: '1-800-318-2596', href: 'tel:18003182596', color: '#60a5fa' },
              ].map(c => (
                <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = `${c.color}30` }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{c.label}</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: c.color }}>{c.number}</div>
                  </div>
                  <Call size={16} style={{ color: c.color, opacity: 0.6 }} />
                </a>
              ))}
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  )
}
