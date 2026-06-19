/**
 * NEXUS — Newsletter Subscribe
 * POST /api/subscribe  { email: string }
 *
 * Stores the subscriber in newsletter_subscribers.
 * Sends a welcome email to new subscribers.
 * Rate limited to 3 subscriptions per minute per IP.
 *
 * Required table columns (run migration if not present):
 *   ALTER TABLE newsletter_subscribers
 *     ADD COLUMN IF NOT EXISTS unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid(),
 *     ADD COLUMN IF NOT EXISTS subscribed BOOLEAN NOT NULL DEFAULT true;
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'
import { sendEmail, buildNewsletterWelcomeEmail } from '@/lib/email'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: NextRequest) {
  const rl = rateLimit(req as unknown as Request, { limit: 3, windowMs: 60_000, namespace: 'subscribe' })
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: rl.headers })
  }

  let body: { email?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 422 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: true })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('unsubscribe_token, subscribed')
      .eq('email', email)
      .single()

    if (existing) {
      if (existing.subscribed !== false) {
        // Already active subscriber — silently succeed
        return NextResponse.json({ ok: true })
      }
      // Re-subscribing after unsubscribe
      await supabase
        .from('newsletter_subscribers')
        .update({ subscribed: true })
        .eq('email', email)
      return NextResponse.json({ ok: true })
    }

    // New subscriber — insert with generated unsubscribe token
    const unsubscribeToken = crypto.randomUUID()
    await supabase.from('newsletter_subscribers').insert({
      email,
      subscribed_at:     new Date().toISOString(),
      unsubscribe_token: unsubscribeToken,
      subscribed:        true,
    })

    // Welcome email — fire-and-forget
    sendEmail({ to: email, ...buildNewsletterWelcomeEmail(unsubscribeToken) })
      .catch(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
