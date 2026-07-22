'use client'
import { Analytics } from '@vercel/analytics/next'

/**
 * Vercel Web Analytics — cookieless, no PII, tracks page views and Web
 * Vitals only. Auto-detects the Vercel runtime and is a silent no-op on
 * any other host (local dev, other platforms), so no env-var gate needed.
 * Loaded ssr:false via GlobalClientComponents so it never runs server-side.
 */
export default function VercelAnalytics() {
  return <Analytics />
}
