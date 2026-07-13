import type { Metadata } from 'next'
import AppShell from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'Accessibility — NEXUS',
  description: 'How NEXUS works to be usable by everyone, and how to reach us about accessibility barriers.',
}

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Our commitment',
    body: [
      'NEXUS exists to remove barriers to healthcare — so removing barriers to using NEXUS itself is core to the mission. We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, and we treat accessibility as an ongoing responsibility, not a one-time checkbox.',
      'Many of the people we serve are older, disabled, low-vision, hard of hearing, or navigating care under stress. The product is built for them first.',
    ],
  },
  {
    title: 'What we do today',
    body: [
      'Keyboard navigation: the core flows — search, results, triage, and crisis — can be operated without a mouse.',
      'Screen readers: interactive elements carry descriptive labels, form fields have associated labels, and decorative graphics are hidden from assistive technology.',
      'Reduced motion: if your device requests reduced motion, animations are disabled and content renders immediately.',
      'Language: the platform supports 48 languages so people can navigate care in the language they speak.',
      'Touch targets: buttons and links on mobile meet a minimum comfortable tap size.',
      'Text and inputs: form inputs use a 16px minimum on mobile to prevent forced zoom, and layouts avoid horizontal scrolling.',
    ],
  },
  {
    title: 'Where we are still improving',
    body: [
      'We are actively working toward full WCAG 2.1 AA conformance, including a formal audit with automated tooling and manual screen-reader testing across every page. Color contrast on some secondary text and dense data views is under review. If you hit a barrier, telling us speeds this up.',
    ],
  },
  {
    title: 'Emergencies',
    body: [
      'NEXUS is not a substitute for emergency care. If you are experiencing a medical emergency, call 911. If you are in a mental-health crisis, call or text 988 (the Suicide & Crisis Lifeline).',
    ],
  },
  {
    title: 'Contact us about accessibility',
    body: [
      'If any part of NEXUS is difficult or impossible for you to use, please tell us — we treat accessibility reports as high priority. Email accessibility@nexus.health with the page, your device or assistive technology, and what went wrong, and we will respond and work to fix it.',
    ],
  },
]

export default function AccessibilityPage() {
  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(56px, 9vh, 104px) clamp(20px, 5vw, 32px) clamp(64px, 10vh, 112px)' }}>
          <p style={{ fontSize: '12px', fontWeight: 650, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
            Accessibility
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: '16px', color: 'var(--text)' }}>
            Built to be used by everyone.
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.75, marginBottom: '48px', fontFamily: 'var(--font-inter)' }}>
            Last updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
          </p>

          {SECTIONS.map(s => (
            <section key={s.title} style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', marginBottom: '14px' }}>{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.75, marginBottom: '12px', fontFamily: 'var(--font-inter)' }}>{p}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
