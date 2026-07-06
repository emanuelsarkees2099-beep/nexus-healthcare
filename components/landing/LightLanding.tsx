'use client'
/**
 * NEXUS — Light Landing ("Paper Clinic")
 *
 * Structure copied from the Attio landing formula:
 *   pill badge → giant centered 2-line headline → gray subline →
 *   primary action → full-width product UI in a window frame →
 *   trust band → numbered steps → feature grid → quote → CTA band → footer.
 *
 * Twists:
 *   • Warm paper canvas (#FAFAF7), not clinical white
 *   • The "product screenshot" is live markup — a real NEXUS results grid
 *   • Blue→teal duotone appears only as status moments (dots, badges)
 *   • Black pill CTAs; zero serifs; zero infinite animations
 *
 * Self-contained: scoped .ll- classes + local vars, no dark-theme deps.
 */
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/* ── Demo rows for the product frame (illustrative UI, labeled as preview) ── */
const DEMO_ROWS = [
  { name: 'Clinica Adelante',      type: 'FQHC',        dist: '1.2 mi', cost: '$0',            costKind: 'free',  status: 'Open · closes 6 PM',  open: true  },
  { name: 'Mountain Park Health',  type: 'FQHC',        dist: '2.4 mi', cost: '$0',            costKind: 'free',  status: 'Open · closes 8 PM',  open: true  },
  { name: 'Valle del Sol',         type: 'Community',   dist: '2.8 mi', cost: 'Sliding scale', costKind: 'slide', status: 'Opens tomorrow 8 AM', open: false },
  { name: 'St. Vincent de Paul',   type: 'Free clinic', dist: '3.5 mi', cost: '$0',            costKind: 'free',  status: 'Open · closes 5 PM',  open: true  },
  { name: 'Wesley Health Center',  type: 'FQHC',        dist: '4.1 mi', cost: '$0–$40',        costKind: 'slide', status: 'Open · closes 7 PM',  open: true  },
]

const STEPS = [
  { n: '01', t: 'Tell us what you need', d: 'A symptom, a specialty, or just your ZIP code. Anonymous — no account, ever.' },
  { n: '02', t: 'See real options, ranked', d: 'Free clinics, sliding-scale care, and programs you qualify for — sorted by distance and cost.' },
  { n: '03', t: 'Call, book, or walk in', d: 'Live hours, phone numbers, and directions in your language. Most visits cost $0.' },
]

const FEATURES = [
  { t: 'AI symptom guide',      d: 'Describe how you feel in plain words. Get pointed to the right kind of care — not the ER by default.', href: '/triage',      chip: 'Triage' },
  { t: 'Eligibility checker',   d: 'Answer a few questions. See which programs — Medicaid, ACA, HRSA — you likely qualify for.',            href: '/eligibility', chip: 'Programs' },
  { t: 'Medication assistance', d: 'Find patient-assistance programs and discounts that cut prescription costs by up to 90%.',              href: '/medications', chip: 'Savings' },
  { t: 'Health Passport',       d: 'Keep your visits, meds, and records in one place you control. Show it at any front desk.',              href: '/passport',    chip: 'Records' },
]

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
              <circle cx="50" cy="28" r="14" fill="#0E1116" />
              <circle cx="28" cy="66" r="14" fill="#0E1116" opacity="0.75" />
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
            <Link href="/search" className="ll-btn-black">Find free care</Link>
          </div>
        </div>
      </header>

      {/* ════════ HERO ════════ */}
      <section className="ll-hero" aria-labelledby="ll-h1">
        {/* Pill badge */}
        <Link href="/triage" className="ll-badge">
          <span className="ll-badge-new">New</span>
          AI symptom guide is live
          <span aria-hidden="true">→</span>
        </Link>

        {/* Headline */}
        <h1 id="ll-h1" className="ll-h1">
          Free healthcare,<br />found in seconds.
        </h1>

        <p className="ll-sub">
          NEXUS finds free clinics, hidden programs, and real care near you.{' '}
          <br className="ll-br-desktop" />
          No insurance. No cost. No catch.
        </p>

        {/* Search — the primary action */}
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
          <button onClick={go} className="ll-btn-black ll-search-btn">Search</button>
        </div>

        <p className="ll-microproof">Anonymous · 48 languages · Always free</p>

        {/* ── Product frame — live markup, Attio-style app window ── */}
        <div className="ll-frame-wrap" aria-label="Preview of NEXUS search results">
          <div className="ll-frame">
            {/* Window chrome */}
            <div className="ll-chrome">
              <span className="ll-dot" /><span className="ll-dot" /><span className="ll-dot" />
              <span className="ll-chrome-url">nexus.health/search</span>
              <span className="ll-chrome-tag">Preview</span>
            </div>

            <div className="ll-app">
              {/* Sidebar */}
              <aside className="ll-side" aria-hidden="true">
                <div className="ll-side-search">⌕&nbsp; Search</div>
                {['Find care', 'Programs', 'Medications', 'Passport', 'Crisis help'].map((item, i) => (
                  <div key={item} className={`ll-side-item${i === 0 ? ' active' : ''}`}>{item}</div>
                ))}
              </aside>

              {/* Results */}
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

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="ll-section" aria-labelledby="ll-how-t">
        <p className="ll-eyebrow">How it works</p>
        <h2 id="ll-how-t" className="ll-h2">Three steps to real care.</h2>
        <div className="ll-steps">
          {STEPS.map(s => (
            <div key={s.n} className="ll-step">
              <span className="ll-step-n">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="ll-section" aria-labelledby="ll-feat-t">
        <p className="ll-eyebrow">Beyond the search</p>
        <h2 id="ll-feat-t" className="ll-h2">Everything between you and care.</h2>
        <div className="ll-features">
          {FEATURES.map(f => (
            <Link key={f.t} href={f.href} className="ll-feature">
              <span className="ll-chip">{f.chip}</span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
              <span className="ll-feature-link">Explore <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════ QUOTE ════════ */}
      <section className="ll-quote-wrap" aria-label="Community voice">
        <blockquote className="ll-quote">
          <p>“I put off a tooth infection for eight months because I thought care meant debt. NEXUS showed me a free dental clinic eleven minutes from my apartment.”</p>
          <footer>— A NEXUS community story, Phoenix AZ</footer>
        </blockquote>
      </section>

      {/* ════════ CTA BAND ════════ */}
      <section className="ll-cta" aria-labelledby="ll-cta-t">
        <h2 id="ll-cta-t">Care shouldn’t cost everything.</h2>
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
          --teal:    #0D9488;
          --teal-bg: #E9F6F4;
          --blue:    #2563EB;
          --blue-bg: #EBF1FE;
          --amber-bg:#FBF3E4;
          --amber:   #B45309;
          --shadow-card: 0 1px 2px rgba(15,20,30,0.05), 0 8px 24px rgba(15,20,30,0.06);
          --shadow-frame: 0 2px 6px rgba(15,20,30,0.05), 0 24px 64px rgba(15,20,30,0.10);
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-inter), system-ui, sans-serif;
          min-height: 100vh;
        }
        .ll *, .ll *::before, .ll *::after { box-sizing: border-box; }
        /* :where() keeps specificity at zero so component classes always win */
        :where(.ll) a { text-decoration: none; color: inherit; }
        .ll h1, .ll h2, .ll h3, .ll p { margin: 0; }

        /* ── Buttons ── */
        .ll-btn-black {
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--ink); color: #fff;
          border: none; border-radius: 100px;
          padding: 10px 20px; font-size: 14px; font-weight: 600;
          cursor: pointer; white-space: nowrap;
          transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.18s ease, background 0.18s ease;
        }
        .ll-btn-black:hover { background: #1C222B; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,20,30,0.18); }
        .ll-btn-black:active { transform: translateY(0) scale(0.98); }
        .ll-btn-ghost {
          padding: 10px 16px; font-size: 14px; font-weight: 550; color: var(--ink);
          border-radius: 100px; transition: background 0.15s ease;
        }
        .ll-btn-ghost:hover { background: rgba(15,20,30,0.05); }
        .ll-btn-white {
          display: inline-flex; align-items: center;
          background: #fff; color: var(--ink);
          border-radius: 100px; padding: 13px 26px;
          font-size: 15px; font-weight: 650;
          transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.18s ease;
        }
        .ll-btn-white:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(0,0,0,0.30); }

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
        .ll-badge:hover { border-color: #D8D5CE; box-shadow: 0 2px 8px rgba(15,20,30,0.08); }
        .ll-badge-new {
          background: var(--ink); color: #fff;
          border-radius: 100px; padding: 3px 10px;
          font-size: 11.5px; font-weight: 650;
        }
        .ll-h1 {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: clamp(2.7rem, 6.5vw, 4.9rem);
          font-weight: 700; letter-spacing: -0.045em; line-height: 1.03;
          color: var(--ink);
          animation: ll-rise 0.7s cubic-bezier(0.16,1,0.3,1) 0.06s both;
        }
        .ll-sub {
          margin-top: 22px;
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
          border-color: #C9C6BE;
          box-shadow: 0 1px 2px rgba(15,20,30,0.05), 0 12px 32px rgba(15,20,30,0.10);
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

        /* ── Product frame ── */
        .ll-frame-wrap {
          width: 100%; margin-top: clamp(48px, 7vh, 72px);
          padding: 0 0 8px;
          position: relative;
        }
        .ll-frame-wrap::before {
          content: ''; position: absolute; left: 50%; transform: translateX(-50%);
          bottom: -1px; width: 100vw; height: 1px; background: var(--line-2);
        }
        .ll-frame {
          background: #fff; border: 1px solid var(--line);
          border-radius: 16px; overflow: hidden;
          box-shadow: var(--shadow-frame);
          text-align: left;
          animation: ll-rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        }
        .ll-chrome {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px; border-bottom: 1px solid var(--line-2);
          background: #FCFCFA;
        }
        .ll-dot { width: 10px; height: 10px; border-radius: 50%; background: #E4E2DC; }
        .ll-chrome-url {
          margin-left: 12px; font-size: 12px; color: var(--ink-3);
          font-family: var(--font-mono), monospace;
        }
        .ll-chrome-tag {
          margin-left: auto; font-size: 10px; font-weight: 650; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--ink-3);
          border: 1px solid var(--line); border-radius: 100px; padding: 2px 9px;
        }
        .ll-app { display: flex; min-height: 380px; }
        .ll-side {
          width: 190px; flex-shrink: 0;
          border-right: 1px solid var(--line-2);
          padding: 14px 10px; background: #FCFCFA;
          display: flex; flex-direction: column; gap: 2px;
        }
        .ll-side-search {
          font-size: 12.5px; color: var(--ink-3);
          border: 1px solid var(--line); border-radius: 8px;
          padding: 7px 10px; margin-bottom: 10px; background: #fff;
        }
        .ll-side-item {
          font-size: 13px; font-weight: 500; color: var(--ink-2);
          padding: 7px 10px; border-radius: 8px;
        }
        .ll-side-item.active { background: rgba(15,20,30,0.055); color: var(--ink); font-weight: 600; }
        .ll-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .ll-toolbar {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          padding: 12px 18px; border-bottom: 1px solid var(--line-2);
        }
        .ll-query-chip {
          font-size: 13px; font-weight: 600; color: var(--ink);
          background: var(--line-2); border-radius: 8px; padding: 5px 12px;
        }
        .ll-filter {
          font-size: 12px; font-weight: 550; color: var(--ink-3);
          border: 1px solid var(--line); border-radius: 100px; padding: 4px 12px;
        }
        .ll-filter.on { color: var(--teal); background: var(--teal-bg); border-color: transparent; }
        .ll-count { margin-left: auto; font-size: 12px; color: var(--ink-3); font-family: var(--font-mono), monospace; }
        .ll-grid { display: flex; flex-direction: column; }
        .ll-row {
          display: grid;
          grid-template-columns: minmax(180px, 2.2fr) 0.9fr 1.1fr 1.6fr 0.7fr;
          gap: 12px; align-items: center;
          padding: 11px 18px;
          border-bottom: 1px solid var(--line-2);
          font-size: 13.5px;
        }
        .ll-row:last-child { border-bottom: none; }
        .ll-row:not(.ll-head):hover { background: #FCFCFA; }
        .ll-head {
          font-size: 10.5px; font-weight: 650; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--ink-3);
          padding-top: 10px; padding-bottom: 10px;
        }
        .ll-cell-name { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .ll-avatar {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: var(--blue-bg); color: var(--blue);
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
        }
        .ll-name { display: block; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ll-type { display: block; font-size: 11.5px; color: var(--ink-3); }
        .ll-mono { font-family: var(--font-mono), monospace; font-size: 12.5px; color: var(--ink-2); }
        .ll-cost { font-size: 12px; font-weight: 650; border-radius: 6px; padding: 3px 9px; }
        .ll-cost.free  { background: var(--teal-bg); color: var(--teal); }
        .ll-cost.slide { background: var(--amber-bg); color: var(--amber); }
        .ll-status { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--ink-2); white-space: nowrap; }
        .ll-status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ink-3); flex-shrink: 0; }
        .ll-status-dot.open { background: var(--teal); }
        .ll-call {
          font-size: 12.5px; font-weight: 650; color: var(--ink);
          border: 1px solid var(--line); border-radius: 100px; padding: 5px 14px;
        }
        .ll-col-action { text-align: right; }

        /* ── Trust band ── */
        .ll-band {
          border-bottom: 1px solid var(--line-2);
          max-width: 1120px; margin: 0 auto;
          padding: clamp(32px, 5vh, 48px) clamp(16px, 4vw, 32px);
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
        }
        .ll-band-item { display: flex; flex-direction: column; gap: 4px; align-items: center; text-align: center; }
        .ll-band-big { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700; letter-spacing: -0.03em; }
        .ll-band-small { font-size: 12.5px; color: var(--ink-3); }

        /* ── Sections ── */
        .ll-section {
          max-width: 1120px; margin: 0 auto;
          padding: clamp(64px, 10vh, 110px) clamp(16px, 4vw, 32px) 0;
          text-align: center;
        }
        .ll-eyebrow {
          font-size: 12px; font-weight: 650; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--teal); margin-bottom: 14px;
        }
        .ll-h2 {
          font-size: clamp(1.8rem, 3.6vw, 2.6rem);
          font-weight: 700; letter-spacing: -0.035em; line-height: 1.12;
          margin-bottom: clamp(36px, 5vh, 56px);
        }
        .ll-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: left; }
        .ll-step {
          background: #fff; border: 1px solid var(--line);
          border-radius: 16px; padding: 26px;
          box-shadow: var(--shadow-card);
        }
        .ll-step-n {
          font-family: var(--font-mono), monospace;
          font-size: 12px; color: var(--ink-3); letter-spacing: 0.1em;
          display: block; margin-bottom: 14px;
        }
        .ll-step h3 { font-size: 16.5px; font-weight: 650; letter-spacing: -0.01em; margin-bottom: 8px; }
        .ll-step p { font-size: 14px; line-height: 1.65; color: var(--ink-2); }

        /* ── Features ── */
        .ll-features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; text-align: left; }
        .ll-feature {
          background: #fff; border: 1px solid var(--line);
          border-radius: 16px; padding: 28px;
          box-shadow: var(--shadow-card);
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease, border-color 0.2s ease;
          display: flex; flex-direction: column; align-items: flex-start;
        }
        .ll-feature:hover {
          transform: translateY(-3px);
          border-color: #D8D5CE;
          box-shadow: 0 2px 6px rgba(15,20,30,0.05), 0 16px 40px rgba(15,20,30,0.10);
        }
        .ll-chip {
          font-size: 11px; font-weight: 650; letter-spacing: 0.06em; text-transform: uppercase;
          background: var(--blue-bg); color: var(--blue);
          border-radius: 100px; padding: 3px 10px; margin-bottom: 16px;
        }
        .ll-feature h3 { font-size: 18px; font-weight: 650; letter-spacing: -0.015em; margin-bottom: 8px; }
        .ll-feature p { font-size: 14px; line-height: 1.65; color: var(--ink-2); }
        .ll-feature-link { margin-top: 16px; font-size: 13.5px; font-weight: 600; color: var(--ink); }

        /* ── Quote ── */
        .ll-quote-wrap {
          max-width: 1120px; margin: 0 auto;
          padding: clamp(72px, 11vh, 120px) clamp(16px, 4vw, 32px) 0;
        }
        .ll-quote { margin: 0; text-align: center; }
        .ll-quote p {
          font-size: clamp(1.3rem, 2.6vw, 1.9rem);
          font-weight: 550; letter-spacing: -0.02em; line-height: 1.4;
          max-width: 760px; margin: 0 auto; color: var(--ink);
        }
        .ll-quote footer { margin-top: 20px; font-size: 13.5px; color: var(--ink-3); }

        /* ── CTA band ── */
        .ll-cta {
          max-width: 1120px;
          margin: clamp(72px, 11vh, 120px) auto 0;
          border-radius: 24px;
          background: var(--ink); color: #fff;
          padding: clamp(48px, 8vh, 80px) clamp(24px, 5vw, 64px);
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .ll-cta h2 {
          font-size: clamp(1.9rem, 4vw, 3rem);
          font-weight: 700; letter-spacing: -0.035em; line-height: 1.1;
        }
        .ll-cta p { margin-top: 14px; font-size: 15.5px; color: rgba(255,255,255,0.65); }
        .ll-cta .ll-btn-white { margin-top: 28px; }
        .ll-cta-sub { margin-top: 14px; font-size: 12px; color: rgba(255,255,255,0.45); letter-spacing: 0.04em; }

        /* ── Footer ── */
        .ll-footer {
          max-width: 1120px; margin: 0 auto;
          padding: clamp(56px, 8vh, 88px) clamp(16px, 4vw, 32px) 32px;
        }
        .ll-footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 32px;
          padding-bottom: 40px; border-bottom: 1px solid var(--line-2);
        }
        .ll-footer-logo { font-weight: 800; letter-spacing: 0.14em; font-size: 14px; display: block; margin-bottom: 12px; }
        .ll-footer-brand p { font-size: 13.5px; line-height: 1.65; color: var(--ink-2); max-width: 260px; }
        .ll-footer-col { display: flex; flex-direction: column; gap: 10px; }
        .ll-footer-h { font-size: 11px; font-weight: 650; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 4px; }
        .ll-footer-col a { font-size: 13.5px; color: var(--ink-2); transition: color 0.15s ease; }
        .ll-footer-col a:hover { color: var(--ink); }
        .ll-footer-bottom { padding-top: 24px; font-size: 12px; color: var(--ink-3); }

        /* App chrome doesn't belong on the marketing page. This style tag
           only mounts on the landing route, so the hide is page-scoped.
           (Crisis stays reachable via nav sections + footer link.) */
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
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .ll-nav-links { display: none; }
          .ll-steps { grid-template-columns: 1fr; }
          .ll-features { grid-template-columns: 1fr; }
          .ll-band { grid-template-columns: repeat(2, 1fr); }
          .ll-side { display: none; }
          .ll-footer-grid { grid-template-columns: 1fr 1fr; }
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
