/**
 * Health Access Score (0-100)
 * Measures a user's healthcare access health — NOT their medical health.
 *
 * Components:
 *   Coverage / program eligibility  40 pts
 *   Primary care relationship        20 pts
 *   Preventive care up-to-date       20 pts
 *   Passport completeness            10 pts
 *   Medication management            10 pts
 */

export interface HealthScoreBreakdown {
  total: number
  coverage: number        // 0-40
  primaryCare: number     // 0-20
  preventive: number      // 0-20
  passport: number        // 0-10
  medications: number     // 0-10
  label: string
  color: string
  tier: 'low' | 'building' | 'good' | 'strong'
}

export interface HealthScoreInput {
  /** User has income_bracket set (knows their eligibility) */
  hasEligibilityData: boolean
  /** Number of eligibility programs found */
  programCount: number
  /** User has a passport with real data */
  passportAllergies: number
  passportMedications: number
  passportConditions: number
  passportHasEmergencyContact: boolean
  /** User has visited / saved a clinic */
  hasSavedClinic: boolean
  /** nexus_calendar_prefs — has generated a screening plan */
  calendarSetUp: boolean
  /** Number of due screenings (from calendar) */
  dueScreeningsCount: number
  /** Number of notification subscriptions (proxy for active clinic engagement) */
  notificationCount: number
  /** User has any tracked medications */
  hasMedications: boolean
}

export function computeHealthScore(input: HealthScoreInput): HealthScoreBreakdown {
  // ── Coverage / program eligibility (0-40) ────────────────────────────────
  let coverage = 0
  if (input.hasEligibilityData) coverage += 20
  if (input.programCount >= 1) coverage += 10
  if (input.programCount >= 3) coverage += 10

  // ── Primary care relationship (0-20) ─────────────────────────────────────
  let primaryCare = 0
  if (input.hasSavedClinic) primaryCare += 12
  if (input.notificationCount > 0) primaryCare += 8

  // ── Preventive care (0-20) ───────────────────────────────────────────────
  let preventive = 0
  if (input.calendarSetUp) {
    preventive += 10
    // Full 20 only if all due screenings are in manageable range (< 4 due)
    if (input.dueScreeningsCount > 0 && input.dueScreeningsCount <= 3) preventive += 10
    else if (input.dueScreeningsCount === 0) preventive += 10
  }

  // ── Passport completeness (0-10) ─────────────────────────────────────────
  let passport = 0
  if (input.passportHasEmergencyContact) passport += 4
  if (input.passportAllergies > 0) passport += 2
  if (input.passportMedications > 0) passport += 2
  if (input.passportConditions > 0) passport += 2

  // ── Medication management (0-10) ─────────────────────────────────────────
  let medications = 0
  if (input.hasMedications) medications += 10

  const total = Math.min(100, coverage + primaryCare + preventive + passport + medications)

  let label: string
  let color: string
  let tier: HealthScoreBreakdown['tier']

  if (total < 25) {
    label = 'Getting started'; color = '#f87171'; tier = 'low'
  } else if (total < 50) {
    label = 'Building up'; color = '#fb923c'; tier = 'building'
  } else if (total < 75) {
    label = 'Good progress'; color = '#fbbf24'; tier = 'good'
  } else {
    label = 'Strong coverage'; color = '#34d399'; tier = 'strong'
  }

  return { total, coverage, primaryCare, preventive, passport, medications, label, color, tier }
}
