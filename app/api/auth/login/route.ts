import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const supabase = createClient(url, anonKey)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[LOGIN]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
