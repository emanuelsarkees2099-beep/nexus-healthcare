'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'
import { Eye, EyeSlash, InfoCircle, Sms, ShieldTick } from 'iconsax-react'

const Spinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2 A10 10 0 0 1 22 12" />
  </svg>
)

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

function friendlyError(raw: string): string {
  const r = raw.toLowerCase()
  if (r.includes('invalid login') || r.includes('invalid credentials')) return 'Incorrect email or password. Please try again.'
  if (r.includes('email not confirmed')) return 'Please confirm your email first — check your inbox.'
  if (r.includes('too many requests') || r.includes('rate limit')) return 'Too many attempts. Please wait a minute and try again.'
  if (r.includes('missing_code') || r.includes('no_code') || r.includes('no code')) return 'Google sign-in was cancelled. Please try again.'
  if (r.includes('access_denied')) return 'Google sign-in was denied. Please try again or use email/password.'
  if (r.includes('network') || r.includes('fetch')) return 'Connection error. Check your internet and try again.'
  return raw
}

function LoginPageInner() {
  const searchParams  = useSearchParams()
  const nextPath      = searchParams.get('next') ?? '/dashboard'
  const reason        = searchParams.get('reason')

  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPass,     setShowPass]     = useState(false)
  const [rememberMe,   setRememberMe]   = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [gLoading,     setGLoading]     = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [magicSent,    setMagicSent]    = useState(false)
  const [showMagic,    setShowMagic]    = useState(false)
  const [error,        setError]        = useState('')
  const [mounted,      setMounted]      = useState(false)
  const [focused,      setFocused]      = useState<string | null>(null)

  const emailRef = useRef<HTMLInputElement>(null)
  const supabase = createClientClient()

  useEffect(() => {
    setMounted(true)
    setTimeout(() => emailRef.current?.focus(), 400)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const e = params.get('error')
    if (e) {
      setError(friendlyError(decodeURIComponent(e)))
      window.history.replaceState({}, '', window.location.pathname + (nextPath !== '/dashboard' ? `?next=${encodeURIComponent(nextPath)}` : ''))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const safeNext = nextPath.startsWith('/') ? nextPath : '/dashboard'

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in both fields.'); return }
    setLoading(true); setError('')
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      window.location.href = safeNext
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : 'Sign in failed.'))
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGLoading(true); setError('')
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}` },
      })
      if (authError) throw authError
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : 'Google sign in failed.'))
      setGLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Enter your email address first.'); return }
    setMagicLoading(true); setError('')
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}` },
      })
      if (err) throw err
      setMagicSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send link.')
      setMagicLoading(false)
    }
  }

  if (!mounted) return null

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '12px 15px',
    background: focused === field ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${focused === field ? 'rgba(79,142,240,0.55)' : 'rgba(255,255,255,0.10)'}`,
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
    caretColor: '#4F8EF0',
    boxShadow: focused === field
      ? '0 0 0 3px rgba(79,142,240,0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
      : 'inset 0 1px 0 rgba(255,255,255,0.03)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  })

  const sessionReasonMsg =
    reason === 'timeout'         ? 'Your session expired after 30 minutes of inactivity — a HIPAA security requirement.' :
    reason === 'session_expired' ? 'Your session expired. Please sign in again.' :
    null

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', background: 'var(--bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-card { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .auth-google-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 11px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); border-radius: 10px; color: var(--text-2); font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease; margin-bottom: 18px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05); }
        .auth-google-btn:hover:not(:disabled) { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.17); transform: translateY(-1px); }
        .auth-google-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-submit-btn { width: 100%; padding: 13px 16px; background: var(--accent); color: #fff; border: none; border-radius: 10px; font-weight: 600; font-size: 14px; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px; position: relative; overflow: hidden; box-shadow: inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 14px rgba(79,142,240,0.35); transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; }
        .auth-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.24), 0 8px 24px rgba(79,142,240,0.45); background: #5a9fe6; }
        .auth-submit-btn:active:not(:disabled) { transform: scale(0.97); transition: transform 0.08s ease; }
        .magic-link-btn { background: none; border: none; font-size: 12px; color: var(--text-3); cursor: pointer; padding: 0; font-family: inherit; transition: color 0.15s; text-decoration: underline; text-underline-offset: 2px; }
        .magic-link-btn:hover { color: var(--accent); }
      `}</style>

      <div className="aurora-bg" aria-hidden="true"><div className="aurora-orb-3" /></div>
      <div aria-hidden="true" style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse at 50% 0%, rgba(79,142,240,0.10) 0%, transparent 65%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)', pointerEvents: 'none' }} />

      <div className="auth-card" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', textDecoration: 'none', marginBottom: '6px' }}>
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <path d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
              <path transform="rotate(120 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
              <path transform="rotate(240 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
              <circle cx="50" cy="50" r="5" fill="#4F8EF0" opacity="0.7"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: '13px', fontWeight: 400, letterSpacing: '0.42em', color: 'var(--text)', opacity: 0.90 }}>NEXUS</span>
          </Link>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', letterSpacing: '0.02em', margin: 0 }}>
            Free healthcare for everyone
          </p>
        </div>

        {/* Session expiry reason banner */}
        {sessionReasonMsg && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '9px',
            background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)',
            borderRadius: '9px', padding: '11px 13px', marginBottom: '16px',
            color: '#fbbf24', fontSize: '12px', lineHeight: '1.45',
          }}>
            <ShieldTick size={14} color="#fbbf24" variant="TwoTone" style={{ flexShrink: 0, marginTop: '1px' }} />
            {sessionReasonMsg}
          </div>
        )}

        {/* Magic link sent state */}
        {magicSent ? (
          <div style={{
            background: 'rgba(79,142,240,0.05)', border: '1px solid rgba(79,142,240,0.18)',
            borderRadius: '16px', padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)',
            animation: 'fadeUp 0.4s ease both',
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(79,142,240,0.1)', border: '1px solid rgba(79,142,240,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Sms size={28} color="var(--accent)" variant="TwoTone" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', lineHeight: '1.6', maxWidth: '280px', margin: '0 auto 20px' }}>
              We sent a sign-in link to <strong style={{ color: 'var(--text-2)' }}>{email}</strong>. Click it to sign in.
            </p>
            <button onClick={() => { setMagicSent(false); setShowMagic(false) }} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
              Use password instead
            </button>
          </div>

        ) : (
          <div style={{
            background: 'rgba(10,11,20,0.60)', backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px', padding: '32px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(79,142,240,0.04)',
          }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', letterSpacing: '-0.025em', fontFamily: 'var(--font-display)' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '26px', lineHeight: 1.5 }}>
              Sign in to access healthcare resources.
            </p>

            {error && (
              <div role="alert" style={{
                display: 'flex', alignItems: 'flex-start', gap: '9px',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)',
                borderRadius: '9px', padding: '11px 13px', marginBottom: '20px',
                color: '#f87171', fontSize: '13px', lineHeight: '1.45',
                animation: 'fadeUp 0.3s ease both',
              }}>
                <InfoCircle size={15} color="#f87171" variant="TwoTone" style={{ flexShrink: 0, marginTop: '1px' }} />
                {error}
              </div>
            )}

            {/* Google */}
            <button onClick={handleGoogleLogin} disabled={loading || gLoading} className="auth-google-btn"
              style={{ opacity: loading || gLoading ? 0.5 : 1 }} aria-label="Continue with Google">
              {gLoading ? <Spinner /> : <GoogleIcon />}
              {gLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Email / password form */}
            <form onSubmit={showMagic ? handleMagicLink : handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label htmlFor="login-email" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-3)', marginBottom: '7px', letterSpacing: '0.01em' }}>
                  Email address
                </label>
                <input id="login-email" ref={emailRef} type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  placeholder="you@example.com" style={inputStyle('email')}
                  disabled={loading || gLoading} autoComplete="email" />
              </div>

              {!showMagic && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                    <label htmlFor="login-password" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-3)', letterSpacing: '0.01em' }}>
                      Password
                    </label>
                    <Link href="/forgot-password" style={{ fontSize: '11px', color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
                      Forgot password?
                    </Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input id="login-password" type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                      placeholder="••••••••"
                      style={{ ...inputStyle('password'), paddingRight: '44px' }}
                      disabled={loading || gLoading} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '3px', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
                      {showPass ? <EyeSlash size={15} color="rgba(255,255,255,0.5)" variant="Linear" /> : <Eye size={15} color="rgba(255,255,255,0.5)" variant="Linear" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember me */}
              {!showMagic && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '-2px' }}>
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#4F8EF0', width: '13px', height: '13px', cursor: 'pointer' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>Keep me signed in</span>
                </label>
              )}

              <button type="submit"
                disabled={loading || gLoading || magicLoading}
                className="auth-submit-btn"
                style={{ opacity: loading || gLoading || magicLoading ? 0.65 : 1, cursor: loading || gLoading || magicLoading ? 'not-allowed' : 'pointer' }}>
                {(loading || magicLoading) && <Spinner />}
                {showMagic
                  ? (magicLoading ? 'Sending…' : 'Send sign-in link')
                  : (loading ? 'Signing in…' : 'Sign in')
                }
              </button>
            </form>

            {/* Magic link toggle */}
            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <button className="magic-link-btn"
                onClick={() => { setShowMagic(v => !v); setError('') }}>
                {showMagic ? 'Sign in with password instead' : 'Sign in with email link — no password needed'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {!magicSent && (
          <>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-3)', marginTop: '22px' }}>
              No account?{' '}
              <Link href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.80')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Create one free
              </Link>
            </p>
            {/* HIPAA trust bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-3)', opacity: 0.7 }}>
                <ShieldTick size={12} color="rgba(255,255,255,0.35)" variant="TwoTone" />
                HIPAA compliant
              </div>
              <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '10px' }}>·</span>
              <span style={{ fontSize: '11px', color: 'var(--text-3)', opacity: 0.7 }}>256-bit encrypted</span>
              <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '10px' }}>·</span>
              <span style={{ fontSize: '11px', color: 'var(--text-3)', opacity: 0.7 }}>Never shared without consent</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  )
}
