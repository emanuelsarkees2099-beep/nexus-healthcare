'use client'
export const dynamic = 'force-dynamic'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { smoothScrollTo } from '@/utils/smoothScroll'
import { submitForm } from '@/utils/submitForm'
import { createClientClient } from '@/lib/auth-client'
import { BookOpen, Heart, MessageCircle, ArrowRight, ChevronUp, CheckCircle, Users, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function RevealBlock({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      {children}
    </div>
  )
}

const pill: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '4px 12px', borderRadius: '100px',
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
  background: 'rgba(110,231,183,0.08)', color: 'var(--accent)',
  border: '1px solid rgba(110,231,183,0.18)',
}

const STORIES = [
  { name: 'Maria L.', city: 'Phoenix, AZ', category: 'Insurance Navigation', fullStory: false,
    quote: 'I spent six months thinking I didn\'t qualify for anything. Then I logged into NEXUS at 11pm on a Tuesday and within 8 minutes it told me I qualified for AHCCCS and pointed me to a CHW who spoke Spanish. Three weeks later I had coverage. I cried.',
    expanded: 'What I want people to know is that the system makes you feel stupid on purpose. It\'s confusing because they want you to give up. I almost did. But the CHW who helped me — Rosa — she had been through the same thing. She knew every form, every deadline, every trick they use to reject you. We got it done together. I\'m sharing this so whoever reads it knows: don\'t give up. There are people who want to help.'
  },
  { name: 'James T.', city: 'Detroit, MI', category: 'Emergency Care Rights', fullStory: false,
    quote: 'I had a heart scare at 2am. No insurance. I was about to not go because I thought I\'d get a $40,000 bill. My daughter showed me the NEXUS rights page on her phone. I didn\'t know hospitals can\'t turn you away. I went. It was a minor arrhythmia. Treatable.',
    expanded: 'The hospital tried to send me a bill anyway. $12,000 for three hours. The NEXUS legal aid connection helped me dispute it under the No Surprises Act and Medicaid retroactive enrollment. I paid $0. Please share the rights page with every person you know who is scared to go to the ER. That fear is killing people.'
  },
  { name: 'Anh N.', city: 'San Jose, CA', category: 'Language Access', fullStory: false,
    quote: 'My mother has been here 22 years and still doesn\'t speak English well enough for a medical conversation. She\'s been misdiagnosed twice because of translation errors. The CHW we found through NEXUS speaks her exact dialect of Vietnamese — not just standard Vietnamese. For the first time she understood her own diagnosis.',
    expanded: 'People don\'t understand how much is lost in a bad translation. Medical terms, cultural context, the way you describe pain — all of it matters. My mother had been describing her symptoms wrong for years not because she was inaccurate but because the translator was translating the wrong concept. The CHW caught it immediately. My mother\'s condition has been properly managed for 8 months now.'
  },
]

const FORUM_POSTS = [
  { title: 'Finally got Medicaid approved after 3 denials — here\'s what worked', category: 'Insurance', excerpt: 'Sharing the exact documents and appeal letter that got my third application approved after two rejections for "insufficient documentation."', upvotes: 847, replies: 92, time: '2 days ago' },
  { title: 'ER turned me away — what are my actual rights?', category: 'Finding Care', excerpt: 'I was told they couldn\'t see me without insurance. I know this sounds wrong. Does EMTALA apply here?', upvotes: 612, replies: 74, time: '4 days ago' },
  { title: 'Free mental health resources that actually helped me', category: 'Mental Health', excerpt: 'After months of searching I found three actually-free options that aren\'t waitlisted forever. Sharing what worked.', upvotes: 1203, replies: 148, time: '1 week ago' },
  { title: 'Insulin cost me $340/month — now it\'s $8. Here\'s how.', category: 'Medications', excerpt: 'State 340B program + patient assistance program stacked together. Took 45 minutes to set up. Changed my life.', upvotes: 2187, replies: 203, time: '1 week ago' },
  { title: 'Prenatal care without insurance in 2025 — a full guide', category: 'Pregnancy', excerpt: 'Compiled everything I learned navigating prenatal care uninsured. FQHCs, Medicaid pregnancy coverage, WIC integration.', upvotes: 934, replies: 118, time: '2 weeks ago' },
]

const CATEGORIES = ['All', 'Insurance', 'Finding Care', 'Mental Health', 'Medications', 'Pregnancy']

const CATEGORY_COLORS: Record<string, string> = {
  Insurance: 'var(--accent)', 'Finding Care': '#4ade80', 'Mental Health': '#60a5fa', Medications: '#fbbf24', Pregnancy: '#f472b6',
}

export default function StoriesPage() {
  const shareRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [expandedStory, setExpandedStory] = useState<number | null>(null)
  const [upvotes, setUpvotes] = useState<Record<number, boolean>>({})
  const [form, setForm] = useState({ name: '', location: '', category: '', story: '', consent: false })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [words, setWords] = useState<boolean[]>([])

  const TITLE = 'You are not alone in all of this'.split(' ')

  // Pre-fill name from logged-in user
  useEffect(() => {
    const supabase = createClientClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        supabase.from('user_profiles').select('full_name').eq('id', data.session.user.id).single()
          .then(({ data: p }) => { if (p?.full_name) setForm(f => ({ ...f, name: p.full_name ?? '' })) })
      }
    })
  }, [])

  useEffect(() => {
    TITLE.forEach((_, i) => {
      setTimeout(() => setWords(w => { const n = [...w]; n[i] = true; return n }), 120 + i * 85)
    })
  }, [])

  const filteredPosts = activeCategory === 'All' ? FORUM_POSTS : FORUM_POSTS.filter(p => p.category === activeCategory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.story || !form.consent) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await submitForm('story', {
        name: form.name,
        location: form.location,
        category: form.category,
        story: form.story,
        consent: form.consent,
      })
      setSubmitted(true)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      {/* ── HERO ── */}
      <section style={{ minHeight: '80dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '100px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(110,231,183,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ ...pill, marginBottom: '24px' }}><BookOpen size={10} strokeWidth={1.5} /> Stories & Community</div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '24px', maxWidth: '820px' }}>
          {TITLE.map((w, i) => (
            <span key={i} style={{ display: 'inline-block', marginRight: '0.25em', opacity: words[i] ? 1 : 0, transform: words[i] ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)', color: w === 'alone' ? 'var(--accent)' : 'inherit' }}>{w}</span>
          ))}
        </h1>

        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', lineHeight: 1.7, marginBottom: '40px' }}>
          47,000+ people have shared their journey navigating healthcare without insurance. Their stories are a map for everyone who comes after them.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
          {[['47K+', 'stories shared'], ['12K', 'active members'], ['89%', 'felt less alone']].map(([v, l]) => (
            <div key={l} style={{ padding: '10px 20px', background: 'rgba(110,231,183,0.07)', border: '1px solid rgba(110,231,183,0.18)', borderRadius: '100px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{v}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => shareRef.current && smoothScrollTo(shareRef.current)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '100px', background: 'var(--accent)', color: '#07070F', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s', boxShadow: '0 4px 20px rgba(110,231,183,0.3)' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(110,231,183,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(110,231,183,0.3)' }}
        >
          <Heart size={14} strokeWidth={2} /> Share your story
        </button>
      </section>

      {/* ── FEATURED STORIES ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}>Featured stories</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Their stories are your guide</h2>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {STORIES.map((s, i) => (
              <RevealBlock key={s.name} delay={i * 100}>
                <div style={{ padding: '2px', background: 'linear-gradient(135deg, rgba(110,231,183,0.2), rgba(110,231,183,0.04))', borderRadius: '20px' }}>
                  <div style={{ background: '#080D1A', borderRadius: '18px', padding: '28px', borderLeft: '3px solid rgba(110,231,183,0.4)' }}>
                    <span style={{ ...pill, fontSize: '10px', padding: '3px 10px', marginBottom: '16px', display: 'inline-flex' }}>{s.category}</span>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '0' }}>&ldquo;{s.quote}&rdquo;</p>

                    {expandedStory === i && (
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>{s.expanded}</p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{s.name}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{s.city}</div>
                      </div>
                      <button
                        onClick={() => setExpandedStory(expandedStory === i ? null : i)}
                        style={{ padding: '7px 14px', borderRadius: '100px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      >
                        {expandedStory === i ? 'Read less' : 'Read more'}
                      </button>
                    </div>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY FORUM ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}><MessageCircle size={10} strokeWidth={1.5} /> Community forum</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Questions answered by people who've been there</h2>
            </div>
          </RevealBlock>

          {/* Category filter */}
          <RevealBlock delay={80}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{ padding: '7px 16px', borderRadius: '100px', border: '1px solid', borderColor: activeCategory === cat ? 'rgba(110,231,183,0.4)' : 'rgba(255,255,255,0.1)', background: activeCategory === cat ? 'rgba(110,231,183,0.12)' : 'transparent', color: activeCategory === cat ? 'var(--accent)' : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </RevealBlock>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredPosts.map((p, i) => (
              <RevealBlock key={p.title} delay={i * 60}>
                <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', transition: 'border-color 0.25s, background 0.25s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(110,231,183,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(110,231,183,0.03)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '100px', background: `${CATEGORY_COLORS[p.category] || 'var(--accent)'}15`, color: CATEGORY_COLORS[p.category] || 'var(--accent)', border: `1px solid ${CATEGORY_COLORS[p.category] || 'var(--accent)'}25`, fontWeight: 500 }}>{p.category}</span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{p.time}</span>
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', lineHeight: 1.35 }}>{p.title}</h3>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>{p.excerpt}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => setUpvotes(prev => ({ ...prev, [i]: !prev[i] }))}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '100px', background: upvotes[i] ? 'rgba(110,231,183,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${upvotes[i] ? 'rgba(110,231,183,0.3)' : 'rgba(255,255,255,0.08)'}`, color: upvotes[i] ? 'var(--accent)' : 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                      >
                        <ChevronUp size={12} strokeWidth={2} /> {p.upvotes + (upvotes[i] ? 1 : 0)}
                      </button>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}><MessageCircle size={11} strokeWidth={1.5} /> {p.replies}</span>
                    </div>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHARE YOUR STORY ── */}
      <section ref={shareRef} style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ ...pill, marginBottom: '24px' }}><Heart size={10} strokeWidth={1.5} /> Share your story</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '16px' }}>Your story might be someone else's lifeline</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, marginBottom: '40px' }}>You don't need to write perfectly. Just honestly. Stories are reviewed by our team before publishing.</p>
          </RevealBlock>

          {submitted ? (
            <RevealBlock>
              <div style={{ textAlign: 'center', padding: '48px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '20px' }}>
                <CheckCircle size={40} strokeWidth={1.5} style={{ color: '#4ade80', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Thank you, {form.name}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>Your story has been submitted for review. We'll reach out with any questions. Stories are typically published within 3–5 business days.</p>
              </div>
            </RevealBlock>
          ) : (
            <RevealBlock delay={100}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <StoryField label="First name" placeholder="Maria" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
                  <StoryField label="City, State" placeholder="Phoenix, AZ" value={form.location} onChange={v => setForm(p => ({ ...p, location: v }))} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '11px 14px', color: form.category ? '#eef4f5' : 'rgba(255,255,255,0.3)', fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(110,231,183,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110,231,183,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <option value="">Select a category…</option>
                    {['Insurance Navigation', 'Finding Care', 'Mental Health', 'Emergency Care', 'Medications', 'Pregnancy', 'Language Barrier', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>Your story</label>
                  <textarea value={form.story} onChange={e => setForm(p => ({ ...p, story: e.target.value.slice(0, 2000) }))}
                    placeholder="What happened? What did you learn? What do you wish you had known sooner?"
                    rows={6}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '11px 14px', color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', caretColor: 'var(--accent)', minHeight: '140px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(110,231,183,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110,231,183,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.22)', textAlign: 'right' }}>{form.story.length}/2000</div>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.consent} onChange={e => setForm(p => ({ ...p, consent: e.target.checked }))} style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>I consent to NEXUS publishing this story (with only my first name and city) and understand I can request removal at any time.</span>
                </label>

                {submitError && (
                  <p style={{ fontSize: '13px', color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '10px 14px', margin: 0 }}>
                    {submitError}
                  </p>
                )}
                <button type="submit" disabled={submitting} style={{ marginTop: '8px', padding: '15px', borderRadius: '12px', background: submitting ? 'rgba(110,231,183,0.5)' : 'var(--accent)', color: '#07070F', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s', boxShadow: '0 4px 20px rgba(110,231,183,0.3)' }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(110,231,183,0.45)' } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(110,231,183,0.3)' }}
                >
                  {submitting ? 'Submitting…' : 'Submit story →'}
                </button>
              </form>
            </RevealBlock>
          )}
        </div>
      </section>

      {/* ── SUPPORT RESOURCES ── */}
      <section style={{ padding: '80px 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}>Support resources</div>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>Help that's available right now</h2>
            </div>
          </RevealBlock>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {[
              { icon: <Heart size={18} strokeWidth={1.5} />, title: 'Mental Health Crisis Line', desc: 'Call or text 988 anytime. Free, confidential, multilingual crisis support.', action: () => window.open('tel:988'), label: 'Call 988' },
              { icon: <Users size={18} strokeWidth={1.5} />, title: 'Patient Advocate Finder', desc: 'Match with an AI care navigator to find the right clinic for your situation.', action: () => window.location.href = '/pathways', label: 'Find a pathway' },
              { icon: <LinkIcon size={18} strokeWidth={1.5} />, title: 'Community Health Workers', desc: 'Connect with a real person in your community who speaks your language.', action: () => window.location.href = '/chw', label: 'Find a CHW' },
            ].map((r, i) => (
              <RevealBlock key={r.title} delay={i * 80}>
                <div style={{ padding: '2px', background: 'linear-gradient(135deg, rgba(110,231,183,0.18), rgba(110,231,183,0.04))', borderRadius: '18px' }}>
                  <div style={{ background: '#080D1A', borderRadius: '16px', padding: '24px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>{r.icon}</div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.3 }}>{r.title}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, flex: 1, margin: 0 }}>{r.desc}</p>
                    <button onClick={r.action} style={{ padding: '10px 18px', borderRadius: '100px', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s', alignSelf: 'flex-start' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(110,231,183,0.2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(110,231,183,0.1)')}
                    >
                      {r.label} <ArrowRight size={12} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  )
}

function StoryField({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${focused ? 'rgba(110,231,183,0.45)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(110,231,183,0.08)' : 'none',
          borderRadius: '9px', padding: '11px 14px',
          color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit',
          outline: 'none', boxSizing: 'border-box', caretColor: 'var(--accent)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      />
    </div>
  )
}
