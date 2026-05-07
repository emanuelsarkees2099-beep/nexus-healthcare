'use client'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import BeforeAfterBar from '@/components/BeforeAfterBar'
import AnimatedDiagramsSection from '@/components/AnimatedDiagramsSection'

/* ── Browser-API-only: must skip SSR ───────────────────────────────────
   These components use window / document / navigator / canvas / WebGL
   at top-level and will crash if rendered on the server.
   ─────────────────────────────────────────────────────────────────── */
const BackgroundCanvas  = dynamic(() => import('@/components/BackgroundCanvas'),  { ssr: false })
const Cursor            = dynamic(() => import('@/components/Cursor'),            { ssr: false })
const ScrollProgress    = dynamic(() => import('@/components/ScrollProgress'),    { ssr: false })
const FloatingCTA       = dynamic(() => import('@/components/FloatingCTA'),       { ssr: false })
const ExitIntent        = dynamic(() => import('@/components/ExitIntent'),        { ssr: false })
const CommandPalette    = dynamic(() => import('@/components/CommandPalette'),    { ssr: false })
const CrisisButton      = dynamic(() => import('@/components/CrisisButton'),      { ssr: false })
const ScaredButton      = dynamic(() => import('@/components/ScaredButton'),      { ssr: false })
const TerminalMode      = dynamic(() => import('@/components/TerminalMode'),      { ssr: false })

/* ── Nav + Hero: uses geolocation / scroll / video APIs ────────────── */
const Nav               = dynamic(() => import('@/components/Nav'),               { ssr: false })
const Hero              = dynamic(() => import('@/components/Hero'),              { ssr: false })
const CinematicHero     = dynamic(() => import('@/components/CinematicHero'),     { ssr: false })

/* ── Content components: SSR-safe (GSAP guard + no direct browser refs)
   Dynamic imports for code-splitting; SSR enabled for LCP.
   ─────────────────────────────────────────────────────────────────── */
const Stats             = dynamic(() => import('@/components/Stats'))
const Features          = dynamic(() => import('@/components/Features'))
const LogoMarquee       = dynamic(() => import('@/components/LogoMarquee'))
const Mockup            = dynamic(() => import('@/components/Mockup'))
const HowItWorks        = dynamic(() => import('@/components/HowItWorks'))
const Eligibility       = dynamic(() => import('@/components/Eligibility'))
const MissionFreeze     = dynamic(() => import('@/components/MissionFreeze'))
const Testimonials      = dynamic(() => import('@/components/Testimonials'))
const CTA               = dynamic(() => import('@/components/CTA'))
const ImpactWall        = dynamic(() => import('@/components/ImpactWall'))
const CostCalculator    = dynamic(() => import('@/components/CostCalculator'))

/* ── Toggle: set to true to use the cinematic scroll-story hero ── */
const USE_CINEMATIC_HERO = false

export default function Home() {
  return (
    <>
      {/* Skip navigation for accessibility */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Global systems — browser-API-only, no SSR */}
      <BackgroundCanvas />
      <Cursor />
      <ScrollProgress />
      <FloatingCTA />
      <ExitIntent />
      <CommandPalette />
      <CrisisButton />
      <ScaredButton />
      <TerminalMode />

      {/* Navigation */}
      <Nav />

      {/* Page content */}
      <main id="main-content">
        {USE_CINEMATIC_HERO ? <CinematicHero /> : <Hero />}
        <Stats />
        <Features />
        <LogoMarquee />
        <Mockup />
        <HowItWorks />
        <AnimatedDiagramsSection />
        <BeforeAfterBar />
        <Eligibility />
        <ImpactWall />
        <CostCalculator />
        <MissionFreeze />
        <Testimonials />
        <CTA />
      </main>

      <Footer />
    </>
  )
}
