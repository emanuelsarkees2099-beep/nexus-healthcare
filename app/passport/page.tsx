'use client'
import React, { useState, useRef } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { Shield, Plus, Pill, AlertTriangle, Heart, User, Download, Share2, QrCode, Lock, Eye, EyeOff, ChevronRight, CheckCircle, X } from 'lucide-react'

type Allergy = { name: string; severity: 'mild' | 'moderate' | 'severe' }
type Medication = { name: string; dose: string; frequency: string }
type Condition = { name: string; since: string }

type Passport = {
  name: string
  dob: string
  bloodType: string
  allergies: Allergy[]
  medications: Medication[]
  conditions: Condition[]
  emergencyContact: { name: string; phone: string; relation: string }
  lastUpdated: string
}

const DEMO_PASSPORT: Passport = {
  name: 'Maria G.',
  dob: '1985',
  bloodType: 'O+',
  allergies: [
    { name: 'Penicillin', severity: 'severe' },
    { name: 'Sulfa drugs', severity: 'moderate' },
  ],
  medications: [
    { name: 'Metformin', dose: '500mg', frequency: 'Twice daily' },
    { name: 'Lisinopril', dose: '10mg', frequency: 'Once daily' },
  ],
  conditions: [
    { name: 'Type 2 Diabetes', since: '2019' },
    { name: 'Hypertension', since: '2021' },
  ],
  emergencyContact: { name: 'Rosa G.', phone: '(602) 555-0142', relation: 'Sister' },
  lastUpdated: 'April 2026',
}

const severityColors: Record<string, { color: string; bg: string; border: string }> = {
  mild: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
  moderate: { color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.25)' },
  severe: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.35)' },
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: '18px', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)',
        }}>
          {icon}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#eef4f5' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  )
}

function AddModal({ onClose, onAdd }: { onClose: () => void; onAdd: (item: string) => void }) {
  const [val, setVal] = useState('')
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
    }} onClick={onClose}>
      <div style={{
        background: '#0d1117', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '420px',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700 }}>Add entry</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
            <X size={18} />
          </button>
        </div>
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="Type here…"
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#f5f5f5', fontSize: '14px', fontFamily: 'inherit',
            outline: 'none', boxSizing: 'border-box', marginBottom: '16px',
          }}
          onKeyDown={e => { if (e.key === 'Enter' && val.trim()) { onAdd(val.trim()); onClose() } }}
        />
        <button
          onClick={() => { if (val.trim()) { onAdd(val.trim()); onClose() } }}
          style={{
            width: '100%', padding: '12px', borderRadius: '12px',
            background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.25)',
            color: 'var(--accent)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Add
        </button>
      </div>
    </div>
  )
}

export default function PassportPage() {
  const [passport] = useState<Passport>(DEMO_PASSPORT)
  const [showQR, setShowQR] = useState(false)
  const [masked, setMasked] = useState(false)
  const [addModal, setAddModal] = useState<null | string>(null)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <AppShell>
      <style>{`
        .passport-field:focus { outline: none; border-color: rgba(110,231,183,0.4) !important; }
        @keyframes qr-appear { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {addModal && (
        <AddModal
          onClose={() => setAddModal(null)}
          onAdd={(_item) => { /* would update state */ }}
        />
      )}

      {/* Header */}
      <section style={{
        padding: 'clamp(80px,10vw,120px) 24px 40px',
        textAlign: 'center', position: 'relative',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(110,231,183,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.2)',
          marginBottom: '24px', fontSize: '11px', fontWeight: 600,
          color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <Shield size={11} /> Health Passport
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 50px)', fontWeight: 800,
          letterSpacing: '-0.035em', lineHeight: 1.05, marginBottom: '16px',
          maxWidth: '580px', margin: '0 auto 16px',
        }}>
          Your health, in your pocket.<br />
          <span style={{ color: 'var(--accent)' }}>You hold the key.</span>
        </h1>
        <p style={{
          fontSize: '15px', color: 'rgba(255,255,255,0.45)',
          maxWidth: '440px', lineHeight: 1.7, margin: '0 auto 16px',
        }}>
          Store your allergies, medications, and conditions. Generate a one-page summary for any clinic visit. End-to-end encrypted — NEXUS cannot read your data.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', color: 'rgba(255,255,255,0.3)',
        }}>
          <Lock size={11} /> End-to-end encrypted · Stored on your device only
        </div>
      </section>

      {/* Passport Card */}
      <section style={{ padding: '0 24px 80px', maxWidth: '780px', margin: '0 auto' }}>
        {/* Card header */}
        <div style={{
          padding: '20px 24px', borderRadius: '20px 20px 0 0',
          background: 'linear-gradient(135deg, rgba(110,231,183,0.12), rgba(129,140,248,0.08))',
          border: '1px solid rgba(110,231,183,0.2)', borderBottom: 'none',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>
              Health Passport
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{masked ? '••••• •.' : passport.name}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              Born {masked ? '••••' : passport.dob} · Blood type: <span style={{ color: '#f87171', fontWeight: 700 }}>{passport.bloodType}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setMasked(!masked)}
              style={{
                padding: '7px 14px', borderRadius: '100px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {masked ? <Eye size={12} /> : <EyeOff size={12} />}
              {masked ? 'Unmask' : 'Mask data'}
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              style={{
                padding: '7px 14px', borderRadius: '100px', cursor: 'pointer',
                background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.25)',
                color: 'var(--accent)', fontSize: '12px', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <QrCode size={12} /> {showQR ? 'Hide QR' : 'Clinic QR code'}
            </button>
          </div>
        </div>

        {/* QR Code panel */}
        {showQR && (
          <div style={{
            borderLeft: '1px solid rgba(110,231,183,0.2)', borderRight: '1px solid rgba(110,231,183,0.2)',
            background: 'rgba(110,231,183,0.03)', padding: '28px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
            animation: 'qr-appear 0.3s ease both',
          }}>
            {/* Simulated QR */}
            <div style={{
              width: '160px', height: '160px', borderRadius: '12px', padding: '12px',
              background: '#fff', display: 'grid',
              gridTemplateColumns: 'repeat(12,1fr)', gap: '2px',
            }}>
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} style={{
                  borderRadius: '1px',
                  background: Math.random() > 0.5 ? '#000' : '#fff',
                  aspectRatio: '1',
                }} />
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                Show this at clinic check-in
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', maxWidth: '300px', lineHeight: 1.6 }}>
                Clinic staff can scan to see your allergies and medications instantly. Link expires in 24 hours.
              </div>
            </div>
          </div>
        )}

        {/* Passport sections */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '0',
          border: '1px solid rgba(255,255,255,0.07)',
          borderTop: showQR ? '1px solid rgba(255,255,255,0.07)' : 'none',
          borderRadius: showQR ? '0 0 20px 20px' : '0',
          overflow: 'hidden',
        }}>
          {/* Allergies */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={14} color="#f87171" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Allergies</span>
              </div>
              <button
                onClick={() => setAddModal('allergy')}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  padding: '4px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '12px',
                  cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <Plus size={11} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {passport.allergies.map(a => (
                <div key={a.name} style={{
                  padding: '5px 12px', borderRadius: '100px',
                  background: severityColors[a.severity].bg,
                  border: `1px solid ${severityColors[a.severity].border}`,
                  fontSize: '12px', fontWeight: 600, color: severityColors[a.severity].color,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <AlertTriangle size={10} />
                  {masked ? '••••••' : a.name}
                  <span style={{ opacity: 0.6, fontWeight: 400, textTransform: 'capitalize' }}>({a.severity})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={14} color="#818cf8" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Current medications</span>
              </div>
              <button
                onClick={() => setAddModal('medication')}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  padding: '4px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '12px',
                  cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <Plus size={11} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {passport.medications.map(m => (
                <div key={m.name} style={{
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.15)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#c7d2fe' }}>
                    {masked ? '•••••••••' : m.name}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {masked ? '••••' : `${m.dose} · ${m.frequency}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={14} color="#f472b6" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Medical conditions</span>
              </div>
              <button
                onClick={() => setAddModal('condition')}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  padding: '4px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '12px',
                  cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <Plus size={11} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {passport.conditions.map(c => (
                <div key={c.name} style={{
                  padding: '6px 14px', borderRadius: '100px',
                  background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.2)',
                  fontSize: '13px', color: '#f9a8d4',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  {masked ? '•••••••••' : c.name}
                  <span style={{ opacity: 0.5, fontSize: '11px' }}>since {c.since}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency contact */}
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <User size={14} color="#fbbf24" />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Emergency contact</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.18)',
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {masked ? '••••• •.' : passport.emergencyContact.name}
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginLeft: '8px' }}>
                    ({passport.emergencyContact.relation})
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                  {masked ? '(•••) •••-••••' : passport.emergencyContact.phone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '11px 22px', borderRadius: '100px',
              background: saved ? 'rgba(74,222,128,0.12)' : 'rgba(110,231,183,0.1)',
              border: `1px solid ${saved ? 'rgba(74,222,128,0.3)' : 'rgba(110,231,183,0.25)'}`,
              color: saved ? '#4ade80' : 'var(--accent)', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
            }}
          >
            {saved ? <><CheckCircle size={13} /> Saved!</> : 'Save passport'}
          </button>
          <button style={{
            padding: '11px 22px', borderRadius: '100px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', fontSize: '13px',
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Download size={13} /> Download PDF
          </button>
          <button style={{
            padding: '11px 22px', borderRadius: '100px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', fontSize: '13px',
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Share2 size={13} /> Share with caregiver
          </button>
        </div>

        {/* Security callout */}
        <div style={{
          marginTop: '32px', padding: '20px 24px', borderRadius: '16px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: '16px', alignItems: 'flex-start',
        }}>
          <Lock size={16} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>How your data is protected</div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>
              Your Health Passport is encrypted on your device before it ever reaches our servers. We use AES-256 encryption with a key only you hold. NEXUS employees cannot read your health data — even if we wanted to. You can delete your passport at any time, permanently.
            </p>
            <Link href="/privacy" style={{
              fontSize: '12px', color: 'var(--accent)', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px',
            }}>
              Full privacy policy <ChevronRight size={11} />
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
