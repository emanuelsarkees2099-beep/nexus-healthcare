/**
 * NEXUS — One-click unsubscribe (CAN-SPAM compliant)
 * GET /api/unsubscribe?token=<uuid>
 *
 * Sets subscribed=false for the matching subscriber.
 * Returns a human-readable HTML page confirming the unsubscribe.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://nexus.health').replace(/\/$/, '')

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token')

  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return new NextResponse(html('Invalid link', 'This unsubscribe link is invalid or has already been used.'), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey)
    await supabase
      .from('newsletter_subscribers')
      .update({ subscribed: false })
      .eq('unsubscribe_token', token)
      // Graceful — if token doesn't exist, still show success page
  }

  return new NextResponse(html('Unsubscribed', 'You have been unsubscribed from NEXUS Health emails. You will not receive any more newsletters from us.'), {
    headers: { 'Content-Type': 'text/html' },
  })
}

function html(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title} — NEXUS Health</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#07070F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#F8F9FF;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;}
.card{background:#0D0F1C;border:1px solid rgba(255,255,255,0.07);border-radius:20px;max-width:480px;width:100%;padding:40px 36px;text-align:center;}
.icon{font-size:40px;margin-bottom:16px;}
h1{font-size:22px;font-weight:700;color:#fff;margin-bottom:12px;}
p{font-size:14px;color:rgba(255,255,255,0.56);line-height:1.7;margin-bottom:24px;}
a{display:inline-block;padding:11px 24px;background:#4F8EF0;color:#060810;font-size:13px;font-weight:700;border-radius:100px;text-decoration:none;}
</style>
</head>
<body>
<div class="card">
  <div class="icon">✓</div>
  <h1>${title}</h1>
  <p>${message}</p>
  <a href="${APP_URL}">Visit NEXUS Health</a>
</div>
</body>
</html>`
}
