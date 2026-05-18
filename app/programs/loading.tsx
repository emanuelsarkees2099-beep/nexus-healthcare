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
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
          <div className="sk" style={{ width: 110, height: 20, borderRadius: 20 }} />
          <div className="sk" style={{ width: '50%', height: 36 }} />
          <div className="sk" style={{ width: '70%', height: 18 }} />
        </div>
        {/* Card grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ padding: 24, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="sk" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div className="sk" style={{ width: '80%', height: 15 }} />
                  <div className="sk" style={{ width: '55%', height: 12 }} />
                </div>
              </div>
              <div className="sk" style={{ width: '100%', height: 13 }} />
              <div className="sk" style={{ width: '85%', height: 13 }} />
              <div className="sk" style={{ width: '60%', height: 13 }} />
              <div className="sk" style={{ width: 100, height: 32, borderRadius: 20, marginTop: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
