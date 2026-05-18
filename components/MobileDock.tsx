'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, AlertTriangle, ClipboardList, User } from 'lucide-react'

/* The four highest-intent actions on mobile — always one tap away. */
const DOCK_ITEMS = [
  { href: '/search',            icon: <Search size={20} strokeWidth={2} />,        label: 'Search'  },
  { href: '/triage',            icon: <ClipboardList size={20} strokeWidth={2} />, label: 'Triage'  },
  { href: '/crisis',            icon: <AlertTriangle size={20} strokeWidth={2} />, label: 'Crisis'  },
  { href: '/dashboard/profile', icon: <User size={20} strokeWidth={2} />,          label: 'Profile' },
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
