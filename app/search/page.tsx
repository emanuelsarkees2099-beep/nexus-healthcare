'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useRef, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import AffordabilityBar from '@/components/AffordabilityBar'
import EmergencyEscalation from '@/components/EmergencyEscalation'
import { createClientClient } from '@/lib/auth-client'
import {
  Search, MapPin, Phone, Globe, ChevronRight, X, Stethoscope,
  Heart, Brain, Eye, Pill, Baby, Bookmark, BookmarkCheck,
  AlertCircle, Loader2, Map, List, Printer, Navigation,
  Clock, Wifi, WifiOff, SlidersHorizontal, Zap, ArrowRight,
} from 'lucide-react'

/* ── Types ────────────────────────────────────────────────────────── */

type AffordabilityLabel = 'likely-free' | 'low-cost' | 'standard'
type Clinic = {
  id: string; name: string; address: string; city: string; state: string
  zip: string; phone: string; distance: number | string; services: string[]
  accepting: boolean; sliding_scale: boolean; free: boolean; url?: string; hours?: string; type?: string
  affordability_score?: number; affordability_label?: AffordabilityLabel
  affordability_reasons?: string[]; isFreeOrDiscounted?: boolean
  lat?: number; lng?: number
}

/* ── Semantic intent detection — no AI, pure pattern matching ─────── */
function detectIntent(q: string): { specialty?: string; freeOnly?: boolean; openNow?: boolean; language?: string; accessibility?: boolean } {
  const t = q.toLowerCase()
  const intent: ReturnType<typeof detectIntent> = {}
  if (/\bfree\b/.test(t))                                             intent.freeOnly = true
  if (/open\s*now|open\s*today|tonight|right now/.test(t))           intent.openNow  = true
  if (/spanish|español|habla/.test(t))                               intent.language = 'Spanish'
  if (/wheelchair|accessible|disability|ada/.test(t))                intent.accessibility = true
  if (/mental\s*health|therapist|counselor|psych|anxiety|depress/.test(t)) intent.specialty = 'mental'
  if (/dental|dentist|tooth|teeth/.test(t))                         intent.specialty = 'dental'
  if (/pediatric|child|kids|infant|baby/.test(t))                   intent.specialty = 'pediatrics'
  if (/vision|eye|optom/.test(t))                                   intent.specialty = 'vision'
  if (/\bwomen\b|obgyn|ob-gyn|gynec|prenatal|pregnancy/.test(t))   intent.specialty = 'womens'
  if (/primary\s*care|doctor|physician|pcp|family\s*med/.test(t))  intent.specialty = 'primary'
  return intent
}

/* ── Open-now parser — checks clinic hours string vs current time ──── */
function isOpenNow(hours?: string): boolean | null {
  if (!hours) return null
  const now     = new Date()
  const dayIdx  = now.getDay() // 0=Sun … 6=Sat
  const hourNow = now.getHours() + now.getMinutes() / 60
  const days    = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const today   = days[dayIdx]
  const lower   = hours.toLowerCase()

  /* Quick heuristic — look for today abbreviation next to a time range */
  const dayMatch = new RegExp(`${today}[^0-9]*?(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?\\s*[-–]\\s*(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?`)
  const m = lower.match(dayMatch)
  if (!m) {
    /* Fallback: "Mon-Fri" or "M-F" patterns */
    const mf = lower.match(/(?:mon|m)[\w\s-]*?(?:fri|f)[^0-9]*(\\d{1,2})\s*(?:am|pm)?\s*[-–]\s*(\\d{1,2})\s*(am|pm)?/)
    if (!mf && (dayIdx >= 1 && dayIdx <= 5)) {
      const generic = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/)
      if (generic) {
        const open  = parseHour(parseInt(generic[1]), generic[2], generic[3])
        const close = parseHour(parseInt(generic[4]), generic[5], generic[6])
        return hourNow >= open && hourNow < close
      }
    }
    return null
  }
  const open  = parseHour(parseInt(m[1]), m[2], m[3])
  const close = parseHour(parseInt(m[4]), m[5], m[6])
  return hourNow >= open && hourNow < close
}

function parseHour(h: number, mins: string | undefined, ampm: string | undefined): number {
  let hour = h
  if (ampm === 'pm' && hour !== 12) hour += 12
  if (ampm === 'am' && hour === 12) hour = 0
  return hour + (mins ? parseInt(mins) / 60 : 0)
}

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

/* ── Skeleton card ────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '20px 24px', display: 'flex', gap: '16px' }}>
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

/* ── Map panel ────────────────────────────────────────────────────── */
function MapPanel({ lat, lng, clinics, radius }: { lat: number; lng: number; clinics: Clinic[]; radius: string }) {
  const deg  = (parseInt(radius) * 1.1) / 69
  const bbox = `${lng - deg},${lat - deg},${lng + deg},${lat + deg}`
  const iframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
      <iframe
        src={iframeUrl} width="100%" height="100%"
        style={{ border: 'none', display: 'block', filter: 'invert(0.92) hue-rotate(200deg) saturate(0.75)' }}
        title="Clinic map" loading="lazy" allowFullScreen
      />
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(8,13,26,0.92)', border: '1px solid var(--border)', borderRadius: '10px', padding: '7px 12px', backdropFilter: 'blur(12px)', fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)' }}>
        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{clinics.length}</span> clinics within {radius} mi
      </div>
      <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(8,13,26,0.88)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', textDecoration: 'none', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
      >
        <Navigation size={10} /> Open in maps
      </a>
    </div>
  )
}

/* ── Clinic card ──────────────────────────────────────────────────── */
function ClinicCard({ clinic, index, isSaved, saving, onBookmark, openNowFilter }: {
  clinic: Clinic; index: number;
  isSaved: boolean; saving: boolean;
  onBookmark: (c: Clinic) => void
  openNowFilter: boolean
}) {
  const openStatus = isOpenNow(clinic.hours)
  if (openNowFilter && openStatus === false) return null

  const score  = clinic.affordability_score ?? (clinic.free ? 95 : clinic.sliding_scale ? 72 : 40)
  const aLabel: AffordabilityLabel = clinic.affordability_label ?? (clinic.free ? 'likely-free' : clinic.sliding_scale ? 'low-cost' : 'standard')

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name} ${clinic.address} ${clinic.city} ${clinic.state}`)}`

  return (
    <div
      className="clinic-card"
      style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}
    >
      {/* Rank badge */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: index === 0 ? 'rgba(110,231,183,0.10)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${index === 0 ? 'rgba(110,231,183,0.20)' : 'rgba(255,255,255,0.07)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 600,
        color: index === 0 ? 'var(--accent)' : 'var(--text-3)',
        fontFamily: 'var(--font-mono),monospace',
        flexShrink: 0,
      }}>
        {index + 1}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link
              href={`/clinics/${clinic.id}`}
              style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', textDecoration: 'none', fontFamily: 'var(--font-sora)', display: 'block', marginBottom: '4px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
            >
              {clinic.name}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-3)' }}>
              <MapPin size={11} color="var(--text-3)" />
              {[clinic.address, clinic.city, clinic.state].filter(Boolean).join(', ') || 'Address unavailable'}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
            <button
              onClick={() => onBookmark(clinic)}
              disabled={saving}
              style={{
                background: isSaved ? 'rgba(110,231,183,0.10)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isSaved ? 'rgba(110,231,183,0.25)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px', padding: '7px', cursor: 'pointer',
                color: isSaved ? 'var(--accent)' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', transition: 'all 0.18s',
              }}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark clinic'}
            >
              {saving ? <Loader2 size={14} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> : isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
            {clinic.phone && (
              <a href={`tel:${clinic.phone}`} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'rgba(110,231,183,0.07)', border: '1px solid rgba(110,231,183,0.15)',
                borderRadius: '8px', padding: '7px 12px', fontSize: '12px',
                color: 'var(--accent)', textDecoration: 'none', fontWeight: 600,
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(110,231,183,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(110,231,183,0.07)')}
              >
                <Phone size={12} /> Call
              </a>
            )}
            <a
              href={clinic.url ? (clinic.url.startsWith('http') ? clinic.url : `https://${clinic.url}`) : googleMapsUrl}
              target="_blank" rel="noopener noreferrer"
              style={{
                background: 'var(--accent)', color: 'var(--bg)',
                borderRadius: '9px', padding: '8px 14px', fontSize: '12px',
                fontWeight: 700, textDecoration: 'none', display: 'flex',
                alignItems: 'center', gap: '5px',
              }}
            >
              {clinic.url ? <><Globe size={12} /> Visit</> : <><Navigation size={12} /> Directions</>}
            </a>
          </div>
        </div>

        {/* Status pills row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '12px', alignItems: 'center' }}>
          {/* Open now indicator */}
          {openStatus === true && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--green-pulse)', fontFamily: 'var(--font-inter)', fontWeight: 600 }}>
              <div className="open-pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green-pulse)' }} />
              Open now
            </span>
          )}
          {openStatus === false && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
              <Clock size={11} /> Closed
            </span>
          )}
          {clinic.accepting && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-inter)', fontWeight: 500 }}>
              <Zap size={11} /> Accepting patients
            </span>
          )}
          {clinic.distance && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-mono),monospace' }}>
              <MapPin size={11} /> {clinic.distance} mi
            </span>
          )}
          {clinic.phone && (
            <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-mono),monospace' }}>
              {clinic.phone}
            </span>
          )}
          {clinic.type && (
            <span style={{
              fontSize: '10px', letterSpacing: '0.06em',
              color: clinic.type === 'FQHC' ? 'var(--accent)' : clinic.type?.includes('Free') ? 'var(--green-pulse)' : 'var(--text-3)',
              background: clinic.type === 'FQHC' ? 'rgba(110,231,183,0.07)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${clinic.type === 'FQHC' ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.08)'}`,
              padding: '2px 8px', borderRadius: '5px', fontFamily: 'var(--font-inter)', fontWeight: 600,
            }}>
              {clinic.type}
            </span>
          )}
        </div>

        {/* Affordability bar */}
        <div style={{ marginBottom: '10px' }}>
          <AffordabilityBar score={score} label={aLabel} reasons={clinic.affordability_reasons} compact />
        </div>

        {/* Services */}
        {clinic.services?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {clinic.services.slice(0, 5).map(s => (
              <span key={s} style={{
                fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                padding: '3px 9px', borderRadius: '5px',
              }}>
                {s}
              </span>
            ))}
            {clinic.services.length > 5 && (
              <span style={{ fontSize: '11px', color: 'var(--text-3)', padding: '3px 6px', fontFamily: 'var(--font-inter)' }}>
                +{clinic.services.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Detail page link */}
        <div style={{ marginTop: '10px' }}>
          <Link
            href={`/clinics/${clinic.id}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-3)', textDecoration: 'none', fontFamily: 'var(--font-inter)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            View full details <ArrowRight size={10} />
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Intent banner ────────────────────────────────────────────────── */
function IntentBanner({ intent, onApplySpecialty }: { intent: ReturnType<typeof detectIntent>; onApplySpecialty: (s: string) => void }) {
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
      background: 'rgba(110,231,183,0.04)', border: '1px solid rgba(110,231,183,0.12)',
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

function SearchResults() {
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
  const [intent,        setIntent]        = useState<ReturnType<typeof detectIntent>>({})

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
      if (!token) return
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
      localStorage.setItem('nexus_zip', loc)
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
                  placeholder='Symptom, specialty, or "free dental phoenix"…'
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
                  placeholder="ZIP or city…"
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
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px 0' }}>

        {/* Intent banner */}
        <IntentBanner intent={intent} onApplySpecialty={setActiveFilter} />

        {/* Specialty filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
          {SPECIALTY_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 13px', borderRadius: '100px',
                fontSize: '12px', fontFamily: 'var(--font-inter),sans-serif', cursor: 'pointer',
                transition: 'all 0.18s',
                background: activeFilter === f.id ? 'rgba(110,231,183,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeFilter === f.id ? 'rgba(110,231,183,0.30)' : 'rgba(255,255,255,0.07)'}`,
                color: activeFilter === f.id ? 'var(--accent)' : 'var(--text-3)',
                fontWeight: activeFilter === f.id ? 600 : 400,
              }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  background: radius === r.value ? 'rgba(110,231,183,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${radius === r.value ? 'rgba(110,231,183,0.28)' : 'rgba(255,255,255,0.07)'}`,
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
                background: openNowFilter ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${openNowFilter ? 'rgba(52,211,153,0.30)' : 'rgba(255,255,255,0.07)'}`,
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
                      background: viewMode === mode ? 'rgba(110,231,183,0.10)' : 'transparent',
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

        {/* Status */}
        <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontFamily: 'var(--font-inter)' }}>
          {loading ? 'Searching…' : `${visibleCount} clinic${visibleCount !== 1 ? 's' : ''} ${locationVal ? `near ${locationVal}` : '— enter a ZIP to search'}`}
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

        {/* Empty state */}
        {!locationVal && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <MapPin size={24} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', fontFamily: 'var(--font-sora)' }}>
              Enter your ZIP code
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: '14px', maxWidth: '380px', margin: '0 auto 24px', fontFamily: 'var(--font-inter)' }}>
              We pull from HRSA, NAFC, and community directories to find free and sliding-scale clinics near you.
            </p>
            <EmergencyEscalation />
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
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
                />
              ))}
            </div>
            <div style={{ height: '600px', position: 'sticky', top: '130px' }}>
              <MapPanel lat={geoCenter.lat} lng={geoCenter.lng} clinics={results} radius={radius} />
            </div>
          </div>
        )}

        {/* List view */}
        {!loading && results.length > 0 && viewMode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map((clinic, i) => (
              <ClinicCard key={clinic.id} clinic={clinic} index={i}
                isSaved={savedIds.has(String(clinic.id))} saving={savingId === String(clinic.id)}
                onBookmark={toggleBookmark} openNowFilter={openNowFilter}
              />
            ))}
          </div>
        )}

        {/* No results state */}
        {locationVal && !loading && visibleCount === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Search size={22} color="var(--coral)" />
            </div>
            <p style={{ fontSize: '15px', color: 'var(--text-2)', marginBottom: '6px', fontFamily: 'var(--font-sora)', fontWeight: 600 }}>
              No clinics found near {locationVal}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', marginBottom: '24px' }}>
              Try a larger radius or remove the specialty filter
            </p>
            <EmergencyEscalation />
          </div>
        )}

        {/* Footer info */}
        {results.length > 0 && (
          <div style={{
            marginTop: '32px', padding: '14px 18px',
            background: 'rgba(110,231,183,0.04)', border: '1px solid rgba(110,231,183,0.12)',
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
      `}</style>
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
