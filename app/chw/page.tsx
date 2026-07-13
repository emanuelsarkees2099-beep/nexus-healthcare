'use client'
import { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { Profile2User, Location, Call, Global, TickCircle, SearchNormal1 } from 'iconsax-react'

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
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</div>
  )
}

/* ─── Real community-health organizations with CHW / promotora /
   navigator programs. Names, locations, languages, and public contact
   info are real. NEXUS does not run these programs or rate them — this
   is a directory that points people to them directly. ─── */
type Org = {
  name: string; loc: string; phone: string; orgUrl: string
  languages: string[]; specialties: string[]; note: string
}

const ORGS: Org[] = [
  { name: 'Chicanos Por La Causa (CPLC)', loc: 'Phoenix, AZ', phone: '(602) 257-0700', orgUrl: 'https://www.cplc.org', languages: ['English', 'Español'], specialties: ['Chronic disease', 'Diabetes', 'Insurance enrollment'], note: 'Ask for the Community Health Worker program when you call.' },
  { name: 'Native Health Phoenix', loc: 'Phoenix, AZ', phone: '(602) 279-5262', orgUrl: 'https://www.nativehealth.org', languages: ['English', 'Navajo', 'Diné'], specialties: ['Maternal health', 'Diabetes', 'Behavioral health'], note: 'Serving Native and non-Native patients. Sliding-scale care available.' },
  { name: 'Valleywise Community Health', loc: 'Phoenix, AZ', phone: '(602) 344-5011', orgUrl: 'https://www.valleywisehealth.org', languages: ['English', 'Español', 'Somali'], specialties: ['Mental health', 'Substance use', 'Crisis support'], note: 'Community Health Navigators available Mon–Fri, 8am–5pm.' },
  { name: 'El Rio Health Center', loc: 'Tucson, AZ', phone: '(520) 901-4000', orgUrl: 'https://www.elrio.org', languages: ['English', 'Español', 'Arabic'], specialties: ['Primary care nav', 'Refugee health', "Women's health"], note: 'FQHC with a CHW team. Refugee & immigrant health specialization.' },
  { name: 'CommUnity Care', loc: 'Austin, TX', phone: '(512) 978-9015', orgUrl: 'https://www.communitycaretx.org', languages: ['English', 'Español'], specialties: ['Primary care', 'Dental access', 'Chronic disease'], note: 'FQHC serving Travis County. Sliding-scale, no patient turned away.' },
  { name: 'CommuniCare Health Centers', loc: 'San Antonio, TX', phone: '(210) 223-0800', orgUrl: 'https://www.communicarehealth.org', languages: ['English', 'Español'], specialties: ['Diabetes', 'Hypertension', 'OB/GYN'], note: 'Promotoras de salud model — community educators who are also patients.' },
  { name: 'AltaMed Health Services', loc: 'Los Angeles, CA', phone: '(323) 889-7400', orgUrl: 'https://www.altamed.org', languages: ['English', 'Español', 'Tagalog', '普通话'], specialties: ['Senior care', 'Diabetes', 'Cancer screening'], note: 'Large FQHC in Southern California. CHW referrals through the main line.' },
  { name: 'Esperanza Community Housing', loc: 'Los Angeles, CA', phone: '(213) 787-0520', orgUrl: 'https://esperanzacommunityhousing.org', languages: ['English', 'Español'], specialties: ['Asthma', 'Housing-linked health', 'Environmental health'], note: 'Promotoras address housing conditions that cause asthma and lead exposure.' },
  { name: 'BronxCare Health System', loc: 'Bronx, NY', phone: '(718) 590-1800', orgUrl: 'https://www.bronxcare.org', languages: ['English', 'Español', 'Haitian Creole'], specialties: ['Diabetes', 'Mental health', 'HIV/AIDS'], note: 'Community Health Workers embedded in primary care teams.' },
  { name: 'Urban Health Plan', loc: 'Bronx, NY', phone: '(718) 589-2440', orgUrl: 'https://www.urbanhealthplan.org', languages: ['English', 'Español'], specialties: ['Asthma', 'Obesity', "Children's health"], note: 'FQHC with a dedicated CHW workforce. Serving the South Bronx since 1974.' },
  { name: 'Camillus Health Concern', loc: 'Miami, FL', phone: '(305) 576-7107', orgUrl: 'https://camillushealth.org', languages: ['English', 'Español', 'Haitian Creole'], specialties: ['Unhoused health', 'HIV/AIDS', 'Mental health'], note: 'Street outreach CHWs meet patients where they are.' },
  { name: 'Grady Health System', loc: 'Atlanta, GA', phone: '(404) 616-1000', orgUrl: 'https://www.gradyhealth.org', languages: ['English', 'Español', 'Amharic'], specialties: ['Hypertension', 'Diabetes', 'Cancer navigation'], note: 'One of the largest public-hospital CHW programs in the Southeast.' },
  { name: 'Access Community Health Network', loc: 'Chicago, IL', phone: '(312) 526-2000', orgUrl: 'https://www.achn.net', languages: ['English', 'Español', 'Polish'], specialties: ['Chronic disease', 'Maternal health', 'Insurance enrollment'], note: 'Large FQHC network in Illinois. CHWs speak 15+ languages across sites.' },
]

const WHAT_CHW_DOES = [
  'Explain your options in plain language — and in your language',
  'Help you enroll in Medicaid, CHIP, or sliding-scale programs',
  'Connect you to a free or low-cost clinic and prepare you for the visit',
  'Follow up so nothing falls through the cracks',
]

export default function CHWPage() {
  const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* ── Hero ── */}
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(48px, 8vh, 96px) clamp(20px, 5vw, 32px) 0', textAlign: 'center' }}>
          <RevealBlock>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', background: 'rgba(79,142,240,0.08)', border: '1px solid rgba(79,142,240,0.22)', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>
              <Profile2User size={14} variant="Bold" /> Community Health Workers
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: '20px', color: 'var(--text)' }}>
              A real person to help you<br />navigate care.
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 1.4vw, 1.1rem)', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto', fontFamily: 'var(--font-inter)' }}>
              A community health worker (CHW), or <em>promotor/a de salud</em>, is a trusted member of your
              community trained to help you find and use healthcare — often free, often in your language.
              Below are real organizations with CHW programs. Contact them directly.
            </p>
          </RevealBlock>
        </section>

        {/* ── What a CHW does ── */}
        <section style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(40px, 6vh, 64px) clamp(20px, 5vw, 32px) 0' }}>
          <RevealBlock>
            <div style={{ display: 'grid', gap: '12px' }}>
              {WHAT_CHW_DOES.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)' }}>
                  <TickCircle size={18} variant="Bold" color="var(--accent)" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '14.5px', color: 'var(--text)', fontFamily: 'var(--font-inter)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </RevealBlock>
        </section>

        {/* ── Directory ── */}
        <section style={{ maxWidth: '1120px', margin: '0 auto', padding: 'clamp(56px, 9vh, 96px) clamp(20px, 5vw, 32px) 0' }}>
          <RevealBlock>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: '10px', color: 'var(--text)' }}>
              Organizations with CHW programs
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-3)', textAlign: 'center', maxWidth: '520px', margin: '0 auto 40px', fontFamily: 'var(--font-inter)', lineHeight: 1.6 }}>
              Real nonprofits and health centers across the US. Not sure where to start? Call the one nearest you and ask for their community health worker or patient navigator.
            </p>
          </RevealBlock>

          <div className="chw-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {ORGS.map((o, i) => (
              <RevealBlock key={o.name} delay={Math.min(i * 40, 240)}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-card)', padding: '22px', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', marginBottom: '4px', lineHeight: 1.25 }}>{o.name}</h3>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
                      <Location size={12} variant="Linear" color="var(--text-3)" /> {o.loc}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
                    {o.specialties.map(s => (
                      <span key={s} style={{ fontSize: '10.5px', color: 'var(--text-2)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)', padding: '3px 8px', fontFamily: 'var(--font-inter)' }}>{s}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
                    <Global size={12} variant="Linear" color="var(--text-3)" />
                    {o.languages.join(' · ')}
                  </div>

                  <p style={{ fontSize: '12.5px', color: 'var(--text-2)', lineHeight: 1.55, fontFamily: 'var(--font-inter)', marginBottom: '16px', flex: 1 }}>{o.note}</p>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <a href={telHref(o.phone)} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', minHeight: '40px', background: 'rgba(79,142,240,0.10)', border: '1px solid rgba(79,142,240,0.25)', borderRadius: 'var(--r-md)', color: 'var(--accent)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
                      <Call size={13} variant="Linear" color="var(--accent)" /> {o.phone}
                    </a>
                    <a href={o.orgUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${o.name} website`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px', minWidth: '40px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', color: 'var(--text-2)' }}>
                      <Global size={15} variant="Linear" color="currentColor" />
                    </a>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(64px, 10vh, 112px) clamp(20px, 5vw, 32px) clamp(64px, 10vh, 112px)', textAlign: 'center' }}>
          <RevealBlock>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 2.6vw, 2rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '12px', color: 'var(--text)' }}>
              Need care right now?
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '24px', fontFamily: 'var(--font-inter)' }}>
              Search free and sliding-scale clinics near you — no account, no insurance required.
            </p>
            <a href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '48px', padding: '0 26px', background: 'var(--grad-vital)', color: '#04121D', borderRadius: 'var(--r-lg)', fontSize: '15px', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-inter)', boxShadow: '0 4px 20px rgba(79,142,240,0.25)' }}>
              <SearchNormal1 size={16} variant="Bold" color="#04121D" /> Find free care near me
            </a>
          </RevealBlock>
        </section>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .chw-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppShell>
  )
}
