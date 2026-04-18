'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { createClientClient } from '@/lib/auth-client'

// Client-only components (use browser APIs)
const BackgroundCanvas = dynamic(() => import('@/components/BackgroundCanvas'), { ssr: false })
const Cursor = dynamic(() => import('@/components/Cursor'), { ssr: false })
const ScrollProgress = dynamic(() => import('@/components/ScrollProgress'), { ssr: false })
const Nav = dynamic(() => import('@/components/Nav'), { ssr: false })
const Hero = dynamic(() => import('@/components/Hero'), { ssr: false })
const Stats = dynamic(() => import('@/components/Stats'), { ssr: false })
const Features = dynamic(() => import('@/components/Features'), { ssr: false })
const LogoMarquee = dynamic(() => import('@/components/LogoMarquee'), { ssr: false })
const Mockup = dynamic(() => import('@/components/Mockup'), { ssr: false })
const HowItWorks = dynamic(() => import('@/components/HowItWorks'), { ssr: false })
const Eligibility = dynamic(() => import('@/components/Eligibility'), { ssr: false })
const MissionFreeze = dynamic(() => import('@/components/MissionFreeze'), { ssr: false })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false })
const CTA = dynamic(() => import('@/components/CTA'), { ssr: false })
const FloatingCTA = dynamic(() => import('@/components/FloatingCTA'), { ssr: false })
const ExitIntent  = dynamic(() => import('@/components/ExitIntent'),  { ssr: false })

export default function Home() {
  const router = useRouter()
  const supabase = createClientClient()

  // No redirect — logged-in users can still view the landing page
  useEffect(() => {}, [])
  return (
    <>
      {/* Skip navigation for accessibility */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Global systems */}
      <BackgroundCanvas />
      <Cursor />
      <ScrollProgress />
      <FloatingCTA />
      <ExitIntent />

      {/* Navigation */}
      <Nav />

      {/* Page content */}
      <main>
        <Hero />
        <Stats />
        <Features />
        <LogoMarquee />
        <Mockup />
        <HowItWorks />
        <Eligibility />
        <MissionFreeze />
        <Testimonials />
        <CTA />
      </main>

      <Footer />
    </>
  )
}
