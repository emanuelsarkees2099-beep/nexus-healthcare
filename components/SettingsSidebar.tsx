'use client'
import { useEffect, useState } from 'react'

const LANG_KEY   = 'nexus_language'
const A11Y_KEY   = 'nexus_a11y'

const LANGUAGES = [
  { code: 'en', native: 'English',    flag: '🇺🇸' },
  { code: 'es', native: 'Español',    flag: '🇪🇸' },
  { code: 'zh', native: '中文',        flag: '🇨🇳' },
  { code: 'vi', native: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'pt', native: 'Português',  flag: '🇧🇷' },
  { code: 'fr', native: 'Français',   flag: '🇫🇷' },
  { code: 'ar', native: 'العربية',    flag: '🇸🇦' },
  { code: 'ko', native: '한국어',      flag: '🇰🇷' },
  { code: 'tl', native: 'Tagalog',    flag: '🇵🇭' },
  { code: 'ru', native: 'Русский',    flag: '🇷🇺' },
  { code: 'hi', native: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'am', native: 'አማርኛ',       flag: '🇪🇹' },
]

interface A11ySettings {
  fontSize: number       // 0 = default, 1 = large, 2 = larger
  highContrast: boolean
  reduceMotion: boolean
}

const DEFAULT_A11Y: A11ySettings = { fontSize: 0, highContrast: false, reduceMotion: false }

function loadA11y(): A11ySettings {
  if (typeof localStorage === 'undefined') return DEFAULT_A11Y
  try { return { ...DEFAULT_A11Y, ...JSON.parse(localStorage.getItem(A11Y_KEY) ?? '{}') } }
  catch { return DEFAULT_A11Y }
}

function applyA11y(s: A11ySettings) {
  const root = document.documentElement
  root.style.setProperty('--user-font-scale', s.fontSize === 2 ? '1.2' : s.fontSize === 1 ? '1.1' : '1')
  root.classList.toggle('high-contrast', s.highContrast)
  root.classList.toggle('reduce-motion', s.reduceMotion)
  if (s.reduceMotion) {
    root.style.setProperty('--ease-spring', 'ease')
  } else {
    root.style.removeProperty('--ease-spring')
  }
}

export default function SettingsSidebar() {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [lang, setLang] = useState('en')
  const [a11y, setA11y] = useState<A11ySettings>(DEFAULT_A11Y)
  const [activeSection, setActiveSection] = useState<'language' | 'accessibility' | 'display'>('language')

  useEffect(() => {
    setLang(localStorage.getItem(LANG_KEY) ?? 'en')
    const saved = loadA11y()
    setA11y(saved)
    applyA11y(saved)
  }, [])

  useEffect(() => {
    const handler = () => setOpen(true)
    document.addEventListener('nexus:settings:open', handler)
    return () => document.removeEventListener('nexus:settings:open', handler)
  }, [])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => {
    setClosing(true)
    setTimeout(() => { setOpen(false); setClosing(false) }, 320)
  }

  const setLanguage = (code: string) => {
    setLang(code)
    localStorage.setItem(LANG_KEY, code)
  }

  const updateA11y = (patch: Partial<A11ySettings>) => {
    const next = { ...a11y, ...patch }
    setA11y(next)
    localStorage.setItem(A11Y_KEY, JSON.stringify(next))
    applyA11y(next)
  }

  if (!open) return null

  const sectionBtn = (id: typeof activeSection, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveSection(id)}
      style={{
        flex: 1,
        padding: '8px 6px',
        borderRadius: '10px',
        border: 'none',
        background: activeSection === id ? 'rgba(109,145,151,0.15)' : 'transparent',
        color: activeSection === id ? '#8ab5bc' : 'rgba(232,240,241,0.45)',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: activeSection === id ? 600 : 400,
        fontFamily: 'var(--font-inter)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px',
        transition: 'all 0.18s',
        outline: 'none',
      }}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 9970,
          background: 'rgba(7,7,15,0.6)',
          backdropFilter: 'blur(4px)',
          animation: closing ? 'sf-fade-out 0.3s ease forwards' : 'sf-fade-in 0.25s ease forwards',
        }}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        style={{
          position: 'fixed',
          top: 0, right: 0,
          width: '340px',
          maxWidth: '100vw',
          height: '100dvh',
          zIndex: 9971,
          background: '#0a0d11',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-32px 0 80px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          animation: closing ? 'sf-slide-out 0.32s cubic-bezier(0.4,0,1,1) forwards' : 'sf-slide-in 0.38s cubic-bezier(0.16,1,0.3,1) forwards',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontSize: '16px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Settings</h2>
            <p style={{ fontSize: '11px', color: 'rgba(232,240,241,0.35)', fontFamily: 'var(--font-inter)', margin: '3px 0 0' }}>Preferences saved automatically</p>
          </div>
          <button
            onClick={close}
            aria-label="Close settings"
            style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
              color: 'rgba(232,240,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(232,240,241,0.9)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(232,240,241,0.5)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Section tabs */}
        <div style={{
          display: 'flex', gap: '4px',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          {sectionBtn('language', 'Language', (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          ))}
          {sectionBtn('accessibility', 'Accessibility', (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="4" r="1.5"/><path d="M9 9h6m-3 0v10M6 9l3 0M18 9l-3 0"/>
            </svg>
          ))}
          {sectionBtn('display', 'Display', (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>

          {/* ── Language ── */}
          {activeSection === 'language' && (
            <div>
              <p style={{ fontSize: '12px', color: 'rgba(232,240,241,0.4)', fontFamily: 'var(--font-inter)', marginBottom: '14px', lineHeight: 1.6 }}>
                NEXUS supports 12 languages. Your selection affects the SMS service and future translated content.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '9px 11px', borderRadius: '10px',
                      border: lang === l.code ? '1px solid rgba(109,145,151,0.5)' : '1px solid rgba(255,255,255,0.07)',
                      background: lang === l.code ? 'rgba(109,145,151,0.12)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  >
                    <span style={{ fontSize: '16px', lineHeight: 1 }}>{l.flag}</span>
                    <span style={{
                      fontSize: '12px', fontWeight: lang === l.code ? 600 : 400,
                      color: lang === l.code ? '#8ab5bc' : 'rgba(232,240,241,0.7)',
                      fontFamily: 'var(--font-sora)', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{l.native}</span>
                    {lang === l.code && (
                      <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6d9197" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Accessibility ── */}
          {activeSection === 'accessibility' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Font size */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(232,240,241,0.8)', fontFamily: 'var(--font-sora)', marginBottom: '4px' }}>Text size</label>
                <p style={{ fontSize: '11px', color: 'rgba(232,240,241,0.35)', fontFamily: 'var(--font-inter)', marginBottom: '12px' }}>Adjusts the base font size across the app</p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['Default', 'Large', 'Larger'] as const).map((label, i) => (
                    <button
                      key={label}
                      onClick={() => updateA11y({ fontSize: i })}
                      style={{
                        flex: 1, padding: '8px 6px', borderRadius: '9px',
                        border: a11y.fontSize === i ? '1px solid rgba(109,145,151,0.5)' : '1px solid rgba(255,255,255,0.07)',
                        background: a11y.fontSize === i ? 'rgba(109,145,151,0.12)' : 'rgba(255,255,255,0.03)',
                        color: a11y.fontSize === i ? '#8ab5bc' : 'rgba(232,240,241,0.55)',
                        fontSize: `${12 + i}px`, fontWeight: a11y.fontSize === i ? 600 : 400,
                        fontFamily: 'var(--font-inter)', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* High contrast */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(232,240,241,0.8)', fontFamily: 'var(--font-sora)', marginBottom: '2px' }}>High contrast</div>
                  <div style={{ fontSize: '11px', color: 'rgba(232,240,241,0.35)', fontFamily: 'var(--font-inter)' }}>Increases text and border contrast</div>
                </div>
                <Toggle checked={a11y.highContrast} onChange={v => updateA11y({ highContrast: v })} />
              </div>

              {/* Reduce motion */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(232,240,241,0.8)', fontFamily: 'var(--font-sora)', marginBottom: '2px' }}>Reduce motion</div>
                  <div style={{ fontSize: '11px', color: 'rgba(232,240,241,0.35)', fontFamily: 'var(--font-inter)' }}>Minimizes animations and transitions</div>
                </div>
                <Toggle checked={a11y.reduceMotion} onChange={v => updateA11y({ reduceMotion: v })} />
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(109,145,151,0.06)', border: '1px solid rgba(109,145,151,0.12)' }}>
                <p style={{ fontSize: '11px', color: 'rgba(232,240,241,0.4)', fontFamily: 'var(--font-inter)', lineHeight: 1.6, margin: 0 }}>
                  NEXUS is built to WCAG AAA standards. All pages support screen readers, keyboard navigation, and high-contrast modes.
                </p>
              </div>
            </div>
          )}

          {/* ── Display ── */}
          {activeSection === 'display' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(232,240,241,0.8)', fontFamily: 'var(--font-sora)', marginBottom: '4px' }}>Theme</div>
                <div style={{ fontSize: '11px', color: 'rgba(232,240,241,0.35)', fontFamily: 'var(--font-inter)', marginBottom: '12px' }}>Color scheme preference</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={{ flex: 1, padding: '8px', borderRadius: '9px', border: '1px solid rgba(109,145,151,0.5)', background: 'rgba(109,145,151,0.12)', color: '#8ab5bc', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-inter)', cursor: 'pointer' }}>
                    Dark
                  </button>
                  <button style={{ flex: 1, padding: '8px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: 'rgba(232,240,241,0.4)', fontSize: '12px', fontFamily: 'var(--font-inter)', cursor: 'not-allowed', opacity: 0.5 }} disabled>
                    Light
                  </button>
                  <button style={{ flex: 1, padding: '8px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: 'rgba(232,240,241,0.4)', fontSize: '12px', fontFamily: 'var(--font-inter)', cursor: 'not-allowed', opacity: 0.5 }} disabled>
                    System
                  </button>
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(232,240,241,0.8)', fontFamily: 'var(--font-sora)', marginBottom: '2px' }}>App version</div>
                <div style={{ fontSize: '11px', color: 'rgba(232,240,241,0.35)', fontFamily: 'var(--font-inter)', marginTop: '4px' }}>NEXUS Beta · v0.1.0</div>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem(LANG_KEY)
                  localStorage.removeItem(A11Y_KEY)
                  setLang('en')
                  setA11y(DEFAULT_A11Y)
                  applyA11y(DEFAULT_A11Y)
                }}
                style={{
                  padding: '10px', borderRadius: '10px',
                  border: '1px solid rgba(255,80,80,0.2)', background: 'rgba(255,80,80,0.04)',
                  color: 'rgba(255,120,120,0.7)', fontSize: '12px', fontFamily: 'var(--font-inter)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.08)'; e.currentTarget.style.color = 'rgba(255,120,120,0.9)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.04)'; e.currentTarget.style.color = 'rgba(255,120,120,0.7)' }}
              >
                Reset all preferences
              </button>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        @keyframes sf-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sf-fade-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes sf-slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes sf-slide-out {
          from { transform: translateX(0); }
          to   { transform: translateX(100%); }
        }
        .high-contrast { --text-2: rgba(232,240,241,0.85) !important; --text-3: rgba(232,240,241,0.6) !important; --border: rgba(109,145,151,0.4) !important; }
        .reduce-motion *, .reduce-motion *::before, .reduce-motion *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
      `}</style>
    </>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: '40px', height: '22px', borderRadius: '11px',
        border: 'none', cursor: 'pointer', flexShrink: 0,
        background: checked ? '#6d9197' : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'background 0.25s',
        outline: 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: '3px',
        left: checked ? '21px' : '3px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}
