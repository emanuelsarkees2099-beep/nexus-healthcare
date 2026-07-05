'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Sun1, Global, Profile, Notification, Keyboard, ShieldTick, CloseCircle, Trash, TickCircle, ExportSquare } from 'iconsax-react'
const PushNotificationToggle = dynamic(() => import('@/components/PushNotificationToggle'), { ssr: false })

/* ── Storage keys ── */
const LANG_KEY  = 'nexus_language'
const A11Y_KEY  = 'nexus_a11y'
const THEME_KEY = 'nexus_theme'

/* ── Theme ── */
function applyTheme(t: 'dark' | 'light') {
  if (t === 'light') document.documentElement.setAttribute('data-theme', 'light')
  else document.documentElement.removeAttribute('data-theme')
  localStorage.setItem(THEME_KEY, t)
}

/* ── Languages ── */
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

/* ── Keyboard shortcuts ── */
const SHORTCUTS = [
  { keys: ['⌘', 'K'],       label: 'Open command palette' },
  { keys: ['⌘', '/'],       label: 'Focus search'         },
  { keys: ['Esc'],           label: 'Close modals'         },
  { keys: ['⌘', 'B'],       label: 'Toggle sidebar'       },
  { keys: ['⌘', 'D'],       label: 'Go to dashboard'      },
  { keys: ['⌘', 'Shift', 'F'], label: 'Find care near me' },
]

/* ── A11y settings ── */
interface A11ySettings {
  fontSize:      number   // 0 = default, 1 = large, 2 = larger
  highContrast:  boolean
  reduceMotion:  boolean
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
  if (s.reduceMotion) root.style.setProperty('--ease-spring', 'ease')
  else root.style.removeProperty('--ease-spring')
}

/* ── Section type ── */
type Section = 'appearance' | 'language' | 'accessibility' | 'notifications' | 'privacy' | 'shortcuts'

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'appearance',    label: 'Appearance',    icon: <Sun1      size={14} color="rgba(255,255,255,0.55)" variant="Linear" /> },
  { id: 'language',      label: 'Language',      icon: <Global    size={14} color="rgba(255,255,255,0.55)" variant="Linear" /> },
  { id: 'accessibility', label: 'Accessibility', icon: <Profile   size={14} color="rgba(255,255,255,0.55)" variant="Linear" /> },
  { id: 'notifications', label: 'Notifications', icon: <Notification size={14} color="rgba(255,255,255,0.55)" variant="Linear" /> },
  { id: 'shortcuts',     label: 'Shortcuts',     icon: <Keyboard  size={14} color="rgba(255,255,255,0.55)" variant="Linear" /> },
  { id: 'privacy',       label: 'Privacy & Data',icon: <ShieldTick size={14} color="rgba(255,255,255,0.55)" variant="Linear" /> },
]

/* ── Reusable sub-components ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: 600,
      letterSpacing: '0.09em', textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-inter)',
      padding: '0 0 8px',
      marginBottom: '2px',
    }}>
      {children}
    </div>
  )
}

function Row({
  label, description, control,
}: { label: string; description?: string; control: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 14px', borderRadius: 'var(--r-sm)',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.055)',
    }}>
      <div style={{ flex: 1, marginRight: 12 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.80)', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.30)', fontFamily: 'var(--font-inter)', marginTop: '2px', lineHeight: 1.5 }}>
            {description}
          </div>
        )}
      </div>
      {control}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: '38px', height: '21px', borderRadius: '100px',
        border: '1px solid',
        borderColor: checked ? 'rgba(74,144,217,0.6)' : 'rgba(255,255,255,0.12)',
        cursor: 'pointer', flexShrink: 0,
        background: checked ? 'rgba(74,144,217,0.35)' : 'rgba(255,255,255,0.06)',
        position: 'relative', transition: 'background 0.2s, border-color 0.2s',
        outline: 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: '2px',
        left: checked ? '18px' : '2px',
        width: '15px', height: '15px', borderRadius: '50%',
        background: checked ? '#4A8FD4' : 'rgba(255,255,255,0.4)',
        transition: 'left 0.22s cubic-bezier(0.34,1.56,0.64,1), background 0.2s',
        boxShadow: checked ? '0 0 8px rgba(74,144,217,0.5)' : 'none',
      }} />
    </button>
  )
}

function SegmentControl({
  options, value, onChange,
}: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{
      display: 'inline-flex', gap: '2px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 'var(--r-sm)', padding: '3px',
    }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: '5px 12px', borderRadius: '7px', border: 'none',
            background: value === opt ? 'rgba(74,144,217,0.18)' : 'transparent',
            color: value === opt ? 'rgba(74,144,217,0.95)' : 'rgba(255,255,255,0.35)',
            fontSize: '11px', fontWeight: value === opt ? 600 : 400,
            fontFamily: 'var(--font-inter)', cursor: 'pointer',
            transition: 'all 0.15s', outline: 'none',
            borderColor: value === opt ? 'rgba(74,144,217,0.25)' : 'transparent',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

/* ── Main component ── */
export default function SettingsSidebar() {
  const [open,          setOpen]         = useState(false)
  const [closing,       setClosing]      = useState(false)
  const [lang,          setLang]         = useState('en')
  const [a11y,          setA11y]         = useState<A11ySettings>(DEFAULT_A11Y)
  const [section,       setSection]      = useState<Section>('appearance')
  const [theme,         setTheme]        = useState<'dark' | 'light'>('dark')
  const [dataSaving,    setDataSaving]   = useState(false)

  /* ── Init from localStorage ── */
  useEffect(() => {
    setLang(localStorage.getItem(LANG_KEY) ?? 'en')
    const saved = loadA11y()
    setA11y(saved); applyA11y(saved)
    const savedTheme = (localStorage.getItem(THEME_KEY) ?? 'dark') as 'dark' | 'light'
    setTheme(savedTheme); applyTheme(savedTheme)
    const ds = localStorage.getItem('nexus_low_bandwidth') === 'true'
    setDataSaving(ds)
  }, [])

  /* ── Open event ── */
  useEffect(() => {
    const handler = () => setOpen(true)
    document.addEventListener('nexus:settings:open', handler)
    return () => document.removeEventListener('nexus:settings:open', handler)
  }, [])

  /* ── Lock scroll ── */
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => {
    setClosing(true)
    setTimeout(() => { setOpen(false); setClosing(false) }, 300)
  }

  const setLanguage = (code: string) => {
    setLang(code)
    localStorage.setItem(LANG_KEY, code)
    window.dispatchEvent(new CustomEvent('nexus:lang-changed'))
  }

  const updateA11y = (patch: Partial<A11ySettings>) => {
    const next = { ...a11y, ...patch }
    setA11y(next)
    localStorage.setItem(A11Y_KEY, JSON.stringify(next))
    applyA11y(next)
  }

  const toggleDataSaving = (v: boolean) => {
    setDataSaving(v)
    localStorage.setItem('nexus_low_bandwidth', String(v))
    document.documentElement.setAttribute('data-reduced-data', String(v))
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 9970,
          background: 'rgba(5,11,22,0.7)',
          backdropFilter: 'blur(6px)',
          animation: closing ? 'sf-fade-out 0.28s ease forwards' : 'sf-fade-in 0.22s ease forwards',
        }}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        style={{
          position: 'fixed', top: 0, right: 0,
          width: '360px', maxWidth: '100vw', height: '100dvh',
          zIndex: 9971,
          background: 'linear-gradient(180deg, #0d1117 0%, #0a0d11 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '-24px 0 80px rgba(0,0,0,0.7), -1px 0 0 rgba(255,255,255,0.04)',
          display: 'flex', flexDirection: 'column',
          animation: closing ? 'sf-slide-out 0.3s cubic-bezier(0.4,0,1,1) forwards' : 'sf-slide-in 0.36s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, margin: 0, letterSpacing: '-0.015em', color: 'rgba(255,255,255,0.92)' }}>
              Preferences
            </h2>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-inter)', margin: '2px 0 0', fontWeight: 400 }}>
              Saved automatically
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Close settings"
            style={{
              width: '30px', height: '30px', borderRadius: 'var(--r-sm)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', outline: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            <CloseCircle size={14} color="rgba(255,255,255,0.4)" variant="Linear" />
          </button>
        </div>

        {/* ── Nav tabs ── */}
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', gap: '1px',
          flexShrink: 0,
        }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px', borderRadius: 'var(--r-sm)', border: 'none',
                background: section === item.id ? 'rgba(74,144,217,0.10)' : 'transparent',
                color: section === item.id ? 'rgba(74,144,217,0.90)' : 'rgba(255,255,255,0.40)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.14s',
                fontFamily: 'var(--font-inter)', fontSize: '12.5px', fontWeight: section === item.id ? 500 : 400,
                outline: 'none',
              }}
              onMouseEnter={e => { if (section !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (section !== item.id) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ opacity: section === item.id ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
              {section === item.id && (
                <span style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(74,144,217,0.7)', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── APPEARANCE ── */}
          {section === 'appearance' && (
            <>
              <div>
                <SectionLabel>Color scheme</SectionLabel>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {([
                    { id: 'dark',  label: 'Dark',   desc: 'Easy on the eyes' },
                    { id: 'light', label: 'Light',  desc: 'High visibility'  },
                  ] as const).map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); applyTheme(t.id) }}
                      style={{
                        flex: 1, padding: '12px 10px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
                        border: theme === t.id ? '1px solid rgba(74,144,217,0.40)' : '1px solid rgba(255,255,255,0.07)',
                        background: theme === t.id ? 'rgba(74,144,217,0.10)' : 'rgba(255,255,255,0.02)',
                        textAlign: 'left', transition: 'all 0.15s', outline: 'none',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 600, color: theme === t.id ? 'rgba(74,144,217,0.9)' : 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-display)', marginBottom: '2px' }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-inter)' }}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>Data & bandwidth</SectionLabel>
                <Row
                  label="Data saver"
                  description="Hides non-essential animations and images to reduce data use"
                  control={<Toggle checked={dataSaving} onChange={toggleDataSaving} />}
                />
              </div>

              <div>
                <SectionLabel>About</SectionLabel>
                <div style={{
                  padding: '12px 14px', borderRadius: 'var(--r-sm)',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.055)',
                  display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                  {[
                    ['Version', 'NEXUS Beta v0.1.0'],
                    ['Build', new Date().toISOString().slice(0, 10)],
                    ['License', 'Open source · MIT'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)' }}>{k}</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono, monospace)' }}>{v}</span>
                    </div>
                  ))}
                </div>
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
                  padding: '10px 14px', borderRadius: 'var(--r-sm)',
                  border: '1px solid rgba(248,113,113,0.18)',
                  background: 'rgba(248,113,113,0.04)',
                  color: 'rgba(248,113,113,0.6)', fontSize: '12px',
                  fontFamily: 'var(--font-inter)', cursor: 'pointer',
                  transition: 'all 0.2s', outline: 'none', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.09)'; e.currentTarget.style.color = 'rgba(248,113,113,0.85)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.04)'; e.currentTarget.style.color = 'rgba(248,113,113,0.6)' }}
              >
                <Trash size={13} color="rgba(248,113,113,0.6)" variant="Linear" />
                Reset all preferences
              </button>
            </>
          )}

          {/* ── LANGUAGE ── */}
          {section === 'language' && (
            <>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.30)', fontFamily: 'var(--font-inter)', lineHeight: 1.65, margin: 0 }}>
                Select the language for SMS notifications and translated content. UI translation is coming soon.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '9px 11px', borderRadius: 'var(--r-sm)',
                      border: lang === l.code ? '1px solid rgba(74,144,217,0.40)' : '1px solid rgba(255,255,255,0.06)',
                      background: lang === l.code ? 'rgba(74,144,217,0.09)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.13s', outline: 'none',
                    }}
                    onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  >
                    <span style={{ fontSize: '14px', lineHeight: 1 }}>{l.flag}</span>
                    <span style={{
                      fontSize: '12px', fontWeight: lang === l.code ? 600 : 400,
                      color: lang === l.code ? 'rgba(74,144,217,0.9)' : 'rgba(255,255,255,0.65)',
                      fontFamily: 'var(--font-display)', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {l.native}
                    </span>
                    {lang === l.code && (
                      <TickCircle size={11} color="rgba(74,144,217,0.8)" variant="TwoTone" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── ACCESSIBILITY ── */}
          {section === 'accessibility' && (
            <>
              <div>
                <SectionLabel>Text size</SectionLabel>
                <div style={{
                  padding: '14px', borderRadius: 'var(--r-sm)',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.055)',
                }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-inter)', margin: '0 0 12px', lineHeight: 1.6 }}>
                    Adjusts the base font size across the application
                  </p>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {(['Default', 'Large', 'Larger'] as const).map((label, i) => (
                      <button
                        key={label}
                        onClick={() => updateA11y({ fontSize: i })}
                        style={{
                          flex: 1, padding: '7px 4px', borderRadius: 'var(--r-sm)',
                          border: a11y.fontSize === i ? '1px solid rgba(74,144,217,0.4)' : '1px solid rgba(255,255,255,0.07)',
                          background: a11y.fontSize === i ? 'rgba(74,144,217,0.10)' : 'rgba(255,255,255,0.02)',
                          color: a11y.fontSize === i ? 'rgba(74,144,217,0.9)' : 'rgba(255,255,255,0.40)',
                          fontSize: `${11 + i}px`, fontWeight: a11y.fontSize === i ? 600 : 400,
                          fontFamily: 'var(--font-inter)', cursor: 'pointer',
                          transition: 'all 0.13s', outline: 'none',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <SectionLabel>Visual</SectionLabel>
                <Row
                  label="High contrast"
                  description="Increases text and border contrast for readability"
                  control={<Toggle checked={a11y.highContrast} onChange={v => updateA11y({ highContrast: v })} />}
                />
                <Row
                  label="Reduce motion"
                  description="Minimizes animations across the entire app"
                  control={<Toggle checked={a11y.reduceMotion} onChange={v => updateA11y({ reduceMotion: v })} />}
                />
              </div>

              <div style={{
                padding: '12px 14px', borderRadius: 'var(--r-sm)',
                background: 'rgba(74,144,217,0.04)',
                border: '1px solid rgba(74,144,217,0.10)',
              }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', fontFamily: 'var(--font-inter)', lineHeight: 1.65, margin: 0 }}>
                  NEXUS is built to WCAG AA standards. All pages support screen readers and keyboard navigation.
                </p>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {section === 'notifications' && (
            <>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.30)', fontFamily: 'var(--font-inter)', lineHeight: 1.65, margin: 0 }}>
                Get alerts about clinic availability and new programs in your area.
              </p>
              <div style={{
                padding: '14px', borderRadius: 'var(--r-sm)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.055)',
              }}>
                <PushNotificationToggle />
              </div>
              <div style={{
                padding: '12px 14px', borderRadius: 'var(--r-sm)',
                background: 'rgba(74,144,217,0.04)',
                border: '1px solid rgba(74,144,217,0.10)',
              }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', fontFamily: 'var(--font-inter)', lineHeight: 1.65, margin: 0 }}>
                  NEXUS never sends marketing or shares your data with advertisers. Notifications cover free care availability only.
                </p>
              </div>
            </>
          )}

          {/* ── SHORTCUTS ── */}
          {section === 'shortcuts' && (
            <>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.30)', fontFamily: 'var(--font-inter)', lineHeight: 1.65, margin: 0 }}>
                Keyboard shortcuts work across all pages.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {SHORTCUTS.map(({ keys, label }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 13px', borderRadius: 'var(--r-sm)',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-inter)', fontWeight: 400 }}>
                      {label}
                    </span>
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                      {keys.map((k, i) => (
                        <kbd
                          key={i}
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '2px 6px', borderRadius: 'var(--r-sm)', minWidth: '22px', height: '20px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.10)',
                            borderBottom: '2px solid rgba(255,255,255,0.08)',
                            fontSize: '10px', fontFamily: 'var(--font-mono, monospace)',
                            color: 'rgba(255,255,255,0.50)',
                            fontWeight: 500,
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── PRIVACY & DATA ── */}
          {section === 'privacy' && (
            <>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.30)', fontFamily: 'var(--font-inter)', lineHeight: 1.65, margin: 0 }}>
                NEXUS collects only what&apos;s necessary to help you find care. No personal health data is stored on our servers.
              </p>

              <div>
                <SectionLabel>Data collection</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {[
                    { label: 'Anonymous usage analytics', desc: 'Helps us improve search results', value: true,  locked: false },
                    { label: 'Search history',            desc: 'Stored locally in your browser only', value: false, locked: false },
                    { label: 'Crash reports',             desc: 'Automatically sent when errors occur', value: true,  locked: false },
                  ].map(item => (
                    <Row
                      key={item.label}
                      label={item.label}
                      description={item.desc}
                      control={<Toggle checked={item.value} onChange={() => {}} />}
                    />
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>Your data</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {[
                    { label: 'View Privacy Policy',  href: '/privacy' },
                    { label: 'Terms of Service',     href: '/terms'   },
                    { label: 'Data Deletion Request',href: '/privacy#delete' },
                  ].map(link => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={close}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '11px 13px', borderRadius: 'var(--r-sm)',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.055)',
                        fontSize: '12.5px', color: 'rgba(255,255,255,0.55)',
                        fontFamily: 'var(--font-inter)', textDecoration: 'none',
                        transition: 'background 0.13s',
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    >
                      {link.label}
                      <ExportSquare size={12} color="rgba(255,255,255,0.55)" variant="Linear" style={{ opacity: 0.4 }} />
                    </Link>
                  ))}
                </div>
              </div>

              <div style={{
                padding: '12px 14px', borderRadius: 'var(--r-sm)',
                background: 'rgba(74,217,144,0.04)',
                border: '1px solid rgba(74,217,144,0.10)',
                display: 'flex', gap: '10px', alignItems: 'flex-start',
              }}>
                <ShieldTick size={14} color="rgba(74,217,144,0.6)" variant="TwoTone" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', fontFamily: 'var(--font-inter)', lineHeight: 1.65, margin: 0 }}>
                  NEXUS never sells your data. We are an open-source, non-profit platform built for the uninsured.
                </p>
              </div>
            </>
          )}
        </div>
      </aside>

      <style>{`
        @keyframes sf-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sf-fade-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes sf-slide-in { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes sf-slide-out { from { transform: translateX(0) } to { transform: translateX(100%) } }
        .high-contrast {
          --text-2: rgba(232,240,241,0.85) !important;
          --text-3: rgba(232,240,241,0.65) !important;
          --border: rgba(109,145,151,0.4) !important;
        }
        .reduce-motion *, .reduce-motion *::before, .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      `}</style>
    </>
  )
}
