'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { CloseCircle, Send, MagicStar, Cpu, InfoCircle, ArrowDown2 } from 'iconsax-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  error?: boolean
}

const SUGGESTIONS = [
  'What free clinics are near me?',
  'Do I qualify for Medicaid?',
  'How does sliding-scale pricing work?',
  'I need free mental health care',
  'What is EMTALA?',
  'Find free dental care options',
]

const DISCLAIMER = `NEXUS Assistant helps you navigate healthcare access. It is not a medical provider and cannot diagnose conditions or prescribe treatments. For emergencies, call 911.`

export default function AIAssistant() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [mounted,  setMounted]  = useState(false)
  const [unread,   setUnread]   = useState(0)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const abortRef   = useRef<AbortController | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  /* #19 — Context injection: read current URL to seed assistant with page context */
  const getPageContext = useCallback((): string => {
    if (typeof window === 'undefined') return ''
    const url    = new URL(window.location.href)
    const path   = url.pathname
    const q      = url.searchParams.get('q')
    const loc    = url.searchParams.get('loc')
    const sym    = url.searchParams.get('symptom')

    if (path.startsWith('/search') && (q || loc)) {
      return `The user is currently on the search results page${q ? ` searching for "${q}"` : ''}${loc ? ` near ${loc}` : ''}. Tailor your response to help them find the right free clinic.`
    }
    if (path.startsWith('/triage') && sym) {
      return `The user is on the triage page with symptom: "${sym}". Help them understand what level of care they need.`
    }
    if (path.startsWith('/clinics/')) {
      return `The user is viewing a specific clinic detail page. They may have questions about services, affordability, or how to prepare for their visit.`
    }
    if (path.startsWith('/programs') || path.startsWith('/eligibility')) {
      return `The user is exploring healthcare assistance programs. Help them understand eligibility and how to apply.`
    }
    if (path.startsWith('/crisis')) {
      return `The user is on the crisis resources page. They may be in a vulnerable state. Be especially compassionate and provide immediate actionable resources. Always mention 988 (Suicide & Crisis Lifeline) and 911 for emergencies.`
    }
    return ''
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    abortRef.current = new AbortController()

    // Build context-injected system hint
    const pageContext = getPageContext()

    try {
      const res = await fetch('/api/ai', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          // #19: inject page context as a system hint for this request
          ...(pageContext ? { pageContext } : {}),
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }))
        setMessages(prev =>
          prev.map(m => m.id === assistantId
            ? { ...m, content: data.error ?? 'Sorry, something went wrong. Please try again.', error: true }
            : m
          )
        )
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) { setLoading(false); return }

      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const json = line.slice(6).trim()
          if (!json) continue
          try {
            const payload = JSON.parse(json)
            if (payload.delta) {
              fullText += payload.delta
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: fullText } : m)
              )
            }
            if (payload.error) {
              setMessages(prev =>
                prev.map(m => m.id === assistantId
                  ? { ...m, content: payload.error, error: true }
                  : m
                )
              )
            }
            if (payload.done) break
          } catch { /* malformed chunk */ }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setMessages(prev =>
        prev.map(m => m.id === assistantId
          ? { ...m, content: 'Connection lost. Please try again.', error: true }
          : m
        )
      )
    } finally {
      setLoading(false)
      if (!open) setUnread(u => u + 1)
    }
  }, [loading, messages, open, getPageContext])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (!mounted) return null

  return (
    <>
      <style>{`
        .ai-chat-panel {
          position: fixed;
          bottom: 86px; right: 24px;
          width: min(400px, calc(100vw - 48px));
          height: min(540px, calc(100dvh - 120px));
          z-index: 9996;
          border-radius: 20px;
          display: flex; flex-direction: column;
          background: rgba(4,4,8,0.96);
          border: 1px solid rgba(74,144,217,0.22);
          box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(74,144,217,0.08);
          backdrop-filter: blur(24px);
          animation: ai-panel-in 0.28s cubic-bezier(0.16,1,0.3,1) both;
          overflow: hidden;
        }
        @keyframes ai-panel-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .ai-fab {
          position: fixed; bottom: 24px; right: 78px;
          z-index: 9997;
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent,#4A8FD4), rgba(74,144,217,0.7));
          border: 1px solid rgba(74,144,217,0.4);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #fff;
          box-shadow: 0 4px 20px rgba(74,144,217,0.35), 0 2px 8px rgba(0,0,0,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          animation: ai-fab-pulse 3s ease-in-out infinite;
        }
        .ai-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(74,144,217,0.5); }
        @keyframes ai-fab-pulse {
          0%,100% { box-shadow: 0 4px 20px rgba(74,144,217,0.35), 0 2px 8px rgba(0,0,0,0.4); }
          50%     { box-shadow: 0 4px 28px rgba(74,144,217,0.55), 0 2px 8px rgba(0,0,0,0.4); }
        }
        .ai-msg-user {
          align-self: flex-end; max-width: 82%;
          padding: 10px 14px; border-radius: 14px 14px 4px 14px;
          background: rgba(74,144,217,0.15); border: 1px solid rgba(74,144,217,0.25);
          color: var(--text,#e8eaf0); font-size: 14px; line-height: 1.55;
          font-family: var(--font-inter); white-space: pre-wrap; word-break: break-word;
        }
        .ai-msg-assistant {
          align-self: flex-start; max-width: 88%;
          padding: 10px 14px; border-radius: 14px 14px 14px 4px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          color: var(--text,#e8eaf0); font-size: 14px; line-height: 1.6;
          font-family: var(--font-inter); white-space: pre-wrap; word-break: break-word;
        }
        .ai-msg-error { border-color: rgba(248,113,113,0.3) !important; color: #f87171 !important; }
        .ai-cursor { display: inline-block; width: 2px; height: 14px; background: var(--accent,#4A8FD4); animation: ai-blink 0.8s ease-in-out infinite; vertical-align: text-bottom; margin-left: 2px; border-radius: 1px; }
        @keyframes ai-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .ai-suggestion-chip {
          padding: 5px 12px; border-radius: 100px;
          background: rgba(74,144,217,0.06); border: 1px solid rgba(74,144,217,0.18);
          color: rgba(255,255,255,0.65); font-size: 12px; font-family: var(--font-inter);
          cursor: pointer; white-space: nowrap;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .ai-suggestion-chip:hover { background: rgba(74,144,217,0.14); color: var(--accent,#4A8FD4); border-color: rgba(74,144,217,0.3); }
      `}</style>

      {/* FAB toggle button */}
      <button
        className="ai-fab"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close healthcare navigator' : 'Open healthcare navigator'}
        aria-expanded={open}
      >
        {open ? <ArrowDown2 size={18} variant="Linear" color="#fff" /> : <MagicStar size={18} variant="Linear" color="#fff" />}
        {unread > 0 && !open && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 18, height: 18, borderRadius: '50%',
            background: '#f87171', color: '#fff',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-inter)',
          }} aria-label={`${unread} unread message`}>
            {unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="ai-chat-panel" role="dialog" aria-label="NEXUS AI Healthcare Navigator" aria-modal="true">
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', gap: '10px',
            flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent,#4A8FD4), rgba(74,144,217,0.6))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Cpu size={16} color="#fff" variant="Linear" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-inter)' }}>
                NEXUS Navigator
              </div>
              <div style={{ fontSize: 10, color: 'var(--accent,#4A8FD4)', fontFamily: 'var(--font-inter)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Healthcare Access Guide
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4, display: 'flex', borderRadius: 6, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
            >
              <CloseCircle size={16} variant="Linear" color="rgba(255,255,255,0.35)" />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(74,144,217,0.15) transparent',
          }}>
            {/* Welcome + disclaimer */}
            {messages.length === 0 && (
              <>
                <div className="ai-msg-assistant">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <InfoCircle size={13} color="rgba(255,200,60,0.8)" variant="Linear" />
                    <span style={{ fontSize: 11, color: 'rgba(255,200,60,0.7)', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>Not medical advice</span>
                  </div>
                  {DISCLAIMER}
                </div>
                <div className="ai-msg-assistant">
                  Hi! I&apos;m the NEXUS Healthcare Navigator. I can help you find free clinics, understand program eligibility, navigate the healthcare system, and know your rights as a patient. How can I help you today?
                </div>
                {/* Quick suggestion chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 4 }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} className="ai-suggestion-chip" onClick={() => sendMessage(s)} type="button">
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={msg.role === 'user' ? 'ai-msg-user' : `ai-msg-assistant${msg.error ? ' ai-msg-error' : ''}`}
              >
                {msg.content}
                {/* Streaming cursor on last assistant message while loading */}
                {loading && i === messages.length - 1 && msg.role === 'assistant' && (
                  <span className="ai-cursor" aria-hidden="true" />
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', gap: 8, alignItems: 'flex-end',
            flexShrink: 0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about free clinics, programs, patient rights…"
              rows={1}
              aria-label="Message NEXUS Navigator"
              style={{
                flex: 1, resize: 'none',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 12, padding: '10px 14px',
                color: 'var(--text)', fontFamily: 'var(--font-inter)',
                fontSize: 14, outline: 'none',
                lineHeight: 1.5, maxHeight: 120,
                transition: 'border-color 0.2s',
                scrollbarWidth: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(74,144,217,0.35)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
              onInput={e => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: input.trim() && !loading ? 'var(--accent,#4A8FD4)' : 'rgba(255,255,255,0.05)',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: input.trim() && !loading ? '#07070F' : 'rgba(255,255,255,0.3)',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <Send size={15} variant="Linear" color={input.trim() && !loading ? '#07070F' : 'rgba(255,255,255,0.3)'} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
