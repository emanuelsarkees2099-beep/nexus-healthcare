'use client'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { ToastContainer } from '@/components/ui/Toast'

const CommandPalette              = dynamic(() => import('@/components/CommandPalette'),              { ssr: false })
const PwaInstallPrompt            = dynamic(() => import('@/components/PwaInstallPrompt'),           { ssr: false })
const ServiceWorkerRegistration   = dynamic(() => import('@/components/ServiceWorkerRegistration'),  { ssr: false })
const AIAssistant                 = dynamic(() => import('@/components/AIAssistant'),                { ssr: false })
const CookieConsent               = dynamic(() => import('@/components/CookieConsent'),              { ssr: false })
const SentryInit                  = dynamic(() => import('@/components/SentryInit'),                 { ssr: false })
const PostHogProvider             = dynamic(() => import('@/components/PostHogProvider'),            { ssr: false })
const MobileDock                  = dynamic(() => import('@/components/MobileDock'),                 { ssr: false })

export default function GlobalClientComponents() {
  /* #37 — Low-bandwidth mode: restore persisted preference on mount */
  useEffect(() => {
    try {
      const reduced = localStorage.getItem('nexus_reduced_data')
      if (reduced === 'true') {
        document.documentElement.setAttribute('data-reduced-data', 'true')
      }
    } catch { /* ignore — private browsing or storage denied */ }
  }, [])

  return (
    <>
      {/* I1 — initialise Sentry once at client startup, no-op if DSN not set */}
      <SentryInit />
      {/* Analytics — PostHog, no-op if NEXT_PUBLIC_POSTHOG_KEY not set */}
      <PostHogProvider />
      <CommandPalette />
      <PwaInstallPrompt />
      <ServiceWorkerRegistration />
      <AIAssistant />
      <CookieConsent />
      {/* Mobile bottom dock — shown via CSS only on ≤768px */}
      <MobileDock />
      {/* #35 — Centralized toast notification system */}
      <ToastContainer />
    </>
  )
}
