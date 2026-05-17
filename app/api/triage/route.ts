/**
 * NEXUS — AI Triage Endpoint
 *
 * POST /api/triage
 * Body: { query: string }
 *
 * Returns structured JSON:
 * {
 *   urgency: 'routine' | 'soon' | 'urgent' | 'emergency'
 *   reasoning: string
 *   steps: string[]
 *   erAlert?: string
 *   citations: string[]
 * }
 *
 * Safety guardrails:
 *  - Hard-coded system prompt prohibits diagnosis
 *  - 10 req / min per IP rate limit (separate from general AI endpoint)
 *  - Input capped at 500 chars
 *  - JSON parsing with strict field validation
 *  - 503 on missing API key (graceful — page falls back to keyword matching)
 */

import Anthropic from '@anthropic-ai/sdk'
import { rateLimit } from '@/lib/rate-limit'

const TRIAGE_SYSTEM = `You are a clinical triage assistant for NEXUS Health — a free healthcare access platform for uninsured Americans.

Your role: analyze patient-reported symptoms and provide structured care guidance based on published clinical guidelines.

CRITICAL RULES:
1. You are NOT providing a medical diagnosis — you are matching symptoms to care settings
2. For any potential emergency (chest pain with SOB or sweating, stroke signs, severe allergic reaction, uncontrolled bleeding, altered consciousness, suicidal crisis), set urgency to "emergency"
3. Recommend FQHCs and free clinics — never push expensive ER unless urgency is "emergency"
4. If someone mentions self-harm or suicidal thoughts, include 988 Suicide & Crisis Lifeline in steps
5. Keep reasoning in plain English — users are stressed and underserved
6. Cite only real, specific clinical guidelines

URGENCY LEVELS:
- routine: Can wait a few days — schedule appointment
- soon: Should be seen within 24–48 hours
- urgent: Should be seen today — same-day care needed
- emergency: Call 911 or go to ER immediately

RESPOND ONLY WITH VALID JSON (no markdown fences, no extra text before or after):
{
  "urgency": "routine" | "soon" | "urgent" | "emergency",
  "reasoning": "2–3 sentences. Reference specific guideline. Plain language. Example: 'Chest discomfort worsening with breathing is consistent with pleurisy or musculoskeletal strain per CDC respiratory guidelines. While usually not dangerous, persistent symptoms need evaluation to rule out pneumonia.'",
  "steps": ["Step 1 — specific and actionable", "Step 2", "Step 3"],
  "erAlert": "Only include for urgent/emergency: exact warning signs requiring immediate ER. Omit field entirely for routine/soon.",
  "citations": ["Specific guideline name and year", "Second citation", "Third citation"]
}`

export async function POST(req: Request) {
  // Rate limit: 10 triage requests per minute per IP (separate namespace from /api/ai)
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, namespace: 'triage' })
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...rl.headers } }
    )
  }

  // Graceful degradation: if key not configured, page falls back to keyword matching
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'AI service not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let body: { query?: unknown }
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const query = typeof body?.query === 'string' ? body.query.trim() : ''
  if (!query) {
    return new Response(
      JSON.stringify({ error: 'query field required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
  // Cap input to prevent abuse
  const sanitized = query.slice(0, 500)

  try {
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model:      'claude-haiku-4-5',
      max_tokens: 700,
      system:     TRIAGE_SYSTEM,
      messages:   [{ role: 'user', content: `Patient-reported symptoms: "${sanitized}"` }],
    })

    const raw = message.content[0]?.type === 'text' ? message.content[0].text : ''

    // Extract JSON — handle any accidental markdown fences
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON object found in response')

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>

    // Strict field validation
    const validUrgencies = ['routine', 'soon', 'urgent', 'emergency']
    if (
      !validUrgencies.includes(parsed.urgency as string) ||
      typeof parsed.reasoning !== 'string' ||
      !Array.isArray(parsed.steps) ||
      parsed.steps.length === 0 ||
      !Array.isArray(parsed.citations)
    ) {
      throw new Error('Response missing required fields')
    }

    // Build clean response — never pass unexpected fields to client
    const result: {
      urgency: string
      reasoning: string
      steps: string[]
      citations: string[]
      erAlert?: string
    } = {
      urgency:   parsed.urgency as string,
      reasoning: (parsed.reasoning as string).slice(0, 800),
      steps:     (parsed.steps as unknown[]).slice(0, 6).map(s => String(s).slice(0, 300)),
      citations: (parsed.citations as unknown[]).slice(0, 5).map(c => String(c).slice(0, 200)),
    }

    if (typeof parsed.erAlert === 'string' && parsed.erAlert.trim()) {
      result.erAlert = parsed.erAlert.slice(0, 400)
    }

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        ...rl.headers,
      },
    })
  } catch (err) {
    console.error('[/api/triage] error:', err instanceof Error ? err.message : err)
    return new Response(
      JSON.stringify({ error: 'Triage analysis failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
