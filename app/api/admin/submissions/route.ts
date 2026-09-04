/**
 * AXVO — Admin submissions access
 * GET   /api/admin/submissions        — list (audit-logged)
 * PATCH /api/admin/submissions/:id    — update status (audit-logged), via body { id, status }
 *
 * Moved out of app/admin/page.tsx's direct client-side Supabase calls for
 * two reasons:
 *   1. Audit logging (lib/audit.ts) needs the service-role key, which can
 *      never be shipped to the browser -- this has to be a server route.
 *   2. As a side effect, this also fixes a pre-existing bug: the old
 *      client-side query embedded a user_profiles join, but user_profiles
 *      SELECT is RLS'd to auth.uid() = id (self only) -- so that join
 *      silently returned null for every submission not authored by the
 *      currently-logged-in admin. Reading via the service role bypasses
 *      that entirely.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logAudit } from '@/lib/audit'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

/** Verify the request's Bearer token belongs to an actual admin. Returns
 *  the caller's { id, email } on success, or null. */
async function requireAdmin(req: NextRequest): Promise<{ id: string; email: string | null } | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)

  const anonClient = createClient(url, anonKey)
  const { data, error } = await anonClient.auth.getUser(token)
  if (error || !data.user) return null

  const userType = (data.user.app_metadata as Record<string, unknown> | undefined)?.user_type
  if (userType !== 'admin' && userType !== 'super_admin') return null

  return { id: data.user.id, email: data.user.email ?? null }
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const service = createClient(url, serviceRoleKey)
  const { data, error } = await service
    .from('submissions')
    .select(`*, user_profiles (full_name, email, user_type)`)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 })
  }

  await logAudit({
    actorId:      admin.id,
    actorEmail:   admin.email,
    action:       'submission.list_view',
    resourceType: 'submission',
    metadata:     { count: data?.length ?? 0 },
  })

  return NextResponse.json({ submissions: data ?? [] })
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null) as { id?: string; status?: string } | null
  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
  }

  const service = createClient(url, serviceRoleKey)

  const { data: before } = await service
    .from('submissions')
    .select('status, user_id')
    .eq('id', body.id)
    .single()

  const { error } = await service
    .from('submissions')
    .update({ status: body.status })
    .eq('id', body.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }

  await logAudit({
    actorId:       admin.id,
    actorEmail:    admin.email,
    action:        'submission.status_change',
    resourceType:  'submission',
    resourceId:    body.id,
    targetUserId:  before?.user_id ?? null,
    metadata:      { from: before?.status ?? null, to: body.status },
  })

  return NextResponse.json({ ok: true })
}
