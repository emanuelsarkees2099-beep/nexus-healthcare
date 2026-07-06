import dynamic from 'next/dynamic'

/* ── Light landing ("Paper Clinic") ─────────────────────────────────
   The marketing page is light; the inner app stays dark for now
   (Linear's own architecture: light marketing site, dark product).
   Structure follows the Attio landing formula with NEXUS content:
   badge → giant headline → search → live product frame → trust band
   → steps → features → quote → CTA band → footer.
   The old dark landing sections (Hero/Stats/HowItWorks/Features/
   Testimonials/CTA) remain in components/ and are no longer mounted. */
const LightLanding = dynamic(() => import('@/components/landing/LightLanding'))

export default function Home() {
  return (
    <>
      {/* Skip navigation for accessibility */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      <main id="main-content">
        <LightLanding />
      </main>
    </>
  )
}
