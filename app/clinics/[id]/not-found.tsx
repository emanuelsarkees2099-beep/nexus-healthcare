import Link from 'next/link'
import { InfoCircle, Location } from 'iconsax-react'
import AppShell from '@/components/AppShell'
import EmergencyEscalation from '@/components/EmergencyEscalation'

/**
 * Renders when the server component in page.tsx calls notFound() for a
 * missing/removed clinic id. Same UI the old client-side "not found" state
 * used to show -- the only real difference is this now correctly returns a
 * genuine HTTP 404, instead of the previous client-rendered state which
 * always served 200 OK even for a clinic that doesn't exist (a "soft 404",
 * which search engines are explicitly documented to treat as a quality
 * signal against the whole domain, not just the one bad URL).
 */
export default function ClinicNotFound() {
  return (
    <AppShell>
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <InfoCircle size={40} color="var(--coral)" variant="Linear" style={{ marginBottom: '16px' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
          Clinic not found
        </h1>
        <p style={{ color: 'var(--text-2)', fontFamily: 'var(--font-inter)', marginBottom: '24px' }}>
          This clinic may have moved or been removed from our directory.
        </p>
        <Link href="/search" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--accent)', color: 'var(--bg)',
          padding: '10px 20px', borderRadius: '10px',
          textDecoration: 'none', fontWeight: 600, fontSize: '14px',
          fontFamily: 'var(--font-inter)',
        }}>
          <Location size={15} color="var(--bg)" variant="Linear" /> Find Another Clinic
        </Link>
        <div style={{ marginTop: '24px' }}>
          <EmergencyEscalation />
        </div>
      </div>
    </AppShell>
  )
}
