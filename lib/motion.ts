/**
 * NEXUS — Shared Motion Token System
 *
 * Single source of truth for all animation constants.
 * Every component should pull from here instead of hardcoding
 * easing strings, durations, or stagger values.
 *
 * Prefers-reduced-motion is respected globally:
 *   - GSAP: call killAllIfReduced() inside useEffect
 *   - CSS: handled automatically via the prefers-reduced-motion
 *     media query in globals.css
 */

/* ── CSS Easing Strings (match CSS custom properties in globals.css) ── */
export const EASE_OUT_EXPO    = 'cubic-bezier(0.16, 1, 0.30, 1)'
export const EASE_SPRING      = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
export const EASE_IN_OUT_CIRC = 'cubic-bezier(0.85, 0, 0.15, 1)'

/* ── GSAP Ease Strings ── */
export const GSAP_EXPO_OUT  = 'power4.out'
export const GSAP_SPRING    = 'elastic.out(1, 0.5)'
export const GSAP_SMOOTH    = 'power3.out'

/* ── Duration Tokens (seconds for GSAP, ms for CSS) ── */
export const DUR = {
  instant:  0.08,
  fast:     0.18,
  normal:   0.35,
  slow:     0.55,
  entrance: 0.75,
  cinematic: 1.2,
} as const

/* ── Stagger Helpers ── */
/** Returns delay in seconds for GSAP stagger (i = item index) */
export const ENTRANCE_DELAY = (i: number) => 0.06 * i
/** Stagger config object for GSAP `.from()` / `.fromTo()` calls */
export const STAGGER_NORMAL = { stagger: 0.08, ease: GSAP_EXPO_OUT }
export const STAGGER_FAST   = { stagger: 0.04, ease: GSAP_EXPO_OUT }

/* ── Standard Entrance Variants (CSS-in-JS / inline style pattern) ── */
/** Initial hidden state for fade-up reveals */
export const HIDDEN_STATE = { opacity: 0, transform: 'translateY(24px)' }
/** Visible state for fade-up reveals */
export const VISIBLE_STATE = { opacity: 1, transform: 'translateY(0)' }
/** Transition string using the standard expo-out curve */
export const REVEAL_TRANSITION = (delayMs = 0) =>
  `opacity 0.75s ${EASE_OUT_EXPO} ${delayMs}ms, transform 0.75s ${EASE_OUT_EXPO} ${delayMs}ms`

/* ── Page Transition Config ── */
export const PAGE_TRANSITION = {
  duration:    DUR.normal,
  ease:        GSAP_EXPO_OUT,
  yOffset:     16,    // px — translateY on exit/enter
  scaleOffset: 0.985, // scale on exit
}

/* ── Spring Token (for Framer Motion / CSS spring equivalent) ── */
export const SPRING = {
  type:      'spring',
  stiffness: 400,
  damping:   30,
  mass:      1,
} as const

/* ── Reduced-Motion Utilities ── */

/**
 * Returns true if the user prefers reduced motion.
 * Call inside useEffect / event handlers only (not at module load time).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Kill all active GSAP animations if the user prefers reduced motion.
 * Call at the START of any GSAP useEffect, before creating timelines.
 *
 * @example
 * useEffect(() => {
 *   if (killAllIfReduced()) return
 *   // ... GSAP animations here
 * }, [])
 */
export function killAllIfReduced(): boolean {
  if (!prefersReducedMotion()) return false
  // Dynamic import so this module stays tree-shakeable in SSR contexts
  if (typeof window !== 'undefined') {
    import('gsap').then(({ default: gsap }) => {
      gsap.globalTimeline.pause()
      gsap.killTweensOf('*')
    }).catch(() => {})
  }
  return true
}

/**
 * Returns inline style for a reveal block.
 * Respects prefers-reduced-motion by skipping the animation entirely.
 *
 * @param visible - whether the element is in view
 * @param delayMs - stagger delay in milliseconds
 */
export function revealStyle(
  visible: boolean,
  delayMs = 0
): React.CSSProperties {
  const reduced = prefersReducedMotion()
  return {
    opacity:    reduced || visible ? 1 : 0,
    transform:  reduced || visible ? 'translateY(0)' : 'translateY(24px)',
    transition: reduced ? 'none' : REVEAL_TRANSITION(delayMs),
  }
}

// Make revealStyle importable without React being explicitly imported
// by deferring the CSSProperties type reference at runtime.
// (React.CSSProperties is a type-only annotation; it compiles away.)
import type React from 'react'
