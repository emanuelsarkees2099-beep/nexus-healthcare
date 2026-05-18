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
      <CommandPalette />
      <PwaInstallPrompt />
      <ServiceWorkerRegistration />
      <AIAssistant />
      <CookieConsent />
      {/* #35 — Centralized toast notification system */}
      <ToastContainer />
    </>
  )
}
