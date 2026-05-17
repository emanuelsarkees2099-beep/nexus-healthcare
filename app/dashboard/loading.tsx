import AppShell from '@/components/AppShell'

export default function DashboardLoading() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Welcome heading skeleton */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ height: 22, width: 130, borderRadius: 100, background: 'rgba(255,255,255,0.04)', animation: 'shimmer 1.5s infinite', marginBottom: 14 }} />
          <div style={{ height: 48, width: '55%', borderRadius: 10, background: 'rgba(255,255,255,0.05)', animation: 'shimmer 1.5s infinite', marginBottom: 10 }} />
          <div style={{ height: 18, width: '35%', borderRadius: 8, background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.5s infinite' }} />
        </div>
        {/* Tab bar skeleton */}
        <div style={{ height: 44, width: 340, borderRadius: 12, background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.5s infinite', marginBottom: 28 }} />
        {/* Grid skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {[1, 2].map(i => (
            <div key={i} style={{ height: 220, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.12}s` }} />
          ))}
          <div style={{ height: 180, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'shimmer 1.5s infinite', gridColumn: '1 / -1', animationDelay: '0.25s' }} />
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
