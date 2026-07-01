/**
 * Timing-safe CRON_SECRET verification.
 * Standard string !== comparison leaks secret length via response timing.
 * XOR byte comparison runs in constant time regardless of where mismatch occurs.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const aBytes = enc.encode(a)
  const bBytes = enc.encode(b)
  // Iterate the longer length so length differences don't short-circuit
  const len = Math.max(aBytes.length, bBytes.length)
  let result = aBytes.length ^ bBytes.length // non-zero if lengths differ
  for (let i = 0; i < len; i++) {
    result |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0)
  }
  return result === 0
}

/** Verify x-cron-secret header (used by POST cron routes). */
export function verifyCronHeader(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const provided = req.headers.get('x-cron-secret') ?? ''
  return timingSafeEqual(provided, secret)
}

/** Verify Authorization: Bearer <secret> header (used by GET cron routes). */
export function verifyCronBearer(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return false
  return timingSafeEqual(authHeader.slice(7), secret)
}
