'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, MapPin, Users, ReceiptText, BarChart2, CalendarDays,
  BookOpen, Scale, Megaphone, Accessibility, Zap, ArrowRight,
  BrainCircuit, Phone, Heart, X,
} from 'lucide-react'

type CmdItem = {
  id: string
  label: string
  description: string
  href: string
  icon: React.ReactNode
  category: string
  keywords: string[]
}

const CMD_ITEMS: CmdItem[] = [
  {
    id: 'search',
    label: 'Find a Free Clinic',
    description: 'Search 12,000+ free and sliding-scale clinics',
    href: '/search',
    icon: <MapPin size={15} />,
    category: 'Core',
    keywords: ['clinic', 'doctor', 'free', 'find', 'search', 'near me', 'hospital'],
  },
  {
    id: 'programs',
    label: 'Programs & Eligibility',
    description: 'Check Medicaid, ACA, HRSA and 40+ programs',
    href: '/programs',
    icon: <ReceiptText size={15} />,
    category: 'Core',
    keywords: ['programs', 'medicaid', 'aca', 'insurance', 'qualify', 'benefits', 'eligibility'],
  },
  {
    id: 'chw',
    label: 'Community Health Workers',
    description: 'Connect with a verified CHW who speaks your language',
    href: '/chw',
    icon: <Users size={15} />,
    category: 'Core',
    keywords: ['chw', 'community', 'worker', 'navigator', 'help', 'language', 'spanish'],
  },
  {
    id: 'pathways',
    label: 'Care Pathways',
    description: 'AI-powered routes to care based on your needs',
    href: '/pathways',
    icon: <BrainCircuit size={15} />,
    category: 'Features',
    keywords: ['pathway', 'route', 'care', 'ai', 'smart', 'navigate'],
  },
  {
    id: 'outcomes',
    label: 'Outcomes Tracker',
    description: 'Track and report your care experience',
    href: '/outcomes',
    icon: <BarChart2 size={15} />,
    category: 'Features',
    keywords: ['outcomes', 'track', 'data', 'report', 'experience'],
  },
  {
    id: 'calendar',
    label: 'Preventive Care Calendar',
    description: 'Free clinic events, vaccine drives, dental days',
    href: '/calendar',
    icon: <CalendarDays size={15} />,
    category: 'Features',
    keywords: ['calendar', 'events', 'vaccine', 'dental', 'mammography', 'preventive'],
  },
  {
    id: 'telehealth',
    label: 'Telehealth',
    description: 'Free and low-cost virtual care options',
    href: '/telehealth',
    icon: <Phone size={15} />,
    category: 'Features',
    keywords: ['telehealth', 'virtual', 'online', 'remote', 'video', 'call'],
  },
  {
    id: 'stories',
    label: 'Stories',
    description: 'Read and share healthcare navigation experiences',
    href: '/stories',
    icon: <BookOpen size={15} />,
    category: 'Community',
    keywords: ['stories', 'share', 'experience', 'community', 'read'],
  },
  {
    id: 'rights',
    label: 'Know Your Rights',
    description: 'Legal protections, EMTALA, Title VI explained',
    href: '/rights',
    icon: <Scale size={15} />,
    category: 'Community',
    keywords: ['rights', 'legal', 'law', 'emtala', 'discrimination', 'title vi'],
  },
  {
    id: 'advocacy',
    label: 'Advocacy',
    description: 'Campaigns, petitions and policy action',
    href: '/advocacy',
    icon: <Megaphone size={15} />,
    category: 'Community',
    keywords: ['advocacy', 'petition', 'policy', 'campaign', 'vote', 'change'],
  },
  {
    id: 'impact',
    label: 'Impact Dashboard',
    description: 'NEXUS by the numbers — searches, matches, coverage',
    href: '/impact',
    icon: <Zap size={15} />,
    category: 'Info',
    keywords: ['impact', 'stats', 'data', 'dashboard', 'numbers'],
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'Accommodations, ADA information, report barriers',
    href: '/accessibility',
    icon: <Accessibility size={15} />,
    category: 'Info',
    keywords: ['accessibility', 'ada', 'disability', 'wheelchair', 'accommodations'],
  },
  {
    id: 'dashboard',
    label: 'My Health Wallet',
    description: 'Your saved clinics, programs and appointments',
    href: '/dashboard',
    icon: <Heart size={15} />,
    category: 'Account',
    keywords: ['dashboard', 'wallet', 'saved', 'bookmarks', 'appointments', 'profile'],
  },
]

function matchItems(query: string): CmdItem[] {
  if (!query.trim()) return CMD_ITEMS.slice(0, 6)
  const q = query.toLowerCase()
  return CMD_ITEMS.filter(
    item =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q))
  )
}

export default function CommandPalette() {
  const [open, setOpen]         = useState(false)
  const [query, setQuery]       = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  const results = matchItems(query)

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setSelected(0)
  }, [])

  const navigate = useCallback((href: string) => {
    close()
    router.push(href)
  }, [close, router])

  /* ── Open with ⌘K or Ctrl+K ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  /* ── Auto-focus input when open ── */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60)
  }, [open])

  /* ── Arrow-key navigation ── */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selected]) navigate(results[selected].href)
    }
  }

  if (!open) return null

  /* ── Group results by category ── */
  const categories = Array.from(new Set(results.map(r => r.category)))

  return (
    <div
      className="cmd-backdrop"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="cmd-panel" onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div className="cmd-input-row">
          <Search size={16} color="var(--text-3)" strokeWidth={2} />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Search clinics, programs, features..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={onKeyDown}
            aria-label="Command search"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '2px', display: 'flex' }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <kbd style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '5px', padding: '2px 7px',
            fontFamily: 'var(--font-mono),monospace', fontSize: '11px', color: 'var(--text-3)',
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div className="cmd-results" role="listbox">
          {results.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: '14px' }}>
              No results for "{query}"
            </div>
          ) : (
            categories.map(cat => {
              const catItems = results.filter(r => r.category === cat)
              return (
                <div key={cat}>
                  <div style={{
                    padding: '6px 12px 2px',
                    fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: 'var(--text-3)',
                    fontFamily: 'var(--font-inter),sans-serif',
                  }}>
                    {cat}
                  </div>
                  {catItems.map(item => {
                    const idx = results.indexOf(item)
                    return (
                      <div
                        key={item.id}
                        className="cmd-result-item"
                        data-selected={idx === selected ? 'true' : 'false'}
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setSelected(idx)}
                        role="option"
                        aria-selected={idx === selected}
                      >
                        <div className="cmd-icon">{item.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '14px', fontWeight: 500, color: 'var(--text)',
                            fontFamily: 'var(--font-inter),sans-serif',
                          }}>
                            {item.label}
                          </div>
                          <div style={{
                            fontSize: '12px', color: 'var(--text-3)',
                            fontFamily: 'var(--font-inter),sans-serif',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {item.description}
                          </div>
                        </div>
                        <ArrowRight size={12} color="var(--text-3)" />
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="cmd-footer">
          <span className="cmd-key"><kbd>↑↓</kbd> navigate</span>
          <span className="cmd-key"><kbd>↵</kbd> open</span>
          <span className="cmd-key"><kbd>ESC</kbd> close</span>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-3)' }}>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
