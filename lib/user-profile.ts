import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Ensure a user_profiles row exists for this authenticated user.
 *
 * Shared by every place a session first becomes real:
 *   - app/auth/callback/page.tsx  (Google OAuth, browser-side, RLS-scoped client)
 *   - app/auth/confirm/route.ts   (email link confirm — signup, magic link;
 *                                  server-side, service-role client)
 *
 * Same upsert shape either way, only the client (and therefore whether RLS
 * applies) differs. Callers are expected to wrap this in their own
 * try/catch — a failure here should never block sign-in.
 */
export async function ensureUserProfile(supabase: SupabaseClient<Database>, user: User) {
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  if (existing) return

  await supabase.from('user_profiles').upsert({
    id:        user.id,
    email:     user.email ?? '',
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null,
    user_type: user.user_metadata?.user_type || 'patient',
  })
}
