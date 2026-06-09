'use client'
import React, { useState } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
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
    icon: <Data size={18} variant="Linear" />,
    title: 'What We Collect',
    content: `NEXUS is built on a core principle: we collect the minimum possible data to give you the best results.

When you search for a clinic, we use your city, ZIP code, or coordinates to return nearby results. This location data is used only during your active session and is never stored on our servers.

When you use our eligibility screener, your answers (income range, household size, insurance status) are processed in your browser. We do not transmit or store your eligibility quiz responses.

If you submit a community story, we collect only the name and city you provide, plus the story text. This is reviewed before publishing and stored securely.

If you create an account (optional), we store your email address, display name, and any profile information you choose to add. Account data is stored in Supabase with row-level security — only you can access your own records.

We do not collect: Social Security numbers, health records, medical history, biometric data, or any information that identifies you as a patient.`
  },
  {
    id: 'how-we-use',
    icon: <Eye size={18} variant="Linear" />,
    title: 'How We Use Your Data',
    content: `Your data is used exclusively to deliver the service you asked for.

Location data is used to filter and sort nearby clinics. It is never stored, never sold, and never shared with third parties.

Aggregated, anonymized analytics (e.g., "500 people searched for mental health clinics in Phoenix this month") may be used to improve our clinic database coverage and inform our impact reporting. No individual can be identified from these aggregates.

If you submit a story, it may be published on the Stories page with only your first name and city, exactly as you entered them. You can request removal at any time by contacting us.

Account data (if you create one) is used to pre-fill forms, save searches, and personalize your experience. We do not use it for advertising, profiling, or sharing.`
  },
  {
    id: 'third-parties',
    icon: <Shield size={18} variant="Linear" />,
    title: 'Third-Party Services',
    content: `NEXUS integrates with the following third-party services:

HRSA (Health Resources & Services Administration) — Federal API used to retrieve Federally Qualified Health Center (FQHC) data. No user data is sent to HRSA.

OpenStreetMap / Nominatim — Used for geocoding ZIP codes and city names into coordinates. Your location query may be sent to Nominatim's public API. See nominatim.org/privacy for their policy.

Supabase — Used for user account storage and authentication (if you create an account). Supabase is SOC 2 Type II certified. Data is stored in the US. See supabase.com/privacy for their policy.

Vercel — Used for hosting. Vercel may log request metadata (IP addresses, timestamps) per their standard infrastructure logging. See vercel.com/privacy.

We do not use: Google Analytics, Facebook Pixel, advertising trackers, behavioral profiling tools, or any third-party marketing technology.`
  },
  {
    id: 'cookies',
    icon: <Lock size={18} variant="Linear" />,
    title: 'Cookies & Local Storage',
    content: `NEXUS uses minimal cookies and local storage.

If you are logged in, a session cookie is used to keep you authenticated. This is a functional cookie and cannot be disabled without logging out.

We use local storage to remember your language preference and any bookmarked clinics. This data never leaves your device.

We do not use third-party tracking cookies. We do not use cookies for advertising or cross-site tracking.

You can clear all NEXUS local data by clearing your browser's storage for this domain. If you log out, your session cookie is deleted immediately.`
  },
  {
    id: 'your-rights',
    icon: <TickCircle size={18} variant="Linear" />,
    title: 'Your Rights',
    content: `You have the right to:

Access — Request a copy of any personal data we hold about you (account holders only, since anonymous users have no stored data).

Deletion — Delete your account and all associated data at any time from the Profile page, or by contacting us. Deletion is permanent and takes effect within 24 hours.

Correction — Update any incorrect information in your profile at any time.

Portability — Export your data in JSON format from the Profile page.

Opt-out of Story Publishing — Request removal of any published story at any time.

CCPA Rights (California) — California residents may request disclosure of personal information collected, sold, or disclosed. NEXUS does not sell personal data.

GDPR Rights (EU residents) — You have rights under GDPR including access, rectification, erasure, restriction, and data portability. Contact us to exercise these rights.

To exercise any right: email privacy@nexushealth.org with "Privacy Request" in the subject line.`
  },
  {
    id: 'security',
    icon: <InfoCircle size={18} variant="Linear" />,
    title: 'Security',
    content: `We take reasonable and industry-standard measures to protect your data.

All data in transit is encrypted via TLS 1.3. Account data at rest is encrypted using AES-256. Supabase row-level security ensures users can only access their own records. We conduct periodic security reviews.

We do not guarantee absolute security — no system does. If you discover a security vulnerability, please disclose it responsibly to security@nexushealth.org. We will respond within 72 hours.

In the event of a data breach affecting personal information, we will notify affected users within 72 hours as required by law.`
  },
]

export default function PrivacyPage() {
  const [openSection, setOpenSection] = useState<string | null>('what-we-collect')

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
          <Lock size={10} variant="Linear" /> Privacy Policy
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
          NEXUS collects nothing it doesn&apos;t need. We have never sold data, we never will, and we&apos;ve built the system to make that structurally impossible.
        </p>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>
          Last updated: April 2026 · Version 1.2
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
              { icon: <Eye size={16} variant="Linear" />,    label: 'No ad trackers', desc: 'Zero third-party advertising or behavioral tracking' },
              { icon: <Lock size={16} variant="Linear" />,   label: 'Anonymous by default', desc: 'Most features work without any account' },
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
              This policy applies to nexushealth.org and all NEXUS-branded services. Click any section to expand.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {SECTIONS.map((sec) => (
              <div
                key={sec.id}
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
              <a href="mailto:privacy@nexushealth.org" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                privacy@nexushealth.org
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
