'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { createClientClient } from '@/lib/auth-client'
import { ShieldTick, Key, Logout, InfoCircle, TickCircle, Copy } from 'iconsax-react'
import type { User } from '@supabase/supabase-js'

const Spinner = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2 A10 10 0 0 1 22 12" />
  </svg>
)

function generateRecoveryCodes(): string[] {
  return Array.from({ length: 8 }, () =>
    Math.random().toString(36).substring(2, 7).toUpperCase() + '-' +
    Math.random().toString(36).substring(2, 7).toUpperCase()
  )
}

export default function SecuritySettingsPage() {
  const [user,            setUser]            = useState<User | null>(null)
  const [mfaFactors,      setMfaFactors]      = useState<{ id: string; type: string }[]>([])
  const [loading,         setLoading]         = useState(true)
  const [enrolling,       setEnrolling]       = useState(false)
  const [qrCode,          setQrCode]          = useState('')
  const [totpSecret,      setTotpSecret]      = useState('')
  const [factorId,        setFactorId]        = useState('')
  const [verifyCode,      setVerifyCode]      = useState('')
  const [verifying,       setVerifying]       = useState(false)
  const [recoveryCodes,   setRecoveryCodes]   = useState<string[]>([])
  const [showCodes,       setShowCodes]       = useState(false)
  const [unenrolling,     setUnenrolling]     = useState(false)
  const [signingOutAll,   setSigningOutAll]   = useState(false)
  const [error,           setError]           = useState('')
  const [success,         setSuccess]         = useState('')
  const [mounted,         setMounted]         = useState(false)
  const [copiedCodes,     setCopiedCodes]     = useState(false)

  const supabase = createClientClient()

  const loadUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      const { data } = await supabase.auth.mfa.listFactors()
      setMfaFactors((data?.totp ?? []).map(f => ({ id: f.id, type: 'totp' })))
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    setMounted(true)
    loadUser()
  }, [loadUser])

  const startEnrollment = async () => {
    setEnrolling(true); setError('')
    try {
      const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (err) throw err
      if (data?.type === 'totp') {
        setQrCode(data.totp.qr_code)
        setTotpSecret(data.totp.secret)
        setFactorId(data.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start 2FA setup.')
      setEnrolling(false)
    }
  }

  const verifyEnrollment = async () => {
    if (!verifyCode || verifyCode.length !== 6) { setError('Enter the 6-digit code from your authenticator app.'); return }
    setVerifying(true); setError('')
    try {
      const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId })
      if (challengeErr) throw challengeErr

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      })
      if (verifyErr) throw verifyErr

      const codes = generateRecoveryCodes()
      setRecoveryCodes(codes)
      setShowCodes(true)
      setEnrolling(false)
      setQrCode('')
      setSuccess('Two-factor authentication enabled successfully.')
      await loadUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Check the code and try again.')
    } finally {
      setVerifying(false)
    }
  }

  const unenrollTotp = async (factorIdToRemove: string) => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication?')) return
    setUnenrolling(true); setError('')
    try {
      const { error: err } = await supabase.auth.mfa.unenroll({ factorId: factorIdToRemove })
      if (err) throw err
      setSuccess('Two-factor authentication disabled.')
      await loadUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA.')
    } finally {
      setUnenrolling(false)
    }
  }

  const signOutAllDevices = async () => {
    if (!window.confirm('This will sign you out on all devices. Continue?')) return
    setSigningOutAll(true)
    await supabase.auth.signOut({ scope: 'global' })
    window.location.href = '/login'
  }

  const copyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'))
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)
  }

  if (!mounted || loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login?next=/settings/security'
    return null
  }

  const has2FA = mfaFactors.length > 0

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px', fontFamily: 'inherit' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text, #e8eaf0)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
        Security
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-3, #6b7280)', marginBottom: '32px' }}>
        Manage two-factor authentication and active sessions.
      </p>

      {error && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)', borderRadius: '8px', padding: '10px 12px', marginBottom: '20px', color: '#f87171', fontSize: '13px', animation: 'fadeUp 0.3s ease both' }}>
          <InfoCircle size={14} color="#f87171" variant="TwoTone" style={{ flexShrink: 0 }} />
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>
      )}

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)', borderRadius: '8px', padding: '10px 12px', marginBottom: '20px', color: '#34d399', fontSize: '13px', animation: 'fadeUp 0.3s ease both' }}>
          <TickCircle size={14} color="#34d399" variant="TwoTone" style={{ flexShrink: 0 }} />
          {success}
          <button onClick={() => setSuccess('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>
      )}

      {/* 2FA Section */}
      <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: has2FA || enrolling ? '20px' : '0' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: has2FA ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${has2FA ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldTick size={18} color={has2FA ? '#34d399' : 'rgba(255,255,255,0.4)'} variant="TwoTone" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text, #e8eaf0)', margin: 0 }}>
                  Two-factor authentication
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-3, #6b7280)', margin: '2px 0 0' }}>
                  {has2FA ? 'Enabled — authenticator app' : 'Add an extra layer of security to your account.'}
                </p>
              </div>
              {!enrolling && !showCodes && (
                has2FA ? (
                  <button onClick={() => unenrollTotp(mfaFactors[0].id)} disabled={unenrolling}
                    style={{ fontSize: '12px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: unenrolling ? 0.6 : 1 }}>
                    {unenrolling ? 'Disabling…' : 'Disable'}
                  </button>
                ) : (
                  <button onClick={startEnrollment}
                    style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent, #4F8EF0)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Enable →
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* QR code enrollment */}
        {enrolling && qrCode && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-3, #6b7280)', marginBottom: '16px', lineHeight: 1.5 }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password):
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="TOTP QR code" width={180} height={180}
                style={{ borderRadius: '8px', background: '#fff', padding: '8px' }} />
            </div>
            {totpSecret && (
              <p style={{ fontSize: '11px', color: 'var(--text-3, #6b7280)', textAlign: 'center', marginBottom: '20px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                Manual code: {totpSecret}
              </p>
            )}
            <p style={{ fontSize: '13px', color: 'var(--text-3, #6b7280)', marginBottom: '10px' }}>
              Enter the 6-digit code from your app to confirm:
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                value={verifyCode} onChange={e => { setVerifyCode(e.target.value.replace(/\D/g, '')); setError('') }}
                placeholder="000000"
                style={{ flex: 1, padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', color: 'var(--text, #e8eaf0)', fontSize: '18px', fontFamily: 'monospace', outline: 'none', letterSpacing: '0.2em', caretColor: '#4F8EF0' }} />
              <button onClick={verifyEnrollment} disabled={verifying || verifyCode.length !== 6}
                style={{ padding: '11px 20px', background: 'var(--accent, #4F8EF0)', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 600, fontSize: '13px', fontFamily: 'inherit', cursor: verifying || verifyCode.length !== 6 ? 'not-allowed' : 'pointer', opacity: verifying || verifyCode.length !== 6 ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {verifying && <Spinner />}
                {verifying ? 'Verifying…' : 'Verify'}
              </button>
            </div>
            <button onClick={() => { setEnrolling(false); setQrCode(''); setError('') }}
              style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--text-3, #6b7280)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
              Cancel
            </button>
          </div>
        )}

        {/* Recovery codes */}
        {showCodes && recoveryCodes.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Key size={14} color="#fbbf24" variant="TwoTone" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text, #e8eaf0)' }}>Recovery codes</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-3, #6b7280)', marginBottom: '14px', lineHeight: 1.5 }}>
              Save these codes somewhere safe. Each can only be used once if you lose access to your authenticator app.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
              {recoveryCodes.map((code, i) => (
                <div key={i} style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-2, #c9d1d9)', letterSpacing: '0.05em', textAlign: 'center' }}>
                  {code}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={copyCodes}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: copiedCodes ? '#34d399' : 'var(--text-2, #c9d1d9)', fontSize: '12px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s' }}>
                <Copy size={13} color={copiedCodes ? '#34d399' : 'rgba(255,255,255,0.5)'} variant="Linear" />
                {copiedCodes ? 'Copied!' : 'Copy all'}
              </button>
              <button onClick={() => setShowCodes(false)}
                style={{ padding: '8px 14px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: 'var(--text-3, #6b7280)', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Sessions */}
      <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Logout size={18} color="rgba(255,255,255,0.4)" variant="TwoTone" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text, #e8eaf0)', margin: 0 }}>Active sessions</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-3, #6b7280)', margin: '2px 0 0' }}>
                  Sign out on all devices at once.
                </p>
              </div>
              <button onClick={signOutAllDevices} disabled={signingOutAll}
                style={{ fontSize: '12px', fontWeight: 600, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: signingOutAll ? 0.6 : 1 }}>
                {signingOutAll ? 'Signing out…' : 'Sign out everywhere'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
