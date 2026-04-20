import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''

// ─── Simple in-memory rate limiter ────────────────────────────────────────────
// Upgrade to Upstash Redis for production: https://upstash.com
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5      // max requests
const RATE_WINDOW = 60_000 // per 60 seconds

function checkRateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return { ok: true, retryAfter: 0 }
  }

  if (entry.count >= RATE_LIMIT) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { ok: true, retryAfter: 0 }
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  rateLimitMap.forEach((v, k) => { if (now > v.resetAt) rateLimitMap.delete(k) })
}, 300_000)

// ─── Allowed submission types ──────────────────────────────────────────────────
const ALLOWED_TYPES = ['story', 'chw', 'legal', 'provider', 'accessibility', 'advocacy', 'outcome'] as const
type SubmissionType = typeof ALLOWED_TYPES[number]

function validate(type: SubmissionType, data: Record<string, unknown>): string | null {
  switch (type) {
    case 'story':
      if (!data.story || typeof data.story !== 'string' || data.story.trim().length < 20)
        return 'Story must be at least 20 characters.'
      if (!data.consent) return 'You must consent to sharing your story.'
      return null
    case 'chw':
      if (!data.name || !data.email || !data.city) return 'Name, email, and city are required.'
      return null
    case 'legal':
      if (!data.email || !data.description) return 'Email and description are required.'
      return null
    case 'provider':
      if (!data.clinic || !data.email) return 'Clinic name and email are required.'
      return null
    case 'accessibility':
      if (!data.email || !data.issue) return 'Email and issue description are required.'
      return null
    case 'advocacy':
      if (!data.name || !data.email || !data.message) return 'Name, email, and message are required.'
      return null
    case 'outcome':
      if (!data.care || !data.rating) return 'Care type and rating are required.'
      return null
    default:
      return 'Unknown submission type.'
  }
}

// ─── Send admin notification via Resend ───────────────────────────────────────
async function notifyAdmin(type: string, data: Record<string, unknown>, userId: string) {
  if (!RESEND_API_KEY || !ADMIN_EMAIL) return

  const summary = Object.entries(data)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#94a3b8;font-size:13px;text-transform:capitalize">${k}</td><td style="padding:6px 12px;color:#e2e8f0;font-size:13px">${v}</td></tr>`)
    .join('')

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NEXUS <notifications@nexus-health.app>',
      to: ADMIN_EMAIL,
      subject: `[NEXUS] New ${type} submission`,
      html: `
        <div style="font-family:sans-serif;background:#07070F;padding:32px;max-width:600px;margin:0 auto;border-radius:12px">
          <div style="margin-bottom:24px">
            <span style="font-size:11px;letter-spacing:0.3em;color:#6d9197">NEXUS</span>
          </div>
          <h2 style="color:#fff;font-size:20px;margin-bottom:8px">New ${type} submission</h2>
          <p style="color:#64748b;font-size:14px;margin-bottom:24px">User ID: ${userId}</p>
          <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.04);border-radius:8px;overflow:hidden">
            ${summary}
          </table>
          <div style="margin-top:24px">
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/admin"
               style="background:#6d9197;color:#07070F;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px">
              View in admin panel →
            </a>
          </div>
        </div>
      `,
    }),
  }).catch(e => console.warn('[NEXUS] Resend error:', e))
}

// ─── POST /api/submit ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? '127.0.0.1'
    const rl = checkRateLimit(ip)
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${rl.retryAfter} seconds.` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    const body = await req.json()
    const { type, userId, ...data } = body

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid submission type.' }, { status: 400 })
    }

    const validationError = validate(type as SubmissionType, data)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 422 })
    }

    const getSupabaseClient = () => createClient(url, anonKey)

    // Stories go to 'pending_review' so admin can approve before publishing
    const status = type === 'story' ? 'pending_review' : 'new'

    const { data: row, error } = await getSupabaseClient()
      .from('submissions')
      .insert({ type, data, status, user_id: userId || null })
      .select('id')
      .single()

    if (error) {
      console.error('[NEXUS] Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save submission. Please try again.' }, { status: 500 })
    }

    // Fire-and-forget admin notification
    notifyAdmin(type, data, userId || 'anonymous')

    return NextResponse.json({ ok: true, id: row.id })
  } catch (err) {
    console.error('[NEXUS] Submit route error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
