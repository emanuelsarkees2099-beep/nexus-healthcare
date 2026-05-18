export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#07070F', paddingTop: '100px', paddingBottom: '60px' }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .sk { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%); background-size: 1200px 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
      `}</style>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Emergency banner */}
        <div style={{ padding: '28px 24px', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="sk" style={{ width: 80, height: 20, borderRadius: 20 }} />
          <div className="sk" style={{ width: '70%', height: 32 }} />
          <div className="sk" style={{ width: '90%', height: 16 }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <div className="sk" style={{ flex: 1, height: 52, borderRadius: 12 }} />
            <div className="sk" style={{ flex: 1, height: 52, borderRadius: 12 }} />
          </div>
        </div>
        {/* Resource cards */}
        {[1, 2, 3].map(i => (
          <div key={i} style={{ padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="sk" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="sk" style={{ width: '60%', height: 16 }} />
              <div className="sk" style={{ width: '80%', height: 13 }} />
            </div>
            <div className="sk" style={{ width: 90, height: 36, borderRadius: 20, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
