'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Condition = {
  id: string
  label: string
  erCost: number
  freeCost: number
  erTime: string
  freeTime: string
  erNote: string
  freeNote: string
}

const CONDITIONS: Condition[] = [
  {
    id: 'sore-throat',
    label: 'Sore throat / Strep',
    erCost: 1200, freeCost: 0,
    erTime: '3–5 hrs', freeTime: '< 1 hr',
    erNote: 'Includes facility fee, rapid strep test, and physician fee',
    freeNote: 'FQHC visit, sliding scale. Antibiotic prescription included.',
  },
  {
    id: 'sprained-ankle',
    label: 'Sprained ankle',
    erCost: 2100, freeCost: 0,
    erTime: '2–4 hrs', freeTime: '< 2 hrs',
    erNote: 'X-ray + read, splint, physician fee, facility fee',
    freeNote: 'Urgent care clinic visit + X-ray at sliding-scale rate',
  },
  {
    id: 'uti',
    label: 'Urinary tract infection',
    erCost: 950, freeCost: 0,
    erTime: '2–4 hrs', freeTime: '30 min',
    erNote: 'Urinalysis, physician fee, facility fee',
    freeNote: 'Telehealth or FQHC visit. Rx sent to pharmacy.',
  },
  {
    id: 'dental',
    label: 'Dental pain / abscess',
    erCost: 1600, freeCost: 0,
    erTime: '3–6 hrs', freeTime: '< 2 hrs',
    erNote: 'ERs often can\'t treat the tooth — they prescribe antibiotics and refer out',
    freeNote: 'Free dental day or dental school. Root canal or extraction if needed.',
  },
  {
    id: 'mental-health',
    label: 'Mental health crisis',
    erCost: 3200, freeCost: 0,
    erTime: '4–12 hrs', freeTime: '< 1 hr',
    erNote: 'Psychiatric evaluation, observation, facility fees can exceed $3,000/night',
    freeNote: 'Crisis Text Line (free, instant) or 988 counselor. Follow-up at sliding-scale therapist.',
  },
  {
    id: 'high-blood-pressure',
    label: 'High blood pressure check',
    erCost: 1100, freeCost: 0,
    erTime: '2–3 hrs', freeTime: '< 1 hr',
    erNote: 'EKG, blood work, physician fee, facility fee',
    freeNote: 'Free community health screening or FQHC primary care visit',
  },
  {
    id: 'diabetes',
    label: 'Diabetes management',
    erCost: 4800, freeCost: 0,
    erTime: 'Several hrs or overnight', freeTime: 'Same-week',
    erNote: 'Unmanaged diabetes → ER visits for DKA average $4,800+',
    freeNote: 'FQHC provides ongoing diabetes management, A1C testing, and prescription at 340B prices',
  },
]

function Counter({ target, prefix = '$', duration = 1200 }: { target: number; prefix?: string; duration?: number }) {
  const [val, setVal] = useState(0)
  const prevTarget = useRef<number>(0)

  useEffect(() => {
    const from = prevTarget.current
    prevTarget.current = target
    const start = performance.now()

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(from + (target - from) * ease))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{prefix}{val.toLocaleString()}</span>
}

function SavingsBar({ savings, maxSavings }: { savings: number; maxSavings: number }) {
  const [w, setW] = useState(0)
  const pct = (savings / maxSavings) * 100

  useEffect(() => {
    const t = setTimeout(() => setW(pct), 100)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden', marginTop: '8px' }}>
      <div style={{
        height: '100%', width: `${w}%`,
        background: 'linear-gradient(90deg, #6EE7B7, #4ade80)',
        borderRadius: '100px',
        transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: '0 0 12px rgba(110,231,183,0.5)',
      }} />
    </div>
  )
}

export default function CostCalculator() {
  const [selected, setSelected] = useState<string>('sore-throat')
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const router = useRouter()

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const condition = CONDITIONS.find(c => c.id === selected) ?? CONDITIONS[0]
  const savings = condition.erCost - condition.freeCost
  const maxSavings = Math.max(...CONDITIONS.map(c => c.erCost))

  return (
    <section
      ref={ref}
      aria-label="Cost comparison calculator"
      id="cost-calc"
      className="cv-auto"
      style={{
        position: 'relative', zIndex: 2,
        maxWidth: '1200px', margin: '0 auto',
        padding: 'clamp(80px, 10vw, 120px) clamp(1.25rem, 4vw, 3rem)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.2)',
          borderRadius: '100px', padding: '5px 14px',
          fontSize: '11px', fontWeight: 500, color: '#FCD34D',
          fontFamily: 'var(--font-inter)', letterSpacing: '0.06em',
          textTransform: 'uppercase', marginBottom: '24px',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Cost Calculator
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 4vw, 3.4rem)',
          fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
          marginBottom: '16px',
        }}>
          The ER vs. the{' '}
          <em style={{ fontStyle: 'normal', color: '#6EE7B7' }}>free clinic</em>
        </h2>
        <p style={{
          fontSize: '16px', color: 'rgba(255,255,255,0.45)',
          maxWidth: '480px', margin: '0 auto', lineHeight: 1.7,
          fontFamily: 'var(--font-inter)', fontWeight: 300,
        }}>
          Select your situation. See how much you can save by choosing the right care setting — and how to find it near you.
        </p>
      </div>

      {/* Condition selector */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px',
        justifyContent: 'center', marginBottom: '48px',
      }}>
        {CONDITIONS.map(c => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            style={{
              padding: '9px 20px', borderRadius: '100px',
              fontSize: '13px', fontWeight: 500, fontFamily: 'inherit',
              cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
              background: selected === c.id ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.04)',
              color: selected === c.id ? '#6EE7B7' : 'rgba(255,255,255,0.55)',
              border: `1px solid ${selected === c.id ? 'rgba(110,231,183,0.4)' : 'rgba(255,255,255,0.08)'}`,
              transform: selected === c.id ? 'translateY(-1px)' : 'none',
              boxShadow: selected === c.id ? '0 4px 16px rgba(110,231,183,0.15)' : 'none',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Comparison cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px', marginBottom: '32px',
      }}>
        {/* ER card */}
        <div style={{
          padding: '2px', borderRadius: '22px',
          background: 'linear-gradient(135deg, rgba(248,113,113,0.25), rgba(248,113,113,0.05))',
        }}>
          <div style={{
            background: 'rgba(8,13,26,0.98)', borderRadius: '20px',
            padding: '28px', height: '100%',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#f87171', textTransform: 'uppercase', fontFamily: 'var(--font-inter)' }}>Emergency Room</span>
            </div>

            <div style={{
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800,
              color: '#f87171', letterSpacing: '-0.04em', lineHeight: 1,
              marginBottom: '6px', fontFamily: 'var(--font-display)',
            }}>
              <Counter target={condition.erCost} prefix="$" />
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '20px', fontFamily: 'var(--font-inter)' }}>
              Average out-of-pocket (uninsured)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Wait time: <strong style={{ color: 'var(--text)' }}>{condition.erTime}</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)', lineHeight: 1.55, padding: '10px 12px', background: 'rgba(248,113,113,0.05)', borderRadius: '10px', borderLeft: '2px solid rgba(248,113,113,0.3)' }}>
                {condition.erNote}
              </div>
            </div>
          </div>
        </div>

        {/* Free clinic card */}
        <div style={{
          padding: '2px', borderRadius: '22px',
          background: 'linear-gradient(135deg, rgba(110,231,183,0.25), rgba(110,231,183,0.05))',
        }}>
          <div style={{
            background: 'rgba(8,13,26,0.98)', borderRadius: '20px',
            padding: '28px', height: '100%', position: 'relative',
          }}>
            {/* Best value badge */}
            <div style={{
              position: 'absolute', top: '-10px', right: '20px',
              background: 'linear-gradient(135deg, #6EE7B7, #4ade80)',
              color: '#07070F', fontSize: '10px', fontWeight: 700,
              padding: '4px 12px', borderRadius: '100px',
              fontFamily: 'var(--font-inter)', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Best choice
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(110,231,183,0.12)', border: '1px solid rgba(110,231,183,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#6EE7B7', textTransform: 'uppercase', fontFamily: 'var(--font-inter)' }}>Free Clinic / FQHC</span>
            </div>

            <div style={{
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800,
              color: '#6EE7B7', letterSpacing: '-0.04em', lineHeight: 1,
              marginBottom: '6px', fontFamily: 'var(--font-display)',
            }}>
              $0
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '20px', fontFamily: 'var(--font-inter)' }}>
              Sliding-scale · no insurance needed
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Wait time: <strong style={{ color: 'var(--text)' }}>{condition.freeTime}</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)', lineHeight: 1.55, padding: '10px 12px', background: 'rgba(110,231,183,0.05)', borderRadius: '10px', borderLeft: '2px solid rgba(110,231,183,0.3)' }}>
                {condition.freeNote}
              </div>
            </div>

            <button
              onClick={() => router.push('/search')}
              style={{
                marginTop: '20px', width: '100%',
                padding: '13px', borderRadius: '12px',
                background: 'var(--accent)', color: 'var(--bg)',
                border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(110,231,183,0.3)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(110,231,183,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(110,231,183,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
            >
              Find this near me →
            </button>
          </div>
        </div>
      </div>

      {/* Savings banner */}
      <div style={{
        padding: '24px 28px', borderRadius: '18px',
        background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)', marginBottom: '4px' }}>
              Your potential savings
            </div>
            <div style={{
              fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800,
              color: '#6EE7B7', letterSpacing: '-0.03em', fontFamily: 'var(--font-display)',
              lineHeight: 1,
            }}>
              <Counter target={savings} prefix="$" />
              <span style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>avoided</span>
            </div>
          </div>
          <div style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)',
            maxWidth: '320px', lineHeight: 1.55,
          }}>
            The same clinical outcome. A fraction of the wait. And $0 out of pocket — for the 30 million uninsured Americans who need it most.
          </div>
        </div>
        <SavingsBar savings={savings} maxSavings={maxSavings} />
      </div>

      <style>{`
        @media (max-width: 600px) {
          #cost-calc { padding: 60px 1.25rem !important; }
        }
      `}</style>
    </section>
  )
}
