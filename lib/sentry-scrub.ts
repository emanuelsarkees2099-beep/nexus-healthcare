/**
 * AXVO — Sentry PII scrubbing
 *
 * Defense in depth for an app that handles health-adjacent data: even with
 * autocapture/session-replay off, an error's message, breadcrumbs, or
 * request data can still carry an email, a symptom description someone
 * typed into triage, or a story submission's content. This strips known
 * sensitive shapes before an event ever leaves the browser/server.
 *
 * Not a substitute for not logging PHI in the first place — app code
 * should still avoid putting health details into error messages — this is
 * the safety net for what a caught exception's own text or a library's
 * internal error might otherwise carry.
 */
import type { ErrorEvent } from '@sentry/nextjs'

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g
const PHONE_RE = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g
// Same field-name list PostHog's sanitize_properties already strips —
// keep both scrubbers consistent.
const SENSITIVE_KEYS = new Set([
  'email', 'phone', 'name', 'full_name', 'password', 'ssn', 'dob',
  'notes', 'story', 'message', 'symptom', 'symptoms', 'zip', 'zip_code',
  'address', 'location',
])

function scrubString(value: string): string {
  return value.replace(EMAIL_RE, '[redacted-email]').replace(PHONE_RE, '[redacted-phone]')
}

function scrubValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === 'string') return scrubString(value)
  if (!value || typeof value !== 'object') return value
  if (seen.has(value)) return value
  seen.add(value)

  if (Array.isArray(value)) return value.map(v => scrubValue(v, seen))

  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      out[key] = '[redacted]'
    } else {
      out[key] = scrubValue(val, seen)
    }
  }
  return out
}

/** Pass as `beforeSend` in every Sentry.init() call (client/server/edge). */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.message) event.message = scrubString(event.message)

  if (event.exception?.values) {
    for (const ex of event.exception.values) {
      if (ex.value) ex.value = scrubString(ex.value)
    }
  }

  if (event.breadcrumbs) {
    for (const crumb of event.breadcrumbs) {
      if (crumb.message) crumb.message = scrubString(crumb.message)
      if (crumb.data) crumb.data = scrubValue(crumb.data) as Record<string, unknown>
    }
  }

  if (event.request) {
    // Never send cookies/headers at all — not worth scrubbing piecemeal.
    delete event.request.cookies
    delete event.request.headers
    if (event.request.data) event.request.data = scrubValue(event.request.data)
  }

  if (event.extra) event.extra = scrubValue(event.extra) as Record<string, unknown>
  if (event.contexts) event.contexts = scrubValue(event.contexts) as typeof event.contexts
  if (event.user) {
    // Keep the user id (useful for support/debugging), drop everything
    // else Sentry might have attached (email, ip_address, username).
    event.user = event.user.id ? { id: event.user.id } : undefined
  }

  return event
}
