export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(109,145,151,0.2)', borderTopColor: '#6d9197', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: '11px', fontWeight: 400, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.3)' }}>NEXUS</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
