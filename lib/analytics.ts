/**
 * Analytics wrapper — PostHog (privacy-focused, HIPAA-friendly).
 * No-op if NEXT_PUBLIC_POSTHOG_KEY is not set.
 *
 * Setup (one-time, ~5 min):
 *   1. Create a free account at posthog.com (1M events/month free)
 *   2. Create a project → copy the Project API Key (starts with phc_)
 *   3. Add to Vercel env vars:
 *        NEXT_PUBLIC_POSTHOG_KEY  = phc_xxxxxxxxxxxx
 *        NEXT_PUBLIC_POSTHOG_HOST = https://us.i.posthog.com
 *   4. Redeploy
 */

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  // Same fix as components/PostHogProvider.tsx: posthog.init() via the
  // ESM `import('posthog-js')` path never assigns itself to window.posthog
  // (that only happens with PostHog's classic <script> snippet loader) --
  // reading (window as any).posthog here was always undefined, so every
  // call to track.* below has been silently no-op'ing. posthog-js caches
  // a singleton internally, so re-importing it returns the already-
  // initialized instance instead.
  import('posthog-js').then(({ default: ph }) => {
    try { ph.capture(name, properties) } catch { /* silently ignore */ }
  }).catch(() => { /* ignore */ })
}

/** Pre-typed wrappers for the 7 key product events */
export const track = {
  searchPerformed:    (query: string, location: string) =>
    trackEvent('search_performed',    { query, location }),

  clinicSaved:        (clinicId: string, clinicName: string) =>
    trackEvent('clinic_saved',        { clinic_id: clinicId, clinic_name: clinicName }),

  triageCompleted:    (symptoms: string) =>
    trackEvent('triage_completed',    { symptoms }),

  eligibilityChecked: (programs: string[]) =>
    trackEvent('eligibility_checked', { programs }),

  crisisPageViewed:   () =>
    trackEvent('crisis_page_viewed'),

  signupCompleted:    (method: 'email' | 'google') =>
    trackEvent('signup_completed',    { method }),

  loginCompleted:     (method: 'email' | 'google') =>
    trackEvent('login_completed',     { method }),
}
