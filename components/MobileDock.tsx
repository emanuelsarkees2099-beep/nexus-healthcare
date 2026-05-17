'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bookmark, Users, Navigation } from 'lucide-react'

/* #26 — Healthcare GPS added to dock for prominence/discoverability.
 * Rights is accessible from the main nav; GPS is the most action-oriented
 * tool for people arriving without a plan. */
const DOCK_ITEMS = [
  { href: '/search',    icon: <Search size={20} strokeWidth={2} />,     label: 'Search' },
  { href: '/chw',       icon: <Users size={20} strokeWidth={2} />,      label: 'CHW'    },
  { href: '/gps',       icon: <Navigation size={20} strokeWidth={2} />, label: 'GPS'    },
  { href: '/dashboard', icon: <Bookmark size={20} strokeWidth={2} />,   label: 'Saved'  },
]

export default function MobileDock() {
  const pathname = usePathname()

  return (
    <nav className="mobile-dock" aria-label="Mobile quick navigation">
      <div className="mobile-dock-inner">
        {DOCK_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dock-item${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
