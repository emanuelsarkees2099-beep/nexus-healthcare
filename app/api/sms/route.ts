import { NextRequest, NextResponse } from 'next/server'

/*
 * NEXUS SMS Chatbot — Twilio Webhook Handler
 *
 * Setup:
 * 1. Create a Twilio account at twilio.com and buy a phone number
 * 2. Get an Anthropic API key at console.anthropic.com
 * 3. Set env vars (see .env.local.example):
 *      ANTHROPIC_API_KEY=sk-ant-...
 *      TWILIO_AUTH_TOKEN=...
 * 4. In Twilio console → your number → Messaging → Webhook:
 *      https://your-domain.com/api/sms
 *      HTTP POST
 * 5. Deploy your Next.js app (Vercel: vercel deploy)
 *
 * The bot detects language, calls Claude claude-haiku-4-5-20251001
 * (fast + cheap), and returns TwiML.
 */

const SYSTEM_PROMPT = `You are NEXUS, a healthcare navigation assistant helping uninsured Americans find free and low-cost care. You communicate via SMS so keep replies under 160 characters whenever possible (split into multiple messages only if truly necessary).

Your job:
- Help users find free clinics, FQHCs, and sliding-scale providers near them
- Explain eligibility for Medicaid, ACA marketplace plans, HRSA programs
- Explain patient rights (EMTALA, No Surprises Act, HIPAA)
- Connect users to Community Health Workers (CHWs)
- Answer questions about prescriptions, mental health, dental, and preventive care

Rules:
- NEVER give medical diagnoses or specific medical advice
- Always remind users that NEXUS is for navigation, not diagnosis
- If someone mentions a medical emergency, immediately say "Call 911" first
- If someone mentions suicidal thoughts or crisis, immediately say "Text 988 or call 988 now"
- Be warm, clear, and human — not robotic
- Support all languages — respond in the same language the user writes in
- Keep responses SHORT and actionable — this is SMS

If the user gives you a zip code, suggest they visit nexushealth.org/search or text SEARCH <zip> for nearby clinics.

You are here to help. Healthcare is a right.`

/* ─── language-detect helper (very basic, handles top 4) ─── */
function detectLanguage(text: string): string {
  const es = /[¿¡áéíóúüñ]/i.test(text) || /\b(hola|necesito|médico|doctor|ayuda|tengo|dolor|gracias)\b/i.test(text)
  const zh = /[\u4e00-\u9fff]/.test(text)
  const vi = /[àáâãèéêìíòóôõùúýăđơư]/i.test(text) || /\b(cần|bác sĩ|giúp|không|tôi)\b/i.test(text)
  if (zh) return 'zh'
  if (es) return 'es'
  if (vi) return 'vi'
  return 'en'
}

/* ─── Twilio signature validation (optional but recommended in prod) ─── */
async function validateTwilioSignature(req: NextRequest, body: string): Promise<boolean> {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return true // skip in dev if token not set

  const signature = req.headers.get('x-twilio-signature') ?? ''
  const url = req.url

  // Simple HMAC-SHA1 validation
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(authToken),
    { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  )

  // Parse body and sort params
  const params = new URLSearchParams(body)
  const sortedKeys = Array.from(params.keys()).sort()
  let strToSign = url
  for (const k of sortedKeys) strToSign += k + (params.get(k) ?? '')

  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(strToSign))
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)))

  return expected === signature
}

/* ─── Call Claude API directly via fetch ─── */
async function callClaude(userMessage: string, lang: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return 'NEXUS is temporarily unavailable. Call 1-800-275-4772 (HRSA) for free care referrals.'

  const langNote = lang !== 'en' ? ` [User appears to be writing in: ${lang} — respond in that language]` : ''

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM_PROMPT + langNote,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    console.error('Claude API error:', response.status, await response.text())
    return 'Sorry, something went wrong. Visit nexushealth.org or call 1-800-275-4772 for free clinic help.'
  }

  const data = await response.json()
  const text: string = data?.content?.[0]?.text ?? ''

  // Truncate hard to 320 chars (2 SMS segments) if Claude went long
  return text.length > 320 ? text.slice(0, 317) + '…' : text
}

/* ─── Return TwiML XML ─── */
function twiml(message: string): NextResponse {
  // Escape XML special chars
  const safe = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${safe}</Message>
</Response>`

  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

/* ─── Main handler ─── */
export async function POST(req: NextRequest) {
  let bodyText = ''
  try {
    bodyText = await req.text()
  } catch {
    return twiml('Sorry, we could not process your message. Visit nexushealth.org for help.')
  }

  // Validate Twilio signature in production
  if (process.env.NODE_ENV === 'production' && process.env.TWILIO_AUTH_TOKEN) {
    const valid = await validateTwilioSignature(req, bodyText)
    if (!valid) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  const params = new URLSearchParams(bodyText)
  const incomingBody = params.get('Body')?.trim() ?? ''
  const from = params.get('From') ?? 'unknown'

  console.log(`[NEXUS SMS] From: ${from} | Message: "${incomingBody}"`)

  if (!incomingBody) {
    return twiml('Hi! Text me your zip code or question and I\'ll help you find free healthcare near you. — NEXUS')
  }

  // Handle HELP keyword
  if (/^help$/i.test(incomingBody)) {
    return twiml('NEXUS Help: Text your zip code to find free clinics. Text RIGHTS to learn your rights. Text STOP to unsubscribe. Web: nexushealth.org')
  }

  // Handle STOP (Twilio handles this automatically but just in case)
  if (/^stop$/i.test(incomingBody)) {
    return twiml('You have been unsubscribed from NEXUS. Reply START to resubscribe.')
  }

  // Emergency keywords — highest priority
  if (/\b(emergency|911|dying|can't breathe|chest pain|stroke|overdose)\b/i.test(incomingBody)) {
    return twiml('⚠️ If this is a medical emergency, CALL 911 NOW. For free ER rights info after: nexushealth.org/rights')
  }

  // Crisis keywords
  if (/\b(suicide|kill myself|want to die|end it|hopeless)\b/i.test(incomingBody)) {
    return twiml('You\'re not alone. Please text or call 988 (Suicide & Crisis Lifeline) right now. They\'re free, confidential, 24/7.')
  }

  const lang = detectLanguage(incomingBody)

  try {
    const reply = await callClaude(incomingBody, lang)
    return twiml(reply)
  } catch (err) {
    console.error('[NEXUS SMS] Error calling Claude:', err)
    return twiml('Sorry, I\'m having trouble right now. Visit nexushealth.org or call 1-800-275-4772 (HRSA) for free care help.')
  }
}

/* ─── GET: health check ─── */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'NEXUS SMS Chatbot',
    instructions: 'This endpoint receives Twilio SMS webhooks. Configure your Twilio number to POST to /api/sms',
  })
}
