/**
 * Clinic detail page — server component.
 *
 * WHY THIS CHANGED: this used to be a 'use client' page that fetched the
 * clinic via useEffect + fetch('/api/clinics?id=...') entirely in the
 * browser. That meant the server-rendered HTML Googlebot's fast initial
 * crawl sees was just a loading skeleton ("Loading clinic details...",
 * confirmed live -- the word "Loading" appeared in the raw HTML) with no
 * actual clinic content at all -- across all 18,938 clinic pages. The
 * <title> tag was already correctly personalized per-clinic (layout.tsx
 * handles that via generateMetadata), but the visible body content was not,
 * which is a strong thin/duplicate-content signal at this page count on a
 * young domain -- very likely a major contributor to the huge "Discovered/
 * Crawled -- currently not indexed" counts in Search Console.
 *
 * Fix: fetch the clinic server-side (same /api/clinics?id= endpoint the old
 * client fetch and the metadata layout already use, so the data and all its
 * business logic -- affordability scoring, NAFC merge, cal_link overrides --
 * stay identical, zero duplicated logic) and pass it into the existing
 * client component as a prop instead of state it fetches itself. The client
 * component's JSX and all interactive behavior (bookmarking, share, SMS,
 * directions, reviews, booking) are unchanged -- only where the data comes
 * from changed. Because it's now a resolved prop rather than post-mount
 * state, React renders the real content on the very first (server) render,
 * so it's actually present in the HTML this time.
 *
 * Bonus fix: a missing clinic now calls notFound() and returns a real
 * HTTP 404 (see not-found.tsx) instead of a client-rendered "not found"
 * message that always served 200 OK -- a "soft 404".
 */
import { notFound } from 'next/navigation'
import ClinicDetailClient from './ClinicDetailClient'
import type { Clinic } from '@/app/api/clinics/route'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.axvohealth.com'

export const revalidate = 3600 // Matches the existing metadata fetch's revalidate window

interface PageProps {
  params: Promise<{ id: string }>
}

async function getClinic(id: string): Promise<Clinic | null> {
  try {
    const res = await fetch(`${BASE}/api/clinics?id=${encodeURIComponent(id)}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const json = await res.json() as { clinic?: Clinic }
    return json.clinic ?? null
  } catch {
    return null
  }
}

export default async function ClinicDetailPage({ params }: PageProps) {
  const { id } = await params
  const clinic = await getClinic(id)
  if (!clinic) notFound()
  return <ClinicDetailClient clinic={clinic} />
}
