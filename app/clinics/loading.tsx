import AppShell from '@/components/AppShell'

export default function ClinicsLoading() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Search bar */}
        <div style={{ height: 58, borderRadius: 14, background: 'rgba(255,255,255,0.04)', marginBottom: 20, animation: 'sk 1.4s ease-in-out infinite' }} />
        {/* Filter row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[100, 80, 110, 90, 120, 75].map((w, i) => (
            <div key={i} style={{ height: 34, width: w, borderRadius: 100, background: 'rgba(255,255,255,0.04)', animation: 'sk 1.4s ease-in-out infinite', animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
        {/* Result cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: 130, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'sk 1.4s ease-in-out infinite', animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes sk { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </AppShell>
  )
}
