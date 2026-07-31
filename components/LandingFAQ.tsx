'use client'
import { useEffect, useRef, useState } from 'react'
import { Add } from 'iconsax-react'

/* Honest answers — every claim here matches how the product actually
   works (browser-side eligibility, no account, public data sources). */
const FAQS = [
  { q: 'Is NEXUS really free?', a: 'Yes — completely, always. There are no fees, no premium tier, and no card required. NEXUS is a navigation tool, not an insurer or provider.' },
  { q: 'Do I need insurance to use it?', a: 'No. NEXUS is built specifically for people without insurance or who are underinsured. Free and sliding-scale clinics are legally required to serve you regardless of coverage.' },
  { q: 'Do I have to create an account?', a: 'No. You can search clinics, check eligibility, and use every core feature anonymously. An optional account only exists to save clinics and records if you want to.' },
  { q: 'Is my information private?', a: 'Yes. Eligibility is calculated entirely in your browser — your income and household answers are never sent to a server. We don’t sell data, ever.' },
  { q: 'How current is the clinic data?', a: 'Clinics come from authoritative public datasets — HRSA, the National Association of Free & Charitable Clinics, the CMS provider registry, and SAMHSA — refreshed on a regular schedule.' },
  { q: 'Can immigrants use NEXUS?', a: 'Yes. HRSA-funded health centers serve everyone regardless of immigration status, and NEXUS shows which options apply to your situation.' },
  { q: 'What if I’m in an emergency?', a: 'Call 911. For mental-health or crisis support, the Crisis page lists 24/7 lifelines and is precached to load even with no connection.' },
]

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          padding: '20px 4px', textAlign: 'left', fontFamily: 'var(--font-display)',
        }}
      >
        <span style={{ fontSize: 'clamp(15px, 1.7vw, 17px)', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.4 }}>{q}</span>
        <span style={{
          flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
          background: open ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border-subtle)'}`,
          display: 'grid', placeItems: 'center',
          transition: 'transform 0.3s var(--ease-out-expo), background 0.25s, border-color 0.25s',
          transform: open ? 'rotate(45deg)' : 'rotate(0)',
        }}>
          <Add size={16} color={open ? '#ffffff' : 'var(--text-2)'} variant="Linear" />
        </span>
      </button>
      <div style={{
        display: 'grid', gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.34s var(--ease-out-expo)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ margin: '0 4px 22px', fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.75, fontFamily: 'var(--font-inter)', maxWidth: '640px' }}>{a}</p>
        </div>
      </div>
    </div>
  )
}

export default function LandingFAQ() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.12 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      aria-labelledby="faq-title"
      style={{ position: 'relative', zIndex: 2, maxWidth: '760px', margin: '0 auto', padding: 'clamp(80px, 12vh, 130px) clamp(20px, 5vw, 40px) 0' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)', transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
        <p style={{ fontSize: '11px', fontWeight: 650, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>
          Questions
        </p>
        <h2 id="faq-title" style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)',
          fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, color: 'var(--text)', textWrap: 'balance',
        }}>
          Everything you might be wondering
        </h2>
      </div>

      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease 0.15s', borderTop: '1px solid var(--border-subtle)' }}>
        {FAQS.map((f, i) => (
          <FAQItem key={f.q} q={f.q} a={f.a} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? null : i)} />
        ))}
      </div>
    </section>
  )
}
