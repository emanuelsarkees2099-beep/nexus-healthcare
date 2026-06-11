'use client'
import { useEffect, useState } from 'react'
import { createClientClient } from '@/lib/auth-client'

/**
 * Redirect to /login if user is not authenticated.
 * Returns { loading, userId } so the page can gate its UI.
 *
 * Usage:
 *   const { loading, userId } = useRequireAuth()
 *   if (loading) return <LoadingSpinner />
 */
export function useRequireAuth() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClientClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`
        return
      }
      setUserId(session.user.id)
      setLoading(false)
    })
  }, [])

  return { loading, userId }
}
