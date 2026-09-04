/**
 * AXVO — Account deletion
 * POST /api/account/delete
 *
 * Requires the caller's own Bearer token — only ever deletes the
 * requesting user's own account, there is no admin-delete-someone-else
 * path here (that would be a different, more dangerous feature).
 *
 * "Delete" here means: remove personally-identifying rows outright
 * (profile, saved searches, push subscriptions), and anonymize --
 * rather than hard-delete -- their submissions/outcomes by clearing
 * user_id, so aggregate historical stats (the homepage's public counts,
 * program-enrollment tracking) don't silently corrupt, while the
 * personal linkage to this person is gone. Then the actual Supabase
 * Auth user is deleted, which is what actually ends their ability to
 * log in and is the core of the request.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logAudit } from '@/lib/audit'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.slice(7)

  const anonClient = createClient(url, anonKey)
  const { data: userData, error: userErr } = await anonClient.auth.getUser(token)
  if (userErr || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id: userId, email } = userData.user

  if (!serviceRoleKey) {
    console.error('[Account Delete] SUPABASE_SERVICE_ROLE_KEY not set')
    return NextResponse.json({ error: 'Deletion is not available right now. Please try again later.' }, { status: 503 })
  }

  const service = createClient(url, serviceRoleKey)

  // Best-effort cleanup — a failure on any one of these shouldn't stop the
  // rest, since the auth-user deletion below is what actually matters most.
  const results = await Promise.allSettled([
    service.from('user_profiles').delete().eq('id', userId),
    service.from('push_subscriptions').delete().eq('user_id', userId),
    // saved_searches is a real, distinct, user-scoped table (confirmed
    // live: accepts user_id, correctly RLS-protected) -- unrelated to the
    // bookmarks feature (app/api/bookmarks/route.ts queries a table called
    // 'saved_resources', which doesn't exist at all -- a separate,
    // unresolved bug, see conversation). Cleaned up here regardless, since
    // whatever it's for, it's still this user's data.
    service.from('saved_searches').delete().eq('user_id', userId),
    service.from('submissions').update({ user_id: null }).eq('user_id', userId),
    service.from('outcomes').update({ user_id: null }).eq('user_id', userId),
  ])
  const failures = results
    .map((r, i) => ({ r, table: ['user_profiles', 'push_subscriptions', 'saved_searches', 'submissions', 'outcomes'][i] }))
    .filter(x => x.r.status === 'rejected' || (x.r.status === 'fulfilled' && (x.r.value as { error?: unknown }).error))
  if (failures.length) {
    console.warn('[Account Delete] partial cleanup failure:', failures.map(f => f.table))
  }

  // The actual account removal — this is what ends the person's ability
  // to log in, which is the core of "delete my account".
  const { error: deleteErr } = await service.auth.admin.deleteUser(userId)
  if (deleteErr) {
    console.error('[Account Delete] auth.admin.deleteUser failed:', deleteErr)
    return NextResponse.json({ error: 'Failed to delete account. Please try again or contact support.' }, { status: 500 })
  }

  await logAudit({
    actorId:      userId,
    actorEmail:   email ?? null,
    action:       'account.delete',
    resourceType: 'user_profile',
    resourceId:   userId,
    targetUserId: userId,
    metadata:     { partialCleanupFailures: failures.map(f => f.table) },
  })

  return NextResponse.json({ ok: true })
}
