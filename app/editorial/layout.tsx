import { PAGE_META } from '@/lib/page-metadata'
export const metadata = PAGE_META.editorial
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
