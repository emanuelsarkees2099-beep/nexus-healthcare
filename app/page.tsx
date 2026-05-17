'use client'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'

/* ── Browser-API-only: must skip SSR ───────────────────────────────────
   These components use window / document / navigator / canvas / WebGL
   at top-level and will crash if rendered on the server.
   ─────────────────────────────────────────────────────────────────── */
const BackgroundCanvas  = dynamic(() => import('@/components/BackgroundCanvas'),  { ssr: false })
const ScrollProgress    = dynamic(() => import('@/components/ScrollProgress'),    { ssr: false })
const FloatingCTA       = dynamic(() => import('@/components/FloatingCTA'),       { ssr: false })
const ExitIntent        = dynamic(() => import('@/components/ExitIntent'),        { ssr: false })
const CrisisButton      = dynamic(() => import('@/components/CrisisButton'),      { ssr: false })

/* ── Nav + Hero ── */
const Nav               = dynamic(() => import('@/components/Nav'),               { ssr: false })
const Hero              = dynamic(() => import('@/components/Hero'),              { ssr: false })

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

      {/* Page-level background + chrome (no SSR) */}
      <BackgroundCanvas />
      <ScrollProgress />
      <FloatingCTA />
      <ExitIntent />
      <CrisisButton />

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
