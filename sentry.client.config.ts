import * as Sentry from '@sentry/nextjs'
import { scrubEvent } from '@/lib/sentry-scrub'

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION ?? 'axvo@dev',

    // Capture 15% of transactions for performance monitoring in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.15 : 0,

    // No session replays, ever — replaysOnErrorSampleRate was previously
    // 0.5 in production, directly contradicting this comment. A replay is
    // a visual recording of what the user was doing, which for this app
    // can mean a triage symptom description or a story submission's
    // content actually being typed on screen — a much bigger leak surface
    // than an error message. Both must be 0.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Defense in depth: strip emails/phones/known-sensitive fields from
    // whatever an error's own message, breadcrumbs, or request data
    // happen to carry, before the event ever leaves the browser.
    beforeSend: scrubEvent,

    // Suppress common browser noise
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      'ChunkLoadError',
      'NetworkError',
      'Failed to fetch',
      'Load failed',
    ],
  })
}
