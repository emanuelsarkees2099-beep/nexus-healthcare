'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClientClient } from '@/lib/auth-client'

const IDLE_MS    = 25 * 60 * 1000  // 25 min — show warning
const LOGOUT_MS  = 30 * 60 * 1000  // 30 min — sign out (HIPAA §164.312(a)(2)(iii))
const EVENTS     = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'] as const

export function IdleTimeout() {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown,   setCountdown]   = useState(5 * 60)
  const lastActivity  = useRef(Date.now())
  const idleTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const supabase      = createClientClient()

  const clearTimers = () => {
    if (idleTimer.current)    clearTimeout(idleTimer.current)
    if (logoutTimer.current)  clearTimeout(logoutTimer.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }

  const doSignOut = useCallback(async () => {
    clearTimers()
    await supabase.auth.signOut()
    window.location.href = '/login?reason=timeout'
  }, [supabase])

  const staySignedIn = useCallback(() => {
    setShowWarning(false)
    clearTimers()
    resetTimers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resetTimers = useCallback(() => {
    clearTimers()
    lastActivity.current = Date.now()
    setShowWarning(false)

    idleTimer.current = setTimeout(() => {
      setShowWarning(true)
      setCountdown(5 * 60)
      countdownRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current)
            return 0
          }
          return c - 1
        })
      }, 1000)
    }, IDLE_MS)

    logoutTimer.current = setTimeout(() => {
      doSignOut()
    }, LOGOUT_MS)
  }, [doSignOut])

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      resetTimers()
      const onActivity = () => {
        if (!showWarning) resetTimers()
      }
      EVENTS.forEach(ev => window.addEventListener(ev, onActivity, { passive: true }))
      return () => {
        EVENTS.forEach(ev => window.removeEventListener(ev, onActivity))
        clearTimers()
      }
    }
    const cleanup = check()
    return () => { cleanup.then(fn => fn?.()) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!showWarning) return null

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: 'rgba(10,11,20,0.95)',
        border: '1px solid rgba(251,191,36,0.25)',
        borderRadius: '16px', padding: '32px',
        maxWidth: '380px', width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.08)',
        textAlign: 'center',
        animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '22px',
        }}>
          ⏰
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Still there?
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '8px' }}>
          For your security, you&apos;ll be signed out in
        </p>
        <div style={{
          fontSize: '32px', fontWeight: 700, color: '#fbbf24',
          fontVariantNumeric: 'tabular-nums', marginBottom: '20px',
          fontFamily: 'var(--font-display)',
        }}>
          {mins}:{String(secs).padStart(2, '0')}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={staySignedIn} style={{
            flex: 1, padding: '11px 16px',
            background: 'var(--accent, #4F8EF0)', color: '#fff',
            border: 'none', borderRadius: '9px',
            fontWeight: 600, fontSize: '13px', fontFamily: 'inherit',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(79,142,240,0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}>
            Stay signed in
          </button>
          <button onClick={doSignOut} style={{
            flex: 1, padding: '11px 16px',
            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px',
            fontWeight: 500, fontSize: '13px', fontFamily: 'inherit',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}>
            Sign out
          </button>
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '14px', lineHeight: 1.4 }}>
          HIPAA requires automatic session expiry after 30 minutes of inactivity.
        </p>
      </div>
    </div>
  )
}
