'use client'
import React, { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { Routing, TickCircle, RecordCircle, Clock, ReceiptText, Profile2User, Call, ArrowRight2, DocumentDownload, ExportSquare, InfoCircle, Location, Printer, MedalStar, Warning2 } from 'iconsax-react'

type StepStatus = 'pending' | 'active' | 'complete' | 'stuck'

type GPSStep = {
  id: number
  title: string
  time: string
  icon: React.ReactNode
  description: string
  substeps?: string[]
  script?: { prompt: string; responses?: { says: string; you: string }[] }
  docs?: string[]
  tip?: string
  generate?: string
}

const STEPS: GPSStep[] = [
  {
    id: 1,
    title: 'Confirm walk-in availability',
    time: '~4 min',
    icon: <Call size={16} />,
    description: 'Call Mountain Park Health Center before you go to confirm they can see you today.',
    substeps: [
      'Call (602) 243-7011',
      'Ask: "Do you have walk-in appointments available today?"',
      'If yes, ask: "What is the estimated wait time?"',
      'If no, ask: "What is the earliest available appointment?"',
    ],
    script: {
      prompt: 'When they answer, say:',
      responses: [
        {
          says: '"We\'re fully booked today"',
          you: '"Is there a walk-in window, or can I get a next-day appointment? I\'m uninsured but able to pay on a sliding scale."',
        },
        {
          says: '"Do you have insurance?"',
          you: '"I\'m uninsured. I\'ve been told you offer sliding-scale fees — is that right?"',
        },
        {
          says: '"We don\'t see uninsured patients"',
          you: '"As an FQHC, I believe you\'re required to see patients regardless of insurance status or ability to pay. Can I speak with your billing department?"',
        },
      ],
    },
    tip: 'Mountain Park is an FQHC (Federally Qualified Health Center). By federal law, they cannot turn you away based on inability to pay.',
  },
  {
    id: 2,
    title: 'Gather your documents',
    time: '~10 min',
    icon: <ReceiptText size={16} />,
    description: 'Bring these to your appointment. Missing items can slow you down but rarely stop you from being seen.',
    docs: [
      'Photo ID (driver\'s license, passport, or any government ID)',
      'Proof of address (utility bill, lease, or any mail with your name and address)',
      'Pay stub OR self-attestation form (we can generate one for you)',
      'List of current medications (or the bottles themselves)',
    ],
    generate: 'sliding-scale-attestation',
    tip: 'If you don\'t have proof of address, a written statement from a person you live with can work. Ask at check-in.',
  },
  {
    id: 3,
    title: 'Travel to the clinic',
    time: '~12 min',
    icon: <Routing size={16} />,
    description: 'Mountain Park Health Center — 1 E Dunlap Ave, Phoenix, AZ 85020',
    substeps: [
      'By car: Take I-17 N to Exit 207B (Dunlap Ave). Turn right on Dunlap. Clinic is on the left.',
      'By bus: Route 8 (Dunlap) stops directly in front.',
      'Parking: Free parking lot on the east side of the building.',
      'Accessibility entrance: On the north side of the building, near the parking lot.',
    ],
    tip: 'Arrive 15 minutes early to complete intake forms.',
  },
  {
    id: 4,
    title: 'Check in at the front desk',
    time: '~15 min',
    icon: <Profile2User size={16} />,
    description: 'What to say and expect when you arrive at check-in.',
    substeps: [
      'Tell the receptionist: "I\'m here for a walk-in appointment. I called ahead."',
      'You\'ll be asked to fill out an intake form (bring your ID and medications list)',
      'When asked about insurance, say: "I\'m uninsured. I\'d like to apply for the sliding-scale fee program."',
      'You may wait 20–60 minutes to be called. You can ask for an estimated wait time.',
    ],
    script: {
      prompt: 'If they ask about payment:',
      responses: [
        {
          says: '"The visit will be $120"',
          you: '"I was told you offer sliding-scale fees for uninsured patients. Can I speak with your financial counselor before the visit?"',
        },
      ],
    },
    tip: 'Federal law requires FQHCs to offer a sliding scale based on income. Your fee could be as low as $0.',
  },
  {
    id: 5,
    title: 'At your appointment',
    time: '~25 min',
    icon: <TickCircle size={16} />,
    description: 'How to make the most of your visit and advocate for yourself.',
    substeps: [
      'Describe your symptoms clearly: when they started, how severe (1-10), what makes it better or worse',
      'Mention any medications you\'ve taken or home remedies tried',
      'Ask for a written copy of your diagnosis and treatment plan before leaving',
      'Ask: "Is there anything I should watch for that would mean I need to go to the ER?"',
      'Ask about generic prescription options if medications are prescribed',
    ],
    tip: 'You can ask for a medical interpreter at any time. FQHCs are required to provide language access services.',
  },
  {
    id: 6,
    title: 'Handle billing after your visit',
    time: '~5 min',
    icon: <ReceiptText size={16} />,
    description: 'Don\'t leave without understanding what you owe and how to pay.',
    substeps: [
      'Ask to speak with the financial counselor or billing department',
      'Request the sliding-scale fee application if not already completed',
      'Ask: "Do you have a payment plan?" (most FQHCs do)',
      'Ask for an itemized bill (not a summary)',
      'Ask about assistance programs for prescriptions (HRSA 340B discount)',
    ],
    tip: 'If you receive a bill that seems wrong, you can dispute it. Ask for the patient advocate.',
  },
  {
    id: 7,
    title: 'Follow up and next steps',
    time: '~3 min',
    icon: <TickCircle size={16} />,
    description: 'After your visit, take these steps to protect your health and stay connected.',
    substeps: [
      'Schedule any follow-up appointments before you leave',
      'Fill prescriptions at the clinic pharmacy (usually discounted) or at Walmart ($4 generic list)',
      'Save Mountain Park\'s number in your phone',
      'Complete any lab work ordered while you\'re still in the building',
    ],
    tip: 'If you were referred to a specialist, call NEXUS CHW line at 1-800-NEXUS-1 to help you navigate the referral.',
  },
]

function StepCard({
  step,
  status,
  onComplete,
  onStuck,
  isLast,
}: {
  step: GPSStep
  status: StepStatus
  onComplete: () => void
  onStuck: () => void
  isLast: boolean
}) {
  const [expanded, setExpanded] = useState(status === 'active')
  const [showScript, setShowScript] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    if (status === 'active') setExpanded(true)
  }, [status])

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setGenerated(true) }, 1800)
  }

  return (
    <div style={{
      borderRadius: '20px', overflow: 'hidden',
      border: `1px solid ${
        status === 'complete' ? 'rgba(96,165,250,0.25)'
        : status === 'active' ? 'rgba(74,144,217,0.35)'
        : status === 'stuck' ? 'rgba(251,191,36,0.3)'
        : 'rgba(255,255,255,0.07)'
      }`,
      background: status === 'active' ? 'rgba(74,144,217,0.03)' : 'rgba(255,255,255,0.01)',
      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      opacity: status === 'pending' ? 0.5 : 1,
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '16px',
          padding: '18px 22px', background: 'none', border: 'none',
          cursor: status !== 'pending' ? 'pointer' : 'default',
          fontFamily: 'inherit', color: 'inherit', textAlign: 'left',
        }}
      >
        {/* Status indicator */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: status === 'complete' ? 'rgba(96,165,250,0.15)'
            : status === 'active' ? 'rgba(74,144,217,0.12)'
            : status === 'stuck' ? 'rgba(251,191,36,0.12)'
            : 'rgba(255,255,255,0.04)',
          border: `1px solid ${status === 'complete' ? 'rgba(96,165,250,0.35)' : status === 'active' ? 'rgba(74,144,217,0.3)' : 'rgba(255,255,255,0.08)'}`,
          color: status === 'complete' ? '#60a5fa' : status === 'active' ? 'var(--accent)' : 'rgba(255,255,255,0.35)',
        }}>
          {status === 'complete' ? <TickCircle size={15} /> : status === 'pending' ? <RecordCircle size={15} /> : step.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
            }}>
              Step {step.id}
            </span>
            {status === 'complete' && (
              <span style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}><TickCircle size={9} variant="Bold" aria-hidden="true" /> Done</span>
            )}
            {status === 'stuck' && (
              <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Warning2 size={9} variant="Bold" aria-hidden="true" /> Need help</span>
            )}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#f5f5f5', marginTop: '2px' }}>
            {step.title}
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', color: 'rgba(255,255,255,0.3)', flexShrink: 0,
        }}>
          <Clock size={11} /> {step.time}
        </div>
      </button>

      {/* Expanded body */}
      <div style={{
        maxHeight: expanded && status !== 'pending' ? '1200px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.45s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ padding: '0 22px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0 }}>
            {step.description}
          </p>

          {step.substeps && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {step.substeps.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                    marginTop: '1px',
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {step.docs && (
            <div style={{
              padding: '14px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Documents to bring
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {step.docs.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>□</span> {d}
                  </div>
                ))}
              </div>
              {step.generate && (
                <button
                  onClick={handleGenerate}
                  style={{
                    marginTop: '12px', padding: '8px 16px', borderRadius: '8px',
                    background: generated ? 'rgba(96,165,250,0.1)' : 'rgba(74,144,217,0.08)',
                    border: `1px solid ${generated ? 'rgba(96,165,250,0.3)' : 'rgba(74,144,217,0.2)'}`,
                    color: generated ? '#60a5fa' : 'var(--accent)',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.2s',
                  }}
                >
                  {generating ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Generating…</> : generated ? <><TickCircle size={12} /> Self-attestation form ready — Download PDF</> : <><DocumentDownload size={12} /> Generate self-attestation form (if no pay stub)</>}
                </button>
              )}
            </div>
          )}

          {step.script && (
            <div>
              <button
                onClick={() => setShowScript(!showScript)}
                style={{
                  background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.2)',
                  borderRadius: '8px', padding: '8px 14px',
                  color: '#818cf8', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <Call size={12} /> {showScript ? 'Hide' : 'Show'} phone script &amp; responses
              </button>
              {showScript && (
                <div style={{
                  marginTop: '10px', padding: '14px', borderRadius: '12px',
                  background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.15)',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>
                    {step.script.prompt}
                  </div>
                  {step.script.responses?.map((r, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginBottom: '4px' }}>
                        They say: {r.says}
                      </div>
                      <div style={{
                        padding: '10px 14px', borderRadius: '8px',
                        background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
                        fontSize: '13px', color: '#c7d2fe', lineHeight: 1.55,
                      }}>
                        You: {r.you}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step.tip && (
            <div style={{
              display: 'flex', gap: '10px', padding: '12px 14px',
              borderRadius: '10px', background: 'rgba(251,191,36,0.05)',
              border: '1px solid rgba(251,191,36,0.18)',
              fontSize: '12px', color: 'rgba(255,214,91,0.8)', lineHeight: 1.6,
            }}>
              <InfoCircle size={13} color="#fbbf24" style={{ flexShrink: 0, marginTop: '1px' }} />
              {step.tip}
            </div>
          )}

          {/* Action buttons */}
          {status === 'active' && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
              <button
                onClick={onComplete}
                style={{
                  padding: '10px 20px', borderRadius: '100px',
                  background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)',
                  color: '#60a5fa', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(96,165,250,0.2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(96,165,250,0.12)'}
              >
                <TickCircle size={13} />
                {isLast ? 'Complete journey' : 'Mark complete'}
              </button>
              <button
                onClick={onStuck}
                style={{
                  padding: '10px 20px', borderRadius: '100px',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.4)', fontSize: '13px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(251,191,36,0.3)'; (e.currentTarget as HTMLElement).style.color = '#fbbf24' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)' }}
              >
                I got stuck
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GPSPage() {
  const [statuses, setStatuses] = useState<StepStatus[]>(
    STEPS.map((_, i) => (i === 0 ? 'active' : 'pending'))
  )
  const [completed, setCompleted] = useState(false)

  const activeIndex = statuses.findIndex(s => s === 'active')
  const completedCount = statuses.filter(s => s === 'complete').length
  const progress = (completedCount / STEPS.length) * 100

  const handleComplete = (idx: number) => {
    if (idx === STEPS.length - 1) {
      setStatuses(prev => prev.map((s, i) => (i === idx ? 'complete' : s)))
      setCompleted(true)
      return
    }
    setStatuses(prev =>
      prev.map((s, i) =>
        i === idx ? 'complete' : i === idx + 1 ? 'active' : s
      )
    )
    setTimeout(() => {
      document.getElementById(`step-${idx + 2}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 200)
  }

  const handleStuck = (idx: number) => {
    setStatuses(prev => prev.map((s, i) => (i === idx ? 'stuck' : s)))
  }

  if (completed) {
    return (
      <AppShell>
        <div style={{
          minHeight: '80dvh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '80px 24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <MedalStar size={72} color="var(--accent)" variant="TwoTone" aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            You did it.
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '400px', lineHeight: 1.7, marginBottom: '40px' }}>
            You navigated the entire process. This journey is hard. You showed up for your health — that matters.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/outcomes" style={{
              padding: '12px 24px', borderRadius: '100px',
              background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.3)',
              color: 'var(--accent)', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
            }}>
              Share your experience
            </Link>
            <Link href="/" style={{
              padding: '12px 24px', borderRadius: '100px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', fontSize: '14px', textDecoration: 'none',
            }}>
              Back to home
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <section style={{ padding: 'clamp(80px,10vw,120px) 24px 0', textAlign: 'center', position: 'relative' }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(74,144,217,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)',
          marginBottom: '24px', fontSize: '11px', fontWeight: 600,
          color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <Routing size={11} /> Healthcare GPS
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800,
          letterSpacing: '-0.035em', lineHeight: 1.05, marginBottom: '16px',
          maxWidth: '620px', margin: '0 auto 16px',
        }}>
          Turn-by-turn navigation<br />
          <span style={{ color: 'var(--accent)' }}>through getting care.</span>
        </h1>
        <p style={{
          fontSize: '15px', color: 'rgba(255,255,255,0.45)',
          maxWidth: '440px', lineHeight: 1.7, margin: '0 auto 40px',
        }}>
          Every step explained. Phone scripts included. Documents generated. Real people on standby if you get stuck.
        </p>
      </section>

      {/* Progress */}
      <section style={{ padding: '0 24px 40px', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{
          padding: '20px 24px', borderRadius: '16px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Location size={15} color="var(--accent)" />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Mountain Park Health Center</span>
            </div>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
              {completedCount} of {STEPS.length} steps
            </span>
          </div>
          <div style={{ height: '4px', borderRadius: '100px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '100px',
              background: 'linear-gradient(90deg, rgba(74,144,217,0.8), var(--accent))',
              width: `${progress}%`, transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
            }} />
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <button
              style={{
                padding: '6px 12px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <ExportSquare size={11} /> Share with caregiver
            </button>
            <button
              style={{
                padding: '6px 12px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <Printer size={11} /> Print checklist
            </button>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: '0 24px 120px', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {STEPS.map((step, i) => (
            <div id={`step-${step.id}`} key={step.id}>
              <StepCard
                step={step}
                status={statuses[i]}
                onComplete={() => handleComplete(i)}
                onStuck={() => handleStuck(i)}
                isLast={i === STEPS.length - 1}
              />
            </div>
          ))}
        </div>

        {/* CHW help banner */}
        {statuses.some(s => s === 'stuck') && (
          <div style={{
            marginTop: '24px', padding: '20px 24px', borderRadius: '16px',
            background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)',
            display: 'flex', gap: '16px', alignItems: 'center',
          }}>
            <InfoCircle size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                Looks like you hit a snag
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                A Community Health Worker can help you through this step — free, in your language, within minutes.
              </div>
            </div>
            <Link href="/chw" style={{
              padding: '9px 16px', borderRadius: '100px', flexShrink: 0,
              background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
              color: '#fbbf24', fontSize: '12px', fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              Get CHW help <ArrowRight2 size={12} />
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  )
}
