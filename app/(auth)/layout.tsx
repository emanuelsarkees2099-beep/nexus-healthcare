import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — NEXUS',
  description: 'Sign in to your NEXUS account to access saved clinics, your health passport, and personalized care guidance.',
  robots: { index: false, follow: false }, // Auth pages should not be indexed
  openGraph: {
    title: 'Sign In — NEXUS',
    description: 'Sign in to your NEXUS account.',
    type: 'website',
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
