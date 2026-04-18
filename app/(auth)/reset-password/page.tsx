'use client'
import { useState, useEffect } from 'react'
import { createClientClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const supabase = createClientClient()
  const router = useRouter()

  useEffect(() => {
    // Supabase sends the user back with a hash fragment containing the tokens.
    // The client-side SDK picks these up automatically via onAuthStateChange.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) { setError('Please enter a new password'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', background: '#07070F' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: '13px', fontWeight: 400, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.9)' }}>NEXUS</span>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(109,145,151,0.15)', border: '1px solid rgba(109,145,151,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6d9197" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>Password updated</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6 }}>
              Your password has been reset. Redirecting you to sign in…
            </p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(109,145,151,0.3)', borderTopColor: '#6d9197', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>Verifying your reset link…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Set new password</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '28px' }}>
              Choose a strong password for your account.
            </p>

            {error && (
              <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', padding: '11px 14px', marginBottom: '18px', color: '#ff6b6b', fontSize: '13px' }}>{error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', marginBottom: '6px' }}>New password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" disabled={loading}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', caretColor: '#6d9197' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(109,145,151,0.45)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', marginBottom: '6px' }}>Confirm password</label>
                <input
                  type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password" disabled={loading}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', caretColor: '#6d9197' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(109,145,151,0.45)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {/* Password strength hint */}
              {password.length > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1,2,3,4].map(n => (
                    <div key={n} style={{ flex: 1, height: '3px', borderRadius: '2px', background: password.length >= n * 3 ? (password.length >= 12 ? '#6d9197' : password.length >= 8 ? '#f59e0b' : '#ff6b6b') : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ padding: '12px', background: '#6d9197', color: '#07070F', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'inherit', marginTop: '4px' }}>
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
