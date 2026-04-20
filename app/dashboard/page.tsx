'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import {
  ArrowRight, User, Settings, MapPin, ReceiptText, Users,
  CalendarDays, BookOpen, Scale, Megaphone, Accessibility,
  Bookmark, Heart, Phone, Loader2, CheckCircle2, Clock,
  TrendingUp, Shield, Star,
} from 'lucide-react'

const WALLET_SECTIONS = [
  {
    id: 'clinics',
    label: 'Saved Clinics',
    count: 0,
    icon: <MapPin size={16} strokeWidth={2} />,
    href: '/search',
    color: 'var(--accent)',
    bg: 'rgba(110,231,183,0.08)',
    border: 'rgba(110,231,183,0.18)',
    hint: 'Bookmark clinics to find them fast later',
  },
  {
    id: 'programs',
    label: 'Programs Matched',
    count: 0,
    icon: <ReceiptText size={16} strokeWidth={2} />,
    href: '/programs',
    color: 'var(--amber)',
    bg: 'rgba(252,211,77,0.08)',
    border: 'rgba(252,211,77,0.18)',
    hint: 'Programs you may qualify for',
  },
  {
    id: 'appointments',
    label: 'Upcoming Visits',
    count: 0,
    icon: <CalendarDays size={16} strokeWidth={2} />,
    href: '/calendar',
    color: 'var(--violet)',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.18)',
    hint: 'Track your scheduled appointments',
  },
  {
    id: 'chw',
    label: 'CHW Connection',
    count: 0,
    icon: <Users size={16} strokeWidth={2} />,
    href: '/chw',
    color: 'var(--green-pulse)',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.18)',
    hint: 'Connect with a community health worker',
  },
]

const QUICK_ACTIONS = [
  { title: 'Share Your Story',     description: 'Your experience helps others find care',      href: '/stories',     icon: <BookOpen size={16} strokeWidth={2} />,     color: 'var(--accent)'  },
  { title: 'Connect with CHWs',    description: 'Find workers who speak your language',        href: '/chw',         icon: <Users size={16} strokeWidth={2} />,        color: 'var(--violet)'  },
  { title: 'Know Your Rights',     description: 'Legal protections and EMTALA explained',      href: '/rights',      icon: <Scale size={16} strokeWidth={2} />,        color: 'var(--amber)'   },
  { title: 'Advocate for Change',  description: 'Campaigns and letters to representatives',   href: '/advocacy',    icon: <Megaphone size={16} strokeWidth={2} />,    color: 'var(--coral)'   },
  { title: 'Find Programs',        description: 'Medicaid, ACA, HRSA and 40+ programs',       href: '/programs',    icon: <ReceiptText size={16} strokeWidth={2} />,  color: 'var(--amber)'   },
  { title: 'Accessibility Help',   description: 'ADA info and reporting barriers',             href: '/accessibility', icon: <Accessibility size={16} strokeWidth={2} />, color: 'var(--green-pulse)' },
]

const CARE_TEAM = [
  { role: 'Primary Care',   status: 'None assigned', icon: <Heart size={14} strokeWidth={2} />,  filled: false },
  { role: 'Dental',         status: 'None assigned', icon: <Star size={14} strokeWidth={2} />,   filled: false },
  { role: 'Mental Health',  status: 'None assigned', icon: <Shield size={14} strokeWidth={2} />, filled: false },
  { role: 'CHW Navigator',  status: 'None assigned', icon: <Users size={14} strokeWidth={2} />,  filled: false },
]

type Profile = {
  id: string; email: string | null; full_name: string | null;
  phone: string | null; user_type: string | null
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    const supabase = createClientClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return }

      const { data } = await supabase
        .from('user_profiles').select('*').eq('id', session.user.id).single()

      if (data) {
        setProfile(data)
      } else {
        const np = { id: session.user.id, email: session.user.email ?? '', full_name: session.user.user_metadata?.full_name || 'User', phone: null, user_type: 'patient' }
        await supabase.from('user_profiles').upsert(np)
        setProfile(np)
      }

      /* Count bookmarks */
      const { count } = await supabase
        .from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id)
      setSavedCount(count ?? 0)

      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <AppShell>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Loader2 size={24} color="var(--accent)" style={{ animation: 'spin-slow 1s linear infinite' }} />
            <span style={{ color: 'var(--text-3)', fontSize: '13px', fontFamily: 'var(--font-inter)' }}>
              Loading your health wallet...
            </span>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!profile) return null

  const firstName = profile.full_name?.split(' ')[0] || 'User'
  const initials  = (profile.full_name ?? 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const walletSections = WALLET_SECTIONS.map(s => ({
    ...s,
    count: s.id === 'clinics' ? savedCount : s.count,
  }))

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

          {/* ── Profile header ── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: '24px', marginBottom: '48px', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Avatar */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(110,231,183,0.20), rgba(110,231,183,0.08))',
                border: '1px solid rgba(110,231,183,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-sora)', fontSize: '20px', fontWeight: 700,
                color: 'var(--accent)', flexShrink: 0,
              }}>
                {initials}
              </div>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(110,231,183,0.07)', border: '1px solid rgba(110,231,183,0.14)',
                  borderRadius: '100px', padding: '3px 10px', marginBottom: '8px',
                }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', animation: 'blink 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', fontFamily: 'var(--font-inter)' }}>
                    {profile.user_type === 'admin' ? 'Admin' : profile.user_type === 'provider' ? 'Provider' : 'Patient'} Account
                  </span>
                </div>
                <h1 style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
                  fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1,
                  color: 'var(--text)', marginBottom: '4px',
                }}>
                  Welcome back, {firstName}
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)' }}>
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href="/dashboard/profile" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px',
                background: 'rgba(110,231,183,0.10)', border: '1px solid rgba(110,231,183,0.22)',
                color: 'var(--accent)', borderRadius: '10px', textDecoration: 'none',
                fontWeight: 600, fontSize: '13px', fontFamily: 'var(--font-inter)',
                transition: 'background 0.2s',
              }}>
                <User size={14} /> Edit Profile
              </Link>
              {profile.user_type === 'admin' && (
                <Link href="/admin" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-2)', borderRadius: '10px', textDecoration: 'none',
                  fontWeight: 600, fontSize: '13px', fontFamily: 'var(--font-inter)',
                }}>
                  <Settings size={14} /> Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* ── Health Wallet ── */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Heart size={16} color="var(--accent)" strokeWidth={2} />
              <h2 style={{ fontFamily: 'var(--font-sora)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                My Health Wallet
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {walletSections.map(s => (
                <Link key={s.id} href={s.href} style={{ textDecoration: 'none' }}>
                  <div className="wallet-card" style={{
                    cursor: 'pointer',
                    transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.2s',
                  }}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      el.style.borderColor = s.border
                      el.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--border2)'
                      el.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '9px',
                      background: s.bg, border: `1px solid ${s.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: s.color, marginBottom: '12px',
                    }}>
                      {s.icon}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono),monospace',
                      fontSize: '28px', fontWeight: 600, color: s.count > 0 ? s.color : 'var(--text)',
                      letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px',
                    }}>
                      {s.count}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)', marginBottom: '3px' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
                      {s.count === 0 ? s.hint : `${s.count} item${s.count !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── My Care Team ── */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Shield size={16} color="var(--violet)" strokeWidth={2} />
              <h2 style={{ fontFamily: 'var(--font-sora)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                My Care Team
              </h2>
              <div style={{
                marginLeft: '8px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'var(--text-3)',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '100px', padding: '2px 8px', fontFamily: 'var(--font-inter)',
              }}>
                Coming Soon
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {CARE_TEAM.map(ct => (
                <div key={ct.role} style={{
                  background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px', padding: '16px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--violet)',
                  }}>
                    {ct.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)', marginBottom: '1px' }}>
                      {ct.role}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
                      {ct.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Account snapshot ── */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <TrendingUp size={16} color="var(--amber)" strokeWidth={2} />
              <h2 style={{ fontFamily: 'var(--font-sora)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                Account Details
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {[
                { label: 'Account Type', value: profile.user_type === 'patient' ? 'Patient' : profile.user_type === 'provider' ? 'Provider' : 'Admin' },
                { label: 'Email',        value: profile.email || '—' },
                { label: 'Phone',        value: profile.phone || 'Not provided' },
              ].map(stat => (
                <div key={stat.label} style={{
                  padding: '18px 20px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px',
                }}>
                  <p style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-inter)' }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: '15px', color: 'var(--text)', fontWeight: 500, fontFamily: 'var(--font-inter)' }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <CheckCircle2 size={16} color="var(--accent)" strokeWidth={2} />
              <h2 style={{ fontFamily: 'var(--font-sora)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                Explore
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {QUICK_ACTIONS.map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '20px 22px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '14px', textDecoration: 'none',
                    transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(110,231,183,0.18)'
                    e.currentTarget.style.background = 'rgba(110,231,183,0.03)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '9px',
                    background: `${action.color}12`, border: `1px solid ${action.color}28`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: action.color, flexShrink: 0,
                  }}>
                    {action.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)', marginBottom: '4px' }}>
                      {action.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', lineHeight: 1.5 }}>
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight size={14} color="var(--text-3)" style={{ flexShrink: 0, marginTop: '2px' }} />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  )
}
