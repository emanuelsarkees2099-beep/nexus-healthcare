'use client'
import React, { useState, useRef } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { DocumentUpload, Shield, ArrowLeft2, TickCircle, Danger, Flash, DocumentText, InfoCircle, CloseCircle } from 'iconsax-react'

export const dynamic = 'force-dynamic'

const FILE_TYPES = ['Insurance Card', 'Lab Results', 'Discharge Summary', 'Vaccination Record', 'Prior Authorization', 'Prescription', 'Other']

type UploadState = 'idle' | 'uploading' | 'extracting' | 'done' | 'error'
type Confidence = 'high' | 'medium' | 'low'
type ExtractedField = { label: string; value: string; confidence: Confidence }

const MOCK_EXTRACTED: Record<string, ExtractedField[]> = {
  'Insurance Card': [
    { label: 'Member ID', value: 'XYZ123456789', confidence: 'high' },
    { label: 'Group Number', value: '78542', confidence: 'high' },
    { label: 'Plan Name', value: 'BlueCross BlueShield PPO', confidence: 'high' },
    { label: 'Effective Date', value: '01/01/2026', confidence: 'medium' },
    { label: 'Copay (Primary)', value: '$25', confidence: 'medium' },
    { label: 'Copay (Specialist)', value: '$50', confidence: 'medium' },
  ],
  'Lab Results': [
    { label: 'HbA1c', value: '7.2%', confidence: 'high' },
    { label: 'Glucose (fasting)', value: '118 mg/dL', confidence: 'high' },
    { label: 'LDL Cholesterol', value: '142 mg/dL', confidence: 'high' },
    { label: 'Test Date', value: 'March 14, 2026', confidence: 'high' },
    { label: 'Ordering Provider', value: 'Dr. Santos, Maria R.', confidence: 'medium' },
  ],
  'Vaccination Record': [
    { label: 'COVID-19', value: 'Moderna — 3 doses', confidence: 'high' },
    { label: 'Influenza', value: 'Seasonal — Oct 2025', confidence: 'high' },
    { label: 'Hepatitis B', value: 'Series complete', confidence: 'medium' },
    { label: 'Tdap', value: '2022', confidence: 'medium' },
  ],
  'Discharge Summary': [
    { label: 'Facility', value: 'St. Mary\'s Medical Center', confidence: 'high' },
    { label: 'Admit Date', value: 'April 2, 2026', confidence: 'high' },
    { label: 'Discharge Date', value: 'April 4, 2026', confidence: 'high' },
    { label: 'Diagnosis', value: 'Acute appendicitis', confidence: 'medium' },
    { label: 'Follow-up', value: 'PCP in 1 week', confidence: 'low' },
  ],
}

const CONF_META: Record<Confidence, { color: string; label: string }> = {
  high:   { color: '#34d399', label: 'High confidence' },
  medium: { color: '#fbbf24', label: 'Review recommended' },
  low:    { color: '#f87171', label: 'Verify manually' },
}

const STATE_MESSAGES: Record<UploadState, string> = {
  idle:       '',
  uploading:  'Uploading securely…',
  extracting: 'Extracting fields with AI…',
  done:       'Extraction complete',
  error:      'Something went wrong. Please try again.',
}

export default function PassportUploadPage() {
  const [docType, setDocType]   = useState(FILE_TYPES[0])
  const [file, setFile]         = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [state, setState]       = useState<UploadState>('idle')
  const [extracted, setExtracted] = useState<ExtractedField[] | null>(null)
  const [saved, setSaved]       = useState<Set<string>>(new Set())
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setState('idle')
    setExtracted(null)
    setSaved(new Set())
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleExtract = async () => {
    if (!file) return
    setState('uploading')
    await new Promise(r => setTimeout(r, 900))
    setState('extracting')
    await new Promise(r => setTimeout(r, 1800))
    // Stub: production sends FormData to /api/passport/extract which calls Anthropic claude-sonnet-4-6
    const fields: ExtractedField[] = MOCK_EXTRACTED[docType] ?? [
      { label: 'Document Type', value: docType, confidence: 'high' },
      { label: 'Date Processed', value: new Date().toLocaleDateString(), confidence: 'medium' },
      { label: 'Note', value: 'Manual review recommended for this document type', confidence: 'low' },
    ]
    setExtracted(fields)
    setState('done')
  }

  const handleSave = (label: string) => {
    setSaved(prev => new Set([...prev, label]))
    // Production: merges into nexus_passport localStorage key and syncs to passport page
  }

  const handleSaveAll = () => {
    if (!extracted) return
    setSaved(new Set(extracted.map(f => f.label)))
  }

  const isProcessing = state === 'uploading' || state === 'extracting'

  return (
    <AppShell>
      <style>{`
        .upload-zone { transition: border-color 0.2s, background 0.2s; }
        .upload-zone:hover { border-color: rgba(74,144,217,0.4) !important; background: rgba(74,144,217,0.04) !important; }
        .field-row { transition: background 0.15s; }
        .field-row:hover { background: rgba(255,255,255,0.03) !important; }
        @keyframes pulse-ring { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* Header */}
      <section style={{ padding: 'clamp(80px,10vw,110px) 24px 40px', textAlign: 'center', position: 'relative', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(74,144,217,0.06) 0%, transparent 70%)' }}>
        <Link
          href="/passport"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: 28 }}
        >
          <ArrowLeft2 size={13} /> Back to Health Passport
        </Link>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)', fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
          <Shield size={11} /> Upload Health Records
        </div>
        <h1 style={{ fontSize: 'clamp(26px,5vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 14 }}>
          Import any health document.<br />
          <span style={{ color: 'var(--accent)' }}>AI extracts the key fields.</span>
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto 16px', lineHeight: 1.7 }}>
          Upload insurance cards, lab results, or discharge summaries. We extract the important data and let you save it directly to your Health Passport.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          <InfoCircle size={11} color="rgba(255,255,255,0.3)" />
          Files never leave your device in this preview — extraction runs locally
        </div>
      </section>

      {/* Main upload card */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Document type selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
            Document Type
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FILE_TYPES.map(t => (
              <button
                key={t}
                onClick={() => { setDocType(t); setExtracted(null); setState('idle') }}
                style={{
                  padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                  fontFamily: 'inherit', cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                  background: docType === t ? 'rgba(74,144,217,0.12)' : 'transparent',
                  borderColor: docType === t ? 'rgba(74,144,217,0.4)' : 'rgba(255,255,255,0.1)',
                  color: docType === t ? 'var(--accent)' : 'rgba(255,255,255,0.45)',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Drop zone */}
        <div
          className="upload-zone"
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            borderRadius: 20, border: `2px dashed ${dragOver ? 'rgba(74,144,217,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: dragOver ? 'rgba(74,144,217,0.05)' : 'rgba(255,255,255,0.01)',
            padding: '48px 32px', textAlign: 'center', cursor: 'pointer', marginBottom: 20,
          }}
          role="button"
          aria-label="Upload health document — click or drag and drop"
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.heic"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.2)',
              animation: dragOver ? 'pulse-ring 1s ease infinite' : 'none',
            }}>
              <DocumentUpload size={24} color="var(--accent)" />
            </div>
          </div>
          {file ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{file.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{(file.size / 1024).toFixed(0)} KB · Click to replace</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Drop a file here or click to browse</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>PDF, JPG, PNG, HEIC — up to 10 MB</div>
            </div>
          )}
        </div>

        {/* Extract button */}
        <button
          onClick={handleExtract}
          disabled={!file || isProcessing}
          style={{
            width: '100%', padding: '14px 24px', borderRadius: 14, border: 'none',
            background: !file || isProcessing ? 'rgba(255,255,255,0.06)' : 'rgba(74,144,217,0.15)',
            borderWidth: 1, borderStyle: 'solid',
            borderColor: !file || isProcessing ? 'rgba(255,255,255,0.08)' : 'rgba(74,144,217,0.35)',
            color: !file || isProcessing ? 'rgba(255,255,255,0.3)' : 'var(--accent)',
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: !file || isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s',
          }}
        >
          {isProcessing ? (
            <>
              <div style={{ width: 14, height: 14, border: '2px solid rgba(74,144,217,0.3)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              {STATE_MESSAGES[state]}
            </>
          ) : (
            <>
              <Flash size={16} color={!file ? 'rgba(255,255,255,0.3)' : 'var(--accent)'} />
              Extract fields with AI
            </>
          )}
        </button>

        {/* Privacy note */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 12, background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.12)', marginTop: 14 }}>
          <Shield size={13} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11.5, color: 'rgba(52,211,153,0.7)', margin: 0, lineHeight: 1.6 }}>
            <strong>Your data stays on your device.</strong> In production, extraction runs via an encrypted tunnel using Claude claude-sonnet-4-6. NEXUS never stores your raw documents.
          </p>
        </div>

        {/* Extracted fields */}
        {state === 'done' && extracted && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DocumentText size={15} color="var(--accent)" />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Extracted from {docType}</span>
              </div>
              <button
                onClick={handleSaveAll}
                style={{
                  padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                  background: saved.size === extracted.length ? 'rgba(52,211,153,0.1)' : 'rgba(74,144,217,0.1)',
                  border: `1px solid ${saved.size === extracted.length ? 'rgba(52,211,153,0.25)' : 'rgba(74,144,217,0.25)'}`,
                  color: saved.size === extracted.length ? '#34d399' : 'var(--accent)',
                  fontFamily: 'inherit', cursor: 'pointer',
                }}
              >
                {saved.size === extracted.length ? 'All saved ✓' : 'Save all to Passport'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
              {extracted.map((field, i) => {
                const meta = CONF_META[field.confidence]
                const isSaved = saved.has(field.label)
                return (
                  <div
                    key={field.label}
                    className="field-row"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                      borderBottom: i < extracted.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {field.label}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {field.value}
                      </div>
                    </div>
                    <span
                      style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, flexShrink: 0,
                        background: `${meta.color}14`, color: meta.color, border: `1px solid ${meta.color}30` }}
                      title={meta.label}
                    >
                      {field.confidence}
                    </span>
                    <button
                      onClick={() => handleSave(field.label)}
                      style={{
                        flexShrink: 0, padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: isSaved ? 'rgba(52,211,153,0.08)' : 'rgba(74,144,217,0.08)',
                        border: `1px solid ${isSaved ? 'rgba(52,211,153,0.2)' : 'rgba(74,144,217,0.2)'}`,
                        color: isSaved ? '#34d399' : 'var(--accent)',
                        fontFamily: 'inherit', cursor: isSaved ? 'default' : 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {isSaved ? <TickCircle size={12} color="#34d399" variant="Bold" /> : 'Save'}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Low-confidence warning */}
            {extracted.some(f => f.confidence === 'low') && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '11px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)', marginTop: 12 }}>
                <Danger size={13} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: 'rgba(248,113,113,0.8)', margin: 0, lineHeight: 1.6 }}>
                  Some fields have low confidence — please verify them against your original document before saving.
                </p>
              </div>
            )}

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <Link
                href="/passport"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 24px', borderRadius: 12, background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.25)', color: 'var(--accent)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
              >
                View my Health Passport
              </Link>
            </div>
          </div>
        )}

        {/* Error state */}
        {state === 'error' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 16px', borderRadius: 12, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', marginTop: 16 }}>
            <CloseCircle size={15} color="#f87171" />
            <span style={{ fontSize: 13, color: '#f87171' }}>Extraction failed. Please try again or use a clearer image.</span>
          </div>
        )}
      </section>
    </AppShell>
  )
}
