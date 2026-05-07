'use client'
/**
 * PwaInstallPrompt — 5.10 PWA Completion
 *
 * Listens for the native `beforeinstallprompt` event and shows a
 * custom install banner when:
 *   1. The app is not already installed (not running in standalone mode)
 *   2. The user hasn't dismissed or accepted the prompt before
 *   3. At least 30 seconds have passed since page load (non-intrusive)
 *
 * The banner uses the `.pwa-install-prompt` CSS class defined in globals.css
 * which handles the slide-up animation and mobile dock clearance.
 *
 * Supported browsers: Chrome/Edge on Android and desktop, Samsung Internet.
 * Safari uses a different flow (manual Add to Home Screen); the prompt is
 * hidden on Safari since `beforeinstallprompt` never fires there.
 */
import { useEffect, useState, useCallback, useRef } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_KEY = 'nexus_pwa_prompt_dismissed'
const SHOW_DELAY_MS = 30_000  // 30 s after load

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [mounted,    setMounted]    = useState(false)   // controls DOM presence
  const [animIn,     setAnimIn]     = useState(false)   // triggers .visible CSS class for slide-in
  const [installing, setInstalling] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── Add .visible class one frame after mount for CSS entrance transition ── */
  useEffect(() => {
    if (mounted) {
      const raf = requestAnimationFrame(() => setAnimIn(true))
      return () => cancelAnimationFrame(raf)
    }
  }, [mounted])

  /* ── Capture the browser prompt event ── */
  useEffect(() => {
    // Already installed as PWA?
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // User already dismissed?
    if (sessionStorage.getItem(STORAGE_KEY)) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Mount after delay, then trigger CSS entrance
      timerRef.current = setTimeout(() => setMounted(true), SHOW_DELAY_MS)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  /* ── Handle install click ── */
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setAnimIn(false)
        setTimeout(() => { setMounted(false); setDeferredPrompt(null) }, 400)
      } else {
        sessionStorage.setItem(STORAGE_KEY, '1')
        setAnimIn(false)
        setTimeout(() => setMounted(false), 400)
      }
    } catch {
      /* prompt() can throw if called more than once */
    } finally {
      setInstalling(false)
    }
  }, [deferredPrompt])

  /* ── Handle dismiss ── */
  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setAnimIn(false)
    setTimeout(() => setMounted(false), 400)
  }, [])

  if (!mounted || !deferredPrompt) return null

  return (
    <div
      className={`pwa-install-prompt${animIn ? ' visible' : ''}`}
      role="dialog"
      aria-label="Install NEXUS app"
      aria-live="polite"
    >
      {/* App icon */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(74,144,217,0.2) 0%, rgba(74,144,217,0.05) 100%)',
        border: '1px solid rgba(74,144,217,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* NEXUS N monogram */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 20V4L12 14.5L20 4V20"
            stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: 600, color: 'var(--text)',
          fontFamily: 'var(--font-inter)', lineHeight: 1.3,
          marginBottom: '2px',
        }}>
          Install NEXUS
        </div>
        <div style={{
          fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)',
          lineHeight: 1.4,
        }}>
          Add to home screen for instant access — works offline
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', fontSize: '11px', fontFamily: 'var(--font-inter)',
            padding: '6px 8px', borderRadius: '6px',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          Not now
        </button>

        <button
          onClick={handleInstall}
          disabled={installing}
          aria-label="Install NEXUS as app"
          style={{
            background: installing ? 'rgba(74,144,217,0.1)' : 'rgba(74,144,217,0.15)',
            border: '1px solid rgba(74,144,217,0.3)',
            color: 'var(--accent)',
            fontSize: '12px', fontWeight: 600,
            fontFamily: 'var(--font-inter)',
            padding: '7px 14px', borderRadius: '8px',
            cursor: installing ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            if (!installing) {
              e.currentTarget.style.background = 'rgba(74,144,217,0.22)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(74,144,217,0.15)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          {installing ? 'Installing…' : 'Install'}
        </button>
      </div>
    </div>
  )
}
