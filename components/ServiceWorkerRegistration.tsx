'use client'
import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    // Register SW after first paint so it doesn't block critical render
    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(reg => {
          // Check for updates every 60 minutes
          setInterval(() => reg.update(), 60 * 60 * 1000)
        })
        .catch(() => {
          // SW registration is optional — fail silently
        })
    }

    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register, { once: true })
    }
  }, [])

  return null
}
