import type { Metadata } from 'next'
import { PAGE_META } from '@/lib/page-metadata'
export const metadata: Metadata = PAGE_META.methodology
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</> }
