'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import AppShell from '@/components/AppShell'
import JsonLd, { ELIGIBILITY_FAQ_SCHEMA, breadcrumbSchema } from '@/components/JsonLd'
import {
  ShieldTick, DollarCircle, TrendUp, Flash, Heart, Profile, Hospital,
  ArrowRight2, ArrowLeft2, TickCircle, InfoCircle, ExportSquare,
  Location, Profile2User, Briefcase, Activity, ArrowRight, MagicStar,
  RefreshCircle, Warning2,
} from 'iconsax-react'

/* ════════════════════════════════════════════════════════════
   STATE-SPECIFIC DATA  (2024)
   ════════════════════════════════════════════════════════════ */

/** States that have adopted ACA Medicaid expansion (138% FPL adult threshold) */
const EXPANSION_STATES = new Set([
  'AK','AZ','AR','CA','CO','CT','DC','DE','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MO','MT','NE',
  'NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI',
  'SD','UT','VA','VT','WA','WI','WV',
])

/** States with enhanced/higher CHIP income thresholds (≥300% FPL for children) */
const HIGH_CHIP_STATES = new Set([
  'CA','CT','DC','HI','IL','MA','MD','MN','NJ','NY','RI','VT','WA','WI',
])

/** 2024 FPL (Federal Poverty Level) thresholds by household size */
const FPL_2024: Record<number, number> = {
  1: 15060, 2: 20440, 3: 25820, 4: 31200, 5: 36580, 6: 41960, 7: 47340, 8: 52720,
}

const FPL_FOR = (hh: number) => FPL_2024[Math.min(Math.max(hh, 1), 8)] ?? 52720

/**
 * State-specific Medicaid enrollment portals (2024).
 * Falls back to healthcare.gov when a state URL is missing.
 */
const STATE_MEDICAID_URLS: Record<string, string> = {
  AL: 'https://myalabama.gov/medicaid',
  AK: 'https://manuals.medicaidalaska.com/docs/apply',
  AZ: 'https://healthearizonaplus.gov/Login/Default',
  AR: 'https://www.access.arkansas.gov',
  CA: 'https://www.coveredca.com/apply/',
  CO: 'https://peak.colorado.gov',
  CT: 'https://www.accesshealthct.com/',
  DC: 'https://dc.gov/service/apply-medicaid',
  DE: 'https://assist.dhss.delaware.gov/apsLogin.action',
  FL: 'https://www.myflorida.com/accessflorida/',
  GA: 'https://gateway.ga.gov',
  HI: 'https://mybenefits.hawaii.gov',
  ID: 'https://enroll.yourhealthidaho.org',
  IL: 'https://abe.illinois.gov/abe/access/',
  IN: 'https://www.in.gov/fssa/onlinebenfits/index.html',
  IA: 'https://www.ia.gov/services/health/',
  KS: 'https://www.kancare.ks.gov',
  KY: 'https://benefind.ky.gov',
  LA: 'https://ldh.la.gov/Medicaid',
  ME: 'https://www.maine.gov/dhhs/ofi/programs-services/mainecare',
  MD: 'https://www.marylandhealthconnection.gov',
  MA: 'https://www.mahealthconnector.org',
  MI: 'https://mibridges.michigan.gov',
  MN: 'https://mn.gov/dhs/people-we-serve/adults/health-care/health-care-programs/',
  MS: 'https://medicaid.ms.gov',
  MO: 'https://mydss.mo.gov',
  MT: 'https://compass.dphhs.mt.gov/COMPASS/Account/LogIn',
  NE: 'https://www.ne.gov/nebraska_medicaid_main_page',
  NV: 'https://www.nevadahealthlink.com',
  NH: 'https://nhhealthprotection.nh.gov',
  NJ: 'https://www.nj.gov/humanservices/dmahs/home/',
  NM: 'https://www.bewellnm.com',
  NY: 'https://nystateofhealth.ny.gov',
  NC: 'https://medicaid.ncdhhs.gov',
  ND: 'https://www.hhs.nd.gov/healthcare/medicaid',
  OH: 'https://ohio.gov/services/apply-for-medicaid',
  OK: 'https://www.mysoonercare.org',
  OR: 'https://www.oregon.gov/oha/hsd/ohp/pages/apply.aspx',
  PA: 'https://www.compass.state.pa.us',
  RI: 'https://healthyrhode.ri.gov',
  SC: 'https://www.scdhhs.gov',
  SD: 'https://dss.sd.gov/formsandpubs/docs/AME/MedApplyOnline.aspx',
  TN: 'https://www.tn.gov/tenncare/members-applicants/apply-for-tenncare.html',
  TX: 'https://yourtexasbenefits.com',
  UT: 'https://medicaid.utah.gov/apply-for-medicaid/',
  VT: 'https://dcf.vermont.gov/benefits/medicaid',
  VA: 'https://www.coverva.org',
  WA: 'https://www.wahealthplanfinder.org',
  WV: 'https://dhhr.wv.gov/bms/Pages/default.aspx',
  WI: 'https://www.dhs.wisconsin.gov/badgercareplus/apply.htm',
  WY: 'https://health.wyo.gov/healthcarefin/medicaid/',
}

/**
 * State-based ACA marketplace portals.
 * States not listed use the federal Healthcare.gov.
 */
const STATE_ACA_URLS: Record<string, string> = {
  CA: 'https://www.coveredca.com/apply/',
  CO: 'https://connectforhealthco.com/get-started/',
  CT: 'https://www.accesshealthct.com/',
  DC: 'https://dchealthlink.com/',
  ID: 'https://enroll.yourhealthidaho.org',
  KY: 'https://kynect.ky.gov/',
  MA: 'https://www.mahealthconnector.org/',
  MD: 'https://www.marylandhealthconnection.gov/',
  MN: 'https://www.mnsure.org/index.jsp',
  NJ: 'https://www.getcovered.nj.gov/',
  NM: 'https://www.bewellnm.com/',
  NY: 'https://nystateofhealth.ny.gov/',
  PA: 'https://pennie.com/',
  RI: 'https://healthyrhode.ri.gov/',
  VT: 'https://vermontHealthConnect.gov/',
  WA: 'https://www.wahealthplanfinder.org/',
}

const getMedicaidUrl = (state: string) =>
  STATE_MEDICAID_URLS[state] ?? 'https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/'
const getAcaUrl = (state: string) =>
  STATE_ACA_URLS[state] ?? 'https://www.healthcare.gov/apply-and-enroll/start-enrollment/'

/** All US states + DC for selector */
const STATES: { abbr: string; name: string }[] = [
  { abbr: 'AL', name: 'Alabama' },       { abbr: 'AK', name: 'Alaska' },
  { abbr: 'AZ', name: 'Arizona' },       { abbr: 'AR', name: 'Arkansas' },
  { abbr: 'CA', name: 'California' },    { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' },   { abbr: 'DC', name: 'Washington D.C.' },
  { abbr: 'DE', name: 'Delaware' },      { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' },       { abbr: 'HI', name: 'Hawaii' },
  { abbr: 'ID', name: 'Idaho' },         { abbr: 'IL', name: 'Illinois' },
  { abbr: 'IN', name: 'Indiana' },       { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' },        { abbr: 'KY', name: 'Kentucky' },
  { abbr: 'LA', name: 'Louisiana' },     { abbr: 'ME', name: 'Maine' },
  { abbr: 'MD', name: 'Maryland' },      { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' },      { abbr: 'MN', name: 'Minnesota' },
  { abbr: 'MS', name: 'Mississippi' },   { abbr: 'MO', name: 'Missouri' },
  { abbr: 'MT', name: 'Montana' },       { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' },        { abbr: 'NH', name: 'New Hampshire' },
  { abbr: 'NJ', name: 'New Jersey' },    { abbr: 'NM', name: 'New Mexico' },
  { abbr: 'NY', name: 'New York' },      { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' },  { abbr: 'OH', name: 'Ohio' },
  { abbr: 'OK', name: 'Oklahoma' },      { abbr: 'OR', name: 'Oregon' },
  { abbr: 'PA', name: 'Pennsylvania' },  { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' },{ abbr: 'SD', name: 'South Dakota' },
  { abbr: 'TN', name: 'Tennessee' },     { abbr: 'TX', name: 'Texas' },
  { abbr: 'UT', name: 'Utah' },          { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' },      { abbr: 'WA', name: 'Washington' },
  { abbr: 'WV', name: 'West Virginia' }, { abbr: 'WI', name: 'Wisconsin' },
  { abbr: 'WY', name: 'Wyoming' },
]

/* ════════════════════════════════════════════════════════════
   WIZARD STEP DEFINITIONS
   ════════════════════════════════════════════════════════════ */

interface WizardAnswers {
  state: string          // 2-letter abbr
  householdSize: number  // 1–8
  annualIncome: number   // raw dollar value
  employment: string     // 'employed' | 'self-employed' | 'unemployed' | 'retired' | 'student'
  hasChildren: boolean
  hasPregnancy: boolean
  careNeeds: string[]    // multi-select
  currentCoverage: string // 'none' | 'cobra' | 'medicaid' | 'employer-unaffordable' | 'other'
}

const EMPLOYMENT_OPTIONS = [
  { value: 'employed',        label: 'Employed (W-2)',        icon: <Briefcase size={16} variant="Linear" /> },
  { value: 'self-employed',   label: 'Self-employed / 1099',  icon: <Activity size={16} variant="Linear" /> },
  { value: 'unemployed',      label: 'Unemployed',            icon: <InfoCircle size={16} variant="Linear" /> },
  { value: 'retired',         label: 'Retired',               icon: <Heart size={16} variant="Linear" /> },
  { value: 'student',         label: 'Student',               icon: <MagicStar size={16} variant="Linear" /> },
]

const CARE_NEED_OPTIONS = [
  { value: 'primary',     label: 'Primary care / check-ups'  },
  { value: 'rx',          label: 'Prescription medications'  },
  { value: 'dental',      label: 'Dental care'               },
  { value: 'vision',      label: 'Vision / eye care'         },
  { value: 'mental',      label: 'Mental health / therapy'   },
  { value: 'specialist',  label: 'Specialist referrals'      },
  { value: 'ob',          label: 'OB/GYN / prenatal'         },
  { value: 'pediatric',   label: 'Pediatric / child care'    },
  { value: 'substance',   label: 'Substance use treatment'   },
  { value: 'chronic',     label: 'Chronic disease management'},
]

const COVERAGE_OPTIONS = [
  { value: 'none',                  label: 'No insurance at all'             },
  { value: 'cobra',                 label: 'On COBRA (recently lost job coverage)' },
  { value: 'employer-unaffordable', label: 'Employer plan I can\'t afford'  },
  { value: 'medicaid',              label: 'Already on Medicaid/CHIP'        },
  { value: 'other',                 label: 'Other / not sure'                },
]

/* ════════════════════════════════════════════════════════════
   ELIGIBILITY CALCULATOR  (browser-only, no backend)
   ════════════════════════════════════════════════════════════ */

interface EligibleProgram {
  id:          string
  name:        string
  tag:         string
  color:       string
  icon:        React.ReactNode
  match:       number   // 0–100 confidence
  desc:        string
  savings:     string
  annualValue: number
  url:         string
  highlights:  string[]
  stateNote?:  string
}

function calcEligibility(a: WizardAnswers): EligibleProgram[] {
  const fpl       = FPL_FOR(a.householdSize)
  const fplPct    = a.annualIncome > 0 ? (a.annualIncome / fpl) * 100 : 0
  const expanded  = EXPANSION_STATES.has(a.state)
  const highChip  = HIGH_CHIP_STATES.has(a.state)
  const onMedicaid = a.currentCoverage === 'medicaid'
  const uninsured  = a.currentCoverage === 'none' || a.currentCoverage === 'cobra'

  const programs: EligibleProgram[] = []

  /* ── 1. Medicaid ─────────────────────────────────── */
  if (!onMedicaid) {
    let match = 0
    let stateNote: string | undefined

    if (a.hasPregnancy) {
      // Pregnancy Medicaid: 200–250% FPL in most states
      match = fplPct <= 200 ? 97 : fplPct <= 250 ? 88 : 55
      stateNote = 'Pregnancy Medicaid covers prenatal, delivery, and 60 days postpartum.'
    } else if (a.hasChildren) {
      // Children: Medicaid ≤100% FPL, CHIP 100-200%+ in most states
      if (fplPct <= 100) match = 96
      else if (fplPct <= 138) match = expanded ? 92 : 68
      else if (fplPct <= 200) match = 72
      else if (fplPct <= 300) match = highChip ? 60 : 25
      stateNote = `Children's Medicaid covers doctor visits, dental, vision, prescriptions, and preventive care.`
    } else {
      // Adult Medicaid
      if (expanded) {
        if (fplPct <= 100) match = 97
        else if (fplPct <= 138) match = 90
        else if (fplPct <= 200) match = 35  // possible for specific categories
        else match = 8
        stateNote = `${STATES.find(s => s.abbr === a.state)?.name ?? a.state} expanded Medicaid — adults up to 138% FPL qualify.`
      } else {
        if (fplPct <= 100) match = 55  // may qualify if parent/disabled
        else match = 10
        stateNote = `${STATES.find(s => s.abbr === a.state)?.name ?? a.state} has NOT expanded Medicaid. Adults without children rarely qualify.`
      }
    }
    if (a.employment === 'unemployed') match = Math.min(99, match + 5)

    programs.push({
      id: 'medicaid', name: 'Medicaid', tag: 'Federal / State',
      color: '#60a5fa', icon: <ShieldTick size={16} variant="Linear" />,
      match: Math.round(match),
      desc: 'Full health coverage: doctor visits, hospital stays, prescriptions, preventive care, and more. Covers most or all costs for qualifying individuals.',
      savings: '$0 premium · $0–$3 copays',
      annualValue: 9600,
      url: getMedicaidUrl(a.state),
      highlights: ['No monthly premiums', 'Covers dental & vision (children)', 'Prescription coverage included'],
      stateNote,
    })
  }

  /* ── 2. CHIP (Children's Health Insurance Program) ── */
  if (a.hasChildren && !onMedicaid) {
    const chipPct = highChip ? 300 : 200
    let chipMatch = 0
    if (fplPct <= 100) chipMatch = 60   // may overlap with Medicaid
    else if (fplPct <= chipPct) chipMatch = 92
    else if (fplPct <= chipPct + 50) chipMatch = 60
    else chipMatch = 15

    programs.push({
      id: 'chip', name: 'CHIP', tag: 'Federal / State',
      color: '#a78bfa', icon: <Profile size={16} variant="Linear" />,
      match: Math.round(chipMatch),
      desc: `Children's Health Insurance Program covers kids up to ${highChip ? '300%' : '200%'} FPL in ${STATES.find(s => s.abbr === a.state)?.name ?? a.state}. Includes well-child visits, immunizations, dental, and vision.`,
      savings: 'Low or $0 premiums · $0–$5 copays',
      annualValue: 4800,
      url: getMedicaidUrl(a.state),
      highlights: ['Covers preventive care 100%', 'Dental and vision included', 'No coverage gaps between visits'],
    })
  }

  /* ── 3. ACA Marketplace Subsidy ─────────────────── */
  if (!onMedicaid) {
    let acaMatch = 0
    // Enhanced subsidies (American Rescue Plan extended through 2025)
    if (fplPct < 100 && !expanded) acaMatch = 42  // coverage gap
    else if (fplPct < 100) acaMatch = 8           // Medicaid is better
    else if (fplPct <= 150) acaMatch = 97          // $0 premium plans available
    else if (fplPct <= 200) acaMatch = 93
    else if (fplPct <= 300) acaMatch = 82
    else if (fplPct <= 400) acaMatch = 72
    else if (fplPct <= 600) acaMatch = 52          // enhanced subsidy (ARP)
    else acaMatch = 18

    if (a.currentCoverage === 'employer-unaffordable') acaMatch = Math.min(96, acaMatch + 12)
    if (a.currentCoverage === 'cobra') acaMatch = Math.min(94, acaMatch + 8)

    const monthlyEst = fplPct <= 150 ? '$0' : fplPct <= 250 ? '$0–$50' : fplPct <= 400 ? '$50–$150' : '$150+'

    const hasStateExchange = a.state in STATE_ACA_URLS
    programs.push({
      id: 'aca', name: 'ACA Marketplace Subsidy', tag: 'Federal',
      color: '#60a5fa', icon: <DollarCircle size={16} variant="Linear" />,
      match: Math.round(acaMatch),
      desc: 'Premium tax credits reduce your monthly health insurance cost — potentially to $0. Plans cover doctor visits, prescriptions, hospitalizations, and preventive care.',
      savings: `~${monthlyEst}/month premium`,
      annualValue: fplPct <= 200 ? 5400 : fplPct <= 400 ? 3200 : 1400,
      url: getAcaUrl(a.state),
      highlights: [
        hasStateExchange
          ? `Apply on ${STATES.find(s => s.abbr === a.state)?.name ?? a.state}'s state exchange`
          : 'Apply on Healthcare.gov',
        'Special Enrollment if life event',
        'Bronze to Platinum tier plans',
      ],
      stateNote: hasStateExchange
        ? `${STATES.find(s => s.abbr === a.state)?.name ?? a.state} runs its own health insurance marketplace — apply there for faster processing and state-specific plans.`
        : undefined,
    })
  }

  /* ── 4. HRSA Free Clinic / FQHC ─────────────────── */
  {
    const fqhcMatch = uninsured ? 96 : fplPct <= 200 ? 88 : fplPct <= 400 ? 74 : 60
    programs.push({
      id: 'fqhc', name: 'HRSA Federally Qualified Health Center', tag: 'Federal',
      color: 'var(--accent)', icon: <Hospital size={16} variant="Linear" />,
      match: Math.round(fqhcMatch),
      desc: 'FQHCs are federally funded and legally required to serve everyone regardless of ability to pay. Sliding-scale fees based on income — often $0–$20 per visit.',
      savings: '$0–$20/visit · sliding scale',
      annualValue: 2000,
      url: 'https://findahealthcenter.hrsa.gov',
      highlights: ['Required by law to serve everyone', 'Primary care, dental, mental health', 'Bilingual staff at most centers'],
    })
  }

  /* ── 5. Prescription Assistance (NeedyMeds PAP) ── */
  if (a.careNeeds.includes('rx') || a.careNeeds.includes('chronic')) {
    let rxMatch = fplPct <= 200 ? 88 : fplPct <= 300 ? 72 : 50
    if (uninsured) rxMatch = Math.min(96, rxMatch + 10)
    programs.push({
      id: 'needy', name: 'Patient Assistance Programs (PAP)', tag: 'Rx',
      color: '#f472b6', icon: <Flash size={16} variant="Linear" />,
      match: Math.round(rxMatch),
      desc: 'Pharmaceutical manufacturers provide brand-name medications at no or low cost for uninsured and low-income patients. Over 3,000 drugs covered across 1,800+ programs.',
      savings: 'Avg $200–$450/month in Rx',
      annualValue: 3600,
      url: 'https://www.needymeds.org/pap',
      highlights: ['3,000+ medications covered', 'No insurance required', 'Apply directly with manufacturer'],
    })
  }

  /* ── 6. 340B Drug Pricing ────────────────────────── */
  if (a.careNeeds.includes('rx') || a.careNeeds.includes('chronic')) {
    const b340Match = fplPct <= 200 ? 80 : fplPct <= 300 ? 62 : 38
    programs.push({
      id: '340b', name: '340B Drug Pricing Program', tag: 'Federal',
      color: '#fbbf24', icon: <RefreshCircle size={16} variant="Linear" />,
      match: Math.round(b340Match),
      desc: 'Get prescriptions at 25–50% below retail price at HRSA-participating clinics. Available at most FQHCs and covered entity pharmacies.',
      savings: '25–50% off all medications',
      annualValue: 800,
      url: 'https://www.hrsa.gov/opa/index.html',
      highlights: ['No application needed', 'Available at HRSA clinics', 'Covers brand & generic drugs'],
    })
  }

  /* ── 7. Medicare (age / disability) ─────────────── */
  if (a.employment === 'retired' || a.annualIncome === 0) {
    const medMatch = a.employment === 'retired' ? 85 : 40
    programs.push({
      id: 'medicare', name: 'Medicare', tag: 'Federal',
      color: '#38bdf8', icon: <Heart size={16} variant="Linear" />,
      match: Math.round(medMatch),
      desc: 'Federal health insurance for adults 65+ or those with qualifying disabilities. Part A (hospital) is usually free; Part B covers outpatient care.',
      savings: '$0 Part A · ~$174/month Part B',
      annualValue: 7200,
      url: 'https://www.medicare.gov/basics/get-started-with-medicare',
      highlights: ['65+ or disability eligible', 'Low-Income Subsidy available', 'Medicare Savings Programs for premium help'],
    })
  }

  /* ── 8. SNAP / Food Assistance (bonus) ───────────── */
  if (fplPct <= 130) {
    programs.push({
      id: 'snap', name: 'SNAP (Food Assistance)', tag: 'Federal',
      color: '#86efac', icon: <TrendUp size={16} variant="Linear" />,
      match: Math.round(fplPct <= 100 ? 90 : 75),
      desc: 'Supplemental Nutrition Assistance Program helps low-income individuals and families buy food. Qualifying for SNAP often fast-tracks Medicaid eligibility.',
      savings: `Avg $~${Math.round(200 / a.householdSize * 10) / 10}/month/person`,
      annualValue: Math.round(200 * a.householdSize * 0.7),
      url: 'https://www.fns.usda.gov/snap/recipient/eligibility',
      highlights: ['130% FPL income limit', 'Automatic Medicaid pathway in many states', 'EBT card accepted at most grocery stores'],
    })
  }

  // Sort by match descending, filter out < 15% match
  return programs
    .filter(p => p.match >= 15)
    .sort((a, b) => b.match - a.match)
}

/* ════════════════════════════════════════════════════════════
   REVEAL UTILITY
   ════════════════════════════════════════════════════════════ */
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(24px)',
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</div>
  )
}

/* ════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ════════════════════════════════════════════════════════════ */
function Counter({ target, prefix = '$', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0)
  const { ref, visible } = useReveal(0.2)
  useEffect(() => {
    if (!visible) return
    const dur = 2200; const start = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setVal(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, target])
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

/* ════════════════════════════════════════════════════════════
   MATCH RING
   ════════════════════════════════════════════════════════════ */
function MatchRing({ pct, color }: { pct: number; color: string }) {
  const [displayed, setDisplayed] = useState(0)
  const r = 22; const circ = 2 * Math.PI * r
  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(pct), 300)
    return () => clearTimeout(timer)
  }, [pct])
  return (
    <svg width="60" height="60" style={{ flexShrink: 0 }}>
      <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle
        cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - displayed / 100)}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '30px 30px', transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <text x="30" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>{displayed}%</text>
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════
   INCOME SLIDER
   ════════════════════════════════════════════════════════════ */
const INCOME_BRACKETS = [
  { label: 'Under $10k', value: 8000 },
  { label: '$10k–$20k',  value: 15000 },
  { label: '$20k–$30k',  value: 25000 },
  { label: '$30k–$40k',  value: 35000 },
  { label: '$40k–$55k',  value: 47500 },
  { label: '$55k–$75k',  value: 65000 },
  { label: '$75k–$100k', value: 87500 },
  { label: 'Over $100k', value: 120000 },
]

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */
const TOTAL_STEPS = 6

const STEP_LABELS = [
  'Location',
  'Household',
  'Income',
  'Employment',
  'Coverage & Needs',
  'Your Results',
]

export default function EligibilityPage() {
  const [step, setStep] = useState(0)
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward')
  const [mounted, setMounted] = useState(false)
  const [results, setResults] = useState<EligibleProgram[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [stateSearch, setStateSearch] = useState('')

  const [answers, setAnswers] = useState<WizardAnswers>({
    state: '',
    householdSize: 1,
    annualIncome: 25000,
    employment: '',
    hasChildren: false,
    hasPregnancy: false,
    careNeeds: [],
    currentCoverage: '',
  })

  useEffect(() => { setMounted(true) }, [])

  const fpl = FPL_FOR(answers.householdSize)
  const fplPct = answers.annualIncome > 0 ? Math.round((answers.annualIncome / fpl) * 100) : 0
  const incomeIdx = INCOME_BRACKETS.findIndex(b => b.value === answers.annualIncome)

  const goNext = useCallback(() => {
    if (step === TOTAL_STEPS - 2) {
      // Calculate results before going to final step
      setResults(calcEligibility(answers))
    }
    setAnimDir('forward')
    setStep(s => Math.min(s + 1, TOTAL_STEPS - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step, answers])

  const goBack = useCallback(() => {
    setAnimDir('back')
    setStep(s => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const reset = () => {
    setStep(0)
    setResults([])
    setAnswers({ state: '', householdSize: 1, annualIncome: 25000, employment: '', hasChildren: false, hasPregnancy: false, careNeeds: [], currentCoverage: '' })
  }

  const canProceed = [
    answers.state !== '',
    answers.householdSize >= 1,
    answers.annualIncome >= 0,
    answers.employment !== '',
    answers.currentCoverage !== '',
  ]

  const filteredStates = STATES.filter(s =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
    s.abbr.toLowerCase().includes(stateSearch.toLowerCase())
  )

  if (!mounted) return null

  const totalAnnual = results.reduce((sum, p) => sum + Math.round((p.annualValue * p.match) / 100), 0)

  /* ── step content ────────────────────────────────── */
  const renderStep = () => {
    switch (step) {
      /* ── Step 0: State ─────────────────────────── */
      case 0: return (
        <div>
          <StepHeader
            icon={<Location size={20} variant="Linear" />}
            title="Where do you live?"
            subtitle="Eligibility rules vary significantly by state. We use your state to apply the correct Medicaid thresholds."
          />
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search state…"
              value={stateSearch}
              onChange={e => setStateSearch(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '15px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredStates.map(s => {
              const isExpansion = EXPANSION_STATES.has(s.abbr)
              const selected = answers.state === s.abbr
              return (
                <button
                  key={s.abbr}
                  onClick={() => setAnswers(a => ({ ...a, state: s.abbr }))}
                  style={{
                    padding: '12px 14px', borderRadius: '12px', border: '1px solid',
                    borderColor: selected ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                    background: selected ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.02)',
                    color: selected ? 'var(--accent)' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', gap: '4px',
                  }}>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>{s.abbr}</span>
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>{s.name}</span>
                  {isExpansion && (
                    <span style={{ fontSize: '9px', color: '#60a5fa', background: 'rgba(96,165,250,0.1)', padding: '2px 6px', borderRadius: '100px', width: 'fit-content', marginTop: '2px' }}>
                      Expanded Medicaid
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {answers.state && EXPANSION_STATES.has(answers.state) ? (
            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <TickCircle size={14} style={{ color: '#60a5fa', marginTop: '1px', flexShrink: 0 }} variant="Linear" />
              <span><strong style={{ color: '#60a5fa' }}>{STATES.find(s => s.abbr === answers.state)?.name}</strong> expanded Medicaid — adults up to 138% FPL may qualify for full coverage.</span>
            </div>
          ) : answers.state ? (
            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <InfoCircle size={14} style={{ color: '#fbbf24', marginTop: '1px', flexShrink: 0 }} variant="Linear" />
              <span><strong style={{ color: '#fbbf24' }}>{STATES.find(s => s.abbr === answers.state)?.name}</strong> has not expanded Medicaid. Adult eligibility is more limited, but other programs may help.</span>
            </div>
          ) : null}
        </div>
      )

      /* ── Step 1: Household ─────────────────────── */
      case 1: return (
        <div>
          <StepHeader
            icon={<Profile2User size={20} variant="Linear" />}
            title="Tell us about your household"
            subtitle="Include yourself and anyone you financially support, even if they're not on your tax return."
          />

          {/* Household size */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Household size
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <button key={n} onClick={() => setAnswers(a => ({ ...a, householdSize: n }))}
                  style={{ width: '56px', height: '56px', borderRadius: '14px', border: '1px solid', fontWeight: 700, fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    borderColor: answers.householdSize === n ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                    background: answers.householdSize === n ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.02)',
                    color: answers.householdSize === n ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
                  }}>
                  {n}{n === 8 ? '+' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Children / Pregnancy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Household includes
            </label>
            {[
              { key: 'hasChildren', label: 'Children under 19 in household', icon: <Profile size={20} color="currentColor" variant="TwoTone" /> },
              { key: 'hasPregnancy', label: 'Current or planned pregnancy', icon: <Heart size={20} color="currentColor" variant="TwoTone" /> },
            ].map(opt => (
              <button key={opt.key}
                onClick={() => setAnswers(a => ({ ...a, [opt.key]: !a[opt.key as keyof WizardAnswers] }))}
                style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s',
                  borderColor: answers[opt.key as keyof WizardAnswers] ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                  background: answers[opt.key as keyof WizardAnswers] ? 'rgba(74,144,217,0.08)' : 'rgba(255,255,255,0.02)',
                }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>{opt.icon}</span>
                <span style={{ fontSize: '15px', color: answers[opt.key as keyof WizardAnswers] ? 'var(--accent)' : 'rgba(255,255,255,0.7)', flex: 1 }}>{opt.label}</span>
                <span style={{ width: '20px', height: '20px', borderRadius: '6px', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  borderColor: answers[opt.key as keyof WizardAnswers] ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                  background: answers[opt.key as keyof WizardAnswers] ? 'var(--accent)' : 'transparent',
                }}>
                  {answers[opt.key as keyof WizardAnswers] && <TickCircle size={11} color="#07070F" variant="Linear" />}
                </span>
              </button>
            ))}
          </div>

          {/* FPL preview */}
          <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <InfoCircle size={13} variant="Linear" />
            <span>2024 Federal Poverty Level for household of <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{answers.householdSize}</strong>: <strong style={{ color: 'var(--accent)' }}>${fpl.toLocaleString()}/year</strong></span>
          </div>
        </div>
      )

      /* ── Step 2: Income ────────────────────────── */
      case 2: return (
        <div>
          <StepHeader
            icon={<DollarCircle size={20} variant="Linear" />}
            title="Approximate annual household income"
            subtitle="Include wages, self-employment, Social Security, disability, and other income. Used only for eligibility — never stored."
          />

          {/* Bracket selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {INCOME_BRACKETS.map((b, i) => (
              <button key={b.label} onClick={() => setAnswers(a => ({ ...a, annualIncome: b.value }))}
                style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s',
                  borderColor: answers.annualIncome === b.value ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                  background: answers.annualIncome === b.value ? 'rgba(74,144,217,0.08)' : 'rgba(255,255,255,0.02)',
                }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: answers.annualIncome === b.value ? 'var(--accent)' : 'rgba(255,255,255,0.7)' }}>{b.label}</span>
                {answers.annualIncome === b.value && <TickCircle size={14} style={{ color: 'var(--accent)' }} variant="Linear" />}
              </button>
            ))}
          </div>

          {/* FPL% live preview */}
          <div style={{ padding: '14px 18px', background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.12)', borderRadius: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            <span>Your income is approximately <strong style={{ color: 'var(--accent)' }}>{fplPct}% of the Federal Poverty Level</strong> for a household of {answers.householdSize}.</span>
            {fplPct <= 138 && EXPANSION_STATES.has(answers.state) && (
              <div style={{ marginTop: '8px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}><TickCircle size={12} variant="Linear" aria-hidden="true" /> You may qualify for Medicaid in {STATES.find(s => s.abbr === answers.state)?.name}.</div>
            )}
            {fplPct > 100 && fplPct <= 400 && (
              <div style={{ marginTop: '8px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}><TickCircle size={12} variant="Linear" aria-hidden="true" /> You likely qualify for ACA premium tax credits.</div>
            )}
          </div>
        </div>
      )

      /* ── Step 3: Employment ────────────────────── */
      case 3: return (
        <div>
          <StepHeader
            icon={<Briefcase size={20} variant="Linear" />}
            title="What is your employment status?"
            subtitle="This affects which programs and enrollment periods are available to you."
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {EMPLOYMENT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setAnswers(a => ({ ...a, employment: opt.value }))}
                style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.15s',
                  borderColor: answers.employment === opt.value ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                  background: answers.employment === opt.value ? 'rgba(74,144,217,0.08)' : 'rgba(255,255,255,0.02)',
                }}>
                <span style={{ color: answers.employment === opt.value ? 'var(--accent)' : 'rgba(255,255,255,0.35)', width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{opt.icon}</span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: answers.employment === opt.value ? 'var(--accent)' : 'rgba(255,255,255,0.7)', flex: 1 }}>{opt.label}</span>
                {answers.employment === opt.value && <TickCircle size={15} style={{ color: 'var(--accent)' }} variant="Linear" />}
              </button>
            ))}
          </div>
          {answers.employment === 'unemployed' && (
            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.55)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <InfoCircle size={13} style={{ color: '#60a5fa', marginTop: '1px', flexShrink: 0 }} variant="Linear" />
              <span>Losing job-based coverage triggers a <strong style={{ color: '#60a5fa' }}>60-day Special Enrollment Period</strong> for ACA marketplace plans.</span>
            </div>
          )}
        </div>
      )

      /* ── Step 4: Coverage + Care Needs ─────────── */
      case 4: return (
        <div>
          <StepHeader
            icon={<Activity size={20} variant="Linear" />}
            title="Coverage & care needs"
            subtitle="Tell us your current insurance situation and what care you need most."
          />

          {/* Current coverage */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Current insurance status
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {COVERAGE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setAnswers(a => ({ ...a, currentCoverage: opt.value }))}
                  style={{ padding: '13px 16px', borderRadius: '12px', border: '1px solid', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s',
                    borderColor: answers.currentCoverage === opt.value ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                    background: answers.currentCoverage === opt.value ? 'rgba(74,144,217,0.08)' : 'rgba(255,255,255,0.02)',
                  }}>
                  <span style={{ fontSize: '14px', color: answers.currentCoverage === opt.value ? 'var(--accent)' : 'rgba(255,255,255,0.7)' }}>{opt.label}</span>
                  {answers.currentCoverage === opt.value && <TickCircle size={13} style={{ color: 'var(--accent)' }} variant="Linear" />}
                </button>
              ))}
            </div>
          </div>

          {/* Care needs multi-select */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Care you currently need <span style={{ fontWeight: 400, textTransform: 'none', color: 'rgba(255,255,255,0.3)' }}>(select all that apply)</span>
            </label>
            <div className="elig-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
              {CARE_NEED_OPTIONS.map(opt => {
                const selected = answers.careNeeds.includes(opt.value)
                return (
                  <button key={opt.value}
                    onClick={() => setAnswers(a => ({ ...a, careNeeds: selected ? a.careNeeds.filter(c => c !== opt.value) : [...a.careNeeds, opt.value] }))}
                    style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s',
                      borderColor: selected ? 'rgba(74,144,217,0.4)' : 'rgba(255,255,255,0.08)',
                      background: selected ? 'rgba(74,144,217,0.08)' : 'rgba(255,255,255,0.02)',
                    }}>
                    <span style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      borderColor: selected ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                      background: selected ? 'var(--accent)' : 'transparent',
                    }}>
                      {selected && <TickCircle size={9} color="#07070F" variant="Linear" />}
                    </span>
                    <span style={{ fontSize: '13px', color: selected ? 'var(--accent)' : 'rgba(255,255,255,0.6)' }}>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )

      /* ── Step 5: Results ───────────────────────── */
      case 5: return (
        <div>
          {/* Results header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '100px', fontSize: '11px', color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: '20px' }}>
              <MagicStar size={10} variant="Linear" /> YOUR PERSONALIZED RESULTS
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '12px', color: '#fff' }}>
              {results.length > 0
                ? `You may qualify for ${results.length} program${results.length !== 1 ? 's' : ''}`
                : 'No direct matches found'}
            </h2>
            {results.length > 0 && (
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                Based on your answers, these programs could save you up to&nbsp;
                <strong style={{ color: 'var(--accent)' }}><Counter target={totalAnnual} /></strong> per year in healthcare costs.
              </p>
            )}
          </div>

          {/* Profile summary */}
          <div className="elig-tags-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
            {[
              { label: STATES.find(s => s.abbr === answers.state)?.name ?? answers.state, icon: <Location size={12} color="currentColor" variant="TwoTone" /> },
              { label: `${answers.householdSize === 1 ? 'Just me' : `${answers.householdSize} people`}`, icon: <Profile2User size={12} color="currentColor" variant="TwoTone" /> },
              { label: `${fplPct}% FPL`, icon: <TrendUp size={12} color="currentColor" variant="TwoTone" /> },
              { label: EMPLOYMENT_OPTIONS.find(e => e.value === answers.employment)?.label ?? '', icon: <Briefcase size={12} color="currentColor" variant="TwoTone" /> },
              { label: EXPANSION_STATES.has(answers.state) ? 'Expansion state' : 'Non-expansion state', icon: EXPANSION_STATES.has(answers.state) ? <TickCircle size={12} color="#60a5fa" variant="TwoTone" /> : <Warning2 size={12} color="#fbbf24" variant="TwoTone" /> },
            ].filter(t => t.label).map(tag => (
              <span key={tag.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                {tag.icon} {tag.label}
              </span>
            ))}
          </div>

          {/* Program cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
            {results.map((prog, idx) => (
              <Reveal key={prog.id} delay={idx * 80}>
                <div
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${prog.color}30`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}>

                  {/* Card header */}
                  <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === prog.id ? null : prog.id)}>

                    <MatchRing pct={prog.match} color={prog.color} />

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#eef4f5' }}>{prog.name}</span>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', border: '1px solid', borderColor: `${prog.color}35`, color: prog.color, background: `${prog.color}10`, fontWeight: 600 }}>{prog.tag}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: prog.color, fontWeight: 600 }}>{prog.savings}</div>
                    </div>

                    <ArrowRight2 size={16} style={{ color: 'rgba(255,255,255,0.25)', transform: expanded === prog.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                  </div>

                  {/* Expanded details */}
                  {expanded === prog.id && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '16px 0 14px' }}>
                        {prog.desc}
                      </p>
                      {prog.stateNote && (
                        <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <InfoCircle size={13} style={{ color: prog.color, marginTop: '1px', flexShrink: 0 }} variant="Linear" />
                          {prog.stateNote}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '18px' }}>
                        {prog.highlights.map(h => (
                          <span key={h} style={{ padding: '5px 10px', background: `${prog.color}10`, border: `1px solid ${prog.color}25`, borderRadius: '8px', fontSize: '12px', color: prog.color, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <TickCircle size={9} color={prog.color} variant="Linear" aria-hidden="true" /> {h}
                          </span>
                        ))}
                      </div>
                      <a href={prog.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: prog.color, color: '#07070F', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        Apply / Learn more <ExportSquare size={12} variant="Linear" />
                      </a>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          {results.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', marginBottom: '28px' }}>
              <InfoCircle size={32} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} variant="Linear" />
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>
                Based on your profile, you may not qualify for the programs we track — but free clinic options are still available.
              </p>
              <a href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'var(--accent)', color: '#07070F', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', marginTop: '12px' }}>
                Find free clinics near you <ArrowRight size={12} />
              </a>
            </div>
          )}

          {/* HRSA always-available */}
          {!results.some(r => r.id === 'fqhc') && (
            <Reveal>
              <div style={{ padding: '20px 24px', background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.15)', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <Hospital size={20} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} variant="Linear" />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#eef4f5', marginBottom: '4px' }}>Free clinics are always available</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '12px' }}>FQHCs serve everyone regardless of income or insurance status — required by federal law.</div>
                  <a href="https://findahealthcenter.hrsa.gov" target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Find a clinic near you <ExportSquare size={11} />
                  </a>
                </div>
              </div>
            </Reveal>
          )}

          {/* Start over */}
          <div style={{ textAlign: 'center', paddingTop: '12px' }}>
            <button onClick={reset} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)' }}>
              <RefreshCircle size={13} /> Start over
            </button>
          </div>
        </div>
      )

      default: return null
    }
  }

  return (
    <AppShell>
      <style>{`
        @media (max-width: 768px) {
          .elig-progress-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .elig-step-content { padding: 20px !important; }
          .elig-tags-row { flex-wrap: wrap !important; }
        }
        @media (max-width: 480px) {
          .elig-step-content { padding: 16px !important; }
          .elig-options-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* 5.9 — Structured Data */}
      <JsonLd schema={ELIGIBILITY_FAQ_SCHEMA} id="schema-faq-eligibility" />
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home',        url: 'https://nexus.health' },
          { name: 'Eligibility', url: 'https://nexus.health/eligibility' },
        ])}
        id="schema-breadcrumb-eligibility"
      />
      <div style={{ minHeight: '100vh', background: '#07070F', paddingTop: '100px' }}>

        {/* ── PAGE HERO ───────────────────────────── */}
        <section style={{ padding: '60px 24px 48px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '100px', fontSize: '11px', color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: '24px' }}>
              <ShieldTick size={10} variant="Linear" /> ELIGIBILITY WIZARD
            </span>
            <h1 style={{ fontSize: 'clamp(34px, 6vw, 60px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px', color: '#fff' }}>
              Find out what<br />
              <span style={{ color: 'var(--accent)' }}>you qualify for</span>
            </h1>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto 28px' }}>
              Answer 5 short questions. We calculate your eligibility for Medicaid, CHIP, ACA subsidies, and more — in your browser, never stored.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TickCircle size={13} style={{ color: '#60a5fa' }} variant="Linear" /> No personal info required
              </span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TickCircle size={13} style={{ color: '#60a5fa' }} variant="Linear" /> Never stored or shared
              </span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TickCircle size={13} style={{ color: '#60a5fa' }} variant="Linear" /> State-specific thresholds
              </span>
            </div>
          </div>
        </section>

        {/* ── WIZARD ─────────────────────────────── */}
        <section style={{ padding: '48px 24px 80px' }}>
          <div style={{ maxWidth: '660px', margin: '0 auto' }}>

            {/* Progress bar */}
            <div className="elig-progress-header" style={{ marginBottom: '40px' }}>
              {/* Step dots */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '16px' }}>
                {STEP_LABELS.map((label, i) => (
                  <React.Fragment key={label}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                        borderColor: i < step ? 'var(--accent)' : i === step ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
                        background: i < step ? 'var(--accent)' : i === step ? 'rgba(74,144,217,0.15)' : 'transparent',
                      }}>
                        {i < step
                          ? <TickCircle size={12} color="#07070F" variant="Linear" />
                          : <span style={{ fontSize: '11px', fontWeight: 700, color: i === step ? 'var(--accent)' : 'rgba(255,255,255,0.25)' }}>{i + 1}</span>
                        }
                      </div>
                      <span style={{ fontSize: '9px', color: i === step ? 'var(--accent)' : 'rgba(255,255,255,0.25)', fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>
                        {label}
                      </span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div style={{ flex: 1, height: '1px', background: i < step ? 'var(--accent)' : 'rgba(255,255,255,0.08)', transition: 'background 0.4s', marginBottom: '22px' }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step card */}
            <div className="elig-step-content" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: 'clamp(24px, 5vw, 40px)' }}>
              <div key={`step-${step}`} style={{
                opacity: 1,
                animation: `stepIn 0.35s cubic-bezier(0.16,1,0.3,1)`,
              }}>
                <style>{`
                  @keyframes stepIn {
                    from { opacity: 0; transform: translateX(${animDir === 'forward' ? '20px' : '-20px'}); }
                    to   { opacity: 1; transform: translateX(0); }
                  }
                `}</style>
                {renderStep()}
              </div>

              {/* Nav buttons */}
              {step < TOTAL_STEPS - 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button onClick={goBack} disabled={step === 0}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: step === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.45)', fontSize: '14px', fontWeight: 600, cursor: step === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    <ArrowLeft2 size={14} /> Back
                  </button>

                  <button onClick={goNext} disabled={!canProceed[step]}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 24px', background: canProceed[step] ? 'var(--accent)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', color: canProceed[step] ? '#07070F' : 'rgba(255,255,255,0.2)', fontSize: '14px', fontWeight: 700, cursor: canProceed[step] ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    {step === TOTAL_STEPS - 2 ? 'See my results' : 'Continue'}
                    <ArrowRight2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── EXPLAINER SECTION ─────────────────── */}
        {step === 0 && (
          <section style={{ padding: '0 24px 80px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ maxWidth: '960px', margin: '0 auto', paddingTop: '64px' }}>
              <Reveal>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '36px' }}>
                  Programs we check
                </h2>
              </Reveal>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {[
                  { name: 'Medicaid',               color: '#60a5fa', desc: 'Full coverage for low-income adults and families. Federal + state.',   icon: <ShieldTick size={16} variant="Linear" /> },
                  { name: 'CHIP',                   color: '#a78bfa', desc: "Children's coverage up to 200–300% FPL depending on your state.",       icon: <Profile size={16} variant="Linear" /> },
                  { name: 'ACA Marketplace',        color: '#60a5fa', desc: 'Tax credits that reduce or eliminate monthly premiums for marketplace plans.', icon: <DollarCircle size={16} variant="Linear" /> },
                  { name: 'FQHC / Free Clinics',    color: 'var(--accent)', desc: 'Federally-funded health centers that serve everyone regardless of income.', icon: <Hospital size={16} variant="Linear" /> },
                  { name: 'Patient Assist. (PAP)',   color: '#f472b6', desc: 'Free or discounted brand-name medications from pharmaceutical manufacturers.', icon: <Flash size={16} variant="Linear" /> },
                  { name: '340B Drug Pricing',       color: '#fbbf24', desc: '25–50% off prescriptions at HRSA-participating clinics.', icon: <RefreshCircle size={16} variant="Linear" /> },
                  { name: 'Medicare',                color: '#38bdf8', desc: 'Coverage for adults 65+ and qualifying disability recipients.', icon: <Heart size={16} variant="Linear" /> },
                  { name: 'SNAP Food Assistance',    color: '#86efac', desc: 'Food benefits that often open a fast track to Medicaid enrollment.',  icon: <TrendUp size={16} variant="Linear" /> },
                ].map((prog, i) => (
                  <Reveal key={prog.name} delay={i * 50}>
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ color: prog.color }}>{prog.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#eef4f5' }}>{prog.name}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, margin: 0 }}>{prog.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Privacy note */}
              <Reveal delay={100}>
                <div style={{ marginTop: '40px', padding: '20px 24px', background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.12)', borderRadius: '14px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <ShieldTick size={18} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} variant="Linear" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#eef4f5', marginBottom: '4px' }}>100% private — calculated in your browser</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                      Your answers never leave your device. No account required. No data stored. NEXUS uses your state and income range to apply the correct eligibility thresholds, all calculated locally using 2024 federal guidelines.
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        )}

      </div>
    </AppShell>
  )
}

/* ── Step Header ────────────────────────────────── */
function StepHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>{title}</h2>
      </div>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: 0 }}>{subtitle}</p>
    </div>
  )
}
