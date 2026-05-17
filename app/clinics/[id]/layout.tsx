/**
 * S2 + D9 + #45 — Dynamic per-clinic metadata with personalised OG image
 *
 * Uses generateMetadata (server-side) to fetch the clinic name from our API
 * and generate a beautiful per-clinic OG image via /api/og.
 * This makes every shared clinic link show a preview:
 *   "Free care at [Clinic Name] — [City, State] — found on NEXUS"
 */
import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nexus.health'

interface LayoutProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params

  let clinicName     = 'Free Healthcare Clinic'
  let clinicCity     = ''
  let clinicState    = ''
  let clinicServices: string[] = []

  try {
    const res = await fetch(`${BASE}/api/clinics?id=${encodeURIComponent(id)}`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const json = await res.json() as {
        clinic?: { name: string; city: string; state: string; services?: string[] }
      }
      if (json.clinic) {
        clinicName     = json.clinic.name
        clinicCity     = json.clinic.city  ?? ''
        clinicState    = json.clinic.state ?? ''
        clinicServices = json.clinic.services ?? []
      }
    }
  } catch { /* fall back to generic metadata */ }

  const location = [clinicCity, clinicState].filter(Boolean).join(', ')
  const title    = `${clinicName}${location ? ` — ${location}` : ''} — NEXUS`
  const desc     = `Free${clinicServices.length ? ` ${clinicServices.slice(0, 2).join(' & ')}` : ''} care at ${clinicName}${location ? ` in ${location}` : ''}. No insurance required. Found on NEXUS — the free healthcare finder.`

  // Per-clinic OG image via /api/og edge function
  const ogImg = `${BASE}/api/og?clinic=${encodeURIComponent(clinicName)}${location ? `&city=${encodeURIComponent(location)}` : ''}`

  return {
    title,
    description: desc,
    keywords: [
      'free clinic', 'free healthcare', clinicName, location, 'uninsured',
      'sliding scale', 'no insurance', 'FQHC',
    ].filter(Boolean),
    openGraph: {
      title,
      description: desc,
      type: 'website',
      images: [{ url: ogImg, width: 1200, height: 630, alt: `${clinicName} — Free care on NEXUS` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nexushealth',
      title,
      description: desc,
      images: [ogImg],
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
