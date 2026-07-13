import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'
import { LoginSchema, badRequest } from '@/lib/validation'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function POST(request: NextRequest) {
  try {
    // Brute-force / credential-stuffing protection: 8 attempts per minute per IP
    const rl = rateLimit(request, { limit: 8, windowMs: 60_000, namespace: 'auth-login' })
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many attempts. Please wait a minute.' }, { status: 429, headers: rl.headers })
    }

    const parsed = LoginSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return badRequest(parsed)
    const { email, password } = parsed.data

    const getSupabaseClient = () => createClient(url, anonKey)

    const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password })

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
