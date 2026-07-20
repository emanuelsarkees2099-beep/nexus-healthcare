'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SearchNormal1, Video, Danger,
  ReceiptText, ShieldTick, Health,
  TrendUp, Book1, Judge,
  Profile2User, Global, MagicStar,
} from 'iconsax-react'

interface MegaMenuProps {
  open: boolean
  onClose: () => void
}

/* Feature triage (launch): three sections following the patient journey —
   find care → afford care → manage your health. Institutional pages
   (Impact, Outcomes, Equity, CHW, Calendar) live in the Footer. */
const SECTIONS = [
  {
    title: 'Find Care',
    color: '#4F8EF0',
    items: [
      { label: 'Find Clinics',   href: '/search',    icon: SearchNormal1, desc: 'Search 12,000+ free clinics' },
      { label: 'Telehealth',     href: '/telehealth',icon: Video,         desc: 'Virtual & phone care' },
      { label: 'Symptom Guide',  href: '/triage',    icon: Health,        desc: 'Not sure where to start?' },
      { label: 'Crisis Help',    href: '/crisis',    icon: Danger,        desc: '24/7 emergency resources' },
    ],
  },
  {
    title: 'Afford Care',
    color: '#5F9EF9',
    items: [
      { label: 'All Programs', href: '/programs',    icon: ReceiptText, desc: 'Medicaid, ACA, HRSA & more' },
      { label: 'Eligibility',  href: '/eligibility', icon: ShieldTick,  desc: 'Check what you qualify for' },
      { label: 'Medications',  href: '/medications', icon: Health,      desc: 'Assistance & savings' },
    ],
  },
  {
    title: 'Your Health',
    color: '#A78BFA',
    items: [
      { label: 'Health Passport', href: '/passport', icon: ShieldTick, desc: 'Your records, your control' },
      { label: 'Your Rights',     href: '/rights',   icon: Judge,      desc: 'EMTALA, ADA & more' },
      { label: 'Stories',         href: '/stories',  icon: Book1,      desc: 'Community voices' },
      { label: 'Kids Guide',      href: '/kids',     icon: Profile2User, desc: 'Health education for kids' },
    ],
  },
]

export default function MegaMenu({ open, onClose }: MegaMenuProps) {
  const pathname  = usePathname()
  const menuRef   = useRef<HTMLDivElement>(null)

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  /* Close on outside click — ignore clicks on the trigger button itself */
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.closest('[data-mega-trigger]')) return
      if (menuRef.current && !menuRef.current.contains(target as Node)) onClose()
    }
    const tid = setTimeout(() => document.addEventListener('mousedown', onClick), 60)
    return () => { clearTimeout(tid); document.removeEventListener('mousedown', onClick) }
  }, [open, onClose])

  return (
    <div
      ref={menuRef}
      aria-hidden={!open}
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        left: 0, right: 0,
        zIndex: 600,
        background: 'rgba(7,8,18,0.97)',
        backdropFilter: 'blur(48px) saturate(180%)',
        WebkitBackdropFilter: 'blur(48px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04) inset',
        pointerEvents: open ? 'auto' : 'none',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.97)',
        transformOrigin: 'top center',
        transition: open
          ? 'opacity 0.28s ease, transform 0.4s cubic-bezier(0.34,1.3,0.64,1)'
          : 'opacity 0.18s ease, transform 0.2s cubic-bezier(0.4,0,1,1)',
      }}
    >
      {/* Top accent gradient line */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(79,142,240,0.5) 40%, rgba(130,180,248,0.5) 60%, transparent)',
        borderRadius: '1px',
      }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
      }}>
        {SECTIONS.map(section => (
          <div key={section.title}>
            {/* Section title */}
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: section.color,
              marginBottom: '10px',
              paddingLeft: '10px',
              fontFamily: 'var(--font-inter)',
            }}>
              {section.title}
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map(item => {
                const isActive = pathname === item.href
                const IconComp = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '9px 10px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      background: isActive ? `${section.color}12` : 'transparent',
                      border: isActive ? `1px solid ${section.color}22` : '1px solid transparent',
                      transition: 'background 0.15s, border-color 0.15s',
                      cursor: 'pointer',
                    }}
                    className="mega-item"
                    data-color={section.color}
                  >
                    {/* Icon container */}
                    <div style={{
                      width: '28px', height: '28px',
                      borderRadius: '7px',
                      background: `${section.color}14`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      color: section.color,
                      transition: 'background 0.15s',
                    }}>
                      <IconComp size={14} color={section.color} variant="Linear" />
                    </div>

                    {/* Text */}
                    <div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#F8F9FF' : 'rgba(248,249,255,0.75)',
                        fontFamily: 'var(--font-inter)',
                        lineHeight: 1.3,
                        transition: 'color 0.15s',
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'rgba(248,249,255,0.35)',
                        fontFamily: 'var(--font-inter)',
                        marginTop: '1px',
                        lineHeight: 1.3,
                      }}>
                        {item.desc}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer row */}
      <div style={{
        marginTop: '16px',
        paddingTop: '14px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-inter)' }}>
          Also:
        </span>
        {[
          { label: 'Pathways', href: '/pathways', icon: MagicStar },
          { label: 'Impact',   href: '/impact',   icon: TrendUp },
          { label: 'About',    href: '/about',    icon: Global },
        ].map(q => (
          <Link
            key={q.href}
            href={q.href}
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px',
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-inter)',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
            }}
            className="mega-quick-link"
          >
            <q.icon size={11} variant="Linear" color="rgba(255,255,255,0.5)" />
            {q.label}
          </Link>
        ))}
      </div>

      <style>{`
        .mega-item:hover {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.06) !important;
        }
        .mega-item:hover > div:first-child {
          background: rgba(255,255,255,0.1) !important;
        }
        .mega-quick-link:hover {
          background: rgba(255,255,255,0.09) !important;
          color: rgba(255,255,255,0.8) !important;
          border-color: rgba(255,255,255,0.14) !important;
        }
      `}</style>
    </div>
  )
}
