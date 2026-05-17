/**
 * C8 — Vitest configuration
 *
 * Runs the __tests__/ unit-test suite without spinning up Next.js or a browser.
 * Uses the Node environment (no jsdom needed for pure utility tests).
 *
 * Run:
 *   npm run test:unit          — run once
 *   npm run test:unit:watch    — watch mode
 *   npm run test:unit:coverage — coverage report
 */

import { defineConfig } from 'vitest/config'
import { resolve }      from 'path'

export default defineConfig({
  test: {
    /* Node environment — no browser globals needed for pure utilities */
    environment: 'node',

    /* Glob for test files */
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],

    /* Coverage config (used with --coverage flag) */
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['lib/**/*.ts', 'utils/**/*.ts'],
      exclude: ['lib/sentry.ts', 'node_modules/**'],
      thresholds: {
        lines:     80,
        functions: 80,
        branches:  75,
        statements: 80,
      },
    },

    /* Global test timeout */
    testTimeout: 10_000,
  },

  resolve: {
    alias: {
      /* Mirror Next.js path alias @/* -> project root */
      '@': resolve(__dirname, '.'),
    },
  },
})
