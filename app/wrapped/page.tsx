'use client'
import React, { useState, useEffect, useRef } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { Sparkles, TrendingUp, MapPin, Heart, Users, Shield, Download, Share2, ChevronRight, Star, Award } from 'lucide-react'

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
    { icon: '🏥', label: 'Clinic Navigator', desc: 'Found 4+ clinics this year' },
    { icon: '💚', label: 'Community Hero', desc: 'Helped 12+ friends find care' },
    { icon: '🛡️', label: 'Prevention Champion', desc: 'Completed 8 preventive screenings' },
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
  const [started, setStarted] = useState(false)
  const [cardIdx, setCardIdx] = useState(0)
  const [counting, setCounting] = useState(false)

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
          <div style={{ fontSize: '64px', marginBottom: '20px', lineHeight: 1 }}>✨</div>
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
      accent: '#4ade80',
      content: (
        <div>
          <MapPin size={40} color="#4ade80" style={{ marginBottom: '20px' }} />
          <div style={{ fontSize: 'clamp(72px,15vw,110px)', fontWeight: 900, letterSpacing: '-0.05em', color: '#4ade80', lineHeight: 1, marginBottom: '8px' }}>
            {WRAPPED_DATA.clinicsFound}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>clinics found</div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '260px', margin: '0 auto' }}>
            Your most-visited was{' '}
            <span style={{ color: '#4ade80', fontWeight: 600 }}>{WRAPPED_DATA.topClinic}</span>.
          </p>
          <div style={{ marginTop: '20px', display: 'inline-flex', gap: '6px', alignItems: 'center', padding: '6px 14px', borderRadius: '100px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', fontSize: '12px', color: '#4ade80' }}>
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
          <Users size={36} color="#f472b6" style={{ marginBottom: '20px' }} />
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
      accent: '#4ade80',
      content: (
        <div>
          <Award size={32} color="#fbbf24" style={{ marginBottom: '20px' }} />
          <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fbbf24', marginBottom: '20px' }}>
            Badges earned
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '320px', margin: '0 auto 24px' }}>
            {WRAPPED_DATA.badges.map(b => (
              <div key={b.label} style={{
                display: 'flex', gap: '14px', alignItems: 'center',
                padding: '12px 16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'left',
              }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{b.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{b.desc}</div>
                </div>
              </div>
            ))}
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
          <Sparkles size={36} color="#818cf8" style={{ marginBottom: '20px' }} />
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
              <Share2 size={13} /> Share Wrapped
            </button>
            <button style={{
              padding: '11px 22px', borderRadius: '100px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Download size={13} /> Save as image
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
          <div style={{ fontSize: '80px', marginBottom: '24px', lineHeight: 1 }}>✨</div>
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
              background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(110,231,183,0.15))',
              border: '1px solid rgba(129,140,248,0.4)',
              color: '#c7d2fe', fontSize: '16px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 0 40px rgba(129,140,248,0.2)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
          >
            See your {WRAPPED_DATA.year} Wrapped ✨
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
      </div>
    </AppShell>
  )
}
