'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

/* ── 21st.dev animated-hero: cycling words ── */
const CYCLE_WORDS = ['unlocked', 'possible', 'deserved', 'waiting']

const TRENDING = [
  '🔥 Free dental Phoenix',
  '💊 Insulin help NYC',
  '🧠 Mental health LA',
  '👶 Pediatrics Chicago',
  '💉 Vaccines Houston',
  '👁️ Eye care Miami',
  '❤️ Cardiology Seattle',
  '🦷 Dental Dallas',
  '🤰 OB/GYN Austin',
  '🩺 Walk-in Denver',
]

const PLACEHOLDERS = [
  'Symptom, specialty, or clinic name...',
  'Primary care near me...',
  'Free dental in Phoenix...',
  'Mental health services...',
  'Walk-in clinic today...',
  'Pediatrics · no insurance needed...',
]

const SIDEBAR_ITEMS = [
  { label: 'Home',     active: true,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { label: 'Store',    active: false,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
  { label: 'Team',     active: false,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: 'Settings', active: false,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
  { label: 'Filters',  active: false,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> },
]

const MOCKUP_RESULTS = [
  { initials: 'CA', name: 'Clinica Adelante',      dist: '1.2 mi', wait: '~20 min', status: 'Open', green: true },
  { initials: 'VS', name: 'Valle del Sol Health',   dist: '2.8 mi', wait: '~45 min', status: 'Busy', green: false },
  { initials: 'MP', name: 'Mountain Park Health',   dist: '4.1 mi', wait: '~15 min', status: 'Open', green: true },
]

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const h1Ref      = useRef<HTMLHeadingElement>(null)
  const subRef     = useRef<HTMLParagraphElement>(null)
  const searchRef  = useRef<HTMLDivElement>(null)
  const chipsRef   = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const socialRef  = useRef<HTMLDivElement>(null)
  const mockupRef  = useRef<HTMLDivElement>(null)
  const orb1Ref    = useRef<HTMLDivElement>(null)
  const orb2Ref    = useRef<HTMLDivElement>(null)
  const orb3Ref    = useRef<HTMLDivElement>(null)
  const gridRef    = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const router     = useRouter()

  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [searchVal, setSearchVal]           = useState('')
  const [locationVal, setLocationVal]       = useState('Phoenix, AZ')
  const [editingLoc, setEditingLoc]         = useState(false)
  const locationRef = useRef<HTMLInputElement>(null)
  const [cycleIdx, setCycleIdx]             = useState(0)
  const [wordClass, setWordClass]           = useState('word-cycle-in')

  /* ── Word cycling (21st.dev animated-hero) ── */
  useEffect(() => {
    const id = setInterval(() => {
      setWordClass('word-cycle-out')
      const t = setTimeout(() => {
        setCycleIdx(i => (i + 1) % CYCLE_WORDS.length)
        setWordClass('word-cycle-in')
      }, 380)
      return () => clearTimeout(t)
    }, 2600)
    return () => clearInterval(id)
  }, [])

  /* ── Cycling placeholder ── */
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


  /* ── Subtle scroll parallax on background grid ── */
  useEffect(() => {
    let rafId: number
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY
        // Grid lines drift slightly upward on scroll (GSAP only sets opacity on gridRef, not transform)
        if (gridRef.current) {
          gridRef.current.style.transform = `translateY(${y * 0.12}px)`
        }
        // Orb1 drifts upward (no GSAP transform conflict after pin completes)
        if (orb1Ref.current) {
          orb1Ref.current.style.transform = `translateX(-50%) translateY(${y * 0.06}px)`
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId) }
  }, [])

  /* ── Mockup 3D tilt ── */
  useEffect(() => {
    const mockup = mockupRef.current
    if (!mockup) return
    const inner = mockup.querySelector<HTMLElement>('.mockup-inner')
    if (!inner) return
    const onMove = (e: MouseEvent) => {
      const r = mockup.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2)
      const y = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2)
      gsap.to(inner, { rotateX: -y * 4, rotateY: x * 5, duration: 0.7, ease: 'power2.out', transformStyle: 'preserve-3d', overwrite: 'auto' })
    }
    const onLeave = () => gsap.to(inner, { rotateX: 5, rotateY: 0, duration: 1.2, ease: 'elastic.out(1,0.4)', overwrite: 'auto' })
    mockup.addEventListener('mousemove', onMove)
    mockup.addEventListener('mouseleave', onLeave)
    return () => { mockup.removeEventListener('mousemove', onMove); mockup.removeEventListener('mouseleave', onLeave) }
  }, [])

  /* ── Hero entrance + scroll-out pin ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = h1Ref.current?.querySelectorAll('.h1-word') ?? []
      gsap.set([...words, subRef.current, searchRef.current, chipsRef.current,
                eyebrowRef.current, socialRef.current, mockupRef.current], { opacity: 0 })
      gsap.set([...words], { y: '110%' })
      gsap.set([subRef.current, searchRef.current, chipsRef.current,
                socialRef.current, mockupRef.current], { y: 30 })

      const tl = gsap.timeline({ delay: 0.15 })
      tl
        .to(eyebrowRef.current,  { opacity: 1,                  duration: 0.7,  ease: 'power3.out' })
        .to(socialRef.current,   { y: 0,    opacity: 1,         duration: 0.65, ease: 'power3.out' }, '-=0.45')
        .to([...words],          { y: '0%', opacity: 1,         duration: 1.0,  stagger: 0.11, ease: 'power4.out' }, '-=0.35')
        .to(subRef.current,      { y: 0,    opacity: 1,         duration: 0.8,  ease: 'power3.out' }, '-=0.5')
        .to(searchRef.current,   { y: 0,    opacity: 1,         duration: 0.8,  ease: 'power3.out' }, '-=0.55')
        .to(chipsRef.current,    { y: 0,    opacity: 1,         duration: 0.7,  ease: 'power3.out' }, '-=0.5')
        .to(mockupRef.current,   { y: 0,    opacity: 1,         duration: 1.0,  ease: 'power3.out' }, '-=0.35')

      /* Scroll-out pin: search fades, mockup rises */
      const pinTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=580',
          scrub: 1.4,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      })
      pinTl
        .to(eyebrowRef.current, { opacity: 0, y: -18,                   duration: 0.28 }, 0)
        .to(socialRef.current,  { opacity: 0, y: -14,                   duration: 0.25 }, 0)
        .to(h1Ref.current,      { y: -80, opacity: 0, scale: 0.94,      duration: 0.50 }, 0)
        .to(subRef.current,     { y: -45, opacity: 0,                   duration: 0.38 }, 0.06)
        .to(chipsRef.current,   { opacity: 0, y: -16,                   duration: 0.28 }, 0.09)
        .to(searchRef.current,  { y: -18, opacity: 0,                   duration: 0.32 }, 0.14)
        .to(orb1Ref.current,    { scale: 2.4, opacity: 0,               duration: 0.65 }, 0)
        .to(orb2Ref.current,    { x: 240, opacity: 0,                   duration: 0.50 }, 0.04)
        .to(orb3Ref.current,    { x: -160, opacity: 0,                  duration: 0.50 }, 0.04)
        .to(gridRef.current,    { opacity: 0,                           duration: 0.38 }, 0.12)
        .to(mockupRef.current,  { y: -40, scale: 1.02,                  duration: 0.70 }, 0.08)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const handleSearch = useCallback(() => {
    const query = searchVal.trim()
    if (!query) return
    const btn = document.querySelector('.search-submit') as HTMLButtonElement
    if (btn) {
      btn.textContent = 'Searching...'
      gsap.to(btn, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 })
    }
    const loc = locationVal.trim() || 'Phoenix, AZ'
    setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(loc)}`)
    }, 320)
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
      {/* Primary top glow — stronger, larger */}
      <div ref={orb1Ref} aria-hidden="true" style={{
        position: 'absolute', width: '1100px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(110,231,183,0.18) 0%, rgba(110,231,183,0.06) 40%, transparent 70%)',
        top: '-220px', left: '50%', transform: 'translateX(-50%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Secondary — cool accent top-left */}
      <div aria-hidden="true" style={{
        position: 'absolute', width: '600px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(167,210,190,0.10) 0%, transparent 65%)',
        top: '5%', left: '-100px',
        filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div ref={orb2Ref} aria-hidden="true" style={{
        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,210,190,0.08) 0%, transparent 65%)',
        top: '25%', right: '-140px',
        filter: 'blur(65px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div ref={orb3Ref} aria-hidden="true" style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(110,231,183,0.08) 0%, transparent 65%)',
        bottom: '8%', left: '-100px',
        filter: 'blur(58px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── GRID LINES ── */}
      <div ref={gridRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(110,231,183,0.07)', top: '28%',    animation: 'grid-fade 4s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(110,231,183,0.05)', bottom: '32%', animation: 'grid-fade 5s ease-in-out infinite 1s' }} />
        <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(110,231,183,0.05)', left: '18%',   animation: 'grid-fade 4.5s ease-in-out infinite 0.5s' }} />
        <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(110,231,183,0.04)', right: '18%',  animation: 'grid-fade 4s ease-in-out infinite 2s' }} />
      </div>

      {/* ── HERO CONTENT ── */}
      <div id="main-content" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1040px' }}>

        {/* Eyebrow */}
        <div ref={eyebrowRef} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(110,231,183,0.06)',
          border: '1px solid rgba(110,231,183,0.22)',
          borderRadius: '100px',
          padding: '7px 18px 7px 12px',
          fontSize: '11px', color: 'var(--accent2)',
          fontWeight: 300, letterSpacing: '0.07em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          fontFamily: 'var(--font-inter)',
          boxShadow: '0 0 20px rgba(110,231,183,0.10)',
        }}>
          <span style={{
            width: '5px', height: '5px',
            background: 'var(--accent)', borderRadius: '50%',
            animation: 'pulse-dot 2s ease-in-out infinite',
            boxShadow: '0 0 6px rgba(110,231,183,0.8)',
          }} aria-hidden="true" />
          Free. Private. No insurance required.
        </div>

        {/* ── SOCIAL PROOF — above headline ── */}
        <div ref={socialRef} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', marginBottom: '1.2rem', flexWrap: 'wrap',
        }}>
          {/* Avatar stack */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {['var(--accent)','#4a7c84','var(--accent2)','#5a9099','#3d717a'].map((bg, i) => (
              <div key={i} aria-hidden="true" style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${bg}, ${bg}99)`,
                border: '2px solid #07070F',
                marginLeft: i === 0 ? 0 : '-8px',
                zIndex: 5 - i,
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 600, color: '#fff',
              }}>
                {['J','M','A','S','R'][i]}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-sora)' }}>284,000+</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>patients helped this year</span>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)', marginLeft: '4px', lineHeight: '11px' }}>4.9/5 from 12K+ reviews</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.08)' }} aria-hidden="true" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.6)', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} aria-hidden="true" />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>Free · Always</span>
          </div>
        </div>

        {/* ── H1 with animated cycling word ── */}
        <h1
          ref={h1Ref}
          id="hero-h1"
          style={{
            fontFamily: 'var(--font-sora)',
            fontSize: 'clamp(2.8rem, 6.5vw, 6.5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            maxWidth: '960px',
            margin: '0 auto 0.9rem',
            perspective: '600px',
          }}
        >
          <span className="h1-line" style={{ display: 'block', overflow: 'hidden' }}>
            <span className="h1-word" style={{ display: 'inline-block' }}>
              Free healthcare,
            </span>
          </span>
          <span className="h1-line" style={{ display: 'block', overflow: 'hidden' }}>
            <span className="h1-word" style={{ display: 'inline-block' }}>
              {/* Animated cycling word container */}
              <span style={{
                display: 'inline-block',
                position: 'relative',
                perspective: '500px',
                transformStyle: 'preserve-3d',
              }}>
                {/* Invisible spacer = widest word, locks container width */}
                <span aria-hidden="true" style={{ visibility: 'hidden', display: 'inline-block' }}>
                  {CYCLE_WORDS.reduce((a, b) => a.length >= b.length ? a : b)}
                </span>
                {/* Visible animated word, absolutely positioned on top */}
                <span
                  key={cycleIdx}
                  className={wordClass}
                  style={{
                    position: 'absolute',
                    left: 0, top: 0,
                    display: 'inline-block',
                    color: 'var(--accent)',
                    transformOrigin: 'center bottom',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {CYCLE_WORDS[cycleIdx]}
                </span>
                {/* Underline accent */}
                <span aria-hidden="true" style={{
                  position: 'absolute',
                  bottom: '2px', left: 0, right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent2), transparent)',
                  borderRadius: '2px',
                  opacity: 0.6,
                }} />
              </span>
              {' '}in seconds.
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p ref={subRef} style={{
          fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
          color: 'var(--text-2)', maxWidth: '520px',
          lineHeight: 1.7, fontWeight: 300,
          margin: '0 auto 1.25rem',
          fontFamily: 'var(--font-inter)',
        }}>
          Find free clinics, sliding-scale care, and hidden federal programs
          in seconds — for the 30 million Americans without insurance.
        </p>

        {/* ── SEARCH BAR (fades on scroll) ── */}
        <div ref={searchRef} style={{ width: '100%', maxWidth: '660px', margin: '0 auto 0.8rem', position: 'relative' }}>
          <div className="search-glow-ring" style={{
            position: 'absolute', inset: '-2px',
            borderRadius: '17px',
            background: 'linear-gradient(135deg, rgba(110,231,183,0.40), rgba(167,210,190,0.14))',
            opacity: 0, transition: 'opacity 0.4s',
            zIndex: 0, pointerEvents: 'none', filter: 'blur(1px)',
          }} />
          <div
            role="search"
            style={{
              position: 'relative', zIndex: 1,
              display: 'flex', alignItems: 'center',
              background: 'rgba(13,11,30,0.92)',
              border: '1px solid rgba(110,231,183,0.22)',
              borderRadius: '16px',
              padding: '7px 7px 7px 18px', gap: '10px',
              backdropFilter: 'blur(20px)',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              boxShadow: '0 4px 24px rgba(0,0,0,0.30)',
            }}
            onFocusCapture={e => {
              const w = e.currentTarget
              w.style.borderColor = 'rgba(110,231,183,0.55)'
              w.style.boxShadow = '0 0 0 1px rgba(110,231,183,0.22), 0 8px 36px rgba(0,0,0,0.40)'
              // Glow ring pulse
              const glow = w.previousElementSibling as HTMLElement
              glow.style.opacity = '1'
              glow.classList.remove('search-pulse-ring')
              void glow.offsetWidth
              glow.classList.add('search-pulse-ring')
            }}
            onBlurCapture={e => {
              const w = e.currentTarget
              w.style.borderColor = 'rgba(110,231,183,0.22)'
              w.style.boxShadow = '0 4px 24px rgba(0,0,0,0.30)'
              const glow = w.previousElementSibling as HTMLElement
              glow.style.opacity = '0'
              glow.classList.remove('search-pulse-ring')
            }}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, opacity: 0.5 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <label htmlFor="main-search" className="sr-only">Search for free healthcare near you</label>
            <input
              ref={inputRef}
              id="main-search"
              type="search"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              autoComplete="off"
              aria-label="Search for free healthcare near you"
              onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text)', fontFamily: 'var(--font-inter)',
                fontSize: '15px', fontWeight: 300, padding: '9px 0', cursor: 'text',
              }}
            />
            <div style={{ width: '1px', height: '26px', background: 'var(--border2)', flexShrink: 0 }} aria-hidden="true" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0, padding: '0 4px' }}
              onClick={() => { setEditingLoc(true); setTimeout(() => locationRef.current?.focus(), 50) }}
            >
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, opacity: 0.6 }}>
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <input
                ref={locationRef}
                value={locationVal}
                onChange={e => setLocationVal(e.target.value)}
                onFocus={() => setEditingLoc(true)}
                onBlur={() => setEditingLoc(false)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                placeholder="City or zip"
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: editingLoc ? 'var(--text)' : 'var(--text-2)',
                  fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 300,
                  width: editingLoc ? '110px' : `${Math.max(70, locationVal.length * 7.5)}px`,
                  cursor: 'text', transition: 'width 0.2s, color 0.2s',
                  whiteSpace: 'nowrap',
                }}
              />
            </div>
            <button
              className="search-submit btn-shimmer"
              onClick={handleSearch}
              aria-label="Search for free care"
              style={{
                background: 'var(--accent)', color: 'var(--bg)',
                border: 'none', borderRadius: '11px',
                padding: '13px 22px',
                fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 500,
                cursor: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'transform 0.15s, box-shadow 0.25s',
                boxShadow: '0 4px 20px rgba(110,231,183,0.32)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(110,231,183,0.48)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(110,231,183,0.32)'
              }}
            >
              Find care →
            </button>
          </div>
        </div>

        {/* Chips */}
        <div ref={chipsRef} role="list" aria-label="Quick search suggestions"
          style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }} aria-hidden="true">Try:</span>
          {['Primary care', 'Dental', 'Mental health', "Women's health", 'Pediatrics'].map(c => (
            <a key={c} href="#" role="listitem"
              onClick={e => { e.preventDefault(); setSearchVal(c) }}
              style={{
                fontSize: '12px', color: 'var(--text-2)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border2)',
                borderRadius: '100px', padding: '4px 14px',
                cursor: 'none', textDecoration: 'none',
                fontFamily: 'var(--font-inter)', fontWeight: 300,
                transition: 'all 0.25s var(--ease-spring)',
              }}
              onMouseEnter={e => {
                const t = e.currentTarget
                t.style.color = 'var(--accent)'; t.style.borderColor = 'rgba(110,231,183,0.30)'
                t.style.background = 'var(--accent-dim)'; t.style.transform = 'translateY(-1px)'
                t.style.boxShadow = '0 4px 12px rgba(110,231,183,0.12)'
              }}
              onMouseLeave={e => {
                const t = e.currentTarget
                t.style.color = 'var(--text-2)'; t.style.borderColor = 'var(--border2)'
                t.style.background = 'rgba(255,255,255,0.03)'; t.style.transform = ''
                t.style.boxShadow = ''
              }}
            >{c}</a>
          ))}
        </div>

        {/* ── SOCIAL PROOF (moved above headline) ── */}
        <div style={{ display: 'none' }}>
          {/* Avatar stack */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {['var(--accent)','#4a7c84','var(--accent2)','#5a9099','#3d717a'].map((bg, i) => (
              <div key={i} aria-hidden="true" style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${bg}, ${bg}99)`,
                border: '2px solid #07070F',
                marginLeft: i === 0 ? 0 : '-8px',
                zIndex: 5 - i,
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 600, color: '#fff',
              }}>
                {['J','M','A','S','R'][i]}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-sora)' }}>284,000+</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>patients helped this year</span>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)', marginLeft: '4px', lineHeight: '11px' }}>4.9/5 from 12K+ reviews</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.08)' }} aria-hidden="true" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.6)', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} aria-hidden="true" />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>Free · Always</span>
          </div>
        </div>

        {/* ── TRENDING CAROUSEL ── */}
        <div style={{
          width: '100%', maxWidth: '660px', margin: '0 auto',
          overflow: 'hidden',
          maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
              Trending
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border2)' }} aria-hidden="true" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="trending-track" style={{ display: 'flex', gap: '8px' }}>
              {[...TRENDING, ...TRENDING].map((t, i) => (
                <button
                  key={i}
                  onClick={() => setSearchVal(t.replace(/^.{2}/, '').trim())}
                  style={{
                    flexShrink: 0,
                    fontSize: '11px', color: 'var(--text-3)',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border2)',
                    borderRadius: '100px', padding: '4px 12px',
                    cursor: 'none', whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-inter)', fontWeight: 300,
                    transition: 'color 0.2s, border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--accent)'
                    e.currentTarget.style.borderColor = 'rgba(110,231,183,0.25)'
                    e.currentTarget.style.background = 'var(--accent-dim)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-3)'
                    e.currentTarget.style.borderColor = 'var(--border2)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                  }}
                >{t}</button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── FLOATING DASHBOARD MOCKUP — directly under search bar ── */}
      <div ref={mockupRef} style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '860px', perspective: '1200px', marginTop: '1.5rem', animation: 'float-subtle 4s ease-in-out infinite' }}>

        {/* Glow behind mockup */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '0%', left: '50%', transform: 'translate(-50%, -30%)',
          width: '90%', height: '240px',
          background: 'radial-gradient(ellipse, rgba(110,231,183,0.22) 0%, rgba(110,231,183,0.08) 40%, transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Frame */}
        <div className="mockup-inner" style={{
          background: 'linear-gradient(145deg, var(--bg2), var(--bg3))',
          border: '1px solid rgba(110,231,183,0.20)',
          borderRadius: '16px', overflow: 'hidden',
          transform: 'rotateX(5deg) scale(0.97)',
          transformStyle: 'preserve-3d',
          boxShadow: `
            0 50px 120px rgba(0,0,0,0.72),
            0 0 0 1px rgba(110,231,183,0.10),
            0 0 80px rgba(110,231,183,0.07),
            inset 0 1px 0 rgba(255,255,255,0.05)
          `,
          transition: 'box-shadow 0.6s ease',
          position: 'relative', zIndex: 1,
        }}>
          {/* Title bar */}
          <div style={{
            background: 'var(--bg3)', padding: '11px 16px',
            display: 'flex', alignItems: 'center', gap: '8px',
            borderBottom: '1px solid var(--border2)',
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57', flexShrink: 0 }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FEBC2E', flexShrink: 0 }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28C840', flexShrink: 0 }} />
            <div style={{
              flex: 1, background: 'var(--bg4)', borderRadius: '6px', padding: '5px 12px',
              margin: '0 12px', fontSize: '11px', color: 'var(--text-3)', fontWeight: 300,
              display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-inter)',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect width="11" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              nexus.health/dashboard
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 300, fontFamily: 'var(--font-inter)' }}>v1.0</div>
          </div>

          {/* Sidebar + Main */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: '260px' }}>

            {/* Sidebar */}
            <div style={{
              background: 'var(--bg3)', borderRight: '1px solid var(--border2)',
              padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '2px',
            }}>
              <div style={{
                fontFamily: 'var(--font-sora)', fontSize: '13px', fontWeight: 700,
                letterSpacing: '0.12em', color: 'var(--text)', textTransform: 'uppercase',
                marginBottom: '1.25rem', paddingBottom: '0.9rem', borderBottom: '1px solid var(--border2)',
              }}>NEXUS</div>

              {SIDEBAR_ITEMS.map(item => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '7px 10px', borderRadius: '8px',
                  fontSize: '12px', fontFamily: 'var(--font-inter)', fontWeight: 300,
                  color: item.active ? 'var(--accent)' : 'var(--text-3)',
                  background: item.active ? 'rgba(110,231,183,0.10)' : 'transparent',
                  cursor: 'default',
                }}>
                  <span style={{ opacity: item.active ? 1 : 0.5, color: item.active ? 'var(--accent)' : 'inherit' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
              ))}

              <div style={{ marginTop: '1rem', fontSize: '9px', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', paddingLeft: '10px', paddingBottom: '4px' }}>Table of Rates</div>
              {[{ dot: 'var(--accent)', label: 'Table UI HTML' }, { dot: '#4ADE80', label: 'Table UI Themes' }].map(x => (
                <div key={x.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: x.dot, flexShrink: 0 }} />
                  {x.label}
                </div>
              ))}
            </div>

            {/* Main */}
            <div style={{ padding: '1.5rem 1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.1rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-sora)', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px', letterSpacing: '-0.01em' }}>Dashboard</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>Overview — Visualize your main activities data.</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)', background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: '6px', padding: '4px 10px', fontFamily: 'var(--font-inter)' }}>Apr 8 – Apr 15</div>
                  <div style={{ fontSize: '10px', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px', fontFamily: 'var(--font-inter)' }}>Overview</div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.25rem' }}>
                {[
                  { n: '63,405', label: 'Searches this week', delta: '+12%' },
                  { n: 'K170/G',  label: 'Clinics matched',    delta: '+8%'  },
                  { n: 'K190/G',  label: 'Users helped',       delta: '+21%' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'var(--bg4)', border: '1px solid var(--border2)',
                    borderRadius: '10px', padding: '12px',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--accent), transparent)', opacity: 0.35 }} />
                    <div style={{ fontFamily: 'var(--font-sora)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 300, marginTop: '3px' }}>{s.label}</div>
                    <div style={{ fontSize: '9px', color: '#4ADE80', fontFamily: 'var(--font-inter)', fontWeight: 500, marginTop: '4px' }}>{s.delta}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>New Orders — Top clinics this week</div>
                <div style={{ fontSize: '10px', color: 'var(--accent)', fontFamily: 'var(--font-inter)' }}>Website Traffic ↗</div>
              </div>

              {MOCKUP_RESULTS.map((r, i) => (
                <div key={r.name} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: i === 0 ? 'rgba(110,231,183,0.05)' : 'var(--bg4)',
                  border: `1px solid ${i === 0 ? 'rgba(110,231,183,0.18)' : 'var(--border2)'}`,
                  borderRadius: '9px', padding: '9px 12px',
                  marginBottom: i < MOCKUP_RESULTS.length - 1 ? '6px' : 0,
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '7px',
                    background: 'var(--accent-dim)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 600, color: 'var(--accent)',
                    fontFamily: 'var(--font-sora)', flexShrink: 0,
                  }}>{r.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text)', fontFamily: 'var(--font-inter)' }}>{r.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>{r.dist} · {r.wait}</div>
                  </div>
                  <div style={{
                    fontSize: '9px', fontWeight: 500,
                    background: r.green ? 'rgba(74,222,128,0.10)' : 'rgba(250,204,21,0.10)',
                    color: r.green ? '#4ADE80' : '#FCD34D',
                    padding: '3px 8px', borderRadius: '5px',
                  }}>{r.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade gradient */}
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '220px',
          background: 'linear-gradient(to bottom, transparent 0%, var(--bg) 100%)',
          pointerEvents: 'none', zIndex: 2,
        }} />
      </div>

      <style>{`
        @keyframes grid-fade {
          0%, 100% { opacity: 0.06; }
          50%       { opacity: 0.11; }
        }
        @media (max-width: 768px) {
          #hero { padding: 90px 1.25rem 0 !important; }
          .mockup-inner { display: none !important; }
        }
      `}</style>
    </section>
  )
}
