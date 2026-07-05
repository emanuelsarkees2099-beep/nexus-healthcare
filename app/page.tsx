import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import HomeClientShell from '@/components/HomeClientShell'

/* ── Nav + Hero — code-split, SSR-safe ── */
const Nav               = dynamic(() => import('@/components/Nav'))
const Hero              = dynamic(() => import('@/components/Hero'))

/* ── Content sections — code-split, SSR-safe ──
   Midnight Clinic landing: 6 beats, each with one job.
   Hero (search) → Stats (live proof) → HowItWorks (3 steps) →
   Features (product tiles) → Testimonials (voices) → CTA (ask again).
   Cut at redesign: LogoMarquee, BeforeAfterBar, MissionFreeze,
   TrustBadges — three stat-flavored sections was repetition, and the
   marquee implied partnerships we haven't signed. */
const Stats             = dynamic(() => import('@/components/Stats'))
const Features          = dynamic(() => import('@/components/Features'))
const HowItWorks        = dynamic(() => import('@/components/HowItWorks'))
const Testimonials      = dynamic(() => import('@/components/Testimonials'))
const CTA               = dynamic(() => import('@/components/CTA'))

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

      {/* Page content */}
      <main id="main-content">
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <Testimonials />
        <CTA />
      </main>

      <Footer />
    </>
  )
}
