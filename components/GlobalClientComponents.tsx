'use client'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { ToastContainer } from '@/components/ui/Toast'
import ScrollReveal from '@/components/ScrollReveal'

const CommandPalette              = dynamic(() => import('@/components/CommandPalette'),              { ssr: false })
const ServiceWorkerRegistration   = dynamic(() => import('@/components/ServiceWorkerRegistration'),  { ssr: false })
const AIAssistant                 = dynamic(() => import('@/components/AIAssistant'),                { ssr: false })
const CookieConsent               = dynamic(() => import('@/components/CookieConsent'),              { ssr: false })
const SentryInit                  = dynamic(() => import('@/components/SentryInit'),                 { ssr: false })
const PostHogProvider             = dynamic(() => import('@/components/PostHogProvider'),            { ssr: false })
const MobileDock                  = dynamic(() => import('@/components/MobileDock'),                 { ssr: false })
const ScrollToTop                 = dynamic(() => import('@/components/ScrollToTop'),                 { ssr: false })
const InstallBanner               = dynamic(() => import('@/components/InstallBanner'),               { ssr: false })

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

  /* Sitewide card spotlight — updates --mouse-x/--mouse-y on .bento-card */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.bento-card')
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`)
      card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`)
    }
    document.addEventListener('mousemove', onMove, { passive: true })
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  /* Sitewide magnetic pull for .btn-primary / .btn-secondary */
  useEffect(() => {
    const MAX = 80, STR = 0.28
    let activeBtn: HTMLElement | null = null
    const onMove = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.btn-primary, .btn-secondary')
      // Reset previous button if mouse moved to a different element
      if (activeBtn && activeBtn !== btn) {
        activeBtn.style.transform = ''
        activeBtn = null
      }
      if (!btn) return
      activeBtn = btn
      const r  = btn.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width  / 2)
      const dy = e.clientY - (r.top  + r.height / 2)
      const d  = Math.sqrt(dx * dx + dy * dy)
      btn.style.transform = d < MAX
        ? `translate(${dx * (1 - d / MAX) * STR}px, ${dy * (1 - d / MAX) * STR}px)`
        : ''
    }
    document.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      document.removeEventListener('mousemove', onMove)
      if (activeBtn) activeBtn.style.transform = ''
    }
  }, [])

  return (
    <>
      {/* I1 — initialise Sentry once at client startup, no-op if DSN not set */}
      <SentryInit />
      {/* Analytics — PostHog, no-op if NEXT_PUBLIC_POSTHOG_KEY not set */}
      <PostHogProvider />
      <CommandPalette />
      <ServiceWorkerRegistration />
      <AIAssistant />
      <CookieConsent />
      {/* Mobile bottom dock — shown via CSS only on ≤768px */}
      <MobileDock />
      {/* PWA install prompt — A2HS banner, mobile only */}
      <InstallBanner />
      {/* #35 — Centralized toast notification system */}
      <ToastContainer />
      {/* Scroll-reveal: auto-reveals elements with .reveal-fade/.reveal-clip etc. */}
      <ScrollReveal />
      {/* Scroll-to-top button — appears after 400px scroll, bottom-left */}
      <ScrollToTop />
    </>
  )
}
