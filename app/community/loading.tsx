import AppShell from '@/components/AppShell'

export default function CommunityLoading() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ height: 48, width: '40%', borderRadius: 10, background: 'rgba(255,255,255,0.05)', marginBottom: 16, animation: 'sk 1.4s ease-in-out infinite' }} />
        <div style={{ height: 18, width: '32%', borderRadius: 8, background: 'rgba(255,255,255,0.04)', marginBottom: 40, animation: 'sk 1.4s ease-in-out infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: 160, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'sk 1.4s ease-in-out infinite', animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes sk { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </AppShell>
  )
}
