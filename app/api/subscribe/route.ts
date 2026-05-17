/**
 * NEXUS — Newsletter Subscribe
 * POST /api/subscribe  { email: string }
 *
 * Stores the subscriber email in the `newsletter_subscribers` table in Supabase.
 * Rate limited to 3 subscriptions per minute per IP.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: NextRequest) {
  const rl = rateLimit(req as unknown as Request, { limit: 3, windowMs: 60_000, namespace: 'subscribe' })
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: rl.headers })
  }

  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 422 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Gracefully succeed even if not configured — newsletter is non-critical
    return NextResponse.json({ ok: true })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    await supabase
      .from('newsletter_subscribers')
      .upsert({ email, subscribed_at: new Date().toISOString() }, { onConflict: 'email' })
    return NextResponse.json({ ok: true })
  } catch {
    // Non-critical — don't fail the user experience
    return NextResponse.json({ ok: true })
  }
}
