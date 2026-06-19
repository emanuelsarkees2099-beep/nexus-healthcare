/**
 * NEXUS — Password Update (completes reset flow)
 * POST /api/auth/update-password  { password: string }
 * Authorization: Bearer <recovery_access_token>
 *
 * Called by the /update-password page after the user clicks the reset email link.
 * Supabase sends the user to APP_URL/update-password with access_token in the URL hash —
 * the client-side page exchanges it for a session and passes the token here.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MIN_PW_LENGTH = 8

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
  }
  const token = authHeader.slice(7)

  let body: { password?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (password.length < MIN_PW_LENGTH) {
    return NextResponse.json({ error: `Password must be at least ${MIN_PW_LENGTH} characters` }, { status: 422 })
  }

  // Use service role to validate the recovery token and update the password
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  )

  // Validate the token and get the user identity
  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !userData.user) {
    return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 })
  }

  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
    userData.user.id,
    { password }
  )

  if (updateErr) {
    console.error('[update-password]', updateErr)
    return NextResponse.json({ error: 'Password update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
