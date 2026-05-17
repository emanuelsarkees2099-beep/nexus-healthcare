'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import AffordabilityBar from '@/components/AffordabilityBar'
import EmergencyEscalation from '@/components/EmergencyEscalation'
import {
  MapPin, Phone, Globe, Clock, ArrowLeft, Bookmark, BookmarkCheck,
  CheckCircle2, Stethoscope, Brain, Baby, Eye, Heart, Pill,
  Accessibility, Languages, Car, Bus, Loader2, Share2, Printer,
  Navigation, ChevronRight, Shield, Award, AlertCircle, ExternalLink,
  MessageCircle, Copy, Check, CalendarDays, ShieldCheck, Star, X,
} from 'lucide-react'
import { createClientClient } from '@/lib/auth-client'
import { computeEquityScore } from '@/lib/search-utils'

type AffordabilityLabel = 'likely-free' | 'low-cost' | 'standard'

type Clinic = {
  id: string; name: string; address: string; city: string; state: string
  zip: string; phone: string; distance?: number | string
  services: string[]; accepting: boolean; sliding_scale: boolean; free: boolean
  url?: string; hours?: string; type?: string
  affordability_score?: number; affordability_label?: AffordabilityLabel
  affordability_reasons?: string[]
  lat?: number; lng?: number
  languages?: string[]
  accessibility?: string[]
  cal_link?: string   // N3: Cal.com/Calendly booking URL provided by provider
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  primary:    <Stethoscope size={14} strokeWidth={2} />,
  mental:     <Brain size={14} strokeWidth={2} />,
  pediatrics: <Baby size={14} strokeWidth={2} />,
  vision:     <Eye size={14} strokeWidth={2} />,
  dental:     <Pill size={14} strokeWidth={2} />,
  womens:     <Heart size={14} strokeWidth={2} />,
}

const WHAT_TO_BRING = [
  { text: 'Photo ID (if you have one — not always required)', icon: <Shield size={14} /> },
  { text: 'List of current medications', icon: <Pill size={14} /> },
  { text: 'Previous medical records (optional)', icon: <CheckCircle2 size={14} /> },
  { text: 'Payment is based on your income — ask at the desk', icon: <Heart size={14} /> },
]

export default function ClinicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id     = params?.id as string

  const [clinic,          setClinic]         = useState<Clinic | null>(null)
  const [loading,         setLoading]        = useState(true)
  const [bookmarked,      setBookmarked]     = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [user,            setUser]           = useState<{ id: string } | null>(null)
  const [notFound,        setNotFound]       = useState(false)
  const [copied,          setCopied]         = useState(false)
  const [bridgeVisible,   setBridgeVisible]  = useState(false)  // N5: insurance bridge

  useEffect(() => {
    if (!id) return
    const supabase = createClientClient()

    /* Load clinic — use bookmarks resource_data as fallback since clinics may not be in DB */
    // First try to load from our API
    fetch(`/api/clinics?id=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.clinic) {
          setClinic(d.clinic as Clinic)
        } else {
          setNotFound(true)
        }
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })

    /* Check auth + bookmark status */
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setUser({ id: session.user.id })
      const { data } = await supabase
        .from('bookmarks').select('id').eq('user_id', session.user.id).eq('resource_id', id).single()
      if (data) setBookmarked(true)
    })
  }, [id])

  const toggleBookmark = async () => {
    if (!user) { router.push('/login'); return }
    setBookmarkLoading(true)
    const supabase = createClientClient()
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('resource_id', id)
      setBookmarked(false)
    } else {
      await supabase.from('bookmarks').insert({
        user_id: user.id,
        resource_type: 'clinic',
        resource_id: id,
        resource_name: clinic?.name ?? '',
        resource_data: clinic as unknown as import('@/lib/database.types').Json,
      })
      setBookmarked(true)
      /* N5: show insurance bridge toast */
      setBridgeVisible(true)
      setTimeout(() => setBridgeVisible(false), 9000)
    }
    setBookmarkLoading(false)
  }

  const handleShare = useCallback(async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: clinic?.name, text: `Free clinic: ${clinic?.name} — found via NEXUS`, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [clinic])

  const handleSMS = useCallback(() => {
    if (!clinic) return
    const msg = `Free clinic: ${clinic.name}, ${clinic.address}, ${clinic.city} ${clinic.state}. Phone: ${clinic.phone}. Found via NEXUS (nexus.health)`
    window.location.href = `sms:?body=${encodeURIComponent(msg)}`
  }, [clinic])

  const handleDirections = useCallback(() => {
    if (!clinic) return
    const addr = encodeURIComponent(`${clinic.address}, ${clinic.city}, ${clinic.state} ${clinic.zip}`)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    window.open(isIOS ? `maps://?daddr=${addr}` : `https://www.google.com/maps/dir/?api=1&destination=${addr}`)
  }, [clinic])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // Track last-viewed clinics (U16)
  useEffect(() => {
    if (!clinic) return
    try {
      const STORAGE_KEY = 'nexus_last_viewed'
      const raw  = localStorage.getItem(STORAGE_KEY)
      const list: Array<{ id: string; name: string; city: string; state: string; ts: number }> =
        raw ? JSON.parse(raw) : []
      const filtered = list.filter(c => c.id !== clinic.id)
      const updated  = [
        { id: clinic.id, name: clinic.name, city: clinic.city, state: clinic.state, ts: Date.now() },
        ...filtered,
      ].slice(0, 10) // keep last 10
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch { /* ignore */ }
  }, [clinic])

  /* ── Loading state ── */
  if (loading) {
    return (
      <AppShell>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Loader2 size={24} color="var(--accent)" style={{ animation: 'spin-slow 1s linear infinite' }} />
            <span style={{ color: 'var(--text-3)', fontSize: '13px', fontFamily: 'var(--font-inter)' }}>
              Loading clinic details...
            </span>
          </div>
        </div>
      </AppShell>
    )
  }

  /* ── Not found state ── */
  if (notFound || !clinic) {
    return (
      <AppShell>
        <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--coral)" style={{ marginBottom: '16px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
            Clinic not found
          </h1>
          <p style={{ color: 'var(--text-2)', fontFamily: 'var(--font-inter)', marginBottom: '24px' }}>
            This clinic may have moved or been removed from our directory.
          </p>
          <Link href="/search" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'var(--accent)', color: 'var(--bg)',
            padding: '10px 20px', borderRadius: '10px',
            textDecoration: 'none', fontWeight: 600, fontSize: '14px',
            fontFamily: 'var(--font-inter)',
          }}>
            <MapPin size={15} /> Find Another Clinic
          </Link>
          <div style={{ marginTop: '24px' }}>
            <EmergencyEscalation />
          </div>
        </div>
      </AppShell>
    )
  }

  const score = clinic.affordability_score ?? (clinic.free ? 95 : clinic.sliding_scale ? 72 : 40)
  const aLabel: AffordabilityLabel = clinic.affordability_label ?? (clinic.free ? 'likely-free' : clinic.sliding_scale ? 'low-cost' : 'standard')
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name} ${clinic.address} ${clinic.city} ${clinic.state}`)}`
  /* N6: Equity score */
  const equity = computeEquityScore(clinic)

  /* ── Real-time Open Now ── */
  const openNow = (() => {
    if (!clinic.hours) return null
    const now   = new Date()
    const day   = now.getDay()  // 0=Sun
    const h     = now.getHours()
    const lower = clinic.hours.toLowerCase()
    // Simple heuristic: look for "24 hours" / "24/7"
    if (lower.includes('24') || lower.includes('all day')) return true
    // Closed weekend keywords
    const isWeekend = day === 0 || day === 6
    if (isWeekend && lower.includes('mon') && !lower.includes('sat')) return false
    // Common 8am–5pm pattern
    if (lower.match(/8[:\s]?a\.?m/i) || lower.match(/9[:\s]?a\.?m/i)) {
      return h >= 8 && h < 17
    }
    return null // unknown
  })()

  /* ── #44: JSON-LD structured data — MedicalClinic + HealthcareOrganization ── */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'HealthcareOrganization'],
    name: clinic.name,
    description: `Free and low-cost healthcare clinic. ${clinic.services?.join(', ') ?? ''}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.address,
      addressLocality: clinic.city,
      addressRegion: clinic.state,
      postalCode: clinic.zip,
      addressCountry: 'US',
    },
    ...(clinic.phone ? { telephone: clinic.phone } : {}),
    ...(clinic.url   ? { url: clinic.url }            : {}),
    ...(clinic.hours ? { openingHours: clinic.hours } : {}),
    ...(clinic.lat && clinic.lng ? {
      geo: { '@type': 'GeoCoordinates', latitude: clinic.lat, longitude: clinic.lng },
    } : {}),
    medicalSpecialty: clinic.services,
    availableService: clinic.services?.map(s => ({ '@type': 'MedicalTherapy', name: s })) ?? [],
    isAcceptingNewPatients: clinic.accepting,
    priceRange: clinic.free ? '$0' : clinic.sliding_scale ? 'Sliding scale' : undefined,
    knowsLanguage: clinic.languages ?? ['English'],
  }

  return (
    <AppShell>
      {/* #44 — Structured data for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── N5: Insurance Bridge Toast ─────────────────────────────── */}
      {bridgeVisible && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 8000,
            width: 320, borderRadius: 14,
            background: 'rgba(14,14,24,0.97)',
            border: '1px solid rgba(74,144,217,0.25)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            padding: '16px 18px',
            animation: 'slideInRight 0.25s ease',
          }}
        >
          <style>{`@keyframes slideInRight { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }`}</style>
          <button
            onClick={() => setBridgeVisible(false)}
            aria-label="Dismiss"
            style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 2 }}
          >
            <X size={14} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ShieldCheck size={16} color="var(--accent)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-inter)' }}>
              Clinic saved!
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)', lineHeight: 1.55, margin: '0 0 12px', fontWeight: 300 }}>
            You may qualify for Medicaid, ACA subsidies, or sliding-scale fees. Check your coverage before your visit.
          </p>
          <Link
            href="/eligibility"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.28)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-inter)', textDecoration: 'none' }}
          >
            Check coverage <ChevronRight size={12} />
          </Link>
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── Back breadcrumb ── */}
        <div style={{ marginBottom: '28px' }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', fontSize: '13px', fontFamily: 'var(--font-inter)',
              padding: '0', transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            <ArrowLeft size={14} /> Back to results
          </button>
        </div>

        {/* ── Hero section ── */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: '20px', padding: '28px 32px', marginBottom: '16px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Ambient glow */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74,144,217,0.06) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }} />

          {/* Badges row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {clinic.free && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'rgba(74,144,217,0.10)', border: '1px solid rgba(74,144,217,0.22)',
                borderRadius: '100px', padding: '4px 10px',
                fontSize: '11px', fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-inter)',
              }}>
                <CheckCircle2 size={11} /> Free care available
              </div>
            )}
            {clinic.sliding_scale && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'rgba(252,211,77,0.10)', border: '1px solid rgba(252,211,77,0.22)',
                borderRadius: '100px', padding: '4px 10px',
                fontSize: '11px', fontWeight: 600, color: 'var(--amber)', fontFamily: 'var(--font-inter)',
              }}>
                Sliding scale
              </div>
            )}
            {clinic.accepting && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.22)',
                borderRadius: '100px', padding: '4px 10px',
                fontSize: '11px', fontWeight: 600, color: 'var(--green-pulse)', fontFamily: 'var(--font-inter)',
              }}>
                <div className="open-pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green-pulse)' }} />
                Accepting patients
              </div>
            )}
            {clinic.type && (
              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '100px', padding: '4px 10px',
                fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)',
              }}>
                {clinic.type}
              </div>
            )}
            {/* Real-time open now indicator */}
            {openNow !== null && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: openNow ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                border: openNow ? '1px solid rgba(74,222,128,0.22)' : '1px solid rgba(248,113,113,0.22)',
                borderRadius: '100px', padding: '4px 10px',
                fontSize: '11px', fontWeight: 600,
                color: openNow ? 'var(--green-pulse)' : 'var(--coral)',
                fontFamily: 'var(--font-inter)',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                {openNow ? 'Open now' : 'Closed now'}
              </div>
            )}

            {/* N6: Equity Score badge */}
            <div
              title={`Equity Score: ${equity.label} — Language: ${equity.breakdown.languageAccess}/2, Sliding scale: ${equity.breakdown.slidingScale ? 'Yes' : 'No'}, Free: ${equity.breakdown.freeCare ? 'Yes' : 'No'}, FQHC: ${equity.breakdown.fqhcStatus ? 'Yes' : 'No'}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: `${equity.color}18`, border: `1px solid ${equity.color}40`,
                borderRadius: '100px', padding: '4px 10px',
                fontSize: '11px', fontWeight: 600, color: equity.color,
                fontFamily: 'var(--font-inter)', cursor: 'default',
              }}
            >
              <Star size={10} fill={equity.color} stroke="none" />
              Equity: {equity.label}
            </div>
          </div>

          {/* Name + affordability */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1,
            color: 'var(--text)', marginBottom: '8px',
          }}>
            {clinic.name}
          </h1>

          <p style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', marginBottom: '20px' }}>
            {clinic.city}, {clinic.state} {clinic.zip}
          </p>

          {/* Affordability score */}
          <div style={{ marginBottom: '24px', maxWidth: '480px' }}>
            <AffordabilityBar
              score={score}
              label={aLabel}
              reasons={clinic.affordability_reasons}
            />
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {clinic.phone && (
              <a
                href={`tel:${clinic.phone}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'var(--accent)', color: 'var(--bg)',
                  padding: '11px 18px', borderRadius: '10px',
                  textDecoration: 'none', fontWeight: 700, fontSize: '14px',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                <Phone size={15} /> Call Now
              </a>
            )}
            <button
              onClick={handleDirections}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: 'var(--text)', padding: '11px 18px', borderRadius: '10px',
                cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-inter)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            >
              <Navigation size={15} /> Get Directions
            </button>
            <button
              onClick={toggleBookmark}
              disabled={bookmarkLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: bookmarked ? 'rgba(74,144,217,0.10)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${bookmarked ? 'rgba(74,144,217,0.25)' : 'rgba(255,255,255,0.08)'}`,
                color: bookmarked ? 'var(--accent)' : 'var(--text-2)',
                padding: '11px 18px', borderRadius: '10px', cursor: 'pointer',
                fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-inter)',
                transition: 'background 0.2s, border-color 0.2s',
              }}
            >
              {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              {bookmarked ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleSMS}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                color: 'var(--text-2)', padding: '11px 14px', borderRadius: '10px',
                cursor: 'pointer', fontWeight: 500, fontSize: '13px', fontFamily: 'var(--font-inter)',
                transition: 'background 0.2s, color 0.2s',
              }}
              title="Text me this clinic"
              aria-label="Text clinic info to yourself"
            >
              <MessageCircle size={14} />
            </button>
            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: copied ? 'rgba(74,144,217,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${copied ? 'rgba(74,144,217,0.22)' : 'rgba(255,255,255,0.07)'}`,
                color: copied ? 'var(--accent)' : 'var(--text-2)', padding: '11px 14px', borderRadius: '10px',
                cursor: 'pointer', fontWeight: 500, fontSize: '13px', fontFamily: 'var(--font-inter)',
                transition: 'background 0.2s, color 0.2s, border-color 0.2s',
              }}
              title={copied ? 'Copied!' : 'Share clinic'}
              aria-label={copied ? 'Link copied to clipboard' : 'Share clinic'}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
            </button>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                color: 'var(--text-2)', padding: '11px 14px', borderRadius: '10px',
                cursor: 'pointer', fontWeight: 500, fontSize: '13px', fontFamily: 'var(--font-inter)',
                transition: 'background 0.2s, color 0.2s',
              }}
              title="Print clinic info"
              aria-label="Print clinic info"
            >
              <Printer size={14} />
            </button>
          </div>
        </div>

        {/* ── Detail grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>

          {/* Contact info */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '22px 24px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', marginBottom: '16px' }}>
              Contact &amp; Location
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <MapPin size={15} color="var(--accent)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '13px', color: 'var(--text-2)', textDecoration: 'none', lineHeight: 1.6, fontFamily: 'var(--font-inter)', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
                >
                  {clinic.address}<br />{clinic.city}, {clinic.state} {clinic.zip}
                </a>
              </div>
              {clinic.phone && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Phone size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <a href={`tel:${clinic.phone}`} style={{ fontSize: '13px', color: 'var(--text-2)', textDecoration: 'none', fontFamily: 'var(--font-mono),monospace', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}>
                    {clinic.phone}
                  </a>
                </div>
              )}
              {clinic.url && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Globe size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <a href={clinic.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--text-2)', textDecoration: 'none', fontFamily: 'var(--font-inter)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}>
                    Website <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  </a>
                </div>
              )}
              {clinic.hours && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Clock size={15} color="var(--amber)" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', lineHeight: 1.6 }}>
                    {clinic.hours}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          {clinic.services?.length > 0 && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '22px 24px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', marginBottom: '16px' }}>
                Services Offered
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {clinic.services.map(svc => (
                  <div key={svc} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '5px 11px', borderRadius: '8px',
                    background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.12)',
                    fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-inter)', fontWeight: 500,
                  }}>
                    {SERVICE_ICONS[svc] || <Stethoscope size={12} />}
                    {svc.charAt(0).toUpperCase() + svc.slice(1)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Languages spoken ── */}
        {clinic.languages && clinic.languages.length > 0 && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '22px 24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Languages size={14} color="var(--violet)" />
              <h2 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', margin: 0 }}>
                Languages Spoken
              </h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {clinic.languages.map(lang => (
                <div key={lang} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '5px 12px', borderRadius: '8px',
                  background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.18)',
                  fontSize: '12px', color: 'var(--violet)', fontFamily: 'var(--font-inter)', fontWeight: 500,
                }}>
                  <Globe size={11} />
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── What to bring ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '22px 24px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', marginBottom: '16px' }}>
            What to Bring
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {WHAT_TO_BRING.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '1px' }}>{item.icon}</div>
                <span style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', lineHeight: 1.6 }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '16px', padding: '12px 16px',
            background: 'rgba(74,144,217,0.05)', border: '1px solid rgba(74,144,217,0.12)',
            borderRadius: '10px',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'var(--font-inter)', fontWeight: 500 }}>
              No insurance? No problem. FQHCs and free clinics are federally required to see all patients regardless of insurance or immigration status.
            </p>
          </div>
        </div>

        {/* ── N3: Appointment Booking ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '22px 24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={15} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', margin: 0 }}>
              Book an Appointment
            </h2>
          </div>

          {clinic.cal_link ? (
            /* Provider has provided a Cal.com or Calendly booking URL */
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-inter)', marginBottom: 14, fontWeight: 300, lineHeight: 1.6 }}>
                This clinic offers online scheduling. Select a time that works for you:
              </p>
              {/* Inline calendar embed */}
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(74,144,217,0.12)' }}>
                <iframe
                  src={clinic.cal_link}
                  title={`Schedule appointment at ${clinic.name}`}
                  width="100%"
                  height="560"
                  frameBorder="0"
                  style={{ display: 'block', background: 'rgba(255,255,255,0.02)' }}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-inter)', marginTop: 10, fontWeight: 300 }}>
                Scheduling powered by the clinic&apos;s own booking system. NEXUS does not store appointment data.
              </p>
            </div>
          ) : (
            /* No booking URL — show call-to-book prompt */
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-inter)', marginBottom: 16, fontWeight: 300, lineHeight: 1.6 }}>
                Online booking is not available for this clinic yet. Call to schedule your visit:
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                {clinic.phone && (
                  <a
                    href={`tel:${clinic.phone}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 10, background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.25)', color: 'var(--accent)', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-inter)', textDecoration: 'none' }}
                  >
                    <Phone size={15} /> Call to Book
                  </a>
                )}
                {clinic.url && (
                  <a
                    href={clinic.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--text-2)', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-inter)', textDecoration: 'none' }}
                  >
                    <Globe size={14} /> Visit Website
                  </a>
                )}
              </div>
              {/* Tips for the call */}
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)' }}>
                <p style={{ fontSize: 12, color: 'rgba(251,191,36,0.75)', fontFamily: 'var(--font-inter)', margin: 0, lineHeight: 1.65, fontWeight: 300 }}>
                  💡 <strong style={{ fontWeight: 600 }}>Tip when calling:</strong> Ask about sliding-scale fees, bring your income information, and confirm they accept uninsured patients. Most clinics are required to say yes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── HRSA badge if applicable ── */}
        {(clinic.type?.toLowerCase().includes('fqhc') || clinic.type?.toLowerCase().includes('hrsa')) && (
          <div style={{
            background: 'rgba(252,211,77,0.05)', border: '1px solid rgba(252,211,77,0.15)',
            borderRadius: '16px', padding: '18px 22px', marginBottom: '16px',
            display: 'flex', alignItems: 'flex-start', gap: '14px',
          }}>
            <Award size={20} color="var(--amber)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--font-inter)', marginBottom: '3px' }}>
                HRSA-Funded Health Center
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', lineHeight: 1.6 }}>
                This clinic receives federal funding and is required by law to offer care to all patients on a sliding-scale fee regardless of ability to pay.
              </p>
            </div>
          </div>
        )}

        {/* ── Emergency escalation ── */}
        <div style={{
          background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.12)',
          borderRadius: '16px', padding: '18px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', flex: 1 }}>
            Need urgent help right now?
          </p>
          <EmergencyEscalation compact />
        </div>

        {/* ── Report outdated info ── */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a
            href={`mailto:data@nexus.health?subject=Report outdated info: ${encodeURIComponent(clinic.name)}&body=Clinic ID: ${clinic.id}%0AClinic name: ${encodeURIComponent(clinic.name)}%0A%0AWhat's outdated:%0A`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            <AlertCircle size={12} />
            Report outdated or incorrect information
          </a>
        </div>

      </div>
    </AppShell>
  )
}
