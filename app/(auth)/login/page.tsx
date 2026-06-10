'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'
import { Eye, EyeSlash, InfoCircle } from 'iconsax-react'

/* ── Spinner — no iconsax equivalent; keep as SVG ── */
const Spinner = () => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
  >
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
  if (r.includes('invalid login') || r.includes('invalid credentials')) return 'Incorrect email or password. Double-check and try again.'
  if (r.includes('email not confirmed')) return 'Please confirm your email first — check your inbox.'
  if (r.includes('too many requests') || r.includes('rate limit')) return 'Too many attempts. Please wait a minute and try again.'
  if (r.includes('missing_code') || r.includes('no_code') || r.includes('no code')) return 'Google sign-in was cancelled. Please try again.'
  if (r.includes('access_denied')) return 'Google sign-in was denied. Please try again or use email/password.'
  if (r.includes('network') || r.includes('fetch')) return 'Connection error. Check your internet and try again.'
  return raw
}

/* ─────────────────────────────── component ───────────────────────────────── */

export default function LoginPage() {
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPass,     setShowPass]     = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [gLoading,     setGLoading]     = useState(false)
  const [error,        setError]        = useState('')
  const [mounted,      setMounted]      = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const supabase = createClientClient()
  const emailRef = useRef<HTMLInputElement>(null)

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
      window.history.replaceState({}, '', '/login')
    }
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in both fields.'); return }
    setLoading(true); setError('')
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      window.location.href = '/'
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
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (authError) throw authError
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : 'Google sign in failed.'))
      setGLoading(false)
    }
  }

  if (!mounted) return null

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '12px 15px',
    background: focusedField === field ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${focusedField === field ? 'rgba(79,142,240,0.55)' : 'rgba(255,255,255,0.10)'}`,
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
    caretColor: '#4F8EF0',
    boxShadow: focusedField === field
      ? '0 0 0 3px rgba(79,142,240,0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
      : 'inset 0 1px 0 rgba(255,255,255,0.03)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  })

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-card {
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .auth-google-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 11px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 10px;
          color: var(--text-2);
          font-size: 14px; font-weight: 500; font-family: inherit;
          cursor: pointer;
          transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
          margin-bottom: 18px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .auth-google-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.17);
          transform: translateY(-1px);
        }
        .auth-google-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-submit-btn {
          width: 100%;
          padding: 13px 16px;
          background: var(--accent);
          color: #fff; border: none;
          border-radius: 10px;
          font-weight: 600; font-size: 14px; font-family: inherit;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 4px;
          position: relative; overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 14px rgba(79,142,240,0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .auth-submit-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%);
          transform: translateX(-100%) skewX(-15deg);
          animation: btn-shimmer-sweep 4s ease infinite;
          animation-delay: 2s;
          pointer-events: none;
        }
        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.24), 0 8px 24px rgba(79,142,240,0.45);
          background: #5a9fe6;
        }
        .auth-submit-btn:active:not(:disabled) {
          transform: scale(0.97);
          transition: transform 0.08s ease;
        }
      `}</style>

      {/* Aurora background */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-orb-3" />
      </div>

      {/* Top glow bloom */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '400px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(79,142,240,0.10) 0%, transparent 65%)',
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      {/* Dot grid */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
        pointerEvents: 'none',
      }} />

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

        {/* Glass card */}
        <div style={{
          background: 'rgba(10,11,20,0.60)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(79,142,240,0.04)',
        }}>
          <h1 style={{
            fontSize: '22px', fontWeight: 700,
            color: 'var(--text)', marginBottom: '4px',
            letterSpacing: '-0.025em',
            fontFamily: 'var(--font-display)',
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '26px', lineHeight: 1.5 }}>
            Sign in to access healthcare resources.
          </p>

          {/* Error banner */}
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

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading || gLoading}
            className="auth-google-btn"
            style={{ opacity: loading || gLoading ? 0.5 : 1 }}
            aria-label="Continue with Google"
          >
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
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label htmlFor="login-email" style={{
                display: 'block', fontSize: '12px', fontWeight: 500,
                color: 'var(--text-3)', marginBottom: '7px', letterSpacing: '0.01em',
              }}>
                Email address
              </label>
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                style={inputStyle('email')}
                disabled={loading || gLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                <label htmlFor="login-password" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-3)', letterSpacing: '0.01em' }}>
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  style={{ fontSize: '11px', color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  style={{ ...inputStyle('password'), paddingRight: '44px' }}
                  disabled={loading || gLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-3)', padding: '3px', display: 'flex', alignItems: 'center',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass
                    ? <EyeSlash size={15} color="rgba(255,255,255,0.5)" variant="Linear" />
                    : <Eye      size={15} color="rgba(255,255,255,0.5)" variant="Linear" />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || gLoading}
              className="auth-submit-btn"
              style={{ opacity: loading || gLoading ? 0.65 : 1, cursor: loading || gLoading ? 'not-allowed' : 'pointer' }}
            >
              {loading && <Spinner />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-3)', marginTop: '22px' }}>
          No account?{' '}
          <Link
            href="/signup"
            style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.80')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}
