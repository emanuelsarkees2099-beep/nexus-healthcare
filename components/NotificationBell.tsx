'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, BellRing, X, CheckCheck, Clock, Zap, Star, Calendar } from 'lucide-react'

export type NexusNotification = {
  id: string
  type: 'digest' | 'clinic_update' | 'new_program' | 'reminder' | 'system'
  title: string
  body: string
  url?: string
  read: boolean
  created_at: string
}

const STORAGE_KEY = 'nexus_notifications'
const PUSH_KEY    = 'nexus_push_subscribed'

function seed(): NexusNotification[] {
  return [
    {
      id: 'welcome-1',
      type: 'system',
      title: 'Welcome to NEXUS',
      body: 'Your free healthcare navigator is ready. Search clinics near you to get started.',
      url: '/search',
      read: false,
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'program-aca',
      type: 'new_program',
      title: 'ACA Open Enrollment is open',
      body: 'You may qualify for $0/month plans through the marketplace. Deadline approaching.',
      url: '/programs',
      read: false,
      created_at: new Date(Date.now() - 86400 * 1000).toISOString(),
    },
    {
      id: 'rights-emtala',
      type: 'system',
      title: 'Know your rights',
      body: 'Under EMTALA, no ER can turn you away — even without insurance.',
      url: '/rights',
      read: true,
      created_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    },
  ]
}

function loadNotifications(): NexusNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = seed()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
    return JSON.parse(raw) as NexusNotification[]
  } catch {
    return seed()
  }
}

function saveNotifications(list: NexusNotification[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const TYPE_ICON: Record<NexusNotification['type'], React.ReactNode> = {
  digest:        <Star size={13} />,
  clinic_update: <Clock size={13} />,
  new_program:   <Zap size={13} />,
  reminder:      <Calendar size={13} />,
  system:        <Bell size={13} />,
}

const TYPE_COLOR: Record<NexusNotification['type'], string> = {
  digest:        '#fbbf24',
  clinic_update: 'var(--accent)',
  new_program:   '#60a5fa',
  reminder:      '#f472b6',
  system:        'var(--accent)',
}

export default function NotificationBell() {
  const [open,          setOpen]          = useState(false)
  const [notifications, setNotifications] = useState<NexusNotification[]>([])
  const [pushOn,        setPushOn]        = useState(false)
  const [pushOk,        setPushOk]        = useState(false)
  const [subscribing,   setSubscribing]   = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  /* ── Init ── */
  useEffect(() => {
    setNotifications(loadNotifications())
    setPushOn(localStorage.getItem(PUSH_KEY) === 'true')
    setPushOk('PushManager' in window && 'serviceWorker' in navigator && 'Notification' in window)

    const handler = (e: Event) => {
      const notif = (e as CustomEvent<NexusNotification>).detail
      setNotifications(prev => {
        const next = [notif, ...prev]
        saveNotifications(next)
        return next
      })
    }
    window.addEventListener('nexus:notification', handler as EventListener)
    return () => window.removeEventListener('nexus:notification', handler as EventListener)
  }, [])

  /* ── Close on outside click ── */
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const unread = notifications.filter(n => !n.read).length

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }))
      saveNotifications(next)
      return next
    })
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n)
      saveNotifications(next)
      return next
    })
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id)
      saveNotifications(next)
      return next
    })
  }, [])

  const togglePush = useCallback(async () => {
    if (!pushOk) return
    if (pushOn) {
      setPushOn(false)
      localStorage.removeItem(PUSH_KEY)
      return
    }
    setSubscribing(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm === 'granted') {
        const reg = await navigator.serviceWorker.ready
        await reg.showNotification('NEXUS notifications enabled', {
          body: "You'll be notified about clinic updates and new programs.",
          icon: '/icons/icon-192.png',
          tag:  'nexus-push-enabled',
        })
        setPushOn(true)
        localStorage.setItem(PUSH_KEY, 'true')
      }
    } catch { /* user denied or SW not ready */ }
    finally { setSubscribing(false) }
  }, [pushOk, pushOn])

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={`Notifications${unread > 0 ? ` — ${unread} unread` : ''}`}
        style={{
          position: 'relative',
          width: '34px', height: '34px', borderRadius: '9px',
          background: unread > 0 ? 'rgba(110,231,183,0.10)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${unread > 0 ? 'rgba(110,231,183,0.25)' : 'rgba(255,255,255,0.08)'}`,
          cursor: 'pointer',
          color: unread > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(110,231,183,0.18)'; e.currentTarget.style.color = 'var(--accent)' }}
        onMouseLeave={e => { e.currentTarget.style.background = unread > 0 ? 'rgba(110,231,183,0.10)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = unread > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.45)' }}
      >
        {unread > 0 ? <BellRing size={15} /> : <Bell size={15} />}
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#f87171', color: '#fff',
            borderRadius: '50%', minWidth: '15px', height: '15px',
            fontSize: '9px', fontWeight: 700, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-inter)', padding: '0 3px',
            border: '1.5px solid rgba(8,8,18,0.8)',
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: '320px', maxHeight: '450px',
          background: 'rgba(8,10,22,0.97)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.65), 0 0 0 0.5px rgba(255,255,255,0.04) inset',
          zIndex: 700, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          backdropFilter: 'blur(24px)',
          animation: 'slideDownFade 0.22s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <style>{`@keyframes slideDownFade { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Notifications</span>
              {unread > 0 && (
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: '#f87171', borderRadius: '100px', padding: '1px 7px', fontFamily: 'var(--font-inter)' }}>
                  {unread} new
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {unread > 0 && (
                <button onClick={markAllRead} title="Mark all read"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px', borderRadius: '5px', display: 'flex', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px', borderRadius: '5px', display: 'flex', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'thin' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center' }}>
                <Bell size={24} color="rgba(255,255,255,0.12)" style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>No notifications yet</p>
              </div>
            ) : notifications.map(notif => (
              <NotifRow
                key={notif.id}
                notif={notif}
                onRead={markRead}
                onDismiss={dismiss}
                onClose={() => setOpen(false)}
              />
            ))}
          </div>

          {/* Footer — push toggle */}
          {pushOk && (
            <div style={{
              padding: '11px 16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>Push notifications</span>
              <button
                onClick={togglePush}
                disabled={subscribing}
                style={{
                  padding: '4px 12px', borderRadius: '100px', fontSize: '11px',
                  fontFamily: 'var(--font-inter)', fontWeight: 600, cursor: subscribing ? 'not-allowed' : 'pointer',
                  background: pushOn ? 'rgba(110,231,183,0.12)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${pushOn ? 'rgba(110,231,183,0.28)' : 'rgba(255,255,255,0.10)'}`,
                  color: pushOn ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s', opacity: subscribing ? 0.6 : 1,
                }}
              >
                {subscribing ? 'Enabling…' : pushOn ? '✓ Enabled' : 'Enable'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Individual notification row ── */
function NotifRow({ notif, onRead, onDismiss, onClose }: {
  notif: NexusNotification
  onRead: (id: string) => void
  onDismiss: (id: string) => void
  onClose: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const color = TYPE_COLOR[notif.type]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        onRead(notif.id)
        if (notif.url) { window.location.href = notif.url; onClose() }
      }}
      style={{
        display: 'flex', gap: '10px',
        padding: '12px 16px',
        background: hovered ? 'rgba(255,255,255,0.04)' : notif.read ? 'transparent' : 'rgba(110,231,183,0.025)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        cursor: notif.url ? 'pointer' : 'default',
        position: 'relative', transition: 'background 0.15s',
      }}
    >
      {/* Icon */}
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
        background: `${color}14`, border: `1px solid ${color}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, marginTop: '1px',
      }}>
        {TYPE_ICON[notif.type]}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '12.5px', fontWeight: notif.read ? 400 : 600,
          color: notif.read ? 'var(--text-2)' : 'var(--text)',
          fontFamily: 'var(--font-inter)', marginBottom: '3px', lineHeight: 1.4,
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          {notif.title}
          {!notif.read && (
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, display: 'inline-block' }} />
          )}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', lineHeight: 1.5, marginBottom: '4px' }}>
          {notif.body}
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-mono),monospace' }}>
          {timeAgo(notif.created_at)}
        </div>
      </div>

      {/* Dismiss */}
      {hovered && (
        <button
          onClick={e => { e.stopPropagation(); onDismiss(notif.id) }}
          aria-label="Dismiss"
          style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', padding: '3px', borderRadius: '4px',
            display: 'flex', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
        >
          <X size={11} />
        </button>
      )}
    </div>
  )
}
