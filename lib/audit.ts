/**
 * AXVO — Audit logging for access to someone else's data
 *
 * Server-only. Logs the "who touched someone else's PHI" cases HIPAA's
 * Security Rule expects audit controls for: an admin viewing a
 * submission, changing its status, or an account being deleted. Does NOT
 * log routine self-service access (a user reading their own dashboard) --
 * that's not the scope this exists for, and logging it would just be
 * noise on top of the real signal.
 *
 * Fire-and-forget by design: a logging failure should never block or
 * fail the actual request it's describing.
 *
 * Usage:
 *   import { logAudit } from '@/lib/audit'
 *   await logAudit({
 *     actorId: session.user.id, actorEmail: session.user.email,
 *     action: 'submission.view', resourceType: 'submission',
 *     resourceId: submission.id, targetUserId: submission.user_id,
 *   })
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

interface AuditEntry {
  actorId?: string | null
  actorEmail?: string | null
  action: string
  resourceType: string
  resourceId?: string | null
  targetUserId?: string | null
  metadata?: Record<string, unknown>
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  if (!serviceRoleKey) {
    console.warn('[Audit] SUPABASE_SERVICE_ROLE_KEY not set -- skipping audit log:', entry.action)
    return
  }
  try {
    const supabase = createClient(url, serviceRoleKey)
    const { error } = await supabase.from('audit_log').insert({
      actor_id:       entry.actorId ?? null,
      actor_email:    entry.actorEmail ?? null,
      action:         entry.action,
      resource_type:  entry.resourceType,
      resource_id:    entry.resourceId ?? null,
      target_user_id: entry.targetUserId ?? null,
      metadata:       entry.metadata ?? {},
    })
    if (error) console.error('[Audit] insert failed:', error.message)
  } catch (err) {
    console.error('[Audit] logAudit threw:', err)
  }
}
