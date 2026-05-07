'use client'
import dynamic from 'next/dynamic'

const JourneyDiagram      = dynamic(() => import('@/components/JourneyDiagram'),      { ssr: false })
const VerificationDiagram = dynamic(() => import('@/components/VerificationDiagram'), { ssr: false })

export default function AnimatedDiagramsSection() {
  return (
    <section className="cv-auto" style={{ padding: '80px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(110,231,183,0.07)', border: '1px solid rgba(110,231,183,0.15)',
          marginBottom: '20px', fontSize: '11px', fontWeight: 600,
          color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          How NEXUS works
        </div>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '14px',
        }}>
          From symptom to care.<br />Transparently.
        </h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>
          Every step is visible. Every source is cited. Every match is explainable.
        </p>
      </div>

      {/* Journey diagram */}
      <div style={{
        padding: '32px', borderRadius: '20px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
          The patient journey
        </div>
        <JourneyDiagram />
      </div>

      {/* Verification diagram */}
      <div style={{
        padding: '32px', borderRadius: '20px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
          How we verify every clinic
        </div>
        <VerificationDiagram />
      </div>
    </section>
  )
}
