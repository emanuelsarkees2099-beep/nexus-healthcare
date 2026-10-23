import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import JsonLd, { breadcrumbSchema } from '@/components/JsonLd'
import { findPartner } from '@/lib/partners'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.axvohealth.com'
const PAGE_URL = `${BASE_URL}/editorial/inciteful-med-interview`
const partner = findPartner('inciteful-med')!

const TITLE = 'A conversation with Erika Warren of Inciteful Med'
const DESCRIPTION = 'Emanuel Sarkees talks with Erika Warren, co-founder and CEO of Inciteful Med, about how the company started and why patients should have access to the same research their doctors use.'
const DATE_ISO = '2026-10-22'

export const metadata: Metadata = {
  title: `${TITLE} — AXVO`,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, type: 'article', publishedTime: DATE_ISO },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
}

// Answers are Erika Warren's own words, as she provided them.
type Block = { t: 'p'; text: string } | { t: 'ol'; items: string[] } | { t: 'quote'; text: string }

const QA: { q: string; a: Block[] }[] = [
  {
    q: 'What inspired you to create Inciteful Med, and what did you hope to make easier for patients?',
    a: [
      { t: 'p', text: 'Inciteful Med started out of personal necessity. My co-founder, Mike, is a computer scientist who had built an academic literature search engine for fun. Today, Inciteful Academic is used by 40,000 academics and researchers around the world every month. When a family member got sick, Mike started using it to find medical literature that could explain what was happening to his loved one and what their test results meant. His research turned up real cause for concern, so they sought a second opinion. They ended up contacting one of the researchers who had written the paper Mike was reading, and that researcher saw them and diagnosed stage IIIA cancer. Following the original clinical guidance to wait six months and rescan would have been bad news.' },
      { t: 'p', text: 'That experience taught us three things:' },
      { t: 'ol', items: [
        'The answers are out there. Medical literature can be very precise and personalized when you search it around an individual patient instead of a condition that spans a broad population.',
        'Patients armed with accurate, reliable information (the same research their doctors use) can successfully advocate for better, more personalized care.',
        'Patients and caregivers are going to research their health no matter what. Three decades of telling people not to use Dr. Google, Dr. WebMD, or now Dr. ChatGPT haven’t worked. The problem was never patients doing research. It was the lack of reliable, trustworthy tools. Without them, patients get labeled a burden, because providers spend so much time undoing bad information and re-educating. Give patients something better, and everyone wins.',
      ] },
      { t: 'p', text: 'So that’s what we built. You ask a question in plain language, Inciteful Med searches more than 42 million peer-reviewed papers, and it explains what the research says. Every statement is cited with the exact passage it came from, because transparency builds trust.' },
    ],
  },
  {
    q: 'What has been the most rewarding part of building Inciteful Med?',
    a: [
      { t: 'p', text: 'Definitely the stories we hear from patients and caregivers. Nothing beats hearing that something you built brought relief, or a different outcome, to a family in a really tough season of life. We’ve been there with our own families, so we understand the stress and emotional toll. The best part is seeing patients and families become real collaborators in their care, with a say in their own health.' },
      { t: 'p', text: 'One caregiver, Bob, was in the ICU with a family member who has an ultra-rare disease. Two physicians told the family there was no evidence that a particular treatment could help his failing kidneys. Between 2:30 and 3:30 in the morning, on a laptop in the hospital room, Bob used Inciteful Med to find studies in Intensive Care Medicine showing that treatment working in exactly his family member’s situation. He handed the paper to the care team, and by noon the next day the treatment had started. In his words: “It never would have happened without Inciteful Med.”' },
    ],
  },
  {
    q: 'What are some ways you’ve seen patients benefit from a better understanding of medical evidence?',
    a: [
      { t: 'p', text: 'First, it’s always available, it works in any language, and it doesn’t judge. People can ask the questions they were embarrassed to ask their doctor, forgot to ask in the appointment, or were too shocked to take in at the time.' },
      { t: 'p', text: 'Second, medicine is full of jargon. Most patient education is written at a 6th-grade reading level, and at that level most of the nuance, terminology, and important detail gets stripped out. The information becomes generic, which makes it far less useful. Inciteful Med translates the literature into plain language at a high-school reading level, and you can keep asking follow-up questions. Our answers are intentionally thorough, because we aren’t limited to the space of a handout.' },
      { t: 'p', text: 'The biggest benefit, though, is the magic of putting yourself at the center of the literature search. Medicine is practiced and studied in silos, but our bodies are complex, interconnected systems. When you add your health history or sync your medical records, Inciteful Med inverts the research to focus on you rather than a single disease, and you can learn an incredible amount about how your conditions interact. That leads to really specific questions for your doctor, which in turn shapes and improves the care you get.' },
      { t: 'p', text: 'Our own data backs this up. Patients and caregivers tell us that 94% felt more confident, 78% found information they couldn’t get anywhere else, including from their doctor, and 77% used what they learned to influence their care. In practice, that means bringing it into appointments, discussing it with their doctor, and their doctor adjusting care as a result. That’s advocacy at its best.' },
    ],
  },
  {
    q: 'What have you learned that has shaped how you think about the patient experience?',
    a: [
      { t: 'p', text: 'Financial incentives drive nearly every decision in healthcare, at least in the US. That isn’t the fault of doctors or clinicians. They’re stuck in the same system, with incentives that are often out of their control and that dictate how they have to practice. It’s no wonder burnout rates are what they are. For patients, this matters, because the tools, technology, and systems we rely on for care aren’t always aligned with our best health outcomes. The more we empower patients with choice, transparency, and education, the more light we shed on those misaligned incentives, and the better outcomes patients get. It’s more work for patients up front, but today’s system is complex partly by design, and it stays that way to protect everyone but patients.' },
      { t: 'quote', text: 'That’s why Inciteful Med is fully independent. No hospital, insurer, or drug maker has any say in what we show you, only scientific evidence.' },
    ],
  },
  {
    q: 'What are you most excited about for the future?',
    a: [
      { t: 'p', text: 'The technology is already here, and it’s only getting better. What excites me most is transforming healthcare from the ground up, led by patients who can finally access this information. Information asymmetry is a form of power and control. Dismantling it makes care more personalized and less expensive. We’re already building toward that: between visits, Inciteful Med watches your records, labs, newly published research, and clinical trials, and flags what matters, so you don’t have to keep it all in your head.' },
    ],
  },
  {
    q: 'If you could change one thing about how people interact with health information, what would it be?',
    a: [
      { t: 'p', text: 'It’s bananas that your health records are scattered across systems that don’t talk to each other. If I could solve interoperability and give every patient one unified record, patients would be unstoppable. We’re chipping away at it. Inciteful Med can already pull records from many health systems into one place, and we add new ones every day.' },
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

// Editorial pages use a serif for long-form reading.
const SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif'
const body: React.CSSProperties = { fontFamily: SERIF, fontSize: 19, lineHeight: 1.75, color: 'rgba(255,255,255,0.82)', margin: '0 0 22px' }
const link: React.CSSProperties = { color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'rgba(255,255,255,0.35)' }

function renderBlock(b: Block, i: number) {
  if (b.t === 'p') return <p key={i} style={body}>{b.text}</p>
  if (b.t === 'ol') {
    return (
      <ol key={i} style={{ ...body, paddingLeft: 26 }}>
        {b.items.map((it, j) => <li key={j} style={{ marginBottom: 12, paddingLeft: 6 }}>{it}</li>)}
      </ol>
    )
  }
  return (
    <blockquote key={i} style={{
      fontFamily: SERIF, fontSize: 23, lineHeight: 1.5, fontStyle: 'italic', color: '#fff',
      margin: '32px 0', padding: '0 0 0 22px', borderLeft: '2px solid rgba(255,255,255,0.3)',
    }}>
      {b.text}
    </blockquote>
  )
}

export default function IncitefulMedInterviewPage() {
  return (
    <AppShell>
      <JsonLd schema={ARTICLE_SCHEMA} id="schema-article-inciteful-interview" />
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', url: BASE_URL },
          { name: 'Editorial', url: `${BASE_URL}/editorial` },
          { name: 'Interview with Erika Warren', url: PAGE_URL },
        ])}
        id="schema-breadcrumb-inciteful-interview"
      />

      <article style={{ maxWidth: 680, margin: '0 auto', padding: '72px 24px 96px' }}>
        <Link href="/editorial" style={{ fontSize: 14, color: 'var(--text-3)', textDecoration: 'none' }}>
          ← Editorial
        </Link>

        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '36px 0 12px', letterSpacing: '0.02em' }}>
          Interview
        </p>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 700, lineHeight: 1.15, color: '#fff', margin: '0 0 18px' }}>
          {TITLE}
        </h1>
        <p style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: 'rgba(255,255,255,0.6)', margin: '0 0 28px' }}>
          The co-founder and CEO of Inciteful Med on a family health scare, a breakthrough at 2:30 in the morning,
          and why patients deserve the same research their doctors use.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 40 }}>
          <Image src="/founder-emanuel-sarkees.jpg" alt="" width={36} height={36} style={{ borderRadius: '50%' }} />
          <div style={{ fontSize: 14, lineHeight: 1.4 }}>
            <div style={{ color: 'var(--text)' }}>
              By <Link href="/founder" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>Emanuel Sarkees</Link>
            </div>
            <div style={{ color: 'var(--text-3)' }}>October 22, 2026</div>
          </div>
        </div>

        <p style={body}>
          AXVO helps people find care they can afford, but getting through the door is only part of it. Once you&apos;re
          in the exam room, it helps a lot to understand your diagnosis and your options. That&apos;s the problem{' '}
          <a href={partner.url} target="_blank" rel="noopener noreferrer" style={link}>Inciteful Med</a>{' '}works on, and
          it&apos;s why I was glad to partner with them.
        </p>
        <p style={body}>
          I asked Erika Warren, Inciteful Med&apos;s co-founder and CEO, about how the company started and what she&apos;s
          learned since. She asked me some questions too, for Inciteful Med&apos;s newsletter,{' '}
          <a href="https://incitefulmed.substack.com" target="_blank" rel="noopener noreferrer" style={link}>Informed Consent</a>.
          Her answers are below, in her own words.
        </p>

        {QA.map((item, qi) => (
          <section key={qi} style={{ marginTop: 44 }}>
            <h2 style={{ fontFamily: 'var(--font-inter)', fontSize: 19, fontWeight: 700, lineHeight: 1.45, color: '#fff', margin: '0 0 16px' }}>
              {item.q}
            </h2>
            {item.a.map(renderBlock)}
          </section>
        ))}

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '56px 0 32px' }} />

        <p style={{ ...body, fontSize: 17, color: 'rgba(255,255,255,0.65)' }}>
          <strong style={{ color: '#fff' }}>About Inciteful Med.</strong> {partner.summary} You can try it for free at{' '}
          <a href={partner.url} target="_blank" rel="noopener noreferrer" style={link}>incitefulmed.com</a>. Read more about{' '}
          <Link href="/partners/inciteful-med" style={link}>our partnership</Link>.
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-3)' }}>
          Figures and patient stories are as reported by Inciteful Med. This isn&apos;t medical advice. Talk with a
          clinician about decisions about your care.
        </p>
      </article>
    </AppShell>
  )
}
