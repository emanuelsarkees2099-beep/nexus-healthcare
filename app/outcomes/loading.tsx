import AppShell from '@/components/AppShell'

export default function OutcomesLoading() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Headline */}
        <div style={{ height: 48, width: '50%', borderRadius: 10, background: 'rgba(255,255,255,0.05)', marginBottom: 16, animation: 'sk 1.4s ease-in-out infinite' }} />
        <div style={{ height: 18, width: '35%', borderRadius: 8, background: 'rgba(255,255,255,0.04)', marginBottom: 48, animation: 'sk 1.4s ease-in-out infinite' }} />
        {/* Stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 40 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 100, borderRadius: 12, background: 'rgba(255,255,255,0.04)', animation: 'sk 1.4s ease-in-out infinite', animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
        {/* Chart placeholder */}
        <div style={{ height: 280, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'sk 1.4s ease-in-out infinite' }} />
      </div>
      <style>{`@keyframes sk { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </AppShell>
  )
}
