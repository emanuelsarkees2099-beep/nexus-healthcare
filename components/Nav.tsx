'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientClient } from '@/lib/auth-client'
import { useI18n } from '@/components/I18nContext'
import NotificationBell from '@/components/NotificationBell'

/* Static hrefs + fallback labels. Labels are overridden with t() inside the component. */
const HOME_LINK_DEFS = [
  { labelKey: 'nav.features' as const,    href: '#features',     fallback: 'Features' },
  { labelKey: 'nav.howItWorks' as const,  href: '#how',          fallback: 'How it works' },
  { labelKey: 'nav.eligibility' as const, href: '#eligibility',  fallback: 'Eligibility' },
  { labelKey: 'nav.stories' as const,     href: '#testimonials', fallback: 'Stories' },
]

const APP_LINK_DEFS = [
  { labelKey: 'nav.pathways' as const,  href: '/pathways',  fallback: 'Pathways' },
  { labelKey: 'nav.programs' as const,  href: '/programs',  fallback: 'Programs' },
  { labelKey: 'nav.impact' as const,    href: '/impact',    fallback: 'Impact' },
  { labelKey: 'nav.stories' as const,   href: '/stories',   fallback: 'Stories' },
  { labelKey: null,                     href: '/editorial', fallback: 'Editorial' },
  { labelKey: null,                     href: '/equity',    fallback: 'Equity' },
]

const ALL_APP_LINK_DEFS = [
  { labelKey: 'nav.pathways' as const,    href: '/pathways',  fallback: 'Pathways' },
  { labelKey: 'nav.programs' as const,    href: '/programs',  fallback: 'Programs' },
  { labelKey: 'nav.outcomes' as const,    href: '/outcomes',  fallback: 'Outcomes' },
  { labelKey: 'nav.chw' as const,         href: '/chw',       fallback: 'CHW' },
  { labelKey: 'nav.calendar' as const,    href: '/calendar',  fallback: 'Calendar' },
  { labelKey: 'nav.impact' as const,      href: '/impact',    fallback: 'Impact' },
  { labelKey: 'nav.stories' as const,     href: '/stories',   fallback: 'Stories' },
  { labelKey: null,                        href: '/editorial', fallback: 'Editorial' },
  { labelKey: null,                        href: '/equity',    fallback: 'Equity Lab' },
  { labelKey: 'nav.provider' as const,    href: '/provider',  fallback: 'Provider' },
  { labelKey: 'nav.rights' as const,      href: '/rights',    fallback: 'Rights' },
  { labelKey: null,                        href: '/open',      fallback: 'Open' },
  { labelKey: 'nav.methodology' as const, href: '/methodology', fallback: 'Methodology' },
  { labelKey: null,                        href: '/triage',    fallback: 'AI Triage' },
  { labelKey: null,                        href: '/gps',       fallback: 'Healthcare GPS' },
  { labelKey: null,                        href: '/passport',  fallback: 'Health Passport' },
  { labelKey: null,                        href: '/community', fallback: 'Community' },
  { labelKey: null,                        href: '/crisis',    fallback: 'Crisis Help' },
  { labelKey: null,                        href: '/wrapped',   fallback: 'Wrapped' },
]

export default function Nav() {
  const { t } = useI18n()
  const navRef      = useRef<HTMLElement>(null)
  const drawerRef   = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser]       = useState<{ full_name?: string | null; email?: string | null; user_type?: string | null } | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const pathname  = usePathname()
  const router    = useRouter()
  const isHome       = pathname === '/'
  const supabase = createClientClient()

  /* Build translated link arrays from defs */
  const resolveLabel = (def: { labelKey: Parameters<typeof t>[0] | null; fallback: string }) =>
    def.labelKey ? t(def.labelKey) : def.fallback

  const links       = isHome
    ? HOME_LINK_DEFS.map(d => ({ label: resolveLabel(d), href: d.href }))
    : APP_LINK_DEFS.map(d  => ({ label: resolveLabel(d), href: d.href }))
  const drawerLinks = isHome
    ? HOME_LINK_DEFS.map(d      => ({ label: resolveLabel(d), href: d.href }))
    : ALL_APP_LINK_DEFS.map(d   => ({ label: resolveLabel(d), href: d.href }))

  /* ── Load current user ── */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, email, user_type')
            .eq('id', data.session.user.id)
            .single()
          setUser(profile ?? { email: data.session.user.email })
        }
      } catch { /* unauthenticated */ }
    }
    loadUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    document.cookie = 'sb-access-token=; path=/; max-age=0'
    document.cookie = 'sb-refresh-token=; path=/; max-age=0'
    setUser(null)
    setShowUserMenu(false)
    router.push('/login')
  }

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-user-menu]')) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showUserMenu])

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Lock body when open ── */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    // Restore focus to hamburger when drawer closes
    if (!open) {
      const btn = document.getElementById('nav-hamburger')
      if (btn && document.activeElement !== btn) btn.focus()
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  /* ── Esc key ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ── Focus trap: keyboard users cannot Tab out of the open drawer ── */
  useEffect(() => {
    if (!open) return
    const drawer = drawerRef.current
    if (!drawer) return

    // Collect all focusable elements inside the drawer
    const focusable = Array.from(
      drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.offsetParent !== null) // visible only

    if (!focusable.length) return
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]

    // Move initial focus into the drawer
    first.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus() }
      }
    }

    drawer.addEventListener('keydown', trap)
    return () => drawer.removeEventListener('keydown', trap)
  }, [open])

  /* ── Swipe-to-dismiss drawer (#25) ── */
  useEffect(() => {
    const el = drawerRef.current
    if (!el) return
    const onTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX }
    const onTouchEnd   = (e: TouchEvent) => {
      const delta = e.changedTouches[0].clientX - touchStartX.current
      if (delta > 64) setOpen(false)           // right-swipe → close
    }
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [])

  /* ── Saved clinics count (from localStorage + live events) ── */
  useEffect(() => {
    // Read initial count from localStorage
    try {
      const raw = localStorage.getItem('nexus_saved_count')
      if (raw) setSavedCount(parseInt(raw) || 0)
    } catch { /* SSR */ }

    const handler = (e: Event) => {
      const count = (e as CustomEvent<number>).detail
      setSavedCount(count)
      try { localStorage.setItem('nexus_saved_count', String(count)) } catch { /* ignore */ }
    }
    window.addEventListener('nexus:saved-count', handler as EventListener)
    return () => window.removeEventListener('nexus:saved-count', handler as EventListener)
  }, [])

  /* ── Cinematic smooth scroll with custom easing ── */
  const smoothScrollTo = useCallback((targetEl: Element) => {
    const start = window.scrollY
    const end = (targetEl as HTMLElement).offsetTop - 80
    const distance = end - start
    const duration = 900
    let startTime: number | null = null

    function easeInOutQuart(t: number) {
      return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
    }

    function step(now: number) {
      if (!startTime) startTime = now
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      window.scrollTo(0, start + distance * easeInOutQuart(progress))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [])

  const handleAnchor = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setOpen(false)
    const target = document.querySelector(href)
    if (target) smoothScrollTo(target)
  }, [smoothScrollTo])

  return (
    <>
      {/* ── Main nav ── */}
      <nav
        ref={navRef}
        id="main-nav"
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 500,
          width: 'calc(100% - 48px)',
          maxWidth: '1100px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderRadius: '14px',
          background: scrolled
            ? 'rgba(8,8,18,0.88)'
            : 'rgba(8,8,18,0.55)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: scrolled
            ? '1px solid rgba(255,255,255,0.09)'
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow: scrolled
            ? '0 8px 32px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.04) inset'
            : 'none',
          transition: 'background 0.4s cubic-bezier(0.32,0.72,0,1), border-color 0.4s cubic-bezier(0.32,0.72,0,1), box-shadow 0.4s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Left — Logomark + Wordmark (#18) */}
        <a
          href={isHome ? '#' : '/'}
          onClick={e => { if (isHome) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}
          aria-label="NEXUS — home"
          className="nav-logo"
        >
          {/* Abstract N-hexagon glyph */}
          <svg
            className="nav-logo-glyph"
            width="20" height="20" viewBox="0 0 20 20"
            fill="none" aria-hidden="true"
          >
            <polygon
              points="10,1 18,5.5 18,14.5 10,19 2,14.5 2,5.5"
              stroke="var(--accent)" strokeWidth="1.4"
              fill="rgba(110,231,183,0.08)"
            />
            <path
              d="M6.5 13.5V6.5L10 13l3.5-6.5V13.5"
              stroke="var(--accent)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span style={{
            fontFamily: 'var(--font-orbitron)',
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.90)',
            paddingRight: '0.42em',
            userSelect: 'none',
          }}>
            NEXUS
          </span>
        </a>

        {/* Center — nav links (desktop) */}
        <ul
          className="nav-links-desktop"
          role="list"
          style={{ display: 'flex', gap: '4px', listStyle: 'none', alignItems: 'center', margin: '0 auto', padding: 0 }}
        >
          {links.map((l) => {
            const isActive = !l.href.startsWith('#') && pathname === l.href
            return (
              <li key={l.href} style={{ position: 'relative' }}>
                {l.href.startsWith('#') ? (
                  <a
                    href={l.href}
                    onClick={e => handleAnchor(e, l.href)}
                    className="nav-link-pill"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent' }}
                  >{l.label}</a>
                ) : (
                  <Link
                    href={l.href}
                    className={`nav-link-pill${isActive ? ' active' : ''}`}
                    style={{
                      color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                      fontWeight: isActive ? 500 : 400,
                      background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent' } }}
                  >{l.label}</Link>
                )}
              </li>
            )
          })}
        </ul>

        {/* Right — actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} className="nav-actions-desktop">
          {/* Saved clinics badge */}
          {!isHome && (
            <button
              aria-label={`Saved clinics${savedCount > 0 ? ` — ${savedCount} saved` : ''}`}
              onClick={() => router.push('/dashboard')}
              style={{
                position: 'relative',
                width: '34px', height: '34px', borderRadius: '9px',
                background: savedCount > 0 ? 'rgba(110,231,183,0.12)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${savedCount > 0 ? 'rgba(110,231,183,0.28)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer',
                color: savedCount > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(110,231,183,0.2)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.background = savedCount > 0 ? 'rgba(110,231,183,0.12)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = savedCount > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.4)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={savedCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              {savedCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-5px', right: '-5px',
                  background: 'var(--accent)', color: '#07070F',
                  borderRadius: '50%', minWidth: '16px', height: '16px',
                  fontSize: '9px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-inter)', padding: '0 3px',
                  border: '1.5px solid rgba(8,8,18,0.8)',
                }}>{savedCount > 99 ? '99+' : savedCount}</span>
              )}
            </button>
          )}

          {/* Notification bell */}
          <NotificationBell />

          {/* Beta pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '100px',
            padding: '4px 10px 4px 8px',
            fontSize: '11px', color: 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--font-inter)',
          }}>
            <span style={{
              width: '5px', height: '5px',
              background: 'var(--accent)', borderRadius: '50%',
              animation: 'pulse-dot 2s ease-in-out infinite',
              flexShrink: 0,
            }} aria-hidden="true" />
            Beta
          </div>

          {/* Settings button */}
          <button
            aria-label="Open settings"
            onClick={() => document.dispatchEvent(new CustomEvent('nexus:settings:open'))}
            style={{
              width: '34px', height: '34px', borderRadius: '9px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border2)',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, color 0.2s, border-color 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>

          {user ? (
            /* ── User avatar + dropdown ── */
            <div style={{ position: 'relative' }} data-user-menu>
              <button
                onClick={() => setShowUserMenu(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(110,231,183,0.12)',
                  border: '1px solid rgba(110,231,183,0.25)',
                  borderRadius: '9px', padding: '6px 12px 6px 8px',
                  cursor: 'pointer', color: '#eef4f5',
                  fontFamily: 'var(--font-inter)', fontSize: '12.5px', fontWeight: 500,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(110,231,183,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(110,231,183,0.12)'}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: '#07070F', flexShrink: 0,
                }}>
                  {(user.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                {user.full_name?.split(' ')[0] || 'Account'}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5, transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {showUserMenu && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'rgba(10,10,22,0.97)', border: '1px solid rgba(0,0,0,0.09)',
                  borderRadius: '12px', padding: '6px', minWidth: '180px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  zIndex: 600,
                }}>
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#eef4f5' }}>{user.full_name || 'User'}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>{user.email}</div>
                  </div>
                  {[
                    { label: t('nav.dashboard'), href: '/dashboard' },
                    { label: 'Profile', href: '/dashboard/profile' },
                  ].map(item => (
                    <button key={item.href}
                      onClick={() => { router.push(item.href); setShowUserMenu(false) }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', borderRadius: '7px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-inter)', transition: 'background 0.15s, color 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#eef4f5' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                    >{item.label}</button>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px', paddingTop: '4px' }} />
                  <button
                    onClick={handleLogout}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', borderRadius: '7px', color: 'rgba(255,107,107,0.8)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-inter)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >{t('nav.signOut')}</button>
                </div>
              )}
            </div>
          ) : (
            /* ── Login / Find care ── */
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => router.push('/login')}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '9px', padding: '7px 14px', fontFamily: 'var(--font-inter)', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer', color: 'rgba(255,255,255,0.7)', transition: 'border-color 0.2s, color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
              >{t('nav.signIn')}</button>
              <button
                style={{ background: 'rgba(255,255,255,0.94)', color: '#08081a', border: 'none', borderRadius: '9px', padding: '8px 18px', fontFamily: 'var(--font-inter)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.01em', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.25)' }}
                onClick={() => router.push('/signup')}
              >{t('nav.getStarted')}</button>
            </div>
          )}

          {/* Hamburger */}
          <button
            id="nav-hamburger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
            className="nav-hamburger"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px', display: 'none',
              flexDirection: 'column', justifyContent: 'center', gap: '5px',
              width: '36px', height: '36px',
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', height: '1.5px', width: i === 1 ? '14px' : '20px',
                background: 'rgba(255,255,255,0.7)', borderRadius: '2px',
                transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1), opacity 0.25s, width 0.25s',
                transformOrigin: 'center',
                transform: open
                  ? (i === 0 ? 'translateY(6.5px) rotate(45deg)' : i === 2 ? 'translateY(-6.5px) rotate(-45deg)' : 'none')
                  : 'none',
                opacity: open && i === 1 ? 0 : 1,
                marginLeft: i === 1 ? 'auto' : 0,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* ── Overlay ── */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 498,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.35s cubic-bezier(0.32,0.72,0,1)',
        }}
      />

      {/* ── Mobile drawer — spring-physics slide (#19) + swipe ref (#25) ── */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Navigation menu"
        aria-hidden={!open}
        style={{
          position: 'fixed', top: '10px', right: '10px',
          width: '290px',
          zIndex: 499,
          background: 'rgba(8,10,22,0.97)',
          backdropFilter: 'blur(48px) saturate(180%)',
          WebkitBackdropFilter: 'blur(48px) saturate(180%)',
          border: '1px solid rgba(110,231,183,0.08)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
          transform: open
            ? 'scale(1) translateX(0) translateY(0)'
            : 'scale(0.92) translateX(24px) translateY(-8px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transformOrigin: 'top right',
          transition: open
            ? 'transform 0.5s cubic-bezier(0.34,1.3,0.64,1), opacity 0.3s ease'
            : 'transform 0.3s cubic-bezier(0.4,0,1,1), opacity 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: '10px', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.6)', paddingRight: '0.4em' }}>NEXUS</span>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', width: '28px', height: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px', margin: '0 0 16px', padding: 0 }}>
          {drawerLinks.map((l, i) => {
            const isActive = !l.href.startsWith('#') && pathname === l.href
            return (
              <li key={l.href} style={{
                opacity: open ? 1 : 0,
                transform: open ? 'translateX(0)' : 'translateX(18px)',
                transition: open
                  ? `opacity 0.45s ${0.08 + i * 0.04}s cubic-bezier(0.16,1,0.3,1), transform 0.45s ${0.08 + i * 0.04}s cubic-bezier(0.34,1.3,0.64,1)`
                  : `opacity 0.15s ease, transform 0.15s ease`,
              }}>
                {l.href.startsWith('#') ? (
                  <a href={l.href} onClick={e => handleAnchor(e, l.href)}
                    style={{ display: 'block', color: 'rgba(255,255,255,0.65)', fontSize: '14px', fontFamily: 'var(--font-inter)', fontWeight: 400, textDecoration: 'none', padding: '10px 12px', borderRadius: '9px', transition: 'background 0.2s, color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.95)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
                  >{l.label}</a>
                ) : (
                  <Link href={l.href} onClick={() => setOpen(false)}
                    style={{ display: 'block', color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)', fontSize: '14px', fontFamily: 'var(--font-inter)', fontWeight: isActive ? 500 : 400, textDecoration: 'none', padding: '10px 12px', borderRadius: '9px', background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent', transition: 'background 0.2s, color 0.2s' }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.95)' } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = isActive ? 'rgba(255,255,255,0.07)' : ''; e.currentTarget.style.color = isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)' } }}
                  >{l.label}</Link>
                )}
              </li>
            )
          })}
        </ul>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '14px',
          opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s 0.22s, transform 0.3s 0.22s cubic-bezier(0.32,0.72,0,1)',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {user ? (
            <>
              <div style={{ padding: '8px 12px', borderRadius: '9px', background: 'rgba(110,231,183,0.08)', marginBottom: '2px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#eef4f5' }}>{user.full_name || 'User'}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{user.email}</div>
              </div>
              <button onClick={() => { setOpen(false); router.push('/dashboard') }} style={{ width: '100%', background: 'rgba(255,255,255,0.93)', color: '#08081a', border: 'none', borderRadius: '10px', padding: '12px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{t('nav.dashboard')}</button>
              <button onClick={() => { setOpen(false); handleLogout() }} style={{ width: '100%', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '10px', padding: '11px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{t('nav.signOut')}</button>
            </>
          ) : (
            <>
              <button onClick={() => { setOpen(false); router.push('/login') }} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '11px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{t('nav.signIn')}</button>
              <button onClick={() => { setOpen(false); router.push('/signup') }} style={{ width: '100%', background: 'rgba(255,255,255,0.93)', color: '#08081a', border: 'none', borderRadius: '10px', padding: '12px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{t('nav.getStarted')}</button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #main-nav { width: calc(100% - 24px) !important; top: 10px !important; padding: 0 14px !important; }
          .nav-links-desktop { display: none !important; }
          .nav-actions-desktop > *:not(.nav-hamburger) { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
        }
      `}</style>
    </>
  )
}
