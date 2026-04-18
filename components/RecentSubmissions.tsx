'use client'
import { useEffect, useState } from 'react'
import { createClientClient } from '@/lib/auth-client'
import Link from 'next/link'

type Submission = {
  id: string
  type: string
  status: string
  created_at: string
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  story: { label: 'Story', color: '#6d9197' },
  chw: { label: 'CHW Request', color: '#8b7cc8' },
  legal: { label: 'Legal Aid', color: '#f59e0b' },
  provider: { label: 'Provider', color: '#10b981' },
  accessibility: { label: 'Accessibility', color: '#f97316' },
  advocacy: { label: 'Advocacy', color: '#ec4899' },
}

const STATUS_COLORS: Record<string, string> = {
  new: '#6d9197',
  reviewed: '#f59e0b',
  resolved: '#10b981',
  archived: 'rgba(255,255,255,0.3)',
}

export default function RecentSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientClient()

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data } = await supabase
        .from('submissions')
        .select('id, type, status, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setSubmissions(data || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ height: '60px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease infinite' }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginBottom: '16px' }}>You haven't submitted anything yet.</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/stories" style={{ padding: '8px 16px', background: 'rgba(109,145,151,0.1)', border: '1px solid rgba(109,145,151,0.2)', borderRadius: '8px', color: '#6d9197', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Share a story</Link>
          <Link href="/rights" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '13px' }}>Get legal help</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {submissions.map(sub => {
        const meta = TYPE_LABELS[sub.type] || { label: sub.type, color: '#6d9197' }
        const date = new Date(sub.created_at)
        return (
          <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
            {/* Type dot */}
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.color, flexShrink: 0 }} />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#eef4f5' }}>{meta.label}</span>
                <span style={{ padding: '2px 7px', borderRadius: '4px', background: `${STATUS_COLORS[sub.status] || '#6d9197'}18`, color: STATUS_COLORS[sub.status] || '#6d9197', fontSize: '11px', fontWeight: 600 }}>{sub.status}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
