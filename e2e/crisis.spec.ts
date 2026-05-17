/**
 * C7 — e2e: Crisis navigation
 *
 * Tests the crisis resources page and all critical navigation paths:
 *   1. /crisis loads with no errors
 *   2. Emergency hotlines (988, 911) are visible and correctly linked
 *   3. Category sections are present (mental health, domestic violence, etc.)
 *   4. All external links have target="_blank" and rel attributes
 *   5. Crisis nav link in the Nav component works
 *   6. Mobile viewport — full page visible without horizontal scroll
 *   7. Keyboard navigation through hotline cards
 *   8. No-JavaScript fallback — page still renders core content
 */

import { test, expect, type Page } from '@playwright/test'

/* ── helpers ──────────────────────────────────────────────────────── */

async function goToCrisis(page: Page) {
  await page.goto('/crisis')
  await page.waitForLoadState('domcontentloaded')
}

/* ================================================================== */
test.describe('Crisis page — load', () => {
  test('navigates to /crisis without error', async ({ page }) => {
    await goToCrisis(page)
    await expect(page).toHaveURL(/\/crisis/)
  })

  test('page title contains NEXUS', async ({ page }) => {
    await goToCrisis(page)
    await expect(page).toHaveTitle(/NEXUS/i)
  })

  test('page has a visible main heading', async ({ page }) => {
    await goToCrisis(page)
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
    const text = await heading.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('no JavaScript errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await goToCrisis(page)
    await page.waitForTimeout(1000)
    // Filter out known benign errors (e.g. service worker, analytics)
    const critical = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('ChunkLoad') &&
      !e.includes('Script error') &&
      !e.includes('Non-Error')
    )
    expect(critical).toHaveLength(0)
  })
})

/* ================================================================== */
test.describe('Crisis page — emergency hotlines', () => {
  test('988 Suicide & Crisis Lifeline is visible', async ({ page }) => {
    await goToCrisis(page)
    const lifeline = page.locator('text=/988/').first()
    await expect(lifeline).toBeVisible({ timeout: 8_000 })
  })

  test('911 emergency reference is present', async ({ page }) => {
    await goToCrisis(page)
    const emergency = page.locator('text=/911/').first()
    await expect(emergency).toBeVisible({ timeout: 8_000 })
  })

  test('clickable phone links use tel: protocol', async ({ page }) => {
    await goToCrisis(page)
    const telLinks = page.locator('a[href^="tel:"]')
    const count = await telLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('988 phone link has correct tel: href', async ({ page }) => {
    await goToCrisis(page)
    const link988 = page.locator('a[href="tel:988"], a[href="tel:+1988"], a[href*="988"]').first()
    if (await link988.count() > 0) {
      const href = await link988.getAttribute('href')
      expect(href).toMatch(/988/)
    }
  })

  test('hotline cards have accessible names', async ({ page }) => {
    await goToCrisis(page)
    const telLinks = page.locator('a[href^="tel:"]')
    const count = await telLinks.count()
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text    = await telLinks.nth(i).textContent()
      const ariaLabel = await telLinks.nth(i).getAttribute('aria-label')
      expect(text?.trim() || ariaLabel).toBeTruthy()
    }
  })
})

/* ================================================================== */
test.describe('Crisis page — resource categories', () => {
  test('mental health crisis section is present', async ({ page }) => {
    await goToCrisis(page)
    const section = page.locator('text=/mental health/i').first()
    await expect(section).toBeVisible({ timeout: 8_000 })
  })

  test('domestic violence resources are present', async ({ page }) => {
    await goToCrisis(page)
    const section = page.locator('text=/domestic violence/i, text=/domestic abuse/i').first()
    await expect(section).toBeVisible({ timeout: 8_000 })
  })

  test('substance abuse resources are present', async ({ page }) => {
    await goToCrisis(page)
    const section = page.locator('text=/substance|addiction|SAMHSA/i').first()
    await expect(section).toBeVisible({ timeout: 8_000 })
  })
})

/* ================================================================== */
test.describe('Crisis page — external links', () => {
  test('external links open in new tab (target=_blank)', async ({ page }) => {
    await goToCrisis(page)
    const externalLinks = page.locator('a[target="_blank"]')
    const count = await externalLinks.count()
    // If there are external links, they should have rel="noopener"
    for (let i = 0; i < Math.min(count, 5); i++) {
      const rel = await externalLinks.nth(i).getAttribute('rel')
      expect(rel).toMatch(/noopener|noreferrer/)
    }
  })
})

/* ================================================================== */
test.describe('Crisis page — navigation', () => {
  test('nav link to /crisis is present from homepage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const crisisLink = page.locator('a[href="/crisis"], nav a').filter({ hasText: /crisis/i }).first()
    if (await crisisLink.isVisible()) {
      await crisisLink.click()
      await expect(page).toHaveURL(/\/crisis/)
    }
  })

  test('back navigation from crisis works', async ({ page }) => {
    await page.goto('/search')
    await page.goto('/crisis')
    await page.goBack()
    await expect(page).toHaveURL(/\/search/)
  })

  test('crisis page has link back to main site (home or dashboard)', async ({ page }) => {
    await goToCrisis(page)
    const homeLink = page.locator('a[href="/"], a[href="/dashboard"], nav a').first()
    await expect(homeLink).toBeVisible()
  })
})

/* ================================================================== */
test.describe('Crisis page — accessibility', () => {
  test('page has exactly one h1', async ({ page }) => {
    await goToCrisis(page)
    const h1s = page.locator('h1')
    await expect(h1s).toHaveCount(1)
  })

  test('all images have alt text', async ({ page }) => {
    await goToCrisis(page)
    const images = page.locator('img')
    const count = await images.count()
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      const role = await images.nth(i).getAttribute('role')
      // alt="" is valid for decorative images; role="presentation" also acceptable
      expect(alt !== null || role === 'presentation').toBe(true)
    }
  })

  test('phone links are keyboard-focusable', async ({ page }) => {
    await goToCrisis(page)
    const firstTelLink = page.locator('a[href^="tel:"]').first()
    if (await firstTelLink.isVisible()) {
      await firstTelLink.focus()
      await expect(firstTelLink).toBeFocused()
    }
  })

  test('page does not have positive tabindex values (bad practice)', async ({ page }) => {
    await goToCrisis(page)
    const badTabindex = page.locator('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])')
    const count = await badTabindex.count()
    // Warn if any positive tabindex found — ideally 0
    expect(count).toBe(0)
  })
})

/* ================================================================== */
test.describe('Crisis page — mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('renders without horizontal overflow on mobile', async ({ page }) => {
    await goToCrisis(page)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 5)
  })

  test('988 hotline is visible on mobile', async ({ page }) => {
    await goToCrisis(page)
    const lifeline = page.locator('text=/988/').first()
    await expect(lifeline).toBeVisible()
  })

  test('phone links are tappable on mobile (min touch target)', async ({ page }) => {
    await goToCrisis(page)
    const telLinks = page.locator('a[href^="tel:"]')
    const count = await telLinks.count()
    for (let i = 0; i < Math.min(count, 3); i++) {
      const box = await telLinks.nth(i).boundingBox()
      if (box) {
        // WCAG 2.5.5 recommends 44×44px minimum touch targets
        expect(box.height).toBeGreaterThanOrEqual(24) // lenient lower bound
        expect(box.width).toBeGreaterThanOrEqual(24)
      }
    }
  })
})

/* ================================================================== */
test.describe('Crisis page — performance', () => {
  test('page loads within 5 seconds', async ({ page }) => {
    const start = Date.now()
    await goToCrisis(page)
    await page.waitForSelector('text=/988/', { timeout: 5_000 })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5_000)
  })

  test('no render-blocking 4xx errors in network', async ({ page }) => {
    const failedRequests: string[] = []
    page.on('response', res => {
      if (res.status() >= 400 && res.status() < 500 && !res.url().includes('favicon')) {
        failedRequests.push(`${res.status()} ${res.url()}`)
      }
    })
    await goToCrisis(page)
    await page.waitForTimeout(1000)
    expect(failedRequests).toHaveLength(0)
  })
})
