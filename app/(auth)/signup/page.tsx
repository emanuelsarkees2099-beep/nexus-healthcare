'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'

import { Eye, EyeSlash, InfoCircle, Sms, TickCircle, ShieldTick } from 'iconsax-react'

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

function pwStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }
  let s = 0
  if (pw.length >= 8)  s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  if (s <= 1) return { score: s, label: 'Weak',   color: '#f87171' }
  if (s <= 3) return { score: s, label: 'Fair',   color: '#fbbf24' }
  return              { score: s, label: 'Strong', color: '#34d399' }
}

type UserType = 'patient' | 'provider'

export default function SignupPage() {
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [userType,    setUserType]    = useState<UserType>('patient')
  const [agreed,      setAgreed]      = useState(false)
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [gLoading,    setGLoading]    = useState(false)
  const [error,       setError]       = useState('')
  const [needsConfirm,setNeedsConfirm]= useState(false)
  const [success,     setSuccess]     = useState(false)
  const [mounted,     setMounted]     = useState(false)
  const [focused,     setFocused]     = useState<string | null>(null)

  const emailRef = useRef<HTMLInputElement>(null)
  const supabase = createClientClient()
  const strength = pwStrength(password)

  useEffect(() => {
    setMounted(true)
    setTimeout(() => emailRef.current?.focus(), 400)
  }, [])

  const handleGoogleSignup = async () => {
    setGLoading(true); setError('')
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
      })
      if (err) throw err
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign up failed.')
      setGLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPass) { setError('Please fill in all fields.'); return }
    if (password !== confirmPass)             { setError('Passwords do not match.'); return }
    if (password.length < 8)                 { setError('Password must be at least 8 characters.'); return }
    if (strength.score < 2)                  { setError('Please choose a stronger password.'); return }
    if (!agreed)                             { setError('You must agree to the Terms and Privacy Policy to continue.'); return }

    setLoading(true); setError('')
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { user_type: userType, consent_at: new Date().toISOString() },
        },
      })
      if (authError) throw authError
      if (!authData.user) throw new Error('Signup failed — no user returned.')

      await supabase.from('user_profiles').upsert({
        id:        authData.user.id,
        email,
        user_type: userType,
      })

      if (authData.session) {
        setSuccess(true)
        setTimeout(() => { window.location.href = '/onboarding' }, 1600)
      } else {
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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px', background: 'var(--bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-card    { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .success-card { animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .su-google:hover:not(:disabled) { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.18) !important; transform: translateY(-1px); }
        .su-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.24), 0 8px 24px rgba(79,142,240,0.45) !important; background: #5a9fe6 !important; }
        .su-submit:active:not(:disabled) { transform: scale(0.97) !important; }
        .role-btn:hover { opacity: 0.85; }
      `}</style>

      <div className="aurora-bg" aria-hidden="true"><div className="aurora-orb-3" /></div>
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '400px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(79,142,240,0.10) 0%, transparent 65%)',
        filter: 'blur(20px)', pointerEvents: 'none',
      }} />
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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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

        {/* Confirm email state */}
        {needsConfirm ? (
          <div className="success-card" style={{
            background: 'rgba(79,142,240,0.05)', border: '1px solid rgba(79,142,240,0.18)',
            borderRadius: '16px', padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(79,142,240,0.1)', border: '1px solid rgba(79,142,240,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Sms size={28} color="var(--accent)" variant="TwoTone" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', lineHeight: '1.6', maxWidth: '280px', margin: '0 auto 20px' }}>
              We sent a confirmation link to <strong style={{ color: 'var(--text-2)' }}>{email}</strong>. Click it to activate your account.
            </p>
            <Link href="/login" style={{ display: 'inline-block', padding: '10px 20px', background: 'rgba(79,142,240,0.1)', border: '1px solid rgba(79,142,240,0.25)', borderRadius: '9px', color: 'var(--accent)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
              Go to sign in
            </Link>
          </div>

        ) : success ? (
          <div className="success-card" style={{
            background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.18)',
            borderRadius: '16px', padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <TickCircle size={36} color="#34d399" variant="TwoTone" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
              Account created!
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>Welcome to NEXUS. Setting up your profile…</p>
          </div>

        ) : (
          /* Signup form */
          <div style={{
            background: 'rgba(10,11,20,0.60)', backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px', padding: '32px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(79,142,240,0.04)',
          }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', letterSpacing: '-0.025em', fontFamily: 'var(--font-display)' }}>
              Create account
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '26px' }}>
              Join thousands accessing free care.
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
            <button onClick={handleGoogleSignup} disabled={loading || gLoading} className="su-google"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '11px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.11)',
                borderRadius: '10px', color: 'var(--text-2)', fontSize: '14px', fontWeight: 500, fontFamily: 'inherit',
                cursor: loading || gLoading ? 'not-allowed' : 'pointer',
                opacity: loading || gLoading ? 0.55 : 1,
                transition: 'all 0.18s', marginBottom: '18px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
              {gLoading ? <Spinner /> : <GoogleIcon />}
              {gLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

              {/* Email */}
              <div>
                <label htmlFor="su-email" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-3)', marginBottom: '7px' }}>
                  Email address
                </label>
                <input id="su-email" ref={emailRef} type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  placeholder="you@example.com" style={inputStyle('email')}
                  disabled={loading} autoComplete="email" />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="su-password" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-3)', marginBottom: '7px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input id="su-password" type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                    placeholder="Min. 8 characters"
                    style={{ ...inputStyle('password'), paddingRight: '44px' }}
                    disabled={loading} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '3px', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
                    {showPass ? <EyeSlash size={15} color="rgba(255,255,255,0.5)" variant="Linear" /> : <Eye size={15} color="rgba(255,255,255,0.5)" variant="Linear" />}
                  </button>
                </div>
                {password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} style={{ flex: 1, height: '3px', borderRadius: '2px', background: strength.score >= n * 1.25 ? strength.color : 'rgba(255,255,255,0.08)', transition: 'background 0.25s' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '11px', color: strength.color }}>{strength.label}</span>
                    {strength.score < 2 && <span style={{ fontSize: '11px', color: 'var(--text-3)', marginLeft: '6px' }}>— needs to be at least Fair</span>}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="su-confirm" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-3)', marginBottom: '7px' }}>
                  Confirm password
                </label>
                <div style={{ position: 'relative' }}>
                  <input id="su-confirm" type={showConfirm ? 'text' : 'password'} value={confirmPass}
                    onChange={e => { setConfirmPass(e.target.value); setError('') }}
                    onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    style={{
                      ...inputStyle('confirm'),
                      paddingRight: '44px',
                      borderColor: confirmPass && password !== confirmPass
                        ? 'rgba(248,113,113,0.4)'
                        : confirmPass && password === confirmPass
                          ? 'rgba(52,211,153,0.4)'
                          : focused === 'confirm' ? 'rgba(79,142,240,0.55)' : 'rgba(255,255,255,0.10)',
                    }}
                    disabled={loading} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '3px', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
                    {showConfirm ? <EyeSlash size={15} color="rgba(255,255,255,0.5)" variant="Linear" /> : <Eye size={15} color="rgba(255,255,255,0.5)" variant="Linear" />}
                  </button>
                </div>
              </div>

              {/* Role selector — patient or provider only */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-3)', marginBottom: '9px' }}>
                  I am a
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {(['patient', 'provider'] as UserType[]).map(type => {
                    const active = userType === type
                    const color  = type === 'patient' ? '#4F8EF0' : '#34d399'
                    return (
                      <button key={type} type="button" className="role-btn"
                        onClick={() => setUserType(type)}
                        style={{
                          padding: '10px 4px',
                          background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${active ? `${color}55` : 'rgba(255,255,255,0.09)'}`,
                          borderRadius: '9px',
                          color: active ? color : 'var(--text-3)',
                          fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                          cursor: 'pointer', textTransform: 'capitalize',
                          transition: 'all 0.18s', letterSpacing: '0.01em',
                        }}>
                        {type}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Terms + HIPAA consent */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setError('') }}
                  style={{ marginTop: '2px', accentColor: '#4F8EF0', width: '14px', height: '14px', flexShrink: 0, cursor: 'pointer' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Terms of Service</Link>,{' '}
                  <Link href="/privacy" target="_blank" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Privacy Policy</Link>, and{' '}
                  <Link href="/privacy#hipaa" target="_blank" style={{ color: 'var(--accent)', textDecoration: 'none' }}>HIPAA Notice of Privacy Practices</Link>
                </span>
              </label>

              {/* Submit */}
              <button type="submit" disabled={loading || gLoading || !agreed} className="su-submit"
                style={{
                  padding: '13px 16px', background: 'var(--accent)', color: '#fff', border: 'none',
                  borderRadius: '10px', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
                  cursor: loading || gLoading || !agreed ? 'not-allowed' : 'pointer',
                  opacity: loading || gLoading || !agreed ? 0.6 : 1,
                  transition: 'all 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginTop: '4px', position: 'relative', overflow: 'hidden',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 14px rgba(79,142,240,0.35)',
                }}>
                {loading && <Spinner />}
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          </div>
        )}

        {/* Footer links */}
        {!success && !needsConfirm && (
          <>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-3)', marginTop: '22px' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.80')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Sign in
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
