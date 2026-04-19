'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { createClientClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VerifyPage() {
  const [status, setStatus] = useState<'pending' | 'verified' | 'error'>('pending')
  const [supabase, setSupabase] = useState<ReturnType<typeof createClientClient> | null>(null)

  useEffect(() => {
    setSupabase(createClientClient())
  }, [])
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('verified')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else if (event === 'USER_UPDATED') {
        setStatus('verified')
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase, router])

  const resendEmail = async () => {
    // This would require the user's email — for now just route to login
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', background: '#07070F' }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ marginBottom: '36px' }}>
          <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: '13px', fontWeight: 400, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.9)' }}>NEXUS</span>
        </div>

        {status === 'verified' ? (
          <>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>Email verified!</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6 }}>
              Redirecting you to your dashboard…
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>Verification failed</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              The link may have expired or already been used.
            </p>
            <Link href="/login" style={{ color: '#6d9197', fontSize: '13px', textDecoration: 'none' }}>← Back to sign in</Link>
          </>
        ) : (
          <>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(109,145,151,0.1)', border: '1px solid rgba(109,145,151,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6d9197" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>Check your email</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
              We sent a verification link to your email address. Click the link to activate your account.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '20px' }}>
              Waiting for verification…
              <span style={{ display: 'inline-block', marginLeft: '8px' }}>
                <span style={{ animation: 'dot 1.4s infinite', animationDelay: '0s' }}>.</span>
                <span style={{ animation: 'dot 1.4s infinite', animationDelay: '0.2s' }}>.</span>
                <span style={{ animation: 'dot 1.4s infinite', animationDelay: '0.4s' }}>.</span>
              </span>
            </p>
            <style>{`
              @keyframes dot { 0%,80%,100%{opacity:0} 40%{opacity:1} }
            `}</style>
            <Link href="/login" style={{ color: '#6d9197', fontSize: '13px', textDecoration: 'none' }}>← Back to sign in</Link>
          </>
        )}
      </div>
    </div>
  )
}
