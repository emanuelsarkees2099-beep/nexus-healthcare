'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Phase = 'early' | 'mid' | 'late'

const PHASES: Record<Phase, { label: string; cta: string }> = {
  early: { label: 'Free care near you',       cta: 'Find care →' },
  mid:   { label: 'Match with a free clinic', cta: 'See results →' },
  late:  { label: "30 seconds from free care", cta: 'Go now →' },
}

export default function FloatingCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState<Phase>('early')
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const docH = document.documentElement.scrollHeight
      const winH = window.innerHeight

      setVisible(y > 600 && y < docH - winH - 300)

      if (y > 4000)       setPhase('late')
      else if (y > 1800)  setPhase('mid')
      else                setPhase('early')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => {
    if (phase === 'late') {
      router.push('/pathways')
    } else {
      const hero = document.querySelector('#hero-search')
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => (hero as HTMLElement).focus?.(), 800)
      } else {
        router.push('/pathways')
      }
    }
  }

  return (
    <div
      ref={ref}
      className={`floating-cta${visible ? ' visible' : ''}`}
      role="complementary"
      aria-label="Quick access: find free care"
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'rgba(7,7,15,0.90)',
        border: '1px solid rgba(110,231,183,0.22)',
        borderRadius: '100px',
        padding: '10px 10px 10px 20px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow:
          '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(110,231,183,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>
        {/* Pulse dot */}
        <span aria-hidden="true" style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: 'var(--accent)', flexShrink: 0,
          animation: 'pulse-dot 1.8s ease-in-out infinite',
          boxShadow: '0 0 0 3px rgba(110,231,183,0.18)',
        }} />

        <span
          key={phase}
          style={{
            fontSize: '13px', color: 'var(--text-2)',
            fontFamily: 'var(--font-inter)', fontWeight: 400,
            whiteSpace: 'nowrap',
            animation: 'phase-fade 0.35s ease forwards',
          }}
        >
          {PHASES[phase].label}
        </span>

        <button
          onClick={handleClick}
          aria-label="Find free care — scroll to search"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--accent)', color: '#07070F',
            border: 'none', borderRadius: '100px', padding: '10px 20px',
            fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 600,
            cursor: 'none', whiteSpace: 'nowrap', flexShrink: 0,
            letterSpacing: '0.01em',
            transition: 'transform 0.25s var(--ease-spring), box-shadow 0.25s',
            boxShadow: '0 4px 16px rgba(110,231,183,0.28)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(110,231,183,0.45)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(110,231,183,0.28)'
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)' }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
        >
          {PHASES[phase].cta}
        </button>
      </div>

      <style>{`
        @keyframes phase-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
