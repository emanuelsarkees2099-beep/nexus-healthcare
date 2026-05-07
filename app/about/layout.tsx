import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About NEXUS — Free Healthcare for Every Uninsured American',
  description: 'NEXUS is a mission-driven platform connecting 30 million uninsured Americans to federally-funded free clinics, sliding-scale care, and benefits they qualify for — at zero cost.',
  openGraph: {
    title: 'About NEXUS',
    description: 'How NEXUS works, what we believe, and the data sources behind the platform.',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
