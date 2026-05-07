'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, X } from 'lucide-react'

export default function ScaredButton() {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <>
      <style>{`
        @keyframes scared-appear { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .scared-btn { transition: all 0.2s; }
        .scared-btn:hover { background: rgba(244,114,182,0.12) !important; }
      `}</style>

      {/* Popup */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '90px', left: '24px',
          zIndex: 9997, width: '300px',
          background: '#0d1117', border: '1px solid rgba(244,114,182,0.25)',
          borderRadius: '18px', padding: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          animation: 'scared-appear 0.3s ease both',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <Heart size={18} color="#f472b6" />
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
              <X size={14} />
            </button>
          </div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>
            It&apos;s okay to be scared.
          </h4>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '16px' }}>
            Navigating healthcare without insurance is genuinely hard. You&apos;re not failing — the system is. Here&apos;s how we can help:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/chw" onClick={() => setOpen(false)} style={{
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.2)',
              color: '#f9a8d4', fontSize: '13px', fontWeight: 600,
              textDecoration: 'none', display: 'block',
            }}>
              💬 Talk to a real person (free CHW)
            </Link>
            <Link href="/gps" onClick={() => setOpen(false)} style={{
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.18)',
              color: 'var(--accent)', fontSize: '13px',
              textDecoration: 'none', display: 'block',
            }}>
              🧭 Step-by-step guide to getting care
            </Link>
            <Link href="/crisis" onClick={() => setOpen(false)} style={{
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)',
              color: '#fca5a5', fontSize: '13px',
              textDecoration: 'none', display: 'block',
            }}>
              🚨 Crisis support resources
            </Link>
          </div>
          <button
            onClick={() => setDismissed(true)}
            style={{
              marginTop: '14px', background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontFamily: 'inherit',
            }}
          >
            Don&apos;t show this again
          </button>
        </div>
      )}

      {/* Button */}
      <button
        className="scared-btn"
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: '24px', left: '24px',
          zIndex: 9996,
          padding: '9px 16px', borderRadius: '100px',
          background: 'rgba(244,114,182,0.07)',
          border: '1px solid rgba(244,114,182,0.2)',
          color: '#f472b6', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="I'm scared — get supportive resources"
      >
        <Heart size={13} />
        I&apos;m scared
      </button>
    </>
  )
}
