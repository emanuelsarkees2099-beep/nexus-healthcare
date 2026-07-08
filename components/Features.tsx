'use client'
import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Location, Cpu, ReceiptText, Chart2, Profile2User, Calendar1, ArrowRight, TickCircle, Clock, Activity } from 'iconsax-react'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap-st'
registerGSAP()

/* ── Reusable bento pieces ───────────────────────────────────────── */

function BentoIcon({ icon, color = 'rgba(255,255,255,0.55)', bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.08)' }: {
  icon: React.ReactNode; color?: string; bg?: string; border?: string
}) {
  /* Inject explicit color prop — iconsax TwoTone/Linear use stroke="currentColor"
     which can fail to cascade through React's SVG rendering in some environments.
     cloneElement bypasses CSS inheritance and passes color as a direct React prop. */
  const iconWithColor = React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<{ color?: string }>, { color })
    : icon

  return (
    <div
      aria-hidden="true"
      className="bento-icon-wrap"
      style={{
        width: '40px', height: '40px', background: bg, border: `1px solid ${border}`,
        borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.25rem', color, flexShrink: 0,
      }}
    >
      {iconWithColor}
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
      borderRadius: 'var(--r-sm)', padding: '3px 9px',
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
      Explore feature <ArrowRight size={12} color="var(--accent)" variant="Linear" />
    </div>
  )
}

/* ── Mini live illustration: Clinic Finder map pins ─────────────── */
function ClinicMapMini() {
  return (
    <div style={{
      marginTop: '1.25rem',
      background: 'rgba(0,0,0,0.25)',
      border: '1px solid rgba(74,144,217,0.08)',
      borderRadius: 'var(--r-md)', padding: '12px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Faint grid lines for map feel */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(74,144,217,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,144,217,0.03) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        borderRadius: 'var(--r-md)',
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
          padding: '7px 9px', borderRadius: 'var(--r-sm)', marginBottom: '4px',
          background: i === 0 ? 'rgba(74,144,217,0.06)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${i === 0 ? 'rgba(74,144,217,0.14)' : 'transparent'}`,
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
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.8rem,6vw,4.5rem)',
        fontWeight: 700, color: 'var(--amber)',
        letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '4px',
        textShadow: '0 0 40px rgba(252,211,77,0.25)',
      }}>
        40+
      </div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px', fontFamily: 'var(--font-display)' }}>
        Programs checked
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.7, fontFamily: 'var(--font-inter)' }}>
        Medicaid, ACA, HRSA — scanned in under 60 seconds.
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
        {['Medicaid', 'ACA', 'HRSA', 'CHIP', '340B'].map(p => (
          <div key={p} style={{
            padding: '3px 8px', borderRadius: 'var(--r-sm)',
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

/* ── Mini live illustration: AI triage chat (real product UI) ────── */
function TriageChatMini() {
  return (
    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* User message */}
      <div style={{
        alignSelf: 'flex-end', maxWidth: '90%',
        background: 'rgba(79,142,240,0.16)', border: '1px solid rgba(79,142,240,0.25)',
        borderRadius: '12px 12px 4px 12px', padding: '8px 12px',
        fontSize: '11.5px', color: 'var(--text)', lineHeight: 1.5,
        fontFamily: 'var(--font-inter)',
      }}>
        My tooth has hurt for a week — no insurance
      </div>
      {/* AI reply */}
      <div style={{
        alignSelf: 'flex-start', maxWidth: '92%',
        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
        borderRadius: '12px 12px 12px 4px', padding: '8px 12px',
        fontSize: '11.5px', color: 'var(--text-2)', lineHeight: 1.55,
        fontFamily: 'var(--font-inter)',
      }}>
        <span style={{
          display: 'block', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em',
          color: 'var(--accent)', marginBottom: '4px',
        }}>NEXUS</span>
        That&apos;s treatable at a <strong style={{ color: 'var(--text)' }}>free dental clinic</strong> —
        not an ER. ERs can&apos;t do dental work and average $1,500.
      </div>
      {/* Handoff card */}
      <div style={{
        alignSelf: 'flex-start', width: '92%',
        background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)',
        borderRadius: 'var(--r-sm)', padding: '8px 12px',
        fontFamily: 'var(--font-inter)',
      }}>
        <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text)' }}>
          3 free dental clinics near you
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '2px' }}>
          Closest: 1.2 mi · open until 6 PM
        </div>
      </div>
    </div>
  )
}

/* ── Mini live illustration: CHW avatar row ─────────────────────── */
function CHWAvatarRow() {
  const initials = ['MA', 'JR', 'SP', 'LC', 'TK']
  const colors   = ['#4A90D9', '#A78BFA', '#FCD34D', '#F87171', '#60A5FA']
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
            padding: '3px 8px', borderRadius: 'var(--r-sm)',
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
          padding: '8px 10px', borderRadius: 'var(--r-sm)',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
          fontFamily: 'var(--font-inter)',
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-3)', width: '28px', flexShrink: 0, fontFamily: 'var(--font-mono),monospace' }}>{ev.day}</span>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: colors[ev.type], flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: 'var(--text-2)', flex: 1 }}>{ev.event}</span>
          <Clock size={14} color="var(--text-3)" variant="Linear" />
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
            padding: '5px 10px', borderRadius: 'var(--r-sm)',
            background: i === 2 ? 'rgba(74,144,217,0.10)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${i === 2 ? 'rgba(74,144,217,0.22)' : 'rgba(255,255,255,0.06)'}`,
            fontSize: '10px', fontWeight: i === 2 ? 600 : 400,
            color: i === 2 ? 'var(--accent)' : 'var(--text-2)',
            fontFamily: 'var(--font-inter)',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            {i === 2 && <TickCircle size={14} color="var(--accent)" variant="Linear" />}
            {step}
          </div>
          {i < steps.length - 1 && <ArrowRight size={14} color="var(--text-3)" variant="Linear" />}
        </div>
      ))}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────── */

const cardBase: React.CSSProperties = {
  background: 'rgba(255,255,255,0.038)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 'var(--r-md)',
  padding: '2rem',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  boxSizing: 'border-box',
  cursor: 'pointer',
  transition: 'border-color 0.35s cubic-bezier(0.32,0.72,0,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
}

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.section-intro', {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.section-intro', start: 'top 85%', once: true },
      })

      /* ── Word-by-word masked h2 reveal (mask-reveal technique) ── */
      gsap.set('.reveal-word-inner', { y: '115%', opacity: 0 })
      gsap.to('.reveal-word-inner', {
        y: '0%', opacity: 1,
        duration: 0.75, ease: 'power3.out', stagger: 0.065,
        scrollTrigger: { trigger: '.reveal-h2', start: 'top 86%', once: true },
      })

      /* ── Eyebrow pill clip-wipe entrance ── */
      gsap.from('.features-eyebrow', {
        clipPath: 'inset(0 100% 0 0)', opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.features-eyebrow', start: 'top 90%', once: true },
      })

      /* ── BentoIcon bounce-in ── */
      gsap.from('.bento-icon-wrap', {
        scale: 0.5, opacity: 0, rotation: -20,
        duration: 0.55, ease: 'back.out(2)',
        stagger: 0.07,
        scrollTrigger: { trigger: '.bento-grid', start: 'top 82%', once: true },
      })

      /* Spring-eased card entrances — once:true, no scrub, large offsets for drama */
      const cardDefs = [
        { sel: '.bc-1', from: { x: -100, y: 80,  scale: 0.82, opacity: 0, rotation: -3 }, delay: 0.00 },
        { sel: '.bc-2', from: { x:  80,  y: -70, scale: 0.82, opacity: 0, rotation:  2 }, delay: 0.08 },
        { sel: '.bc-3', from: { x:  110, y:  60, scale: 0.82, opacity: 0, rotation:  3 }, delay: 0.14 },
        { sel: '.bc-4', from: { x: -80,  y:  90, scale: 0.82, opacity: 0, rotation: -2 }, delay: 0.20 },
        { sel: '.bc-5', from: { x: -90,  y: -55, scale: 0.82, opacity: 0, rotation: -2 }, delay: 0.26 },
        { sel: '.bc-6', from: { x:  100, y:  35, scale: 0.82, opacity: 0, rotation:  2 }, delay: 0.32 },
      ]
      cardDefs.forEach(({ sel, from, delay }) => {
        gsap.from(sel, {
          ...from,
          duration: 1.05,
          ease: 'back.out(1.5)',
          delay,
          scrollTrigger: { trigger: '.bento-grid', start: 'top 78%', once: true },
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
      className="cv-auto dot-grid-bg section-depth-violet"
      style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '120px 3rem', overflow: 'visible' }}
    >
      {/* Three-source light system */}
      <div className="section-glow-left"  aria-hidden="true" style={{ top: '5%',  background: 'radial-gradient(circle, rgba(74,144,217,0.06) 0%, transparent 65%)' }} />
      <div className="section-glow-right" aria-hidden="true" style={{ top: '40%', background: 'radial-gradient(circle, rgba(252,211,77,0.04) 0%, transparent 65%)'  }} />
      <div className="section-glow-violet" aria-hidden="true" style={{ bottom: '5%', left: '50%', transform: 'translateX(-50%)' }} />

      {/* Section header */}
      <div className="section-intro" style={{ marginBottom: '4rem' }}>
        <div className="features-eyebrow" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--accent)',
          marginBottom: '1.25rem', fontFamily: 'var(--font-inter)',
          background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.14)',
          borderRadius: '100px', padding: '5px 14px',
        }}>
          <Activity size={11} color="var(--accent)" variant="TwoTone" />
          What NEXUS offers
        </div>
        <h2
          id="features-title"
          className="reveal-h2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem,4vw,3.5rem)',
            fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
          }}
        >
          {['Built', 'for', 'people', 'the'].map(w => (
            <span key={w} className="reveal-word" style={{ marginRight: '0.28em' }}>
              <span className="reveal-word-inner">{w}</span>
            </span>
          ))}
          <br />
          <span className="reveal-word" style={{ marginRight: '0.28em' }}>
            <span className="reveal-word-inner">system</span>
          </span>
          <span className="reveal-word">
            <span className="reveal-word-inner">
              <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>overlooked</em>
            </span>
          </span>
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
        <Link
          href="/search"
          className="bc-1"
          style={{ gridColumn: 'span 5', gridRow: 'span 2', minHeight: '380px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div
            className="bento-card nexus-card card-mint"
            role="listitem"
            style={{ ...cardBase }}
          >
            <div className="card-depth-overlay" aria-hidden="true" />
            <BentoIcon
              icon={<Location size={18} variant="TwoTone" />}
              color="var(--accent)"
              bg="rgba(74,144,217,0.10)"
              border="rgba(74,144,217,0.18)"
            />
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
              Clinic Finder
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75, fontFamily: 'var(--font-inter)', maxWidth: '280px' }}>
              12,000+ federally qualified health centers, free clinics, and sliding-scale providers — searchable by specialty, language, and wait time.
            </div>
            <Tag color="var(--accent)" bg="rgba(74,144,217,0.07)">Core feature</Tag>
            <ClinicMapMini />
          </div>
        </Link>

        {/* BC-2: Pathways — violet */}
        <Link
          href="/pathways"
          className="bc-2"
          style={{ gridColumn: 'span 7', minHeight: '178px', textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}
        >
          <div className="bento-card nexus-card card-violet" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
              <BentoIcon
                icon={<Cpu size={18} variant="TwoTone" />}
                color="var(--violet)"
                bg="rgba(167,139,250,0.10)"
                border="rgba(167,139,250,0.18)"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem', fontFamily: 'var(--font-display)' }}>
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
          style={{ gridColumn: 'span 4', minHeight: '178px', textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}
        >
          <div className="bento-card nexus-card card-amber" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <BentoIcon
              icon={<ReceiptText size={18} variant="TwoTone" />}
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

        {/* BC-4: AI Symptom Guide — default */}
        <Link
          href="/triage"
          className="bc-4"
          style={{ gridColumn: 'span 3', minHeight: '178px', textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}
        >
          <div className="bento-card nexus-card" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <BentoIcon icon={<Cpu size={18} variant="TwoTone" />} />
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem', fontFamily: 'var(--font-display)' }}>
              AI Symptom Guide
            </div>
            <TriageChatMini />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem' }}>
              <Tag>AI Triage</Tag>
              <ExploreLink />
            </div>
          </div>
        </Link>

        {/* BC-5: CHW Network — violet */}
        <Link
          href="/chw"
          className="bc-5"
          style={{ gridColumn: 'span 5', minHeight: '178px', textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}
        >
          <div className="bento-card nexus-card card-violet" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
              <BentoIcon
                icon={<Profile2User size={18} variant="TwoTone" />}
                color="var(--violet)"
                bg="rgba(167,139,250,0.10)"
                border="rgba(167,139,250,0.18)"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem', fontFamily: 'var(--font-display)' }}>
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
          style={{ gridColumn: 'span 7', minHeight: '178px', textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}
        >
          <div className="bento-card nexus-card card-mint" role="listitem" style={{ ...cardBase }}>
            <div className="card-depth-overlay" aria-hidden="true" />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
              <BentoIcon
                icon={<Calendar1 size={18} variant="TwoTone" />}
                color="var(--accent)"
                bg="rgba(74,144,217,0.10)"
                border="rgba(74,144,217,0.18)"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem', fontFamily: 'var(--font-display)' }}>
                  Preventive Care Calendar
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75, fontFamily: 'var(--font-inter)' }}>
                  Personalized screening schedule + live free clinic events — dental days, mammography vans, vaccine drives.
                </div>
                <CalendarEventMini />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem' }}>
                  <Tag color="var(--accent)" bg="rgba(74,144,217,0.07)">Events</Tag>
                  <ExploreLink />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Also included pill row ── */}
      <div style={{ marginTop: '40px', paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-2)', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Also included
        </span>
        <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
        {[
          { href: '/provider',      label: 'Provider Dashboard' },
          { href: '/impact',        label: 'Impact Dashboard'   },
          { href: '/telehealth',    label: 'Telehealth'         },
          { href: '/stories',       label: 'Stories'            },
          { href: '/rights',        label: 'Rights & Legal'     },
          { href: '/advocacy',      label: 'Advocacy'           },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="also-included-pill"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', color: 'rgba(255,255,255,0.55)',
              fontFamily: 'var(--font-inter)', fontWeight: 400,
              textDecoration: 'none', padding: '5px 13px',
              borderRadius: '100px',
              border: '1px solid rgba(74,144,217,0.20)',
              background: 'rgba(74,144,217,0.05)',
              transition: 'color 0.2s, border-color 0.25s, background 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--accent2)'
              e.currentTarget.style.borderColor = 'rgba(74,144,217,0.40)'
              e.currentTarget.style.background = 'rgba(74,144,217,0.10)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
              e.currentTarget.style.borderColor = 'rgba(74,144,217,0.20)'
              e.currentTarget.style.background = 'rgba(74,144,217,0.05)'
            }}
          >
            {item.label} <ArrowRight size={14} color="var(--accent)" variant="Linear" />
          </Link>
        ))}
      </div>

      <style>{`
        /* ── Word reveal: outer = overflow clip, inner = sliding element ── */
        .reveal-word {
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
          padding-bottom: 0.06em;
          margin-bottom: -0.06em;
        }
        .reveal-word-inner {
          display: inline-block;
        }
        /* Eyebrow: clip-path wipe base state */
        .features-eyebrow {
          clip-path: inset(0 0% 0 0);
          overflow: hidden;
        }
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
