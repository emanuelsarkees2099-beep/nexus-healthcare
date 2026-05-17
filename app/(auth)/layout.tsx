/**
 * Auth group layout — shared wrapper for all /login, /signup, /forgot-password routes.
 * Metadata is defined per-route in each route's own layout.tsx so PAGE_META is used.
 * robots: noindex is set per-route.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
