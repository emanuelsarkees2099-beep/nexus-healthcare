import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * createBrowserClient() throws synchronously if its URL/key are missing —
 * and dozens of components call createClientClient() directly in the
 * render body (not inside useEffect), including AuthProvider, which wraps
 * every page via the root layout. That means a missing/misconfigured env
 * var doesn't just break auth — it crashes server-side rendering for the
 * ENTIRE app (confirmed: builds without secrets fail on every page that
 * gets statically prerendered).
 *
 * Fall back to harmless placeholder values instead of throwing, mirroring
 * the "no-op when unconfigured" pattern already used for Sentry/PostHog.
 * These placeholders are never hit with real traffic — Vercel production
 * always has the real keys — this only prevents a missing env var from
 * taking down the whole app instead of just breaking auth.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const createClientClient = () => {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return supabaseClient
}
