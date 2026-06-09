import AppShell from '@/components/AppShell'

export default function StoriesLoading() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ height: 48, width: '45%', borderRadius: 10, background: 'rgba(255,255,255,0.05)', marginBottom: 12, animation: 'sk 1.4s ease-in-out infinite' }} />
        <div style={{ height: 18, width: '30%', borderRadius: 8, background: 'rgba(255,255,255,0.04)', marginBottom: 48, animation: 'sk 1.4s ease-in-out infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ height: 200, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'sk 1.4s ease-in-out infinite', animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes sk { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </AppShell>
  )
}
