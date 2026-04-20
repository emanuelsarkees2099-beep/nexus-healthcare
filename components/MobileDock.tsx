'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bookmark, Users, ReceiptText, AlertTriangle } from 'lucide-react'

const DOCK_ITEMS = [
  { href: '/search',    icon: <Search size={20} strokeWidth={2} />,      label: 'Search'    },
  { href: '/dashboard', icon: <Bookmark size={20} strokeWidth={2} />,    label: 'Saved'     },
  { href: '/chw',       icon: <Users size={20} strokeWidth={2} />,       label: 'CHW'       },
  { href: '/programs',  icon: <ReceiptText size={20} strokeWidth={2} />, label: 'Programs'  },
  { href: '/rights',    icon: <AlertTriangle size={20} strokeWidth={2} />, label: 'Rights'  },
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
