import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NEXUS — Sign In',
  description: 'Access your NEXUS account to find free healthcare resources',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
