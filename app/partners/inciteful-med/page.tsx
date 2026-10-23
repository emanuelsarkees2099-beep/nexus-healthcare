import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import JsonLd, { breadcrumbSchema } from '@/components/JsonLd'
import { findPartner } from '@/lib/partners'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.axvohealth.com'
const partner = findPartner('inciteful-med')!
const P = partner.color
const P2 = partner.colorAlt
// Lighter tint of the brand purple for text on the dark background (contrast)
const PT = '#C08BF7'

export const metadata: Metadata = {
  title: 'Inciteful Med — AXVO Partner',
  description: 'AXVO has partnered with Inciteful Med, a health advocacy tool that searches 42M+ peer-reviewed papers and explains what the research says about your health, with every statement cited.',
  alternates: { canonical: `${BASE_URL}/partners/inciteful-med` },
  openGraph: {
    title: 'AXVO × Inciteful Med',
    description: 'Find affordable care with AXVO. Understand the evidence behind it with Inciteful Med.',
    url: `${BASE_URL}/partners/inciteful-med`,
    type: 'website',
  },
}

const FEATURES = [
  { n: '01', title: 'Plain-language answers', body: 'Ask a question the way you would ask a person. Inciteful Med searches more than 42 million peer-reviewed papers and explains what the research says at a high-school reading level.' },
  { n: '02', title: 'Every claim is cited', body: 'Each statement links to the exact passage in the study it came from — so you and your doctor can see precisely where the information comes from.' },
  { n: '03', title: 'Research centered on you', body: 'Add your health history or sync your medical records, and the search focuses on you rather than a single disease — including how your conditions interact.' },
  { n: '04', title: 'Better conversations with your doctor', body: 'Turn what you learn into specific questions for your next appointment, and keep asking follow-ups any time, in any language.' },
]

const STATS = [
  { v: '42M+', l: 'peer-reviewed papers searched' },
  { v: '145+', l: 'published papers cite its research engine' },
  { v: '$0', l: 'to start — free plan, no credit card' },
]

export default function IncitefulMedPartnerPage() {
  return (
    <AppShell>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', url: BASE_URL },
          { name: 'Partners', url: `${BASE_URL}/partners` },
          { name: 'Inciteful Med', url: `${BASE_URL}/partners/inciteful-med` },
        ])}
        id="schema-breadcrumb-partner"
      />

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '72px 24px 64px' }}>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 70% 55% at 50% 0%, ${P}26 0%, transparent 70%)`,
        }} />
        <div style={{ position: 'relative', maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 28 }}>
            <Link href="/partners" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Partners</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--text-2)' }}>Inciteful Med</span>
          </nav>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
            padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: PT,
            background: `${P}18`, border: `1px solid ${P}44`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: `linear-gradient(135deg, ${P}, ${P2})` }} />
            Official partner
          </div>

          {/* Co-branded lockup */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 32 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '0.18em', color: 'var(--text)' }}>AXVO</span>
            <span aria-hidden="true" style={{ fontSize: 22, color: 'var(--text-3)' }}>×</span>
            <span style={{
              display: 'inline-flex', padding: '14px 22px', borderRadius: 14,
              background: '#ffffff', boxShadow: `0 10px 40px ${P}33`,
            }}>
              <Image src={partner.logo} alt="Inciteful Med" width={220} height={40} unoptimized priority style={{ height: 40, width: 'auto' }} />
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800,
            lineHeight: 1.08, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 20,
          }}>
            Find the care.{' '}
            <span style={{ background: `linear-gradient(90deg, ${PT}, ${P2})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              Understand the evidence.
            </span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-2)', maxWidth: 620, margin: '0 auto 36px' }}>
            AXVO helps you find free and low-cost care. Inciteful Med helps you understand the medical research behind your
            diagnosis and treatment — so you can walk into every appointment informed.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={partner.url} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 26px', borderRadius: 100,
              background: `linear-gradient(135deg, ${P}, ${P2})`, color: '#fff', fontWeight: 700, fontSize: 15,
              textDecoration: 'none', boxShadow: `0 8px 28px ${P}55`,
            }}>
              Try Inciteful Med free ↗
            </a>
            {partner.interviewHref && (
              <Link href={partner.interviewHref} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 26px', borderRadius: 100,
                border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text)',
                fontWeight: 600, fontSize: 15, textDecoration: 'none',
              }}>
                Read our interview →
              </Link>
            )}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px 96px' }}>
        {/* ── Stats ── */}
        <section aria-label="Inciteful Med at a glance" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1,
          borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--border)',
          marginBottom: 12,
        }}>
          {STATS.map(s => (
            <div key={s.l} style={{ background: 'var(--bg2)', padding: '28px 24px', textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, letterSpacing: '-0.02em',
                background: `linear-gradient(135deg, ${PT}, ${P2})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              }}>{s.v}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </section>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginBottom: 88 }}>Figures as reported by Inciteful Med.</p>

        {/* ── Why we partnered ── */}
        <section style={{ marginBottom: 88 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: PT, marginBottom: 12 }}>Why we partnered</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
              Two halves of the same problem
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {[
              { who: 'AXVO', color: 'var(--accent)', q: '“Where can I get care I can afford?”', body: 'AXVO finds free clinics, sliding-scale health centers, cheaper medications, and the coverage programs you may qualify for — no insurance required.' },
              { who: 'Inciteful Med', color: PT, q: '“What does the research say about my situation?”', body: 'Inciteful Med searches the same peer-reviewed literature your doctor relies on and explains it in plain language, cited line by line.' },
            ].map(c => (
              <div key={c.who} style={{ padding: '30px 28px', borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.color, marginBottom: 14 }}>{c.who}</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 600, lineHeight: 1.35, color: 'var(--text)', marginBottom: 12 }}>{c.q}</p>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-2)' }}>{c.body}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text-2)', maxWidth: 720, margin: '32px auto 0', textAlign: 'center' }}>
            Getting through the door is only the first step. Patients who understand the evidence behind their care ask
            sharper questions and advocate for themselves — and that matters most for people the system already underserves.
          </p>
        </section>

        {/* ── Features ── */}
        <section style={{ marginBottom: 88 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: PT, marginBottom: 12 }}>What Inciteful Med does</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
              The research your doctor reads, made readable
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.n} style={{
                position: 'relative', padding: '28px 24px', borderRadius: 18, overflow: 'hidden',
                background: `linear-gradient(180deg, ${P}0F, transparent 60%), var(--bg2)`, border: '1px solid var(--border)',
              }}>
                <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12, color: PT, marginBottom: 18 }}>{f.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-2)' }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Founders + interview ── */}
        <section style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18, marginBottom: 72,
        }}>
          <div style={{ padding: '32px 28px', borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: PT, marginBottom: 20 }}>The team</div>
            {[
              { name: 'Erika Warren', role: 'Co-Founder & CEO' },
              { name: 'Mike Weishuhn', role: 'Co-Founder · creator of Inciteful Academic' },
            ].map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div aria-hidden="true" style={{
                  width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(135deg, ${P}, ${P2})`, color: '#fff', fontWeight: 700, fontSize: 15,
                }}>
                  {p.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 16 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{p.role}</div>
                </div>
              </div>
            ))}
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)', marginTop: 4 }}>
              Inciteful Med grew out of a family health scare — and is fully independent. No hospital, insurer, or drug maker
              has a say in what it shows you.
            </p>
          </div>

          {partner.interviewHref && (
            <Link href={partner.interviewHref} style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24,
              padding: '32px 28px', borderRadius: 20, textDecoration: 'none',
              background: `linear-gradient(135deg, ${P}2E, ${P2}14)`, border: `1px solid ${P}55`,
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: PT, marginBottom: 18 }}>Q&amp;A · Editorial</div>
                <blockquote style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.4, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                  “The problem was never patients doing research. It was the lack of reliable, trustworthy tools.”
                </blockquote>
                <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 14 }}>— Erika Warren, Co-Founder &amp; CEO</div>
              </div>
              <span style={{ fontWeight: 700, color: PT, fontSize: 15 }}>Read the full interview →</span>
            </Link>
          )}
        </section>

        {/* ── Closing CTA ── */}
        <section style={{
          textAlign: 'center', padding: '48px 28px', borderRadius: 24,
          background: 'var(--bg2)', border: '1px solid var(--border)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
            Use them together
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-2)', maxWidth: 560, margin: '0 auto 28px' }}>
            Find an affordable clinic with AXVO, then use Inciteful Med to prepare questions before your visit.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/search" style={{ padding: '13px 24px', borderRadius: 100, background: 'var(--accent)', color: '#07070F', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Find free care near you
            </Link>
            <a href={partner.url} target="_blank" rel="noopener noreferrer" style={{ padding: '13px 24px', borderRadius: 100, border: `1px solid ${P}66`, color: PT, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Visit incitefulmed.com ↗
            </a>
          </div>
        </section>

        <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-3)', textAlign: 'center', marginTop: 32, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
          Inciteful Med is an independent company. Its content is for educational purposes and is not medical advice —
          always talk with a clinician about decisions about your care.
        </p>
      </div>
    </AppShell>
  )
}
