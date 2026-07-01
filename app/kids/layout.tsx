import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kids Health Guide — NEXUS',
  description: 'A free health guide for kids and families — learn healthy habits, your healthcare rights, how to talk to your doctor, and more.',
}

export default function KidsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
