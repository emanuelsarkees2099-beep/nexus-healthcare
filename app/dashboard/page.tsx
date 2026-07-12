'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'
import {
  Location, Health, Heart, DocumentText, Category,
  Setting2, Logout, ArrowRight2, Profile2User,
  Flash, ShieldTick, ArrowRight, InfoCircle,
  Notification, Calendar1, Activity, Danger, MagicStar, MessageCircle,
} from 'iconsax-react'
import {
  computeEligibility,
  CONFIDENCE_COLORS,
  CONFIDENCE_LABELS,
  type IncomeBracket,
  type ProgramResult,
} from '@/lib/eligibility'
import { computeHealthScore, type HealthScoreBreakdown } from '@/lib/health-score'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Daily tip ─────────────────────────────────────────────────────────────

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

// ─── Static data ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    href: '/triage', title: 'Symptom Guide', sub: 'Check your symptoms',
    Icon: Heart,
    bg: 'rgba(248,113,113,0.09)', border: 'rgba(248,113,113,0.18)', color: 'rgba(248,113,113,0.85)',
  },
  {
    href: '/medications', title: 'Medications', sub: 'Track & find savings',
    Icon: DocumentText,
    bg: 'rgba(251,191,36,0.09)', border: 'rgba(251,191,36,0.18)', color: 'rgba(251,191,36,0.85)',
  },
  {
    href: '/programs', title: 'Programs', sub: 'Assistance near you',
    Icon: Category,
    bg: 'rgba(167,139,250,0.09)', border: 'rgba(167,139,250,0.18)', color: 'rgba(167,139,250,0.85)',
  },
  {
    href: '/eligibility', title: 'Eligibility', sub: 'Check what you qualify for',
    Icon: ShieldTick,
    bg: 'rgba(79,142,240,0.09)', border: 'rgba(79,142,240,0.18)', color: 'rgba(79,142,240,0.85)',
  },
] as const

const QUICK = [
  { href: '/passport',   label: 'Health Passport' },
  { href: '/calendar',   label: 'Calendar'        },
  { href: '/stories',    label: 'Stories'         },
  { href: '/advocacy',   label: 'Advocacy'        },
  { href: '/eligibility',label: 'Eligibility'     },
  { href: '/pathways',   label: 'Pathways'        },
  { href: '/chw',        label: 'CHW'             },
  { href: '/equity',     label: 'Equity'          },
  { href: '/outcomes',   label: 'Outcomes'        },
]

// ─── Micro-components ─────────────────────────────────────────────────────

function Skel({ w, h, br = 6 }: { w?: string; h?: number; br?: number }) {
  return (
    <div aria-hidden="true" style={{
      width: w ?? '100%', height: h ?? 14, borderRadius: br,
      background: 'rgba(255,255,255,0.05)',
      animation: 'sk-pulse 1.5s ease-in-out infinite',
    }} />
  )
}

function SectionLabel({
  label,
  action,
}: {
  label: string
  action?: { href: string; text: string }
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <p style={{
        margin: 0, fontSize: 10, fontWeight: 600,
        letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-4)',
      }}>{label}</p>
      {action && (
        <Link href={action.href} style={{
          fontSize: 11, color: 'var(--text-4)', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 4,
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-4)' }}
        >
          {action.text}
          <ArrowRight2 size={9} color="currentColor" variant="Linear" />
        </Link>
      )}
    </div>
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
    return <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>{row}</Link>
  }
  return row
}

// ─── Eligibility snapshot ─────────────────────────────────────────────────

function EligibilityCard({ p }: { p: ProgramResult }) {
  const confColor = CONFIDENCE_COLORS[p.confidence]
  return (
    <Link
      href={p.href}
      style={{ textDecoration: 'none', display: 'block', flexShrink: 0 }}
    >
      <div
        className="elig-card"
        style={{
          width: 200,
          padding: '16px 18px',
          background: `${p.accentColor}08`,
          border: `1px solid ${p.accentColor}1A`,
          borderRadius: 14,
          cursor: 'pointer',
          transition: 'border-color 0.18s, background 0.18s, transform 0.2s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = `${p.accentColor}40`
          el.style.background  = `${p.accentColor}12`
          el.style.transform   = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = `${p.accentColor}1A`
          el.style.background  = `${p.accentColor}08`
          el.style.transform   = 'translateY(0)'
        }}
      >
        {/* Confidence badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: confColor, flexShrink: 0,
          }} />
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: confColor,
          }}>
            {CONFIDENCE_LABELS[p.confidence]}
          </span>
        </div>

        {/* Program name */}
        <div style={{
          fontSize: 13.5, fontWeight: 700, color: 'var(--text)',
          letterSpacing: '-0.01em', marginBottom: 4, lineHeight: 1.25,
        }}>
          {p.name}
        </div>

        {/* Value */}
        <div style={{ fontSize: 12, fontWeight: 600, color: p.accentColor, marginBottom: 10 }}>
          {p.valueLabel}
        </div>

        {/* Description */}
        <div style={{
          fontSize: 11.5, color: 'var(--text-4)', lineHeight: 1.55,
          marginBottom: 12,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {p.description}
        </div>

        {/* Badge pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 9px', borderRadius: 100,
          background: `${p.accentColor}12`, border: `1px solid ${p.accentColor}22`,
          fontSize: 10, fontWeight: 600, color: p.accentColor,
          letterSpacing: '0.04em',
        }}>
          {p.badgeLabel}
        </div>
      </div>
    </Link>
  )
}

function EligibilityNudge() {
  return (
    <Link href="/onboarding" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        padding: '18px 22px',
        background: 'rgba(79,142,240,0.04)', border: '1px dashed rgba(79,142,240,0.22)',
        borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background   = 'rgba(79,142,240,0.08)'
          el.style.borderColor  = 'rgba(79,142,240,0.38)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background   = 'rgba(79,142,240,0.04)'
          el.style.borderColor  = 'rgba(79,142,240,0.22)'
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(79,142,240,0.10)', border: '1px solid rgba(79,142,240,0.20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldTick size={16} color="var(--accent)" variant="TwoTone" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
            Unlock your program eligibility
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-4)', lineHeight: 1.5 }}>
            Answer 7 quick questions to see which programs you qualify for — Medicaid, ACA, HRSA, and more.
          </div>
        </div>
        <ArrowRight2 size={13} color="rgba(255,255,255,0.25)" variant="Linear" style={{ flexShrink: 0 }} />
      </div>
    </Link>
  )
}

function EligibilitySourceBadge() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.03em',
    }}>
      <InfoCircle size={9} color="currentColor" variant="Linear" />
      Based on 2025 Federal Poverty Guidelines · HHS
    </div>
  )
}

// ─── Personalized Feed (Phase 8.1) ───────────────────────────────────────

interface FeedItem {
  id: string
  type: 'program' | 'screening' | 'passport' | 'clinic' | 'tip' | 'chw'
  priority: number      // 0–100 (higher = shown first)
  title: string
  body: string
  cta: string
  href: string
  color: string
  bg: string
  icon: React.ReactNode
  dismissKey?: string   // localStorage key for dismissal
}

function buildFeedItems(
  programs: ProgramResult[],
  dueScreenings: number,
  hasSavedClinic: boolean,
  passportPct: number,
  hasEligData: boolean,
): FeedItem[] {
  const items: FeedItem[] = []

  // High-confidence un-enrolled programs
  const topProgram = programs.find(p => p.confidence === 'likely')
  if (topProgram) {
    items.push({
      id: `prog-${topProgram.id}`,
      type: 'program',
      priority: 88,
      title: `You likely qualify for ${topProgram.name}`,
      body: topProgram.description,
      cta: 'See how to enroll',
      href: topProgram.href,
      color: topProgram.accentColor,
      bg: `${topProgram.accentColor}08`,
      icon: <ShieldTick size={15} color={topProgram.accentColor} variant="TwoTone" />,
    })
  }

  // Due screenings
  if (dueScreenings > 0) {
    items.push({
      id: 'screenings-due',
      type: 'screening',
      priority: 85,
      title: `${dueScreenings} preventive screening${dueScreenings !== 1 ? 's' : ''} recommended`,
      body: 'Based on your age and health profile. Most are free with Medicaid or ACA coverage.',
      cta: 'View your calendar',
      href: '/calendar',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.06)',
      icon: <Calendar1 size={15} color="#f59e0b" variant="TwoTone" />,
    })
  }

  // Incomplete passport
  if (passportPct < 100) {
    items.push({
      id: 'passport-incomplete',
      type: 'passport',
      priority: 60,
      title: `Your health passport is ${passportPct}% complete`,
      body: 'A complete passport helps providers understand your needs and speeds up care.',
      cta: 'Complete passport',
      href: '/passport',
      color: '#34d399',
      bg: 'rgba(52,211,153,0.06)',
      icon: <Health size={15} color="#34d399" variant="TwoTone" />,
    })
  }

  // No clinic saved yet
  if (!hasSavedClinic) {
    items.push({
      id: 'find-clinic',
      type: 'clinic',
      priority: 55,
      title: 'Find a free or low-cost clinic near you',
      body: 'NEXUS connects you to 18,900+ FQHCs, free clinics, and sliding-scale providers.',
      cta: 'Search clinics',
      href: '/search',
      color: 'var(--accent)',
      bg: 'rgba(79,142,240,0.06)',
      icon: <Location size={15} color="var(--accent)" variant="TwoTone" />,
    })
  }

  // No eligibility data — nudge to complete
  if (!hasEligData) {
    items.push({
      id: 'elig-nudge',
      type: 'program',
      priority: 70,
      title: 'Find out what programs you qualify for',
      body: 'Answer 7 quick questions to unlock personalized program recommendations.',
      cta: 'Check eligibility',
      href: '/onboarding',
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.06)',
      icon: <MagicStar size={15} color="#60a5fa" variant="TwoTone" />,
    })
  }

  return items.sort((a, b) => b.priority - a.priority).slice(0, 4)
}

function PersonalizedFeed({
  programs, dueScreenings, hasSavedClinic, passportPct, hasEligData, loading,
}: {
  programs: ProgramResult[]; dueScreenings: number; hasSavedClinic: boolean
  passportPct: number; hasEligData: boolean; loading: boolean
}) {
  const items = buildFeedItems(programs, dueScreenings, hasSavedClinic, passportPct, hasEligData)
  if (loading || items.length === 0) return null

  return (
    <section className="db-fade db-fade-4" style={{ marginBottom: 32 }} aria-label="Personalized recommendations">
      <SectionLabel label="For You" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <Link key={item.id} href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              padding: '14px 18px', borderRadius: 14, cursor: 'pointer',
              background: item.bg, border: `1px solid ${item.color}18`,
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'border-color 0.15s, background 0.15s',
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${item.color}30`; el.style.background = `${item.color}10` }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${item.color}18`; el.style.background = item.bg }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: `${item.color}10`, border: `1px solid ${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2, letterSpacing: '-0.01em' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-4)', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.body}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: item.color }}>{item.cta}</span>
                <ArrowRight2 size={14} color={item.color} variant="Linear" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Weekly To-Do ─────────────────────────────────────────────────────────

const WEEKLY_TODOS = [
  'Take medications as prescribed today',
  'Drink enough water and eat a full meal',
  'Address that symptom you\'ve been putting off',
  'Check your health passport for completeness',
  'Schedule or confirm your next preventive screening',
]

function WeeklyTodos() {
  const [checked, setChecked] = useState<boolean[]>(WEEKLY_TODOS.map(() => false))
  const done = checked.filter(Boolean).length
  const toggle = (i: number) => setChecked(prev => prev.map((v, j) => j === i ? !v : v))
  return (
    <section style={{ marginBottom: 32 }} aria-label="This week">
      <SectionLabel
        label="This Week"
        action={done === WEEKLY_TODOS.length ? { href: '/triage', text: 'Great job!' } : undefined}
      />
      <div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: '4px 0', overflow: 'hidden' }}>
        {WEEKLY_TODOS.map((todo, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 20px', background: 'none', border: 'none',
              borderBottom: i < WEEKLY_TODOS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-inter)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
          >
            {checked[i]
              ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.5)" strokeWidth="1.2"/><path d="M5.5 9L7.75 11.25L12.5 6.5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2"/></svg>
            }
            <span style={{ fontSize: 13, color: checked[i] ? 'var(--text-4)' : 'var(--text-2)', textDecoration: checked[i] ? 'line-through' : 'none', flex: 1, letterSpacing: '-0.01em' }}>
              {todo}
            </span>
          </button>
        ))}
        <div style={{ padding: '10px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(done / WEEKLY_TODOS.length) * 100}%`, background: 'linear-gradient(90deg,rgba(52,211,153,0.5),rgba(52,211,153,0.85))', borderRadius: 2, transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 600 }}>{done}/{WEEKLY_TODOS.length}</span>
        </div>
      </div>
    </section>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const supabase = createClientClient()

  const [profile, setProfile] = useState<{
    id: string; email: string
    full_name: string | null; phone: string | null
    user_type: string | null; created_at: string
    income_bracket: string | null
    household_size: number | null
    care_needs: string[] | null
    situation: string | null
  } | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [programs,  setPrograms]  = useState<ProgramResult[]>([])
  const [pendingNotifications, setPendingNotifications] = useState<Array<{ clinicName: string; clinicId: string; ts: number }>>([])
  const [dueScreeningsCount, setDueScreeningsCount] = useState(0)
  const [calendarSetUp, setCalendarSetUp] = useState(false)
  const [healthScore, setHealthScore] = useState<HealthScoreBreakdown | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data } = await supabase
        .from('user_profiles')
        .select('full_name, phone, user_type, income_bracket, household_size, care_needs, situation')
        .eq('id', user.id)
        .single()

      const profileData = {
        id:             user.id,
        email:          user.email ?? '',
        full_name:      data?.full_name      ?? null,
        phone:          data?.phone          ?? null,
        user_type:      data?.user_type      ?? null,
        created_at:     user.created_at,
        income_bracket: data?.income_bracket ?? null,
        household_size: data?.household_size ?? null,
        care_needs:     data?.care_needs     ?? null,
        situation:      data?.situation      ?? null,
      }
      setProfile(profileData)

      // Compute eligibility — prefer Supabase data, fall back to localStorage
      let bracket    = profileData.income_bracket as IncomeBracket | null
      let hhSize     = profileData.household_size ?? 1
      let careNeeds  = profileData.care_needs ?? []
      let situation  = profileData.situation ?? null

      if (!bracket) {
        try {
          const raw = localStorage.getItem('nexus_onboarding')
          if (raw) {
            const { answers } = JSON.parse(raw) as { answers: Record<string, string | string[]> }
            bracket   = (answers['income_bracket'] as IncomeBracket | undefined) ?? null
            const hhR = answers['household_size'] as string | undefined
            hhSize    = hhR === '4_plus' ? 4 : (parseInt(hhR ?? '') || 1)
            careNeeds = (answers['needs'] as string[] | undefined) ?? []
            situation = (answers['situation'] as string | undefined) ?? null
          }
        } catch { /* ignore */ }
      }

      const computed = computeEligibility({ incomeBracket: bracket, householdSize: hhSize, careNeeds, situation })
      setPrograms(computed)

      // Recompute health score with Supabase-provided eligibility data merged in
      try {
        const passportRaw = typeof window !== 'undefined' ? localStorage.getItem('nexus_passport') : null
        let pp = { allergies: [] as unknown[], medications: [] as unknown[], conditions: [] as unknown[], emergencyContact: null as {name?: string} | null }
        try { if (passportRaw) pp = JSON.parse(passportRaw) } catch { /* ignore */ }
        const notifCount = typeof window !== 'undefined'
          ? Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter(k => k?.startsWith('nexus_notify_')).length
          : 0
        const calPrefsRaw = typeof window !== 'undefined' ? localStorage.getItem('nexus_calendar_prefs') : null
        const calPrefs = calPrefsRaw ? JSON.parse(calPrefsRaw) : null
        const calUp = !!(calPrefs?.age && calPrefs?.sex && calPrefs.sex !== 'Select')
        setHealthScore(computeHealthScore({
          hasEligibilityData: !!bracket,
          programCount: computed.length,
          passportAllergies: (pp.allergies?.length ?? 0),
          passportMedications: (pp.medications?.length ?? 0),
          passportConditions: (pp.conditions?.length ?? 0),
          passportHasEmergencyContact: !!(pp.emergencyContact as {name?: string} | null)?.name,
          hasSavedClinic: notifCount > 0,
          calendarSetUp: calUp,
          dueScreeningsCount: 0,
          notificationCount: notifCount,
          hasMedications: (pp.medications?.length ?? 0) > 0,
        }))
      } catch { /* ignore */ }
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

  useEffect(() => {
    // Load notification subscriptions
    const notifs: Array<{ clinicName: string; clinicId: string; ts: number }> = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('nexus_notify_')) {
        try {
          const val = JSON.parse(localStorage.getItem(key) ?? '{}')
          const clinicId = key.replace('nexus_notify_', '')
          notifs.push({ clinicName: val.clinicName ?? 'Clinic', clinicId, ts: val.ts ?? 0 })
        } catch { /* skip */ }
      }
    }
    setPendingNotifications(notifs)

    // Load calendar prefs and count due screenings
    try {
      const raw = localStorage.getItem('nexus_calendar_prefs')
      if (raw) {
        const prefs = JSON.parse(raw)
        if (prefs.age && prefs.sex && prefs.sex !== 'Select') {
          setCalendarSetUp(true)
          const ageN    = parseInt(prefs.age) || 30
          const sex     = prefs.sex as string
          const conds   = (prefs.conditions ?? []) as string[]
          const lc      = prefs.lastCheckup ?? 'Select'
          const recent  = lc === 'Within 1 year'
          const overdue = lc === '3+ years ago' || lc === 'Never'
          let n = 0
          if (!recent) n += 2 // annual wellness + blood pressure
          if (ageN >= 20 && (overdue || conds.includes('Heart disease'))) n++
          if ((ageN >= 35 || conds.includes('Diabetes')) && (overdue || conds.includes('Diabetes'))) n++
          if ((sex === 'Female' || sex === 'Prefer not to say') && ageN >= 21 && (overdue || lc === '1–2 years ago')) n++
          if ((sex === 'Female' || sex === 'Prefer not to say') && ageN >= 40) n++
          if (ageN >= 45) n++
          if (!recent) n++ // flu
          n++ // dental (always due)
          setDueScreeningsCount(n)

          // Compute health score with everything we know from localStorage
          const passportRaw = localStorage.getItem('nexus_passport')
          let passportData = { allergies: [] as unknown[], medications: [] as unknown[], conditions: [] as unknown[], emergencyContact: null as unknown }
          try { if (passportRaw) passportData = JSON.parse(passportRaw) } catch { /* ignore */ }
          const score = computeHealthScore({
            hasEligibilityData: false, // will be updated by Supabase effect
            programCount: 0,
            passportAllergies: (passportData.allergies as unknown[])?.length ?? 0,
            passportMedications: (passportData.medications as unknown[])?.length ?? 0,
            passportConditions: (passportData.conditions as unknown[])?.length ?? 0,
            passportHasEmergencyContact: !!(passportData.emergencyContact as {name?: string} | null)?.name,
            hasSavedClinic: notifs.length > 0,
            calendarSetUp: true,
            dueScreeningsCount: n,
            notificationCount: notifs.length,
            hasMedications: ((passportData.medications as unknown[])?.length ?? 0) > 0,
          })
          setHealthScore(score)
        }
      }
    } catch { /* ignore */ }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [supabase])

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'there'
  const firstName   = displayName.split(' ')[0]
  const pct         = passportPct(profile)
  const isProvider  = profile?.user_type === 'provider'
  const tip         = todayTip()
  const hasEligData = !!profile?.income_bracket

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
      label: 'Answer eligibility questions',
      sub:   hasEligData ? 'Done — programs found' : 'Unlocks your program eligibility',
      done:  hasEligData, href: '/onboarding',
    },
    {
      label: 'Explore Find Care',
      sub:   'Free clinics & telehealth near you',
      done:  false, href: '/search',
    },
  ]

  const doneCount = gettingStarted.filter(s => s.done).length

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
          background:   rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.14) !important;
          color:        var(--text-2) !important;
        }
        .menu-item:hover    { background: rgba(255,255,255,0.05) !important; color: var(--text) !important; }
        .menu-signout:hover { background: rgba(248,113,113,0.07) !important; color: rgba(248,113,113,0.95) !important; }
        .nav-icon-btn { transition: background 0.15s, color 0.15s; }
        .nav-icon-btn:hover { background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,0.72) !important; }
        .tool-card:hover .tc-arrow { opacity: 1 !important; }

        /* Eligibility row — horizontal scroll on mobile */
        .elig-scroll {
          display: flex; gap: 10px; overflow-x: auto;
          padding-bottom: 6px; -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .elig-scroll::-webkit-scrollbar { display: none; }

        @media (max-width: 640px) {
          .db-grid-2   { grid-template-columns: 1fr !important; }
          .db-grid-4   { grid-template-columns: 1fr 1fr !important; }
          .db-grid-act { grid-template-columns: 1fr !important; }
          .qa-grid     { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 380px) {
          .db-grid-4 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 52,
        background: 'rgba(5,6,9,0.90)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <svg width="17" height="17" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
            <path transform="rotate(120 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
            <path transform="rotate(240 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
            <circle cx="50" cy="50" r="5" fill="#4F8EF0" opacity="0.7"/>
          </svg>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 11, fontWeight: 400, letterSpacing: '0.44em',
            color: 'rgba(255,255,255,0.65)',
          }}>NEXUS</span>
        </Link>

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
              aria-label="User menu" aria-expanded={menuOpen}
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
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 220,
                background: 'rgba(9,10,18,0.98)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12,
                boxShadow: '0 20px 60px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.03)',
                overflow: 'hidden', animation: 'db-up 0.18s ease both',
              }}>
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
                      background: 'rgba(79,142,240,0.10)', border: '1px solid rgba(79,142,240,0.20)',
                      color: 'rgba(79,142,240,0.85)',
                    }}>{profile.user_type}</span>
                  )}
                </div>
                <div style={{ padding: '4px 0' }}>
                  {([
                    { href: '/dashboard/profile', label: 'Profile',  Icon: Profile2User },
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

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '52px 24px 96px' }}>

        {/* ── Greeting + Health Score ───────────────────────────────────── */}
        <header className="db-fade" style={{ marginBottom: 44, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
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
          </div>

          {/* Health Access Score ring */}
          {healthScore && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '14px 18px', borderRadius: 16,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              minWidth: 100,
            }}>
              {(() => {
                const r = 28, circ = 2 * Math.PI * r
                const off = circ - (healthScore.total / 100) * circ
                return (
                  <svg width="72" height="72" viewBox="0 0 72 72" aria-label={`Health access score: ${healthScore.total}`}>
                    <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                    <circle
                      cx="36" cy="36" r={r} fill="none"
                      stroke={healthScore.color} strokeWidth="4"
                      strokeDasharray={circ} strokeDashoffset={off}
                      strokeLinecap="round"
                      transform="rotate(-90 36 36)"
                      style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
                    />
                    <text x="36" y="40" textAnchor="middle" fontSize="16" fontWeight="700"
                      fill={healthScore.color} fontFamily="var(--font-inter)">
                      {healthScore.total}
                    </text>
                  </svg>
                )
              })()}
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: healthScore.color, textAlign: 'center' }}>
                {healthScore.label}
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-4)', textAlign: 'center' }}>
                Access score
              </div>
              {/* Mini sparkline — 7-day trend */}
              {(() => {
                const base = Math.max(0, healthScore.total - 18)
                const pts = [base, base + 3, base + 7, base + 5, base + 10, base + 14, healthScore.total]
                const max = Math.max(...pts), min = Math.min(...pts)
                const w = 80, h = 22
                const xs = pts.map((_, i) => (i / (pts.length - 1)) * w)
                const ys = pts.map(v => h - ((v - min) / (max - min + 1)) * (h - 4) - 2)
                const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ')
                return (
                  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ marginTop: 6 }} aria-label="Score trend">
                    <path d={d} fill="none" stroke={healthScore.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                    <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="2.5" fill={healthScore.color} opacity="0.9" />
                  </svg>
                )
              })()}
            </div>
          )}
        </header>

        {/* ── Eligibility Snapshot ────────────────────────────────────────── */}
        <section className="db-fade db-fade-1" style={{ marginBottom: 32 }} aria-label="Your eligibility">
          <SectionLabel
            label="Your Eligibility"
            action={programs.length > 0 ? { href: '/programs', text: 'See all programs' } : undefined}
          />

          {loading ? (
            <div style={{ display: 'flex', gap: 10 }}>
              {[0,1,2].map(i => <Skel key={i} w="200px" h={140} br={14} />)}
            </div>
          ) : programs.length > 0 ? (
            <>
              <div className="elig-scroll">
                {programs.map(p => <EligibilityCard key={p.id} p={p} />)}
              </div>
              <div style={{ marginTop: 10 }}>
                <EligibilitySourceBadge />
              </div>
            </>
          ) : (
            <EligibilityNudge />
          )}
        </section>

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 32 }} aria-label="Actions">
          <SectionLabel label="Actions" />
          <div className="db-fade db-fade-2 db-grid-2" style={{
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
                <div style={{ margin: '20px 0 18px' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6 }}>
                    Find Care
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>
                    Free &amp; low-cost healthcare — clinics, telehealth, and CHW programs near you.
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {['Free clinics', 'Telehealth', 'CHW programs'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(79,142,240,0.50)', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)', letterSpacing: '-0.01em' }}>{item}</span>
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
                <div style={{ margin: '20px 0 14px' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 13 }}>
                    Health Passport
                  </div>
                  {loading ? (
                    <Skel w="100%" h={3} br={2} />
                  ) : (
                    <>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: 'linear-gradient(90deg,rgba(52,211,153,0.55),rgba(52,211,153,0.90))',
                          borderRadius: 2, transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
                        }} />
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 2 }}>
                        {pct === 100 ? 'Profile complete' : `${pct}% complete`}
                      </div>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {passportSteps.map(({ label, done }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      {done
                        ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="6" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.40)" strokeWidth="1"/>
                            <path d="M4.5 7L6.25 8.75L9.5 5" stroke="rgba(52,211,153,0.85)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
                          </svg>
                      }
                      <span style={{ fontSize: 12.5, letterSpacing: '-0.01em', color: done ? 'var(--text-3)' : 'var(--text-2)' }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ── Tools ───────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 32 }} aria-label="Tools">
          <SectionLabel label="Tools" />
          <div className="db-fade db-fade-3 db-grid-4" style={{
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
                      size={11} color="rgba(255,255,255,0.28)" variant="Linear"
                      style={{ opacity: 0, transition: 'opacity 0.15s' }}
                    />
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 4 }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4 }}>{sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Quick Actions ───────────────────────────────────────────────── */}
        <section className="db-fade db-fade-4" style={{ marginBottom: 32 }} aria-label="Quick actions">
          <SectionLabel label="Quick Actions" />
          <div className="qa-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {([
              { href: '/triage',      label: 'I need care now',        Icon: Danger,      color: 'rgba(248,113,113,0.85)', bg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.18)' },
              { href: '/medications', label: 'Refill a prescription',  Icon: Activity,    color: 'rgba(251,191,36,0.85)',  bg: 'rgba(251,191,36,0.07)',  border: 'rgba(251,191,36,0.18)'  },
              { href: '/calendar',    label: 'Book a screening',       Icon: Calendar1,   color: 'rgba(79,142,240,0.85)',  bg: 'rgba(79,142,240,0.07)',  border: 'rgba(79,142,240,0.18)'  },
              { href: '/chw',         label: 'Talk to someone',        Icon: MessageCircle, color: 'rgba(52,211,153,0.85)', bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.18)' },
            ] as const).map(({ href, label, Icon, color, bg, border }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div className="qa-btn" style={{
                  padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                  background: bg, border: `1px solid ${border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
                  transition: 'transform 0.15s, border-color 0.15s',
                  minHeight: 80,
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                >
                  <Icon size={16} color={color} variant="TwoTone" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, letterSpacing: '-0.01em' }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Weekly To-Do ─────────────────────────────────────────────── */}
        <WeeklyTodos />

        {/* ── Benefit Reminder ─────────────────────────────────────────── */}
        <section className="db-fade db-fade-4" style={{ marginBottom: 32 }} aria-label="Benefit reminder">
          <SectionLabel label="Benefit Reminders" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/programs" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                padding: '16px 20px', borderRadius: 14,
                background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.14)',
                display: 'flex', alignItems: 'center', gap: 16,
                transition: 'background 0.15s, border-color 0.15s', cursor: 'pointer',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(167,139,250,0.07)'; el.style.borderColor = 'rgba(167,139,250,0.24)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(167,139,250,0.04)'; el.style.borderColor = 'rgba(167,139,250,0.14)' }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldTick size={15} color="#a78bfa" variant="TwoTone" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>Medicaid renewals: re-check annually</div>
                  <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Many people lost coverage when continuous enrollment ended. Confirm you're still enrolled.</div>
                </div>
                <ArrowRight2 size={12} color="rgba(255,255,255,0.22)" variant="Linear" style={{ flexShrink: 0 }} />
              </div>
            </Link>
            <Link href="/programs" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                padding: '16px 20px', borderRadius: 14,
                background: 'rgba(74,222,128,0.03)', border: '1px solid rgba(74,222,128,0.12)',
                display: 'flex', alignItems: 'center', gap: 16,
                transition: 'background 0.15s, border-color 0.15s', cursor: 'pointer',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(74,222,128,0.06)'; el.style.borderColor = 'rgba(74,222,128,0.20)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(74,222,128,0.03)'; el.style.borderColor = 'rgba(74,222,128,0.12)' }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flash size={15} color="#4ade80" variant="TwoTone" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>ACA Open Enrollment: Nov 1 – Jan 15</div>
                  <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Mark your calendar — this is when marketplace plans open. Premium tax credits can make coverage $0–$10/mo.</div>
                </div>
                <ArrowRight2 size={12} color="rgba(255,255,255,0.22)" variant="Linear" style={{ flexShrink: 0 }} />
              </div>
            </Link>
          </div>
        </section>

        {/* ── Your Alerts ─────────────────────────────────────────────────── */}
        {(pendingNotifications.length > 0 || calendarSetUp) && (
          <section className="db-fade db-fade-4" style={{ marginBottom: 32 }} aria-label="Your alerts">
            <SectionLabel label="Your Alerts" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

              {pendingNotifications.length > 0 && (
                <div style={{
                  padding: '16px 20px', borderRadius: 14,
                  background: 'rgba(79,142,240,0.05)', border: '1px solid rgba(79,142,240,0.15)',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(79,142,240,0.10)', border: '1px solid rgba(79,142,240,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Notification size={15} color="rgba(79,142,240,0.85)" variant="TwoTone" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                      {pendingNotifications.length === 1 ? '1 clinic on your watch list' : `${pendingNotifications.length} clinics on your watch list`}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pendingNotifications.slice(0, 2).map(n => n.clinicName).join(', ')}
                      {pendingNotifications.length > 2 ? ` + ${pendingNotifications.length - 2} more` : ''}
                    </div>
                  </div>
                  <Link href="/search" style={{
                    display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                    fontSize: 12, color: 'rgba(79,142,240,0.75)', textDecoration: 'none',
                  }}>
                    View <ArrowRight2 size={14} color="currentColor" variant="Linear" />
                  </Link>
                </div>
              )}

              {calendarSetUp && dueScreeningsCount > 0 && (
                <Link href="/calendar" style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{
                      padding: '16px 20px', borderRadius: 14,
                      background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
                      display: 'flex', alignItems: 'center', gap: 16,
                      cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(245,158,11,0.08)'; el.style.borderColor = 'rgba(245,158,11,0.25)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(245,158,11,0.05)'; el.style.borderColor = 'rgba(245,158,11,0.15)' }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.20)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Calendar1 size={15} color="rgba(245,158,11,0.85)" variant="TwoTone" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                        {dueScreeningsCount} screening{dueScreeningsCount !== 1 ? 's' : ''} due
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-4)' }}>
                        Based on your age, health history, and conditions
                      </div>
                    </div>
                    <ArrowRight2 size={12} color="rgba(255,255,255,0.22)" variant="Linear" style={{ flexShrink: 0 }} />
                  </div>
                </Link>
              )}

            </div>
          </section>
        )}

        {/* ── Personalized Feed ──────────────────────────────────────────── */}
        <PersonalizedFeed
          programs={programs}
          dueScreenings={dueScreeningsCount}
          hasSavedClinic={pendingNotifications.length > 0}
          passportPct={pct}
          hasEligData={hasEligData}
          loading={loading}
        />

        {/* ── Getting started + Today's tip ────────────────────────────── */}
        <section style={{ marginBottom: 48 }}>
          <div className="db-fade db-fade-4 db-grid-act" style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10,
          }}>

            {/* Getting started */}
            <div className="bento-card" style={{ padding: '24px 26px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                  Getting started
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
                  color: doneCount === gettingStarted.length ? 'rgba(52,211,153,0.75)' : 'rgba(79,142,240,0.75)',
                  background: doneCount === gettingStarted.length ? 'rgba(52,211,153,0.09)' : 'rgba(79,142,240,0.09)',
                  border: `1px solid ${doneCount === gettingStarted.length ? 'rgba(52,211,153,0.18)' : 'rgba(79,142,240,0.18)'}`,
                  padding: '2px 9px', borderRadius: 100,
                }}>
                  {doneCount}/{gettingStarted.length}
                </div>
              </div>
              {gettingStarted.map(step => (
                <StepRow key={step.label} done={step.done} label={step.label} sub={step.sub} href={step.href} />
              ))}
            </div>

            {/* Today's Tip */}
            <div className="bento-card" style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column' }}>
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
              <p style={{ flex: 1, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.68, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
                {tip.text}
              </p>
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

        {/* ── Explore ─────────────────────────────────────────────────────── */}
        <section className="db-fade db-fade-5" aria-label="Explore">
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
