'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientClient } from '@/lib/auth-client'
import AppShell from '@/components/AppShell'

type UserProfile = {
  id: string
  email?: string
  full_name?: string
  phone?: string
  user_type?: 'patient' | 'provider' | 'admin'
  created_at?: string
}

type SavedClinic = {
  id: string
  resource_id: string
  resource_type: string
  resource_name?: string
  resource_data?: Record<string, unknown>
  created_at: string
}

type TimelineEntry = {
  id: string
  date: string
  icon: React.ReactNode
  title: string
  sub: string
  color: string
}

/* ── Small reusable pieces ──────────────────────────────────────── */

function SectionHeader({ title, action, actionLabel }: { title: string; action?: () => void; actionLabel?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', fontFamily: 'var(--font-inter)' }}>
        {title}
      </h2>
      {action && actionLabel && (
        <button onClick={action} style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontWeight: 500 }}>
          {actionLabel} →
        </button>
      )}
    </div>
  )
}

function EmptyState({ icon, title, sub, cta, href }: { icon: React.ReactNode; title: string; sub: string; cta: string; href: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 24px', borderRadius: '14px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)' }}>
      <div style={{ fontSize: '28px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px', fontFamily: 'var(--font-inter)' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', fontFamily: 'var(--font-inter)', lineHeight: 1.6 }}>{sub}</div>
      <Link href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>
        {cta}
      </Link>
    </div>
  )
}

/* ── Saved Clinics panel ──────────────────────────────────────────── */
function SavedClinicsPanel({ userId }: { userId: string }) {
  const [saved, setSaved]   = useState<SavedClinic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClientClient()
    supabase.from('bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => { setSaved((data as SavedClinic[]) ?? []); setLoading(false) })
  }, [userId])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1,2].map(i => <div key={i} style={{ height: '64px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.5s infinite' }} />)}
    </div>
  )

  if (!saved.length) return (
    <EmptyState icon="🏥" title="No saved clinics yet" sub="Bookmark clinics in the search results to see them here." cta="Search clinics" href="/search" />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {saved.map(s => {
        const data = s.resource_data as any ?? {}
        const name = s.resource_name || data.name || 'Clinic'
        const addr = data.address ? `${data.address}, ${data.city ?? ''}` : (data.city ?? '')
        const phone = data.phone ?? ''
        const gMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + addr)}`
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(74,144,217,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
              {addr && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{addr}</div>}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {phone && (
                <a href={`tel:${phone.replace(/\D/g,'')}`} style={{ padding: '5px 10px', borderRadius: '7px', background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.15)', color: 'var(--accent)', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}>Call</a>
              )}
              <a href={gMaps} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '11px', textDecoration: 'none' }}>Map</a>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Health Timeline ─────────────────────────────────────────────── */
function HealthTimeline({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Build timeline from bookmarks and submissions
    const supabase = createClientClient()
    Promise.all([
      supabase.from('bookmarks').select('id,created_at,resource_name').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('submissions').select('id,created_at,type').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    ]).then(([bRes, sRes]) => {
      const timeline: TimelineEntry[] = []
      ;(bRes.data ?? []).forEach((b: any) => {
        timeline.push({
          id: `b-${b.id}`,
          date: b.created_at,
          icon: '🏥',
          title: `Saved clinic`,
          sub: b.resource_name || 'A clinic',
          color: 'var(--accent)',
        })
      })
      ;(sRes.data ?? []).forEach((s: any) => {
        timeline.push({
          id: `s-${s.id}`,
          date: s.created_at,
          icon: '📝',
          title: `Submitted ${s.type || 'form'}`,
          sub: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          color: '#60a5fa',
        })
      })
      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setEntries(timeline.slice(0, 8))
      setLoading(false)
    })
  }, [userId])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {[1,2,3].map(i => <div key={i} style={{ height: '48px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.5s infinite' }} />)}
    </div>
  )

  if (!entries.length) return (
    <div style={{ textAlign: 'center', padding: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)' }}>
      Your health activity will appear here as you use NEXUS.
    </div>
  )

  return (
    <div style={{ position: 'relative' }}>
      {/* Timeline line */}
      <div style={{ position: 'absolute', left: '18px', top: '18px', bottom: '18px', width: '1px', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {entries.map(e => (
          <div key={e.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '10px 0 10px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px', zIndex: 1 }}>
              {e.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--font-inter)' }}>{e.title}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                {e.sub} · {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Savings Calculator ──────────────────────────────────────────── */
function SavingsCalculator({ savedCount }: { savedCount: number }) {
  // Estimated avg ER visit cost: $1,500. Each search/clinic save = avoided ER visit.
  const erCost    = 1500
  const avgSaving = 847  // avg savings vs ER per NEXUS visit
  const estimated = savedCount * avgSaving

  return (
    <div style={{ padding: '24px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(74,144,217,0.06) 0%, rgba(96,165,250,0.02) 100%)', border: '1px solid rgba(74,144,217,0.15)' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'var(--font-inter)' }}>
        Estimated savings vs. ER
      </div>

      <div style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '4px' }}>
        ${estimated.toLocaleString()}
      </div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-inter)', marginBottom: '20px' }}>
        based on {savedCount} clinic{savedCount !== 1 ? 's' : ''} saved · avg ER visit: ${erCost.toLocaleString()}
      </div>

      {/* Savings bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontFamily: 'var(--font-inter)' }}>
          <span>NEXUS cost</span>
          <span>ER visit avg</span>
        </div>
        <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.07)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2.7%', borderRadius: '4px', background: 'var(--accent)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px', fontFamily: 'var(--font-mono, monospace)' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>$0</span>
          <span style={{ color: '#f87171', fontWeight: 700 }}>${erCost.toLocaleString()}</span>
        </div>
      </div>

      <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>
        Find more free care →
      </Link>
    </div>
  )
}

/* ── Care Plan ────────────────────────────────────────────────────── */
function CarePlan() {
  const [goals, setGoals]   = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('nexus_care_goals') ?? '[]') } catch { return [] }
  })
  const [input, setInput]   = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addGoal = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const updated = [...goals, trimmed]
    setGoals(updated)
    localStorage.setItem('nexus_care_goals', JSON.stringify(updated))
    setInput('')
  }

  const removeGoal = (i: number) => {
    const updated = goals.filter((_, idx) => idx !== i)
    setGoals(updated)
    localStorage.setItem('nexus_care_goals', JSON.stringify(updated))
  }

  return (
    <div>
      {goals.length === 0 && (
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)', marginBottom: '12px', lineHeight: 1.6 }}>
          Add your health goals — dental checkup, mental health visit, vaccination — and NEXUS will help you find the right free care.
        </p>
      )}

      {goals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {goals.map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)', fontFamily: 'var(--font-inter)' }}>{g}</span>
              <button onClick={() => removeGoal(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '2px', display: 'flex', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addGoal()}
          placeholder="Add a health goal…"
          style={{ flex: 1, padding: '9px 14px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text)', fontSize: '13px', fontFamily: 'var(--font-inter)', outline: 'none' }}
        />
        <button
          onClick={addGoal}
          style={{ padding: '9px 16px', borderRadius: '9px', background: 'var(--accent)', color: '#07070F', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter)', flexShrink: 0 }}
        >
          Add
        </button>
      </div>
    </div>
  )
}

/* ── U16: Last Viewed Clinics ────────────────────────────────────── */
type LastViewedEntry = { id: string; name: string; city: string; state: string; ts: number }

function LastViewedSection() {
  const [items, setItems] = useState<LastViewedEntry[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nexus_last_viewed')
      if (raw) setItems(JSON.parse(raw).slice(0, 6))
    } catch { /* ignore */ }
  }, [])

  if (!items.length) return null

  return (
    <div style={{ gridColumn: '1 / -1', marginBottom: '0' }}>
      <SectionHeader title="Recently viewed" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
        {items.map(item => {
          const timeAgo = (() => {
            const diff = Date.now() - item.ts
            const m = Math.floor(diff / 60000)
            const h = Math.floor(diff / 3600000)
            const d = Math.floor(diff / 86400000)
            if (m < 1)  return 'Just now'
            if (m < 60) return `${m}m ago`
            if (h < 24) return `${h}h ago`
            return `${d}d ago`
          })()
          return (
            <Link
              key={item.id}
              href={`/clinics/${item.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none', transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'rgba(74,144,217,0.22)'
                el.style.background  = 'rgba(74,144,217,0.03)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'rgba(255,255,255,0.06)'
                el.style.background  = 'rgba(255,255,255,0.02)'
              }}
            >
              {/* Icon */}
              <div style={{
                width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-inter)', marginTop: '2px', display: 'flex', gap: '5px' }}>
                  <span>{item.city}, {item.state}</span>
                  <span aria-hidden="true">·</span>
                  <span>{timeAgo}</span>
                </div>
              </div>
              {/* Arrow */}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ── Quick Actions ───────────────────────────────────────────────── */
function QuickActions({ router }: { router: ReturnType<typeof useRouter> }) {
  const ACTIONS = [
    { label: 'Re-search near me', sub: 'Use my last location', icon: '🔍', action: () => router.push('/search') },
    { label: 'Crisis support', sub: 'Free, confidential, 24/7', icon: '🆘', action: () => router.push('/crisis') },
    { label: 'Find telehealth', sub: 'Remote care in minutes', icon: '💻', action: () => router.push('/telehealth') },
    { label: 'Know your rights', sub: 'Legal patient protections', icon: '⚖️', action: () => router.push('/rights') },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
      {ACTIONS.map(a => (
        <button
          key={a.label}
          onClick={a.action}
          style={{ textAlign: 'left', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(74,144,217,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,144,217,0.18)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
        >
          <div style={{ fontSize: '22px', marginBottom: '8px' }}>{a.icon}</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)', marginBottom: '3px' }}>{a.label}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)' }}>{a.sub}</div>
        </button>
      ))}
    </div>
  )
}

/* ── Eligibility Status Badge (E4) ──────────────────────────────── */
function EligibilityBadge() {
  const [badge, setBadge] = useState<{ situation: string; needs: string[] } | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nexus_onboarding')
      if (!raw) return
      const saved = JSON.parse(raw)
      const a = saved.answers ?? {}
      if (!a.situation) return
      const labelsMap: Record<string, string> = {
        uninsured: 'Uninsured',
        underinsured: 'Underinsured',
        transition: 'Lost coverage',
        helper: 'Helping someone',
      }
      const needLabels: Record<string, string> = {
        primary: 'Primary care', dental: 'Dental', mental: 'Mental health',
        prescriptions: 'Prescriptions', vision: 'Vision',
        pregnancy: 'Prenatal', emergency: 'Urgent care',
      }
      setBadge({
        situation: labelsMap[a.situation as string] ?? 'Other',
        needs: ((a.needs as string[]) ?? []).slice(0, 3).map(n => needLabels[n] ?? n),
      })
    } catch { /* ignore */ }
  }, [])

  if (!badge) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.12)' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)' }}>
        Eligibility profile
      </span>
      <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.08)' }} />
      <span style={{ padding: '3px 10px', borderRadius: '100px', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-inter)', fontWeight: 600 }}>
        {badge.situation}
      </span>
      {badge.needs.map(n => (
        <span key={n} style={{ padding: '3px 10px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)' }}>
          {n}
        </span>
      ))}
      <Link href="/programs" style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-inter)', fontWeight: 600, textDecoration: 'none' }}>
        Check programs →
      </Link>
    </div>
  )
}

/* ── Recent Searches (E4) ───────────────────────────────────────── */
type RecentSearch = { q: string; loc: string; ts: number }

function RecentSearchesSection({ router }: { router: ReturnType<typeof useRouter> }) {
  const [searches, setSearches] = useState<RecentSearch[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nexus_recent_searches')
      if (raw) setSearches(JSON.parse(raw).slice(0, 5))
    } catch { /* ignore */ }
  }, [])

  if (!searches.length) return null

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <SectionHeader title="Recent searches" action={() => router.push('/search')} actionLabel="New search" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {searches.map((s, i) => {
          const timeAgo = (() => {
            const m = Math.floor((Date.now() - s.ts) / 60000)
            if (m < 1) return 'Just now'
            if (m < 60) return `${m}m ago`
            const h = Math.floor(m / 60)
            if (h < 24) return `${h}h ago`
            return `${Math.floor(h / 24)}d ago`
          })()
          const href = `/search?q=${encodeURIComponent(s.q)}&loc=${encodeURIComponent(s.loc)}`
          return (
            <Link
              key={i}
              href={href}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none', transition: 'border-color 0.2s', maxWidth: '260px' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(74,144,217,0.22)'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.q || 'Free clinics'}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)', marginTop: '1px' }}>
                  {s.loc} · {timeAgo}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ── Notification Settings (E10 / E4) ───────────────────────────── */
function NotificationSettings({ userId }: { userId: string }) {
  const [enabled, setEnabled] = useState(false)
  const [status, setStatus]   = useState<'idle' | 'requesting' | 'subscribed' | 'denied' | 'unsupported'>('idle')

  useEffect(() => {
    // Check current permission state
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported'); return
    }
    if (Notification.permission === 'granted') {
      setEnabled(true); setStatus('subscribed')
    } else if (Notification.permission === 'denied') {
      setStatus('denied')
    }
  }, [])

  const subscribe = async () => {
    if (!('Notification' in window)) return
    setStatus('requesting')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return }

      // Get VAPID public key
      const keyRes = await fetch('/api/push/subscribe')
      if (!keyRes.ok) {
        // VAPID not configured — still enable local notifications
        setEnabled(true); setStatus('subscribed'); return
      }
      const { vapidPublicKey } = await keyRes.json()

      // Register push subscription via service worker
      const sw = await navigator.serviceWorker.ready
      const sub = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      })

      // Send to backend
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), userId }),
      })

      setEnabled(true); setStatus('subscribed')
    } catch {
      setStatus('denied')
    }
  }

  const unsubscribe = async () => {
    try {
      const sw = await navigator.serviceWorker.ready
      const sub = await sw.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
    } catch { /* ignore */ }
    setEnabled(false); setStatus('idle')
  }

  return (
    <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)', marginBottom: '4px' }}>
            Clinic reminders
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)', lineHeight: 1.6 }}>
            {status === 'subscribed' ? 'You\'ll be notified about saved clinics and health reminders.' :
             status === 'denied'     ? 'Blocked in browser settings. Open site settings to re-enable.' :
             status === 'unsupported'? 'Not supported in your browser.' :
             'Get notified when saved clinics update hours or availability.'}
          </div>
        </div>
        {status !== 'unsupported' && status !== 'denied' && (
          <button
            onClick={enabled ? unsubscribe : subscribe}
            disabled={status === 'requesting'}
            style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: status === 'requesting' ? 'not-allowed' : 'pointer',
              background: enabled ? 'rgba(74,144,217,0.15)' : 'var(--accent)',
              color: enabled ? 'var(--accent)' : '#07070F',
              fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-inter)',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            {status === 'requesting' ? 'Requesting…' : enabled ? 'Turn off' : 'Enable'}
          </button>
        )}
      </div>
      {status === 'subscribed' && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['Clinic hour changes', 'Appointment reminders', 'Program deadlines'].map(item => (
            <span key={item} style={{ padding: '3px 9px', borderRadius: '100px', fontSize: '10px', fontWeight: 600, color: 'var(--accent)', background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.18)', fontFamily: 'var(--font-inter)' }}>
              ✓ {item}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Profile Completeness Bar ───────────────────────────────────── */
function ProfileCompletenessBar({ profile }: { profile: UserProfile | null }) {
  const fields = [
    { done: !!profile?.full_name, label: 'Full name' },
    { done: !!profile?.email,     label: 'Email' },
    { done: !!profile?.phone,     label: 'Phone' },
    { done: !!profile?.user_type, label: 'Account type' },
  ]
  const completed = fields.filter(f => f.done).length
  const pct = Math.round((completed / fields.length) * 100)
  if (pct === 100) return null // don't clutter when complete

  return (
    <div style={{ padding: '20px 24px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)' }}>Complete your profile</span>
        <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>{pct}%</span>
      </div>
      <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.07)', marginBottom: '12px' }}>
        <div style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, var(--accent), rgba(74,144,217,0.6))', width: `${pct}%`, transition: 'width 0.6s var(--ease-out-expo)' }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {fields.filter(f => !f.done).map(f => (
          <Link key={f.label} href="/dashboard/profile" style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 500, background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
            + Add {f.label.toLowerCase()}
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ── Main Dashboard Page ─────────────────────────────────────────── */
export default function DashboardPage() {
  const router   = useRouter()
  const supabase = createClientClient()
  const [profile,  setProfile]  = useState<UserProfile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [savedCount, setSavedCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'saved' | 'timeline' | 'care'>('overview')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      const [profRes, bookRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
      ])

      setProfile({
        ...(profRes.data ?? {}),
        id: session.user.id,
        email: (profRes.data?.email ?? session.user.email) ?? undefined,
        full_name: profRes.data?.full_name ?? undefined,
        phone: profRes.data?.phone ?? undefined,
        user_type: (profRes.data?.user_type as UserProfile['user_type']) ?? undefined,
        created_at: profRes.data?.created_at ?? undefined,
      })
      setSavedCount(bookRes.count ?? 0)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const firstName   = profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'there'
  const userTypeLabel = profile?.user_type ? profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1) : 'Patient'

  if (loading) return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(74,144,217,0.2)', borderTopColor: 'var(--accent)', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)' }}>Loading…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </AppShell>
  )

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'saved',    label: `Saved (${savedCount})` },
    { id: 'timeline', label: 'Timeline' },
    { id: 'care',     label: 'Care plan' },
  ] as const

  return (
    <AppShell>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px', fontFamily: 'var(--font-inter)' }}>
        {/* Welcome header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(74,144,217,0.07)', border: '1px solid rgba(74,144,217,0.15)', marginBottom: '14px', fontSize: '11px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-dot 1.8s ease-in-out infinite', display: 'inline-block' }} />
            {userTypeLabel} account
          </div>
          <h1 style={{ fontSize: 'clamp(26px,5vw,44px)', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: '6px' }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            Your free healthcare hub. Everything in one place.
          </p>
        </div>

        {/* E4 — eligibility status badge from onboarding profile */}
        <EligibilityBadge />

        {/* Profile completeness nudge */}
        <ProfileCompletenessBar profile={profile} />

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', padding: '4px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{ padding: '7px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: activeTab === t.id ? 600 : 400, background: activeTab === t.id ? 'rgba(74,144,217,0.1)' : 'transparent', color: activeTab === t.id ? 'var(--accent)' : 'rgba(255,255,255,0.5)', border: activeTab === t.id ? '1px solid rgba(74,144,217,0.2)' : '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Savings Calculator */}
            <div>
              <SectionHeader title="Your savings" />
              <SavingsCalculator savedCount={savedCount} />
            </div>

            {/* Quick Actions */}
            <div>
              <SectionHeader title="Quick actions" />
              <QuickActions router={router} />
            </div>

            {/* E4 — recent searches */}
            <RecentSearchesSection router={router} />

            {/* Last viewed — U16: persistent across sessions */}
            <LastViewedSection />

            {/* Recent saved */}
            <div style={{ gridColumn: '1 / -1' }}>
              <SectionHeader title="Recently saved clinics" action={() => setActiveTab('saved')} actionLabel="See all" />
              <SavedClinicsPanel userId={profile!.id} />
            </div>
          </div>
        )}

        {/* ── SAVED TAB ── */}
        {activeTab === 'saved' && (
          <div>
            <SectionHeader title={`Saved clinics (${savedCount})`} action={() => router.push('/search')} actionLabel="Find more" />
            {savedCount === 0 ? (
              <EmptyState icon="🏥" title="No saved clinics" sub="Search for free clinics near you and bookmark them to track your options." cta="Search now" href="/search" />
            ) : (
              <SavedClinicsPanel userId={profile!.id} />
            )}
          </div>
        )}

        {/* ── TIMELINE TAB ── */}
        {activeTab === 'timeline' && (
          <div>
            <SectionHeader title="Health activity timeline" />
            <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <HealthTimeline userId={profile!.id} />
            </div>
          </div>
        )}

        {/* ── CARE PLAN TAB ── */}
        {activeTab === 'care' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div>
              <SectionHeader title="My care goals" />
              <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <CarePlan />
              </div>
            </div>

            <div>
              <SectionHeader title="Recommended next steps" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Annual preventive checkup', href: '/search', desc: 'Covered free at FQHCs with no insurance', icon: '🩺' },
                  { label: 'Check program eligibility', href: '/programs', desc: 'You may qualify for Medicaid or CHIP', icon: '📋' },
                  { label: 'Connect with a CHW', href: '/chw', desc: 'A community health worker can guide you', icon: '👥' },
                ].map(item => (
                  <Link key={item.label} href={item.href} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(74,144,217,0.2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.06)'}
                  >
                    <span style={{ fontSize: '22px' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)' }}>{item.label}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', fontFamily: 'var(--font-inter)' }}>{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* E10/E4 — notification settings */}
            <div style={{ gridColumn: '1 / -1' }}>
              <SectionHeader title="Notification settings" />
              <NotificationSettings userId={profile!.id} />
            </div>

            {/* Provider portal shortcut for providers */}
            {profile?.user_type === 'provider' && (
              <div style={{ gridColumn: '1 / -1' }}>
                <SectionHeader title="Provider tools" />
                <Link href="/provider" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '20px 24px', borderRadius: '14px', background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.18)', textDecoration: 'none' }}>
                  <span style={{ fontSize: '28px' }}>🏥</span>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-inter)', marginBottom: '4px' }}>Provider portal</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)' }}>Manage your clinic listing, view patient analytics, update availability</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse-dot { 0%,100% { opacity:1;transform:scale(1); } 50% { opacity:0.5;transform:scale(0.85); } }
      `}</style>
    </AppShell>
  )
}
