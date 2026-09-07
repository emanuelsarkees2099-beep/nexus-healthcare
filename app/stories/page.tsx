'use client'
export const dynamic = 'force-dynamic'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { smoothScrollTo } from '@/utils/smoothScroll'
import { submitForm } from '@/utils/submitForm'
import { createClientClient } from '@/lib/auth-client'
import { Book1, Heart, ArrowRight, TickCircle, Profile2User, Link2 as LinkIcon } from 'iconsax-react'
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
  background: 'rgba(74,144,217,0.08)', color: 'var(--accent)',
  border: '1px solid rgba(74,144,217,0.18)',
}

export default function StoriesPage() {
  const shareRef = useRef<HTMLDivElement>(null)
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
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(74,144,217,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ ...pill, marginBottom: '24px' }}><Book1 size={14} variant="Linear" /> Stories & Community</div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '24px', maxWidth: '820px' }}>
          <div>
            {TITLE.slice(0, 4).map((w, i) => (
              <span key={i} style={{ display: 'inline-block', marginRight: '0.25em', opacity: words[i] ? 1 : 0, transform: words[i] ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)', color: w === 'alone' ? 'var(--accent)' : 'inherit' }}>{w}</span>
            ))}
          </div>
          <div>
            {TITLE.slice(4).map((w, i) => (
              <span key={i + 4} style={{ display: 'inline-block', marginRight: '0.25em', opacity: words[i + 4] ? 1 : 0, transform: words[i + 4] ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)' }}>{w}</span>
            ))}
          </div>
        </h1>

        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', lineHeight: 1.7, marginBottom: '40px' }}>
          Navigating healthcare without insurance is hard — and lonely. Share how you found care, and help map the way for everyone who comes after you.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
          {[['4', 'languages'], ['$0', 'to share'], ['100%', 'anonymous']].map(([v, l]) => (
            <div key={l} style={{ padding: '10px 20px', background: 'rgba(74,144,217,0.07)', border: '1px solid rgba(74,144,217,0.18)', borderRadius: '100px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{v}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => shareRef.current && smoothScrollTo(shareRef.current)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '100px', background: 'var(--accent)', color: '#07070F', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s', boxShadow: '0 4px 20px rgba(74,144,217,0.3)' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(74,144,217,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(74,144,217,0.3)' }}
        >
          <Heart size={14} color="#07070F" variant="Linear" /> Share your story
        </button>
      </section>

      {/* ── FEATURED STORIES ── */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '56px' }}>
              <div style={{ ...pill, marginBottom: '20px' }}>Featured stories</div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Your story could be the first</h2>
            </div>
          </RevealBlock>

          {/* No stories published yet -- AXVO is new, and every story published here is
              a real, consented submission reviewed by our team (see the form below).
              We'd rather show nothing than invent testimonials that never happened. */}
          <div style={{
            textAlign: 'center', padding: '56px 24px',
            border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '20px',
          }}>
            <Book1 size={28} color="rgba(255,255,255,0.25)" variant="Linear" style={{ marginBottom: '14px' }} />
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '440px', margin: '0 auto' }}>
              AXVO is new — no stories have been published here yet. Every story that appears on this page will be a real, consented submission from someone who used AXVO to find care.
            </p>
            <button
              onClick={() => shareRef.current && smoothScrollTo(shareRef.current)}
              style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '100px', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.25)', color: 'var(--accent)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Be the first to share yours
            </button>
          </div>
        </div>
      </section>

      {/* ── SHARE YOUR STORY ── */}
      <section ref={shareRef} style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ ...pill, marginBottom: '24px' }}><Heart size={14} variant="Linear" /> Share your story</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '16px' }}>Your story might be someone else's lifeline</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, marginBottom: '40px' }}>You don't need to write perfectly. Just honestly. Stories are reviewed by our team before publishing.</p>
          </RevealBlock>

          {submitted ? (
            <RevealBlock>
              <div style={{ textAlign: 'center', padding: '48px', background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '20px' }}>
                <TickCircle size={40} variant="Linear" style={{ color: '#60a5fa', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Thank you, {form.name}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>Your story has been submitted for review. We'll reach out with any questions. Stories are typically published within 3–5 business days.</p>
              </div>
            </RevealBlock>
          ) : (
            <RevealBlock delay={100}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="stories-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <StoryField label="First name" placeholder="Maria" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
                  <StoryField label="City, State" placeholder="Phoenix, AZ" value={form.location} onChange={v => setForm(p => ({ ...p, location: v }))} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '11px 14px', color: form.category ? '#eef4f5' : 'rgba(255,255,255,0.3)', fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(74,144,217,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.08)' }}
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
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(74,144,217,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.22)', textAlign: 'right' }}>{form.story.length}/2000</div>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.consent} onChange={e => setForm(p => ({ ...p, consent: e.target.checked }))} style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>I consent to AXVO publishing this story (with only my first name and city) and understand I can request removal at any time.</span>
                </label>

                {submitError && (
                  <p style={{ fontSize: '13px', color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '10px 14px', margin: 0 }}>
                    {submitError}
                  </p>
                )}
                <button type="submit" disabled={submitting} style={{ marginTop: '8px', padding: '15px', borderRadius: '12px', background: submitting ? 'rgba(74,144,217,0.5)' : 'var(--accent)', color: '#07070F', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s', boxShadow: '0 4px 20px rgba(74,144,217,0.3)' }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(74,144,217,0.45)' } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(74,144,217,0.3)' }}
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
              { icon: <Heart size={18} variant="Linear" />, title: 'Mental Health Crisis Line', desc: 'Call or text 988 anytime. Free, confidential, multilingual crisis support.', action: () => window.open('tel:988'), label: 'Call 988' },
              { icon: <Profile2User size={18} variant="Linear" />, title: 'Patient Advocate Finder', desc: 'Match with an AI care navigator to find the right clinic for your situation.', action: () => window.location.href = '/pathways', label: 'Find a pathway' },
              { icon: <LinkIcon size={18} variant="Linear" />, title: 'Community Health Workers', desc: 'Connect with a real person in your community who speaks your language.', action: () => window.location.href = '/chw', label: 'Find a CHW' },
            ].map((r, i) => (
              <RevealBlock key={r.title} delay={i * 80}>
                <div style={{ padding: '2px', background: 'linear-gradient(135deg, rgba(74,144,217,0.18), rgba(74,144,217,0.04))', borderRadius: '18px' }}>
                  <div style={{ background: '#080D1A', borderRadius: '16px', padding: '24px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>{r.icon}</div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.3 }}>{r.title}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, flex: 1, margin: 0 }}>{r.desc}</p>
                    <button onClick={r.action} style={{ padding: '10px 18px', borderRadius: '100px', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s', alignSelf: 'flex-start' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,144,217,0.2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(74,144,217,0.1)')}
                    >
                      {r.label} <ArrowRight size={12} variant="Linear" />
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
          border: `1px solid ${focused ? 'rgba(74,144,217,0.45)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(74,144,217,0.08)' : 'none',
          borderRadius: '9px', padding: '11px 14px',
          color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit',
          outline: 'none', boxSizing: 'border-box', caretColor: 'var(--accent)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      />
    </div>
  )
}
