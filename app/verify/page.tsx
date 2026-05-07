'use client'
import React, { useState } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { CheckCircle, Clock, Globe, DollarSign, Users, MapPin, Star, ChevronRight, ArrowRight, Plus, Shield } from 'lucide-react'

type VerifyField = {
  id: string
  question: string
  type: 'yes-no' | 'text' | 'number' | 'select'
  options?: string[]
  placeholder?: string
  points: number
}

const FIELDS: VerifyField[] = [
  {
    id: 'open',
    question: 'Was the clinic open when you arrived?',
    type: 'yes-no',
    points: 10,
  },
  {
    id: 'wait_time',
    question: 'How long did you wait? (minutes)',
    type: 'number',
    placeholder: 'e.g. 22',
    points: 15,
  },
  {
    id: 'accepted_uninsured',
    question: 'Were you accepted as an uninsured patient?',
    type: 'yes-no',
    points: 20,
  },
  {
    id: 'cost',
    question: 'What did your visit cost? (enter 0 if free)',
    type: 'number',
    placeholder: 'e.g. 25',
    points: 20,
  },
  {
    id: 'languages',
    question: 'What language(s) were available?',
    type: 'text',
    placeholder: 'e.g. Spanish, English, Somali',
    points: 10,
  },
  {
    id: 'rating',
    question: 'Overall experience (1–5)',
    type: 'select',
    options: ['5 — Excellent', '4 — Good', '3 — Okay', '2 — Poor', '1 — Very poor'],
    points: 15,
  },
  {
    id: 'notes',
    question: 'Any notes to help future patients? (optional)',
    type: 'text',
    placeholder: 'Parking, accessibility, what to bring, etc.',
    points: 10,
  },
]

const SUBMIT_FLOW = [
  { label: 'Saving to NEXUS database…', delay: 0 },
  { label: 'Updating clinic wait time…', delay: 700 },
  { label: 'Notifying 47 people who saved this clinic…', delay: 1400 },
  { label: 'Updating community trust score…', delay: 2100 },
  { label: 'Verification complete!', delay: 2800 },
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
            color: s <= (hover || value) ? '#fbbf24' : 'rgba(255,255,255,0.2)',
            transition: 'color 0.15s',
          }}
        >
          <Star size={24} fill={s <= (hover || value) ? '#fbbf24' : 'transparent'} />
        </button>
      ))}
    </div>
  )
}

export default function VerifyPage() {
  const [step, setStep] = useState<'intro' | 'form' | 'submitting' | 'done'>('intro')
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [submitStep, setSubmitStep] = useState(-1)
  const [points] = useState(100)

  const totalPoints = FIELDS.filter(f => answers[f.id] !== undefined && answers[f.id] !== '').reduce((a, f) => a + f.points, 0)

  const handleSubmit = () => {
    setStep('submitting')
    SUBMIT_FLOW.forEach((s, i) => {
      setTimeout(() => {
        setSubmitStep(i)
        if (i === SUBMIT_FLOW.length - 1) {
          setTimeout(() => setStep('done'), 800)
        }
      }, s.delay)
    })
  }

  if (step === 'done') {
    return (
      <AppShell>
        <div style={{
          minHeight: '80dvh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '80px 24px',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🌟</div>
          <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>
            Verification submitted!
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', maxWidth: '400px', lineHeight: 1.7, marginBottom: '16px' }}>
            You earned <strong style={{ color: '#fbbf24' }}>{totalPoints} karma points</strong> for helping future patients. Your update will go live within 1 hour after CHW review.
          </p>
          <div style={{
            padding: '16px 24px', borderRadius: '14px', marginBottom: '32px',
            background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
            fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '420px',
          }}>
            47 people who saved this clinic were notified of your update. Real lives, real impact.
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/search" style={{
              padding: '11px 24px', borderRadius: '100px',
              background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.3)',
              color: 'var(--accent)', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
            }}>
              Back to search
            </Link>
            <Link href="/community" style={{
              padding: '11px 24px', borderRadius: '100px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', fontSize: '14px', textDecoration: 'none',
            }}>
              Join community network
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }

  if (step === 'submitting') {
    return (
      <AppShell>
        <div style={{
          minHeight: '80dvh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px 24px',
        }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '28px', textAlign: 'center' }}>Saving your verification…</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SUBMIT_FLOW.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '12px', alignItems: 'center',
                  opacity: i <= submitStep ? 1 : 0.25,
                  transition: 'opacity 0.4s',
                }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                    background: i < submitStep ? 'rgba(74,222,128,0.2)' : i === submitStep ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${i < submitStep ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i < submitStep ? <CheckCircle size={12} color="#4ade80" /> : <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />}
                  </div>
                  <span style={{ fontSize: '14px', color: i <= submitStep ? '#f5f5f5' : 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono, monospace)', transition: 'color 0.4s' }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      {/* Header */}
      <section style={{ padding: 'clamp(80px,10vw,120px) 24px 0', textAlign: 'center', position: 'relative' }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(74,222,128,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
          marginBottom: '24px', fontSize: '11px', fontWeight: 600,
          color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <Shield size={11} /> Verify a Clinic
        </div>
        <h1 style={{
          fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 800,
          letterSpacing: '-0.035em', lineHeight: 1.05, marginBottom: '16px',
          maxWidth: '600px', margin: '0 auto 16px',
        }}>
          You just used a clinic.<br />
          <span style={{ color: '#4ade80' }}>Help the next person.</span>
        </h1>
        <p style={{
          fontSize: '15px', color: 'rgba(255,255,255,0.45)',
          maxWidth: '440px', lineHeight: 1.7, margin: '0 auto 16px',
        }}>
          30 seconds of your time updates wait times, prices, and availability for thousands of uninsured patients. Your report is the most valuable data on NEXUS.
        </p>
      </section>

      {step === 'intro' && (
        <section style={{ padding: '40px 24px 120px', maxWidth: '680px', margin: '0 auto' }}>
          {/* Impact preview */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '32px',
          }}>
            {[
              { icon: <Clock size={18} color="#818cf8" />, label: '~30 sec', desc: 'Time it takes' },
              { icon: <Users size={18} color="#fbbf24" />, label: '47 people', desc: 'Will see your update' },
              { icon: <Star size={18} color="#4ade80" />, label: `+${totalPoints || 100} karma`, desc: 'You earn for helping' },
            ].map(item => (
              <div key={item.label} style={{
                padding: '16px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                textAlign: 'center',
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>{item.icon}</div>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('form')}
            style={{
              width: '100%', padding: '15px', borderRadius: '14px',
              background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
              color: '#4ade80', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(74,222,128,0.18)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(74,222,128,0.1)'}
          >
            <CheckCircle size={18} /> Start verification (30 sec)
          </button>

          <div style={{
            marginTop: '24px', padding: '16px 20px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}>
            <Plus size={14} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Clinic not in our database?</strong>{' '}
              <Link href="/add-clinic" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Add a new clinic →
              </Link>
              {' '}Any user can submit a clinic. Our CHW network verifies within 24 hours.
            </div>
          </div>
        </section>
      )}

      {step === 'form' && (
        <section style={{ padding: '32px 24px 120px', maxWidth: '680px', margin: '0 auto' }}>
          {/* Progress */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '28px',
          }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              {Object.keys(answers).length} of {FIELDS.length} answered
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={13} color="#fbbf24" />
              <span style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600 }}>
                +{totalPoints} karma earned
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            {FIELDS.map(field => (
              <div key={field.id}>
                <label style={{
                  display: 'block', fontSize: '14px', fontWeight: 600,
                  marginBottom: '10px', color: '#eef4f5',
                }}>
                  {field.question}
                  <span style={{ marginLeft: '8px', fontSize: '11px', color: '#fbbf24', fontWeight: 400 }}>
                    +{field.points} pts
                  </span>
                </label>

                {field.type === 'yes-no' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Yes', 'No'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAnswers(prev => ({ ...prev, [field.id]: opt.toLowerCase() }))}
                        style={{
                          padding: '9px 22px', borderRadius: '100px',
                          background: answers[field.id] === opt.toLowerCase() ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${answers[field.id] === opt.toLowerCase() ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.1)'}`,
                          color: answers[field.id] === opt.toLowerCase() ? '#4ade80' : 'rgba(255,255,255,0.6)',
                          fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.18s',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {(field.type === 'text' || field.type === 'number') && (
                  <input
                    type={field.type}
                    value={(answers[field.id] as string) || ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#f5f5f5', fontSize: '14px', fontFamily: 'inherit',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(110,231,183,0.4)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                )}

                {field.type === 'select' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        onClick={() => setAnswers(prev => ({ ...prev, [field.id]: s.toString() }))}
                        style={{
                          width: '44px', height: '44px', borderRadius: '12px',
                          background: answers[field.id] === s.toString() ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${answers[field.id] === s.toString() ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)'}`,
                          color: answers[field.id] === s.toString() ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                          fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                          transition: 'all 0.18s',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginLeft: '4px' }}>
                      1 = Poor · 5 = Excellent
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < 3}
            style={{
              width: '100%', padding: '15px', borderRadius: '14px',
              background: Object.keys(answers).length >= 3 ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${Object.keys(answers).length >= 3 ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.08)'}`,
              color: Object.keys(answers).length >= 3 ? '#4ade80' : 'rgba(255,255,255,0.25)',
              fontSize: '15px', fontWeight: 700, cursor: Object.keys(answers).length >= 3 ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'all 0.2s',
            }}
          >
            <CheckCircle size={18} />
            Submit verification (+{totalPoints} karma)
          </button>

          {Object.keys(answers).length < 3 && (
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>
              Answer at least 3 questions to submit
            </p>
          )}
        </section>
      )}
    </AppShell>
  )
}
