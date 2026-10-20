import Link from 'next/link'
import AppShell from '@/components/AppShell'

/**
 * Placeholder for features that aren't real yet. Used instead of shipping
 * a page that looks finished but quietly does nothing (e.g. a form that
 * shows "submitted!" without saving anything).
 */
export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <AppShell>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', marginBottom: 20, padding: '4px 12px', borderRadius: 100,
          fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--accent)', background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.18)',
        }}>
          Coming soon
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>
          {title}
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-2)', marginBottom: 32 }}>
          {description}
        </p>
        <Link href="/search" style={{
          display: 'inline-block', padding: '12px 22px', borderRadius: 100,
          background: 'var(--accent)', color: '#07070F', fontWeight: 700, fontSize: 14, textDecoration: 'none',
        }}>
          Find free care near you
        </Link>
      </div>
    </AppShell>
  )
}
