/**
 * NEXUS — AI Healthcare Navigator
 * Streaming SSE endpoint backed by claude-haiku-4-5 (fast + cheap).
 *
 * POST /api/ai
 * Body: { messages: Array<{role:'user'|'assistant', content:string}> }
 *
 * Returns: text/event-stream with SSE chunks { delta: string } and a final [DONE] event.
 *
 * Safety guardrails:
 *  - Hard-coded system prompt that prevents medical diagnosis
 *  - 20 req / min per IP rate limit
 *  - Input sanitised to ≤ 2,000 chars per message
 */

import Anthropic from '@anthropic-ai/sdk'
import { rateLimit } from '@/lib/rate-limit'

const SYSTEM_PROMPT = `You are NEXUS Assistant, a compassionate healthcare navigation guide for uninsured and underinsured Americans.

Your role:
- Help people FIND free clinics, community health centers, federally qualified health centers (FQHCs), sliding-scale services, and government programs
- Explain how to ACCESS care (what to bring, what to expect, how to get on sliding-scale pricing)
- Clarify eligibility for programs like Medicaid, CHIP, Ryan White, HRSA-funded services, Hill-Burton, and state-specific programs
- Give context on patient rights (EMTALA, HIPAA, balance billing protections)
- Explain what different care settings mean (FQHC, urgent care, ER, telehealth)
- Recommend using the NEXUS search tool for finding specific clinics nearby

Critical rules you MUST follow:
1. NEVER diagnose medical conditions
2. NEVER recommend specific medications or doses
3. NEVER tell people to avoid or delay emergency care — always say "call 911 or go to your nearest ER" for potentially life-threatening situations
4. If someone mentions self-harm, suicidal thoughts, or a mental health crisis, immediately provide the 988 Suicide & Crisis Lifeline and the Crisis Text Line (text HOME to 741741)
5. Always clarify you are a navigation tool, not a medical provider
6. Keep responses focused, warm, and practical — most users are stressed and underserved
7. When you don't know specific local resources, suggest using the NEXUS clinic search

Tone: Warm, clear, empowering. No jargon. Short paragraphs. Use bullet points for action steps.`

export async function POST(req: Request) {
  // Rate limit: 20 req/min per IP
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000, namespace: 'ai' })
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...rl.headers },
    })
  }

  let body: { messages?: unknown[] }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array required' }), { status: 400 })
  }

  // Sanitise messages — only allow valid roles and cap content length
  type Msg = { role: 'user' | 'assistant'; content: string }
  const messages: Msg[] = (body.messages as Msg[])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-20) // keep last 20 turns max

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: 'No valid messages' }), { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AI service not configured' }), { status: 503 })
  }

  const client = new Anthropic({ apiKey })

  // SSE streaming response
  const encoder = new TextEncoder()
  const stream  = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const stream = client.messages.stream({
          model:      'claude-haiku-4-5',
          max_tokens: 1024,
          system:     SYSTEM_PROMPT,
          messages,
        })

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            send({ delta: event.delta.text })
          }
        }

        send({ done: true })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        send({ error: msg })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...rl.headers,
    },
  })
}
