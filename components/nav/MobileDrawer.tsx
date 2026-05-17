'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useI18n } from '@/components/I18nContext'

type NavLink = { label: string; href: string }

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  links: NavLink[]
  user: { full_name?: string | null; email?: string | null } | null
  onLogout: () => void
  onAnchor: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
}

export default function MobileDrawer({ open, onClose, links, user, onLogout, onAnchor }: MobileDrawerProps) {
  const { t } = useI18n()
  const router   = useRouter()
  const pathname = usePathname()
  const drawerRef    = useRef<HTMLDivElement>(null)
  const touchStartX  = useRef(0)

  /* ── Focus trap ── */
  useEffect(() => {
    if (!open) return
    const drawer = drawerRef.current
    if (!drawer) return
    const focusable = Array.from(
      drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.offsetParent !== null)
    if (!focusable.length) return
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    first.focus()
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    drawer.addEventListener('keydown', trap)
    return () => drawer.removeEventListener('keydown', trap)
  }, [open])

  /* ── Swipe-to-dismiss ── */
  useEffect(() => {
    const el = drawerRef.current
    if (!el) return
    const onTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX }
    const onTouchEnd   = (e: TouchEvent) => {
      if (e.changedTouches[0].clientX - touchStartX.current > 64) onClose()
    }
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [onClose])

  return (
    <>
      {/* Backdrop overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 498,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.35s cubic-bezier(0.32,0.72,0,1)',
        }}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        aria-hidden={!open}
        style={{
          position: 'fixed', top: '10px', right: '10px',
          width: '290px', zIndex: 499,
          background: 'rgba(8,10,22,0.97)',
          backdropFilter: 'blur(48px) saturate(180%)',
          WebkitBackdropFilter: 'blur(48px) saturate(180%)',
          border: '1px solid rgba(74,144,217,0.08)',
          borderRadius: '20px', padding: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
          transform: open ? 'scale(1) translateX(0) translateY(0)' : 'scale(0.92) translateX(24px) translateY(-8px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transformOrigin: 'top right',
          transition: open
            ? 'transform 0.5s cubic-bezier(0.34,1.3,0.64,1), opacity 0.3s ease'
            : 'transform 0.3s cubic-bezier(0.4,0,1,1), opacity 0.2s ease',
        }}
      >
        {/* Drawer header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: '10px', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.6)', paddingRight: '0.4em' }}>NEXUS</span>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="drawer-close-btn"
            style={{
              background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)', width: '28px', height: '28px',
              borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Nav link list */}
        <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px', margin: '0 0 16px', padding: 0 }}>
          {links.map((l, i) => {
            const isActive = !l.href.startsWith('#') && pathname === l.href
            return (
              <li key={l.href} style={{
                opacity: open ? 1 : 0,
                transform: open ? 'translateX(0)' : 'translateX(18px)',
                transition: open
                  ? `opacity 0.45s ${0.08 + i * 0.04}s cubic-bezier(0.16,1,0.3,1), transform 0.45s ${0.08 + i * 0.04}s cubic-bezier(0.34,1.3,0.64,1)`
                  : 'opacity 0.15s ease, transform 0.15s ease',
              }}>
                {l.href.startsWith('#') ? (
                  <a
                    href={l.href}
                    onClick={e => onAnchor(e, l.href)}
                    className="drawer-nav-link"
                    style={{ display: 'block', color: 'rgba(255,255,255,0.65)', fontSize: '14px', fontFamily: 'var(--font-inter)', fontWeight: 400, textDecoration: 'none', padding: '10px 12px', borderRadius: '9px', transition: 'background 0.2s, color 0.2s' }}
                  >{l.label}</a>
                ) : (
                  <Link
                    href={l.href}
                    onClick={onClose}
                    className="drawer-nav-link"
                    style={{ display: 'block', color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)', fontSize: '14px', fontFamily: 'var(--font-inter)', fontWeight: isActive ? 500 : 400, textDecoration: 'none', padding: '10px 12px', borderRadius: '9px', background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent', transition: 'background 0.2s, color 0.2s' }}
                  >{l.label}</Link>
                )}
              </li>
            )
          })}
        </ul>

        {/* Auth section */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '14px',
          opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s 0.22s, transform 0.3s 0.22s cubic-bezier(0.32,0.72,0,1)',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {user ? (
            <>
              <div style={{ padding: '8px 12px', borderRadius: '9px', background: 'rgba(74,144,217,0.08)', marginBottom: '2px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#eef4f5' }}>{user.full_name || 'User'}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{user.email}</div>
              </div>
              <button
                onClick={() => { onClose(); router.push('/dashboard') }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.93)', color: '#08081a', border: 'none', borderRadius: '10px', padding: '12px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >{t('nav.dashboard')}</button>
              <button
                onClick={() => { onClose(); onLogout() }}
                style={{ width: '100%', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '10px', padding: '11px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >{t('nav.signOut')}</button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onClose(); router.push('/login') }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '11px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
              >{t('nav.signIn')}</button>
              <button
                onClick={() => { onClose(); router.push('/signup') }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.93)', color: '#08081a', border: 'none', borderRadius: '10px', padding: '12px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >{t('nav.getStarted')}</button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .drawer-close-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .drawer-nav-link:hover { background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,0.95) !important; }
      `}</style>
    </>
  )
}
