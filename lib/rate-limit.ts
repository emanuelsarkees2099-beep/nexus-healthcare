/**
 * NEXUS — In-memory sliding-window rate limiter
 *
 * Usage:
 *   import { rateLimit } from '@/lib/rate-limit'
 *
 *   const check = await rateLimit(req, { limit: 20, windowMs: 60_000 })
 *   if (!check.ok) return new Response('Too many requests', { status: 429, headers: check.headers })
 */

type Window = {
  count: number
  resetAt: number
}

// Module-level store — persists for the lifetime of the Node.js process (single-instance)
const store = new Map<string, Window>()

// Periodically purge expired entries to prevent memory leaks
let gcScheduled = false
function scheduleGC() {
  if (gcScheduled) return
  gcScheduled = true
  setInterval(() => {
    const now = Date.now()
    for (const [key, win] of store) {
      if (now > win.resetAt) store.delete(key)
    }
  }, 60_000)
}

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit?: number
  /** Window size in milliseconds */
  windowMs?: number
  /** Optional prefix to namespace keys (e.g. 'ai', 'submit') */
  namespace?: string
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
  headers: Record<string, string>
}

/**
 * Check the rate limit for a request.
 * The key is derived from the client IP (X-Forwarded-For → real IP).
 */
export function rateLimit(
  req: Request,
  {
    limit     = 60,
    windowMs  = 60_000,
    namespace = 'default',
  }: RateLimitOptions = {},
): RateLimitResult {
  scheduleGC()

  // Derive IP
  const forwarded = req.headers.get('x-forwarded-for') ?? ''
  const ip        = forwarded.split(',')[0].trim() || 'unknown'
  const key       = `${namespace}:${ip}`

  const now = Date.now()
  let win   = store.get(key)

  if (!win || now > win.resetAt) {
    win = { count: 0, resetAt: now + windowMs }
    store.set(key, win)
  }

  win.count++

  const remaining = Math.max(0, limit - win.count)
  const ok        = win.count <= limit

  const headers: Record<string, string> = {
    'X-RateLimit-Limit':     String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset':     String(Math.ceil(win.resetAt / 1000)),
    ...(ok ? {} : { 'Retry-After': String(Math.ceil((win.resetAt - now) / 1000)) }),
  }

  return { ok, remaining, resetAt: win.resetAt, headers }
}
