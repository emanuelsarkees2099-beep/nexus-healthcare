import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs'

/**
 * P4 — Bundle analyzer support
 * Usage: npm run analyze  (requires @next/bundle-analyzer — see manual steps)
 */

/* ── Security headers ─────────────────────────────────────────────────────
 * Applied to every response. Values chosen to be strict but compatible with
 * Next.js (inline styles/scripts via 'unsafe-inline', Google Fonts CDN,
 * Supabase, Groq, and Vercel Analytics).
 * ──────────────────────────────────────────────────────────────────────── */
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    // Allow geolocation only on own origin (clinic search). Block everything else.
    value: 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      // Fetch directives
      `default-src 'self'`,
      // Next.js requires unsafe-inline for its runtime scripts & __NEXT_DATA__
      // Vercel Speed Insights + Analytics need their CDN
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live`,
      // Inline styles used by React. Google Fonts stylesheet.
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      // Google Fonts files + data URIs for icons
      `font-src 'self' data: https://fonts.gstatic.com`,
      // Images: own origin, data URIs (avatars), any HTTPS (clinic images), blobs
      `img-src 'self' data: https: blob:`,
      // API calls: Supabase REST + realtime WS, Groq AI, Vercel insights
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://vitals.vercel-insights.com https://cdn.vercel-insights.com`,
      // Service workers + Web Workers from own origin only
      `worker-src 'self' blob:`,
      // No <object>, <embed>, or <applet>
      `object-src 'none'`,
      // Disallow embedding this site in any frame (also covered by X-Frame-Options)
      `frame-ancestors 'none'`,
      // Base tag must point to own origin
      `base-uri 'self'`,
      // Form submissions to own origin and Supabase auth
      `form-action 'self' https://*.supabase.co`,
      // Upgrade plain-HTTP sub-resource requests
      `upgrade-insecure-requests`,
    ].join('; '),
  },
]

let nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    /* P4: Tree-shake icon libraries and gsap so only the named exports
       that are actually imported end up in the JS bundle. */
    optimizePackageImports: ['iconsax-react', 'gsap'],
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

/* ── Bundle analyzer (only active when ANALYZE=true) ─────────────── */
if (process.env.ANALYZE === 'true') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true })
    nextConfig = withBundleAnalyzer(nextConfig)
  } catch {
    console.warn('[next.config] @next/bundle-analyzer not installed — run: npm i -D @next/bundle-analyzer')
  }
}

/* ── Sentry — only active when NEXT_PUBLIC_SENTRY_DSN is set ─────── */
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      // Suppress Sentry CLI output during builds
      silent: true,
      // Upload source maps to Sentry for readable stack traces
      // Requires SENTRY_AUTH_TOKEN env var (optional — skips gracefully if missing)
      widenClientFileUpload: true,
      disableLogger: true,
      automaticVercelMonitors: false,
    })
  : nextConfig
