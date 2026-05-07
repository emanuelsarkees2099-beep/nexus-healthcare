'use client'
import dynamic from 'next/dynamic'

const CommandPalette              = dynamic(() => import('@/components/CommandPalette'),              { ssr: false })
const OnboardingOverlay           = dynamic(() => import('@/components/OnboardingOverlay'),           { ssr: false })
const MobileDock                  = dynamic(() => import('@/components/MobileDock'),                 { ssr: false })
const AccessibilityControls       = dynamic(() => import('@/components/AccessibilityControls'),      { ssr: false })
const PwaInstallPrompt            = dynamic(() => import('@/components/PwaInstallPrompt'),           { ssr: false })
const ServiceWorkerRegistration   = dynamic(() => import('@/components/ServiceWorkerRegistration'),  { ssr: false })

export default function GlobalClientComponents() {
  return (
    <>
      <CommandPalette />
      <OnboardingOverlay />
      <MobileDock />
      <AccessibilityControls />
      <PwaInstallPrompt />
      <ServiceWorkerRegistration />
    </>
  )
}
