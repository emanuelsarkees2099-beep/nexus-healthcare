import AppShell from '@/components/AppShell'

export default function GPSLoading() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Search input */}
        <div style={{ height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.04)', marginBottom: 32, animation: 'sk 1.4s ease-in-out infinite' }} />
        {/* Map placeholder */}
        <div style={{ height: 380, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24, animation: 'sk 1.4s ease-in-out infinite' }} />
        {/* Results strip */}
        <div style={{ display: 'flex', gap: 14 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 110, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'sk 1.4s ease-in-out infinite', animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes sk { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </AppShell>
  )
}
