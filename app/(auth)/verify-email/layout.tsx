import { PAGE_META } from '@/lib/page-metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  ...PAGE_META.verifyEmail,
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
