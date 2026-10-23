import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import JsonLd, { breadcrumbSchema } from '@/components/JsonLd'
import { findPartner } from '@/lib/partners'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.axvohealth.com'
const partner = findPartner('inciteful-med')!

export const metadata: Metadata = {
  title: 'Inciteful Med — AXVO Partner',
  description: 'AXVO is partnering with Inciteful Med, a tool that searches peer-reviewed medical research and explains what it says about your health, with every statement cited.',
  alternates: { canonical: `${BASE_URL}/partners/inciteful-med` },
  openGraph: {
    title: 'AXVO is partnering with Inciteful Med',
    description: 'A tool that helps patients understand the medical research behind their care.',
    url: `${BASE_URL}/partners/inciteful-med`,
    type: 'website',
  },
}

const SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif'
const body: React.CSSProperties = { fontFamily: SERIF, fontSize: 19, lineHeight: 1.75, color: 'rgba(255,255,255,0.82)', margin: '0 0 22px' }
const h2: React.CSSProperties = { fontFamily: 'var(--font-inter)', fontSize: 19, fontWeight: 700, color: '#fff', margin: '44px 0 14px' }
const link: React.CSSProperties = { color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'rgba(255,255,255,0.35)' }

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

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '72px 24px 96px' }}>
        <Link href="/partners" style={{ fontSize: 14, color: 'var(--text-3)', textDecoration: 'none' }}>
          ← Partners
        </Link>

        <div style={{ margin: '40px 0 28px' }}>
          <span style={{ display: 'inline-flex', padding: '10px 14px', borderRadius: 8, background: '#fff' }}>
            <Image src={partner.logo} alt="Inciteful Med" width={180} height={32} unoptimized priority style={{ height: 32, width: 'auto' }} />
          </span>
        </div>

        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 700, lineHeight: 1.15, color: '#fff', margin: '0 0 24px' }}>
          AXVO is partnering with Inciteful Med
        </h1>

        <p style={body}>
          A lot of what AXVO does is help people find a clinic they can afford. But a cheap appointment doesn&apos;t help
          much if you walk out confused about your diagnosis or unsure what to ask. Inciteful Med works on that second
          part, which is why I&apos;m glad to be partnering with them.
        </p>

        <h2 style={h2}>What Inciteful Med does</h2>
        <p style={body}>
          You ask a health question in plain language. Inciteful Med searches more than 42 million peer-reviewed papers,
          the same research your doctor relies on, and explains what it says. Every statement links to the exact passage
          it came from, so you and your doctor can check it.
        </p>
        <p style={body}>
          You can also add your health history or connect your medical records, and it will look at the research around
          your situation specifically instead of a single condition. It&apos;s free to start, and the company is
          independent: no hospital, insurer, or drug maker has a say in what it shows you.
        </p>

        <h2 style={h2}>How they fit together</h2>
        <p style={body}>
          Use <Link href="/search" style={link}>AXVO</Link>{' '}to find a free or low-cost clinic near you. Before your visit,
          use Inciteful Med to read up on what you&apos;re dealing with and write down the questions you want to ask.
        </p>

        <h2 style={h2}>Who&apos;s behind it</h2>
        <p style={body}>
          Inciteful Med was started by Erika Warren (co-founder and CEO) and Mike Weishuhn, who built the research search
          engine it runs on after a family member got sick. I interviewed Erika about how it started and what she&apos;s
          seen since.
        </p>
        <p style={body}>
          <Link href="/editorial/inciteful-med-interview" style={link}>Read the interview with Erika Warren</Link>
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 36 }}>
          <a href={partner.url} target="_blank" rel="noopener noreferrer" style={{
            padding: '12px 22px', borderRadius: 8, background: '#fff', color: '#111',
            fontWeight: 600, fontSize: 15, textDecoration: 'none',
          }}>
            Visit incitefulmed.com
          </a>
          <Link href="/search" style={{
            padding: '12px 22px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
            fontWeight: 600, fontSize: 15, textDecoration: 'none',
          }}>
            Find a clinic on AXVO
          </Link>
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 48 }}>
          Emanuel Sarkees, founder of AXVO · October 22, 2026
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-3)', marginTop: 8 }}>
          Inciteful Med is an independent company. Its content is educational and isn&apos;t medical advice.
        </p>
      </div>
    </AppShell>
  )
}
