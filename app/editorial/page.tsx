'use client'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { BookOpen, Clock, ArrowRight, TrendingUp, Search, X } from 'lucide-react'

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible: v }
}
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      {children}
    </div>
  )
}

const pill: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '4px 12px', borderRadius: '100px',
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
  background: 'rgba(74,144,217,0.08)', color: 'var(--accent)',
  border: '1px solid rgba(74,144,217,0.18)',
}

type Article = {
  id: number
  category: string
  tag: string
  headline: string
  subhead: string
  author: string
  date: string
  readTime: string
  color: string
  featured?: boolean
  body: string[]
  tldr: string
}

const ARTICLES: Article[] = [
  {
    id: 1,
    category: 'Investigation',
    tag: 'Investigation',
    headline: 'The ZIP Code Lottery: How Your Address Determines Your Health',
    subhead: 'A data investigation into life expectancy gaps across American neighborhoods.',
    author: 'NEXUS Research',
    date: 'April 14, 2025',
    readTime: '8 min read',
    color: '#4A90D9',
    featured: true,
    tldr: 'ZIP codes 4 miles apart in Houston have a 20-year life expectancy gap. The healthcare desert is not geography — it\'s policy.',
    body: [
      'In Houston, Texas, there are two ZIP codes roughly four miles apart. In 77002 — downtown, proximate to the Texas Medical Center — residents live on average to 82. In 77021 — the Third Ward — that number is 62. Twenty years. For a distance you could bike in thirty minutes.',
      'This gap is not unique to Houston. Across the United States, we mapped life expectancy data against HRSA clinic density, Medicaid expansion status, and median income for 2,847 ZIP codes with populations over 10,000.',
      'The results are unambiguous: the strongest predictor of life expectancy in a ZIP code is not its hospital proximity, not its pollution index, and not even its poverty rate. It is whether the state expanded Medicaid in 2014. Non-expansion states have a median gap of 4.8 additional years of life lost compared to expansion states, controlling for income.',
      'What this means in practice is that a political decision — made once, in 2014, by state legislators — is still killing people today. The mechanism is straightforward: when people can\'t afford primary care, they delay. Delayed care becomes emergency care. Emergency care becomes preventable death.',
      'The NEXUS clinic network exists precisely in these gaps. In every ZIP code with a life expectancy below 68 in our dataset, there is at least one FQHC or free clinic within 15 miles. The infrastructure exists. The barrier is awareness and navigation — which is what we\'re here to fix.',
    ],
  },
  {
    id: 2,
    category: 'Guide',
    tag: 'Patient Guide',
    headline: 'The No Surprises Act: What You\'re Actually Owed When You Show Up',
    subhead: 'A plain-language breakdown of your legal rights inside any American emergency room.',
    author: 'NEXUS Legal Team',
    date: 'April 8, 2025',
    readTime: '6 min read',
    color: '#A78BFA',
    tldr: 'Hospitals can\'t turn you away. They can\'t demand payment before stabilization. The bill that arrives 60 days later can be disputed — and often should be.',
    body: [
      'Every year, an estimated 2.3 million Americans avoid emergency care because they\'re afraid of the bill. Some of them die from conditions that would have been treatable. This guide is for them.',
      'The Emergency Medical Treatment and Labor Act (EMTALA), enacted in 1986, requires that any hospital accepting Medicare — which is nearly every hospital in the United States — must screen and stabilize any patient who presents to their emergency department, regardless of ability to pay, insurance status, or immigration status. You cannot be turned away. You cannot be asked for your insurance card before you are stabilized.',
      'The No Surprises Act of 2022 added additional protections: out-of-network providers in an in-network facility cannot bill you more than your in-network cost-sharing. If you receive a surprise bill, you have 120 days to initiate a dispute.',
      'What this means practically: show up. Get seen. The financial conversation happens later — and it is a conversation you have significant leverage in, especially if you are uninsured. Hospitals are legally required to have financial assistance programs. Non-profit hospitals (which are most hospitals) are required by law to provide charity care to patients below certain income thresholds — typically 200–400% of the federal poverty line.',
      'Ask for the hospital\'s financial counselor. Ask specifically about "charity care," "financial assistance," or "Hill-Burton obligations." Don\'t leave without knowing what programs you qualify for.',
    ],
  },
  {
    id: 3,
    category: 'Data Story',
    tag: 'Data Story',
    headline: 'The Insulin Crisis Is a Policy Crisis. Here\'s the Map.',
    subhead: 'How three manufacturers control a century-old drug and what\'s being done about it.',
    author: 'NEXUS Data Desk',
    date: 'March 31, 2025',
    readTime: '7 min read',
    color: '#FCD34D',
    tldr: 'Insulin costs $0.10 to manufacture. It retails for up to $340/vial. Three patients died rationing it in 2023. Here\'s what changed and what hasn\'t.',
    body: [
      'Insulin has been around for over a century. It was discovered in 1921 at the University of Toronto. The patent was sold to the university for $1. The discoverers explicitly did not want it to become a monopoly.',
      'In 2023, the list price of a single vial of Humalog (insulin lispro) was $274.70. The estimated manufacturing cost per vial: roughly $2–6. Three people in the United States died rationing insulin in 2023 that we know of. The true number is higher.',
      'The Inflation Reduction Act of 2022 capped Medicare insulin costs at $35/month. President Biden\'s executive action extended $35 caps to Medicaid in many states. Manufacturers Eli Lilly, Novo Nordisk, and Sanofi — who together control 90% of the U.S. market — announced voluntary $35 caps for uninsured patients in 2023.',
      'But voluntary caps have gaps. They apply to branded products, not all formulations. They require paperwork. They expire. And they don\'t help the 16 million Americans who are neither insured nor Medicaid-eligible but also can\'t navigate a manufacturer PAP program at 2am when they\'re out of insulin.',
      'The solution NEXUS has implemented: our Programs page surfaces the 340B drug pricing program, manufacturer PAP programs, state-level insulin programs, and community health centers that dispense insulin on a sliding scale. For most uninsured patients, insulin can be obtained for $8–$35/month through stacked programs. The knowledge gap is more lethal than the access gap.',
    ],
  },
  {
    id: 4,
    category: 'Investigation',
    tag: 'Policy Brief',
    headline: 'The Medicaid Coverage Cliff: What Happens After December 2025',
    subhead: 'Enhanced ACA subsidies expire at year-end. Here\'s who\'s at risk and what you can do.',
    author: 'NEXUS Policy Team',
    date: 'March 24, 2025',
    readTime: '5 min read',
    color: '#F87171',
    tldr: 'Up to 3 million people could lose ACA coverage when enhanced subsidies expire Dec 31, 2025. Most qualify for alternatives they don\'t know about.',
    body: [
      'The American Rescue Plan of 2021 dramatically enhanced Affordable Care Act subsidies, making coverage free or near-free for millions of Americans. The Inflation Reduction Act of 2022 extended those enhancements through December 31, 2025.',
      'After that date, premiums could rise by $300–$600/month for many enrollees. CBO estimates 3 million people could lose coverage. The disproportionate impact falls on people earning 200–400% of the federal poverty line — working people who earn too much for Medicaid but can\'t afford unsubsidized premiums.',
      'What\'s important to understand: even if you lose marketplace coverage, there are alternatives. Every person in the United States is within 30 miles of at least one Federally Qualified Health Center that is required by federal law to provide care on a sliding scale regardless of insurance status.',
      'NEXUS is monitoring this situation. If you\'re currently enrolled in an ACA marketplace plan and concerned about December 2025, use our Programs eligibility checker now to understand your full range of options — including Medicaid, CHIP, and 340B pharmacy access — before the deadline.',
    ],
  },
  {
    id: 5,
    category: 'Community',
    tag: 'Community',
    headline: '"The CHW Knew My Dialect." Language Access as a Medical Right.',
    subhead: 'How translation errors kill — and how community health workers are fixing it from the inside.',
    author: 'NEXUS Voices',
    date: 'March 17, 2025',
    readTime: '5 min read',
    color: '#60A5FA',
    tldr: '40 million Americans speak limited English. Fewer than 3% of clinics have certified interpreters. The gap kills people through misdiagnosis and delayed care.',
    body: [
      'The standard of care for limited English proficient (LEP) patients, under Title VI of the Civil Rights Act of 1964, is that any healthcare entity receiving federal funding must provide meaningful language access — at no cost to the patient. This includes hospitals, clinics receiving Medicaid reimbursement, and any provider that accepts Medicare.',
      'In practice, this standard is routinely violated. A 2022 study in JAMA Internal Medicine found that LEP patients were 3x more likely to experience adverse events after hospital discharge, largely due to communication failures. They were less likely to receive discharge instructions in their language and more likely to be readmitted within 30 days.',
      'The most effective intervention is not machine translation. It is the community health worker — a trained, often bilingual navigator who comes from the community they serve, understands its cultural context, and can bridge not just language but medical literacy.',
      'NEXUS\'s CHW network focuses specifically on matching patients with workers who share their native language and cultural background. This matters more than most people realize. Vietnamese, for example, has significant dialectal variation. A Cantonese-speaking patient is not well-served by a Mandarin interpreter. The nuances of pain description, cultural explanations of illness, and trust-building are impossible to convey across these gaps.',
      'If you or someone you know needs care and faces a language barrier: this is your right, not a favor.',
    ],
  },
  {
    id: 6,
    category: 'Guide',
    tag: 'Tools Guide',
    headline: 'A Veteran CHW\'s Guide to Getting Dental Care When You\'re Uninsured',
    subhead: 'Dental coverage is the cruelest gap in American healthcare. Here are eight ways around it.',
    author: 'Rosa Martinez, CHW · Phoenix, AZ',
    date: 'March 10, 2025',
    readTime: '6 min read',
    color: '#FB923C',
    tldr: '74 million Americans have no dental insurance. Untreated tooth infections kill. Here are 8 real, working options that most people have never heard of.',
    body: [
      'I\'ve been a community health worker for eleven years. The question I get most often — more than Medicaid, more than prescriptions, more than emergency rooms — is: "How do I get dental care?"',
      'The answer is more complicated than it should be, because dental care has been historically excluded from the definition of "healthcare" in the United States. Medicare doesn\'t cover routine dental. Medicaid covers dental for children but coverage for adults varies wildly by state. The ACA doesn\'t require dental coverage in marketplace plans for adults.',
      'Here are the eight options I walk every patient through. Most people have never heard of more than one or two of them. 1) Dental schools (University of Arizona College of Dentistry offers full procedures at 40–60% discount). 2) FQHC dental days. 3) Mission of Mercy events (two-day free clinics — find the schedule at missionofmercy.org). 4) Delta Dental Foundation programs. 5) State 340B dental programs. 6) Donated dental services (volunteerdental.org). 7) National Dental Association community days. 8) HRSA Health Center finder filtered by dental services.',
      'The most important thing I tell people: a tooth infection that goes untreated can spread to your jaw, your neck, your brain. It is a life-threatening emergency if it gets to that point. Don\'t let it. One of these eight options can get you seen.',
    ],
  },
]

const CATEGORIES = ['All', 'Investigation', 'Guide', 'Data Story', 'Community']
const CATEGORY_COLORS: Record<string, string> = {
  Investigation: '#4A90D9', Guide: '#A78BFA', 'Data Story': '#FCD34D', Community: '#60A5FA',
}

function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  if (featured) {
    return (
      <div style={{
        padding: '2px', borderRadius: '24px',
        background: `linear-gradient(135deg, ${article.color}33, ${article.color}08)`,
        marginBottom: '32px',
      }}>
        <div style={{
          background: 'rgba(8,13,26,0.98)', borderRadius: '22px',
          padding: 'clamp(28px, 4vw, 48px)',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px',
              background: `${article.color}15`, border: `1px solid ${article.color}33`, color: article.color,
              fontFamily: 'var(--font-inter)', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>{article.tag}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-inter)' }}>{article.readTime}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-inter)' }}>{article.date}</span>
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px',
              background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.25)', color: '#FCD34D',
              fontFamily: 'var(--font-inter)', letterSpacing: '0.06em',
            }}>Featured</span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '12px' }}>
            {article.headline}
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '20px', maxWidth: '640px' }}>
            {article.subhead}
          </p>
          {/* TL;DR */}
          <div style={{
            padding: '14px 18px', borderRadius: '12px', marginBottom: '24px',
            background: `${article.color}08`, border: `1px solid ${article.color}22`,
          }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: article.color, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', marginRight: '8px' }}>TL;DR</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-inter)', lineHeight: 1.5 }}>{article.tldr}</span>
          </div>
          {/* Body */}
          <div style={{ maxHeight: expanded ? '2000px' : '0', overflow: 'hidden', transition: 'max-height 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
            {article.body.map((para, i) => (
              <p key={i} style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: '20px', fontFamily: 'var(--font-inter)' }}>
                {para}
              </p>
            ))}
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 22px', borderRadius: '100px',
              background: `${article.color}15`, border: `1px solid ${article.color}33`,
              color: article.color, fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = `${article.color}25`)}
            onMouseLeave={e => (e.currentTarget.style.background = `${article.color}15`)}
          >
            {expanded ? 'Collapse' : 'Read full story'}
            <ArrowRight size={13} strokeWidth={2} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} />
          </button>
          <div style={{ marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-inter)' }}>
            By {article.author}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      borderRadius: '20px', overflow: 'hidden',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      transition: 'border-color 0.3s, background 0.3s, transform 0.3s',
      display: 'flex', flexDirection: 'column',
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${article.color}33`; el.style.background = `${article.color}04`; el.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.background = 'rgba(255,255,255,0.02)'; el.style.transform = 'translateY(0)' }}
    >
      {/* Top accent */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${article.color}, ${article.color}44, transparent)` }} aria-hidden="true" />

      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', background: `${article.color}15`, border: `1px solid ${article.color}33`, color: article.color, fontFamily: 'var(--font-inter)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{article.tag}</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-inter)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={10} strokeWidth={2} /> {article.readTime}
          </span>
        </div>

        <h3 style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.3, color: 'var(--text)', margin: 0 }}>{article.headline}</h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, margin: 0 }}>{article.subhead}</p>

        <div style={{ padding: '12px 14px', borderRadius: '10px', background: `${article.color}08`, border: `1px solid ${article.color}18`, marginTop: 'auto' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: article.color, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', marginRight: '6px' }}>TL;DR</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-inter)', lineHeight: 1.5 }}>{article.tldr}</span>
        </div>

        {/* Expandable body */}
        <div style={{ maxHeight: expanded ? '1200px' : '0', overflow: 'hidden', transition: 'max-height 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
          {article.body.map((para, i) => (
            <p key={i} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: '14px', fontFamily: 'var(--font-inter)', marginTop: i === 0 ? '14px' : 0 }}>
              {para}
            </p>
          ))}
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: 600, color: article.color,
            background: 'none', border: 'none', cursor: 'pointer', padding: '0',
            fontFamily: 'inherit', transition: 'opacity 0.2s',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {expanded ? 'Collapse' : 'Read more'}
          <ArrowRight size={12} strokeWidth={2} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} />
        </button>
      </div>

      <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-inter)' }}>{article.author}</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-inter)' }}>{article.date}</span>
      </div>
    </div>
  )
}

export default function EditorialPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const featured = ARTICLES.find(a => a.featured)
  const rest = ARTICLES.filter(a => !a.featured)

  const filtered = rest.filter(a => {
    const matchCat = activeCategory === 'All' || a.category === activeCategory
    const matchSearch = !search || a.headline.toLowerCase().includes(search.toLowerCase()) || a.subhead.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <AppShell>

      {/* ── HERO ── */}
      <section style={{
        padding: '100px 24px 60px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,144,217,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <Reveal>
          <div style={{ ...pill, marginBottom: '24px' }}><BookOpen size={10} strokeWidth={1.5} /> Editorial</div>
        </Reveal>
        <Reveal delay={80}>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '20px', maxWidth: '700px', margin: '0 auto 20px' }}>
            Healthcare journalism{' '}
            <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>that does something</em>
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.45)', maxWidth: '500px', lineHeight: 1.7, margin: '0 auto 40px' }}>
            Investigations, guides, data stories, and first-person accounts of what it's like to navigate American healthcare without coverage.
          </p>
        </Reveal>
      </section>

      {/* ── CONTENT ── */}
      <section style={{ padding: '0 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '48px' }}>

          {/* Filter bar */}
          <Reveal>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '48px' }}>
              {/* Category pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '8px 18px', borderRadius: '100px', fontSize: '13px', fontWeight: 500,
                      fontFamily: 'inherit', cursor: 'pointer',
                      background: activeCategory === cat
                        ? (cat === 'All' ? 'rgba(74,144,217,0.15)' : `${CATEGORY_COLORS[cat] || 'var(--accent)'}15`)
                        : 'rgba(255,255,255,0.03)',
                      color: activeCategory === cat
                        ? (cat === 'All' ? 'var(--accent)' : CATEGORY_COLORS[cat] || 'var(--accent)')
                        : 'rgba(255,255,255,0.4)',
                      border: `1px solid ${activeCategory === cat
                        ? (cat === 'All' ? 'rgba(74,144,217,0.35)' : `${CATEGORY_COLORS[cat] || 'var(--accent)'}35`)
                        : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.2s',
                    }}
                  >{cat}</button>
                ))}
              </div>

              {/* Search box */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', padding: '8px 14px', transition: 'border-color 0.2s' }}>
                <Search size={13} strokeWidth={2} color="rgba(255,255,255,0.4)" />
                <input
                  type="search"
                  placeholder="Search articles…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text)', fontFamily: 'inherit', width: '180px' }}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '0', display: 'flex' }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </Reveal>

          {/* Featured */}
          {featured && activeCategory === 'All' && !search && (
            <Reveal>
              <ArticleCard article={featured} featured />
            </Reveal>
          )}

          {/* Grid */}
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
              {filtered.map((a, i) => (
                <Reveal key={a.id} delay={i * 60}>
                  <ArticleCard article={a} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📰</div>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>No articles found</div>
              <div style={{ fontSize: '14px' }}>Try a different search term or category.</div>
            </div>
          )}

          {/* Newsletter / pitch */}
          <Reveal>
            <div style={{
              marginTop: '80px', padding: '4px', borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(74,144,217,0.2), rgba(74,144,217,0.04))',
            }}>
              <div style={{
                borderRadius: '21px', padding: '48px',
                background: 'rgba(8,13,26,0.97)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '32px',
              }}>
                <div>
                  <div style={{ ...pill, marginBottom: '16px' }}><TrendingUp size={10} strokeWidth={1.5} /> Pitch us</div>
                  <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Have a story to tell?</h2>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '440px', lineHeight: 1.65 }}>
                    We publish first-person healthcare navigation stories, policy analysis, and community guides. If you've navigated the system and learned something, we want to hear from you.
                  </p>
                </div>
                <a href="/stories" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '14px 24px', borderRadius: '100px',
                  background: 'rgba(255,255,255,0.92)', color: '#07070F',
                  fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                  whiteSpace: 'nowrap', transition: 'transform 0.3s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  Submit your story <ArrowRight size={13} strokeWidth={2} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  )
}
