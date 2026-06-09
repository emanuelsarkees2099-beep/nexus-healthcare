'use client'

const TRENDING = [
  'Free dental Phoenix',
  'Insulin help NYC',
  'Mental health LA',
  'Pediatrics Chicago',
  'Vaccines Houston',
  'Eye care Miami',
  'Cardiology Seattle',
  'Dental Dallas',
  'OB/GYN Austin',
  'Walk-in Denver',
]

interface TrendingCarouselProps {
  onSelect: (query: string) => void
}

export default function TrendingCarousel({ onSelect }: TrendingCarouselProps) {
  return (
    <div style={{
      width: '100%', maxWidth: '660px', margin: '0 auto',
      overflow: 'hidden',
      maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
    }}>
      {/* "Trending" label + divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <span style={{
          fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)',
          letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0,
        }}>
          Trending
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border2)' }} aria-hidden="true" />
      </div>

      {/* Scrolling track — duplicated for seamless loop */}
      <div style={{ overflow: 'hidden' }}>
        {/* A1: pauseable on focus/hover via CSS class */}
        <div
          className="trending-track"
          role="list"
          aria-label="Trending healthcare searches"
          style={{ display: 'flex', gap: '8px' }}
        >
          {[...TRENDING, ...TRENDING].map((term, i) => (
            <button
              key={i}
              role="listitem"
              onClick={() => onSelect(term)}
              className="trending-pill"
              style={{
                flexShrink: 0,
                fontSize: '11px', color: 'var(--text-3)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border2)',
                borderRadius: '100px', padding: '4px 12px',
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-inter)', fontWeight: 400,
                transition: 'color 0.2s, border-color 0.2s, background 0.2s',
              }}
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

