'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const ROW_1 = [
  { quote: "I hadn't seen a doctor in three years because I couldn't afford it. NEXUS found me a free clinic six blocks away. I had no idea it existed.", name: 'Maria R.', location: 'Phoenix, AZ', initials: 'MR', stars: 5 },
  { quote: "The eligibility navigator showed my whole family qualifies for AHCCCS. I was paying out of pocket for years. This changed everything.", name: 'David T.', location: 'Tucson, AZ', initials: 'DT', stars: 5 },
  { quote: "Found a free dental clinic in Houston I'd never heard of. Got a cleaning and two fillings at zero cost. NEXUS is incredible.", name: 'James W.', location: 'Houston, TX', initials: 'JW', stars: 5 },
  { quote: "Prenatal care through NEXUS was a lifesaver. I was terrified about costs but they found a FQHC five minutes from my apartment.", name: 'Priya K.', location: 'Chicago, IL', initials: 'PK', stars: 5 },
  { quote: "The medication assistance program saved me $400 a month on insulin. I had no idea I qualified. Every diabetic should know about this.", name: 'Robert M.', location: 'Atlanta, GA', initials: 'RM', stars: 5 },
  { quote: "Encontré atención para mis hijos gratis y en español. No tenemos seguro y NEXUS lo cambió todo para nuestra familia.", name: 'Ana G.', location: 'Miami, FL', initials: 'AG', stars: 5 },
  { quote: "Mental health services without insurance seemed impossible. NEXUS matched me with a sliding-scale therapist in under three minutes.", name: 'Kevin L.', location: 'Denver, CO', initials: 'KL', stars: 5 },
  { quote: "As a community health worker I refer clients to NEXUS daily. It cuts my search time in half. The multilingual support is a real lifesaver.", name: 'Sofia L., CHW', location: 'Yuma, AZ', initials: 'SL', stars: 5 },
]

const ROW_2 = [
  { quote: "Pediatric care for my son within walking distance and completely free. NEXUS found the clinic — I just showed up. No paperwork drama.", name: 'Patricia H.', location: 'Seattle, WA', initials: 'PH', stars: 5 },
  { quote: "Avoided an $1,800 ER bill thanks to the AI triage. It told me a free clinic could handle my infection. It was absolutely right.", name: 'Marcus T.', location: 'New York, NY', initials: 'MT', stars: 5 },
  { quote: "I recommend NEXUS to every uninsured patient I see. It's the most practical healthcare tool I've encountered in 12 years of nursing.", name: 'Linda C., RN', location: 'Boston, MA', initials: 'LC', stars: 5 },
  { quote: "Found Medicaid coverage for my whole family in under ten minutes. We thought we didn't qualify. Turns out we'd been eligible for years.", name: 'Ahmad F.', location: 'Dallas, TX', initials: 'AF', stars: 5 },
  { quote: "Sliding scale care that works out to $8 a visit. NEXUS found the clinic and even told me exactly what to say when I called.", name: 'Carmen R.', location: 'Los Angeles, CA', initials: 'CR', stars: 5 },
  { quote: "Free dental day was a game-changer. My kids got cleanings, X-rays, and sealants. NEXUS had it on the calendar before I thought to look.", name: 'Jamal H.', location: 'Detroit, MI', initials: 'JH', stars: 5 },
  { quote: "The CHW connection was invaluable. She knew exactly which programs we qualified for and helped navigate every step of enrollment.", name: 'Miguel P.', location: 'San Antonio, TX', initials: 'MP', stars: 5 },
  { quote: "I work two jobs and barely have time to research healthcare. NEXUS gave me everything I needed in one search. Genuinely impressed.", name: 'Sarah B.', location: 'Phoenix, AZ', initials: 'SB', stars: 5 },
]

type CardData = typeof ROW_1[0]

function StarRow({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px', marginBottom: '0.9rem' }} aria-label={`${count} stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ card }: { card: CardData }) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Spotlight follows cursor via CSS custom properties only (no GSAP per-card for performance)
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mouse-x', `${e.clientX - r.left}px`)
      el.style.setProperty('--mouse-y', `${e.clientY - r.top}px`)
    }
    el.addEventListener('mousemove', onMove, { passive: true })
    return () => el.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={cardRef}
      className="t-card"
      style={{
        background: 'linear-gradient(145deg, var(--bg2), var(--bg3))',
        border: '1px solid var(--border2)',
        borderRadius: '20px', padding: '1.5rem',
        minWidth: '320px', maxWidth: '320px',
        position: 'relative', overflow: 'hidden', flexShrink: 0,
      }}
    >
      <StarRow count={card.stars} />
      <p style={{
        fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.8, fontWeight: 300,
        marginBottom: '1.25rem', fontFamily: 'var(--font-inter)',
        position: 'relative', zIndex: 1,
      }}>
        &ldquo;{card.quote}&rdquo;
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--accent-dim)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 600, color: 'var(--accent)',
          fontFamily: 'var(--font-sora)', flexShrink: 0,
        }}>{card.initials}</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--font-inter)' }}>{card.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>{card.location}</div>
        </div>
      </div>
    </div>
  )
}

function MarqueeRow({ cards, reverse = false, speed = 44 }: { cards: CardData[]; reverse?: boolean; speed?: number }) {
  const all = [...cards, ...cards]
  return (
    <div style={{
      overflow: 'hidden',
      maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
    }}>
      <div
        style={{
          display: 'flex', alignItems: 'stretch', gap: '14px',
          width: 'max-content',
          animation: `${reverse ? 'marquee-right' : 'marquee-left'} ${speed}s linear infinite`,
          willChange: 'transform',
        }}
        onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
        aria-hidden={reverse}
      >
        {all.map((card, i) => (
          <TestimonialCard key={`${card.initials}-${i}`} card={card} />
        ))}
      </div>
    </div>
  )
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: headerRef.current, start: 'top 85%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      aria-labelledby="stories-title"
      style={{ position: 'relative', zIndex: 2, padding: '100px 0 120px', overflow: 'hidden' }}
    >
      <div aria-hidden="true" className="section-glow-left" style={{ top: '20%' }} />
      <div aria-hidden="true" className="section-glow-right" style={{ top: '60%' }} />

      {/* Header */}
      <div ref={headerRef} style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 3rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontSize: '11px', fontWeight: 400, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--accent)',
          marginBottom: '1.25rem', fontFamily: 'var(--font-inter)',
        }}>
          <span style={{ display: 'inline-block', width: '16px', height: '1px', background: 'var(--accent)' }} aria-hidden="true" />
          Real stories
        </div>
        <h2 id="stories-title" style={{
          fontFamily: 'var(--font-sora)',
          fontSize: 'clamp(2.4rem, 4vw, 3.5rem)',
          fontWeight: 700, lineHeight: 1.05,
          letterSpacing: '-0.03em', marginBottom: '0.75rem',
        }}>
          The people{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>NEXUS</em>{' '}
          serves
        </h2>
        <p style={{
          fontSize: '15px', color: 'var(--text-2)',
          fontFamily: 'var(--font-inter)', fontWeight: 300,
          lineHeight: 1.8, maxWidth: '440px',
        }}>
          Real stories from people who found care they didn&apos;t know was possible.
        </p>
      </div>

      {/* Dual marquee rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <MarqueeRow cards={ROW_1} reverse={false} speed={44} />
        <MarqueeRow cards={ROW_2} reverse={true}  speed={50} />
      </div>
    </section>
  )
}
