'use client'
import React from 'react'
import { Clock, TickCircle, InfoCircle } from 'iconsax-react'

export type FreshnessLevel = 'live' | 'recent' | 'stale'

interface Props {
  verifiedDate?: string   // ISO date string or human label, e.g. "June 2025"
  source?: string         // e.g. "HRSA Health Center Directory"
  level?: FreshnessLevel  // override auto-computed level
  className?: string
}

function computeLevel(verifiedDate?: string): FreshnessLevel {
  if (!verifiedDate) return 'stale'
  const parsed = new Date(verifiedDate)
  if (isNaN(parsed.getTime())) return 'recent'
  const ageMs = Date.now() - parsed.getTime()
  const ageDays = ageMs / 86400000
  if (ageDays < 30)  return 'live'
  if (ageDays < 180) return 'recent'
  return 'stale'
}

const LEVEL_META: Record<FreshnessLevel, { icon: React.ReactNode; label: string; color: string }> = {
  live:   { icon: <TickCircle size={11} color="#34d399" variant="Bold" />, label: 'Verified recently', color: '#34d399' },
  recent: { icon: <Clock size={11} color="#f59e0b" variant="Linear" />,   label: 'Verified this year', color: '#f59e0b' },
  stale:  { icon: <InfoCircle size={11} color="rgba(255,255,255,0.3)" variant="Linear" />, label: 'May be outdated', color: 'rgba(255,255,255,0.3)' },
}

export default function DataFreshnessIndicator({ verifiedDate, source, level, className }: Props) {
  const resolved = level ?? computeLevel(verifiedDate)
  const meta = LEVEL_META[resolved]

  return (
    <span
      className={className}
      title={source ? `Source: ${source}${verifiedDate ? ` · Verified: ${verifiedDate}` : ''}` : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 10, color: meta.color, whiteSpace: 'nowrap',
      }}
    >
      {meta.icon}
      {meta.label}
      {source && (
        <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 2 }}>· {source}</span>
      )}
    </span>
  )
}
