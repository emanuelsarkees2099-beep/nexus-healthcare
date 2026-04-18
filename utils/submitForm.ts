import { createClientClient } from '@/lib/auth-client'

export async function submitForm(
  type: 'story' | 'chw' | 'legal' | 'provider' | 'accessibility' | 'advocacy' | 'outcome',
  data: Record<string, unknown>
): Promise<{ ok: true; id: string }> {
  const supabase = createClientClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData?.session?.user?.id ?? null

  const res = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, userId, ...data }),
  })

  const json = await res.json()

  if (!res.ok || !json.ok) {
    throw new Error(json.error ?? 'Submission failed. Please try again.')
  }

  return json
}
