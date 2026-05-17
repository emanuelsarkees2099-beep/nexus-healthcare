import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import HomeClientShell from '@/components/HomeClientShell'

/* ── Nav + Hero — code-split, SSR-safe ── */
const Nav               = dynamic(() => import('@/components/Nav'))
const Hero              = dynamic(() => import('@/components/Hero'))

/* ── Content sections — code-split, SSR-safe ── */
const Stats             = dynamic(() => import('@/components/Stats'))
const BeforeAfterBar    = dynamic(() => import('@/components/BeforeAfterBar'))
const Features          = dynamic(() => import('@/components/Features'))
const HowItWorks        = dynamic(() => import('@/components/HowItWorks'))
const Testimonials      = dynamic(() => import('@/components/Testimonials'))
const CTA               = dynamic(() => import('@/components/CTA'))
const CostCalculator    = dynamic(() => import('@/components/CostCalculator'))
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
        <BeforeAfterBar />
        <Features />
        <HowItWorks />
        <CostCalculator />
        <Testimonials />
        <MissionFreeze />
        <CTA />
      </main>

      <Footer />
    </>
  )
}
