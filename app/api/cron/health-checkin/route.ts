/**
 * NEXUS — Weekly Health Check-In Email Cron
 * POST /api/cron/health-checkin
 * Schedule: every Monday at 10:00 AM UTC (vercel.json)
 *
 * Queries user_profiles for users with emails, computes a simple
 * health engagement score from their outcomes, and sends a personalized
 * weekly digest email.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, buildHealthCheckinEmail } from '@/lib/email'

export const maxDuration = 60

// Score weights: each completed action increases the engagement score
const SCORE_MAP: Record<string, number> = {
  clinic_visited:        25,
  appointment_made:      20,
  program_enrolled:      30,
  prescription_obtained: 20,
  care_received:         25,
}

function computeScore(eventCounts: Record<string, number>): { score: number; label: string } {
  let raw = 0
  for (const [type, weight] of Object.entries(SCORE_MAP)) {
    raw += (eventCounts[type] ?? 0) * weight
  }
  const score = Math.min(100, raw)
  const label =
    score >= 80 ? 'Excellent engagement' :
    score >= 60 ? 'Good momentum' :
    score >= 40 ? 'Making progress' :
    score >= 20 ? 'Getting started' :
                  'Let\'s get you connected'
  return { score, label }
}

function nextAction(eventCounts: Record<string, number>): string {
  if (!eventCounts.clinic_visited)         return 'Find a free clinic near you — search by ZIP code on NEXUS.'
  if (!eventCounts.program_enrolled)       return 'Check your program eligibility — you may qualify for free coverage.'
  if (!eventCounts.prescription_obtained)  return 'Explore medication assistance programs and save up to 90%.'
  if (!eventCounts.appointment_made)       return 'Schedule a follow-up appointment to stay on top of your health.'
  return 'Update your Health Passport with your latest care visit.'
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  )

  // Fetch users who have opted-in to emails (all users with profiles)
  const { data: profiles, error: profileErr } = await supabase
    .from('user_profiles')
    .select('id, email, full_name')
    .not('email', 'is', null)

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 })
  }

  const users = profiles ?? []
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  let sent = 0, failed = 0

  for (const user of users) {
    const email = user.email as string
    const name  = (user.full_name as string) || email

    // Get this user's outcomes over the past 30 days
    const { data: outcomes } = await supabase
      .from('outcomes')
      .select('event_type')
      .eq('user_id', user.id)
      .gte('created_at', since)

    const eventCounts: Record<string, number> = {}
    for (const row of (outcomes ?? [])) {
      eventCounts[row.event_type] = (eventCounts[row.event_type] ?? 0) + 1
    }

    const { score, label } = computeScore(eventCounts)
    const action = nextAction(eventCounts)

    const result = await sendEmail({
      to: email,
      ...buildHealthCheckinEmail(name, score, label, action),
    })

    if (result.ok) sent++; else failed++

    // Small delay to avoid hammering Resend
    await new Promise(r => setTimeout(r, 50))
  }

  console.log(`[health-checkin] sent=${sent} failed=${failed} total=${users.length}`)
  return NextResponse.json({ sent, failed, total: users.length })
}
