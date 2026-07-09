/**
 * Care-type canonicalization for search typeahead.
 *
 * Users type messy queries ("pediatrics near me", "my tooth hurts",
 * "cheap therapist"). We map tokens to the canonical care categories the
 * search engine actually filters on, and suggest those simpler options.
 */

export type CareCategory = {
  label: string
  /** value passed to the search — usually same as label */
  value: string
  keywords: string[]
}

export const CARE_CATEGORIES: CareCategory[] = [
  { label: 'Primary care',    value: 'Primary care',    keywords: ['primary', 'family', 'general', 'checkup', 'check-up', 'doctor', 'physical', 'internal'] },
  { label: 'Dental',          value: 'Dental',          keywords: ['dental', 'dentist', 'tooth', 'teeth', 'toothache', 'cavity', 'gum'] },
  { label: 'Mental health',   value: 'Mental health',   keywords: ['mental', 'therapy', 'therapist', 'counseling', 'counselor', 'depression', 'anxiety', 'psych', 'psychiatry', 'psychologist'] },
  { label: "Women's health",  value: "Women's health",  keywords: ['women', 'womens', 'obgyn', 'ob-gyn', 'gynecology', 'prenatal', 'pregnancy', 'pregnant', 'maternal', 'midwife'] },
  { label: 'Pediatrics',      value: 'Pediatrics',      keywords: ['pediatric', 'pediatrics', 'kids', 'child', 'children', 'baby', 'infant', 'toddler'] },
  { label: 'Vision',          value: 'Vision',          keywords: ['vision', 'eye', 'eyes', 'optometry', 'optometrist', 'glasses', 'ophthalmology'] },
  { label: 'Urgent care',     value: 'Urgent care',     keywords: ['urgent', 'walk-in', 'walkin', 'walk', 'same-day', 'today', 'immediate'] },
  { label: 'Vaccinations',    value: 'Vaccinations',    keywords: ['vaccine', 'vaccines', 'vaccination', 'immunization', 'shots', 'flu'] },
  { label: 'Sexual health',   value: 'Sexual health',   keywords: ['std', 'sti', 'hiv', 'sexual', 'reproductive'] },
  { label: 'Substance use',   value: 'Substance use',   keywords: ['substance', 'addiction', 'rehab', 'recovery', 'detox', 'opioid', 'alcohol'] },
  { label: 'Pharmacy',        value: 'Pharmacy',        keywords: ['pharmacy', 'prescription', 'prescriptions', 'medication', 'medications', 'meds', 'rx', 'insulin'] },
]

/**
 * Suggest canonical care categories for a raw query.
 * Matches whole keywords contained in the query ("pediatrics near me")
 * and prefix-typed tokens ("ped" → Pediatrics). Ranked: exact keyword
 * containment beats prefix matches. Returns at most `limit`.
 */
export function suggestCare(rawQuery: string, limit = 4): CareCategory[] {
  const q = rawQuery.trim().toLowerCase()
  if (q.length < 2) return []

  const tokens = q.split(/[^a-z']+/).filter(t => t.length >= 2)
  const scored: Array<{ cat: CareCategory; score: number }> = []

  for (const cat of CARE_CATEGORIES) {
    let score = 0
    for (const kw of cat.keywords) {
      // Whole keyword present anywhere in the query — strongest signal
      if (q.includes(kw)) { score = Math.max(score, 100 + kw.length); continue }
      // A typed token is a prefix of this keyword ("ped" → "pediatric")
      for (const t of tokens) {
        if (t.length >= 3 && kw.startsWith(t)) score = Math.max(score, 50 + t.length)
      }
    }
    // Category label itself prefix-matches what's typed ("den" → Dental)
    if (cat.label.toLowerCase().startsWith(q)) score = Math.max(score, 90)
    if (score > 0) scored.push({ cat, score })
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.cat)
}
