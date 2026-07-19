'use client'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/components/I18nContext'
import { SearchNormal1, Location, Gps } from 'iconsax-react'
import TypeaheadList, { type TypeaheadItem } from '@/components/ui/TypeaheadList'
import { suggestCare } from '@/lib/care-suggest'

// U2 — Typeahead suggestion pool
const TYPEAHEAD_POOL = [
  'Primary care', 'Dental', 'Mental health', "Women's health", 'Pediatrics',
  'Vision', 'Vaccination', 'Urgent care', 'Telehealth', 'Walk-in clinic',
  'Free dental', 'Free mental health', 'Free urgent care', 'Free primary care',
  'Medicaid enrollment', 'Sliding scale', 'FQHC near me',
  'Insulin assistance', 'Prescription help', 'Ryan White', 'CHIP eligibility',
  'Community health center', 'Free clinic', 'No insurance needed',
  'Spanish-speaking doctor', 'Bilingual clinic', 'Accessible clinic',
  'Prenatal care', 'OB/GYN', 'Cardiology', 'Dermatology', 'Psychiatry',
]

interface SearchBarProps {
  searchVal: string
  setSearchVal: (v: string) => void
  locationVal: string
  setLocationVal: (v: string) => void
  onSearch: () => void
  placeholder: string
  inputRef: React.RefObject<HTMLInputElement | null>
  ctaBtnRef: React.RefObject<HTMLButtonElement | null>
}

export default function SearchBar({
  searchVal, setSearchVal,
  locationVal, setLocationVal,
  onSearch, placeholder,
  inputRef, ctaBtnRef,
}: SearchBarProps) {
  const { t } = useI18n()
  const locationRef   = useRef<HTMLInputElement>(null)
  const suggestRef    = useRef<HTMLDivElement>(null)
  const [editingLoc, setEditingLoc]         = useState(false)
  const [suggestions, setSuggestions]       = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionIdx, setSuggestionIdx]   = useState(-1)

  /* Location typeahead — cities/states/ZIPs from /api/places */
  const [locItems, setLocItems] = useState<TypeaheadItem[]>([])
  const [locOpen,  setLocOpen]  = useState(false)
  const [locIdx,   setLocIdx]   = useState(-1)
  const locTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onLocChange = (val: string) => {
    setLocationVal(val)
    setLocIdx(-1)
    if (locTimer.current) clearTimeout(locTimer.current)
    const q = val.trim()
    if (q.length < 2) { setLocItems([]); setLocOpen(false); return }
    locTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`)
        if (!res.ok) return
        const data = await res.json() as { suggestions?: Array<{ label: string; value: string; type: 'city' | 'state' | 'zip' }> }
        const items: TypeaheadItem[] = (data.suggestions ?? [])
          .filter(s => s.value.toLowerCase() !== q.toLowerCase())
          .map(s => ({ label: s.label, value: s.value, kind: s.type }))
        setLocItems(items)
        if (items.length > 0) { setLocOpen(true); setShowSuggestions(false) }
        else setLocOpen(false)
      } catch { /* offline */ }
    }, 180)
  }

  const pickLoc = (item: TypeaheadItem) => {
    setLocationVal(item.value)
    try { localStorage.setItem('nexus_location', item.value) } catch { /* private */ }
    setLocOpen(false)
    setLocIdx(-1)
  }

  /* â”€â”€ Typeahead: instant static filter + 300ms debounced API suggestions â”€â”€ */
  useEffect(() => {
    const q = searchVal.trim().toLowerCase()
    if (!q) { setSuggestions([]); setShowSuggestions(false); return }

    // Canonical care categories first — handles messy queries like
    // "pediatrics near me" → "Pediatrics" that substring matching misses
    const canon = suggestCare(searchVal).map(c => c.label).filter(l => l.toLowerCase() !== q)
    // Then instant static matches
    const starts   = TYPEAHEAD_POOL.filter(s => s.toLowerCase().startsWith(q) && s.toLowerCase() !== q)
    const contains = TYPEAHEAD_POOL.filter(s => !s.toLowerCase().startsWith(q) && s.toLowerCase().includes(q) && s.toLowerCase() !== q)
    const staticMatches = [...new Set([...canon, ...starts, ...contains])].slice(0, 5)

    setSuggestions(staticMatches)
    setShowSuggestions(staticMatches.length > 0)
    setSuggestionIdx(-1)

    // Debounced API call — real clinic names from the clinics endpoint
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ query: searchVal.trim(), limit: '4' })
        if (locationVal.trim()) params.set('location', locationVal.trim())
        const res = await fetch(`/api/clinics?${params.toString()}`)
        if (!res.ok) return
        const data = await res.json()
        const apiNames: string[] = (data.clinics ?? [])
          .map((c: { name?: string }) => c.name)
          .filter((n: string | undefined): n is string => !!n && n.toLowerCase() !== q)
          .slice(0, 3)

        if (apiNames.length > 0) {
          setSuggestions(prev => {
            // Merge: static first, then any API names not already in list
            const combined = [...prev]
            for (const name of apiNames) {
              if (!combined.some(s => s.toLowerCase() === name.toLowerCase())) {
                combined.push(name)
              }
            }
            return combined.slice(0, 7)
          })
          setShowSuggestions(true)
        }
      } catch { /* silently ignore — static suggestions still show */ }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchVal, locationVal])

  /* Close on outside click */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSuggestionIdx(i => Math.min(i + 1, suggestions.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSuggestionIdx(i => Math.max(i - 1, -1))
        return
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false)
        setSuggestionIdx(-1)
        return
      }
      if (e.key === 'Enter' && suggestionIdx >= 0) {
        e.preventDefault()
        setSearchVal(suggestions[suggestionIdx])
        setShowSuggestions(false)
        return
      }
    }
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className="search-bar-root">
      {/* Glow ring — vital gradient halo on focus */}
      <div className="search-glow-ring" style={{
        position: 'absolute', inset: '-2px', borderRadius: '17px',
        background: 'linear-gradient(135deg, rgba(79,142,240,0.45), rgba(106, 166, 255,0.35))',
        opacity: 0, transition: 'opacity 0.4s',
        zIndex: 0, pointerEvents: 'none', filter: 'blur(1px)',
      }} />

      {/* Search row */}
      <div
        role="search"
        className="search-inner"
        style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center',
          background: 'rgba(10,12,16,0.92)',
          border: '1px solid rgba(79,142,240,0.24)',
          borderRadius: 'var(--r-md)',
          padding: '7px 7px 7px 18px', gap: '10px',
          backdropFilter: 'blur(20px)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
          boxShadow: '0 4px 24px rgba(0,0,0,0.30)',
        }}
        onFocusCapture={e => {
          const w = e.currentTarget
          w.style.borderColor = 'rgba(74,144,217,0.55)'
          w.style.boxShadow = '0 0 0 1px rgba(74,144,217,0.22), 0 8px 36px rgba(0,0,0,0.40)'
          const glow = w.previousElementSibling as HTMLElement
          if (glow) {
            glow.style.opacity = '1'
            glow.classList.remove('search-pulse-ring')
            void glow.offsetWidth
            glow.classList.add('search-pulse-ring')
          }
        }}
        onBlurCapture={e => {
          const w = e.currentTarget
          w.style.borderColor = 'rgba(74,144,217,0.22)'
          w.style.boxShadow = '0 4px 24px rgba(0,0,0,0.30)'
          const glow = w.previousElementSibling as HTMLElement
          if (glow) {
            glow.style.opacity = '0'
            glow.classList.remove('search-pulse-ring')
          }
        }}
      >
        {/* Query row: icon + input together so they stay horizontal when the outer flex stacks */}
        <div className="search-query-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <SearchNormal1 aria-hidden="true" size={18} color="var(--accent)" variant="Linear" style={{ flexShrink: 0, opacity: 0.5 }} />
          <label htmlFor="main-search" className="sr-only">Search for free healthcare near you</label>
          <input
            ref={inputRef}
            id="main-search"
            type="search"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            aria-label="Search for free healthcare near you"
            aria-autocomplete="list"
            aria-controls={showSuggestions ? 'search-suggestions' : undefined}
            aria-activedescendant={suggestionIdx >= 0 ? `suggestion-${suggestionIdx}` : undefined}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontFamily: 'var(--font-inter)',
              fontSize: '15px', fontWeight: 400, padding: '9px 0', cursor: 'text',
              minWidth: 0,
            }}
          />
        </div>

        {/* Divider */}
        <div className="search-divider" style={{ width: '1px', height: '26px', background: 'var(--border2)', flexShrink: 0 }} aria-hidden="true" />

        {/* Location input */}
        <div
          className="search-loc-wrap"
          style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0, padding: '0 4px' }}
          onClick={() => { setEditingLoc(true); setTimeout(() => locationRef.current?.focus(), 50) }}
        >
          <Location aria-hidden="true" size={12} color="var(--accent)" variant="Linear" style={{ flexShrink: 0, opacity: 0.6 }} />
          <input
            ref={locationRef}
            value={locationVal}
            onChange={e => onLocChange(e.target.value)}
            onFocus={() => setEditingLoc(true)}
            onBlur={() => { setEditingLoc(false); setTimeout(() => setLocOpen(false), 120) }}
            onKeyDown={e => {
              if (locOpen && locItems.length > 0) {
                if (e.key === 'ArrowDown') { e.preventDefault(); setLocIdx(i => Math.min(i + 1, locItems.length - 1)); return }
                if (e.key === 'ArrowUp')   { e.preventDefault(); setLocIdx(i => Math.max(i - 1, -1)); return }
                if (e.key === 'Escape')    { setLocOpen(false); return }
                if (e.key === 'Enter' && locIdx >= 0) { e.preventDefault(); pickLoc(locItems[locIdx]); return }
              }
              if (e.key === 'Enter') onSearch()
            }}
            placeholder={t('home.hero.zipPlaceholder')}
            aria-label="Location"
            aria-autocomplete="list"
            aria-controls={locOpen ? 'place-home-list' : undefined}
            aria-activedescendant={locOpen && locIdx >= 0 ? `place-home-opt-${locIdx}` : undefined}
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: editingLoc ? 'var(--text)' : 'var(--text-2)',
              fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 400,
              width: editingLoc ? '110px' : `${Math.max(70, locationVal.length * 7.5)}px`,
              cursor: 'text', transition: 'width 0.2s, color 0.2s',
              whiteSpace: 'nowrap',
            }}
          />

          {/* Geolocation button */}
          <button
            aria-label="Use my current location"
            title="Use my location"
            className="geo-btn"
            onClick={e => {
              e.stopPropagation()
              if (!navigator.geolocation) return
              const btn = e.currentTarget
              btn.style.opacity = '0.4'
              navigator.geolocation.getCurrentPosition(
                async pos => {
                  try {
                    const r = await fetch(`/api/geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
                    const d = await r.json()
                    const { city = '', state = '', zip = '' } = d
                    if (zip) setLocationVal(zip)
                    else if (city && state) setLocationVal(`${city}, ${state}`)
                  } catch { /* ignore */ }
                  btn.style.opacity = ''
                },
                () => { btn.style.opacity = '' },
                { timeout: 6000 }
              )
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '2px', display: 'flex', alignItems: 'center',
              color: 'var(--accent)', opacity: 0.55,
              transition: 'opacity 0.2s', flexShrink: 0,
            }}
          >
            <Gps size={12} color="currentColor" variant="Linear" />
          </button>
        </div>

        {/* CTA button (ref passed down for magnetic effect) */}
        <button
          ref={ctaBtnRef}
          className="search-submit btn-shimmer magnetic-btn btn-vital"
          onClick={onSearch}
          aria-label="Search for free care"
          style={{
            borderRadius: '11px',
            padding: '13px 22px',
            fontFamily: 'var(--font-inter)', fontSize: '14px',
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          {t('home.hero.cta')} {'→'}
        </button>
      </div>

      {/* Typeahead dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestRef}
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
            background: 'rgba(5,6,9,0.98)',
            border: '1px solid rgba(74,144,217,0.22)',
            borderRadius: 'var(--r-md)', overflow: 'hidden',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            animation: 'suggest-in 0.18s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <style>{`@keyframes suggest-in { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
          {suggestions.map((s, i) => (
            <button
              key={s}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === suggestionIdx}
              type="button"
              onMouseDown={e => {
                e.preventDefault()
                setSearchVal(s)
                setShowSuggestions(false)
                setSuggestionIdx(-1)
              }}
              className="suggestion-item"
              style={{
                width: '100%', textAlign: 'left',
                padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '10px',
                background: i === suggestionIdx ? 'rgba(74,144,217,0.1)' : 'transparent',
                border: 'none',
                borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                color: i === suggestionIdx ? 'var(--accent)' : 'var(--text-2)',
                fontSize: '14px', fontFamily: 'var(--font-inter)', fontWeight: 400,
                cursor: 'pointer', transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => {
                setSuggestionIdx(i)
                e.currentTarget.style.background = 'rgba(74,144,217,0.1)'
                e.currentTarget.style.color = 'var(--accent)'
              }}
              onMouseLeave={e => {
                if (suggestionIdx !== i) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-2)'
                }
              }}
            >
              <SearchNormal1 size={13} color="currentColor" variant="Linear" style={{ opacity: 0.5, flexShrink: 0 }} />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Location typeahead — full-width dropdown under the bar */}
      {locOpen && locItems.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100 }}>
          <TypeaheadList
            items={locItems}
            activeIdx={locIdx}
            onPick={pickLoc}
            onHover={setLocIdx}
            idPrefix="place-home"
          />
        </div>
      )}
    </div>
  )
}

