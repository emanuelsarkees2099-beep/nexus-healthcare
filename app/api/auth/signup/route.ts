import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone, userType } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(url, anonKey)

    // 1. Sign up user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError || !data.user) {
      return NextResponse.json({ error: authError?.message || 'Signup failed' }, { status: 400 })
    }

    const userId = data.user.id

    // 2. Create profile (upsert to avoid duplicates)
    await supabase.from('user_profiles').upsert({
      id: userId,
      email,
      full_name: fullName,
      phone: phone || null,
      user_type: userType || 'patient',
    })

    // 3. Set cookies if session exists
    const response = NextResponse.json({ success: true })

    if (data.session) {
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
    }

    return response
  } catch (err) {
    console.error('[SIGNUP]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
