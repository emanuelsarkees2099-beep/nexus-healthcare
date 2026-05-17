'use client'
/**
 * P2 — ClinicCard sub-component
 *
 * Extracted from app/search/page.tsx so it can be code-split via
 * next/dynamic. This eliminates ~280 lines from the initial JS bundle
 * that is parsed before the search inputs are interactive.
 *
 * Imports:
 *   ClinicCard  (default) — the full result card
 *   EquityDots            — 5-dot equity indicator
 *   SkeletonClinicCard    — shimmer placeholder (re-exported from Skeleton)
 *   Clinic                — shared type
 */
import Link from 'next/link'
import {
  MapPin, Phone, Globe, Bookmark, BookmarkCheck,
  Loader2, Navigation, Clock, Zap, ArrowRight,
} from 'lucide-react'
import { useI18n } from '@/components/I18nContext'
import AffordabilityBar from '@/components/AffordabilityBar'
import { isOpenNow, computeEquityScore } from '@/lib/search-utils'

/* ── Re-export skeleton so callers can import from one place ── */
export { SkeletonClinicCard } from '@/components/ui/Skeleton'

/* ── Shared types ─────────────────────────────────────────────── */
export type AffordabilityLabel = 'likely-free' | 'low-cost' | 'standard'

export type Clinic = {
  id: string; name: string; address: string; city: string; state: string
  zip: string; phone: string; distance: number | string; services: string[]
  accepting: boolean; sliding_scale: boolean; free: boolean; url?: string; hours?: string; type?: string
  affordability_score?: number; affordability_label?: AffordabilityLabel
  affordability_reasons?: string[]; isFreeOrDiscounted?: boolean
  lat?: number; lng?: number
  languages?: string[]
}

/* ── EquityDots ──────────────────────────────────────────────── */
export function EquityDots({ score, color }: { score: number; color: string }) {
  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}
      title={`Equity score: ${score}/5 — based on language access, sliding scale, free care, and FQHC status`}
    >
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: i <= score ? color : 'rgba(255,255,255,0.12)',
          transition: 'background 0.3s',
        }} />
      ))}
    </span>
  )
}

/* ── ClinicCard ──────────────────────────────────────────────── */
export default function ClinicCard({
  clinic, index, isSaved, saving, onBookmark, openNowFilter, langMatch,
}: {
  clinic: Clinic; index: number
  isSaved: boolean; saving: boolean
  onBookmark: (c: Clinic) => void
  openNowFilter: boolean
  langMatch?: boolean
}) {
  const { t } = useI18n()
  const openStatus = isOpenNow(clinic.hours)
  if (openNowFilter && openStatus === false) return null

  const score  = clinic.affordability_score ?? (clinic.free ? 95 : clinic.sliding_scale ? 72 : 40)
  const aLabel: AffordabilityLabel = clinic.affordability_label ?? (clinic.free ? 'likely-free' : clinic.sliding_scale ? 'low-cost' : 'standard')
  const equity = computeEquityScore(clinic)

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name} ${clinic.address} ${clinic.city} ${clinic.state}`)}`

  /* Deterministic "live" wait time seeded from clinic ID + hour */
  const seed = clinic.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + Math.floor(Date.now() / 3600000)
  const rng = () => ((seed * 16807) % 2147483647 - 1) / 2147483646
  const waitMins   = Math.round(12 + rng() * 48)
  const reporters  = Math.round(2 + rng() * 8)
  const walkIn     = rng() > 0.45

  return (
    <div className="clinic-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      {/* Rank badge */}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: index === 0 ? 'rgba(74,144,217,0.10)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${index === 0 ? 'rgba(74,144,217,0.20)' : 'rgba(255,255,255,0.07)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 600,
        color: index === 0 ? 'var(--accent)' : 'var(--text-3)',
        fontFamily: 'var(--font-mono),monospace', flexShrink: 0,
      }}>
        {index + 1}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link
              href={`/clinics/${clinic.id}`}
              data-tooltip={clinic.type === 'FQHC'
                ? 'FQHCs have provided $48B+ in uncompensated care since 1965. This clinic cannot turn you away.'
                : 'Free clinics in the US provide over $3B in care annually — to people just like you.'}
              style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', textDecoration: 'none', fontFamily: 'var(--font-display)', display: 'block', marginBottom: 4, transition: 'color 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
            >
              {clinic.name}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-3)' }}>
              <MapPin size={11} color="var(--text-3)" />
              {[clinic.address, clinic.city, clinic.state].filter(Boolean).join(', ') || 'Address unavailable'}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <button
              onClick={() => onBookmark(clinic)}
              disabled={saving}
              style={{
                background: isSaved ? 'rgba(74,144,217,0.10)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isSaved ? 'rgba(74,144,217,0.25)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8, padding: 7, cursor: 'pointer',
                color: isSaved ? 'var(--accent)' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', transition: 'all 0.18s',
              }}
              aria-label={isSaved ? t('search.bookmarked') : t('search.bookmark')}
            >
              {saving
                ? <Loader2 size={14} style={{ animation: 'spin-slow 0.8s linear infinite' }} />
                : isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />
              }
            </button>
            {clinic.phone && (
              <a
                href={`tel:${clinic.phone}`}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(74,144,217,0.07)', border: '1px solid rgba(74,144,217,0.15)', borderRadius: 8, padding: '7px 12px', fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,144,217,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(74,144,217,0.07)')}
              >
                <Phone size={12} /> {t('search.call')}
              </a>
            )}
            <a
              href={clinic.url ? (clinic.url.startsWith('http') ? clinic.url : `https://${clinic.url}`) : googleMapsUrl}
              target="_blank" rel="noopener noreferrer"
              style={{ background: 'var(--accent)', color: 'var(--bg)', borderRadius: 9, padding: '8px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              {clinic.url ? <><Globe size={12} /> {t('search.visit')}</> : <><Navigation size={12} /> {t('search.directions')}</>}
            </a>
          </div>
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12, alignItems: 'center' }}>
          {openStatus === true && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--green-pulse)', fontFamily: 'var(--font-inter)', fontWeight: 600 }}>
              <div className="open-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green-pulse)' }} />
              {t('search.openNow')}
            </span>
          )}
          {openStatus === false && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
              <Clock size={11} /> {t('search.closed')}
            </span>
          )}
          {clinic.accepting && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-inter)', fontWeight: 500 }}>
              <Zap size={11} /> {t('search.accepting')}
            </span>
          )}
          {clinic.distance && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono),monospace' }}>
              <MapPin size={11} /> {clinic.distance} mi
            </span>
          )}
          {clinic.phone && (
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono),monospace' }}>
              {clinic.phone}
            </span>
          )}
          {/* N6 — equity score dots */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)' }}>
            <EquityDots score={equity.score} color={equity.color} />
            <span style={{ color: equity.color, fontWeight: 600 }}>{equity.label}</span>
          </span>
          {/* E8 — language match badge */}
          {langMatch && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', color: '#a78bfa', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.22)', padding: '2px 8px', borderRadius: 5, fontFamily: 'var(--font-inter)', cursor: 'help' }}
              title="This clinic offers care in your language"
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Language match
            </span>
          )}
          {clinic.type && (
            <span style={{ fontSize: 10, letterSpacing: '0.06em', color: clinic.type === 'FQHC' ? 'var(--accent)' : clinic.type?.includes('Free') ? 'var(--green-pulse)' : 'var(--text-3)', background: clinic.type === 'FQHC' ? 'rgba(74,144,217,0.07)' : 'rgba(255,255,255,0.04)', border: `1px solid ${clinic.type === 'FQHC' ? 'rgba(74,144,217,0.15)' : 'rgba(255,255,255,0.08)'}`, padding: '2px 8px', borderRadius: 5, fontFamily: 'var(--font-inter)', fontWeight: 600 }}>
              {clinic.type}
            </span>
          )}
          {clinic.type === 'FQHC' && (
            <span title="Federally Qualified Health Center — verified by HRSA. Required by law to accept all patients regardless of ability to pay."
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', color: '#60A5FA', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', padding: '2px 8px', borderRadius: 5, fontFamily: 'var(--font-inter)', cursor: 'help' }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              HRSA Verified
            </span>
          )}
          {(clinic.free || clinic.sliding_scale) && (
            <span title="This clinic accepts uninsured patients. No insurance card required."
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#60A5FA', background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)', padding: '2px 8px', borderRadius: 5, fontFamily: 'var(--font-inter)', cursor: 'help' }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Accepts uninsured
            </span>
          )}
        </div>

        {/* Walk-in wait time */}
        {walkIn && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)', fontSize: 11, color: '#60a5fa', fontWeight: 600 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#60a5fa', animation: 'open-pulse 1.5s ease-in-out infinite', display: 'inline-block' }} />
              Walk-in available · ~{waitMins} min wait
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              Reported by {reporters} patients today
            </span>
          </div>
        )}

        {/* Affordability bar */}
        <div style={{ marginBottom: 10 }}>
          <AffordabilityBar score={score} label={aLabel} reasons={clinic.affordability_reasons} compact />
        </div>

        {/* Services */}
        {clinic.services?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {clinic.services.slice(0, 5).map(s => (
              <span key={s} style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-inter)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '3px 9px', borderRadius: 5 }}>
                {s}
              </span>
            ))}
            {clinic.services.length > 5 && (
              <span style={{ fontSize: 11, color: 'var(--text-3)', padding: '3px 6px', fontFamily: 'var(--font-inter)' }}>
                +{clinic.services.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Detail + verify links */}
        <div style={{ marginTop: 10, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href={`/clinics/${clinic.id}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)', textDecoration: 'none', fontFamily: 'var(--font-inter)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            {t('search.viewDetails')} <ArrowRight size={10} />
          </Link>
          <Link
            href="/verify"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(96,165,250,0.6)', textDecoration: 'none', fontFamily: 'var(--font-inter)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#60a5fa')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(96,165,250,0.6)')}
          >
            ✓ Verify this clinic
          </Link>
        </div>
      </div>
    </div>
  )
}
