import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import { PARTNERS } from '@/lib/partners'
import { CONTACT_EMAIL } from '@/lib/contact'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.axvohealth.com'

export const metadata: Metadata = {
  title: 'Partners — AXVO',
  description: 'Organizations AXVO works with to help uninsured and underinsured people find, understand, and afford care.',
  alternates: { canonical: `${BASE_URL}/partners` },
}

export default function PartnersPage() {
  return (
    <AppShell>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px 96px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>
            Partners
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 16 }}>
            Better together
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-2)', maxWidth: 560, margin: '0 auto' }}>
            Organizations we work with to help people find, understand, and afford the care they need.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {PARTNERS.map(p => (
            <Link key={p.slug} href={`/partners/${p.slug}`} style={{
              display: 'flex', flexDirection: 'column', gap: 18, padding: '28px 26px', borderRadius: 20,
              textDecoration: 'none', background: `linear-gradient(160deg, ${p.color}1A, transparent 55%), var(--bg2)`,
              border: `1px solid ${p.color}44`,
            }}>
              <span style={{ alignSelf: 'flex-start', display: 'inline-flex', padding: '10px 16px', borderRadius: 12, background: '#fff' }}>
                <Image src={p.logo} alt={p.name} width={160} height={30} unoptimized style={{ height: 30, width: 'auto' }} />
              </span>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-2)', flex: 1 }}>{p.tagline}</p>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#C08BF7' }}>Learn more →</span>
            </Link>
          ))}
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-3)', textAlign: 'center', marginTop: 56 }}>
          Interested in partnering with AXVO?{' '}
          <a href={`mailto:${CONTACT_EMAIL}?subject=Partnership`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{CONTACT_EMAIL}</a>
        </p>
      </div>
    </AppShell>
  )
}
