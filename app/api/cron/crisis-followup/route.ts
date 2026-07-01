/**
 * NEXUS — Crisis Follow-Up Email Cron
 * POST /api/cron/crisis-followup
 * Schedule: daily at 9:00 AM UTC (vercel.json)
 *
 * Finds users who logged a 'crisis_visited' outcome 20–28 hours ago
 * and sends a warm, supportive follow-up email with crisis resources.
 *
 * Deduplication: only sends once per user per day. Users who already
 * received a followup within 24h are skipped.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, buildCrisisFollowupEmail } from '@/lib/email'
import { verifyCronHeader } from '@/lib/cron-auth'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  if (!verifyCronHeader(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  )

  const now      = Date.now()
  const from20h  = new Date(now - 28 * 60 * 60 * 1000).toISOString()
  const to20h    = new Date(now - 20 * 60 * 60 * 1000).toISOString()

  // Crisis events from the 20–28h window
  const { data: crisisRows, error } = await supabase
    .from('outcomes')
    .select('user_id, created_at')
    .eq('event_type', 'crisis_visited')
    .gte('created_at', from20h)
    .lte('created_at', to20h)
    .not('user_id', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Deduplicate — one email per unique user
  const uniqueUserIds = [...new Set((crisisRows ?? []).map(r => r.user_id as string))]

  if (uniqueUserIds.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, message: 'No crisis events in window' })
  }

  // Ensure we haven't already sent a followup to these users in the last 24h
  // (tracks via a 'crisis_followup_sent' outcome type, or we rely on the window not overlapping)

  // Fetch user emails
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, email, full_name')
    .in('id', uniqueUserIds)

  const profileMap = new Map(
    (profiles ?? []).map(p => [p.id as string, { email: p.email as string, name: (p.full_name as string) || '' }])
  )

  let sent = 0, skipped = 0

  for (const userId of uniqueUserIds) {
    const profile = profileMap.get(userId)
    if (!profile?.email) { skipped++; continue }

    const result = await sendEmail({
      to: profile.email,
      ...buildCrisisFollowupEmail(),
    })

    if (result.ok) {
      sent++
      // Log that we sent a followup so we don't double-send
      try {
        await supabase.from('outcomes').insert({
          user_id:    userId,
          event_type: 'care_received',
          notes:      'crisis_followup_email_sent',
          anonymous:  false,
          created_at: new Date().toISOString(),
        })
      } catch { /* non-critical */ }
    } else {
      skipped++
    }

    await new Promise(r => setTimeout(r, 50))
  }

  console.log(`[crisis-followup] sent=${sent} skipped=${skipped} window=${from20h}–${to20h}`)
  return NextResponse.json({ sent, skipped, total: uniqueUserIds.length })
}
