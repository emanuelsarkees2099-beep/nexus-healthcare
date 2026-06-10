/**
 * EmptyState — premium empty state component.
 *
 * Used when a page has no data to show. Designed to feel like a feature,
 * not an error. Inspired by Linear's empty states.
 *
 * Variants:
 *   'search'     — No search results  (dashed ring with × motif)
 *   'saved'      — Nothing saved yet  (bookmark outline with sparkle)
 *   'history'    — No history         (clock with empty dashes)
 *   'programs'   — No programs found  (shield outline)
 *   'generic'    — Generic empty      (simple glyph)
 *
 * Usage:
 *   <EmptyState
 *     variant="saved"
 *     title="Nothing saved yet"
 *     description="Bookmark clinics to find them quickly next time."
 *     action={{ label: 'Search clinics', onClick: () => router.push('/search') }}
 *   />
 */
import React from 'react'

type EmptyVariant = 'search' | 'saved' | 'history' | 'programs' | 'generic' | 'triage'

interface EmptyStateAction {
  label: string
  onClick: () => void
  secondary?: {
    label: string
    onClick: () => void
  }
}

interface EmptyStateProps {
  variant?: EmptyVariant
  title: string
  description?: string
  action?: EmptyStateAction
  size?: 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
}

/* ── SVG illustrations — each is a 80×80 viewBox ───────────────────── */
const ILLUSTRATIONS: Record<EmptyVariant, React.ReactNode> = {
  search: (
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      {/* Outer pulsing rings */}
      <circle cx="38" cy="38" r="34" fill="rgba(74,142,240,0.04)" stroke="rgba(74,142,240,0.12)" strokeWidth="1" strokeDasharray="4 5"/>
      <circle cx="38" cy="38" r="24" fill="rgba(74,142,240,0.05)" stroke="rgba(74,142,240,0.18)" strokeWidth="1.2"/>
      {/* Magnifier glass */}
      <circle cx="35" cy="35" r="12" fill="rgba(74,142,240,0.08)" stroke="rgba(74,142,240,0.45)" strokeWidth="1.6"/>
      {/* Handle */}
      <line x1="44" y1="44" x2="54" y2="54" stroke="rgba(74,142,240,0.55)" strokeWidth="2.5" strokeLinecap="round"/>
      {/* × inside the magnifier — "no results" */}
      <line x1="31" y1="31" x2="39" y2="39" stroke="rgba(74,142,240,0.50)" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="39" y1="31" x2="31" y2="39" stroke="rgba(74,142,240,0.50)" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Glow pool */}
      <ellipse cx="38" cy="73" rx="22" ry="3.5" fill="rgba(74,142,240,0.06)"/>
    </svg>
  ),

  saved: (
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      {/* Soft backdrop */}
      <circle cx="40" cy="40" r="32" fill="rgba(74,142,240,0.04)" stroke="rgba(74,142,240,0.10)" strokeWidth="1" strokeDasharray="3 5"/>
      {/* Bookmark shape */}
      <path
        d="M28 22h24a2 2 0 0 1 2 2v34l-14-10-14 10V24a2 2 0 0 1 2-2z"
        fill="rgba(74,142,240,0.07)"
        stroke="rgba(74,142,240,0.40)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* + sparkle suggesting "add" */}
      <line x1="40" y1="30" x2="40" y2="40" stroke="rgba(74,142,240,0.55)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="35" y1="35" x2="45" y2="35" stroke="rgba(74,142,240,0.55)" strokeWidth="2" strokeLinecap="round"/>
      {/* Sparkle dots */}
      <circle cx="26" cy="24" r="1.5" fill="rgba(74,142,240,0.30)"/>
      <circle cx="54" cy="22" r="1" fill="rgba(126,181,232,0.40)"/>
      <circle cx="57" cy="50" r="1.5" fill="rgba(74,142,240,0.25)"/>
      {/* Glow */}
      <ellipse cx="40" cy="73" rx="20" ry="3" fill="rgba(74,142,240,0.06)"/>
    </svg>
  ),

  history: (
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="32" fill="rgba(167,139,250,0.04)" stroke="rgba(167,139,250,0.10)" strokeWidth="1" strokeDasharray="3 6"/>
      {/* Clock face */}
      <circle cx="40" cy="40" r="20" fill="rgba(167,139,250,0.06)" stroke="rgba(167,139,250,0.38)" strokeWidth="1.6"/>
      {/* Clock hands */}
      <line x1="40" y1="40" x2="40" y2="26" stroke="rgba(167,139,250,0.70)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="40" y1="40" x2="50" y2="44" stroke="rgba(167,139,250,0.55)" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Center dot */}
      <circle cx="40" cy="40" r="2" fill="rgba(167,139,250,0.80)"/>
      {/* Tick marks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
        <line
          key={deg}
          x1={40 + 17 * Math.cos((deg * Math.PI) / 180)}
          y1={40 + 17 * Math.sin((deg * Math.PI) / 180)}
          x2={40 + 19 * Math.cos((deg * Math.PI) / 180)}
          y2={40 + 19 * Math.sin((deg * Math.PI) / 180)}
          stroke={`rgba(167,139,250,${i % 3 === 0 ? '0.50' : '0.20'})`}
          strokeWidth={i % 3 === 0 ? '1.4' : '1'}
          strokeLinecap="round"
        />
      ))}
      <ellipse cx="40" cy="73" rx="20" ry="3" fill="rgba(167,139,250,0.05)"/>
    </svg>
  ),

  programs: (
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="32" fill="rgba(52,211,153,0.04)" stroke="rgba(52,211,153,0.10)" strokeWidth="1" strokeDasharray="3 5"/>
      {/* Shield */}
      <path
        d="M40 18l18 8v16c0 9-8 16-18 20C30 58 22 51 22 42V26z"
        fill="rgba(52,211,153,0.07)"
        stroke="rgba(52,211,153,0.42)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Check inside */}
      <path d="M33 40l5 5 10-10" stroke="rgba(52,211,153,0.60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Sparkle dots */}
      <circle cx="21" cy="32" r="1.5" fill="rgba(52,211,153,0.30)"/>
      <circle cx="59" cy="28" r="1" fill="rgba(52,211,153,0.25)"/>
      <ellipse cx="40" cy="73" rx="20" ry="3" fill="rgba(52,211,153,0.06)"/>
    </svg>
  ),

  triage: (
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="32" fill="rgba(74,142,240,0.04)" stroke="rgba(74,142,240,0.10)" strokeWidth="1" strokeDasharray="3 5"/>
      {/* Brain/head outline */}
      <ellipse cx="40" cy="36" rx="16" ry="18" fill="rgba(74,142,240,0.07)" stroke="rgba(74,142,240,0.40)" strokeWidth="1.6"/>
      {/* Sparkle/thinking dots */}
      <circle cx="34" cy="30" r="2" fill="rgba(74,142,240,0.60)"/>
      <circle cx="46" cy="30" r="2" fill="rgba(74,142,240,0.60)"/>
      <path d="M34 42 q6 5 12 0" stroke="rgba(74,142,240,0.50)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      {/* Neck/body */}
      <rect x="36" y="52" width="8" height="5" rx="2" fill="rgba(74,142,240,0.15)" stroke="rgba(74,142,240,0.30)" strokeWidth="1.2"/>
      <ellipse cx="40" cy="73" rx="20" ry="3" fill="rgba(74,142,240,0.06)"/>
    </svg>
  ),

  generic: (
    <svg width="72" height="72" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="32" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 5"/>
      {/* Simple hexagon glyph */}
      <polygon
        points="40,22 52,29 52,43 40,50 28,43 28,29"
        fill="rgba(74,142,240,0.07)"
        stroke="rgba(74,142,240,0.32)"
        strokeWidth="1.4"
      />
      <path
        d="M34.5 43V29L40 42L45.5 29V43"
        stroke="rgba(74,142,240,0.60)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="40" cy="73" rx="20" ry="3" fill="rgba(74,142,240,0.06)"/>
    </svg>
  ),
}

export default function EmptyState({
  variant = 'generic',
  title,
  description,
  action,
  size: sizeProp = 'md',
  style,
}: EmptyStateProps) {
  const padding = sizeProp === 'sm' ? '36px 24px' : sizeProp === 'lg' ? '80px 24px' : '56px 24px'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding,
        ...style,
      }}
    >
      {/* Illustration */}
      <div
        style={{
          marginBottom: sizeProp === 'sm' ? '16px' : '20px',
          opacity: 0.9,
          animation: 'emptystate-float 4s ease-in-out infinite',
        }}
      >
        {ILLUSTRATIONS[variant]}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: sizeProp === 'sm' ? '16px' : sizeProp === 'lg' ? '22px' : '18px',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          color: 'var(--text)',
          marginBottom: description ? '8px' : action ? '20px' : '0',
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: sizeProp === 'sm' ? '12px' : '13px',
            color: 'var(--text-3)',
            fontFamily: 'var(--font-inter)',
            lineHeight: 1.75,
            maxWidth: '320px',
            marginBottom: action ? '24px' : '0',
          }}
        >
          {description}
        </p>
      )}

      {/* Action buttons */}
      {action && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={action.onClick}
            style={{
              padding: sizeProp === 'sm' ? '8px 18px' : '10px 22px',
              borderRadius: '10px',
              background: 'rgba(74,142,240,0.12)',
              border: '1px solid rgba(74,142,240,0.28)',
              color: 'var(--accent, #4F8EF0)',
              fontSize: sizeProp === 'sm' ? '12px' : '13px',
              fontWeight: 600,
              fontFamily: 'var(--font-inter)',
              cursor: 'pointer',
              transition: 'background 0.18s ease, border-color 0.18s ease, transform 0.12s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(74,142,240,0.18)'
              e.currentTarget.style.borderColor = 'rgba(74,142,240,0.42)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(74,142,240,0.12)'
              e.currentTarget.style.borderColor = 'rgba(74,142,240,0.28)'
              e.currentTarget.style.transform = ''
            }}
          >
            {action.label}
          </button>

          {action.secondary && (
            <button
              onClick={action.secondary.onClick}
              style={{
                padding: sizeProp === 'sm' ? '8px 18px' : '10px 22px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'var(--text-3)',
                fontSize: sizeProp === 'sm' ? '12px' : '13px',
                fontWeight: 400,
                fontFamily: 'var(--font-inter)',
                cursor: 'pointer',
                transition: 'background 0.18s ease, color 0.18s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = 'var(--text-2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.color = 'var(--text-3)'
              }}
            >
              {action.secondary.label}
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes emptystate-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes emptystate-float { 0%, 100% { transform: none; } }
        }
      `}</style>
    </div>
  )
}
