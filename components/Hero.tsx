'use client'
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap-st'
import { useI18n } from '@/components/I18nContext'
import SearchBar from '@/components/hero/SearchBar'
import TrendingCarousel from '@/components/hero/TrendingCarousel'
import HeroMockup from '@/components/hero/HeroMockup'

registerGSAP()

/* ── Animated cycling words (#21st-dev animated-hero) ── */
const CYCLE_WORDS = ['unlocked', 'possible', 'deserved', 'waiting']

const PLACEHOLDERS = [
  'Symptom, specialty, or clinic name...',
  'Primary care near me...',
  'Free dental near me...',
  'Mental health services...',
  'Walk-in clinic today...',
  'Pediatrics · no insurance needed...',
]

export default function Hero() {
  const { t } = useI18n()
  const router = useRouter()

  /* ── Section & animation refs ── */
  const sectionRef  = useRef<HTMLElement>(null)
  const h1Ref       = useRef<HTMLHeadingElement>(null)
  const subRef      = useRef<HTMLParagraphElement>(null)
  const searchRef   = useRef<HTMLDivElement>(null)
  const chipsRef    = useRef<HTMLDivElement>(null)
  const eyebrowRef  = useRef<HTMLDivElement>(null)
  const socialRef   = useRef<HTMLDivElement>(null)
  const mockupRef   = useRef<HTMLDivElement>(null)
  const orb1Ref     = useRef<HTMLDivElement>(null)
  const orb2Ref     = useRef<HTMLDivElement>(null)
  const orb3Ref     = useRef<HTMLDivElement>(null)
  const gridRef     = useRef<HTMLDivElement>(null)

  /* SearchBar sub-component refs (passed down) */
  const inputRef   = useRef<HTMLInputElement>(null)
  const ctaBtnRef  = useRef<HTMLButtonElement>(null)

  /* ── State ── */
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [searchVal, setSearchVal]           = useState('')
  const [locationVal, setLocationVal]       = useState('')
  const [cycleIdx, setCycleIdx]             = useState(0)
  const [wordClass, setWordClass]           = useState('word-cycle-in')

  /* ── Restore last-used location from localStorage ── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexus_location') || localStorage.getItem('nexus_zip') || ''
      if (stored) setLocationVal(stored)
    } catch { /* private browsing / storage denied */ }
  }, [])

  /* ── Cycling headline word (#21st-dev animated-hero) ── */
  useEffect(() => {
    const id = setInterval(() => {
      setWordClass('word-cycle-out')
      const timer = setTimeout(() => {
        setCycleIdx(i => (i + 1) % CYCLE_WORDS.length)
        setWordClass('word-cycle-in')
      }, 380)
      return () => clearTimeout(timer)
    }, 2600)
    return () => clearInterval(id)
  }, [])

  /* ── Cycling placeholder (GSAP fade) ── */
  useEffect(() => {
    const id = setInterval(() => {
      const input = inputRef.current
      if (!input || document.activeElement === input) return
      gsap.to(input, {
        opacity: 0, duration: 0.22,
        onComplete: () => {
          setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length)
          gsap.to(input, { opacity: 1, duration: 0.22 })
        },
      })
    }, 3200)
    return () => clearInterval(id)
  }, [])

  /* ── Scroll parallax on background grid ── */
  useEffect(() => {
    let rafId: number
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY
        if (gridRef.current) gridRef.current.style.transform = `translateY(${y * 0.12}px)`
        if (orb1Ref.current) orb1Ref.current.style.transform = `translateX(-50%) translateY(${y * 0.06}px)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId) }
  }, [])

  /* ── P9: GSAP initial states ──────────────────────────────────────────────
   * CSS classes (.h1-word, .hero-fade-up) already set visibility:hidden +
   * transform on these elements BEFORE JS runs, so LCP measurement happens
   * on the pre-paint hidden state (counted by browsers) rather than being
   * blocked by a post-paint opacity:0 set by JS.
   * Here we only need to set the eyebrow (no CSS class) and orbs.
   * ─────────────────────────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    gsap.set([eyebrowRef.current], { opacity: 0 })
  }, [])

  /* ── Hero entrance + ScrollTrigger pin ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = h1Ref.current?.querySelectorAll('.h1-word') ?? []

      const tl = gsap.timeline({ delay: 0.15 })
      tl
        .to(eyebrowRef.current,  { opacity: 1, visibility: 'visible',                 duration: 0.7,  ease: 'power3.out' })
        .to(socialRef.current,   { y: 0, opacity: 1, visibility: 'visible',           duration: 0.65, ease: 'power3.out' }, '-=0.45')
        .to([...words],          { y: '0%', opacity: 1, visibility: 'visible',        duration: 1.0,  stagger: 0.11, ease: 'power4.out' }, '-=0.35')
        .to(subRef.current,      { y: 0, opacity: 1, visibility: 'visible',           duration: 0.8,  ease: 'power3.out' }, '-=0.5')
        .to(searchRef.current,   { y: 0, opacity: 1, visibility: 'visible',           duration: 0.8,  ease: 'power3.out' }, '-=0.55')
        .to(chipsRef.current,    { y: 0, opacity: 1, visibility: 'visible',           duration: 0.7,  ease: 'power3.out' }, '-=0.5')
        .to(mockupRef.current,   { y: 0, opacity: 1, visibility: 'visible',           duration: 1.0,  ease: 'power3.out' }, '-=0.35')

      /* Scroll-out: content fades, mockup rises */
      const pinTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top', end: '+=580',
          scrub: 1.4, pin: true, pinSpacing: true, anticipatePin: 1,
        },
      })
      pinTl
        .to(eyebrowRef.current, { opacity: 0, y: -18,              duration: 0.28 }, 0)
        .to(socialRef.current,  { opacity: 0, y: -14,              duration: 0.25 }, 0)
        .to(h1Ref.current,      { y: -80, opacity: 0, scale: 0.94, duration: 0.50 }, 0)
        .to(subRef.current,     { y: -45, opacity: 0,              duration: 0.38 }, 0.06)
        .to(chipsRef.current,   { opacity: 0, y: -16,              duration: 0.28 }, 0.09)
        .to(searchRef.current,  { y: -18, opacity: 0,              duration: 0.32 }, 0.14)
        .to(orb1Ref.current,    { scale: 2.4, opacity: 0,          duration: 0.65 }, 0)
        .to(orb2Ref.current,    { x: 240, opacity: 0,              duration: 0.50 }, 0.04)
        .to(orb3Ref.current,    { x: -160, opacity: 0,             duration: 0.50 }, 0.04)
        .to(gridRef.current,    { opacity: 0,                      duration: 0.38 }, 0.12)
        .to(mockupRef.current,  { y: -40, scale: 1.02,             duration: 0.70 }, 0.08)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  /* ── Magnetic CTA button ── */
  useEffect(() => {
    const btn = ctaBtnRef.current
    if (!btn) return
    const parent = btn.closest('[role="search"]') as HTMLElement || btn.parentElement!
    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width  / 2)
      const dy = e.clientY - (r.top  + r.height / 2)
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 90) {
        const force = (1 - dist / 90) * 0.32
        btn.style.transform = `translate(${dx * force}px, ${dy * force}px) translateY(-1px)`
      } else {
        btn.style.transform = ''
      }
    }
    const onLeave = () => { btn.style.transform = '' }
    parent.addEventListener('mousemove', onMove, { passive: true })
    parent.addEventListener('mouseleave', onLeave)
    return () => {
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  /* ── Symptom keyword detector (#21) ────────────────────────────────────────
   * If the user types a symptom ("chest pain", "can't sleep", "rash")
   * instead of a specialty, route them to /triage?symptom=... first.
   * The triage page walks them through severity → care-level → matched clinics.
   * ─────────────────────────────────────────────────────────────────────────── */
  const SYMPTOM_PATTERNS = [
    /\b(chest\s*pain|shortness\s*of\s*breath|can['']?t\s*breathe)\b/i,
    /\b(rash|itching|hives|skin\s+problem|eczema)\b/i,
    /\b(can['']?t\s+sleep|insomnia|anxiety|depression|mental\s+health|feeling\s+(sad|hopeless|overwhelmed))\b/i,
    /\b(headache|migraine|dizziness|fainting)\b/i,
    /\b(fever|cough|cold|flu|sick|nausea|vomiting)\b/i,
    /\b(back\s*pain|joint\s*pain|knee|shoulder)\b/i,
    /\b(stomach\s*pain|abdominal|cramps|constipat|diarr)\b/i,
    /\b(blurry\s*vision|eye\s*pain|ear\s*pain|hearing)\b/i,
    /\b(tooth\s*ache|toothache|gum|dental\s*pain)\b/i,
    /\b(blood|bleeding|wound|cut|swelling)\b/i,
  ]
  const isSymptomQuery = (q: string) => SYMPTOM_PATTERNS.some(rx => rx.test(q))

  /* ── Search handler ── */
  const handleSearch = useCallback(() => {
    const query = searchVal.trim()
    if (!query) return
    const btn = document.querySelector('.search-submit') as HTMLButtonElement
    if (btn) {
      btn.textContent = 'Searching...'
      gsap.to(btn, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 })
    }
    const loc = locationVal.trim()

    // #21: Symptom queries → triage first; specialty/location queries → search
    const destination = isSymptomQuery(query)
      ? `/triage?symptom=${encodeURIComponent(query)}&loc=${encodeURIComponent(loc)}`
      : `/search?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(loc)}`

    setTimeout(() => { router.push(destination) }, 320)
  }, [searchVal, locationVal, router])

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-h1"
      style={{
        position: 'relative', zIndex: 2,
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(40px, 8vh, 60px) 2rem clamp(20px, 4vh, 40px)',
        overflow: 'hidden',
      }}
    >
      {/* ── AMBIENT ORBS ── */}
      <div ref={orb1Ref} aria-hidden="true" style={{
        position: 'absolute', width: '1100px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(74,144,217,0.18) 0%, rgba(74,144,217,0.06) 40%, transparent 70%)',
        top: '-220px', left: '50%', transform: 'translateX(-50%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', width: '600px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(167,210,190,0.10) 0%, transparent 65%)',
        top: '5%', left: '-100px', filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div ref={orb2Ref} aria-hidden="true" style={{
        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,210,190,0.08) 0%, transparent 65%)',
        top: '25%', right: '-140px', filter: 'blur(65px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div ref={orb3Ref} aria-hidden="true" style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74,144,217,0.08) 0%, transparent 65%)',
        bottom: '8%', left: '-100px', filter: 'blur(58px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── GRID LINES ── */}
      <div ref={gridRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(74,144,217,0.07)', top: '28%',    animation: 'grid-fade 4s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(74,144,217,0.05)', bottom: '32%', animation: 'grid-fade 5s ease-in-out infinite 1s' }} />
        <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(74,144,217,0.05)', left: '18%',   animation: 'grid-fade 4.5s ease-in-out infinite 0.5s' }} />
        <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(74,144,217,0.04)', right: '18%',  animation: 'grid-fade 4s ease-in-out infinite 2s' }} />
      </div>

      {/* ── HERO CONTENT ── */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1040px' }}>

        {/* Eyebrow pill */}
        <div ref={eyebrowRef} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.22)',
          borderRadius: '100px', padding: '7px 18px 7px 12px',
          fontSize: '11px', color: 'var(--accent2)', fontWeight: 300,
          letterSpacing: '0.07em', textTransform: 'uppercase',
          marginBottom: '1rem', fontFamily: 'var(--font-inter)',
          boxShadow: '0 0 20px rgba(74,144,217,0.10)',
        }}>
          <span style={{
            width: '5px', height: '5px', background: 'var(--accent)', borderRadius: '50%',
            animation: 'pulse-dot 2s ease-in-out infinite',
            boxShadow: '0 0 6px rgba(74,144,217,0.8)',
          }} aria-hidden="true" />
          Free. Private. No insurance required.
        </div>

        {/* Social proof */}
        <div ref={socialRef} className="hero-fade-up" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', marginBottom: '1.2rem', flexWrap: 'wrap',
        }}>
          {/* Avatar stack */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {(['var(--accent)', '#4a7c84', 'var(--accent2)', '#5a9099', '#3d717a'] as const).map((bg, i) => (
              <div key={i} aria-hidden="true" style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${bg}, ${bg}99)`,
                border: '2px solid #07070F', marginLeft: i === 0 ? 0 : '-8px',
                zIndex: 5 - i, position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 600, color: '#fff',
              }}>
                {['J','M','A','S','R'][i]}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>284,000+</span>
              <span style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>patients helped this year</span>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24" stroke="none" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
              <span style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', marginLeft: '4px', lineHeight: '11px' }}>4.9/5 from 12K+ reviews</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(0,0,0,0.07)' }} aria-hidden="true" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px rgba(96,165,250,0.6)', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} aria-hidden="true" />
            <span style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>Free · Always</span>
          </div>
        </div>

        {/* ── H1 with animated cycling word ── */}
        <h1
          ref={h1Ref}
          id="hero-h1"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 6.5vw, 6.5rem)',
            fontWeight: 800, lineHeight: 1.05,
            letterSpacing: '-0.035em',
            maxWidth: '960px', margin: '0 auto 0.9rem',
            perspective: '600px',
          }}
        >
          <span className="h1-line" style={{ display: 'block', overflow: 'hidden' }}>
            <span className="h1-word" style={{ display: 'inline-block' }}>
              {'Free healthcare,'.split('').map((ch, i) => (
                <span key={i} className="h1-char" style={{ animationDelay: `${0.95 + i * 0.028}s` }} aria-hidden={ch === ' ' ? 'true' : undefined}>
                  {ch === ' ' ? ' ' : ch}
                </span>
              ))}
            </span>
          </span>
          <span className="h1-line" style={{ display: 'block', overflow: 'hidden' }}>
            <span className="h1-word" style={{ display: 'inline-block' }}>
              <span style={{ display: 'inline-block', position: 'relative', perspective: '500px', transformStyle: 'preserve-3d', textAlign: 'center' }}>
                {/* Width spacer: locked to the widest word so the container never jumps */}
                <span aria-hidden="true" style={{ visibility: 'hidden', display: 'inline-block' }}>
                  {CYCLE_WORDS.reduce((a, b) => a.length >= b.length ? a : b)}
                </span>
                {/* Animated word — centered inside the fixed-width container */}
                <span
                  key={cycleIdx}
                  className={wordClass}
                  style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', display: 'block', color: 'var(--accent)', transformOrigin: 'center bottom', whiteSpace: 'nowrap' }}
                >
                  {CYCLE_WORDS[cycleIdx]}
                </span>
                {/* Underline accent */}
                <span aria-hidden="true" style={{
                  position: 'absolute', bottom: '2px', left: 0, right: 0, height: '3px',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent2), transparent)',
                  borderRadius: '2px', opacity: 0.6,
                }} />
              </span>
              {' '}in seconds.
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p ref={subRef} className="hero-fade-up" style={{
          fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
          color: 'var(--text-2)', maxWidth: '520px',
          lineHeight: 1.7, fontWeight: 300,
          margin: '0 auto 1.25rem',
          fontFamily: 'var(--font-inter)',
        }}>
          {t('home.hero.subheadline')}
        </p>

        {/* ── SEARCH BAR (sub-component, fades on scroll) ── */}
        <div ref={searchRef} className="hero-fade-up" style={{ width: '100%', maxWidth: '660px', margin: '0 auto 0.8rem', position: 'relative' }}>
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

        {/* Quick-pick chips */}
        <div ref={chipsRef} className="hero-fade-up" role="group" aria-label="Quick search suggestions"
          style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }} aria-hidden="true">Try:</span>
          {([
            { label: 'Primary care', icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            )},
            { label: 'Dental', icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2C8 2 5 5 5 8c0 2 .8 3.5 1.5 5L8 21h2l2-5 2 5h2l1.5-8C18.2 11.5 19 10 19 8c0-3-3-6-7-6z"/>
              </svg>
            )},
            { label: 'Mental health', icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6l-1 5H9l-1-5C6.5 13.5 5 11.5 5 9a7 7 0 0 1 7-7z"/>
                <line x1="12" y1="17" x2="12" y2="20"/>
              </svg>
            )},
            { label: "Women's health", icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="5"/>
                <line x1="12" y1="13" x2="12" y2="21"/>
                <line x1="9" y1="18" x2="15" y2="18"/>
              </svg>
            )},
            { label: 'Pediatrics', icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="6" r="3"/>
                <path d="M9 20v-5a3 3 0 0 1 6 0v5"/>
                <line x1="9" y1="17" x2="15" y2="17"/>
              </svg>
            )},
          ] as { label: string; icon: React.ReactNode }[]).map(({ label, icon }) => (
            <button key={label} type="button"
              onClick={() => setSearchVal(label)}
              className="chip-pill"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', color: 'var(--text-2)',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border2)',
                borderRadius: '100px', padding: '4px 12px 4px 10px', cursor: 'pointer',
                fontFamily: 'var(--font-inter)', fontWeight: 300,
                transition: 'all 0.25s var(--ease-spring)',
              }}
            >{icon}{label}</button>
          ))}
        </div>

        {/* ── TRENDING CAROUSEL (sub-component) ── */}
        <TrendingCarousel onSelect={q => setSearchVal(q)} />


      </div>

      {/* ── MOBILE VISUAL — stat cards (shown only on mobile via CSS) ── */}
      <div className="hero-mobile-visual" style={{
        display: 'none',
        flexDirection: 'column', gap: '10px',
        width: '100%', maxWidth: '400px', margin: '24px auto 0',
        padding: '0 4px',
      }}>
        {/* Mini clinic result cards */}
        {[
          { name: 'Community Health Center', dist: '1.2 mi', badge: 'Free care',    badgeColor: 'var(--green-pulse)', badgeBg: 'rgba(74,222,128,0.10)' },
          { name: 'Free Care Clinic',       dist: '2.8 mi', badge: 'Sliding scale', badgeColor: 'var(--amber)',      badgeBg: 'rgba(252,211,77,0.10)'  },
          { name: 'Neighborhood FQHC',      dist: '4.1 mi', badge: 'Accepting',     badgeColor: 'var(--accent)',     badgeBg: 'rgba(74,144,217,0.10)'  },
        ].map((item, i) => (
          <div key={item.name} aria-hidden="true" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 14px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            opacity: 1 - i * 0.15,
            transform: `scale(${1 - i * 0.02})`,
            transformOrigin: 'top center',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(74,144,217,0.10)', border: '1px solid rgba(74,144,217,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.40)', fontFamily: 'var(--font-inter)', marginTop: '2px' }}>{item.dist} away</div>
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '100px', color: item.badgeColor, background: item.badgeBg, flexShrink: 0, fontFamily: 'var(--font-inter)', letterSpacing: '0.01em' }}>{item.badge}</span>
          </div>
        ))}
        {/* Bottom stat strip */}
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 0 4px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
          {[['12,000+', 'Free clinics'], ['$0', 'To use NEXUS'], ['50', 'States covered']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>{val}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.40)', fontFamily: 'var(--font-inter)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FLOATING MOCKUP — desktop only (wrapper collapses on mobile) ── */}
      <div className="mockup-desktop-wrapper hero-fade-up" style={{ width: '100%' }}>
        <HeroMockup mockupRef={mockupRef} />
      </div>

      <style>{`
        @keyframes grid-fade {
          0%, 100% { opacity: 0.06; }
          50%       { opacity: 0.11; }
        }
        @media (max-width: 768px) {
          #hero { padding: 90px 1.25rem 0 !important; }
          /* Collapse the desktop 3D mockup wrapper entirely — zero height, no ghost space */
          .mockup-desktop-wrapper { display: none !important; }
          /* Show the mobile clinic-card visual */
          .hero-mobile-visual { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hero-mobile-visual { display: none !important; }
        }
        /* C3 — CSS hover for chip pills */
        .chip-pill:hover {
          color: var(--accent) !important;
          border-color: rgba(74,144,217,0.30) !important;
          background: var(--accent-dim) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(74,144,217,0.12);
        }
        /* C3 — CSS hover for trending pills */
        .trending-pill:hover {
          color: var(--accent) !important;
          border-color: rgba(74,144,217,0.25) !important;
          background: var(--accent-dim) !important;
        }
        /* C3 — CSS hover for geo button */
        .geo-btn:hover { opacity: 1 !important; }
        /* C3 — CSS hover for search submit */
        .search-submit:hover {
          box-shadow: 0 8px 32px rgba(74,144,217,0.48) !important;
        }
        /* Search bar root positioning */
        .search-bar-root {
          position: relative;
          width: 100%;
        }
      `}</style>
    </section>
  )
}
