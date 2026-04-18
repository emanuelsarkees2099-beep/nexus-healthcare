'use client'
import { useEffect, useState } from 'react'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'
import { ArrowRight, User, Settings } from 'lucide-react'
import RecentSubmissions from '@/components/RecentSubmissions'

const DASHBOARD_LINKS = [
  { title: 'Share Your Story', description: 'Tell us about your healthcare journey', href: '/stories', icon: '📖' },
  { title: 'Connect with CHWs', description: 'Find community health workers near you', href: '/chw', icon: '🤝' },
  { title: 'Get Legal Help', description: 'Access free legal aid for healthcare issues', href: '/rights', icon: '⚖️' },
  { title: 'Advocate for Change', description: 'Participate in policy campaigns', href: '/advocacy', icon: '📢' },
  { title: 'Find Programs', description: 'Discover eligibility programs you may qualify for', href: '/programs', icon: '🎯' },
  { title: 'Report Issues', description: 'Help us improve accessibility', href: '/accessibility', icon: '♿' },
]

type Profile = {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  user_type: string | null
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClientClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login'
        return
      }

      // Load profile
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setProfile(data)
      } else {
        // Profile doesn't exist yet — create it from session data
        const newProfile = {
          id: session.user.id,
          email: session.user.email ?? '',
          full_name: session.user.user_metadata?.full_name || 'User',
          phone: null,
          user_type: 'patient',
        }
        await supabase.from('user_profiles').upsert(newProfile)
        setProfile(newProfile)
      }

      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  if (!profile) return null

  const firstName = profile.full_name?.split(' ')[0] || 'User'

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', paddingTop: '120px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '60px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
            {profile.user_type === 'provider'
              ? 'Manage your provider profile and track your clinic'
              : profile.user_type === 'admin'
                ? 'Admin dashboard'
                : 'Explore resources and help improve healthcare access'}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/dashboard/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#6d9197', color: '#07070F', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
              <User size={16} />
              Edit Profile
            </Link>
            {profile.user_type === 'admin' && (
              <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#eef4f5', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                <Settings size={16} />
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '60px' }}>
          {[
            { label: 'Account Type', value: profile.user_type === 'patient' ? 'Patient' : profile.user_type === 'provider' ? 'Provider' : 'Admin' },
            { label: 'Email', value: profile.email },
            { label: 'Phone', value: profile.phone || 'Not provided' },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '8px' }}>{stat.label}</p>
              <p style={{ fontSize: '16px', color: '#eef4f5', fontWeight: 600 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Submissions */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#ffffff' }}>Recent submissions</h2>
          <RecentSubmissions />
        </div>

        {/* Action Links */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#ffffff' }}>Explore</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {DASHBOARD_LINKS.map((link, i) => (
              <Link key={i} href={link.href} style={{ display: 'flex', flexDirection: 'column', padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.25s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(109,145,151,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
              >
                <span style={{ fontSize: '32px', marginBottom: '12px' }}>{link.icon}</span>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#eef4f5', marginBottom: '6px' }}>{link.title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', flex: 1 }}>{link.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6d9197', fontSize: '13px', fontWeight: 600 }}>
                  Explore <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
