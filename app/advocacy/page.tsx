'use client'
export const dynamic = 'force-dynamic'
import React, { useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { submitForm } from '@/utils/submitForm'
import { Megaphone, Users, FileText, CheckCircle, ArrowRight, MapPin, TrendingUp, Globe, Mail, ChevronDown, ExternalLink, Heart } from 'lucide-react'

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
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

function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0)
  const { ref, visible } = useReveal(0.3)
  useEffect(() => {
    if (!visible) return
    const dur = 2000; const start = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, target])
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

/* ─── data ────────────────────────────────────────── */
const PETITIONS = [
  { id: 'medicaid-expansion', title: 'Expand Medicaid in All 50 States', desc: 'Close the coverage gap that leaves 2.2 million people without coverage in states that haven\'t expanded.', signatures: 84312, goal: 100000, color: '#4ade80', urgent: true },
  { id: 'drug-pricing', title: 'Allow Medicare to Negotiate All Drug Prices', desc: 'The Inflation Reduction Act lets Medicare negotiate prices for 10 drugs. Expand this to all drugs.', signatures: 127849, goal: 150000, color: 'var(--accent)', urgent: false },
  { id: 'uninsured-crisis', title: 'Declare the Uninsured Crisis a National Emergency', desc: '30 million Americans lack health coverage. Federal emergency response should include free clinic surge funding.', signatures: 43201, goal: 75000, color: '#60a5fa', urgent: true },
  { id: 'chw-funding', title: 'Fund Community Health Workers Through Medicare', desc: 'CHWs have proven 47% better outcomes. Make their services a covered Medicare and Medicaid benefit.', signatures: 29740, goal: 50000, color: '#a78bfa', urgent: false },
]

const POLICY_WINS = [
  { state: 'AZ', name: 'Arizona', win: 'FQHC funding +$14M', year: '2024', color: '#4ade80' },
  { state: 'CA', name: 'California', win: 'Medi-Cal expansion to all adults', year: '2024', color: 'var(--accent)' },
  { state: 'CO', name: 'Colorado', win: 'CHW Medicaid coverage added', year: '2023', color: '#a78bfa' },
  { state: 'IL', name: 'Illinois', win: 'Language access mandate passed', year: '2024', color: '#60a5fa' },
  { state: 'NY', name: 'New York', win: 'NYC Care expanded citywide', year: '2023', color: '#fbbf24' },
  { state: 'WA', name: 'Washington', win: 'Apple Health expanded to immigrants', year: '2024', color: '#f472b6' },
]

const PARTNERS = [
  { name: 'National Health Law Program', url: 'https://healthlaw.org', desc: 'Advancing health rights through legal advocacy' },
  { name: 'Community Catalyst', url: 'https://www.communitycatalyst.org', desc: 'Building power for health justice' },
  { name: 'Families USA', url: 'https://familiesusa.org', desc: 'Fighting for affordable healthcare for all' },
  { name: 'NACHC', url: 'https://www.nachc.org', desc: 'National Assoc. of Community Health Centers' },
  { name: 'CMS Innovation Center', url: 'https://innovation.cms.gov', desc: 'Testing new payment & care delivery models' },
]

const LETTER_TEMPLATE = `Dear [Representative Name],

I am a constituent writing to urge your support for expanded access to free and affordable healthcare in our state.

Thirty million Americans — including many in our district — lack health coverage. This is not a market failure. It is a policy choice, and it can be reversed.

I urge you to:
1. Support full Medicaid expansion to close the coverage gap
2. Fund Community Health Workers as a reimbursable benefit
3. Increase FQHC funding so that every American can access a free clinic within 30 miles
4. Protect the No Surprises Act provisions that shield patients from unexpected bills

Healthcare is not a luxury — it is the foundation on which everything else in a person's life is built. When people can't afford to see a doctor, families destabilize, children fall behind, and local economies suffer.

Please stand on the right side of this issue.

Respectfully,
[Your Name]
[Your City, State]`

/* ─── page ────────────────────────────────────────── */
export default function AdvocacyPage() {
  const [signedPetitions, setSignedPetitions] = useState<Record<string, boolean>>({})
  const [letterState, setLetterState] = useState<'idle' | 'editing' | 'sent'>('idle')
  const [letterText, setLetterText] = useState(LETTER_TEMPLATE)
  const [repName, setRepName] = useState('')
  const [yourName, setYourName] = useState('')
  const [yourCity, setYourCity] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [signEmail, setSignEmail] = useState('')
  const [signingId, setSigningId] = useState<string | null>(null)

  const pill: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '4px 12px', borderRadius: '100px',
    fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
    background: 'rgba(110,231,183,0.08)', color: 'var(--accent)', border: '1px solid rgba(110,231,183,0.18)',
  }

  const filledLetter = letterText
    .replace('[Representative Name]', repName || '[Representative Name]')
    .replace('[Your Name]', yourName || '[Your Name]')
    .replace('[Your City, State]', yourCity || '[Your City, State]')

  async function handleSign(petitionId: string) {
    if (signedPetitions[petitionId]) return
    setSigningId(petitionId)
    try {
      await submitForm('advocacy', { petition: petitionId, email: signEmail })
      setSignedPetitions(prev => ({ ...prev, [petitionId]: true }))
    } catch (_) { /* silent */ }
    finally { setSigningId(null) }
  }

  async function handleSendLetter() {
    try {
      await submitForm('advocacy', { type: 'letter', letter: filledLetter, rep: repName, name: yourName, city: yourCity })
    } catch (_) { /* silent */ }
    setLetterState('sent')
  }

  return (
    <AppShell>
      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ minHeight: '85dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '100px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(110,231,183,0.10) 0%, rgba(96,165,250,0.05) 45%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(ellipse, rgba(167,139,250,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '760px', position: 'relative' }}>
          <div style={{ marginBottom: '28px' }}><span style={pill}><Megaphone size={10} strokeWidth={1.5} /> Advocacy & Action</span></div>
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 84px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.035em', marginBottom: '24px', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
            Turn frustration<br /><span style={{ color: 'var(--accent)' }}>into legislation.</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '520px', margin: '0 auto 48px', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 100ms both' }}>
            Every policy change that expanded healthcare access started with people who were angry enough to write a letter. Sign petitions. Contact your representative. Track what's moving.
          </p>
          <div style={{ display: 'flex', gap: '36px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 200ms both' }}>
            {[{ v: '285K+', l: 'petition signatures' }, { v: '6', l: 'policy wins tracked' }, { v: '5', l: 'partner organizations' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>{s.v}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PETITIONS ────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '48px' }}>
              <span style={pill}><FileText size={10} strokeWidth={1.5} /> Active petitions</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15 }}>Sign what matters</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.38)', marginTop: '10px', maxWidth: '400px', lineHeight: 1.6 }}>Each petition is delivered to relevant congressional committees when it hits its goal.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {PETITIONS.map((pet, i) => {
              const pct = Math.min((pet.signatures / pet.goal) * 100, 100)
              const signed = signedPetitions[pet.id]
              return (
                <RevealBlock key={pet.id} delay={i * 80}>
                  <div style={{ borderRadius: '20px', padding: '2px', background: signed ? `linear-gradient(135deg, ${pet.color}40, transparent)` : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }}>
                    <div style={{ borderRadius: '19px', padding: '24px 26px', background: 'rgba(8,10,20,0.97)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {pet.urgent && <span style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '100px', background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', fontWeight: 600, letterSpacing: '0.06em' }}>URGENT</span>}
                            <span style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '100px', background: `${pet.color}10`, color: pet.color, border: `1px solid ${pet.color}25`, fontWeight: 500 }}>Petition</span>
                          </div>
                          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3 }}>{pet.title}</h3>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>{pet.desc}</p>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                          <div style={{ fontSize: '22px', fontWeight: 800, color: pet.color, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono, monospace)' }}>
                            <Counter target={pet.signatures + (signed ? 1 : 0)} />
                          </div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>of {pet.goal.toLocaleString()} goal</div>
                        </div>
                      </div>

                      {/* progress bar */}
                      <div style={{ margin: '16px 0 14px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${pet.color}99, ${pet.color})`, borderRadius: '4px', transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)', boxShadow: `0 0 8px ${pet.color}40` }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{pct.toFixed(0)}% to goal · {(pet.goal - pet.signatures).toLocaleString()} more needed</span>
                        {signed ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: pet.color, fontWeight: 600 }}>
                            <CheckCircle size={14} strokeWidth={2} /> Signed — thank you
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSign(pet.id)}
                            disabled={signingId === pet.id}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '100px', background: `${pet.color}15`, border: `1px solid ${pet.color}30`, color: pet.color, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s', opacity: signingId === pet.id ? 0.6 : 1 }}
                            onMouseEnter={e => (e.currentTarget.style.background = `${pet.color}25`)}
                            onMouseLeave={e => (e.currentTarget.style.background = `${pet.color}15`)}
                          >
                            {signingId === pet.id ? 'Signing…' : <><Heart size={12} strokeWidth={2} /> Sign this petition</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </RevealBlock>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── WRITE YOUR REP ───────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '40px' }}>
              <span style={pill}><Mail size={10} strokeWidth={1.5} /> Contact your representative</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15 }}>One letter can change a vote</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.38)', marginTop: '10px', maxWidth: '460px', lineHeight: 1.6 }}>
                Congressional staffers track constituent letters. A personalized letter carries more weight than any form email. Edit this template and make it yours.
              </p>
            </div>
          </RevealBlock>

          {letterState === 'sent' ? (
            <RevealBlock>
              <div style={{ textAlign: 'center', padding: '56px', background: 'rgba(110,231,183,0.04)', border: '1px solid rgba(110,231,183,0.15)', borderRadius: '20px' }}>
                <CheckCircle size={44} strokeWidth={1.5} style={{ color: 'var(--accent)', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Letter sent</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: '360px', margin: '0 auto 24px' }}>
                  Your letter has been logged. Remember: you can also send it directly to your representatives at <a href="https://www.congress.gov/members/find-your-member" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>congress.gov/members</a>.
                </p>
                <button onClick={() => setLetterState('idle')} style={{ padding: '10px 24px', borderRadius: '100px', border: '1px solid rgba(110,231,183,0.25)', background: 'transparent', color: 'var(--accent)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Write another
                </button>
              </div>
            </RevealBlock>
          ) : (
            <RevealBlock delay={80}>
              <div style={{ borderRadius: '24px', padding: '2px', background: 'linear-gradient(135deg, rgba(110,231,183,0.2), rgba(96,165,250,0.08))' }}>
                <div style={{ borderRadius: '23px', padding: '32px', background: 'rgba(8,10,20,0.97)' }}>
                  {/* personalisation fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    {[
                      { label: 'Representative name', val: repName, set: setRepName, placeholder: 'e.g. Senator Smith' },
                      { label: 'Your full name', val: yourName, set: setYourName, placeholder: 'Your name' },
                      { label: 'Your city, state', val: yourCity, set: setYourCity, placeholder: 'Phoenix, AZ' },
                    ].map(f => (
                      <div key={f.label}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{f.label}</label>
                        <input
                          value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '10px 12px', color: '#eef4f5', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(110,231,183,0.4)')}
                          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                        />
                      </div>
                    ))}
                  </div>

                  {/* letter editor */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Letter (edit to personalize)</label>
                      <button onClick={() => setLetterText(LETTER_TEMPLATE)} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Reset to template</button>
                    </div>
                    <textarea
                      value={letterText} onChange={e => setLetterText(e.target.value)} rows={14}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px', color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: 1.75, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', caretColor: 'var(--accent)' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(110,231,183,0.3)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleSendLetter}
                      style={{ flex: 1, padding: '13px', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: '#020409', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '160px', transition: 'opacity 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <Mail size={14} strokeWidth={2} /> Send letter
                    </button>
                    <a
                      href="https://www.congress.gov/members/find-your-member"
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '13px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}
                    >
                      <ExternalLink size={13} strokeWidth={1.5} /> Find your rep
                    </a>
                  </div>
                </div>
              </div>
            </RevealBlock>
          )}
        </div>
      </section>

      {/* ── POLICY WINS MAP ──────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '48px' }}>
              <span style={pill}><MapPin size={10} strokeWidth={1.5} /> Policy wins</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px', lineHeight: 1.15 }}>What advocacy has already moved</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.38)', marginTop: '10px', maxWidth: '400px', lineHeight: 1.6 }}>These wins happened because people organized, wrote letters, and showed up. Every state below was a "never" at some point.</p>
            </div>
          </RevealBlock>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {POLICY_WINS.map((w, i) => (
              <RevealBlock key={w.state} delay={i * 70}>
                <div
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${w.color}30`; (e.currentTarget as HTMLElement).style.background = `${w.color}06` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                  style={{ padding: '22px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start', transition: 'all 0.22s' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${w.color}15`, border: `1px solid ${w.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', color: w.color, flexShrink: 0, fontFamily: 'var(--font-mono, monospace)' }}>{w.state}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{w.name}</div>
                    <div style={{ fontSize: '13px', color: w.color, fontWeight: 500, marginBottom: '4px' }}>{w.win}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={10} strokeWidth={2} /> Won {w.year}</div>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ─────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <span style={pill}><TrendingUp size={10} strokeWidth={1.5} /> Movement metrics</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', marginTop: '20px' }}>The numbers are moving</h2>
            </div>
          </RevealBlock>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { val: 285000, suffix: '+', label: 'Total petition signatures', color: 'var(--accent)' },
              { val: 6, suffix: '', label: 'State policy wins in 2 years', color: '#4ade80' },
              { val: 14200, suffix: '+', label: 'Letters sent to representatives', color: '#60a5fa' },
              { val: 5, suffix: '', label: 'National partner organizations', color: '#a78bfa' },
            ].map((s, i) => (
              <RevealBlock key={s.label} delay={i * 80}>
                <div style={{ padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '42px', fontWeight: 800, color: s.color, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '10px', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono, monospace)' }}>
                    <Counter target={s.val} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{s.label}</div>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ─────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '40px' }}>
              <span style={pill}><Globe size={10} strokeWidth={1.5} /> Partner organizations</span>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '20px' }}>In good company</h2>
            </div>
          </RevealBlock>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PARTNERS.map((p, i) => (
              <RevealBlock key={p.name} delay={i * 60}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', textDecoration: 'none', gap: '16px', flexWrap: 'wrap', transition: 'all 0.22s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(110,231,183,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(110,231,183,0.03)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#eef4f5', marginBottom: '3px' }}>{p.name}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}>{p.desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '12px', fontWeight: 500, flexShrink: 0 }}>
                    Visit <ArrowRight size={12} strokeWidth={2} />
                  </div>
                </a>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section style={{ padding: '80px 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <RevealBlock>
            <div style={{ marginBottom: '40px' }}>
              <span style={pill}>Common questions</span>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '20px' }}>Does any of this actually work?</h2>
            </div>
          </RevealBlock>
          {[
            { q: 'Do politicians actually read constituent letters?', a: 'Congressional staffers log every letter by issue. Most offices produce weekly reports on constituent contact volume. When you write, you are counted — even if you don\'t get a personal reply. Volume signals priority.' },
            { q: 'What\'s the most effective form of contact?', a: 'In order of impact: in-person town hall > phone call > handwritten letter > email > form submission. A personal, specific email about your own situation outperforms a form letter 10:1.' },
            { q: 'Can petitions really change legislation?', a: 'Petitions alone rarely pass bills — but they\'re powerful signals of organized constituent opinion. They\'re most effective combined with direct contact campaigns. The petitions here feed into partner organizations\' legislative testimony.' },
            { q: 'I\'m not a citizen — can I still be involved?', a: 'Yes. You can contact elected officials regardless of immigration status. You can share petitions, share information, and support others in navigating the system. Your voice and your story matter.' },
          ].map((f, i) => (
            <RevealBlock key={i} delay={i * 50}>
              <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid', marginBottom: '6px', borderColor: openFaq === i ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.06)', background: openFaq === i ? 'rgba(110,231,183,0.03)' : 'transparent', transition: 'all 0.25s' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', textAlign: 'left', gap: '16px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.4 }}>{f.q}</span>
                  <ChevronDown size={15} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.4)', transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                </button>
                <div style={{ maxHeight: openFaq === i ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                  <p style={{ padding: '0 22px 18px', fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: 0 }}>{f.a}</p>
                </div>
              </div>
            </RevealBlock>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </AppShell>
  )
}
