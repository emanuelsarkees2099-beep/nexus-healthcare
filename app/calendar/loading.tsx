import AppShell from '@/components/AppShell'

export default function CalendarLoading() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ height: 32, width: 200, borderRadius: 8, background: 'rgba(255,255,255,0.06)', animation: 'sk 1.4s ease-in-out infinite' }} />
          <div style={{ height: 36, width: 120, borderRadius: 10, background: 'rgba(255,255,255,0.04)', animation: 'sk 1.4s ease-in-out infinite' }} />
        </div>
        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} style={{ height: 80, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', animation: 'sk 1.4s ease-in-out infinite', animationDelay: `${(i % 7) * 0.04}s` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes sk { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </AppShell>
  )
}
