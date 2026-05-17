import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''

// ─── Allowed submission types ──────────────────────────────────────────────────
const ALLOWED_TYPES = ['story', 'chw', 'legal', 'provider', 'accessibility', 'advocacy', 'outcome'] as const
type SubmissionType = typeof ALLOWED_TYPES[number]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const SPAM_PATTERNS = [/\b(viagra|casino|lottery|winner|click here|free money|make \$\d+)\b/i]

function isValidEmail(v: unknown): boolean {
  return typeof v === 'string' && EMAIL_RE.test(v.trim())
}

function containsSpam(texts: unknown[]): boolean {
  return texts.some(t => typeof t === 'string' && SPAM_PATTERNS.some(p => p.test(t)))
}

function validate(type: SubmissionType, data: Record<string, unknown>): string | null {
  switch (type) {
    case 'story': {
      if (!data.story || typeof data.story !== 'string' || data.story.trim().length < 20)
        return 'Story must be at least 20 characters.'
      if (!data.consent) return 'You must consent to sharing your story.'
      if (containsSpam([data.story, data.name]))
        return 'Your submission was flagged by our content filter. Please revise and resubmit.'
      return null
    }
    case 'chw': {
      // Card "connect" clicks don't require email — only the "become a CHW" form does
      const isSignup = Boolean(data.name && data.email && data.city && !data.source)
      if (isSignup) {
        if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2)
          return 'Please enter your full name (at least 2 characters).'
        if (!isValidEmail(data.email))
          return 'Please enter a valid email address.'
        if (!data.city || typeof data.city !== 'string' || data.city.trim().length < 2)
          return 'Please enter your city.'
        if (containsSpam([data.name, data.city]))
          return 'Your submission was flagged by our content filter.'
      }
      return null
    }
    case 'legal':
      if (!isValidEmail(data.email)) return 'Please enter a valid email address.'
      if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10)
        return 'Please describe your issue (at least 10 characters).'
      return null
    case 'provider':
      if (!data.clinic || typeof data.clinic !== 'string' || data.clinic.trim().length < 2)
        return 'Please enter your clinic name.'
      if (!isValidEmail(data.email)) return 'Please enter a valid email address.'
      return null
    case 'accessibility':
      if (!isValidEmail(data.email)) return 'Please enter a valid email address.'
      if (!data.issue || typeof data.issue !== 'string' || data.issue.trim().length < 10)
        return 'Please describe the accessibility issue (at least 10 characters).'
      return null
    case 'advocacy':
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2)
        return 'Please enter your name.'
      if (!isValidEmail(data.email)) return 'Please enter a valid email address.'
      if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 20)
        return 'Message must be at least 20 characters.'
      if (containsSpam([data.name, data.message]))
        return 'Your submission was flagged by our content filter.'
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
    // Rate limiting (centralized — 5 submissions per minute per IP)
    const rl = rateLimit(req as unknown as Request, { limit: 5, windowMs: 60_000, namespace: 'submit' })
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before submitting again.' },
        { status: 429, headers: rl.headers }
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

    // Stories → pending_review (admin approves before publishing)
    // CHW signups (has name+email+city but no source field) → pending_verification
    // Everything else → new
    const isCHWSignup = type === 'chw' && Boolean(data.name && data.email && data.city && !data.source)
    const status = type === 'story' ? 'pending_review' : isCHWSignup ? 'pending_verification' : 'new'

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
