# NEXUS — 3-Day Launch Plan + Everything Worth Knowing

Written after a full-session audit of the codebase, live behavior at desktop
and 375px, the data layer, and the API surface. Two sections:

- **PART A** — what we execute in 3 days, ordered by risk-to-launch
- **PART B** — everything else worth doing, no matter how long it takes
  (you asked for all of it — nothing withheld)

Current honest state: the core loop is genuinely strong now. Search returns
100+ real HRSA-verified clinics in <1s anywhere in the US, typeahead covers
every city/ZIP, the landing page has a signature look, mobile chrome is
organized. What stands between this and "public launch" is mostly
verification, hardening, and the last honest-content sweep — not new code.

═══════════════════════════════════════════════════════════════════
PART A — THE 3 DAYS
═══════════════════════════════════════════════════════════════════

## DAY 1 — Trust & Security (the things that can hurt you)

### A1. Auth flow verification (2h, needs your phone + a test email)
- Sign up with email → verify → login → logout → password reset → login
- Google OAuth end-to-end (needs correct redirect URLs in Supabase for the
  production domain — Supabase Dashboard → Auth → URL Configuration)
- Idle timeout fires; session refresh works after >1h idle
- WHO: mostly me via preview; OAuth + email delivery only you can confirm

### A2. Supabase RLS audit (1h, me + 5 min of you in dashboard)
Every user-data table must have RLS ON with owner-scoped policies:
user_profiles, outcomes, submissions, bookmarks, push_subscriptions,
clinic_cache (public read ok), clinic_overrides (admin write), newsletter.
I write the audit SQL; you paste, send me the output; I fix any gaps.

### A3. API hardening pass (3h, me)
- zod input validation on every POST body (submit, subscribe, outcomes,
  bookmarks, push, triage, ai)
- Rate limits exist on clinics/places — extend to /api/ai + /api/triage
  (LLM cost abuse), /api/submit + /api/subscribe (spam)
- Security headers in next.config: HSTS, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy; CSP report-only first
- Verify CRON_SECRET + service keys are ONLY in env (grep sweep — done
  before, re-verify)

### A4. The last honest-content sweep (2h, me + your sign-off)
Remaining fabrications to fix or delete:
- Testimonials: are ANY real with consent? If none → replace the wall with
  one "Founding story" block (yours) + a "Share your story" CTA. A launch
  with zero testimonials is honest; invented ones are a scandal.
- "TRUSTED BY CLINICS, CHWS..." marquee items (Banner Health, Dignity…):
  reframe to "Data sources: HRSA · NAFC · NPI Registry · SAMHSA" — those are
  TRUE and impressive
- "12,400+" strings → 18,938 everywhere (single source: /api/stats)
- Search page "13,000+ federally verified clinics" → live number
- Sweep for leftover invented metrics: grep for "47K", "284", "91%", "36×"

### A5. Legal/compliance floor (2h, me drafting + you reading)
- NOT HIPAA-covered (no PHI storage as designed; Health Passport is
  local/user-owned) — but say so properly:
- /privacy rewrite: what we collect (anonymous analytics, optional account
  email), what we never collect, GeoIP usage, cookie list
- Medical disclaimer component on triage + crisis + clinic pages: "not
  medical advice; call 911 in emergencies" (exists on some — make universal)
- /terms: liability limitation for clinic data accuracy ("verify hours by
  phone"), already have verified_at badges
- Accessibility statement page (ADA exposure for healthcare is real)

## DAY 2 — Product polish & the seams

### B1. Auth-gated pages mobile sweep (3h, needs a test login from you OR
     seed me a test account)
Dashboard, Passport, Medications, Calendar, Triage — same 375px treatment
the public pages got. Known unknowns; I couldn't see behind login.

### B2. Search experience finishers (3h, me)
- Care-category pick auto-applies the specialty FILTER (not just text)
- "Near me" geolocation button on the search page hero (exists in home bar)
- Clinic detail page: verify it renders DB clinics (ids changed to
  hrsa-* — the clinic_cache lookup path needs a test)
- Map view on mobile: verify Leaflet touch behavior + marker taps
- Empty-state polish: if 75mi widening still returns <3 (remote AK/HI),
  show telehealth + SMS + 211 alternatives block

### B3. The remaining page-by-page seam list (3h, me)
- /eligibility: results screen must link each program to a real application
  URL; mobile form spacing
- /programs: program cards → detail links all resolve
- /stories: submission form works end-to-end into Supabase + admin queue
- /kids: ebook "Read it free" — STILL href="#". Give me the URL or I hide
  the button until you have it
- /telehealth: providers listed are real + current
- Footer link audit: run the broken-links cron manually, fix 404s
- 404/500 pages: on-brand, link back to search

### B4. Observability (2h, me + 2 accounts from you)
- Sentry (errors) + Vercel Analytics or PostHog (behavior): you create the
  two free accounts, I wire the DSN/key
- UptimeRobot on / and /api/clinics?location=85004 (5-min checks)
- Vercel log drain optional

## DAY 3 — Performance, PWA, launch mechanics

### C1. Performance gate (3h, me)
- npm run analyze: hunt >100KB chunks; dynamic-import Leaflet/GSAP-heavy
  pages already done — verify
- Lighthouse mobile on /, /search, /crisis: target ≥90 perf, ≥95 a11y/SEO
- Font/image audit: next/image everywhere, priority on LCP, correct sizes
- The 2.4MB places JSON: confirm it's server-only (never in client bundle)

### C2. PWA/offline (2h, me)
- Crisis page MUST work offline (service worker precache) — life-safety
  feature and a great launch story
- Manifest: name/short_name/theme/icons verified; iOS install banner test
  (you, on your phone)

### C3. SEO & social (1h, me)
- sitemap.xml includes all public pages; robots.ts verified on prod
- OG images render on iMessage/X/WhatsApp (you: share a link, screenshot)
- Google Search Console: you verify domain, submit sitemap

### C4. Launch mechanics (1h, you + me)
- Production env vars final check (the un-paused Supabase keys, VA key,
  CRON_SECRET, NEXT_PUBLIC_APP_URL=real domain)
- Custom domain on Vercel + HTTPS
- Final smoke test ON YOUR PHONE over cellular: land → search → call a
  clinic number (hang up 😄) → triage → crisis offline
- Tag release v1.0.0

═══════════════════════════════════════════════════════════════════
PART B — EVERYTHING ELSE (the full ideas ledger, no time filter)
═══════════════════════════════════════════════════════════════════

You said tell you everything. Ranked by impact-for-uninsured-users:

### Data & search moat (weeks 1–4 post-launch)
1. **Seed the other sources** into the clinics table: CMS Rural Health
   Clinics (~5k), SAMHSA behavioral-health locator download, NPI extracts
   for community/mental-health orgs, migrate NAFC static → table.
   30k→45k rows; rural coverage doubles.
2. **Hours & phone verification loop**: weekly cron pings clinic websites;
   "Report wrong info" button feeds clinic_overrides; verified_at drives
   the freshness badge users already see.
3. **Community verification**: after a visit, one-tap "Was this info
   right?" — the cheapest trust engine ever built.
4. **FindHelp/211 API** (free application, ~3 days): mobile clinics, faith
   free clinics, dental days — the long tail nobody else surfaces.
5. **Medicaid enrollment-assister dataset**: HRSA publishes certified
   assister orgs — pairs perfectly with the eligibility checker.

### Product ideas that could define the brand
6. **Care Plans**: after eligibility/triage, generate a saved, shareable
   checklist ("1. Call Adelante 602-… 2. Bring ID + paystub 3. Ask about
   sliding scale"). Printable. THE retention feature.
7. **SMS-first mode**: the Twilio bot exists — promote it to a first-class
   product ("No internet? Text CLINIC + ZIP to …"). Unreached-population
   story that press loves.
8. **Cost estimator**: FQHC sliding-scale math is public (FPL bands) —
   "household 3, income $2,100/mo → your visit ≈ $25". Nobody does this.
9. **Interpreter flag filter**: language match data exists; make "speaks
   Spanish" a first-class filter chip, not a badge.
10. **"Tonight" mode**: open-now + 24h + ER-rights card in one view for
    the 2am panic search. Your crisis page ethos applied to physical care.
11. **Provider claim flow**: clinics claim their listing (verify via NPI
    phone), update hours, add booking link → data flywheel + future
    revenue path without charging patients.

### Platform & engineering
12. Real E2E tests (Playwright): search→call, eligibility, auth — the four
    flows that must never break; run in CI on every push
13. CI pipeline: typecheck + build + Playwright on GitHub Actions (right
    now main = production with no gate)
14. Staging environment (Vercel preview + separate Supabase project)
15. Migrate NAFC/state lib data into the clinics table; delete dead
    fetchers (state endpoints are corpses in the code)
16. Error budget on /api/clinics: log p95; if fallback fan-out triggers
    >1% you'll see it in Sentry, not user complaints

### Trust & compliance (beyond the floor)
17. SOC2-lite posture doc — clinics/partners will ask
18. WCAG 2.1 AA formal audit (axe + screen-reader pass on core loop)
19. Security.txt + responsible-disclosure page
20. If Health Passport ever syncs to server: THAT crosses into
    HIPAA-adjacent territory — needs BAA-grade thinking BEFORE building

### Growth (when you're ready)
21. Programmatic SEO: 18,938 clinic detail pages + "free clinics in
    {city}" pages — this is how ZocDoc/GoodRx got their traffic empires
22. Partnerships: NAFC, 211s, hospital discharge planners, school nurses
23. Spanish-language landing (not just i18n toggle) — /es with tailored
    messaging; 40% of your audience
24. App Store wrapper (Capacitor) AFTER PWA metrics prove retention

### Deliberately NOT doing (so you stop wondering)
- Appointment booking engine (ZocDoc's decade moat; partner instead)
- Insurance marketplace integration (regulatory swamp; link out to
  healthcare.gov)
- User forums/community (moderation liability in healthcare; stories
  submission flow is the safe version)
- Native app before PWA traction (store review + update friction)

═══════════════════════════════════════════════════════════════════
WHAT I NEED FROM YOU (the complete list)
═══════════════════════════════════════════════════════════════════
1. Test account credentials (or create test@… so I can sweep gated pages)
2. Ebook URL for /kids (or approve hiding the button)
3. Real-testimonial decision: any consented quotes, or founding-story swap?
4. Sentry + PostHog accounts (10 min) → send me DSN + key
5. Google OAuth redirect URLs updated for prod domain (Supabase dashboard)
6. Production domain confirmed in Vercel + NEXT_PUBLIC_APP_URL set
7. Day 3: the phone-over-cellular smoke test with me
8. Google Search Console domain verification
