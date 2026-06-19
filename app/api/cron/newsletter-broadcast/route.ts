/**
 * NEXUS — Newsletter Broadcast Cron
 * POST /api/cron/newsletter-broadcast
 * Header: x-cron-secret
 *
 * Sends a broadcast email to all active newsletter subscribers.
 * Each email contains a unique unsubscribe token (CAN-SPAM compliant).
 *
 * Body:
 * {
 *   headline: string,
 *   paragraphs: string[],
 *   ctaText?: string,
 *   ctaUrl?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildBroadcastEmail, sendEmail } from '@/lib/email'

export const maxDuration = 60

const CHUNK = 50

export async function POST(req: NextRequest) {
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { headline?: unknown; paragraphs?: unknown; ctaText?: unknown; ctaUrl?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const headline = typeof body.headline === 'string' ? body.headline.trim() : ''
  if (!headline) {
    return NextResponse.json({ error: 'headline is required' }, { status: 400 })
  }

  const paragraphs = Array.isArray(body.paragraphs)
    ? (body.paragraphs as unknown[]).filter(p => typeof p === 'string') as string[]
    : []
  if (paragraphs.length === 0) {
    return NextResponse.json({ error: 'paragraphs[] is required' }, { status: 400 })
  }

  const ctaText = typeof body.ctaText === 'string' ? body.ctaText : undefined
  const ctaUrl  = typeof body.ctaUrl  === 'string' ? body.ctaUrl  : undefined

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  )

  // Fetch all active subscribers with their unsubscribe tokens
  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('email, unsubscribe_token')
    .eq('subscribed', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = subscribers ?? []
  if (rows.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, message: 'No active subscribers' })
  }

  let sent = 0, failed = 0

  // Send in chunks to respect rate limits
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    await Promise.all(chunk.map(async row => {
      const email  = row.email as string
      const token  = row.unsubscribe_token as string
      const tmpl   = buildBroadcastEmail(headline, paragraphs, ctaText, ctaUrl, token)
      const result = await sendEmail({ to: email, ...tmpl })
      if (result.ok) sent++; else failed++
    }))
    if (i + CHUNK < rows.length) await new Promise(r => setTimeout(r, 200))
  }

  console.log(`[newsletter-broadcast] sent=${sent} failed=${failed} total=${rows.length}`)
  return NextResponse.json({ sent, failed, total: rows.length })
}
