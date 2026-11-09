import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import HomeClientShell from '@/components/HomeClientShell'

/* ── Nav + Hero — code-split, SSR-safe ── */
const Nav               = dynamic(() => import('@/components/Nav'))
const Hero              = dynamic(() => import('@/components/Hero'))

/* ── Content sections ──
   Hero (search) → Stats → Mission → How it works → Programs →
   Who it's for → Data sources → FAQ → CTA.
   ProductMockup (a decorative fake dashboard) and Features (a bento grid
   duplicating the nav) were removed to keep the page focused. */
const Stats             = dynamic(() => import('@/components/Stats'))
const HowItWorks        = dynamic(() => import('@/components/HowItWorks'))
const DataSources       = dynamic(() => import('@/components/DataSources'))
const CTA               = dynamic(() => import('@/components/CTA'))
const MissionBand       = dynamic(() => import('@/components/MissionBand'))
const ProgramsShowcase  = dynamic(() => import('@/components/ProgramsShowcase'))
const UseCases          = dynamic(() => import('@/components/UseCases'))
const LandingFAQ        = dynamic(() => import('@/components/LandingFAQ'))

export default function Home() {
  return (
    <>
      {/* Skip navigation for accessibility */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Browser-only components (crisis button) in a client boundary */}
      <HomeClientShell />

      {/* Navigation */}
      <Nav />

      <main id="main-content" style={{ position: 'relative' }}>
        <Hero />
        <Stats />
        <MissionBand />
        <HowItWorks />
        <ProgramsShowcase />
        <UseCases />
        <DataSources />
        <LandingFAQ />
        <CTA />
      </main>

      <Footer />
    </>
  )
}
