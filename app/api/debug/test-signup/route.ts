import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const supabase = createClient(url, anonKey)

    // Try to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: 'Test User', user_type: 'patient' }
      }
    })

    console.log('Signup result:', { userId: data.user?.id, error: error?.message })

    if (error) {
      return NextResponse.json({
        error: error.message,
        code: error.code
      }, { status: 400 })
    }

    // Try to insert profile
    const { error: profileError, data: profileData } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user?.id,
        email,
        full_name: 'Test User',
        user_type: 'patient'
      })
      .select()

    console.log('Profile insert:', {
      success: !profileError,
      error: profileError?.message,
      data: profileData
    })

    // Check what's in the table now
    const { data: allProfiles } = await supabase
      .from('user_profiles')
      .select('*')

    return NextResponse.json({
      signupSuccess: !error,
      userId: data.user?.id,
      profileInsertSuccess: !profileError,
      totalProfiles: allProfiles?.length || 0,
      allProfiles: allProfiles || []
    })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
