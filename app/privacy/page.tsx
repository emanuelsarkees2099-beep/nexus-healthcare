'use client'
import React, { useState } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { CONTACT_EMAIL } from '@/lib/contact'
import { Shield, Eye, Lock, Data, InfoCircle, TickCircle, ArrowDown2 } from 'iconsax-react'

const pill: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '4px 12px', borderRadius: '100px',
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
  background: 'rgba(74,144,217,0.08)', color: 'var(--accent)',
  border: '1px solid rgba(74,144,217,0.18)',
}

const SECTIONS = [
  {
    id: 'what-we-collect',
    icon: <Data size={18} color="rgba(255,255,255,0.5)" variant="Linear" />,
    title: 'What We Collect',
    content: `AXVO is built to collect as little as possible. You can search, check eligibility, and read every page without an account.

Clinic search: we use the city, ZIP code, or coordinates you give us to find nearby clinics. We don't save your searches to our database.

Eligibility checker: your answers (income range, household size, insurance status) are calculated in your browser and are never sent to AXVO.

Symptom guide and AI assistant: the text you type is sent to an outside AI provider to generate a response (see Third-Party Services). AXVO does not store it.

Forms you submit (stories, outcome reports, legal aid requests, clinic corrections, newsletter sign-ups): we store what you enter, such as your first name, city, email, and message, so we can review and respond.

Accounts (optional): we store your email address, display name, and any profile information you add.

Analytics (only if you click Accept on the cookie banner): pages visited, approximate location from your IP address, device and browser type.

We do not collect Social Security numbers, insurance member IDs, or medical records.`
  },
  {
    id: 'how-we-use',
    icon: <Eye size={18} color="rgba(255,255,255,0.5)" variant="Linear" />,
    title: 'How We Use Your Data',
    content: `We use data only to run AXVO and make it better.

Location is used to find and sort nearby clinics.

Form submissions are read by the AXVO team so we can publish stories (with your consent), fix clinic listings, and reply to requests.

If you submit a story, it may be published on the Stories page with only your first name and city, exactly as you entered them. You can ask us to remove it at any time.

Analytics show which pages and features help people, in aggregate. We do not use them for advertising.

We do not sell your data, share it with insurers, or use it for advertising.`
  },
  {
    id: 'third-parties',
    icon: <Shield size={18} color="rgba(255,255,255,0.5)" variant="Linear" />,
    title: 'Third-Party Services',
    content: `AXVO relies on these outside services. Each receives only what it needs to do its job.

Vercel — hosting, plus cookieless page-view and performance measurement (Vercel Web Analytics). Vercel logs standard request data such as IP addresses. vercel.com/legal/privacy-policy

Supabase — database and optional account sign-in. Stores account data and form submissions in the U.S. supabase.com/privacy

Google Analytics — website analytics. Loaded only after you click Accept on the cookie banner; it sets Google cookies and receives your IP address and browsing activity on AXVO. policies.google.com/privacy

PostHog — product analytics (which features are used). Loaded only after you click Accept. Session recording and automatic click tracking are turned off. posthog.com/privacy

Anthropic — powers the symptom guide. The symptoms you type are sent to Anthropic's API to generate a care-level suggestion. anthropic.com/legal/privacy

Groq — powers the AI assistant chat. Your chat messages are sent to Groq's API to generate replies. groq.com/privacy-policy

OpenStreetMap / Nominatim and MapTiler — turn locations into map coordinates and display map tiles. Your location query and IP address may be sent to them. osmfoundation.org/wiki/Privacy_Policy

Resend — sends email (newsletter, form confirmations, and alerts to the AXVO team). Receives the email address and message content. resend.com/legal/privacy-policy

Twilio — handles text messages if you use AXVO by SMS. Receives your phone number and messages. twilio.com/legal/privacy

Clinic data comes from public sources (HRSA, the CMS NPI Registry, OpenStreetMap, and the National Association of Free & Charitable Clinics). No information about you is sent to those organizations.

We do not use Facebook Pixel, advertising networks, or data brokers.`
  },
  {
    id: 'cookies',
    icon: <Lock size={18} color="rgba(255,255,255,0.5)" variant="Linear" />,
    title: 'Cookies & Local Storage',
    content: `Essential: if you sign in, a session cookie keeps you signed in. It is removed when you sign out.

Analytics: Google Analytics and PostHog only load after you click Accept on the cookie banner. If you click Decline, they never load. To change your choice, clear this site's data in your browser and the banner will appear again.

Local storage on your device: AXVO saves some things only in your browser, never on our servers — your language, saved clinics, recent searches, cookie choice, screening plan, safety plan, and Health Passport. This data is not encrypted, so anyone with access to your browser can see it. You can delete it at any time by clearing this site's data in your browser.`
  },
  {
    id: 'your-rights',
    icon: <TickCircle size={18} color="rgba(255,255,255,0.5)" variant="Linear" />,
    title: 'Your Rights',
    content: `You can:

Access — ask for a copy of the personal data we hold about you.

Delete — delete your account at any time from Settings → Security, or ask us to delete your account or any form submission.

Correct — update your profile at any time, or ask us to correct anything else.

Remove a story — ask us to take down a published story at any time.

California residents (CCPA) — you may ask what personal information we collect and how it is used. AXVO does not sell personal information.

To make any request, email ${CONTACT_EMAIL} with "Privacy Request" in the subject line.`
  },
  {
    id: 'hipaa',
    icon: <Shield size={18} color="rgba(255,255,255,0.5)" variant="Linear" />,
    title: 'Health Information & HIPAA',
    content: `AXVO is a healthcare navigation service, not a healthcare provider, health plan, or clearinghouse. AXVO is not a HIPAA-covered entity or business associate under the Health Insurance Portability and Accountability Act of 1996, and does not issue a HIPAA Notice of Privacy Practices.

We built AXVO to need as little health information as possible. Please don't enter medical records or detailed medical history into the symptom guide or AI assistant — what you type there is sent to an outside AI provider to generate a response.

Anything you do give us is handled under the protections in this policy: encrypted in transit, access-controlled, never sold, and deletable on request.

See our Terms of Service (Section 11) for the full legal detail.`
  },
  {
    id: 'security',
    icon: <InfoCircle size={18} color="rgba(255,255,255,0.5)" variant="Linear" />,
    title: 'Security',
    content: `All traffic to AXVO is encrypted with HTTPS (TLS). Our database provider, Supabase, encrypts stored data, and row-level security limits each account to its own records.

No system is perfectly secure. If you find a security vulnerability, please report it to ${CONTACT_EMAIL}.

If a data breach affects your personal information, we will notify you as required by applicable law.`
  },
]

export default function PrivacyPage() {
  const [openSection, setOpenSection] = useState<string | null>('what-we-collect')

  React.useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && SECTIONS.some(s => s.id === hash)) {
      setOpenSection(hash)
      // Wait for the accordion's own 0.45s expand transition to finish before
      // scrolling, so the target has its final expanded height/position.
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'auto', block: 'start' }), 500)
    }
  }, [])

  return (
    <AppShell>
      {/* Hero */}
      <section style={{
        minHeight: '50dvh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '100px 24px 60px', position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(74,144,217,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ ...pill, marginBottom: '24px' }}>
          <Lock size={14} variant="Linear" /> Privacy Policy
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.1,
          marginBottom: '20px', maxWidth: '600px',
        }}>
          Your privacy is{' '}
          <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>not negotiable</em>
        </h1>

        <p style={{
          fontSize: '16px', color: 'rgba(255,255,255,0.5)',
          maxWidth: '480px', lineHeight: 1.7, marginBottom: '32px',
        }}>
          AXVO collects as little as it can. We have never sold data and we never will. This page lists exactly what we collect and every outside service involved.
        </p>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>
          Last updated: November 3, 2026 · Version 1.4
        </p>
      </section>

      {/* Zero-data commitment banner */}
      <section style={{ padding: '0 24px 60px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            {[
              { icon: <Shield size={16} variant="Linear" />, label: 'Zero data sold', desc: 'We have never sold user data and never will' },
              { icon: <Eye size={16} variant="Linear" />,    label: 'No ad trackers', desc: 'No advertising networks; analytics only if you accept' },
              { icon: <Lock size={16} variant="Linear" />,   label: 'No account needed', desc: 'Every core feature works without signing in' },
              { icon: <Data size={16} variant="Linear" />, label: 'Minimum collection', desc: 'We only store what the service requires' },
            ].map(item => (
              <div key={item.label} style={{
                padding: '20px', borderRadius: '16px',
                background: 'rgba(74,144,217,0.04)',
                border: '1px solid rgba(74,144,217,0.12)',
                display: 'flex', flexDirection: 'column', gap: '8px',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(74,144,217,0.1)',
                  border: '1px solid rgba(74,144,217,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)',
                }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef4f5' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expandable sections */}
      <section style={{ padding: '0 24px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', paddingTop: '60px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '12px' }}>
              Full policy
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
              This policy applies to axvohealth.com and all AXVO-branded services. Click any section to expand.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {SECTIONS.map((sec) => (
              <div
                key={sec.id}
                id={sec.id}
                style={{
                  borderRadius: '16px', overflow: 'hidden',
                  border: '1px solid',
                  borderColor: openSection === sec.id ? 'rgba(74,144,217,0.25)' : 'rgba(255,255,255,0.06)',
                  background: openSection === sec.id ? 'rgba(74,144,217,0.04)' : 'transparent',
                  transition: 'all 0.25s',
                  marginBottom: '4px',
                }}
              >
                <button
                  onClick={() => setOpenSection(openSection === sec.id ? null : sec.id)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '20px 24px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'inherit', fontFamily: 'inherit', textAlign: 'left', gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: openSection === sec.id ? 'rgba(74,144,217,0.15)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: openSection === sec.id ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                      flexShrink: 0, transition: 'all 0.25s',
                    }}>
                      {sec.icon}
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 600 }}>{sec.title}</span>
                  </div>
                  <ArrowDown2
                    size={16}
                    variant="Linear"
                    style={{
                      flexShrink: 0, color: 'rgba(255,255,255,0.4)',
                      transform: openSection === sec.id ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.3s',
                    }}
                  />
                </button>

                <div style={{
                  maxHeight: openSection === sec.id ? '800px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.45s cubic-bezier(0.16,1,0.3,1)',
                }}>
                  <div style={{ padding: '0 24px 24px' }}>
                    {sec.content.split('\n\n').map((para, i) => (
                      <p key={i} style={{
                        fontSize: '14px', color: 'rgba(255,255,255,0.48)',
                        lineHeight: 1.8, margin: 0,
                        marginBottom: i < sec.content.split('\n\n').length - 1 ? '14px' : 0,
                      }}>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{
            marginTop: '48px', padding: '28px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Questions about this policy?</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: '16px' }}>
              If you have questions, concerns, or want to exercise any of your privacy rights, contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                {CONTACT_EMAIL}
              </a>
              . We respond to all privacy requests within 5 business days.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                href="/"
                style={{
                  padding: '9px 18px', borderRadius: '100px',
                  background: 'rgba(74,144,217,0.1)',
                  border: '1px solid rgba(74,144,217,0.2)',
                  color: 'var(--accent)', fontSize: '13px', fontWeight: 600,
                  textDecoration: 'none', transition: 'background 0.2s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(74,144,217,0.2)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(74,144,217,0.1)')}
              >
                Back to home
              </Link>
              <Link
                href="/impact"
                style={{
                  padding: '9px 18px', borderRadius: '100px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 400,
                  textDecoration: 'none', transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.color = '#eef4f5'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
                }}
              >
                View impact data
              </Link>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
