'use client'
/**
 * AvailabilitySignal — Phase 2.2
 * Reusable availability badge used in ClinicCard and the clinic detail page.
 * Status is deterministic (seeded on clinicId + hour) with real crowd reports
 * from Supabase overriding when present.
 */
import { useState, useCallback } from 'react'
import { computeAvailabilitySignal } from '@/lib/availability'
import { Notification, TickCircle, Clock } from 'iconsax-react'
import { useToast } from '@/components/ui/Toast'

interface Props {
  clinicId: string
  clinicName: string
  /** If true, renders the full block (detail page). Compact = card badge. */
  variant?: 'compact' | 'full'
}

export default function AvailabilitySignal({ clinicId, clinicName, variant = 'compact' }: Props) {
  const signal = computeAvailabilitySignal(clinicId)
  const { toast } = useToast()
  const [notified, setNotified] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(`nexus_notify_${clinicId}`) !== null
  })

  const handleNotify = useCallback(() => {
    localStorage.setItem(`nexus_notify_${clinicId}`, JSON.stringify({ clinicName, ts: Date.now() }))
    setNotified(true)
    toast({ title: `Notification set`, body: `We'll alert you when ${clinicName} has shorter wait times.`, variant: 'success' })
  }, [clinicId, clinicName, toast])

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 100,
          background: signal.bg, border: `1px solid ${signal.border}`,
          fontSize: 11, color: signal.color, fontWeight: 600,
          fontFamily: 'var(--font-inter)',
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%', background: signal.color,
            animation: signal.status === 'open' ? 'open-pulse 1.5s ease-in-out infinite' : 'none',
            flexShrink: 0,
          }} />
          {signal.label}
        </div>
        {signal.status !== 'unknown' && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-inter)' }}>
            {signal.sublabel}
          </span>
        )}
        {(signal.status === 'limited' || signal.status === 'closed') && !notified && (
          <button
            onClick={handleNotify}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, color: 'rgba(255,255,255,0.45)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-inter)', padding: 0,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            <Notification size={9} color="currentColor" variant="Linear" />
            Notify me
          </button>
        )}
        {notified && (
          <span style={{ fontSize: 10, color: '#4ade80', fontFamily: 'var(--font-inter)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <TickCircle size={9} color="#4ade80" variant="Bold" /> Notified
          </span>
        )}
      </div>
    )
  }

  // Full variant — for clinic detail page
  return (
    <div style={{
      background: signal.bg, border: `1px solid ${signal.border}`,
      borderRadius: 14, padding: '16px 20px',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${signal.color}18`, border: `1px solid ${signal.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Clock size={15} color={signal.color} variant="Linear" />
        </div>
        <div>
          <div style={{
            fontSize: 13, fontWeight: 700, color: signal.color,
            fontFamily: 'var(--font-inter)', marginBottom: 2,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: signal.color,
              animation: signal.status === 'open' ? 'open-pulse 1.5s ease-in-out infinite' : 'none',
              flexShrink: 0,
            }} />
            {signal.label}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-inter)' }}>
            {signal.sublabel}
          </div>
        </div>
      </div>

      {(signal.status === 'limited' || signal.status === 'closed') && (
        notified ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: '#4ade80', fontFamily: 'var(--font-inter)',
            padding: '6px 12px', borderRadius: 8,
            background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)',
          }}>
            <TickCircle size={12} color="#4ade80" variant="Bold" /> You&apos;ll be notified
          </span>
        ) : (
          <button
            onClick={handleNotify}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--font-inter)', transition: 'all 0.18s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          >
            <Notification size={12} color="currentColor" variant="Linear" />
            Notify me when open
          </button>
        )
      )}
    </div>
  )
}
