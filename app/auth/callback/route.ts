import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=No code', request.url))
  }

  try {
    const supabase = createClient(url, anonKey)

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !data.session) {
      return NextResponse.redirect(new URL('/login?error=Auth failed', request.url))
    }

    const { user, session } = data

    // Create or update profile
    await supabase.from('user_profiles').upsert({
      id: user.id,
      email: user.email ?? '',
      full_name: user.user_metadata?.full_name || 'User',
      user_type: 'patient',
    })

    const response = NextResponse.redirect(new URL('/dashboard', request.url))

    response.cookies.set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
    response.cookies.set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[CALLBACK]', err)
    return NextResponse.redirect(new URL('/login?error=Server error', request.url))
  }
}
