import AppShell from '@/components/AppShell'

export default function PassportLoading() {
  return (
    <AppShell>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Card visual */}
        <div style={{ height: 200, borderRadius: 20, background: 'rgba(79,142,240,0.06)', border: '1px solid rgba(79,142,240,0.12)', marginBottom: 32, animation: 'sk 1.4s ease-in-out infinite' }} />
        {/* Sections */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <div style={{ height: 16, width: 100, borderRadius: 6, background: 'rgba(255,255,255,0.05)', marginBottom: 12, animation: 'sk 1.4s ease-in-out infinite' }} />
            <div style={{ height: 64, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'sk 1.4s ease-in-out infinite', animationDelay: `${i * 0.08}s` }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes sk { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </AppShell>
  )
}
