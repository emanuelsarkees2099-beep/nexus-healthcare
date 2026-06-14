'use client'
import { useEffect, useRef, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic_import from 'next/dynamic'
import AppShell from '@/components/AppShell'
import EmergencyEscalation from '@/components/EmergencyEscalation'
import { createClientClient } from '@/lib/auth-client'
import { useI18n } from '@/components/I18nContext'
import { detectIntent, isOpenNow } from '@/lib/search-utils'
import type { SearchIntent } from '@/lib/search-utils'
import { computeMatchScore } from '@/lib/match-engine'
import type { MatchInput, MatchScore } from '@/lib/match-engine'
import {
  SearchNormal1, Location, CloseCircle, Hospital,
  Heart, Health, Eye, Profile,
  InfoCircle, Map as MapIcon, RowVertical, Printer,
  Clock, Flash, ArrowRight, RefreshCircle, ShieldTick, Global,
  Filter,
} from 'iconsax-react'
/* P3 — standardized skeleton */
import { SkeletonClinicCard, SKELETON_STYLES } from '@/components/ui/Skeleton'

/* P2 — ClinicCard code-split: loads after the search input is interactive */
const ClinicCard = dynamic_import(() => import('@/components/search/ClinicCard'), {
  ssr: false,
  loading: () => <SkeletonClinicCard />,
})

/* P2 — ClinicMap code-split: Leaflet requires browser APIs */
const ClinicMap = dynamic_import(() => import('@/components/ClinicMap'), { ssr: false })

/* Phase 2.1 — MatchForm code-split (bottom-sheet, heavy) */
const MatchForm = dynamic_import(() => import('@/components/search/MatchForm'), { ssr: false })

/* ── Types (P2: imported from extracted ClinicCard component) ─────── */
export type { Clinic, AffordabilityLabel } from '@/components/search/ClinicCard'
import type { Clinic, AffordabilityLabel } from '@/components/search/ClinicCard'

/* ── Constants ────────────────────────────────────────────────────── */

const SPECIALTY_FILTERS = [
  { label: 'All',            Icon: SearchNormal1, id: 'all'        },
  { label: 'Primary care',   Icon: Hospital,      id: 'primary'    },
  { label: 'Mental health',  Icon: Health,        id: 'mental'     },
  { label: 'Dental',         Icon: Health,        id: 'dental'     },
  { label: "Women's health", Icon: Heart,         id: 'womens'     },
  { label: 'Pediatrics',     Icon: Profile,       id: 'pediatrics' },
  { label: 'Vision',         Icon: Eye,           id: 'vision'     },
]

const RADIUS_OPTIONS = [
  { label: '5 mi',  value: '5'  },
  { label: '10 mi', value: '10' },
  { label: '25 mi', value: '25' },
  { label: '50 mi', value: '50' },
]



/* ── Intent banner ────────────────────────────────────────────────── */
function IntentBanner({ intent, onApplySpecialty }: { intent: SearchIntent; onApplySpecialty: (s: string) => void }) {
  const items = []
  if (intent.freeOnly)     items.push({ label: 'Showing free clinics only', color: 'var(--accent)' })
  if (intent.openNow)      items.push({ label: 'Filtering to open right now', color: 'var(--green-pulse)' })
  if (intent.language)     items.push({ label: `Looking for ${intent.language} speakers`, color: 'var(--violet)' })
  if (intent.accessibility) items.push({ label: 'Filtering for accessible facilities', color: 'var(--amber)' })
  if (intent.specialty)    items.push({ label: `Auto-selected: ${intent.specialty}`, color: 'var(--accent)' })
  if (items.length === 0) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
      padding: '10px 14px', borderRadius: '10px',
      background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.12)',
      marginBottom: '12px',
    }}>
      <Flash size={13} color="var(--accent)" />
      <span style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', fontWeight: 500 }}>
        Smart search detected:
      </span>
      {items.map(item => (
        <span key={item.label} style={{
          fontSize: '11px', fontWeight: 600, color: item.color,
          background: `${item.color}12`, border: `1px solid ${item.color}28`,
          borderRadius: '100px', padding: '2px 9px', fontFamily: 'var(--font-inter)',
        }}>
          {item.label}
        </span>
      ))}
    </div>
  )
}

/* ── Main search component ────────────────────────────────────────── */

/* E8 — locale → expected language keyword in clinic data */
const LOCALE_LANGUAGE_MAP: Record<string, string> = {
  es: 'Spanish', fr: 'French', zh: 'Chinese', ar: 'Arabic',
  vi: 'Vietnamese', ko: 'Korean', pt: 'Portuguese', ru: 'Russian',
  ht: 'Creole', tl: 'Tagalog', pl: 'Polish', de: 'German',
  fa: 'Farsi', ur: 'Urdu', hi: 'Hindi', am: 'Amharic',
}

function clinicHasLanguage(clinic: Clinic, lang: string): boolean {
  const lower = lang.toLowerCase()
  return (
    clinic.services?.some(s => s.toLowerCase().includes(lower)) === true ||
    clinic.name.toLowerCase().includes(lower)
  )
}

function SearchResults() {
  const { t, lang } = useI18n()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const supabase     = createClientClient()

  const query    = searchParams.get('q') || searchParams.get('symptom') || ''
  const locParam = searchParams.get('loc') || searchParams.get('location') || ''

  const [inputVal,      setInputVal]      = useState(query)
  const [locationVal,   setLocationVal]   = useState(() => {
    if (locParam) return locParam
    if (typeof window !== 'undefined') return localStorage.getItem('nexus_zip') || ''
    return ''
  })
  const [activeFilter,  setActiveFilter]  = useState('all')
  const [radius,        setRadius]        = useState('25')
  const [clinics,       setClinics]       = useState<Clinic[]>([])
  const [loading,       setLoading]       = useState(false)
  const [fetchError,    setFetchError]    = useState('')
  const [source,        setSource]        = useState('')
  const [sourceCounts,  setSourceCounts]  = useState<Record<string, number>>({})
  const [specialtyMatched, setSpecialtyMatched] = useState(true)
  const [savedIds,      setSavedIds]      = useState<Set<string>>(new Set())
  const [savingId,      setSavingId]      = useState<string | null>(null)
  const [authToken,     setAuthToken]     = useState<string | null>(null)
  const [viewMode,      setViewMode]      = useState<'list' | 'map'>('list')
  const [geoCenter,     setGeoCenter]     = useState<{ lat: number; lng: number } | null>(null)
  const [savedCount,    setSavedCount]    = useState(0)
  const [openNowFilter, setOpenNowFilter] = useState(false)
  const [intent,        setIntent]        = useState<SearchIntent>({})
  const [bridgeClinic,  setBridgeClinic]  = useState<string | null>(null)   // N5: insurance bridge toast
  const [visiblePage,   setVisiblePage]   = useState(1)                      // pagination
  const [showMatchForm, setShowMatchForm] = useState(false)                  // Phase 2.1: guided match form
  const [heroWords, setHeroWords] = useState([false, false, false, false])

  const PAGE_SIZE = 25

  /* Phase 2.1 — parse match params from URL */
  const needsParam    = searchParams.get('needs')    || ''
  const languageParam = searchParams.get('language') || ''
  const insuranceParam = searchParams.get('insurance') || ''
  const matchInput: MatchInput | null = (needsParam || languageParam || insuranceParam) ? {
    needs:     needsParam ? needsParam.split(',').filter(Boolean) : [],
    language:  languageParam,
    insurance: insuranceParam,
  } : null

  /* Hero word animation */
  useEffect(() => {
    const delays = [0, 120, 240, 380]
    const timers = delays.map((d, i) => setTimeout(() => setHeroWords(w => { const n = [...w]; n[i] = true; return n }), d + 200))
    return () => timers.forEach(clearTimeout)
  }, [])

  /* Detect intent from query */
  useEffect(() => {
    if (inputVal) {
      const det = detectIntent(inputVal)
      setIntent(det)
      if (det.specialty && activeFilter === 'all') setActiveFilter(det.specialty)
      if (det.openNow) setOpenNowFilter(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputVal])

  useEffect(() => { setInputVal(query) }, [query])
  useEffect(() => {
    if (locParam) { setLocationVal(locParam); localStorage.setItem('nexus_zip', locParam) }
  }, [locParam])

  const handleLocationChange = (val: string) => {
    setLocationVal(val)
    if (val.trim()) localStorage.setItem('nexus_zip', val.trim())
  }

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('nexus:saved-count', { detail: savedCount }))
  }, [savedCount])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token
      if (token) {
        setAuthToken(token)
        fetch('/api/bookmarks', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(d => {
            if (d.bookmarks) {
              const ids = new Set<string>(d.bookmarks.map((b: { resource_id: string }) => b.resource_id))
              setSavedIds(ids); setSavedCount(ids.size)
            }
          })
          .catch(() => {})
      } else {
        /* ── Guest: load saved clinics from localStorage ── */
        try {
          const existing = JSON.parse(localStorage.getItem('nexus_saved_clinics') || '{}')
          const ids = new Set<string>(Object.keys(existing))
          setSavedIds(ids); setSavedCount(ids.size)
        } catch { /* ignore */ }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchClinics = useCallback(async (location: string, specialty: string, rad: string) => {
    if (!location) { setClinics([]); return }
    setLoading(true); setFetchError('')
    try {
      const p = new URLSearchParams({ location, radius: rad })
      if (specialty && specialty !== 'all') p.set('specialty', specialty)
      const res  = await fetch(`/api/clinics?${p}`)
      const data = await res.json()
      setClinics(data.clinics ?? [])
      setVisiblePage(1)   // reset pagination on every new search
      setSource(data.source ?? '')
      setSourceCounts(data.sources ?? {})
      setSpecialtyMatched(data.specialty_matched !== false)
      if (data.location?.lat && data.location?.lng) setGeoCenter({ lat: data.location.lat, lng: data.location.lng })
    } catch {
      setFetchError('Could not load clinics. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const loc = locParam || locationVal
    if (loc) fetchClinics(loc, activeFilter, radius)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locParam, activeFilter, radius])

  async function toggleBookmark(clinic: Clinic) {
    const id = String(clinic.id)
    setSavingId(id)
    try {
      if (authToken) {
        /* ── Authenticated: persist to Supabase ── */
        if (savedIds.has(id)) {
          await fetch(`/api/bookmarks?resource_id=${id}&resource_type=clinic`, { method: 'DELETE', headers: { Authorization: `Bearer ${authToken}` } })
          setSavedIds(prev => { const s = new Set(prev); s.delete(id); setSavedCount(s.size); return s })
        } else {
          await fetch('/api/bookmarks', { method: 'POST', headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ resource_type: 'clinic', resource_id: id, resource_name: clinic.name, resource_data: clinic }) })
          setSavedIds(prev => { const s = new Set(prev).add(id); setSavedCount(s.size); return s })
        }
      } else {
        /* ── Guest: persist to localStorage ── */
        const LS_KEY = 'nexus_saved_clinics'
        try {
          const existing: Record<string, object> = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
          if (savedIds.has(id)) {
            delete existing[id]
            setSavedIds(prev => { const s = new Set(prev); s.delete(id); setSavedCount(s.size); return s })
          } else {
            existing[id] = { id, name: clinic.name, address: clinic.address, phone: clinic.phone, savedAt: Date.now() }
            setSavedIds(prev => { const s = new Set(prev).add(id); setSavedCount(s.size); return s })
          }
          localStorage.setItem(LS_KEY, JSON.stringify(existing))
        } catch { /* storage full or blocked */ }
      }
    } catch { /* silent */ }
    setSavingId(null)

    // N5 — Insurance Bridge: show "check coverage" toast after saving a clinic
    if (!savedIds.has(String(clinic.id))) {
      setBridgeClinic(clinic.name)
      setTimeout(() => setBridgeClinic(null), 9000)
    }

    // N8 — Care Continuity Reminders: schedule push when ADDING a bookmark
    if (!savedIds.has(String(clinic.id))) {
      try {
        type ClinicReminder = { clinicId: string; clinicName: string; ts48h: number; ts11m: number; fired48h: boolean; fired11m: boolean }
        const raw = localStorage.getItem('nexus_reminders')
        const reminders: ClinicReminder[] = raw ? JSON.parse(raw) : []
        const now = Date.now()
        const entry: ClinicReminder = {
          clinicId: String(clinic.id), clinicName: clinic.name,
          ts48h: now + 48 * 60 * 60 * 1000,
          ts11m: now + 11 * 30 * 24 * 60 * 60 * 1000,
          fired48h: false, fired11m: false,
        }
        const updated = [entry, ...reminders.filter(r => r.clinicId !== String(clinic.id))]
        localStorage.setItem('nexus_reminders', JSON.stringify(updated))
      } catch { /* ignore */ }
    }
  }

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    const loc = locationVal.trim()
    if (loc) {
      localStorage.setItem('nexus_zip', loc)
      // E4 — persist recent searches for dashboard recent-searches panel
      try {
        type RecentSearch = { q: string; loc: string; ts: number }
        const raw = localStorage.getItem('nexus_recent_searches')
        const recent: RecentSearch[] = raw ? JSON.parse(raw) : []
        const entry: RecentSearch = { q: inputVal.trim(), loc, ts: Date.now() }
        const updated = [entry, ...recent.filter(r => !(r.q === entry.q && r.loc === entry.loc))].slice(0, 8)
        localStorage.setItem('nexus_recent_searches', JSON.stringify(updated))
      } catch { /* Safari private / quota exceeded — ignore */ }
      router.push(`/search?q=${encodeURIComponent(inputVal.trim())}&loc=${encodeURIComponent(loc)}`)
      fetchClinics(loc, activeFilter, radius)
    }
  }

  /* Apply free-only filter + open-now from intent */
  let results = inputVal
    ? clinics.filter(c =>
        c.name.toLowerCase().includes(inputVal.toLowerCase()) ||
        c.city?.toLowerCase().includes(inputVal.toLowerCase()) ||
        c.services?.some(s => s.toLowerCase().includes(inputVal.toLowerCase()))
      )
    : clinics

  if (intent.freeOnly) results = results.filter(c => c.free || c.sliding_scale || c.affordability_label === 'likely-free')

  // E8 — language-matched care: boost language-concordant providers to the top
  const targetLanguage = lang !== 'en' ? (LOCALE_LANGUAGE_MAP[lang as keyof typeof LOCALE_LANGUAGE_MAP] ?? null) : null

  // Phase 2.1 — match score sort: when match params are active, sort by computed match score
  // otherwise fall back to language boost → affordability order from API
  let matchScores: Map<string, MatchScore> | null = null
  if (matchInput) {
    const scored = results.map(c => ({ clinic: c, score: computeMatchScore(c, matchInput) }))
    scored.sort((a, b) => b.score.total - a.score.total)
    results = scored.map(s => s.clinic)
    const entries: [string, MatchScore][] = scored.map(s => [String(s.clinic.id), s.score])
    matchScores = new Map(entries)
  } else if (targetLanguage) {
    results = [...results].sort((a, b) => {
      const aMatch = clinicHasLanguage(a, targetLanguage) ? 1 : 0
      const bMatch = clinicHasLanguage(b, targetLanguage) ? 1 : 0
      return bMatch - aMatch
    })
  }

  /* Paginate: show PAGE_SIZE × page clinics at a time */
  const pagedResults = results.slice(0, visiblePage * PAGE_SIZE)
  const hasMore      = results.length > pagedResults.length

  const visibleCount = openNowFilter
    ? results.filter(c => isOpenNow(c.hours) !== false).length
    : results.length

  /* #41 — Rich source attribution badges with tooltips */
  type SourceBadgeConfig = { label: string; icon: React.ReactNode; tooltip: string; color: string; borderColor: string; bg: string } | null
  const sourceBadge: SourceBadgeConfig = source === 'hrsa+nafc'
    ? {
        label: 'FQHC + Free Clinics',
        icon: <Hospital size={9} color="currentColor" variant="TwoTone" aria-hidden="true" />,
        tooltip: 'Results from HRSA-verified Federally Qualified Health Centers AND NAFC-registered free clinics. FQHCs are required by federal law to accept all patients regardless of ability to pay.',
        color: 'var(--accent)',
        borderColor: 'rgba(74,144,217,0.25)',
        bg: 'rgba(74,144,217,0.07)',
      }
    : source === 'hrsa'
    ? {
        label: 'HRSA Verified FQHCs',
        icon: <ShieldTick size={9} color="currentColor" variant="TwoTone" aria-hidden="true" />,
        tooltip: 'Federally Qualified Health Centers verified by HRSA (Health Resources & Services Administration). All FQHCs receive federal funding and are required to serve every patient on a sliding-scale fee regardless of income.',
        color: '#60a5fa',
        borderColor: 'rgba(96,165,250,0.25)',
        bg: 'rgba(96,165,250,0.07)',
      }
    : source === 'nafc'
    ? {
        label: 'NAFC Free Clinics',
        icon: <Heart size={9} color="currentColor" variant="TwoTone" aria-hidden="true" />,
        tooltip: 'Registered members of the National Association of Free & Charitable Clinics (NAFC). These clinics provide free or reduced-cost care to people in financial need.',
        color: 'var(--green-pulse,#4ade80)',
        borderColor: 'rgba(74,222,128,0.25)',
        bg: 'rgba(74,222,128,0.07)',
      }
    : source === 'osm'
    ? {
        label: 'Community-sourced',
        icon: <Global size={9} color="currentColor" variant="TwoTone" aria-hidden="true" />,
        tooltip: 'These clinics were contributed by the OpenStreetMap community. Data may be less verified — always call ahead to confirm.',
        color: '#a78bfa',
        borderColor: 'rgba(167,139,250,0.25)',
        bg: 'rgba(167,139,250,0.07)',
      }
    : null

  return (
    <AppShell>
      <style>{SKELETON_STYLES}</style>
      <style>{`
        @media (max-width: 768px) {
          .search-sticky-header { padding: 10px 16px !important; top: 56px !important; }
          .search-bar-row { flex-direction: column !important; gap: 6px !important; }
          .search-bar-row > div { min-width: unset !important; width: 100% !important; }
          .search-bar-row > button { width: 100% !important; padding: 12px !important; font-size: 14px !important; }
          .sticky-filter-bar { margin: 0 -16px !important; padding-left: 16px !important; padding-right: 16px !important; }
          .map-split { grid-template-columns: 1fr !important; }
          .map-split > div:last-child { height: 320px !important; position: relative !important; top: auto !important; }
        }
        @media (max-width: 480px) {
          .filter-pill-track { gap: 4px !important; }
          .filter-pill { font-size: 11px !important; padding: 6px 12px !important; }
        }
      `}</style>
      {/* ── Hero (shown before any search) ── */}
      {!locationVal && !loading && clinics.length === 0 && (
        <div style={{
          minHeight: 'calc(100vh - 62px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px 24px 60px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Background blobs */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '8%', left: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,240,0.065) 0%, transparent 65%)' }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '3%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.055) 0%, transparent 65%)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,240,0.025) 0%, transparent 55%)' }} />
            {/* Subtle grid */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.035 }}>
              <defs><pattern id="sg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#sg)" />
            </svg>
          </div>

          {/* Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', background: 'rgba(79,142,240,0.08)', border: '1px solid rgba(79,142,240,0.22)', color: 'var(--accent)', marginBottom: '28px', opacity: heroWords[0] ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <Hospital size={14} variant="Linear" style={{ flexShrink: 0 }} /> Clinic Finder
          </div>

          {/* Animated h1 */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.04em', textAlign: 'center', margin: '0 0 12px', lineHeight: 1.05 }}>
            <div style={{ fontSize: 'clamp(46px, 7vw, 88px)', color: 'var(--text)' }}>
              {['Find', 'free'].map((w, i) => (
                <span key={w} style={{ display: 'inline-block', marginRight: '0.22em', opacity: heroWords[i] ? 1 : 0, transform: heroWords[i] ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)', transitionDelay: `${i * 0.1}s` }}>{w}</span>
              ))}
              <span style={{ display: 'inline-block', marginRight: '0.22em', color: 'var(--accent)', opacity: heroWords[2] ? 1 : 0, transform: heroWords[2] ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)', transitionDelay: '0.2s' }}>care</span>
            </div>
            <div style={{ fontSize: 'clamp(46px, 7vw, 88px)', color: 'var(--text-2)' }}>
              <span style={{ display: 'inline-block', opacity: heroWords[3] ? 1 : 0, transform: heroWords[3] ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)', transitionDelay: '0.3s' }}>near you.</span>
            </div>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: '16px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', textAlign: 'center', maxWidth: '420px', lineHeight: 1.7, margin: '0 0 36px', opacity: heroWords[3] ? 1 : 0, transition: 'opacity 0.6s ease 0.45s' }}>
            13,000+ federally verified clinics. Sliding-scale fees. No insurance required.
          </p>

          {/* Large search form */}
          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '580px', opacity: heroWords[3] ? 1 : 0, transform: heroWords[3] ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.6s ease 0.5s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s' }}>
            <div style={{ display: 'flex', gap: '0', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid rgba(79,142,240,0.28)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)' }}>
              {/* Query input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, padding: '14px 18px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <SearchNormal1 size={18} color="rgba(255,255,255,0.35)" style={{ flexShrink: 0 }} />
                <input
                  value={inputVal} onChange={e => setInputVal(e.target.value)}
                  placeholder="Condition, specialty, or clinic name"
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-inter)', fontSize: '15px', caretColor: 'var(--accent)' }}
                />
              </div>
              {/* Location input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', minWidth: '160px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <Location size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
                <input
                  value={locationVal} onChange={e => handleLocationChange(e.target.value)}
                  placeholder="ZIP or city"
                  style={{ width: '120px', background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-inter)', fontSize: '15px', caretColor: 'var(--accent)' }}
                />
              </div>
              {/* Submit */}
              <button type="submit" style={{ background: 'var(--accent)', color: 'var(--bg)', border: 'none', padding: '0 28px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-inter)', transition: 'opacity 0.18s', flexShrink: 0, letterSpacing: '0.01em' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.87')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Search
              </button>
            </div>
          </form>

          {/* Category shortcuts */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '20px', opacity: heroWords[3] ? 1 : 0, transition: 'opacity 0.6s ease 0.6s' }}>
            {SPECIALTY_FILTERS.filter(f => f.id !== 'all').map(f => (
              <button key={f.id} onClick={() => { setActiveFilter(f.id) }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 15px', borderRadius: '100px', fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-inter)', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-3)', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,240,0.10)'; e.currentTarget.style.borderColor = 'rgba(79,142,240,0.28)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-3)' }}
              >
                <f.Icon size={13} color="currentColor" variant="Linear" /> {f.label}
              </button>
            ))}
          </div>

          {/* Trust stats row */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '28px', opacity: heroWords[3] ? 1 : 0, transition: 'opacity 0.6s ease 0.7s' }}>
            {[
              { icon: <ShieldTick size={13} color="var(--accent)" variant="TwoTone" />, text: '13,000+ verified clinics' },
              { icon: <Flash size={13} color="#4ade80" variant="TwoTone" />, text: 'All free or sliding-scale' },
              { icon: <Global size={13} color="#a78bfa" variant="TwoTone" />, text: '50+ languages served' },
            ].map(s => (
              <div key={s.text} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
                {s.icon} {s.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sticky search header (shown after search starts) ── */}
      {(locationVal || loading || clinics.length > 0) && (
      <div className="search-sticky-header" style={{
        position: 'sticky', top: '62px', zIndex: 100,
        background: 'rgba(2,4,9,0.88)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border2)',
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <form onSubmit={handleSearch}>
            <div className="search-bar-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'stretch' }}>
              {/* Query */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '200px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '4px 4px 4px 14px',
                transition: 'border-color 0.2s',
              }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-hi)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <SearchNormal1 size={15} color="rgba(255,255,255,0.45)" style={{ flexShrink: 0 }} />
                <input
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder={t('search.placeholder')}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-inter),sans-serif', fontSize: '14px', caretColor: 'var(--accent)' }}
                />
                {inputVal && (
                  <button type="button" onClick={() => { setInputVal(''); setIntent({}) }} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '5px', padding: '4px 6px', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}>
                    <CloseCircle size={12} color="rgba(255,255,255,0.5)" />
                  </button>
                )}
              </div>

              {/* Location */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '4px 14px', minWidth: '150px',
              }}>
                <Location size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
                <input
                  value={locationVal}
                  onChange={e => handleLocationChange(e.target.value)}
                  placeholder={t('search.locationPlaceholder')}
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-inter),sans-serif', fontSize: '13px', width: '130px', caretColor: 'var(--accent)' }}
                />
              </div>

              {/* Submit */}
              <button type="submit" style={{
                background: 'var(--accent)', color: 'var(--bg)',
                border: 'none', borderRadius: '11px', padding: '0 22px',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-inter),sans-serif', flexShrink: 0,
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {t('search.button')}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}

      {(locationVal || loading || clinics.length > 0) && (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px 0' }}>

        {/* Intent banner */}
        <IntentBanner intent={intent} onApplySpecialty={setActiveFilter} />

        {/* ── Sticky filter bar (#16) ── */}
        <div className="sticky-filter-bar">

        {/* Specialty filter pills (#14) + Phase 2.1 Get Matched button */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
          {SPECIALTY_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`filter-pill${activeFilter === f.id ? ' active' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <f.Icon size={13} color={activeFilter === f.id ? 'var(--accent)' : 'rgba(255,255,255,0.50)'} variant="Linear" /> {f.label}
            </button>
          ))}
          {/* Phase 2.1 — Get Matched trigger */}
          <button
            onClick={() => setShowMatchForm(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '6px 13px', borderRadius: '100px',
              fontSize: '11px', fontFamily: 'var(--font-inter),sans-serif', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.18s', marginLeft: '4px',
              background: matchInput ? 'rgba(74,144,217,0.15)' : 'rgba(74,144,217,0.07)',
              border: `1px solid ${matchInput ? 'rgba(74,144,217,0.40)' : 'rgba(74,144,217,0.22)'}`,
              color: 'var(--accent)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,144,217,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = matchInput ? 'rgba(74,144,217,0.15)' : 'rgba(74,144,217,0.07)')}
          >
            <Filter size={12} color="var(--accent)" variant={matchInput ? 'Bold' : 'Linear'} />
            {matchInput ? 'Matched for you' : 'Get matched'}
          </button>
        </div>

        {/* Phase 2.1 — Active match context bar */}
        {matchInput && (matchInput.needs.length > 0 || matchInput.language || matchInput.insurance) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
            padding: '8px 12px', borderRadius: '10px', marginBottom: '10px',
            background: 'rgba(74,144,217,0.05)', border: '1px solid rgba(74,144,217,0.14)',
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 500 }}>
              Sorted by match:
            </span>
            {matchInput.needs.map(n => (
              <span key={n} style={{ fontSize: '11px', fontFamily: 'var(--font-inter)', fontWeight: 600, padding: '2px 9px', borderRadius: '100px', background: 'rgba(74,144,217,0.10)', border: '1px solid rgba(74,144,217,0.25)', color: 'var(--accent)' }}>
                {n}
              </span>
            ))}
            {matchInput.language && matchInput.language !== 'english' && (
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-inter)', fontWeight: 600, padding: '2px 9px', borderRadius: '100px', background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.25)', color: '#A78BFA' }}>
                {matchInput.language}
              </span>
            )}
            {matchInput.insurance && (
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-inter)', fontWeight: 600, padding: '2px 9px', borderRadius: '100px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)', color: '#34D399' }}>
                {matchInput.insurance}
              </span>
            )}
            <button
              onClick={() => {
                const p = new URLSearchParams(window.location.search)
                p.delete('needs'); p.delete('language'); p.delete('insurance')
                router.replace(`/search?${p}`)
              }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '11px', fontFamily: 'var(--font-inter)', display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', borderRadius: '5px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--error,#F87171)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
            >
              × Clear match
            </button>
          </div>
        )}

        {/* Controls row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: radius + open now */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>Radius:</span>
            {RADIUS_OPTIONS.map(r => (
              <button
                key={r.value}
                onClick={() => setRadius(r.value)}
                style={{
                  padding: '4px 11px', borderRadius: '100px',
                  fontSize: '11px', fontFamily: 'var(--font-inter),sans-serif', cursor: 'pointer',
                  transition: 'all 0.18s',
                  background: radius === r.value ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${radius === r.value ? 'rgba(74,144,217,0.28)' : 'rgba(255,255,255,0.07)'}`,
                  color: radius === r.value ? 'var(--accent)' : 'var(--text-3)',
                }}
              >
                {r.label}
              </button>
            ))}

            {/* ── Open Right Now toggle ── */}
            <button
              onClick={() => setOpenNowFilter(p => !p)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: '100px',
                fontSize: '11px', fontFamily: 'var(--font-inter),sans-serif',
                cursor: 'pointer', transition: 'all 0.18s', fontWeight: openNowFilter ? 600 : 400,
                background: openNowFilter ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${openNowFilter ? 'rgba(96,165,250,0.30)' : 'rgba(255,255,255,0.07)'}`,
                color: openNowFilter ? 'var(--green-pulse)' : 'var(--text-3)',
              }}
            >
              {openNowFilter
                ? <><div className="open-pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green-pulse)' }} /> Open right now</>
                : <><Clock size={11} color="rgba(255,255,255,0.5)" /> Open right now</>
              }
            </button>
          </div>

          {/* Right: view toggle + print + emergency */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <EmergencyEscalation compact />
            {results.length > 0 && (
              <button onClick={() => window.print()} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 11px', borderRadius: '8px', fontSize: '11px',
                fontFamily: 'var(--font-inter),sans-serif', cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                color: 'var(--text-3)', transition: 'all 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              >
                <Printer size={12} color="rgba(255,255,255,0.5)" /> Print
              </button>
            )}
            {geoCenter && (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', overflow: 'hidden' }}>
                {(['list', 'map'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: '5px 11px', fontSize: '11px', fontFamily: 'var(--font-inter),sans-serif',
                      cursor: 'pointer', border: 'none',
                      background: viewMode === mode ? 'rgba(74,144,217,0.10)' : 'transparent',
                      color: viewMode === mode ? 'var(--accent)' : 'var(--text-3)',
                      display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.18s',
                    }}
                  >
                    {mode === 'list' ? <><RowVertical size={12} color={viewMode === mode ? 'var(--accent)' : 'rgba(255,255,255,0.50)'} /> List</> : <><MapIcon size={12} color={viewMode === mode ? 'var(--accent)' : 'rgba(255,255,255,0.50)'} /> Map</>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        </div>{/* end sticky-filter-bar */}

        {/* Status — aria-live so screen readers announce when results load */}
        <p role="status" aria-live="polite" aria-atomic="true" style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '16px', marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontFamily: 'var(--font-inter)' }}>
          {loading ? t('general.loading') : `${visibleCount} ${visibleCount !== 1 ? t('search.clinics') : t('search.clinic')} ${locationVal ? `${t('search.clinicsNear')} ${locationVal}` : '— ' + t('search.enterZip')}`}
          {!loading && sourceBadge && (
            /* #41 — Rich source attribution badge */
            <span
              title={sourceBadge.tooltip}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', fontWeight: 600, cursor: 'help',
                color: sourceBadge.color,
                background: sourceBadge.bg,
                border: `1px solid ${sourceBadge.borderColor}`,
                padding: '2px 9px', borderRadius: '100px',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {sourceBadge.icon} {sourceBadge.label}
              <InfoCircle size={9} color="currentColor" variant="TwoTone" style={{ opacity: 0.5 }} aria-hidden="true" />
            </span>
          )}
          {!loading && Object.keys(sourceCounts).length > 0 && (
            <span style={{ color: 'var(--text-3)', fontSize: '10px', fontFamily: 'var(--font-mono),monospace' }}>
              ({Object.entries(sourceCounts).filter(([, n]) => n > 0).map(([s, n]) => `${s}:${n}`).join(' · ')})
            </span>
          )}
        </p>
      </div>
      )}

      {/* ── Results area ── */}
      {(locationVal || loading || clinics.length > 0) && (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 120px' }}>
        {fetchError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'var(--coral-dim)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '12px', marginBottom: '20px', color: 'var(--coral)', fontSize: '13px', fontFamily: 'var(--font-inter)' }}>
            <InfoCircle size={16} color="var(--coral,#f87171)" /> {fetchError}
          </div>
        )}

        {/* ── Illustrated empty state (LEGACY — hero handles pre-search; keep for other edge cases) ── */}
        {!locationVal && !loading && false && (
          <div style={{ padding: '60px 0 40px' }}>
            {/* Hero illustration */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              {/* SVG illustration — simplified city + cross */}
              <svg width="160" height="100" viewBox="0 0 160 100" fill="none" aria-hidden="true" style={{ margin: '0 auto 24px', display: 'block', opacity: 0.85 }}>
                {/* Ground */}
                <rect x="0" y="82" width="160" height="2" fill="rgba(74,144,217,0.15)" rx="1"/>
                {/* Buildings */}
                <rect x="8"  y="52" width="18" height="30" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <rect x="14" y="46" width="6"  height="6"  rx="1" fill="rgba(74,144,217,0.15)"/>
                <rect x="30" y="38" width="24" height="44" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.09)" strokeWidth="1"/>
                <rect x="36" y="32" width="8"  height="6"  rx="1" fill="rgba(74,144,217,0.20)"/>
                {/* Center building — clinic */}
                <rect x="60" y="26" width="40" height="56" rx="4" fill="rgba(74,144,217,0.07)" stroke="rgba(74,144,217,0.25)" strokeWidth="1.2"/>
                {/* Cross on clinic */}
                <rect x="76" y="36" width="8" height="20" rx="2" fill="rgba(74,144,217,0.60)"/>
                <rect x="70" y="42" width="20" height="8"  rx="2" fill="rgba(74,144,217,0.60)"/>
                {/* Right buildings */}
                <rect x="106" y="44" width="20" height="38" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <rect x="110" y="38" width="8"  height="6"  rx="1" fill="rgba(167,139,250,0.18)"/>
                <rect x="130" y="56" width="16" height="26" rx="3" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                {/* Location pin */}
                <circle cx="80" cy="12" r="7" fill="rgba(74,144,217,0.15)" stroke="rgba(74,144,217,0.50)" strokeWidth="1.4"/>
                <circle cx="80" cy="12" r="2.5" fill="var(--accent)"/>
                <line x1="80" y1="19" x2="80" y2="25" stroke="rgba(74,144,217,0.40)" strokeWidth="1.4" strokeLinecap="round"/>
                {/* Glow */}
                <ellipse cx="80" cy="83" rx="28" ry="4" fill="rgba(74,144,217,0.06)"/>
              </svg>
              <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                {t('search.findClinic')}
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: '14px', maxWidth: '360px', margin: '0 auto', fontFamily: 'var(--font-inter)', lineHeight: 1.75 }}>
                {t('search.enterZipDesc')}
              </p>
            </div>

            {/* CTA cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', maxWidth: '600px', margin: '0 auto 32px' }}>
              {/* Card 0 — Phase 2.1: Get matched */}
              <div style={{
                background: 'rgba(74,144,217,0.07)', border: '1px solid rgba(74,144,217,0.28)',
                borderRadius: '16px', padding: '20px', cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
                gridColumn: '1 / -1',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,144,217,0.12)'; e.currentTarget.style.borderColor = 'rgba(74,144,217,0.40)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,144,217,0.07)'; e.currentTarget.style.borderColor = 'rgba(74,144,217,0.28)' }}
                onClick={() => setShowMatchForm(true)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Filter size={18} color="var(--accent)" variant="TwoTone" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
                      Get matched to the right clinic
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.65, fontFamily: 'var(--font-inter)' }}>
                      Answer 3 quick questions about your needs, language, and coverage — we'll rank results for you.
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
                </div>
              </div>

              {/* Card 1 — sliding scale */}
              <div style={{
                background: 'rgba(74,144,217,0.05)', border: '1px solid rgba(74,144,217,0.18)',
                borderRadius: '16px', padding: '20px', cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,144,217,0.09)'; e.currentTarget.style.borderColor = 'rgba(74,144,217,0.30)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,144,217,0.05)'; e.currentTarget.style.borderColor = 'rgba(74,144,217,0.18)' }}
                onClick={() => { document.querySelector<HTMLInputElement>('input[placeholder*="ZIP"]')?.focus() }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <Location size={16} color="var(--accent)" />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                  Sliding-scale clinics
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.7, fontFamily: 'var(--font-inter)' }}>
                  Pay what you can — fees set by income. Many visits cost $0–$20.
                </div>
                <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-inter)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Enter ZIP to search <ArrowRight size={14} />
                </div>
              </div>

              {/* Card 2 — emergency */}
              <div style={{
                background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.16)',
                borderRadius: '16px', padding: '20px',
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <InfoCircle size={16} color="var(--coral)" />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                  Need help right now?
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.7, fontFamily: 'var(--font-inter)' }}>
                  For urgent non-emergency care, free health lines are available 24/7.
                </div>
                <div style={{ marginTop: '12px' }}>
                  <EmergencyEscalation compact />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state — animated "Searching..." banner + skeleton cards */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Searching indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 18px', borderRadius: '12px',
              background: 'rgba(79,142,240,0.06)',
              border: '1px solid rgba(79,142,240,0.14)',
              marginBottom: '4px',
            }}>
              <RefreshCircle size={16} color="var(--accent)" style={{ animation: 'spin 0.9s linear infinite', flexShrink: 0 }} />
              <div>
                <div style={{
                  fontSize: '13px', fontWeight: 600,
                  color: 'var(--accent)', fontFamily: 'var(--font-inter)',
                }}>
                  Searching nearby clinics…
                </div>
                <div style={{
                  fontSize: '11px', color: 'var(--text-3)',
                  fontFamily: 'var(--font-inter)', marginTop: '2px',
                }}>
                  Checking availability and free care options near you
                </div>
              </div>
            </div>
            {/* Staggered skeleton cards */}
            {[0, 0.05, 0.10, 0.15, 0.20].map((delay, i) => (
              <div key={i} style={{ animationDelay: `${delay}s`, opacity: 0, animation: `fadeSlideUp 0.4s ${delay}s cubic-bezier(0.16,1,0.3,1) both` }}>
                <SkeletonClinicCard />
              </div>
            ))}
            <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Map + list split */}
        {!loading && results.length > 0 && viewMode === 'map' && geoCenter && (
          <div className="map-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', scrollbarWidth: 'thin' }}>
              {results.map((clinic, i) => (
                <ClinicCard key={clinic.id} clinic={clinic} index={i}
                  isSaved={savedIds.has(String(clinic.id))} saving={savingId === String(clinic.id)}
                  onBookmark={toggleBookmark} openNowFilter={openNowFilter}
                  langMatch={targetLanguage ? clinicHasLanguage(clinic, targetLanguage) : false}
                  matchScore={matchScores?.get(String(clinic.id))}
                />
              ))}
            </div>
            <div style={{ height: '600px', position: 'sticky', top: '130px' }}>
              <ClinicMap
                lat={geoCenter.lat}
                lng={geoCenter.lng}
                clinics={results}
                radius={radius}
                matchScores={matchScores ?? undefined}
                onSearchArea={(newLat, newLng, r) => {
                  // Re-center on the panned area and re-run search
                  setGeoCenter({ lat: newLat, lng: newLng })
                  setLocationVal(`${newLat.toFixed(4)}, ${newLng.toFixed(4)}`)
                  handleSearch()
                }}
              />
            </div>
          </div>
        )}

        {/* List view — staggered entrance (#13) */}
        {!loading && results.length > 0 && viewMode === 'list' && (
          <>
            <div className="search-results-bottom-pad" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pagedResults.map((clinic, i) => (
                <div
                  key={clinic.id}
                  className="result-enter"
                  style={{ animationDelay: `${Math.min(i * 0.055, 0.55)}s` }}
                >
                  <ClinicCard clinic={clinic} index={i}
                    isSaved={savedIds.has(String(clinic.id))} saving={savingId === String(clinic.id)}
                    onBookmark={toggleBookmark} openNowFilter={openNowFilter}
                    langMatch={targetLanguage ? clinicHasLanguage(clinic, targetLanguage) : false}
                    matchScore={matchScores?.get(String(clinic.id))}
                  />
                </div>
              ))}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={() => setVisiblePage(p => p + 1)}
                  style={{
                    padding: '11px 32px', borderRadius: '12px',
                    background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.22)',
                    color: 'var(--accent)', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-inter)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,144,217,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(74,144,217,0.08)')}
                >
                  Show more ({results.length - pagedResults.length} remaining)
                </button>
              </div>
            )}
          </>
        )}

        {/* No results state (#15) */}
        {locationVal && !loading && visibleCount === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0 40px' }}>
            {/* Illustrated empty state */}
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ margin: '0 auto 20px', display: 'block' }}>
              <circle cx="40" cy="40" r="36" fill="rgba(248,113,113,0.06)" stroke="rgba(248,113,113,0.20)" strokeWidth="1.5"/>
              <circle cx="40" cy="40" r="22" fill="none" stroke="rgba(248,113,113,0.15)" strokeWidth="1" strokeDasharray="3 4"/>
              <path d="M29 29l22 22M51 29L29 51" stroke="rgba(248,113,113,0.50)" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="40" cy="40" r="8" fill="none" stroke="rgba(248,113,113,0.30)" strokeWidth="1.5"/>
            </svg>
            <p style={{ fontSize: '17px', color: 'var(--text)', marginBottom: '8px', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {t('search.noResults')} <span style={{ color: 'var(--accent)' }}>{locationVal}</span>
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', marginBottom: '28px', lineHeight: 1.75, maxWidth: '340px', margin: '0 auto 28px' }}>
              {t('search.noResultsHint')}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button
                onClick={() => setRadius('50')}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.22)', color: 'var(--accent)', fontSize: '12px', fontFamily: 'var(--font-inter)', fontWeight: 600, cursor: 'pointer' }}
              >
                Expand to 50 mi
              </button>
              <button
                onClick={() => setActiveFilter('all')}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: 'var(--text-2)', fontSize: '12px', fontFamily: 'var(--font-inter)', cursor: 'pointer' }}
              >
                Clear specialty filter
              </button>
            </div>
            <EmergencyEscalation />
          </div>
        )}

        {/* Footer info */}
        {results.length > 0 && (
          <div style={{
            marginTop: '32px', padding: '14px 18px',
            background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.12)',
            borderRadius: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px',
          }}>
            <Hospital size={15} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.75, fontFamily: 'var(--font-inter)' }}>
              <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Results ranked by affordability score.</strong>{' '}
              <span style={{ color: 'var(--accent)' }}>Likely Free</span> = FQHCs and NAFC clinics with sliding-scale or no-cost care.{' '}
              Sources:{' '}
              <a href="https://findahealthcenter.hrsa.gov" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>HRSA</a>,{' '}
              <a href="https://nafc.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>NAFC</a>,{' '}
              OpenStreetMap.
            </div>
          </div>
        )}
      </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .map-split { grid-template-columns: 1fr !important; }
          .search-bar-row > div:nth-child(2) { min-width: unset !important; flex: 1 !important; }
          .search-bar-row > div:nth-child(2) input { width: 100% !important; }
        }
        @media print {
          nav, button, a[href]:not([href^="tel"]) { display: none !important; }
          body { background: white !important; color: black !important; }
          .clinic-card { border: 1px solid #ccc !important; background: white !important; page-break-inside: avoid; margin-bottom: 12px; }
          .clinic-card * { color: black !important; }
        }
        @keyframes bridge-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Phase 2.1 — Guided Match Form (bottom sheet) */}
      {showMatchForm && (
        <MatchForm
          onClose={() => setShowMatchForm(false)}
          initialZip={locationVal}
        />
      )}

      {/* N5 — Insurance Bridge Toast */}
      {bridgeClinic && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 2000, maxWidth: '480px', width: 'calc(100vw - 32px)',
          background: 'rgba(10,10,24,0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(74,144,217,0.28)', borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,144,217,0.08)',
          animation: 'bridge-in 0.35s cubic-bezier(0.16,1,0.3,1) both',
          display: 'flex', alignItems: 'flex-start', gap: '14px',
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--accent)' }}>
            <ShieldTick size={14} color="currentColor" variant="TwoTone" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-inter)', marginBottom: '3px' }}>
              Saved {bridgeClinic}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)', lineHeight: 1.5, marginBottom: '10px' }}>
              While you wait — you may qualify for Medicaid, CHIP, or a $0 ACA plan that covers this clinic.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/eligibility" style={{ padding: '6px 14px', borderRadius: '7px', background: 'var(--accent)', color: '#07070F', fontSize: '11px', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
                Check coverage →
              </Link>
              <button onClick={() => setBridgeClinic(null)} style={{ padding: '6px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCircle size={28} color="var(--accent)" style={{ animation: 'spin-slow 0.8s linear infinite' }} />
        </div>
      </AppShell>
    }>
      <SearchResults />
    </Suspense>
  )
}
