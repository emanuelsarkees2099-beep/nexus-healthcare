'use client'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/components/I18nContext'
import { ArrowDown2 } from 'iconsax-react'

interface UserMenuProps {
  user: { full_name?: string | null; email?: string | null; user_type?: string | null } | null
  showUserMenu: boolean
  setShowUserMenu: (v: boolean) => void
  onLogout: () => void
}

export default function UserMenu({ user, showUserMenu, setShowUserMenu, onLogout }: UserMenuProps) {
  const { t } = useI18n()
  const router = useRouter()

  if (!user) {
    return (
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => router.push('/login')}
          className="nav-sign-in"
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '9px',
            padding: '7px 14px', fontFamily: 'var(--font-inter)', fontSize: '12.5px', fontWeight: 500,
            cursor: 'pointer', color: 'rgba(255,255,255,0.7)', transition: 'border-color 0.2s, color 0.2s',
          }}
        >{t('nav.signIn')}</button>
        <button
          onClick={() => router.push('/signup')}
          className="nav-get-started"
          style={{
            background: 'rgba(255,255,255,0.94)', color: '#08081a', border: 'none',
            borderRadius: '9px', padding: '8px 18px', fontFamily: 'var(--font-inter)',
            fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.01em',
            transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          }}
        >{t('nav.getStarted')}</button>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }} data-user-menu>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="nav-user-btn"
        aria-expanded={showUserMenu}
        aria-haspopup="true"
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.25)',
          borderRadius: '9px', padding: '6px 12px 6px 8px',
          cursor: 'pointer', color: '#eef4f5',
          fontFamily: 'var(--font-inter)', fontSize: '12.5px', fontWeight: 500,
          transition: 'background 0.2s',
        }}
      >
        {/* Avatar circle */}
        <div style={{
          width: '22px', height: '22px', borderRadius: '50%',
          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 700, color: '#07070F', flexShrink: 0,
        }}>
          {(user.full_name || user.email || 'U')[0].toUpperCase()}
        </div>
        {user.full_name?.split(' ')[0] || 'Account'}
        <ArrowDown2
          size={14} color="currentColor" variant="Linear"
          aria-hidden="true"
          style={{ opacity: 0.5, transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      {showUserMenu && (
        <div
          role="menu"
          aria-label="User account menu"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: 'rgba(10,10,22,0.97)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '12px', padding: '6px', minWidth: '180px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 600,
          }}
        >
          {/* User info header */}
          <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#eef4f5' }}>{user.full_name || 'User'}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>{user.email}</div>
          </div>

          {/* Menu items */}
          {[
            { label: t('nav.dashboard'), href: '/dashboard' },
            { label: 'Profile',         href: '/dashboard/profile' },
          ].map(item => (
            <button
              key={item.href}
              role="menuitem"
              onClick={() => { router.push(item.href); setShowUserMenu(false) }}
              className="user-menu-item"
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', background: 'none', border: 'none',
                borderRadius: '7px', color: 'rgba(255,255,255,0.7)',
                fontSize: '13px', cursor: 'pointer',
                fontFamily: 'var(--font-inter)', transition: 'background 0.15s, color 0.15s',
              }}
            >{item.label}</button>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '4px 0' }} />

          <button
            role="menuitem"
            onClick={onLogout}
            className="user-menu-signout"
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 12px', background: 'none', border: 'none',
              borderRadius: '7px', color: 'rgba(255,107,107,0.8)',
              fontSize: '13px', cursor: 'pointer',
              fontFamily: 'var(--font-inter)', transition: 'background 0.15s',
            }}
          >{t('nav.signOut')}</button>
        </div>
      )}

      <style>{`
        .nav-sign-in:hover { border-color: rgba(255,255,255,0.25) !important; color: #fff !important; }
        .nav-get-started:hover { transform: translateY(-1px) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important; }
        .nav-user-btn:hover { background: rgba(74,144,217,0.2) !important; }
        .user-menu-item:hover { background: rgba(255,255,255,0.06) !important; color: #eef4f5 !important; }
        .user-menu-signout:hover { background: rgba(255,107,107,0.08) !important; }
      `}</style>
    </div>
  )
}
