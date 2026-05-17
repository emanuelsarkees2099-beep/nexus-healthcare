'use client'
import dynamic from 'next/dynamic'

const CommandPalette              = dynamic(() => import('@/components/CommandPalette'),              { ssr: false })
const OnboardingOverlay           = dynamic(() => import('@/components/OnboardingOverlay'),           { ssr: false })
const PwaInstallPrompt            = dynamic(() => import('@/components/PwaInstallPrompt'),           { ssr: false })
const ServiceWorkerRegistration   = dynamic(() => import('@/components/ServiceWorkerRegistration'),  { ssr: false })
const AIAssistant                 = dynamic(() => import('@/components/AIAssistant'),                { ssr: false })
const CookieConsent               = dynamic(() => import('@/components/CookieConsent'),              { ssr: false })
const SentryInit                  = dynamic(() => import('@/components/SentryInit'),                 { ssr: false })

export default function GlobalClientComponents() {
  return (
    <>
      {/* I1 — initialise Sentry once at client startup, no-op if DSN not set */}
      <SentryInit />
      <CommandPalette />
      <OnboardingOverlay />
      <PwaInstallPrompt />
      <ServiceWorkerRegistration />
      <AIAssistant />
      <CookieConsent />
    </>
  )
}
