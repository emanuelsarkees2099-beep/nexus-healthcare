'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'
import { CheckCircle, AlertCircle } from 'lucide-react'

type UserType = 'patient' | 'provider' | 'admin'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    userType: 'patient' as UserType,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClientClient> | null>(null)

  useEffect(() => {
    setSupabase(createClientClient())
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleUserTypeChange = (type: UserType) => {
    setFormData(prev => ({ ...prev, userType: type }))
  }

  const handleGoogleSignup = async () => {
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (err) throw err
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google signup failed')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const { email, password, confirmPassword, fullName, phone, userType } = formData

    if (!email || !password || !confirmPassword || !fullName) {
      setError('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError
      if (!authData.user) throw new Error('Signup failed')

      // Create profile
      await supabase.from('user_profiles').upsert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone: phone || null,
        user_type: userType || 'patient',
      })

      setSuccess(true)
      setTimeout(() => { window.location.href = '/dashboard' }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  // Form completion percentage
  const filledFields = [
    formData.fullName,
    formData.email,
    formData.password,
    formData.confirmPassword,
  ].filter(Boolean).length
  const completion = (filledFields / 4) * 100

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(109,145,151,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide { animation: slideIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
        .stagger-5 { animation-delay: 0.5s; opacity: 0; }
        .stagger-6 { animation-delay: 0.6s; opacity: 0; }
        .stagger-7 { animation-delay: 0.7s; opacity: 0; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div className="animate-slide stagger-1" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: '13px', fontWeight: 400, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.9)' }}>NEXUS</span>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '8px', letterSpacing: '0.05em' }}>Join the healthcare revolution</p>
        </div>

        {success ? (
          // Success state
          <div className="animate-slide" style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={32} color="#4ade80" strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Account created!</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>Welcome to NEXUS. Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <h1 className="animate-slide stagger-2" style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>Create account</h1>
            <p className="animate-slide stagger-2" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', fontSize: '14px' }}>Join thousands accessing healthcare</p>

            {error && (
              <div className="animate-slide stagger-3" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', color: '#ff6b6b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={16} strokeWidth={2} />
                {error}
              </div>
            )}

            {/* Progress bar */}
            <div className="animate-slide stagger-3" style={{ marginBottom: '24px' }}>
              <div style={{ height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: `linear-gradient(90deg, #6d9197, #4ade80)`, width: `${completion}%`, transition: 'width 0.3s ease' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '6px' }}>{Math.round(completion)}% complete</p>
            </div>

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Full Name */}
              <div className="animate-slide stagger-4" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Full name</span>
                  {formData.fullName && <span style={{ color: '#4ade80', fontSize: '10px' }}>✓</span>}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Maria Garcia"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: focusedField === 'fullName' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                    border: focusedField === 'fullName' ? '1px solid rgba(109,145,151,0.45)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: '#eef4f5',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    caretColor: '#6d9197',
                    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
              </div>

              {/* Email */}
              <div className="animate-slide stagger-4" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Email</span>
                  {formData.email && <span style={{ color: '#4ade80', fontSize: '10px' }}>✓</span>}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: focusedField === 'email' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                    border: focusedField === 'email' ? '1px solid rgba(109,145,151,0.45)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: '#eef4f5',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    caretColor: '#6d9197',
                    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
              </div>

              {/* Password */}
              <div className="animate-slide stagger-5" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Password</span>
                  {formData.password && <span style={{ color: '#4ade80', fontSize: '10px' }}>✓</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: focusedField === 'password' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                    border: focusedField === 'password' ? '1px solid rgba(109,145,151,0.45)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: '#eef4f5',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    caretColor: '#6d9197',
                    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
              </div>

              {/* Confirm Password */}
              <div className="animate-slide stagger-5" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Confirm password</span>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && <span style={{ color: '#4ade80', fontSize: '10px' }}>✓</span>}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: focusedField === 'confirmPassword' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                    border: focusedField === 'confirmPassword' ? '1px solid rgba(109,145,151,0.45)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: '#eef4f5',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    caretColor: '#6d9197',
                    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
              </div>

              {/* Phone (optional) */}
              <div className="animate-slide stagger-5" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>Phone (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 000-0000"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: '#eef4f5',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    caretColor: '#6d9197',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(109,145,151,0.45)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)' }}
                />
              </div>

              {/* User Type */}
              <div className="animate-slide stagger-6" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>I am a:</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(['patient', 'provider', 'admin'] as UserType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleUserTypeChange(type)}
                      style={{
                        flex: '1 1 calc(33.33% - 5.33px)',
                        minWidth: '100px',
                        padding: '12px',
                        background: formData.userType === type ? '#6d9197' : 'rgba(255,255,255,0.05)',
                        border: formData.userType === type ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        color: formData.userType === type ? '#07070F' : 'rgba(255,255,255,0.7)',
                        borderRadius: '9px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                        textTransform: 'capitalize',
                      }}
                      onMouseEnter={e => {
                        if (formData.userType !== type) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                          e.currentTarget.style.borderColor = 'rgba(109,145,151,0.3)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (formData.userType !== type) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="animate-slide stagger-6"
                style={{
                  padding: '14px',
                  background: loading ? 'rgba(109,145,151,0.5)' : '#6d9197',
                  color: '#07070F',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontFamily: 'inherit',
                  transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  marginTop: '8px',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(109,145,151,0.3)'
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            {/* Divider */}
            <div className="animate-slide stagger-7" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0', opacity: 0 }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Google signup */}
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="animate-slide stagger-7"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                color: '#eef4f5',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontFamily: 'inherit',
                transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(109,145,151,0.3)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>

            {/* Sign in link */}
            <p className="animate-slide stagger-7" style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#6d9197', textDecoration: 'none', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
