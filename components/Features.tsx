'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  MapPin, BrainCircuit, ReceiptText, BarChart2, Users, CalendarDays,
  ArrowRight, CheckCircle2, Clock, Wifi, Activity,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

/* ── Reusable bento pieces ───────────────────────────────────────── */

function BentoIcon({ icon, color = 'rgba(255,255,255,0.55)', bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.08)' }: {
  icon: React.ReactNode; color?: string; bg?: string; border?: string
}) {
  return (
    <div aria-hidden="true" style={{
      width: '40px', height: '40px', background: bg, border: `1px solid ${border}`,
      borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '1.25rem', color, flexShrink: 0,
    }}>
      {icon}
    </div>
  )
}

function Tag({ children, color = 'rgba(255,255,255,0.30)', bg = 'rgba(255,255,255,0.05)' }: {
  children: React.ReactNode; color?: string; bg?: string
}) {
  return (
    <div style={{
      display: 'inline-block', marginTop: '1rem',
      fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em',
      textTransform: 'uppercase', color, background: bg,
      borderRadius: '5px', padding: '3px 9px',
      fontFamily: 'var(--font-inter)',
    }}>
      {children}
    </div>
  )
}

function ExploreLink() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      marginTop: '1rem', fontSize: '12px', color: 'var(--accent)',
      fontFamily: 'var(--font-inter)', fontWeight: 500, letterSpacing: '0.02em',
    }}>
      Explore feature <ArrowRight size={12} strokeWidth={2} />
    </div>
  )
}

/* ── Mini live illustration: Clinic Finder map pins ─────────────── */
function ClinicMapMini() {
  return (
    <div style={{
      marginTop: '1.25rem',
      background: 'rgba(0,0,0,0.25)',
      border: '1px solid rgba(110,231,183,0.08)',
      borderRadius: '12px', padding: '12px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Faint grid lines for map feel */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(110,231,183,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,183,0.03) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        borderRadius: '12px',
      }} />

      <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '8px', fontFamily: 'var(--font-inter)', position: 'relative' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', animation: 'open-pulse 2.5s ease-in-out infinite' }} />
          3 clinics · Phoenix, AZ
        </span>
      </div>

      {[
        { name: 'Clinica Adelante',    dist: '1.2 mi', open: true  },
        { name: 'Valle del Sol Health', dist: '2.8 mi', open: false },
        { name: 'Mountain Park Health', dist: '4.1 mi', open: true  },
      ].map((c, i) => (
        <div key={c.name} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 9px', borderRadius: '8px', marginBottom: '4px',
          background: i === 0 ? 'rgba(110,231,183,0.06)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${i === 0 ? 'rgba(110,231,183,0.14)' : 'transparent'}`,
          fontFamily: 'var(--font-inter)', position: 'relative',
        }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.open ? 'var(--green-pulse)' : 'var(--text-3)', flexShrink: 0 }} />
          <span style={{ color: i === 0 ? 'var(--text)' : 'var(--text-2)', flex: 1, fontSize: '11px', fontWeight: i === 0 ? 500 : 400 }}>{c.name}</span>
          <span style={{ color: 'var(--text-3)', fontSize: '10px', fontFamily: 'var(--font-mono),monospace' }}>{c.dist}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Mini live illustration: Programs counter ────────────────────── */
function ProgramsCounterMini() {
  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{
        fontFamily: 'var(--font-sora)',
        fontSize: 'clamp(2.8rem,6vw,4.5rem)',
        fontWeight: 700, color: 'var(--amber)',
        letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '4px',
        textShadow: '0 0 40px rgba(252,211,77,0.25)',
      }}>
        40+
      </div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px', fontFamily: 'var(--font-sora)' }}>
        Programs checked
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.7, fontFamily: 'var(--font-inter)' }}>
        Medicaid, ACA, HRSA — scanned in under 60 seconds.
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
        {['Medicaid', 'ACA', 'HRSA', 'CHIP', '340B'].map(p => (
          <div key={p} style={{
            padding: '3px 8px', borderRadius: '5px',
            background: 'rgba(252,211,77,0.07)', border: '1px solid rgba(252,211,77,0.15)',
            fontSize: '10px', color: 'var(--amber)', fontFamily: 'var(--font-inter)', fontWeight: 500,
          }}>
            {p}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Mini live illustration: Outcomes sparkline ─────────────────── */
function OutcomesSparkline() {
  const points = [18, 35, 28, 52, 41, 63, 58, 71, 67, 82, 79, 88]
  const maxV = 100
  const w = 140, h = 40
  const pathD = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w
    const y = h - (v / maxV) * h
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{
        fontFamily: 'var(--font-sora)',
        fontSize: 'clamp(2.2rem,5vw,3.5rem)',
        fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1,
        color: 'var(--text)', marginBottom: '4px',
      }}>
        47K+
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', marginBottom: '12px' }}>
        Care visits tracked &amp; powering research
      </div>
      <svg width={w} height={h + 4} viewBox={`0 0 ${w} ${h + 4}`} aria-hidden="true">
        <defs>
          <linearGradient id="spark-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(110,231,183,0.3)" />
            <stop offset="100%" stopColor="rgba(110,231,183,0.9)" />
          </linearGradient>
        </defs>
        <path d={pathD} fill="none" stroke="url(#spark-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* End dot */}
        <circle cx={w} cy={h - (points[points.length - 1] / maxV) * h} r="3" fill="var(--accent)" />
      </svg>
    </div>
  )
}

/* ── Mini live illustration: CHW avatar row ─────────────────────── */
function CHWAvatarRow() {
  const initials = ['MA', 'JR', 'SP', 'LC', 'TK']
  const colors   = ['#6EE7B7', '#A78BFA', '#FCD34D', '#F87171', '#34D399']
  return (
    <div style={{ marginTop: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '-8px', marginBottom: '10px' }}>
        {initials.map((init, i) => (
          <div key={init} style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: `${colors[i]}20`,
            border: `2px solid ${colors[i]}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 700, color: colors[i],
            fontFamily: 'var(--font-inter)',
            marginLeft: i > 0 ? '-8px' : '0',
            position: 'relative',
            zIndex: initials.length - i,
          }}>
            {init}
          </div>
        ))}
        <div style={{
          marginLeft: '8px', fontSize: '11px', color: 'var(--text-2)',
          fontFamily: 'var(--font-inter)',
        }}>
          340+ verified workers
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {['Spanish', 'Somali', 'Arabic', 'French'].map(lang => (
          <div key={lang} style={{
            padding: '3px 8px', borderRadius: '5px',
            background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.15)',
            fontSize: '10px', color: 'var(--violet)', fontFamily: 'var(--font-inter)', fontWeight: 500,
          }}>
            {lang}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Mini live illustration: Calendar events ────────────────────── */
function CalendarEventMini() {
  const events = [
    { day: 'Mon', event: 'Free Dental Day', type: 'dental' },
    { day: 'Wed', event: 'Vaccine Drive',   type: 'vaccine' },
    { day: 'Fri', event: 'Mental Health',   type: 'mental' },
  ]
  const colors: Record<string, string> = { dental: 'var(--amber)', vaccine: 'var(--accent)', mental: 'var(--violet)' }
  return (
    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {events.map(ev => (
        <div key={ev.day} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 10px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
          fontFamily: 'var(--font-inter)',
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-3)', width: '28px', flexShrink: 0, fontFamily: 'var(--font-mono),monospace' }}>{ev.day}</span>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: colors[ev.type], flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: 'var(--text-2)', flex: 1 }}>{ev.event}</span>
          <Clock size={10} color="var(--text-3)" />
        </div>
      ))}
    </div>
  )
}

/* ── Mini live illustration: Pathways route ─────────────────────── */
function PathwaysMini() {
  const steps = ['Symptom', 'Triage', 'Clinic Match', 'Appointment']
  return (
    <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      {steps.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            padding: '5px 10px', borderRadius: '8px',
            background: i === 2 ? 'rgba(110,231,183,0.10)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${i === 2 ? 'rgba(110,231,183,0.22)' : 'rgba(255,255,255,0.06)'}`,
            fontSize: '10px', fontWeight: i === 2 ? 600 : 400,
            color: i === 2 ? 'var(--accent)' : 'var(--text-2)',
            fontFamily: 'var(--font-inter)',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            {i === 2 && <CheckCircle2 size={10} />}
            {step}
          </div>
          {i < steps.length - 1 && <ArrowRight size={10} color="var(--text-3)" />}
        </div>
      ))}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────── */

const cardBase: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border2)',
  borderRadius: '20px',
  padding: '2rem',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.35s cubic-bezier(0.32,0.72,0,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
}

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.section-intro', {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.section-intro', start: 'top 85%' },
      })

      const cardDefs = [
        { sel: '.bc-1', from: { x: -60, y: 30, opacity: 0 } },
        { sel: '.bc-2', from: { x: 40,  y: -30, opacity: 0 } },
        { sel: '.bc-3', from: { x: 60,  y: 20, opacity: 0 } },
        { sel: '.bc-4', from: { x: -40, y: 40, opacity: 0 } },
        { sel: '.bc-5', from: { x: -50, y: -20, opacity: 0 } },
        { sel: '.bc-6', from: { x: 60,  y: 10, opacity: 0 } },
      ]
      cardDefs.forEach(({ sel, from }) => {
        gsap.from(sel, {
          ...from,
          scrollTrigger: { trigger: '.bento-grid', start: 'top 82%', end: 'top 30%', scrub: 1 },
        })
      })

      /* Mouse tilt + spotlight per card */
      document.querySelectorAll<HTMLElement>('.bento-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r  = card.getBoundingClientRect()
          const lx = e.clientX - r.left
          const ly = e.clientY - r.top
          card.style.setProperty('--mouse-x', `${lx}px`)
          card.style.setProperty('--mouse-y', `${ly}px`)
          gsap.to(card, {
            rotateX: -(ly / r.height - 0.5) * 5,
            rotateY:  (lx / r.width  - 0.5) * 5,
            transformStyle: 'preserve-3d',
            duration: 0.4, ease: 'power2.out',
          })
        })
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' })
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="features"
      aria-labelledby="features-title"
      className="dot-grid-bg"
      style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '120px 3rem', overflow: 'visible' }}
    >
      {/* Three-source light system */}
      <div className="section-glow-left"  aria-hidden="true" style={{ top: '5%',  background: 'radial-gradient(circle, rgba(110,231,183,0.06) 0%, transparent 65%)' }} />
      <div className="section-glow-right" aria-hidden="true" style={{ top: '40%', background: 'radial-gradient(circle, rgba(252,211,77,0.04) 0%, transparent 65%)'  }} />
      <div className="section-glow-violet" aria-hidden="true" style={{ bottom: '5%', left: '50%', transform: 'translateX(-50%)' }} />

      {/* Section header */}
      <div className="section-intro" style={{ marginBottom: '4rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--accent)',
          marginBottom: '1.25rem', fontFamily: 'var(--font-inter)',
          background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.14)',
          borderRadius: '100px', padding: '5px 14px',
        }}>
          <Activity size={11} strokeWidth={2} />
          What NEXUS offers
        </div>
        <h2
          id="features-title"
          style={{
            fontFamily: 'var(--font-sora)',
            fontSize: 'clamp(2.2rem,4vw,3.5rem)',
            fontWeight: 700, lineHeight: 0.98, letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
          }}
        >
          Built for people the<br />
          system <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>overlooked</em>
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--text-2)', maxWidth: '480px', fontWeight: 400, lineHeight: 1.85, fontFamily: 'var(--font-inter)' }}>
          Every feature was designed around one question: what does an uninsured adult actually need to get care today?
        </p>
      </div>

      {/* ── BENTO GRID ── */}
      <div
        className="bento-grid"
        role="list"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px' }}
      >

        {/* BC-1: Clinic Finder — large hero card, mint */}
        <div
          className="bento-card card-mint bc-1"
          role="listitem"
          style={{ ...cardBase, gridColumn: 'span 5', gridRow: 'span 2', minHeight: '380px' }}
        >
          <div className="card-depth-overlay" aria-hidden="true" />
          <BentoIcon
            icon={<MapPin size={18} strokeWidth={1.5} />}
            color="var(--accent)"
            bg="rgba(110,231,183,0.10)"
            border="rgba(110,231,183,0.18)"
          />
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', fontFamily: 'var(--font-sora)' }}>
            Clinic Finder
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75, fontFamily: 'var(--font-inter)', maxWidth: '280px' }}>
            12,000+ federally qualified health centers, free clinics, and sliding-scale providers — searchable by specialty, language, and wait time.
          </div>
          <Tag color="var(--accent)" bg="rgba(110,231,183,0.07)">Core feature</Tag>
          <ClinicMapMini />
        </div>

        {/* BC-2: Pathways — violet */}
        <Link
          href="/pathways"
          className="bc-2"
          style={{ gridColumn: 'span 7', minHeight: '178px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="bento-card card-violet" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
              <BentoIcon
                icon={<BrainCircuit size={18} strokeWidth={1.5} />}
                color="var(--violet)"
                bg="rgba(167,139,250,0.10)"
                border="rgba(167,139,250,0.18)"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem', fontFamily: 'var(--font-sora)' }}>
                  Smart Care Pathways
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75, fontFamily: 'var(--font-inter)' }}>
                  Predicts which clinic will actually see you based on your symptoms, location, and situation — then routes you there.
                </div>
                <PathwaysMini />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.75rem' }}>
                  <Tag color="var(--violet)" bg="rgba(167,139,250,0.07)">Smart routing</Tag>
                  <ExploreLink />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* BC-3: Programs — amber */}
        <Link
          href="/programs"
          className="bc-3"
          style={{ gridColumn: 'span 4', minHeight: '178px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="bento-card card-amber" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <BentoIcon
              icon={<ReceiptText size={18} strokeWidth={1.5} />}
              color="var(--amber)"
              bg="rgba(252,211,77,0.10)"
              border="rgba(252,211,77,0.18)"
            />
            <ProgramsCounterMini />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem' }}>
              <Tag color="var(--amber)" bg="rgba(252,211,77,0.07)">Clearinghouse</Tag>
              <ExploreLink />
            </div>
          </div>
        </Link>

        {/* BC-4: Outcomes — default */}
        <Link
          href="/outcomes"
          className="bc-4"
          style={{ gridColumn: 'span 3', minHeight: '178px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="bento-card" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <BentoIcon icon={<BarChart2 size={18} strokeWidth={1.5} />} />
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem', fontFamily: 'var(--font-sora)' }}>
              Outcomes Tracker
            </div>
            <OutcomesSparkline />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem' }}>
              <Tag>Research</Tag>
              <ExploreLink />
            </div>
          </div>
        </Link>

        {/* BC-5: CHW Network — violet */}
        <Link
          href="/chw"
          className="bc-5"
          style={{ gridColumn: 'span 5', minHeight: '178px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="bento-card card-violet" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
              <BentoIcon
                icon={<Users size={18} strokeWidth={1.5} />}
                color="var(--violet)"
                bg="rgba(167,139,250,0.10)"
                border="rgba(167,139,250,0.18)"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem', fontFamily: 'var(--font-sora)' }}>
                  CHW Network
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75, fontFamily: 'var(--font-inter)' }}>
                  340+ verified Community Health Workers. They speak your language and know the system.
                </div>
                <CHWAvatarRow />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem' }}>
                  <Tag color="var(--violet)" bg="rgba(167,139,250,0.07)">Human-powered</Tag>
                  <ExploreLink />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* BC-6: Preventive Care Calendar — mint */}
        <Link
          href="/calendar"
          className="bc-6"
          style={{ gridColumn: 'span 7', minHeight: '178px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="bento-card card-mint" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
              <BentoIcon
                icon={<CalendarDays size={18} strokeWidth={1.5} />}
                color="var(--accent)"
                bg="rgba(110,231,183,0.10)"
                border="rgba(110,231,183,0.18)"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem', fontFamily: 'var(--font-sora)' }}>
                  Preventive Care Calendar
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75, fontFamily: 'var(--font-inter)' }}>
                  Personalized screening schedule + live free clinic events — dental days, mammography vans, vaccine drives.
                </div>
                <CalendarEventMini />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem' }}>
                  <Tag color="var(--accent)" bg="rgba(110,231,183,0.07)">Events</Tag>
                  <ExploreLink />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Also included pill row ── */}
      <div style={{ marginTop: '40px', paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' }}>
          Also included
        </span>
        <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.10)', flexShrink: 0 }} />
        {[
          { href: '/provider',      label: 'Provider Dashboard' },
          { href: '/impact',        label: 'Impact Dashboard'   },
          { href: '/telehealth',    label: 'Telehealth'         },
          { href: '/stories',       label: 'Stories'            },
          { href: '/rights',        label: 'Rights & Legal'     },
          { href: '/advocacy',      label: 'Advocacy'           },
          { href: '/accessibility', label: 'Accessibility'      },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', color: 'rgba(255,255,255,0.45)',
              fontFamily: 'var(--font-inter)',
              textDecoration: 'none', padding: '5px 12px',
              borderRadius: '100px', border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)',
              transition: 'color 0.2s, border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--accent)'
              e.currentTarget.style.borderColor = 'rgba(110,231,183,0.25)'
              e.currentTarget.style.background = 'rgba(110,231,183,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
            }}
          >
            {item.label} <ArrowRight size={10} strokeWidth={2} />
          </Link>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bento-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .bc-1,.bc-2,.bc-3,.bc-4,.bc-5,.bc-6 {
            grid-column: span 1 !important; grid-row: span 1 !important;
            min-height: unset !important;
          }
        }
      `}</style>
    </section>
  )
}
