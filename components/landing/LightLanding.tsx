'use client'
/**
 * NEXUS — Light Landing v2 ("Paper Clinic / Blue Pulse")
 *
 * Attio-formula bones, NEXUS voice:
 *   • Warm paper canvas, ink typography, ELECTRIC BLUE as the one accent
 *   • Dark product frames on the light page (Vercel-style contrast shots)
 *   • Signature motif: an EKG pulse line — the heartbeat of the product —
 *     used as section dividers and in the CTA band. Draws once in view.
 *   • Linear/Vercel-length page: 13 beats, alternating rhythm
 *
 * Self-contained: scoped .ll- classes, no dark-theme token deps.
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/* ── Demo rows for the hero frame (illustrative UI, labeled Preview) ── */
const DEMO_ROWS = [
  { name: 'Clinica Adelante',     type: 'FQHC',        dist: '1.2 mi', cost: '$0',            costKind: 'free',  status: 'Open · closes 6 PM',  open: true  },
  { name: 'Mountain Park Health', type: 'FQHC',        dist: '2.4 mi', cost: '$0',            costKind: 'free',  status: 'Open · closes 8 PM',  open: true  },
  { name: 'Valle del Sol',        type: 'Community',   dist: '2.8 mi', cost: 'Sliding scale', costKind: 'slide', status: 'Opens tomorrow 8 AM', open: false },
  { name: 'St. Vincent de Paul',  type: 'Free clinic', dist: '3.5 mi', cost: '$0',            costKind: 'free',  status: 'Open · closes 5 PM',  open: true  },
  { name: 'Wesley Health Center', type: 'FQHC',        dist: '4.1 mi', cost: '$0–$40',        costKind: 'slide', status: 'Open · closes 7 PM',  open: true  },
]

const STEPS = [
  { n: '01', t: 'Tell us what you need', d: 'A symptom, a specialty, or just your ZIP code. Anonymous — no account, ever.' },
  { n: '02', t: 'See real options, ranked', d: 'Free clinics, sliding-scale care, and programs you qualify for — sorted by distance and cost.' },
  { n: '03', t: 'Call, book, or walk in', d: 'Live hours, phone numbers, and directions in your language. Most visits cost $0.' },
]

const TOOLS = [
  { t: 'Health Passport',   d: 'Your visits, meds, and records in one place you control. Show it at any front desk.', href: '/passport',    chip: 'Records' },
  { t: 'Medication savings',d: 'Patient-assistance programs and discounts that cut prescription costs by up to 90%.',  href: '/medications', chip: 'Savings' },
  { t: 'Crisis support',    d: '24/7 crisis lines, warm lines, and walk-in mental health resources — works offline.',  href: '/crisis',      chip: '24/7' },
  { t: 'Kids health guide', d: 'Health education built for children and families — habits, rights, and courage.',      href: '/kids',        chip: 'Family' },
]

const FAQS = [
  { q: 'Is NEXUS really free?', a: 'Yes — completely. No subscriptions, no hidden fees, no premium tier. NEXUS exists to connect uninsured people with care, not to make money from them.' },
  { q: 'Do I need insurance to use the clinics NEXUS finds?', a: 'No. We specialize in free clinics, FQHCs (federally required to see you regardless of ability to pay), and sliding-scale care designed for people without insurance.' },
  { q: 'Do I need an account?', a: 'No. Search, triage, and eligibility all work anonymously. An account is only needed if you want to save clinics or use the Health Passport.' },
  { q: 'What documents do I need at a free clinic?', a: 'It varies, but many free clinics require nothing at all. FQHCs may ask for proof of income to set your sliding-scale fee — but they must see you either way.' },
  { q: 'What if I don’t speak English?', a: 'NEXUS works in 48 languages, and we tag clinics that offer interpreters or bilingual staff. Many results include Spanish-speaking providers.' },
  { q: 'Is this for emergencies?', a: 'No — if you are experiencing a medical emergency, call 911 now. Emergency rooms must treat you regardless of insurance or ability to pay (EMTALA).' },
]

/* ── EKG pulse line — the signature. Draws once when scrolled into view. ── */
function PulseLine({ tint = 'blue' }: { tint?: 'blue' | 'white' }) {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('drawn'); io.disconnect() }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <svg
      ref={ref}
      className={`ll-pulse ${tint}`}
      viewBox="0 0 1200 60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,30 H420 L450,30 L470,8 L495,52 L515,18 L530,30 H560 L575,24 L590,30 H1200"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ── Reveal-on-scroll wrapper ── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className="ll-reveal" style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}

export default function LightLanding() {
  const router = useRouter()
  const [q, setQ]     = useState('')
  const [loc, setLoc] = useState('')

  useEffect(() => {
    try {
      const s = localStorage.getItem('nexus_location') || localStorage.getItem('nexus_zip') || ''
      if (s) setLoc(s)
    } catch { /* private browsing */ }
  }, [])

  const go = useCallback(() => {
    const query = q.trim()
    if (!query) { router.push('/search'); return }
    router.push(`/search?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(loc.trim())}`)
  }, [q, loc, router])

  return (
    <div className="ll">

      {/* ════════ NAV ════════ */}
      <header className="ll-nav">
        <div className="ll-nav-inner">
          <Link href="/" className="ll-logo" aria-label="NEXUS — home">
            <svg width="20" height="20" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <circle cx="50" cy="28" r="14" fill="#1D4ED8" />
              <circle cx="28" cy="66" r="14" fill="#0E1116" opacity="0.8" />
              <circle cx="72" cy="66" r="14" fill="#0E1116" opacity="0.5" />
            </svg>
            <span>NEXUS</span>
          </Link>
          <nav className="ll-nav-links" aria-label="Main">
            <Link href="/search">Find care</Link>
            <Link href="/programs">Programs</Link>
            <Link href="/stories">Stories</Link>
            <Link href="/about">About</Link>
          </nav>
          <div className="ll-nav-cta">
            <Link href="/login" className="ll-btn-ghost">Sign in</Link>
            <Link href="/search" className="ll-btn-blue">Find free care</Link>
          </div>
        </div>
      </header>

      {/* ════════ HERO ════════ */}
      <section className="ll-hero" aria-labelledby="ll-h1">
        <Link href="/triage" className="ll-badge">
          <span className="ll-badge-new">New</span>
          AI symptom guide is live
          <span aria-hidden="true">→</span>
        </Link>

        <h1 id="ll-h1" className="ll-h1">
          Free healthcare,<br />
          <span className="ll-h1-accent">
            found
            <svg className="ll-underline" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
              <path d="M4,10 C60,2 140,2 196,8" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </span>
          {' '}in seconds.
        </h1>

        <p className="ll-sub">
          NEXUS finds free clinics, hidden programs, and real care near you.{' '}
          <br className="ll-br-desktop" />
          No insurance. No cost. No catch.
        </p>

        <div className="ll-search" role="search">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') go() }}
            placeholder="Symptom, specialty, or clinic…"
            aria-label="Search for free healthcare"
            className="ll-search-input"
          />
          <input
            value={loc}
            onChange={e => setLoc(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') go() }}
            placeholder="ZIP or city"
            aria-label="Location"
            className="ll-search-loc"
          />
          <button onClick={go} className="ll-btn-blue ll-search-btn">Search</button>
        </div>

        <p className="ll-microproof">Anonymous · 48 languages · Always free</p>

        {/* ── DARK product frame with blue halo (Vercel-style contrast shot) ── */}
        <div className="ll-frame-wrap" aria-label="Preview of NEXUS search results">
          <div className="ll-frame-halo" aria-hidden="true" />
          <div className="ll-frame dark">
            <div className="ll-chrome">
              <span className="ll-dot" /><span className="ll-dot" /><span className="ll-dot" />
              <span className="ll-chrome-url">nexus.health/search</span>
              <span className="ll-chrome-tag">Preview</span>
            </div>

            <div className="ll-app">
              <aside className="ll-side" aria-hidden="true">
                <div className="ll-side-search">⌕&nbsp; Search</div>
                {['Find care', 'Programs', 'Medications', 'Passport', 'Crisis help'].map((item, i) => (
                  <div key={item} className={`ll-side-item${i === 0 ? ' active' : ''}`}>{item}</div>
                ))}
              </aside>

              <div className="ll-main">
                <div className="ll-toolbar">
                  <span className="ll-query-chip">Primary care · Phoenix, AZ</span>
                  <span className="ll-filter on">Open now</span>
                  <span className="ll-filter on">Free</span>
                  <span className="ll-filter">Walk-in</span>
                  <span className="ll-count">124 results</span>
                </div>

                <div className="ll-grid" role="table" aria-label="Clinic results preview">
                  <div className="ll-row ll-head" role="row">
                    <span role="columnheader">Clinic</span>
                    <span role="columnheader">Distance</span>
                    <span role="columnheader">Cost</span>
                    <span role="columnheader">Status</span>
                    <span role="columnheader" className="ll-col-action" aria-label="Action" />
                  </div>
                  {DEMO_ROWS.map(r => (
                    <div key={r.name} className="ll-row" role="row">
                      <span role="cell" className="ll-cell-name">
                        <span className="ll-avatar">{r.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
                        <span>
                          <span className="ll-name">{r.name}</span>
                          <span className="ll-type">{r.type}</span>
                        </span>
                      </span>
                      <span role="cell" className="ll-mono">{r.dist}</span>
                      <span role="cell"><span className={`ll-cost ${r.costKind}`}>{r.cost}</span></span>
                      <span role="cell" className="ll-status">
                        <span className={`ll-status-dot${r.open ? ' open' : ''}`} />
                        {r.status}
                      </span>
                      <span role="cell" className="ll-col-action"><span className="ll-call">Call</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ TRUST BAND ════════ */}
      <section className="ll-band" aria-label="Key facts">
        {[
          ['12,400+', 'free clinics mapped'],
          ['48', 'languages supported'],
          ['$0', 'cost to use NEXUS'],
          ['HRSA', 'verified clinic data'],
        ].map(([big, small]) => (
          <div key={small} className="ll-band-item">
            <span className="ll-band-big">{big}</span>
            <span className="ll-band-small">{small}</span>
          </div>
        ))}
      </section>

      {/* ════════ EKG DIVIDER ════════ */}
      <PulseLine />

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="ll-section" aria-labelledby="ll-how-t">
        <Reveal>
          <p className="ll-eyebrow">How it works</p>
          <h2 id="ll-how-t" className="ll-h2">Three steps to real care.</h2>
        </Reveal>
        <div className="ll-steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div className="ll-step">
                <span className="ll-step-n">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════ SPOTLIGHT 1 — FIND CARE ════════ */}
      <section className="ll-spot" aria-labelledby="ll-spot1-t">
        <Reveal>
          <div className="ll-spot-copy">
            <p className="ll-eyebrow">Find care</p>
            <h2 id="ll-spot1-t" className="ll-h2 left">Every free clinic.<br />One search away.</h2>
            <p className="ll-spot-p">
              12,400+ free clinics, FQHCs, and sliding-scale providers — with live
              hours, real phone numbers, and costs shown up front. Filtered by what
              matters when you&apos;re uninsured: is it open, is it free, can I walk in.
            </p>
            <ul className="ll-checks">
              <li>Open-now status and wait estimates</li>
              <li>Cost badges before you call — $0, sliding scale, or capped</li>
              <li>FQHCs flagged: required by law to see you</li>
            </ul>
            <Link href="/search" className="ll-textlink">Search clinics <span aria-hidden="true">→</span></Link>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="ll-vign dark" aria-hidden="true">
            <div className="ll-vign-head">
              <span className="ll-query-chip">Dental · 85004</span>
              <span className="ll-filter on">Free</span>
            </div>
            {DEMO_ROWS.slice(0, 3).map(r => (
              <div key={r.name} className="ll-vign-row">
                <span className="ll-avatar">{r.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
                <span className="ll-vign-name">
                  <span className="ll-name">{r.name}</span>
                  <span className="ll-type">{r.dist} · {r.type}</span>
                </span>
                <span className={`ll-cost ${r.costKind}`}>{r.cost}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ════════ SPOTLIGHT 2 — AI TRIAGE (reversed) ════════ */}
      <section className="ll-spot rev" aria-labelledby="ll-spot2-t">
        <Reveal>
          <div className="ll-spot-copy">
            <p className="ll-eyebrow">AI symptom guide</p>
            <h2 id="ll-spot2-t" className="ll-h2 left">Say it in your words.<br />Get pointed right.</h2>
            <p className="ll-spot-p">
              Describe how you feel — plain language, any of 48 languages. NEXUS
              tells you what kind of care fits and where to get it free, so a $40
              clinic visit doesn&apos;t become a $1,500 ER bill.
            </p>
            <ul className="ll-checks">
              <li>ER vs. clinic vs. telehealth — explained honestly</li>
              <li>Hands off to search with your context pre-filled</li>
              <li>Crisis language routes instantly to 988 resources</li>
            </ul>
            <Link href="/triage" className="ll-textlink">Try the symptom guide <span aria-hidden="true">→</span></Link>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="ll-vign dark chat" aria-hidden="true">
            <div className="ll-bubble user">My tooth has been killing me for a week and I don&apos;t have insurance</div>
            <div className="ll-bubble ai">
              <span className="ll-ai-tag">NEXUS</span>
              That sounds painful — and treatable at a <strong>free dental clinic</strong>, not an ER.
              ERs can&apos;t do dental work and average $1,500.
            </div>
            <div className="ll-bubble-card">
              <span className="ll-name">3 free dental clinics near you</span>
              <span className="ll-type">Closest: 1.2 mi · open until 6 PM</span>
              <span className="ll-bubble-cta">See them →</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════ SPOTLIGHT 3 — ELIGIBILITY ════════ */}
      <section className="ll-spot" aria-labelledby="ll-spot3-t">
        <Reveal>
          <div className="ll-spot-copy">
            <p className="ll-eyebrow">Eligibility</p>
            <h2 id="ll-spot3-t" className="ll-h2 left">You may already<br />qualify for coverage.</h2>
            <p className="ll-spot-p">
              Millions of uninsured Americans qualify for Medicaid, ACA subsidies,
              or hospital charity care and don&apos;t know it. Answer a few questions —
              no documents, no account — and see what you&apos;re likely owed.
            </p>
            <ul className="ll-checks">
              <li>Medicaid, CHIP, ACA, HRSA and charity-care programs</li>
              <li>Plain-English results with application links</li>
              <li>Nothing stored — your answers stay on your device</li>
            </ul>
            <Link href="/eligibility" className="ll-textlink">Check eligibility <span aria-hidden="true">→</span></Link>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="ll-vign dark" aria-hidden="true">
            <div className="ll-elig-q">Household size? <span className="ll-elig-a">3</span></div>
            <div className="ll-elig-q">Monthly income? <span className="ll-elig-a">$2,100</span></div>
            <div className="ll-elig-q">State? <span className="ll-elig-a">Arizona</span></div>
            <div className="ll-elig-result">
              <span className="ll-elig-badge">Likely eligible</span>
              <span className="ll-name">Medicaid (AHCCCS)</span>
              <span className="ll-type">+ 2 more programs · apply free online</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════ MORE TOOLS GRID ════════ */}
      <section className="ll-section" aria-labelledby="ll-tools-t">
        <Reveal>
          <p className="ll-eyebrow">The full toolkit</p>
          <h2 id="ll-tools-t" className="ll-h2">Everything between you and care.</h2>
        </Reveal>
        <div className="ll-features">
          {TOOLS.map((f, i) => (
            <Reveal key={f.t} delay={i * 60}>
              <Link href={f.href} className="ll-feature">
                <span className="ll-chip">{f.chip}</span>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
                <span className="ll-feature-link">Explore <span aria-hidden="true">→</span></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════ LANGUAGE + SMS ════════ */}
      <section className="ll-section" aria-labelledby="ll-lang-t">
        <Reveal>
          <p className="ll-eyebrow">No smartphone? No problem.</p>
          <h2 id="ll-lang-t" className="ll-h2">Care in your language.<br />Even by text message.</h2>
        </Reveal>
        <div className="ll-lang-grid">
          <Reveal>
            <div className="ll-lang-card">
              <h3>48 languages</h3>
              <p>The whole platform — search, triage, results — speaks your language.</p>
              <div className="ll-lang-chips">
                {['Español', '中文', 'Tiếng Việt', 'العربية', 'Français', '한국어', 'Tagalog', 'Русский', 'हिन्दी', '+39 more'].map(l => (
                  <span key={l} className="ll-lang-chip">{l}</span>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="ll-lang-card sms">
              <h3>Text NEXUS</h3>
              <p>No data plan needed. Text a ZIP code, get free clinics back by SMS.</p>
              <div className="ll-sms" aria-hidden="true">
                <div className="ll-sms-bubble out">85004</div>
                <div className="ll-sms-bubble in">3 free clinics near you: Clinica Adelante (1.2mi, open til 6) — 602-555-0134 …</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════ PRIVACY BAND (dark) ════════ */}
      <section className="ll-privacy" aria-labelledby="ll-priv-t">
        <PulseLine tint="white" />
        <div className="ll-privacy-inner">
          <Reveal>
            <p className="ll-eyebrow on-dark">Private by design</p>
            <h2 id="ll-priv-t">Your health is nobody&apos;s business.<br />Including ours.</h2>
          </Reveal>
          <div className="ll-privacy-grid">
            {[
              ['No account required', 'Search, triage, and eligibility work fully anonymously.'],
              ['Nothing sold, ever', 'No ads, no data brokers, no “partners.” We don&apos;t monetize you.'],
              ['Yours to delete', 'If you do make an account, one tap erases everything.'],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 80}>
                <div className="ll-privacy-item">
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ QUOTE ════════ */}
      <section className="ll-quote-wrap" aria-label="Community voice">
        <Reveal>
          <blockquote className="ll-quote">
            <p>“I put off a tooth infection for eight months because I thought care meant debt. NEXUS showed me a free dental clinic eleven minutes from my apartment.”</p>
            <footer>— A NEXUS community story, Phoenix AZ</footer>
          </blockquote>
        </Reveal>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="ll-section ll-faq-section" aria-labelledby="ll-faq-t">
        <Reveal>
          <p className="ll-eyebrow">Questions</p>
          <h2 id="ll-faq-t" className="ll-h2">Asked all the time.</h2>
        </Reveal>
        <div className="ll-faq">
          {FAQS.map(f => (
            <details key={f.q} className="ll-faq-item">
              <summary>{f.q}<span className="ll-faq-plus" aria-hidden="true">+</span></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ════════ CTA BAND (blue) ════════ */}
      <section className="ll-cta" aria-labelledby="ll-cta-t">
        <PulseLine tint="white" />
        <h2 id="ll-cta-t">Care shouldn&apos;t cost everything.</h2>
        <p>Find free and low-cost healthcare near you — right now, in your language.</p>
        <Link href="/search" className="ll-btn-white">Find free care near me</Link>
        <span className="ll-cta-sub">No account · No insurance · No cost</span>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="ll-footer">
        <div className="ll-footer-grid">
          <div className="ll-footer-brand">
            <span className="ll-footer-logo">NEXUS</span>
            <p>Free healthcare access for every uninsured American. Built with care, not profit.</p>
          </div>
          {[
            { h: 'Product',   links: [['Find care', '/search'], ['Programs', '/programs'], ['Symptom guide', '/triage'], ['Medications', '/medications'], ['Health Passport', '/passport']] },
            { h: 'Community', links: [['Stories', '/stories'], ['Kids health guide', '/kids'], ['Your rights', '/rights'], ['Crisis support', '/crisis']] },
            { h: 'NEXUS',     links: [['About', '/about'], ['Impact', '/impact'], ['For providers', '/provider'], ['Privacy', '/privacy'], ['Terms', '/terms']] },
          ].map(col => (
            <div key={col.h} className="ll-footer-col">
              <span className="ll-footer-h">{col.h}</span>
              {col.links.map(([label, href]) => (
                <Link key={href} href={href}>{label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div className="ll-footer-bottom">
          <span>© {new Date().getFullYear()} NEXUS. Not a substitute for emergency care — call 911 in an emergency.</span>
        </div>
      </footer>

      {/* ════════ STYLES ════════ */}
      <style>{`
        .ll {
          --paper:   #FAFAF7;
          --card:    #FFFFFF;
          --ink:     #0E1116;
          --ink-2:   #5C6470;
          --ink-3:   #9AA1AB;
          --line:    #E8E6E1;
          --line-2:  #F0EEE9;
          --blue:    #2563EB;
          --blue-strong: #1D4ED8;
          --blue-bg: #EBF1FE;
          --blue-glow: rgba(37,99,235,0.22);
          --teal:    #0D9488;
          --teal-bg: #E9F6F4;
          --amber-bg:#FBF3E4;
          --amber:   #B45309;
          /* dark vignette tokens */
          --d-bg:    #0A0C11;
          --d-card:  #10141C;
          --d-line:  rgba(255,255,255,0.08);
          --d-text:  #F2F4F8;
          --d-text2: rgba(242,244,248,0.58);
          --d-text3: rgba(242,244,248,0.36);
          --shadow-card: 0 1px 2px rgba(15,20,30,0.05), 0 8px 24px rgba(15,20,30,0.06);
          --shadow-frame: 0 2px 8px rgba(10,15,30,0.14), 0 32px 80px rgba(10,15,30,0.22);
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-inter), system-ui, sans-serif;
          min-height: 100vh;
          overflow-x: clip;
        }
        .ll *, .ll *::before, .ll *::after { box-sizing: border-box; }
        :where(.ll) a { text-decoration: none; color: inherit; }
        .ll h1, .ll h2, .ll h3, .ll p { margin: 0; }

        /* ── Reveal on scroll ── */
        .ll-reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1); }
        .ll-reveal.in { opacity: 1; transform: translateY(0); }

        /* ── EKG pulse line ── */
        .ll-pulse { display: block; width: min(1120px, 100%); height: 44px; margin: 0 auto; }
        .ll-pulse path {
          stroke: var(--blue);
          stroke-dasharray: 1400;
          stroke-dashoffset: 1400;
        }
        .ll-pulse.white path { stroke: rgba(255,255,255,0.35); }
        .ll-pulse.drawn path { animation: ll-draw 1.6s cubic-bezier(0.4,0,0.2,1) forwards; }
        @keyframes ll-draw { to { stroke-dashoffset: 0; } }

        /* ── Buttons ── */
        .ll-btn-blue {
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--blue-strong); color: #fff;
          border: none; border-radius: 100px;
          padding: 10px 20px; font-size: 14px; font-weight: 600;
          cursor: pointer; white-space: nowrap;
          box-shadow: 0 1px 2px rgba(29,78,216,0.3), 0 4px 14px var(--blue-glow);
          transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.18s ease, background 0.18s ease;
        }
        .ll-btn-blue:hover { background: var(--blue); transform: translateY(-1px); box-shadow: 0 2px 4px rgba(29,78,216,0.3), 0 8px 24px var(--blue-glow); }
        .ll-btn-blue:active { transform: translateY(0) scale(0.98); }
        .ll-btn-ghost {
          padding: 10px 16px; font-size: 14px; font-weight: 550; color: var(--ink);
          border-radius: 100px; transition: background 0.15s ease;
        }
        .ll-btn-ghost:hover { background: rgba(15,20,30,0.05); }
        .ll-btn-white {
          display: inline-flex; align-items: center;
          background: #fff; color: var(--blue-strong);
          border-radius: 100px; padding: 13px 26px;
          font-size: 15px; font-weight: 650;
          transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.18s ease;
        }
        .ll-btn-white:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(0,0,0,0.28); }
        .ll-textlink {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 22px; font-size: 14.5px; font-weight: 650; color: var(--blue-strong);
        }
        .ll-textlink:hover { color: var(--blue); }

        /* ── Nav ── */
        .ll-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(250,250,247,0.85);
          backdrop-filter: blur(16px) saturate(150%);
          -webkit-backdrop-filter: blur(16px) saturate(150%);
          border-bottom: 1px solid var(--line-2);
        }
        .ll-nav-inner {
          max-width: 1120px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px clamp(16px, 4vw, 32px);
        }
        .ll-logo { display: flex; align-items: center; gap: 8px; font-weight: 800; letter-spacing: 0.14em; font-size: 14px; }
        .ll-nav-links { display: flex; gap: 4px; }
        .ll-nav-links a {
          padding: 8px 14px; font-size: 14px; font-weight: 500; color: var(--ink-2);
          border-radius: 100px; transition: color 0.15s ease, background 0.15s ease;
        }
        .ll-nav-links a:hover { color: var(--ink); background: rgba(15,20,30,0.04); }
        .ll-nav-cta { display: flex; align-items: center; gap: 6px; }

        /* ── Hero ── */
        .ll-hero {
          max-width: 1120px; margin: 0 auto;
          padding: clamp(56px, 9vh, 96px) clamp(16px, 4vw, 32px) 0;
          display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        .ll-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; border: 1px solid var(--line);
          border-radius: 100px; padding: 5px 14px 5px 5px;
          font-size: 13px; font-weight: 550; color: var(--ink-2);
          box-shadow: 0 1px 2px rgba(15,20,30,0.04);
          margin-bottom: 28px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          animation: ll-rise 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ll-badge:hover { border-color: #C9D7F8; box-shadow: 0 2px 10px var(--blue-glow); }
        .ll-badge-new {
          background: var(--blue-strong); color: #fff;
          border-radius: 100px; padding: 3px 10px;
          font-size: 11.5px; font-weight: 650;
        }
        .ll-h1 {
          font-size: clamp(2.7rem, 6.5vw, 4.9rem);
          font-weight: 700; letter-spacing: -0.045em; line-height: 1.04;
          color: var(--ink);
          animation: ll-rise 0.7s cubic-bezier(0.16,1,0.3,1) 0.06s both;
        }
        .ll-h1-accent { position: relative; display: inline-block; color: var(--blue-strong); }
        .ll-underline {
          position: absolute; left: 0; right: 0; bottom: -0.08em;
          width: 100%; height: 0.16em; color: var(--blue);
          opacity: 0.85;
        }
        .ll-sub {
          margin-top: 24px;
          font-size: clamp(1rem, 1.5vw, 1.15rem); line-height: 1.65;
          color: var(--ink-2); max-width: 560px;
          animation: ll-rise 0.7s cubic-bezier(0.16,1,0.3,1) 0.12s both;
        }
        .ll-search {
          margin-top: 34px;
          display: flex; align-items: center; gap: 0;
          background: #fff; border: 1px solid var(--line);
          border-radius: 100px; padding: 6px 6px 6px 22px;
          width: 100%; max-width: 620px;
          box-shadow: var(--shadow-card);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          animation: ll-rise 0.7s cubic-bezier(0.16,1,0.3,1) 0.18s both;
        }
        .ll-search:focus-within {
          border-color: #B8CCF8;
          box-shadow: 0 1px 2px rgba(15,20,30,0.05), 0 0 0 4px var(--blue-bg), 0 12px 32px rgba(15,20,30,0.08);
        }
        .ll-search-input {
          flex: 1; min-width: 0; border: none; outline: none; background: none;
          font-size: 15px; color: var(--ink); font-family: inherit; padding: 10px 0;
        }
        .ll-search-input::placeholder, .ll-search-loc::placeholder { color: var(--ink-3); }
        .ll-search-loc {
          width: 110px; border: none; outline: none; background: none;
          font-size: 14px; color: var(--ink-2); font-family: inherit;
          border-left: 1px solid var(--line); padding: 10px 14px; margin-left: 8px;
        }
        .ll-search-btn { padding: 11px 24px; }
        .ll-microproof {
          margin-top: 16px; font-size: 12px; letter-spacing: 0.04em;
          color: var(--ink-3);
          animation: ll-rise 0.7s cubic-bezier(0.16,1,0.3,1) 0.24s both;
        }

        /* ── Product frame — DARK, with blue halo ── */
        .ll-frame-wrap {
          width: 100%; margin-top: clamp(48px, 7vh, 76px);
          position: relative; padding-bottom: 8px;
        }
        .ll-frame-halo {
          position: absolute; inset: -8% -6% auto;
          height: 70%;
          background: radial-gradient(ellipse 55% 60% at 50% 45%, var(--blue-glow) 0%, transparent 70%);
          filter: blur(24px);
          pointer-events: none;
        }
        .ll-frame {
          position: relative;
          border-radius: 16px; overflow: hidden;
          text-align: left;
          animation: ll-rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        }
        .ll-frame.dark {
          background: var(--d-bg);
          border: 1px solid rgba(37,99,235,0.25);
          box-shadow: var(--shadow-frame), 0 0 0 1px rgba(255,255,255,0.04) inset;
        }
        .ll-frame.dark .ll-chrome { background: #0D1017; border-bottom: 1px solid var(--d-line); }
        .ll-chrome { display: flex; align-items: center; gap: 6px; padding: 10px 16px; }
        .ll-frame.dark .ll-dot { background: rgba(255,255,255,0.14); }
        .ll-dot { width: 10px; height: 10px; border-radius: 50%; }
        .ll-chrome-url { margin-left: 12px; font-size: 12px; color: var(--d-text3); font-family: var(--font-mono), monospace; }
        .ll-chrome-tag {
          margin-left: auto; font-size: 10px; font-weight: 650; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--d-text3);
          border: 1px solid var(--d-line); border-radius: 100px; padding: 2px 9px;
        }
        .ll-app { display: flex; min-height: 380px; }
        .ll-side {
          width: 190px; flex-shrink: 0;
          border-right: 1px solid var(--d-line);
          padding: 14px 10px; background: #0D1017;
          display: flex; flex-direction: column; gap: 2px;
        }
        .ll-side-search {
          font-size: 12.5px; color: var(--d-text3);
          border: 1px solid var(--d-line); border-radius: 8px;
          padding: 7px 10px; margin-bottom: 10px; background: var(--d-card);
        }
        .ll-side-item { font-size: 13px; font-weight: 500; color: var(--d-text2); padding: 7px 10px; border-radius: 8px; }
        .ll-side-item.active { background: rgba(37,99,235,0.16); color: #A8C4FA; font-weight: 600; }
        .ll-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .ll-toolbar {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          padding: 12px 18px; border-bottom: 1px solid var(--d-line);
        }
        .ll-query-chip {
          font-size: 13px; font-weight: 600; color: var(--d-text);
          background: rgba(255,255,255,0.07); border-radius: 8px; padding: 5px 12px;
        }
        .ll-filter { font-size: 12px; font-weight: 550; color: var(--d-text3); border: 1px solid var(--d-line); border-radius: 100px; padding: 4px 12px; }
        .ll-filter.on { color: #7EE8DA; background: rgba(13,148,136,0.16); border-color: transparent; }
        .ll-count { margin-left: auto; font-size: 12px; color: var(--d-text3); font-family: var(--font-mono), monospace; }
        .ll-grid { display: flex; flex-direction: column; }
        .ll-row {
          display: grid;
          grid-template-columns: minmax(180px, 2.2fr) 0.9fr 1.1fr 1.6fr 0.7fr;
          gap: 12px; align-items: center;
          padding: 11px 18px;
          border-bottom: 1px solid var(--d-line);
          font-size: 13.5px;
        }
        .ll-row:last-child { border-bottom: none; }
        .ll-row:not(.ll-head):hover { background: rgba(255,255,255,0.025); }
        .ll-head {
          font-size: 10.5px; font-weight: 650; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--d-text3);
          padding-top: 10px; padding-bottom: 10px;
        }
        .ll-cell-name { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .ll-avatar {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: rgba(37,99,235,0.18); color: #A8C4FA;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
        }
        .ll-name { display: block; font-weight: 600; color: var(--d-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ll-type { display: block; font-size: 11.5px; color: var(--d-text3); }
        .ll-mono { font-family: var(--font-mono), monospace; font-size: 12.5px; color: var(--d-text2); }
        .ll-cost { font-size: 12px; font-weight: 650; border-radius: 6px; padding: 3px 9px; }
        .ll-cost.free  { background: rgba(13,148,136,0.18); color: #7EE8DA; }
        .ll-cost.slide { background: rgba(180,83,9,0.18); color: #F5C784; }
        .ll-status { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--d-text2); white-space: nowrap; }
        .ll-status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--d-text3); flex-shrink: 0; }
        .ll-status-dot.open { background: #2DD4BF; box-shadow: 0 0 8px rgba(45,212,191,0.5); }
        .ll-call {
          font-size: 12.5px; font-weight: 650; color: var(--d-text);
          border: 1px solid var(--d-line); border-radius: 100px; padding: 5px 14px;
        }
        .ll-col-action { text-align: right; }

        /* ── Trust band ── */
        .ll-band {
          border-bottom: 1px solid var(--line-2);
          max-width: 1120px; margin: 0 auto;
          padding: clamp(36px, 5vh, 52px) clamp(16px, 4vw, 32px);
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
        }
        .ll-band-item { display: flex; flex-direction: column; gap: 4px; align-items: center; text-align: center; }
        .ll-band-big { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700; letter-spacing: -0.03em; color: var(--blue-strong); }
        .ll-band-small { font-size: 12.5px; color: var(--ink-3); }

        /* ── Sections ── */
        .ll-section {
          max-width: 1120px; margin: 0 auto;
          padding: clamp(72px, 11vh, 120px) clamp(16px, 4vw, 32px) 0;
          text-align: center;
        }
        .ll-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 650; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--blue-strong); margin-bottom: 14px;
        }
        .ll-eyebrow::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: var(--blue); box-shadow: 0 0 0 3px var(--blue-bg);
        }
        .ll-eyebrow.on-dark { color: #A8C4FA; }
        .ll-eyebrow.on-dark::before { background: #A8C4FA; box-shadow: 0 0 0 3px rgba(168,196,250,0.15); }
        .ll-h2 {
          font-size: clamp(1.9rem, 3.8vw, 2.8rem);
          font-weight: 700; letter-spacing: -0.035em; line-height: 1.12;
          margin-bottom: clamp(36px, 5vh, 56px);
        }
        .ll-h2.left { text-align: left; margin-bottom: 20px; }
        .ll-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: left; }
        .ll-step {
          background: #fff; border: 1px solid var(--line);
          border-radius: 16px; padding: 26px; height: 100%;
          box-shadow: var(--shadow-card);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .ll-step:hover { border-color: #C9D7F8; box-shadow: 0 2px 6px rgba(15,20,30,0.05), 0 12px 32px var(--blue-glow); }
        .ll-step-n {
          font-family: var(--font-mono), monospace;
          font-size: 12px; color: var(--blue-strong); letter-spacing: 0.1em;
          display: block; margin-bottom: 14px;
        }
        .ll-step h3 { font-size: 16.5px; font-weight: 650; letter-spacing: -0.01em; margin-bottom: 8px; }
        .ll-step p { font-size: 14px; line-height: 1.65; color: var(--ink-2); }

        /* ── Spotlights ── */
        .ll-spot {
          max-width: 1120px; margin: 0 auto;
          padding: clamp(72px, 11vh, 120px) clamp(16px, 4vw, 32px) 0;
          display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 5vw, 72px);
          align-items: center;
        }
        .ll-spot.rev > :first-child { order: 2; }
        .ll-spot-copy { text-align: left; }
        .ll-spot-p { font-size: 15.5px; line-height: 1.7; color: var(--ink-2); max-width: 460px; }
        .ll-checks { list-style: none; margin: 22px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; text-align: left; }
        .ll-checks li {
          position: relative; padding-left: 28px;
          font-size: 14px; color: var(--ink-2); line-height: 1.5;
        }
        .ll-checks li::before {
          content: '✓'; position: absolute; left: 0; top: 0;
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--blue-bg); color: var(--blue-strong);
          font-size: 11px; font-weight: 800;
          display: inline-flex; align-items: center; justify-content: center;
        }

        /* ── Dark vignettes ── */
        .ll-vign {
          border-radius: 16px; padding: 20px;
          text-align: left;
        }
        .ll-vign.dark {
          background: var(--d-bg);
          border: 1px solid rgba(37,99,235,0.22);
          box-shadow: 0 2px 8px rgba(10,15,30,0.12), 0 24px 64px rgba(10,15,30,0.18);
        }
        .ll-vign-head { display: flex; gap: 8px; align-items: center; margin-bottom: 14px; }
        .ll-vign-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 10px; border-bottom: 1px solid var(--d-line);
        }
        .ll-vign-row:last-child { border-bottom: none; }
        .ll-vign-name { flex: 1; min-width: 0; }

        /* chat vignette */
        .ll-vign.chat { display: flex; flex-direction: column; gap: 12px; }
        .ll-bubble {
          max-width: 85%; border-radius: 14px; padding: 12px 16px;
          font-size: 13.5px; line-height: 1.55;
        }
        .ll-bubble.user { align-self: flex-end; background: var(--blue-strong); color: #fff; border-bottom-right-radius: 4px; }
        .ll-bubble.ai { align-self: flex-start; background: var(--d-card); color: var(--d-text2); border: 1px solid var(--d-line); border-bottom-left-radius: 4px; }
        .ll-bubble.ai strong { color: var(--d-text); }
        .ll-ai-tag { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: #A8C4FA; margin-bottom: 6px; }
        .ll-bubble-card {
          align-self: flex-start; width: 85%;
          background: rgba(37,99,235,0.12); border: 1px solid rgba(37,99,235,0.3);
          border-radius: 14px; padding: 14px 16px;
          display: flex; flex-direction: column; gap: 3px;
        }
        .ll-bubble-cta { margin-top: 8px; font-size: 13px; font-weight: 650; color: #A8C4FA; }

        /* eligibility vignette */
        .ll-elig-q {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13.5px; color: var(--d-text2);
          padding: 12px 10px; border-bottom: 1px solid var(--d-line);
        }
        .ll-elig-a { font-weight: 650; color: var(--d-text); font-family: var(--font-mono), monospace; font-size: 13px; }
        .ll-elig-result {
          margin-top: 14px; border-radius: 12px; padding: 16px;
          background: rgba(13,148,136,0.12); border: 1px solid rgba(13,148,136,0.3);
          display: flex; flex-direction: column; gap: 3px;
        }
        .ll-elig-badge {
          align-self: flex-start; margin-bottom: 8px;
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          background: rgba(13,148,136,0.25); color: #7EE8DA;
          border-radius: 100px; padding: 3px 10px;
        }

        /* ── Features / tools grid ── */
        .ll-features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; text-align: left; }
        .ll-feature {
          background: #fff; border: 1px solid var(--line);
          border-radius: 16px; padding: 28px; height: 100%;
          box-shadow: var(--shadow-card);
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease, border-color 0.2s ease;
          display: flex; flex-direction: column; align-items: flex-start;
        }
        .ll-feature:hover {
          transform: translateY(-3px);
          border-color: #C9D7F8;
          box-shadow: 0 2px 6px rgba(15,20,30,0.05), 0 16px 40px var(--blue-glow);
        }
        .ll-chip {
          font-size: 11px; font-weight: 650; letter-spacing: 0.06em; text-transform: uppercase;
          background: var(--blue-bg); color: var(--blue-strong);
          border-radius: 100px; padding: 3px 10px; margin-bottom: 16px;
        }
        .ll-feature h3 { font-size: 18px; font-weight: 650; letter-spacing: -0.015em; margin-bottom: 8px; }
        .ll-feature p { font-size: 14px; line-height: 1.65; color: var(--ink-2); }
        .ll-feature-link { margin-top: 16px; font-size: 13.5px; font-weight: 600; color: var(--blue-strong); }

        /* ── Language + SMS ── */
        .ll-lang-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; }
        .ll-lang-card {
          background: #fff; border: 1px solid var(--line); border-radius: 16px;
          padding: 28px; box-shadow: var(--shadow-card); height: 100%;
        }
        .ll-lang-card h3 { font-size: 18px; font-weight: 650; margin-bottom: 8px; }
        .ll-lang-card > p { font-size: 14px; color: var(--ink-2); line-height: 1.6; }
        .ll-lang-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
        .ll-lang-chip {
          font-size: 13px; font-weight: 550; color: var(--ink-2);
          border: 1px solid var(--line); border-radius: 100px; padding: 5px 13px;
          background: var(--paper);
        }
        .ll-sms { margin-top: 18px; display: flex; flex-direction: column; gap: 10px; }
        .ll-sms-bubble {
          max-width: 80%; border-radius: 16px; padding: 10px 14px;
          font-size: 13px; line-height: 1.5;
        }
        .ll-sms-bubble.out { align-self: flex-end; background: var(--blue-strong); color: #fff; border-bottom-right-radius: 4px; font-family: var(--font-mono), monospace; }
        .ll-sms-bubble.in { align-self: flex-start; background: var(--line-2); color: var(--ink); border-bottom-left-radius: 4px; }

        /* ── Privacy band (dark) ── */
        .ll-privacy {
          margin-top: clamp(72px, 11vh, 120px);
          background: var(--d-bg);
          padding-bottom: clamp(56px, 8vh, 88px);
        }
        .ll-privacy .ll-pulse { padding-top: 8px; }
        .ll-privacy-inner {
          max-width: 1120px; margin: 0 auto;
          padding: clamp(40px, 6vh, 64px) clamp(16px, 4vw, 32px) 0;
          text-align: center;
        }
        .ll-privacy h2 {
          font-size: clamp(1.8rem, 3.6vw, 2.6rem);
          font-weight: 700; letter-spacing: -0.035em; line-height: 1.15;
          color: var(--d-text); margin-bottom: clamp(36px, 5vh, 56px);
        }
        .ll-privacy-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: left; }
        .ll-privacy-item {
          border: 1px solid var(--d-line); border-radius: 16px; padding: 24px;
          background: var(--d-card); height: 100%;
        }
        .ll-privacy-item h3 { font-size: 15.5px; font-weight: 650; color: var(--d-text); margin-bottom: 8px; }
        .ll-privacy-item p { font-size: 13.5px; line-height: 1.65; color: var(--d-text2); }

        /* ── Quote ── */
        .ll-quote-wrap { max-width: 1120px; margin: 0 auto; padding: clamp(72px, 11vh, 120px) clamp(16px, 4vw, 32px) 0; }
        .ll-quote { margin: 0; text-align: center; }
        .ll-quote p {
          font-size: clamp(1.3rem, 2.6vw, 1.9rem);
          font-weight: 550; letter-spacing: -0.02em; line-height: 1.4;
          max-width: 760px; margin: 0 auto; color: var(--ink);
        }
        .ll-quote footer { margin-top: 20px; font-size: 13.5px; color: var(--ink-3); }

        /* ── FAQ ── */
        .ll-faq { max-width: 720px; margin: 0 auto; text-align: left; }
        .ll-faq-item { border-bottom: 1px solid var(--line); }
        .ll-faq-item summary {
          list-style: none; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 20px 4px; font-size: 15.5px; font-weight: 600; color: var(--ink);
          transition: color 0.15s ease;
        }
        .ll-faq-item summary::-webkit-details-marker { display: none; }
        .ll-faq-item summary:hover { color: var(--blue-strong); }
        .ll-faq-plus { font-size: 20px; font-weight: 400; color: var(--ink-3); transition: transform 0.25s cubic-bezier(0.16,1,0.3,1); flex-shrink: 0; }
        .ll-faq-item[open] .ll-faq-plus { transform: rotate(45deg); color: var(--blue-strong); }
        .ll-faq-item > p { padding: 0 4px 20px; font-size: 14.5px; line-height: 1.7; color: var(--ink-2); max-width: 640px; }

        /* ── CTA band (blue) ── */
        .ll-cta {
          max-width: 1120px;
          margin: clamp(72px, 11vh, 120px) auto 0;
          border-radius: 24px;
          background:
            radial-gradient(ellipse 70% 90% at 50% -20%, rgba(255,255,255,0.14) 0%, transparent 60%),
            linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 60%, #2563EB 100%);
          color: #fff;
          padding: 0 clamp(24px, 5vw, 64px) clamp(48px, 8vh, 80px);
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
          overflow: hidden;
        }
        .ll-cta .ll-pulse { margin-bottom: clamp(24px, 4vh, 40px); }
        .ll-cta h2 { font-size: clamp(1.9rem, 4vw, 3rem); font-weight: 700; letter-spacing: -0.035em; line-height: 1.1; }
        .ll-cta p { margin-top: 14px; font-size: 15.5px; color: rgba(255,255,255,0.75); }
        .ll-cta .ll-btn-white { margin-top: 28px; }
        .ll-cta-sub { margin-top: 14px; font-size: 12px; color: rgba(255,255,255,0.55); letter-spacing: 0.04em; }

        /* ── Footer ── */
        .ll-footer { max-width: 1120px; margin: 0 auto; padding: clamp(56px, 8vh, 88px) clamp(16px, 4vw, 32px) 32px; }
        .ll-footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 32px;
          padding-bottom: 40px; border-bottom: 1px solid var(--line-2);
        }
        .ll-footer-logo { font-weight: 800; letter-spacing: 0.14em; font-size: 14px; display: block; margin-bottom: 12px; }
        .ll-footer-brand p { font-size: 13.5px; line-height: 1.65; color: var(--ink-2); max-width: 260px; }
        .ll-footer-col { display: flex; flex-direction: column; gap: 10px; }
        .ll-footer-h { font-size: 11px; font-weight: 650; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 4px; }
        .ll-footer-col a { font-size: 13.5px; color: var(--ink-2); transition: color 0.15s ease; }
        .ll-footer-col a:hover { color: var(--blue-strong); }
        .ll-footer-bottom { padding-top: 24px; font-size: 12px; color: var(--ink-3); }

        /* App chrome doesn't belong on the marketing page (page-scoped hide). */
        body:has(.ll) button[aria-label="Settings"],
        body:has(.ll) .ai-fab,
        body:has(.ll) .mobile-dock,
        body:has(.ll) button[aria-label="Scroll to top"] { display: none !important; }
        body:has(.ll) { padding-bottom: 0 !important; }

        /* ── Entrance ── */
        @keyframes ll-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ll * { animation: none !important; transition: none !important; }
          .ll-reveal { opacity: 1; transform: none; }
          .ll-pulse path { stroke-dashoffset: 0; }
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .ll-nav-links { display: none; }
          .ll-steps { grid-template-columns: 1fr; }
          .ll-features, .ll-lang-grid { grid-template-columns: 1fr; }
          .ll-band { grid-template-columns: repeat(2, 1fr); }
          .ll-side { display: none; }
          .ll-footer-grid { grid-template-columns: 1fr 1fr; }
          .ll-spot { grid-template-columns: 1fr; gap: 28px; }
          .ll-spot.rev > :first-child { order: 0; }
          .ll-privacy-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .ll-br-desktop { display: none; }
          .ll-search { flex-wrap: wrap; border-radius: 20px; padding: 8px; gap: 6px; }
          .ll-search-input { width: 100%; padding: 10px 14px; }
          .ll-search-loc { border-left: none; margin-left: 0; flex: 1; border-top: 1px solid var(--line-2); padding: 10px 14px; }
          .ll-search-btn { width: 100%; }
          .ll-row { grid-template-columns: 1fr auto; }
          .ll-row > :nth-child(2), .ll-row > :nth-child(4) { display: none; }
          .ll-head { display: none; }
          .ll-cta { border-radius: 0; }
        }
      `}</style>
    </div>
  )
}
