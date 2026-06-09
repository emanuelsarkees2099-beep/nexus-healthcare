import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import HomeClientShell from '@/components/HomeClientShell'

/* ── Nav + Hero — code-split, SSR-safe ── */
const Nav               = dynamic(() => import('@/components/Nav'))
const Hero              = dynamic(() => import('@/components/Hero'))

/* ── Content sections — code-split, SSR-safe ── */
const Stats             = dynamic(() => import('@/components/Stats'))
const LogoMarquee       = dynamic(() => import('@/components/LogoMarquee'))
const BeforeAfterBar    = dynamic(() => import('@/components/BeforeAfterBar'))
const Features          = dynamic(() => import('@/components/Features'))
const HowItWorks        = dynamic(() => import('@/components/HowItWorks'))
const Testimonials      = dynamic(() => import('@/components/Testimonials'))
const TrustBadges       = dynamic(() => import('@/components/TrustBadges'))
const CTA               = dynamic(() => import('@/components/CTA'))
const MissionFreeze     = dynamic(() => import('@/components/MissionFreeze'))

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
        {/* Trust strip — partners and health systems */}
        <LogoMarquee />
        <BeforeAfterBar />
        <Features />
        <HowItWorks />
        <Testimonials />
        <MissionFreeze />
        {/* Privacy + trust badges before the final CTA */}
        <TrustBadges />
        <CTA />
      </main>

      <Footer />
    </>
  )
}
