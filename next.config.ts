import type { NextConfig } from "next";

/**
 * P4 — Bundle analyzer support
 * Usage: npm run analyze  (requires @next/bundle-analyzer — see manual steps)
 */
let nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    /* P4: Tree-shake lucide-react and gsap so only the named exports
       that are actually imported end up in the JS bundle. */
    optimizePackageImports: ['lucide-react', 'gsap'],
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

export default nextConfig;
