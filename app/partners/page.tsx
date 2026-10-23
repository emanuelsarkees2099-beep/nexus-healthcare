import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import { PARTNERS } from '@/lib/partners'
import { CONTACT_EMAIL } from '@/lib/contact'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.axvohealth.com'

export const metadata: Metadata = {
  title: 'Partners — AXVO',
  description: 'Organizations AXVO works with to help people find, understand, and afford care.',
  alternates: { canonical: `${BASE_URL}/partners` },
}

export default function PartnersPage() {
  return (
    <AppShell>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '72px 24px 96px' }}>
        <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>
          Partners
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-2)', margin: '0 0 40px' }}>
          Organizations we work with to help people find, understand, and afford care.
        </p>

        {PARTNERS.map(p => (
          <Link key={p.slug} href={`/partners/${p.slug}`} style={{
            display: 'block', padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none',
          }}>
            <span style={{ display: 'inline-flex', padding: '8px 12px', borderRadius: 8, background: '#fff', marginBottom: 14 }}>
              <Image src={p.logo} alt={p.name} width={150} height={26} unoptimized style={{ height: 26, width: 'auto' }} />
            </span>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text-2)', margin: '0 0 8px' }}>{p.tagline}</p>
            <span style={{ fontSize: 15, color: '#fff', textDecoration: 'underline', textUnderlineOffset: 3 }}>Read more</span>
          </Link>
        ))}

        <p style={{ fontSize: 15, color: 'var(--text-3)', marginTop: 40 }}>
          Interested in working with AXVO? Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}?subject=Partnership`} style={{ color: 'var(--text)' }}>{CONTACT_EMAIL}</a>.
        </p>
      </div>
    </AppShell>
  )
}
