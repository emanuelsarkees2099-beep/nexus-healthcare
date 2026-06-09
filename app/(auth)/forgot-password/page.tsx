'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'
import { Sms, InfoCircle, ArrowLeft } from 'iconsax-react'

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

export default function ForgotPasswordPage() {
  const [email,        setEmail]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [sent,         setSent]         = useState(false)
  const [error,        setError]        = useState('')
  const [mounted,      setMounted]      = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const supabase = createClientClient()
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    setTimeout(() => emailRef.current?.focus(), 400)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setLoading(true); setError('')
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) throw err
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.')
      setLoading(false)
    }
  }

  if (!mounted) return null

  const inputFocused = focusedField === 'email'

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
        .auth-card { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .success-card { animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .fp-submit-btn {
          width: 100%;
          padding: 13px 16px;
          background: var(--accent);
          color: #fff; border: none;
          border-radius: 10px;
          font-weight: 600; font-size: 14px; font-family: inherit;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 14px rgba(79,142,240,0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          margin-top: 4px;
        }
        .fp-submit-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%);
          transform: translateX(-100%) skewX(-15deg);
          animation: btn-shimmer-sweep 4s ease infinite;
          animation-delay: 2s;
          pointer-events: none;
        }
        .fp-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.24), 0 8px 24px rgba(79,142,240,0.45);
          background: #5a9fe6;
        }
        .fp-submit-btn:active:not(:disabled) {
          transform: scale(0.97);
          transition: transform 0.08s ease;
        }
        .fp-back-link {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--text-3); font-size: 13px; text-decoration: none;
          transition: color 0.18s ease;
        }
        .fp-back-link:hover { color: var(--accent); }
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

        {/* ── Sent confirmation state ── */}
        {sent ? (
          <div className="success-card" style={{
            background: 'rgba(79,142,240,0.05)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(79,142,240,0.18)',
            borderRadius: '16px',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(79,142,240,0.10)',
              border: '1px solid rgba(79,142,240,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Sms size={28} color="var(--accent)" variant="TwoTone" />
            </div>
            <h2 style={{
              fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em',
              color: 'var(--text)', marginBottom: '10px',
              fontFamily: 'var(--font-display)',
            }}>
              Check your inbox
            </h2>
            <p style={{
              color: 'var(--text-3)', fontSize: '14px',
              lineHeight: 1.65, marginBottom: '28px',
              maxWidth: '290px', margin: '0 auto 28px',
            }}>
              We sent a reset link to{' '}
              <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>{email}</strong>.
              Click it to choose a new password.
            </p>
            <Link href="/login" className="fp-back-link">
              <ArrowLeft size={14} color="currentColor" variant="Linear" />
              Back to sign in
            </Link>
          </div>

        ) : (

          /* ── Request form ── */
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
              Reset password
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '26px', lineHeight: 1.5 }}>
              Enter your email and we&apos;ll send you a reset link.
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label htmlFor="fp-email" style={{
                  display: 'block', fontSize: '12px', fontWeight: 500,
                  color: 'var(--text-3)', marginBottom: '7px', letterSpacing: '0.01em',
                }}>
                  Email address
                </label>
                <input
                  id="fp-email"
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: inputFocused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${inputFocused ? 'rgba(79,142,240,0.55)' : 'rgba(255,255,255,0.10)'}`,
                    borderRadius: '10px',
                    color: 'var(--text)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box' as const,
                    caretColor: '#4F8EF0',
                    boxShadow: inputFocused
                      ? '0 0 0 3px rgba(79,142,240,0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="fp-submit-btn"
                style={{ opacity: loading ? 0.65 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading && <Spinner />}
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        {!sent && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-3)', marginTop: '22px' }}>
            Remember your password?{' '}
            <Link
              href="/login"
              style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.80')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
