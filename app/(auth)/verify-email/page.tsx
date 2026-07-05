'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClientClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TickCircle, CloseCircle, Sms, ArrowLeft } from 'iconsax-react'

export default function VerifyPage() {
  const [status,   setStatus]   = useState<'pending' | 'verified' | 'error'>('pending')
  const [supabase, setSupabase] = useState<ReturnType<typeof createClientClient> | null>(null)
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    setSupabase(createClientClient())
    setMounted(true)
  }, [])

  const router = useRouter()

  useEffect(() => {
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        setStatus('verified')
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase, router])

  if (!mounted) return null

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dot  { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        .auth-card    { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .success-card { animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .ve-back-link {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--text-3); font-size: 13px; text-decoration: none;
          transition: color 0.18s ease;
        }
        .ve-back-link:hover { color: var(--accent); }
      `}</style>

      {/* Aurora background */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-orb-3" />
      </div>

      {/* Top glow bloom */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '400px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(79,142,240,0.10) 0%, transparent 65%)',
        filter: 'blur(20px)', pointerEvents: 'none',
      }} />

      {/* Dot grid */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      <div className="auth-card" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', textDecoration: 'none', marginBottom: '6px' }}>
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <path d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
              <path transform="rotate(120 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
              <path transform="rotate(240 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
              <circle cx="50" cy="50" r="5" fill="#4F8EF0" opacity="0.7"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 400, letterSpacing: '0.42em', color: 'var(--text)', opacity: 0.90 }}>NEXUS</span>
          </Link>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', letterSpacing: '0.02em', margin: 0 }}>
            Free healthcare for everyone
          </p>
        </div>

        {/* ── Verified ── */}
        {status === 'verified' ? (
          <div className="success-card" style={{
            background: 'rgba(52,211,153,0.05)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(52,211,153,0.18)',
            borderRadius: '16px', padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <TickCircle size={36} color="#34d399" variant="TwoTone" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '10px', fontFamily: 'var(--font-display)' }}>
              Email verified!
            </h2>
            <p style={{ color: 'var(--text-3)', fontSize: '14px', lineHeight: 1.65 }}>
              Redirecting you to your dashboard…
            </p>
          </div>

        ) : status === 'error' ? (
          /* ── Error ── */
          <div style={{
            background: 'rgba(248,113,113,0.05)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(248,113,113,0.18)',
            borderRadius: '16px', padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CloseCircle size={36} color="#f87171" variant="TwoTone" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '10px', fontFamily: 'var(--font-display)' }}>
              Verification failed
            </h2>
            <p style={{ color: 'var(--text-3)', fontSize: '14px', lineHeight: 1.65, marginBottom: '28px' }}>
              The link may have expired or already been used. Try requesting a new one.
            </p>
            <Link href="/login" className="ve-back-link">
              <ArrowLeft size={14} color="rgba(255,255,255,0.5)" variant="Linear" />
              Back to sign in
            </Link>
          </div>

        ) : (
          /* ── Pending ── */
          <div style={{
            background: 'rgba(10,11,20,0.60)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '16px', padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(79,142,240,0.10)', border: '1px solid rgba(79,142,240,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Sms size={28} color="var(--accent)" variant="TwoTone" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '10px', fontFamily: 'var(--font-display)' }}>
              Check your email
            </h2>
            <p style={{ color: 'var(--text-3)', fontSize: '14px', lineHeight: 1.65, marginBottom: '20px' }}>
              We sent a verification link to your email address. Click it to activate your account.
            </p>
            <p style={{ color: 'var(--text-3)', fontSize: '13px', marginBottom: '28px', opacity: 0.65 }}>
              Waiting for verification
              <span style={{ display: 'inline-block', marginLeft: '4px' }}>
                <span style={{ animation: 'dot 1.4s infinite', animationDelay: '0.0s' }}>.</span>
                <span style={{ animation: 'dot 1.4s infinite', animationDelay: '0.2s' }}>.</span>
                <span style={{ animation: 'dot 1.4s infinite', animationDelay: '0.4s' }}>.</span>
              </span>
            </p>
            <Link href="/login" className="ve-back-link">
              <ArrowLeft size={14} color="rgba(255,255,255,0.5)" variant="Linear" />
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
