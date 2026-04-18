'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const CLINICS = [
  {
    init: 'CA', name: 'Clinica Adelante — Peoria', dist: '1.2 mi',
    wait: '~20 min wait', langs: 'Español · English',
    status: 'Open now', statusBg: 'rgba(74,222,128,0.10)', statusColor: '#4ade80', top: true,
  },
  {
    init: 'VS', name: 'Valle del Sol Health', dist: '2.8 mi',
    wait: '~45 min wait', langs: 'English',
    status: 'Busy', statusBg: 'rgba(251,191,36,0.10)', statusColor: '#fbbf24', top: false,
  },
  {
    init: 'MP', name: 'Mountain Park Health Center', dist: '4.1 mi',
    wait: '~15 min wait', langs: 'English · Somali',
    status: 'Open now', statusBg: 'rgba(74,222,128,0.10)', statusColor: '#4ade80', top: false,
  },
]

export default function Mockup() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const frameRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 769px)', () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=900',
            scrub: 2,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        })

        gsap.set(frameRef.current, { scale: 0.35, rotateX: 22, rotateY: -14, opacity: 0, y: 60 })
        gsap.set('.mockup-card', { x: 55, opacity: 0 })
        gsap.set('.mockup-actions', { y: 20, opacity: 0 })
        gsap.set('.mockup-glow', { opacity: 0, scale: 0.5 })

        tl.to(frameRef.current, { scale: 1, rotateX: 0, rotateY: 0, opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' })
          .to('.mockup-glow',    { opacity: 1, scale: 1, duration: 0.4 }, '-=0.25')
          .to('.mockup-card',    { x: 0, opacity: 1, stagger: 0.12, duration: 0.3, ease: 'power2.out' }, '-=0.15')
          .to('.mockup-actions', { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }, '-=0.05')
      }, sectionRef)

      return () => ctx.revert()
    })

    mm.add('(max-width: 768px)', () => {
      const ctx = gsap.context(() => {
        gsap.from(frameRef.current, {
          y: 60, opacity: 0, scale: 0.92,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        })
        gsap.from('.mockup-card', {
          y: 30, opacity: 0, stagger: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        })
      }, sectionRef)
      return () => ctx.revert()
    })

    return () => mm.revert()
  }, [])

  // 3D tilt on mouse move
  useEffect(() => {
    const frame   = frameRef.current
    const section = sectionRef.current
    if (!frame || !section) return

    const onMove = (e: MouseEvent) => {
      const r  = frame.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top  + r.height / 2
      const dx = (e.clientX - cx) / (window.innerWidth  / 2)
      const dy = (e.clientY - cy) / (window.innerHeight / 2)
      gsap.to(frame, {
        rotateX: -dy * 4, rotateY: dx * 5,
        duration: 0.8, ease: 'power2.out', transformStyle: 'preserve-3d',
      })
    }
    const onLeave = () => {
      gsap.to(frame, { rotateX: 4, rotateY: -2, duration: 1.2, ease: 'elastic.out(1,0.4)' })
    }

    section.addEventListener('mousemove', onMove)
    section.addEventListener('mouseleave', onLeave)
    return () => {
      section.removeEventListener('mousemove', onMove)
      section.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={sectionRef}
      aria-label="Product demo"
      style={{ position: 'relative', zIndex: 2, padding: '60px 0 120px', overflow: 'hidden' }}
    >
      {/* Section label */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', fontSize: '11px', fontWeight: 400,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: '1.25rem', fontFamily: 'var(--font-inter)',
        }}>
          <span style={{ display: 'inline-block', width: '16px', height: '1px', background: 'var(--accent)' }} aria-hidden="true" />
          The experience
        </div>
        <h2 style={{
          fontFamily: 'var(--font-sora)', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
          fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em', textAlign: 'center',
        }}>
          Care found in{' '}
          <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>under 60 seconds</em>
        </h2>
      </div>

      {/* 3D mockup wrapper */}
      <div style={{
        position: 'relative', maxWidth: '960px', margin: '0 auto',
        perspective: '1200px', padding: '0 3rem',
      }}>
        {/* Ambient glow beneath the frame */}
        <div
          className="mockup-glow"
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-40px', left: '50%',
            transform: 'translateX(-50%)',
            width: '70%', height: '200px',
            background: 'radial-gradient(ellipse, rgba(109,145,151,0.12) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
            filter: 'blur(20px)',
          }}
        />

        {/* Browser frame */}
        <div
          ref={frameRef}
          style={{
            background: 'var(--bg2)',
            border: '1px solid rgba(109,145,151,0.22)',
            borderRadius: '20px',
            overflow: 'hidden',
            transform: 'rotateX(4deg) rotateY(-2deg) scale(0.96)',
            transformStyle: 'preserve-3d',
            boxShadow:
              '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(109,145,151,0.10), inset 0 1px 0 rgba(255,255,255,0.05)',
            position: 'relative', zIndex: 1,
          }}
        >
          {/* Depth overlay */}
          <div className="card-depth-overlay" aria-hidden="true" />

          {/* Browser chrome bar */}
          <div style={{
            background: 'var(--bg3)', padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: '10px',
            borderBottom: '1px solid var(--border2)',
          }}>
            {['#FF5F57', '#FEBC2E', '#34C759'].map(c => (
              <div key={c} aria-hidden="true" style={{ width: '11px', height: '11px', borderRadius: '50%', background: c }} />
            ))}
            <div style={{
              flex: 1, background: 'var(--bg4)',
              borderRadius: '7px', padding: '6px 14px',
              margin: '0 1rem', fontSize: '12px',
              color: 'var(--text-3)', fontFamily: 'var(--font-inter)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }} aria-label="nexus.health/find">
              <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.7 }}>
                <rect width="11" height="11" x="3" y="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              nexus.health/find
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)' }} aria-hidden="true">v1.0</div>
          </div>

          {/* App body */}
          <div style={{ padding: '2rem' }}>

            {/* Search bar */}
            <div role="search" style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--bg3)', border: '1px solid rgba(109,145,151,0.22)',
              borderRadius: '12px', padding: '12px 16px', marginBottom: '1.5rem',
            }}>
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ opacity: 0.7, flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span
                aria-label="Search query: Primary care in Phoenix, AZ"
                style={{ flex: 1, fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--font-inter)', fontWeight: 400 }}
              >
                Primary care · Phoenix, AZ
              </span>
              <div style={{
                background: 'var(--accent)', color: '#07070F',
                fontSize: '11px', fontWeight: 600,
                padding: '5px 12px', borderRadius: '7px',
                whiteSpace: 'nowrap', fontFamily: 'var(--font-inter)',
                letterSpacing: '0.01em',
              }} aria-label="3 results found">
                3 results
              </div>
            </div>

            <div style={{
              fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)',
              marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center',
            }}>
              <span>Sorted by: distance</span>
              <span aria-hidden="true" style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block', flexShrink: 0 }} />
              <span>Walk-in available</span>
              <span aria-hidden="true" style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block', flexShrink: 0 }} />
              <span>Open now</span>
            </div>

            {/* Clinic result cards */}
            {CLINICS.map(c => (
              <div
                key={c.name}
                className="mockup-card"
                tabIndex={0}
                style={{
                  background: c.top ? 'rgba(109,145,151,0.05)' : 'var(--bg3)',
                  border: `1px solid ${c.top ? 'rgba(109,145,151,0.25)' : 'var(--border2)'}`,
                  borderRadius: '14px', padding: '1.1rem 1.25rem',
                  marginBottom: '10px',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(109,145,151,0.35)'
                  e.currentTarget.style.transform = 'translateX(3px)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = c.top ? 'rgba(109,145,151,0.25)' : 'var(--border2)'
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                {c.top && (
                  <div aria-hidden="true" style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(109,145,151,0.4), transparent)',
                  }} />
                )}
                <div aria-hidden="true" style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--accent-dim)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
                  fontFamily: 'var(--font-sora)', flexShrink: 0,
                }}>
                  {c.init}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 500, color: 'var(--text)',
                    marginBottom: '3px', fontFamily: 'var(--font-inter)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {c.name}
                  </div>
                  <div style={{
                    fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)',
                    display: 'flex', gap: '10px', flexWrap: 'wrap',
                  }}>
                    <span>{c.dist}</span>
                    <span>{c.wait}</span>
                    <span>{c.langs}</span>
                  </div>
                </div>
                <div style={{
                  fontSize: '10px', fontWeight: 500,
                  background: c.statusBg,
                  color: c.statusColor,
                  borderRadius: '5px', padding: '3px 9px',
                  whiteSpace: 'nowrap', fontFamily: 'var(--font-inter)',
                  flexShrink: 0,
                }}>
                  {c.status}
                </div>
              </div>
            ))}

            {/* Action buttons */}
            <div className="mockup-actions" style={{
              marginTop: '1.25rem', paddingTop: '1.25rem',
              borderTop: '1px solid var(--border2)',
              display: 'flex', gap: '10px',
            }}>
              <button style={{
                flex: 1, background: 'var(--bg3)',
                border: '1px solid var(--border2)', borderRadius: '10px',
                padding: '12px', textAlign: 'center', fontSize: '13px',
                color: 'var(--text-2)', cursor: 'pointer',
                fontFamily: 'var(--font-inter)',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(109,145,151,0.25)'
                e.currentTarget.style.color = 'var(--text)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border2)'
                e.currentTarget.style.color = 'var(--text-2)'
              }}>
                View on map
              </button>
              <button style={{
                flex: 2, background: 'var(--accent)',
                borderRadius: '10px', padding: '12px', border: 'none',
                textAlign: 'center', fontSize: '13px',
                color: '#07070F', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-inter)',
                boxShadow: '0 4px 16px rgba(109,145,151,0.28)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(109,145,151,0.45)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(109,145,151,0.28)'
                e.currentTarget.style.transform = ''
              }}>
                Book at Clinica Adelante →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
