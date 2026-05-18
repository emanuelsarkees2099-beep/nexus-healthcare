'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'

type UserType = 'patient' | 'provider' | 'admin'

const USER_TYPE_META: Record<UserType, { label: string; desc: string; color: string; bg: string; border: string }> = {
  patient:  { label: 'Patient',  desc: 'Finding care',      color: 'rgba(74,144,217,0.9)',  bg: 'rgba(74,144,217,0.08)',  border: 'rgba(74,144,217,0.25)'  },
  provider: { label: 'Provider', desc: 'Offering care',     color: 'rgba(74,217,144,0.9)',  bg: 'rgba(74,217,144,0.08)',  border: 'rgba(74,217,144,0.25)'  },
  admin:    { label: 'Admin',    desc: 'Managing platform', color: 'rgba(217,144,74,0.9)',  bg: 'rgba(217,144,74,0.08)',  border: 'rgba(217,144,74,0.25)'  },
}

function initials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: '10px', fontWeight: 600, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
        fontFamily: 'var(--font-inter)', marginBottom: '10px',
        paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '16px', alignItems: 'start', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-inter)' }}>{label}</div>
        {hint && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-inter)', marginTop: '2px', lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: 'rgba(255,255,255,0.88)',
  fontSize: '13px',
  fontFamily: 'var(--font-inter)',
  outline: 'none',
  boxSizing: 'border-box',
  caretColor: 'var(--accent)',
  transition: 'border-color 0.15s',
}

export default function ProfilePage() {
  const router  = useRouter()
  const supabase = createClientClient()

  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [user,     setUser]     = useState<{ id: string; full_name?: string; phone?: string; user_type?: string; created_at?: string; email?: string } | null>(null)
  const [formData, setFormData] = useState({ fullName: '', phone: '', userType: 'patient' as UserType })
  const [pwData,   setPwData]   = useState({ newPassword: '', confirmPassword: '' })
  const [joinedAt, setJoinedAt] = useState('')

  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        const joined = profile?.created_at || session.user.created_at
        if (joined) {
          setJoinedAt(new Date(joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
        }

        const merged = {
          id:         session.user.id,
          email:      session.user.email ?? '',
          full_name:  profile?.full_name  ?? undefined,
          phone:      profile?.phone      ?? undefined,
          user_type:  profile?.user_type  ?? undefined,
          created_at: profile?.created_at ?? undefined,
        }
        setUser(merged)
        setFormData({
          fullName: profile?.full_name || '',
          phone:    profile?.phone     || '',
          userType: (profile?.user_type as UserType) || 'patient',
        })
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase, router])

  const flash = (msg: string, isError = false) => {
    if (isError) { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 3500)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error: err } = await supabase
        .from('user_profiles')
        .update({ full_name: formData.fullName, phone: formData.phone, user_type: formData.userType })
        .eq('id', user!.id)
      if (err) throw err
      setUser(u => u ? { ...u, full_name: formData.fullName } : u)
      flash('Changes saved')
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Failed to save', true)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwData.newPassword !== pwData.confirmPassword) { flash('Passwords do not match', true); return }
    if (pwData.newPassword.length < 6) { flash('Password must be at least 6 characters', true); return }
    setSavingPw(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password: pwData.newPassword })
      if (err) throw err
      setPwData({ newPassword: '', confirmPassword: '' })
      flash('Password updated')
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Failed to update password', true)
    } finally {
      setSavingPw(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(74,144,217,0.2)', borderTopColor: '#4A8FD4', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const displayName = formData.fullName || user?.email?.split('@')[0] || 'User'
  const typeMeta    = USER_TYPE_META[formData.userType]

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', fontFamily: 'var(--font-inter)' }}>

      {/* ── Top bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(7,7,15,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', color: 'rgba(255,255,255,0.38)', textDecoration: 'none',
          fontFamily: 'var(--font-inter)', transition: 'color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          NEXUS
        </Link>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono, monospace)' }}>
          Account settings
        </span>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Notification banner ── */}
        {(error || success) && (
          <div style={{
            padding: '11px 14px', borderRadius: '9px', marginBottom: '24px', fontSize: '13px',
            background: error ? 'rgba(248,113,113,0.08)' : 'rgba(74,217,144,0.08)',
            border:     `1px solid ${error ? 'rgba(248,113,113,0.20)' : 'rgba(74,217,144,0.20)'}`,
            color:      error ? 'rgba(248,113,113,0.9)' : 'rgba(74,217,144,0.9)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            {error
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            }
            {error || success}
          </div>
        )}

        {/* ── Identity card ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          padding: '28px', marginBottom: '32px', borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(74,144,217,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(74,144,217,0.14)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74,144,217,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(74,144,217,0.5) 0%, rgba(74,144,217,0.2) 100%)',
            border: '1.5px solid rgba(74,144,217,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700,
            color: 'rgba(74,144,217,0.95)', letterSpacing: '-0.02em',
            boxShadow: '0 0 24px rgba(74,144,217,0.15)',
          }}>
            {initials(displayName)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.92)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '4px' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.38)', marginBottom: '10px', fontFamily: 'var(--font-inter)' }}>
              {user?.email}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 9px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                color: typeMeta.color, background: typeMeta.bg, border: `1px solid ${typeMeta.border}`,
                fontFamily: 'var(--font-inter)',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: typeMeta.color, display: 'inline-block' }} />
                {typeMeta.label}
              </span>
              {joinedAt && (
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-inter)' }}>
                  Member since {joinedAt}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Profile form ── */}
        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '32px' }}>

            <Section title="Personal information">
              <Field label="Full name" hint="Displayed on your profile">
                <input
                  ref={nameRef}
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="Your full name"
                  disabled={saving}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(74,144,217,0.45)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </Field>

              <Field label="Email address" hint="Managed via your auth provider">
                <div style={{
                  padding: '9px 12px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '13px', color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'var(--font-inter)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  {user?.email}
                  <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '2px 6px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono, monospace)' }}>
                    read-only
                  </span>
                </div>
              </Field>

              <Field label="Phone" hint="For SMS care alerts (optional)">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  disabled={saving}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(74,144,217,0.45)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </Field>

              <Field label="Role" hint="How you use NEXUS">
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(Object.entries(USER_TYPE_META) as [UserType, typeof USER_TYPE_META[UserType]][]).map(([type, meta]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, userType: type }))}
                      style={{
                        flex: 1, padding: '9px 8px', borderRadius: '9px', cursor: 'pointer',
                        border: formData.userType === type ? `1px solid ${meta.border}` : '1px solid rgba(255,255,255,0.07)',
                        background: formData.userType === type ? meta.bg : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.15s', outline: 'none', textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 600, color: formData.userType === type ? meta.color : 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', marginBottom: '1px' }}>
                        {meta.label}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-inter)' }}>
                        {meta.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </Field>
            </Section>

          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 18px', borderRadius: '9px',
              background: saving ? 'rgba(74,144,217,0.25)' : 'rgba(74,144,217,0.18)',
              color: saving ? 'rgba(74,144,217,0.5)' : 'rgba(74,144,217,0.95)',
              borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(74,144,217,0.25)',
              fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-inter)',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              marginBottom: '40px',
            } as React.CSSProperties}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = 'rgba(74,144,217,0.25)'; e.currentTarget.style.borderColor = 'rgba(74,144,217,0.4)' } }}
            onMouseLeave={e => { if (!saving) { e.currentTarget.style.background = 'rgba(74,144,217,0.18)'; e.currentTarget.style.borderColor = 'rgba(74,144,217,0.25)' } }}
          >
            {saving ? (
              <><div style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid rgba(74,144,217,0.3)', borderTopColor: 'rgba(74,144,217,0.7)', animation: 'spin 0.7s linear infinite' }} />Saving…</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Save changes</>
            )}
          </button>
        </form>

        {/* ── Security ── */}
        <form onSubmit={handleChangePassword} style={{ marginBottom: '40px' }}>
          <Section title="Security">
            <Field label="New password" hint="Minimum 6 characters">
              <input
                type="password"
                value={pwData.newPassword}
                onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="New password"
                disabled={savingPw}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(74,144,217,0.45)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </Field>
            <Field label="Confirm password">
              <input
                type="password"
                value={pwData.confirmPassword}
                onChange={e => setPwData(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                disabled={savingPw}
                style={{ ...inputStyle, marginBottom: '14px' }}
                onFocus={e => e.target.style.borderColor = 'rgba(74,144,217,0.45)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </Field>
          </Section>
          <button
            type="submit"
            disabled={savingPw || !pwData.newPassword}
            style={{
              marginTop: '14px',
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 18px', borderRadius: '9px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.55)',
              fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-inter)',
              cursor: (savingPw || !pwData.newPassword) ? 'not-allowed' : 'pointer',
              opacity: (savingPw || !pwData.newPassword) ? 0.45 : 1,
              transition: 'all 0.15s',
            } as React.CSSProperties}
            onMouseEnter={e => { if (!savingPw && pwData.newPassword) e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            {savingPw ? 'Updating…' : 'Update password'}
          </button>
        </form>

        {/* ── Danger zone ── */}
        <Section title="Session">
          <div style={{ paddingTop: '12px' }}>
            <button
              onClick={handleSignOut}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px', borderRadius: '9px', cursor: 'pointer',
                background: 'rgba(248,113,113,0.05)',
                border: '1px solid rgba(248,113,113,0.16)',
                color: 'rgba(248,113,113,0.7)',
                fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-inter)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.10)'; e.currentTarget.style.color = 'rgba(248,113,113,0.95)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.05)'; e.currentTarget.style.color = 'rgba(248,113,113,0.7)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </Section>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 540px) {
          .pf-field { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
