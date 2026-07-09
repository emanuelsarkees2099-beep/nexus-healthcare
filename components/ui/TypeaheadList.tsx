'use client'
/**
 * TypeaheadList — shared dropdown for search suggestions.
 * Dumb presentational component: the parent owns the input, the query,
 * the active index, and keyboard handling. This just renders the list
 * and reports mouse interactions.
 *
 * Used by: search page (location + care inputs), hero SearchBar (location).
 */
import { Location, SearchNormal1, Map1 } from 'iconsax-react'

export type TypeaheadItem = {
  label: string
  value: string
  /** picks the leading icon */
  kind?: 'city' | 'state' | 'zip' | 'care'
}

export default function TypeaheadList({
  items, activeIdx, onPick, onHover, idPrefix,
}: {
  items: TypeaheadItem[]
  activeIdx: number
  onPick: (item: TypeaheadItem) => void
  onHover: (idx: number) => void
  idPrefix: string
}) {
  if (items.length === 0) return null

  return (
    <div
      id={`${idPrefix}-list`}
      role="listbox"
      aria-label="Suggestions"
      style={{
        position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 300,
        background: 'rgba(8,10,16,0.98)',
        border: '1px solid rgba(79,142,240,0.22)',
        borderRadius: 'var(--r-md)', overflow: 'hidden',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        animation: 'typeahead-in 0.16s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      <style>{`@keyframes typeahead-in { from { opacity:0; transform:translateY(-5px); } to { opacity:1; transform:translateY(0); } }`}</style>
      {items.map((item, i) => {
        const active = i === activeIdx
        const Icon = item.kind === 'zip' ? Map1 : item.kind === 'care' ? SearchNormal1 : Location
        return (
          <button
            key={`${item.kind}-${item.value}-${i}`}
            id={`${idPrefix}-opt-${i}`}
            role="option"
            aria-selected={active}
            type="button"
            /* mousedown (not click) so the input doesn't blur first */
            onMouseDown={e => { e.preventDefault(); onPick(item) }}
            onMouseEnter={() => onHover(i)}
            style={{
              width: '100%', textAlign: 'left',
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px',
              background: active ? 'rgba(79,142,240,0.10)' : 'transparent',
              border: 'none',
              borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              color: active ? 'var(--accent2)' : 'var(--text-2)',
              fontSize: '13.5px', fontFamily: 'var(--font-inter)', fontWeight: 450,
              cursor: 'pointer', transition: 'background 0.1s, color 0.1s',
              minHeight: '42px',
            }}
          >
            <Icon size={13} color="currentColor" variant="Linear" style={{ opacity: 0.55, flexShrink: 0 }} aria-hidden="true" />
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            {item.kind === 'state' && (
              <span style={{ fontSize: '10px', color: 'var(--text-4)', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
                State
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
