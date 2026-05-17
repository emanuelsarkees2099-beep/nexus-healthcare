/**
 * D9 — OG metadata helpers
 *
 * Builds OpenGraph + Twitter card metadata objects that point to the
 * dynamic /api/og edge image endpoint.
 *
 * Usage in any generateMetadata():
 *
 *   import { buildOgMeta } from '@/lib/og-metadata'
 *
 *   export async function generateMetadata(): Promise<Metadata> {
 *     return {
 *       title: 'Triage — NEXUS',
 *       ...buildOgMeta({ page: 'triage', base: process.env.NEXT_PUBLIC_APP_URL })
 *     }
 *   }
 *
 * For clinic detail pages:
 *   buildOgMeta({ clinic: clinic.name, city: clinic.city, base })
 */

import type { Metadata } from 'next'

const DEFAULT_BASE = 'https://nexus.health'

interface OgParams {
  /** One of the pre-configured PAGE_CONFIG keys in /api/og */
  page?: string
  /** Free-form title override */
  title?: string
  /** Free-form subtitle override */
  sub?: string
  /** Clinic name — renders clinic card variant */
  clinic?: string
  /** City shown as pre-label on clinic variant */
  city?: string
  /** Base URL — defaults to NEXT_PUBLIC_APP_URL or nexus.health */
  base?: string | null
}

export function buildOgImageUrl(params: OgParams): string {
  const base = (params.base ?? process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_BASE).replace(/\/$/, '')
  const url  = new URL(`${base}/api/og`)
  if (params.page)   url.searchParams.set('page',   params.page)
  if (params.title)  url.searchParams.set('title',  params.title)
  if (params.sub)    url.searchParams.set('sub',     params.sub)
  if (params.clinic) url.searchParams.set('clinic',  params.clinic)
  if (params.city)   url.searchParams.set('city',    params.city)
  return url.toString()
}

export function buildOgMeta(params: OgParams & { metaTitle?: string; metaDescription?: string }): Partial<Metadata> {
  const imageUrl = buildOgImageUrl(params)
  const title    = params.metaTitle    ?? params.title  ?? 'NEXUS — Free Healthcare, Found in Seconds'
  const desc     = params.metaDescription ?? params.sub ?? 'Find free clinics, sliding-scale care, and eligibility programs near you. No insurance required.'

  return {
    openGraph: {
      title,
      description: desc,
      siteName: 'NEXUS',
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nexushealth',
      title,
      description: desc,
      images: [imageUrl],
    },
  }
}
