import type { Metadata } from 'next'
import { Bricolage_Grotesque, Inter, Orbitron } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"
import LanguageSelector from '@/components/LanguageSelector'
import SettingsSidebar from '@/components/SettingsSidebar'
import ChatWidget from '@/components/ChatWidget'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-orbitron',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NEXUS — Free Healthcare, Found in Seconds',
  description:
    'NEXUS finds free clinics, sliding-scale care, and hidden programs for the 30 million uninsured Americans who deserve better.',
  keywords: ['free healthcare', 'free clinic', 'uninsured', 'healthcare access', 'NEXUS'],
  openGraph: {
    title: 'NEXUS — Free Healthcare, Found in Seconds',
    description: 'Find free clinics, sliding-scale care, and eligibility programs near you. No insurance required.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} ${orbitron.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#07070F" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <LanguageSelector />
        <SettingsSidebar />
        <ChatWidget />
        <SpeedInsights />
      </body>
    </html>
  )
}
