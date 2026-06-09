import AppShell from '@/components/AppShell'

export default function ProfileLoading() {
  return (
    <AppShell>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'sk 1.4s ease-in-out infinite', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 22, width: 200, borderRadius: 8, background: 'rgba(255,255,255,0.06)', marginBottom: 10, animation: 'sk 1.4s ease-in-out infinite' }} />
            <div style={{ height: 14, width: 150, borderRadius: 6, background: 'rgba(255,255,255,0.04)', animation: 'sk 1.4s ease-in-out infinite' }} />
          </div>
        </div>
        {/* Sections */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <div style={{ height: 18, width: 120, borderRadius: 6, background: 'rgba(255,255,255,0.05)', marginBottom: 14, animation: 'sk 1.4s ease-in-out infinite' }} />
            <div style={{ height: 80, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'sk 1.4s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes sk { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </AppShell>
  )
}
