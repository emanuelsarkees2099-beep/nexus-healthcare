import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, buildWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone, userType } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // One client per request (not a new instance per call)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    )

    const { data, error: authError } = await supabase.auth.signUp({ email, password })

    if (authError || !data.user) {
      return NextResponse.json({ error: authError?.message || 'Signup failed' }, { status: 400 })
    }

    const userId = data.user.id

    await supabase.from('user_profiles').upsert({
      id:        userId,
      email,
      full_name: fullName,
      phone:     phone || null,
      user_type: userType || 'patient',
    })

    // Welcome email — await so it runs before the function exits, but errors never block signup
    await sendEmail({ to: email, ...buildWelcomeEmail(fullName) }).catch(() => {})

    const response = NextResponse.json({ success: true })

    if (data.session) {
      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge:   60 * 60 * 24 * 365,
        path:     '/',
      }
      response.cookies.set('sb-access-token',  data.session.access_token,  cookieOpts)
      response.cookies.set('sb-refresh-token', data.session.refresh_token, cookieOpts)
    }

    return response
  } catch (err) {
    console.error('[SIGNUP]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
