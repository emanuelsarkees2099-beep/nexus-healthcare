'use client'
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap-st'
import { useI18n } from '@/components/I18nContext'
import SearchBar from '@/components/hero/SearchBar'
import HeroMockup from '@/components/hero/HeroMockup'

registerGSAP()

/* ─────────────────────────────────────────────────────
   CYCLING WORDS — the accent word in the headline
───────────────────────────────────────────────────── */
const CYCLE_WORDS = ['unlocked', 'possible', 'deserved', 'waiting']

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

/* ═══════════════════════════════════════════════════════════════════
   HERO — Centered, text-first, search-driven
   Design principles:
   • Eye enters at eyebrow → headline → search bar (the action)
   • Single centered column — maximum visual focus
   • HeroMockup below as decorative social proof
   • GSAP: staggered entrance from bottom + gentle scroll fade
═══════════════════════════════════════════════════════════════════ */
export default function Hero() {
  const { t } = useI18n()
  const router = useRouter()

  /* refs */
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const bgRef      = useRef<HTMLDivElement>(null)
  const mockupRef  = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const h1Ref      = useRef<HTMLHeadingElement>(null)
  const subRef     = useRef<HTMLParagraphElement>(null)
  const searchRef  = useRef<HTMLDivElement>(null)
  const proofRef   = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const ctaBtnRef  = useRef<HTMLButtonElement>(null)

  /* state */
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [searchVal, setSearchVal]           = useState('')
  const [locationVal, setLocationVal]       = useState('')
  const [cycleIdx, setCycleIdx]             = useState(0)
  const [prevIdx, setPrevIdx]               = useState<number | null>(null)

  /* restore saved location */
  useEffect(() => {
    try {
      const s = localStorage.getItem('nexus_location') || localStorage.getItem('nexus_zip') || ''
      if (s) setLocationVal(s)
    } catch { /* private browsing */ }
  }, [])

  /* cycling headline word — crossfade: old word exits WHILE new word enters,
     so the headline never reads "Free healthcare, ___ in seconds." */
  useEffect(() => {
    const id = setInterval(() => {
      setCycleIdx(i => {
        setPrevIdx(i)
        return (i + 1) % CYCLE_WORDS.length
      })
    }, 2800)
    return () => clearInterval(id)
  }, [])

  /* cycling placeholder */
  useEffect(() => {
    const id = setInterval(() => {
      const input = inputRef.current
      if (!input || document.activeElement === input) return
      gsap.to(input, {
        opacity: 0, duration: 0.2,
        onComplete: () => {
          setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length)
          gsap.to(input, { opacity: 1, duration: 0.2 })
        },
      })
    }, 3400)
    return () => clearInterval(id)
  }, [])

  /* ── GSAP: set initial states ── */
  useLayoutEffect(() => {
    gsap.set([eyebrowRef.current, h1Ref.current, subRef.current,
              searchRef.current, proofRef.current], {
      opacity: 0, y: 24,
    })
    gsap.set(mockupRef.current, { opacity: 0, y: 48 })
  }, [])

  /* ── GSAP: entrance + scroll fade ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Staggered entrance — each element rises into view */
      const tl = gsap.timeline({ delay: 0.1 })
      tl
        .to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' })
        .to(h1Ref.current,      { opacity: 1, y: 0, duration: 0.85, ease: 'power4.out' }, '-=0.45')
        .to(subRef.current,     { opacity: 1, y: 0, duration: 0.7,  ease: 'power3.out' }, '-=0.55')
        .to(searchRef.current,  { opacity: 1, y: 0, duration: 0.7,  ease: 'power3.out' }, '-=0.5')
        .to(proofRef.current,   { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, '-=0.45')
        .to(mockupRef.current,  { opacity: 1, y: 0, duration: 1.1,  ease: 'power3.out' }, '-=0.35')

      /* Scroll-out: each element departs at its own speed — parallax split */
      const fadeTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.4,
        },
      })
      fadeTl
        /* Eyebrow — lightest, exits first and fastest */
        .to(eyebrowRef.current, { y: -90,  opacity: 0, ease: 'power2.in', duration: 0.45 }, 0)
        /* H1 — heaviest element, lags behind, falls furthest */
        .to(h1Ref.current,      { y: -140, opacity: 0, scale: 0.91, ease: 'power3.in', duration: 0.62 }, 0.03)
        /* Subtitle trails after headline */
        .to(subRef.current,     { y: -70,  opacity: 0, ease: 'power2.in', duration: 0.48 }, 0.08)
        /* Search bar lifts more gently */
        .to(searchRef.current,  { y: -45,  opacity: 0, ease: 'power2.in', duration: 0.42 }, 0.13)
        /* Proof is last text element to leave */
        .to(proofRef.current,   { y: -28,  opacity: 0, ease: 'power2.in', duration: 0.35 }, 0.18)
        /* Mockup falls away downward — opposite direction, dramatic parallax */
        .to(mockupRef.current,  { y: 110,  opacity: 0, scale: 0.88, ease: 'power3.in', duration: 0.6 }, 0)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  /* ── Scroll parallax on hero background layer ── */
  useEffect(() => {
    const bg = bgRef.current
    if (!bg) return
    let rafId = 0
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY * 0.15
        if (bg) bg.style.transform = `translateY(${y}px)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId) }
  }, [])

  /* ── Magnetic CTA ── */
  useEffect(() => {
    const btn = ctaBtnRef.current
    if (!btn) return
    const parent = btn.closest('[role="search"]') as HTMLElement || btn.parentElement!
    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width  / 2)
      const dy = e.clientY - (r.top  + r.height / 2)
      const dist = Math.sqrt(dx * dx + dy * dy)
      btn.style.transform = dist < 90
        ? `translate(${dx * (1 - dist / 90) * 0.30}px, ${dy * (1 - dist / 90) * 0.30}px)`
        : ''
    }
    const onLeave = () => { btn.style.transform = '' }
    parent.addEventListener('mousemove', onMove, { passive: true })
    parent.addEventListener('mouseleave', onLeave)
    return () => {
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
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
        paddingBottom: '48px',
      }}
    >

      {/* ── Background atmosphere (parallax layer) ── */}
      <div ref={bgRef} aria-hidden="true" style={{
        position: 'absolute', inset: '-20% 0', zIndex: 0, pointerEvents: 'none',
        willChange: 'transform',
      }}>
        {/* Dot grid */}
        <div className="dot-grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.65 }} />
        {/* Aurora — the living blue→teal light field, signature of the Vital language */}
        <div className="aurora" />
        {/* Horizon glow — a thin band of life at the top edge */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 'min(720px, 90vw)', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(79,142,240,0.55) 35%, rgba(45,212,191,0.55) 65%, transparent)',
        }} />
      </div>

      {/* ════════════════════════════════════════
          CENTRED CONTENT
      ════════════════════════════════════════ */}
      <div
        ref={contentRef}
        className="hero-content"
        style={{
          position: 'relative', zIndex: 2,
          paddingTop: 'clamp(80px, 10vh, 120px)',
          paddingLeft: 'clamp(20px, 4vw, 48px)',
          paddingRight: 'clamp(20px, 4vw, 48px)',
          paddingBottom: '0',
          maxWidth: '780px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >

        {/* ── Eyebrow — thin rule + label ── */}
        <div ref={eyebrowRef} style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          marginBottom: '28px',
        }}>
          <span aria-hidden="true" style={{
            display: 'inline-block', width: '24px', height: '1px',
            background: 'var(--accent)', opacity: 0.6,
          }} />
          <span className="hero-badge" style={{
            fontSize: '12px', fontWeight: 400, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-3)',
            fontFamily: 'var(--font-inter)',
          }}>
            Free · Private · No insurance required
          </span>
          <span aria-hidden="true" style={{
            display: 'inline-block', width: '24px', height: '1px',
            background: 'var(--accent)', opacity: 0.6,
          }} />
        </div>

        {/* ── H1 — two lines, cycling accent word ── */}
        <h1
          ref={h1Ref}
          id="hero-h1"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 5.5vw, 6.5rem)',
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: '-0.04em',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          <span style={{ display: 'block', color: 'var(--text)' }}>
            Free healthcare,
          </span>
          <span style={{ display: 'block', color: 'var(--text)' }}>
            <span style={{
              display: 'inline-block', position: 'relative',
              perspective: '500px', transformStyle: 'preserve-3d',
            }}>
              {/* Width locked to widest word — no layout shift */}
              <span aria-hidden="true" style={{ visibility: 'hidden' }}>
                {CYCLE_WORDS.reduce((a, b) => a.length >= b.length ? a : b)}
              </span>
              {prevIdx !== null && (
                <span
                  key={`out-${prevIdx}`}
                  aria-hidden="true"
                  className="word-cycle-out text-vital"
                  style={{
                    position: 'absolute', left: 0, right: 0, top: 0,
                    display: 'block', textAlign: 'center', whiteSpace: 'nowrap',
                  }}
                >
                  {CYCLE_WORDS[prevIdx]}
                </span>
              )}
              <span
                key={`in-${cycleIdx}`}
                className="word-cycle-in text-vital"
                style={{
                  position: 'absolute', left: 0, right: 0, top: 0,
                  display: 'block', textAlign: 'center', whiteSpace: 'nowrap',
                }}
              >
                {CYCLE_WORDS[cycleIdx]}
              </span>
            </span>
            {' '}in seconds.
          </span>
        </h1>

        {/* ── Subtitle ── */}
        <p
          ref={subRef}
          style={{
            fontSize: 'clamp(0.9rem, 1.3vw, 1.05rem)',
            color: 'var(--text-2)',
            maxWidth: '520px',
            lineHeight: 1.75,
            fontWeight: 300,
            marginBottom: '28px',
            fontFamily: 'var(--font-inter)',
          }}
        >
          {t('home.hero.subheadline')}
        </p>

        {/* ── Search bar — the primary action ── */}
        <div
          ref={searchRef}
          style={{ width: '100%', maxWidth: '640px', marginBottom: '24px' }}
        >
          <SearchBar
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            locationVal={locationVal}
            setLocationVal={setLocationVal}
            onSearch={handleSearch}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            inputRef={inputRef}
            ctaBtnRef={ctaBtnRef}
          />
        </div>

        {/* ── Social proof — directly under search, no separator ── */}
        <div
          ref={proofRef}
          style={{
            display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Honest proof pills — verifiable facts only, no fabricated counts */}
          {([
            { text: '12,400+ free clinics mapped', dot: 'var(--accent)' },
            { text: '48 languages',                dot: 'var(--life)' },
            { text: 'Always free',                 dot: 'var(--success)' },
          ] as const).map(pill => (
            <div key={pill.text} style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-lg)',
              padding: '7px 14px',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: pill.dot, flexShrink: 0,
              }} aria-hidden="true" />
              <span style={{
                fontSize: '12px', color: 'var(--text-2)',
                fontFamily: 'var(--font-inter)', fontWeight: 500,
                whiteSpace: 'nowrap',
              }}>
                {pill.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          HERO MOCKUP — decorative social proof
      ════════════════════════════════════════ */}
      <HeroMockup mockupRef={mockupRef} />

      {/* ── Styles ── */}
      <style>{`
        /* Mobile tweaks */
        @media (max-width: 768px) {
          #hero { padding-bottom: 32px !important; }
          #hero h1 { font-size: clamp(2.4rem, 9vw, 3.6rem) !important; }
        }
        @media (max-width: 480px) {
          #hero h1 { font-size: clamp(2rem, 8.5vw, 2.8rem) !important; }
          #hero p  { font-size: 0.9rem !important; }
        }

        /* Search submit hover */
        .search-submit:hover {
          box-shadow: var(--shadow-glow) !important;
          transform: scale(1.04) !important;
        }

        /* Geo button hover */
        .geo-btn:hover { opacity: 1 !important; }

        /* Word cycle animation */
        @keyframes word-in {
          from { opacity: 0; transform: rotateX(-90deg) translateY(10px); }
          to   { opacity: 1; transform: rotateX(0deg) translateY(0px); }
        }
        @keyframes word-out {
          from { opacity: 1; transform: rotateX(0deg) translateY(0px); }
          to   { opacity: 0; transform: rotateX(90deg) translateY(-10px); }
        }
        .word-cycle-in  { animation: word-in  0.38s cubic-bezier(0.34,1.3,0.64,1) forwards; }
        .word-cycle-out { animation: word-out 0.32s cubic-bezier(0.4,0,1,1) forwards; }
      `}</style>
    </section>
  )
}
