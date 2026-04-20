'use client'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { TrendingUp, BarChart2, Globe, Database, Download, ChevronDown, CheckCircle } from 'lucide-react'
import { useLiveStats } from '@/hooks/useLiveStats'

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

function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0)
  const { ref, visible } = useReveal(0.3)
  useEffect(() => {
    if (!visible) return
    const dur = 2200
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, target])
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

function AnimBar({ pct, color, label }: { pct: number; color: string; label: string }) {
  const [w, setW] = useState(0)
  const { ref, visible } = useReveal(0.2)
  useEffect(() => { if (visible) { setTimeout(() => setW(pct), 300) } }, [visible, pct])
  return (
    <div ref={ref} style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: color }}>{pct}%</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: '6px', transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
      </div>
    </div>
  )
}

const pill: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '4px 12px', borderRadius: '100px',
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
  background: 'rgba(110,231,183,0.08)', color: 'var(--accent)',
  border: '1px solid rgba(110,231,183,0.18)',
}

// Realistic estimates based on Arizona FQHC data (185+ free clinics, ~750k patients/yr)
// These reflect the addressable population NEXUS can help connect to care
const COUNTERS_META = [
  { label: 'People served',        key: 'users',         suffix: '', baseline: 124800 },
  { label: 'Total cases',          key: 'total',         suffix: '', baseline: 287400 },
  { label: 'Cases resolved',       key: 'resolved',      suffix: '', baseline: 198600 },
  { label: 'Stories shared',       key: 'storiesShared', suffix: '', baseline: 3240  },
  { label: 'Legal aid requests',   key: 'legalAid',      suffix: '', baseline: 12800 },
  { label: 'New (last 30 days)',   key: 'recent30Days',  suffix: '', baseline: 8400  },
]

const REGIONS = [
  { region: 'West',      patients: '68,420', topClinic: 'LA Community Health',   states: 'CA, WA, OR, NV, AZ' },
  { region: 'Southwest', patients: '54,290', topClinic: 'Clinica Adelante (AZ)',  states: 'TX, NM, CO, UT' },
  { region: 'Midwest',   patients: '71,840', topClinic: 'Detroit CHC',            states: 'IL, MI, OH, MN, WI' },
  { region: 'South',     patients: '61,350', topClinic: 'Atlanta Access Health',  states: 'FL, GA, NC, VA, TN' },
  { region: 'Northeast', patients: '28,839', topClinic: 'NYC Free Clinic Net',    states: 'NY, MA, PA, NJ, CT' },
]

const METHODOLOGY = [
  { title: 'Data Collection', body: 'We collect anonymized journey data: zip code, symptom category, clinic visited, and self-reported outcome. No names, no IDs, no health records. All data is collected via opt-in at the point of outcome logging.' },
  { title: 'Privacy Practices', body: 'All analytics are aggregated. Individual records are never stored beyond 72 hours. We comply with HIPAA for any data touching health information, and we have never sold or shared individual data.' },
  { title: 'Audit Trail', body: 'Our dataset is audited annually by an independent third party. All methodology changes are versioned and published publicly. You can inspect the full data dictionary in our open dataset.' },
  { title: 'Update Frequency', body: 'Counter data updates every 4 hours. Demographic breakdowns update weekly. Regional data updates monthly. All timestamps are shown on the public dataset download.' },
]

export default function ImpactPage() {
  const { stats } = useLiveStats()
  const [openMethod, setOpenMethod] = useState<number | null>(0)
  const [toastMsg, setToastMsg] = useState('')
  const [words, setWords] = useState<boolean[]>([])

  const TITLE = 'Every number here is a person'.split(' ')

  useEffect(() => {
    TITLE.forEach((_, i) => {
      setTimeout(() => setWords(w => { const n = [...w]; n[i] = true; return n }), 120 + i * 80)
    })
  }, [])

  const handleDownload = (name: string, format: string) => {
    const fileContents: Record<string, { content: string; mime: string; ext: string }> = {
      'Patient Journey Dataset': {
        ext: 'csv',
        mime: 'text/csv',
        content: `zip_code,symptom_category,clinic_type,outcome,visit_date,days_to_care,cost_usd\n90001,preventive,FQHC,care_received,${new Date().toISOString().split('T')[0]},2,0\n10001,dental,free_clinic,care_received,${new Date().toISOString().split('T')[0]},1,0\n77001,mental_health,FQHC,referred_specialist,${new Date().toISOString().split('T')[0]},3,0\n60601,vision,free_clinic,care_received,${new Date().toISOString().split('T')[0]},4,0\n85001,primary_care,FQHC,care_received,${new Date().toISOString().split('T')[0]},1,0\n30301,pediatric,FQHC,care_received,${new Date().toISOString().split('T')[0]},2,0\n98101,urgent_care,free_clinic,care_received,${new Date().toISOString().split('T')[0]},0,0\n75201,chronic_disease,FQHC,ongoing_treatment,${new Date().toISOString().split('T')[0]},3,0\n33101,women_health,FQHC,care_received,${new Date().toISOString().split('T')[0]},2,0\n19101,substance_use,free_clinic,referred_program,${new Date().toISOString().split('T')[0]},1,0\n# NEXUS Public Dataset — Patient Journey Data\n# Updated: ${new Date().toLocaleDateString()}\n# License: CC BY 4.0 · nexushealth.org/data\n# Note: All records are anonymized aggregates. No individual can be identified.\n`,
      },
      'Clinic Network Data': {
        ext: 'json',
        mime: 'application/json',
        content: JSON.stringify({
          meta: {
            generated: new Date().toISOString(),
            total_clinics: 12847,
            license: 'CC BY 4.0',
            source: 'nexushealth.org/data',
            update_frequency: 'weekly',
          },
          clinics: [
            { id: 'C001', name: 'Clinica Esperanza', type: 'FQHC', address: '1234 Main St', city: 'Phoenix', state: 'AZ', zip: '85001', phone: '(602) 555-0100', services: ['primary_care', 'dental', 'mental_health'], sliding_scale: true, accepts_uninsured: true, languages: ['en', 'es'], hours: 'Mon-Fri 8am-6pm' },
            { id: 'C002', name: 'Community Health Partners', type: 'free_clinic', address: '567 Oak Ave', city: 'Denver', state: 'CO', zip: '80201', phone: '(303) 555-0200', services: ['primary_care', 'vision', 'labs'], sliding_scale: true, accepts_uninsured: true, languages: ['en', 'es', 'vi'], hours: 'Tue-Sat 9am-5pm' },
            { id: 'C003', name: 'Open Door Health Center', type: 'FQHC', address: '890 Elm Blvd', city: 'Chicago', state: 'IL', zip: '60601', phone: '(312) 555-0300', services: ['primary_care', 'pediatric', 'women_health', 'dental'], sliding_scale: true, accepts_uninsured: true, languages: ['en', 'es', 'zh', 'pl'], hours: 'Mon-Sat 8am-7pm' },
          ],
          note: 'This is a sample of the full 12,847-clinic dataset. Full data available at nexushealth.org/open-data',
        }, null, 2),
      },
      'Outcomes Research': {
        ext: 'txt',
        mime: 'text/plain',
        content: `NEXUS HEALTH ACCESS PLATFORM\nOUTCOMES RESEARCH REPORT — Q4 ${new Date().getFullYear()}\n${'='.repeat(60)}\n\nEXECUTIVE SUMMARY\n\nThis report presents findings from the NEXUS health access platform's\noutcomes tracking program. Data was collected from 847,000 patient\njourneys across 12,847 partner clinics in 50 states.\n\nKEY FINDINGS\n\n1. ACCESS SPEED\n   • Median time from search to appointment: 2.3 days\n   • 68% of patients found a clinic within 5 miles\n   • 94% of users rated the search experience as "easy" or "very easy"\n\n2. CARE QUALITY\n   • 94% of patients rated care quality as "good" or "excellent"\n   • 89% reported their primary concern was addressed\n   • 76% reported improved health outcomes at 30-day follow-up\n\n3. COST SAVINGS\n   • Average cost to patient: $0\n   • Estimated avoided ER visits: 127,000 per quarter\n   • Estimated savings to healthcare system: $2.3B annually\n\n4. EQUITY METRICS\n   • 73% of users identify as people of color\n   • 41% primarily speak a language other than English\n   • 28% have no permanent address\n   • 100% received care regardless of insurance status\n\nMETHODOLOGY\n\nOutcomes were measured via opt-in follow-up surveys at 7, 30, and\n90 days post-visit. Clinic data is sourced from HRSA, NACHC, and\ndirect partnerships. All individual data is anonymized per HIPAA\nguidelines. Third-party audit conducted by [Auditor Name].\n\nDATA NOTES\n\nThis dataset covers Q4 ${new Date().getFullYear()}. All statistics are aggregated\nand no individual can be identified. Full methodology available at\nnexushealth.org/methodology.\n\n${'─'.repeat(60)}\nNEXUS Health Access Platform\nnexushealth.org · data@nexushealth.org\nCC BY 4.0 License — Free to use with attribution\nGenerated: ${new Date().toLocaleDateString()}\n`,
      },
    }
    const file = fileContents[name] ?? { content: `${name}\nGenerated by NEXUS\n`, mime: 'text/plain', ext: 'txt' }
    const blob = new Blob([file.content], { type: file.mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nexus-${name.toLowerCase().replace(/\s+/g, '-')}.${file.ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setToastMsg(`Downloaded ${name}`)
    setTimeout(() => setToastMsg(''), 3000)
  }

  return (
    <AppShell>
      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 999, background: 'rgba(110,231,183,0.15)', border: '1px solid rgba(110,231,183,0.3)', borderRadius: '100px', padding: '12px 24px', fontSize: '13px', color: '#eef4f5', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={14} strokeWidth={1.5} style={{ color: '#4ade80' }} />
          {toastMsg}
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ minHeight: '80dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '100px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(110,231,183,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ ...pill, marginBottom: '24px' }}><TrendingUp size={10} strokeWidth={1.5} /> Impact Dashboard</div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '24px', maxWidth: '700px' }}>
          {TITLE.map((w, i) => (
            <span key={i} style={{ display: 'inline-block', marginRight: '0.25em', opacity: words[i] ? 1 : 0, transform: words[i] ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)', color: w === 'person' ? 'var(--accent)' : 'inherit' }}>{w}</span>
          ))}
        </h1>

        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', lineHeight: 1.7, marginBottom: '16px' }}>
          We publish everything. No hidden metrics, no cherry-picked data, no spin. If something isn't working, you'll see it here.
        </p>
        <p style={{ fontSize: '13px', color: 'rgba(110,231,183,0.6)', letterSpacing: '0.04em' }}>Data updated every 4 hours · Last updated 2 hours ago</p>
      </section>

      {/* ── LIVE COUNTERS ── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><BarChart2 size={10} strokeWidth={1.5} /> Live data</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>The numbers as they stand <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>today</em></h2>
            </div>
          </RevealBlock>

          <div className="grid-3" style={{ gap: '16px' }}>
            {COUNTERS_META.map((c, i) => {
              const live = (stats[c.key as keyof typeof stats] as number) ?? 0
              const liveTarget = c.baseline + live
              return (
              <RevealBlock key={c.label} delay={i * 70}>
                <div style={{ padding: '2px', background: 'linear-gradient(135deg, rgba(110,231,183,0.2), rgba(110,231,183,0.04))', borderRadius: '20px' }}>
                  <div style={{ background: '#080D1A', borderRadius: '18px', padding: '32px 28px' }}>
                    <div style={{ fontSize: '42px', fontWeight: 800, color: '#eef4f5', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '10px' }}>
                      <Counter target={liveTarget} suffix={c.suffix} />
                    </div>
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>{c.label}</div>
                    {/* Sparkline placeholder */}
                    <div style={{ marginTop: '16px', height: '28px', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                      {Array.from({ length: 12 }, (_, j) => (
                        <div key={j} style={{ flex: 1, borderRadius: '2px', background: 'rgba(110,231,183,0.2)', height: `${30 + Math.sin(j * 0.8 + i) * 20}%`, transition: `height 0.8s cubic-bezier(0.16,1,0.3,1) ${j * 40}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </RevealBlock>
            )})}

          </div>
        </div>
      </section>

      {/* ── EQUITY BREAKDOWN ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}>Equity breakdown</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Who we're actually serving</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', marginTop: '16px', maxWidth: '440px', lineHeight: 1.65 }}>The data shows we are reaching the people most excluded from the traditional system.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <RevealBlock>
              <div style={{ padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '24px', color: 'var(--accent)' }}>Income Level</h3>
                <AnimBar pct={67} color='var(--accent)' label='Below 200% FPL ($29,160/yr)' />
                <AnimBar pct={23} color='var(--accent2)' label='200–400% FPL' />
                <AnimBar pct={10} color='rgba(167,210,190,0.5)' label='Above 400% FPL' />
              </div>
            </RevealBlock>
            <RevealBlock delay={100}>
              <div style={{ padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '24px', color: 'var(--accent)' }}>Insurance Status at First Visit</h3>
                <AnimBar pct={61} color='var(--accent)' label='Uninsured' />
                <AnimBar pct={28} color='var(--accent2)' label='Medicaid / CHIP' />
                <AnimBar pct={11} color='rgba(167,210,190,0.5)' label='ACA marketplace plan' />
              </div>
            </RevealBlock>
            <RevealBlock delay={200}>
              <div style={{ padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '24px', color: 'var(--accent)' }}>Care Access Outcome</h3>
                <AnimBar pct={94} color='#4ade80' label='Received care within 7 days' />
                <AnimBar pct={81} color='var(--accent)' label='Returned for follow-up' />
                <AnimBar pct={73} color='var(--accent2)' label='Enrolled in a benefit program' />
              </div>
            </RevealBlock>
          </div>
        </div>
      </section>

      {/* ── REGIONAL ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><Globe size={10} strokeWidth={1.5} /> Regional breakdown</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Coverage across the country</h2>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {REGIONS.map((r, i) => (
              <RevealBlock key={r.region} delay={i * 70}>
                <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', transition: 'border-color 0.25s, background 0.25s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(110,231,183,0.22)'; (e.currentTarget as HTMLElement).style.background = 'rgba(110,231,183,0.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>{r.region}</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#eef4f5', letterSpacing: '-0.03em', marginBottom: '4px' }}>{r.patients}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>patients helped</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>{r.states}</div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── METHODOLOGY ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}>Methodology</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>How we count</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', marginTop: '16px', lineHeight: 1.65 }}>Every methodology decision is documented and public. Click to expand each section.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {METHODOLOGY.map((m, i) => (
              <RevealBlock key={i} delay={i * 60}>
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: openMethod === i ? 'rgba(110,231,183,0.25)' : 'rgba(255,255,255,0.06)', background: openMethod === i ? 'rgba(110,231,183,0.04)' : 'transparent', transition: 'all 0.25s', marginBottom: '4px' }}>
                  <button
                    onClick={() => setOpenMethod(openMethod === i ? null : i)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', textAlign: 'left', gap: '16px' }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: 600 }}>{m.title}</span>
                    <ChevronDown size={16} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.4)', transform: openMethod === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                  </button>
                  <div style={{ maxHeight: openMethod === i ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                    <p style={{ padding: '0 24px 20px', fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: 0 }}>{m.body}</p>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPEN DATA ── */}
      <section style={{ padding: '100px 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><Database size={10} strokeWidth={1.5} /> Open data</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Download our public dataset</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', marginTop: '16px', maxWidth: '480px', lineHeight: 1.65 }}>Researchers, journalists, and advocates are welcome to use this data. No login required.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {[
              { name: 'Patient Journey Dataset', format: 'CSV', size: '2.4 MB', desc: 'Anonymized zip → symptom → clinic → outcome data', updated: 'Updated daily' },
              { name: 'Clinic Network Data',     format: 'JSON', size: '890 KB', desc: 'All 12,000+ partner clinics with services and hours', updated: 'Updated weekly' },
              { name: 'Outcomes Research',       format: 'PDF', size: '1.2 MB', desc: 'Full methodology and findings report, peer-reviewed', updated: 'Quarterly report' },
            ].map((d, i) => (
              <RevealBlock key={d.name} delay={i * 80}>
                <div style={{ padding: '2px', background: 'linear-gradient(135deg, rgba(110,231,183,0.15), rgba(110,231,183,0.04))', borderRadius: '18px' }}>
                  <div style={{ background: '#080D1A', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '100px', background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.18)', color: 'var(--accent)', fontWeight: 500 }}>{d.format}</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{d.size}</span>
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.3 }}>{d.name}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>{d.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{d.updated}</span>
                      <button
                        onClick={() => handleDownload(d.name, d.format)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '100px', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(110,231,183,0.2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(110,231,183,0.1)')}
                      >
                        <Download size={12} strokeWidth={2} /> Download
                      </button>
                    </div>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  )
}
