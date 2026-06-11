'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { createClientClient } from '@/lib/auth-client'
import { TickCircle, InfoCircle } from 'iconsax-react'
import type { User } from '@supabase/supabase-js'

const Spinner = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2 A10 10 0 0 1 22 12" />
  </svg>
)

export default function ProfileSettingsPage() {
  const [user,      setUser]      = useState<User | null>(null)
  const [fullName,  setFullName]  = useState('')
  const [phone,     setPhone]     = useState('')
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')
  const [mounted,   setMounted]   = useState(false)
  const [focused,   setFocused]   = useState<string | null>(null)

  const supabase = createClientClient()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      const { data } = await supabase
        .from('user_profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single()
      if (data) {
        setFullName(data.full_name ?? '')
        setPhone(data.phone ?? '')
      }
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { setMounted(true); load() }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true); setError(''); setSuccess('')
    try {
      const { error: err } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName.trim() || null, phone: phone.trim() || null })
        .eq('id', user.id)
      if (err) throw err
      setSuccess('Profile updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  if (!mounted || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
      <Spinner />
    </div>
  )

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login?next=/settings/profile'
    return null
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%', padding: '11px 14px',
    background: focused === field ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${focused === field ? 'rgba(79,142,240,0.55)' : 'rgba(255,255,255,0.09)'}`,
    borderRadius: '9px', color: 'var(--text, #e8eaf0)',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box' as const, caretColor: '#4F8EF0',
    boxShadow: focused === field ? '0 0 0 3px rgba(79,142,240,0.10)' : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  })

  return (
    <div style={{ maxWidth: '480px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {error && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', color: '#f87171', fontSize: '13px' }}>
          <InfoCircle size={14} color="#f87171" variant="TwoTone" style={{ flexShrink: 0 }} />
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px', padding: '0 2px' }}>×</button>
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', color: '#34d399', fontSize: '13px' }}>
          <TickCircle size={14} color="#34d399" variant="TwoTone" style={{ flexShrink: 0 }} />
          {success}
        </div>
      )}

      <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text, #e8eaf0)', marginBottom: '4px' }}>Personal information</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-3, #6b7280)', marginBottom: '20px' }}>
          Only used internally — never shared without your consent.
        </p>

        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-3, #6b7280)', marginBottom: '6px' }}>
              Email address
            </label>
            <input type="email" value={user.email ?? ''} disabled
              style={{ ...inputStyle('email'), opacity: 0.5, cursor: 'not-allowed' }} />
            <p style={{ fontSize: '11px', color: 'var(--text-3, #6b7280)', marginTop: '4px' }}>
              Email cannot be changed here — contact support.
            </p>
          </div>

          <div>
            <label htmlFor="sp-name" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-3, #6b7280)', marginBottom: '6px' }}>
              Full name
            </label>
            <input id="sp-name" type="text" value={fullName}
              onChange={e => { setFullName(e.target.value); setSuccess('') }}
              onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
              placeholder="Your name" autoComplete="name"
              style={inputStyle('name')} />
          </div>

          <div>
            <label htmlFor="sp-phone" style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-3, #6b7280)', marginBottom: '6px' }}>
              Phone <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input id="sp-phone" type="tel" value={phone}
              onChange={e => { setPhone(e.target.value); setSuccess('') }}
              onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
              placeholder="(555) 000-0000" autoComplete="tel"
              style={inputStyle('phone')} />
          </div>

          <button type="submit" disabled={saving}
            style={{
              padding: '11px 20px', background: 'var(--accent, #4F8EF0)', color: '#fff',
              border: 'none', borderRadius: '9px', fontWeight: 600, fontSize: '13px',
              fontFamily: 'inherit', cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px',
              alignSelf: 'flex-start', transition: 'opacity 0.15s',
            }}>
            {saving && <Spinner />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>
    </div>
  )
}
