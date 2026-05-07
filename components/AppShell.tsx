'use client'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Footer from '@/components/Footer'

const BackgroundCanvas = dynamic(() => import('@/components/BackgroundCanvas'), { ssr: false })
const Cursor          = dynamic(() => import('@/components/Cursor'),          { ssr: false })
const ScrollProgress  = dynamic(() => import('@/components/ScrollProgress'),  { ssr: false })
const Nav             = dynamic(() => import('@/components/Nav'),             { ssr: false })
const CrisisButton    = dynamic(() => import('@/components/CrisisButton'),    { ssr: false })
const CommandPalette  = dynamic(() => import('@/components/CommandPalette'),  { ssr: false })
const TerminalMode    = dynamic(() => import('@/components/TerminalMode'),    { ssr: false })
const ScaredButton    = dynamic(() => import('@/components/ScaredButton'),    { ssr: false })

/* ── Page transition wrapper (#10) ── */
function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname     = usePathname()
  const [display, setDisplay]   = useState(children)
  const [state, setState]       = useState<'idle' | 'exit' | 'enter'>('idle')
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (pathname === prevPathname.current) return
    prevPathname.current = pathname

    // 1. Trigger exit animation (shortened to 150ms to feel snappier)
    setState('exit')

    // 2. After exit, swap content and trigger enter
    const t1 = setTimeout(() => {
      setDisplay(children)
      setState('enter')
    }, 150)

    // 3. After enter (300ms), go idle
    const t2 = setTimeout(() => setState('idle'), 450)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [pathname, children])

  // Keep display current when idle
  useEffect(() => {
    if (state === 'idle') setDisplay(children)
  }, [children, state])

  const style: React.CSSProperties = state === 'exit'
    ? { animation: 'page-exit 0.15s ease forwards' }
    : state === 'enter'
    ? { animation: 'page-enter 0.3s var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1)) forwards' }
    : {}

  return <div style={style}>{display}</div>
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackgroundCanvas />
      <Cursor />
      <ScrollProgress />
      <Nav />
      <CommandPalette />
      <CrisisButton />
      <ScaredButton />
      <TerminalMode />
      <main style={{ paddingTop: '62px', minHeight: '100dvh' }}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  )
}
