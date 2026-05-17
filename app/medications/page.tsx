'use client'
import React, { useState, useMemo } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { Pill, Search, ExternalLink, ChevronRight, AlertCircle, DollarSign, Heart, Info, Zap, CheckCircle2 } from 'lucide-react'
import DotGrid from '@/components/DotGrid'

/* ── Medication assistance programs ─────────────────────────── */
const PROGRAMS = [
  {
    name: 'NeedyMeds',
    url: 'https://www.needymeds.org',
    desc: 'Largest database of patient assistance programs. Search by drug name to find free or low-cost options from manufacturers.',
    tags: ['Free', 'All drugs', 'No income limit required'],
    color: '#4A8FD4',
    icon: '💊',
  },
  {
    name: 'RxAssist',
    url: 'https://www.rxassist.org',
    desc: 'Directory of pharmaceutical company patient assistance programs. Many brand-name drugs available free with proof of financial need.',
    tags: ['Free', 'Brand-name', 'Apply directly'],
    color: '#34d399',
    icon: '🏥',
  },
  {
    name: 'GoodRx',
    url: 'https://www.goodrx.com',
    desc: 'Compare prices at nearby pharmacies. Free coupons can reduce costs by up to 80% — no sign-up required.',
    tags: ['Discounted', 'Instant coupon', 'No enrollment'],
    color: '#60a5fa',
    icon: '🎟️',
  },
  {
    name: 'Partnership for Prescription Assistance',
    url: 'https://www.pparx.org',
    desc: 'Connects patients to over 475 public and private programs providing free or low-cost medications.',
    tags: ['Free', 'Multiple programs', 'Uninsured'],
    color: '#a78bfa',
    icon: '🤝',
  },
  {
    name: 'Medicare Extra Help (Low Income Subsidy)',
    url: 'https://www.ssa.gov/medicare/part-d-extra-help',
    desc: 'For Medicare beneficiaries who need help paying for Part D prescription drug costs.',
    tags: ['Medicare', 'Income-based', 'Federal program'],
    color: '#fbbf24',
    icon: '🏛️',
  },
  {
    name: 'State Pharmaceutical Assistance Programs',
    url: 'https://www.medicare.gov/pharmaceutical-assistance-program',
    desc: 'Many states offer additional prescription assistance beyond federal programs. Search your state\'s offerings.',
    tags: ['State-specific', 'Variable', 'Income-based'],
    color: '#f87171',
    icon: '🗺️',
  },
]

const TIPS = [
  { icon: '1', text: 'Always ask your doctor for generic alternatives — they\'re chemically identical and can cost 80-90% less.' },
  { icon: '2', text: 'Search the drug name on NeedyMeds AND RxAssist — programs differ by manufacturer.' },
  { icon: '3', text: 'Manufacturer assistance programs often provide 90-day supplies free of charge for qualifying patients.' },
  { icon: '4', text: 'FQHCs (federally-qualified health centers) dispense medications at deep discounts through the 340B drug program.' },
  { icon: '5', text: 'GoodRx and similar coupons can\'t be combined with insurance — use whichever is cheaper per fill.' },
  { icon: '6', text: 'Many pharmacies (Walmart, Costco) offer $4 generics on a standard list — ask your pharmacist.' },
]

const FQHC_LINK = '/search?type=fqhc'

/* ── N1: PAP Drug Database ────────────────────────────────────────
   Curated list of the most-sought drugs by uninsured Americans.
   Each entry links directly to the manufacturer assistance program.
   ─────────────────────────────────────────────────────────────── */
const PAP_DRUGS = [
  // Diabetes
  { name: 'Insulin (all types)', brand: 'Humalog / Novolog / Lantus', category: 'Diabetes', manufacturer: 'Lilly Cares / Novo Nordisk Cares / Sanofi', incomeLimit: '≤400% FPL', papUrl: 'https://www.lillyinsulinvalue.com', pricingUrl: 'https://costplusdrugs.com/medications/search/?q=insulin', color: '#60a5fa' },
  { name: 'Metformin', brand: 'Glucophage (generic)', category: 'Diabetes', manufacturer: 'Generic — no PAP needed', incomeLimit: 'Any', papUrl: 'https://costplusdrugs.com/medications/search/?q=metformin', pricingUrl: 'https://www.goodrx.com/metformin', color: '#60a5fa' },
  { name: 'Ozempic / Wegovy', brand: 'Semaglutide', category: 'Diabetes / Weight', manufacturer: 'Novo Nordisk Patient Assistance', incomeLimit: '≤400% FPL', papUrl: 'https://www.novonordiskcares.com', pricingUrl: 'https://www.goodrx.com/ozempic', color: '#60a5fa' },
  { name: 'Trulicity', brand: 'Dulaglutide', category: 'Diabetes', manufacturer: 'Lilly Cares Foundation', incomeLimit: '≤400% FPL', papUrl: 'https://www.trulicity.com/savings-resources.html', pricingUrl: 'https://www.goodrx.com/trulicity', color: '#60a5fa' },
  // Cardiovascular
  { name: 'Atorvastatin', brand: 'Lipitor (generic)', category: 'Cardiovascular', manufacturer: 'Generic — Cost Plus / GoodRx', incomeLimit: 'Any', papUrl: 'https://costplusdrugs.com/medications/search/?q=atorvastatin', pricingUrl: 'https://www.goodrx.com/atorvastatin', color: '#f472b6' },
  { name: 'Lisinopril', brand: 'Prinivil / Zestril (generic)', category: 'Cardiovascular', manufacturer: 'Generic — no PAP needed', incomeLimit: 'Any', papUrl: 'https://costplusdrugs.com/medications/search/?q=lisinopril', pricingUrl: 'https://www.goodrx.com/lisinopril', color: '#f472b6' },
  { name: 'Eliquis', brand: 'Apixaban', category: 'Cardiovascular', manufacturer: 'Bristol-Myers Squibb & Pfizer Together Rx', incomeLimit: '≤400% FPL', papUrl: 'https://www.bms.com/patient-and-caregivers/patient-assistance-foundation/patient-assistance-program.html', pricingUrl: 'https://www.goodrx.com/eliquis', color: '#f472b6' },
  { name: 'Xarelto', brand: 'Rivaroxaban', category: 'Cardiovascular', manufacturer: 'Janssen Patient Assistance Program', incomeLimit: '≤400% FPL', papUrl: 'https://www.janssenprescriptionassistance.com', pricingUrl: 'https://www.goodrx.com/xarelto', color: '#f472b6' },
  // Mental health
  { name: 'Sertraline', brand: 'Zoloft (generic)', category: 'Mental Health', manufacturer: 'Generic — Cost Plus', incomeLimit: 'Any', papUrl: 'https://costplusdrugs.com/medications/search/?q=sertraline', pricingUrl: 'https://www.goodrx.com/sertraline', color: '#a78bfa' },
  { name: 'Escitalopram', brand: 'Lexapro (generic)', category: 'Mental Health', manufacturer: 'Generic — no PAP needed', incomeLimit: 'Any', papUrl: 'https://costplusdrugs.com/medications/search/?q=escitalopram', pricingUrl: 'https://www.goodrx.com/escitalopram', color: '#a78bfa' },
  { name: 'Vyvanse', brand: 'Lisdexamfetamine', category: 'ADHD', manufacturer: 'Takeda Patient Assistance', incomeLimit: '≤400% FPL', papUrl: 'https://www.takedaoncologyassist.com', pricingUrl: 'https://www.goodrx.com/vyvanse', color: '#a78bfa' },
  // Respiratory
  { name: 'Albuterol inhaler', brand: 'ProAir / Ventolin (generic)', category: 'Respiratory', manufacturer: 'GSK Patient Assistance / Cost Plus', incomeLimit: '≤300% FPL', papUrl: 'https://www.gsk.com/en-gb/responsibility/access-to-medicines/', pricingUrl: 'https://costplusdrugs.com/medications/search/?q=albuterol', color: '#34d399' },
  { name: 'Advair / Symbicort', brand: 'Fluticasone / Budesonide combo', category: 'Respiratory', manufacturer: 'GSK Bridges to Access / AstraZeneca AZ&Me', incomeLimit: '≤400% FPL', papUrl: 'https://www.azandmeassistance.com', pricingUrl: 'https://www.goodrx.com/advair', color: '#34d399' },
  // Specialty / Biologics
  { name: 'Humira', brand: 'Adalimumab', category: 'Autoimmune', manufacturer: 'myAbbVie Assist', incomeLimit: '≤600% FPL', papUrl: 'https://www.abbvie.com/patients/patient-assistance.html', pricingUrl: 'https://www.goodrx.com/humira', color: '#fbbf24' },
  { name: 'Dupixent', brand: 'Dupilumab', category: 'Autoimmune / Eczema', manufacturer: 'Sanofi & Regeneron Patient Support', incomeLimit: '≤400% FPL', papUrl: 'https://www.dupixent.com/support-and-savings.html', pricingUrl: 'https://www.goodrx.com/dupixent', color: '#fbbf24' },
  { name: 'Keytruda', brand: 'Pembrolizumab', category: 'Oncology', manufacturer: 'Merck Access Program', incomeLimit: '≤500% FPL', papUrl: 'https://www.keytruda.com/financial-support.html', pricingUrl: 'https://www.goodrx.com/keytruda', color: '#fbbf24' },
  // Thyroid / Common
  { name: 'Levothyroxine', brand: 'Synthroid (generic)', category: 'Thyroid', manufacturer: 'Generic — Cost Plus', incomeLimit: 'Any', papUrl: 'https://costplusdrugs.com/medications/search/?q=levothyroxine', pricingUrl: 'https://www.goodrx.com/levothyroxine', color: '#6ee7b7' },
  { name: 'Omeprazole', brand: 'Prilosec (generic)', category: 'Gastro', manufacturer: 'Generic — $4 at major pharmacies', incomeLimit: 'Any', papUrl: 'https://costplusdrugs.com/medications/search/?q=omeprazole', pricingUrl: 'https://www.goodrx.com/omeprazole', color: '#6ee7b7' },
  { name: 'Amlodipine', brand: 'Norvasc (generic)', category: 'Cardiovascular', manufacturer: 'Generic — Cost Plus', incomeLimit: 'Any', papUrl: 'https://costplusdrugs.com/medications/search/?q=amlodipine', pricingUrl: 'https://www.goodrx.com/amlodipine', color: '#f472b6' },
  { name: 'HIV / PrEP (Truvada)', brand: 'Emtricitabine/TDF', category: 'HIV / Infectious', manufacturer: 'Gilead Advancing Access', incomeLimit: '≤500% FPL', papUrl: 'https://www.gileadadvancingaccess.com', pricingUrl: 'https://www.goodrx.com/truvada', color: '#f87171' },
]

const PAP_CATEGORIES = ['All', ...Array.from(new Set(PAP_DRUGS.map(d => d.category)))]

export default function MedicationsPage() {
  const [search, setSearch] = useState('')
  const [papSearch, setPapSearch] = useState('')
  const [papCategory, setPapCategory] = useState('All')

  const filtered = PROGRAMS.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.desc.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredDrugs = useMemo(() => {
    const q = papSearch.toLowerCase().trim()
    return PAP_DRUGS.filter(d => {
      const matchesCat = papCategory === 'All' || d.category === papCategory
      const matchesQ = !q ||
        d.name.toLowerCase().includes(q) ||
        d.brand.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.manufacturer.toLowerCase().includes(q)
      return matchesCat && matchesQ
    })
  }, [papSearch, papCategory])

  return (
    <AppShell>
      <style>{`
        .med-card { transition: border-color 0.2s, transform 0.2s; }
        .med-card:hover { border-color: rgba(74,144,217,0.3) !important; transform: translateY(-2px); }
        .med-tip { transition: background 0.15s; }
        .med-tip:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 24px 60px', textAlign: 'center', background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(74,144,217,0.08) 0%, transparent 70%)' }}>
        <DotGrid opacity={0.3} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)', fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
            <Pill size={12} />
            Medication Access
          </div>
          <h1 style={{ fontSize: 'clamp(32px,6vw,56px)', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 16, lineHeight: 1.1 }}>
            Get Your Medications<br />
            <span style={{ color: 'var(--accent)' }}>Free or Deeply Discounted</span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontFamily: 'var(--font-inter)', fontWeight: 300, maxWidth: 560, margin: '0 auto 32px' }}>
            Pharmaceutical companies are required to provide assistance programs. Most Americans don&apos;t know they exist. Here&apos;s how to access them.
          </p>

          {/* Disclaimer */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', maxWidth: 520, margin: '0 auto 24px', textAlign: 'left' }}>
            <AlertCircle size={15} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: 'rgba(255,200,60,0.8)', fontFamily: 'var(--font-inter)', margin: 0, lineHeight: 1.6 }}>
              Always consult your healthcare provider before changing medications. This is a resource guide, not medical advice.
            </p>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', opacity: 0.6 }} />
            <label htmlFor="med-search" className="sr-only">Search medication programs</label>
            <input
              id="med-search"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search programs or drug type…"
              style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(74,144,217,0.2)', color: 'var(--text)', fontFamily: 'var(--font-inter)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,144,217,0.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(74,144,217,0.2)')}
            />
          </div>
        </div>
      </section>

      {/* Programs grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: 60 }}>
          {filtered.map(p => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="med-card"
              style={{ display: 'block', padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: p.color, borderRadius: '16px 0 0 16px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{p.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-inter)' }}>{p.name}</span>
                </div>
                <ExternalLink size={14} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)', lineHeight: 1.6, marginBottom: 14, fontWeight: 300 }}>{p.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p.tags.map(tag => (
                  <span key={tag} style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: `${p.color}14`, color: p.color, border: `1px solid ${p.color}30`, fontFamily: 'var(--font-inter)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)' }}>
              No programs match your search. Try a different term.
            </div>
          )}
        </div>

        {/* ── N1: Drug Assistance Finder ─────────────────────────────── */}
        <div style={{ marginBottom: 60 }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#60a5fa" />
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: 'var(--text)', margin: 0 }}>
                Prescription Assistance Finder
              </h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)', margin: 0, marginTop: 2 }}>
                Search {PAP_DRUGS.length} drugs — direct links to manufacturer PAP programs &amp; price comparison
              </p>
            </div>
          </div>

          {/* Search + category filter row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <label htmlFor="pap-search" className="sr-only">Search drug name or brand</label>
              <input
                id="pap-search"
                type="search"
                value={papSearch}
                onChange={e => setPapSearch(e.target.value)}
                placeholder="Search drug name, brand, or condition…"
                style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', fontFamily: 'var(--font-inter)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {PAP_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setPapCategory(cat)}
                style={{ padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-inter)', cursor: 'pointer', border: '1px solid', transition: 'all 0.15s', background: papCategory === cat ? 'rgba(96,165,250,0.15)' : 'transparent', borderColor: papCategory === cat ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.1)', color: papCategory === cat ? '#60a5fa' : 'rgba(255,255,255,0.45)' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Drug cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filteredDrugs.map(drug => (
              <div
                key={drug.name}
                style={{ borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: '20px 20px 16px', position: 'relative', overflow: 'hidden' }}
              >
                {/* Left accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: drug.color, borderRadius: '14px 0 0 14px' }} />

                {/* Drug name + category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-inter)', lineHeight: 1.3 }}>{drug.name}</div>
                  <span style={{ padding: '2px 9px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: `${drug.color}18`, color: drug.color, border: `1px solid ${drug.color}30`, flexShrink: 0, marginLeft: 8 }}>
                    {drug.category}
                  </span>
                </div>

                {/* Brand name */}
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)', marginBottom: 10 }}>{drug.brand}</div>

                {/* Manufacturer row */}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle2 size={11} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.25)' }} />
                  {drug.manufacturer}
                </div>

                {/* Income limit badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: drug.incomeLimit === 'Any' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.08)', color: drug.incomeLimit === 'Any' ? '#34d399' : '#fbbf24', border: `1px solid ${drug.incomeLimit === 'Any' ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.2)'}`, marginBottom: 14, fontFamily: 'var(--font-inter)' }}>
                  {drug.incomeLimit === 'Any' ? '✓ No income limit' : `Income limit: ${drug.incomeLimit}`}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={drug.papUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 12px', borderRadius: 8, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-inter)', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(96,165,250,0.18)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(96,165,250,0.1)')}
                  >
                    <Zap size={12} />
                    PAP / Free
                  </a>
                  <a
                    href={drug.pricingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-inter)', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  >
                    <DollarSign size={12} />
                    Compare prices
                  </a>
                </div>
              </div>
            ))}

            {filteredDrugs.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 24px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-inter)', fontSize: 14 }}>
                No drugs match your search. Try a different term or clear the category filter.
              </div>
            )}
          </div>

          {/* Link to full NeedyMeds search */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <a href="https://www.needymeds.org/pap" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-inter)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Info size={13} />
              Search full NeedyMeds database for any drug not listed here
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* 340B tip */}
        <div style={{ padding: '24px 28px', borderRadius: 16, background: 'rgba(74,144,217,0.05)', border: '1px solid rgba(74,144,217,0.15)', marginBottom: 48, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <DollarSign size={22} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-inter)', marginBottom: 6 }}>
              Free Prescriptions at FQHCs via the 340B Drug Program
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter)', lineHeight: 1.7, margin: '0 0 14px' }}>
              Federally Qualified Health Centers participate in the 340B drug pricing program, which allows them to purchase medications at up to 50% discount and pass those savings on to uninsured patients. Many dispense medications free or for $1–$5 per prescription.
            </p>
            <Link href={FQHC_LINK} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-inter)' }}>
              Find FQHCs near me <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Tips section */}
        <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 20 }}>
          Tips for reducing prescription costs
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TIPS.map((tip, i) => (
            <div key={i} className="med-tip" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '14px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono, monospace)', flexShrink: 0 }}>
                {tip.icon}
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)', lineHeight: 1.65, margin: 0, fontWeight: 300 }}>{tip.text}</p>
            </div>
          ))}
        </div>

        {/* CTA to search */}
        <div style={{ marginTop: 60, textAlign: 'center', padding: '48px 24px', borderRadius: 20, background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.12)' }}>
          <Heart size={28} color="var(--accent)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 10 }}>
            Also need free clinic care?
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-inter)', marginBottom: 24, fontWeight: 300 }}>
            Find free and sliding-scale clinics near you for ongoing care alongside free medications.
          </p>
          <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 12, background: 'var(--accent)', color: '#07070F', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>
            Find Free Clinics Near Me <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </AppShell>
  )
}
