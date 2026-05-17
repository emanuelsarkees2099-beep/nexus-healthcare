import type { Metadata } from 'next'

// Admin panel — never indexed, never cached
export const metadata: Metadata = {
  title: 'Admin — NEXUS',
  description: 'NEXUS admin panel.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
