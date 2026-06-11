import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createServerClient = async () => {
  const cookieStore = await cookies()

  return createSSRServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component — session refresh handled by middleware.
        }
      },
    },
  })
}

export const getCurrentSession = async () => {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getCurrentUser = async () => {
  const user = await getCurrentSession()
  if (!user) return null

  const supabase = await createServerClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { id: user.id, email: user.email, ...profile }
}

export const isAdmin = async (userId: string) => {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', userId)
    .single()
  return data?.user_type === 'admin' || data?.user_type === 'super_admin'
}

export const isProvider = async (userId: string) => {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', userId)
    .single()
  return data?.user_type === 'provider'
}

export const createUserProfile = async (
  userId: string,
  email: string,
  userType: 'patient' | 'provider'
) => {
  const supabase = await createServerClient()
  return supabase.from('user_profiles').insert({
    id: userId,
    email,
    user_type: userType,
  })
}

export const updateUserProfile = async (
  userId: string,
  updates: {
    full_name?: string
    phone?: string
    user_type?: 'patient' | 'provider' | 'admin' | 'super_admin'
  }
) => {
  const supabase = await createServerClient()
  return supabase.from('user_profiles').update(updates).eq('id', userId)
}
