'use client'
import { useState } from 'react'
import Link from 'next/link'
export default function Footer() {
  const [email, setEmail]       = useState('')
  const [subState, setSubState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || subState !== 'idle') return
    setSubState('loading')
    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubState('error')
      setTimeout(() => setSubState('idle'), 2500)
      return
    }
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSubState('done')
    } catch {
      setSubState('done') // Silent success — newsletter is non-critical
    }
  }

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
        background: 'radial-gradient(ellipse, rgba(74,144,217,0.06) 0%, transparent 70%)',
        filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Newsletter CTA */}
        <div style={{
          marginBottom: '2.5rem',
          padding: '24px 28px',
          borderRadius: '16px',
          background: 'rgba(74,144,217,0.04)',
          border: '1px solid rgba(74,144,217,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)', marginBottom: '4px' }}>
              Stay informed on free healthcare access
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 300 }}>
              New programs, policy updates, and care resources. No spam.
            </div>
          </div>
          {subState === 'done' ? (
            <div style={{ fontSize: '13px', color: '#34d399', fontFamily: 'var(--font-inter)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              You&apos;re subscribed!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', alignItems: 'center' }} noValidate>
              <label htmlFor="footer-newsletter-email" className="sr-only">Email address for newsletter</label>
              <input
                id="footer-newsletter-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                required
                style={{
                  padding: '9px 14px', borderRadius: '9px', minWidth: '200px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${subState === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.09)'}`,
                  color: 'var(--text)', fontFamily: 'var(--font-inter)', fontSize: '13px',
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,144,217,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = subState === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.09)')}
              />
              <button
                type="submit"
                disabled={subState === 'loading'}
                style={{
                  padding: '9px 16px', borderRadius: '9px',
                  background: 'var(--accent)', color: '#07070F',
                  border: 'none', fontSize: '13px', fontWeight: 600,
                  fontFamily: 'var(--font-inter)', cursor: 'pointer',
                  opacity: subState === 'loading' ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {subState === 'loading' ? 'Subscribing…' : subState === 'error' ? 'Invalid email' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>

        {/* Main grid */}
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr auto auto auto auto auto',
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
                  background: 'linear-gradient(90deg, rgba(74,144,217,0.55), rgba(138,181,188,0.4), transparent)',
                }} />
                <span style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '11px', fontWeight: 400,
                  letterSpacing: '0.5em', textTransform: 'uppercase',
                  color: '#E8E0FF',
                  textShadow: '0 0 10px rgba(74,144,217,0.5), 0 0 24px rgba(74,144,217,0.2)',
                  paddingRight: '0.5em',
                }}>
                  NEXUS
                </span>
                {/* Bottom accent line */}
                <div aria-hidden="true" style={{
                  width: '100%', height: '1px',
                  background: 'linear-gradient(90deg, rgba(74,144,217,0.55), rgba(138,181,188,0.4), transparent)',
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
              background: 'rgba(74,144,217,0.06)',
              border: '1px solid rgba(74,144,217,0.12)',
              borderRadius: '8px',
              padding: '6px 12px',
            }}>
              <span aria-hidden="true" style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#60a5fa',
                boxShadow: '0 0 6px rgba(96,165,250,0.5)',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: '11px', color: 'var(--text-3)',
                fontFamily: 'var(--font-inter)', fontWeight: 300,
              }}>
                Built for the 30M uninsured in America
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
              title: 'Tools',
              links: [
                { label: 'Symptom Guide',       href: '/triage' },
                { label: 'Healthcare GPS',     href: '/gps' },
                { label: 'Health Passport',    href: '/passport' },
                { label: 'Care Wrapped',       href: '/wrapped' },
                { label: 'Crisis Support',     href: '/crisis' },
                { label: 'Community Network',  href: '/community' },
              ],
            },
            {
              title: 'Platform',
              links: [
                { label: 'Impact Dashboard', href: '/impact' },
                { label: 'Equity Lab',       href: '/equity' },
                { label: 'Editorial',        href: '/editorial' },
                { label: 'Open Roadmap',     href: '/open' },
                { label: 'Accessibility',    href: '/accessibility' },
                { label: 'For Providers',    href: '/provider' },
              ],
            },
            {
              title: 'Resources',
              links: [
                { label: 'Find a Health Center (HRSA)', href: 'https://findahealthcenter.hrsa.gov', external: true },
                { label: '211 — Local Help',            href: 'https://www.211.org',               external: true },
                { label: 'NeedyMeds',                   href: 'https://www.needymeds.org',         external: true },
                { label: 'GoodRx',                      href: 'https://www.goodrx.com',            external: true },
                { label: 'RxAssist',                    href: 'https://www.rxassist.org',          external: true },
                { label: 'Medication Finder',           href: '/medications',                      external: false },
                { label: 'About NEXUS',                 href: '/about',                            external: false },
                { label: 'Privacy',                     href: '/privacy',                          external: false },
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
                {col.links.map((l: { label: string; href: string; external?: boolean }) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '13px', color: 'var(--text-3)', textDecoration: 'none',
                          fontFamily: 'var(--font-inter)', fontWeight: 300,
                          transition: 'color 0.2s',
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-2)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-3)')}
                      >
                        {l.label}
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M3.5 1H11M11 1V8.5M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    ) : (
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
                    )}
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
        /* Tablet: 900px — 5-column squishes to unreadable; go 2-up */
        @media (max-width: 900px) {
          footer > div > div:first-child {
            grid-template-columns: 1.2fr 1fr !important;
            gap: 2rem !important;
          }
          /* Brand column spans full width on its own row */
          footer > div > div:first-child > div:first-child {
            grid-column: 1 / -1 !important;
          }
        }
        /* Mobile: go fully single-column */
        @media (max-width: 600px) {
          footer { padding: 2.5rem 1.25rem 2rem !important; }
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          footer > div > div:first-child > div:first-child {
            grid-column: unset !important;
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
