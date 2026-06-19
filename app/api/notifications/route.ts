import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── /api/notifications ─────────────────────────────────────────────────────
// GET   — list notifications for the authenticated user
// POST  — push a new notification (cron/server, protected by CRON_SECRET)
// PATCH — mark notifications as read

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
  if (!userId) return NextResponse.json({ notifications: [] })

  try {
    const { data, error } = await getSupabase()
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ notifications: [] })
    return NextResponse.json({ notifications: data ?? [] })
  } catch {
    return NextResponse.json({ notifications: [] })
  }
}

/* ── POST /api/notifications ── */
// Body: { user_id?, type, title, body, url? }
// Protected by CRON_SECRET.
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret')
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { user_id?: string; type?: string; title?: string; body?: string; url?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { user_id, type = 'system', title, body: notifBody, url } = body
  if (!title || !notifBody) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
  }

  try {
    const { error } = await getSupabase().from('notifications').insert({
      user_id:    user_id ?? null,
      type,
      title,
      body:       notifBody,
      url:        url ?? null,
      read:       false,
      created_at: new Date().toISOString(),
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/* ── PATCH /api/notifications ── */
// Body: { ids?: string[], all?: boolean }
// Marks the given notification IDs (or all) as read for the authenticated user.
export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { ids?: unknown; all?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const all = body.all === true
  const ids = Array.isArray(body.ids) ? (body.ids as unknown[]).filter(id => typeof id === 'string') as string[] : []

  if (!all && ids.length === 0) {
    return NextResponse.json({ error: 'Provide ids[] or all:true' }, { status: 400 })
  }

  try {
    let query = getSupabase()
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)

    if (!all) query = query.in('id', ids)

    const { error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
