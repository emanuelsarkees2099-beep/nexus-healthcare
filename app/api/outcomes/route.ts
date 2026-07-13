import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, buildProgramAlertEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { OutcomeSchema, badRequest } from '@/lib/validation'

// ── Outcome Logging API ────────────────────────────────────────────────────────
// POST /api/outcomes — log a health outcome event
// GET  /api/outcomes — aggregate stats (public summary only)

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://nexus.health').replace(/\/$/, '')

const getSupabaseClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const VALID_TYPES = [
  'clinic_visited',
  'appointment_made',
  'program_enrolled',
  'prescription_obtained',
  'care_received',
  'crisis_visited',
] as const

type EventType = typeof VALID_TYPES[number]

interface OutcomePayload {
  event_type: EventType
  clinic_id?: string
  clinic_name?: string
  program_name?: string
  zip_code?: string
  notes?: string
  anonymous?: boolean
}

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(req, { limit: 30, windowMs: 60_000, namespace: 'outcomes' })
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: rl.headers })
    }

    const parsed = OutcomeSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return badRequest(parsed)
    const body: OutcomePayload = parsed.data

    // Get user if authenticated (optional — outcomes can be anonymous)
    let userId:    string | null = null
    let userEmail: string | null = null

    const authHeader = req.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data } = await getSupabaseClient().auth.getUser(token)
      userId    = data.user?.id ?? null
      userEmail = data.user?.email ?? null
    }

    const payload = {
      user_id:      userId,
      event_type:   body.event_type,
      clinic_id:    body.clinic_id    ?? null,
      clinic_name:  body.clinic_name  ?? null,
      program_name: body.program_name ?? null,
      zip_code:     body.zip_code     ?? null,
      notes:        body.notes        ?? null,
      anonymous:    body.anonymous ?? !userId,
      created_at:   new Date().toISOString(),
    }

    const { error } = await getSupabaseClient().from('outcomes').insert(payload)

    if (error) {
      console.warn('[Outcomes] Insert error (table may not exist):', error.message)
      return NextResponse.json({ success: true, queued: true })
    }

    // Side-effects: trigger emails for specific event types
    if (body.event_type === 'program_enrolled' && userEmail && body.program_name) {
      const profileRes = await getSupabaseClient()
        .from('user_profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      const name = profileRes.data?.full_name ?? userEmail

      sendEmail({
        to: userEmail,
        ...buildProgramAlertEmail(
          name,
          body.program_name,
          body.notes ?? 'You have been enrolled in a healthcare assistance program.',
          `${APP_URL}/programs`,
        ),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Outcomes] POST error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const zip  = searchParams.get('zip')
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 365)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    let query = getSupabaseClient()
      .from('outcomes')
      .select('event_type, zip_code, clinic_name, program_name, created_at')
      .gte('created_at', since)

    if (zip) query = query.eq('zip_code', zip)

    const { data, error } = await query.limit(1000)

    if (error) {
      console.warn('[Outcomes] GET error:', error.message)
      return NextResponse.json({ total: 0, by_type: {}, recent_zips: [], days })
    }

    const rows = data || []
    const byType: Record<string, number> = {}
    const zipSet = new Set<string>()

    for (const row of rows) {
      byType[row.event_type] = (byType[row.event_type] || 0) + 1
      if (row.zip_code) zipSet.add(row.zip_code)
    }

    return NextResponse.json({
      total: rows.length,
      by_type: byType,
      recent_zips: [...zipSet].slice(0, 10),
      days,
      message: `${rows.length} outcomes logged in the last ${days} days`,
    })
  } catch (err) {
    console.error('[Outcomes] GET error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
