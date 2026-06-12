'use client'
import { useEffect, useState } from 'react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      style={{
        position: 'fixed',
        bottom: 28,
        left: 24,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: hovered ? 'rgba(15,16,30,0.97)' : 'rgba(8,10,22,0.90)',
        border: `1px solid ${hovered ? 'rgba(79,142,240,0.35)' : 'rgba(255,255,255,0.10)'}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: hovered
          ? '0 8px 28px rgba(0,0,0,0.45), 0 0 0 1px rgba(79,142,240,0.12)'
          : '0 4px 20px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 8999,
        color: hovered ? 'var(--accent, #4F8EF0)' : 'rgba(255,255,255,0.65)',
        opacity: visible ? 1 : 0,
        transform: !visible
          ? 'translateY(12px) scale(0.88)'
          : hovered
          ? 'translateY(-2px) scale(1.08)'
          : 'translateY(0) scale(1)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.22s ease, transform 0.28s cubic-bezier(0.34,1.56,0.64,1), background 0.15s, border-color 0.15s, box-shadow 0.15s, color 0.15s',
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
