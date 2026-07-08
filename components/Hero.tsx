'use client'
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap-st'
import { useI18n } from '@/components/I18nContext'
import SearchBar from '@/components/hero/SearchBar'
import LivingProof from '@/components/hero/LivingProof'

registerGSAP()

/* ── The signature cycling word — split-flap per-character animation.
     Crossfade guarantee: outgoing chars flap out WHILE incoming flap in,
     so the headline is never blank. ── */
const CYCLE_WORDS = ['found', 'unlocked', 'deserved', 'possible']
const CYCLE_MS = 3200

const PLACEHOLDERS = [
  'Symptom, specialty, or clinic name...',
  'Primary care near me...',
  'Free dental near me...',
  'Mental health services...',
  'Walk-in clinic today...',
  'Pediatrics · no insurance needed...',
]

const SYMPTOM_PATTERNS = [
  /\b(chest\s*pain|shortness\s*of\s*breath|can['']?t\s*breathe)\b/i,
  /\b(rash|itching|hives|skin\s+problem|eczema)\b/i,
  /\b(can['']?t\s+sleep|insomnia|anxiety|depression|mental\s+health)\b/i,
  /\b(headache|migraine|dizziness|fainting)\b/i,
  /\b(fever|cough|cold|flu|sick|nausea|vomiting)\b/i,
  /\b(back\s*pain|joint\s*pain|knee|shoulder)\b/i,
  /\b(stomach\s*pain|abdominal|cramps|diarr)\b/i,
  /\b(tooth\s*ache|toothache|gum|dental\s*pain)\b/i,
  /\b(blood|bleeding|wound|swelling)\b/i,
]

/* Split-flap word: renders chars with staggered flap-in/out animations */
function FlapWord({ word, leaving }: { word: string; leaving: boolean }) {
  return (
    <span
      aria-hidden={leaving || undefined}
      style={{
        position: 'absolute', left: 0, right: 0, top: 0,
        display: 'block', textAlign: 'center', whiteSpace: 'nowrap',
        color: 'var(--accent)',
      }}
    >
      {word.split('').map((ch, i) => (
        <span
          key={`${word}-${i}`}
          className={leaving ? 'flap-out' : 'flap-in'}
          style={{ animationDelay: `${i * 38}ms` }}
        >
          {ch}
        </span>
      ))}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   HERO — original dark identity, transformed
   • Split-flap cycling accent word (never blank)
   • Living Proof: real nearby clinics stream in on load
   • Typewriter placeholder (types once, then gentle cycling)
   • Honest avatar proof pill (true facts, no invented counts)
═══════════════════════════════════════════════════════════════════ */
export default function Hero() {
  const { t } = useI18n()
  const router = useRouter()

  /* refs */
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef      = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const h1Ref      = useRef<HTMLHeadingElement>(null)
  const subRef     = useRef<HTMLParagraphElement>(null)
  const searchRef  = useRef<HTMLDivElement>(null)
  const proofRef   = useRef<HTMLDivElement>(null)
  const livingRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const ctaBtnRef  = useRef<HTMLButtonElement>(null)

  /* state */
  const [searchVal, setSearchVal]     = useState('')
  const [locationVal, setLocationVal] = useState('')
  const [cycleIdx, setCycleIdx]       = useState(0)
  const [prevIdx, setPrevIdx]         = useState<number | null>(null)
  const [placeholder, setPlaceholder] = useState('')

  /* restore saved location */
  useEffect(() => {
    try {
      const s = localStorage.getItem('nexus_location') || localStorage.getItem('nexus_zip') || ''
      if (s) setLocationVal(s)
    } catch { /* private browsing */ }
  }, [])

  /* cycling headline word */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const id = setInterval(() => {
      setCycleIdx(i => {
        setPrevIdx(i)
        return (i + 1) % CYCLE_WORDS.length
      })
    }, CYCLE_MS)
    return () => clearInterval(id)
  }, [])

  /* placeholder: typewrite the first one, then gentle cycling */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const first = PLACEHOLDERS[0]
    if (reduced) { setPlaceholder(first) }

    let typeTimer: ReturnType<typeof setInterval> | null = null
    let cycleTimer: ReturnType<typeof setInterval> | null = null
    let idx = 0

    const startCycling = () => {
      let p = 0
      cycleTimer = setInterval(() => {
        const input = inputRef.current
        if (!input || document.activeElement === input) return
        gsap.to(input, {
          opacity: 0, duration: 0.2,
          onComplete: () => {
            p = (p + 1) % PLACEHOLDERS.length
            setPlaceholder(PLACEHOLDERS[p])
            gsap.to(input, { opacity: 1, duration: 0.2 })
          },
        })
      }, 3600)
    }

    if (reduced) {
      startCycling()
    } else {
      typeTimer = setInterval(() => {
        idx++
        setPlaceholder(first.slice(0, idx))
        if (idx >= first.length) {
          if (typeTimer) clearInterval(typeTimer)
          setTimeout(startCycling, 2600)
        }
      }, 32)
    }

    return () => {
      if (typeTimer) clearInterval(typeTimer)
      if (cycleTimer) clearInterval(cycleTimer)
    }
  }, [])

  /* ── GSAP: set initial states ── */
  useLayoutEffect(() => {
    gsap.set([eyebrowRef.current, h1Ref.current, subRef.current,
              searchRef.current, livingRef.current, proofRef.current], {
      opacity: 0, y: 20,
    })
  }, [])

  /* ── GSAP: one entrance, then stillness ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 })
      tl
        .to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' })
        .to(h1Ref.current,      { opacity: 1, y: 0, duration: 0.85, ease: 'power4.out' }, '-=0.4')
        .to(subRef.current,     { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.55')
        .to(searchRef.current,  { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.45')
        .to(livingRef.current,  { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, '-=0.4')
        .to(proofRef.current,   { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.4')

      gsap.to('.hero-content', {
        y: -60, opacity: 0, ease: 'power2.in',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '45% top',
          scrub: 1.2,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  /* ── Slow parallax on the background layer ── */
  useEffect(() => {
    const bg = bgRef.current
    if (!bg) return
    let rafId = 0
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY * 0.12
        if (bg) bg.style.transform = `translateY(${y}px)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId) }
  }, [])

  /* ── Cursor spotlight — hero only, GPU-cheap, off on touch ── */
  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(hover: none)').matches) return
    const spot = section.querySelector('.hero-spotlight') as HTMLElement | null
    if (!spot) return
    let rafId = 0
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const r = section.getBoundingClientRect()
        spot.style.transform =
          `translate(${e.clientX - r.left - 300}px, ${e.clientY - r.top - 300}px)`
        spot.style.opacity = '1'
      })
    }
    const onLeave = () => { spot.style.opacity = '0' }
    section.addEventListener('mousemove', onMove, { passive: true })
    section.addEventListener('mouseleave', onLeave)
    return () => {
      section.removeEventListener('mousemove', onMove)
      section.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  /* ── Search handler ── */
  const handleSearch = useCallback(() => {
    const q = searchVal.trim()
    if (!q) return
    const loc = locationVal.trim()
    const isSymptom = SYMPTOM_PATTERNS.some(rx => rx.test(q))
    setTimeout(() => router.push(
      isSymptom
        ? `/triage?symptom=${encodeURIComponent(q)}&loc=${encodeURIComponent(loc)}`
        : `/search?q=${encodeURIComponent(q)}&loc=${encodeURIComponent(loc)}`
    ), 280)
  }, [searchVal, locationVal, router])

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-h1"
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingBottom: '56px',
      }}
    >

      {/* ── Background: aurora + horizon + cursor spotlight ── */}
      <div ref={bgRef} aria-hidden="true" style={{
        position: 'absolute', inset: '-20% 0', zIndex: 0, pointerEvents: 'none',
        willChange: 'transform',
      }}>
        <div className="aurora" />
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 'min(720px, 90vw)', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(79,142,240,0.55) 35%, rgba(45,212,191,0.55) 65%, transparent)',
        }} />
      </div>
      {/* Spotlight — trails the cursor */}
      <div className="hero-spotlight" aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, zIndex: 1,
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,142,240,0.06) 0%, transparent 65%)',
        opacity: 0, pointerEvents: 'none',
        transition: 'opacity 0.5s ease',
        willChange: 'transform',
      }} />

      {/* ════════════════════════════════════════
          CENTRED CONTENT
      ════════════════════════════════════════ */}
      <div
        className="hero-content"
        style={{
          position: 'relative', zIndex: 2,
          paddingTop: 'clamp(88px, 11vh, 128px)',
          paddingLeft: 'clamp(20px, 4vw, 48px)',
          paddingRight: 'clamp(20px, 4vw, 48px)',
          maxWidth: '860px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >

        {/* ── Eyebrow ── */}
        <div ref={eyebrowRef} style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          marginBottom: '28px',
        }}>
          <span aria-hidden="true" style={{
            display: 'inline-block', width: '24px', height: '1px',
            background: 'var(--accent)', opacity: 0.6,
          }} />
          <span style={{
            fontSize: '11.5px', fontWeight: 500, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: 'var(--text-3)',
            fontFamily: 'var(--font-mono)',
          }}>
            Free · Private · No insurance required
          </span>
          <span aria-hidden="true" style={{
            display: 'inline-block', width: '24px', height: '1px',
            background: 'var(--accent)', opacity: 0.6,
          }} />
        </div>

        {/* ── H1 — split-flap cycling accent word ── */}
        <h1
          ref={h1Ref}
          id="hero-h1"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 6vw, 5.8rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            marginBottom: '22px',
            textAlign: 'center',
            color: 'var(--text)',
          }}
        >
          <span style={{ display: 'block' }}>Free healthcare,</span>
          <span style={{ display: 'block' }}>
            <span style={{
              display: 'inline-block', position: 'relative',
              perspective: '600px',
            }}>
              {/* Width lock — no layout shift between words */}
              <span aria-hidden="true" style={{ visibility: 'hidden' }}>
                {CYCLE_WORDS.reduce((a, b) => (a.length >= b.length ? a : b))}
              </span>
              {prevIdx !== null && (
                <FlapWord key={`out-${prevIdx}`} word={CYCLE_WORDS[prevIdx]} leaving />
              )}
              <FlapWord key={`in-${cycleIdx}`} word={CYCLE_WORDS[cycleIdx]} leaving={false} />
            </span>
            {' '}in seconds.
          </span>
        </h1>

        {/* ── Subtitle ── */}
        <p
          ref={subRef}
          style={{
            fontSize: 'clamp(0.95rem, 1.35vw, 1.1rem)',
            color: 'var(--text-2)',
            maxWidth: '540px',
            lineHeight: 1.7,
            fontWeight: 400,
            marginBottom: '32px',
            fontFamily: 'var(--font-inter)',
          }}
        >
          {t('home.hero.subheadline')}
        </p>

        {/* ── Search ── */}
        <div
          ref={searchRef}
          style={{ width: '100%', maxWidth: '640px' }}
        >
          <SearchBar
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            locationVal={locationVal}
            setLocationVal={setLocationVal}
            onSearch={handleSearch}
            placeholder={placeholder}
            inputRef={inputRef}
            ctaBtnRef={ctaBtnRef}
          />
        </div>

        {/* ── Living Proof — real clinics near the visitor, on load ── */}
        <div ref={livingRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <LivingProof />
        </div>

        {/* ── Honest proof pill — avatar cluster + true facts ── */}
        <div
          ref={proofRef}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            justifyContent: 'center', flexWrap: 'wrap', marginTop: '22px',
          }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-lg)',
            padding: '8px 16px 8px 10px',
          }}>
            {/* Avatar cluster (decorative) */}
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }} aria-hidden="true">
              {(['#4F8EF0', '#2DD4BF', '#82B4F8', '#5EEAD4'] as const).map((bg, i) => (
                <div key={i} style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${bg}, ${bg}88)`,
                  border: '2px solid var(--bg2)',
                  marginLeft: i === 0 ? 0 : '-8px',
                  zIndex: 4 - i, position: 'relative',
                }} />
              ))}
            </div>
            <span style={{
              fontSize: '12.5px', fontWeight: 600,
              color: 'var(--text)', fontFamily: 'var(--font-inter)',
            }}>
              12,400+ free clinics mapped
            </span>
          </div>

          <span aria-hidden="true" style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border)', flexShrink: 0 }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.20)',
            borderRadius: 'var(--r-lg)',
            padding: '6px 12px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--success)', flexShrink: 0,
            }} aria-hidden="true" />
            <span style={{
              fontSize: '11px', color: 'var(--success)',
              fontFamily: 'var(--font-inter)', fontWeight: 500,
            }}>
              Always free
            </span>
          </div>
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        /* Split-flap characters */
        .flap-in, .flap-out {
          display: inline-block;
          backface-visibility: hidden;
          transform-origin: 50% 100%;
        }
        .flap-in {
          opacity: 0;
          animation: flap-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .flap-out {
          animation: flap-out 0.4s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        @keyframes flap-in {
          from { opacity: 0; transform: rotateX(-95deg) translateY(6px); }
          60%  { opacity: 1; }
          to   { opacity: 1; transform: rotateX(0deg) translateY(0); }
        }
        @keyframes flap-out {
          from { opacity: 1; transform: rotateX(0deg); }
          to   { opacity: 0; transform: rotateX(90deg) translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .flap-in  { animation: none; opacity: 1; }
          .flap-out { animation: none; opacity: 0; }
          .hero-spotlight { display: none; }
        }

        @media (max-width: 768px) {
          #hero { padding-bottom: 40px !important; }
          #hero h1 { font-size: clamp(2.4rem, 9.5vw, 3.6rem) !important; }
        }
        @media (max-width: 480px) {
          #hero h1 { font-size: clamp(2rem, 8.8vw, 2.8rem) !important; }
          #hero p  { font-size: 0.92rem !important; }
        }
        .search-submit:hover { box-shadow: var(--shadow-glow) !important; }
        .search-submit:active { transform: scale(0.97) !important; }
        .geo-btn:hover { opacity: 1 !important; }
      `}</style>
    </section>
  )
}
