'use client'

export default function BeforeAfterBar() {
  return (
    <section className="cv-auto" style={{ padding: '80px 24px', maxWidth: '860px', margin: '0 auto' }}>
      <div style={{
        padding: '40px', borderRadius: '24px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '10px' }}>
            NEXUS vs. the old way
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
            The average uninsured patient makes 14 calls to find care. NEXUS users average 1.2.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Before */}
          <div style={{
            padding: '24px', borderRadius: '16px',
            background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#f87171', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Before NEXUS
            </div>
            {[
              { label: 'Calls to find a clinic', value: '14', unit: 'calls' },
              { label: 'Time to get an appointment', value: '6', unit: 'days' },
              { label: 'Cost with no guidance', value: '$1,847', unit: 'avg' },
              { label: 'Success rate', value: '34%', unit: '' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '13px',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                <span style={{ color: '#f87171', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>
                  {item.value} <span style={{ fontWeight: 400, fontSize: '11px' }}>{item.unit}</span>
                </span>
              </div>
            ))}
          </div>

          {/* After */}
          <div style={{
            padding: '24px', borderRadius: '16px',
            background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.2)',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
              With NEXUS
            </div>
            {[
              { label: 'Calls to find a clinic', value: '1.2', unit: 'calls', improvement: '12x' },
              { label: 'Time to get an appointment', value: '4', unit: 'hours', improvement: '36x' },
              { label: 'Cost with NEXUS guidance', value: '$0–$40', unit: 'avg', improvement: '98%' },
              { label: 'Success rate', value: '91%', unit: '', improvement: '2.7x' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '13px', gap: '8px',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>
                    {item.value} <span style={{ fontWeight: 400, fontSize: '11px' }}>{item.unit}</span>
                  </span>
                  <span style={{
                    padding: '1px 6px', borderRadius: '4px',
                    background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)',
                    fontSize: '10px', color: 'var(--accent)', fontWeight: 600,
                  }}>
                    {item.improvement} better
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
