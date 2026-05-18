/**
 * NexusLogoMark — abstract organic mark for NEXUS
 *
 * Three smooth lobes radiating from a center point at 120° intervals,
 * creating a unified symbol that suggests: connection, flow, network.
 * Inspired by the two abstract blob logos submitted as references.
 *
 * Usage:
 *   <NexusLogoMark size={20} />          — accent color (default)
 *   <NexusLogoMark size={32} mono />     — white
 *   <NexusLogoMark size={48} glow />     — with ambient glow
 */

interface NexusLogoMarkProps {
  size?:  number
  color?: string
  mono?:  boolean   // force white
  glow?:  boolean   // add a radial ambient glow behind the mark
  className?: string
  style?: React.CSSProperties
}

export default function NexusLogoMark({
  size = 24,
  color,
  mono = false,
  glow = false,
  className,
  style,
}: NexusLogoMarkProps) {
  const fill = color ?? (mono ? '#ffffff' : 'var(--accent)')
  const id   = `nexus-glow-${size}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {glow && (
        <defs>
          <radialGradient id={id} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={fill} stopOpacity="0.30" />
            <stop offset="100%" stopColor={fill} stopOpacity="0"    />
          </radialGradient>
        </defs>
      )}

      {/* Ambient glow disc */}
      {glow && <circle cx="50" cy="50" r="50" fill={`url(#${id})`} />}

      {/*
        Three petal-lobes at 0°, 120°, 240°.
        Each lobe: smooth bezier leaf from center (50,50)
        up to tip, wide at the outer end, tapering back.
        Rotation handles the 120° placement.
      */}

      {/* Lobe 1 — top / 0° */}
      <path
        d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z"
        fill={fill}
        opacity="0.95"
      />

      {/* Lobe 2 — bottom-right / 120° */}
      <path
        transform="rotate(120 50 50)"
        d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z"
        fill={fill}
        opacity="0.95"
      />

      {/* Lobe 3 — bottom-left / 240° */}
      <path
        transform="rotate(240 50 50)"
        d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z"
        fill={fill}
        opacity="0.95"
      />

      {/* Center nucleus — small filled circle anchoring the three lobes */}
      <circle cx="50" cy="50" r="5" fill={fill} opacity="0.7" />
    </svg>
  )
}
