'use client'
import dynamic from 'next/dynamic'

/**
 * Client-only browser components for the homepage.
 *
 * Next.js 16 (Turbopack) forbids `ssr: false` in Server Components, so
 * these dynamic imports must live inside a 'use client' boundary.
 */
const CrisisButton  = dynamic(() => import('@/components/CrisisButton'),  { ssr: false })
const GlobalEffects = dynamic(() => import('@/components/GlobalEffects'), { ssr: false })

export default function HomeClientShell() {
  return (
    <>
      <CrisisButton />
      <GlobalEffects />
    </>
  )
}
