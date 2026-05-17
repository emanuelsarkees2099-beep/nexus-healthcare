/**
 * DotGrid — D1
 * Absolutely-positioned dot-grid background overlay for inner page hero sections.
 * Drop inside any `position: relative` container.
 */
export default function DotGrid({ opacity = 0.5 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(74,144,217,0.2) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        backgroundPosition: 'center center',
        opacity,
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%)',
      }}
    />
  )
}
