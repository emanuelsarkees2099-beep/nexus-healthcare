import type { Metadata } from 'next'
import { Bricolage_Grotesque, Inter, Orbitron, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import LanguageSelector from '@/components/LanguageSelector'
import SettingsSidebar from '@/components/SettingsSidebar'
import GlobalClientComponents from '@/components/GlobalClientComponents'
import { I18nProvider } from '@/components/I18nContext'
import JsonLd, { WEB_APP_SCHEMA, ORG_SCHEMA } from '@/components/JsonLd'

/* ── Font subsetting (#32): latin-only, swap, no fallback shift ─── */
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
  adjustFontFallback: false,
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: false,
})

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-orbitron',
  display: 'swap',
  adjustFontFallback: false,
  // Subset to only the characters used: N E X U S · (saves ~90% of font download)
  // @ts-expect-error — `text` subsetting is valid in Next.js 13.2+ but not yet reflected in these type defs
  text: 'NEXUS·',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  title: 'NEXUS — Free Healthcare, Found in Seconds',
  description:
    'NEXUS finds free clinics, sliding-scale care, and hidden programs for the 30 million uninsured Americans who deserve better.',
  keywords: ['free healthcare', 'free clinic', 'uninsured', 'healthcare access', 'NEXUS'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'NEXUS — Free Healthcare, Found in Seconds',
    description: 'Find free clinics, sliding-scale care, and eligibility programs near you. No insurance required.',
    type: 'website',
  },
  themeColor: '#6EE7B7',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${orbitron.variable} ${mono.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#020409" />
        {/* Preconnect for Google Fonts CDN (#32) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* 5.9 — Structured Data */}
        <JsonLd schema={WEB_APP_SCHEMA} id="schema-webapp" />
        <JsonLd schema={ORG_SCHEMA} id="schema-org" />
      </head>
      <body suppressHydrationWarning>
        <I18nProvider>
          {children}
          <GlobalClientComponents />
          <LanguageSelector />
          <SettingsSidebar />
          <SpeedInsights />
        </I18nProvider>
      </body>
    </html>
  )
}
