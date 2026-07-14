# NEXUS — Launch Readiness (what's done, what needs you)

Status after 7 batches of hardening. The code is in launch-grade shape.
Everything below marked **YOU** needs a human — mostly ~30 min of account
creation and one SQL paste. Everything else is done and pushed.

## ✅ DONE (all committed + pushed to Vercel)
- **Integrity**: every fabricated claim removed (16 fake testimonials, 3 fake
  university studies, the fake "Outcomes Research Report," fake CHW network,
  all invented numbers). The app says only true things now.
- **Security**: auth brute-force protection (login/signup/reset rate-limited),
  zod validation on all POST routes, privilege-escalation guard on signup,
  full security headers + CSP already present, deps audited.
- **Dead code**: 12 unused components + the dead state-clinic fetcher removed
  (~2,100 lines).
- **Trust floor**: universal medical disclaimer wired (triage/search/clinic/
  crisis), /accessibility statement page, honest DataSources landing section.
  Privacy + Terms audited — already strong.
- **Resilience**: crisis page precached offline (SW v5), global-error boundary
  for root-layout crashes, ErrorBoundary around the Leaflet map, thorough
  search empty-state.
- **SEO**: sitemap cleaned (removed 3 dead URLs, added /kids + /terms),
  robots.ts correct.
- **Monitoring**: Sentry + PostHog + Speed Insights all wired in code — they
  activate the instant you set the keys.

## 🔴 YOU — do these before flipping to public (ranked)

### 1. Run the RLS SQL (5 min) — security-critical
Supabase Dashboard → SQL Editor → open
`supabase/migrations/20260713_rls_audit_and_hardening.sql`.
Run PART A (audit), then PART B (hardening), then PART A again to confirm.
Send me the PART A output if anything looks off and I'll finalize the
outcomes/submissions policies safely.

### 2. Set production env vars in Vercel (10 min)
- `NEXT_PUBLIC_APP_URL` = your real production domain
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` (from the un-paused project)
- `CRON_SECRET`, `TWILIO_AUTH_TOKEN`, `VA_API_KEY`
- **Turn on monitoring** (optional but recommended): `NEXT_PUBLIC_SENTRY_DSN`,
  `NEXT_PUBLIC_POSTHOG_KEY` — code is already wired.

### 3. Google OAuth for the prod domain (5 min)
Supabase Dashboard → Auth → URL Configuration → add your production domain to
redirect URLs. Otherwise Google sign-in fails in production.

### 4. Auth end-to-end test on your phone (10 min)
signup → email verify → login → password reset → Google OAuth → logout.
This is the one flow I can't test without a live account.

### 5. Give me a test login (unblocks the last sweep)
Create `test@…` (or share throwaway creds) so I can sweep the auth-gated pages
(dashboard, passport, medications) at phone width like I did the public ones.

### 6. Two decisions
- **Theme**: keep dark, or let me build the light/warm marketing variant?
- **Ebook URL** for /kids (or I hide the button).

### 7. Launch-day mechanics
- Custom domain + HTTPS on Vercel
- Share a link in iMessage/WhatsApp — confirm the OG card renders
- Google Search Console → verify domain → submit sitemap
- Uptime monitor (UptimeRobot free) on `/` and `/api/clinics?location=85004`
- **The cellular smoke test**: on your phone, off wifi — land → search your ZIP
  → tap a clinic → call button → triage → crisis in airplane mode. All five
  pass → tag `v1.0.0` → you're live.

## Deferred to post-launch (needs a live browser/device I don't have)
- Full Lighthouse run (target ≥90 mobile) — do this during the phone test.
