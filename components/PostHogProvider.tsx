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

  /* ── Page-view on route change ──
   * Was reading (window as any).posthog here, but posthog.init() above
   * (called via ESM `import('posthog-js')`) never actually assigns itself
   * to window.posthog -- that global-assignment behavior only happens
   * with PostHog's classic <script> snippet loader, not the npm/ESM
   * import path this file uses. That meant window.posthog was always
   * undefined, so `ph?.capture?.(...)` silently no-op'd via optional
   * chaining on EVERY route change -- confirmed live: the script loads
   * and initializes fine, but zero pageviews were ever actually sent.
   * `posthog-js` caches a singleton internally, so re-importing it here
   * returns the same already-initialized instance from the effect above
   * -- this sidesteps the missing global entirely instead of trying to
   * remember to assign window.posthog somewhere. */
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
    import('posthog-js').then(({ default: posthog }) => {
      posthog.capture('$pageview', { $current_url: window.location.href })
    }).catch(() => { /* ignore */ })
  }, [pathname, searchParams])

  return null
}
