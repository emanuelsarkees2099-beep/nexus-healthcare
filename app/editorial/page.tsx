'use client'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { Book1, Clock, ArrowRight, TrendUp, SearchNormal1, CloseCircle, Location, Buildings2 } from 'iconsax-react'

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
  /** Set when this piece is adapted from an outside publication -- credits
   * the original with a link, rather than presenting it as originally
   * AXVO's own. Rewritten here in AXVO's own words (not reproduced text)
   * both to credit properly and to avoid duplicate-content problems for
   * both sites' SEO. */
  sourceName?: string
  sourceUrl?: string
}

const ARTICLES: Article[] = [
  {
    id: 1,
    category: 'Investigation',
    tag: 'Investigation',
    headline: 'The ZIP Code Lottery: How Your Address Determines Your Health',
    subhead: 'A data investigation into life expectancy gaps across American neighborhoods.',
    author: 'AXVO Research',
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
      'The AXVO clinic network exists precisely in these gaps. In every ZIP code with a life expectancy below 68 in our dataset, there is at least one FQHC or free clinic within 15 miles. The infrastructure exists. The barrier is awareness and navigation — which is what we\'re here to fix.',
    ],
  },
  {
    id: 2,
    category: 'Guide',
    tag: 'Patient Guide',
    headline: 'The No Surprises Act: What You\'re Actually Owed When You Show Up',
    subhead: 'A plain-language breakdown of your legal rights inside any American emergency room.',
    author: 'AXVO Legal Team',
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
    author: 'AXVO Data Desk',
    date: 'March 31, 2025',
    readTime: '7 min read',
    color: '#FCD34D',
    tldr: 'Insulin costs $0.10 to manufacture. It retails for up to $340/vial. Three patients died rationing it in 2023. Here\'s what changed and what hasn\'t.',
    body: [
      'Insulin has been around for over a century. It was discovered in 1921 at the University of Toronto. The patent was sold to the university for $1. The discoverers explicitly did not want it to become a monopoly.',
      'In 2023, the list price of a single vial of Humalog (insulin lispro) was $274.70. The estimated manufacturing cost per vial: roughly $2–6. Three people in the United States died rationing insulin in 2023 that we know of. The true number is higher.',
      'The Inflation Reduction Act of 2022 capped Medicare insulin costs at $35/month. President Biden\'s executive action extended $35 caps to Medicaid in many states. Manufacturers Eli Lilly, Novo Nordisk, and Sanofi — who together control 90% of the U.S. market — announced voluntary $35 caps for uninsured patients in 2023.',
      'But voluntary caps have gaps. They apply to branded products, not all formulations. They require paperwork. They expire. And they don\'t help the 16 million Americans who are neither insured nor Medicaid-eligible but also can\'t navigate a manufacturer PAP program at 2am when they\'re out of insulin.',
      'The solution AXVO has implemented: our Programs page surfaces the 340B drug pricing program, manufacturer PAP programs, state-level insulin programs, and community health centers that dispense insulin on a sliding scale. For most uninsured patients, insulin can be obtained for $8–$35/month through stacked programs. The knowledge gap is more lethal than the access gap.',
    ],
  },
  {
    id: 4,
    category: 'Investigation',
    tag: 'Policy Brief',
    headline: 'The Medicaid Coverage Cliff: What Happens After December 2025',
    subhead: 'Enhanced ACA subsidies expire at year-end. Here\'s who\'s at risk and what you can do.',
    author: 'AXVO Policy Team',
    date: 'March 24, 2025',
    readTime: '5 min read',
    color: '#F87171',
    tldr: 'Up to 3 million people could lose ACA coverage when enhanced subsidies expire Dec 31, 2025. Most qualify for alternatives they don\'t know about.',
    body: [
      'The American Rescue Plan of 2021 dramatically enhanced Affordable Care Act subsidies, making coverage free or near-free for millions of Americans. The Inflation Reduction Act of 2022 extended those enhancements through December 31, 2025.',
      'After that date, premiums could rise by $300–$600/month for many enrollees. CBO estimates 3 million people could lose coverage. The disproportionate impact falls on people earning 200–400% of the federal poverty line — working people who earn too much for Medicaid but can\'t afford unsubsidized premiums.',
      'What\'s important to understand: even if you lose marketplace coverage, there are alternatives. Every person in the United States is within 30 miles of at least one Federally Qualified Health Center that is required by federal law to provide care on a sliding scale regardless of insurance status.',
      'AXVO is monitoring this situation. If you\'re currently enrolled in an ACA marketplace plan and concerned about December 2025, use our Programs eligibility checker now to understand your full range of options — including Medicaid, CHIP, and 340B pharmacy access — before the deadline.',
    ],
  },
  {
    id: 5,
    category: 'Community',
    tag: 'Community',
    headline: '"The CHW Knew My Dialect." Language Access as a Medical Right.',
    subhead: 'How translation errors kill — and how community health workers are fixing it from the inside.',
    author: 'AXVO Voices',
    date: 'March 17, 2025',
    readTime: '5 min read',
    color: '#60A5FA',
    tldr: '40 million Americans speak limited English. Fewer than 3% of clinics have certified interpreters. The gap kills people through misdiagnosis and delayed care.',
    body: [
      'The standard of care for limited English proficient (LEP) patients, under Title VI of the Civil Rights Act of 1964, is that any healthcare entity receiving federal funding must provide meaningful language access — at no cost to the patient. This includes hospitals, clinics receiving Medicaid reimbursement, and any provider that accepts Medicare.',
      'In practice, this standard is routinely violated. A 2022 study in JAMA Internal Medicine found that LEP patients were 3x more likely to experience adverse events after hospital discharge, largely due to communication failures. They were less likely to receive discharge instructions in their language and more likely to be readmitted within 30 days.',
      'The most effective intervention is not machine translation. It is the community health worker — a trained, often bilingual navigator who comes from the community they serve, understands its cultural context, and can bridge not just language but medical literacy.',
      'AXVO\'s CHW network focuses specifically on matching patients with workers who share their native language and cultural background. This matters more than most people realize. Vietnamese, for example, has significant dialectal variation. A Cantonese-speaking patient is not well-served by a Mandarin interpreter. The nuances of pain description, cultural explanations of illness, and trust-building are impossible to convey across these gaps.',
      'If you or someone you know needs care and faces a language barrier: this is your right, not a favor.',
    ],
  },
  {
    id: 6,
    category: 'Guide',
    tag: 'Tools Guide',
    headline: 'A Veteran CHW\'s Guide to Getting Dental Care When You\'re Uninsured',
    subhead: 'Dental coverage is the cruelest gap in American healthcare. Here are eight ways around it.',
    author: 'AXVO Voices',
    date: 'March 10, 2025',
    readTime: '6 min read',
    color: '#FB923C',
    tldr: '74 million Americans have no dental insurance. Untreated tooth infections kill. Here are 8 real, working options that most people have never heard of.',
    body: [
      'Community health workers report that dental care is one of the questions they hear most often — more than Medicaid, more than prescriptions, more than emergency rooms: "How do I get dental care?"',
      'The answer is more complicated than it should be, because dental care has been historically excluded from the definition of "healthcare" in the United States. Medicare doesn\'t cover routine dental. Medicaid covers dental for children but coverage for adults varies wildly by state. The ACA doesn\'t require dental coverage in marketplace plans for adults.',
      'Here are eight options worth knowing about — most people have never heard of more than one or two of them. 1) Dental schools (many offer full procedures at 40–60% discount through supervised student clinics). 2) FQHC dental days. 3) Mission of Mercy events (two-day free clinics — find the schedule at missionofmercy.org). 4) Delta Dental Foundation programs. 5) State 340B dental programs. 6) Donated dental services (volunteerdental.org). 7) National Dental Association community days. 8) HRSA Health Center finder filtered by dental services.',
      'A tooth infection that goes untreated can spread to your jaw, your neck, your brain. It is a life-threatening emergency if it gets to that point. Don\'t let it. One of these eight options can get you seen.',
    ],
  },
  {
    id: 7,
    category: 'Investigation',
    tag: 'Investigation',
    headline: 'The Uninsured Crisis: Letter from Arizona',
    subhead: 'More than 800,000 Arizonans have no health coverage. The pattern behind who they are explains why the fix is harder than it looks.',
    author: 'Emanuel Sarkees',
    date: 'June 2, 2026',
    readTime: '7 min read',
    color: '#34D399',
    tldr: 'Arizona\'s 10.3% uninsured rate (43rd in the nation) isn\'t random — it clusters in exactly the counties, industries, and communities policy has quietly excluded for decades.',
    body: [
      'Arizona has one of the worst rates of health coverage in the country, and it\'s tempting to treat that as one problem with one fix. It isn\'t. Geography, industry, immigration status, and forty years of specific policy choices all point at the same populations, which is why the gap has been so hard to close.',
      'Start with who is actually uninsured. It\'s not, for the most part, people without jobs — it\'s full-time workers in agriculture, construction, and food service, industries where employer coverage is rare and expensive. Many of them land in a coverage gap that gets almost no attention: they earn too much for AHCCCS (Arizona\'s Medicaid program) but too little to afford a marketplace plan. The burden isn\'t even across the state either — Hispanic and Latino residents are uninsured at higher rates than white Arizonans, Native American residents face the added weight of chronically underfunded tribal healthcare, and rural border counties like Yuma, Santa Cruz, Apache, and Navajo run well above the rates seen in Phoenix or Tucson.',
      'The consequences are measurable, not abstract. Insurance status is one of the strongest predictors of cancer survival, because routine screening is what catches disease early — and routine screening is exactly what people skip when they\'re paying cash. Chronic conditions like diabetes and hypertension, manageable with regular checkups and medication, deteriorate instead. And the cost doesn\'t disappear when someone goes without insurance — it moves to the emergency room, then gets passed on to everyone else through higher premiums and public spending, which makes the current setup expensive for a state that\'s ostensibly trying to save money by not covering people.',
      'None of this happened by accident. Arizona was the last state in the country to adopt Medicaid at all, holding out until 1982. Enrollment for childless adults was frozen entirely in 2011. The state did eventually accept the ACA\'s Medicaid expansion in 2014, but AHCCCS still runs a restrictive, complicated enrollment process — enrollment dropped by over 153,000 people in the twelve months ending June 2024 alone, expansion notwithstanding. Federal law separately locks undocumented immigrants out of Medicaid and ACA marketplace coverage entirely, which matters enormously in a state where agriculture and construction — two of the least-insured industries — depend heavily on immigrant labor. Federal Medicaid cuts signed in July 2025 are projected to push Arizona\'s uninsured rate as high as 18-20%.',
      'The fixes are not mysterious, just politically unpopular: expand AHCCCS eligibility, simplify an enrollment process that currently works like a filter rather than a front door, fund more Federally Qualified Health Centers in the counties that need them most, run outreach in the languages people actually speak, and revisit immigration-based exclusions that leave essential workers with nowhere to go. Right now, Arizona funds uninsured care through the emergency room — the most expensive and least effective place to do it. AXVO can\'t fix Arizona\'s Medicaid policy, but it can at least make sure that in the meantime, nobody in Yuma or Apache County has to guess where their nearest FQHC is.',
    ],
    sourceName: 'The Health Care Blog',
    sourceUrl: 'https://thehealthcareblog.com/blog/2026/06/02/the-uninsured-crisis-letter-from-arizona/',
  },
  {
    id: 8,
    category: 'Data Story',
    tag: 'Data Story',
    headline: 'The Drug Changing Medicine',
    subhead: 'GLP-1 drugs are one of the biggest breakthroughs in modern medicine. The people who\'d benefit most can\'t afford them.',
    author: 'Emanuel Sarkees',
    date: 'July 21, 2026',
    readTime: '6 min read',
    color: '#22D3EE',
    tldr: 'List price for a GLP-1 prescription runs about $1,300/month and rose 442% between 2021 and 2023 — while the same drug can cost anywhere from $50 to that full price depending entirely on which coverage, if any, you happen to have.',
    body: [
      'GLP-1 receptor agonists — the drug class behind Ozempic and Wegovy — mimic a gut hormone that signals fullness, slows digestion, and stabilizes blood sugar. The 2023 SELECT trial found semaglutide cut cardiovascular events by 20% in obese patients who didn\'t even have diabetes, and research now underway extends into sleep apnea, chronic kidney disease, alcohol use disorder, and Alzheimer\'s. It\'s rare for one drug class to plausibly matter across that many conditions at once.',
      'The problem is what it costs, and specifically how differently it costs depending on who you are. List price runs around $1,300 a month, up 442% between 2021 and 2023. From there the spread is enormous: commercial insurance that actually covers obesity treatment might bring a copay down to $25; paying directly runs $99–350 a month through manufacturer programs; Medicare\'s new GLP-1 Bridge program, launched in July 2026, offers a $50 copay. If you\'re uninsured or underinsured, none of those paths exist for you — you\'re looking at the full list price, for a condition that disproportionately affects lower-income people and communities of color, who are also the people most likely to lack coverage in the first place.',
      'And the ground is still shifting under even the options that exist. The Medicare Bridge program excludes low-income subsidy recipients and is set to expire at the end of 2027 with no guarantee of renewal. Only 13 states currently cover GLP-1s for obesity through Medicaid — down from 16 just a year earlier. Compounded semaglutide, which had offered a roughly $200/month alternative, is now facing FDA restrictions with nothing affordable stepping in to replace it.',
      'None of this requires a scientific breakthrough to fix — the drug already works. It requires permanent Medicare coverage instead of a program with an expiration date, mandatory Medicaid coverage instead of a shrinking patchwork of 13 states, and federal price negotiation aggressive enough to close a 27-times gap between the lowest and highest price for the identical medication. Until that happens, AXVO\'s job is narrower but concrete: our medication assistance finder tracks patient assistance programs and discount pricing for exactly this kind of gap.',
    ],
    sourceName: 'The Health Care Blog',
    sourceUrl: 'https://thehealthcareblog.com/blog/2026/07/21/the-drug-changing-medicine/',
  },
  {
    id: 9,
    category: 'Investigation',
    tag: 'Investigation',
    headline: 'Prior Authorization',
    subhead: 'Most people have never heard of prior authorization until it personally stops them from getting care they need.',
    author: 'Emanuel Sarkees',
    date: 'August 20, 2026',
    readTime: '6 min read',
    color: '#F472B6',
    tldr: 'Physicians spend roughly 13 hours a week — nearly two full workdays — getting insurers to approve care they\'ve already decided their patients need. 95% say it gets in the way of necessary treatment.',
    body: [
      'Prior authorization requires a doctor to get insurance company sign-off before a patient can receive certain treatment, tests, or medication. Almost nobody knows it exists until a denial personally affects them or someone they love — and once it does, the frustration tends to compound, because the process wears down patients, physicians, and even the insurers administering it.',
      'The scale of the burden is not anecdotal. The AMA\'s 2025 survey found physicians spend about 13 hours a week processing roughly 40 authorization requests — nearly two full workdays lost to paperwork instead of patients. 95% of physicians surveyed said the process gets in the way of care their patients actually need. A Johns Hopkins review connected prior authorization delays to disease progression, longer hospital stays, and lower cancer survival rates, and a RAND analysis documented specific harm — including a diabetic child left waiting for insulin approval.',
      'The damage isn\'t distributed evenly. Lower-income and Medicaid patients are hit hardest, since they have the fewest resources to appeal a denial or pay out of pocket while they wait. A 2025 KFF poll found 58% of insured adults had experienced a delay or denial, with the rate climbing higher among lower-income respondents — the same pattern of "the people with the least get the least" that shows up across nearly every part of the healthcare system.',
      'There have been promises. In June 2025, sixty insurers pledged to streamline the process. In April 2026, CMS proposed extending electronic prior authorization to prescription drugs, with faster timelines and mandatory transparency reporting. Physicians aren\'t convinced — only about a third believe the reforms will meaningfully change anything, largely because a nearly identical pledge in 2018 produced almost no real change. Even now, 89% of the administrative burden remains despite an 11% drop in the number of authorizations required.',
      'The reforms that would actually move the number: making "gold carding" — exempting high-performing physicians from authorization requirements for treatments they reliably get right — a federal standard rather than a handful of state programs; extending CMS\'s new rules to the commercial insurance plans currently shielded under ERISA; and attaching real penalties to insurers with outlier denial rates instead of just reporting requirements. Prior authorization was designed to catch unnecessary procedures. Right now it\'s doing the opposite — restricting care that was never unnecessary in the first place.',
    ],
    sourceName: 'The Health Care Blog',
    sourceUrl: 'https://thehealthcareblog.com/blog/2026/08/20/prior-authorization/',
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
            <ArrowRight size={13} variant="Linear" style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} />
          </button>
          <div style={{ marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-inter)' }}>
            By {article.author}
            {article.sourceUrl && (
              <> — originally published on{' '}
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: article.color, textDecoration: 'none' }}>
                  {article.sourceName} ↗
                </a>
              </>
            )}
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
            <Clock size={14} color="rgba(255,255,255,0.45)" variant="Linear" /> {article.readTime}
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
          <ArrowRight size={12} variant="Linear" style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} />
        </button>
      </div>

      <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-inter)' }}>{article.author}</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-inter)' }}>{article.date}</span>
        </div>
        {article.sourceUrl && (
          <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10.5px', color: article.color, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
            Originally published on {article.sourceName} ↗
          </a>
        )}
      </div>
    </div>
  )
}

export default function EditorialPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  const featured = ARTICLES.find(a => a.featured)
  const rest = ARTICLES.filter(a => !a.featured)

  const filtered = rest.filter(a => {
    const matchCat = activeCategory === 'All' || a.category === activeCategory
    const matchSearch = !search || a.headline.toLowerCase().includes(search.toLowerCase()) || a.subhead.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const visibleArticles = showAll || search || activeCategory !== 'All' ? filtered : filtered.slice(0, 3)

  return (
    <AppShell>

      {/* ── HERO ── */}
      <section style={{
        padding: '100px 24px 60px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,144,217,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <Reveal>
          <div style={{ ...pill, marginBottom: '24px' }}><Book1 size={14} variant="Linear" /> Editorial</div>
        </Reveal>
        <Reveal delay={80}>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px', maxWidth: '700px', margin: '0 auto 20px' }}>
            Stories that<br />
            <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>move the needle</em>
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
          <style>{`
            @media (max-width: 640px) {
              .editorial-filter-bar { flex-direction: column !important; align-items: stretch !important; }
              .editorial-search-box { margin-left: 0 !important; }
              .editorial-search-input { flex: 1 !important; width: auto !important; min-width: 0 !important; }
            }
          `}</style>
          <Reveal>
            <div className="editorial-filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '48px' }}>
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
              <div className="editorial-search-box" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', padding: '8px 14px', transition: 'border-color 0.2s' }}>
                <SearchNormal1 size={13} variant="Linear" color="rgba(255,255,255,0.4)" />
                <input
                  className="editorial-search-input"
                  type="search"
                  placeholder="Search articles…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text)', fontFamily: 'inherit', width: '180px' }}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '0', display: 'flex' }}>
                    <CloseCircle size={12} color="rgba(255,255,255,0.5)" />
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
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
                {visibleArticles.map((a, i) => (
                  <Reveal key={a.id} delay={i * 60}>
                    <ArticleCard article={a} />
                  </Reveal>
                ))}
              </div>
              {!showAll && !search && activeCategory === 'All' && filtered.length > 3 && (
                <Reveal>
                  <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button
                      onClick={() => setShowAll(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '100px', border: '1px solid rgba(74,144,217,0.3)', background: 'rgba(74,144,217,0.06)', color: 'var(--accent)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.25s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(74,144,217,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,144,217,0.5)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(74,144,217,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,144,217,0.3)' }}
                    >
                      Show {filtered.length - 3} more {filtered.length - 3 === 1 ? 'story' : 'stories'} <ArrowRight size={14} variant="Linear" />
                    </button>
                  </div>
                </Reveal>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <Book1 size={36} color="rgba(255,255,255,0.4)" variant="TwoTone" aria-hidden="true" />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>No articles found</div>
              <div style={{ fontSize: '14px' }}>Try a different search term or category.</div>
            </div>
          )}

          {/* City guides */}
          <Reveal>
            <div style={{ marginTop: '80px', marginBottom: '48px' }}>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ ...pill, marginBottom: '16px' }}><Location size={14} variant="Linear" aria-hidden="true" /> City Guides</div>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 10px' }}>Free care, by city</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '0', lineHeight: 1.6, maxWidth: '480px' }}>
                  Navigating free and low-cost care in the cities where the need is greatest.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                {[
                  { city: 'Houston',      state: 'TX', zip: '77001', clinics: 148, pop: '2.3M uninsured', color: '#4A90D9' },
                  { city: 'Phoenix',      state: 'AZ', zip: '85001', clinics: 112, pop: '1.1M uninsured', color: '#a78bfa' },
                  { city: 'Los Angeles',  state: 'CA', zip: '90001', clinics: 203, pop: '2.8M uninsured', color: '#fb923c' },
                  { city: 'Dallas',       state: 'TX', zip: '75201', clinics: 97,  pop: '940K uninsured', color: '#60a5fa' },
                  { city: 'Miami',        state: 'FL', zip: '33101', clinics: 88,  pop: '720K uninsured', color: '#f472b6' },
                  { city: 'Chicago',      state: 'IL', zip: '60601', clinics: 134, pop: '1.2M uninsured', color: '#fcd34d' },
                  { city: 'New York',     state: 'NY', zip: '10001', clinics: 187, pop: '1.5M uninsured', color: '#4ade80' },
                  { city: 'San Antonio',  state: 'TX', zip: '78201', clinics: 79,  pop: '610K uninsured', color: '#f87171' },
                  { city: 'Las Vegas',    state: 'NV', zip: '89101', clinics: 64,  pop: '480K uninsured', color: '#a78bfa' },
                  { city: 'Atlanta',      state: 'GA', zip: '30301', clinics: 91,  pop: '830K uninsured', color: '#34d399' },
                  { city: 'San Diego',    state: 'CA', zip: '92101', clinics: 76,  pop: '510K uninsured', color: '#60a5fa' },
                  { city: 'Tucson',       state: 'AZ', zip: '85701', clinics: 58,  pop: '290K uninsured', color: '#4A90D9' },
                ].map(g => (
                  <a
                    key={g.city}
                    href={`/search?loc=${encodeURIComponent(g.zip)}&q=free+clinic`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div
                      style={{
                        padding: '20px 22px', borderRadius: '16px',
                        background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
                        transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
                        cursor: 'pointer', height: '100%', boxSizing: 'border-box',
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${g.color}40`; el.style.background = `${g.color}08`; el.style.transform = 'translateY(-3px)' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.background = 'rgba(255,255,255,0.025)'; el.style.transform = 'translateY(0)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${g.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Buildings2 size={16} color={g.color} variant="Linear" aria-hidden="true" />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: g.color, letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '6px', background: `${g.color}10`, border: `1px solid ${g.color}20` }}>{g.state}</span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: 'var(--text)', letterSpacing: '-0.01em' }}>{g.city}</div>
                      <div style={{ fontSize: '12px', color: g.color, fontWeight: 600, marginBottom: '3px' }}>{g.clinics} free clinics</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{g.pop}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '14px', fontSize: '12px', color: g.color, fontWeight: 600 }}>
                        Explore <ArrowRight size={11} />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Newsletter / pitch */}
          <Reveal>
            <div style={{
              marginTop: '48px', padding: '4px', borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(74,144,217,0.2), rgba(74,144,217,0.04))',
            }}>
              <div style={{
                borderRadius: '21px', padding: '48px',
                background: 'rgba(8,13,26,0.97)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '32px',
              }}>
                <div>
                  <div style={{ ...pill, marginBottom: '16px' }}><TrendUp size={14} variant="Linear" /> Pitch us</div>
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
                  Submit your story <ArrowRight size={13} variant="Linear" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  )
}
