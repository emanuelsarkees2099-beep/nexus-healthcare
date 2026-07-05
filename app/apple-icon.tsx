/**
 * NEXUS Apple Touch Icon — 180×180 for iOS home screen saves.
 * Auto-injects:  <link rel="apple-touch-icon" href="/apple-icon" sizes="180x180" />
 */
import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #0C0D18 0%, #050B16 100%)',
          borderRadius: '40px',
        }}
      >
        {/* Large hexagon glyph */}
        <svg width="120" height="120" viewBox="0 0 26 26" fill="none">
          <polygon
            points="13,1.5 23.5,7.25 23.5,18.75 13,24.5 2.5,18.75 2.5,7.25"
            stroke="#4A8FD4"
            strokeWidth="1.2"
            fill="rgba(74,143,212,0.14)"
          />
          <path
            d="M8.5 17.5V8.5L13 17L17.5 8.5V17.5"
            stroke="#4A8FD4"
            strokeWidth="1.8"
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
