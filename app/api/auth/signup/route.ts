import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, buildWelcomeEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { SignupSchema, badRequest } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Abuse protection: 5 account creations per hour per IP
    const rl = rateLimit(request, { limit: 5, windowMs: 3_600_000, namespace: 'auth-signup' })
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many signups. Please try again later.' }, { status: 429, headers: rl.headers })
    }

    const parsed = SignupSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return badRequest(parsed)
    const { email, password, fullName, phone, userType } = parsed.data

    // Self-service signup may never mint a privileged account
    const safeUserType = userType === 'admin' || userType === 'provider' ? 'patient' : (userType ?? 'patient')

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
      user_type: safeUserType,
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
