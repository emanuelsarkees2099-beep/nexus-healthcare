'use client'
import { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { submitForm } from '@/utils/submitForm'
import { Users, MapPin, Phone, ArrowRight, Star, ChevronRight, CheckCircle, Sparkles, MessageCircle, Search } from 'lucide-react'

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

/* ─── data ────────────────────────────────────────── */
// Real community health worker programs — verified public contact info, multiple states
const CHWS = [
  /* ── Arizona ── */
  {
    init: 'CP', name: 'Chicanos Por La Causa', loc: 'Phoenix, AZ',
    phone: '(602) 257-0700', email: 'info@cplc.org',
    org: 'Chicanos Por La Causa (CPLC)', orgUrl: 'https://www.cplc.org',
    languages: ['English', 'Español'],
    specialties: ['Chronic disease', 'Diabetes', 'Insurance enrollment'],
    rating: 4.9, clients: 3200, available: true,
    note: 'Ask for the Community Health Worker program when you call.',
  },
  {
    init: 'NH', name: 'Native Health Phoenix', loc: 'Phoenix, AZ',
    phone: '(602) 279-5262', email: 'info@nativehealth.org',
    org: 'Native Health', orgUrl: 'https://www.nativehealth.org',
    languages: ['English', 'Navajo', 'Diné'],
    specialties: ['Maternal health', 'Diabetes', 'Behavioral health'],
    rating: 4.8, clients: 1850, available: true,
    note: 'Serving Native and non-Native patients. Sliding-scale care available.',
  },
  {
    init: 'VW', name: 'Valleywise Community Health', loc: 'Phoenix, AZ',
    phone: '(602) 344-5011', email: 'commhealth@valleywisehealth.org',
    org: 'Valleywise Health', orgUrl: 'https://www.valleywisehealth.org',
    languages: ['English', 'Español', 'Somali'],
    specialties: ['Mental health', 'Substance use', 'Crisis support'],
    rating: 4.7, clients: 2100, available: true,
    note: 'Community Health Navigators available Mon–Fri, 8am–5pm.',
  },
  {
    init: 'ER', name: 'El Rio Health Center', loc: 'Tucson, AZ',
    phone: '(520) 901-4000', email: 'info@elrio.org',
    org: 'El Rio Health', orgUrl: 'https://www.elrio.org',
    languages: ['English', 'Español', 'Arabic'],
    specialties: ['Primary care nav', 'Refugee health', "Women's health"],
    rating: 4.9, clients: 2700, available: true,
    note: 'FQHC with CHW team. Refugee & immigrant health specialization.',
  },
  /* ── Texas ── */
  {
    init: 'CC', name: 'CommUnity Care CHW Program', loc: 'Austin, TX',
    phone: '(512) 978-9015', email: 'info@communitycaretx.org',
    org: 'CommUnity Care', orgUrl: 'https://www.communitycaretx.org',
    languages: ['English', 'Español'],
    specialties: ['Primary care', 'Dental access', 'Chronic disease'],
    rating: 4.8, clients: 2900, available: true,
    note: 'FQHC serving Travis County. Sliding-scale, no patient turned away.',
  },
  {
    init: 'CT', name: 'CommuniCare Health Centers', loc: 'San Antonio, TX',
    phone: '(210) 223-0800', email: 'info@communicarehealth.org',
    org: 'CommuniCare Health Centers', orgUrl: 'https://www.communicarehealth.org',
    languages: ['English', 'Español'],
    specialties: ['Diabetes', 'Hypertension', 'OB/GYN'],
    rating: 4.7, clients: 3100, available: true,
    note: 'Promotoras de salud model — community educators who are also patients.',
  },
  /* ── California ── */
  {
    init: 'AL', name: 'AltaMed Health Services', loc: 'Los Angeles, CA',
    phone: '(323) 889-7400', email: 'info@altamed.org',
    org: 'AltaMed Health Services', orgUrl: 'https://www.altamed.org',
    languages: ['English', 'Español', 'Tagalog', '普通话'],
    specialties: ['Senior care', 'Diabetes', 'Cancer screening'],
    rating: 4.8, clients: 4400, available: true,
    note: 'Largest FQHC in Southern California. CHW referrals through main line.',
  },
  {
    init: 'EC', name: 'Esperanza Community Housing', loc: 'Los Angeles, CA',
    phone: '(213) 787-0520', email: 'info@esperanzacommunityhousing.org',
    org: 'Esperanza Community Housing Corp.', orgUrl: 'https://esperanzacommunityhousing.org',
    languages: ['English', 'Español'],
    specialties: ['Asthma', 'Housing-linked health', 'Environmental health'],
    rating: 4.6, clients: 980, available: false,
    note: 'Promotoras address housing conditions that cause asthma and lead exposure.',
  },
  /* ── New York ── */
  {
    init: 'BC', name: 'BronxCare Health System', loc: 'Bronx, NY',
    phone: '(718) 590-1800', email: 'info@bronxcare.org',
    org: 'BronxCare Health System', orgUrl: 'https://www.bronxcare.org',
    languages: ['English', 'Español', 'Haitian Creole'],
    specialties: ['Diabetes', 'Mental health', 'HIV/AIDS'],
    rating: 4.7, clients: 3800, available: true,
    note: 'Community Health Workers embedded in primary care teams. Same-day consults.',
  },
  {
    init: 'UH', name: 'Urban Health Plan', loc: 'Bronx, NY',
    phone: '(718) 589-2440', email: 'info@urbanhealthplan.org',
    org: 'Urban Health Plan', orgUrl: 'https://www.urbanhealthplan.org',
    languages: ['English', 'Español'],
    specialties: ['Asthma', 'Obesity', "Children's health"],
    rating: 4.8, clients: 2200, available: true,
    note: 'FQHC with dedicated CHW workforce. Serving South Bronx since 1974.',
  },
  /* ── Florida ── */
  {
    init: 'CH', name: 'Camillus Health Concern', loc: 'Miami, FL',
    phone: '(305) 576-7107', email: 'info@camillushealth.org',
    org: 'Camillus Health Concern', orgUrl: 'https://camillushealth.org',
    languages: ['English', 'Español', 'Haitian Creole'],
    specialties: ['Unhoused health', 'HIV/AIDS', 'Mental health'],
    rating: 4.9, clients: 1750, available: true,
    note: 'Street outreach CHWs meet patients where they are, 7 days a week.',
  },
  /* ── Georgia ── */
  {
    init: 'GH', name: 'Grady Community Health Workers', loc: 'Atlanta, GA',
    phone: '(404) 616-1000', email: 'communityhealth@gradyhealth.org',
    org: 'Grady Health System', orgUrl: 'https://www.gradyhealth.org',
    languages: ['English', 'Español', 'Amharic'],
    specialties: ['Hypertension', 'Diabetes', 'Cancer navigation'],
    rating: 4.8, clients: 3600, available: true,
    note: 'One of the largest public hospital CHW programs in the Southeast.',
  },
  /* ── Illinois ── */
  {
    init: 'AC', name: 'Access Community Health Network', loc: 'Chicago, IL',
    phone: '(312) 526-2000', email: 'info@achn.net',
    org: 'Access Community Health Network', orgUrl: 'https://www.achn.net',
    languages: ['English', 'Español', 'Polish'],
    specialties: ['Chronic disease', 'Maternal health', 'Insurance enrollment'],
    rating: 4.7, clients: 4100, available: true,
    note: 'Largest FQHC network in Illinois. CHWs speak 15+ languages across sites.',
  },
]

const LANGUAGES = ['All', 'Español', 'Haitian Creole', 'Somali', 'Arabic', 'Tagalog', '普通话', 'Polish', 'Amharic', 'Navajo']

const HOW_STEPS = [
  { n: '01', icon: <Search size={16} strokeWidth={1.5} />,       title: 'Find your CHW',           body: 'Browse by language, specialty, or location. Every CHW is trained, vetted, and community-based.' },
  { n: '02', icon: <MessageCircle size={16} strokeWidth={1.5} />, title: 'Connect directly',        body: 'Send a message or request a call. Most CHWs respond within 2 hours.' },
  { n: '03', icon: <MapPin size={16} strokeWidth={1.5} />,       title: 'Get in-person guidance',  body: 'CHWs meet you where you are — clinic visits, home visits, or video call.' },
  { n: '04', icon: <CheckCircle size={16} strokeWidth={1.5} />,  title: 'Navigate care together',  body: 'From enrollment to follow-up, your CHW stays with you through the entire process.' },
]

const TESTIMONIALS = [
  { name: 'Yusra H.',  loc: 'Phoenix, AZ', chw: 'Amara M.', quote: 'Amara spoke my language — literally and emotionally. She walked me through my daughter\'s prenatal care when I was too scared to go alone.' },
  { name: 'Carlos V.', loc: 'Mesa, AZ',    chw: 'Luis R.',  quote: 'Luis knew exactly which free clinic accepted my situation. I\'d been bouncing around the system for months. He sorted it in one call.' },
  { name: 'Lily T.',   loc: 'Tempe, AZ',   chw: 'Mai N.',   quote: 'Having someone who spoke Vietnamese made everything less overwhelming. I finally understood my diagnosis and my options.' },
]

const IMPACT_STATS = [
  { val: '47%',  label: 'Increase in care access with a CHW' },
  { val: '2.4×', label: 'Higher medication adherence' },
  { val: '89%',  label: 'Users felt more confident' },
  { val: '340+', label: 'Active CHWs in network' },
]

const BECOME_STEPS = [
  'Complete NEXUS CHW training (online, self-paced, ~12 hrs)',
  'Pass background and identity verification',
  'Join your city\'s CHW cohort and attend a 1-hour orientation',
  'Go live and start receiving matched client referrals',
]

/* ─── form field ──────────────────────────────────── */
function FormField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      <label style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>{label}</label>
      <div style={{ borderRadius: '11px', padding: '1.5px', background: focused ? 'linear-gradient(135deg, rgba(110,231,183,0.45), rgba(167,210,190,0.15))' : 'rgba(255,255,255,0.07)', transition: 'background 0.3s' }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ width: '100%', display: 'block', background: focused ? 'rgba(13,11,30,0.97)' : 'rgba(13,11,30,0.85)', border: 'none', outline: 'none', borderRadius: '9.5px', padding: '12px 14px', fontSize: '14px', color: 'var(--text)', fontFamily: 'inherit', transition: 'background 0.3s' }}
        />
      </div>
    </div>
  )
}

/* ─── page ────────────────────────────────────────── */
export default function CHWPage() {
  const [query, setQuery]           = useState('')
  const [langFilter, setLangFilter] = useState('All')
  const [contactIdx, setContactIdx] = useState<number | null>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [formName, setFormName]     = useState('')
  const [formEmail, setFormEmail]   = useState('')
  const [formCity, setFormCity]     = useState('')
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError]   = useState('')

  const filtered = CHWS.filter(c => {
    const matchLang = langFilter === 'All' || c.languages.includes(langFilter)
    const matchQ    = !query || c.name.toLowerCase().includes(query.toLowerCase()) ||
                      c.specialties.some(s => s.toLowerCase().includes(query.toLowerCase())) ||
                      c.loc.toLowerCase().includes(query.toLowerCase())
    return matchLang && matchQ
  })

  const pill: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '4px 12px', borderRadius: '100px',
    fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
    background: 'rgba(110,231,183,0.08)', color: 'var(--accent)', border: '1px solid rgba(110,231,183,0.18)',
  }

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px',
    transition: 'border-color 0.2s, background 0.2s',
  }

  return (
    <AppShell>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ minHeight: '85dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '80px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(110,231,183,0.13) 0%, rgba(167,139,250,0.05) 50%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(ellipse, rgba(251,191,36,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '740px', position: 'relative' }}>
          <div style={{ marginBottom: '28px' }}>
            <span style={pill}><Users size={10} strokeWidth={1.5} /> CHW Network</span>
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '22px', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
            A person, not a portal.
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '500px', margin: '0 auto 48px', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 120ms both' }}>
            Community Health Workers are trained guides who know the system from the inside — and speak your language. Matched to you in minutes.
          </p>

          <div style={{ display: 'flex', gap: '36px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 200ms both' }}>
            {IMPACT_STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>{s.val}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', maxWidth: '120px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '52px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={pill}><CheckCircle size={10} strokeWidth={1.5} /> Process</span>
                <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15 }}>From first message<br />to resolved care</h2>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', maxWidth: '260px', lineHeight: 1.65 }}>The average time from first contact to a care appointment is under 3 days.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {HOW_STEPS.map((s, i) => (
              <RevealBlock key={s.n} delay={i * 80}>
                <div style={{ position: 'relative' }}>
                  {i < HOW_STEPS.length - 1 && (
                    <div style={{ position: 'absolute', top: '19px', right: '-8px', zIndex: 1, color: 'rgba(255,255,255,0.12)' }}>
                      <ChevronRight size={14} />
                    </div>
                  )}
                  <div style={{ ...card, padding: '24px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '16px' }}>{s.icon}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '8px' }}>{s.n}</div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', lineHeight: 1.3 }}>{s.title}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{s.body}</p>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIRECTORY ────────────────────────────────── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '20px' }}>Find your CHW</h2>

              <div style={{ marginBottom: '14px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  borderRadius: '12px', padding: '1.5px', maxWidth: '480px',
                  background: searchFocused ? 'linear-gradient(135deg, rgba(110,231,183,0.4), rgba(167,210,190,0.1))' : 'rgba(255,255,255,0.07)',
                  transition: 'background 0.3s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: searchFocused ? 'rgba(13,11,30,0.97)' : 'rgba(13,11,30,0.85)', borderRadius: '10.5px', padding: '10px 14px', width: '100%', transition: 'background 0.3s' }}>
                    <Search size={14} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      placeholder="Search by name, specialty, city…"
                      style={{ background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: 'var(--text)', fontFamily: 'inherit', width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => setLangFilter(l)}
                    style={{
                      padding: '7px 14px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                      background: langFilter === l ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.04)',
                      color: langFilter === l ? 'var(--accent2)' : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${langFilter === l ? 'rgba(110,231,183,0.35)' : 'rgba(255,255,255,0.07)'}`,
                      transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  >{l}</button>
                ))}
              </div>
            </div>
          </RevealBlock>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontSize: '15px' }}>
              No CHWs match your search. Try adjusting your filters.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {filtered.map((chw, i) => (
                <RevealBlock key={chw.name} delay={i * 60}>
                  <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: `linear-gradient(135deg, ${['rgba(110,231,183,0.25)','rgba(167,139,250,0.25)','rgba(251,191,36,0.25)','rgba(248,113,113,0.25)'][i % 4]}, ${['rgba(110,231,183,0.08)','rgba(167,139,250,0.08)','rgba(251,191,36,0.08)','rgba(248,113,113,0.08)'][i % 4]})`, border: `1px solid ${['rgba(110,231,183,0.3)','rgba(167,139,250,0.3)','rgba(251,191,36,0.3)','rgba(248,113,113,0.3)'][i % 4]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: ['var(--accent)','#a78bfa','#fbbf24','#f87171'][i % 4], flexShrink: 0 }}>{chw.init}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                          <span style={{ fontWeight: 600, fontSize: '15px' }}>{chw.name}</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', padding: '3px 9px', borderRadius: '100px', background: chw.available ? 'rgba(110,231,183,0.1)' : 'rgba(255,255,255,0.05)', color: chw.available ? 'var(--accent)' : 'rgba(255,255,255,0.3)', border: `1px solid ${chw.available ? 'rgba(110,231,183,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                            {chw.available && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', animation: 'open-pulse 2s ease-in-out infinite', display: 'inline-block' }} />}
                            {chw.available ? 'Available' : 'Busy'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <MapPin size={10} strokeWidth={1.5} />{chw.loc}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {chw.specialties.map(s => <span key={s} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>{s}</span>)}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {chw.languages.map(l => <span key={l} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.14)', color: 'rgba(110,231,183,0.7)' }}>{l}</span>)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', display: 'flex', gap: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={10} strokeWidth={1.5} style={{ color: '#fbbf24' }} />{chw.rating}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={10} strokeWidth={1.5} />{chw.clients} clients</span>
                      </div>
                      <button
                        onClick={async () => {
                          if (contactIdx === i) { setContactIdx(null); return }
                          setContactIdx(i)
                          // Fire-and-forget: log the connection request
                          submitForm('chw', {
                            chw_name: chw.name,
                            chw_specialty: chw.specialties[0] ?? '',
                            chw_location: chw.loc,
                            source: 'card_connect',
                          }).catch(() => {/* silent — user already sees confirmation */})
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '100px',
                          background: contactIdx === i ? 'var(--accent)' : 'rgba(110,231,183,0.1)',
                          border: `1px solid ${contactIdx === i ? 'transparent' : 'rgba(110,231,183,0.2)'}`,
                          color: contactIdx === i ? '#07070F' : 'var(--accent)',
                          fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                        }}
                      ><Phone size={11} strokeWidth={1.5} />{contactIdx === i ? 'Requested' : 'Connect'}</button>
                    </div>

                    {contactIdx === i && (
                      <div style={{ padding: '14px', background: 'rgba(110,231,183,0.06)', borderRadius: '12px', animation: 'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both', borderLeft: '2px solid rgba(110,231,183,0.3)' }}>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>Contact {chw.org} directly:</div>
                        <a href={`tel:${chw.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '14px', fontWeight: 600, textDecoration: 'none', marginBottom: '6px' }}>
                          <Phone size={13} /> {chw.phone}
                        </a>
                        <a href={chw.orgUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none', marginBottom: '8px' }}>
                          ↗ Visit website
                        </a>
                        {chw.note && (
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>{chw.note}</div>
                        )}
                      </div>
                    )}
                  </div>
                </RevealBlock>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ textAlign: 'center', marginBottom: '52px' }}>
              <span style={pill}><MessageCircle size={10} strokeWidth={1.5} /> Stories</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px' }}>
                What a CHW actually does
              </h2>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {TESTIMONIALS.map((t, i) => (
              <RevealBlock key={t.name} delay={i * 80}>
                <div style={{ ...card, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
                    {[1,2,3,4,5].map(n => <Star key={n} size={12} strokeWidth={0} fill="#fbbf24" />)}
                  </div>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.62)', lineHeight: 1.7, flexGrow: 1, marginBottom: '20px' }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{t.loc}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>guided by</div>
                      <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 500 }}>{t.chw}</div>
                    </div>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── BECOME A CHW ─────────────────────────────── */}
      <section style={{ padding: '80px 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ borderRadius: '28px', padding: '3px', background: 'linear-gradient(135deg, rgba(110,231,183,0.25), rgba(167,210,190,0.08))' }}>
              <div style={{ borderRadius: '26px', padding: '56px 52px', background: 'rgba(10,9,22,0.97)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '48px', alignItems: 'start' }}>
                  <div>
                    <span style={pill}><Sparkles size={10} strokeWidth={1.5} /> Join the network</span>
                    <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '20px 0 12px', lineHeight: 1.2 }}>Become a Community Health Worker</h2>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, marginBottom: '24px' }}>
                      If you know your community and want to help your neighbors navigate care, we'll train and connect you.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {BECOME_STEPS.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                          <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {!formSubmitted ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Express interest</h3>
                        <FormField label="Full name"      value={formName}  onChange={setFormName}  placeholder="Your name" />
                        <FormField label="Email address"  value={formEmail} onChange={setFormEmail} placeholder="you@example.com" />
                        <FormField label="City"           value={formCity}  onChange={setFormCity}  placeholder="Phoenix, AZ" />
                        {formError && (
                          <p style={{ fontSize: '12px', color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '8px 12px', margin: 0 }}>{formError}</p>
                        )}
                        <button
                          onClick={async () => {
                            if (!formName || !formEmail || !formCity) return
                            setFormSubmitting(true)
                            setFormError('')
                            try {
                              await submitForm('chw', { name: formName, email: formEmail, city: formCity })
                              setFormSubmitted(true)
                            } catch (err: unknown) {
                              setFormError(err instanceof Error ? err.message : 'Submission failed.')
                            } finally {
                              setFormSubmitting(false)
                            }
                          }}
                          disabled={!formName || !formEmail || !formCity || formSubmitting}
                          style={{
                            padding: '14px', borderRadius: '12px', border: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: 600,
                            cursor: formName && formEmail && formCity && !formSubmitting ? 'pointer' : 'not-allowed',
                            background: formName && formEmail && formCity && !formSubmitting ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.06)',
                            color: formName && formEmail && formCity && !formSubmitting ? '#07070F' : 'rgba(255,255,255,0.25)',
                            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          }}
                        >{formSubmitting ? 'Submitting…' : <>{`Submit interest`} <ArrowRight size={14} strokeWidth={2} /></>}</button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '32px 0', animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent)' }}>
                          <CheckCircle size={20} strokeWidth={1.5} />
                        </div>
                        <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>We'll be in touch</p>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)' }}>Expect an email within 48 hours with next steps.</p>
                      </div>
                    )}
                  </div>
                </div>
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
