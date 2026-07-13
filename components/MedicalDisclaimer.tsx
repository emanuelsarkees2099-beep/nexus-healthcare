'use client'
/**
 * MedicalDisclaimer — the universal "not medical advice" notice.
 *
 * Required on any surface that could be mistaken for clinical guidance:
 * triage, crisis, search results, clinic detail, eligibility.
 *
 * Two variants:
 *   'banner'  — full notice with the 911 line, for tool pages (triage/crisis)
 *   'inline'  — one compact line, for result/listing pages
 *
 * This is legal-floor content: NEXUS is a navigation tool, not a provider.
 */
import { InfoCircle } from 'iconsax-react'

export default function MedicalDisclaimer({
  variant = 'inline',
  className = '',
}: {
  variant?: 'banner' | 'inline'
  className?: string
}) {
  if (variant === 'banner') {
    return (
      <div
        role="note"
        aria-label="Medical disclaimer"
        className={className}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.20)',
          borderRadius: 'var(--r-md)',
          padding: '12px 14px',
          maxWidth: '640px',
          margin: '0 auto',
        }}
      >
        <InfoCircle size={16} variant="Bold" color="var(--warning)" style={{ flexShrink: 0, marginTop: '1px' }} aria-hidden="true" />
        <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.55, color: 'var(--text-2)', fontFamily: 'var(--font-inter)' }}>
          <strong style={{ color: 'var(--text)', fontWeight: 600 }}>This is not medical advice.</strong>{' '}
          NEXUS helps you find care — it does not diagnose or treat. In a medical
          emergency, call <a href="tel:911" style={{ color: 'var(--warning)', fontWeight: 600, textDecoration: 'none' }}>911</a>.
          In a mental-health crisis, call or text <a href="tel:988" style={{ color: 'var(--warning)', fontWeight: 600, textDecoration: 'none' }}>988</a>.
          Always confirm details directly with the clinic.
        </p>
      </div>
    )
  }

  return (
    <p
      role="note"
      aria-label="Medical disclaimer"
      className={className}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center',
        fontSize: '11.5px', lineHeight: 1.5, color: 'var(--text-3)',
        fontFamily: 'var(--font-inter)', margin: 0,
      }}
    >
      <InfoCircle size={12} variant="Linear" color="var(--text-3)" style={{ flexShrink: 0 }} aria-hidden="true" />
      Not medical advice. Confirm details with the clinic. Emergency? Call 911.
    </p>
  )
}
