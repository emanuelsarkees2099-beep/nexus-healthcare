import * as Sentry from '@sentry/nextjs'
import { scrubEvent } from '@/lib/sentry-scrub'

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION ?? 'axvo@dev',

    // Lower sample rate on server — API route errors are already caught
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0,

    // Defense in depth: API route errors can carry request bodies (a
    // triage symptom, a story submission) in their context — strip known
    // sensitive shapes before the event leaves the server.
    beforeSend: scrubEvent,

    ignoreErrors: [
      'Non-Error promise rejection captured',
      'NetworkError',
      'Failed to fetch',
    ],
  })
}
