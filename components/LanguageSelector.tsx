'use client'
import { useEffect, useState } from 'react'
import { CloseSquare, Global } from 'iconsax-react'

const STORAGE_KEY = 'nexus_language'

const LANGUAGES = [
  { code: 'en', label: 'English',    native: 'English',    flag: '🇺🇸' },
  { code: 'es', label: 'Spanish',    native: 'Español',    flag: '🇪🇸' },
  { code: 'zh', label: 'Chinese',    native: '中文',        flag: '🇨🇳' },
  { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'pt', label: 'Portuguese', native: 'Português',  flag: '🇧🇷' },
  { code: 'fr', label: 'French',     native: 'Français',   flag: '🇫🇷' },
  { code: 'ar', label: 'Arabic',     native: 'العربية',    flag: '🇸🇦' },
  { code: 'ko', label: 'Korean',     native: '한국어',      flag: '🇰🇷' },
  { code: 'tl', label: 'Tagalog',    native: 'Tagalog',    flag: '🇵🇭' },
  { code: 'ru', label: 'Russian',    native: 'Русский',    flag: '🇷🇺' },
  { code: 'hi', label: 'Hindi',      native: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'am', label: 'Amharic',    native: 'አማርኛ',       flag: '🇪🇹' },
]

export default function LanguageSelector() {
  const [visible, setVisible] = useState(false)      // full modal
  const [banner, setBanner]   = useState<typeof LANGUAGES[number] | null>(null) // compact offer
  const [selected, setSelected] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)

  /* First visit: NEVER interrupt with a modal.
     If the browser prefers a supported non-English language, offer it in a
     small dismissible banner. Otherwise silently default to English. */
  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return
    const pref = (navigator.language || 'en').slice(0, 2).toLowerCase()
    const match = LANGUAGES.find(l => l.code === pref && l.code !== 'en')
    if (match) {
      const t = setTimeout(() => setBanner(match), 1200)
      return () => clearTimeout(t)
    }
    localStorage.setItem(STORAGE_KEY, 'en')
  }, [])

  const choose = (code: string) => {
    setSelected(code)
    localStorage.setItem(STORAGE_KEY, code)
    window.dispatchEvent(new CustomEvent('nexus:lang-changed'))
    setBanner(null)
    close()
  }

  const dismissBanner = () => {
    localStorage.setItem(STORAGE_KEY, 'en')
    setBanner(null)
  }

  const close = () => {
    setClosing(true)
    setTimeout(() => setVisible(false), 380)
  }

  /* ── Compact language offer banner (non-blocking) ── */
  if (!visible && banner) {
    return (
      <div
        role="region"
        aria-label="Language suggestion"
        style={{
          position: 'fixed', bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))',
          left: '50%', transform: 'translateX(-50%)', zIndex: 9970,
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(13,24,43,0.92)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-pill)',
          padding: '8px 10px 8px 16px',
          boxShadow: 'var(--shadow-elevated)',
          animation: 'lang-fade-in 0.4s ease forwards',
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        <Global size={16} color="var(--accent2)" aria-hidden="true" style={{ flexShrink: 0 }} />
        <button
          onClick={() => choose(banner.code)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text)', fontFamily: 'var(--font-inter)',
            fontSize: '13.5px', fontWeight: 600, whiteSpace: 'nowrap',
          }}
        >
          {banner.native} →
        </button>
        <button
          onClick={() => { setBanner(null); setVisible(true) }}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-pill)', cursor: 'pointer', padding: '5px 12px',
            color: 'var(--text-2)', fontFamily: 'var(--font-inter)', fontSize: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          More
        </button>
        <button
          onClick={dismissBanner}
          aria-label="Dismiss language suggestion"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: 'var(--text-3)', display: 'flex', alignItems: 'center',
          }}
        >
          <CloseSquare size={16} color="currentColor" aria-hidden="true" />
        </button>
        <style>{`@keyframes lang-fade-in { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
      </div>
    )
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 9980,
          background: 'rgba(7,7,15,0.8)',
          backdropFilter: 'blur(8px)',
          animation: closing ? 'lang-fade-out 0.35s ease forwards' : 'lang-fade-in 0.35s ease forwards',
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose your language"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9981,
          width: 'calc(100% - 2rem)',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(160deg, #0d1315, #0a0d10)',
          border: '1px solid rgba(74,144,217,0.18)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 48px 96px rgba(0,0,0,0.7), 0 0 0 1px rgba(74,144,217,0.06)',
          animation: closing
            ? 'lang-slide-out 0.38s cubic-bezier(0.4,0,1,1) forwards'
            : 'lang-slide-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        {/* Top glow line */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(74,144,217,0.55), transparent)',
        }} />

        {/* Close */}
        <button
          onClick={close}
          aria-label="Skip language selection"
          style={{
            position: 'absolute', top: '1.25rem', right: '1.25rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(232,240,241,0.3)', padding: '6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(232,240,241,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,240,241,0.3)')}
        >
          <CloseSquare size={16} color="rgba(232,240,241,0.5)" variant="Linear" />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '100px',
            background: 'rgba(74,144,217,0.08)',
            border: '1px solid rgba(74,144,217,0.14)',
            marginBottom: '16px',
          }}>
            <Global size={14} color="var(--accent)" variant="Linear" />
            <span style={{ fontSize: '11px', color: 'var(--accent)', letterSpacing: '0.08em', fontFamily: 'var(--font-inter)' }}>NEXUS · 12 languages</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: '8px',
          }}>
            Choose your language
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(232,240,241,0.45)',
            fontFamily: 'var(--font-inter)',
            fontWeight: 300,
            lineHeight: 1.6,
          }}>
            NEXUS is available in 12 languages. Your choice is saved automatically.
          </p>
        </div>

        {/* Language grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}>
          {LANGUAGES.map((lang, i) => (
            <LangButton
              key={lang.code}
              lang={lang}
              selected={selected === lang.code}
              delay={i * 30}
              onClick={() => choose(lang.code)}
            />
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          marginTop: '1.5rem',
          fontSize: '11px',
          color: 'rgba(232,240,241,0.25)',
          fontFamily: 'var(--font-inter)',
          textAlign: 'center',
        }}>
          You can change this anytime in Settings
        </p>
      </div>

      <style>{`
        @keyframes lang-btn-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lang-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lang-fade-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes lang-slide-in {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 24px)) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes lang-slide-out {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          to   { opacity: 0; transform: translate(-50%, calc(-50% + 16px)) scale(0.98); }
        }
        @media (max-width: 480px) {
          .lang-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  )
}

function LangButton({
  lang, selected, delay, onClick,
}: {
  lang: typeof LANGUAGES[0]
  selected: boolean
  delay: number
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        borderRadius: '12px',
        border: selected
          ? '1px solid rgba(74,144,217,0.55)'
          : hovered
            ? '1px solid rgba(74,144,217,0.25)'
            : '1px solid rgba(255,255,255,0.07)',
        background: selected
          ? 'rgba(74,144,217,0.12)'
          : hovered
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(255,255,255,0.02)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.18s ease',
        animation: `lang-btn-in 0.4s ${delay}ms both`,
        boxShadow: selected ? '0 0 0 3px rgba(74,144,217,0.08)' : 'none',
      }}
    >
      <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>{lang.flag}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          color: selected ? '#8ab5bc' : hovered ? 'rgba(232,240,241,0.9)' : 'rgba(232,240,241,0.75)',
          fontFamily: 'var(--font-display)',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {lang.native}
        </div>
        <div style={{
          fontSize: '10px',
          color: 'rgba(232,240,241,0.3)',
          fontFamily: 'var(--font-inter)',
          lineHeight: 1.3,
          marginTop: '1px',
        }}>
          {lang.label}
        </div>
      </div>
    </button>
  )
}
