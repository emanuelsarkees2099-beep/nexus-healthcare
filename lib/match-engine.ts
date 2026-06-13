/**
 * NEXUS Match Engine — Phase 2.1
 *
 * Pure, deterministic scoring function. No API calls.
 * Weights: distance 40% · needs 25% · language 20% · wait-time proxy 15%
 *
 * The breakdown is intentionally visible in the UI so users can see *why*
 * a clinic ranked highly — important for healthcare trust.
 */

import type { Clinic } from '@/components/search/ClinicCard'
import { computeEquityScore } from '@/lib/search-utils'

// ─── Input / output types ─────────────────────────────────────────────────────

export interface MatchInput {
  needs: string[]     // specialty keys: 'primary' | 'mental' | 'dental' | 'vision' | 'womens' | 'pediatrics'
  language: string    // '' | 'english' | 'spanish' | 'chinese' | 'arabic' | 'tagalog' | 'other'
  insurance: string   // '' | 'none' | 'medicaid' | 'chip' | 'aca' | 'private'
}

export interface MatchScore {
  total: number            // 0–100
  breakdown: {
    distance: number       // 0–40
    needs: number          // 0–25
    language: number       // 0–20
    waitTime: number       // 0–15
  }
  tier: 'excellent' | 'good' | 'fair' | 'low'
  label: string
  color: string
}

// ─── Internal pattern maps ────────────────────────────────────────────────────

const NEED_PATTERNS: Record<string, RegExp> = {
  primary:    /primary|family|general|internal\s*med|health\s*(center|clinic)/i,
  mental:     /mental|psych|behav|counsel|therapy|substance|addiction/i,
  dental:     /dental|dentist|orthodont/i,
  womens:     /women|maternal|ob.?gyn|gynec|reproductive|midwife/i,
  pediatrics: /pediatric|children|child|infant/i,
  vision:     /vision|eye\s*care|optic|optom|ophth/i,
}

const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  spanish: /spanish|español|hispano/i,
  chinese: /chinese|mandarin|cantonese/i,
  arabic:  /arabic|arab/i,
  tagalog: /tagalog|filipino/i,
  other:   /interpret|multilingual|translation/i,
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export function computeMatchScore(clinic: Clinic, input: MatchInput): MatchScore {
  // ── Distance (40 pts) ───────────────────────────────────────────────────────
  const dist = parseFloat(String(clinic.distance)) || 99
  const distScore =
    dist <= 1  ? 40 :
    dist <= 2  ? 35 :
    dist <= 5  ? 28 :
    dist <= 10 ? 20 :
    dist <= 25 ? 12 : 5

  // ── Needs match (25 pts) ────────────────────────────────────────────────────
  let needsScore: number
  if (input.needs.length === 0) {
    needsScore = 12  // no preference → partial credit
  } else {
    const text = (clinic.services ?? []).join(' ') + ' ' + clinic.name
    const matched = input.needs.filter(n => NEED_PATTERNS[n]?.test(text))
    needsScore = Math.min(25, Math.round((matched.length / input.needs.length) * 25))
    // FQHCs are general-purpose — give them baseline credit for any need
    if (needsScore === 0 && clinic.type === 'FQHC') needsScore = 8
  }

  // ── Language (20 pts) ───────────────────────────────────────────────────────
  let langScore: number
  if (!input.language || input.language === 'english') {
    langScore = 14  // most clinics support English — give baseline credit
  } else {
    const rx = LANGUAGE_PATTERNS[input.language.toLowerCase()]
    const text = (clinic.services ?? []).join(' ')
      + ' ' + clinic.name
      + ' ' + (clinic.languages ?? []).join(' ')
    if (rx && rx.test(text)) {
      langScore = 20
    } else if (/interpret|multilingual|translation/i.test(text)) {
      langScore = 10  // interpreter available but specific language unconfirmed
    } else {
      langScore = 0
    }
  }

  // ── Wait-time proxy via equity score (15 pts) ───────────────────────────────
  // Higher equity score → more access-oriented → proxy for shorter effective wait
  const { score: equityScore } = computeEquityScore(clinic)
  const waitScore =
    equityScore >= 5 ? 15 :
    equityScore >= 4 ? 12 :
    equityScore >= 3 ? 8  :
    equityScore >= 2 ? 5  : 2

  // ── Insurance alignment bonus (up to +5) ───────────────────────────────────
  // Uninsured users should be steered toward free/sliding-scale clinics
  let insuranceBonus = 0
  if (input.insurance === 'none' || !input.insurance) {
    if (clinic.free || clinic.sliding_scale) insuranceBonus = 5
  } else if (input.insurance === 'medicaid' || input.insurance === 'chip') {
    if (clinic.type === 'FQHC') insuranceBonus = 5  // FQHCs always accept Medicaid
  }

  const total = Math.min(100, distScore + needsScore + langScore + waitScore + insuranceBonus)

  const tier: MatchScore['tier'] =
    total >= 80 ? 'excellent' :
    total >= 60 ? 'good' :
    total >= 40 ? 'fair' : 'low'

  const TIER_META: Record<MatchScore['tier'], { label: string; color: string }> = {
    excellent: { label: 'Excellent match', color: '#34D399' },
    good:      { label: 'Good match',      color: '#60A5FA' },
    fair:      { label: 'Fair match',      color: '#F59E0B' },
    low:       { label: 'Low match',       color: 'rgba(255,255,255,0.3)' },
  }

  return {
    total,
    breakdown: { distance: distScore, needs: needsScore, language: langScore, waitTime: waitScore },
    tier,
    ...TIER_META[tier],
  }
}

// ─── Sort helper ──────────────────────────────────────────────────────────────

export function sortByMatchScore(clinics: Clinic[], input: MatchInput): Array<Clinic & { _matchScore: MatchScore }> {
  return clinics
    .map(c => ({ ...c, _matchScore: computeMatchScore(c, input) }))
    .sort((a, b) => b._matchScore.total - a._matchScore.total)
}
