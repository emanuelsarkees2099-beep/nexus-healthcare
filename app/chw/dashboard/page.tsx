'use client'
import React, { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { Profile2User, TickCircle, MessageCircle, Star1, ArrowRight2, Calendar, Clock, TrendUp, Heart, Flash, Add } from 'iconsax-react'

export const dynamic = 'force-dynamic'

/* ─── mock data ─── */
const MOCK_CLIENTS = [
  { id: 'c1', name: 'Yasmine K.',     age: 34, need: 'Insurance enrollment',   status: 'active',   lastContact: '2026-06-10', nextStep: 'Submit Medicaid application', urgent: true  },
  { id: 'c2', name: 'Marcus T.',      age: 52, need: 'Diabetes management',    status: 'active',   lastContact: '2026-06-09', nextStep: 'Follow up on lab results',    urgent: false },
  { id: 'c3', name: 'Priya S.',       age: 28, need: 'Prenatal care nav',      status: 'active',   lastContact: '2026-06-11', nextStep: 'Book OB/GYN referral',        urgent: true  },
  { id: 'c4', name: 'Robert C.',      age: 61, need: 'Prescription assistance',status: 'pending',  lastContact: '2026-06-08', nextStep: 'Connect to 340B pharmacy',    urgent: false },
  { id: 'c5', name: 'Amara L.',       age: 19, need: 'CHIP enrollment',        status: 'resolved', lastContact: '2026-06-05', nextStep: 'Enrolled — follow up in 30d', urgent: false },
]

const MOCK_REQUESTS = [
  { id: 'r1', name: 'Lindiwe M.', need: 'Mental health + insurance', lang: 'Zulu / English', urgency: 'high',   postedMins: 14 },
  { id: 'r2', name: 'Sofia R.',   need: 'Dental access + sliding scale', lang: 'Español',   urgency: 'medium', postedMins: 47 },
  { id: 'r3', name: 'Tran N.',    need: 'HRSA clinic navigation',        lang: 'Vietnamese', urgency: 'low',    postedMins: 120 },
]

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: 'Active',   color: '#34d399', bg: 'rgba(52,211,153,0.08)'  },
  pending:  { label: 'Pending',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
  resolved: { label: 'Resolved', color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.04)' },
}

const URGENCY_META: Record<string, { color: string; label: string }> = {
  high:   { color: '#f87171', label: 'Urgent' },
  medium: { color: '#f59e0b', label: 'Soon'   },
  low:    { color: '#60a5fa', label: 'Normal' },
}

export default function CHWDashboard() {
  const [tab, setTab] = useState<'clients' | 'requests' | 'stats'>('clients')
  const [chwName, setChwName] = useState('Maria R.')
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexus_chw_name')
      if (stored) setChwName(stored)
    } catch {}
  }, [])

  const accept = (id: string) => {
    setAcceptedIds(prev => new Set([...prev, id]))
  }

  const activeCount  = MOCK_CLIENTS.filter(c => c.status === 'active').length
  const urgentCount  = MOCK_CLIENTS.filter(c => c.urgent).length

  return (
    <AppShell>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(60px,8vw,100px) 24px 96px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
              CHW Dashboard
            </div>
            <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
              Welcome back, {chwName}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Your impact at a glance · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <Link href="/chw" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 9, textDecoration: 'none',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 12, fontWeight: 600, color: 'var(--text-3)',
          }}>
            Public CHW directory <ArrowRight2 size={11} color="currentColor" />
          </Link>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Active clients',   val: String(activeCount), icon: <Profile2User size={16} color="var(--accent)" />, color: 'var(--accent)' },
            { label: 'Urgent follow-ups',val: String(urgentCount), icon: <Flash size={16} color="#f87171" />,              color: '#f87171'       },
            { label: 'New requests',     val: String(MOCK_REQUESTS.length), icon: <MessageCircle size={16} color="#60a5fa" />, color: '#60a5fa'   },
            { label: 'Avg satisfaction', val: '4.9',               icon: <Star1 size={16} color="#fbbf24" />,              color: '#fbbf24'       },
          ].map(s => (
            <div key={s.label} style={{
              padding: '16px 18px', borderRadius: 14,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: '4px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
          {(['clients', 'requests', 'stats'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: tab === t ? 'rgba(255,255,255,0.07)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text-4)',
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              textTransform: 'capitalize', transition: 'all 0.15s',
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Clients tab */}
        {tab === 'clients' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_CLIENTS.map(c => {
              const meta = STATUS_META[c.status]
              return (
                <div key={c.id} style={{
                  padding: '18px 20px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.02)', border: `1px solid ${c.urgent ? 'rgba(248,113,113,0.18)' : 'rgba(255,255,255,0.07)'}`,
                  display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(79,142,240,0.12)', border: '1px solid rgba(79,142,240,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0,
                  }}>
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-4)' }}>Age {c.age}</span>
                      {c.urgent && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171', background: 'rgba(248,113,113,0.08)', padding: '1px 7px', borderRadius: 100, border: '1px solid rgba(248,113,113,0.2)' }}>Urgent</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 2 }}>{c.need}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Next: {c.nextStep}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 100,
                      color: meta.color, background: meta.bg, border: `1px solid ${meta.color}20`,
                    }}>{meta.label}</span>
                    <div style={{ fontSize: 10, color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={9} color="currentColor" />
                      {new Date(c.lastContact).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              )
            })}
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px',
              borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)', background: 'transparent',
              cursor: 'pointer', color: 'var(--text-4)', fontSize: 13, fontFamily: 'inherit',
              marginTop: 4,
            }}>
              <Add size={14} color="currentColor" /> Add a new client manually
            </button>
          </div>
        )}

        {/* Requests tab */}
        {tab === 'requests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 4 }}>New client match requests waiting for a CHW in your area and language profile.</p>
            {MOCK_REQUESTS.map(r => {
              const accepted = acceptedIds.has(r.id)
              const urg = URGENCY_META[r.urgency]
              return (
                <div key={r.id} style={{
                  padding: '18px 20px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(96,165,250,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#60a5fa', flexShrink: 0,
                  }}>
                    {r.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: urg.color, background: `${urg.color}0F`, padding: '1px 7px', borderRadius: 100 }}>{urg.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 2 }}>{r.need}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Language: {r.lang} · Posted {r.postedMins < 60 ? `${r.postedMins}m` : `${Math.round(r.postedMins / 60)}h`} ago</div>
                  </div>
                  {accepted ? (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <TickCircle size={13} color="#34d399" variant="Bold" /> Accepted
                    </span>
                  ) : (
                    <button onClick={() => accept(r.id)} style={{
                      padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                      background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                    }}>
                      Accept
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Stats tab */}
        {tab === 'stats' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Total clients served', val: '47',  sub: 'Lifetime',    icon: <Profile2User size={18} color="var(--accent)" /> },
                { label: 'Clients enrolled in coverage', val: '31', sub: '66% conversion', icon: <TickCircle size={18} color="#34d399" /> },
                { label: 'Avg sessions per client', val: '3.2', sub: 'Per engagement', icon: <Calendar size={18} color="#60a5fa" /> },
                { label: 'Satisfaction score', val: '4.9/5', sub: 'From 38 ratings', icon: <Heart size={18} color="#f472b6" /> },
                { label: 'Estimated savings unlocked', val: '$148k', sub: 'For your clients', icon: <TrendUp size={18} color="#fbbf24" /> },
              ].map(s => (
                <div key={s.label} style={{
                  padding: '20px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 2 }}>{s.val}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Progress toward goals */}
            <div style={{ padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Monthly goals</h3>
              {[
                { label: 'New clients engaged', cur: 5, target: 8, color: 'var(--accent)' },
                { label: 'Insurance enrollments', cur: 3, target: 5, color: '#34d399'      },
                { label: 'Follow-up contacts',    cur: 11, target: 12, color: '#60a5fa'    },
              ].map(g => (
                <div key={g.label} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{g.label}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-4)' }}>{g.cur}/{g.target}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (g.cur / g.target) * 100)}%`, borderRadius: 3, background: g.color, transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
