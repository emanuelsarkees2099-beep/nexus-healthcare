export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#07070F', paddingTop: '80px', paddingBottom: '60px' }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .sk { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%); background-size: 1200px 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
      `}</style>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px' }}>
        {/* Hero image placeholder */}
        <div className="sk" style={{ width: '100%', height: 220, borderRadius: 16, marginBottom: 32 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Name + badge */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="sk" style={{ width: '70%', height: 34 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                {[80, 100, 70].map(w => <div key={w} className="sk" style={{ width: w, height: 24, borderRadius: 20 }} />)}
              </div>
            </div>
            {/* Info rows */}
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="sk" style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0 }} />
                <div className="sk" style={{ width: `${50 + i * 10}%`, height: 16 }} />
              </div>
            ))}
            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <div className="sk" style={{ width: '100%', height: 15 }} />
              <div className="sk" style={{ width: '92%', height: 15 }} />
              <div className="sk" style={{ width: '78%', height: 15 }} />
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 24, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
            <div className="sk" style={{ width: '100%', height: 48, borderRadius: 12 }} />
            <div className="sk" style={{ width: '100%', height: 48, borderRadius: 12 }} />
            <div className="sk" style={{ width: '100%', height: 48, borderRadius: 12 }} />
          </div>
        </div>
      </div>
    </div>
  )
}
