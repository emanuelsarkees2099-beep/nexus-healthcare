/**
 * P2 — NavShell: server-side Nav wrapper
 *
 * Reads the authenticated user from cookies on the server (zero round trips),
 * then passes it as `initialUser` to the client Nav component so the nav
 * renders the correct signed-in or signed-out state on first paint —
 * no more flash from "Sign In" to the user's name.
 *
 * Usage — replace <Nav /> with <NavShell /> in any Server Component or layout:
 *
 *   // app/some-page/layout.tsx  (server component — no 'use client')
 *   import NavShell from '@/components/NavShell'
 *   export default function Layout({ children }) {
 *     return (
 *       <>
 *         <NavShell />
 *         {children}
 *       </>
 *     )
 *   }
 *
 * The Nav itself remains 'use client' for its interactive behaviours
 * (scroll detection, drawer, GSAP, etc.).  NavShell is the thin server
 * wrapper that seeds the auth state.
 *
 * AppShell.tsx (which uses dynamic(() => import('./Nav'), { ssr: false }))
 * continues to work unchanged — the initialUser prop is undefined there,
 * so Nav falls back to its existing useEffect auth resolution.
 */

import { cookies } from 'next/headers'
import Nav         from '@/components/Nav'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function NavShell() {
  let initialUser: { full_name?: string | null; email?: string | null; user_type?: string | null } | null = null

  try {
    const cookieStore = await cookies()
    const supabase    = createSupabaseServerClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      /* Fetch profile fields used by the Nav (full_name, email, user_type) */
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, email, user_type')
        .eq('id', session.user.id)
        .single()

      initialUser = profile ?? { email: session.user.email ?? null }
    }
  } catch {
    /* Supabase not configured or session fetch failed — render signed-out Nav */
    initialUser = null
  }

  return <Nav initialUser={initialUser} />
}
