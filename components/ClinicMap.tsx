'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker, LatLngBounds } from 'leaflet'
import { SearchNormal1, CloseSquare, Call, Routing } from 'iconsax-react'

type Clinic = {
  id: string; name: string; address: string; city: string; state: string
  zip: string; phone: string; distance: number | string; services: string[]
  accepting: boolean; sliding_scale: boolean; free: boolean; url?: string
  hours?: string; type?: string; lat?: number; lng?: number
}

type PinMatchScore = { color: string; tier: string; total: number; label: string }

type Props = {
  lat: number
  lng: number
  matchScores?: Map<string, PinMatchScore>
  clinics: Clinic[]
  radius: string
  onSearchArea?: (lat: number, lng: number, radius: string) => void
  onSelectClinic?: (clinic: Clinic) => void
}

export default function ClinicMap({ lat, lng, clinics, radius, onSearchArea, onSelectClinic, matchScores }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<LeafletMap | null>(null)
  const markersRef    = useRef<LeafletMarker[]>([])
  const matchScoresRef = useRef<Map<string, PinMatchScore> | undefined>(matchScores)
  const [selected, setSelected]   = useState<Clinic | null>(null)
  const [mapMoved,  setMapMoved]  = useState(false)
  const panCenterRef = useRef<{ lat: number; lng: number }>({ lat, lng })

  // Keep ref current on every render without triggering re-runs
  matchScoresRef.current = matchScores

  // Build Google Maps deeplink for directions
  const directionsUrl = (c: Clinic) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${c.name} ${c.address} ${c.city} ${c.state}`
    )}`

  const initMap = useCallback(async () => {
    if (mapRef.current || !containerRef.current) return

    // Dynamic import — Leaflet touches document at import time
    const L = (await import('leaflet')).default
    await import('leaflet/dist/leaflet.css')

    // Fix default marker icon paths broken by webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(containerRef.current, {
      center:  [lat, lng],
      zoom:    12,
      zoomControl: true,
      attributionControl: true,
    })

    // Dark-theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map)

    // User location pin
    const homeIcon = L.divIcon({
      className: '',
      html: `<div style="
        width:14px;height:14px;border-radius:50%;
        background:#4A90D9;
        box-shadow:0 0 0 3px rgba(74,144,217,0.35),0 0 16px rgba(74,144,217,0.5);
        border:2px solid #fff;
      "></div>`,
      iconSize:   [14, 14],
      iconAnchor: [7, 7],
    })
    L.marker([lat, lng], { icon: homeIcon }).addTo(map)
      .bindPopup('<strong style="color:#4A90D9">Your location</strong>')

    // Clinic markers
    addMarkers(L, map, clinics, setSelected, matchScoresRef.current)

    // Detect when user pans/zooms away from initial view
    map.on('moveend', () => {
      const c = map.getCenter()
      panCenterRef.current = { lat: c.lat, lng: c.lng }
      const dist = map.distance([lat, lng], [c.lat, c.lng])
      setMapMoved(dist > 300) // only show button if panned > 300 m
    })

    mapRef.current = map
  }, [lat, lng, clinics]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    initMap()
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current = []
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-add markers when clinics list changes without rebuilding entire map
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    ;(async () => {
      const L = (await import('leaflet')).default
      // Remove old markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      addMarkers(L, map, clinics, setSelected, matchScoresRef.current)
    })()
  }, [clinics])

  const handleSearchArea = () => {
    const { lat: pLat, lng: pLng } = panCenterRef.current
    onSearchArea?.(pLat, pLng, radius)
    setMapMoved(false)
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Leaflet map container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}
      />

      {/* "Search this area" button — appears after user pans */}
      {mapMoved && onSearchArea && (
        <button
          onClick={handleSearchArea}
          style={{
            position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 18px', borderRadius: '100px',
            background: 'rgba(8,13,26,0.92)', border: '1px solid rgba(74,144,217,0.35)',
            color: 'var(--accent)', fontSize: '12px', fontWeight: 600,
            fontFamily: 'var(--font-inter)', cursor: 'pointer',
            backdropFilter: 'blur(12px)', transition: 'background 0.2s',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,144,217,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(8,13,26,0.92)')}
        >
          <SearchNormal1 size={12} color="currentColor" variant="Linear" />
          Search this area
        </button>
      )}

      {/* Clinic count badge */}
      <div style={{
        position: 'absolute', bottom: '12px', left: '12px', zIndex: 1000,
        background: 'rgba(8,13,26,0.92)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '7px 12px', backdropFilter: 'blur(12px)',
        fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)',
        pointerEvents: 'none',
      }}>
        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{clinics.length}</span> clinics within {radius} mi
      </div>

      {/* Selected clinic detail panel */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: '12px', right: '12px', zIndex: 1000,
          width: '260px', maxWidth: 'calc(100% - 24px)',
          background: 'rgba(8,13,26,0.96)', border: '1px solid rgba(74,144,217,0.18)',
          borderRadius: '14px', padding: '16px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          animation: 'slide-up-panel 0.22s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {/* Close */}
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              background: 'rgba(255,255,255,0.07)', border: 'none',
              borderRadius: '6px', width: '22px', height: '22px',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CloseSquare size={10} color="currentColor" variant="Linear" />
          </button>

          {/* Status badge */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {selected.free && (
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent)', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '4px', padding: '2px 7px' }}>
                Free
              </span>
            )}
            {selected.sliding_scale && !selected.free && (
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#60a5fa', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '4px', padding: '2px 7px' }}>
                Sliding scale
              </span>
            )}
            {selected.accepting && (
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#60a5fa', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '4px', padding: '2px 7px' }}>
                Accepting patients
              </span>
            )}
          </div>

          {/* Name */}
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#eef4f5', marginBottom: '4px', lineHeight: 1.3, paddingRight: '24px' }}>
            {selected.name}
          </div>

          {/* Address */}
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', lineHeight: 1.5 }}>
            {selected.address}, {selected.city}, {selected.state}
          </div>

          {/* Services */}
          {selected.services.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
              {selected.services.slice(0, 3).map(s => (
                <span key={s} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px', padding: '2px 7px' }}>
                  {s}
                </span>
              ))}
              {selected.services.length > 3 && (
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>+{selected.services.length - 3}</span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {selected.phone && (
              <a
                href={`tel:${selected.phone.replace(/\D/g, '')}`}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  padding: '8px', borderRadius: '8px',
                  background: 'var(--accent)', color: '#07070F',
                  fontSize: '11px', fontWeight: 600, textDecoration: 'none',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                <Call size={10} color="currentColor" variant="Linear" />
                Call
              </a>
            )}
            <a
              href={directionsUrl(selected)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                padding: '8px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '11px', fontWeight: 500, textDecoration: 'none',
                fontFamily: 'var(--font-inter)',
              }}
            >
              <Routing size={10} color="currentColor" variant="Linear" />
              Directions
            </a>
            {onSelectClinic && (
              <button
                onClick={() => { onSelectClinic(selected); setSelected(null) }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '11px', fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Details
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up-panel {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Override Leaflet popup to match dark theme */
        .leaflet-popup-content-wrapper {
          background: rgba(8,13,26,0.97) !important;
          border: 1px solid rgba(74,144,217,0.18) !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
          color: #eef4f5 !important;
          font-family: var(--font-inter) !important;
          font-size: 12px !important;
        }
        .leaflet-popup-tip { background: rgba(8,13,26,0.97) !important; }
        .leaflet-popup-close-button { color: rgba(255,255,255,0.4) !important; }
        .leaflet-bar a { background: rgba(8,13,26,0.95) !important; color: #eef4f5 !important; border-color: rgba(255,255,255,0.1) !important; }
        .leaflet-bar a:hover { background: rgba(74,144,217,0.1) !important; color: var(--accent) !important; }
        .leaflet-control-attribution { background: rgba(8,13,26,0.75) !important; color: rgba(255,255,255,0.35) !important; font-size: 10px !important; }
        .leaflet-control-attribution a { color: rgba(74,144,217,0.6) !important; }
      `}</style>
    </div>
  )
}

/* ── Helper: add clinic markers to map ─────────────────────────── */
function addMarkers(
  L: typeof import('leaflet'),
  map: LeafletMap,
  clinics: Clinic[],
  onSelect: (c: Clinic) => void,
  matchScores?: Map<string, PinMatchScore>
) {
  // Group clinics that are too close together (simple grid clustering)
  const CLUSTER_DIST = 0.003 // ~300 m
  const clustered = new Set<number>()
  const groups: Clinic[][] = []

  clinics.forEach((c, i) => {
    if (clustered.has(i) || !c.lat || !c.lng) return
    const group = [c]
    clinics.forEach((d, j) => {
      if (i === j || clustered.has(j) || !d.lat || !d.lng) return
      if (Math.abs(c.lat! - d.lat) < CLUSTER_DIST && Math.abs(c.lng! - d.lng) < CLUSTER_DIST) {
        group.push(d); clustered.add(j)
      }
    })
    clustered.add(i)
    groups.push(group)
  })

  groups.forEach(group => {
    const primary = group[0]
    if (!primary.lat || !primary.lng) return

    const count = group.length

    // Match score color takes precedence; fall back to affordability color
    const matchScore = matchScores?.get(String(primary.id))
    let color: string
    if (matchScore && matchScore.tier !== 'low') {
      color = matchScore.color
    } else {
      const isFree    = group.some(c => c.free)
      const isSliding = group.some(c => c.sliding_scale)
      color = isFree ? '#4A90D9' : isSliding ? '#60a5fa' : '#fbbf24'
    }

    // Show match score percentage on the pin when scores are active
    const pinLabel = count > 1
      ? String(count)
      : (matchScore && matchScore.tier !== 'low' ? `${matchScore.total}` : '')
    const pinSize = count > 1 ? 32 : matchScore && matchScore.tier !== 'low' ? 28 : 20

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        position:relative;
        width:${pinSize}px;height:${pinSize}px;
        border-radius:50%;
        background:${color};
        border:2px solid rgba(255,255,255,0.9);
        box-shadow:0 2px 8px rgba(0,0,0,0.5),0 0 0 3px ${color}30;
        display:flex;align-items:center;justify-content:center;
        color:#07070F;font-weight:700;font-size:${pinLabel ? 9 : 0}px;
        font-family:sans-serif;
        cursor:pointer;
      ">${pinLabel}</div>`,
      iconSize:   [pinSize, pinSize],
      iconAnchor: [pinSize / 2, pinSize / 2],
    })

    const marker = L.marker([primary.lat, primary.lng], { icon })

    marker.on('click', () => {
      if (count === 1) {
        onSelect(primary)
      } else {
        // Zoom in on cluster click
        map.setView([primary.lat!, primary.lng!], map.getZoom() + 2, { animate: true })
      }
    })

    marker.addTo(map)
  })
}
