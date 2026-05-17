'use client'
/**
 * P3 — Standardized skeleton loader system
 *
 * Design principle: every loading state in NEXUS uses these primitives.
 * No more ad-hoc spinners — every page shows an appropriately-shaped
 * skeleton that matches the content it's waiting for.
 *
 * Exports:
 *   SkeletonPulse      — CSS keyframes string (inject once per page)
 *   SkeletonLine       — single animated shimmer line
 *   SkeletonBlock      — rectangular shimmer block (avatars, images)
 *   SkeletonCard       — generic card skeleton (name + 2 lines + pills)
 *   SkeletonClinicCard — shaped like a ClinicCard result row
 *   SkeletonHero       — top-of-page hero area skeleton
 *   SkeletonDashboard  — dashboard overview tab skeleton
 *   PageLoading        — full-page centered NEXUS spinner (existing style, standardized)
 */
import React from 'react'

/* ── Shared keyframes — inject via <style> once per skeleton-using page ── */
export const SKELETON_STYLES = `
  @keyframes skel-pulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1;   }
  }
  .skel { animation: skel-pulse 1.5s ease-in-out infinite; background: rgba(255,255,255,0.05); border-radius: 6px; }
`

/* ── Primitives ─────────────────────────────────────────────────── */

interface SkeletonLineProps {
  width?: string | number
  height?: number
  delay?: number
  style?: React.CSSProperties
}

export function SkeletonLine({ width = '100%', height = 14, delay = 0, style }: SkeletonLineProps) {
  return (
    <div
      className="skel"
      style={{ width, height, borderRadius: 6, animationDelay: `${delay}s`, ...style }}
    />
  )
}

interface SkeletonBlockProps {
  width?: number | string
  height?: number | string
  radius?: number
  delay?: number
}

export function SkeletonBlock({ width = 40, height = 40, radius = 10, delay = 0 }: SkeletonBlockProps) {
  return (
    <div
      className="skel"
      style={{ width, height, borderRadius: radius, flexShrink: 0, animationDelay: `${delay}s` }}
    />
  )
}

/* ── SkeletonCard — generic ────────────────────────────────────── */
export function SkeletonCard({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 16, padding: '20px 24px', display: 'flex', gap: 16, ...style }}>
      <style>{SKELETON_STYLES}</style>
      <SkeletonBlock width={32} height={32} radius={8} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SkeletonLine width="55%" height={16} />
        <SkeletonLine width="38%" height={12} delay={0.15} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {[60, 45, 70].map((w, i) => <SkeletonLine key={i} width={w} height={20} delay={i * 0.1} style={{ borderRadius: 100 }} />)}
        </div>
      </div>
    </div>
  )
}

/* ── SkeletonClinicCard — matches the ClinicCard layout exactly ── */
export function SkeletonClinicCard() {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 16, padding: '20px 24px', display: 'flex', gap: 16 }}>
      <style>{SKELETON_STYLES}</style>
      <SkeletonBlock width={32} height={32} radius={8} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <SkeletonLine width="60%" height={16} />
            <SkeletonLine width="40%" height={11} delay={0.1} style={{ marginTop: 6 }} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
            <SkeletonBlock width={32} height={32} radius={8} delay={0.05} />
            <SkeletonBlock width={64} height={32} radius={8} delay={0.1} />
            <SkeletonBlock width={72} height={32} radius={9} delay={0.15} />
          </div>
        </div>
        {/* Pills row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[52, 80, 64, 48, 72].map((w, i) => (
            <SkeletonLine key={i} width={w} height={20} delay={i * 0.08} style={{ borderRadius: 100 }} />
          ))}
        </div>
        {/* Affordability bar */}
        <SkeletonLine width="70%" height={8} delay={0.2} style={{ borderRadius: 100 }} />
        {/* Services */}
        <div style={{ display: 'flex', gap: 5 }}>
          {[55, 70, 62, 50].map((w, i) => (
            <SkeletonLine key={i} width={w} height={22} delay={i * 0.06} style={{ borderRadius: 5 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── SkeletonHero — top-of-page hero ──────────────────────────── */
export function SkeletonHero() {
  return (
    <div style={{ padding: '80px 24px 60px', maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
      <style>{SKELETON_STYLES}</style>
      <SkeletonLine width={120} height={26} style={{ borderRadius: 100 }} />
      <SkeletonLine width="80%" height={52} delay={0.05} style={{ borderRadius: 8 }} />
      <SkeletonLine width="55%" height={52} delay={0.1} style={{ borderRadius: 8 }} />
      <SkeletonLine width="65%" height={18} delay={0.15} />
      <SkeletonLine width="50%" height={18} delay={0.2} />
      <SkeletonBlock width={400} height={52} radius={12} delay={0.25} />
    </div>
  )
}

/* ── SkeletonDashboard — dashboard overview ──────────────────── */
export function SkeletonDashboard() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{SKELETON_STYLES}</style>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[0, 0.1, 0.2, 0.3].map((delay, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SkeletonBlock width={36} height={36} radius={10} delay={delay} />
            <SkeletonLine width="70%" height={32} delay={delay + 0.05} />
            <SkeletonLine width="50%" height={12} delay={delay + 0.1} />
          </div>
        ))}
      </div>
      {/* Content rows */}
      {[0, 0.15, 0.3].map((d, i) => <SkeletonCard key={i} style={{ animationDelay: `${d}s` }} />)}
    </div>
  )
}

/* ── PageLoading — full-page spinner (standardized from loading.tsx) ── */
export function PageLoading({ label = 'NEXUS' }: { label?: string }) {
  return (
    <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(74,144,217,0.2)', borderTopColor: '#4A8FD4', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: 11, fontWeight: 400, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.3)' }}>
          {label}
        </span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
