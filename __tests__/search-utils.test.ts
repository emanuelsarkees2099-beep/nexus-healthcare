/**
 * C8 — Unit tests: lib/search-utils.ts
 *
 * Covers:
 *   detectIntent  — semantic intent parsing (freeOnly, openNow, language,
 *                   accessibility, specialty variants)
 *   parseHour     — am/pm/24h decimal hour conversion
 *   isOpenNow     — clinic hours string vs current time
 *
 * isOpenNow tests use vi.setSystemTime() to control "now" deterministically
 * so the suite passes regardless of when it's run.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { detectIntent, parseHour, isOpenNow } from '@/lib/search-utils'

/* ================================================================== */
describe('detectIntent', () => {

  describe('freeOnly flag', () => {
    it('sets freeOnly=true for "free clinic"', () => {
      expect(detectIntent('free clinic near me').freeOnly).toBe(true)
    })

    it('does NOT set freeOnly for "freedom" (non-word boundary)', () => {
      // "freedom" contains "free" but not as a whole word
      expect(detectIntent('freedom health').freeOnly).toBeUndefined()
    })

    it('sets freeOnly=true for all-caps "FREE"', () => {
      expect(detectIntent('FREE dental care').freeOnly).toBe(true)
    })
  })

  describe('openNow flag', () => {
    it('sets openNow=true for "open now"', () => {
      expect(detectIntent('open now clinic').openNow).toBe(true)
    })

    it('sets openNow=true for "open today"', () => {
      expect(detectIntent('open today').openNow).toBe(true)
    })

    it('sets openNow=true for "open tonight"', () => {
      expect(detectIntent('tonight emergency').openNow).toBe(true)
    })

    it('sets openNow=true for "right now"', () => {
      expect(detectIntent('doctor right now').openNow).toBe(true)
    })

    it('does not set openNow for "open next week"', () => {
      expect(detectIntent('open next week appointment').openNow).toBeUndefined()
    })
  })

  describe('language detection', () => {
    it('detects Spanish from "spanish"', () => {
      expect(detectIntent('spanish speaking doctor').language).toBe('Spanish')
    })

    it('detects Spanish from "español"', () => {
      expect(detectIntent('clínica español').language).toBe('Spanish')
    })

    it('detects Spanish from "habla"', () => {
      expect(detectIntent('habla español').language).toBe('Spanish')
    })

    it('does not set language for English queries', () => {
      expect(detectIntent('primary care doctor').language).toBeUndefined()
    })
  })

  describe('accessibility flag', () => {
    it('sets accessibility=true for "wheelchair"', () => {
      expect(detectIntent('wheelchair accessible clinic').accessibility).toBe(true)
    })

    it('sets accessibility=true for "accessible"', () => {
      expect(detectIntent('accessible health center').accessibility).toBe(true)
    })

    it('sets accessibility=true for "disability"', () => {
      expect(detectIntent('disability services').accessibility).toBe(true)
    })

    it('sets accessibility=true for "ada"', () => {
      expect(detectIntent('ada compliant clinic').accessibility).toBe(true)
    })
  })

  describe('specialty detection', () => {
    it('detects mental health specialty', () => {
      expect(detectIntent('mental health therapist').specialty).toBe('mental')
    })

    it('detects mental health from "anxiety"', () => {
      expect(detectIntent('anxiety counselor').specialty).toBe('mental')
    })

    it('detects dental specialty', () => {
      expect(detectIntent('free dental care').specialty).toBe('dental')
    })

    it('detects dental from "tooth"', () => {
      expect(detectIntent('tooth pain clinic').specialty).toBe('dental')
    })

    it('detects pediatrics specialty', () => {
      expect(detectIntent('pediatric clinic').specialty).toBe('pediatrics')
    })

    it('detects pediatrics from "kids"', () => {
      // Use a query with no overlap with primary-care keywords ('doctor' also matches primary)
      expect(detectIntent('kids clinic near me').specialty).toBe('pediatrics')
    })

    it('detects vision specialty', () => {
      expect(detectIntent('eye exam free').specialty).toBe('vision')
    })

    it("detects women's health", () => {
      expect(detectIntent("women's health clinic").specialty).toBe('womens')
    })

    it("detects women's health from 'obgyn'", () => {
      expect(detectIntent('obgyn near me').specialty).toBe('womens')
    })

    it('detects primary care specialty', () => {
      expect(detectIntent('primary care physician').specialty).toBe('primary')
    })

    it('detects primary care from "pcp"', () => {
      expect(detectIntent('need a pcp').specialty).toBe('primary')
    })

    it('returns empty object for generic query', () => {
      const result = detectIntent('health center')
      expect(result.specialty).toBeUndefined()
      expect(result.freeOnly).toBeUndefined()
      expect(result.openNow).toBeUndefined()
    })
  })

  describe('memoization', () => {
    it('returns the same object reference for repeated identical queries', () => {
      const q = 'free mental health clinic open now'
      const r1 = detectIntent(q)
      const r2 = detectIntent(q)
      expect(r1).toBe(r2) // same reference — memoized
    })

    it('returns different objects for different queries', () => {
      const r1 = detectIntent('free dental')
      const r2 = detectIntent('vision clinic')
      expect(r1).not.toBe(r2)
      expect(r1.specialty).toBe('dental')
      expect(r2.specialty).toBe('vision')
    })
  })

  describe('combined flags', () => {
    it('detects multiple flags in one query', () => {
      const r = detectIntent('free dental open now wheelchair accessible spanish')
      expect(r.freeOnly).toBe(true)
      expect(r.specialty).toBe('dental')
      expect(r.openNow).toBe(true)
      expect(r.accessibility).toBe(true)
      expect(r.language).toBe('Spanish')
    })
  })
})

/* ================================================================== */
describe('parseHour', () => {
  it('returns integer hour for round hours (no am/pm)', () => {
    expect(parseHour(9, undefined, undefined)).toBe(9)
  })

  it('adds 12 for pm hours (except 12pm)', () => {
    expect(parseHour(5, undefined, 'pm')).toBe(17)
  })

  it('does not add 12 for 12pm', () => {
    expect(parseHour(12, undefined, 'pm')).toBe(12)
  })

  it('converts 12am to 0', () => {
    expect(parseHour(12, undefined, 'am')).toBe(0)
  })

  it('adds minute fraction correctly', () => {
    expect(parseHour(9, '30', undefined)).toBeCloseTo(9.5)
  })

  it('handles 8:45am correctly', () => {
    expect(parseHour(8, '45', 'am')).toBeCloseTo(8.75)
  })

  it('handles 5:00pm correctly', () => {
    expect(parseHour(5, '00', 'pm')).toBe(17)
  })

  it('handles 12:30pm correctly', () => {
    expect(parseHour(12, '30', 'pm')).toBeCloseTo(12.5)
  })

  it('handles 12:30am correctly', () => {
    expect(parseHour(12, '30', 'am')).toBeCloseTo(0.5)
  })
})

/* ================================================================== */
describe('isOpenNow', () => {
  // Freeze time at Wednesday 10:00 AM (dayIdx=3, hourNow=10)
  // new Date('2024-01-03T10:00:00') — Wednesday
  const WEDNESDAY_10AM = new Date('2024-01-03T10:00:00')
  const WEDNESDAY_8PM  = new Date('2024-01-03T20:00:00')
  const SUNDAY_10AM    = new Date('2024-01-07T10:00:00')

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns null for undefined hours', () => {
    vi.setSystemTime(WEDNESDAY_10AM)
    expect(isOpenNow(undefined)).toBeNull()
  })

  it('returns null for empty string hours', () => {
    vi.setSystemTime(WEDNESDAY_10AM)
    expect(isOpenNow('')).toBeNull()
  })

  it('returns true when current time is within today\'s range', () => {
    vi.setSystemTime(WEDNESDAY_10AM)
    // Wed 9am-5pm — we are at 10am
    expect(isOpenNow('Mon 9am-5pm, Tue 9am-5pm, Wed 9am-5pm, Thu 9am-5pm, Fri 9am-5pm')).toBe(true)
  })

  it('returns false when current time is outside today\'s range', () => {
    vi.setSystemTime(WEDNESDAY_8PM)
    // Wed closes at 5pm — we are at 8pm
    expect(isOpenNow('Wed 9am-5pm')).toBe(false)
  })

  it('returns true for a 24-hour string covering current time (generic fallback, weekday)', () => {
    vi.setSystemTime(WEDNESDAY_10AM)
    // Generic "8am-6pm" with no day prefix — weekday fallback applies
    expect(isOpenNow('8am-6pm')).toBe(true)
  })

  it('returns false for generic string where current time is outside range (weekday)', () => {
    vi.setSystemTime(WEDNESDAY_8PM)
    expect(isOpenNow('8am-5pm')).toBe(false)
  })

  it('returns null for unparseable hours string', () => {
    vi.setSystemTime(WEDNESDAY_10AM)
    expect(isOpenNow('By appointment only')).toBeNull()
  })

  it('returns null on Sunday when only Mon-Fri pattern found', () => {
    vi.setSystemTime(SUNDAY_10AM)
    // The Mon-Fri fallback should not apply on Sunday
    expect(isOpenNow('8am-5pm')).toBeNull()
  })

  it('handles 24-hour format strings (no am/pm)', () => {
    vi.setSystemTime(WEDNESDAY_10AM)
    // "Wed 8-18" means 8am to 6pm
    expect(isOpenNow('wed 8-18')).toBe(true)
  })

  it('handles time range with dash-separated am/pm format', () => {
    vi.setSystemTime(WEDNESDAY_10AM)
    expect(isOpenNow('wed 9am – 5pm')).toBe(true)
  })
})
