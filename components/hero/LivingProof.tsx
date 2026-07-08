'use client'
/**
 * Living Proof — the hero surprise.
 * Geolocates the visitor (IP-level, no permission prompt) and streams in
 * 3 REAL free clinics near them from /api/clinics. First-time visitors see
 * their own city's free care before they've touched anything.
 *
 * Graceful by design: skeleton shimmer while loading; if geolocation or
 * the API fails or returns nothing, the whole panel hides — never an
 * empty state in the hero.
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Location, TickCircle } from 'iconsax-react'

type ProofClinic = {
  id: string
  name: string
  distance: string
  type?: string
  free: boolean
  sliding_scale: boolean
}

type ProofState =
  | { status: 'loading' }
  | { status: 'ready'; city: string; loc: string; clinics: ProofClinic[] }
  | { status: 'hidden' }

const CACHE_KEY = 'nexus_living_proof_v1'

async function detectLocation(): Promise<{ city: string; loc: string } | null> {
  // 1. Saved location from a previous visit
  try {
    const saved = localStorage.getItem('nexus_location') || localStorage.getItem('nexus_zip')
    if (saved && saved.trim()) return { city: '', loc: saved.trim() }
  } catch { /* private browsing */ }

  // 2. IP-level lookup via our own edge (Vercel headers in prod, safe fallback in dev)
  try {
    const res = await fetch('/api/geoip', { signal: AbortSignal.timeout(6000) })
    if (res.ok) {
      const j = await res.json() as { located: boolean; city?: string; location?: string }
      if (j.located && j.location) {
        return { city: j.city ?? '', loc: j.location }
      }
    }
  } catch { /* offline */ }
  return null
}

export default function LivingProof() {
  const router = useRouter()
  const [state, setState] = useState<ProofState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function run() {
      // Session cache — instant on back-navigation, no re-fetch
      try {
        const cached = sessionStorage.getItem(CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached) as Extract<ProofState, { status: 'ready' }>
          if (parsed.clinics?.length >= 3) { setState(parsed); return }
        }
      } catch { /* ignore */ }

      const where = await detectLocation()
      if (!where || cancelled) { if (!cancelled) setState({ status: 'hidden' }); return }

      try {
        const res = await fetch(
          `/api/clinics?location=${encodeURIComponent(where.loc)}&radius=25`,
          { signal: AbortSignal.timeout(20000) }
        )
        if (!res.ok || cancelled) { if (!cancelled) setState({ status: 'hidden' }); return }
        const data = await res.json() as {
          clinics?: ProofClinic[]
          location?: { formatted?: string }
        }
        // Dedupe by org name — multi-site orgs would fill all 3 slots
        const seenNames = new Set<string>()
        const top: ProofClinic[] = []
        for (const c of data.clinics ?? []) {
          if (!c.name || !c.distance) continue
          const key = c.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16)
          if (seenNames.has(key)) continue
          seenNames.add(key)
          top.push(c)
          if (top.length === 3) break
        }
        if (top.length < 3) { if (!cancelled) setState({ status: 'hidden' }); return }

        const city = where.city
          || data.location?.formatted?.split(',')[0]?.trim()
          || 'your area'
        const ready: ProofState = { status: 'ready', city, loc: where.loc, clinics: top }
        if (!cancelled) {
          setState(ready)
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(ready)) } catch { /* full */ }
        }
      } catch {
        if (!cancelled) setState({ status: 'hidden' })
      }
    }

    run()
    return () => { cancelled = true }
  }, [])

  if (state.status === 'hidden') return null

  return (
    <div
      aria-label="Free clinics near you"
      style={{ width: '100%', maxWidth: '640px', marginTop: '18px' }}
    >
      {/* Header line */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '10px', justifyContent: 'center',
      }}>
        <span aria-hidden="true" style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: 'var(--success)',
          boxShadow: '0 0 0 3px rgba(52,211,153,0.15)',
          animation: 'lp-pulse 2.2s ease-in-out infinite',
        }} />
        <span style={{
          fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-3)', fontFamily: 'var(--font-mono)',
        }}>
          {state.status === 'loading'
            ? 'Finding free care near you…'
            : `Live — free care near ${state.city}`}
        </span>
      </div>

      {/* Cards */}
      <div className="lp-row">
        {state.status === 'loading'
          ? [0, 1, 2].map(i => (
              <div key={i} className="lp-card lp-skeleton" aria-hidden="true">
                <div className="lp-sk-line w60" />
                <div className="lp-sk-line w40" />
              </div>
            ))
          : state.clinics.map((c, i) => (
              <button
                key={c.id}
                className="lp-card lp-in"
                style={{ animationDelay: `${i * 90}ms` }}
                onClick={() => router.push(`/search?loc=${encodeURIComponent(state.loc)}`)}
                aria-label={`${c.name}, ${c.distance} miles away`}
              >
                <span className="lp-name">{c.name}</span>
                <span className="lp-meta">
                  <Location size={10} color="var(--text-3)" variant="Linear" aria-hidden="true" />
                  {c.distance} mi{c.type ? ` · ${c.type}` : ''}
                </span>
                {(c.free || c.sliding_scale) && (
                  <span className="lp-badge">
                    <TickCircle size={9} color="currentColor" variant="Bold" aria-hidden="true" />
                    {c.free ? '$0' : 'Sliding scale'}
                  </span>
                )}
              </button>
            ))}
      </div>

      <style>{`
        @keyframes lp-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }
        .lp-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .lp-card {
          position: relative;
          display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
          background: rgba(255,255,255,0.035);
          border: 1px solid var(--border-subtle);
          border-radius: var(--r-md);
          padding: 12px 14px;
          text-align: left;
          cursor: pointer;
          font-family: var(--font-inter);
          transition: transform 0.22s var(--ease-out-expo), border-color 0.2s ease, background 0.2s ease;
        }
        .lp-card:hover {
          transform: translateY(-2px);
          border-color: rgba(79,142,240,0.35);
          background: rgba(79,142,240,0.06);
        }
        .lp-name {
          font-size: 12.5px; font-weight: 600; color: var(--text);
          line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .lp-meta {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10.5px; color: var(--text-3);
          font-family: var(--font-mono);
        }
        .lp-badge {
          display: inline-flex; align-items: center; gap: 4px;
          margin-top: 2px;
          font-size: 10px; font-weight: 700;
          color: var(--success);
          background: rgba(52,211,153,0.10);
          border: 1px solid rgba(52,211,153,0.22);
          border-radius: var(--r-xs);
          padding: 1px 7px;
        }
        .lp-in {
          opacity: 0;
          animation: lp-card-in 0.5s var(--ease-spring) forwards;
        }
        @keyframes lp-card-in {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lp-skeleton { pointer-events: none; min-height: 64px; justify-content: center; }
        .lp-sk-line {
          height: 9px; border-radius: 4px;
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 200% 100%;
          animation: lp-shimmer 1.4s linear infinite;
        }
        .lp-sk-line.w60 { width: 60%; }
        .lp-sk-line.w40 { width: 40%; }
        @keyframes lp-shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
        @media (max-width: 640px) {
          .lp-row { grid-template-columns: 1fr; gap: 8px; }
          .lp-card { flex-direction: row; align-items: center; gap: 10px; }
          .lp-name { flex: 1; }
          .lp-badge { margin-top: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lp-in { animation: none; opacity: 1; }
          .lp-sk-line { animation: none; }
        }
      `}</style>
    </div>
  )
}
