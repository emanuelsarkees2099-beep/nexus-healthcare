'use client'

const ROW1 = ['HRSA', 'Federally Qualified Health Centers', 'University of Arizona', 'NeedyMeds', 'Open Door Health', 'GoodRx', 'National Association of CHWs', '340B Health']
const ROW2 = ['Phoenix Children\'s Hospital', 'Maricopa County Health', 'Community Health Center', 'Free Clinic Network', 'AZ Health Department', 'Banner Health Foundation', 'Dignity Health', 'Valle del Sol Health']

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const all = [...items, ...items]
  return (
    <div style={{
      overflow: 'hidden',
      maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
    }}>
      <div
        aria-hidden="true"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          animation: `scroll-logos${reverse ? '-rev' : ''} ${reverse ? '34s' : '28s'} linear infinite`,
          width: 'max-content',
        }}
        onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
      >
        {all.map((logo, i) => (
          <div
            key={`${logo}-${i}`}
            style={{
              fontSize: '12px', fontWeight: 500,
              color: 'var(--text-3)', whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
              padding: '0 1rem',
              border: '1px solid var(--border2)',
              borderRadius: '8px',
              height: '34px',
              display: 'flex', alignItems: 'center', gap: '7px',
              fontFamily: 'var(--font-inter)',
              transition: 'color 0.2s, border-color 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--accent)'
              e.currentTarget.style.borderColor = 'rgba(109,145,151,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-3)'
              e.currentTarget.style.borderColor = 'var(--border2)'
            }}
          >
            <span aria-hidden="true" style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor', opacity: 0.5, flexShrink: 0 }} />
            {logo}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LogoMarquee() {
  return (
    <div
      aria-label="Trusted partners and health networks"
      style={{
        position: 'relative', zIndex: 2,
        borderTop: '1px solid var(--border2)',
        borderBottom: '1px solid var(--border2)',
        padding: '2.5rem 0',
        overflow: 'hidden',
      }}
    >
      <div style={{
        textAlign: 'center', fontSize: '11px',
        color: 'var(--text-3)', fontWeight: 400,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        marginBottom: '1.75rem', fontFamily: 'var(--font-inter)',
      }}>
        Trusted by clinics, CHWs, and health systems nationwide
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <MarqueeRow items={ROW1} />
        <MarqueeRow items={ROW2} reverse />
      </div>

      <style>{`
        @keyframes scroll-logos {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-logos-rev {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
