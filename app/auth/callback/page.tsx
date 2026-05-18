'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClientClient } from '@/lib/auth-client'

/**
 * OAuth callback — client-side only.
 *
 * Handles both Supabase PKCE flow (?code=) and implicit flow (#access_token=).
 * Running in the browser gives the SDK access to localStorage (code_verifier)
 * and URL hash fragments, which a server route.ts cannot see.
 */
export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const supabase = createClientClient()

    const params = new URLSearchParams(window.location.search)
    const code   = params.get('code')
    const error  = params.get('error')

    // OAuth error returned (e.g. user denied access)
    if (error) {
      window.location.href = `/login?error=${encodeURIComponent(error)}`
      return
    }

    // PKCE flow — exchange the code using the code_verifier in localStorage
    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error: err }) => {
          if (err) {
            setErrorMsg(err.message)
            setStatus('error')
          } else {
            window.location.href = '/'
          }
        })
        .catch(err => {
          setErrorMsg(err instanceof Error ? err.message : 'Auth failed')
          setStatus('error')
        })
      return
    }

    // Implicit / hash flow — SDK auto-detects tokens from the URL hash.
    // Give it a moment to process, then check the session.
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        window.location.href = '/'
      } else {
        // Listen for the SIGNED_IN event the SDK fires after processing the hash
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
              subscription.unsubscribe()
              window.location.href = '/'
            }
          }
        )
        // If nothing fires after 4 s, give up
        setTimeout(() => {
          subscription.unsubscribe()
          window.location.href = '/login?error=auth_timeout'
        }, 4000)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#07070F', gap: '16px' }}>
        <p style={{ fontSize: '14px', color: '#f87171', fontFamily: 'inherit' }}>Sign-in failed: {errorMsg}</p>
        <a href="/login" style={{ fontSize: '13px', color: '#4a90d9', textDecoration: 'none' }}>← Back to sign in</a>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#07070F', gap: '16px' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(74,144,217,0.8)" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 0.9s linear infinite' }}>
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" />
        <path d="M12 2 A10 10 0 0 1 22 12" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </svg>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', fontFamily: 'inherit' }}>Completing sign in…</p>
    </div>
  )
}
