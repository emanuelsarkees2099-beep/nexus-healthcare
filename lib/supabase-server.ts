/**
 * I3 — Server-side Supabase client factory
 *
 * Centralises server Supabase client creation for all API routes and
 * server components. Two clients are available:
 *
 *   createSupabaseServerClient(cookieStore)
 *     → Cookie-scoped client (respects the calling user's session).
 *       Use in Server Components and API route handlers that need
 *       row-level security to apply per-user.
 *
 *   createSupabaseAdminClient()
 *     → Service-role client (bypasses RLS).
 *       Use only in trusted server-side code (cron jobs, admin routes).
 *       Never expose to the browser.
 *
 * pgBouncer / connection pooling:
 *   The supabase-js REST client does NOT use a persistent Postgres connection —
 *   it communicates over HTTP, so standard pgBouncer pooling does not apply.
 *
 *   If you add a direct Postgres client (Prisma, Drizzle, or `pg`), use the
 *   pooler connection string from your environment:
 *
 *     // prisma/schema.prisma (or drizzle config):
 *     url       = env("SUPABASE_DATABASE_URL")    // port 6543  (transaction mode)
 *     directUrl = env("SUPABASE_DIRECT_URL")       // port 5432  (for migrations)
 *
 *   See https://supabase.com/docs/guides/database/connecting-to-postgres
 *
 * Usage in an API route:
 *   import { createSupabaseServerClient } from '@/lib/supabase-server'
 *   import { cookies } from 'next/headers'
 *
 *   const cookieStore = cookies()
 *   const supabase    = createSupabaseServerClient(cookieStore)
 *   const { data }    = await supabase.from('clinics_cache').select('*')
 *
 * Usage in a Server Component:
 *   import { createSupabaseServerClient } from '@/lib/supabase-server'
 *   import { cookies } from 'next/headers'
 *
 *   export default async function Page() {
 *     const supabase = createSupabaseServerClient(cookies())
 *     const { data: { session } } = await supabase.auth.getSession()
 *     ...
 *   }
 */

import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/* ── Environment ───────────────────────────────────────────────── */
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL      ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SUPABASE_SRK      = process.env.SUPABASE_SERVICE_ROLE_KEY     ?? SUPABASE_ANON_KEY

/* ── Cookie store type compatible with next/headers ────────────── */
type ReadonlyCookieStore = {
  getAll(): Array<{ name: string; value: string }>
  setAll?(cookies: Array<{ name: string; value: string; options?: object }>): void
}

/**
 * Cookie-scoped server client — session follows the request cookie.
 * Pass `cookies()` from `next/headers` directly.
 */
export function createSupabaseServerClient(
  cookieStore: ReadonlyCookieStore,
): SupabaseClient<Database> {
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll:  () => cookieStore.getAll(),
      setAll:  cookieStore.setAll
        ? (cookies) => cookieStore.setAll!(cookies)
        : () => { /* read-only context — ignore */ },
    } satisfies CookieMethodsServer,
  })
}

/**
 * Service-role admin client — bypasses Row Level Security.
 * Use ONLY in trusted server-side contexts (cron jobs, migration scripts).
 * Never import this in a browser bundle or return its data directly to clients.
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> {
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_SRK, {
    cookies: { getAll: () => [], setAll: () => {} },
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  })
}

/**
 * Quick session helper — resolves the authenticated user from cookies.
 * Returns null if unauthenticated or on any error.
 *
 * Usage in Server Components:
 *   const user = await getServerUser(cookies())
 */
export async function getServerUser(cookieStore: ReadonlyCookieStore) {
  try {
    const supabase = createSupabaseServerClient(cookieStore)
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user ?? null
  } catch {
    return null
  }
}
