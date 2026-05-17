'use client'
/**
 * I1 — SentryInit
 *
 * Calls initSentry() exactly once when the client runtime starts up.
 * Rendered inside GlobalClientComponents so it fires on every page
 * without polluting any individual layout.
 *
 * Renders nothing — pure side-effect component.
 */

import { useEffect } from 'react'
import { initSentry } from '@/lib/sentry'

export default function SentryInit() {
  useEffect(() => {
    initSentry().catch(() => {
      /* silently ignore — Sentry is optional */
    })
  }, [])

  return null
}
