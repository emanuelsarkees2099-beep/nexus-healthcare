'use client'
import { useState, useMemo } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'

/* ── Where to look ──────────────────────────────────────────── */
const RESOURCES = [
  { name: 'NeedyMeds', url: 'https://www.needymeds.org', desc: 'A free database of manufacturer assistance programs, coupons, and low-cost clinics. Search by drug name.' },
  { name: 'RxAssist', url: 'https://www.rxassist.org', desc: 'A directory of drug company assistance programs. Many brand-name drugs are free for people who qualify by income.' },
  { name: 'GoodRx', url: 'https://www.goodrx.com', desc: 'Compares cash prices at nearby pharmacies and offers free discount coupons. No sign-up needed.' },
  { name: 'Cost Plus Drugs', url: 'https://costplusdrugs.com/medications/', desc: 'An online pharmacy that sells many generics at a fixed markup over cost, often for a few dollars a month.' },
  { name: 'Medicare Extra Help', url: 'https://www.ssa.gov/medicare/part-d-extra-help', desc: 'Federal help with Medicare Part D premiums and copays for people with limited income.' },
  { name: 'State pharmacy assistance programs', url: 'https://www.medicare.gov/basics/costs/help/drug-costs', desc: 'Some states run their own prescription assistance programs on top of federal help.' },
]

/* ── Common medications ─────────────────────────────────────────
   `program` entries link to the manufacturer's assistance program,
   which sets its own income limits. Generics link to price comparison. */
type Drug = {
  name: string
  detail: string
  category: string
  how: string
  program?: { name: string; url: string }
  priceUrl: string
}

const GENERIC_HOW = 'Generic. Usually inexpensive with a discount coupon or from Cost Plus Drugs.'

const DRUGS: Drug[] = [
  { name: 'Insulin', detail: 'Humalog, Novolog, Lantus', category: 'Diabetes', how: 'Lilly, Novo Nordisk, and Sanofi each offer programs that cap many insulins at $35 a month.', program: { name: 'Lilly Insulin Value Program', url: 'https://www.lillyinsulinvalue.com' }, priceUrl: 'https://www.goodrx.com/insulin' },
  { name: 'Metformin', detail: 'Generic Glucophage', category: 'Diabetes', how: GENERIC_HOW, priceUrl: 'https://www.goodrx.com/metformin' },
  { name: 'Ozempic', detail: 'Semaglutide', category: 'Diabetes', how: 'Novo Nordisk’s assistance program covers Ozempic for people who qualify by income. Wegovy is not included.', program: { name: 'Novo Nordisk PAP', url: 'https://www.novocare.com/psp/PAP.html' }, priceUrl: 'https://www.goodrx.com/ozempic' },
  { name: 'Trulicity', detail: 'Dulaglutide', category: 'Diabetes', how: 'Lilly Cares provides it free to people who qualify by income.', program: { name: 'Lilly Cares', url: 'https://www.lillycares.com' }, priceUrl: 'https://www.goodrx.com/trulicity' },
  { name: 'Atorvastatin', detail: 'Generic Lipitor', category: 'Heart', how: GENERIC_HOW, priceUrl: 'https://www.goodrx.com/atorvastatin' },
  { name: 'Lisinopril', detail: 'Generic Zestril', category: 'Heart', how: GENERIC_HOW, priceUrl: 'https://www.goodrx.com/lisinopril' },
  { name: 'Amlodipine', detail: 'Generic Norvasc', category: 'Heart', how: GENERIC_HOW, priceUrl: 'https://www.goodrx.com/amlodipine' },
  { name: 'Eliquis', detail: 'Apixaban', category: 'Heart', how: 'The Bristol Myers Squibb Patient Assistance Foundation provides it free to people who qualify.', program: { name: 'BMS Patient Assistance Foundation', url: 'https://www.bmspaf.org' }, priceUrl: 'https://www.goodrx.com/eliquis' },
  { name: 'Xarelto', detail: 'Rivaroxaban', category: 'Heart', how: 'Johnson & Johnson’s patient assistance foundation provides it free to people who qualify.', program: { name: 'J&J Patient Assistance Foundation', url: 'https://www.janssenprescriptionassistance.com' }, priceUrl: 'https://www.goodrx.com/xarelto' },
  { name: 'Sertraline', detail: 'Generic Zoloft', category: 'Mental health', how: GENERIC_HOW, priceUrl: 'https://www.goodrx.com/sertraline' },
  { name: 'Escitalopram', detail: 'Generic Lexapro', category: 'Mental health', how: GENERIC_HOW, priceUrl: 'https://www.goodrx.com/escitalopram' },
  { name: 'Lisdexamfetamine', detail: 'Generic Vyvanse', category: 'Mental health', how: 'A generic version has been available since 2023 and costs far less than the brand.', priceUrl: 'https://www.goodrx.com/vyvanse' },
  { name: 'Albuterol inhaler', detail: 'Generic ProAir, Ventolin', category: 'Breathing', how: GENERIC_HOW, priceUrl: 'https://www.goodrx.com/albuterol' },
  { name: 'Advair or Symbicort', detail: 'Inhaled steroid combinations', category: 'Breathing', how: 'GSK (Advair) and AstraZeneca (Symbicort, through AZ&Me) run assistance programs for people who qualify.', program: { name: 'AZ&Me', url: 'https://www.azandmeassistance.com' }, priceUrl: 'https://www.goodrx.com/advair' },
  { name: 'Levothyroxine', detail: 'Generic Synthroid', category: 'Other', how: GENERIC_HOW, priceUrl: 'https://www.goodrx.com/levothyroxine' },
  { name: 'Omeprazole', detail: 'Generic Prilosec', category: 'Other', how: 'Generic, and also sold over the counter.', priceUrl: 'https://www.goodrx.com/omeprazole' },
  { name: 'Humira', detail: 'Adalimumab', category: 'Other', how: 'myAbbVie Assist provides it free to people who qualify. Lower-cost biosimilars are also available.', program: { name: 'myAbbVie Assist', url: 'https://www.abbvie.com/patients/patient-assistance.html' }, priceUrl: 'https://www.goodrx.com/humira' },
  { name: 'Dupixent', detail: 'Dupilumab', category: 'Other', how: 'Sanofi and Regeneron offer patient support, including free medication for people who qualify.', program: { name: 'Dupixent MyWay', url: 'https://www.dupixentmyway.com' }, priceUrl: 'https://www.goodrx.com/dupixent' },
  { name: 'Keytruda', detail: 'Pembrolizumab', category: 'Other', how: 'Merck offers financial support programs. Ask the treating clinic’s financial counselor.', program: { name: 'Merck support', url: 'https://www.keytruda.com/financial-support.html' }, priceUrl: 'https://www.goodrx.com/keytruda' },
  { name: 'PrEP (Truvada)', detail: 'Emtricitabine / tenofovir', category: 'Other', how: 'A generic is available, and Gilead’s Advancing Access program helps people who qualify.', program: { name: 'Gilead Advancing Access', url: 'https://www.gileadadvancingaccess.com' }, priceUrl: 'https://www.goodrx.com/truvada' },
]

const CATEGORIES = ['All', 'Diabetes', 'Heart', 'Mental health', 'Breathing', 'Other']

const TIPS = [
  'Ask your doctor whether a generic exists. Generics have the same active ingredient as the brand and, according to the FDA, usually cost 80–85% less.',
  'Check both NeedyMeds and RxAssist. Each drug maker runs its own program with its own rules.',
  'Assistance programs ask for proof of income, and your doctor usually has to sign the application. Some ship a 90-day supply at a time.',
  'Discount coupons such as GoodRx can’t be combined with insurance. Use whichever is cheaper for each fill.',
  'Some pharmacies, such as Walmart, keep a low-price list of common generics. Ask the pharmacist.',
]

export default function MedicationsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const drugs = useMemo(() => {
    const q = query.toLowerCase().trim()
    return DRUGS.filter(d =>
      (category === 'All' || d.category === category) &&
      (!q || `${d.name} ${d.detail} ${d.category}`.toLowerCase().includes(q))
    )
  }, [query, category])

  return (
    <AppShell>
      <style>{`
        .meds { max-width: 880px; margin: 0 auto; padding: 112px 24px 96px; font-family: var(--font-inter); }
        .meds h1 { font-family: var(--font-display); font-size: clamp(32px, 5vw, 44px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; color: var(--text); margin: 0 0 16px; }
        .meds h2 { font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.01em; color: var(--text); margin: 0 0 8px; }
        .meds .lead { font-size: 17px; line-height: 1.65; color: var(--text-2); margin: 0 0 12px; max-width: 640px; }
        .meds .note { font-size: 14px; color: var(--text-3); margin: 0; }
        .meds section { margin-top: 64px; }
        .meds .sub { font-size: 15px; color: var(--text-2); margin: 0 0 20px; line-height: 1.6; }
        .meds a { color: var(--accent); text-decoration: none; }
        .meds a:hover { text-decoration: underline; text-underline-offset: 3px; }
        .meds .list { border-top: 1px solid var(--border-subtle); }
        .meds .row { padding: 18px 0; border-bottom: 1px solid var(--border-subtle); }
        .meds .row-title { font-size: 16px; font-weight: 600; color: var(--text); }
        .meds .row-desc { font-size: 15px; color: var(--text-2); line-height: 1.6; margin-top: 4px; }
        .meds .drug { display: grid; grid-template-columns: 200px 1fr auto; gap: 20px; align-items: start; }
        .meds .drug-detail { font-size: 14px; color: var(--text-3); margin-top: 2px; }
        .meds .drug-links { display: flex; flex-direction: column; gap: 6px; font-size: 14px; white-space: nowrap; text-align: right; }
        .meds .controls { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 8px; }
        .meds input[type=search] { flex: 1 1 240px; padding: 11px 14px; border-radius: 8px; background: var(--bg2); border: 1px solid var(--border); color: var(--text); font-size: 15px; font-family: inherit; outline: none; }
        .meds input[type=search]:focus { border-color: var(--accent); }
        .meds .tabs { display: flex; flex-wrap: wrap; gap: 4px; }
        .meds .tab { padding: 7px 12px; border-radius: 6px; border: none; background: none; color: var(--text-3); font-size: 14px; font-family: inherit; cursor: pointer; }
        .meds .tab[aria-pressed=true] { background: var(--bg3); color: var(--text); font-weight: 600; }
        .meds ol { margin: 0; padding-left: 20px; color: var(--text-2); font-size: 15px; line-height: 1.7; }
        .meds ol li { margin-bottom: 10px; }
        @media (max-width: 640px) {
          .meds .drug { grid-template-columns: 1fr; gap: 6px; }
          .meds .drug-links { flex-direction: row; gap: 16px; text-align: left; }
        }
      `}</style>

      <div className="meds">
        <p className="note" style={{ marginBottom: 12 }}>Medications</p>
        <h1>Lower-cost prescriptions</h1>
        <p className="lead">
          Many generics cost a few dollars a month with a discount coupon, and most drug makers run assistance
          programs that provide brand-name medications free to people with lower incomes. Here is where to look.
        </p>
        <p className="note">This is a resource guide, not medical advice. Talk with your doctor or pharmacist before changing a medication.</p>

        <section aria-labelledby="where">
          <h2 id="where">Where to look</h2>
          <div className="list">
            {RESOURCES.map(r => (
              <div key={r.name} className="row">
                <a className="row-title" href={r.url} target="_blank" rel="noopener noreferrer">{r.name} ↗</a>
                <div className="row-desc">{r.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="common">
          <h2 id="common">Common medications</h2>
          <p className="sub">The cheapest route for {DRUGS.length} commonly prescribed drugs. Assistance programs set their own income limits.</p>

          <div className="controls">
            <label htmlFor="med-search" className="sr-only">Search medications</label>
            <input id="med-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by drug name" />
          </div>
          <div className="tabs" role="group" aria-label="Filter by category" style={{ marginBottom: 12 }}>
            {CATEGORIES.map(c => (
              <button key={c} className="tab" aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>

          <div className="list">
            {drugs.map(d => (
              <div key={d.name} className="row drug">
                <div>
                  <div className="row-title">{d.name}</div>
                  <div className="drug-detail">{d.detail}</div>
                </div>
                <div className="row-desc" style={{ marginTop: 0 }}>{d.how}</div>
                <div className="drug-links">
                  {d.program && <a href={d.program.url} target="_blank" rel="noopener noreferrer">{d.program.name} ↗</a>}
                  <a href={d.priceUrl} target="_blank" rel="noopener noreferrer">Compare prices ↗</a>
                </div>
              </div>
            ))}
            {drugs.length === 0 && (
              <p className="row-desc" style={{ padding: '18px 0' }}>
                No match. Search the full <a href="https://www.needymeds.org" target="_blank" rel="noopener noreferrer">NeedyMeds database</a>.
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="centers">
          <h2 id="centers">Ask at a community health center</h2>
          <p className="sub" style={{ marginBottom: 12 }}>
            Many community health centers take part in the federal 340B program, which lets them buy medications at a
            discount, and many pass the savings on to uninsured patients through their pharmacy or sliding fee. Prices
            vary by center, so ask what your prescription would cost there.
          </p>
          <Link href="/search?type=fqhc">Find a health center near you →</Link>
        </section>

        <section aria-labelledby="tips">
          <h2 id="tips">Ways to pay less</h2>
          <ol>
            {TIPS.map(t => <li key={t}>{t}</li>)}
          </ol>
        </section>
      </div>
    </AppShell>
  )
}
