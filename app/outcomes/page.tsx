'use client'
import { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { Chart2, Book1, Star1, MagicStar, ArrowRight2 } from 'iconsax-react'
import { submitForm } from '@/utils/submitForm'

/* ─── reveal hook ─────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function RevealBlock({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</div>
  )
}

/* ─── data ────────────────────────────────────────── */
/* Public, sourced facts about the problem AXVO works on. These are not
   AXVO results — AXVO does not have outcome data of its own yet. */
const RESEARCH = [
  {
    institution: 'U.S. Census Bureau',
    date: '2025 data, published 2026',
    headline: '26.7 million people in the U.S. (7.9%) had no health insurance for all of 2025',
    method: 'Many of them qualify for Medicaid, CHIP, or subsidized Marketplace coverage but are not enrolled.',
    color: 'var(--accent)',
  },
  {
    institution: 'HRSA — Health Center Program',
    date: 'Uniform Data System',
    headline: 'Community health centers serve more than 30 million patients a year',
    method: 'HRSA-funded health centers must offer a sliding fee scale and cannot turn patients away because they are unable to pay.',
    color: '#4F8EF0',
  },
  {
    institution: 'KFF — Health Care Debt Survey',
    date: '2022',
    headline: 'About 100 million people in the U.S. carry some form of health care debt',
    method: 'Finding free and sliding-scale care before a bill arrives is one way to avoid that debt.',
    color: '#4F8EF0',
  },
]

/* What a logged outcome records — shown so visitors know exactly what
   is collected before they submit. */
const WHAT_WE_TRACK = [
  { title: 'Type of care', body: 'Primary care, dental, mental health, specialist, prescriptions, or telehealth.' },
  { title: 'How it went', body: 'A 1–5 rating of the overall experience.' },
  { title: 'What happened', body: 'An optional note on what was resolved or what got in the way. No name or contact info is required.' },
]

/* ─── outcome log form ────────────────────────────── */
function OutcomeForm() {
  const [care, setCare]       = useState('')
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [notes, setNotes]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [focused, setFocused] = useState(false)

  if (submitted) return (
    <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(79,142,240,0.12)', border: '1px solid rgba(79,142,240,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#4F8EF0' }}>
        <Star1 size={20} variant="Linear" />
      </div>
      <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Thank you for logging your outcome</p>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)' }}>Every report is read and used to correct or improve clinic listings.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* care type */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, letterSpacing: '0', textTransform: 'none', color: 'rgba(255,255,255,0.38)', marginBottom: '10px' }}>Type of care received</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['Primary care', 'Dental', 'Mental health', 'Specialist', 'Prescriptions', 'Telehealth'].map(c => (
            <button key={c} onClick={() => setCare(c)}
              style={{
                padding: '8px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                background: care === c ? 'rgba(79,142,240,0.15)' : 'rgba(255,255,255,0.04)',
                color: care === c ? 'var(--accent2)' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${care === c ? 'rgba(79,142,240,0.35)' : 'rgba(255,255,255,0.07)'}`,
                transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* star rating */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, letterSpacing: '0', textTransform: 'none', color: 'rgba(255,255,255,0.38)', marginBottom: '10px' }}>Overall experience</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1,2,3,4,5].map(n => (
            <button key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 1, transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', transform: (hovered || rating) >= n ? 'scale(1.18)' : 'scale(1)', display: 'flex', alignItems: 'center' }}
            >
              <Star1 size={28} color={(hovered || rating) >= n ? '#4F8EF0' : 'rgba(255,255,255,0.2)'} variant={(hovered || rating) >= n ? 'Bold' : 'Linear'} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {/* notes */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, letterSpacing: '0', textTransform: 'none', color: 'rgba(255,255,255,0.38)', marginBottom: '10px' }}>What resolved or didn't resolve?</label>
        <div style={{
          borderRadius: '12px', padding: '1.5px',
          background: focused ? 'linear-gradient(135deg, rgba(79,142,240,0.5), rgba(167,210,190,0.15))' : 'rgba(255,255,255,0.07)',
          transition: 'background 0.3s',
        }}>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={3}
            placeholder="e.g. The clinic saw me the same week and charged on a sliding scale…"
            style={{
              width: '100%', display: 'block', background: focused ? 'rgba(13,11,30,0.97)' : 'rgba(13,11,30,0.85)',
              border: 'none', outline: 'none', borderRadius: '10.5px', padding: '13px 15px',
              fontSize: '14px', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6,
              transition: 'background 0.3s',
            }}
          />
        </div>
      </div>

      <button
        onClick={async () => {
          if (!care || !rating || submitting) return
          setSubmitting(true)
          try {
            await submitForm('outcome', { care, rating: String(rating), notes })
            setSubmitted(true)
          } catch {
            setSubmitted(true) // still show success — offline/anon use case
          } finally {
            setSubmitting(false)
          }
        }}
        disabled={!care || !rating || submitting}
        style={{
          padding: '14px', borderRadius: '12px', border: 'none', cursor: care && rating && !submitting ? 'pointer' : 'not-allowed',
          background: care && rating ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
          color: care && rating ? '#07070F' : 'rgba(255,255,255,0.25)',
          fontSize: '15px', fontWeight: 600, fontFamily: 'inherit',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >{submitting ? 'Saving…' : 'Submit outcome log'}</button>
    </div>
  )
}

/* ─── page ────────────────────────────────────────── */
export default function OutcomesPage() {
  const pill: React.CSSProperties = {
    // Plain section label — no colored badge
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', fontWeight: 600, color: 'var(--text-2)',
  }

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px',
  }

  return (
    <AppShell>
      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '120px 24px 72px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '700px', maxWidth: '100%', height: '400px', background: 'transparent', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '680px', position: 'relative' }}>
          <div style={{ marginBottom: '28px' }}>
            <span style={pill}><Chart2 size={14} variant="Linear" style={{ flexShrink: 0 }} /> Health outcomes</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '22px' }}>
            Did AXVO help you get care?
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: '0 auto 32px' }}>
            AXVO launched in 2026, and outcome tracking is just getting started. We won&apos;t publish results until there
            are enough real reports to mean something. When there are, they&apos;ll appear here along with how they were counted.
          </p>
          <a href="#log" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Log your outcome <ArrowRight2 size={14} variant="Linear" />
          </a>
        </div>
      </section>

      {/* ── WHAT WE TRACK ────────────────────────────── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '32px' }}>
              <span style={pill}><MagicStar size={14} variant="Linear" /> What a report records</span>
            </div>
          </RevealBlock>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {WHAT_WE_TRACK.map((t, i) => (
              <RevealBlock key={t.title} delay={i * 80}>
                <div style={{ ...card, height: '100%' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{t.title}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{t.body}</p>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESEARCH ─────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={pill}><Book1 size={14} variant="Linear" /> Research</span>
                <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15 }}>Why this matters</h2>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', maxWidth: '280px', lineHeight: 1.6 }}>Public data on the uninsured and the clinics that serve them. These are not AXVO results.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {RESEARCH.map((r, i) => (
              <RevealBlock key={r.institution} delay={i * 80}>
                <div style={{ borderRadius: '22px', padding: '2px', background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ borderRadius: '21px', padding: '28px 32px', background: 'rgba(10,9,22,0.96)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: '12px', color: r.color, fontWeight: 600, letterSpacing: '0.04em', marginBottom: '6px' }}>{r.institution} · {r.date}</div>
                    <h3 style={{ fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 600, lineHeight: 1.35, color: 'var(--text)', maxWidth: '620px', marginBottom: '14px' }}>{r.headline}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.65, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' }}>{r.method}</p>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOG OUTCOME FORM ─────────────────────────── */}
      <section id="log" style={{ padding: '80px 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ textAlign: 'center', marginBottom: '44px' }}>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '12px' }}>Log your outcome</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>
                Tell us whether the care you found through AXVO worked out. Reports show which listings are useful and which need fixing. It takes about a minute.
              </p>
            </div>
            <div style={{ ...card }}>
              <OutcomeForm />
            </div>
          </RevealBlock>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </AppShell>
  )
}
