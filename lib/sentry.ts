/**
 * I1 — Sentry error tracking integration
 *
 * Lightweight wrapper that conditionally initialises Sentry only when
 * NEXT_PUBLIC_SENTRY_DSN is set. This keeps local dev and OSS forks clean
 * without needing the full @sentry/nextjs package installed.
 *
 * Usage:
 *   // In app/layout.tsx (server component, runs once per request):
 *   import '@/lib/sentry'
 *
 *   // To capture a specific error anywhere:
 *   import { captureError } from '@/lib/sentry'
 *   captureError(new Error('Something went wrong'), { userId, context: 'triage' })
 *
 *   // To log a breadcrumb (low-level event):
 *   import { addBreadcrumb } from '@/lib/sentry'
 *   addBreadcrumb({ message: 'User searched for clinics', data: { q } })
 *
 * When @sentry/nextjs is installed, swap the dynamic import below for:
 *   import * as Sentry from '@sentry/nextjs'
 */

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? ''

/* ── Lazy Sentry loader ── */
let sentryModule: typeof import('@sentry/nextjs') | null = null

async function getSentry() {
  if (!DSN) return null
  if (sentryModule) return sentryModule
  try {
    sentryModule = await import('@sentry/nextjs')
    return sentryModule
  } catch {
    /* @sentry/nextjs not installed — graceful no-op */
    return null
  }
}

/* ── Public API ── */

/**
 * Capture an exception and optionally tag it with context.
 */
export async function captureError(
  error: unknown,
  context?: Record<string, unknown>
): Promise<void> {
  const Sentry = await getSentry()
  if (!Sentry) {
    /* Fallback: log to console in all environments so errors aren't silently swallowed */
    console.error('[NEXUS Error]', error, context)
    return
  }
  Sentry.withScope(scope => {
    if (context) {
      Object.entries(context).forEach(([key, val]) => scope.setExtra(key, val))
    }
    Sentry.captureException(error)
  })
}

/**
 * Add a low-noise breadcrumb for debugging.
 */
export async function addBreadcrumb(crumb: {
  message: string
  category?: string
  level?: 'debug' | 'info' | 'warning' | 'error'
  data?: Record<string, unknown>
}): Promise<void> {
  const Sentry = await getSentry()
  if (!Sentry) return
  Sentry.addBreadcrumb({
    message:  crumb.message,
    category: crumb.category ?? 'nexus',
    level:    crumb.level    ?? 'info',
    data:     crumb.data,
  })
}

/**
 * Set the active user for Sentry context.
 * Call after successful authentication.
 */
export async function setSentryUser(user: {
  id?: string
  email?: string
  user_type?: string
} | null): Promise<void> {
  const Sentry = await getSentry()
  if (!Sentry) return
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email ?? undefined, user_type: user.user_type ?? undefined })
  } else {
    Sentry.setUser(null)
  }
}

/**
 * Initialise Sentry client-side. Call once at app startup.
 * No-op if DSN is not configured.
 */
export async function initSentry(): Promise<void> {
  const Sentry = await getSentry()
  if (!Sentry || !DSN) return
  Sentry.init({
    dsn: DSN,
    environment:       process.env.NEXT_PUBLIC_SENTRY_ENV  ?? process.env.NODE_ENV,
    release:           process.env.NEXT_PUBLIC_APP_VERSION ?? 'nexus@dev',
    tracesSampleRate:  process.env.NODE_ENV === 'production' ? 0.15 : 0,
    replaysSessionSampleRate:    0,
    replaysOnErrorSampleRate:    process.env.NODE_ENV === 'production' ? 0.5 : 0,
    /* Ignore common noise */
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      'ChunkLoadError',
      'NetworkError',
      'Failed to fetch',
      'Load failed',
    ],
    beforeSend(event) {
      /* Strip PII from breadcrumb URLs */
      if (event.breadcrumbs?.values) {
        event.breadcrumbs.values = event.breadcrumbs.values.map(b => ({
          ...b,
          data: b.data
            ? Object.fromEntries(
                Object.entries(b.data).filter(([k]) => !['email', 'phone', 'name', 'password'].includes(k))
              )
            : b.data,
        }))
      }
      return event
    },
  })
}
