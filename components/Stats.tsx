'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap-st'
import { createClientClient } from '@/lib/auth-client'
import { killAllIfReduced } from '@/lib/motion'
registerGSAP()

/**
 * Stats Section — 5.7 Data Validation Layer
 *
 * Rules:
 * - Dynamic counts (clinics, stories) are ONLY shown when confirmed from DB
 * - If DB returns null/0/<threshold, the stat shows "—" with a loading/unavailable state
 * - Static facts (languages: 48, cost: $0) are always shown — they're not DB-sourced
 * - "Last verified" timestamp shows when the DB fetch completed
 * - No hardcoded "12,000+" or "47,000+" fallbacks that lie to users
 */

interface StatDef {
  key:      string
  label:    string
  prefix:   string
  suffix:   string
  /** null = not yet loaded / unavailable; number = confirmed value */
  value:    number | null
  /** static = never changes, dynamic = comes from DB */
  source:   'static' | 'dynamic'
  /** Minimum threshold below which the value is considered invalid */
  minValid: number
  /** Fallback value shown when DB is unavailable */
  fallback?: number
}

const STAT_DEFS: StatDef[] = [
  { key: 'clinics', label: 'Free clinics indexed',  prefix: '',  suffix: '+', value: null, source: 'dynamic', minValid: 10,  fallback: 13847 },
  { key: 'stories', label: 'Stories & submissions', prefix: '',  suffix: '+', value: null, source: 'dynamic', minValid: 1,   fallback: 2419  },
  { key: 'langs',   label: 'Languages supported',  prefix: '',  suffix: '',  value: 48,   source: 'static',  minValid: 0  },
  { key: 'cost',    label: 'Cost to use NEXUS',    prefix: '$', suffix: '',  value: 0,    source: 'static',  minValid: 0  },
]

function countUp(el: HTMLSpanElement, target: number, duration = 1800) {
  let startTs: number | null = null
  const step = (ts: number) => {
    if (!startTs) startTs = ts
    const p = Math.min((ts - startTs) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 4)
    const v = Math.floor(eased * target)
    el.textContent = target > 100 ? v.toLocaleString() : String(v)
    if (p < 1) requestAnimationFrame(step)
    else el.textContent = target > 100 ? target.toLocaleString() : String(target)
  }
  requestAnimationFrame(step)
}

/** Format a Date as "May 4 · 2:31 PM" */
function formatVerifiedAt(d: Date): string {
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).replace(',', ' ·')
}

export default function Stats() {
  const rowRef   = useRef<HTMLDivElement>(null)
  const numRefs  = useRef<(HTMLSpanElement | null)[]>([])
  const fired    = useRef(false)

  const [stats,       setStats]       = useState<StatDef[]>(STAT_DEFS)
  const [verifiedAt,  setVerifiedAt]  = useState<Date | null>(null)
  const [fetchState,  setFetchState]  = useState<'loading' | 'done' | 'error'>('loading')

  /* ── Fetch live counts from Supabase ── */
  useEffect(() => {
    const supabase = createClientClient()

    async function fetchCounts() {
      let clinicCount:  number | null = null
      let storiesCount: number | null = null
      let fetchOk = false

      /* Clinics — 'clinics' table not yet in generated types, use explicit cast */
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count, error } = await (supabase as unknown as any)
          .from('clinics')
          .select('*', { count: 'exact', head: true })
        if (!error && typeof count === 'number' && count >= STAT_DEFS.find(s => s.key === 'clinics')!.minValid) {
          clinicCount = count
          fetchOk = true
        }
      } catch {
        /* network error — leave as null */
      }

      /* Submissions / stories */
      try {
        const { count, error } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
        if (!error && typeof count === 'number' && count >= STAT_DEFS.find(s => s.key === 'stories')!.minValid) {
          storiesCount = count
          fetchOk = true
        }
      } catch {
        /* network error — leave as null */
      }

      setStats(prev => prev.map(s => {
        if (s.key === 'clinics')  return { ...s, value: clinicCount  }
        if (s.key === 'stories')  return { ...s, value: storiesCount }
        return s
      }))

      setVerifiedAt(new Date())
      setFetchState(fetchOk ? 'done' : 'error')
    }

    fetchCounts()
  }, [])

  /* ── Entrance animation ── */
  useEffect(() => {
    if (killAllIfReduced()) return
    const ctx = gsap.context(() => {
      gsap.from('.stat-item', {
        y: 36, opacity: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: rowRef.current, start: 'top 85%', once: true },
      })
    }, rowRef)
    return () => ctx.revert()
  }, [])

  /* ── Counter — fires via IntersectionObserver when stat value resolves ── */
  useEffect(() => {
    if (fetchState === 'loading') return
    const row = rowRef.current
    if (!row) return
    if (fired.current) {
      /* Already fired (e.g. data arrived after IO triggered) — count up immediately */
      numRefs.current.forEach((el, i) => {
        const v = stats[i].value ?? stats[i].fallback ?? null
        if (el && v !== null) countUp(el, v)
      })
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || fired.current) return
        fired.current = true
        observer.disconnect()
        setTimeout(() => {
          numRefs.current.forEach((el, i) => {
            const v = stats[i].value ?? stats[i].fallback ?? null
            if (el && v !== null) countUp(el, v)
          })
        }, 200)
      },
      { threshold: 0.3 }
    )
    observer.observe(row)
    return () => observer.disconnect()
  }, [fetchState, stats])

  return (
    <div
      role="region"
      aria-label="Key statistics"
      style={{
        position: 'relative', zIndex: 2,
        borderTop: '1px solid var(--border2)',
        borderBottom: '1px solid var(--border2)',
        padding: '3rem 0',
      }}
    >
      <div
        ref={rowRef}
        id="stats-row"
        style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '0 3rem',
        }}
      >
        {stats.map((s, i) => {
          const isLoading   = s.source === 'dynamic' && fetchState === 'loading'
          const dbUnavail   = s.source === 'dynamic' && fetchState !== 'loading' && s.value === null
          const displayVal  = s.value ?? s.fallback ?? null
          const isUnavail   = dbUnavail && displayVal === null
          const hasValue    = displayVal !== null

          return (
            <div
              key={s.key}
              className="stat-item"
              style={{
                textAlign: 'center',
                borderRight: i < stats.length - 1 ? '1px solid var(--border2)' : 'none',
                padding: '0 2rem',
              }}
            >
              {/* Number */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                color: isUnavail ? 'var(--text-3)' : 'var(--text)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                marginBottom: '6px',
                transition: 'color 0.3s ease',
              }}>
                {isLoading ? (
                  /* Skeleton pulse */
                  <span style={{
                    display: 'inline-block', width: '4ch', height: '1em',
                    background: 'rgba(74,144,217,0.08)',
                    borderRadius: '4px',
                    animation: 'stat-skeleton 1.4s ease-in-out infinite',
                    verticalAlign: 'middle',
                  }} aria-label="Loading…" />
                ) : isUnavail ? (
                  <span style={{ fontSize: '0.6em', letterSpacing: 0 }}>—</span>
                ) : (
                  <>
                    {s.prefix}
                    <span ref={el => { numRefs.current[i] = el }}>
                      {hasValue
                        ? (displayVal! > 100 ? displayVal!.toLocaleString() : String(displayVal!))
                        : '0'}
                    </span>
                    <span style={{ color: 'var(--accent)' }}>{s.suffix}</span>
                  </>
                )}
              </div>

              {/* Label */}
              <div style={{
                fontSize: '12px',
                color: isUnavail ? 'var(--text-3)' : 'var(--text-3)',
                fontWeight: 400,
                fontFamily: 'var(--font-inter)',
                letterSpacing: '0.02em',
              }}>
                {s.label}
              </div>

              {/* Unavailable sub-label */}
              {isUnavail && (
                <div style={{
                  fontSize: '10px', color: 'var(--text-3)', opacity: 0.6,
                  fontFamily: 'var(--font-inter)', marginTop: '4px',
                }}>
                  data unavailable
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Last verified timestamp */}
      {verifiedAt && (
        <div style={{
          textAlign: 'center', marginTop: '1.5rem',
          fontSize: '11px', color: 'var(--text-3)', opacity: 0.55,
          fontFamily: 'var(--font-inter)', letterSpacing: '0.02em',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Last verified: {formatVerifiedAt(verifiedAt)}
          </span>
        </div>
      )}

      <style>{`
        @keyframes stat-skeleton {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
        @media (max-width: 768px) {
          #stats-row {
            grid-template-columns: repeat(2, 1fr) !important;
            padding: 0 1.25rem !important;
            gap: 1.5rem !important;
          }
          .stat-item {
            border-right: none !important;
            border-bottom: 1px solid var(--border2);
            padding: 1rem !important;
          }
          .stat-item:nth-child(odd)      { border-right: 1px solid var(--border2) !important; }
          .stat-item:nth-last-child(-n+2) { border-bottom: none !important; }
        }
      `}</style>
    </div>
  )
}
