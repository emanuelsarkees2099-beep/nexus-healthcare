'use client'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import {
  Heart, Star1, Book1, Lamp, Health, MedalStar, ArrowRight,
  ShieldTick, Lovely, Sun1, Drop, Grammerly, MessageQuestion,
} from 'iconsax-react'

// ── Reveal helper ────────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────
const HEALTH_HABITS = [
  {
    Icon: Sun1,
    color: '#FCD34D',
    title: 'Sleep 8–10 hours',
    body: 'Your brain and body grow while you sleep. Going to bed on time every night keeps you sharp, happy, and healthy.',
  },
  {
    Icon: Drop,
    color: '#60A5FA',
    title: 'Drink water, not soda',
    body: 'Water keeps every cell in your body working. Try to drink 6–8 glasses a day — more when you play sports or it\'s hot outside.',
  },
  {
    Icon: Heart,
    color: '#F87171',
    title: 'Move your body every day',
    body: 'Running, dancing, bike riding, swimming — whatever you love counts. Even 30 minutes a day makes your heart stronger.',
  },
  {
    Icon: Grammerly,
    color: '#A78BFA',
    title: 'Brush & wash up',
    body: 'Washing your hands and brushing your teeth twice a day stops germs from making you sick. Simple habits, big protection.',
  },
  {
    Icon: Lovely,
    color: '#34D399',
    title: 'Talk about your feelings',
    body: 'Mental health is real health. If something is bothering you, talk to a trusted adult — a parent, teacher, or school counselor.',
  },
  {
    Icon: Lamp,
    color: '#FB923C',
    title: 'Eat colorful foods',
    body: 'Fill your plate with fruits and vegetables of every color. Different colors = different vitamins your body needs to thrive.',
  },
]

const RIGHTS_SIMPLE = [
  {
    color: '#60A5FA',
    title: 'You can see a doctor even without insurance',
    body: 'Community health centers treat everyone, no matter what. If your family can\'t pay full price, they charge based on what your family earns — sometimes as little as $0.',
    link: '/search',
    linkLabel: 'Find a free clinic',
  },
  {
    color: '#34D399',
    title: 'Emergency rooms can\'t turn you away',
    body: 'A federal law called EMTALA means that if you have a real emergency, any hospital has to help you — even if you have no insurance and no money. This is your right.',
    link: '/rights',
    linkLabel: 'Learn about your rights',
  },
  {
    color: '#A78BFA',
    title: 'You can get vaccines and checkups for free',
    body: 'Most children qualify for free vaccines through a program called VFC. Regular checkups (well-child visits) are covered 100% under most plans. Ask your doctor.',
    link: '/programs',
    linkLabel: 'See programs for kids',
  },
]

const HOW_TO_TALK = [
  { step: '1', text: 'Write down your symptoms before you go in — when did they start, how bad do they feel (1–10)?' },
  { step: '2', text: 'Tell the doctor everything, even things that feel embarrassing. Doctors are not allowed to judge you.' },
  { step: '3', text: 'Ask questions! "What does that word mean?" and "Will this hurt?" are always okay to ask.' },
  { step: '4', text: 'If you don\'t understand, say "Can you explain that differently?" Doctors want you to understand.' },
]

export default function KidsPage() {
  return (
    <AppShell>
      <style>{`
        .kids-habits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .kids-rights-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .kids-talk-steps {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .kids-habits-grid { grid-template-columns: repeat(2, 1fr); }
          .kids-rights-grid  { grid-template-columns: 1fr; }
          .kids-talk-steps   { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .kids-habits-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(60px, 10vw, 100px) 24px clamp(48px, 8vw, 80px)',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background gradient blobs */}
        <div aria-hidden style={{
          position: 'absolute', top: '-60px', left: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', top: '20px', right: '8%',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <Reveal>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 16px', borderRadius: '100px',
            background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.18)',
            fontSize: '11px', fontWeight: 600, color: '#A78BFA',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '24px',
          }}>
            <MedalStar size={12} color="#A78BFA" variant="Bold" />
            For Kids & Families
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 900,
            lineHeight: 1.05, letterSpacing: '-0.03em',
            marginBottom: '20px', maxWidth: '700px', margin: '0 auto 20px',
          }}>
            Your health{' '}
            <em style={{ fontStyle: 'normal', color: '#A78BFA' }}>matters.</em>
            <br />Learn how to protect it.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.5)',
            maxWidth: '520px', lineHeight: 1.7, margin: '0 auto 40px',
          }}>
            A guide for kids and their families about staying healthy, knowing your rights,
            and getting care — no matter what.
          </p>
        </Reveal>

        <Reveal delay={220}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#habits" style={{
              padding: '13px 26px', borderRadius: '100px',
              background: '#A78BFA', color: '#07070F',
              fontSize: '14px', fontWeight: 700, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Start here
              <ArrowRight size={15} color="#07070F" />
            </a>
            <a href="#ebook" style={{
              padding: '13px 26px', borderRadius: '100px',
              background: 'rgba(167,139,250,0.1)', color: '#A78BFA',
              border: '1px solid rgba(167,139,250,0.25)',
              fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(167,139,250,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(167,139,250,0.1)')}
            >
              <Book1 size={14} color="#A78BFA" />
              Free reading guide
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── HEALTH HABITS ────────────────────────────────────────────────── */}
      <section id="habits" style={{ padding: 'clamp(60px, 8vw, 100px) 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '4px 14px', borderRadius: '100px',
                background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.18)',
                fontSize: '11px', fontWeight: 600, color: '#FCD34D',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px',
              }}>
                <Star1 size={11} color="#FCD34D" variant="Bold" /> Daily habits
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '12px' }}>
                Six things healthy kids do every day
              </h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                You don&apos;t need to do them all perfectly. Small habits, done consistently, add up to big health.
              </p>
            </div>
          </Reveal>

          <div className="kids-habits-grid">
            {HEALTH_HABITS.map(({ Icon, color, title, body }, i) => (
              <Reveal key={title} delay={i * 60}>
                <div style={{
                  padding: '24px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${color}18`,
                  height: '100%',
                  transition: 'border-color 0.3s, background 0.3s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${color}06`
                    ;(e.currentTarget as HTMLElement).style.borderColor = `${color}30`
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = `${color}18`
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: `${color}12`, border: `1px solid ${color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <Icon size={22} color={color} variant="Bold" />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'rgba(255,255,255,0.9)' }}>
                    {title}
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EBOOK FEATURE ────────────────────────────────────────────────── */}
      <section id="ebook" style={{ padding: 'clamp(60px, 8vw, 100px) 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'clamp(140px, 20vw, 200px) 1fr',
              gap: 'clamp(24px, 4vw, 56px)',
              alignItems: 'center',
              padding: '2px', borderRadius: '28px',
              background: 'linear-gradient(135deg, rgba(167,139,250,0.25) 0%, rgba(52,211,153,0.1) 100%)',
            }}>
              <div style={{
                background: 'rgba(8,13,26,0.97)', borderRadius: '26px',
                padding: 'clamp(24px, 4vw, 48px)',
                display: 'grid',
                gridTemplateColumns: 'clamp(140px, 20vw, 200px) 1fr',
                gap: 'clamp(24px, 4vw, 56px)',
                alignItems: 'center',
                gridColumn: '1 / -1',
              }}>
                {/* Book cover art */}
                <div style={{
                  aspectRatio: '2/3',
                  borderRadius: '12px',
                  background: 'linear-gradient(160deg, #1a1040 0%, #0f0728 100%)',
                  border: '1px solid rgba(167,139,250,0.3)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '20px', textAlign: 'center',
                  boxShadow: '0 20px 60px rgba(167,139,250,0.15), 0 4px 16px rgba(0,0,0,0.4)',
                  position: 'relative', overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  {/* Spine light */}
                  <div aria-hidden style={{
                    position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
                    background: 'linear-gradient(180deg, rgba(167,139,250,0.6) 0%, rgba(52,211,153,0.3) 100%)',
                    borderRadius: '12px 0 0 12px',
                  }} />
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '14px',
                  }}>
                    <Health size={26} color="#A78BFA" variant="Bold" />
                  </div>
                  <div style={{
                    fontSize: '11px', fontWeight: 800, color: '#A78BFA',
                    letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px',
                    lineHeight: 1.3,
                  }}>
                    My Health<br />Guide
                  </div>
                  <div style={{
                    width: '32px', height: '1px',
                    background: 'rgba(167,139,250,0.3)', marginBottom: '8px',
                  }} />
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                    FREE
                  </div>
                </div>

                {/* Text side */}
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 12px', borderRadius: '100px',
                    background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
                    fontSize: '11px', fontWeight: 600, color: '#34D399',
                    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px',
                  }}>
                    <Book1 size={11} color="#34D399" variant="Bold" />
                    Free Resource
                  </div>

                  <h2 style={{
                    fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 800,
                    lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '14px',
                  }}>
                    A health guide written{' '}
                    <em style={{ fontStyle: 'normal', color: '#A78BFA' }}>for kids,</em>
                    {' '}by someone who cares
                  </h2>

                  <p style={{
                    fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75,
                    marginBottom: '20px', maxWidth: '540px',
                  }}>
                    This free guide helps kids and parents understand how healthcare works in the US,
                    what to do when you feel sick, and how to ask for help — explained simply,
                    with real examples that make sense at any age.
                  </p>

                  <ul style={{
                    listStyle: 'none', padding: 0, margin: '0 0 28px',
                    display: 'flex', flexDirection: 'column', gap: '10px',
                  }}>
                    {[
                      'How to talk to your doctor',
                      'What to do in a health emergency',
                      'Understanding health insurance basics',
                      'Healthy habits that actually work',
                    ].map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldTick size={14} color="#34D399" variant="Bold" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)' }}>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {/* ── UPDATE THIS HREF to your ebook link ── */}
                    <a
                      href="#"
                      style={{
                        padding: '12px 24px', borderRadius: '100px',
                        background: '#A78BFA', color: '#07070F',
                        fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <Book1 size={14} color="#07070F" />
                      Read it free
                    </a>
                    <span style={{
                      padding: '12px 16px', fontSize: '12px',
                      color: 'rgba(255,255,255,0.3)', alignSelf: 'center',
                      fontStyle: 'italic',
                    }}>
                      No signup required
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── YOUR RIGHTS (SIMPLIFIED) ─────────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '4px 14px', borderRadius: '100px',
                background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.18)',
                fontSize: '11px', fontWeight: 600, color: '#60A5FA',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px',
              }}>
                <ShieldTick size={11} color="#60A5FA" variant="Bold" /> Know your rights
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '12px' }}>
                Healthcare rights every family should know
              </h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                These are actual laws that protect you and your family — in plain words, not legalese.
              </p>
            </div>
          </Reveal>

          <div className="kids-rights-grid">
            {RIGHTS_SIMPLE.map(({ color, title, body, link, linkLabel }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div style={{
                  padding: '28px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${color}18`,
                  display: 'flex', flexDirection: 'column', height: '100%',
                }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: color, marginBottom: '20px',
                    boxShadow: `0 0 10px ${color}66`,
                  }} />
                  <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.3, color: 'rgba(255,255,255,0.9)' }}>
                    {title}
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: '0 0 20px', flex: 1 }}>
                    {body}
                  </p>
                  <Link href={link} style={{
                    fontSize: '13px', fontWeight: 600, color,
                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                    marginTop: 'auto',
                  }}>
                    {linkLabel}
                    <ArrowRight size={13} color={color} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO TALK TO YOUR DOCTOR ───────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '4px 14px', borderRadius: '100px',
                background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)',
                fontSize: '11px', fontWeight: 600, color: '#34D399',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px',
              }}>
                <MessageQuestion size={11} color="#34D399" variant="Bold" /> At the doctor
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '12px' }}>
                How to talk to your doctor
              </h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', maxWidth: '460px', margin: '0 auto', lineHeight: 1.7 }}>
                Doctors are here to help you. These four steps make every visit easier.
              </p>
            </div>
          </Reveal>

          <div className="kids-talk-steps">
            {HOW_TO_TALK.map(({ step, text }, i) => (
              <Reveal key={step} delay={i * 70}>
                <div style={{
                  display: 'flex', gap: '16px', alignItems: 'flex-start',
                  padding: '22px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(52,211,153,0.12)',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 800, color: '#34D399', flexShrink: 0,
                  }}>
                    {step}
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
                    {text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR PARENTS CALLOUT ──────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Reveal>
            <div style={{
              padding: '2px', borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(74,144,217,0.3) 0%, rgba(167,139,250,0.15) 100%)',
            }}>
              <div style={{
                padding: 'clamp(28px, 4vw, 48px)',
                borderRadius: '22px', textAlign: 'center',
                background: 'rgba(8,13,26,0.97)',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <Heart size={24} color="var(--accent)" variant="Bold" />
                </div>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '14px' }}>
                  For parents & caregivers
                </h2>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: '28px', maxWidth: '540px', margin: '0 auto 28px' }}>
                  NEXUS connects uninsured and underinsured families to free clinics, benefits programs, and telehealth
                  — completely free, with no sign-up required to start searching.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/search" style={{
                    padding: '12px 22px', borderRadius: '100px',
                    background: 'var(--accent)', color: '#07070F',
                    fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    transition: 'opacity 0.2s',
                  }}>
                    Find free clinics near you
                    <ArrowRight size={13} color="#07070F" />
                  </Link>
                  <Link href="/eligibility" style={{
                    padding: '12px 22px', borderRadius: '100px',
                    background: 'rgba(74,144,217,0.1)', color: 'var(--accent)',
                    border: '1px solid rgba(74,144,217,0.22)',
                    fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    transition: 'background 0.2s',
                  }}>
                    Check benefit eligibility
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  )
}
