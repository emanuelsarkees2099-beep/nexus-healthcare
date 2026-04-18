import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * Create a Supabase client for server-side operations (API routes, server components)
 * Uses the session token from cookies for authenticated requests
 */
export const createServerClient = async () => {
  const cookieStore = await cookies()

  return createClient<Database>(url, anonKey, {
    global: {
      headers: {
        'Authorization': `Bearer ${cookieStore.get('sb-access-token')?.value || ''}`,
      },
    },
  })
}

/**
 * Get the current authenticated user session
 */
export const getCurrentSession = async () => {
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}

/**
 * Get the current user with their profile
 */
export const getCurrentUser = async () => {
  const session = await getCurrentSession()
  if (!session) return null

  const supabase = await createServerClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return {
    id: session.user.id,
    email: session.user.email,
    ...profile,
  }
}

/**
 * Check if user is an admin
 */
export const isAdmin = async (userId: string) => {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', userId)
    .single()

  return data?.user_type === 'admin'
}

/**
 * Check if user is a provider
 */
export const isProvider = async (userId: string) => {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', userId)
    .single()

  return data?.user_type === 'provider'
}

/**
 * Create a user profile after signup
 */
export const createUserProfile = async (
  userId: string,
  email: string,
  fullName: string,
  phone: string,
  userType: 'patient' | 'provider' | 'admin'
) => {
  const supabase = await createServerClient()
  return supabase.from('user_profiles').insert({
    id: userId,
    email,
    full_name: fullName,
    phone,
    user_type: userType,
  })
}

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: {
    full_name?: string
    phone?: string
    user_type?: 'patient' | 'provider' | 'admin'
  }
) => {
  const supabase = await createServerClient()
  return supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
}

