import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'You Are Offline — NEXUS',
  description: 'You appear to be offline. Some NEXUS features are available without an internet connection.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
