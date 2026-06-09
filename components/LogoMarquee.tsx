'use client'

interface Logo { name: string; url: string; svg: React.ReactNode }

const LOGOS: Logo[] = [
  { name: 'HRSA', url: 'https://www.hrsa.gov', svg: (
    <svg viewBox="0 0 64 20" fill="currentColor" style={{ height: 14, width: 'auto' }} aria-hidden="true">
      <text x="0" y="15" fontFamily="Georgia,serif" fontWeight="700" fontSize="16" letterSpacing="2">HRSA</text>
    </svg>
  )},
  { name: 'FQHC', url: 'https://findahealthcenter.hrsa.gov', svg: (
    <svg viewBox="0 0 64 20" fill="currentColor" style={{ height: 14, width: 'auto' }} aria-hidden="true">
      <text x="0" y="15" fontFamily="Georgia,serif" fontWeight="700" fontSize="15" letterSpacing="1">FQHC</text>
    </svg>
  )},
  { name: 'NeedyMeds', url: 'https://www.needymeds.org', svg: (
    <svg viewBox="0 0 110 20" fill="currentColor" style={{ height: 14, width: 'auto' }} aria-hidden="true">
      <circle cx="9" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 7h3l2.5 4.5L13 7h3v6h-1.5V9.5l-2 3.5h-1l-2-3.5V13H5z"/>
      <text x="22" y="14" fontFamily="system-ui,sans-serif" fontWeight="600" fontSize="12">NeedyMeds</text>
    </svg>
  )},
  { name: 'GoodRx', url: 'https://www.goodrx.com', svg: (
    <svg viewBox="0 0 72 20" fill="currentColor" style={{ height: 14, width: 'auto' }} aria-hidden="true">
      <path d="M3 10a7 7 0 1 1 7.5 7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <text x="18" y="14" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13">GoodRx</text>
    </svg>
  )},
  { name: 'NACHW', url: 'https://nachw.org', svg: (
    <svg viewBox="0 0 72 20" fill="currentColor" style={{ height: 14, width: 'auto' }} aria-hidden="true">
      <path d="M2 18V2l4 7 4-7v16" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="18" y="14" fontFamily="system-ui,sans-serif" fontWeight="600" fontSize="13">NACHW</text>
    </svg>
  )},
  { name: '340B Health', url: 'https://www.340bhealth.org', svg: (
    <svg viewBox="0 0 92 20" fill="currentColor" style={{ height: 14, width: 'auto' }} aria-hidden="true">
      <rect x="0" y="2" width="14" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <text x="2" y="13" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="9">Rx</text>
      <text x="18" y="14" fontFamily="system-ui,sans-serif" fontWeight="600" fontSize="13">340B Health</text>
    </svg>
  )},
  { name: 'Open Door Health', url: 'https://www.opendoorhealth.com', svg: (
    <svg viewBox="0 0 128 20" fill="currentColor" style={{ height: 14, width: 'auto' }} aria-hidden="true">
      <path d="M3 8v10h10V8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M1 8l7-6 7 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="20" y="14" fontFamily="system-ui,sans-serif" fontWeight="600" fontSize="12">Open Door Health</text>
    </svg>
  )},
  { name: 'Banner Health', url: 'https://www.bannerhealth.com', svg: (
    <svg viewBox="0 0 105 20" fill="currentColor" style={{ height: 14, width: 'auto' }} aria-hidden="true">
      <rect x="0" y="3" width="13" height="13" rx="2" fill="currentColor" opacity="0.8"/>
      <path d="M2.5 9.5h8M6.5 5.5v8" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="18" y="14" fontFamily="system-ui,sans-serif" fontWeight="600" fontSize="13">Banner Health</text>
    </svg>
  )},
  { name: 'Dignity Health', url: 'https://www.commonspirit.org', svg: (
    <svg viewBox="0 0 105 20" fill="currentColor" style={{ height: 14, width: 'auto' }} aria-hidden="true">
      <circle cx="8" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 10l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="19" y="14" fontFamily="system-ui,sans-serif" fontWeight="600" fontSize="13">Dignity Health</text>
    </svg>
  )},
  { name: 'Valle del Sol', url: 'https://www.valledelsol.com', svg: (
    <svg viewBox="0 0 105 20" fill="currentColor" style={{ height: 14, width: 'auto' }} aria-hidden="true">
      <circle cx="8" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M2 14c1-4 12-4 12 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <text x="19" y="14" fontFamily="system-ui,sans-serif" fontWeight="600" fontSize="12">Valle del Sol</text>
    </svg>
  )},
  { name: 'Free Clinic Network', url: 'https://www.nafcclinics.org', svg: (
    <svg viewBox="0 0 135 20" fill="currentColor" style={{ height: 14, width: 'auto' }} aria-hidden="true">
      <path d="M5 5h8M9 5v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <text x="19" y="14" fontFamily="system-ui,sans-serif" fontWeight="600" fontSize="12">Free Clinic Network</text>
    </svg>
  )},
  { name: 'Maricopa Health', url: 'https://www.mihs.org', svg: (
    <svg viewBox="0 0 120 20" fill="currentColor" style={{ height: 14, width: 'auto' }} aria-hidden="true">
      <path d="M3 18V4l5 6 5-6v14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="18" y="14" fontFamily="system-ui,sans-serif" fontWeight="600" fontSize="12">Maricopa Health</text>
    </svg>
  )},
]

/* Triple-clone the full list so the loop is seamless even at wide viewports */
const MARQUEE_ITEMS = [...LOGOS, ...LOGOS, ...LOGOS]

export default function LogoMarquee() {
  return (
    <div
      aria-label="Trusted partners and health networks"
      style={{
        position: 'relative', zIndex: 2,
        borderTop: '1px solid var(--border2)',
        borderBottom: '1px solid var(--border2)',
        padding: '2.5rem 0', overflow: 'hidden',
      }}
    >
      <div style={{
        textAlign: 'center', fontSize: '11px', color: 'var(--text-3)',
        fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase',
        marginBottom: '1.75rem', fontFamily: 'var(--font-inter)',
      }}>
        Trusted by clinics, CHWs, and health systems nationwide
      </div>

      {/* Fade edges */}
      <div style={{
        overflow: 'hidden',
        maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      }}>
        <div
          aria-hidden="true"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            animation: 'scroll-logos-single 38s linear infinite',
            width: 'max-content',
          }}
          onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
          onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
        >
          {MARQUEE_ITEMS.map((logo, i) => (
            <div key={`${logo.name}-${i}`} className="logo-tile">
              <div
                style={{
                  color: 'var(--text-3)', padding: '0 1.25rem',
                  border: '1px solid var(--border2)', borderRadius: '8px',
                  height: '36px', display: 'flex', alignItems: 'center',
                  whiteSpace: 'nowrap', transition: 'color 0.2s, border-color 0.2s',
                  cursor: 'default', flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--accent)'
                  e.currentTarget.style.borderColor = 'rgba(74,144,217,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-3)'
                  e.currentTarget.style.borderColor = 'var(--border2)'
                }}
              >
                {logo.svg}
              </div>
              <div className="logo-tile-tooltip">
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{logo.name}</span>
                <a
                  href={logo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    marginLeft: '8px', color: 'var(--accent)', fontSize: '10px',
                    textDecoration: 'none', fontWeight: 500,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  Visit →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Single continuous scroll — translateX by 1/3 of total width (one full set of 12 logos) */
        @keyframes scroll-logos-single {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </div>
  )
}
