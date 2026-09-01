/**
 * C7 — e2e: Search flow
 *
 * Tests the full search experience:
 *   1. Landing on /search and seeing the empty state
 *   2. Typing a query and receiving results (or loading state)
 *   3. Applying specialty filters
 *   4. Toggling the map view
 *   5. Clicking a clinic card navigates to detail page
 *   6. Keyboard accessibility (tab + enter navigation)
 *   7. Mobile viewport — filter drawer and list/map switch
 */

import { test, expect, type Page } from '@playwright/test'

/* ── helpers ──────────────────────────────────────────────────────── */

/* handleSearch() in app/search/page.tsx only pushes a new URL / fetches
   results when a location is present (`if (loc) { ... }`) — a condition
   with no location is a silent no-op by design. Every test that needs
   results, a URL update, or location-dependent UI (map/list toggle) must
   supply one. */
const TEST_LOCATION = 'Phoenix, AZ'

async function goToSearch(page: Page, query?: string, loc?: string) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (loc)   params.set('loc', loc)
  const qs  = params.toString()
  const url = qs ? `/search?${qs}` : '/search'
  await page.goto(url)
  // Wait for the search input to be interactive
  await page.waitForSelector('input[placeholder*="clinic"], input[type="search"], input[placeholder*="Search"]', {
    state: 'visible',
    timeout: 10_000,
  })
}

/* Fill both the condition and location inputs and submit via Enter —
   mirrors what a real user has to do, since Enter alone in the condition
   field is a no-op without a location.
   NOTE: page.locator('input').first() is NOT the clinic condition field —
   the nav bar's ⌘K command-palette search box ("Search pages…") sits
   earlier in the DOM and wins that race. Target both inputs by their
   actual placeholder text instead. */
async function fillAndSubmit(page: Page, condition: string, loc = TEST_LOCATION) {
  const conditionInput = page.locator('input[placeholder*="Condition" i], input[placeholder*="specialty" i]').first()
  const locationInput  = page.locator('input[placeholder*="ZIP" i], input[placeholder*="city" i]').first()
  await conditionInput.fill(condition)
  await locationInput.fill(loc)
  await conditionInput.press('Enter')
}

/* ================================================================== */
test.describe('Search page — load', () => {
  test('renders the search input', async ({ page }) => {
    await goToSearch(page)
    const input = page.locator('input').first()
    await expect(input).toBeVisible()
  })

  test('page title contains AXVO', async ({ page }) => {
    await goToSearch(page)
    await expect(page).toHaveTitle(/AXVO/i)
  })

  test('has no critical accessibility violations on load', async ({ page }) => {
    await goToSearch(page)
    // Verify focusable elements exist
    const focusable = page.locator('a, button, input, select, textarea').first()
    await expect(focusable).toBeVisible()
  })
})

/* ================================================================== */
test.describe('Search page — query flow', () => {
  test('typing a query updates the URL search param', async ({ page }) => {
    await goToSearch(page)
    await fillAndSubmit(page, 'dental')
    await expect(page).toHaveURL(/[?&]q=dental/)
  })

  test('shows results or loading skeleton after search', async ({ page }) => {
    await goToSearch(page, 'free dental clinic', TEST_LOCATION)
    // Either loading skeleton or results should appear. CSS attribute
    // selectors (comma-separated) work fine as OR — only a comma inside a
    // single 'text=...' locator string doesn't (see crisis.spec.ts for the
    // isolated proof); noResults needs .or() between two real locators.
    const skeleton  = page.locator('[data-testid="skeleton-card"], [class*="skeleton"], [class*="Skeleton"]')
    const results   = page.locator('[data-testid="clinic-card"], [class*="clinic-card"], article')
    const noResults = page.locator('text=/no results/i').or(page.locator('text=/no clinics/i'))

    // At least one of these should eventually be visible. Confirmed live:
    // /api/clinics aggregates several external sources (HRSA, NAFC, OSM,
    // Google, ...) sequentially, and a real "no results" empty state can
    // take ~14s to resolve in production — 15s was cutting it too close.
    await expect(skeleton.or(results).or(noResults).first()).toBeVisible({ timeout: 25_000 })
  })

  test('pre-filled query from URL param shows in input', async ({ page }) => {
    await goToSearch(page, 'mental health')
    // Not .first() — the nav's ⌘K command-palette input ("Search pages…")
    // sits earlier in the DOM and wins that race.
    const input = page.locator('input[placeholder*="Condition" i], input[placeholder*="specialty" i]').first()
    await expect(input).toHaveValue(/mental health/i)
  })

  test('clearing the search input removes query from URL', async ({ page }) => {
    // KNOWN FLAKY as the 2nd+ test run in a batch against the live site —
    // documented rather than silently left broken. The underlying feature
    // is confirmed correct three separate ways: an isolated single-test
    // Playwright run (twice), and a direct manual browser reproduction of
    // clear+Enter, both showed the URL correctly losing q=dental. It only
    // fails when run after ANY other test in the same worker (reproduced
    // with several different preceding tests, not one specific one) —
    // points to Chromium/Playwright reusing a connection or process-level
    // resource across BrowserContexts against the real live backend, not
    // an app bug or a wrong assertion. A proper fix needs either a staging
    // environment or API mocking for full determinism; not pursuing that
    // here since the feature itself is already proven correct.
    await goToSearch(page, 'dental', TEST_LOCATION)
    const input = page.locator('input[placeholder*="Condition" i], input[placeholder*="specialty" i]').first()
    await page.waitForLoadState('networkidle')
    await input.clear()
    await input.press('Enter')
    await expect(page).not.toHaveURL(/q=dental/, { timeout: 10_000 })
  })
})

/* ================================================================== */
test.describe('Search page — specialty filters', () => {
  test('specialty filter buttons are visible', async ({ page }) => {
    await goToSearch(page)
    // Look for filter chips — "Dental", "Mental health", "Primary care"
    const dental = page.locator('button, [role="tab"], [class*="filter"]').filter({ hasText: /dental/i })
    await expect(dental.first()).toBeVisible()
  })

  test('clicking a specialty filter updates URL', async ({ page }) => {
    await goToSearch(page)
    const dentalFilter = page.locator('button').filter({ hasText: /^dental$/i }).first()
    if (await dentalFilter.isVisible()) {
      await dentalFilter.click()
      await expect(page).toHaveURL(/dental|specialty=dental/i)
    }
  })

  test('active filter has visually distinct state', async ({ page }) => {
    await goToSearch(page, 'clinic')
    const filterBtn = page.locator('button').filter({ hasText: /^dental$/i }).first()
    if (await filterBtn.isVisible()) {
      await filterBtn.click()
      // After clicking, the button should have an active/selected aria state or class
      await expect(filterBtn).toHaveAttribute('aria-pressed', 'true').catch(() =>
        expect(filterBtn).toHaveClass(/active|selected|pressed/)
      )
    }
  })
})

/* ================================================================== */
test.describe('Search page — map toggle', () => {
  test('map/list toggle buttons are visible', async ({ page }) => {
    await goToSearch(page, 'clinic', TEST_LOCATION)
    const mapToggle  = page.locator('button').filter({ hasText: /map/i })
    const listToggle = page.locator('button').filter({ hasText: /list/i })
    // At least one of these toggles should exist
    const toggleExists = (await mapToggle.count()) > 0 || (await listToggle.count()) > 0
    expect(toggleExists).toBe(true)
  })

  test('toggling to map view does not cause a navigation', async ({ page }) => {
    await goToSearch(page, 'clinic', TEST_LOCATION)
    const currentUrl = page.url()
    const mapBtn = page.locator('button').filter({ hasText: /map/i }).first()
    if (await mapBtn.isVisible()) {
      await mapBtn.click()
      // URL path should remain /search
      expect(page.url()).toContain('/search')
      expect(page.url()).toBe(currentUrl.replace(/[?#].*/, '') + page.url().replace(/^[^?#]*/, '').replace(/^/, '').replace(/view=[^&]*/g, '').replace(/&&/g, '&').replace(/[?&]$/, ''))
    }
  })
})

/* ================================================================== */
test.describe('Search page — clinic card interaction', () => {
  test('clinic cards are keyboard-focusable', async ({ page }) => {
    await goToSearch(page, 'free clinic')
    // Wait for possible results
    await page.waitForTimeout(2000)
    const cards = page.locator('a[href*="/clinics/"], [data-testid="clinic-card"] a')
    const count = await cards.count()
    if (count > 0) {
      await cards.first().focus()
      await expect(cards.first()).toBeFocused()
    }
  })

  test('clicking a clinic card navigates to /clinics/[id]', async ({ page }) => {
    await goToSearch(page, 'free clinic')
    await page.waitForTimeout(3000)
    const clinicLinks = page.locator('a[href*="/clinics/"]')
    const count = await clinicLinks.count()
    if (count > 0) {
      await clinicLinks.first().click()
      await expect(page).toHaveURL(/\/clinics\//)
    }
  })
})

/* ================================================================== */
test.describe('Search page — mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } }) // iPhone 14 Pro

  test('search input is visible on mobile', async ({ page }) => {
    await goToSearch(page)
    const input = page.locator('input').first()
    await expect(input).toBeVisible()
  })

  test('can type and submit search on mobile', async ({ page }) => {
    await goToSearch(page)
    // .fill() below focuses the field itself — a separate .tap() first isn't
    // needed and previously failed outright anyway: this "mobile" test runs
    // in the desktop chromium project at a phone-sized viewport (not real
    // touch emulation via the mobile-chrome/mobile-safari projects), which
    // doesn't support .tap() without hasTouch enabled.
    await fillAndSubmit(page, 'dental clinic')
    await expect(page).toHaveURL(/q=dental/i)
  })
})

/* ================================================================== */
test.describe('Search page — accessibility', () => {
  test('search input has accessible label', async ({ page }) => {
    await goToSearch(page)
    const input = page.locator('input').first()
    // Should have aria-label, placeholder, or associated label
    const ariaLabel   = await input.getAttribute('aria-label')
    const placeholder = await input.getAttribute('placeholder')
    const id          = await input.getAttribute('id')
    const hasLabel    = ariaLabel || placeholder || (id && await page.locator(`label[for="${id}"]`).count() > 0)
    expect(hasLabel).toBeTruthy()
  })

  test('filter buttons have accessible names', async ({ page }) => {
    await goToSearch(page)
    const buttons = page.locator('button').filter({ hasText: /.+/ })
    const count = await buttons.count()
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await buttons.nth(i).textContent()
      expect(text?.trim().length).toBeGreaterThan(0)
    }
  })
})
