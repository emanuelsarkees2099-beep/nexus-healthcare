'use client'
import React, { useState, useRef } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { Shield, AddCircle, Health, Danger, Heart, Profile, DocumentDownload, ExportSquare, Scan, Lock, Eye, EyeSlash, ArrowRight2, TickCircle, CloseCircle } from 'iconsax-react'

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
          background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)',
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
            <CloseCircle size={18} color="rgba(255,255,255,0.5)" />
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
            background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.25)',
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
  const [showQR,        setShowQR]        = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [masked, setMasked] = useState(false)
  const [addModal, setAddModal] = useState<null | string>(null)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handlePrint = () => window.print()

  /* QR code URL (shared between inline panel & fullscreen modal) */
  const qrLines = [
    'NEXUS Health Passport',
    `Name: ${masked ? 'HIDDEN' : passport.name}`,
    `Blood: ${passport.bloodType}`,
    `Allergies: ${masked ? 'HIDDEN' : passport.allergies.map(a => `${a.name}(${a.severity})`).join(', ') || 'None'}`,
    `Meds: ${masked ? 'HIDDEN' : passport.medications.map(m => `${m.name} ${m.dose} ${m.frequency}`).join(' | ') || 'None'}`,
    `Conditions: ${masked ? 'HIDDEN' : passport.conditions.map(c => c.name).join(', ') || 'None'}`,
    `Emergency: ${masked ? 'HIDDEN' : `${passport.emergencyContact.name} (${passport.emergencyContact.relation}) ${passport.emergencyContact.phone}`}`,
    `Updated: ${passport.lastUpdated}`,
    'nexus.health/passport',
  ].join('\n')
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&margin=10&data=${encodeURIComponent(qrLines)}`

  return (
    <AppShell>
      <style>{`
        .passport-field:focus { outline: none; border-color: rgba(74,144,217,0.4) !important; }
        @keyframes qr-appear { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes fullscreen-appear { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @media print {
          nav, footer, .no-print, button { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-section { display: block !important; }
        }
      `}</style>

      {/* #22 — Fullscreen QR modal (show at clinic) */}
      {showFullscreen && (
        <div
          role="dialog" aria-modal="true" aria-label="Show this at clinic check-in"
          style={{
            position: 'fixed', inset: 0, zIndex: 1500,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '32px',
          }}
          onClick={() => setShowFullscreen(false)}
        >
          <div
            style={{ textAlign: 'center', animation: 'fullscreen-appear 0.35s cubic-bezier(0.16,1,0.3,1) both' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
              Show to clinic staff
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&format=png&margin=12&data=${encodeURIComponent(qrLines)}`}
              alt="Health Passport QR Code for clinic check-in"
              width={280} height={280}
              style={{ borderRadius: '16px', display: 'block', margin: '0 auto 24px', background: 'white', padding: '8px' }}
            />
            <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              {masked ? '••••• •.' : passport.name}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '4px' }}>
              Blood type: <span style={{ color: '#f87171', fontWeight: 700 }}>{passport.bloodType}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', maxWidth: '320px', lineHeight: 1.6, marginBottom: '28px' }}>
              {masked ? '••••••••••••••••••••' : `Allergies: ${passport.allergies.map(a => a.name).join(', ') || 'None'}`}
            </div>
            <button
              onClick={() => setShowFullscreen(false)}
              style={{
                padding: '10px 28px', borderRadius: '100px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)',
                color: 'rgba(255,255,255,0.7)', fontSize: '14px', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

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
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(74,144,217,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)',
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
          <Lock size={11} color="rgba(255,255,255,0.45)" /> End-to-end encrypted · Stored on your device only
        </div>
      </section>

      {/* Passport Card */}
      <section style={{ padding: '0 24px 80px', maxWidth: '780px', margin: '0 auto' }}>
        {/* Card header */}
        <div style={{
          padding: '20px 24px', borderRadius: '20px 20px 0 0',
          background: 'linear-gradient(135deg, rgba(74,144,217,0.12), rgba(129,140,248,0.08))',
          border: '1px solid rgba(74,144,217,0.2)', borderBottom: 'none',
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
              {masked ? <Eye size={12} /> : <EyeSlash size={12} />}
              {masked ? 'Unmask' : 'Mask data'}
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              style={{
                padding: '7px 14px', borderRadius: '100px', cursor: 'pointer',
                background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.25)',
                color: 'var(--accent)', fontSize: '12px', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Scan size={12} /> {showQR ? 'Hide QR' : 'Clinic QR code'}
            </button>
          </div>
        </div>

        {/* QR Code panel */}
        {showQR && (
          <div style={{
            borderLeft: '1px solid rgba(74,144,217,0.2)', borderRight: '1px solid rgba(74,144,217,0.2)',
            background: 'rgba(74,144,217,0.03)', padding: '28px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
            animation: 'qr-appear 0.3s ease both',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="Health Passport QR Code — scan at clinic check-in"
              width={160} height={160}
              style={{ borderRadius: '10px', display: 'block', background: 'white', padding: '4px' }}
            />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                Show this at clinic check-in
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', maxWidth: '300px', lineHeight: 1.6, marginBottom: '12px' }}>
                Clinic staff can scan to see your allergies and medications instantly.
              </div>
              {/* #22 — Full-screen "show at clinic" mode */}
              <button
                onClick={() => setShowFullscreen(true)}
                style={{
                  padding: '8px 20px', borderRadius: '100px',
                  background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.25)',
                  color: 'var(--accent)', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}
              >
                <Scan size={11} /> Show full-screen at clinic
              </button>
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
                <Danger size={14} color="#f87171" />
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
                <AddCircle size={11} /> Add
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
                  <Danger size={10} />
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
                <Health size={14} color="#818cf8" />
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
                <AddCircle size={11} /> Add
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
                <AddCircle size={11} /> Add
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
              <Profile size={14} color="#fbbf24" />
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
              background: saved ? 'rgba(96,165,250,0.12)' : 'rgba(74,144,217,0.1)',
              border: `1px solid ${saved ? 'rgba(96,165,250,0.3)' : 'rgba(74,144,217,0.25)'}`,
              color: saved ? '#60a5fa' : 'var(--accent)', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
            }}
          >
            {saved ? <><TickCircle size={13} /> Saved!</> : 'Save passport'}
          </button>
          <button
            onClick={handlePrint}
            style={{
              padding: '11px 22px', borderRadius: '100px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', fontSize: '13px',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <DocumentDownload size={13} /> Print / Save PDF
          </button>
          <button style={{
            padding: '11px 22px', borderRadius: '100px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', fontSize: '13px',
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <ExportSquare size={13} /> Share with caregiver
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
              Full privacy policy <ArrowRight2 size={11} />
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
