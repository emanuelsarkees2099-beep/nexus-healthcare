'use client'
import { useState, useEffect } from 'react'
import { createClientClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Submission = {
  id: string
  type: string
  data: Record<string, unknown>
  status: string
  user_id: string | null
  created_at: string
  updated_at: string
  user_profiles?: { full_name: string | null; email: string | null; user_type: string | null } | null
}

const TYPE_COLORS: Record<string, string> = {
  story: '#6d9197',
  chw: '#8b7cc8',
  legal: '#f59e0b',
  provider: '#10b981',
  accessibility: '#f97316',
  advocacy: '#ec4899',
}

const STATUS_COLORS: Record<string, string> = {
  new: '#6d9197',
  pending_review: '#f97316',
  reviewed: '#f59e0b',
  resolved: '#10b981',
  published: '#4ade80',
  archived: 'rgba(255,255,255,0.3)',
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Submission | null>(null)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()
  const supabase = createClientClient()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single()

      if (profile?.user_type !== 'admin') {
        router.push('/dashboard')
        return
      }

      loadSubmissions()
    }
    checkAdmin()
  }, [])

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error: err } = await supabase
        .from('submissions')
        .select(`
          *,
          user_profiles (full_name, email, user_type)
        `)
        .order('created_at', { ascending: false })
        .limit(200)

      if (err) throw err
      setSubmissions(data || [])
    } catch (err) {
      setError('Failed to load submissions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true)
    const { error: err } = await supabase
      .from('submissions')
      .update({ status })
      .eq('id', id)

    if (!err) {
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev)
    }
    setUpdating(false)
  }

  const filtered = submissions.filter(s => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    return true
  })

  const counts = submissions.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const inputStyle = {
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#eef4f5',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', paddingTop: '100px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Admin Panel</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              {submissions.length} total submissions
            </p>
          </div>
          <Link href="/dashboard" style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px' }}>
            ← Dashboard
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { label: 'Pending Review', key: 'pending_review', color: '#f97316' },
            { label: 'New', key: 'new', color: '#6d9197' },
            { label: 'Reviewed', key: 'reviewed', color: '#f59e0b' },
            { label: 'Resolved', key: 'resolved', color: '#10b981' },
            { label: 'Published', key: 'published', color: '#4ade80' },
          ].map(s => (
            <div key={s.key} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}30`, borderRadius: '10px', minWidth: '120px', cursor: 'pointer' }}
              onClick={() => setStatusFilter(s.key)}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.08em' }}>{s.label.toUpperCase()}</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{counts[s.key] || 0}</p>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#ff6b6b', fontSize: '13px' }}>{error}</div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={inputStyle}>
            <option value="all">All types</option>
            {['story','chw','legal','provider','accessibility','advocacy'].map(t => (
              <option key={t} value={t}>{t} ({counts[t] || 0})</option>
            ))}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
            <option value="all">All statuses</option>
            {['pending_review','new','reviewed','resolved','published','archived'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>{filtered.length} results</span>
          <button onClick={loadSubmissions} style={{ marginLeft: 'auto', padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
            ↻ Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)' }}>Loading submissions…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)' }}>No submissions found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '20px', alignItems: 'start' }}>
            {/* Submissions list */}
            <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 160px 140px', gap: '0', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                {['Submitted by', 'Type', 'Status', 'Date', 'Action'].map(h => (
                  <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>{h.toUpperCase()}</span>
                ))}
              </div>
              {filtered.map((sub, i) => {
                const profile = sub.user_profiles
                const date = new Date(sub.created_at)
                const isSelected = selected?.id === sub.id
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelected(isSelected ? null : sub)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 120px 160px 140px',
                      gap: '0',
                      padding: '14px 20px',
                      borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(109,145,151,0.07)' : 'transparent',
                      transition: 'background 0.15s',
                      alignItems: 'center',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* User */}
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#eef4f5', marginBottom: '2px' }}>
                        {profile?.full_name || 'Anonymous'}
                      </p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                        {profile?.email || sub.user_id?.slice(0, 8) || 'No user'}
                      </p>
                    </div>
                    {/* Type badge */}
                    <div>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: `${TYPE_COLORS[sub.type] || '#6d9197'}18`, color: TYPE_COLORS[sub.type] || '#6d9197', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>
                        {sub.type.toUpperCase()}
                      </span>
                    </div>
                    {/* Status */}
                    <div>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: `${STATUS_COLORS[sub.status] || '#6d9197'}18`, color: STATUS_COLORS[sub.status] || '#6d9197', fontSize: '11px', fontWeight: 600 }}>
                        {sub.status}
                      </span>
                    </div>
                    {/* Date */}
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {/* Action */}
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {sub.status === 'pending_review' ? (
                        <>
                          <button onClick={() => updateStatus(sub.id, 'published')} disabled={updating}
                            style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #4ade8060', background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                            ✓ Approve
                          </button>
                          <button onClick={() => updateStatus(sub.id, 'archived')} disabled={updating}
                            style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.1)', color: '#f87171', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                            ✗ Reject
                          </button>
                        </>
                      ) : (
                        <select
                          value={sub.status}
                          onChange={e => updateStatus(sub.id, e.target.value)}
                          disabled={updating}
                          style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px' }}
                        >
                          {['new','reviewed','resolved','published','archived'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Detail panel */}
            {selected && (
              <div style={{ border: '1px solid rgba(109,145,151,0.25)', borderRadius: '12px', padding: '24px', background: 'rgba(109,145,151,0.04)', position: 'sticky', top: '110px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Submission Detail</h3>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
                </div>

                {/* User info */}
                <div style={{ marginBottom: '20px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontWeight: 600 }}>SUBMITTED BY</p>
                  <p style={{ fontSize: '15px', color: '#eef4f5', fontWeight: 600, marginBottom: '3px' }}>{selected.user_profiles?.full_name || 'Anonymous'}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{selected.user_profiles?.email || '—'}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>Type: {selected.user_profiles?.user_type || 'unknown'}</p>
                </div>

                {/* Metadata */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '6px', background: `${TYPE_COLORS[selected.type]}18`, color: TYPE_COLORS[selected.type] || '#6d9197', fontSize: '12px', fontWeight: 600 }}>{selected.type}</span>
                  <span style={{ padding: '4px 10px', borderRadius: '6px', background: `${STATUS_COLORS[selected.status]}18`, color: STATUS_COLORS[selected.status] || '#6d9197', fontSize: '12px', fontWeight: 600 }}>{selected.status}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
                  {new Date(selected.created_at).toLocaleString()}
                </p>

                {/* Data fields */}
                <div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', fontWeight: 600 }}>CONTENT</p>
                  {Object.entries(selected.data).map(([key, val]) => (
                    <div key={key} style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px', textTransform: 'capitalize', fontWeight: 600 }}>{key.replace(/_/g, ' ')}</p>
                      <p style={{ fontSize: '13px', color: '#eef4f5', lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val || '—')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Status update */}
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontWeight: 600 }}>UPDATE STATUS</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(selected.type === 'story' ? ['pending_review','published','reviewed','resolved','archived'] : ['new','reviewed','resolved','archived']).map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        disabled={updating || selected.status === s}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '7px',
                          border: `1px solid ${selected.status === s ? STATUS_COLORS[s] : 'rgba(255,255,255,0.1)'}`,
                          background: selected.status === s ? `${STATUS_COLORS[s]}20` : 'transparent',
                          color: selected.status === s ? STATUS_COLORS[s] : 'rgba(255,255,255,0.5)',
                          fontSize: '12px',
                          cursor: selected.status === s ? 'default' : 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 600,
                          opacity: updating ? 0.5 : 1,
                        }}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
