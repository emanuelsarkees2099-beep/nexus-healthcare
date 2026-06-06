'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

/* ─────────────────────────────────────────────
   SCENE DEFINITIONS
   Each scene maps a [start, end] scroll progress
   range (0–1) to caption text + overlay data.
───────────────────────────────────────────── */
interface Scene {
  start: number
  end: number
  caption: string
  overlayType?: 'counter' | 'rejection-tags' | 'comparison' | 'savings' | 'cta'
  heartbeatBPM: number
}

const SCENES: Scene[] = [
  {
    start: 0,
    end: 0.2,
    caption: 'Two years ago, I had chest pain. I didn\'t have insurance. I was terrified.',
    overlayType: 'counter',
    heartbeatBPM: 72,
  },
  {
    start: 0.2,
    end: 0.5,
    caption: 'I called 47 different places. Some said $1,800 for a visit. Some just hung up.',
    overlayType: 'rejection-tags',
    heartbeatBPM: 88,
  },
  {
    start: 0.5,
    end: 0.75,
    caption: 'Someone told me about NEXUS. I searched in 12 seconds. Found a free clinic 2 miles away.',
    overlayType: 'comparison',
    heartbeatBPM: 62,
  },
  {
    start: 0.75,
    end: 0.95,
    caption: 'I saw a doctor. No insurance needed. Cost me nothing. My chest pain was just anxiety.',
    overlayType: 'savings',
    heartbeatBPM: 58,
  },
  {
    start: 0.95,
    end: 1,
    caption: '',
    overlayType: 'cta',
    heartbeatBPM: 58,
  },
]

const REJECTION_TAGS = [
  { text: '"$1,800 minimum"',         color: 'rgba(248,113,113,0.9)' },
  { text: '"No uninsured patients"',   color: 'rgba(251,146,60,0.9)'  },
  { text: '"6-month waitlist"',        color: 'rgba(248,113,113,0.9)' },
  { text: '"Medicaid only"',           color: 'rgba(251,146,60,0.9)'  },
  { text: '"Try the ER"',              color: 'rgba(248,113,113,0.9)' },
  { text: '"Try the ER"',              color: 'rgba(248,113,113,0.9)' },
  { text: '"Try the ER"',              color: 'rgba(248,113,113,0.9)' },
  { text: '"We can\'t help you"',      color: 'rgba(251,146,60,0.9)'  },
  { text: '"Call back tomorrow"',      color: 'rgba(248,113,113,0.9)' },
  { text: '"No sliding scale here"',   color: 'rgba(251,146,60,0.9)'  },
  { text: '"Insurance required"',      color: 'rgba(248,113,113,0.9)' },
  { text: '"Try the ER"',              color: 'rgba(248,113,113,0.9)' },
]

/* Static frames for mobile fallback */
const MOBILE_FRAMES = [
  {
    bg: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.2)',
    icon: '😰',
    title: '"I had chest pain."',
    body: 'No insurance. No idea where to go. 47 million Americans face this every year.',
  },
  {
    bg: 'rgba(251,146,60,0.06)',
    border: 'rgba(251,146,60,0.2)',
    icon: '📞',
    title: '47 calls. 0 answers.',
    body: '"$1,800 minimum." "Medicaid only." "Try the ER." — over and over.',
  },
  {
    bg: 'rgba(74,144,217,0.06)',
    border: 'rgba(74,144,217,0.2)',
    icon: '🔍',
    title: '12 seconds with NEXUS.',
    body: 'One search. Free clinic 2 miles away. Walk-ins welcome.',
  },
  {
    bg: 'rgba(96,165,250,0.06)',
    border: 'rgba(96,165,250,0.2)',
    icon: '💚',
    title: 'Cost: $0.',
    body: 'She saw a real doctor. Her chest pain was anxiety. NEXUS saved her $4,200 this year.',
  },
]

/* Detect current scene from progress */
function getScene(progress: number): Scene {
  return SCENES.find(s => progress >= s.start && progress < s.end) ?? SCENES[SCENES.length - 1]
}

/* ─── OVERLAY COMPONENTS ─── */

function CounterOverlay() {
  const [count, setCount] = useState(46_999_000)
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3))
    }, 1200)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{
      position: 'absolute', top: '18%', right: '8%',
      background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(74,144,217,0.25)',
      borderRadius: '12px', padding: '16px 22px',
      backdropFilter: 'blur(12px)',
      animation: 'cinematic-fadein 0.6s ease both',
    }}>
      <div style={{ fontSize: '10px', color: 'rgba(74,144,217,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-inter)' }}>
        Uninsured Americans
      </div>
      <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
        {count.toLocaleString()}
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', fontFamily: 'var(--font-inter)' }}>
        +1 every ~40 seconds
      </div>
    </div>
  )
}

function RejectionTagsOverlay({ progress, sceneProgress }: { progress: number; sceneProgress: number }) {
  // Tags appear progressively as user scrolls through this scene
  const visibleCount = Math.min(REJECTION_TAGS.length, Math.ceil(sceneProgress * REJECTION_TAGS.length + 1))
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 40px 120px',
      pointerEvents: 'none',
    }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '10px',
        justifyContent: 'center', maxWidth: '600px',
      }}>
        {REJECTION_TAGS.slice(0, visibleCount).map((tag, i) => (
          <div
            key={i}
            style={{
              padding: '8px 16px', borderRadius: '100px',
              background: 'rgba(0,0,0,0.7)',
              border: `1px solid ${tag.color}`,
              color: tag.color,
              fontSize: '13px', fontWeight: 600,
              fontFamily: 'var(--font-inter)',
              animation: 'cinematic-fadein 0.4s ease both',
              animationDelay: `${i * 0.05}s`,
              backdropFilter: 'blur(8px)',
            }}
          >
            {tag.text}
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonOverlay() {
  return (
    <div style={{
      position: 'absolute', bottom: '18%', left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', gap: '16px', alignItems: 'center',
      animation: 'cinematic-fadein 0.6s ease both',
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(248,113,113,0.3)',
        borderRadius: '12px', padding: '16px 24px', textAlign: 'center',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ fontSize: '32px', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-display)' }}>47</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontFamily: 'var(--font-inter)' }}>calls. average</div>
      </div>
      <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.3)' }}>vs</div>
      <div style={{
        background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(74,144,217,0.3)',
        borderRadius: '12px', padding: '16px 24px', textAlign: 'center',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ fontSize: '32px', fontWeight: 800, color: '#4a90d9', fontFamily: 'var(--font-display)' }}>12s</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontFamily: 'var(--font-inter)' }}>with NEXUS</div>
      </div>
    </div>
  )
}

function SavingsOverlay() {
  return (
    <div style={{
      position: 'absolute', top: '20%', left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center',
      animation: 'cinematic-fadein 0.6s ease both',
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(74,144,217,0.25)',
        borderRadius: '16px', padding: '24px 36px',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ fontSize: '11px', color: 'rgba(74,144,217,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'var(--font-inter)' }}>
          Maria saved this year
        </div>
        <div style={{ fontSize: '48px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          $4,200
        </div>
        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { label: 'Skipped unnecessary ER', amount: '$1,847' },
            { label: 'Preventive care covered', amount: '$2,353' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', gap: '24px',
              fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)',
            }}>
              <span>{item.label}</span>
              <span style={{ color: 'rgba(74,144,217,0.8)', fontWeight: 600 }}>{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CTAOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.82)',
      animation: 'cinematic-fadein 0.8s ease both',
    }}>
      <div style={{
        textAlign: 'center', maxWidth: '520px', padding: '0 24px',
      }}>
        <div style={{
          fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800,
          letterSpacing: '-0.04em', lineHeight: 1.05,
          color: '#fff', marginBottom: '12px',
          fontFamily: 'var(--font-inter)',
        }}>
          Maria saved{' '}
          <span style={{ color: '#4a90d9' }}>$4,200</span>
          {' '}this year.
        </div>
        <div style={{
          fontSize: '15px', color: 'rgba(255,255,255,0.45)',
          marginBottom: '40px', fontFamily: 'var(--font-inter)', fontWeight: 300,
        }}>
          Here&apos;s how she did it →
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/search"
            style={{
              padding: '14px 28px', borderRadius: '100px',
              background: 'linear-gradient(135deg, #4a90d9, #60a5fa)',
              color: '#0a1a12', fontSize: '14px', fontWeight: 700,
              textDecoration: 'none', fontFamily: 'var(--font-inter)',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 0 32px rgba(74,144,217,0.35)',
            }}
          >
            Find your clinic
          </Link>
          <Link
            href="/gps"
            style={{
              padding: '14px 28px', borderRadius: '100px',
              background: 'transparent',
              border: '1px solid rgba(74,144,217,0.35)',
              color: '#4a90d9', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none', fontFamily: 'var(--font-inter)',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}
          >
            Your care plan
          </Link>
        </div>
        <div style={{
          marginTop: '28px', fontSize: '11px', color: 'rgba(255,255,255,0.2)',
          fontFamily: 'var(--font-inter)', letterSpacing: '0.04em',
        }}>
          Free. Always. For everyone.
        </div>
      </div>
    </div>
  )
}

/* ─── HEARTBEAT VISUALIZER ─── */
function Heartbeat({ bpm, visible }: { bpm: number; visible: boolean }) {
  if (!visible) return null
  const interval = (60 / bpm) * 1000
  return (
    <div style={{
      position: 'absolute', top: '12px', right: '12px',
      display: 'flex', alignItems: 'center', gap: '8px',
      background: 'rgba(0,0,0,0.5)', borderRadius: '8px',
      padding: '6px 12px', backdropFilter: 'blur(8px)',
      zIndex: 10,
    }}>
      <svg
        width="32" height="16" viewBox="0 0 32 16"
        style={{
          animation: `heartbeat-pulse ${interval}ms ease infinite`,
        }}
      >
        <polyline
          points="0,8 6,8 8,2 10,14 12,8 14,8 16,3 18,13 20,8 26,8 28,5 30,11 32,8"
          fill="none"
          stroke={bpm > 80 ? '#f87171' : '#4a90d9'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{
        fontSize: '11px', color: bpm > 80 ? '#f87171' : '#4a90d9',
        fontFamily: 'var(--font-display)', letterSpacing: '0.05em',
      }}>
        {bpm} <span style={{ fontSize: '9px', opacity: 0.6 }}>BPM</span>
      </span>
    </div>
  )
}

/* ─── CAPTION BAR ─── */
function CaptionBar({ text }: { text: string }) {
  if (!text) return null
  return (
    <div style={{
      position: 'absolute', bottom: '80px', left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '680px', width: '90%', textAlign: 'center',
      background: 'rgba(0,0,0,0.72)',
      backdropFilter: 'blur(10px)',
      borderRadius: '8px', padding: '10px 20px',
      zIndex: 10,
    }}>
      <p style={{
        fontSize: 'clamp(13px, 1.6vw, 17px)',
        color: '#fff', fontFamily: 'var(--font-inter)',
        fontWeight: 400, lineHeight: 1.6,
        margin: 0,
        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
      }}>
        &ldquo;{text}&rdquo;
      </p>
    </div>
  )
}

/* ─── SCROLL PROGRESS INDICATOR ─── */
function ScrollCue({ progress, done }: { progress: number; done: boolean }) {
  if (done) return null
  return (
    <div style={{
      position: 'absolute', bottom: '24px', left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
      animation: `${progress < 0.03 ? 'cinematic-fadein 1s 1.5s ease both' : 'none'}`,
      opacity: progress < 0.03 ? undefined : Math.max(0, 1 - progress * 8),
      zIndex: 10,
    }}>
      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)' }}>
        Scroll to continue
      </span>
      <div style={{
        width: '20px', height: '32px',
        border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '10px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '4px',
      }}>
        <div style={{
          width: '4px', height: '8px', borderRadius: '2px',
          background: 'rgba(255,255,255,0.5)',
          animation: 'scroll-dot 1.4s ease-in-out infinite',
        }} />
      </div>
    </div>
  )
}

/* ─── MOBILE FALLBACK ─── */
function MobileFallback() {
  return (
    <section style={{
      padding: '80px 20px',
      background: '#070d0a',
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)',
          marginBottom: '20px', fontSize: '10px', fontWeight: 600,
          color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase',
          fontFamily: 'var(--font-inter)',
        }}>
          A real story
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 7vw, 42px)', fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.1,
          color: '#fff', marginBottom: '12px',
          fontFamily: 'var(--font-inter)',
        }}>
          Healthcare is a right,<br />not a privilege.
        </h1>
        <p style={{
          fontSize: '14px', color: 'rgba(255,255,255,0.4)',
          fontFamily: 'var(--font-inter)', lineHeight: 1.7,
          maxWidth: '320px', margin: '0 auto',
        }}>
          47 million Americans are uninsured. Here&apos;s what one of them went through — and how NEXUS changed it.
        </p>
      </div>

      {/* Story frames */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
        {MOBILE_FRAMES.map((frame, i) => (
          <div
            key={i}
            style={{
              padding: '20px 22px', borderRadius: '16px',
              background: frame.bg, border: `1px solid ${frame.border}`,
              animation: `cinematic-fadein 0.5s ${i * 0.12}s ease both`,
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{frame.icon}</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px', fontFamily: 'var(--font-inter)' }}>
              {frame.title}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, fontFamily: 'var(--font-inter)' }}>
              {frame.body}
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '10px',
        maxWidth: '320px', margin: '40px auto 0', width: '100%',
      }}>
        <Link href="/search" style={{
          padding: '14px 24px', borderRadius: '100px', textAlign: 'center',
          background: 'linear-gradient(135deg, #4a90d9, #60a5fa)',
          color: '#0a1a12', fontSize: '14px', fontWeight: 700,
          textDecoration: 'none', fontFamily: 'var(--font-inter)',
          boxShadow: '0 0 24px rgba(74,144,217,0.25)',
        }}>
          Find your clinic
        </Link>
        <Link href="/gps" style={{
          padding: '14px 24px', borderRadius: '100px', textAlign: 'center',
          background: 'transparent', border: '1px solid rgba(74,144,217,0.3)',
          color: '#4a90d9', fontSize: '14px', fontWeight: 600,
          textDecoration: 'none', fontFamily: 'var(--font-inter)',
        }}>
          Your care plan
        </Link>
        <div style={{
          textAlign: 'center', fontSize: '11px',
          color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-inter)',
          marginTop: '8px', letterSpacing: '0.04em',
        }}>
          Free. Always. For everyone.
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function CinematicHero() {
  const heroRef        = useRef<HTMLDivElement>(null)
  const stickyRef      = useRef<HTMLDivElement>(null)
  const videoRef       = useRef<HTMLVideoElement>(null)
  const [progress, setProgress]     = useState(0)
  const [isMobile, setIsMobile]     = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [videoLoaded, setVideoLoaded]    = useState(false)
  const [videoError, setVideoError]      = useState(false)
  const rafRef = useRef<number | null>(null)

  const currentScene   = getScene(progress)
  const isDone         = progress >= 0.95
  const sceneProgress  = currentScene.start === currentScene.end
    ? 1
    : (progress - currentScene.start) / (currentScene.end - currentScene.start)

  /* Detect mobile & reduced motion */
  useEffect(() => {
    const mq   = window.matchMedia('(max-width: 768px)')
    const rmMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsMobile(mq.matches)
    setReducedMotion(rmMq.matches)
    const onResize = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onResize)
    return () => mq.removeEventListener('change', onResize)
  }, [])

  /* Scroll handler — scrubs video */
  const handleScroll = useCallback(() => {
    if (!heroRef.current) return
    const rect   = heroRef.current.getBoundingClientRect()
    const heroH  = heroRef.current.offsetHeight - window.innerHeight
    const raw    = Math.max(0, Math.min(1, -rect.top / heroH))
    setProgress(raw)

    if (videoRef.current && videoLoaded && !videoError) {
      const dur = videoRef.current.duration
      if (dur && isFinite(dur)) {
        videoRef.current.currentTime = raw * dur
      }
    }
  }, [videoLoaded, videoError])

  useEffect(() => {
    if (isMobile || reducedMotion) return
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobile, reducedMotion, handleScroll])

  /* Poster gradient — animates as progress changes */
  const posterProgress = Math.min(progress / 0.75, 1)
  const posterHue      = Math.round(posterProgress * 30) // 0=red-tinted, 30=green-tinted

  /* If mobile or reduced-motion, render static fallback */
  if (isMobile || reducedMotion) {
    return (
      <>
        <style>{`
          @keyframes cinematic-fadein {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <MobileFallback />
      </>
    )
  }

  return (
    <>
      {/* ─── Keyframes ─── */}
      <style>{`
        @keyframes cinematic-fadein {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heartbeat-pulse {
          0%   { opacity: 1; }
          50%  { opacity: 0.55; }
          100% { opacity: 1; }
        }
        @keyframes scroll-dot {
          0%   { transform: translateY(0); opacity: 1; }
          60%  { transform: translateY(12px); opacity: 0.2; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes rejection-in {
          from { opacity: 0; transform: scale(0.85) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/*
        Outer div is TALL (500vh) — this is the scroll track.
        The inner sticky div stays fixed to the viewport.
      */}
      <div
        ref={heroRef}
        style={{ height: '500vh', position: 'relative' }}
        aria-label="Patient story: Maria's journey to free healthcare"
      >
        {/* ── Sticky viewport ── */}
        <div
          ref={stickyRef}
          style={{
            position: 'sticky', top: 0,
            height: '100vh', overflow: 'hidden',
            background: '#070d0a',
          }}
        >
          {/* ── Video / Poster background ── */}
          {!videoError ? (
            <video
              ref={videoRef}
              src="/videos/maria-hero.mp4"
              poster="/images/cinematic-poster.jpg"
              muted
              playsInline
              preload="auto"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                /* Fade out at the very end (CTA scene) */
                opacity: isDone ? Math.max(0, 1 - (progress - 0.95) / 0.05) : 1,
                transition: 'opacity 0.2s linear',
              }}
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoError(true)}
            />
          ) : (
            /* ── No-video placeholder (gradient art) ── */
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse at 50% 60%,
                hsl(${posterHue + 340}, 30%, 12%) 0%,
                hsl(${posterHue + 340}, 20%, 6%) 60%,
                #070d0a 100%)`,
              transition: 'background 0.4s ease',
            }} />
          )}

          {/* ── Dark vignette overlay ── */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.7) 100%)',
            pointerEvents: 'none',
          }} />

          {/* ── Scene-specific darkening for CTA ── */}
          {isDone && (
            <div style={{
              position: 'absolute', inset: 0,
              background: `rgba(0,0,0,${Math.min(0.82, (progress - 0.95) / 0.05 * 0.82)})`,
              pointerEvents: 'none',
            }} />
          )}

          {/* ── Film grain texture ── */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
              backgroundSize: '256px 256px',
              opacity: 0.35,
              mixBlendMode: 'overlay',
              pointerEvents: 'none',
            }}
          />

          {/* ── Heartbeat indicator ── */}
          <Heartbeat
            bpm={currentScene.heartbeatBPM}
            visible={!isDone}
          />

          {/* ── Scene overlays ── */}
          {currentScene.overlayType === 'counter' && <CounterOverlay />}
          {currentScene.overlayType === 'rejection-tags' && (
            <RejectionTagsOverlay progress={progress} sceneProgress={sceneProgress} />
          )}
          {currentScene.overlayType === 'comparison' && <ComparisonOverlay />}
          {currentScene.overlayType === 'savings' && <SavingsOverlay />}
          {currentScene.overlayType === 'cta' && <CTAOverlay />}

          {/* ── Caption bar ── */}
          <CaptionBar text={currentScene.caption} />

          {/* ── Scroll cue ── */}
          <ScrollCue progress={progress} done={isDone} />

          {/* ── Scene progress dots ── */}
          {!isDone && (
            <div style={{
              position: 'absolute', bottom: '22px', right: '24px',
              display: 'flex', gap: '6px', alignItems: 'center',
              zIndex: 10,
            }}>
              {SCENES.slice(0, -1).map((scene, i) => {
                const isActive  = progress >= scene.start && progress < scene.end
                const isVisited = progress >= scene.end
                return (
                  <div key={i} style={{
                    width: isActive ? '18px' : '6px',
                    height: '6px', borderRadius: '3px',
                    background: isActive
                      ? '#4a90d9'
                      : isVisited
                      ? 'rgba(74,144,217,0.4)'
                      : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s ease',
                  }} />
                )
              })}
            </div>
          )}

          {/* ── Bottom gradient fade (bleeds into Stats section) ── */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: '120px',
              background: 'linear-gradient(to bottom, transparent, #070d0a)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* ── After hero fades, show nothing (Stats picks up) ── */}
      </div>
    </>
  )
}
