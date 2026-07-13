import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import HomeClientShell from '@/components/HomeClientShell'

/* ── Nav + Hero — code-split, SSR-safe ── */
const Nav               = dynamic(() => import('@/components/Nav'))
const Hero              = dynamic(() => import('@/components/Hero'))

/* ── Content sections — 6 beats, each with one job ──
   Hero (search) → Stats (live proof) → HowItWorks (3 steps) →
   Features (product tiles) → Testimonials (voices) → CTA (ask again).
   LogoMarquee / BeforeAfterBar / MissionFreeze / TrustBadges deleted:
   implied partnerships and metrics we don't have. */
const PulseSpine        = dynamic(() => import('@/components/PulseSpine'))
const Stats             = dynamic(() => import('@/components/Stats'))
const Features          = dynamic(() => import('@/components/Features'))
const HowItWorks        = dynamic(() => import('@/components/HowItWorks'))
const DataSources       = dynamic(() => import('@/components/DataSources'))
const CTA               = dynamic(() => import('@/components/CTA'))
/* Testimonials unmounted: the component contains 16 fabricated patient
   quotes with invented names, dollar amounts, and medical situations —
   an FTC/false-advertising liability for a healthcare product. It stays
   in components/ (unmounted) until real, consented stories exist. */

export default function Home() {
  return (
    <>
      {/* Skip navigation for accessibility */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Browser-only components (canvas, scroll, CTA, crisis) in client boundary */}
      <HomeClientShell />

      {/* Navigation */}
      <Nav />

      {/* Page content — position:relative anchors The Pulse spine SVG */}
      <main id="main-content" style={{ position: 'relative' }}>
        {/* The Pulse — scroll-drawn EKG line connecting every section */}
        <PulseSpine />
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <DataSources />
        <CTA />
      </main>

      <Footer />
    </>
  )
}
