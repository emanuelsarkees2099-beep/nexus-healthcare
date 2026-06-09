'use client'
/**
 * F3 — PushNotificationToggle
 *
 * A self-contained toggle that:
 * 1. Registers the service worker (sw.js)
 * 2. Fetches the VAPID public key from /api/push/subscribe
 * 3. Subscribes/unsubscribes using the Push API
 * 4. Persists subscription to /api/push/subscribe
 *
 * Usage:
 *   <PushNotificationToggle />
 *
 * Add to dashboard, settings sidebar, or notification bell dropdown.
 */

import { useEffect, useState } from 'react'
import { Notification1 } from 'iconsax-react'

type Status = 'idle' | 'loading' | 'subscribed' | 'denied' | 'unsupported'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  return Uint8Array.from(raw, c => c.charCodeAt(0))
}

export default function PushNotificationToggle() {
  const [status, setStatus]           = useState<Status>('idle')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [error, setError]             = useState<string | null>(null)

  /* Check current subscription state on mount */
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }

    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        if (sub) {
          setSubscription(sub)
          setStatus('subscribed')
        } else {
          setStatus('idle')
        }
      })
    }).catch(() => setStatus('unsupported'))
  }, [])

  const handleSubscribe = async () => {
    setStatus('loading')
    setError(null)
    try {
      /* 1 — Register service worker */
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      await navigator.serviceWorker.ready

      /* 2 — Get VAPID public key */
      const keyRes = await fetch('/api/push/subscribe')
      if (!keyRes.ok) throw new Error('Push notifications not available')
      const { vapidPublicKey } = await keyRes.json()
      if (!vapidPublicKey) throw new Error('VAPID key not configured')

      /* 3 — Request permission */
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setStatus('denied')
        return
      }

      /* 4 — Subscribe via Push API */
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
      })

      /* 5 — Save to server */
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      })

      setSubscription(sub)
      setStatus('subscribed')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Failed to enable notifications')
    }
  }

  const handleUnsubscribe = async () => {
    if (!subscription) return
    setStatus('loading')
    try {
      /* Remove from Push API */
      await subscription.unsubscribe()
      /* Remove from server */
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      setSubscription(null)
      setStatus('idle')
    } catch {
      setStatus('subscribed') // revert
    }
  }

  /* ── Don't render if push is not supported ── */
  if (status === 'unsupported') return null

  const isLoading     = status === 'loading'
  const isSubscribed  = status === 'subscribed'
  const isDenied      = status === 'denied'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        {/* Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            background: isSubscribed ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isSubscribed ? 'rgba(74,144,217,0.25)' : 'rgba(255,255,255,0.08)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}>
            {/* Bell icon */}
            <Notification1
              size={14}
              color={isSubscribed ? 'var(--accent)' : 'rgba(255,255,255,0.5)'}
              variant={isSubscribed ? 'TwoTone' : 'Linear'}
            />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)' }}>
              Push notifications
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
              {isDenied
                ? 'Blocked by browser — enable in site settings'
                : isSubscribed
                ? 'You\'ll get clinic updates and alerts'
                : 'Clinic availability, crisis alerts, reminders'}
            </div>
          </div>
        </div>

        {/* Toggle button */}
        {!isDenied && (
          <button
            onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={isLoading}
            aria-label={isSubscribed ? 'Turn off push notifications' : 'Turn on push notifications'}
            aria-pressed={isSubscribed}
            style={{
              flexShrink: 0,
              width: '44px', height: '24px', borderRadius: '12px', border: 'none',
              background: isSubscribed ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
              cursor: isLoading ? 'wait' : 'pointer',
              position: 'relative',
              transition: 'background 0.25s',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <span style={{
              position: 'absolute',
              top: '3px', left: isSubscribed ? '23px' : '3px',
              width: '18px', height: '18px', borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </button>
        )}

        {/* Blocked indicator */}
        {isDenied && (
          <span style={{ fontSize: '11px', color: 'var(--coral)', fontFamily: 'var(--font-inter)', flexShrink: 0 }}>
            Blocked
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p style={{ fontSize: '11px', color: 'var(--coral)', fontFamily: 'var(--font-inter)', paddingLeft: '42px' }}>
          {error}
        </p>
      )}

      {/* Success confirmation */}
      {isSubscribed && !error && (
        <p style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-inter)', paddingLeft: '42px' }}>
          ✓ Notifications active
        </p>
      )}
    </div>
  )
}
