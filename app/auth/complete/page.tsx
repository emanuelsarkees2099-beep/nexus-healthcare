'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClientClient } from '@/lib/auth-client'

/**
 * Client-side OAuth completion page.
 *
 * The server /auth/callback route forwards the OAuth code here so we can call
 * supabase.auth.exchangeCodeForSession() in the browser — where the PKCE
 * code_verifier is available in localStorage.
 */
export default function AuthCompletePage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const code  = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      setErrorMsg(error)
      setStatus('error')
      return
    }

    if (!code) {
      setErrorMsg('No authorization code received.')
      setStatus('error')
      return
    }

    const supabase = createClientClient()

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: err }) => {
        if (err) {
          setErrorMsg(err.message)
          setStatus('error')
        } else {
          // Full-page navigation so Nav re-reads the session from localStorage
          window.location.href = '/'
        }
      })
      .catch(err => {
        setErrorMsg(err instanceof Error ? err.message : 'Auth failed')
        setStatus('error')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── styles ── */
  const bg: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#07070F',
    gap: '16px',
  }

  const text: React.CSSProperties = {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'inherit',
  }

  if (status === 'error') {
    return (
      <div style={bg}>
        <p style={{ ...text, color: '#f87171' }}>Sign-in failed: {errorMsg}</p>
        <a
          href="/login"
          style={{ fontSize: '13px', color: '#4a90d9', textDecoration: 'none' }}
        >
          ← Back to sign in
        </a>
      </div>
    )
  }

  return (
    <div style={bg}>
      {/* Spinner */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(74,144,217,0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ animation: 'spin 0.9s linear infinite' }}
      >
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" />
        <path d="M12 2 A10 10 0 0 1 22 12" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </svg>
      <p style={text}>Completing sign in…</p>
    </div>
  )
}
