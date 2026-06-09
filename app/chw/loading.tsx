import AppShell from '@/components/AppShell'

export default function CHWLoading() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ height: 48, width: '45%', borderRadius: 10, background: 'rgba(255,255,255,0.05)', marginBottom: 16, animation: 'sk 1.4s ease-in-out infinite' }} />
        <div style={{ height: 20, width: '55%', borderRadius: 8, background: 'rgba(255,255,255,0.04)', marginBottom: 48, animation: 'sk 1.4s ease-in-out infinite' }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ height: 88, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 14, animation: 'sk 1.4s ease-in-out infinite', animationDelay: `${i * 0.07}s` }} />
        ))}
      </div>
      <style>{`@keyframes sk { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </AppShell>
  )
}
