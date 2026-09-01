/**
 * C7 — e2e: Triage flow
 *
 * Tests the symptom-triage experience end-to-end:
 *   1. Landing on /triage
 *   2. Entering a symptom description
 *   3. Receiving a care-level recommendation
 *   4. Navigation to search from triage result
 *   5. Emergency escalation visibility
 *   6. Keyboard and mobile accessibility
 *
 * IMPORTANT: /triage is listed in PROTECTED_PATHS in proxy.ts — an
 * unauthenticated visit is deliberately redirected to /login?next=/triage.
 * That's intentional app behavior (confirmed in the middleware, not a
 * bug), so every test below that needs the actual triage UI is blocked
 * until this suite has a way to run as a logged-in test user — there's
 * no test-account/storageState infrastructure yet, and fabricating one
 * with guessed credentials would be worse than being honest that this
 * gap exists. Only the redirect-confirmation test can run for real today.
 */

import { test, expect, type Page } from '@playwright/test'

/* ── helpers ──────────────────────────────────────────────────────── */

async function goToTriage(page: Page) {
  await page.goto('/triage')
  await page.waitForLoadState('domcontentloaded')
}

/* ================================================================== */
test.describe('Triage page — load', () => {
  test('unauthenticated visit redirects to /login?next=/triage', async ({ page }) => {
    // This is the real, current, intentional behavior per proxy.ts.
    await goToTriage(page)
    await expect(page).toHaveURL(/\/login\?next=%2Ftriage/)
  })

  test.skip('page title contains AXVO', async () => {
    // Needs an authenticated session — see file header.
  })

  test.skip('symptom input area is visible', async () => {
    // Needs an authenticated session — see file header.
  })

  test.skip('shows disclaimer that this is not medical advice', async () => {
    // Needs an authenticated session — see file header.
  })
})

/* ================================================================== */
test.describe('Triage page — symptom input', () => {
  test.skip('can type a symptom description', async () => {})
  test.skip('submit button is present and enabled after typing', async () => {})
  test.skip('empty submission shows a validation cue', async () => {})
  test.skip('submitting a symptom triggers loading state', async () => {})
})

/* ================================================================== */
test.describe('Triage page — emergency escalation', () => {
  test.skip('emergency escalation component is visible', async () => {})
  test.skip('crisis/emergency link points to correct resource', async () => {})
})

/* ================================================================== */
test.describe('Triage page — result navigation', () => {
  test.skip('after triage result, search link leads to /search', async () => {})
})

/* ================================================================== */
test.describe('Triage page — accessibility', () => {
  test.skip('symptom input has accessible label', async () => {})
  test.skip('page has a heading (h1 or h2)', async () => {})
  test.skip('focusable submit button is reachable by Tab key', async () => {})
})

/* ================================================================== */
test.describe('Triage page — mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test.skip('renders correctly on mobile without horizontal scroll', async () => {})
  test.skip('symptom input visible and tappable on mobile', async () => {})
})
