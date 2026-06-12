'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'
import {
  Location, Health, Heart, DocumentText, Category,
  Setting2, Logout, ArrowRight2, Profile2User,
  Stickynote, People, BookSaved,
} from 'iconsax-react'

/* ─── helpers ────────────────────────────────────────────────────────── */
function timeGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

function initials(s: string) {
  return s.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

function passportPct(profile: { full_name?: string | null; phone?: string | null } | null) {
  if (!profile) return 0
  let n = 0
  if (profile.full_name) n += 50
  if (profile.phone)     n += 50
  return n
}

/* ─── quick link strip ────────────────────────────────────────────────── */
const QUICK = [
  { href: '/community',   label: 'Community'   },
  { href: '/calendar',    label: 'Calendar'    },
  { href: '/stories',     label: 'Stories'     },
  { href: '/advocacy',    label: 'Advocacy'    },
  { href: '/eligibility', label: 'Eligibility' },
  { href: '/pathways',    label: 'Pathways'    },
  { href: '/chw',         label: 'CHW'         },
  { href: '/equity',      label: 'Equity'      },
  { href: '/outcomes',    label: 'Outcomes'    },
]

/* ─── skeleton shimmer ────────────────────────────────────────────────── */
function Skel({ w, h, br = 6 }: { w?: string; h?: number; br?: number }) {
  return (
    <div aria-hidden="true" style={{
      width: w ?? '100%', height: h ?? 14, borderRadius: br,
      background: 'rgba(255,255,255,0.05)',
      animation: 'sk-pulse 1.5s ease-in-out infinite',
    }} />
  )
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const supabase = createClientClient()

  const [profile, setProfile] = useState<{
    id: string; email: string
    full_name: string | null; phone: string | null
    user_type: string | null
  } | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  /* load profile once */
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase
        .from('user_profiles')
        .select('full_name, phone, user_type')
        .eq('id', user.id)
        .single()
      setProfile({
        id: user.id,
        email:     user.email ?? '',
        full_name: data?.full_name ?? null,
        phone:     data?.phone     ?? null,
        user_type: data?.user_type ?? null,
      })
      setLoading(false)
    }
    load()
  }, [supabase])

  /* close dropdown on outside click */
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [supabase])

  const displayName  = profile?.full_name || profile?.email?.split('@')[0] || 'there'
  const firstName    = displayName.split(' ')[0]
  const pct          = passportPct(profile)
  const isProvider   = profile?.user_type === 'provider'

  /* ─── secondary card definitions ─────────────────────────────────────── */
  const secondaryCards = [
    {
      href: '/triage', title: 'Triage', sub: 'Check your symptoms',
      Icon: Heart,
      iconBg: 'rgba(248,113,113,0.09)', iconBorder: 'rgba(248,113,113,0.18)', iconColor: 'rgba(248,113,113,0.85)',
    },
    {
      href: '/medications', title: 'Medications', sub: 'Track prescriptions',
      Icon: DocumentText,
      iconBg: 'rgba(251,191,36,0.09)', iconBorder: 'rgba(251,191,36,0.18)', iconColor: 'rgba(251,191,36,0.85)',
    },
    {
      href: '/programs', title: 'Programs', sub: 'Assistance near you',
      Icon: Category,
      iconBg: 'rgba(167,139,250,0.09)', iconBorder: 'rgba(167,139,250,0.18)', iconColor: 'rgba(167,139,250,0.85)',
    },
  ] as const

  /* ──────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-inter)', color: 'var(--text)' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes sk-pulse { 0%,100% { opacity:.45 } 50% { opacity:.9 } }
        @keyframes db-up {
          from { opacity:0; transform:translateY(14px) }
          to   { opacity:1; transform:translateY(0) }
        }
        .db-fade { animation: db-up 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .db-fade-1 { animation-delay: .06s  }
        .db-fade-2 { animation-delay: .14s  }
        .db-fade-3 { animation-delay: .22s  }
        .ql-pill:hover {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.14) !important;
          color: var(--text-2) !important;
        }
        .menu-item:hover  { background: rgba(255,255,255,0.05) !important; color: var(--text) !important; }
        .menu-signout:hover { background: rgba(248,113,113,0.07) !important; color: rgba(248,113,113,0.95) !important; }
        @media (max-width: 600px) {
          .db-grid-2 { grid-template-columns: 1fr !important; }
          .db-grid-3 { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 380px) {
          .db-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: 52,
        background: 'rgba(6,6,8,0.88)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <svg width="17" height="17" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
            <path transform="rotate(120 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
            <path transform="rotate(240 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
            <circle cx="50" cy="50" r="5" fill="#4F8EF0" opacity="0.7"/>
          </svg>
          <span style={{
            fontFamily: 'var(--font-orbitron, monospace)',
            fontSize: 11, fontWeight: 400, letterSpacing: '0.44em',
            color: 'rgba(255,255,255,0.65)',
          }}>NEXUS</span>
        </Link>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link href="/settings/security" aria-label="Settings" style={{
            width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
            transition: 'background 0.15s, color 0.15s',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.06)'; el.style.color = 'rgba(255,255,255,0.72)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'rgba(255,255,255,0.35)' }}
          >
            <Setting2 size={14} color="currentColor" variant="Linear" />
          </Link>

          {/* Avatar + dropdown */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="User menu"
              aria-expanded={menuOpen}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(79,142,240,0.38) 0%, rgba(79,142,240,0.14) 100%)',
                border: `1.5px solid ${menuOpen ? 'rgba(79,142,240,0.55)' : 'rgba(79,142,240,0.22)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 11, fontWeight: 700,
                color: 'rgba(79,142,240,0.95)', letterSpacing: '-0.01em',
                transition: 'border-color 0.15s, transform 0.15s',
                transform: menuOpen ? 'scale(0.94)' : 'scale(1)',
              }}
            >
              {loading ? '·' : initials(displayName)}
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                minWidth: 218,
                background: 'rgba(9,10,18,0.98)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 12,
                boxShadow: '0 20px 60px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.03)',
                overflow: 'hidden',
                animation: 'db-up 0.18s ease both',
              }}>
                {/* User info */}
                <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2, letterSpacing: '-0.01em' }}>
                    {loading ? '—' : (profile?.full_name || profile?.email?.split('@')[0])}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
                    {profile?.email}
                  </div>
                  {profile?.user_type && (
                    <span style={{
                      display: 'inline-block', fontSize: 10, fontWeight: 600,
                      letterSpacing: '0.07em', textTransform: 'uppercase',
                      padding: '2px 7px', borderRadius: 4,
                      background: 'rgba(79,142,240,0.10)',
                      border: '1px solid rgba(79,142,240,0.20)',
                      color: 'rgba(79,142,240,0.85)',
                    }}>
                      {profile.user_type}
                    </span>
                  )}
                </div>

                {/* Nav items */}
                <div style={{ padding: '4px 0' }}>
                  {[
                    { href: '/settings/profile',  label: 'Profile',  Icon: Profile2User },
                    { href: '/settings/security', label: 'Security', Icon: Setting2     },
                  ].map(({ href, label, Icon }) => (
                    <Link key={href} href={href} className="menu-item" onClick={() => setMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 16px', textDecoration: 'none',
                      color: 'var(--text-2)', fontSize: 13,
                      transition: 'background 0.12s, color 0.12s',
                    }}>
                      <Icon size={12} color="currentColor" variant="Linear" />
                      {label}
                    </Link>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '4px 0' }}>
                  <button onClick={signOut} className="menu-signout" style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(248,113,113,0.65)', fontSize: 13, fontFamily: 'inherit',
                    transition: 'background 0.12s, color 0.12s', textAlign: 'left',
                  }}>
                    <Logout size={12} color="currentColor" variant="Linear" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 920, margin: '0 auto', padding: '52px 24px 96px' }}>

        {/* Greeting */}
        <header className="db-fade" style={{ marginBottom: 52 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skel w="240px" h={38} br={8} />
              <Skel w="150px" h={14} br={5} />
            </div>
          ) : (
            <>
              <h1 style={{
                margin: 0,
                fontSize: 'clamp(26px, 4vw, 34px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--text)',
                lineHeight: 1.15,
                fontFamily: 'var(--font-display, var(--font-inter))',
                marginBottom: 8,
              }}>
                {timeGreeting()}{displayName !== 'there' ? `, ${firstName}` : ''}.
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)' }}>
                {todayLabel()}
                {isProvider && (
                  <span style={{
                    marginLeft: 10, verticalAlign: 'middle',
                    display: 'inline-block', fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.07em', textTransform: 'uppercase',
                    padding: '2px 7px', borderRadius: 4,
                    background: 'rgba(52,211,153,0.09)',
                    border: '1px solid rgba(52,211,153,0.20)',
                    color: 'rgba(52,211,153,0.75)',
                  }}>
                    Provider
                  </span>
                )}
              </p>
            </>
          )}
        </header>

        {/* ── Primary cards (2-col) ──────────────────────────────────────── */}
        <div className="db-fade db-fade-1 db-grid-2" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 10,
        }}>

          {/* Find Care */}
          <Link href="/search" style={{ textDecoration: 'none', display: 'block' }}>
            <div className="bento-card" style={{
              padding: '26px 26px 22px',
              background: 'rgba(79,142,240,0.07)',
              borderColor: 'rgba(79,142,240,0.17)',
              minHeight: 176,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(79,142,240,0.14)',
                  border: '1px solid rgba(79,142,240,0.24)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Location size={16} color="rgba(79,142,240,0.9)" variant="TwoTone" />
                </div>
                <ArrowRight2 size={13} color="rgba(255,255,255,0.20)" variant="Linear" />
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 5 }}>
                  Find Care
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>
                  Free clinics, telehealth &amp; CHW programs near you
                </div>
              </div>
            </div>
          </Link>

          {/* Health Passport */}
          <Link href="/passport" style={{ textDecoration: 'none', display: 'block' }}>
            <div className="bento-card" style={{
              padding: '26px 26px 22px',
              minHeight: 176,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(52,211,153,0.09)',
                  border: '1px solid rgba(52,211,153,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Health size={16} color="rgba(52,211,153,0.85)" variant="TwoTone" />
                </div>
                <ArrowRight2 size={13} color="rgba(255,255,255,0.20)" variant="Linear" />
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 10 }}>
                  Health Passport
                </div>
                {loading ? (
                  <Skel w="100%" h={4} br={2} />
                ) : (
                  <>
                    <div style={{
                      height: 3, background: 'rgba(255,255,255,0.08)',
                      borderRadius: 2, overflow: 'hidden', marginBottom: 7,
                    }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: 'linear-gradient(90deg, rgba(52,211,153,0.65), rgba(52,211,153,0.92))',
                        borderRadius: 2,
                        transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                      }} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {pct === 100 ? 'Profile complete ✓' : `${pct}% complete — finish setup`}
                    </div>
                  </>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* ── Secondary cards (3-col) ───────────────────────────────────── */}
        <div className="db-fade db-fade-2 db-grid-3" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginBottom: 52,
        }}>
          {secondaryCards.map(({ href, title, sub, Icon, iconBg, iconBorder, iconColor }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none', display: 'block' }}>
              <div className="bento-card" style={{ padding: '22px 22px 18px', minHeight: 128 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: iconBg, border: `1px solid ${iconBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={14} color={iconColor} variant="TwoTone" />
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 4 }}>
                  {title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.45 }}>
                  {sub}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Quick links ───────────────────────────────────────────────── */}
        <div className="db-fade db-fade-3">
          <p style={{
            margin: '0 0 12px',
            fontSize: 10, fontWeight: 600, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: 'var(--text-4)',
          }}>
            Explore
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {QUICK.map(({ href, label }) => (
              <Link key={href} href={href} className="ql-pill" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '6px 14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 100,
                fontSize: 12, color: 'var(--text-3)',
                textDecoration: 'none',
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
