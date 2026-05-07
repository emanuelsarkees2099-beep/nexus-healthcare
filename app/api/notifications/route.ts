import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── /api/notifications ─────────────────────────────────────────────────────
// GET  — list notifications for the authenticated user (falls back to empty)
// POST — push a new notification to the user (used by cron jobs / server events)

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

async function getUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  const { data } = await getSupabase().auth.getUser(token)
  return data.user?.id ?? null
}

/* ── GET /api/notifications ── */
export async function GET(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) {
    // Unauthenticated: return empty list (client uses localStorage)
    return NextResponse.json({ notifications: [] })
  }

  try {
    const { data, error } = await getSupabase()
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      // Table may not exist yet — return empty list gracefully
      return NextResponse.json({ notifications: [] })
    }

    return NextResponse.json({ notifications: data ?? [] })
  } catch {
    return NextResponse.json({ notifications: [] })
  }
}

/* ── POST /api/notifications ── */
// Body: { user_id?, type, title, body, url? }
// Used by cron/weekly-digest and server-side events.
// Protected by CRON_SECRET header.
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret')
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    user_id?: string
    type?: string
    title?: string
    body?: string
    url?: string
  }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { user_id, type = 'system', title, body: notifBody, url } = body
  if (!title || !notifBody) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
  }

  try {
    const row = {
      user_id: user_id ?? null,
      type,
      title,
      body: notifBody,
      url: url ?? null,
      read: false,
      created_at: new Date().toISOString(),
    }
    const { error } = await getSupabase().from('notifications').insert(row)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
