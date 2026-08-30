'use client'
import { useEffect, useRef, useState } from 'react'
import { Home2, SearchNormal1, ReceiptText, ShieldTick, Setting2, Lock1 } from 'iconsax-react'

/* Interactive 3D product mockup — a browser window showing the AXVO
   dashboard that tilts toward the cursor. Content uses the platform's real
   facts (18,900+ clinics, 40+ programs, $0) and the same illustrative clinic
   names used elsewhere — no invented usage/traction metrics. */

const NAV = [
  { label: 'Home',         icon: Home2,        active: true },
  { label: 'Clinic Search',icon: SearchNormal1 },
  { label: 'Programs',     icon: ReceiptText },
  { label: 'Passport',     icon: ShieldTick },
  { label: 'Settings',     icon: Setting2 },
]

const STATS = [
  { value: '18,900+', label: 'Clinics indexed', delta: 'HRSA · NAFC · NPI' },
  { value: '40+',     label: 'Programs checked', delta: 'Medicaid · ACA · HRSA' },
  { value: '$0',      label: 'Always free',      delta: 'No account needed' },
]

const CLINICS = [
  { init: 'CA', name: 'Clinica Adelante',      meta: '1.2 mi · ~20 min', status: 'Open', open: true },
  { init: 'VS', name: 'Valle del Sol Health',  meta: '2.8 mi · ~45 min', status: 'Busy', open: false },
  { init: 'MP', name: 'Mountain Park Health',  meta: '4.1 mi · ~15 min', status: 'Open', open: true },
]

export default function ProductMockup() {
  const ref     = useRef<HTMLElement>(null)
  const winRef  = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const raf = useRef(0)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.2 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  const onMove = (e: React.MouseEvent) => {
    if (window.matchMedia('(hover: none)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const stage = ref.current?.querySelector('.mockup-stage') as HTMLElement | null
    const win = winRef.current
    if (!stage || !win) return
    const r = stage.getBoundingClientRect()
    const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)   // -1..1
    const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      win.style.transform = `rotateY(${px * 6}deg) rotateX(${-py * 5}deg) translateZ(0)`
    })
  }
  const onLeave = () => {
    const win = winRef.current; if (!win) return
    cancelAnimationFrame(raf.current)
    win.style.transform = 'rotateY(0deg) rotateX(0deg)'
  }

  return (
    <section
      ref={ref}
      aria-labelledby="mockup-title"
      style={{ position: 'relative', zIndex: 2, maxWidth: '1080px', margin: '0 auto', padding: 'clamp(80px, 12vh, 130px) clamp(20px, 5vw, 40px) 0', textAlign: 'center' }}
    >
      <div style={{ marginBottom: '3rem', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)', transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
        <p style={{ fontSize: '11px', fontWeight: 650, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>
          Your care, organized
        </p>
        <h2 id="mockup-title" style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)',
          fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, color: 'var(--text)', textWrap: 'balance',
        }}>
          One place for every free clinic and program near you
        </h2>
      </div>

      <div
        className="mockup-stage"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          perspective: '1500px', position: 'relative',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)',
          transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Ambient glow behind the window */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: '-6% 4% 8%', borderRadius: '40px',
          background: 'radial-gradient(ellipse 60% 55% at 50% 40%, rgba(79,142,240,0.28), rgba(79,142,240,0.06) 55%, transparent 72%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        <div ref={winRef} className="mockup-window" style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
          borderRadius: '14px', overflow: 'hidden', textAlign: 'left',
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'linear-gradient(180deg, #0C1017, #080A0F)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          {/* Title bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', gap: '7px' }}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '5px 14px', fontSize: '12px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                <Lock1 size={11} color="var(--text-3)" variant="Bold" /> axvo.health/dashboard
              </div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>v1.0</span>
          </div>

          {/* Body */}
          <div className="mockup-body" style={{ display: 'grid', gridTemplateColumns: '186px 1fr' }}>
            {/* Sidebar */}
            <aside className="mockup-sidebar" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', padding: '22px 14px', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.012)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '0.14em', fontSize: '15px', color: 'var(--text)', padding: '0 8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '10px' }}>AXVO</div>
              {NAV.map(({ label, icon: Icon, active }) => (
                <div key={label} className="mock-nav-item" style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '9px', fontSize: '13px', fontFamily: 'var(--font-inter)',
                  color: active ? 'var(--text)' : 'var(--text-2)', fontWeight: active ? 600 : 400,
                  background: active ? 'rgba(79,142,240,0.14)' : 'transparent',
                  border: active ? '1px solid rgba(79,142,240,0.22)' : '1px solid transparent',
                }}>
                  <Icon size={16} variant={active ? 'Bulk' : 'Linear'} color={active ? 'var(--accent2)' : 'var(--text-3)'} /> {label}
                </div>
              ))}
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '18px 10px 8px' }}>My resources</div>
              {['Saved clinics', 'My care plan'].map(l => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '7px 10px', fontSize: '12.5px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} /> {l}
                </div>
              ))}
            </aside>

            {/* Main */}
            <div style={{ padding: 'clamp(18px, 2.6vw, 28px)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '22px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2.2vw, 23px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Dashboard</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-3)', marginTop: '3px', fontFamily: 'var(--font-inter)' }}>Free care near you · Phoenix, AZ</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px', fontFamily: 'var(--font-inter)' }}>This month</span>
                  <span style={{ fontSize: '12px', color: '#fff', background: 'var(--accent)', borderRadius: '8px', padding: '6px 12px', fontFamily: 'var(--font-inter)', fontWeight: 600 }}>Overview</span>
                </div>
              </div>

              {/* Stat cards */}
              <div className="mock-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '22px' }}>
                {STATS.map(s => (
                  <div key={s.label} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px', background: 'linear-gradient(160deg, rgba(79,142,240,0.06), rgba(255,255,255,0.01))' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.6vw, 27px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-2)', marginTop: '4px', fontFamily: 'var(--font-inter)' }}>{s.label}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--accent2)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>{s.delta}</div>
                  </div>
                ))}
              </div>

              {/* Clinics list */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', fontFamily: 'var(--font-inter)' }}>Clinics near you</div>
                <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-inter)' }}>See all →</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {CLINICS.map(c => (
                  <div key={c.name} className="mock-clinic-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '11px', padding: '11px 14px', background: 'rgba(255,255,255,0.015)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(140deg, rgba(95,158,249,0.25), rgba(79,142,240,0.08))', border: '1px solid rgba(95,158,249,0.2)', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--accent2)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{c.init}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: '1px' }}>{c.meta}</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', flexShrink: 0,
                      color: c.open ? 'var(--success)' : 'var(--amber)',
                      background: c.open ? 'rgba(52,211,153,0.10)' : 'rgba(217,119,6,0.10)',
                      border: `1px solid ${c.open ? 'rgba(52,211,153,0.22)' : 'rgba(217,119,6,0.22)'}` }}>{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mock-nav-item { transition: background 0.15s, color 0.15s; }
        .mockup-window:hover .mock-nav-item:not([style*="rgba(79"]):hover { background: rgba(255,255,255,0.04); color: var(--text); }
        .mock-clinic-row { transition: border-color 0.18s, background 0.18s, transform 0.18s; }
        .mock-clinic-row:hover { border-color: rgba(79,142,240,0.28); background: rgba(79,142,240,0.05); transform: translateX(2px); }
        @media (max-width: 680px) {
          .mockup-sidebar { display: none !important; }
          .mockup-body { grid-template-columns: 1fr !important; }
          .mock-stats { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 420px) {
          .mock-stats { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .mockup-window { transition: none !important; }
        }
      `}</style>
    </section>
  )
}
