'use client'
import React, { useState, useEffect, useRef } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { Car, MessageCircle, Profile, Heart, Global, Profile2User, ArrowRight, TickCircle, Clock, Location, Star1, AddCircle, ArrowRight2 } from 'iconsax-react'

/* ── Deterministic seed ── */
function seeded(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}

type HelpOffer = {
  id: string
  type: string
  name: string
  location: string
  desc: string
  languages: string[]
  rating: number
  helps: number
  online: boolean
  avatar: string
}

function generateOffers(seed: number): HelpOffer[] {
  const rng = seeded(seed)
  const names = ['Maria R.', 'James T.', 'Sofia M.', 'Carlos V.', 'Priya N.', 'Ahmed K.', 'Lin W.', 'Rosa F.', 'David M.', 'Amara J.']
  const locations = ['Phoenix, AZ', 'Tucson, AZ', 'Houston, TX', 'Denver, CO', 'Chicago, IL', 'Miami, FL', 'Los Angeles, CA', 'Dallas, TX']
  const langSets = [['English', 'Spanish'], ['English'], ['English', 'Arabic'], ['English', 'Chinese'], ['English', 'Tagalog'], ['English', 'Hindi'], ['English', 'French', 'Spanish']]
  const types = ['ride', 'nurse', 'childcare', 'translator', 'buddy']
  const typeDescs: Record<string, string[]> = {
    ride: ['Happy to drive to appointments within 10 miles', 'Can take people to clinics on weekends', 'Retired, available most weekdays for rides'],
    nurse: ['RN with 12 years in primary care. Ask me anything.', 'ER nurse — I explain things in plain language', 'Family NP, specializing in diabetes care'],
    childcare: ['Can watch kids for up to 3 hours while you see a doctor', 'Former daycare worker, happy to help parents', 'I watch kids at my home near Central Phoenix'],
    translator: ['Fluent Spanish/English — available by phone or in person', 'Arabic/English interpreter, 8 years experience', 'Tagalog and English — grew up translating for my parents'],
    buddy: ['I used Valle del Sol for a year — happy to guide newcomers', 'Know every FQHC in the Phoenix metro area', 'Former CHW, now volunteering independently'],
  }
  return Array.from({ length: 8 }, (_, i) => {
    const type = types[Math.floor(rng() * types.length)]
    const name = names[Math.floor(rng() * names.length)]
    const descs = typeDescs[type]
    return {
      id: `offer-${i}`,
      type,
      name,
      location: locations[Math.floor(rng() * locations.length)],
      desc: descs[Math.floor(rng() * descs.length)],
      languages: langSets[Math.floor(rng() * langSets.length)],
      rating: Math.round((4.2 + rng() * 0.8) * 10) / 10,
      helps: Math.floor(rng() * 120) + 5,
      online: rng() > 0.4,
      avatar: name.charAt(0),
    }
  })
}

const typeConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  ride: { label: 'Ride Share', color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.25)', icon: <Car size={14} /> },
  nurse: { label: 'Ask a Nurse', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)', icon: <MessageCircle size={14} /> },
  childcare: { label: 'Childcare Swap', color: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.25)', icon: <Profile size={14} /> },
  translator: { label: 'Translator', color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.25)', icon: <Global size={14} /> },
  buddy: { label: 'Care Buddy', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', icon: <Heart size={14} /> },
}

const FEATURES = [
  {
    icon: <Car size={20} />,
    title: 'Rides to Appointments',
    desc: 'Community members volunteer to drive you to your clinic. No app needed — just a phone call.',
    color: '#818cf8',
  },
  {
    icon: <MessageCircle size={20} />,
    title: 'Ask a Verified Nurse',
    desc: 'Real nurses, doctors, and health workers answer your questions for free. No diagnosis — just guidance.',
    color: '#60a5fa',
  },
  {
    icon: <Profile size={20} />,
    title: 'Childcare During Visits',
    desc: 'Parents swap childcare during appointments. You watch theirs Tuesday, they watch yours Thursday.',
    color: '#f472b6',
  },
  {
    icon: <Heart size={20} />,
    title: 'Prescription Fund',
    desc: 'Community-funded help for prescription co-pays. Simple, verified, and built into NEXUS — no GoFundMe account needed.',
    color: '#f87171',
  },
  {
    icon: <Global size={20} />,
    title: 'Translator Buddies',
    desc: 'Bilingual community members volunteer to interpret at appointments. 47 languages supported.',
    color: '#fb923c',
  },
  {
    icon: <Profile2User size={20} />,
    title: 'Bring a Friend',
    desc: 'Pair newcomers with someone who\'s used the same clinic. Makes the first visit 80% less scary.',
    color: '#fbbf24',
  },
]

const LIVE_FEED = [
  'Carlos R. offered a ride to 3 people in Phoenix today',
  'Maria N., RN, answered 7 health questions this morning',
  'A childcare swap connected 2 parents in Houston',
  'A Tagalog translator helped at Valle del Sol yesterday',
  'A prescription fund request was fully met in 4 hours',
  'James T. guided a newcomer to Terros Health last week',
]

export default function CommunityPage() {
  const seed = Math.floor(Date.now() / 3600000)
  const offers = generateOffers(seed)
  const [filter, setFilter] = useState<string>('all')
  const [feedIdx, setFeedIdx] = useState(0)

  const filtered = filter === 'all' ? offers : offers.filter(o => o.type === filter)

  useEffect(() => {
    const t = setInterval(() => setFeedIdx(i => (i + 1) % LIVE_FEED.length), 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <AppShell>
      <style>{`
        .community-card:hover { border-color: rgba(255,255,255,0.18) !important; transform: translateY(-2px); }
        .community-card { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .filter-btn:hover { background: rgba(255,255,255,0.08) !important; }
        @keyframes feed-fade { 0%,100% { opacity: 1; } 45%,55% { opacity: 0; } }
      `}</style>

      {/* Hero */}
      <section style={{
        padding: 'clamp(80px,10vw,120px) 24px 60px',
        textAlign: 'center', position: 'relative',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 45% at 50% 0%, rgba(244,114,182,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Live feed ticker */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', borderRadius: '100px',
          background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)',
          marginBottom: '32px', fontSize: '12px', color: 'rgba(96,165,250,0.9)',
          maxWidth: '400px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', flexShrink: 0 }} />
          <span style={{ animation: 'feed-fade 3.5s ease infinite' }}>{LIVE_FEED[feedIdx]}</span>
        </div>

        <div style={{
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.2)',
          marginBottom: '24px', fontSize: '11px', fontWeight: 600,
          color: '#f472b6', letterSpacing: '0.1em', textTransform: 'uppercase',
          display: 'inline-block',
        }}>
          Community Care Network
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 54px)', fontWeight: 800,
          letterSpacing: '-0.035em', lineHeight: 1.05, marginBottom: '16px',
          maxWidth: '640px', margin: '0 auto 16px',
        }}>
          Mutual aid as<br />
          <span style={{ color: '#f472b6' }}>healthcare infrastructure.</span>
        </h1>

        <p style={{
          fontSize: '15px', color: 'rgba(255,255,255,0.45)',
          maxWidth: '480px', lineHeight: 1.7, margin: '0 auto 48px',
        }}>
          Real people helping real people get care. Rides, childcare, translation, nursing Q&amp;A — built into NEXUS, not siloed off in a separate app.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="#find" style={{
            padding: '12px 28px', borderRadius: '100px',
            background: 'rgba(244,114,182,0.12)', border: '1px solid rgba(244,114,182,0.3)',
            color: '#f472b6', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            Find help near me <ArrowRight size={14} />
          </Link>
          <Link href="#volunteer" style={{
            padding: '12px 28px', borderRadius: '100px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none',
          }}>
            Volunteer to help
          </Link>
        </div>
      </section>

      {/* Feature tiles */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '12px',
          }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                padding: '24px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: `${f.color}15`, border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color, marginBottom: '16px',
                }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Find help section */}
      <section id="find" style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '4px' }}>
                People offering help right now
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                {offers.filter(o => o.online).length} volunteers online · Updated hourly
              </p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['all', ...Object.keys(typeConfig)].map(f => (
                <button
                  key={f}
                  className="filter-btn"
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 14px', borderRadius: '100px',
                    background: filter === f ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${filter === f ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                    color: filter === f ? '#f5f5f5' : 'rgba(255,255,255,0.45)',
                    fontSize: '12px', fontWeight: filter === f ? 600 : 400,
                    cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
                    transition: 'all 0.18s',
                  }}
                >
                  {f === 'all' ? 'All' : typeConfig[f]?.label ?? f}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
          }}>
            {filtered.map(offer => {
              const cfg = typeConfig[offer.type]
              return (
                <div
                  key={offer.id}
                  className="community-card"
                  style={{
                    padding: '20px', borderRadius: '18px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                    {/* Avatar */}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px', fontWeight: 700, color: cfg.color, position: 'relative',
                    }}>
                      {offer.avatar}
                      {offer.online && (
                        <span style={{
                          position: 'absolute', bottom: '1px', right: '1px',
                          width: '9px', height: '9px', borderRadius: '50%',
                          background: '#60a5fa', border: '1.5px solid #0d1117',
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{offer.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '2px 8px', borderRadius: '100px',
                          background: cfg.bg, border: `1px solid ${cfg.border}`,
                          fontSize: '10px', fontWeight: 600, color: cfg.color,
                        }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '12px' }}>
                    {offer.desc}
                  </p>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Location size={10} /> {offer.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star1 size={10} style={{ fill: '#fbbf24', color: '#fbbf24' }} /> {offer.rating}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TickCircle size={10} /> {offer.helps} helped
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {offer.languages.map(l => (
                      <span key={l} style={{
                        padding: '2px 8px', borderRadius: '100px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        fontSize: '11px', color: 'rgba(255,255,255,0.45)',
                      }}>
                        {l}
                      </span>
                    ))}
                  </div>

                  <button style={{
                    width: '100%', padding: '9px', borderRadius: '10px',
                    background: offer.online ? cfg.bg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${offer.online ? cfg.border : 'rgba(255,255,255,0.08)'}`,
                    color: offer.online ? cfg.color : 'rgba(255,255,255,0.35)',
                    fontSize: '12px', fontWeight: 600, cursor: offer.online ? 'pointer' : 'default',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}>
                    {offer.online ? 'Request help' : 'Offline — request callback'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Volunteer section */}
      <section id="volunteer" style={{ padding: '0 24px 120px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{
            padding: '40px', borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(244,114,182,0.06), rgba(129,140,248,0.06))',
            border: '1px solid rgba(244,114,182,0.18)',
            textAlign: 'center',
          }}>
            <AddCircle size={28} color="#f472b6" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '12px' }}>
              Join the network
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', maxWidth: '420px', margin: '0 auto 28px', lineHeight: 1.7 }}>
              Can you drive someone to a clinic? Answer health questions? Translate? Watch a kid for two hours? You can change someone&apos;s life with an afternoon.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Offer a ride', 'Volunteer as a nurse/provider', 'Offer childcare', 'Volunteer to translate', 'Become a Care Buddy'].map(opt => (
                <button key={opt} style={{
                  padding: '9px 18px', borderRadius: '100px',
                  background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.2)',
                  color: '#f9a8d4', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,114,182,0.16)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,114,182,0.08)'}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
