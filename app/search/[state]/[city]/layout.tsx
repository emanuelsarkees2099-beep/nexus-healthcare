import type { Metadata } from 'next'
import { findCityHub } from '@/lib/city-hubs'
import { notFound } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.axvohealth.com'

interface LayoutProps {
  params: Promise<{ state: string; city: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { state, city } = await params
  const hub = findCityHub(state, city)
  if (!hub) return {}

  const title = `Free Clinics in ${hub.city}, ${hub.state} — AXVO`
  const description = `Find free and sliding-scale clinics in ${hub.city}, ${hub.stateName} — federally qualified health centers, free clinics, and low-cost care. No insurance required.`
  const url = `${BASE_URL}/search/${hub.stateSlug}/${hub.citySlug}`
  const ogImg = `${BASE_URL}/api/og?title=${encodeURIComponent(`Free Clinics in ${hub.city}, ${hub.state}`)}&sub=${encodeURIComponent(description.slice(0, 90))}`

  return {
    title,
    description,
    keywords: [
      `free clinic ${hub.city}`, `free clinic near me`, `sliding scale clinic ${hub.city}`,
      `FQHC ${hub.city}`, `${hub.city} uninsured`, 'free healthcare', 'no insurance',
    ],
    alternates: { canonical: url },
    openGraph: {
      title, description, url, siteName: 'AXVO', type: 'website',
      images: [{ url: ogImg, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image', title, description, images: [ogImg],
    },
  }
}

export default async function Layout({ children, params }: LayoutProps & { children: React.ReactNode }) {
  const { state, city } = await params
  if (!findCityHub(state, city)) notFound()
  return <>{children}</>
}
