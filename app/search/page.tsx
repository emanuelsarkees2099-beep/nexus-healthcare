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
import {
  Search, MapPin, X, Stethoscope,
  Heart, Brain, Eye, Pill, Baby,
  AlertCircle, Map, List, Printer,
  Clock, Zap, ArrowRight, Loader2,
} from 'lucide-react'
/* P3 — standardized skeleton */
import { SkeletonClinicCard, SKELETON_STYLES } from '@/components/ui/Skeleton'

/* P2 — ClinicCard code-split: loads after the search input is interactive */
const ClinicCard = dynamic_import(() => import('@/components/search/ClinicCard'), {
  ssr: false,
  loading: () => <SkeletonClinicCard />,
})

/* P2 — ClinicMap code-split: Leaflet requires browser APIs */
const ClinicMap = dynamic_import(() => import('@/components/ClinicMap'), { ssr: false })

/* ── Types (P2: imported from extracted ClinicCard component) ─────── */
export type { Clinic, AffordabilityLabel } from '@/components/search/ClinicCard'
import type { Clinic, AffordabilityLabel } from '@/components/search/ClinicCard'

/* ── Constants ────────────────────────────────────────────────────── */

const SPECIALTY_FILTERS = [
  { label: 'All',            icon: <Search size={13} />,      id: 'all'        },
  { label: 'Primary care',   icon: <Stethoscope size={13} />, id: 'primary'    },
  { label: 'Mental health',  icon: <Brain size={13} />,       id: 'mental'     },
  { label: 'Dental',         icon: <Pill size={13} />,        id: 'dental'     },
  { label: "Women's health", icon: <Heart size={13} />,       id: 'womens'     },
  { label: 'Pediatrics',     icon: <Baby size={13} />,        id: 'pediatrics' },
  { label: 'Vision',         icon: <Eye size={13} />,         id: 'vision'     },
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
      <Zap size={13} color="var(--accent)" />
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
  if (targetLanguage) {
    results = [...results].sort((a, b) => {
      const aMatch = clinicHasLanguage(a, targetLanguage) ? 1 : 0
      const bMatch = clinicHasLanguage(b, targetLanguage) ? 1 : 0
      return bMatch - aMatch
    })
  }

  const visibleCount = openNowFilter
    ? results.filter(c => isOpenNow(c.hours) !== false).length
    : results.length

  const sourceBadge = source === 'hrsa+nafc' ? '● FQHC + Free Clinics verified'
    : source === 'hrsa'  ? '● FQHC verified · federally funded'
    : source === 'nafc'  ? '● NAFC free clinics verified'
    : source === 'osm'   ? '● Community-sourced data'
    : null

  return (
    <AppShell>
      <style>{SKELETON_STYLES}</style>
      {/* ── Sticky search header ── */}
      <div style={{
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
                <Search size={15} color="var(--text-3)" style={{ flexShrink: 0 }} />
                <input
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder={t('search.placeholder')}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-inter),sans-serif', fontSize: '14px', caretColor: 'var(--accent)' }}
                />
                {inputVal && (
                  <button type="button" onClick={() => { setInputVal(''); setIntent({}) }} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '5px', padding: '4px 6px', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}>
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Location */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '4px 14px', minWidth: '150px',
              }}>
                <MapPin size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
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

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px 0' }}>

        {/* Intent banner */}
        <IntentBanner intent={intent} onApplySpecialty={setActiveFilter} />

        {/* ── Sticky filter bar (#16) ── */}
        <div className="sticky-filter-bar">

        {/* Specialty filter pills (#14) */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
          {SPECIALTY_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`filter-pill${activeFilter === f.id ? ' active' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

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
                : <><Clock size={11} /> Open right now</>
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
                <Printer size={12} /> Print
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
                    {mode === 'list' ? <><List size={12} /> List</> : <><Map size={12} /> Map</>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        </div>{/* end sticky-filter-bar */}

        {/* Status */}
        <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '16px', marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontFamily: 'var(--font-inter)' }}>
          {loading ? t('general.loading') : `${visibleCount} ${visibleCount !== 1 ? t('search.clinics') : t('search.clinic')} ${locationVal ? `${t('search.clinicsNear')} ${locationVal}` : '— ' + t('search.enterZip')}`}
          {!loading && sourceBadge && (
            <span style={{ color: 'var(--accent)', fontSize: '11px' }}>
              {sourceBadge}
            </span>
          )}
          {!loading && Object.keys(sourceCounts).length > 0 && (
            <span style={{ color: 'var(--text-3)', fontSize: '10px', fontFamily: 'var(--font-mono),monospace' }}>
              ({Object.entries(sourceCounts).filter(([, n]) => n > 0).map(([s, n]) => `${s}:${n}`).join(' · ')})
            </span>
          )}
        </p>
      </div>

      {/* ── Results area ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 120px' }}>
        {fetchError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'var(--coral-dim)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '12px', marginBottom: '20px', color: 'var(--coral)', fontSize: '13px', fontFamily: 'var(--font-inter)' }}>
            <AlertCircle size={16} /> {fetchError}
          </div>
        )}

        {/* ── Illustrated empty state (#15) ── */}
        {!locationVal && !loading && (
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
                  <MapPin size={16} color="var(--accent)" />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                  Sliding-scale clinics
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.7, fontFamily: 'var(--font-inter)' }}>
                  Pay what you can — fees set by income. Many visits cost $0–$20.
                </div>
                <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-inter)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Enter ZIP to search <ArrowRight size={10} />
                </div>
              </div>

              {/* Card 2 — emergency */}
              <div style={{
                background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.16)',
                borderRadius: '16px', padding: '20px',
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <AlertCircle size={16} color="var(--coral)" />
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

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3, 4, 5].map(i => <SkeletonClinicCard key={i} />)}
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
                />
              ))}
            </div>
            <div style={{ height: '600px', position: 'sticky', top: '130px' }}>
              <ClinicMap
                lat={geoCenter.lat}
                lng={geoCenter.lng}
                clinics={results}
                radius={radius}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map((clinic, i) => (
              <div
                key={clinic.id}
                className="result-enter"
                style={{ animationDelay: `${Math.min(i * 0.055, 0.55)}s` }}
              >
                <ClinicCard clinic={clinic} index={i}
                  isSaved={savedIds.has(String(clinic.id))} saving={savingId === String(clinic.id)}
                  onBookmark={toggleBookmark} openNowFilter={openNowFilter}
                  langMatch={targetLanguage ? clinicHasLanguage(clinic, targetLanguage) : false}
                />
              </div>
            ))}
          </div>
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
            <Stethoscope size={15} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
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
          <Loader2 size={28} color="var(--accent)" style={{ animation: 'spin-slow 0.8s linear infinite' }} />
        </div>
      </AppShell>
    }>
      <SearchResults />
    </Suspense>
  )
}
