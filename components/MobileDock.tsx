'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SearchNormal1, Danger, ClipboardText, Profile, Home } from 'iconsax-react'

/* The five highest-intent actions on mobile — always one tap away. */
const DOCK_ITEMS = [
  { href: '/',                   icon: Home,          label: 'Home',    activeHrefs: ['/'] },
  { href: '/search',             icon: SearchNormal1, label: 'Search',  activeHrefs: ['/search', '/clinics'] },
  { href: '/triage',             icon: ClipboardText, label: 'Triage',  activeHrefs: ['/triage'] },
  { href: '/crisis',             icon: Danger,        label: 'Crisis',  activeHrefs: ['/crisis'] },
  { href: '/dashboard/profile',  icon: Profile,       label: 'Profile', activeHrefs: ['/dashboard', '/login', '/signup'] },
]

export default function MobileDock() {
  const pathname = usePathname()

  return (
    <nav className="mobile-dock" aria-label="Mobile quick navigation">
      <div className="mobile-dock-inner">
        {DOCK_ITEMS.map(item => {
          const isActive = item.activeHrefs.some(h =>
            h === '/' ? pathname === '/' : pathname === h || pathname.startsWith(h + '/')
          )
          const IconComp = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dock-item${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              style={{ position: 'relative' }}
            >
              {/* Active pill indicator */}
              {isActive && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '4px', left: '50%', transform: 'translateX(-50%)',
                    width: '28px', height: '28px', borderRadius: '9px',
                    background: 'rgba(79,142,240,0.14)',
                    border: '1px solid rgba(79,142,240,0.22)',
                    zIndex: 0,
                  }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>
                <IconComp
                  size={20}
                  variant={isActive ? 'Bold' : 'Linear'}
                  color={isActive ? 'var(--accent)' : 'rgba(255,255,255,0.42)'}
                />
              </span>
              <span style={{
                color: isActive ? 'var(--accent)' : undefined,
                fontWeight: isActive ? 600 : 400,
                position: 'relative', zIndex: 1,
              }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      <style>{`
        .mobile-dock {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 490;
          padding: 0 8px env(safe-area-inset-bottom, 8px);
          background: rgba(6,6,12,0.94);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        @media (max-width: 768px) {
          .mobile-dock { display: block; }
        }
        .mobile-dock-inner {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 56px;
          max-width: 480px;
          margin: 0 auto;
        }
        .dock-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 4px 10px;
          border-radius: 10px;
          text-decoration: none;
          color: rgba(255,255,255,0.42);
          font-size: 9.5px;
          font-family: var(--font-inter);
          font-weight: 400;
          letter-spacing: 0.02em;
          min-width: 52px;
          transition: color 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .dock-item.active {
          color: var(--accent);
        }
        .dock-item:active {
          transform: scale(0.92);
          transition: transform 0.1s;
        }
      `}</style>
    </nav>
  )
}
