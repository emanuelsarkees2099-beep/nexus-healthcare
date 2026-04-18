'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{
        position: 'relative', zIndex: 2,
        borderTop: '1px solid var(--border2)',
        padding: '4rem 3rem 2.5rem',
      }}
    >
      {/* Top ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-80px', left: '50%',
        transform: 'translateX(-50%)',
        width: '600px', height: '80px',
        background: 'radial-gradient(ellipse, rgba(109,145,151,0.06) 0%, transparent 70%)',
        filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr auto auto auto',
          gap: '3rem', alignItems: 'start',
          marginBottom: '3rem',
        }}>
          {/* Brand column */}
          <div>
            {/* NEXUS in Orbitron */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'inline-flex', flexDirection: 'column',
                alignItems: 'flex-start', gap: '3px',
              }}>
                {/* Top accent line */}
                <div aria-hidden="true" style={{
                  width: '100%', height: '1px',
                  background: 'linear-gradient(90deg, rgba(109,145,151,0.55), rgba(138,181,188,0.4), transparent)',
                }} />
                <span style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '11px', fontWeight: 400,
                  letterSpacing: '0.5em', textTransform: 'uppercase',
                  color: '#E8E0FF',
                  textShadow: '0 0 10px rgba(109,145,151,0.5), 0 0 24px rgba(109,145,151,0.2)',
                  paddingRight: '0.5em',
                }}>
                  NEXUS
                </span>
                {/* Bottom accent line */}
                <div aria-hidden="true" style={{
                  width: '100%', height: '1px',
                  background: 'linear-gradient(90deg, rgba(109,145,151,0.55), rgba(138,181,188,0.4), transparent)',
                }} />
              </div>
            </div>

            <p style={{
              fontSize: '12px', color: 'var(--text-3)',
              fontFamily: 'var(--font-inter)', lineHeight: 1.75,
              maxWidth: '230px', fontWeight: 300,
            }}>
              Free healthcare access for every uninsured American.
              Built with care, not profit.
            </p>

            {/* Social-proof trust badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              marginTop: '1.25rem',
              background: 'rgba(109,145,151,0.06)',
              border: '1px solid rgba(109,145,151,0.12)',
              borderRadius: '8px',
              padding: '6px 12px',
            }}>
              <span aria-hidden="true" style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#4ade80',
                boxShadow: '0 0 6px rgba(74,222,128,0.5)',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: '11px', color: 'var(--text-3)',
                fontFamily: 'var(--font-inter)', fontWeight: 300,
              }}>
                30M+ Americans served nationwide
              </span>
            </div>
          </div>

          {/* Link columns */}
          {[
            {
              title: 'Product',
              links: [
                { label: 'Clinic Finder',         href: '/search' },
                { label: 'AI Care Pathways',       href: '/pathways' },
                { label: 'Programs & Benefits',    href: '/programs' },
                { label: 'Preventive Calendar',    href: '/calendar' },
              ],
            },
            {
              title: 'Community',
              links: [
                { label: 'CHW Network',   href: '/chw' },
                { label: 'Stories',       href: '/stories' },
                { label: 'Rights & Legal',href: '/rights' },
                { label: 'Advocacy Hub',  href: '/advocacy' },
              ],
            },
            {
              title: 'Platform',
              links: [
                { label: 'Impact Dashboard', href: '/impact' },
                { label: 'Accessibility',    href: '/accessibility' },
                { label: 'Languages',        href: '/languages' },
                { label: 'For Providers',    href: '/provider' },
              ],
            },
          ].map(col => (
            <div key={col.title}>
              <div style={{
                fontSize: '10px', fontWeight: 500, color: 'var(--text-3)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                marginBottom: '1rem', fontFamily: 'var(--font-inter)',
              }}>
                {col.title}
              </div>
              <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      style={{
                        fontSize: '13px', color: 'var(--text-3)', textDecoration: 'none',
                        fontFamily: 'var(--font-inter)', fontWeight: 300,
                        transition: 'color 0.2s',
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>
            © 2026{' '}
            <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 400 }}>
              NEXUS Health
            </Link>
            . A project for the 30 million uninsured.
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontStyle: 'italic', fontWeight: 300 }}>
              Healthcare is a right.
            </span>
            {/* Three dot separator + FQHC badge */}
            <div style={{
              fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)',
              background: 'var(--bg3)', border: '1px solid var(--border2)',
              borderRadius: '5px', padding: '3px 9px', letterSpacing: '0.04em',
              fontWeight: 300,
            }}>
              FQHC Partner Network
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer { padding: 2.5rem 1.25rem 2rem !important; }
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 480px) {
          footer > div > div:last-child {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </footer>
  )
}
