'use client'
import React, { useState } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { use } from 'react'
import { TickCircle, ArrowRight2, ArrowLeft2, DocumentText, ExportSquare, InfoCircle } from 'iconsax-react'

type EnrollStep = {
  title: string
  body: string
  docs?: string[]
  link?: { label: string; url: string }
  tip?: string
}

type ProgramGuide = {
  name: string
  valueLabel: string
  accentColor: string
  summary: string
  steps: EnrollStep[]
  source: string
}

const GUIDES: Record<string, ProgramGuide> = {
  medicaid: {
    name: 'Medicaid',
    valueLabel: '$0/month',
    accentColor: '#34D399',
    summary: 'Medicaid provides free or low-cost health coverage. Most states use an online portal for enrollment.',
    steps: [
      {
        title: 'Check your state\'s eligibility rules',
        body: 'Medicaid rules vary by state. Visit Benefits.gov or your state Medicaid agency to confirm you qualify based on income, household size, and state expansion status.',
        link: { label: 'Benefits.gov — Medicaid checker', url: 'https://www.benefits.gov/benefit/1640' },
        tip: '40 states + DC have expanded Medicaid under the ACA. If your state expanded, income limit is ≤138% FPL.',
      },
      {
        title: 'Gather your documents',
        body: 'Before you apply, collect the items below. Having them ready speeds up the process significantly.',
        docs: [
          'Government-issued photo ID (driver\'s license, passport, or state ID)',
          'Social Security number (for everyone in your household applying)',
          'Proof of income (pay stubs, tax return, or employer letter)',
          'Proof of address (utility bill, lease, or mail)',
          'Immigration documents (if applicable)',
          'Current health insurance information (if any)',
        ],
      },
      {
        title: 'Apply online, in person, or by phone',
        body: 'You can apply through Healthcare.gov, your state Medicaid portal, or by calling 1-800-318-2596. Applying online is fastest — most applications take 15–20 minutes.',
        link: { label: 'Apply on Healthcare.gov', url: 'https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/' },
        tip: 'You can apply anytime — Medicaid has no open enrollment period.',
      },
      {
        title: 'Wait for your eligibility determination',
        body: 'States must process applications within 45 days (or 90 days for disability-based Medicaid). You\'ll receive a letter by mail or email with your decision.',
        tip: 'If approved, your coverage may be backdated up to 3 months before your application date.',
      },
      {
        title: 'Select a Managed Care plan (if required)',
        body: 'Many states use managed care organizations (MCOs) for Medicaid. You\'ll be asked to choose a plan. If you don\'t choose, the state will assign one automatically.',
        tip: 'Ask if your current doctors are in-network before selecting a plan.',
      },
    ],
    source: 'Medicaid.gov · CMS · Updated 2025',
  },
  chip: {
    name: 'CHIP',
    valueLabel: '$0–$35/month',
    accentColor: '#60A5FA',
    summary: 'Children\'s Health Insurance Program covers children and, in some states, pregnant women who earn too much for Medicaid.',
    steps: [
      {
        title: 'Confirm your child qualifies',
        body: 'CHIP covers children under 19 whose families earn too much for Medicaid but can\'t afford private insurance. Most states cover families up to 200–300% FPL.',
        link: { label: 'Check CHIP eligibility', url: 'https://www.healthcare.gov/medicaid-chip/childrens-health-insurance-program/' },
        tip: 'Pregnant women may qualify in states with CHIP Unborn coverage — check your state.',
      },
      {
        title: 'Gather required documents',
        body: 'Prepare documents for your child and yourself (as the applying parent/guardian).',
        docs: [
          'Child\'s birth certificate',
          'Social Security numbers (child and parent/guardian)',
          'Proof of household income (last 3 pay stubs or tax return)',
          'Proof of state residency (utility bill or lease)',
          'Current insurance information (if any)',
        ],
      },
      {
        title: 'Apply through Healthcare.gov or your state agency',
        body: 'CHIP applications are processed by the same state Medicaid agency. You can apply online via Healthcare.gov or directly through your state\'s portal.',
        link: { label: 'Apply now — Healthcare.gov', url: 'https://www.healthcare.gov/apply-and-enroll/start-enrollment/' },
        tip: 'If you apply at any time of year, your child may be covered within days of approval.',
      },
      {
        title: 'Enroll your child in a CHIP health plan',
        body: 'Once approved, you\'ll choose a health plan for your child. CHIP covers doctor visits, hospital care, dental, vision, and prescriptions.',
        tip: 'Dental and vision are often included in CHIP — check your state\'s specific covered services.',
      },
    ],
    source: 'InsureKidsNow.gov · HRSA · Updated 2025',
  },
  aca: {
    name: 'ACA Marketplace',
    valueLabel: 'Up to $600/month saved',
    accentColor: '#4F8EF0',
    summary: 'The ACA Marketplace offers subsidized health plans with premium tax credits based on your income. Many people pay $0/month.',
    steps: [
      {
        title: 'Confirm your open enrollment window',
        body: 'Open Enrollment runs November 1 – January 15 each year. Outside this window, you need a Special Enrollment Period (job loss, marriage, new baby, etc.).',
        link: { label: 'Healthcare.gov — Check dates', url: 'https://www.healthcare.gov/quick-guide/dates-and-deadlines/' },
        tip: 'Losing job-based coverage gives you a 60-day Special Enrollment Period — act fast.',
      },
      {
        title: 'Create a Healthcare.gov account',
        body: 'You\'ll need an account to compare plans and apply for a subsidy (Premium Tax Credit). The process takes about 10 minutes.',
        link: { label: 'Create account — Healthcare.gov', url: 'https://www.healthcare.gov/create-account' },
        docs: [
          'Social Security numbers for all household members',
          'Employer and income information for everyone applying',
          'Immigration documents (if applicable)',
          'Policy information for any current coverage',
        ],
      },
      {
        title: 'Fill out a Marketplace application',
        body: 'The application calculates your subsidy automatically based on your household size and projected income. You\'ll see the monthly premium after the subsidy.',
        tip: 'Estimate your income conservatively — you can update it later to avoid repayment.',
      },
      {
        title: 'Compare and enroll in a plan',
        body: 'Plans are sorted by tier: Bronze (low premium, high deductible), Silver, Gold, Platinum. Silver plans have the best cost-sharing reductions if your income is under 250% FPL.',
        tip: 'If your income is under 250% FPL, choose a Silver plan — you qualify for extra cost-sharing reductions only on Silver.',
      },
      {
        title: 'Pay your first premium to activate coverage',
        body: 'Your coverage doesn\'t start until you make your first payment. Pay by the due date shown in your enrollment confirmation.',
        tip: 'Coverage typically starts the 1st of the following month after you enroll and pay.',
      },
    ],
    source: 'Healthcare.gov · CMS · Updated 2025',
  },
  hrsa: {
    name: 'HRSA Health Centers',
    valueLabel: '$0–$40/visit',
    accentColor: '#A78BFA',
    summary: 'HRSA Federally Qualified Health Centers (FQHCs) are required by federal law to serve everyone regardless of ability to pay, on a sliding fee scale.',
    steps: [
      {
        title: 'Find an FQHC near you',
        body: 'There are 12,000+ HRSA-funded health center locations across the US. Use the official locator to find one near your ZIP code.',
        link: { label: 'HRSA Health Center Finder', url: 'https://findahealthcenter.hrsa.gov' },
        tip: 'FQHCs serve all patients — no referral, no insurance, no documentation required to be seen.',
      },
      {
        title: 'Call ahead to schedule or walk in',
        body: 'Most FQHCs accept walk-in patients. Calling ahead is recommended for non-urgent visits. Tell them you\'re uninsured — they\'ll guide you through the sliding scale process.',
        tip: 'Say exactly: "I don\'t have insurance and I\'d like to apply for the sliding fee scale."',
      },
      {
        title: 'Complete a sliding fee scale application',
        body: 'At the clinic, you\'ll fill out a short income verification form. Based on your household income and size, they\'ll set your cost per visit — which can be $0.',
        docs: [
          'Proof of income (pay stub, tax return, or self-declaration form)',
          'Proof of household size (birth certificates, school records, or self-declaration)',
          'No income? Most FQHCs have a $0 minimum fee — just explain your situation.',
        ],
        tip: 'If you have no documentation, most FQHCs accept a signed self-declaration.',
      },
      {
        title: 'Establish care and return regularly',
        body: 'FQHCs provide comprehensive care: primary, dental, behavioral health, and prescriptions. Once enrolled, you can access all services at your reduced rate.',
        tip: 'Ask about the 340B drug pricing program — prescriptions are often deeply discounted at HRSA clinics.',
      },
    ],
    source: 'HRSA.gov · Federal Register · Updated 2025',
  },
  '340b': {
    name: '340B Drug Savings',
    valueLabel: 'Up to 85% off medications',
    accentColor: '#818CF8',
    summary: 'The 340B program requires drug manufacturers to sell medications at deeply discounted prices to HRSA-covered clinics. No separate enrollment needed.',
    steps: [
      {
        title: 'Receive care at a 340B-covered facility',
        body: 'To access 340B pricing, you must be a patient of a 340B-covered health center. Most FQHCs, Ryan White clinics, and federally qualified facilities participate.',
        link: { label: 'HRSA 340B covered entities', url: 'https://340bopais.hrsa.gov/coveredentities' },
        tip: 'You automatically qualify for 340B pricing if you\'re a patient at a participating clinic — no separate application.',
      },
      {
        title: 'Get your prescription written at the 340B clinic',
        body: 'Ask your provider at the 340B clinic to write your prescription. The prescription must be associated with your care at that facility.',
        tip: 'If you see a specialist outside the 340B clinic, ask if they can send the prescription to your FQHC.',
      },
      {
        title: 'Fill at a 340B in-house or contract pharmacy',
        body: 'Your clinic may have an on-site pharmacy or a contract with a retail pharmacy. Ask the clinic staff which pharmacies participate in their 340B program.',
        tip: 'Common contract pharmacies include CVS, Walgreens, and many independent pharmacies. Pricing varies.',
      },
    ],
    source: 'HRSA.gov · 340B OPAIS · Updated 2025',
  },
  ryan_white: {
    name: 'Ryan White HIV/AIDS Program',
    valueLabel: 'Free HIV care',
    accentColor: '#F472B6',
    summary: 'Comprehensive HIV/AIDS care and treatment for low-income uninsured and underinsured patients.',
    steps: [
      {
        title: 'Contact your local Ryan White clinic',
        body: 'Ryan White services are delivered through local health departments and FQHCs. Use the HRSA locator to find HIV care near you.',
        link: { label: 'Find Ryan White services', url: 'https://ryanwhite.hrsa.gov/get-help/find-care' },
        tip: 'Ryan White serves anyone living with HIV regardless of immigration status.',
      },
      {
        title: 'Complete eligibility screening',
        body: 'Staff will screen you for income, HIV status, and insurance. Income limits vary by program part (Part A, B, C, or D).',
        docs: [
          'Proof of HIV diagnosis (lab results or physician letter)',
          'Proof of income or self-declaration',
          'Proof of address (or confirm homeless status)',
        ],
      },
      {
        title: 'Enroll and access comprehensive care',
        body: 'Services include medical care, medications (ADAP), dental, mental health, substance use treatment, and case management — all at no or low cost.',
        tip: 'ADAP (AIDS Drug Assistance Program) provides free HIV medications — apply separately if needed.',
      },
    ],
    source: 'HRSA Ryan White Program · Updated 2025',
  },
}

const GENERIC_GUIDE: ProgramGuide = {
  name: 'Program Enrollment',
  valueLabel: 'Varies',
  accentColor: '#4F8EF0',
  summary: 'Follow the steps below to enroll in this program.',
  steps: [
    {
      title: 'Review eligibility requirements',
      body: 'Visit the program\'s official website to confirm you meet income, residency, and other requirements.',
    },
    {
      title: 'Gather required documentation',
      body: 'Most programs require proof of identity, income, and state residency.',
      docs: ['Government-issued photo ID', 'Proof of income', 'Proof of address', 'Social Security number'],
    },
    {
      title: 'Submit your application',
      body: 'Apply online, in person, or by phone. Keep a copy of your application confirmation.',
      tip: 'Follow up 2 weeks after applying if you haven\'t heard back.',
    },
  ],
  source: 'NEXUS · Verified 2025',
}

export default function EnrollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const guide = GUIDES[id] ?? GENERIC_GUIDE
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i); else next.add(i)
      return next
    })
  }

  const current = guide.steps[step]
  const pct = Math.round((completed.size / guide.steps.length) * 100)

  return (
    <AppShell>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(60px,8vw,100px) 24px 96px' }}>

        {/* Back */}
        <Link href="/programs" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: 'var(--text-4)', textDecoration: 'none',
          marginBottom: 28,
        }}>
          <ArrowLeft2 size={12} color="currentColor" variant="Linear" /> Back to programs
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 10px', borderRadius: 100,
            background: `${guide.accentColor}12`, border: `1px solid ${guide.accentColor}28`,
            fontSize: 11, fontWeight: 600, color: guide.accentColor, letterSpacing: '0.07em',
            textTransform: 'uppercase', marginBottom: 14,
          }}>
            Enrollment Guide
          </div>
          <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.1 }}>
            Enroll in {guide.name}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.65, maxWidth: 560, marginBottom: 16 }}>
            {guide.summary}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, maxWidth: 200, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`, borderRadius: 2,
                background: guide.accentColor,
                transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{completed.size} of {guide.steps.length} steps done</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>

          {/* Step sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {guide.steps.map((s, i) => (
              <button key={i} onClick={() => setStep(i)} style={{
                width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10,
                background: step === i ? `${guide.accentColor}12` : 'transparent',
                border: `1px solid ${step === i ? `${guide.accentColor}30` : 'transparent'}`,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'flex-start', gap: 8, transition: 'all 0.15s',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  background: completed.has(i) ? `${guide.accentColor}20` : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${completed.has(i) ? guide.accentColor : 'rgba(255,255,255,0.14)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {completed.has(i) && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3.25 5.75L6.5 2" stroke={guide.accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: step === i ? 600 : 400, lineHeight: 1.4,
                  color: step === i ? 'var(--text)' : completed.has(i) ? 'var(--text-4)' : 'var(--text-3)',
                }}>
                  Step {i + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Step content */}
          <div style={{
            borderRadius: 18, padding: '28px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: guide.accentColor, marginBottom: 8,
              }}>
                Step {step + 1} of {guide.steps.length}
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
                {current.title}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7, margin: 0 }}>
                {current.body}
              </p>
            </div>

            {current.docs && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DocumentText size={13} color="currentColor" /> Documents needed
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {current.docs.map((doc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: guide.accentColor, flexShrink: 0, marginTop: 7 }} />
                      <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {current.tip && (
              <div style={{
                padding: '12px 14px', borderRadius: 10, marginBottom: 20,
                background: `${guide.accentColor}08`, border: `1px solid ${guide.accentColor}1A`,
                display: 'flex', gap: 10,
              }}>
                <InfoCircle size={14} color={guide.accentColor} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{current.tip}</span>
              </div>
            )}

            {current.link && (
              <a
                href={current.link.url}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 9, marginBottom: 24,
                  background: `${guide.accentColor}10`, border: `1px solid ${guide.accentColor}28`,
                  color: guide.accentColor, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                <ExportSquare size={13} color="currentColor" />
                {current.link.label}
              </a>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
              <button
                onClick={() => toggle(step)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '10px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: completed.has(step) ? `${guide.accentColor}15` : 'rgba(255,255,255,0.05)',
                  color: completed.has(step) ? guide.accentColor : 'var(--text-3)',
                  fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s',
                }}
              >
                <TickCircle size={14} color="currentColor" variant={completed.has(step) ? 'Bold' : 'Linear'} />
                {completed.has(step) ? 'Marked done' : 'Mark as done'}
              </button>
              {step < guide.steps.length - 1 && (
                <button
                  onClick={() => { toggle(step); setStep(step + 1) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '10px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: guide.accentColor, color: '#fff',
                    fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                  }}
                >
                  Next step <ArrowRight2 size={13} color="currentColor" />
                </button>
              )}
              {step === guide.steps.length - 1 && completed.size === guide.steps.length && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 9,
                  background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
                  color: '#34d399', fontSize: 13, fontWeight: 600,
                }}>
                  <TickCircle size={14} color="currentColor" variant="Bold" />
                  All steps complete!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Source */}
        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-4)' }}>
          <InfoCircle size={14} color="currentColor" />
          Source: {guide.source}
        </div>
      </div>
    </AppShell>
  )
}
