/**
 * NEXUS App Icon — generated favicon via Next.js App Router convention.
 *
 * Renders the Nexus hexagon glyph as a 32×32 PNG.
 * Next.js auto-injects:  <link rel="icon" href="/icon" type="image/png" sizes="32x32" />
 * No manual <link> tag needed — this file IS the favicon.
 */
import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#040408',
          borderRadius: '6px',
        }}
      >
        {/* Hexagon outline */}
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          {/* Outer hexagon */}
          <polygon
            points="13,1.5 23.5,7.25 23.5,18.75 13,24.5 2.5,18.75 2.5,7.25"
            stroke="#4A8FD4"
            strokeWidth="1.5"
            fill="rgba(74,143,212,0.12)"
          />
          {/* N-like path (stylized NEXUS mark) */}
          <path
            d="M8.5 17.5V8.5L13 17L17.5 8.5V17.5"
            stroke="#4A8FD4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
