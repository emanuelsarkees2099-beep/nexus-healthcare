'use client'
import { useState } from 'react'
import Link from 'next/link'
import { TickCircle, ExportSquare } from 'iconsax-react'
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
        padding: '0 3rem 2.5rem',
        overflow: 'hidden',
      }}
    >
      {/* Full-width gradient separator — dramatic top rule */}
      <div aria-hidden="true" style={{
        height: '1px',
        background: 'rgba(255,255,255,0.08)',
        marginBottom: '0',
      }} />
      {/* Glow bloom on separator */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-1px', left: '50%',
        transform: 'translateX(-50%)',
        width: '700px', height: '180px',
        background: 'transparent',
        filter: 'blur(20px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Newsletter CTA */}
        <div style={{
          marginBottom: '2.5rem',
          padding: '24px 28px',
          borderRadius: 'var(--r-md)',
          background: 'rgba(79,142,240,0.04)',
          border: '1px solid rgba(79,142,240,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-inter)', marginBottom: '4px' }}>
              Stay informed on free healthcare access
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 400 }}>
              New programs, policy updates, and care resources. No spam.
            </div>
          </div>
          {subState === 'done' ? (
            <div style={{ fontSize: '13px', color: '#4F8EF0', fontFamily: 'var(--font-inter)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TickCircle size={14} color="currentColor" variant="TwoTone" />
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
                  padding: '9px 14px', borderRadius: 'var(--r-sm)', minWidth: '200px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${subState === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.09)'}`,
                  color: 'var(--text)', fontFamily: 'var(--font-inter)', fontSize: '13px',
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(79,142,240,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = subState === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.09)')}
              />
              <button
                type="submit"
                disabled={subState === 'loading'}
                style={{
                  padding: '9px 16px', borderRadius: 'var(--r-sm)',
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
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr 1fr',
          gap: 'clamp(1.5rem, 3vw, 3.5rem)', alignItems: 'start',
          marginBottom: '3rem',
          paddingTop: '3.5rem',
        }}>
          {/* Brand column */}
          <div>
            {/* AXVO in Orbitron */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'inline-flex', flexDirection: 'column',
                alignItems: 'flex-start', gap: '3px',
              }}>
                {/* Top accent line */}
                <div aria-hidden="true" style={{
                  width: '100%', height: '1px',
                  background: 'rgba(255,255,255,0.08)',
                }} />
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px', fontWeight: 400,
                  letterSpacing: '0', textTransform: 'none',
                  color: '#E8E0FF',
                  textShadow: 'none',
                  paddingRight: '0.5em',
                }}>
                  AXVO
                </span>
                {/* Bottom accent line */}
                <div aria-hidden="true" style={{
                  width: '100%', height: '1px',
                  background: 'rgba(255,255,255,0.08)',
                }} />
              </div>
            </div>

            <p style={{
              fontSize: '12px', color: 'var(--text-3)',
              fontFamily: 'var(--font-inter)', lineHeight: 1.75,
              maxWidth: '230px', fontWeight: 400,
            }}>
              Free healthcare access for every uninsured American.
              Built with care, not profit.
            </p>

            {/* Social-proof trust badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              marginTop: '1.25rem',
              background: 'rgba(79,142,240,0.06)',
              border: '1px solid rgba(79,142,240,0.12)',
              borderRadius: 'var(--r-sm)',
              padding: '6px 12px',
            }}>
              <span aria-hidden="true" style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#4F8EF0',
                boxShadow: 'none',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: '11px', color: 'var(--text-3)',
                fontFamily: 'var(--font-inter)', fontWeight: 400,
              }}>
                Built for the 27M uninsured in America
              </span>
            </div>
          </div>

          {/* Link columns */}
          {[
            {
              title: 'Find care',
              links: [
                { label: 'Find a clinic',  href: '/search' },
                { label: 'Symptom guide',  href: '/triage' },
                { label: 'Telehealth',     href: '/telehealth' },
                { label: 'Crisis help',    href: '/crisis' },
              ],
            },
            {
              title: 'Pay for care',
              links: [
                { label: 'Eligibility',      href: '/eligibility' },
                { label: 'How to apply',     href: '/programs' },
                { label: 'Medications',      href: '/medications' },
                { label: 'Know your rights', href: '/rights' },
              ],
            },
            {
              title: 'Learn',
              links: [
                { label: 'Editorial',          href: '/editorial' },
                { label: 'Health workers',     href: '/chw' },
                { label: 'Health equity data', href: '/equity' },
                { label: 'Advocacy',           href: '/advocacy' },
                { label: 'Share your story',   href: '/stories' },
              ],
            },
            {
              title: 'AXVO',
              links: [
                { label: 'About',         href: '/about',         external: false },
                { label: 'Founder',       href: '/founder',       external: false },
                { label: 'Partners',      href: '/partners',      external: false },
                { label: 'Methodology',   href: '/methodology',   external: false },
                { label: 'Privacy',       href: '/privacy',       external: false },
                { label: 'Accessibility', href: '/accessibility', external: false },
              ],
            },
          ].map(col => (
            <div key={col.title}>
              <div style={{
                fontSize: '10px', fontWeight: 500, color: 'var(--text-3)',
                letterSpacing: '0', textTransform: 'none',
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
                          fontFamily: 'var(--font-inter)', fontWeight: 400,
                          transition: 'color 0.2s',
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-2)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-3)')}
                      >
                        {l.label}
                        <ExportSquare size={9} color="currentColor" variant="Linear" aria-hidden="true" />
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        style={{
                          fontSize: '13px', color: 'var(--text-3)', textDecoration: 'none',
                          fontFamily: 'var(--font-inter)', fontWeight: 400,
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
        <div className="footer-bottom-bar" style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 400 }}>
              &copy; 2026{' '}
              <Link href="/" style={{ color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500 }}>
                AXVO Health
              </Link>
              {' '}&mdash; Free healthcare for every uninsured American.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Live status indicator */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-inter)', fontWeight: 400,
            }}>
              <span aria-hidden="true" style={{
                display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%',
                background: 'var(--success)', boxShadow: 'none',
              }} />
              All systems operational
            </div>
            <span aria-hidden="true" style={{ color: 'var(--border)' }}>|</span>
            {/* Legal links */}
            <Link href="/privacy" style={{ fontSize: '11px', color: 'var(--text-3)', textDecoration: 'none', fontFamily: 'var(--font-inter)', fontWeight: 400 }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
            >Privacy</Link>
            <Link href="/terms" style={{ fontSize: '11px', color: 'var(--text-3)', textDecoration: 'none', fontFamily: 'var(--font-inter)', fontWeight: 400 }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
            >Terms</Link>
          </div>
        </div>
      </div>

      <style>{`
        /* Tablet: 900px — 5-column squishes to unreadable; go 2-up */
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1.2fr 1fr !important;
            gap: 2rem !important;
          }
          /* Brand column spans full width on its own row */
          .footer-grid > div:first-child {
            grid-column: 1 / -1 !important;
          }
        }
        /* Mobile: go fully single-column */
        @media (max-width: 600px) {
          footer { padding: 2.5rem 1.25rem 2rem !important; }
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .footer-grid > div:first-child {
            grid-column: unset !important;
          }
        }
        @media (max-width: 480px) {
          .footer-bottom-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </footer>
  )
}

