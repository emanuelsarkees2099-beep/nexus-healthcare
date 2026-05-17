import AppShell from '@/components/AppShell'

export default function SearchLoading() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Search bar skeleton */}
        <div style={{ height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.04)', animation: 'shimmer 1.5s infinite', marginBottom: 24 }} />
        {/* Filter chips skeleton */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[90, 120, 80, 110, 95, 100].map((w, i) => (
            <div key={i} style={{ height: 34, width: w, borderRadius: 100, background: 'rgba(255,255,255,0.04)', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        {/* Result cards skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ height: 120, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </AppShell>
  )
}
