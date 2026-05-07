'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/* ── Konami code detector ── */
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

/* ── Terminal commands ── */
const COMMANDS: Record<string, (args: string[], router: ReturnType<typeof useRouter>) => { output: string[]; navigate?: string }> = {
  help: () => ({
    output: [
      '╔══════════════════════════════════════════════════╗',
      '║  NEXUS Terminal v2.0 — Healthcare Command Line  ║',
      '╚══════════════════════════════════════════════════╝',
      '',
      '  search <zip>       Search clinics by ZIP code',
      '  triage             Open AI Triage Co-Pilot',
      '  gps                Open Healthcare GPS',
      '  crisis             Open Crisis Support',
      '  passport           Open Health Passport',
      '  community          Open Community Care Network',
      '  equity             Open Equity Lab',
      '  stats              Show NEXUS live stats',
      '  chws               Honor our CHW network',
      '  exit               Close terminal',
      '  clear              Clear screen',
    ],
  }),
  search: (args, router) => {
    const zip = args[0] || '85015'
    router.push(`/search?q=${zip}`)
    return { output: [`Searching for clinics near ${zip}…`, '→ Navigating to search results.'] }
  },
  triage: (_args, router) => {
    router.push('/triage')
    return { output: ['Opening AI Triage Co-Pilot…', '→ Describe your symptoms.'] }
  },
  gps: (_args, router) => {
    router.push('/gps')
    return { output: ['Opening Healthcare GPS…', '→ Turn-by-turn care navigation.'] }
  },
  crisis: (_args, router) => {
    router.push('/crisis')
    return { output: ['Opening Crisis Support…', '⚡ 988 · 741741 · 911'] }
  },
  passport: (_args, router) => {
    router.push('/passport')
    return { output: ['Opening Health Passport…', '→ Your encrypted health record.'] }
  },
  community: (_args, router) => {
    router.push('/community')
    return { output: ['Opening Community Care Network…', '→ Find rides, translators, and more.'] }
  },
  equity: (_args, router) => {
    router.push('/equity')
    return { output: ['Opening Healthcare Equity Lab…', '→ Interactive maps and data.'] }
  },
  stats: () => ({
    output: [
      '┌─────────────────────────────────┐',
      '│  NEXUS Live Stats               │',
      '├─────────────────────────────────┤',
      `│  Clinics indexed:    12,847      │`,
      `│  People helped:      284,193     │`,
      `│  States covered:     50          │`,
      `│  Languages:          48          │`,
      `│  Avg response time:  4hr refresh │`,
      `│  Cost to you:        $0.00       │`,
      '└─────────────────────────────────┘',
    ],
  }),
  chws: () => ({
    output: [
      '',
      '  ♥ ♥ ♥  Thank you to our 340 Community Health Workers  ♥ ♥ ♥',
      '',
      '  You navigate a broken system so others don\'t have to.',
      '  NEXUS is built around your knowledge, your relationships,',
      '  and your dedication to the communities nobody else serves.',
      '',
      '  You are the heart of this platform.',
      '',
    ],
  }),
  clear: () => ({ output: [] }),
}

export default function TerminalMode() {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<{ type: 'input' | 'output'; text: string }[]>([
    { type: 'output', text: '╔══════════════════════════════════════════════════╗' },
    { type: 'output', text: '║        NEXUS — Developer Terminal Mode           ║' },
    { type: 'output', text: '║  Type "help" for available commands              ║' },
    { type: 'output', text: '╚══════════════════════════════════════════════════╝' },
    { type: 'output', text: '' },
  ])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const konamiProgress = useRef(0)
  const router = useRouter()

  /* Konami code detector */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === KONAMI[konamiProgress.current]) {
        konamiProgress.current++
        if (konamiProgress.current === KONAMI.length) {
          konamiProgress.current = 0
          setOpen(true)
        }
      } else {
        konamiProgress.current = 0
      }
      /* Also open with ? key when not in an input */
      if (e.key === '?' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setOpen(true)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const execute = useCallback((cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    setHistory(prev => [...prev, { type: 'input', text: `nexus@health:~$ ${trimmed}` }])
    setCmdHistory(prev => [trimmed, ...prev])
    setHistoryIdx(-1)

    const [name, ...args] = trimmed.toLowerCase().split(/\s+/)

    if (name === 'exit') {
      setOpen(false)
      return
    }

    if (name === 'clear') {
      setHistory([])
      return
    }

    const handler = COMMANDS[name]
    if (handler) {
      const result = handler(args, router)
      setHistory(prev => [...prev, ...result.output.map(t => ({ type: 'output' as const, text: t }))])
    } else {
      setHistory(prev => [
        ...prev,
        { type: 'output', text: `nexus: command not found: ${name}` },
        { type: 'output', text: 'Type "help" for available commands.' },
      ])
    }
  }, [router])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9990,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease both',
      }}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div style={{
        width: '100%', maxWidth: '720px', height: '480px',
        background: '#0a0f1a', border: '1px solid rgba(74,144,217,0.2)',
        borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(74,144,217,0.1)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--font-mono, "Fira Code", "Cascadia Code", monospace)',
        animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <style>{`@keyframes slideUp { from { transform: scale(0.96) translateY(16px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }`}</style>
        {/* Title bar */}
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setOpen(false)} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171', border: 'none', cursor: 'pointer', padding: 0 }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fbbf24' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#60a5fa' }} />
          </div>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>
            nexus — terminal
          </span>
        </div>

        {/* Output */}
        <div style={{
          flex: 1, overflow: 'auto', padding: '16px',
          fontSize: '12px', lineHeight: '1.7',
        }}>
          {history.map((line, i) => (
            <div key={i} style={{
              color: line.type === 'input' ? 'var(--accent)' : 'rgba(255,255,255,0.65)',
              whiteSpace: 'pre',
            }}>
              {line.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.01)',
        }}>
          <span style={{ color: 'var(--accent)', fontSize: '12px', flexShrink: 0 }}>
            nexus@health:~$
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { execute(input); setInput('') }
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                const idx = Math.min(historyIdx + 1, cmdHistory.length - 1)
                setHistoryIdx(idx)
                setInput(cmdHistory[idx] || '')
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                const idx = Math.max(historyIdx - 1, -1)
                setHistoryIdx(idx)
                setInput(idx === -1 ? '' : cmdHistory[idx] || '')
              }
              if (e.key === 'Escape') setOpen(false)
            }}
            placeholder="Type a command…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#f5f5f5', fontSize: '12px', fontFamily: 'inherit',
              caretColor: 'var(--accent)',
            }}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
