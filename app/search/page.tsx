'use client'
import { useEffect, useRef, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { createClientClient } from '@/lib/auth-client'
import {
  Search, MapPin, Phone, Globe, ChevronRight, X, Stethoscope,
  Heart, Brain, Eye, Pill, Baby, Bookmark, BookmarkCheck,
  AlertCircle, Loader2, Map, List, Printer, Navigation,
} from 'lucide-react'

type AffordabilityLabel = 'likely-free' | 'low-cost' | 'standard'
type Clinic = {
  id: string; name: string; address: string; city: string; state: string
  zip: string; phone: string; distance: number | string; services: string[]
  accepting: boolean; sliding_scale: boolean; free: boolean; url?: string; hours?: string; type?: string
  affordability_score?: number
  affordability_label?: AffordabilityLabel
  affordability_reasons?: string[]
  isFreeOrDiscounted?: boolean
  lat?: number
  lng?: number
}

const SPECIALTY_FILTERS = [
  { label: 'All', icon: <Search size={13} />, id: 'all' },
  { label: 'Primary care', icon: <Stethoscope size={13} />, id: 'primary' },
  { label: 'Mental health', icon: <Brain size={13} />, id: 'mental' },
  { label: 'Dental', icon: <Pill size={13} />, id: 'dental' },
  { label: "Women's health", icon: <Heart size={13} />, id: 'womens' },
  { label: 'Pediatrics', icon: <Baby size={13} />, id: 'pediatrics' },
  { label: 'Vision', icon: <Eye size={13} />, id: 'vision' },
]

const RADIUS_OPTIONS = [
  { label: '5 mi', value: '5' },
  { label: '10 mi', value: '10' },
  { label: '25 mi', value: '25' },
  { label: '50 mi', value: '50' },
]

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px 24px', display: 'flex', gap: '16px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', flexShrink: 0, animation: 'skel-pulse 1.5s ease-in-out infinite' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '16px', width: '55%', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', animation: 'skel-pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '12px', width: '38%', borderRadius: '5px', background: 'rgba(255,255,255,0.04)', animation: 'skel-pulse 1.5s ease-in-out 0.15s infinite' }} />
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          {[60, 45, 70].map((w, i) => (
            <div key={i} style={{ height: '20px', width: `${w}px`, borderRadius: '5px', background: 'rgba(255,255,255,0.04)', animation: `skel-pulse 1.5s ease-in-out ${i * 0.1}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Map panel (OpenStreetMap embed) ───────────────────────────────────────────
function MapPanel({ lat, lng, clinics, radius }: { lat: number; lng: number; clinics: Clinic[]; radius: string }) {
  const radiusMeters = parseInt(radius) * 1609
  // Build OSM embed URL with bounding box around the search area
  const deg = (parseInt(radius) * 1.1) / 69
  const bbox = `${lng - deg},${lat - deg},${lng + deg},${lat + deg}`
  // Use OSM with markers for top 5 clinics
  const iframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <iframe
        src={iframeUrl}
        width="100%"
        height="100%"
        style={{ border: 'none', display: 'block', filter: 'invert(0.92) hue-rotate(180deg) saturate(0.8)' }}
        title="Clinic map"
        loading="lazy"
        allowFullScreen
      />
      {/* Clinic pins overlay info */}
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(8,8,18,0.88)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 12px', backdropFilter: 'blur(12px)', fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)' }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>{clinics.length}</span> clinics within {radius} mi
      </div>
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(8,8,18,0.88)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)', textDecoration: 'none', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Navigation size={10} /> Open in OSM
      </a>
    </div>
  )
}

// ── Clinic card ───────────────────────────────────────────────────────────────
function ClinicCard({ clinic, index, isSaved, saving, onBookmark }: {
  clinic: Clinic; index: number;
  isSaved: boolean; saving: boolean;
  onBookmark: (c: Clinic) => void
}) {
  const typeColor = clinic.type === 'FQHC' ? '#6d9197' : clinic.type === 'Free Clinic' ? '#4ade80' : clinic.type === 'NAFC' ? '#4ade80' : 'rgba(255,255,255,0.3)'
  const typeLabel = clinic.type === 'Free Clinic' ? 'FREE CLINIC' : clinic.type === 'FQHC' ? 'FQHC' : clinic.type?.toUpperCase() ?? ''

  return (
    <div
      className="clinic-card"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '16px', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = '' }}
    >
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{index + 1}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.92)', marginBottom: '4px' }}>{clinic.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
              <MapPin size={11} /> {[clinic.address, clinic.city, clinic.state].filter(Boolean).join(', ') || 'Address unavailable'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => onBookmark(clinic)}
              disabled={saving}
              style={{ background: isSaved ? 'rgba(109,145,151,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isSaved ? 'rgba(109,145,151,0.35)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', padding: '7px', cursor: 'pointer', color: isSaved ? '#6d9197' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', transition: 'all 0.18s' }}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark clinic'}
            >
              {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
            {clinic.phone && (
              <a href={`tel:${clinic.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                <Phone size={12} /> Call
              </a>
            )}
            <a
              href={clinic.url ? (clinic.url.startsWith('http') ? clinic.url : `https://${clinic.url}`) : clinic.mapsUrl ?? `https://www.google.com/maps/search/${encodeURIComponent(clinic.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: 'rgba(255,255,255,0.92)', color: '#08081a', borderRadius: '9px', padding: '8px 16px', fontSize: '12.5px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              {clinic.url ? <><Globe size={12} /> Visit</> : <><ChevronRight size={13} /> Directions</>}
            </a>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4ade80' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} /> Accepting patients
          </span>
          {clinic.distance && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              <MapPin size={11} /> {clinic.distance} mi
            </span>
          )}
          {clinic.phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              <Phone size={11} /> {clinic.phone}
            </span>
          )}
          {typeLabel && (
            <span style={{ fontSize: '10px', color: typeColor, background: `${typeColor}14`, border: `1px solid ${typeColor}30`, padding: '2px 8px', borderRadius: '5px', letterSpacing: '0.06em' }}>
              {typeLabel}
            </span>
          )}
          {clinic.affordability_label === 'likely-free' && (
            <span title={clinic.affordability_reasons?.join(' · ')} style={{ fontSize: '10px', color: '#4ade80', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', padding: '2px 8px', borderRadius: '5px', letterSpacing: '0.06em', cursor: 'default' }}>LIKELY FREE</span>
          )}
          {clinic.affordability_label === 'low-cost' && (
            <span title={clinic.affordability_reasons?.join(' · ')} style={{ fontSize: '10px', color: '#60a5fa', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', padding: '2px 8px', borderRadius: '5px', letterSpacing: '0.06em', cursor: 'default' }}>LOW COST</span>
          )}
          {clinic.sliding_scale && clinic.affordability_label !== 'likely-free' && (
            <span style={{ fontSize: '10px', color: '#a78bfa', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', padding: '2px 8px', borderRadius: '5px', letterSpacing: '0.06em' }}>SLIDING SCALE</span>
          )}
        </div>
        {clinic.services?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {clinic.services.slice(0, 5).map((s: string) => (
              <span key={s} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 9px', borderRadius: '5px' }}>{s}</span>
            ))}
            {clinic.services.length > 5 && (
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', padding: '3px 6px' }}>+{clinic.services.length - 5} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main search results ────────────────────────────────────────────────────────
function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClientClient()

  const query = searchParams.get('q') || searchParams.get('symptom') || ''
  const locParam = searchParams.get('loc') || searchParams.get('location') || ''

  // Persistent ZIP: restore from localStorage, fall back to URL param
  const [inputVal, setInputVal] = useState(query)
  const [locationVal, setLocationVal] = useState(() => {
    if (locParam) return locParam
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexus_zip') || ''
    }
    return ''
  })
  const [activeFilter, setActiveFilter] = useState('all')
  const [radius, setRadius] = useState('25')
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [source, setSource] = useState<string>('')
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({})
  const [specialtyMatched, setSpecialtyMatched] = useState(true)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [geoCenter, setGeoCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => { setInputVal(query) }, [query])
  useEffect(() => {
    if (locParam) {
      setLocationVal(locParam)
      localStorage.setItem('nexus_zip', locParam)
    }
  }, [locParam])

  // Persist ZIP to localStorage on change
  const handleLocationChange = (val: string) => {
    setLocationVal(val)
    if (val.trim()) localStorage.setItem('nexus_zip', val.trim())
  }

  // Dispatch saved count for Nav badge
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('nexus:saved-count', { detail: savedCount }))
  }, [savedCount])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token
      if (!token) return
      setAuthToken(token)
      fetch('/api/bookmarks', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          if (d.bookmarks) {
            const ids = new Set<string>(d.bookmarks.map((b: { resource_id: string }) => b.resource_id))
            setSavedIds(ids)
            setSavedCount(ids.size)
          }
        })
        .catch(() => {})
    })
  }, [supabase])

  const fetchClinics = useCallback(async (location: string, specialty: string, rad: string) => {
    if (!location) { setClinics([]); return }
    setLoading(true); setFetchError('')
    try {
      const p = new URLSearchParams({ location, radius: rad })
      if (specialty && specialty !== 'all') p.set('specialty', specialty)
      const res = await fetch(`/api/clinics?${p}`)
      const data = await res.json()
      setClinics(data.clinics ?? [])
      setSource(data.source ?? '')
      setSourceCounts(data.sources ?? {})
      setSpecialtyMatched(data.specialty_matched !== false)
      if (data.location?.lat && data.location?.lng) {
        setGeoCenter({ lat: data.location.lat, lng: data.location.lng })
      }
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
    if (!authToken) return
    const id = String(clinic.id); setSavingId(id)
    try {
      if (savedIds.has(id)) {
        await fetch(`/api/bookmarks?resource_id=${id}&resource_type=clinic`, { method: 'DELETE', headers: { Authorization: `Bearer ${authToken}` } })
        setSavedIds(prev => { const s = new Set(prev); s.delete(id); setSavedCount(s.size); return s })
      } else {
        await fetch('/api/bookmarks', { method: 'POST', headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ resource_type: 'clinic', resource_id: id, resource_name: clinic.name, resource_data: clinic }) })
        setSavedIds(prev => { const s = new Set(prev).add(id); setSavedCount(s.size); return s })
      }
    } catch { /* silent */ }
    setSavingId(null)
  }

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    const loc = locationVal.trim()
    if (loc) {
      if (loc) localStorage.setItem('nexus_zip', loc)
      router.push(`/search?q=${encodeURIComponent(inputVal.trim())}&loc=${encodeURIComponent(loc)}`)
      fetchClinics(loc, activeFilter, radius)
    }
  }

  function handlePrint() {
    window.print()
  }

  const results = inputVal
    ? clinics.filter(c =>
        c.name.toLowerCase().includes(inputVal.toLowerCase()) ||
        c.city?.toLowerCase().includes(inputVal.toLowerCase()) ||
        c.services?.some(s => s.toLowerCase().includes(inputVal.toLowerCase()))
      )
    : clinics

  const sourceBadge = source === 'hrsa+nafc'
    ? <span style={{ marginLeft: '8px', color: '#4ade80', fontSize: '11px' }}>● FQHC + Free Clinics verified</span>
    : source === 'hrsa'
      ? <span style={{ marginLeft: '8px', color: '#4ade80', fontSize: '11px' }}>● FQHC verified · federally funded free clinics</span>
      : source === 'nafc'
        ? <span style={{ marginLeft: '8px', color: '#4ade80', fontSize: '11px' }}>● NAFC free clinics verified</span>
        : source === 'osm'
          ? <span style={{ marginLeft: '8px', color: '#6d9197', fontSize: '11px' }}>● Community-sourced data</span>
          : null

  return (
    <AppShell>
      {/* ── Search header ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 0' }}>
        {/* Status bar */}
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', letterSpacing: '0.04em', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
          {loading ? 'Searching…' : `${results.length} free clinic${results.length !== 1 ? 's' : ''} ${locationVal ? `near ${locationVal}` : '— enter a ZIP code to search'}`}
          {!loading && sourceBadge}
          {!specialtyMatched && activeFilter !== 'all' && (
            <span style={{ marginLeft: '8px', color: '#f59e0b', fontSize: '11px' }}>⚠ No exact {activeFilter} match — showing nearby clinics</span>
          )}
          {source === 'empty' && (
            <span style={{ marginLeft: '8px', color: '#f59e0b', fontSize: '11px' }}>⚠ No results — try a larger radius or different location</span>
          )}
          {/* Source breakdown */}
          {!loading && Object.keys(sourceCounts).length > 0 && (
            <span style={{ marginLeft: '8px', color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>
              ({Object.entries(sourceCounts).filter(([,n]) => n > 0).map(([src, n]) => `${src}: ${n}`).join(' · ')})
            </span>
          )}
        </p>

        {/* Search form */}
        <form onSubmit={handleSearch} style={{ marginBottom: '16px' }}>
          <div className="search-bar-row" style={{ display: 'flex', gap: '10px', maxWidth: '860px', flexWrap: 'wrap', alignItems: 'stretch' }}>
            {/* Query input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '4px 4px 4px 16px' }}>
              <Search size={16} color="rgba(255,255,255,0.35)" style={{ flexShrink: 0 }} />
              <input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="Search clinics, specialties…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.9)', fontFamily: 'inherit', fontSize: '15px' }}
              />
              {inputVal && (
                <button type="button" onClick={() => setInputVal('')} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                  <X size={13} />
                </button>
              )}
            </div>
            {/* ZIP input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '4px 16px', minWidth: '160px', flex: '0 0 auto' }}>
              <MapPin size={14} color="rgba(109,145,151,0.7)" style={{ flexShrink: 0 }} />
              <input
                value={locationVal}
                onChange={e => handleLocationChange(e.target.value)}
                placeholder="ZIP code or city…"
                style={{ background: 'none', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.75)', fontFamily: 'inherit', fontSize: '14px', width: '140px' }}
              />
            </div>
            <button type="submit" style={{ background: 'rgba(255,255,255,0.92)', color: '#08081a', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
              Search
            </button>
          </div>
        </form>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
          {/* Specialty pills */}
          {SPECIALTY_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '100px', fontSize: '12.5px', fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.18s', background: activeFilter === f.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activeFilter === f.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`, color: activeFilter === f.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)' }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Distance rings + view toggle + print */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Distance rings */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-inter)', marginRight: '2px' }}>Radius:</span>
            {RADIUS_OPTIONS.map(r => (
              <button
                key={r.value}
                onClick={() => setRadius(r.value)}
                style={{ padding: '5px 12px', borderRadius: '100px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.18s', background: radius === r.value ? 'rgba(109,145,151,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${radius === r.value ? 'rgba(109,145,151,0.4)' : 'rgba(255,255,255,0.07)'}`, color: radius === r.value ? '#6d9197' : 'rgba(255,255,255,0.35)' }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* View toggle + Print */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {results.length > 0 && (
              <button onClick={handlePrint} title="Print clinic list" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
              >
                <Printer size={13} /> Print
              </button>
            )}
            {geoCenter && (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                {(['list', 'map'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{ padding: '6px 12px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', background: viewMode === mode ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: viewMode === mode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.18s' }}
                  >
                    {mode === 'list' ? <><List size={13} /> List</> : <><Map size={13} /> Map</>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Results area ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 100px' }}>
        {fetchError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '12px', marginBottom: '20px', color: '#ff6b6b', fontSize: '13px' }}>
            <AlertCircle size={16} /> {fetchError}
          </div>
        )}

        {/* Empty state */}
        {!locationVal && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(109,145,151,0.1)', border: '1px solid rgba(109,145,151,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <MapPin size={24} color="#6d9197" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Enter your ZIP code</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', maxWidth: '380px', margin: '0 auto' }}>
              We pull from HRSA, NAFC, and community directories to find free and sliding-scale clinics near you.
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div>
            {/* Map skeleton if in map mode */}
            {viewMode === 'map' && (
              <div style={{ height: '340px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px', animation: 'skel-pulse 1.5s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Map size={28} color="rgba(255,255,255,0.1)" />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        )}

        {/* Map + list split view */}
        {!loading && results.length > 0 && viewMode === 'map' && geoCenter && (
          <div className="map-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
              {results.map((clinic, i) => (
                <ClinicCard
                  key={clinic.id}
                  clinic={clinic}
                  index={i}
                  isSaved={savedIds.has(String(clinic.id))}
                  saving={savingId === String(clinic.id)}
                  onBookmark={toggleBookmark}
                />
              ))}
            </div>
            <div style={{ height: '600px', position: 'sticky', top: '90px' }}>
              <MapPanel lat={geoCenter.lat} lng={geoCenter.lng} clinics={results} radius={radius} />
            </div>
          </div>
        )}

        {/* List view */}
        {!loading && results.length > 0 && viewMode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map((clinic, i) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                index={i}
                isSaved={savedIds.has(String(clinic.id))}
                saving={savingId === String(clinic.id)}
                onBookmark={toggleBookmark}
              />
            ))}
          </div>
        )}

        {/* No results */}
        {locationVal && !loading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)' }}>
            <Search size={32} style={{ marginBottom: '16px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>No clinics found near {locationVal}</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>Try a larger radius or remove the specialty filter</p>
          </div>
        )}

        {/* Footer info */}
        {results.length > 0 && (
          <div style={{ marginTop: '32px', padding: '16px 20px', background: 'rgba(109,145,151,0.05)', border: '1px solid rgba(109,145,151,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Stethoscope size={16} color="#6d9197" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>
              <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Results ranked by affordability.</strong>{' '}
              <span style={{ color: '#4ade80' }}>LIKELY FREE</span> = FQHCs (federally required free/sliding-scale) or NAFC free clinics ($0).{' '}
              <span style={{ color: '#60a5fa' }}>LOW COST</span> = income-based fees. Sources:{' '}
              <a href="https://findahealthcenter.hrsa.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#6d9197' }}>HRSA</a>,{' '}
              <a href="https://nafc.org" target="_blank" rel="noopener noreferrer" style={{ color: '#6d9197' }}>NAFC</a>,{' '}
              OpenStreetMap.
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes skel-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 700px) {
          .map-split { grid-template-columns: 1fr !important; }
          .search-bar-row > div:nth-child(2) { min-width: unset !important; flex: 1 !important; }
          .search-bar-row > div:nth-child(2) input { width: 100% !important; }
        }
        @media print {
          nav, .chat-widget, button, a[href]:not([href^="tel"]) { display: none !important; }
          body { background: white !important; color: black !important; }
          .clinic-card { border: 1px solid #ccc !important; background: white !important; page-break-inside: avoid; margin-bottom: 12px; }
          .clinic-card * { color: black !important; }
        }
      `}</style>
    </AppShell>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={28} color="rgba(255,255,255,0.3)" style={{ animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </AppShell>
    }>
      <SearchResults />
    </Suspense>
  )
}
