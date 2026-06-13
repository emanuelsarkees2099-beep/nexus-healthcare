'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'
import {
  Location, Health, Heart, DocumentText, Category,
  Setting2, Logout, ArrowRight2, Profile2User,
  People, Flash,
} from 'iconsax-react'

/* ─── helpers ─────────────────────────────────────────────────────── */
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

function passportPct(p: { full_name?: string | null; phone?: string | null } | null) {
  if (!p) return 0
  let n = 0
  if (p.full_name) n += 50
  if (p.phone)     n += 50
  return n
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)   return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ─── daily tip ───────────────────────────────────────────────────── */
const TIPS = [
  { text: 'Drinking water before meals supports digestion and portion awareness.', tag: 'Hydration' },
  { text: 'Even a 10-minute walk measurably improves mood and lowers cortisol.', tag: 'Movement' },
  { text: 'Sleep quality matters more than duration — consistency is the key.', tag: 'Sleep' },
  { text: '60 seconds of deep breathing activates the parasympathetic nervous system.', tag: 'Stress' },
  { text: 'Colorful plates signal nutrient density. Variety beats restriction every time.', tag: 'Nutrition' },
  { text: 'Preventive care consistently saves more lives than emergency intervention.', tag: 'Prevention' },
  { text: 'Social connection is as vital to longevity as diet or regular exercise.', tag: 'Wellbeing' },
  { text: 'Your body sends early signals before illness sets in — learn to notice them.', tag: 'Awareness' },
]
const todayTip = () => TIPS[new Date().getDate() % TIPS.length]

/* ─── static data ─────────────────────────────────────────────────── */
const TOOLS = [
  {
    href: '/triage', title: 'Symptom Triage', sub: 'Check your symptoms',
    Icon: Heart,
    bg: 'rgba(248,113,113,0.09)', border: 'rgba(248,113,113,0.18)', color: 'rgba(248,113,113,0.85)',
  },
  {
    href: '/medications', title: 'Medications', sub: 'Track prescriptions',
    Icon: DocumentText,
    bg: 'rgba(251,191,36,0.09)', border: 'rgba(251,191,36,0.18)', color: 'rgba(251,191,36,0.85)',
  },
  {
    href: '/programs', title: 'Programs', sub: 'Assistance near you',
    Icon: Category,
    bg: 'rgba(167,139,250,0.09)', border: 'rgba(167,139,250,0.18)', color: 'rgba(167,139,250,0.85)',
  },
  {
    href: '/community', title: 'Community', sub: 'Connect with others',
    Icon: People,
    bg: 'rgba(79,142,240,0.09)', border: 'rgba(79,142,240,0.18)', color: 'rgba(79,142,240,0.85)',
  },
] as const

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

/* ─── micro-components ────────────────────────────────────────────── */
function Skel({ w, h, br = 6 }: { w?: string; h?: number; br?: number }) {
  return (
    <div aria-hidden="true" style={{
      width: w ?? '100%', height: h ?? 14, borderRadius: br,
      background: 'rgba(255,255,255,0.05)',
      animation: 'sk-pulse 1.5s ease-in-out infinite',
    }} />
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p style={{
      margin: '0 0 12px', fontSize: 10, fontWeight: 600,
      letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-4)',
    }}>{label}</p>
  )
}

function StepRow({
  done, label, sub, href,
}: { done: boolean; label: string; sub?: string; href?: string }) {
  const row = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '11px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      {/* circle indicator */}
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        background: done ? 'rgba(52,211,153,0.12)' : 'transparent',
        border: `1.5px solid ${done ? 'rgba(52,211,153,0.45)' : 'rgba(255,255,255,0.14)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.2s, background 0.2s',
      }}>
        {done && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
            <path d="M1.5 4.5L3.75 6.75L7.5 2.5"
              stroke="rgba(52,211,153,0.9)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {/* text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: done ? 400 : 500, letterSpacing: '-0.01em',
          color: done ? 'var(--text-3)' : 'var(--text)',
        }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 1 }}>{sub}</div>
        )}
      </div>
      {!done && (
        <ArrowRight2 size={12} color="rgba(255,255,255,0.22)" variant="Linear" />
      )}
    </div>
  )

  if (!done && href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
        {row}
      </Link>
    )
  }
  return row
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const supabase = createClientClient()

  const [profile, setProfile] = useState<{
    id: string; email: string
    full_name: string | null; phone: string | null
    user_type: string | null; created_at: string
  } | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
        id:         user.id,
        email:      user.email ?? '',
        full_name:  data?.full_name ?? null,
        phone:      data?.phone     ?? null,
        user_type:  data?.user_type ?? null,
        created_at: user.created_at,
      })
      setLoading(false)
    }
    load()
  }, [supabase])

  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuOpen])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [supabase])

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'there'
  const firstName   = displayName.split(' ')[0]
  const pct         = passportPct(profile)
  const isProvider  = profile?.user_type === 'provider'
  const tip         = todayTip()

  const passportSteps = [
    { label: 'Email address', done: true },
    { label: 'Full name',     done: !!profile?.full_name },
    { label: 'Phone number',  done: !!profile?.phone },
  ]

  const gettingStarted = [
    {
      label: 'Create your account',
      sub:   profile?.created_at ? relativeTime(profile.created_at) : undefined,
      done:  true, href: undefined,
    },
    {
      label: 'Complete your profile',
      sub:   pct === 100 ? 'Done' : `${pct}% complete`,
      done:  pct === 100, href: '/dashboard/profile',
    },
    {
      label: 'Explore Find Care',
      sub:   'Free clinics & telehealth near you',
      done:  false, href: '/search',
    },
    {
      label: 'Take a triage assessment',
      sub:   'Understand your symptoms',
      done:  false, href: '/triage',
    },
  ]

  const doneCount = gettingStarted.filter(s => s.done).length

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'var(--font-inter)',
      color: 'var(--text)',
    }}>
      <style>{`
        @keyframes sk-pulse { 0%,100% { opacity:.40 } 50% { opacity:.85 } }
        @keyframes db-up {
          from { opacity:0; transform:translateY(14px) }
          to   { opacity:1; transform:translateY(0)    }
        }
        .db-fade   { animation: db-up 0.55s cubic-bezier(0.16,1,0.3,1) both; }
        .db-fade-1 { animation-delay:.07s }
        .db-fade-2 { animation-delay:.14s }
        .db-fade-3 { animation-delay:.22s }
        .db-fade-4 { animation-delay:.30s }
        .db-fade-5 { animation-delay:.38s }

        .ql-pill:hover {
          background:    rgba(255,255,255,0.06) !important;
          border-color:  rgba(255,255,255,0.14) !important;
          color:         var(--text-2) !important;
        }
        .menu-item:hover    { background: rgba(255,255,255,0.05) !important; color: var(--text) !important; }
        .menu-signout:hover { background: rgba(248,113,113,0.07) !important; color: rgba(248,113,113,0.95) !important; }

        .nav-icon-btn { transition: background 0.15s, color 0.15s; }
        .nav-icon-btn:hover { background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,0.72) !important; }

        /* tool card arrow fade-in on hover */
        .tool-card:hover .tc-arrow { opacity: 1 !important; }

        /* step row hover feedback */
        a:has(.step-inner):hover .step-inner { opacity: 0.80; }

        @media (max-width: 640px) {
          .db-grid-2   { grid-template-columns: 1fr !important; }
          .db-grid-4   { grid-template-columns: 1fr 1fr !important; }
          .db-grid-act { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 380px) {
          .db-grid-4 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 52,
        background: 'rgba(6,6,8,0.90)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link href="/dashboard/profile" aria-label="Profile" className="nav-icon-btn" style={{
            width: 32, height: 32, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
          }}>
            <Profile2User size={14} color="currentColor" variant="Linear" />
          </Link>

          <Link href="/settings/security" aria-label="Settings" className="nav-icon-btn" style={{
            width: 32, height: 32, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
          }}>
            <Setting2 size={14} color="currentColor" variant="Linear" />
          </Link>

          {/* Avatar + dropdown */}
          <div ref={menuRef} style={{ position: 'relative', marginLeft: 4 }}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="User menu"
              aria-expanded={menuOpen}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg,rgba(79,142,240,0.38) 0%,rgba(79,142,240,0.14) 100%)',
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

            {menuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                minWidth: 220,
                background: 'rgba(9,10,18,0.98)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 12,
                boxShadow: '0 20px 60px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.03)',
                overflow: 'hidden',
                animation: 'db-up 0.18s ease both',
              }}>
                {/* User info header */}
                <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2, letterSpacing: '-0.01em' }}>
                    {loading ? '—' : (profile?.full_name || profile?.email?.split('@')[0])}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: profile?.user_type ? 8 : 0 }}>
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
                    }}>{profile.user_type}</span>
                  )}
                </div>

                {/* Links */}
                <div style={{ padding: '4px 0' }}>
                  {([
                    { href: '/dashboard/profile',  label: 'Profile',  Icon: Profile2User },
                    { href: '/settings/security',  label: 'Security', Icon: Setting2     },
                  ] as const).map(({ href, label, Icon }) => (
                    <Link key={href} href={href} className="menu-item"
                      onClick={() => setMenuOpen(false)}
                      style={{
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

                {/* Sign out */}
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

      {/* ── Main ──────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '52px 24px 96px' }}>

        {/* ── Greeting ──────────────────────────────────────────── */}
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
                fontSize: 'clamp(26px, 4vw, 36px)',
                fontWeight: 700, letterSpacing: '-0.03em',
                color: 'var(--text)', lineHeight: 1.15,
                fontFamily: 'var(--font-display, var(--font-inter))',
                marginBottom: 9,
              }}>
                {timeGreeting()}{displayName !== 'there' ? `, ${firstName}` : ''}.
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)' }}>{todayLabel()}</p>
                {isProvider && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
                    padding: '2px 7px', borderRadius: 4,
                    background: 'rgba(52,211,153,0.09)', border: '1px solid rgba(52,211,153,0.20)',
                    color: 'rgba(52,211,153,0.75)',
                  }}>Provider</span>
                )}
              </div>
            </>
          )}
        </header>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 32 }} aria-label="Actions">
          <SectionLabel label="Actions" />
          <div className="db-fade db-fade-1 db-grid-2" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          }}>

            {/* Find Care */}
            <Link href="/search" style={{ textDecoration: 'none', display: 'block' }}>
              <div className="bento-card" style={{
                padding: '26px 26px 24px',
                background: 'rgba(79,142,240,0.07)',
                borderColor: 'rgba(79,142,240,0.16)',
                minHeight: 220,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                {/* top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(79,142,240,0.14)', border: '1px solid rgba(79,142,240,0.24)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Location size={17} color="rgba(79,142,240,0.9)" variant="TwoTone" />
                  </div>
                  <ArrowRight2 size={13} color="rgba(255,255,255,0.20)" variant="Linear" />
                </div>

                {/* copy */}
                <div style={{ margin: '20px 0 18px' }}>
                  <div style={{
                    fontSize: 16, fontWeight: 600, color: 'var(--text)',
                    letterSpacing: '-0.02em', marginBottom: 6,
                  }}>Find Care</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>
                    Free &amp; low-cost healthcare — clinics, telehealth, and CHW programs near you.
                  </div>
                </div>

                {/* 3 feature bullets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {['Free clinics', 'Telehealth', 'CHW programs'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: 'rgba(79,142,240,0.50)', flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)', letterSpacing: '-0.01em' }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>

            {/* Health Passport */}
            <Link href="/dashboard/profile" style={{ textDecoration: 'none', display: 'block' }}>
              <div className="bento-card" style={{
                padding: '26px 26px 24px',
                minHeight: 220,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                {/* top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(52,211,153,0.09)', border: '1px solid rgba(52,211,153,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Health size={17} color="rgba(52,211,153,0.85)" variant="TwoTone" />
                  </div>
                  <ArrowRight2 size={13} color="rgba(255,255,255,0.20)" variant="Linear" />
                </div>

                {/* copy + bar */}
                <div style={{ margin: '20px 0 14px' }}>
                  <div style={{
                    fontSize: 16, fontWeight: 600, color: 'var(--text)',
                    letterSpacing: '-0.02em', marginBottom: 13,
                  }}>Health Passport</div>
                  {loading ? (
                    <Skel w="100%" h={3} br={2} />
                  ) : (
                    <>
                      <div style={{
                        height: 3, background: 'rgba(255,255,255,0.07)',
                        borderRadius: 2, overflow: 'hidden', marginBottom: 6,
                      }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: 'linear-gradient(90deg,rgba(52,211,153,0.55),rgba(52,211,153,0.90))',
                          borderRadius: 2,
                          transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
                        }} />
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 2 }}>
                        {pct === 100 ? 'Profile complete' : `${pct}% complete`}
                      </div>
                    </>
                  )}
                </div>

                {/* field checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {passportSteps.map(({ label, done }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      {done
                        ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="6"
                              fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.40)" strokeWidth="1"/>
                            <path d="M4.5 7L6.25 8.75L9.5 5"
                              stroke="rgba(52,211,153,0.85)" strokeWidth="1.3"
                              strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="6"
                              stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
                          </svg>
                      }
                      <span style={{
                        fontSize: 12.5, letterSpacing: '-0.01em',
                        color: done ? 'var(--text-3)' : 'var(--text-2)',
                      }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ── Tools ────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 32 }} aria-label="Tools">
          <SectionLabel label="Tools" />
          <div className="db-fade db-fade-2 db-grid-4" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
          }}>
            {TOOLS.map(({ href, title, sub, Icon, bg, border, color }) => (
              <Link key={href} href={href} className="tool-card" style={{ textDecoration: 'none', display: 'block' }}>
                <div className="bento-card" style={{ padding: '22px 20px 20px', minHeight: 136 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: bg, border: `1px solid ${border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={14} color={color} variant="TwoTone" />
                    </div>
                    <ArrowRight2
                      className="tc-arrow"
                      size={11}
                      color="rgba(255,255,255,0.28)"
                      variant="Linear"
                      style={{ opacity: 0, transition: 'opacity 0.15s' }}
                    />
                  </div>
                  <div style={{
                    fontSize: 13.5, fontWeight: 600, color: 'var(--text)',
                    letterSpacing: '-0.01em', marginBottom: 4,
                  }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4 }}>{sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Getting started + Today's tip ────────────────────────────── */}
        <section style={{ marginBottom: 48 }}>
          <div className="db-fade db-fade-3 db-grid-act" style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10,
          }}>

            {/* Getting started */}
            <div className="bento-card" style={{ padding: '24px 26px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 18,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                  Getting started
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
                  color: doneCount === gettingStarted.length
                    ? 'rgba(52,211,153,0.75)' : 'rgba(79,142,240,0.75)',
                  background: doneCount === gettingStarted.length
                    ? 'rgba(52,211,153,0.09)' : 'rgba(79,142,240,0.09)',
                  border: `1px solid ${doneCount === gettingStarted.length
                    ? 'rgba(52,211,153,0.18)' : 'rgba(79,142,240,0.18)'}`,
                  padding: '2px 9px', borderRadius: 100,
                }}>
                  {doneCount}/{gettingStarted.length}
                </div>
              </div>

              {gettingStarted.map(step => (
                <StepRow
                  key={step.label}
                  done={step.done}
                  label={step.label}
                  sub={step.sub}
                  href={step.href}
                />
              ))}
            </div>

            {/* Today's Tip */}
            <div className="bento-card" style={{
              padding: '24px 22px',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(245,158,11,0.09)', border: '1px solid rgba(245,158,11,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Flash size={13} color="rgba(245,158,11,0.85)" variant="TwoTone" />
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                  Today&apos;s Tip
                </span>
              </div>

              {/* tip text */}
              <p style={{
                flex: 1,
                fontSize: 13, color: 'var(--text-2)', lineHeight: 1.68,
                margin: '0 0 18px', letterSpacing: '-0.01em',
              }}>
                {tip.text}
              </p>

              {/* tag */}
              <span style={{
                display: 'inline-block', alignSelf: 'flex-start',
                fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
                padding: '3px 9px', borderRadius: 100,
                background: 'rgba(245,158,11,0.09)', border: '1px solid rgba(245,158,11,0.18)',
                color: 'rgba(245,158,11,0.75)',
              }}>
                {tip.tag}
              </span>
            </div>
          </div>
        </section>

        {/* ── Explore ──────────────────────────────────────────────────── */}
        <section className="db-fade db-fade-4" aria-label="Explore">
          <SectionLabel label="Explore" />
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
              }}>{label}</Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
