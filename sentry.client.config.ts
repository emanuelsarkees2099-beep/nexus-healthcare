import * as Sentry from '@sentry/nextjs'

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION ?? 'nexus@dev',

    // Capture 15% of transactions for performance monitoring in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.15 : 0,

    // No session replays — HIPAA caution
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 0,

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

    beforeSend(event) {
      // Strip PII from breadcrumb data before sending
      if (event.breadcrumbs?.values) {
        event.breadcrumbs.values = event.breadcrumbs.values.map(b => ({
          ...b,
          data: b.data
            ? Object.fromEntries(
                Object.entries(b.data).filter(
                  ([k]) => !['email', 'phone', 'name', 'password', 'ssn', 'dob'].includes(k)
                )
              )
            : b.data,
        }))
      }
      return event
    },
  })
}
