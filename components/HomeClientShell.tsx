'use client'
import dynamic from 'next/dynamic'

/**
 * Client-only browser components that use window / document / WebGL at
 * top-level and cannot be rendered on the server.
 *
 * Next.js 16 (Turbopack) forbids `ssr: false` in Server Components, so
 * these dynamic imports must live inside a 'use client' boundary.
 */
const BackgroundCanvas = dynamic(() => import('@/components/BackgroundCanvas'), { ssr: false })
const ScrollProgress   = dynamic(() => import('@/components/ScrollProgress'),   { ssr: false })
const FloatingCTA      = dynamic(() => import('@/components/FloatingCTA'),      { ssr: false })
const ExitIntent       = dynamic(() => import('@/components/ExitIntent'),       { ssr: false })
const CrisisButton     = dynamic(() => import('@/components/CrisisButton'),     { ssr: false })
const GlobalEffects    = dynamic(() => import('@/components/GlobalEffects'),    { ssr: false })

export default function HomeClientShell() {
  return (
    <>
      <BackgroundCanvas />
      <ScrollProgress />
      <FloatingCTA />
      <ExitIntent />
      <CrisisButton />
      <GlobalEffects />
    </>
  )
}
