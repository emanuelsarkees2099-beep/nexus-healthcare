import { PAGE_META } from '@/lib/page-metadata'

export const metadata = PAGE_META.medications

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
