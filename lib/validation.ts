/**
 * NEXUS — shared request-body validation (zod).
 *
 * Every POST route parses its body through one of these schemas and
 * rejects malformed input with a clean 400 before touching the DB or an
 * LLM. This closes the injection / abuse / malformed-payload surface.
 *
 * Usage:
 *   const parsed = LoginSchema.safeParse(await req.json().catch(() => null))
 *   if (!parsed.success) return badRequest(parsed)
 */
import { z } from 'zod'
import { NextResponse } from 'next/server'

/** Standard 400 for a failed safeParse. Never leaks internals. */
export function badRequest(result: { error: z.ZodError }) {
  const first = result.error.issues[0]
  const msg = first ? `${first.path.join('.') || 'body'}: ${first.message}` : 'Invalid request'
  return NextResponse.json({ error: msg }, { status: 400 })
}

/* ── Primitives ── */
const email = z.string().trim().email('valid email required').max(254)
// Supabase minimum is 6; we require 8 and cap length to stop DoS-by-bcrypt
const password = z.string().min(8, 'password must be at least 8 characters').max(200)
const shortText = z.string().trim().max(200)
const longText = z.string().trim().max(5000)
const zip = z.string().trim().regex(/^\d{5}(-\d{4})?$/, 'invalid ZIP').optional()

/* ── Auth ── */
export const LoginSchema = z.object({
  email,
  password: z.string().min(1, 'password required').max(200),
})

export const SignupSchema = z.object({
  email,
  password,
  fullName: z.string().trim().min(1, 'name required').max(120),
  phone: z.string().trim().max(32).optional().or(z.literal('')),
  userType: z.enum(['patient', 'chw', 'provider', 'admin']).optional(),
})

export const UpdatePasswordSchema = z.object({
  password,
  accessToken: z.string().min(1).max(4000).optional(),
  token: z.string().min(1).max(4000).optional(),
})

export const ResetPasswordSchema = z.object({ email })

/* ── Data submission ── */
export const OutcomeSchema = z.object({
  event_type: z.enum([
    'clinic_visited', 'appointment_made', 'program_enrolled',
    'prescription_obtained', 'care_received', 'crisis_visited',
  ]),
  clinic_id: shortText.optional(),
  clinic_name: shortText.optional(),
  program_name: shortText.optional(),
  zip_code: zip,
  notes: longText.optional(),
  anonymous: z.boolean().optional(),
})

export const BookmarkSchema = z.object({
  resource_type: z.string().trim().min(1).max(60),
  resource_id: z.union([z.string(), z.number()]).transform(String).pipe(z.string().max(200)),
  resource_name: shortText.optional(),
  resource_data: z.record(z.string(), z.unknown()).optional(),
})

export const SubscribeSchema = z.object({
  email,
  zip: zip,
  source: shortText.optional(),
})

/* ── AI / triage — the abuse-cost-sensitive endpoints ── */
const chatMessage = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(4000),
})
export const AiSchema = z.object({
  messages: z.array(chatMessage).min(1).max(40).optional(),
  message: z.string().max(4000).optional(),
  prompt: z.string().max(4000).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
}).refine(
  d => !!(d.messages?.length || d.message || d.prompt),
  { message: 'a message is required' },
)

export const TriageSchema = z.object({
  symptom: z.string().trim().min(1, 'describe your symptom').max(2000),
  location: z.string().trim().max(120).optional(),
  age: z.union([z.number(), z.string()]).optional(),
  history: z.array(z.string().max(500)).max(20).optional(),
})

export const PushSubscribeSchema = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({
    p256dh: z.string().max(400),
    auth: z.string().max(400),
  }),
  zip: zip,
})
