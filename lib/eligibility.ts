/**
 * Client-side eligibility rule engine.
 *
 * All logic is deterministic and stateless — no API calls, no DB reads.
 * Runs in the browser (dashboard) and during onboarding completion.
 *
 * FPL source: 2025 Federal Poverty Guidelines (HHS, Jan 2025)
 * https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type IncomeBracket =
  | 'under_20k'
  | '20k_40k'
  | '40k_60k'
  | '60k_plus'
  | 'prefer_not_to_say'

export type ConfidenceLevel = 'likely' | 'possible' | 'check'

export interface EligibilityInput {
  incomeBracket: IncomeBracket | null
  householdSize: number
  careNeeds: string[]
  situation: string | null
}

export interface ProgramResult {
  id: string
  name: string
  confidence: ConfidenceLevel
  valueLabel: string
  description: string
  href: string
  accentColor: string
  badgeLabel: string
  /* % FPL used to compute this result — surfaced for transparency */
  fplPercent: number | null
}

// ─── Federal Poverty Level (contiguous US, 2025) ─────────────────────────────

const FPL_2025: Record<number, number> = {
  1: 15060,
  2: 20440,
  3: 25820,
  4: 31200,
  5: 36580,
  6: 41960,
  7: 47340,
  8: 52720,
}
const FPL_PER_ADDITIONAL = 5380

function getFpl(size: number): number {
  const clamped = Math.max(1, size)
  if (clamped <= 8) return FPL_2025[clamped]
  return FPL_2025[8] + (clamped - 8) * FPL_PER_ADDITIONAL
}

// Conservative mid-point estimates for each bracket
const INCOME_MIDPOINTS: Record<IncomeBracket, number | null> = {
  under_20k:        12000,
  '20k_40k':        30000,
  '40k_60k':        50000,
  '60k_plus':       75000,
  prefer_not_to_say: null,
}

export function fplPercent(bracket: IncomeBracket, householdSize: number): number | null {
  const mid = INCOME_MIDPOINTS[bracket]
  if (mid === null) return null
  return Math.round((mid / getFpl(Math.max(1, householdSize))) * 100)
}

// ─── Confidence color helpers (for UI consumers) ─────────────────────────────

export const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  likely:   '#34D399',
  possible: '#F59E0B',
  check:    '#4F8EF0',
}

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  likely:   'Likely',
  possible: 'Possible',
  check:    'Check eligibility',
}

// ─── Rule engine ─────────────────────────────────────────────────────────────

export function computeEligibility(input: EligibilityInput): ProgramResult[] {
  const {
    incomeBracket,
    householdSize = 1,
    careNeeds = [],
    situation,
  } = input

  const hhSize = Math.max(1, householdSize)
  const fpl    = incomeBracket ? fplPercent(incomeBracket, hhSize) : null
  const results: ProgramResult[] = []

  // ── 1. Medicaid ──────────────────────────────────────────────────────────
  // Expansion states: ≤ 138% FPL  |  Non-expansion: may still qualify
  if (fpl !== null) {
    if (fpl <= 138) {
      results.push({
        id: 'medicaid',
        name: 'Medicaid',
        confidence: 'likely',
        valueLabel: '$0/month',
        description:
          'Full health coverage at no cost. Covers visits, hospital, dental, and prescriptions.',
        href: '/programs?filter=medicaid',
        accentColor: '#34D399',
        badgeLabel: 'Full coverage',
        fplPercent: fpl,
      })
    } else if (fpl <= 200) {
      results.push({
        id: 'medicaid',
        name: 'Medicaid',
        confidence: 'possible',
        valueLabel: '$0–$50/month',
        description:
          "You may qualify depending on your state's expansion rules and any household specifics.",
        href: '/programs?filter=medicaid',
        accentColor: '#34D399',
        badgeLabel: 'State-dependent',
        fplPercent: fpl,
      })
    }
  }

  // ── 2. CHIP — children's coverage ────────────────────────────────────────
  // Proxy: household size ≥ 2 suggests presence of a child or partner
  if (hhSize >= 2 && (fpl === null || fpl <= 200)) {
    results.push({
      id: 'chip',
      name: 'CHIP',
      confidence: fpl !== null && fpl <= 150 ? 'likely' : 'possible',
      valueLabel: '$0–$35/month',
      description:
        'Low-cost or free coverage for children in your household, in every US state.',
      href: '/programs?filter=chip',
      accentColor: '#60A5FA',
      badgeLabel: "Children's coverage",
      fplPercent: fpl,
    })
  }

  // ── 3. ACA Marketplace Subsidies ─────────────────────────────────────────
  // 100–400% FPL and not Medicaid-eligible; 2021 ARP removed upper cap
  if (fpl !== null && fpl >= 100 && fpl > 138) {
    const saving =
      fpl <= 200 ? '$200–$600/month saved' :
      fpl <= 300 ? '$75–$250/month saved' : '$30–$100/month saved'
    results.push({
      id: 'aca',
      name: 'ACA Marketplace',
      confidence: fpl <= 300 ? 'likely' : 'possible',
      valueLabel: saving,
      description:
        'Subsidized health insurance. Monthly premiums capped at a percentage of your income.',
      href: '/programs?filter=aca',
      accentColor: '#4F8EF0',
      badgeLabel: 'Premium subsidy',
      fplPercent: fpl,
    })
  }

  // ── 4. HRSA Health Centers ────────────────────────────────────────────────
  // Available to everyone; federally required to provide sliding-scale care
  results.push({
    id: 'hrsa',
    name: 'HRSA Health Centers',
    confidence: 'likely',
    valueLabel: '$0–$40/visit',
    description:
      '12,000+ federally funded clinics. Required by federal law to see every patient.',
    href: '/search',
    accentColor: '#A78BFA',
    badgeLabel: 'Near you',
    fplPercent: fpl,
  })

  // ── 5. 340B Drug Savings ─────────────────────────────────────────────────
  // Available at 340B-covered clinics for anyone who receives care there
  if (careNeeds.includes('prescriptions') || (fpl !== null && fpl <= 300) || fpl === null) {
    results.push({
      id: '340b',
      name: '340B Drug Savings',
      confidence: 'likely',
      valueLabel: 'Up to 85% off',
      description:
        'Deep prescription discounts at HRSA-covered clinics. No separate enrollment required.',
      href: '/medications',
      accentColor: '#F59E0B',
      badgeLabel: 'Rx savings',
      fplPercent: fpl,
    })
  }

  // ── 6. SAMHSA Mental Health ───────────────────────────────────────────────
  if (careNeeds.includes('mental') && (fpl === null || fpl <= 300)) {
    results.push({
      id: 'samhsa',
      name: 'SAMHSA Programs',
      confidence: fpl !== null && fpl <= 200 ? 'likely' : 'possible',
      valueLabel: 'Free – $20/session',
      description:
        'Federally funded mental health and substance use treatment — income-based cost.',
      href: '/programs?filter=mental-health',
      accentColor: '#F472B6',
      badgeLabel: 'Mental health',
      fplPercent: fpl,
    })
  }

  // ── 7. Pregnancy Medicaid ─────────────────────────────────────────────────
  // All 50 states cover prenatal care; income threshold varies but is generally generous
  if (careNeeds.includes('pregnancy') && (fpl === null || fpl <= 300)) {
    results.push({
      id: 'pregnancy_medicaid',
      name: 'Pregnancy Medicaid',
      confidence: 'likely',
      valueLabel: '$0/month',
      description:
        "Prenatal care and delivery covered in all states — even if you don't qualify for standard Medicaid.",
      href: '/programs?filter=pregnancy',
      accentColor: '#EC4899',
      badgeLabel: 'Maternal care',
      fplPercent: fpl,
    })
  }

  // ── 8. Dental safety net ─────────────────────────────────────────────────
  if (careNeeds.includes('dental') && (fpl === null || fpl <= 250)) {
    results.push({
      id: 'dental_safety_net',
      name: 'Dental Safety Net',
      confidence: fpl !== null && fpl <= 150 ? 'likely' : 'possible',
      valueLabel: '$0–$50/visit',
      description:
        'Dental schools and safety-net clinics provide free or deeply discounted care.',
      href: '/search?specialty=dental',
      accentColor: '#06B6D4',
      badgeLabel: 'Dental',
      fplPercent: fpl,
    })
  }

  return results.slice(0, 5)
}
