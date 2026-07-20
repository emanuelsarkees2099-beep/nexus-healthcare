/**
 * C8 — Unit tests: lib/page-metadata.ts
 *
 * Verifies that every entry in PAGE_META:
 *   1. Has a title in the form "<Page Title> — NEXUS"
 *   2. Has a non-empty description
 *   3. Has an openGraph block with correct title/description/images
 *   4. Has a twitter block with card="summary_large_image"
 *   5. Keywords include the base keywords
 *   6. OG images are arrays with at least one entry (width=1200, height=630)
 *
 * Also tests the shape of specific well-known entries to guard against regressions.
 */

import { describe, it, expect } from 'vitest'
import { PAGE_META } from '@/lib/page-metadata'
import type { Metadata } from 'next'

/* ── helpers ──────────────────────────────────────────────────────── */
const BASE_KEYWORDS = ['free healthcare', 'free clinic', 'uninsured', 'no insurance', 'healthcare access']
const SITE_NAME     = 'NEXUS'

function assertMetaShape(key: string, meta: Metadata) {
  const title = meta.title as string

  // Title format
  expect(title, `${key}: title should end with — NEXUS`).toMatch(/— NEXUS$/)
  expect(title.length, `${key}: title should be non-empty`).toBeGreaterThan(7)

  // Description
  expect(typeof meta.description, `${key}: description should be a string`).toBe('string')
  expect((meta.description as string).length, `${key}: description should be non-empty`).toBeGreaterThan(10)

  // Keywords include base set
  const kw = meta.keywords as string[]
  expect(Array.isArray(kw), `${key}: keywords should be an array`).toBe(true)
  for (const baseKw of BASE_KEYWORDS) {
    expect(kw, `${key}: keywords should include "${baseKw}"`).toContain(baseKw)
  }

  // OpenGraph
  const og = meta.openGraph!
  expect(og, `${key}: openGraph should be defined`).toBeDefined()
  expect(og.title, `${key}: og.title`).toBe(title)
  expect(og.description, `${key}: og.description`).toBe(meta.description)
  expect(og.siteName, `${key}: og.siteName`).toBe(SITE_NAME)
  expect(og.type, `${key}: og.type`).toBe('website')

  const images = og.images as Array<{ url: string; width: number; height: number }>
  expect(Array.isArray(images) && images.length > 0, `${key}: og.images should be non-empty array`).toBe(true)
  expect(images[0].width, `${key}: og image width`).toBe(1200)
  expect(images[0].height, `${key}: og image height`).toBe(630)

  // Twitter
  const tw = meta.twitter!
  expect(tw, `${key}: twitter should be defined`).toBeDefined()
  expect(tw.card, `${key}: twitter.card`).toBe('summary_large_image')
  expect(tw.title, `${key}: twitter.title`).toBe(title)
  expect(tw.description, `${key}: twitter.description`).toBe(meta.description)

  // Canonical
  expect(meta.alternates?.canonical, `${key}: canonical should be set`).toBeTruthy()
}

/* ================================================================== */
describe('PAGE_META — all entries have valid shape', () => {
  const entries = Object.entries(PAGE_META) as [string, Metadata][]

  it(`exports ${entries.length} metadata entries`, () => {
    expect(entries.length).toBeGreaterThanOrEqual(20)
  })

  for (const [key, meta] of entries) {
    it(`${key}: has correct metadata shape`, () => {
      assertMetaShape(key, meta)
    })
  }
})

/* ================================================================== */
describe('PAGE_META — specific entry content', () => {
  it('search: title contains "Free Clinics"', () => {
    const title = PAGE_META.search.title as string
    expect(title).toContain('Free Clinics')
  })

  it('search: keywords include FQHC', () => {
    expect(PAGE_META.search.keywords as string[]).toContain('FQHC')
  })

  it('crisis: title contains "Crisis"', () => {
    expect(PAGE_META.crisis.title as string).toContain('Crisis')
  })

  it('crisis: description mentions 988', () => {
    expect(PAGE_META.crisis.description as string).toContain('988')
  })

  it('triage: description mentions "Not a diagnosis"', () => {
    expect(PAGE_META.triage.description as string).toContain('Not a diagnosis')
  })

  it('programs: keywords include Medicaid', () => {
    expect(PAGE_META.programs.keywords as string[]).toContain('Medicaid')
  })

  it('login: title contains "Sign In"', () => {
    expect(PAGE_META.login.title as string).toContain('Sign In')
  })

  it('dashboard: title contains "Dashboard"', () => {
    expect(PAGE_META.dashboard.title as string).toContain('Dashboard')
  })

  it('about: description mentions "30 million"', () => {
    expect(PAGE_META.about.description as string).toContain('30 million')
  })
})

/* ================================================================== */
describe('PAGE_META — OG image URL format', () => {
  it('all entries use https:// or /api/og for their OG image', () => {
    for (const [key, meta] of Object.entries(PAGE_META) as [string, Metadata][]) {
      const images = (meta.openGraph?.images as Array<{ url: string }>) ?? []
      for (const img of images) {
        expect(
          img.url.startsWith('https://') || img.url.startsWith('/api/og') || img.url.startsWith('/'),
          `${key}: OG image URL should start with https:// or /`
        ).toBe(true)
      }
    }
  })
})

/* ================================================================== */
describe('PAGE_META — title uniqueness', () => {
  it('all page titles are unique', () => {
    const titles = Object.values(PAGE_META).map(m => m.title as string)
    const unique  = new Set(titles)
    expect(unique.size).toBe(titles.length)
  })
})

/* ================================================================== */
describe('PAGE_META — descriptions are non-trivial', () => {
  it('all descriptions are at least 50 characters', () => {
    for (const [key, meta] of Object.entries(PAGE_META) as [string, Metadata][]) {
      const desc = meta.description as string
      expect(desc.length, `${key}: description too short`).toBeGreaterThanOrEqual(50)
    }
  })
})
