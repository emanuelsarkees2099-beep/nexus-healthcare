'use client'
import React, { useState } from 'react'

type CardVariant = 'default' | 'glass' | 'accent' | 'danger' | 'success'

interface NexusCardProps {
  variant?: CardVariant
  padding?: string | number
  radius?: string | number
  hoverable?: boolean
  clickable?: boolean
  onClick?: () => void
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  as?: keyof JSX.IntrinsicElements
}

const VARIANT_BASE: Record<CardVariant, React.CSSProperties> = {
  default: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  glass: {
    background: 'rgba(7,7,15,0.7)',
    border: '1px solid rgba(74,144,217,0.15)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  accent: {
    background: 'rgba(74,144,217,0.06)',
    border: '1px solid rgba(74,144,217,0.18)',
  },
  danger: {
    background: 'rgba(248,113,113,0.06)',
    border: '1px solid rgba(248,113,113,0.18)',
  },
  success: {
    background: 'rgba(52,211,153,0.06)',
    border: '1px solid rgba(52,211,153,0.18)',
  },
}

const VARIANT_HOVER: Record<CardVariant, Partial<React.CSSProperties>> = {
  default: { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' },
  glass:   { borderColor: 'rgba(74,144,217,0.28)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  accent:  { background: 'rgba(74,144,217,0.10)', borderColor: 'rgba(74,144,217,0.28)' },
  danger:  { background: 'rgba(248,113,113,0.10)', borderColor: 'rgba(248,113,113,0.28)' },
  success: { background: 'rgba(52,211,153,0.10)', borderColor: 'rgba(52,211,153,0.28)' },
}

export default function NexusCard({
  variant   = 'default',
  padding   = '24px',
  radius    = '16px',
  hoverable = false,
  clickable = false,
  onClick,
  children,
  style,
  className,
}: NexusCardProps) {
  const [hovered, setHovered] = useState(false)

  const isInteractive = hoverable || clickable || !!onClick

  const computedStyle: React.CSSProperties = {
    ...VARIANT_BASE[variant],
    padding,
    borderRadius: radius,
    transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
    cursor: clickable || onClick ? 'pointer' : 'default',
    ...(hovered && isInteractive ? VARIANT_HOVER[variant] : {}),
    ...style,
  }

  return (
    <div
      className={className}
      style={computedStyle}
      onClick={onClick}
      onMouseEnter={() => isInteractive && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role={clickable || onClick ? 'button' : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
      onKeyDown={onClick ? e => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      {children}
    </div>
  )
}
