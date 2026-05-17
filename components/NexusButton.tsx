'use client'
import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size    = 'sm' | 'md' | 'lg'

interface NexusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  as?: 'button' | 'a'
  href?: string
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--bg)',
    border: 'none',
    boxShadow: '0 4px 20px rgba(74,144,217,0.32)',
  },
  secondary: {
    background: 'rgba(74,144,217,0.08)',
    color: 'var(--accent)',
    border: '1px solid rgba(74,144,217,0.22)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-2)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  danger: {
    background: 'rgba(248,113,113,0.08)',
    color: '#f87171',
    border: '1px solid rgba(248,113,113,0.22)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
  },
}

const HOVER_STYLES: Record<Variant, Partial<React.CSSProperties>> = {
  primary:   { boxShadow: '0 8px 32px rgba(74,144,217,0.48)', filter: 'brightness(1.08)' },
  secondary: { background: 'rgba(74,144,217,0.14)', borderColor: 'rgba(74,144,217,0.35)' },
  ghost:     { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.14)', color: 'var(--text)' },
  danger:    { background: 'rgba(248,113,113,0.14)', borderColor: 'rgba(248,113,113,0.35)' },
  outline:   { background: 'rgba(74,144,217,0.06)' },
}

const SIZE_STYLES: Record<Size, React.CSSProperties> = {
  sm: { padding: '6px 14px',  fontSize: '12px', borderRadius: '8px',  gap: '6px'  },
  md: { padding: '10px 20px', fontSize: '14px', borderRadius: '10px', gap: '8px'  },
  lg: { padding: '13px 28px', fontSize: '15px', borderRadius: '12px', gap: '10px' },
}

export default function NexusButton({
  variant = 'primary',
  size    = 'md',
  loading  = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: NexusButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-inter)',
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    width: fullWidth ? '100%' : undefined,
    userSelect: 'none',
    ...VARIANT_STYLES[variant],
    ...SIZE_STYLES[size],
    ...style,
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      Object.assign(e.currentTarget.style, HOVER_STYLES[variant])
    }
    onMouseEnter?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const resets = VARIANT_STYLES[variant]
    Object.keys(HOVER_STYLES[variant]).forEach(k => {
      const key = k as keyof React.CSSProperties
      ;(e.currentTarget.style as unknown as Record<string, string>)[k] =
        ((resets as unknown as Record<string, string>)[k]) ?? ''
    })
    onMouseLeave?.(e)
  }

  const spinnerEl = loading ? (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      style={{ animation: 'nexus-btn-spin 0.7s linear infinite', flexShrink: 0 }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  ) : null

  const iconEl = icon && !loading ? (
    <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }} aria-hidden="true">
      {icon}
    </span>
  ) : null

  return (
    <>
      <style>{`@keyframes nexus-btn-spin { to { transform: rotate(360deg); } }`}</style>
      <button
        style={base}
        disabled={disabled || loading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {loading && spinnerEl}
        {!loading && iconPosition === 'left' && iconEl}
        {children}
        {!loading && iconPosition === 'right' && iconEl}
      </button>
    </>
  )
}
