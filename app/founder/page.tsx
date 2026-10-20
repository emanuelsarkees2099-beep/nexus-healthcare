import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import JsonLd, { breadcrumbSchema } from '@/components/JsonLd'
import { CONTACT_EMAIL } from '@/lib/contact'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.axvohealth.com'
const PHOTO = '/founder-emanuel-sarkees.jpg'

export const metadata: Metadata = {
  title: 'Emanuel Sarkees — Founder of AXVO',
  description: 'Meet Emanuel Sarkees, founder and developer of AXVO Health — a free tool that helps uninsured Americans find free clinics, cheaper medications, and programs they qualify for.',
  alternates: { canonical: `${BASE_URL}/founder` },
  openGraph: {
    title: 'Emanuel Sarkees — Founder of AXVO',
    description: 'Why Emanuel Sarkees built AXVO, a free healthcare navigation tool for the uninsured.',
    url: `${BASE_URL}/founder`,
    type: 'profile',
    images: [{ url: `${BASE_URL}${PHOTO}`, width: 800, height: 800, alt: 'Emanuel Sarkees' }],
  },
}

const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Emanuel Sarkees',
  jobTitle: 'Founder & Developer',
  worksFor: { '@type': 'Organization', name: 'AXVO', url: BASE_URL },
  image: `${BASE_URL}${PHOTO}`,
  url: `${BASE_URL}/founder`,
  email: `mailto:${CONTACT_EMAIL}`,
}

const label: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--accent)', marginBottom: 14,
}

const body: React.CSSProperties = {
  fontSize: 16, lineHeight: 1.8, color: 'var(--text-2)', marginBottom: 18,
}

export default function FounderPage() {
  return (
    <AppShell>
      <JsonLd schema={PERSON_SCHEMA} id="schema-person-founder" />
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', url: BASE_URL },
          { name: 'About', url: `${BASE_URL}/about` },
          { name: 'Founder', url: `${BASE_URL}/founder` },
        ])}
        id="schema-breadcrumb-founder"
      />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '72px 24px 96px' }}>
        {/* ── Header ── */}
        <div style={{ display: 'flex', gap: 36, alignItems: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <Image
            src={PHOTO}
            alt="Emanuel Sarkees, founder of AXVO"
            width={200}
            height={200}
            priority
            style={{ borderRadius: '50%', border: '1px solid var(--border)', flexShrink: 0 }}
          />
          <div style={{ flex: '1 1 320px' }}>
            <div style={label}>Meet the founder</div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 700,
              letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text)', marginBottom: 10,
            }}>
              Emanuel Sarkees
            </h1>
            <p style={{ fontSize: 17, color: 'var(--text-2)', marginBottom: 18 }}>
              Founder &amp; Developer of AXVO Health
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={{
                display: 'inline-block', padding: '10px 20px', borderRadius: 100,
                background: 'var(--accent)', color: '#07070F', fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        {/* ── Why AXVO ── */}
        <section style={{ marginBottom: 56 }}>
          <div style={label}>Why I built AXVO</div>
          <p style={body}>
            I&apos;ve always had a passion for healthcare — and the more I&apos;ve learned about how it works in
            this country, the more I&apos;ve wanted to help fix it.
          </p>
          <p style={body}>
            Right now, millions of Americans go without care. Often it isn&apos;t because help doesn&apos;t exist.
            Free clinics, sliding-scale health centers, prescription assistance programs, and public coverage
            are out there. The problem is that they&apos;re scattered, hard to search, and easy to miss when
            you&apos;re already stressed about a bill or a symptom.
          </p>
          <p style={body}>
            I built AXVO to put that help in one free place. You enter where you are, and it shows you free and
            low-cost clinics nearby, cheaper ways to get your medications, and the programs you may qualify for.
            No insurance required, and no account needed to search.
          </p>
          <p style={body}>
            AXVO is still early, and I&apos;m improving it constantly. If something is wrong, missing, or
            confusing — or if you work with patients and want to collaborate — I genuinely want to hear from you.
          </p>
        </section>

        {/* ── Contact ── */}
        <section>
          <div style={label}>Get in touch</div>
          <p style={body}>
            Questions, feedback, partnerships, or a clinic listing that needs correcting — email me directly at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{CONTACT_EMAIL}</a>.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            <Link href="/search" style={{
              padding: '11px 20px', borderRadius: 100, background: 'var(--accent)', color: '#07070F',
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}>
              Find free care near you
            </Link>
            <Link href="/about" style={{
              padding: '11px 20px', borderRadius: 100, border: '1px solid var(--border)', color: 'var(--text)',
              fontWeight: 600, fontSize: 14, textDecoration: 'none',
            }}>
              About AXVO
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
