import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'
import { BookmarkSchema, badRequest } from '@/lib/validation'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.slice(7)
  if (!token) return null
  const { data } = await createClient(url, anonKey).auth.getUser(token)
  return data.user
}

// GET /api/bookmarks — list user's bookmarks
export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const getSupabaseClient = () => createClient(url, anonKey)
  const { data, error } = await getSupabaseClient()
    .from('saved_resources')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bookmarks: data })
}

// POST /api/bookmarks — add bookmark
export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 40, windowMs: 60_000, namespace: 'bookmarks' })
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: rl.headers })

  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = BookmarkSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return badRequest(parsed)
  const { resource_type, resource_id, resource_name, resource_data } = parsed.data

  const getSupabaseClient = () => createClient(url, anonKey)
  const { data, error } = await getSupabaseClient()
    .from('saved_resources')
    .upsert({
      user_id: user.id,
      resource_type,
      resource_id: String(resource_id),
      resource_name: resource_name ?? '',
      resource_data: resource_data ?? {},
    }, { onConflict: 'user_id,resource_type,resource_id' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}

// DELETE /api/bookmarks?resource_id=X&resource_type=Y — remove bookmark
export async function DELETE(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const resource_id = searchParams.get('resource_id')
  const resource_type = searchParams.get('resource_type')

  if (!resource_id || !resource_type) {
    return NextResponse.json({ error: 'resource_id and resource_type required' }, { status: 400 })
  }

  const getSupabaseClient = () => createClient(url, anonKey)
  const { error } = await getSupabaseClient()
    .from('saved_resources')
    .delete()
    .eq('user_id', user.id)
    .eq('resource_id', resource_id)
    .eq('resource_type', resource_type)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
