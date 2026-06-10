'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createClientClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeSlash, InfoCircle, TickCircle, ArrowLeft } from 'iconsax-react'

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

function pwStrength(pw: string): { score: number; color: string } {
  if (!pw) return { score: 0, color: '' }
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, color: '#f87171' }
  if (score <= 3) return { score, color: '#fbbf24' }
  return              { score, color: '#34d399' }
}

export default function ResetPasswordPage() {
  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [showPass,     setShowPass]     = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [done,         setDone]         = useState(false)
  const [error,        setError]        = useState('')
  const [ready,        setReady]        = useState(false)
  const [mounted,      setMounted]      = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [supabase, setSupabase]         = useState<ReturnType<typeof createClientClient> | null>(null)

  const router    = useRouter()
  const passRef   = useRef<HTMLInputElement>(null)
  const strength  = pwStrength(password)

  useEffect(() => {
    setSupabase(createClientClient())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
        setTimeout(() => passRef.current?.focus(), 350)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    if (!supabase) { setError('Not initialized'); return }
    e.preventDefault()
    if (!password)             { setError('Please enter a new password.'); return }
    if (password.length < 8)   { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm)  { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password.')
    } finally { setLoading(false) }
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
        .auth-card   { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .success-card { animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .rp-submit-btn {
          width: 100%; padding: 13px 16px;
          background: var(--accent); color: #fff; border: none;
          border-radius: 10px; font-weight: 600; font-size: 14px; font-family: inherit;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 14px rgba(79,142,240,0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          margin-top: 4px;
        }
        .rp-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.24), 0 8px 24px rgba(79,142,240,0.45);
          background: #5a9fe6;
        }
        .rp-submit-btn:active:not(:disabled) { transform: scale(0.97); transition: transform 0.08s ease; }
        .rp-back-link {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--text-3); font-size: 13px; text-decoration: none;
          transition: color 0.18s ease;
        }
        .rp-back-link:hover { color: var(--accent); }
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
        filter: 'blur(20px)', pointerEvents: 'none',
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

        {/* ── Done state ── */}
        {done ? (
          <div className="success-card" style={{
            background: 'rgba(52,211,153,0.05)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(52,211,153,0.18)',
            borderRadius: '16px', padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <TickCircle size={36} color="#34d399" variant="TwoTone" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '10px', fontFamily: 'var(--font-display)' }}>
              Password updated
            </h2>
            <p style={{ color: 'var(--text-3)', fontSize: '14px', lineHeight: 1.65, marginBottom: '0' }}>
              Your password has been reset. Taking you to sign in…
            </p>
          </div>

        ) : !ready ? (
          /* ── Waiting for PASSWORD_RECOVERY event ── */
          <div style={{
            background: 'rgba(10,11,20,0.60)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '16px', padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: '2px solid rgba(79,142,240,0.18)',
              borderTopColor: 'var(--accent)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 20px',
            }} />
            <p style={{ color: 'var(--text-3)', fontSize: '14px', margin: 0 }}>
              Verifying your reset link…
            </p>
          </div>

        ) : (
          /* ── Password form ── */
          <div style={{
            background: 'rgba(10,11,20,0.60)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '16px', padding: '32px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(79,142,240,0.04)',
          }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', letterSpacing: '-0.025em', fontFamily: 'var(--font-display)' }}>
              Set new password
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '26px', lineHeight: 1.5 }}>
              Choose a strong password for your account.
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* New password */}
              <div>
                <label htmlFor="rp-password" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-3)', marginBottom: '7px', letterSpacing: '0.01em' }}>
                  New password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="rp-password"
                    ref={passRef}
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Min. 8 characters"
                    style={{ ...inputStyle('password'), paddingRight: '44px' }}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '3px', display: 'flex', alignItems: 'center', transition: 'color 0.15s ease' }}
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
                {/* Strength bar */}
                {password && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[1,2,3,4].map(n => (
                      <div key={n} style={{ flex: 1, height: '3px', borderRadius: '2px', background: strength.score >= n * 1.25 ? strength.color : 'rgba(255,255,255,0.08)', transition: 'background 0.25s' }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="rp-confirm" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-3)', marginBottom: '7px', letterSpacing: '0.01em' }}>
                  Confirm password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="rp-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError('') }}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Repeat your password"
                    style={{
                      ...inputStyle('confirm'),
                      paddingRight: '44px',
                      borderColor: confirm && password !== confirm
                        ? 'rgba(248,113,113,0.4)'
                        : confirm && password === confirm
                          ? 'rgba(52,211,153,0.4)'
                          : focusedField === 'confirm' ? 'rgba(79,142,240,0.55)' : 'rgba(255,255,255,0.10)',
                    }}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '3px', display: 'flex', alignItems: 'center', transition: 'color 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
                    tabIndex={-1}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm
                      ? <EyeSlash size={15} color="rgba(255,255,255,0.5)" variant="Linear" />
                      : <Eye      size={15} color="rgba(255,255,255,0.5)" variant="Linear" />
                    }
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rp-submit-btn"
                style={{ opacity: loading ? 0.65 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading && <Spinner />}
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link href="/login" className="rp-back-link">
                <ArrowLeft size={14} color="rgba(255,255,255,0.5)" variant="Linear" />
                Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
