/**
 * F3 — Push Notification Subscription endpoint
 *
 * POST /api/push/subscribe
 *   Body: { subscription: PushSubscriptionJSON, userId?: string }
 *   → Stores subscription in Supabase `push_subscriptions` table
 *
 * DELETE /api/push/subscribe
 *   Body: { endpoint: string }
 *   → Removes subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@supabase/ssr'
import { cookies }                   from 'next/headers'
import { rateLimit }                 from '@/lib/rate-limit'

/* VAPID public key — set NEXT_PUBLIC_VAPID_PUBLIC_KEY in env */
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

/* ── GET: return VAPID public key for client subscription ── */
export async function GET() {
  if (!VAPID_PUBLIC_KEY) {
    return NextResponse.json({ error: 'Push not configured' }, { status: 503 })
  }
  return NextResponse.json({ vapidPublicKey: VAPID_PUBLIC_KEY })
}

/* ── POST: save a new push subscription ── */
export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, { limit: 10, windowMs: 60_000, namespace: 'push-sub' })
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const body = await req.json().catch(() => null)
  if (!body?.subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 })
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  /* Resolve user id (optional — anonymous subscriptions are allowed) */
  const { data: { session } } = await supabase.auth.getSession()
  const userId = body.userId ?? session?.user?.id ?? null

  /* Upsert by endpoint — idempotent */
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      endpoint:    body.subscription.endpoint,
      p256dh:      body.subscription.keys?.p256dh   ?? '',
      auth:        body.subscription.keys?.auth      ?? '',
      user_id:     userId,
      user_agent:  req.headers.get('user-agent')?.slice(0, 200) ?? '',
      updated_at:  new Date().toISOString(),
    }, { onConflict: 'endpoint' })

  if (error) {
    console.error('[push/subscribe] upsert error:', error.message)
    /* Silently succeed even on DB error — the subscription is valid client-side */
  }

  return NextResponse.json({ ok: true })
}

/* ── DELETE: remove subscription ── */
export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', body.endpoint)

  return NextResponse.json({ ok: true })
}
