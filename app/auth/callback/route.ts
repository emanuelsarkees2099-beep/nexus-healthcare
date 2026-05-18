import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth callback handler.
 *
 * Supabase PKCE flow stores the code_verifier in localStorage (browser-side).
 * exchangeCodeForSession MUST therefore be called by the browser SDK — not by a
 * server-side createClient() which has no access to localStorage.
 *
 * This route simply forwards the code (and any error) to the client-side
 * /auth/complete page, which finishes the exchange and sets the session in
 * localStorage so the rest of the app can read it.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, origin),
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=missing_code', origin),
    )
  }

  // Hand off to client-side page so the browser SDK can exchange the code
  // (it needs the PKCE code_verifier that was stored in localStorage)
  return NextResponse.redirect(
    new URL(`/auth/complete?code=${encodeURIComponent(code)}`, origin),
  )
}
