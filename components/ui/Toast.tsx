'use client'
/**
 * NEXUS Centralized Toast System (#35)
 *
 * Usage:
 *   import { useToast } from '@/components/ui/Toast'
 *   const { toast } = useToast()
 *   toast({ title: 'Saved!', body: 'Clinic added to your list', icon: <BookmarkCheck size={16} /> })
 *
 * ToastContainer is mounted once in GlobalClientComponents.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { CloseCircle } from 'iconsax-react'

/* ── Types ─────────────────────────────────────────────────────────────────── */
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  /** Short bold title (e.g. "Saved!") */
  title: string
  /** Optional longer description */
  body?: string
  /** Optional lucide icon node */
  icon?: React.ReactNode
  /** Visual variant — drives border/glow color */
  variant?: ToastVariant
  /** Auto-dismiss after N ms (default: 6000) */
  duration?: number
  /** Optional CTA button */
  action?: { label: string; onClick: () => void }
}

interface Toast extends ToastOptions {
  id: string
}

/* ── Global singleton event bus (no React context needed) ──────────────────── */
type Listener = (toast: Toast) => void
const listeners: Set<Listener> = new Set()

function emit(toast: Toast) {
  listeners.forEach(fn => fn(toast))
}

/* ── Public API: useToast hook ─────────────────────────────────────────────── */
export function useToast() {
  const toast = useCallback((opts: ToastOptions) => {
    emit({
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      variant: 'default',
      duration: 6000,
      ...opts,
    })
  }, [])

  return { toast }
}

/* ── Variant color tokens ───────────────────────────────────────────────────── */
const VARIANT_STYLES: Record<ToastVariant, { border: string; glow: string; iconBg: string; iconColor: string }> = {
  default: {
    border: 'rgba(74,144,217,0.25)',
    glow: 'rgba(74,144,217,0.08)',
    iconBg: 'rgba(74,144,217,0.10)',
    iconColor: 'var(--accent,#4A8FD4)',
  },
  success: {
    border: 'rgba(74,222,128,0.30)',
    glow: 'rgba(74,222,128,0.07)',
    iconBg: 'rgba(74,222,128,0.10)',
    iconColor: 'var(--green-pulse,#4ade80)',
  },
  error: {
    border: 'rgba(248,113,113,0.30)',
    glow: 'rgba(248,113,113,0.07)',
    iconBg: 'rgba(248,113,113,0.10)',
    iconColor: '#f87171',
  },
  warning: {
    border: 'rgba(251,191,36,0.30)',
    glow: 'rgba(251,191,36,0.07)',
    iconBg: 'rgba(251,191,36,0.10)',
    iconColor: '#fbbf24',
  },
  info: {
    border: 'rgba(167,139,250,0.30)',
    glow: 'rgba(167,139,250,0.07)',
    iconBg: 'rgba(167,139,250,0.10)',
    iconColor: '#a78bfa',
  },
}

/* ── Individual Toast item ─────────────────────────────────────────────────── */
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [progress, setProgress] = useState(100)
  const [exiting, setExiting] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const duration = toast.duration ?? 6000
  const vs = VARIANT_STYLES[toast.variant ?? 'default']

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), 260)
  }, [toast.id, onDismiss])

  useEffect(() => {
    const step = 50
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        const next = p - (step / duration) * 100
        if (next <= 0) {
          dismiss()
          return 0
        }
        return next
      })
    }, step)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [duration, dismiss])

  const pauseTimer = () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  const resumeTimer = () => {
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        const step = 50
        const next = p - (step / duration) * 100
        if (next <= 0) { dismiss(); return 0 }
        return next
      })
    }, 50)
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      style={{
        position: 'relative',
        background: 'rgba(8,10,22,0.96)',
        border: `1px solid ${vs.border}`,
        borderRadius: '14px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        minWidth: '280px',
        maxWidth: 'min(380px, calc(100vw - 48px))',
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03), 0 0 20px ${vs.glow}`,
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        transform: exiting ? 'translateX(120%) scale(0.94)' : 'translateX(0) scale(1)',
        opacity: exiting ? 0 : 1,
        transition: 'transform 0.24s cubic-bezier(0.55,0,1,0.7), opacity 0.22s ease',
        animation: 'toast-enter 0.48s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
    >
      {/* Icon */}
      {toast.icon && (
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: vs.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: vs.iconColor,
          flexShrink: 0,
        }}>
          {toast.icon}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: 'var(--text,#e8eaf0)',
          fontFamily: 'var(--font-inter)',
          marginBottom: toast.body ? 3 : 0,
          lineHeight: 1.4,
        }}>
          {toast.title}
        </div>
        {toast.body && (
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--font-inter)', lineHeight: 1.5,
            marginBottom: toast.action ? 8 : 0,
          }}>
            {toast.body}
          </div>
        )}
        {toast.action && (
          <button
            onClick={() => { toast.action!.onClick(); dismiss() }}
            style={{
              background: 'none', border: 'none', padding: 0,
              color: vs.iconColor,
              fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--font-inter)',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.25)', padding: 4,
          display: 'flex', borderRadius: 6,
          flexShrink: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
      >
        <CloseCircle size={13} variant="Linear" color="rgba(255,255,255,0.25)" />
      </button>

      {/* Progress bar — gradient glow matching variant */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: 2,
        width: `${progress}%`,
        background: `linear-gradient(90deg, ${vs.border}, ${vs.iconColor})`,
        boxShadow: `0 0 6px ${vs.glow}`,
        transition: 'width 0.05s linear',
        borderRadius: '0 1px 0 14px',
        opacity: 0.9,
      }} aria-hidden="true" />
    </div>
  )
}

/* ── ToastContainer ─────────────────────────────────────────────────────────── */
export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const add = (t: Toast) => setToasts(prev => [...prev.slice(-4), t]) // max 5 toasts
    listeners.add(add)
    return () => { listeners.delete(add) }
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  if (toasts.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes toast-enter {
          0%   { opacity: 0; transform: translateX(100%) translateY(8px) scale(0.90); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: translateX(0)    translateY(0)   scale(1);    }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes toast-enter {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        }
      `}</style>
      <div
        aria-live="polite"
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'flex-end',
        }}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </>
  )
}
