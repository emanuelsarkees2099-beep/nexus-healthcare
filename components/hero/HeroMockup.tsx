'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Home2, SearchNormal1, People, Setting2, Category2, Lock1 } from 'iconsax-react'

const SIDEBAR_ITEMS = [
  { label: 'Home',         active: true,  icon: <Home2         size={13} color="var(--accent)"            variant="Linear" /> },
  { label: 'Clinic Search',active: false, icon: <SearchNormal1 size={13} color="rgba(255,255,255,0.45)"   variant="Linear" /> },
  { label: 'Care Team',    active: false, icon: <People        size={13} color="rgba(255,255,255,0.45)"   variant="Linear" /> },
  { label: 'Settings',     active: false, icon: <Setting2      size={13} color="rgba(255,255,255,0.45)"   variant="Linear" /> },
  { label: 'Programs',     active: false, icon: <Category2     size={13} color="rgba(255,255,255,0.45)"   variant="Linear" /> },
]

const RESULTS = [
  { initials: 'CA', name: 'Clinica Adelante',     dist: '1.2 mi', wait: '~20 min', status: 'Open',  green: true  },
  { initials: 'VS', name: 'Valle del Sol Health', dist: '2.8 mi', wait: '~45 min', status: 'Busy',  green: false },
  { initials: 'MP', name: 'Mountain Park Health', dist: '4.1 mi', wait: '~15 min', status: 'Open',  green: true  },
]

interface HeroMockupProps {
  mockupRef: React.RefObject<HTMLDivElement | null>
}

export default function HeroMockup({ mockupRef }: HeroMockupProps) {
  /* 3D tilt on mouse move */
  useEffect(() => {
    const wrapper = mockupRef.current
    if (!wrapper) return
    const inner = wrapper.querySelector<HTMLElement>('.mockup-inner')
    if (!inner) return

    const onMove = (e: MouseEvent) => {
      const r = wrapper.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2)
      const y = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2)
      gsap.to(inner, {
        rotateX: -y * 4, rotateY: x * 5,
        duration: 0.7, ease: 'power2.out',
        transformStyle: 'preserve-3d', overwrite: 'auto',
      })
    }
    const onLeave = () =>
      gsap.to(inner, { rotateX: 5, rotateY: 0, duration: 1.2, ease: 'elastic.out(1,0.4)', overwrite: 'auto' })

    wrapper.addEventListener('mousemove', onMove)
    wrapper.addEventListener('mouseleave', onLeave)
    return () => {
      wrapper.removeEventListener('mousemove', onMove)
      wrapper.removeEventListener('mouseleave', onLeave)
    }
  }, [mockupRef])

  return (
    <div
      ref={mockupRef}
      className="hero-mockup-wrap"
      style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: '860px',
        margin: '1.5rem auto 0',
        perspective: '1200px',
        animation: 'float-subtle 4s ease-in-out infinite',
      }}
    >
      {/* Ambient glow behind frame */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '0%', left: '50%', transform: 'translate(-50%, -30%)',
        width: '90%', height: '240px',
        background: 'radial-gradient(ellipse, rgba(74,144,217,0.22) 0%, rgba(74,144,217,0.08) 40%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Frame */}
      <div className="mockup-inner" style={{
        background: 'linear-gradient(145deg, var(--bg2), var(--bg3))',
        border: '1px solid rgba(74,144,217,0.20)',
        borderRadius: '16px', overflow: 'hidden',
        transform: 'rotateX(5deg) scale(0.97)',
        transformStyle: 'preserve-3d',
        boxShadow: `
          0 50px 120px rgba(0,0,0,0.72),
          0 0 0 1px rgba(74,144,217,0.10),
          0 0 80px rgba(74,144,217,0.07),
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
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57', flexShrink: 0 }} aria-hidden="true" />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FEBC2E', flexShrink: 0 }} aria-hidden="true" />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28C840', flexShrink: 0 }} aria-hidden="true" />
          <div style={{
            flex: 1, background: 'var(--bg4)', borderRadius: '6px', padding: '5px 12px',
            margin: '0 12px', fontSize: '11px', color: 'var(--text-3)', fontWeight: 400,
            display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-inter)',
          }}>
            <Lock1 size={14} color="rgba(255,255,255,0.45)" variant="Linear" aria-hidden="true" />
            nexus.health/dashboard
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 400, fontFamily: 'var(--font-inter)' }}>v1.0</div>
        </div>

        {/* Sidebar + Main */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: '260px' }}>
          {/* Sidebar */}
          <div style={{
            background: 'var(--bg3)', borderRight: '1px solid var(--border2)',
            padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '2px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.12em', color: 'var(--text)', textTransform: 'uppercase',
              marginBottom: '1.25rem', paddingBottom: '0.9rem', borderBottom: '1px solid var(--border2)',
            }}>NEXUS</div>

            {SIDEBAR_ITEMS.map(item => (
              <div key={item.label} aria-hidden="true" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 10px', borderRadius: '8px',
                fontSize: '12px', fontFamily: 'var(--font-inter)', fontWeight: 400,
                color: item.active ? 'var(--accent)' : 'var(--text-3)',
                background: item.active ? 'rgba(74,144,217,0.10)' : 'transparent',
                cursor: 'default',
              }}>
                <span style={{ opacity: item.active ? 1 : 0.5, color: item.active ? 'var(--accent)' : 'inherit' }}>
                  {item.icon}
                </span>
                {item.label}
              </div>
            ))}

            <div style={{
              marginTop: '1rem', fontSize: '9px', letterSpacing: '0.10em',
              textTransform: 'uppercase', color: 'var(--text-3)',
              fontFamily: 'var(--font-inter)', paddingLeft: '10px', paddingBottom: '4px',
            }}>My Resources</div>
            {[{ dot: 'var(--accent)', label: 'Saved Clinics' }, { dot: '#60A5FA', label: 'My Care Plan' }].map(x => (
              <div key={x.label} aria-hidden="true" style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 10px', fontSize: '11px', color: 'var(--text-3)',
                fontFamily: 'var(--font-inter)',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: x.dot, flexShrink: 0 }} />
                {x.label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div style={{ padding: '1.5rem 1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.1rem' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px', letterSpacing: '-0.01em' }}>Dashboard</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 400 }}>Free care near you · Phoenix, AZ</div>
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
                { n: '8,432',  label: 'Clinics matched',    delta: '+8%'  },
                { n: '1,247',  label: 'Users helped',       delta: '+21%' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--bg4)', border: '1px solid var(--border2)',
                  borderRadius: '10px', padding: '12px', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--accent), transparent)', opacity: 0.35 }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 400, marginTop: '3px' }}>{s.label}</div>
                  <div style={{ fontSize: '9px', color: '#60A5FA', fontFamily: 'var(--font-inter)', fontWeight: 500, marginTop: '4px' }}>{s.delta}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 400 }}>Clinics Near You</div>
              <div style={{ fontSize: '10px', color: 'var(--accent)', fontFamily: 'var(--font-inter)' }}>See all {'→'}</div>
            </div>

            {RESULTS.map((r, i) => (
              <div key={r.name} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: i === 0 ? 'rgba(74,144,217,0.05)' : 'var(--bg4)',
                border: `1px solid ${i === 0 ? 'rgba(74,144,217,0.18)' : 'var(--border2)'}`,
                borderRadius: '9px', padding: '9px 12px',
                marginBottom: i < RESULTS.length - 1 ? '6px' : 0,
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '7px',
                  background: 'var(--accent-dim)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 600, color: 'var(--accent)',
                  fontFamily: 'var(--font-display)', flexShrink: 0,
                }}>{r.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text)', fontFamily: 'var(--font-inter)' }}>{r.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 400 }}>{r.dist} · {r.wait}</div>
                </div>
                <div style={{
                  fontSize: '9px', fontWeight: 500,
                  background: r.green ? 'rgba(96,165,250,0.10)' : 'rgba(250,204,21,0.10)',
                  color: r.green ? '#60A5FA' : '#FCD34D',
                  padding: '3px 8px', borderRadius: '5px',
                }}>{r.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '220px',
        background: 'linear-gradient(to bottom, transparent 0%, var(--bg) 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* Mobile cards (shown on â‰¤768px via CSS) */}
      <div className="hero-mobile-cards" aria-hidden="true">
        <div style={{
          fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)',
          fontWeight: 400, letterSpacing: '0.05em', textTransform: 'uppercase',
          marginBottom: '12px', paddingLeft: '2px',
        }}>Clinics Near You</div>

        {RESULTS.map((r, i) => (
          <div key={r.name} className="hero-mobile-card" style={{ animationDelay: `${0.3 + i * 0.12}s` }}>
            <div className="hero-mobile-card-avatar">{r.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="hero-mobile-card-name">{r.name}</div>
              <div className="hero-mobile-card-meta">{r.dist} · {r.wait}</div>
            </div>
            <div className="hero-mobile-card-badge" style={{
              background: r.green ? 'rgba(96,165,250,0.12)' : 'rgba(250,204,21,0.12)',
              color: r.green ? '#60A5FA' : '#FCD34D',
            }}>
              <span style={{
                display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%',
                background: r.green ? '#60A5FA' : '#FCD34D',
                marginRight: '5px', verticalAlign: 'middle', marginTop: '-1px',
              }} />
              {r.status}
            </div>
          </div>
        ))}

        <div style={{
          textAlign: 'center', marginTop: '14px',
          fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-inter)',
          opacity: 0.8, animationDelay: '0.7s',
        }}>
          + 47 more clinics found {'→'}
        </div>
      </div>
    </div>
  )
}

