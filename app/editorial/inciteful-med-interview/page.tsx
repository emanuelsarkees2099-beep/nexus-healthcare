import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import JsonLd, { breadcrumbSchema } from '@/components/JsonLd'
import { findPartner } from '@/lib/partners'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.axvohealth.com'
const PAGE_URL = `${BASE_URL}/editorial/inciteful-med-interview`
const partner = findPartner('inciteful-med')!
const P = partner.color
const P2 = partner.colorAlt
const PT = '#C08BF7'

const TITLE = 'Q&A: Erika Warren on Inciteful Med and Putting Patients at the Center of Medical Research'
const DESCRIPTION = 'AXVO founder Emanuel Sarkees interviews Erika Warren, co-founder and CEO of Inciteful Med, about building a tool that helps patients understand the research behind their care.'
const DATE_ISO = '2026-10-22'

export const metadata: Metadata = {
  title: `${TITLE} — AXVO`,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, type: 'article', publishedTime: DATE_ISO },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

/* ── Content ───────────────────────────────────────────────
   Answers are Erika Warren's own words, as provided for this interview. */
type Block =
  | { t: 'p'; text: string }
  | { t: 'list'; items: { lead: string; text: string }[] }
  | { t: 'quote'; text: string; by?: string }
  | { t: 'stats'; items: { v: string; l: string }[] }

const QA: { q: string; a: Block[] }[] = [
  {
    q: 'What inspired you to create Inciteful Med, and what did you hope to make easier for patients?',
    a: [
      { t: 'p', text: 'Inciteful Med started out of personal necessity. My co-founder, Mike, is a computer scientist who had built an academic literature search engine for fun. Today, Inciteful Academic is used by 40,000 academics and researchers around the world every month. When a family member got sick, Mike started using it to find medical literature that could explain what was happening to his loved one and what their test results meant. His research turned up real cause for concern, so they sought a second opinion. They ended up contacting one of the researchers who had written the paper Mike was reading, and that researcher saw them and diagnosed stage IIIA cancer. Following the original clinical guidance to wait six months and rescan would have been bad news.' },
      { t: 'p', text: 'That experience taught us three things:' },
      { t: 'list', items: [
        { lead: 'The answers are out there.', text: 'Medical literature can be very precise and personalized when you search it around an individual patient instead of a condition that spans a broad population.' },
        { lead: '', text: 'Patients armed with accurate, reliable information (the same research their doctors use) can successfully advocate for better, more personalized care.' },
        { lead: '', text: 'Patients and caregivers are going to research their health no matter what. Three decades of telling people not to use Dr. Google, Dr. WebMD, or now Dr. ChatGPT haven’t worked. The problem was never patients doing research. It was the lack of reliable, trustworthy tools. Without them, patients get labeled a burden, because providers spend so much time undoing bad information and re-educating. Give patients something better, and everyone wins.' },
      ] },
      { t: 'quote', text: 'The problem was never patients doing research. It was the lack of reliable, trustworthy tools.' },
      { t: 'p', text: 'So that’s what we built. You ask a question in plain language, Inciteful Med searches more than 42 million peer-reviewed papers, and it explains what the research says. Every statement is cited with the exact passage it came from, because transparency builds trust.' },
    ],
  },
  {
    q: 'What has been the most rewarding part of building Inciteful Med?',
    a: [
      { t: 'p', text: 'Definitely the stories we hear from patients and caregivers. Nothing beats hearing that something you built brought relief, or a different outcome, to a family in a really tough season of life. We’ve been there with our own families, so we understand the stress and emotional toll. The best part is seeing patients and families become real collaborators in their care, with a say in their own health.' },
      { t: 'p', text: 'One caregiver, Bob, was in the ICU with a family member who has an ultra-rare disease. Two physicians told the family there was no evidence that a particular treatment could help his failing kidneys. Between 2:30 and 3:30 in the morning, on a laptop in the hospital room, Bob used Inciteful Med to find studies in Intensive Care Medicine showing that treatment working in exactly his family member’s situation. He handed the paper to the care team, and by noon the next day the treatment had started.' },
      { t: 'quote', text: 'It never would have happened without Inciteful Med.', by: 'Bob, caregiver' },
    ],
  },
  {
    q: 'What are some ways you’ve seen patients benefit from a better understanding of medical evidence?',
    a: [
      { t: 'p', text: 'First, it’s always available, it works in any language, and it doesn’t judge. People can ask the questions they were embarrassed to ask their doctor, forgot to ask in the appointment, or were too shocked to take in at the time.' },
      { t: 'p', text: 'Second, medicine is full of jargon. Most patient education is written at a 6th-grade reading level, and at that level most of the nuance, terminology, and important detail gets stripped out. The information becomes generic, which makes it far less useful. Inciteful Med translates the literature into plain language at a high-school reading level, and you can keep asking follow-up questions. Our answers are intentionally thorough, because we aren’t limited to the space of a handout.' },
      { t: 'p', text: 'The biggest benefit, though, is the magic of putting yourself at the center of the literature search. Medicine is practiced and studied in silos, but our bodies are complex, interconnected systems. When you add your health history or sync your medical records, Inciteful Med inverts the research to focus on you rather than a single disease, and you can learn an incredible amount about how your conditions interact. That leads to really specific questions for your doctor, which in turn shapes and improves the care you get.' },
      { t: 'p', text: 'Our own data backs this up. Patients and caregivers tell us that:' },
      { t: 'stats', items: [
        { v: '94%', l: 'felt more confident' },
        { v: '78%', l: 'found information they couldn’t get anywhere else, including from their doctor' },
        { v: '77%', l: 'used what they learned to influence their care' },
      ] },
      { t: 'p', text: 'In practice, that means bringing it into appointments, discussing it with their doctor, and their doctor adjusting care as a result. That’s advocacy at its best.' },
    ],
  },
  {
    q: 'What have you learned that has shaped how you think about the patient experience?',
    a: [
      { t: 'p', text: 'Financial incentives drive nearly every decision in healthcare, at least in the US. That isn’t the fault of doctors or clinicians. They’re stuck in the same system, with incentives that are often out of their control and that dictate how they have to practice. It’s no wonder burnout rates are what they are.' },
      { t: 'p', text: 'For patients, this matters, because the tools, technology, and systems we rely on for care aren’t always aligned with our best health outcomes. The more we empower patients with choice, transparency, and education, the more light we shed on those misaligned incentives, and the better outcomes patients get. It’s more work for patients up front, but today’s system is complex partly by design, and it stays that way to protect everyone but patients.' },
      { t: 'quote', text: 'That’s why Inciteful Med is fully independent. No hospital, insurer, or drug maker has any say in what we show you, only scientific evidence.' },
    ],
  },
  {
    q: 'What are you most excited about for the future?',
    a: [
      { t: 'p', text: 'The technology is already here, and it’s only getting better. What excites me most is transforming healthcare from the ground up, led by patients who can finally access this information. Information asymmetry is a form of power and control. Dismantling it makes care more personalized and less expensive.' },
      { t: 'p', text: 'We’re already building toward that: between visits, Inciteful Med watches your records, labs, newly published research, and clinical trials, and flags what matters, so you don’t have to keep it all in your head.' },
    ],
  },
  {
    q: 'If you could change one thing about how people interact with health information, what would it be?',
    a: [
      { t: 'p', text: 'It’s bananas that your health records are scattered across systems that don’t talk to each other. If I could solve interoperability and give every patient one unified record, patients would be unstoppable.' },
      { t: 'p', text: 'We’re chipping away at it. Inciteful Med can already pull records from many health systems into one place, and we add new ones every day.' },
    ],
  },
]

const ARTICLE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: DATE_ISO,
  dateModified: DATE_ISO,
  mainEntityOfPage: PAGE_URL,
  author: { '@type': 'Person', name: 'Emanuel Sarkees', url: `${BASE_URL}/founder` },
  publisher: { '@type': 'Organization', name: 'AXVO', url: BASE_URL },
  about: { '@type': 'Organization', name: 'Inciteful Med', url: partner.url },
}

const para: React.CSSProperties = { fontSize: 17, lineHeight: 1.85, color: 'var(--text-2)', marginBottom: 22 }

function renderBlock(b: Block, i: number) {
  switch (b.t) {
    case 'p':
      return <p key={i} style={para}>{b.text}</p>
    case 'list':
      return (
        <ol key={i} style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {b.items.map((it, j) => (
            <li key={j} style={{ display: 'flex', gap: 16, padding: '18px 20px', borderRadius: 14, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <span aria-hidden="true" style={{
                flexShrink: 0, width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff', background: `linear-gradient(135deg, ${P}, ${P2})`,
              }}>{j + 1}</span>
              <span style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text-2)' }}>
                {it.lead && <strong style={{ color: 'var(--text)' }}>{it.lead} </strong>}{it.text}
              </span>
            </li>
          ))}
        </ol>
      )
    case 'quote':
      return (
        <figure key={i} style={{ margin: '36px 0', padding: '4px 0 4px 26px', borderLeft: `3px solid ${P}` }}>
          <blockquote style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(21px, 3vw, 26px)', lineHeight: 1.4, fontWeight: 600, color: 'var(--text)' }}>
            “{b.text}”
          </blockquote>
          {b.by && <figcaption style={{ marginTop: 10, fontSize: 14, color: PT }}>— {b.by}</figcaption>}
        </figure>
      )
    case 'stats':
      return (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, margin: '4px 0 26px' }}>
          {b.items.map(s => (
            <div key={s.v} style={{ padding: '20px 18px', borderRadius: 14, background: `linear-gradient(160deg, ${P}1F, transparent 70%), var(--bg2)`, border: `1px solid ${P}33` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: PT, letterSpacing: '-0.02em' }}>{s.v}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-2)', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      )
  }
}

export default function IncitefulMedInterviewPage() {
  return (
    <AppShell>
      <JsonLd schema={ARTICLE_SCHEMA} id="schema-article-inciteful-interview" />
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', url: BASE_URL },
          { name: 'Editorial', url: `${BASE_URL}/editorial` },
          { name: 'Inciteful Med interview', url: PAGE_URL },
        ])}
        id="schema-breadcrumb-inciteful-interview"
      />

      <article>
        {/* ── Header ── */}
        <header style={{ position: 'relative', overflow: 'hidden', padding: '72px 24px 56px' }}>
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 65% 60% at 50% 0%, ${P}22 0%, transparent 70%)`,
          }} />
          <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
            <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 28 }}>
              <Link href="/editorial" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Editorial</Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <span style={{ color: 'var(--text-2)' }}>Partner interview</span>
            </nav>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 100, color: PT, background: `${P}18`, border: `1px solid ${P}44` }}>
                Q&amp;A · Partner interview
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-3)', padding: '5px 0' }}>October 22, 2026 · 8 min read</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 5.5vw, 50px)', fontWeight: 800,
              lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 22,
            }}>
              Erika Warren on putting patients at the{' '}
              <span style={{ background: `linear-gradient(90deg, ${PT}, ${P2})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                center of medical research
              </span>
            </h1>

            <p style={{ fontSize: 19, lineHeight: 1.65, color: 'var(--text-2)', marginBottom: 32 }}>
              The co-founder and CEO of Inciteful Med on a family health scare, a 2:30 a.m. breakthrough in an ICU,
              and why patients deserve the same research their doctors use.
            </p>

            {/* Byline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', paddingTop: 22, borderTop: '1px solid var(--border)' }}>
              <Image src="/founder-emanuel-sarkees.jpg" alt="Emanuel Sarkees" width={44} height={44} style={{ borderRadius: '50%' }} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 14, color: 'var(--text)' }}>
                  Interview by <Link href="/founder" style={{ color: 'var(--text)', fontWeight: 700, textDecoration: 'none' }}>Emanuel Sarkees</Link>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Founder &amp; Developer, AXVO</div>
              </div>
              <span style={{ display: 'inline-flex', padding: '8px 14px', borderRadius: 10, background: '#fff' }}>
                <Image src={partner.logo} alt="Inciteful Med" width={130} height={24} unoptimized style={{ height: 24, width: 'auto' }} />
              </span>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: 808, margin: '0 auto', padding: '0 24px 96px' }}>
          {/* ── Intro ── */}
          <p style={{ ...para, fontSize: 18 }}>
            At AXVO, we spend our days helping people find care they can afford. But finding a clinic is only the first
            step — once you&apos;re in the exam room, understanding your diagnosis and your options matters just as much.
            That&apos;s exactly the problem{' '}
            <a href={partner.url} target="_blank" rel="noopener noreferrer" style={{ color: PT, textDecoration: 'none', fontWeight: 600 }}>Inciteful Med</a>{' '}
            set out to solve, which is why we&apos;re proud to partner with them.
          </p>
          <p style={para}>
            I sat down with Erika Warren, Inciteful Med&apos;s co-founder and CEO, to talk about how the company started,
            what it&apos;s like to watch patients become collaborators in their own care, and where she thinks healthcare
            goes next. This is one half of an interview swap — Erika interviewed me for Inciteful Med&apos;s newsletter,{' '}
            <a href="https://incitefulmed.substack.com" target="_blank" rel="noopener noreferrer" style={{ color: PT, textDecoration: 'none', fontWeight: 600 }}>Informed Consent</a>.
          </p>

          {/* ── Q&A ── */}
          {QA.map((item, qi) => (
            <section key={qi} style={{ marginTop: 56 }}>
              <h2 style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 22 }}>
                <span aria-hidden="true" style={{
                  flexShrink: 0, fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--accent)',
                  width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.25)', marginTop: 2,
                }}>Q</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 25px)', fontWeight: 700, lineHeight: 1.35, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                  {item.q}
                </span>
              </h2>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: PT, marginBottom: 14 }}>
                Erika Warren
              </div>
              {item.a.map(renderBlock)}
            </section>
          ))}

          {/* ── About Inciteful Med ── */}
          <aside style={{
            marginTop: 72, padding: '34px 30px', borderRadius: 22,
            background: `linear-gradient(140deg, ${P}2B, ${P2}12 60%, transparent), var(--bg2)`, border: `1px solid ${P}55`,
          }}>
            <span style={{ display: 'inline-flex', padding: '10px 16px', borderRadius: 12, background: '#fff', marginBottom: 20 }}>
              <Image src={partner.logo} alt="Inciteful Med" width={170} height={30} unoptimized style={{ height: 30, width: 'auto' }} />
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>About Inciteful Med</h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text-2)', marginBottom: 24 }}>
              {partner.summary}{' '}It&apos;s free to start, and fully independent of hospitals, insurers, and drug makers.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={partner.url} target="_blank" rel="noopener noreferrer" style={{
                padding: '13px 24px', borderRadius: 100, background: `linear-gradient(135deg, ${P}, ${P2})`, color: '#fff',
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}>
                Try Inciteful Med free ↗
              </a>
              <Link href="/partners/inciteful-med" style={{
                padding: '13px 24px', borderRadius: 100, border: '1px solid var(--border)', color: 'var(--text)',
                fontWeight: 600, fontSize: 14, textDecoration: 'none',
              }}>
                About our partnership →
              </Link>
            </div>
          </aside>

          <p style={{ fontSize: 12.5, lineHeight: 1.65, color: 'var(--text-3)', marginTop: 32 }}>
            Answers are Erika Warren’s own words, formatted for the web. Figures and patient stories are as reported by Inciteful Med.
            Nothing here is medical advice — talk with a clinician about decisions about your care.
          </p>

          <div style={{ marginTop: 40 }}>
            <Link href="/editorial" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
              ← More from AXVO Editorial
            </Link>
          </div>
        </div>
      </article>
    </AppShell>
  )
}
