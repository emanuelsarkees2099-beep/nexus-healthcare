'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClientClient } from '@/lib/auth-client'

interface AuthContextValue {
  user:     User | null
  session:  Session | null
  loading:  boolean
  signOut:  () => Promise<void>
  signOutAll: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user:       null,
  session:    null,
  loading:    true,
  signOut:    async () => {},
  signOutAll: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClientClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [supabase])

  const signOutAll = useCallback(async () => {
    await supabase.auth.signOut({ scope: 'global' })
    window.location.href = '/login'
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signOutAll }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
