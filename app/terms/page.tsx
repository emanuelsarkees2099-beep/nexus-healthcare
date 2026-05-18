import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — NEXUS',
  description: 'Terms of Service for NEXUS, the free healthcare navigation platform.',
  robots: { index: false, follow: false },
}

const LAST_UPDATED = 'May 18, 2025'

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} style={{ marginBottom: '48px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '16px', letterSpacing: '-0.01em' }}>
      {title}
    </h2>
    <div style={{ fontSize: '15px', lineHeight: '1.75', color: 'rgba(255,255,255,0.65)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {children}
    </div>
  </section>
)

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#07070F', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '56px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '32px' }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#4a90d9')}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            ← Back to NEXUS
          </Link>
          <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#ffffff', marginBottom: '12px', letterSpacing: '-0.03em' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)' }}>
            Last updated: {LAST_UPDATED}
          </p>
          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.07)', margin: '32px 0' }} />
          <p style={{ fontSize: '15px', lineHeight: '1.75', color: 'rgba(255,255,255,0.6)', padding: '20px 22px', background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.18)', borderRadius: '12px' }}>
            Please read these Terms of Service carefully before using NEXUS. By accessing or using NEXUS, you agree to be bound by these terms. If you do not agree, do not use NEXUS.
          </p>
        </div>

        {/* ── CRITICAL MEDICAL DISCLAIMER — must be first visible section ── */}
        <div style={{ padding: '22px 24px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.22)', borderRadius: '14px', marginBottom: '48px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', letterSpacing: '0.08em', marginBottom: '10px' }}>
            ⚠️ NOT MEDICAL ADVICE
          </p>
          <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'rgba(255,255,255,0.65)' }}>
            NEXUS is a <strong style={{ color: 'rgba(255,255,255,0.85)' }}>healthcare navigation tool</strong>, not a medical provider. Nothing on NEXUS — including AI-generated responses, clinic listings, program descriptions, or any other content — constitutes medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider for any medical concerns. If you believe you are experiencing a medical emergency, call <strong style={{ color: 'rgba(255,255,255,0.85)' }}>911 immediately</strong>.
          </p>
        </div>

        <Section id="acceptance" title="1. Acceptance of Terms">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you and NEXUS (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) governing your access to and use of the NEXUS platform, website, mobile application, and related services (collectively, the &ldquo;Service&rdquo;).
          </p>
          <p>
            You must be at least 13 years old to use NEXUS. If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf. By using NEXUS, you confirm that you are legally capable of entering into these Terms.
          </p>
        </Section>

        <Section id="service" title="2. Description of Service">
          <p>
            NEXUS is a free healthcare navigation platform designed to help uninsured and underinsured individuals in the United States find:
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Federally Qualified Health Centers (FQHCs) and free clinics</li>
            <li>Sliding-scale and reduced-cost healthcare providers</li>
            <li>Government programs such as Medicaid, CHIP, and Ryan White</li>
            <li>Crisis and mental health resources including the 988 Suicide & Crisis Lifeline</li>
            <li>Patient rights information and healthcare navigation guidance</li>
          </ul>
          <p>
            NEXUS aggregates publicly available information and does not guarantee the accuracy, completeness, availability, or current operating status of any listed clinic or program. Clinic information may change; always call ahead to confirm services, hours, and eligibility.
          </p>
        </Section>

        <Section id="medical-disclaimer" title="3. Medical Disclaimer and Limitations">
          <p>
            <strong style={{ color: 'rgba(255,255,255,0.85)' }}>NEXUS is not a licensed healthcare provider, medical practice, or medical device.</strong> The Service, including its AI Assistant, provides general healthcare navigation information only.
          </p>
          <p>NEXUS expressly does not:</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Diagnose medical conditions</li>
            <li>Recommend specific medications or dosages</li>
            <li>Provide individualized medical treatment plans</li>
            <li>Serve as a substitute for professional medical consultation</li>
            <li>Create a patient-provider relationship</li>
          </ul>
          <p>
            Reliance on any information provided by NEXUS is solely at your own risk. For mental health crises, contact the <strong style={{ color: 'rgba(255,255,255,0.85)' }}>988 Suicide & Crisis Lifeline</strong> (call or text 988) or the Crisis Text Line (text HOME to 741741).
          </p>
        </Section>

        <Section id="accounts" title="4. Account Registration">
          <p>
            You may use parts of NEXUS without an account. Creating an account allows you to save clinics, track eligibility, and access personalized features. You agree to:
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Provide accurate and complete registration information</li>
            <li>Keep your password confidential and not share your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Be responsible for all activity under your account</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate these Terms or are used fraudulently.
          </p>
        </Section>

        <Section id="privacy" title="5. Privacy and Data">
          <p>
            Your use of NEXUS is governed by our <Link href="/privacy" style={{ color: '#4a90d9', textDecoration: 'none' }}>Privacy Policy</Link>, which is incorporated into these Terms by reference. We collect account information (name, email), usage data (searches, saved clinics), and optional profile information (location, user type). We do not sell your personal data.
          </p>
          <p>
            NEXUS is not a HIPAA-covered entity. Do not enter protected health information (PHI), medical records, or sensitive health data into NEXUS. The AI Assistant is designed to help you navigate to care — not to store or process your health records.
          </p>
        </Section>

        <Section id="acceptable-use" title="6. Acceptable Use">
          <p>You agree not to use NEXUS to:</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Violate any applicable law or regulation</li>
            <li>Impersonate any person or misrepresent your affiliation</li>
            <li>Scrape, crawl, or systematically extract data without permission</li>
            <li>Attempt to compromise the security or integrity of the Service</li>
            <li>Submit false clinic information or mislead other users</li>
            <li>Harass, threaten, or harm other users</li>
            <li>Use the Service for any commercial purpose without our written consent</li>
          </ul>
        </Section>

        <Section id="third-party" title="7. Third-Party Services and Links">
          <p>
            NEXUS links to and aggregates information from third-party sources including clinic databases, government program websites, and external health resources. We are not responsible for the content, accuracy, or availability of third-party sites. Links do not constitute endorsement.
          </p>
          <p>
            Our AI Assistant is powered by third-party AI infrastructure. AI responses are generated automatically and may contain inaccuracies. Always verify critical information with the relevant clinic or program directly.
          </p>
        </Section>

        <Section id="intellectual-property" title="8. Intellectual Property">
          <p>
            The NEXUS name, logo, design, and original content are owned by NEXUS and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written permission.
          </p>
          <p>
            Clinic listings and program information sourced from public databases remain the property of their respective owners. NEXUS claims no ownership over third-party data.
          </p>
        </Section>

        <Section id="disclaimers" title="9. Disclaimer of Warranties">
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, NEXUS DISCLAIMS ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p>
            We do not warrant that the Service will be uninterrupted, error-free, or free of viruses. Clinic availability, hours, and services change frequently; we make no warranty as to their accuracy.
          </p>
        </Section>

        <Section id="liability" title="10. Limitation of Liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NEXUS AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF, OR INABILITY TO USE, THE SERVICE — INCLUDING BUT NOT LIMITED TO RELIANCE ON HEALTHCARE INFORMATION PROVIDED BY NEXUS.
          </p>
          <p>
            IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU EXCEED ONE HUNDRED DOLLARS ($100). Some jurisdictions do not allow limitations on liability; in such cases, the above limitation may not apply to you.
          </p>
        </Section>

        <Section id="hipaa" title="11. HIPAA Notice">
          <p>
            NEXUS is a healthcare navigation service and is <strong style={{ color: 'rgba(255,255,255,0.85)' }}>not a HIPAA-covered entity or business associate</strong> as defined under the Health Insurance Portability and Accountability Act of 1996. NEXUS does not store, process, or transmit protected health information (PHI) on behalf of covered entities.
          </p>
          <p>
            Users should not enter PHI, medical records, insurance information, or other sensitive health data into NEXUS. The platform is designed for navigation assistance only.
          </p>
        </Section>

        <Section id="changes" title="12. Changes to These Terms">
          <p>
            We may update these Terms from time to time. We will notify registered users of material changes by email or in-app notice. Continued use of NEXUS after changes take effect constitutes your acceptance of the updated Terms. The &ldquo;Last updated&rdquo; date at the top of this page reflects the most recent revision.
          </p>
        </Section>

        <Section id="termination" title="13. Termination">
          <p>
            You may stop using NEXUS at any time and may delete your account from your Profile settings. We may suspend or terminate your access for violations of these Terms, illegal activity, or at our sole discretion with reasonable notice. Upon termination, provisions that by their nature should survive (including disclaimers, liability limits, and dispute resolution) will continue to apply.
          </p>
        </Section>

        <Section id="governing-law" title="14. Governing Law">
          <p>
            These Terms are governed by the laws of the United States. Any disputes arising under these Terms shall be resolved through binding arbitration under the rules of the American Arbitration Association, except that either party may seek injunctive relief in a court of competent jurisdiction.
          </p>
        </Section>

        <Section id="contact" title="15. Contact">
          <p>
            If you have questions about these Terms, please contact us:
          </p>
          <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            <p><strong style={{ color: 'rgba(255,255,255,0.85)' }}>NEXUS</strong></p>
            <p>Email: <a href="mailto:legal@nexus-healthcare.vercel.app" style={{ color: '#4a90d9', textDecoration: 'none' }}>legal@nexus-healthcare.vercel.app</a></p>
            <p>Website: <a href="https://nexus-healthcare.vercel.app" style={{ color: '#4a90d9', textDecoration: 'none' }}>nexus-healthcare.vercel.app</a></p>
          </div>
        </Section>

        {/* Footer nav */}
        <div style={{ display: 'flex', gap: '24px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' }}>
          {[['Privacy Policy', '/privacy'], ['Accessibility', '/accessibility'], ['Back to Home', '/']].map(([label, href]) => (
            <Link key={href} href={href} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#4a90d9')}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              {label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
