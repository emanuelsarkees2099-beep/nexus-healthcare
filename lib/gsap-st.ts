/**
 * Centralized GSAP + ScrollTrigger registration.
 *
 * Two usage patterns:
 *
 * 1. Synchronous top-level registration (for 'use client' modules that
 *    statically import gsap):
 *
 *     import { registerGSAP } from '@/lib/gsap-st'
 *     registerGSAP()  // safe to call multiple times — no-ops after first
 *
 * 2. Lazy / async registration inside useEffect (avoids adding ScrollTrigger
 *    to the initial JS parse when the component might never mount):
 *
 *     const st = await ensureScrollTrigger()
 *     gsap.timeline({ scrollTrigger: { ... } })
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let syncRegistered = false
let asyncRegistered = false

/**
 * Global prefers-reduced-motion listener.
 * When the OS accessibility setting changes, we immediately kill all GSAP
 * tweens and pause the global timeline so no motion plays for users who
 * have opted out. CSS animations are handled automatically via the
 * @media (prefers-reduced-motion) block in globals.css.
 */
function setupReducedMotionKillSwitch() {
  if (typeof window === 'undefined') return
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const apply = (reduced: boolean) => {
    if (reduced) {
      gsap.globalTimeline.pause()
      gsap.killTweensOf('*')
      ScrollTrigger.getAll().forEach(st => st.kill())
    } else {
      gsap.globalTimeline.resume()
    }
  }
  // Apply immediately on registration
  apply(mq.matches)
  // Re-apply whenever the preference changes (OS setting toggle)
  mq.addEventListener('change', e => apply(e.matches))
}

/**
 * Synchronous GSAP + ScrollTrigger registration.
 * Safe to call at module top-level from 'use client' components.
 * No-ops if already registered or if running on the server.
 */
export function registerGSAP(): void {
  if (syncRegistered) return
  if (typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)
  syncRegistered = true
  setupReducedMotionKillSwitch()
}

/**
 * Lazy async registration — ScrollTrigger is imported dynamically,
 * keeping it out of the initial JS parse.
 * Call inside useEffect for below-fold components.
 */
export async function ensureScrollTrigger(): Promise<void> {
  if (asyncRegistered) return
  if (typeof window === 'undefined') return
  const [{ default: _gsap }, { ScrollTrigger: _ST }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])
  _gsap.registerPlugin(_ST)
  asyncRegistered = true
  setupReducedMotionKillSwitch()
}
