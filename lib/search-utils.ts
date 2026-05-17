/**
 * NEXUS — Search utility functions
 *
 * Pure, side-effect-free helpers used by the search page and its unit tests.
 * Extracted from app/search/page.tsx so they can be imported by Vitest without
 * pulling in the full React/Next.js component tree.
 *
 * Exports:
 *   detectIntent(q)   — semantic intent detection from a free-text query
 *   isOpenNow(hours)  — checks whether a clinic's hours string covers right now
 *   parseHour(h, mins, ampm) — converts h/mins/ampm parts to a decimal hour value
 */

/* ── Intent detection return type ──────────────────────────────────── */
export interface SearchIntent {
  specialty?:    string
  freeOnly?:     boolean
  openNow?:      boolean
  language?:     string
  accessibility?: boolean
}

/* ── Module-level memoisation cache ────────────────────────────────── */
const _intentCache = new Map<string, SearchIntent>()

/**
 * Semantic intent detection — no AI, pure pattern matching.
 *
 * Returns an object with flags/values derived from the query string.
 * Results are memoised; cache is cleared when it exceeds 200 entries.
 */
export function detectIntent(q: string): SearchIntent {
  if (_intentCache.has(q)) return _intentCache.get(q)!

  const t      = q.toLowerCase()
  const intent: SearchIntent = {}

  if (/\bfree\b/.test(t))                                                       intent.freeOnly      = true
  if (/open\s*now|open\s*today|tonight|right now/.test(t))                      intent.openNow       = true
  if (/spanish|español|habla/.test(t))                                          intent.language      = 'Spanish'
  if (/wheelchair|accessible|disability|ada/.test(t))                           intent.accessibility = true
  if (/mental\s*health|therapist|counselor|psych|anxiety|depress/.test(t))      intent.specialty     = 'mental'
  if (/dental|dentist|tooth|teeth/.test(t))                                     intent.specialty     = 'dental'
  if (/pediatric|child|kids|infant|baby/.test(t))                               intent.specialty     = 'pediatrics'
  if (/vision|eye|optom/.test(t))                                               intent.specialty     = 'vision'
  if (/\bwomen\b|obgyn|ob-gyn|gynec|prenatal|pregnancy/.test(t))               intent.specialty     = 'womens'
  if (/primary\s*care|doctor|physician|pcp|family\s*med/.test(t))              intent.specialty     = 'primary'

  /* Cap cache to prevent unbounded growth */
  if (_intentCache.size > 200) _intentCache.clear()
  _intentCache.set(q, intent)
  return intent
}

/* ── Hour parser ────────────────────────────────────────────────────── */
/**
 * Converts hour/minutes/ampm tokens into a decimal hour value (0–24).
 *
 * @param h    - Integer hour (1–12 for 12-hour, 0–23 for 24-hour)
 * @param mins - Minute string (e.g. "30"), or undefined
 * @param ampm - "am" | "pm" | undefined
 */
export function parseHour(
  h:     number,
  mins:  string | undefined,
  ampm:  string | undefined,
): number {
  let hour = h
  if (ampm === 'pm' && hour !== 12) hour += 12
  if (ampm === 'am' && hour === 12) hour  = 0
  return hour + (mins ? parseInt(mins, 10) / 60 : 0)
}

/* ── Open-now parser ────────────────────────────────────────────────── */
/**
 * Checks whether a clinic's hours string covers the current time.
 *
 * Returns:
 *   true   — clinic is open right now
 *   false  — clinic is closed right now
 *   null   — hours string is absent or unparseable
 */
export function isOpenNow(hours?: string): boolean | null {
  if (!hours) return null

  const now      = new Date()
  const dayIdx   = now.getDay()           // 0 = Sun … 6 = Sat
  const hourNow  = now.getHours() + now.getMinutes() / 60
  const days     = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const today    = days[dayIdx]
  const lower    = hours.toLowerCase()

  /* Primary: look for today's abbreviation next to a time range */
  const dayMatch = new RegExp(
    `${today}[^0-9]*?(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?\\s*[-–]\\s*(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?`,
  )
  const m = lower.match(dayMatch)

  if (!m) {
    /* Fallback: Mon-Fri / M-F style patterns for weekdays */
    const mf = lower.match(
      /(?:mon|m)[\w\s-]*?(?:fri|f)[^0-9]*(\d{1,2})\s*(?:am|pm)?\s*[-–]\s*(\d{1,2})\s*(am|pm)?/,
    )
    if (!mf && dayIdx >= 1 && dayIdx <= 5) {
      const generic = lower.match(
        /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/,
      )
      if (generic) {
        const open  = parseHour(parseInt(generic[1], 10), generic[2], generic[3])
        const close = parseHour(parseInt(generic[4], 10), generic[5], generic[6])
        return hourNow >= open && hourNow < close
      }
    }
    return null
  }

  const open  = parseHour(parseInt(m[1], 10), m[2], m[3])
  const close = parseHour(parseInt(m[4], 10), m[5], m[6])
  return hourNow >= open && hourNow < close
}

/* ═══════════════════════════════════════════════════════════════
   N6 — Equity Score
   Computes a 1–5 equity score for a clinic based on observable
   attributes. Score dimensions:
     • Language access  (0–2) — non-English languages offered
     • Sliding scale    (0–1) — income-based fee adjustment
     • Free care        (0–1) — $0-visit option available
     • FQHC/type        (0–1) — federally-qualified = comprehensive equity
   Max: 5
   ═══════════════════════════════════════════════════════════════ */

export interface EquityScore {
  score: number          // 1–5 (clamped; minimum 1 for any listed clinic)
  breakdown: {
    languageAccess: number   // 0–2
    slidingScale: number     // 0–1
    freeCare: number         // 0–1
    fqhcStatus: number       // 0–1
  }
  label: string           // human-readable tier
  color: string           // CSS colour for the indicator
}

interface EquityClinicInput {
  free?: boolean
  sliding_scale?: boolean
  type?: string
  languages?: string[]
  services?: string[]
}

export function computeEquityScore(clinic: EquityClinicInput): EquityScore {
  const langs = clinic.languages ?? []
  const svc   = clinic.services ?? []

  /* Language access: look in both languages[] and services[] */
  const NON_EN = ['spanish', 'español', 'french', 'chinese', 'mandarin', 'cantonese',
    'arabic', 'vietnamese', 'korean', 'portuguese', 'russian', 'haitian', 'tagalog',
    'somali', 'amharic', 'farsi', 'hindi', 'urdu', 'polish', 'sign language']
  const langHits = NON_EN.filter(l =>
    langs.some(la => la.toLowerCase().includes(l)) ||
    svc.some(s => s.toLowerCase().includes(l))
  ).length

  const languageAccess = Math.min(langHits >= 2 ? 2 : langHits, 2)
  const slidingScale   = (clinic.sliding_scale === true) ? 1 : 0
  const freeCare       = (clinic.free === true) ? 1 : 0
  const isFQHC         = clinic.type === 'FQHC' || (clinic.type ?? '').toLowerCase().includes('fqhc')
  const fqhcStatus     = isFQHC ? 1 : 0

  const raw   = languageAccess + slidingScale + freeCare + fqhcStatus
  const score = Math.max(1, Math.min(5, Math.round(raw + 1)))   // shift: every listed clinic starts at ≥1

  const label = score >= 5 ? 'Excellent'
    : score >= 4 ? 'High'
    : score >= 3 ? 'Good'
    : score >= 2 ? 'Fair'
    : 'Basic'

  const color = score >= 5 ? '#34d399'
    : score >= 4 ? '#60a5fa'
    : score >= 3 ? '#fbbf24'
    : score >= 2 ? '#f97316'
    : 'rgba(255,255,255,0.35)'

  return { score, breakdown: { languageAccess, slidingScale, freeCare, fqhcStatus }, label, color }
}
