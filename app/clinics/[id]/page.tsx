'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import AffordabilityBar from '@/components/AffordabilityBar'
import EmergencyEscalation from '@/components/EmergencyEscalation'
import {
  MapPin, Phone, Globe, Clock, ArrowLeft, Bookmark, BookmarkCheck,
  CheckCircle2, Stethoscope, Brain, Baby, Eye, Heart, Pill,
  Accessibility, Languages, Car, Bus, Loader2, Share2, Printer,
  Navigation, ChevronRight, Shield, Award, AlertCircle,
} from 'lucide-react'
import { createClientClient } from '@/lib/auth-client'

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

  const [clinic,    setClinic]    = useState<Clinic | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [notFound, setNotFound]  = useState(false)

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
    }
    setBookmarkLoading(false)
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: clinic?.name, text: `Free clinic: ${clinic?.name} — found via NEXUS`, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const handleSMS = () => {
    if (!clinic) return
    const msg = `Free clinic: ${clinic.name}, ${clinic.address}, ${clinic.city} ${clinic.state}. Phone: ${clinic.phone}. Found via NEXUS.`
    window.location.href = `sms:?body=${encodeURIComponent(msg)}`
  }

  const handleDirections = () => {
    if (!clinic) return
    const addr = encodeURIComponent(`${clinic.address}, ${clinic.city}, ${clinic.state} ${clinic.zip}`)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    window.open(isIOS ? `maps://?daddr=${addr}` : `https://www.google.com/maps/dir/?api=1&destination=${addr}`)
  }

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
          <h1 style={{ fontFamily: 'var(--font-sora)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
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

  return (
    <AppShell>
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
            background: 'radial-gradient(circle, rgba(110,231,183,0.06) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }} />

          {/* Badges row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {clinic.free && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'rgba(110,231,183,0.10)', border: '1px solid rgba(110,231,183,0.22)',
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
                background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.22)',
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
          </div>

          {/* Name + affordability */}
          <h1 style={{
            fontFamily: 'var(--font-sora)',
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
                background: bookmarked ? 'rgba(110,231,183,0.10)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${bookmarked ? 'rgba(110,231,183,0.25)' : 'rgba(255,255,255,0.08)'}`,
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
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                color: 'var(--text-2)', padding: '11px 14px', borderRadius: '10px',
                cursor: 'pointer', fontWeight: 500, fontSize: '13px', fontFamily: 'var(--font-inter)',
              }}
              title="Text me this clinic"
            >
              <Share2 size={14} />
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
                    background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.12)',
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
            background: 'rgba(110,231,183,0.05)', border: '1px solid rgba(110,231,183,0.12)',
            borderRadius: '10px',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'var(--font-inter)', fontWeight: 500 }}>
              No insurance? No problem. FQHCs and free clinics are federally required to see all patients regardless of insurance or immigration status.
            </p>
          </div>
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

      </div>
    </AppShell>
  )
}
