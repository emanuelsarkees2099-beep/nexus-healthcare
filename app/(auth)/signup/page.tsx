'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Eye, EyeSlash, InfoCircle, Sms, TickCircle } from 'iconsax-react'

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

/* ──────────────────────── password strength helper ──────────────────────── */

function pwStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak',   color: '#f87171' }
  if (score <= 3) return { score, label: 'Fair',   color: '#fbbf24' }
  return              { score, label: 'Strong', color: '#34d399' }
}

/* ────────────────────────────── types ───────────────────────────────────── */

type UserType = 'patient' | 'provider' | 'admin'

/* ─────────────────────────────── component ───────────────────────────────── */

export default function SignupPage() {
  const router = useRouter()

  const [fullName,      setFullName]      = useState('')
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [confirmPass,   setConfirmPass]   = useState('')
  const [phone,         setPhone]         = useState('')
  const [userType,      setUserType]      = useState<UserType>('patient')
  const [showPass,      setShowPass]      = useState(false)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [gLoading,      setGLoading]      = useState(false)
  const [error,         setError]         = useState('')
  const [success,       setSuccess]       = useState(false)
  const [needsConfirm,  setNeedsConfirm]  = useState(false)
  const [mounted,       setMounted]       = useState(false)
  const [focusedField,  setFocusedField]  = useState<string | null>(null)

  const supabase = createClientClient()
  const strength = pwStrength(password)

  useEffect(() => { setMounted(true) }, [])

  const handleGoogleSignup = async () => {
    setGLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (err) throw err
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign up failed.')
      setGLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password || !confirmPass) {
      setError('Please fill in all required fields.')
      return
    }
    if (password !== confirmPass) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError
      if (!authData.user) throw new Error('Signup failed — no user returned.')

      await supabase.from('user_profiles').upsert({
        id:        authData.user.id,
        email,
        full_name: fullName,
        phone:     phone || null,
        user_type: userType,
      })

      if (authData.session) {
        // Email confirmation is disabled — user is immediately logged in
        setSuccess(true)
        setTimeout(() => { window.location.href = '/' }, 1600)
      } else {
        // Email confirmation is required — tell the user to check inbox
        setNeedsConfirm(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed.')
      setLoading(false)
    }
  }

  if (!mounted) return null

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '11px 14px',
    background: focusedField === field ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${focusedField === field ? 'rgba(74,144,217,0.45)' : 'rgba(255,255,255,0.09)'}`,
    borderRadius: '10px',
    color: '#e8edf2',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    caretColor: '#4a90d9',
    transition: 'border-color 0.18s, background 0.18s',
  })

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-card { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .success-card { animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .auth-btn-primary:hover:not(:disabled) {
          background: #5a9fe6 !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(79,142,240,0.32);
        }
        .auth-btn-primary:active:not(:disabled) { transform: scale(0.97) !important; }
        .auth-btn-google:hover:not(:disabled) {
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(255,255,255,0.18) !important;
          transform: translateY(-1px);
        }
        .role-chip:hover { opacity: 0.85; }
      `}</style>

      {/* Aurora background */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-orb-3" />
      </div>

      {/* Dot grid */}
      <div aria-hidden="true" className="dot-grid dot-grid--fade" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
      }} />

      {/* Top glow bloom */}
      <div style={{
        position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '400px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(79,142,240,0.10) 0%, transparent 65%)',
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div className="auth-card" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', marginBottom: '6px' }}>
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
              <path d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4a90d9" opacity="0.95"/>
              <path transform="rotate(120 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4a90d9" opacity="0.95"/>
              <path transform="rotate(240 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4a90d9" opacity="0.95"/>
              <circle cx="50" cy="50" r="5" fill="#4a90d9" opacity="0.7"/>
            </svg>
            <span style={{
              fontFamily: 'var(--font-orbitron, monospace)',
              fontSize: '13px', fontWeight: 400,
              letterSpacing: '0.42em', color: 'rgba(255,255,255,0.88)',
            }}>NEXUS</span>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.02em', margin: 0 }}>
            Free healthcare resources for everyone
          </p>
        </div>

        {/* ── Confirm email state ── */}
        {needsConfirm ? (
          <div className="success-card" style={{
            background: 'rgba(74,144,217,0.05)',
            border: '1px solid rgba(74,144,217,0.18)',
            borderRadius: '16px',
            padding: '48px 32px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Sms size={28} color="#4a90d9" variant="TwoTone" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', lineHeight: '1.6', maxWidth: '280px', margin: '0 auto 20px' }}>
              We sent a confirmation link to <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{email}</strong>. Click it to activate your account, then sign in.
            </p>
            <a href="/login" style={{ display: 'inline-block', padding: '10px 20px', background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.3)', borderRadius: '9px', color: '#4a90d9', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
              Go to sign in
            </a>
          </div>

        ) : success ? (
          <div className="success-card" style={{
            background: 'rgba(52,211,153,0.05)',
            border: '1px solid rgba(52,211,153,0.18)',
            borderRadius: '16px',
            padding: '48px 32px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <TickCircle size={36} color="#34d399" variant="TwoTone" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Account created!
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', marginBottom: '0' }}>
              Welcome to NEXUS. Taking you home…
            </p>
          </div>
        ) : (

        /* ── Signup form ── */
        <div style={{
          background: 'rgba(10,11,20,0.60)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Create account
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '26px' }}>
            Join thousands accessing free care.
          </p>

          {/* Error banner */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '9px',
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.22)',
              borderRadius: '9px', padding: '11px 13px',
              marginBottom: '20px', color: '#f87171', fontSize: '13px',
            }}>
              <InfoCircle size={15} color="#f87171" variant="TwoTone" style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Google CTA */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading || gLoading}
            className="auth-btn-google"
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '11px 16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.11)',
              borderRadius: '10px',
              color: '#e0e6ed', fontSize: '14px', fontWeight: 500, fontFamily: 'inherit',
              cursor: loading || gLoading ? 'not-allowed' : 'pointer',
              opacity: loading || gLoading ? 0.55 : 1,
              transition: 'all 0.18s',
              marginBottom: '16px',
            }}
          >
            {gLoading ? <Spinner /> : <GoogleIcon />}
            {gLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

            {/* Full name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: '6px' }}>
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => { setFullName(e.target.value); setError('') }}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="Maria Garcia"
                style={inputStyle('name')}
                disabled={loading}
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                style={inputStyle('email')}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Min. 6 characters"
                  style={{ ...inputStyle('password'), paddingRight: '44px' }}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', padding: '2px',
                    display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                  tabIndex={-1}
                >
                  {showPass
                    ? <EyeSlash size={16} color="rgba(255,255,255,0.5)" variant="Linear" />
                    : <Eye      size={16} color="rgba(255,255,255,0.5)" variant="Linear" />
                  }
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(strength.score / 5) * 100}%`,
                      background: strength.color,
                      transition: 'width 0.3s, background 0.3s',
                      borderRadius: '2px',
                    }} />
                  </div>
                  <span style={{ fontSize: '11px', color: strength.color, minWidth: '38px' }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: '6px' }}>
                Confirm password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={e => { setConfirmPass(e.target.value); setError('') }}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  style={{
                    ...inputStyle('confirm'),
                    paddingRight: '44px',
                    borderColor: confirmPass && password !== confirmPass
                      ? 'rgba(248,113,113,0.4)'
                      : confirmPass && password === confirmPass
                        ? 'rgba(52,211,153,0.4)'
                        : focusedField === 'confirm' ? 'rgba(74,144,217,0.45)' : 'rgba(255,255,255,0.09)',
                  }}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', padding: '2px',
                    display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                  tabIndex={-1}
                >
                  {showConfirm
                    ? <EyeSlash size={16} color="rgba(255,255,255,0.5)" variant="Linear" />
                    : <Eye      size={16} color="rgba(255,255,255,0.5)" variant="Linear" />
                  }
                </button>
              </div>
            </div>

            {/* Phone (optional) */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.38)', marginBottom: '6px' }}>
                Phone <span style={{ color: 'rgba(255,255,255,0.22)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder="(555) 000-0000"
                style={inputStyle('phone')}
                disabled={loading}
                autoComplete="tel"
              />
            </div>

            {/* Role selector */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: '10px' }}>
                I am a
              </label>
              <div className="signup-role-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {(['patient', 'provider', 'admin'] as UserType[]).map(type => {
                  const active = userType === type
                  const colors: Record<UserType, string> = {
                    patient:  '#4a90d9',
                    provider: '#34d399',
                    admin:    '#a78bfa',
                  }
                  return (
                    <button
                      key={type}
                      type="button"
                      className="role-chip"
                      onClick={() => setUserType(type)}
                      style={{
                        padding: '10px 4px',
                        background: active ? `${colors[type]}15` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${active ? `${colors[type]}50` : 'rgba(255,255,255,0.09)'}`,
                        borderRadius: '9px',
                        color: active ? colors[type] : 'rgba(255,255,255,0.5)',
                        fontSize: '12px',
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        transition: 'all 0.18s',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || gLoading}
              className="auth-btn-primary"
              style={{
                padding: '12px 16px',
                background: '#4a90d9',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '14px',
                fontFamily: 'inherit',
                cursor: loading || gLoading ? 'not-allowed' : 'pointer',
                opacity: loading || gLoading ? 0.6 : 1,
                transition: 'all 0.18s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
              }}
            >
              {loading && <Spinner />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
        )}

        {/* Footer */}
        {!success && !needsConfirm && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.38)', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              style={{ color: '#4a90d9', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
