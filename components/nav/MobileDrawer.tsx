'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useI18n } from '@/components/I18nContext'
import {
  SearchNormal1, Video, Danger,
  ReceiptText, ShieldTick, Calendar1, Health,
  Chart2, TrendUp, Book1, Judge,
  Profile2User, Hospital, Buildings,
  ClipboardText, Speaker, Global,
  Routing2, Home, CloseCircle, SearchStatus,
} from 'iconsax-react'

type NavLink = { label: string; href: string }

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  links: NavLink[]
  user: { full_name?: string | null; email?: string | null } | null
  onLogout: () => void
  onAnchor: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
}

/* Mapping of hrefs to icons */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LINK_ICONS: Record<string, React.ElementType<any>> = {
  '/search':      SearchNormal1,
  '/clinics':     Buildings,
  '/programs':    ReceiptText,
  '/pathways':    Routing2,
  '/eligibility': ShieldTick,
  '/calendar':    Calendar1,
  '/medications': Health,
  '/triage':      ClipboardText,
  '/telehealth':  Video,
  '/crisis':      Danger,
  '/impact':      Chart2,
  '/outcomes':    TrendUp,
  '/stories':     Book1,
  '/editorial':   ClipboardText,
  '/equity':      Judge,
  '/chw':         Profile2User,
  '/provider':    Hospital,
  '/rights':      ShieldTick,
  '/advocacy':    Speaker,
  '/about':       Global,
  '/passport':    ShieldTick,
  '/methodology': SearchStatus,
  '#features':    Home,
  '#how':         SearchStatus,
  '#eligibility': ShieldTick,
  '#testimonials':Book1,
}

/* Category groupings for drawer links */
const CATEGORIES = [
  { title: 'Find Care',  color: '#4F8EF0', hrefs: ['/search', '/clinics', '/triage', '/telehealth', '/crisis'] },
  { title: 'Programs',   color: '#34D399', hrefs: ['/programs', '/pathways', '/eligibility', '/calendar', '/medications'] },
  { title: 'Explore',    color: '#A78BFA', hrefs: ['/impact', '/outcomes', '/stories', '/editorial', '/equity'] },
  { title: 'Community',  color: '#F59E0B', hrefs: ['/chw', '/provider', '/rights', '/advocacy'] },
  { title: 'More',       color: '#9CA3AF', hrefs: ['/equity', '/passport', '/about', '/methodology'] },
]

export default function MobileDrawer({ open, onClose, links, user, onLogout, onAnchor }: MobileDrawerProps) {
  const { t }      = useI18n()
  const router     = useRouter()
  const pathname   = usePathname()
  const drawerRef  = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const [query, setQuery] = useState('')

  /* Build categorized links */
  const isHome = links.some(l => l.href.startsWith('#'))

  const categorizedLinks = !isHome
    ? CATEGORIES.map(cat => ({
        ...cat,
        items: links.filter(l => cat.hrefs.includes(l.href)),
      })).filter(cat => cat.items.length > 0)
    : []

  const filteredLinks = query.trim()
    ? links.filter(l => l.label.toLowerCase().includes(query.toLowerCase()))
    : null

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

  /* Reset search on close */
  useEffect(() => { if (!open) setQuery('') }, [open])

  const renderLink = (l: NavLink, i: number, color?: string) => {
    const isActive = !l.href.startsWith('#') && pathname === l.href
    const IconComp = LINK_ICONS[l.href]
    const accentColor = color || 'var(--accent)'

    return (
      <li key={l.href} style={{
        opacity: open ? 1 : 0,
        transform: open ? 'translateX(0)' : 'translateX(18px)',
        transition: open
          ? `opacity 0.4s ${0.06 + i * 0.03}s cubic-bezier(0.16,1,0.3,1), transform 0.4s ${0.06 + i * 0.03}s cubic-bezier(0.34,1.3,0.64,1)`
          : 'opacity 0.12s ease, transform 0.12s ease',
      }}>
        {l.href.startsWith('#') ? (
          <a
            href={l.href}
            onClick={e => { onAnchor(e, l.href); setQuery('') }}
            className="drawer-nav-link"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              color: 'rgba(255,255,255,0.65)', fontSize: '14px',
              fontFamily: 'var(--font-inter)', fontWeight: 400,
              textDecoration: 'none', padding: '9px 12px', borderRadius: '10px',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {IconComp && <IconComp size={15} variant="Linear" color="rgba(255,255,255,0.35)" />}
            {l.label}
          </a>
        ) : (
          <Link
            href={l.href}
            onClick={() => { onClose(); setQuery('') }}
            className="drawer-nav-link"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              color: isActive ? '#F8F9FF' : 'rgba(255,255,255,0.65)',
              fontSize: '14px', fontFamily: 'var(--font-inter)',
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none', padding: '9px 12px', borderRadius: '10px',
              background: isActive ? `${accentColor}12` : 'transparent',
              border: isActive ? `1px solid ${accentColor}20` : '1px solid transparent',
              transition: 'background 0.2s, color 0.2s, border-color 0.2s',
            }}
          >
            {IconComp && (
              <IconComp
                size={15}
                variant={isActive ? 'Bold' : 'Linear'}
                color={isActive ? accentColor : 'rgba(255,255,255,0.35)'}
              />
            )}
            {l.label}
          </Link>
        )}
      </li>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 498,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
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
          width: '310px', maxHeight: 'calc(100dvh - 20px)',
          overflowY: 'auto', zIndex: 499,
          background: 'rgba(7,8,18,0.98)',
          backdropFilter: 'blur(56px) saturate(200%)',
          WebkitBackdropFilter: 'blur(56px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '20px', padding: '16px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04) inset',
          transform: open ? 'scale(1) translateX(0) translateY(0)' : 'scale(0.92) translateX(0) translateY(-8px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transformOrigin: 'top right',
          transition: open
            ? 'transform 0.45s cubic-bezier(0.34,1.3,0.64,1), opacity 0.25s ease'
            : 'transform 0.28s cubic-bezier(0.4,0,1,1), opacity 0.18s ease',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '14px',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '10px',
            letterSpacing: '0.4em', color: 'rgba(255,255,255,0.55)', paddingRight: '0.4em',
          }}>
            NEXUS
          </span>
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
            <CloseCircle size={14} variant="Linear" color="rgba(255,255,255,0.5)" />
          </button>
        </div>

        {/* ── Search bar ── */}
        <div style={{
          position: 'relative', marginBottom: '16px',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'opacity 0.3s 0.05s, transform 0.3s 0.05s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <SearchNormal1
            size={13}
            variant="Linear"
            color="rgba(255,255,255,0.3)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages…"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '9px 12px 9px 34px',
              color: 'rgba(255,255,255,0.85)', fontSize: '13px',
              fontFamily: 'var(--font-inter)',
              outline: 'none', transition: 'border-color 0.2s, background 0.2s',
            }}
            className="drawer-search"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
              }}
            >
              <CloseCircle size={13} variant="Linear" color="rgba(255,255,255,0.35)" />
            </button>
          )}
        </div>

        {/* ── Link content ── */}
        {filteredLinks ? (
          /* Search results */
          <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px', margin: '0 0 16px', padding: 0 }}>
            {filteredLinks.length > 0
              ? filteredLinks.map((l, i) => renderLink(l, i))
              : (
                <li style={{ padding: '16px 12px', color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontFamily: 'var(--font-inter)', textAlign: 'center' }}>
                  No pages found
                </li>
              )
            }
          </ul>
        ) : isHome ? (
          /* Home anchor links */
          <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px', margin: '0 0 16px', padding: 0 }}>
            {links.map((l, i) => renderLink(l, i))}
          </ul>
        ) : (
          /* Categorized app links */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
            {categorizedLinks.map(cat => (
              <div key={cat.title}>
                <div style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: cat.color,
                  marginBottom: '4px', paddingLeft: '12px',
                  fontFamily: 'var(--font-inter)',
                }}>
                  {cat.title}
                </div>
                <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1px', margin: 0, padding: 0 }}>
                  {cat.items.map((l, i) => renderLink(l, i, cat.color))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* ── Auth section ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '12px',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s 0.22s, transform 0.3s 0.22s cubic-bezier(0.32,0.72,0,1)',
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          {user ? (
            <>
              <div style={{
                padding: '9px 12px', borderRadius: '10px',
                background: 'rgba(79,142,240,0.08)', marginBottom: '2px',
                border: '1px solid rgba(79,142,240,0.12)',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#eef4f5' }}>{user.full_name || 'User'}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{user.email}</div>
              </div>
              <button
                onClick={() => { onClose(); router.push('/dashboard') }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.93)', color: '#08081a', border: 'none', borderRadius: '10px', padding: '11px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s' }}
              >{t('nav.dashboard')}</button>
              <button
                onClick={() => { onClose(); onLogout() }}
                style={{ width: '100%', background: 'rgba(255,107,107,0.08)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.20)', borderRadius: '10px', padding: '10px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >{t('nav.signOut')}</button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onClose(); router.push('/login') }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '10px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
              >{t('nav.signIn')}</button>
              <button
                onClick={() => { onClose(); router.push('/signup') }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.94)', color: '#08081a', border: 'none', borderRadius: '10px', padding: '11px', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >{t('nav.getStarted')}</button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .drawer-close-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .drawer-nav-link:hover {
          background: rgba(255,255,255,0.06) !important;
          color: rgba(255,255,255,0.95) !important;
          border-color: rgba(255,255,255,0.06) !important;
        }
        .drawer-search:focus {
          border-color: rgba(79,142,240,0.4) !important;
          background: rgba(79,142,240,0.06) !important;
        }
        .drawer-search::placeholder { color: rgba(255,255,255,0.25); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
      `}</style>
    </>
  )
}
