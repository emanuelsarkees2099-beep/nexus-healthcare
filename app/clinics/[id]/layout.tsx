import type { Metadata } from 'next'
import { buildOgMeta } from '@/lib/og-metadata'

const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nexus.health'

/**
 * S2 + D9 — Dynamic clinic metadata
 *
 * Ideally we'd fetch the clinic name here for a fully personalised title.
 * Since clinics come from an external API (not a DB table with static
 * generateStaticParams), we provide rich base metadata and rely on the
 * per-clinic OG image from /api/og at search-time.
 *
 * Pages that need the clinic name can use generateMetadata in the page
 * by fetching /api/clinics?id=[id] server-side (RSC) — left as a future
 * enhancement once /api/clinics supports SSR caching.
 */
export const metadata: Metadata = {
  title: 'Free Clinic Details — NEXUS',
  description: 'View hours, services, affordability information, and how to get free or sliding-scale care at this health center. No insurance required.',
  keywords: ['free clinic', 'sliding scale', 'FQHC', 'uninsured', 'free healthcare near me'],
  ...buildOgMeta({
    page: 'search',
    metaTitle: 'Free Clinic Details — NEXUS',
    metaDescription: 'Clinic hours, services, and how to get free care without insurance.',
    base,
  }),
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
