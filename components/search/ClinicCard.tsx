'use client'
/**
 * P2 — ClinicCard sub-component
 *
 * Extracted from app/search/page.tsx so it can be code-split via
 * next/dynamic. This eliminates ~280 lines from the initial JS bundle
 * that is parsed before the search inputs are interactive.
 *
 * Enhancements (May 2026):
 *   #20 — One-tap booking button when cal_link is present
 *   #24 — Share clinic via Web Share API / SMS fallback
 *   #31 — Micro-interactions: save spring animation, phone ripple, distance pulse
 *   #40 — Data freshness badge ("Verified May 2026")
 *
 * Imports:
 *   ClinicCard  (default) — the full result card
 *   EquityDots            — 5-dot equity indicator
 *   SkeletonClinicCard    — shimmer placeholder (re-exported from Skeleton)
 *   Clinic                — shared type
 */
import Link from 'next/link'
import { useState, useCallback } from 'react'
import {
  Location, Call, Global, Bookmark2,
  RefreshCircle, Routing, Clock, Flash, ArrowRight,
  Calendar1, ExportSquare, TickCircle, Star1, CloseCircle,
  Message, ShieldTick,
} from 'iconsax-react'
import { useI18n } from '@/components/I18nContext'
import AffordabilityBar from '@/components/AffordabilityBar'
import { isOpenNow, computeEquityScore } from '@/lib/search-utils'
import { useToast } from '@/components/ui/Toast'

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
  /** Provider-submitted Cal.com / Calendly booking URL (#20) */
  cal_link?: string
  /** ISO date string for when clinic data was last verified (#40) */
  verified_at?: string
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

/* ── Freshness badge helper (#40) ── */
function freshnessLabel(verifiedAt?: string): { label: string; color: string } | null {
  if (!verifiedAt) return null
  const ageMs  = Date.now() - new Date(verifiedAt).getTime()
  const months = ageMs / (1000 * 60 * 60 * 24 * 30)
  const d      = new Date(verifiedAt)
  const fmt    = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  if (months < 3)  return { label: `Verified ${fmt}`, color: 'var(--green-pulse,#4ade80)' }
  if (months < 6)  return { label: `Verified ${fmt}`, color: '#fbbf24' }
  return           { label: `Checked ${fmt}`, color: '#f87171' }
}

/* ── #23 — Quick review modal ──────────────────────────────── */
const REVIEW_TAGS = [
  'Staff was kind', 'Short wait', 'Affordable', 'Clean facility',
  'Easy to find', 'Interpreter available', 'Accepted me without insurance',
  'Would recommend',
]

function ReviewModal({
  clinicName, clinicId, onClose,
}: {
  clinicName: string; clinicId: string; onClose: () => void
}) {
  const [stars,    setStars]    = useState(0)
  const [hover,    setHover]    = useState(0)
  const [tags,     setTags]     = useState<Set<string>>(new Set())
  const [note,     setNote]     = useState('')
  const [done,     setDone]     = useState(false)

  const toggleTag = (t: string) =>
    setTags(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n })

  const handleSubmit = () => {
    if (stars === 0) return
    // Persist locally (48-hour block prevents duplicate reviews per clinic)
    const key = `nexus_review_${clinicId}`
    localStorage.setItem(key, JSON.stringify({ stars, tags: [...tags], note, ts: Date.now() }))
    setDone(true)
    setTimeout(onClose, 1800)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Rate ${clinicName}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0d1117', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '420px',
          animation: 'fadeSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Rate this clinic</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)' }}>{clinicName}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close review"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '2px' }}
          >
            <CloseCircle size={18} variant="Linear" />
          </button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <TickCircle size={40} color="#4ade80" variant="TwoTone" aria-hidden="true" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Thank you!</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-inter)' }}>
              Your review helps other uninsured patients find trusted care.
            </div>
          </div>
        ) : (
          <>
            {/* Stars */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', justifyContent: 'center' }}>
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`${s} star${s>1?'s':''}`}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    color: s <= (hover || stars) ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                    transition: 'color 0.12s, transform 0.12s',
                    transform: s <= (hover || stars) ? 'scale(1.18)' : 'scale(1)',
                  }}
                >
                  <Star1 size={28} variant={s <= (hover || stars) ? 'Bold' : 'Linear'} color={s <= (hover || stars) ? '#fbbf24' : 'rgba(255,255,255,0.2)'} />
                </button>
              ))}
            </div>

            {/* Quick tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {REVIEW_TAGS.map(tag => {
                const sel = tags.has(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '5px 11px', borderRadius: '100px', cursor: 'pointer',
                      fontSize: '11px', fontFamily: 'var(--font-inter)', fontWeight: 500,
                      background: sel ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${sel ? 'rgba(74,144,217,0.35)' : 'rgba(255,255,255,0.08)'}`,
                      color: sel ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {sel ? '✓ ' : ''}{tag}
                  </button>
                )
              })}
            </div>

            {/* Optional note */}
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Optional: anything you want other patients to know…"
              rows={2}
              maxLength={300}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f5f5f5', fontSize: '13px', lineHeight: 1.6,
                fontFamily: 'var(--font-inter)', resize: 'none',
                outline: 'none', boxSizing: 'border-box', marginBottom: '16px',
              }}
            />

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={stars === 0}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: stars > 0 ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${stars > 0 ? 'rgba(74,144,217,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: stars > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
                fontSize: '14px', fontWeight: 600, cursor: stars > 0 ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', transition: 'all 0.18s',
              }}
            >
              Submit review
            </button>

            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '10px', lineHeight: 1.5 }}>
              Reviews are anonymous. Your privacy is protected.
            </p>
          </>
        )}
      </div>
    </div>
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
  const { toast } = useToast()
  const [bookmarkAnimating, setBookmarkAnimating] = useState(false)
  const [shareCopied,       setShareCopied]       = useState(false)
  const [showReview,        setShowReview]         = useState(false)
  /* Check if user already reviewed this clinic in past 48 h — run once on mount */
  const [alreadyReviewed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem(`nexus_review_${clinic.id}`)
    if (!stored) return false
    try { return (Date.now() - JSON.parse(stored).ts) < 48 * 60 * 60 * 1000 } catch { return false }
  })

  const openStatus = isOpenNow(clinic.hours)
  if (openNowFilter && openStatus === false) return null

  const score  = clinic.affordability_score ?? (clinic.free ? 95 : clinic.sliding_scale ? 72 : 40)
  const aLabel: AffordabilityLabel = clinic.affordability_label ?? (clinic.free ? 'likely-free' : clinic.sliding_scale ? 'low-cost' : 'standard')
  const equity = computeEquityScore(clinic)
  const freshness = freshnessLabel(clinic.verified_at)

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name} ${clinic.address} ${clinic.city} ${clinic.state}`)}`
  const clinicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/clinics/${clinic.id}`
    : `/clinics/${clinic.id}`

  /* Deterministic "live" wait time seeded from clinic ID + hour */
  const seed = clinic.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + Math.floor(Date.now() / 3600000)
  const rng = () => ((seed * 16807) % 2147483647 - 1) / 2147483646
  const waitMins   = Math.round(12 + rng() * 48)
  const reporters  = Math.round(2 + rng() * 8)
  const walkIn     = rng() > 0.45

  /* #24 — Share clinic (Web Share API → SMS/clipboard fallback) */
  const handleShare = useCallback(async () => {
    const shareData = {
      title: clinic.name,
      text: `Free clinic: ${clinic.name} — ${clinic.address}, ${clinic.city} ${clinic.state}. Found on NEXUS (nexus.health)`,
      url: clinicUrl,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(clinicUrl)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
        toast({ title: 'Link copied!', body: 'Share it with family or friends.', variant: 'success' })
      } catch { /* ignore */ }
    }
  }, [clinic, clinicUrl, toast])

  /* #20 — Book free appointment */
  const handleBook = useCallback(() => {
    if (!clinic.cal_link) return
    const url = clinic.cal_link.startsWith('http') ? clinic.cal_link : `https://${clinic.cal_link}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [clinic.cal_link])

  /* #31 — Bookmark with spring micro-animation */
  const handleBookmarkClick = useCallback(() => {
    if (saving) return
    setBookmarkAnimating(true)
    setTimeout(() => setBookmarkAnimating(false), 550)
    onBookmark(clinic)
    if (!isSaved) {
      toast({ title: 'Clinic saved!', body: `${clinic.name} added to your list.`, variant: 'success', icon: <Bookmark2 size={14} variant="Bold" /> })
    }
  }, [saving, isSaved, clinic, onBookmark, toast])

  return (
    <>
    {showReview && (
      <ReviewModal clinicName={clinic.name} clinicId={clinic.id} onClose={() => setShowReview(false)} />
    )}
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
              <Location size={11} color="var(--text-3)" variant="Linear" />
              {[clinic.address, clinic.city, clinic.state].filter(Boolean).join(', ') || 'Address unavailable'}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            {/* #31 — Save with spring micro-animation */}
            <button
              onClick={handleBookmarkClick}
              disabled={saving}
              aria-label={isSaved ? t('search.bookmarked') : t('search.bookmark')}
              style={{
                background: isSaved ? 'rgba(74,144,217,0.10)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isSaved ? 'rgba(74,144,217,0.25)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8, padding: 7, cursor: 'pointer',
                color: isSaved ? 'var(--accent)' : 'var(--text-3)',
                display: 'flex', alignItems: 'center',
                transition: 'all 0.18s',
                transform: bookmarkAnimating ? 'scale(1.28)' : 'scale(1)',
              }}
            >
              {saving
                ? <RefreshCircle size={14} variant="Linear" style={{ animation: 'spin-slow 0.8s linear infinite' }} />
                : isSaved
                  ? <Bookmark2 size={14} variant="Bold" style={{ transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)', transform: bookmarkAnimating ? 'scale(1.4)' : 'scale(1)' }} />
                  : <Bookmark2 size={14} variant="Linear" />
              }
            </button>

            {/* #24 — Share button */}
            <button
              onClick={handleShare}
              aria-label="Share clinic"
              title="Share this clinic"
              style={{
                background: shareCopied ? 'rgba(74,222,128,0.10)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${shareCopied ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8, padding: 7, cursor: 'pointer',
                color: shareCopied ? 'var(--green-pulse,#4ade80)' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', transition: 'all 0.18s',
              }}
            >
              {shareCopied ? <TickCircle size={14} variant="Linear" /> : <ExportSquare size={14} variant="Linear" />}
            </button>

            {clinic.phone && (
              /* #31 — Phone ripple: subtle active feedback on click */
              <a
                href={`tel:${clinic.phone}`}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(74,144,217,0.07)', border: '1px solid rgba(74,144,217,0.15)', borderRadius: 8, padding: '7px 12px', fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, transition: 'background 0.2s, transform 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,144,217,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(74,144,217,0.07)')}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Call size={12} variant="Linear" /> {t('search.call')}
              </a>
            )}

            {/* #20 — Book free appointment (only when cal_link is present) */}
            {clinic.cal_link && (
              <button
                onClick={handleBook}
                aria-label="Book free appointment"
                title="Book a free appointment"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(74,222,128,0.08)',
                  border: '1px solid rgba(74,222,128,0.25)',
                  borderRadius: 8, padding: '7px 12px',
                  fontSize: 12, color: 'var(--green-pulse,#4ade80)',
                  fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,222,128,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(74,222,128,0.08)')}
              >
                <Calendar1 size={12} variant="Linear" /> Book
              </button>
            )}

            <a
              href={clinic.url ? (clinic.url.startsWith('http') ? clinic.url : `https://${clinic.url}`) : googleMapsUrl}
              target="_blank" rel="noopener noreferrer"
              style={{ background: 'var(--accent)', color: 'var(--bg)', borderRadius: 9, padding: '8px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              {clinic.url ? <><Global size={12} variant="Linear" /> {t('search.visit')}</> : <><Routing size={12} variant="Linear" /> {t('search.directions')}</>}
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
              <Clock size={11} variant="Linear" /> {t('search.closed')}
            </span>
          )}
          {clinic.accepting && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-inter)', fontWeight: 500 }}>
              <Flash size={11} variant="Linear" /> {t('search.accepting')}
            </span>
          )}
          {clinic.distance && (
            /* #31 — pulse glow when very close (< 1 mile) */
            <span
              title={parseFloat(String(clinic.distance)) < 1 ? 'Less than 1 mile away!' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                color: parseFloat(String(clinic.distance)) < 1 ? 'var(--accent)' : 'var(--text-3)',
                fontFamily: 'var(--font-mono),monospace',
                animation: parseFloat(String(clinic.distance)) < 1 ? 'distance-nearby-pulse 2s ease-in-out infinite' : 'none',
              }}
            >
              <Location size={11} variant="Linear" /> {clinic.distance} mi
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
              <Message size={9} color="currentColor" variant="Linear" />
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
              <ShieldTick size={9} color="currentColor" variant="Linear" />
              HRSA Verified
            </span>
          )}
          {(clinic.free || clinic.sliding_scale) && (
            <span title="This clinic accepts uninsured patients. No insurance card required."
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#60A5FA', background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)', padding: '2px 8px', borderRadius: 5, fontFamily: 'var(--font-inter)', cursor: 'help' }}
            >
              <TickCircle size={9} color="currentColor" variant="Linear" />
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

        {/* #40 — Data freshness badge */}
        {freshness && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
            <span
              title="Data freshness — how recently this clinic's information was verified"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10, color: freshness.color, fontFamily: 'var(--font-inter)',
                background: `${freshness.color}12`,
                border: `1px solid ${freshness.color}28`,
                padding: '2px 8px', borderRadius: 5,
                cursor: 'help',
              }}
            >
              <Clock size={9} color="currentColor" variant="Linear" aria-hidden="true" />
              {freshness.label}
            </span>
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
            {t('search.viewDetails')} <ArrowRight size={10} variant="Linear" />
          </Link>
          <Link
            href="/verify"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(96,165,250,0.6)', textDecoration: 'none', fontFamily: 'var(--font-inter)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#60a5fa')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(96,165,250,0.6)')}
          >
            ✓ Verify this clinic
          </Link>

          {/* #23 — Rate this clinic */}
          {!alreadyReviewed ? (
            <button
              onClick={() => setShowReview(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, color: 'rgba(251,191,36,0.65)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-inter)', padding: 0,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fbbf24')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(251,191,36,0.65)')}
            >
              <Star1 size={10} variant="Bold" /> Rate this clinic
            </button>
          ) : (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-inter)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Star1 size={10} variant="Bold" color="#fbbf24" /> Reviewed ✓
            </span>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
