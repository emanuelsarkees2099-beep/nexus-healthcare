/**
 * C8 — Unit tests: lib/rate-limit.ts
 *
 * Tests the in-memory sliding-window rate limiter used by all API routes.
 * Each test group manipulates the module-level store via successive calls
 * and verifies headers + ok/remaining values.
 *
 * NOTE: because the store is module-level, tests that exercise the limit
 * must use unique IP addresses (via x-forwarded-for) to avoid interference
 * between test cases.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

/* --- helpers -------------------------------------------------------- */

/** Build a minimal Request with optional forwarded-for header */
function makeReq(ip = '1.2.3.4', path = '/api/test'): Request {
  return new Request(`http://localhost${path}`, {
    headers: ip ? { 'x-forwarded-for': ip } : {},
  })
}

/* --- import module under test --------------------------------------- */
// We re-import each describe block gets a fresh module via vi.resetModules()
// but since the store is truly module-level we use unique IPs instead.
import { rateLimit } from '@/lib/rate-limit'

/* ================================================================== */
describe('rateLimit — basic counting', () => {
  it('returns ok=true for first request', () => {
    const result = rateLimit(makeReq('10.0.0.1'), { limit: 5, namespace: 'basic-count' })
    expect(result.ok).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('decrements remaining on successive calls', () => {
    const ip = '10.0.1.1'
    const opts = { limit: 3, namespace: 'decrement' }
    const r1 = rateLimit(makeReq(ip), opts)
    const r2 = rateLimit(makeReq(ip), opts)
    const r3 = rateLimit(makeReq(ip), opts)

    expect(r1.remaining).toBe(2)
    expect(r2.remaining).toBe(1)
    expect(r3.remaining).toBe(0)
    expect(r3.ok).toBe(true) // still at-limit, not over
  })

  it('returns ok=false when limit is exceeded', () => {
    const ip = '10.0.2.1'
    const opts = { limit: 2, namespace: 'exceed' }
    rateLimit(makeReq(ip), opts) // 1
    rateLimit(makeReq(ip), opts) // 2 — at limit
    const over = rateLimit(makeReq(ip), opts) // 3 — over

    expect(over.ok).toBe(false)
    expect(over.remaining).toBe(0)
  })
})

/* ================================================================== */
describe('rateLimit — response headers', () => {
  it('includes X-RateLimit-Limit header with configured limit', () => {
    const result = rateLimit(makeReq('10.1.0.1'), { limit: 20, namespace: 'headers-limit' })
    expect(result.headers['X-RateLimit-Limit']).toBe('20')
  })

  it('includes X-RateLimit-Remaining header', () => {
    const result = rateLimit(makeReq('10.1.1.1'), { limit: 10, namespace: 'headers-remaining' })
    expect(result.headers['X-RateLimit-Remaining']).toBe('9')
  })

  it('includes X-RateLimit-Reset as a Unix timestamp string', () => {
    const before = Math.floor(Date.now() / 1000)
    const result  = rateLimit(makeReq('10.1.2.1'), { limit: 10, windowMs: 60_000, namespace: 'headers-reset' })
    const reset   = parseInt(result.headers['X-RateLimit-Reset'], 10)
    // Allow +2s tolerance for sub-second timing variance between test and impl
    const after  = Math.floor(Date.now() / 1000) + 62
    expect(reset).toBeGreaterThanOrEqual(before)
    expect(reset).toBeLessThanOrEqual(after)
  })

  it('adds Retry-After header when limit is exceeded', () => {
    const ip = '10.1.3.1'
    const opts = { limit: 1, namespace: 'retry-after' }
    rateLimit(makeReq(ip), opts) // use the 1 allowed request
    const over = rateLimit(makeReq(ip), opts) // exceed
    expect(over.headers['Retry-After']).toBeDefined()
    expect(parseInt(over.headers['Retry-After'], 10)).toBeGreaterThan(0)
  })

  it('does NOT include Retry-After when request is allowed', () => {
    const result = rateLimit(makeReq('10.1.4.1'), { limit: 5, namespace: 'no-retry' })
    expect(result.headers['Retry-After']).toBeUndefined()
  })
})

/* ================================================================== */
describe('rateLimit — namespacing', () => {
  it('tracks different namespaces independently for the same IP', () => {
    const ip = '10.2.0.1'
    const r1 = rateLimit(makeReq(ip), { limit: 1, namespace: 'ns-a' })
    const r2 = rateLimit(makeReq(ip), { limit: 1, namespace: 'ns-b' })

    // First call to each namespace should be allowed
    expect(r1.ok).toBe(true)
    expect(r2.ok).toBe(true)
  })

  it('namespace A exhaustion does not affect namespace B', () => {
    const ip = '10.2.1.1'
    rateLimit(makeReq(ip), { limit: 1, namespace: 'ns-c' }) // use up ns-c
    const over  = rateLimit(makeReq(ip), { limit: 1, namespace: 'ns-c' }) // exceed ns-c
    const fresh = rateLimit(makeReq(ip), { limit: 5, namespace: 'ns-d' }) // ns-d untouched

    expect(over.ok).toBe(false)
    expect(fresh.ok).toBe(true)
  })
})

/* ================================================================== */
describe('rateLimit — IP extraction', () => {
  it('uses first IP in comma-separated X-Forwarded-For', () => {
    const req = new Request('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1, 172.16.0.1' },
    })
    // Two calls with same leading IP share a window
    rateLimit(req, { limit: 3, namespace: 'xff-multi' })
    const r2 = rateLimit(req, { limit: 3, namespace: 'xff-multi' })
    expect(r2.remaining).toBe(1) // shared counter confirms same key
  })

  it('falls back to "unknown" when no forwarded-for header', () => {
    const req = new Request('http://localhost/api/test')
    // Just ensure it doesn't throw
    const result = rateLimit(req, { limit: 100, namespace: 'no-ip' })
    expect(result.ok).toBe(true)
  })
})

/* ================================================================== */
describe('rateLimit — defaults', () => {
  it('uses limit=60 and windowMs=60000 when no options given', () => {
    const result = rateLimit(makeReq('10.3.0.1'))
    expect(result.headers['X-RateLimit-Limit']).toBe('60')
    expect(result.remaining).toBe(59)
  })

  it('returns a resetAt value in the future', () => {
    const now    = Date.now()
    const result = rateLimit(makeReq('10.3.1.1'), { namespace: 'reset-future' })
    expect(result.resetAt).toBeGreaterThan(now)
  })
})

/* ================================================================== */
describe('rateLimit — window expiry', () => {
  it('resets count after the window expires', async () => {
    const ip   = '10.4.0.1'
    const opts = { limit: 1, windowMs: 50, namespace: 'expiry' } // 50ms window

    rateLimit(makeReq(ip), opts) // use 1
    const over = rateLimit(makeReq(ip), opts) // exceed
    expect(over.ok).toBe(false)

    // Wait for the window to expire
    await new Promise(r => setTimeout(r, 60))

    const after = rateLimit(makeReq(ip), opts) // new window — should be allowed
    expect(after.ok).toBe(true)
  })
})
