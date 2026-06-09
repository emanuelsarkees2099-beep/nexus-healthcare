'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, CloseCircle, Call } from 'iconsax-react'
import { useI18n } from '@/components/I18nContext'

export default function CrisisButton() {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <style>{`
        .crisis-btn { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .crisis-btn:hover { transform: scale(1.06); box-shadow: 0 0 20px rgba(248,113,113,0.35) !important; }
        @keyframes crisis-pulse { 0%,100%{box-shadow:0 0 8px rgba(248,113,113,0.2), 0 4px 16px rgba(0,0,0,0.4)} 50%{box-shadow:0 0 16px rgba(248,113,113,0.35), 0 4px 16px rgba(0,0,0,0.4)} }
      `}</style>

      {/* Screen-reader live region for expand state (A3) */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {expanded ? 'Crisis help panel opened. Call 988, text 741741, or visit the crisis page.' : ''}
      </div>

      {/* Expand overlay */}
      {expanded && (
        <div
          role="dialog"
          aria-label="Crisis and mental health support resources"
          aria-modal="false"
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setExpanded(false)}
        >
          <div
            style={{
              position: 'absolute', bottom: '90px', right: '24px',
              background: '#0d1117', border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: '20px', padding: '24px', width: '280px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
              animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
            }}
            onClick={e => e.stopPropagation()}
          >
            <style>{`@keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }`}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f87171' }}>{t('emergency.helpNow')}</span>
              <button onClick={() => setExpanded(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                <CloseCircle size={16} variant="Linear" />
              </button>
            </div>

            <a
              href="tel:988"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', borderRadius: '12px', marginBottom: '8px',
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                textDecoration: 'none', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.18)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'}
            >
              <Call size={18} color="#f87171" variant="Linear" />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#f87171' }}>{t('emergency.call988')}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{t('emergency.desc.988')}</div>
              </div>
            </a>

            <a
              href="sms:741741?body=HOME"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '12px', marginBottom: '8px',
                background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
                textDecoration: 'none',
              }}
            >
              <Call size={16} color="#818cf8" variant="Linear" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#818cf8' }}>{t('emergency.crisisText')}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{t('emergency.desc.crisisText')}</div>
              </div>
            </a>

            <Link
              href="/crisis"
              onClick={() => setExpanded(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '13px',
              }}
            >
              <span>{t('general.learnMore')}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>→</span>
            </Link>

            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '14px', lineHeight: 1.6 }}>
              You&apos;re not alone. Help is always here.
            </p>
          </div>
        </div>
      )}

      {/* The button itself */}
      <button
        className="crisis-btn"
        onClick={() => setExpanded(!expanded)}
        aria-label={t('emergency.helpNow')}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          zIndex: 9999, width: '44px', height: '44px',
          borderRadius: '50%',
          background: 'rgba(220,38,38,0.88)',
          border: '1px solid rgba(248,113,113,0.4)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 8px rgba(248,113,113,0.2), 0 4px 16px rgba(0,0,0,0.4)',
          animation: 'crisis-pulse 4s ease-in-out infinite',
          color: '#fff',
        }}
      >
        {expanded ? <CloseCircle size={16} variant="Linear" /> : <Heart size={16} variant="Bold" color="white" />}
      </button>
    </>
  )
}
