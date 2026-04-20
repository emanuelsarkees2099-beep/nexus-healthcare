import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    console.log('=== TEST AUTH FLOW ===')
    console.log('Email:', email)
    console.log('Password length:', password?.length)
    console.log('Full name:', fullName)

    const getSupabaseClient = () => createClient(url, anonKey)
    console.log('Supabase client created')

    // Try signup
    console.log('Attempting signup...')
    const { data: authData, error: signupError } = await getSupabaseClient().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })

    console.log('Signup result:', {
      userId: authData.user?.id,
      email: authData.user?.email,
      error: signupError?.message,
      errorCode: signupError?.status
    })

    if (signupError) {
      return NextResponse.json({
        success: false,
        error: signupError.message,
        errorCode: signupError.status,
        errorDetails: signupError
      }, { status: 400 })
    }

    // Try profile insert
    console.log('Creating profile...')
    const { error: profileError, data: profileData } = await getSupabaseClient()
      .from('user_profiles')
      .insert({
        id: authData.user!.id,
        email,
        full_name: fullName
      })
      .select()

    console.log('Profile result:', {
      success: !profileError,
      error: profileError?.message,
      data: profileData
    })

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      userId: authData.user?.id,
      profileCreated: !profileError
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('ERROR:', message, err)
    return NextResponse.json({
      success: false,
      error: message,
      type: err instanceof Error ? err.constructor.name : 'Unknown'
    }, { status: 500 })
  }
}
