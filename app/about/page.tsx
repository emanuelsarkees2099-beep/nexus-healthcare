'use client'
import AppShell from '@/components/AppShell'
import Link from 'next/link'

const TEAM_VALUES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: 'Built for people, not profit',
    body: 'NEXUS is a mission-driven project with zero venture capital, no advertising, and no data monetization. Our only goal is connecting uninsured Americans to the care they are legally entitled to.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: 'Radical transparency',
    body: 'Every stat we show is verified. Every number is sourced. When data is unavailable we show a dash — we would rather show nothing than mislead you. Our open roadmap is public.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Community health workers first',
    body: 'Real Community Health Workers (CHWs) are embedded in the platform. They know local resources, speak your language, and provide human guidance that no algorithm can replicate.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: 'Your privacy is non-negotiable',
    body: 'Nothing you enter into symptom tools, search, or forms leaves your device in an identifiable form. We do not sell data, we do not share with insurers, and we never will.',
  },
]

const HRSA_FACTS = [
  { stat: '1,400+',    label: 'HRSA-funded health center organizations' },
  { stat: '14,000+',  label: 'service delivery sites across the U.S.' },
  { stat: '30M',      label: 'patients served annually by FQHCs' },
  { stat: '$0',       label: 'cost to use NEXUS, always' },
]

export default function AboutPage() {
  return (
    <AppShell>
      <style>{`
        .about-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border2);
          border-radius: 20px;
          padding: 28px;
          transition: border-color 0.2s ease;
        }
        .about-card:hover { border-color: rgba(74,144,217,0.25); }
        @media (max-width: 600px) {
          .about-facts-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .about-values-grid { grid-template-columns: 1fr !important; }
          .about-cta-row { flex-direction: column !important; }
          .about-split-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Hero */}
      <section style={{
        padding: 'clamp(80px, 12vw, 140px) 24px 80px',
        maxWidth: '760px', margin: '0 auto',
        textAlign: 'center', position: 'relative',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(74,144,217,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)',
          marginBottom: '28px', fontSize: '11px', fontWeight: 600,
          color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase',
          fontFamily: 'var(--font-inter)',
        }}>
          <span aria-hidden style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
          Our mission
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.2rem, 6vw, 4rem)',
          fontWeight: 800, lineHeight: 1.05,
          letterSpacing: '-0.035em', marginBottom: '24px',
        }}>
          Healthcare is a right.<br />
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>We built the infrastructure.</em>
        </h1>

        <p style={{
          fontSize: '17px', color: 'var(--text-2)',
          fontFamily: 'var(--font-inter)', fontWeight: 300,
          lineHeight: 1.8, maxWidth: '580px', margin: '0 auto 40px',
        }}>
          30 million Americans are uninsured. Tens of millions more are underinsured. NEXUS exists to close the gap between who needs care and who can find it — using technology to surface the federally-funded, sliding-scale, and free resources that were already there.
        </p>

        <div className="about-cta-row" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/search"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--accent)', color: '#07070F',
              border: 'none', borderRadius: '12px', padding: '14px 28px',
              fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none', letterSpacing: '0.01em',
              boxShadow: '0 4px 20px rgba(74,144,217,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(74,144,217,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(74,144,217,0.3)' }}
          >
            Find free care near you
          </Link>
          <Link
            href="/open"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'transparent', color: 'var(--text-2)',
              border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 24px',
              fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 400,
              textDecoration: 'none',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'rgba(74,144,217,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            View public roadmap →
          </Link>
        </div>
      </section>

      {/* HRSA facts strip */}
      <section
        aria-label="Key facts about NEXUS and HRSA health centers"
        style={{
          borderTop: '1px solid var(--border2)', borderBottom: '1px solid var(--border2)',
          padding: '3rem 24px',
        }}
      >
        <div
          className="about-facts-grid"
          style={{
            maxWidth: '900px', margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
          }}
        >
          {HRSA_FACTS.map(f => (
            <div key={f.stat} style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 700, letterSpacing: '-0.03em',
                color: 'var(--text)', marginBottom: '6px', lineHeight: 1,
              }}>
                {f.stat}
              </div>
              <div style={{
                fontSize: '12px', color: 'var(--text-3)',
                fontFamily: 'var(--font-inter)', lineHeight: 1.5,
              }}>
                {f.label}
              </div>
            </div>
          ))}
        </div>
        <p style={{
          textAlign: 'center', marginTop: '1.5rem',
          fontSize: '11px', color: 'var(--text-3)', opacity: 0.6,
          fontFamily: 'var(--font-inter)',
        }}>
          Source: HRSA Health Center Program, 2024 data.
        </p>
      </section>

      {/* Values */}
      <section style={{ padding: '80px 24px', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '11px', fontWeight: 400, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--accent)',
            marginBottom: '1rem', fontFamily: 'var(--font-inter)',
          }}>
            <span aria-hidden style={{ display: 'inline-block', width: '16px', height: '1px', background: 'var(--accent)' }} />
            What we believe
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em',
          }}>
            How we build
          </h2>
        </div>

        <div
          className="about-values-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {TEAM_VALUES.map(v => (
            <div key={v.title} className="about-card">
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', marginBottom: '18px',
              }}>
                {v.icon}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px', fontWeight: 600,
                letterSpacing: '-0.01em', marginBottom: '10px',
                color: 'var(--text)',
              }}>
                {v.title}
              </h3>
              <p style={{
                fontSize: '13px', color: 'var(--text-2)',
                fontFamily: 'var(--font-inter)', fontWeight: 300,
                lineHeight: 1.75, margin: 0,
              }}>
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What NEXUS is and isn't */}
      <section style={{
        padding: '0 24px 80px', maxWidth: '800px', margin: '0 auto',
      }}>
        <div style={{
          background: 'rgba(74,144,217,0.04)',
          border: '1px solid rgba(74,144,217,0.15)',
          borderRadius: '24px', padding: '40px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700,
            letterSpacing: '-0.02em', marginBottom: '28px', color: 'var(--text)',
          }}>
            What NEXUS is — and what it isn&apos;t
          </h2>
          <div
            className="about-split-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}
          >
            {[
              {
                label: '✓ NEXUS is',
                color: 'var(--accent)',
                items: [
                  'A directory of verified free & sliding-scale clinics',
                  'A benefits eligibility navigator (Medicaid, ACA, HRSA)',
                  'A resource matching tool for uninsured patients',
                  'A connection point to real Community Health Workers',
                  'A patient rights reference guide',
                  'Always free, with no ads or data sales',
                ],
              },
              {
                label: '✗ NEXUS is not',
                color: '#f87171',
                items: [
                  'A licensed medical provider or telemedicine service',
                  'A diagnosis or treatment recommendation tool',
                  'An insurance company or insurance broker',
                  'A replacement for professional medical advice',
                  'A crisis hotline — call 988 for mental health crises',
                ],
              },
            ].map(col => (
              <div key={col.label}>
                <div style={{
                  fontSize: '11px', fontWeight: 600, color: col.color,
                  fontFamily: 'var(--font-inter)', letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: '16px',
                }}>
                  {col.label}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.items.map(item => (
                    <li key={item} style={{
                      fontSize: '13px', color: 'var(--text-2)',
                      fontFamily: 'var(--font-inter)', fontWeight: 300,
                      lineHeight: 1.6, display: 'flex', gap: '8px', alignItems: 'flex-start',
                    }}>
                      <span style={{ color: col.color, fontWeight: 600, flexShrink: 0, marginTop: '1px' }}>·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data sources */}
      <section style={{
        borderTop: '1px solid var(--border2)',
        padding: '60px 24px 80px', maxWidth: '760px', margin: '0 auto',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700,
          letterSpacing: '-0.02em', marginBottom: '24px',
        }}>
          Our data sources
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { name: 'HRSA Health Center Program', desc: 'All federally-qualified health centers (FQHCs) — the foundation of our clinic directory.', href: 'https://findahealthcenter.hrsa.gov' },
            { name: 'health.gov / HHS Open Data', desc: 'Federal health program eligibility rules, updated as regulations change.', href: 'https://health.gov' },
            { name: '211 Network', desc: 'Local social service resources including food, housing, and healthcare.', href: 'https://www.211.org' },
            { name: 'NeedyMeds', desc: 'Prescription assistance programs and free/low-cost medication resources.', href: 'https://www.needymeds.org' },
            { name: 'Community submissions', desc: 'Verified additions from CHWs and community members, reviewed before publishing.', href: null },
          ].map(s => (
            <div key={s.name} style={{
              display: 'flex', gap: '16px', alignItems: 'flex-start',
              padding: '16px 20px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border2)',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--accent)', flexShrink: 0, marginTop: '6px',
              }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px', fontFamily: 'var(--font-inter)' }}>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                      {s.name} ↗
                    </a>
                  ) : s.name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 300, lineHeight: 1.6 }}>
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '0 24px 120px', maxWidth: '600px', margin: '0 auto',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
          fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1,
          marginBottom: '16px',
        }}>
          Ready to find care?
        </h2>
        <p style={{
          fontSize: '15px', color: 'var(--text-2)',
          fontFamily: 'var(--font-inter)', fontWeight: 300,
          lineHeight: 1.8, marginBottom: '32px',
        }}>
          No account, no insurance, no judgment. Just care.
        </p>
        <div className="about-cta-row" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/search"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--accent)', color: '#07070F',
              border: 'none', borderRadius: '12px', padding: '13px 24px',
              fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Find a free clinic
          </Link>
          <Link
            href="/programs"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'transparent', color: 'var(--text-2)',
              border: '1px solid var(--border)', borderRadius: '12px', padding: '13px 24px',
              fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 400,
              textDecoration: 'none',
            }}
          >
            Check program eligibility
          </Link>
        </div>
      </section>
    </AppShell>
  )
}
