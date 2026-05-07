import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — NEXUS',
  description: 'NEXUS privacy policy. We collect the minimum data required to function, never sell your data, and never share with insurance companies or advertisers.',
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
