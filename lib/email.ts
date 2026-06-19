/**
 * NEXUS - Central Email Service
 * All outbound email routes through this module.
 * Provider: Resend (https://resend.com)
 *
 * Usage:
 *   import { sendEmail, buildWelcomeEmail } from '@/lib/email'
 *   const { ok } = await sendEmail({ to: 'user@example.com', ...buildWelcomeEmail('Maria') })
 */

const RESEND_API_KEY   = process.env.RESEND_API_KEY ?? ''
const FROM_EMAIL       = process.env.FROM_EMAIL ?? 'NEXUS Health <hello@nexus.health>'
const APP_URL          = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://nexus.health').replace(/\/$/, '')
const UNSUBSCRIBE_BASE = `${APP_URL}/api/unsubscribe`

// -- Core types ---------------------------------------------------------------

export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
  from?: string
}

// Builders return this -- callers supply `to` separately so there is no duplicate key
export type EmailTemplate = Pick<EmailPayload, 'subject' | 'html' | 'text'>

// -- Core send function -------------------------------------------------------

export async function sendEmail(
  payload: EmailPayload
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set -- skipping')
    return { ok: false, error: 'not_configured' }
  }

  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to]
  if (recipients.length === 0) return { ok: false, error: 'no_recipients' }

  // Retry up to 3 times on transient network / 5xx errors
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:     payload.from ?? FROM_EMAIL,
          to:       recipients,
          subject:  payload.subject,
          html:     payload.html,
          text:     payload.text,
          reply_to: payload.replyTo,
        }),
      })

      if (res.ok) {
        const data = await res.json() as { id: string }
        console.log('[Email] Sent "%s" to %s (id=%s)', payload.subject, recipients.join(','), data.id)
        return { ok: true, id: data.id }
      }

      // 4xx = permanent failure, don't retry
      if (res.status >= 400 && res.status < 500) {
        const err = await res.text()
        console.error('[Email] Permanent failure %d: %s', res.status, err)
        return { ok: false, error: `resend_${res.status}` }
      }

      // 5xx = transient -- retry with backoff
      if (attempt < 3) await new Promise(r => setTimeout(r, 500 * attempt))
    } catch (err) {
      console.error('[Email] Network error (attempt %d):', attempt, err)
      if (attempt === 3) return { ok: false, error: String(err) }
      await new Promise(r => setTimeout(r, 500 * attempt))
    }
  }

  return { ok: false, error: 'max_retries' }
}

// Batch send to many recipients -- respects Resend rate limits
export async function sendBatchEmail(
  recipients: string[],
  builder: (token: string) => EmailTemplate,
  getToken: (email: string) => string
): Promise<{ sent: number; failed: number }> {
  const CHUNK = 50
  let sent = 0, failed = 0

  for (let i = 0; i < recipients.length; i += CHUNK) {
    const chunk = recipients.slice(i, i + CHUNK)
    await Promise.all(chunk.map(async email => {
      const token = getToken(email)
      const tmpl  = builder(token)
      const res   = await sendEmail({ to: email, ...tmpl })
      if (res.ok) sent++; else failed++
    }))
    // Respect Resend's rate limit between chunks
    if (i + CHUNK < recipients.length) await new Promise(r => setTimeout(r, 200))
  }

  return { sent, failed }
}

// -- Shared HTML layout -------------------------------------------------------

const YEAR = new Date().getFullYear()

function layout(preheader: string, content: string, unsubToken?: string): string {
  const unsub = unsubToken
    ? `<a href="${UNSUBSCRIBE_BASE}?token=${unsubToken}" style="color:rgba(255,255,255,0.22);text-decoration:underline;">Unsubscribe</a> &nbsp;&middot;&nbsp; `
    : ''

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="x-apple-disable-message-reformatting"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>NEXUS Health</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body,html{background:#07070F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#F8F9FF;}
.wrap{background:#07070F;padding:40px 20px;}
.card{background:#0D0F1C;border:1px solid rgba(255,255,255,0.07);border-radius:20px;max-width:560px;margin:0 auto;overflow:hidden;}
.logo-bar{padding:28px 32px 0;display:flex;align-items:center;gap:10px;}
.logo-text{font-size:11px;font-weight:500;letter-spacing:0.42em;text-transform:uppercase;color:rgba(255,255,255,0.82);}
.hr{height:1px;background:rgba(255,255,255,0.06);margin:20px 32px;}
.body{padding:4px 32px 36px;}
h1{font-size:24px;font-weight:700;color:#FFFFFF;line-height:1.25;margin-bottom:14px;letter-spacing:-0.01em;}
p{font-size:14px;color:rgba(255,255,255,0.58);line-height:1.75;margin-bottom:14px;}
.cta{display:inline-block;padding:13px 28px;background:#4F8EF0;color:#060810 !important;font-size:14px;font-weight:700;border-radius:100px;text-decoration:none;margin:20px 0 8px;letter-spacing:-0.01em;}
.info-box{display:flex;gap:12px;padding:14px 16px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:12px;margin:12px 0;}
.info-icon{font-size:20px;flex-shrink:0;line-height:1.3;}
.info-body{font-size:13px;color:rgba(255,255,255,0.52);line-height:1.6;}
.info-body strong{color:#fff;font-weight:600;}
.highlight{background:rgba(79,142,240,0.07);border:1px solid rgba(79,142,240,0.20);border-radius:14px;padding:20px 22px;margin:18px 0;}
.highlight-name{font-size:16px;font-weight:700;color:#fff;margin-bottom:8px;}
.highlight-desc{font-size:13px;color:rgba(255,255,255,0.56);line-height:1.65;}
.footer-wrap{padding:18px 32px;border-top:1px solid rgba(255,255,255,0.05);}
.footer-text{font-size:11px;color:rgba(255,255,255,0.22);line-height:1.7;}
.footer-text a{color:rgba(255,255,255,0.28);text-decoration:none;}
.fine{font-size:12px;color:rgba(255,255,255,0.28);margin-top:10px;}
@media(max-width:600px){
  .body{padding:4px 20px 28px;}
  .logo-bar{padding:20px 20px 0;}
  .hr{margin:16px 20px;}
  h1{font-size:20px;}
  .cta{display:block;text-align:center;}
  .footer-wrap{padding:16px 20px;}
}
</style>
</head>
<body>
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#07070F;">${preheader}&#160;&#8203;&#65279;&#160;&#8203;&#65279;&#160;&#8203;&#65279;&#160;&#8203;&#65279;</div>
<div class="wrap">
  <div class="card">
    <div class="logo-bar">
      <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
        <path transform="rotate(120 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
        <path transform="rotate(240 50 50)" d="M50,50 C38,44 30,26 50,12 C70,26 62,44 50,50Z" fill="#4F8EF0" opacity="0.95"/>
        <circle cx="50" cy="50" r="5" fill="#4F8EF0" opacity="0.7"/>
      </svg>
      <span class="logo-text">NEXUS</span>
    </div>
    <div class="hr"></div>
    <div class="body">${content}</div>
    <div class="footer-wrap">
      <p class="footer-text">
        ${unsub}<a href="${APP_URL}">nexus.health</a> &nbsp;&middot;&nbsp; &copy; ${YEAR} NEXUS Health<br/>
        Free healthcare navigation for all Americans. NEXUS is not a medical provider.
      </p>
    </div>
  </div>
</div>
</body>
</html>`
}

// -- Template: Welcome --------------------------------------------------------

export function buildWelcomeEmail(name: string): EmailTemplate {
  const first = name.split(' ')[0]
  return {
    subject: `Welcome to NEXUS, ${first}`,
    html: layout(
      `You're in, ${first}. Free healthcare navigation starts now.`,
      `<h1>You're in, ${first}.</h1>
<p>NEXUS connects you to free and low-cost healthcare -- clinics, programs, medication savings, and mental health support. Always free to use.</p>
<div class="info-box"><span class="info-icon">&#127973;</span><div class="info-body"><strong>Find a clinic</strong> -- Search by ZIP code to find FQHCs, free clinics, and sliding-scale providers near you.</div></div>
<div class="info-box"><span class="info-icon">&#128138;</span><div class="info-body"><strong>Save on medications</strong> -- Discover patient assistance programs that can cut costs up to 90%.</div></div>
<div class="info-box"><span class="info-icon">&#129504;</span><div class="info-body"><strong>AI triage</strong> -- Describe your symptoms and get safe guidance on the right level of care.</div></div>
<div class="info-box"><span class="info-icon">&#128203;</span><div class="info-body"><strong>Health Passport</strong> -- Store your medical info securely and share it with any provider.</div></div>
<a href="${APP_URL}/search" class="cta">Find care near you &rarr;</a>
<p class="fine">If you did not create this account, you can safely ignore this email.</p>`
    ),
    text: `Welcome to NEXUS, ${first}!

NEXUS connects you to free and low-cost healthcare.

Find clinics: ${APP_URL}/search
Save on medications: ${APP_URL}/medications
AI triage: ${APP_URL}/triage
Health Passport: ${APP_URL}/passport

If you did not create this account, you can safely ignore this email.

-- The NEXUS Team
${APP_URL}`,
  }
}

// -- Template: Email Confirmation ---------------------------------------------

export function buildConfirmEmailEmail(name: string, confirmUrl: string): EmailTemplate {
  const first = name.split(' ')[0]
  return {
    subject: `Confirm your NEXUS email, ${first}`,
    html: layout(
      `One click and you are all set, ${first}.`,
      `<h1>Confirm your email</h1>
<p>Hi ${first}, almost there -- click below to confirm your email address and fully activate your NEXUS account.</p>
<a href="${confirmUrl}" class="cta">Confirm email address &rarr;</a>
<div class="info-box" style="margin-top:24px;"><span class="info-icon">&#128274;</span><div class="info-body">This link expires in <strong>24 hours</strong>. If you did not create a NEXUS account, you can safely ignore this email.</div></div>
<p class="fine" style="margin-top:16px;">Button not working? Copy this link:<br/><span style="color:rgba(255,255,255,0.38);word-break:break-all;">${confirmUrl}</span></p>`
    ),
    text: `Confirm your NEXUS email, ${first}

${confirmUrl}

This link expires in 24 hours. If you did not create an account, ignore this email.

-- NEXUS Health
${APP_URL}`,
  }
}

// -- Template: Password Reset -------------------------------------------------

export function buildPasswordResetEmail(resetUrl: string): EmailTemplate {
  return {
    subject: 'Reset your NEXUS password',
    html: layout(
      'A password reset was requested for your NEXUS account.',
      `<h1>Reset your password</h1>
<p>Someone requested a password reset for your NEXUS account. Click below to set a new password. This link expires in <strong style="color:#fff;">1 hour</strong>.</p>
<a href="${resetUrl}" class="cta">Reset password &rarr;</a>
<div class="info-box" style="margin-top:24px;"><span class="info-icon">&#128274;</span><div class="info-body">If you did not request this, your account is safe -- just ignore this email. Your password will not change unless you click the link above.</div></div>
<p class="fine" style="margin-top:16px;">Button not working?<br/><span style="color:rgba(255,255,255,0.38);word-break:break-all;">${resetUrl}</span></p>`
    ),
    text: `Reset your NEXUS password

${resetUrl}

This link expires in 1 hour. If you did not request a reset, your account is safe -- ignore this email.

-- NEXUS Health
${APP_URL}`,
  }
}

// -- Template: Newsletter Welcome ---------------------------------------------

export function buildNewsletterWelcomeEmail(unsubToken: string): EmailTemplate {
  return {
    subject: "You're subscribed to NEXUS Health updates",
    html: layout(
      'Health news, program alerts, and new features -- straight to your inbox.',
      `<h1>You're on the list</h1>
<p>Thank you for subscribing to NEXUS Health updates. Here is what to expect:</p>
<div class="info-box"><span class="info-icon">&#128240;</span><div class="info-body"><strong>Healthcare news</strong> that matters to uninsured and underinsured Americans</div></div>
<div class="info-box"><span class="info-icon">&#10024;</span><div class="info-body"><strong>New features</strong> as we build more tools to help you navigate care</div></div>
<div class="info-box"><span class="info-icon">&#128161;</span><div class="info-body"><strong>Program alerts</strong> -- new coverage options and assistance programs you can apply for</div></div>
<a href="${APP_URL}" class="cta">Explore NEXUS &rarr;</a>`,
      unsubToken
    ),
    text: `You're subscribed to NEXUS Health updates.

You'll receive healthcare news, new features, and program alerts.

To unsubscribe: ${UNSUBSCRIBE_BASE}?token=${unsubToken}

-- NEXUS Health
${APP_URL}`,
  }
}

// -- Template: Program Alert --------------------------------------------------

export function buildProgramAlertEmail(
  name: string,
  programName: string,
  description: string,
  learnMoreUrl: string,
  unsubToken?: string
): EmailTemplate {
  const first = name.split(' ')[0]
  return {
    subject: `New program match: ${programName}`,
    html: layout(
      `${first}, a new healthcare program may be available for you.`,
      `<h1>You may qualify for a new program</h1>
<p>Hi ${first}, based on your health profile, we found a program that may be a strong fit for you:</p>
<div class="highlight">
  <div class="highlight-name">${programName}</div>
  <div class="highlight-desc">${description}</div>
</div>
<a href="${learnMoreUrl}" class="cta">Learn more &amp; apply &rarr;</a>
<p class="fine">You're receiving this because you have a NEXUS account. <a href="${APP_URL}/dashboard">Manage preferences</a></p>`,
      unsubToken
    ),
    text: `New program match: ${programName}

Hi ${first}, you may qualify for "${programName}":
${description}

Learn more: ${learnMoreUrl}

-- NEXUS Health
${APP_URL}`,
  }
}

// -- Template: Weekly Health Check-In -----------------------------------------

export function buildHealthCheckinEmail(
  name: string,
  healthScore: number,
  scoreLabel: string,
  nextAction: string,
  unsubToken?: string
): EmailTemplate {
  const first = name.split(' ')[0]
  const scoreColor = healthScore >= 75 ? '#34d399' : healthScore >= 50 ? '#60a5fa' : '#fbbf24'
  return {
    subject: `Your weekly health check-in, ${first}`,
    html: layout(
      `Your health score this week: ${healthScore}/100`,
      `<h1>Your weekly check-in</h1>
<p>Hi ${first}, here is a quick look at your NEXUS health snapshot this week.</p>
<div style="background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:28px;margin:20px 0;text-align:center;">
  <div style="font-size:52px;font-weight:800;color:${scoreColor};line-height:1;letter-spacing:-0.03em;">${healthScore}</div>
  <div style="font-size:13px;color:rgba(255,255,255,0.38);margin:8px 0 0;letter-spacing:0.01em;">out of 100 &nbsp;&middot;&nbsp; ${scoreLabel}</div>
</div>
<div class="info-box"><span class="info-icon">&#127919;</span><div class="info-body"><strong>Recommended next step:</strong><br/>${nextAction}</div></div>
<a href="${APP_URL}/dashboard" class="cta">View your dashboard &rarr;</a>`,
      unsubToken
    ),
    text: `Your weekly NEXUS check-in, ${first}

Health score: ${healthScore}/100 -- ${scoreLabel}

Next step: ${nextAction}

Dashboard: ${APP_URL}/dashboard

-- NEXUS Health
${APP_URL}`,
  }
}

// -- Template: Crisis Follow-Up -----------------------------------------------

export function buildCrisisFollowupEmail(unsubToken?: string): EmailTemplate {
  return {
    subject: 'NEXUS is still here for you',
    html: layout(
      'We want to check in. You are not alone, and support is available right now.',
      `<h1 style="font-size:22px;">We're still here for you</h1>
<p>Yesterday you visited NEXUS for crisis resources. We just want to check in and remind you that real support is available -- anytime, any day.</p>
<div class="info-box" style="border-color:rgba(74,144,217,0.28);background:rgba(74,144,217,0.05);">
  <span class="info-icon">&#128222;</span>
  <div class="info-body"><strong>988 Suicide &amp; Crisis Lifeline</strong><br/>Call or text <strong>988</strong> -- available 24/7, free and confidential.</div>
</div>
<div class="info-box">
  <span class="info-icon">&#128172;</span>
  <div class="info-body"><strong>Crisis Text Line</strong><br/>Text HOME to <strong>741741</strong> -- free, 24/7.</div>
</div>
<div class="info-box">
  <span class="info-icon">&#129309;</span>
  <div class="info-body"><strong>Talk to a Community Health Worker</strong><br/>CHWs help you find mental health support in your community, at zero cost.</div>
</div>
<a href="${APP_URL}/chw" class="cta">Connect with a CHW &rarr;</a>
<p style="color:rgba(255,255,255,0.38);font-size:13px;margin-top:12px;text-align:center;">You are not alone. There are people who care and real help available right now.</p>`,
      unsubToken
    ),
    text: `NEXUS is still here for you.

We're checking in after your visit yesterday. Support is available right now:

988 Suicide & Crisis Lifeline: Call or text 988 (24/7, free)
Crisis Text Line: Text HOME to 741741 (24/7, free)
CHW Connect: ${APP_URL}/chw

You are not alone.

-- NEXUS Health
${APP_URL}`,
  }
}

// -- Template: Newsletter Broadcast -------------------------------------------

export function buildBroadcastEmail(
  headline: string,
  bodyParagraphs: string[],
  ctaText?: string,
  ctaUrl?: string,
  unsubToken?: string
): EmailTemplate {
  const paragraphsHtml = bodyParagraphs.map(p => `<p>${p}</p>`).join('\n')
  const ctaHtml = ctaText && ctaUrl ? `<a href="${ctaUrl}" class="cta">${ctaText} &rarr;</a>` : ''
  return {
    subject: headline,
    html: layout(headline, `<h1>${headline}</h1>\n${paragraphsHtml}\n${ctaHtml}`, unsubToken),
    text: `${headline}

${bodyParagraphs.join('\n\n')}

${ctaText && ctaUrl ? `${ctaText}: ${ctaUrl}` : ''}

-- NEXUS Health
${APP_URL}`,
  }
}
