/**
 * AXVO — Email link confirmation (signup, magic link, password recovery)
 * GET /auth/confirm?token_hash=...&type=...&next=...
 *
 * WHY THIS EXISTS: the previous flow sent every email link (signup
 * confirmation, magic link, password reset) through app/auth/callback,
 * which calls exchangeCodeForSession(code) — Supabase's PKCE flow. PKCE
 * requires a "code verifier" secret that was stashed in the browser at the
 * moment the link was *requested*. That's fine for Google OAuth (the user
 * never leaves their browser), but an emailed link is routinely opened in
 * a different browser or device than the one used to sign up — a phone's
 * mail app, a work email client, Mailinator's own preview, etc. When that
 * happens the verifier simply isn't there, and Supabase throws exactly
 * the error a user reported here: "PKCE code verifier not found in
 * storage... This can happen if the auth flow was initiated in a
 * different browser or device." Confirmation never completes, no session
 * is ever created, and (since ensureUserProfile only ever runs after a
 * real session exists) no user_profiles row gets created either — both
 * symptoms reported were the same root cause.
 *
 * verifyOtp({ type, token_hash }) is Supabase's alternative for exactly
 * this case: the token_hash embedded in the link is self-contained proof
 * on its own, with nothing that needs to have been stored client-side
 * beforehand. It works from any browser or device.
 *
 * REQUIRED PAIRED CHANGE (Supabase Dashboard, cannot be done from code):
 * the "Confirm signup", "Magic Link", and "Reset Password" email templates
 * currently link to `{{ .ConfirmationURL }}`, which points at Supabase's
 * own hosted verify endpoint and comes back as a PKCE `?code=`. They need
 * to instead link directly here with a token hash, e.g. for Confirm signup:
 *
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next={{ .RedirectTo }}
 *
 * (type=signup / type=recovery / type=magiclink to match each template).
 * Until the dashboard templates are updated, this route is unused dead
 * code and the old failure mode continues.
 *
 * Google OAuth is untouched and still goes through app/auth/callback's
 * PKCE code exchange — that one's same-browser assumption is genuinely
 * safe, since the user never leaves the browser they started in.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { ensureUserProfile } from '@/lib/user-profile'

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL      ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * `next` comes from the email template's {{ .RedirectTo }}, which is
 * whatever absolute URL the app itself passed as emailRedirectTo/redirectTo
 * when the email was requested — not attacker-controlled, but validated
 * anyway (same pattern as the app's other post-auth redirects) so this
 * route can never be turned into an open redirect if that ever changes.
 */
function safeNext(request: NextRequest, raw: string | null): string {
  if (!raw) return '/dashboard'
  try {
    const url = new URL(raw, request.url)
    if (url.origin === request.nextUrl.origin) return url.pathname + url.search
  } catch { /* not parseable as a URL — fall through to the relative-path check below */ }
  return raw.startsWith('/') ? raw : '/dashboard'
}

function loginError(request: NextRequest, message: string) {
  const url = new URL('/login', request.url)
  url.searchParams.set('error', message)
  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type        = searchParams.get('type') as EmailOtpType | null
  const next        = safeNext(request, searchParams.get('next'))

  if (!token_hash || !type) {
    return loginError(request, 'This confirmation link is missing required information.')
  }

  const response = NextResponse.redirect(new URL(next, request.url))

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) =>
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    } satisfies CookieMethodsServer,
  })

  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })

  if (error || !data.user) {
    return loginError(request, error?.message || 'This link is invalid or has expired. Please request a new one.')
  }

  // Best-effort, service-role (bypasses RLS, same pattern used throughout
  // this app's other server routes) — a failure here shouldn't block sign-in.
  try {
    await ensureUserProfile(createSupabaseAdminClient(), data.user)
  } catch (err) {
    console.error('[auth/confirm] ensureUserProfile failed:', err)
  }

  return response
}
