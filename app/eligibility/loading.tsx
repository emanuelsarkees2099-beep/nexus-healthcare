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
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Heading block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="sk" style={{ width: 100, height: 20, borderRadius: 20 }} />
          <div className="sk" style={{ width: '65%', height: 36 }} />
          <div className="sk" style={{ width: '80%', height: 18 }} />
        </div>
        {/* Checklist rows */}
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
            <div className="sk" style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="sk" style={{ width: `${55 + i * 7}%`, height: 16 }} />
              <div className="sk" style={{ width: `${40 + i * 5}%`, height: 13 }} />
            </div>
            <div className="sk" style={{ width: 72, height: 28, borderRadius: 20, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
