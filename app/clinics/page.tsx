'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import {
  Search, MapPin, Phone, ChevronRight,
  Filter, X, Loader2, ArrowRight, Building2,
  Heart, Baby, Brain, Eye, Pill, Stethoscope,
  Navigation, Zap,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type AffordabilityLabel = 'likely-free' | 'low-cost' | 'standard'

type Clinic = {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  distance: number | string
  services: string[]
  accepting: boolean
  sliding_scale: boolean
  free: boolean
  isFreeOrDiscounted?: boolean
  affordability_score?: number
  affordability_label?: AffordabilityLabel
  affordability_reasons?: string[]
  url?: string
  hours?: string
  type?: string
  lat?: number
  lng?: number
  languages?: string[]
}

type FilterState = {
  type: string
  accepting: boolean | null
  free: boolean | null
  slidingScale: boolean | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FEATURED_CITIES = [
  { city: 'Houston',     state: 'TX', emoji: '🌆' },
  { city: 'New York',    state: 'NY', emoji: '🗽' },
  { city: 'Los Angeles', state: 'CA', emoji: '🌴' },
  { city: 'Chicago',     state: 'IL', emoji: '🏙️' },
  { city: 'Phoenix',     state: 'AZ', emoji: '☀️' },
  { city: 'Miami',       state: 'FL', emoji: '🌊' },
  { city: 'Dallas',      state: 'TX', emoji: '⭐' },
  { city: 'Atlanta',     state: 'GA', emoji: '🍑' },
]

const CLINIC_TYPES = [
  { value: '',              label: 'All types'          },
  { value: 'FQHC',         label: 'FQHC'               },
  { value: 'Rural Health',  label: 'Rural Health Clinic'},
  { value: 'free_clinic',   label: 'Free Clinic'        },
]

const SERVICE_CATEGORIES = [
  { label: 'Primary Care',    icon: Stethoscope, keyword: 'primary' },
  { label: 'Mental Health',   icon: Brain,       keyword: 'mental'  },
  { label: "Women's Health",  icon: Heart,       keyword: 'women'   },
  { label: 'Pediatrics',      icon: Baby,        keyword: 'pediatric'},
  { label: 'Vision Care',     icon: Eye,         keyword: 'vision'  },
  { label: 'Pharmacy',        icon: Pill,        keyword: 'pharmacy'},
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function affordabilityColor(label?: AffordabilityLabel) {
  if (label === 'likely-free') return 'var(--green-pulse)'
  if (label === 'low-cost')    return 'var(--amber)'
  return 'var(--text-3)'
}

function affordabilityText(label?: AffordabilityLabel) {
  if (label === 'likely-free') return 'Free / Sliding scale'
  if (label === 'low-cost')    return 'Low cost'
  return 'Standard fees'
}

function clinicMatchesService(clinic: Clinic, keyword: string): boolean {
  const hay = [...clinic.services, clinic.type ?? '', clinic.name].join(' ').toLowerCase()
  return hay.includes(keyword.toLowerCase())
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ClinicRow({ clinic }: { clinic: Clinic }) {
  return (
    <Link
      href={`/clinics/${clinic.id}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '16px 20px', borderRadius: '14px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        textDecoration: 'none', transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.background = 'rgba(74,144,217,0.05)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,144,217,0.18)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
      }}
    >
      {/* Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: '12px',
        background: 'rgba(74,144,217,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Building2 size={18} color="var(--accent)" />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px', fontWeight: 600, color: 'var(--text)',
          fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '3px',
        }}>
          {clinic.name}
        </div>
        <div style={{
          fontSize: '12px', color: 'var(--text-2)',
          fontFamily: 'var(--font-inter)', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <MapPin size={11} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {clinic.address}, {clinic.city}, {clinic.state}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {clinic.affordability_label && (
          <span style={{
            fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px',
            fontFamily: 'var(--font-inter)',
            background: `color-mix(in srgb, ${affordabilityColor(clinic.affordability_label)} 12%, transparent)`,
            color: affordabilityColor(clinic.affordability_label),
            border: `1px solid color-mix(in srgb, ${affordabilityColor(clinic.affordability_label)} 25%, transparent)`,
          }}>
            {affordabilityText(clinic.affordability_label)}
          </span>
        )}
        {clinic.accepting && (
          <span style={{
            fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px',
            fontFamily: 'var(--font-inter)',
            background: 'rgba(74,222,128,0.08)', color: 'var(--green-pulse)',
            border: '1px solid rgba(74,222,128,0.18)',
          }}>
            Accepting
          </span>
        )}
        {clinic.phone && (
          <a
            href={`tel:${clinic.phone.replace(/\D/g, '')}`}
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 10px', borderRadius: '8px',
              background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.15)',
              color: 'var(--accent)', fontSize: '11px', fontWeight: 600,
              fontFamily: 'var(--font-inter)', textDecoration: 'none',
            }}
          >
            <Phone size={11} />
            Call
          </a>
        )}
        <ChevronRight size={14} color="var(--text-3)" />
      </div>
    </Link>
  )
}

function ClinicSkeleton() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '16px 20px', borderRadius: '14px',
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ height: 14, width: '55%', borderRadius: '6px', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ height: 12, width: '75%', borderRadius: '6px', background: 'rgba(255,255,255,0.04)' }} />
      </div>
      <div style={{ width: 80, height: 24, borderRadius: '20px', background: 'rgba(255,255,255,0.04)' }} />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClinicsPage() {
  const [query,        setQuery]        = useState('')
  const [clinics,      setClinics]      = useState<Clinic[]>([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [hasSearched,  setHasSearched]  = useState(false)
  const [totalCount,   setTotalCount]   = useState(0)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    type: '', accepting: null, free: null, slidingScale: null,
  })
  const [showFilters, setShowFilters] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // ── Search ──────────────────────────────────────────────────────────────────
  async function runSearch(overrideQuery?: string) {
    const q = (overrideQuery ?? query).trim()
    if (!q) return

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const params = new URLSearchParams({ location: q, radius: '25' })
      if (filters.type)         params.set('type',         filters.type)
      if (filters.accepting)    params.set('accepting',    'true')
      if (filters.free)         params.set('free',         'true')
      if (filters.slidingScale) params.set('slidingScale', 'true')

      const res  = await fetch(`/api/clinics?${params}`, { signal: ac.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as { clinics?: Clinic[]; total?: number }
      const list = json.clinics ?? []
      setClinics(list)
      setTotalCount(json.total ?? list.length)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Search failed. Please try again.')
      setClinics([])
    } finally {
      setLoading(false)
    }
  }

  // ── Client-side filtering (type, toggles, service keyword) ─────────────────
  const displayed = clinics.filter(c => {
    if (filters.accepting    && !c.accepting)    return false
    if (filters.free         && !c.free)         return false
    if (filters.slidingScale && !c.sliding_scale) return false
    if (filters.type && c.type !== filters.type) return false
    if (selectedService && !clinicMatchesService(c, selectedService)) return false
    return true
  })

  // ── Cmd+K focuses search ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Service tile handler ────────────────────────────────────────────────────
  function handleServiceTile(keyword: string, label: string) {
    // Toggle: clicking the same tile again clears the service filter
    if (selectedService === keyword) {
      setSelectedService(null)
      return
    }
    setSelectedService(keyword)
    // If there are already results, filter them immediately; otherwise focus input
    if (!hasSearched) {
      inputRef.current?.focus()
      inputRef.current?.setAttribute(
        'placeholder',
        `Enter your city to find ${label} clinics…`,
      )
    }
  }

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-inter)' }}>

        {/* ── Hero banner ──────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(74,144,217,0.06) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '60px 24px 48px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', borderRadius: '20px',
              background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.18)',
              color: 'var(--accent)', fontSize: '12px', fontWeight: 600,
              marginBottom: '20px', letterSpacing: '0.04em', textTransform: 'uppercase' as const,
            }}>
              <MapPin size={12} />
              Clinic Directory
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: 'var(--text)',
              letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '14px',
            }}>
              Find affordable care<br />
              <span style={{ color: 'var(--accent)' }}>near you</span>
            </h1>

            <p style={{ fontSize: '16px', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '32px' }}>
              Search thousands of federally qualified health centers, rural health
              clinics, and free clinics across the United States.
            </p>

            {/* Selected service chip */}
            {selectedService && (
              <div style={{
                display: 'flex', justifyContent: 'center', marginBottom: '12px',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                  background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.25)',
                  color: 'var(--accent)', fontFamily: 'var(--font-inter)',
                }}>
                  Filtering by: {SERVICE_CATEGORIES.find(s => s.keyword === selectedService)?.label}
                  <button
                    onClick={() => setSelectedService(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', display: 'flex', padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                </span>
              </div>
            )}

            {/* Search bar */}
            <div style={{ display: 'flex', gap: '10px', maxWidth: 560, margin: '0 auto' }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                padding: '0 16px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-hi)',
              }}>
                <Search size={16} color="var(--text-3)" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="City, state or ZIP code…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runSearch()}
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    color: 'var(--text)', fontSize: '14px', fontFamily: 'var(--font-inter)',
                    padding: '14px 0',
                  }}
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); setClinics([]); setHasSearched(false) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => runSearch()}
                disabled={!query.trim() || loading}
                style={{
                  padding: '0 24px', borderRadius: '14px',
                  background: 'var(--accent)', border: 'none', color: '#fff',
                  fontSize: '14px', fontWeight: 700,
                  cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
                  opacity: query.trim() && !loading ? 1 : 0.5,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'opacity 0.15s', fontFamily: 'var(--font-inter)',
                }}
              >
                {loading
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Search size={16} />
                }
                Search
              </button>
            </div>

            {/* Featured cities */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
              {FEATURED_CITIES.map(({ city, state, emoji }) => (
                <button
                  key={`${city}-${state}`}
                  onClick={() => { setQuery(`${city}, ${state}`); runSearch(`${city}, ${state}`) }}
                  style={{
                    padding: '6px 14px', borderRadius: '20px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-2)', fontSize: '12px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'var(--font-inter)', transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLElement).style.background = 'rgba(74,144,217,0.08)'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--accent)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--text-2)'
                  }}
                >
                  {emoji} {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Service categories (pre-search landing) ───────────────────────── */}
        <div style={{ maxWidth: 900, margin: '48px auto', padding: '0 24px' }}>
          <h2 style={{
            fontSize: '18px', fontWeight: 700, color: 'var(--text)',
            letterSpacing: '-0.02em', marginBottom: '20px',
          }}>
            Browse by service
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {SERVICE_CATEGORIES.map(({ label, icon: Icon, keyword }) => {
              const active = selectedService === keyword
              return (
                <button
                  key={label}
                  onClick={() => handleServiceTile(keyword, label)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: '10px',
                    padding: '20px 16px', borderRadius: '14px',
                    background: active ? 'rgba(74,144,217,0.10)' : 'rgba(255,255,255,0.02)',
                    border: active ? '1px solid rgba(74,144,217,0.28)' : '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      ;(e.currentTarget as HTMLElement).style.background = 'rgba(74,144,217,0.06)'
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,144,217,0.18)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                    }
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '12px',
                    background: active ? 'rgba(74,144,217,0.18)' : 'rgba(74,144,217,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color="var(--accent)" />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text-2)' }}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Prompt when service selected but no search yet */}
          {selectedService && !hasSearched && (
            <div style={{
              marginTop: '16px', padding: '14px 18px', borderRadius: '12px',
              background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.14)',
              fontSize: '13px', color: 'var(--accent)', fontFamily: 'var(--font-inter)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Search size={14} />
              Now enter your city or ZIP above to find{' '}
              <strong>{SERVICE_CATEGORIES.find(s => s.keyword === selectedService)?.label}</strong> clinics near you.
            </div>
          )}

          {/* Advanced search CTA */}
          {!hasSearched && (
            <div style={{
              marginTop: '48px', padding: '32px', borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(74,144,217,0.08), rgba(74,144,217,0.03))',
              border: '1px solid rgba(74,144,217,0.14)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '24px', flexWrap: 'wrap' as const,
            }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.02em' }}>
                  Need a more targeted search?
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.6 }}>
                  Use our advanced search to filter by insurance, language, services, and more.
                </div>
              </div>
              <Link
                href="/search"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '12px',
                  background: 'var(--accent)', color: '#fff',
                  fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                  fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' as const,
                }}
              >
                Advanced search
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* ── Results ──────────────────────────────────────────────────────────── */}
        {hasSearched && (
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 64px' }}>

            {/* Results header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '20px', flexWrap: 'wrap' as const, gap: '12px',
            }}>
              <div>
                {loading ? (
                  <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>Searching…</span>
                ) : error ? (
                  <span style={{ fontSize: '14px', color: 'var(--coral)' }}>{error}</span>
                ) : (
                  <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>
                    <strong style={{ color: 'var(--text)' }}>{displayed.length}</strong>
                    {displayed.length !== totalCount && ` of ${totalCount}`} clinics found
                    {query && <> near <strong style={{ color: 'var(--text)' }}>{query}</strong></>}
                    {selectedService && (
                      <> · filtered by <strong style={{ color: 'var(--accent)' }}>
                        {SERVICE_CATEGORIES.find(s => s.keyword === selectedService)?.label}
                      </strong></>
                    )}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setShowFilters(f => !f)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '10px',
                    background: showFilters ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.04)',
                    border: showFilters ? '1px solid rgba(74,144,217,0.25)' : '1px solid rgba(255,255,255,0.08)',
                    color: showFilters ? 'var(--accent)' : 'var(--text-2)',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter)',
                  }}
                >
                  <Filter size={13} />
                  Filters
                </button>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '10px',
                    background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.18)',
                    color: 'var(--accent)', fontSize: '13px', fontWeight: 600,
                    textDecoration: 'none', fontFamily: 'var(--font-inter)',
                  }}
                >
                  <Navigation size={13} />
                  Map view
                </Link>
              </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div style={{
                padding: '18px 20px', borderRadius: '14px', marginBottom: '16px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: '12px', flexWrap: 'wrap' as const, alignItems: 'center',
              }}>
                {/* Clinic type chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                  {CLINIC_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setFilters(f => ({ ...f, type: f.type === value ? '' : value }))}
                      style={{
                        padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'var(--font-inter)',
                        background: filters.type === value ? 'rgba(74,144,217,0.15)' : 'rgba(255,255,255,0.04)',
                        border: filters.type === value ? '1px solid rgba(74,144,217,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        color: filters.type === value ? 'var(--accent)' : 'var(--text-2)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)' }} />

                {/* Boolean toggle chips */}
                {([
                  { key: 'accepting'   as const, label: 'Accepting patients' },
                  { key: 'free'        as const, label: 'Free care'          },
                  { key: 'slidingScale'as const, label: 'Sliding scale'      },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilters(f => ({ ...f, [key]: f[key] ? null : true }))}
                    style={{
                      padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-inter)',
                      background: filters[key] ? 'rgba(74,222,128,0.10)' : 'rgba(255,255,255,0.04)',
                      border: filters[key] ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(255,255,255,0.08)',
                      color: filters[key] ? 'var(--green-pulse)' : 'var(--text-2)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Clinic list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <ClinicSkeleton key={i} />)
              ) : error ? (
                <div style={{
                  textAlign: 'center', padding: '48px 24px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚠️</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                    Search failed
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '20px' }}>{error}</div>
                  <button
                    onClick={() => runSearch()}
                    style={{
                      padding: '10px 22px', borderRadius: '10px',
                      background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)',
                      color: 'var(--accent)', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Try again
                  </button>
                </div>
              ) : displayed.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '48px 24px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>🔍</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                    No clinics found
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '20px' }}>
                    Try a different city, expand your search radius, or adjust your filters.
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
                    <button
                      onClick={() => {
                        setFilters({ type: '', accepting: null, free: null, slidingScale: null })
                        setSelectedService(null)
                      }}
                      style={{
                        padding: '10px 22px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-2)', fontSize: '13px', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Clear filters
                    </button>
                    <Link
                      href="/search"
                      style={{
                        padding: '10px 22px', borderRadius: '10px',
                        background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)',
                        color: 'var(--accent)', fontSize: '13px', fontWeight: 600,
                        fontFamily: 'var(--font-inter)', textDecoration: 'none',
                      }}
                    >
                      Advanced search
                    </Link>
                  </div>
                </div>
              ) : (
                displayed.map(clinic => <ClinicRow key={clinic.id} clinic={clinic} />)
              )}
            </div>

            {/* View on map link */}
            {!loading && displayed.length > 0 && (
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '12px 28px', borderRadius: '12px',
                    background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.18)',
                    color: 'var(--accent)', fontSize: '14px', fontWeight: 700,
                    textDecoration: 'none', fontFamily: 'var(--font-inter)',
                  }}
                >
                  View on map &amp; advanced filters
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AppShell>
  )
}
