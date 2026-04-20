import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function GET() {
  try {
    const getSupabaseClient = () => createClient(url, anonKey)

    // Check user_profiles table
    const { data: profiles, error: profileError } = await getSupabaseClient()
      .from('user_profiles')
      .select('*')

    // Try to get current session (if any)
    const { data: sessionData } = await getSupabaseClient().auth.getSession()

    return NextResponse.json({
      profiles: profiles || [],
      profileCount: profiles?.length || 0,
      profileError: profileError?.message,
      session: sessionData?.session ? {
        user: sessionData.session.user.email,
        userId: sessionData.session.user.id,
      } : null,
    })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
