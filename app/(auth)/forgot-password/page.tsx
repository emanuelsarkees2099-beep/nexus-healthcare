'use client'
import { useState, useEffect } from 'react'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [supabase, setSupabase] = useState<ReturnType<typeof createClientClient> | null>(null)

  useEffect(() => {
    setSupabase(createClientClient())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    if (!supabase) { setError('Not initialized'); return }
    e.preventDefault()
    if (!email) { setError('Please enter your email'); return }
    if (!supabase) { setError('Not initialized'); return }
    setLoading(true); setError('')
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) throw err
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', background: '#07070F' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: '13px', fontWeight: 400, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.9)' }}>NEXUS</span>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(109,145,151,0.15)', border: '1px solid rgba(109,145,151,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6d9197" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>Check your inbox</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              We sent a password reset link to <strong style={{ color: '#eef4f5' }}>{email}</strong>
            </p>
            <Link href="/login" style={{ color: '#6d9197', fontSize: '13px', textDecoration: 'none' }}>← Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Reset password</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '28px' }}>
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', padding: '11px 14px', marginBottom: '18px', color: '#ff6b6b', fontSize: '13px' }}>{error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', marginBottom: '6px' }}>Email address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" disabled={loading}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', caretColor: '#6d9197' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(109,145,151,0.45)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
              <button type="submit" disabled={loading} style={{ padding: '12px', background: '#6d9197', color: '#07070F', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'inherit' }}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <p style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
              Remember your password?{' '}
              <Link href="/login" style={{ color: '#6d9197', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
