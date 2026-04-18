'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  ts: number
}

const WELCOME: Message = {
  role: 'assistant',
  content: "Hi! I'm the NEXUS health navigator. I can help you find free clinics, understand programs like Medicaid or ACA subsidies, and navigate healthcare without insurance. What do you need help with?",
  ts: Date.now(),
}

const SUGGESTED = [
  'Find free clinics near me',
  'Do I qualify for Medicaid?',
  'How does sliding-scale cost work?',
  'What is an FQHC?',
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [hasOpened, setHasOpened] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0)
      setHasOpened(true)
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const historyForAPI = messages
        .filter(m => m.role !== 'assistant' || m.ts !== WELCOME.ts)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, messages: historyForAPI }),
      })
      const data = await res.json() as { reply?: string }
      const reply = data.reply || "Sorry, I couldn't reach the server. Please try again."

      const assistantMsg: Message = { role: 'assistant', content: reply, ts: Date.now() }
      setMessages(prev => [...prev, assistantMsg])
      if (!open) setUnread(u => u + 1)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting. For immediate help, call **211** or visit **/search** to find free clinics.",
        ts: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }, [messages, loading, open])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // Simple markdown-ish: bold, links, line breaks
  function renderContent(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\/\w+)/g)
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
      if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>
      if (/^\/\w+/.test(p)) return <a key={i} href={p} style={{ color: '#6d9197', textDecoration: 'underline' }}>{p}</a>
      return p.split('\n').map((line, j) => j === 0 ? line : [<br key={j} />, line])
    })
  }

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        aria-label={open ? 'Close health navigator' : 'Open health navigator'}
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 900,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: open ? 'rgba(10,10,22,0.95)' : 'rgba(255,255,255,0.93)',
          border: open ? '1px solid rgba(255,255,255,0.12)' : 'none',
          boxShadow: open ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          transform: open ? 'scale(0.92)' : 'scale(1)',
          color: open ? 'rgba(255,255,255,0.7)' : '#08081a',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.transform = 'scale(1)' }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#4ade80', color: '#07070F',
            borderRadius: '50%', width: '18px', height: '18px',
            fontSize: '10px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-inter)',
          }}>{unread}</span>
        )}
        {/* Pulse ring for first-time users */}
        {!hasOpened && !open && (
          <span style={{
            position: 'absolute', inset: '-4px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.35)',
            animation: 'chat-ping 2s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        )}
      </button>

      {/* ── Chat panel ── */}
      <div
        role="dialog"
        aria-label="NEXUS Health Navigator"
        aria-hidden={!open}
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '24px',
          width: '360px',
          maxWidth: 'calc(100vw - 32px)',
          height: '520px',
          maxHeight: 'calc(100dvh - 120px)',
          zIndex: 899,
          background: 'rgba(8,8,18,0.97)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(12px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transformOrigin: 'bottom right',
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6d9197, #4ade80)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#07070F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-inter)' }}>
              NEXUS Health Navigator
            </div>
            <div style={{ fontSize: '11px', color: '#4ade80', fontFamily: 'var(--font-inter)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80' }} />
              Online · Healthcare navigation only
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-inter)', textAlign: 'right', lineHeight: 1.4 }}>
            Not medical<br/>advice
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.08) transparent',
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: '8px',
              alignItems: 'flex-end',
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6d9197, #4ade80)',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#07070F" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
              )}
              <div style={{
                maxWidth: '80%',
                padding: '10px 13px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? 'rgba(255,255,255,0.09)' : 'rgba(109,145,151,0.1)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(109,145,151,0.2)'}`,
                fontSize: '13px',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.6,
                fontFamily: 'var(--font-inter)',
                wordBreak: 'break-word',
              }}>
                {renderContent(msg.content)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #6d9197, #4ade80)', flexShrink: 0 }} />
              <div style={{ padding: '10px 14px', background: 'rgba(109,145,151,0.1)', border: '1px solid rgba(109,145,151,0.2)', borderRadius: '14px 14px 14px 4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: '#6d9197', display: 'block',
                    animation: `chat-bounce 1.1s ease-in-out ${i * 0.18}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Suggestions (only when just the welcome message) */}
          {messages.length === 1 && !loading && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => sendMessage(s)} style={{
                  padding: '6px 12px',
                  borderRadius: '100px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                  transition: 'all 0.18s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,145,151,0.15)'; e.currentTarget.style.color = '#eef4f5'; e.currentTarget.style.borderColor = 'rgba(109,145,151,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                >{s}</button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about free clinics, programs, costs…"
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '10px 14px',
              color: 'rgba(255,255,255,0.88)',
              fontSize: '13px',
              fontFamily: 'var(--font-inter)',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.5,
              maxHeight: '80px',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(109,145,151,0.4)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            onInput={e => {
              const el = e.target as HTMLTextAreaElement
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 80) + 'px'
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              background: input.trim() && !loading ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.06)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              color: input.trim() && !loading ? '#08081a' : 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: '8px 14px',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.18)',
          fontFamily: 'var(--font-inter)',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
          lineHeight: 1.5,
        }}>
          Not a medical provider. For emergencies call 911. For crisis support call 988.
        </div>
      </div>

      <style>{`
        @keyframes chat-ping {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes chat-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  )
}
