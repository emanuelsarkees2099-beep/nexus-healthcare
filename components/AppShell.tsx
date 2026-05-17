'use client'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Footer from '@/components/Footer'

const ScrollProgress  = dynamic(() => import('@/components/ScrollProgress'),  { ssr: false })
const Nav             = dynamic(() => import('@/components/Nav'),             { ssr: false })
const CrisisButton    = dynamic(() => import('@/components/CrisisButton'),    { ssr: false })

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

/* ── N8: Care Continuity Reminder Checker ───────────────────────
   Runs once on every page mount. Reads nexus_reminders localStorage,
   fires Notification API for any past-due reminders, then marks them
   as fired so they never repeat.
   ─────────────────────────────────────────────────────────────── */
type ClinicReminder = {
  clinicId:  string
  clinicName: string
  ts48h:     number
  ts11m:     number
  fired48h:  boolean
  fired11m:  boolean
}

function useReminderChecker() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return

    try {
      const raw = localStorage.getItem('nexus_reminders')
      if (!raw) return
      const reminders: ClinicReminder[] = JSON.parse(raw)
      const now = Date.now()
      let changed = false

      const updated = reminders.map(r => {
        const next = { ...r }

        /* 48-hour follow-up */
        if (!r.fired48h && now >= r.ts48h) {
          try {
            new Notification('NEXUS — Following up', {
              body:  `Have you scheduled your visit to ${r.clinicName}? It's been 2 days since you saved it.`,
              icon:  '/icons/icon-192.png',
              tag:   `nexus-48h-${r.clinicId}`,
              badge: '/icons/icon-96.png',
            })
          } catch { /* ignore if notification blocked */ }
          next.fired48h = true
          changed = true
        }

        /* 11-month annual reminder */
        if (!r.fired11m && now >= r.ts11m) {
          try {
            new Notification('NEXUS — Annual care reminder', {
              body:  `It's been about a year. Consider scheduling a follow-up visit at ${r.clinicName}.`,
              icon:  '/icons/icon-192.png',
              tag:   `nexus-11m-${r.clinicId}`,
              badge: '/icons/icon-96.png',
            })
          } catch { /* ignore if notification blocked */ }
          next.fired11m = true
          changed = true
        }

        return next
      })

      if (changed) {
        localStorage.setItem('nexus_reminders', JSON.stringify(updated))
      }
    } catch { /* localStorage unavailable */ }
  }, [])
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  useReminderChecker()

  return (
    <>
      <ScrollProgress />
      <Nav />
      <CrisisButton />
      <main style={{ paddingTop: '62px', minHeight: '100dvh' }}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  )
}
