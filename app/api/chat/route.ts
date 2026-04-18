import { NextRequest, NextResponse } from 'next/server'

// ── Claude-powered health navigation chat ──────────────────────────────────
// Uses Claude Haiku (fast, cheap) scoped strictly to healthcare navigation.
// NO diagnosis. NO treatment recommendations. Navigation + resource guidance only.

const SYSTEM_PROMPT = `You are a friendly healthcare navigation assistant for NEXUS, a platform that helps uninsured Americans find free and affordable healthcare. Your role is STRICTLY to help users:

1. Find free clinics, FQHCs, and affordable healthcare resources near them
2. Understand programs like Medicaid, CHIP, ACA subsidies, NeedyMeds, 340B
3. Navigate enrollment processes and what documents they need
4. Understand their rights as patients (EMTALA, sliding-scale requirements, etc.)
5. Know what services are available at different clinic types

CRITICAL RULES — you MUST follow these absolutely:
- NEVER diagnose medical conditions or symptoms
- NEVER recommend specific medications or dosages
- NEVER provide medical advice or treatment plans
- NEVER tell someone to delay seeking emergency care
- If someone mentions chest pain, difficulty breathing, stroke symptoms, or any emergency: IMMEDIATELY direct them to call 911 or go to the nearest ER
- If someone seems to be in crisis (mental health emergency, suicidal ideation): Immediately provide the 988 Suicide & Crisis Lifeline number and encourage them to call
- Always recommend they speak with an actual healthcare provider for medical questions

You are conversational, warm, and understanding. Many users are in financial stress. Be empathetic but concise.

When recommending clinics: Remind users they can use the NEXUS clinic finder (/search) with their ZIP code to see verified clinics near them.

When discussing costs: FQHCs charge on a sliding scale (often $0 for lowest incomes). Free clinics typically charge $0. Emergency rooms cannot turn away anyone regardless of ability to pay (EMTALA).

Keep responses focused and under 200 words unless more detail is genuinely needed.`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages: Message[] = body.messages || []
    const userMessage: string = body.message || ''

    if (!userMessage.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { reply: "I'm temporarily unavailable. Please use the clinic finder (/search) or call 211 for local health resources." },
        { status: 200 }
      )
    }

    // Build conversation history (last 8 messages to stay within context)
    const conversationHistory: Message[] = [
      ...messages.slice(-8),
      { role: 'user', content: userMessage },
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: conversationHistory,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[Chat API] Anthropic error:', response.status, errText)
      return NextResponse.json(
        { reply: "I'm having trouble right now. Please try the clinic finder (/search) or call 211 for immediate help." },
        { status: 200 }
      )
    }

    const data = await response.json()
    const reply = data.content?.[0]?.text || "I couldn't generate a response. Please try again."

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[Chat API] Error:', err)
    return NextResponse.json(
      { reply: "Something went wrong. For immediate help finding care, visit /search or call 211." },
      { status: 200 }
    )
  }
}
