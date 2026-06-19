/**
 * NEXUS — Password Reset Request
 * POST /api/auth/reset-password  { email: string }
 *
 * Triggers a Supabase password reset email.
 * Always returns 200 — never reveals if the email exists (prevents enumeration).
 * Rate limited to 3 requests per hour per IP.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const APP_URL  = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://nexus.health').replace(/\/$/, '')

export async function POST(req: NextRequest) {
  const rl = rateLimit(req as unknown as Request, {
    limit: 3, windowMs: 60 * 60_000, namespace: 'reset-password',
  })
  if (!rl.ok) {
    return NextResponse.json({ ok: true }, { headers: rl.headers })
  }

  let body: { email?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email)) {
    // Invalid email — still return 200 to avoid enumeration
    return NextResponse.json({ ok: true })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    )

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${APP_URL}/update-password`,
    })
  } catch (err) {
    console.error('[reset-password]', err)
    // Still return 200 — never expose errors to client
  }

  return NextResponse.json({ ok: true }, { headers: rl.headers })
}
