/**
 * C7 — Playwright e2e configuration
 *
 * Runs the e2e/ suite against a locally-running dev server.
 *
 * Run:
 *   npm run test:e2e              — run all e2e tests (headless)
 *   npm run test:e2e:ui           — Playwright UI mode
 *   npm run test:e2e:headed       — headed browser (debug)
 *
 * CI:
 *   The webServer block automatically starts `next dev` before running tests
 *   and tears it down afterward.  Set BASE_URL env to point at a deployed
 *   preview URL in CI to skip the local server startup.
 */

import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  /* Test file glob */
  testDir: './e2e',
  testMatch: '**/*.spec.ts',

  /* Maximum time one test can take */
  timeout: 30_000,

  /* Retries on CI, none locally */
  retries: process.env.CI ? 2 : 0,

  /* Parallel workers */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  /* Shared settings for all tests */
  use: {
    baseURL:          BASE_URL,
    trace:            'on-first-retry',
    screenshot:       'only-on-failure',
    video:            'retain-on-failure',
    /* Viewport — standard desktop */
    viewport:         { width: 1280, height: 800 },
    /* Reduce flakiness — wait for network to be idle */
    actionTimeout:    10_000,
    navigationTimeout: 20_000,
  },

  /* Browser projects */
  projects: [
    {
      name:  'chromium',
      use:   { ...devices['Desktop Chrome'] },
    },
    {
      name:  'firefox',
      use:   { ...devices['Desktop Firefox'] },
    },
    {
      name:  'webkit',
      use:   { ...devices['Desktop Safari'] },
    },
    /* Mobile viewports */
    {
      name:  'mobile-chrome',
      use:   { ...devices['Pixel 5'] },
    },
    {
      name:  'mobile-safari',
      use:   { ...devices['iPhone 13'] },
    },
  ],

  /* Automatically start the dev server when running locally */
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command:              'npm run dev',
        url:                  BASE_URL,
        reuseExistingServer:  !process.env.CI,
        timeout:              120_000,
      },
})
