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
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Badge */}
        <div className="sk" style={{ width: 120, height: 22, borderRadius: 20 }} />
        {/* Heading */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="sk" style={{ width: '75%', height: 38 }} />
          <div className="sk" style={{ width: '55%', height: 38 }} />
        </div>
        {/* Subtext */}
        <div className="sk" style={{ width: '90%', height: 18 }} />
        {/* Textarea */}
        <div className="sk" style={{ width: '100%', height: 140, borderRadius: 12 }} />
        {/* Chips row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[90, 110, 80, 130, 95].map(w => (
            <div key={w} className="sk" style={{ width: w, height: 32, borderRadius: 20 }} />
          ))}
        </div>
        {/* CTA button */}
        <div className="sk" style={{ width: '100%', height: 48, borderRadius: 12 }} />
      </div>
    </div>
  )
}
