import AppShell from '@/components/AppShell'

export default function MedicationsLoading() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ height: 48, width: '42%', borderRadius: 10, background: 'rgba(255,255,255,0.05)', marginBottom: 16, animation: 'sk 1.4s ease-in-out infinite' }} />
        <div style={{ height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.04)', marginBottom: 32, animation: 'sk 1.4s ease-in-out infinite' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 96, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'sk 1.4s ease-in-out infinite', animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes sk { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </AppShell>
  )
}
