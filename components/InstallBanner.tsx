'use client'
import { useEffect, useRef, useState } from 'react'
import { CloseCircle } from 'iconsax-react'

const DISMISSED_KEY  = 'nexus_install_dismissed'
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function wasDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem(DISMISSED_KEY)
    if (!ts) return false
    return Date.now() - parseInt(ts, 10) < DISMISS_TTL_MS
  } catch { return false }
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
}

export default function InstallBanner() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const [show,     setShow]     = useState(false)
  const [isIOSHint, setIsIOSHint] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)

  useEffect(() => {
    // Already installed or dismissed recently → stay hidden
    if (isStandalone() || wasDismissedRecently()) return

    const ios = isIOS()

    if (ios) {
      // iOS: show manual-install hint after 3s if not standalone
      const t = setTimeout(() => { setIsIOSHint(true); setShow(true) }, 3000)
      return () => clearTimeout(t)
    }

    // Android/Chrome: listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setShow(false)
    setShowIOSModal(false)
    try { localStorage.setItem(DISMISSED_KEY, String(Date.now())) } catch { /* ignore */ }
  }

  const install = async () => {
    if (isIOSHint) { setShowIOSModal(true); return }
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') setShow(false)
    deferredPrompt.current = null
  }

  if (!show) return null

  return (
    <>
      <div className="pwa-install-banner" role="banner" aria-live="polite">
        {/* App icon */}
        <div className="banner-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
            <path d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
            <path transform="rotate(120 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
            <path transform="rotate(240 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
            <circle cx="50" cy="50" r="5" fill="#4F8EF0" opacity="0.7"/>
          </svg>
        </div>

        {/* Text */}
        <div className="banner-text">
          <div className="banner-title">Add NEXUS to home screen</div>
          <div className="banner-sub">Works offline · No app store needed</div>
        </div>

        {/* Install */}
        <button className="banner-install-btn" onClick={install} aria-label="Install NEXUS app">
          {isIOSHint ? 'How?' : 'Install'}
        </button>

        {/* Dismiss */}
        <button className="banner-dismiss" onClick={dismiss} aria-label="Dismiss install prompt">
          <CloseCircle size={16} color="rgba(255,255,255,0.4)" variant="Linear" />
        </button>
      </div>

      {/* iOS manual-install modal */}
      {showIOSModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9800,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'flex-end', padding: '16px',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setShowIOSModal(false); dismiss() } }}
        >
          <div style={{
            width: '100%', background: 'rgba(8,10,22,0.98)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '20px', padding: '24px 20px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.75)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                Add to Home Screen
              </span>
              <button onClick={() => { setShowIOSModal(false); dismiss() }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-3)' }}>
                <CloseCircle size={18} variant="Linear" />
              </button>
            </div>

            {/* Steps */}
            {[
              { n: 1, text: 'Tap the Share button at the bottom of Safari (the box with an arrow)' },
              { n: 2, text: 'Scroll down and tap "Add to Home Screen"' },
              { n: 3, text: 'Tap "Add" — NEXUS will appear on your home screen like a native app' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(79,142,240,0.15)', border: '1px solid rgba(79,142,240,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: 'var(--accent)',
                  fontFamily: 'var(--font-inter)',
                }}>
                  {s.n}
                </span>
                <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.5, fontFamily: 'var(--font-inter)', marginTop: '2px' }}>
                  {s.text}
                </p>
              </div>
            ))}

            <button
              onClick={() => { setShowIOSModal(false); dismiss() }}
              style={{
                width: '100%', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: '12px', padding: '14px',
                fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-inter)',
                cursor: 'pointer', marginTop: '4px',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
