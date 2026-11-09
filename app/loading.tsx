export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(79,142,240,0.2)', borderTopColor: '#4F8EF0', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 400, letterSpacing: '0', color: 'rgba(255,255,255,0.3)' }}>AXVO</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
