'use client'
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap-st'
import { useI18n } from '@/components/I18nContext'
import SearchBar from '@/components/hero/SearchBar'

registerGSAP()

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
   HERO — “Midnight Clinic”
   One static promise, composed like a headline — not assembled.
   • Two-line H1 with a single Instrument Serif italic accent word
   • One luminous moment on the page: the horizon line + aurora
   • No loops: entrance plays once, then the page is still
   • The search bar is the product — everything points at it
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
  const inputRef   = useRef<HTMLInputElement>(null)
  const ctaBtnRef  = useRef<HTMLButtonElement>(null)

  /* state */
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [searchVal, setSearchVal]           = useState('')
  const [locationVal, setLocationVal]       = useState('')

  /* restore saved location */
  useEffect(() => {
    try {
      const s = localStorage.getItem('nexus_location') || localStorage.getItem('nexus_zip') || ''
      if (s) setLocationVal(s)
    } catch { /* private browsing */ }
  }, [])

  /* cycling placeholder — inside the input only; communicates search breadth */
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
        .to(proofRef.current,   { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.4')

      /* Gentle scroll-out — content lifts and fades as one unit */
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
        minHeight: '92dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingBottom: '64px',
      }}
    >

      {/* ── Background: the one luminous moment on the page ── */}
      <div ref={bgRef} aria-hidden="true" style={{
        position: 'absolute', inset: '-20% 0', zIndex: 0, pointerEvents: 'none',
        willChange: 'transform',
      }}>
        <div className="aurora" />
        {/* Horizon line */}
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
        className="hero-content"
        style={{
          position: 'relative', zIndex: 2,
          paddingTop: 'clamp(96px, 12vh, 140px)',
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

        {/* ── Eyebrow — mono caps, quiet ── */}
        <div ref={eyebrowRef} style={{ marginBottom: '32px' }}>
          <span style={{
            fontSize: '11.5px', fontWeight: 500, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--text-3)',
            fontFamily: 'var(--font-mono)',
          }}>
            Free · Private · No insurance required
          </span>
        </div>

        {/* ── H1 — static, composed. The serif italic is the single accent. ── */}
        <h1
          ref={h1Ref}
          id="hero-h1"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.9rem, 6.4vw, 5.6rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            marginBottom: '24px',
            textAlign: 'center',
            color: 'var(--text)',
          }}
        >
          <span style={{ display: 'block' }}>Free healthcare,</span>
          <span style={{ display: 'block' }}>
            <span className="hero-accent-word">found</span>
            {' '}in seconds.
          </span>
        </h1>

        {/* ── Subtitle ── */}
        <p
          ref={subRef}
          style={{
            fontSize: 'clamp(0.95rem, 1.35vw, 1.1rem)',
            color: 'var(--text-2)',
            maxWidth: '520px',
            lineHeight: 1.7,
            fontWeight: 400,
            marginBottom: '36px',
            fontFamily: 'var(--font-inter)',
          }}
        >
          {t('home.hero.subheadline')}
        </p>

        {/* ── Search — the product ── */}
        <div
          ref={searchRef}
          style={{ width: '100%', maxWidth: '640px', marginBottom: '28px' }}
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

        {/* ── Proof — quiet mono facts, thin rules. No pills, no stars. ── */}
        <div
          ref={proofRef}
          role="list"
          aria-label="Trust facts"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '14px', flexWrap: 'wrap',
          }}
        >
          {['12,400+ free clinics mapped', '48 languages', 'Always free'].map((fact, i, arr) => (
            <span key={fact} role="listitem" style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
              <span style={{
                fontSize: '11.5px', color: 'var(--text-3)',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>
                {fact}
              </span>
              {i < arr.length - 1 && (
                <span aria-hidden="true" style={{
                  width: '1px', height: '12px',
                  background: 'var(--border-subtle)', display: 'inline-block',
                }} />
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        /* Serif accent word — gradient ink */
        .hero-accent-word {
          background: var(--grad-text);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          padding-right: 0.04em; /* italic overhang clip guard */
        }
        @media (max-width: 768px) {
          #hero { padding-bottom: 40px !important; }
          #hero h1 { font-size: clamp(2.5rem, 10vw, 3.6rem) !important; }
        }
        @media (max-width: 480px) {
          #hero h1 { font-size: clamp(2.1rem, 9vw, 2.9rem) !important; }
          #hero p  { font-size: 0.92rem !important; }
        }
        .search-submit:hover {
          box-shadow: var(--shadow-glow) !important;
        }
        .geo-btn:hover { opacity: 1 !important; }
      `}</style>
    </section>
  )
}
