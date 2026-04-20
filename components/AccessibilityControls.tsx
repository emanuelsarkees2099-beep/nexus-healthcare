'use client'
import { useEffect, useState } from 'react'
import { Type, Contrast, RotateCcw } from 'lucide-react'

type Mode = 'normal' | 'large-text' | 'high-contrast'

export default function AccessibilityControls() {
  const [mode, setMode] = useState<Mode>('normal')
  const [open, setOpen] = useState(false)

  // Persist & apply
  useEffect(() => {
    const saved = localStorage.getItem('nexus_a11y_mode') as Mode | null
    if (saved) applyMode(saved)
  }, [])

  function applyMode(m: Mode) {
    setMode(m)
    localStorage.setItem('nexus_a11y_mode', m)
    const root = document.documentElement
    root.classList.remove('a11y-large', 'a11y-contrast')
    if (m === 'large-text')    root.classList.add('a11y-large')
    if (m === 'high-contrast') root.classList.add('a11y-contrast')
  }

  return (
    <>
      {/* Trigger button — fixed bottom-right, above mobile dock */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Accessibility settings"
        style={{
          position: 'fixed', bottom: '90px', right: '20px', zIndex: 49,
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'rgba(8,13,26,0.9)', border: '1px solid rgba(110,231,183,0.2)',
          backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: open ? '0 0 0 2px rgba(110,231,183,0.3)' : 'none',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(110,231,183,0.45)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(110,231,183,0.2)')}
      >
        <Type size={16} strokeWidth={1.5} />
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '144px', right: '16px', zIndex: 49,
          background: 'rgba(8,13,26,0.96)', border: '1px solid rgba(110,231,183,0.15)',
          borderRadius: '18px', padding: '20px', width: '240px',
          backdropFilter: 'blur(24px)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '14px' }}>Display</div>

          {([
            { id: 'normal',        label: 'Default',      desc: 'Standard view', icon: <RotateCcw size={14} strokeWidth={1.5} /> },
            { id: 'large-text',    label: 'Large text',   desc: 'Bigger type, easier to read', icon: <Type size={14} strokeWidth={1.5} /> },
            { id: 'high-contrast', label: 'High contrast', desc: 'Maximum visibility', icon: <Contrast size={14} strokeWidth={1.5} /> },
          ] as { id: Mode; label: string; desc: string; icon: React.ReactNode }[]).map(opt => (
            <button
              key={opt.id}
              onClick={() => applyMode(opt.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px',
                borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
                background: mode === opt.id ? 'rgba(110,231,183,0.08)' : 'transparent',
                borderColor: mode === opt.id ? 'rgba(110,231,183,0.3)' : 'rgba(255,255,255,0.06)',
                color: mode === opt.id ? 'var(--accent)' : 'rgba(255,255,255,0.55)',
                transition: 'all 0.2s', marginBottom: '6px', textAlign: 'left',
              }}
            >
              <span style={{ flexShrink: 0 }}>{opt.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{opt.label}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>{opt.desc}</div>
              </div>
              {mode === opt.id && (
                <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }

        /* Large text mode */
        .a11y-large { font-size: 112% !important; }
        .a11y-large h1 { font-size: clamp(44px, 8vw, 96px) !important; }
        .a11y-large h2 { font-size: clamp(28px, 4.5vw, 52px) !important; }
        .a11y-large p, .a11y-large span, .a11y-large div { line-height: 1.85 !important; }
        .a11y-large button, .a11y-large a { min-height: 52px !important; font-size: 15px !important; }

        /* High contrast mode */
        .a11y-contrast {
          --bg: #000000 !important;
          --surface1: #0a0a0a !important;
          --surface2: #111111 !important;
          --text: #ffffff !important;
          --accent: #00ff9d !important;
          filter: contrast(1.15);
        }
        .a11y-contrast *:not(svg):not(path) { border-color: rgba(255,255,255,0.25) !important; }
        .a11y-contrast p, .a11y-contrast span:not([style*="color"]) { color: rgba(255,255,255,0.85) !important; }
      `}</style>
    </>
  )
}
