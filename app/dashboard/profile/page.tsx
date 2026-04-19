'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientClient } from '@/lib/auth-client'
import { LogOut } from 'lucide-react'

type UserType = 'patient' | 'provider' | 'admin'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClientClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    userType: 'patient' as UserType,
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const session = sessionData?.session

        if (!session) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser(profile)
          setFormData({
            fullName: profile.full_name || '',
            phone: profile.phone || '',
            userType: (profile.user_type as UserType) || 'patient',
          })
        }
      } catch (err) {
        console.error('Failed to load user:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [supabase, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUserTypeChange = (type: UserType) => {
    setFormData(prev => ({ ...prev, userType: type }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          user_type: formData.userType,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess('Profile updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) throw updateError

      setSuccess('Password updated successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      document.cookie = 'sb-access-token=; path=/; max-age=0'
      document.cookie = 'sb-refresh-token=; path=/; max-age=0'
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', paddingTop: '120px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px', color: '#ffffff' }}>Edit Profile</h1>

        {error && (
          <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#ff6b6b', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(109,145,151,0.1)', border: '1px solid rgba(109,145,151,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#6d9197', fontSize: '13px' }}>
            {success}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#ffffff' }}>Personal Information</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '9px',
                    color: '#eef4f5',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    caretColor: '#6d9197',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(109,145,151,0.45)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  disabled={saving}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '9px',
                    color: '#eef4f5',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    caretColor: '#6d9197',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(109,145,151,0.45)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  disabled={saving}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>I am a:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {(['patient', 'provider', 'admin'] as UserType[]).map(type => (
                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                      <input
                        type="radio"
                        name="userType"
                        value={type}
                        checked={formData.userType === type}
                        onChange={() => handleUserTypeChange(type)}
                        disabled={saving}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '12px 16px',
                  background: '#6d9197',
                  color: '#07070F',
                  border: 'none',
                  borderRadius: '9px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  marginTop: '6px',
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        {/* Password Form */}
        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#ffffff' }}>Change Password</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '9px',
                    color: '#eef4f5',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    caretColor: '#6d9197',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(109,145,151,0.45)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  disabled={saving}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '9px',
                    color: '#eef4f5',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    caretColor: '#6d9197',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(109,145,151,0.45)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  disabled={saving}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '12px 16px',
                  background: '#6d9197',
                  color: '#07070F',
                  border: 'none',
                  borderRadius: '9px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  marginTop: '6px',
                }}
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </form>

        {/* Logout Button */}
        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: 'rgba(255,107,107,0.1)',
              color: '#ff6b6b',
              border: '1px solid rgba(255,107,107,0.3)',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,107,107,0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,107,107,0.1)'
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
