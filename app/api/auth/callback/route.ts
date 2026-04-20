import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=No code provided', request.url))
  }

  try {
    const getSupabaseClient = () => createClient(url, anonKey)

    // Exchange code for session
    const { data, error: exchangeError } = await getSupabaseClient().auth.exchangeCodeForSession(code)

    if (exchangeError || !data.session) {
      return NextResponse.redirect(
        new URL('/login?error=Failed to exchange code', request.url)
      )
    }

    const { user, session } = data

    // Check if user profile already exists
    const { data: existingProfile } = await getSupabaseClient()
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // Create user profile if it doesn't exist (first-time OAuth login)
    if (!existingProfile) {
      const { error: profileError } = await getSupabaseClient()
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          phone: user.user_metadata?.phone || null,
          user_type: 'patient', // Default to patient for OAuth signups
        })

      if (profileError) {
        console.error('[AUTH] Failed to create user profile:', profileError)
        // Continue anyway - profile might have been created already
      }
    }

    // Set session cookies
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
    response.cookies.set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365,
    })

    return response
  } catch (err) {
    console.error('[AUTH] Callback error:', err)
    return NextResponse.redirect(new URL('/login?error=Authentication failed', request.url))
  }
}
