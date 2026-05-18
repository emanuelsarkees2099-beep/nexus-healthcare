'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Initialises PostHog once and fires a $pageview on every route change.
 * Loaded ssr:false via GlobalClientComponents so it never runs server-side.
 *
 * Privacy settings:
 * - autocapture OFF (no automatic click/form tracking — HIPAA caution)
 * - session recording OFF (no screen replay of health-related data)
 * - PII sanitiser strips email/phone/name from any property bag
 */
export default function PostHogProvider() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  /* ── Init once on mount ── */
  useEffect(() => {
    const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
    if (!key) return

    import('posthog-js').then(({ default: posthog }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((posthog as any).__loaded) return
      posthog.init(key, {
        api_host:                  host,
        capture_pageview:          false, // fired manually below to avoid double-count
        capture_pageleave:         true,
        autocapture:               false,
        persistence:               'localStorage',
        disable_session_recording: true,
        // Strip accidental PII from every event
        sanitize_properties(props: Record<string, unknown>) {
          const clean = { ...props }
          for (const k of ['email', 'phone', 'name', 'password', 'ssn', 'dob']) {
            delete clean[k]
          }
          return clean
        },
      })
    })
  }, [])

  /* ── Page-view on route change ── */
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || typeof window === 'undefined') return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ph = (window as any).posthog
      ph?.capture?.('$pageview', { $current_url: window.location.href })
    } catch { /* ignore */ }
  }, [pathname, searchParams])

  return null
}
