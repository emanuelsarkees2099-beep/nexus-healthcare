'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientClient } from '@/lib/auth-client'
import { useI18n } from '@/components/I18nContext'
import NotificationBell from '@/components/NotificationBell'
import UserMenu from '@/components/nav/UserMenu'
import MobileDrawer from '@/components/nav/MobileDrawer'

/* ── Link definitions ─────────────────────────────────────────── */
const HOME_LINK_DEFS = [
  { labelKey: 'nav.features'    as const, href: '#features',     fallback: 'Features' },
  { labelKey: 'nav.howItWorks'  as const, href: '#how',          fallback: 'How it works' },
  { labelKey: 'nav.eligibility' as const, href: '#eligibility',  fallback: 'Eligibility' },
  { labelKey: 'nav.stories'     as const, href: '#testimonials', fallback: 'Stories' },
]

const APP_LINK_DEFS = [
  { labelKey: 'nav.pathways' as const, href: '/pathways',  fallback: 'Pathways' },
  { labelKey: 'nav.programs' as const, href: '/programs',  fallback: 'Programs' },
  { labelKey: 'nav.impact'   as const, href: '/impact',    fallback: 'Impact' },
  { labelKey: 'nav.stories'  as const, href: '/stories',   fallback: 'Stories' },
  { labelKey: null,                    href: '/editorial', fallback: 'Editorial' },
  { labelKey: null,                    href: '/equity',    fallback: 'Equity' },
]

const ALL_APP_LINK_DEFS = [
  { labelKey: 'nav.pathways'    as const, href: '/pathways',    fallback: 'Pathways' },
  { labelKey: 'nav.programs'    as const, href: '/programs',    fallback: 'Programs' },
  { labelKey: 'nav.outcomes'    as const, href: '/outcomes',    fallback: 'Outcomes' },
  { labelKey: 'nav.chw'         as const, href: '/chw',         fallback: 'CHW' },
  { labelKey: 'nav.calendar'    as const, href: '/calendar',    fallback: 'Calendar' },
  { labelKey: 'nav.impact'      as const, href: '/impact',      fallback: 'Impact' },
  { labelKey: 'nav.stories'     as const, href: '/stories',     fallback: 'Stories' },
  { labelKey: null,                       href: '/editorial',   fallback: 'Editorial' },
  { labelKey: null,                       href: '/equity',      fallback: 'Equity Lab' },
  { labelKey: 'nav.provider'    as const, href: '/provider',    fallback: 'Provider' },
  { labelKey: 'nav.rights'      as const, href: '/rights',      fallback: 'Rights' },
  { labelKey: null,                       href: '/open',        fallback: 'Open' },
  { labelKey: 'nav.methodology' as const, href: '/methodology', fallback: 'Methodology' },
  { labelKey: null,                       href: '/triage',      fallback: 'Symptom Guide' },
  { labelKey: null,                       href: '/gps',         fallback: 'Healthcare GPS' },
  { labelKey: null,                       href: '/passport',    fallback: 'Health Passport' },
  { labelKey: null,                       href: '/community',   fallback: 'Community' },
  { labelKey: null,                       href: '/crisis',      fallback: 'Crisis Help' },
  { labelKey: null,                       href: '/wrapped',     fallback: 'Wrapped' },
  { labelKey: null,                       href: '/about',       fallback: 'About NEXUS' },
]

type UserProfile = { full_name?: string | null; email?: string | null; user_type?: string | null }

/**
 * P2 — initialUser prop
 *
 * When rendered via NavShell (server component), the server reads the
 * session from cookies and passes the user here as the initial state.
 * This eliminates the flash from "Sign In" → user name that happens when
 * the component has to async-fetch the session after mount.
 *
 * When used without NavShell (legacy / dynamic ssr:false), initialUser
 * is undefined and the component falls back to the existing useEffect
 * auth resolution.
 */
interface NavProps {
  initialUser?: UserProfile | null
}

export default function Nav({ initialUser }: NavProps = {}) {
  const { t } = useI18n()
  const navRef        = useRef<HTMLElement>(null)
  const pathname      = usePathname()
  const router        = useRouter()
  const isHome        = pathname === '/'
  const supabase      = createClientClient()

  const [open, setOpen]               = useState(false)
  const [scrolled, setScrolled]       = useState(false)
  // P2: seed initial state from server-side prop to avoid auth flash
  const [user, setUser]               = useState<UserProfile | null>(initialUser ?? null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [savedCount, setSavedCount]   = useState(0)

  /* Resolve link label helper */
  const resolve = (def: { labelKey: Parameters<typeof t>[0] | null; fallback: string }) =>
    def.labelKey ? t(def.labelKey) : def.fallback

  const desktopLinks = isHome
    ? HOME_LINK_DEFS.map(d => ({ label: resolve(d), href: d.href }))
    : APP_LINK_DEFS.map(d  => ({ label: resolve(d), href: d.href }))

  const drawerLinks = isHome
    ? HOME_LINK_DEFS.map(d    => ({ label: resolve(d), href: d.href }))
    : ALL_APP_LINK_DEFS.map(d => ({ label: resolve(d), href: d.href }))

  /* ── Load current user ── */
  /* P2: skip initial client-side fetch if server already injected a user via initialUser prop */
  useEffect(() => {
    if (initialUser !== undefined) return // server-side session already resolved
    const load = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          const { data: profile } = await supabase
            .from('user_profiles').select('full_name, email, user_type')
            .eq('id', data.session.user.id).single()
          setUser(profile ?? { email: data.session.user.email })
        }
      } catch { /* unauthenticated */ }
    }
    load()
  }, [supabase, initialUser])

  /* ── Live auth-state listener — keeps Nav in sync after login / logout ── */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          try {
            const { data: profile } = await supabase
              .from('user_profiles').select('full_name, email, user_type')
              .eq('id', session.user.id).single()
            setUser(profile ?? { email: session.user.email })
          } catch {
            setUser({ email: session.user.email })
          }
        } else {
          setUser(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [supabase])

  /* ── Logout ── */
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setShowUserMenu(false)
    router.push('/login')
  }

  /* ── Close user-menu on outside click ── */
  useEffect(() => {
    if (!showUserMenu) return
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-user-menu]')) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showUserMenu])

  /* ── RAF-gated scroll detection (P8) ── */
  useEffect(() => {
    let rafId = 0
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => setScrolled(window.scrollY > 48))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId) }
  }, [])

  /* ── Body scroll lock when drawer open ── */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) {
      const btn = document.getElementById('nav-hamburger')
      if (btn && document.activeElement !== btn) btn.focus()
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  /* ── Esc key to close drawer ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ── Saved clinics count (localStorage + live events) ── */
  useEffect(() => {
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

  /* ── Smooth scroll (cinematic easing) ── */
  const smoothScrollTo = useCallback((targetEl: Element) => {
    const start    = window.scrollY
    const end      = (targetEl as HTMLElement).offsetTop - 80
    const distance = end - start
    const duration = 900
    let startTime: number | null = null
    const ease = (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
    const step = (now: number) => {
      if (!startTime) startTime = now
      const progress = Math.min((now - startTime) / duration, 1)
      window.scrollTo(0, start + distance * ease(progress))
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
      {/* ── Floating nav bar ── */}
      <nav
        ref={navRef}
        id="main-nav"
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 500, width: 'calc(100% - 48px)', maxWidth: '1100px', height: '52px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
          borderRadius: '14px',
          background: scrolled ? 'rgba(8,8,18,0.88)' : 'rgba(8,8,18,0.55)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: scrolled ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.06)',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.04) inset' : 'none',
          transition: 'background 0.4s cubic-bezier(0.32,0.72,0,1), border-color 0.4s cubic-bezier(0.32,0.72,0,1), box-shadow 0.4s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* ── Logo ── */}
        <a
          href={isHome ? '#' : '/'}
          onClick={e => { if (isHome) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}
          aria-label="NEXUS — home"
          className="nav-logo"
        >
          <svg className="nav-logo-glyph" width="22" height="22" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="var(--accent)" opacity="0.95"/>
            <path transform="rotate(120 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="var(--accent)" opacity="0.95"/>
            <path transform="rotate(240 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="var(--accent)" opacity="0.95"/>
            <circle cx="50" cy="50" r="5" fill="var(--accent)" opacity="0.7"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: '11px', fontWeight: 400, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.90)', paddingRight: '0.42em', userSelect: 'none' }}>
            NEXUS
          </span>
        </a>

        {/* ── Desktop nav links ── */}
        <ul className="nav-links-desktop" role="list" style={{ display: 'flex', gap: '4px', listStyle: 'none', alignItems: 'center', margin: '0 auto', padding: 0 }}>
          {desktopLinks.map(l => {
            const isActive = !l.href.startsWith('#') && pathname === l.href
            return (
              <li key={l.href} style={{ position: 'relative' }}>
                {l.href.startsWith('#') ? (
                  <a href={l.href} onClick={e => handleAnchor(e, l.href)}
                    className="nav-link-pill"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >{l.label}</a>
                ) : (
                  <Link href={l.href}
                    className={`nav-link-pill${isActive ? ' active' : ''}`}
                    style={{ color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)', fontWeight: isActive ? 500 : 400, background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent' }}
                  >{l.label}</Link>
                )}
              </li>
            )
          })}
        </ul>

        {/* ── Desktop action row ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} className="nav-actions-desktop">

          {/* Saved clinics badge */}
          {!isHome && (
            <button
              aria-label={`Saved clinics${savedCount > 0 ? ` — ${savedCount} saved` : ''}`}
              onClick={() => router.push('/dashboard/profile')}
              className="nav-saved-btn"
              style={{
                position: 'relative', width: '34px', height: '34px', borderRadius: '9px',
                background: savedCount > 0 ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${savedCount > 0 ? 'rgba(74,144,217,0.28)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer', color: savedCount > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s, color 0.2s', flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={savedCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              {savedCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--accent)', color: '#07070F', borderRadius: '50%', minWidth: '16px', height: '16px', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-inter)', padding: '0 3px', border: '1.5px solid rgba(8,8,18,0.8)' }}>
                  {savedCount > 99 ? '99+' : savedCount}
                </span>
              )}
            </button>
          )}

          {/* ⌘K command palette hint */}
          <button
            aria-label="Open command palette (⌘K)"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
            className="nav-cmd-hint"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px', borderRadius: '8px', height: '34px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', color: 'var(--text-3)', fontSize: '11px',
              fontFamily: 'var(--font-inter)', transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <kbd style={{ fontFamily: 'var(--font-mono),monospace', fontSize: '10px', letterSpacing: '0.02em' }}>⌘K</kbd>
          </button>

          {/* Notification bell */}
          <NotificationBell />


          {/* Settings button */}
          <button
            aria-label="Open settings"
            onClick={() => document.dispatchEvent(new CustomEvent('nexus:settings:open'))}
            className="nav-settings-btn"
            style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border2)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s, color 0.2s, border-color 0.2s', flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>

          {/* User menu (sub-component) */}
          <UserMenu
            user={user}
            showUserMenu={showUserMenu}
            setShowUserMenu={setShowUserMenu}
            onLogout={handleLogout}
          />

          {/* Hamburger (mobile only) */}
          <button
            id="nav-hamburger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
            className="nav-hamburger"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'none', flexDirection: 'column', justifyContent: 'center', gap: '5px', width: '36px', height: '36px' }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', height: '1.5px', width: i === 1 ? '14px' : '20px',
                background: 'rgba(255,255,255,0.7)', borderRadius: '2px',
                transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1), opacity 0.25s, width 0.25s',
                transformOrigin: 'center',
                transform: open ? (i === 0 ? 'translateY(6.5px) rotate(45deg)' : i === 2 ? 'translateY(-6.5px) rotate(-45deg)' : 'none') : 'none',
                opacity: open && i === 1 ? 0 : 1,
                marginLeft: i === 1 ? 'auto' : 0,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer (sub-component) ── */}
      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        links={drawerLinks}
        user={user}
        onLogout={handleLogout}
        onAnchor={handleAnchor}
      />

      <style>{`
        @media (max-width: 768px) {
          #main-nav { width: calc(100% - 24px) !important; top: 10px !important; padding: 0 14px !important; }
          .nav-links-desktop { display: none !important; }
          /* Hide all action items on mobile EXCEPT the saved-clinics badge and hamburger */
          .nav-actions-desktop > *:not(.nav-hamburger):not(.nav-saved-btn) { display: none !important; }
          .nav-saved-btn { display: flex !important; }
          .nav-hamburger { display: flex !important; }
          /* ⌘K hint is desktop-only */
          .nav-cmd-hint { display: none !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
        }
        /* C3 — CSS hover states for nav elements */
        .nav-link-pill:hover { color: var(--text) !important; background: rgba(255,255,255,0.06) !important; }
        .nav-link-pill.active:hover { background: rgba(255,255,255,0.07) !important; }
        .nav-saved-btn:hover { background: rgba(74,144,217,0.2) !important; color: var(--accent) !important; }
        .nav-settings-btn:hover { background: rgba(255,255,255,0.1) !important; color: var(--text) !important; border-color: rgba(255,255,255,0.1) !important; }
        .nav-cmd-hint:hover { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.12) !important; color: var(--text-2) !important; }
      `}</style>
    </>
  )
}
