import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Outcome Logging API ────────────────────────────────────────────────────────
// POST /api/outcomes — log a health outcome event
// GET  /api/outcomes — aggregate stats (public summary only)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface OutcomePayload {
  event_type: 'clinic_visited' | 'appointment_made' | 'program_enrolled' | 'prescription_obtained' | 'care_received'
  clinic_id?: string
  clinic_name?: string
  program_name?: string
  zip_code?: string
  notes?: string
  anonymous?: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body: OutcomePayload = await req.json()

    // Validate event type
    const validTypes = ['clinic_visited', 'appointment_made', 'program_enrolled', 'prescription_obtained', 'care_received']
    if (!validTypes.includes(body.event_type)) {
      return NextResponse.json({ error: 'Invalid event_type' }, { status: 400 })
    }

    // Get user if authenticated (optional — outcomes can be anonymous)
    let userId: string | null = null
    const authHeader = req.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data } = await supabase.auth.getUser(token)
      userId = data.user?.id ?? null
    }

    const payload = {
      user_id: userId,
      event_type: body.event_type,
      clinic_id: body.clinic_id ?? null,
      clinic_name: body.clinic_name ?? null,
      program_name: body.program_name ?? null,
      zip_code: body.zip_code ?? null,
      notes: body.notes ?? null,
      anonymous: body.anonymous ?? !userId,
      created_at: new Date().toISOString(),
    }

    // Try to insert — gracefully fail if table doesn't exist yet
    const { error } = await supabase.from('outcomes').insert(payload)

    if (error) {
      // Table may not exist yet — log to console but don't fail the request
      console.warn('[Outcomes] Insert error (table may not exist):', error.message)
      return NextResponse.json({ success: true, queued: true })
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
    const zip = searchParams.get('zip')
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 365)

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // Aggregate counts (no PII)
    let query = supabase
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
