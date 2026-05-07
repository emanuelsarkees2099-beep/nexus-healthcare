'use client'
import type { ReactNode } from 'react'
import { I18nProvider } from './I18nContext'

/**
 * ClientProviders — wraps the entire app body so every component
 * (Nav, Hero, page sections, overlays) can call useI18n().
 * Must be a 'use client' boundary so it can access localStorage.
 */
export default function ClientProviders({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>
}
