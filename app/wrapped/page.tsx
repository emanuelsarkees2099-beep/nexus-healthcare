'use client'
import React, { useState, useEffect, useRef } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { MagicStar, TrendUp, Location, Heart, Profile2User, Shield, DocumentDownload, ExportSquare, ArrowRight2, Star1, Award, Hospital } from 'iconsax-react'

function useCounter(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const raf = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setValue(Math.round(ease * target))
      if (p < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [target, duration, active])
  return value
}

const WRAPPED_DATA = {
  name: 'Maria',
  year: 2025,
  clinicsFound: 4,
  friendsHelped: 12,
  savedAmount: 4200,
  screenings: 8,
  topClinic: 'Mountain Park Health Center',
  topMonth: 'March',
  streak: 3,
  percentile: 5,
  totalUsers: 284000,
  totalSaved: 127341205,
  badges: [
    { Icon: Hospital, label: 'Clinic Navigator',     desc: 'Found 4+ clinics this year' },
    { Icon: Heart,    label: 'Community Hero',        desc: 'Helped 12+ friends find care' },
    { Icon: Shield,   label: 'Prevention Champion',   desc: 'Completed 8 preventive screenings' },
  ],
}

type Card = {
  id: string
  bg: string
  accent: string
  content: React.ReactNode
}

function WrappedCard({ card, active, idx }: { card: Card; active: boolean; idx: number }) {
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    if (active) setTimeout(() => setRevealed(true), idx * 200)
    else setRevealed(false)
  }, [active, idx])

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: card.bg,
      borderRadius: '28px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 32px', textAlign: 'center',
      opacity: active ? 1 : 0,
      transform: active ? 'translateX(0) scale(1)' : 'translateX(40px) scale(0.97)',
      transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      pointerEvents: active ? 'auto' : 'none',
    }}>
      <div style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        width: '100%',
      }}>
        {card.content}
      </div>
    </div>
  )
}

export default function WrappedPage() {
  const [started,   setStarted]   = useState(false)
  const [cardIdx,   setCardIdx]   = useState(0)
  const [counting,  setCounting]  = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const handleShare = async () => {
    const text = `I helped ${WRAPPED_DATA.friendsHelped} people find free healthcare in ${WRAPPED_DATA.year} and saved $${WRAPPED_DATA.savedAmount.toLocaleString()} using NEXUS. Free healthcare finder — nexus.health`
    if (navigator.share) {
      try { await navigator.share({ title: `My ${WRAPPED_DATA.year} NEXUS Wrapped`, text, url: 'https://nexus.health/wrapped' }) } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(text + ' — nexus.health/wrapped')
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2200)
      } catch { /* ignore */ }
    }
  }

  const savings = useCounter(WRAPPED_DATA.savedAmount, 2000, counting)
  const total = useCounter(WRAPPED_DATA.totalSaved, 2500, counting)

  useEffect(() => {
    if (cardIdx === 2) setTimeout(() => setCounting(true), 400)
  }, [cardIdx])

  const cards: Card[] = [
    {
      id: 'intro',
      bg: 'linear-gradient(135deg, #0d1117 0%, #1a0a2e 100%)',
      accent: '#818cf8',
      content: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <MagicStar size={64} color="#818cf8" variant="TwoTone" aria-hidden="true" />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#818cf8', marginBottom: '16px' }}>
            Your {WRAPPED_DATA.year} in Care
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '12px' }}>
            {WRAPPED_DATA.name}, here&apos;s<br />your year.
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '280px', margin: '0 auto' }}>
            A lot happened. You showed up for your health — and for others. Let&apos;s look back.
          </p>
        </div>
      ),
    },
    {
      id: 'clinics',
      bg: 'linear-gradient(135deg, #0d1117 0%, #0a1a0f 100%)',
      accent: '#60a5fa',
      content: (
        <div>
          <Location size={40} color="#60a5fa" style={{ marginBottom: '20px' }} />
          <div style={{ fontSize: 'clamp(72px,15vw,110px)', fontWeight: 900, letterSpacing: '-0.05em', color: '#60a5fa', lineHeight: 1, marginBottom: '8px' }}>
            {WRAPPED_DATA.clinicsFound}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>clinics found</div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '260px', margin: '0 auto' }}>
            Your most-visited was{' '}
            <span style={{ color: '#60a5fa', fontWeight: 600 }}>{WRAPPED_DATA.topClinic}</span>.
          </p>
          <div style={{ marginTop: '20px', display: 'inline-flex', gap: '6px', alignItems: 'center', padding: '6px 14px', borderRadius: '100px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', fontSize: '12px', color: '#60a5fa' }}>
            <Shield size={11} /> HRSA Verified
          </div>
        </div>
      ),
    },
    {
      id: 'savings',
      bg: 'linear-gradient(135deg, #0d1117 0%, #1a1200 100%)',
      accent: '#fbbf24',
      content: (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fbbf24', marginBottom: '16px' }}>
            You saved
          </div>
          <div style={{ fontSize: 'clamp(52px,12vw,88px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#fbbf24', lineHeight: 1, marginBottom: '8px' }}>
            ${savings.toLocaleString()}
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '270px', margin: '0 auto 20px' }}>
            vs. average uninsured costs for the same care.
          </p>
          <div style={{
            padding: '14px 20px', borderRadius: '14px',
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
            fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
          }}>
            You&apos;re part of{' '}
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>${total.toLocaleString()}</span>
            <br />saved by all NEXUS users this year.
          </div>
        </div>
      ),
    },
    {
      id: 'community',
      bg: 'linear-gradient(135deg, #0d1117 0%, #1a0d1a 100%)',
      accent: '#f472b6',
      content: (
        <div>
          <Profile2User size={36} color="#f472b6" style={{ marginBottom: '20px' }} />
          <div style={{ fontSize: 'clamp(72px,15vw,110px)', fontWeight: 900, letterSpacing: '-0.05em', color: '#f472b6', lineHeight: 1, marginBottom: '8px' }}>
            {WRAPPED_DATA.friendsHelped}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>friends helped</div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '270px', margin: '0 auto 16px' }}>
            You shared NEXUS with 12 people this year. At least 4 found care they otherwise wouldn&apos;t have.
          </p>
          <div style={{ fontSize: '13px', color: '#f9a8d4', padding: '8px 16px', borderRadius: '100px', background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.2)', display: 'inline-block' }}>
            You&apos;re in the top {WRAPPED_DATA.percentile}% of advocates
          </div>
        </div>
      ),
    },
    {
      id: 'prevention',
      bg: 'linear-gradient(135deg, #0d1117 0%, #0a0d1a 100%)',
      accent: '#818cf8',
      content: (
        <div>
          <Heart size={36} color="#818cf8" style={{ marginBottom: '20px' }} />
          <div style={{ fontSize: 'clamp(72px,15vw,110px)', fontWeight: 900, letterSpacing: '-0.05em', color: '#818cf8', lineHeight: 1, marginBottom: '8px' }}>
            {WRAPPED_DATA.screenings}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>preventive screenings</div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '270px', margin: '0 auto 16px' }}>
            Blood pressure checks, vaccines, dental, vision. You took your health seriously.
          </p>
          <div style={{ fontSize: '13px', color: '#c7d2fe', padding: '8px 16px', borderRadius: '100px', background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', display: 'inline-block' }}>
            Top 5% for preventive care
          </div>
        </div>
      ),
    },
    {
      id: 'badges',
      bg: 'linear-gradient(135deg, #0d1117 0%, #0a1505 100%)',
      accent: '#60a5fa',
      content: (
        <div>
          <Award size={32} color="#fbbf24" style={{ marginBottom: '20px' }} />
          <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fbbf24', marginBottom: '20px' }}>
            Badges earned
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '320px', margin: '0 auto 24px' }}>
            {WRAPPED_DATA.badges.map(b => {
              const BIcon = b.Icon
              return (
              <div key={b.label} style={{
                display: 'flex', gap: '14px', alignItems: 'center',
                padding: '12px 16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'left',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', flexShrink: 0 }}>
                  <BIcon size={24} color="#60a5fa" variant="TwoTone" aria-hidden="true" />
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{b.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{b.desc}</div>
                </div>
              </div>
              )
            })}
          </div>
        </div>
      ),
    },
    {
      id: 'share',
      bg: 'linear-gradient(135deg, #0d1117 0%, #1a0a2e 100%)',
      accent: '#818cf8',
      content: (
        <div>
          <MagicStar size={36} color="#818cf8" style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>
            {WRAPPED_DATA.year} was your year.
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '280px', margin: '0 auto 28px' }}>
            Share your Wrapped — and help normalize seeking care for the 30M+ who feel they can&apos;t.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              padding: '11px 22px', borderRadius: '100px',
              background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.35)',
              color: '#818cf8', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <ExportSquare size={13} /> Share Wrapped
            </button>
            <button style={{
              padding: '11px 22px', borderRadius: '100px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <DocumentDownload size={13} /> Save as image
            </button>
          </div>
        </div>
      ),
    },
  ]

  if (!started) {
    return (
      <AppShell>
        <div style={{
          minHeight: '100dvh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '80px 24px', position: 'relative', overflow: 'hidden',
        }}>
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(129,140,248,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <MagicStar size={80} color="#818cf8" variant="TwoTone" aria-hidden="true" />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#818cf8', marginBottom: '16px' }}>
            NEXUS Wrapped
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: '20px',
            maxWidth: '600px',
          }}>
            Your year in healthcare. Made visible.
          </h1>
          <p style={{
            fontSize: '16px', color: 'rgba(255,255,255,0.5)',
            maxWidth: '440px', lineHeight: 1.7, marginBottom: '40px',
          }}>
            See how many people you helped, how much you saved, and what you accomplished for your health in {WRAPPED_DATA.year}.
          </p>
          <button
            onClick={() => setStarted(true)}
            style={{
              padding: '16px 36px', borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(74,144,217,0.15))',
              border: '1px solid rgba(129,140,248,0.4)',
              color: '#c7d2fe', fontSize: '16px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 0 40px rgba(129,140,248,0.2)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
          >
            See your {WRAPPED_DATA.year} Wrapped <MagicStar size={16} color="#c7d2fe" variant="Bold" style={{ marginLeft: '4px', verticalAlign: 'middle' }} aria-hidden="true" />
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px', position: 'relative',
      }}>
        {/* Card stack */}
        <div style={{
          width: '100%', maxWidth: '420px',
          position: 'relative', aspectRatio: '9/16',
          borderRadius: '28px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          marginBottom: '28px',
        }}>
          {cards.map((card, i) => (
            <WrappedCard key={card.id} card={card} active={i === cardIdx} idx={i} />
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setCardIdx(Math.max(0, cardIdx - 1))}
              disabled={cardIdx === 0}
              style={{
                padding: '10px 20px', borderRadius: '100px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: cardIdx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
                fontSize: '13px', cursor: cardIdx === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}
            >
              ← Back
            </button>

            <div style={{ display: 'flex', gap: '6px' }}>
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCardIdx(i)}
                  style={{
                    width: i === cardIdx ? '20px' : '6px', height: '6px',
                    borderRadius: '100px', border: 'none', cursor: 'pointer',
                    background: i === cardIdx ? '#818cf8' : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                    padding: 0,
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => {
                if (cardIdx < cards.length - 1) setCardIdx(cardIdx + 1)
              }}
              disabled={cardIdx === cards.length - 1}
              style={{
                padding: '10px 20px', borderRadius: '100px',
                background: cardIdx < cards.length - 1 ? 'rgba(129,140,248,0.12)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${cardIdx < cards.length - 1 ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: cardIdx < cards.length - 1 ? '#818cf8' : 'rgba(255,255,255,0.2)',
                fontSize: '13px', cursor: cardIdx < cards.length - 1 ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
              }}
            >
              Next →
            </button>
          </div>

          {/* #27 — Share Wrapped on last card */}
          {cardIdx === cards.length - 1 && (
            <button
              onClick={handleShare}
              style={{
                padding: '12px 28px', borderRadius: '100px',
                background: shareCopied ? 'rgba(74,222,128,0.12)' : 'rgba(129,140,248,0.14)',
                border: `1px solid ${shareCopied ? 'rgba(74,222,128,0.3)' : 'rgba(129,140,248,0.35)'}`,
                color: shareCopied ? '#4ade80' : '#818cf8',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s',
                animation: 'fadeSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
              }}
            >
              <ExportSquare size={14} />
              {shareCopied ? 'Copied! Share with friends ✓' : `Share your ${WRAPPED_DATA.year} Wrapped`}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  )
}
