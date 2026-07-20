'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClientClient } from '@/lib/auth-client'
import { useI18n } from '@/components/I18nContext'
import UserMenu from '@/components/nav/UserMenu'
import MobileDrawer from '@/components/nav/MobileDrawer'
import MegaMenu from '@/components/nav/MegaMenu'
import {
  SearchNormal1, Buildings, ReceiptText, Book1,
  ArrowDown2, SearchStatus, Grid5, Notification as NotifIcon,
} from 'iconsax-react'

/* ── Lazy-load the notification bell (heavier component) ── */
const NotificationBell = dynamic(() => import('@/components/NotificationBell'), { ssr: false })

/* ── Link definitions ─────────────────────────────────────────── */
const HOME_LINK_DEFS = [
  { labelKey: 'nav.features'    as const, href: '#features',     fallback: 'Features',   icon: Grid5 },
  { labelKey: 'nav.howItWorks'  as const, href: '#how',          fallback: 'How it works',icon: SearchStatus },
  { labelKey: 'nav.eligibility' as const, href: '#eligibility',  fallback: 'Eligibility', icon: ReceiptText },
  { labelKey: 'nav.stories'     as const, href: '#testimonials', fallback: 'Stories',     icon: Book1 },
]

const APP_LINK_DEFS = [
  { labelKey: null,            href: '/search',    fallback: 'Search',   icon: SearchNormal1 },
  { labelKey: 'nav.programs' as const,  href: '/programs',  fallback: 'Programs', icon: ReceiptText   },
  { labelKey: null,            href: '/clinics',   fallback: 'Clinics',  icon: Buildings     },
  { labelKey: 'nav.stories' as const,   href: '/stories',   fallback: 'Stories',  icon: Book1         },
]

/* Feature triage (launch): nav carries only the core patient journey.
   Institutional/partner pages (Outcomes, CHW, Impact, Equity,
   Advocacy, Methodology, Editorial, Calendar) stay reachable via Footer. */
const ALL_APP_LINK_DEFS = [
  { labelKey: 'nav.pathways' as const, href: '/pathways',    fallback: 'Pathways' },
  { labelKey: 'nav.programs' as const, href: '/programs',    fallback: 'Programs' },
  { labelKey: null,                    href: '/triage',      fallback: 'Symptom Guide' },
  { labelKey: null,                    href: '/medications', fallback: 'Medications' },
  { labelKey: null,                    href: '/passport',    fallback: 'Health Passport' },
  { labelKey: 'nav.rights'   as const, href: '/rights',      fallback: 'Rights' },
  { labelKey: 'nav.stories'  as const, href: '/stories',     fallback: 'Stories' },
  { labelKey: null,                    href: '/crisis',      fallback: 'Crisis Help' },
  { labelKey: null,                    href: '/about',       fallback: 'About NEXUS' },
]

type UserProfile = { full_name?: string | null; email?: string | null; user_type?: string | null }

interface NavProps {
  initialUser?: UserProfile | null
}

export default function Nav({ initialUser }: NavProps = {}) {
  const { t }      = useI18n()
  const navRef     = useRef<HTMLElement>(null)
  const pathname   = usePathname()
  const router     = useRouter()
  const isHome     = pathname === '/'
  const supabase   = createClientClient()

  const [open,         setOpen]         = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [user,         setUser]         = useState<UserProfile | null>(initialUser ?? null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [megaOpen,     setMegaOpen]     = useState(false)
  const [mounted,      setMounted]      = useState(false)

  const resolve = (def: { labelKey: Parameters<typeof t>[0] | null; fallback: string }) =>
    def.labelKey ? t(def.labelKey) : def.fallback

  const desktopLinks = isHome
    ? HOME_LINK_DEFS.map(d => ({ label: resolve(d), href: d.href, icon: d.icon }))
    : APP_LINK_DEFS.map(d  => ({ label: resolve(d), href: d.href, icon: d.icon }))

  const drawerLinks = isHome
    ? HOME_LINK_DEFS.map(d    => ({ label: resolve(d), href: d.href }))
    : ALL_APP_LINK_DEFS.map(d => ({ label: resolve(d), href: d.href }))

  /* Mount flag for entrance animation */
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  /* ── Load current user ── */
  useEffect(() => {
    if (initialUser !== undefined) return
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

  /* ── Live auth-state sync ── */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          try {
            const { data: profile } = await supabase
              .from('user_profiles').select('full_name, email, user_type')
              .eq('id', session.user.id).single()
            setUser(profile ?? { email: session.user.email })
          } catch { setUser({ email: session.user.email }) }
        } else { setUser(null) }
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

  /* ── RAF-gated scroll detection ── */
  useEffect(() => {
    let rafId = 0
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => setScrolled(window.scrollY > 80))
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

  /* ── Esc key to close drawer / megamenu ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setMegaOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ── Smooth scroll ── */
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

  /* ── Open CommandPalette via keyboard simulation ── */
  const openCommandPalette = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))
  }, [])

  return (
    <>
      {/* ── Floating nav bar ── */}
      <nav
        ref={navRef}
        id="main-nav"
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed', top: '16px', left: '50%',
          zIndex: 500, width: 'calc(100% - 48px)', maxWidth: '1100px',
          height: '52px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
          borderRadius: '14px',
          background: scrolled ? 'rgba(10,12,16,0.82)' : 'rgba(10,12,16,0.04)',
          backdropFilter: scrolled ? 'blur(24px) saturate(160%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(160%)' : 'none',
          border: scrolled
            ? '1px solid rgba(163,190,241,0.12)'
            : '1px solid rgba(163,190,241,0.00)',
          boxShadow: scrolled
            ? '0 8px 32px rgba(0,0,0,0.40), 0 1px 0 rgba(255,255,255,0.05) inset'
            : 'none',
          transition: 'background 0.6s cubic-bezier(0.32,0.72,0,1), backdrop-filter 0.6s, -webkit-backdrop-filter 0.6s, border-color 0.5s, box-shadow 0.5s',
          /* Entrance animation */
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-12px)',
        }}
      >
        {/* ── Logo ── */}
        <a
          href={isHome ? '#' : '/'}
          onClick={e => { if (isHome) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}
          aria-label="NEXUS — home"
          className="nav-logo"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}
        >
          <svg className="nav-logo-glyph" width="22" height="22" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="var(--accent)" opacity="0.95"/>
            <path transform="rotate(120 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="var(--accent)" opacity="0.95"/>
            <path transform="rotate(240 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="var(--accent)" opacity="0.95"/>
            <circle cx="50" cy="50" r="5" fill="var(--accent)" opacity="0.7"/>
          </svg>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 400,
            letterSpacing: '0.42em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.90)', paddingRight: '0.42em', userSelect: 'none',
          }}>
            NEXUS
          </span>
        </a>

        {/* ── Desktop nav links ── */}
        <ul
          className="nav-links-desktop"
          role="list"
          style={{
            display: 'flex', gap: '2px', listStyle: 'none',
            alignItems: 'center', margin: '0 auto', padding: 0,
          }}
        >
          {desktopLinks.map(l => {
            const isActive = !l.href.startsWith('#') && pathname === l.href
            const IconComp = l.icon
            return (
              <li key={l.href} style={{ position: 'relative' }}>
                {l.href.startsWith('#') ? (
                  <a
                    href={l.href}
                    onClick={e => handleAnchor(e, l.href)}
                    className="nav-link-pill"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      color: 'rgba(255,255,255,0.50)',
                      padding: '6px 12px', borderRadius: '9px',
                      fontSize: '13px', fontFamily: 'var(--font-inter)', fontWeight: 450,
                      textDecoration: 'none', transition: 'color 0.2s, background 0.2s',
                    }}
                  >
                    <IconComp size={13} variant="Linear" color="rgba(255,255,255,0.50)" />
                    {l.label}
                  </a>
                ) : (
                  <Link
                    href={l.href}
                    className={`nav-link-pill${isActive ? ' active' : ''}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.50)',
                      padding: '6px 12px', borderRadius: '9px',
                      fontSize: '13px', fontFamily: 'var(--font-inter)',
                      fontWeight: isActive ? 500 : 450,
                      background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                      textDecoration: 'none', transition: 'color 0.2s, background 0.2s',
                      position: 'relative',
                    }}
                  >
                    <IconComp
                      size={13}
                      variant={isActive ? 'Bold' : 'Linear'}
                      color={isActive ? 'var(--accent)' : 'rgba(255,255,255,0.50)'}
                    />
                    {l.label}
                    {/* Active dot */}
                    {isActive && (
                      <span style={{
                        position: 'absolute', bottom: '-1px', left: '50%',
                        transform: 'translateX(-50%)',
                        width: '3px', height: '3px', borderRadius: '50%',
                        background: 'var(--accent)',
                      }} />
                    )}
                  </Link>
                )}
              </li>
            )
          })}

          {/* ── Explore megamenu trigger (app pages only) ── */}
          {!isHome && (
            <li>
              <button
                data-mega-trigger
                onClick={() => setMegaOpen(o => !o)}
                aria-expanded={megaOpen}
                aria-haspopup="true"
                className={`nav-link-pill nav-explore-btn${megaOpen ? ' active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  color: megaOpen ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.50)',
                  padding: '6px 12px', borderRadius: '9px',
                  fontSize: '13px', fontFamily: 'var(--font-inter)', fontWeight: megaOpen ? 500 : 450,
                  background: megaOpen ? 'rgba(255,255,255,0.07)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  transition: 'color 0.2s, background 0.2s',
                }}
              >
                Explore
                <ArrowDown2
                  size={12}
                  variant="Linear"
                  color={megaOpen ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.50)'}
                  style={{
                    transition: 'transform 0.25s cubic-bezier(0.34,1.3,0.64,1)',
                    transform: megaOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
            </li>
          )}
        </ul>

        {/* ── Right side: ⌘K + Bell + User + Hamburger ── */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
          className="nav-actions-desktop"
        >

          {/* ⌘K command palette trigger */}
          <button
            onClick={openCommandPalette}
            aria-label="Open command palette (⌘K)"
            title="Search everything (⌘K)"
            className="nav-icon-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px', padding: '5px 9px',
              color: 'rgba(255,255,255,0.40)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              transition: 'background 0.2s, border-color 0.2s, color 0.2s',
            }}
          >
            <SearchNormal1 size={12} variant="Linear" color="rgba(255,255,255,0.40)" />
            <span style={{ opacity: 0.6 }}>⌘K</span>
          </button>

          {/* Notification bell — signed-in users only. Showing an unread
              badge to an anonymous first-time visitor is fake urgency. */}
          {user && <NotificationBell />}

          {/* User menu */}
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
            style={{
              background: open ? 'rgba(255,255,255,0.07)' : 'none',
              border: 'none', cursor: 'pointer',
              padding: '8px', display: 'none',
              flexDirection: 'column', justifyContent: 'center',
              gap: '5px', width: '36px', height: '36px',
              borderRadius: '9px',
              transition: 'background 0.2s',
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', height: '1.5px',
                width: i === 1 ? '14px' : '20px',
                background: 'rgba(255,255,255,0.75)', borderRadius: '2px',
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
        {/* ── MegaMenu — absolute, full nav width, below the bar ── */}
        {!isHome && (
          <MegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
        )}
      </nav>

      {/* ── Mobile drawer ── */}
      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        links={drawerLinks}
        user={user}
        onLogout={handleLogout}
        onAnchor={handleAnchor}
      />

      <style>{`
        /* Nav entrance */
        #main-nav { transition: opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1), background 0.5s, border-color 0.5s, box-shadow 0.5s !important; }

        /* Desktop responsive */
        @media (max-width: 768px) {
          #main-nav { width: calc(100% - 24px) !important; top: 10px !important; padding: 0 12px !important; }
          .nav-links-desktop { display: none !important; }
          .nav-actions-desktop > *:not(.nav-hamburger):not(.notification-bell-container) { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
        }

        /* Link hover — accent-tinted glass pill */
        .nav-link-pill { text-decoration: none; }
        .nav-link-pill:hover {
          color: rgba(255,255,255,0.92) !important;
          background: rgba(79,142,240,0.10) !important;
          transition: color 0.16s ease, background 0.16s ease !important;
        }
        .nav-link-pill.active:hover {
          background: rgba(79,142,240,0.14) !important;
        }
        /* Subtle scale on click */
        .nav-link-pill:active {
          transform: scale(0.96) !important;
          transition: transform 0.08s ease !important;
        }
        /* Explore button same hover */
        .nav-explore-btn:hover {
          color: rgba(255,255,255,0.92) !important;
          background: rgba(79,142,240,0.10) !important;
        }

        /* Icon button hover */
        .nav-icon-btn:hover {
          background: rgba(255,255,255,0.09) !important;
          border-color: rgba(79,142,240,0.22) !important;
          color: rgba(255,255,255,0.80) !important;
          box-shadow: 0 0 0 1px rgba(79,142,240,0.12) !important;
        }

        /* User menu buttons */
        .nav-sign-in:hover { border-color: rgba(255,255,255,0.25) !important; color: #fff !important; }
        .nav-get-started:hover { transform: translateY(-1px) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.35) !important; }
        .nav-user-btn:hover { background: rgba(74,144,217,0.20) !important; }

        /* Logo hover */
        .nav-logo { transition: opacity 0.2s; }
        .nav-logo:hover { opacity: 0.8; }

        /* Mega menu — ensure absolute positioning context works */
        #main-nav > ul { position: static; overflow: visible; }
      `}</style>
    </>
  )
}
