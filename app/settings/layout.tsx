'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldTick, Profile2User } from 'iconsax-react'

const NAV = [
  { href: '/settings/profile',  label: 'Profile',  icon: Profile2User },
  { href: '/settings/security', label: 'Security', icon: ShieldTick },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg, #07070F)',
      padding: '40px 20px',
      fontFamily: 'inherit',
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Link href="/dashboard" style={{
            fontSize: '12px', color: 'var(--text-3, #6b7280)', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            marginBottom: '16px', transition: 'color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent, #4F8EF0)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3, #6b7280)')}>
            ← Dashboard
          </Link>
          <h1 style={{
            fontSize: '24px', fontWeight: 700, letterSpacing: '-0.025em',
            color: 'var(--text, #e8eaf0)',
          }}>
            Settings
          </h1>
        </div>

        {/* Nav tabs */}
        <div style={{
          display: 'flex', gap: '4px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          marginBottom: '28px',
        }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 14px',
                fontSize: '13px', fontWeight: active ? 600 : 400,
                color: active ? 'var(--text, #e8eaf0)' : 'var(--text-3, #6b7280)',
                textDecoration: 'none',
                borderBottom: `2px solid ${active ? 'var(--accent, #4F8EF0)' : 'transparent'}`,
                marginBottom: '-1px',
                transition: 'color 0.15s',
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-2, #c9d1d9)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-3, #6b7280)' }}>
                <Icon size={14} color="currentColor" variant={active ? 'TwoTone' : 'Linear'} />
                {label}
              </Link>
            )
          })}
        </div>

        {children}
      </div>
    </div>
  )
}
