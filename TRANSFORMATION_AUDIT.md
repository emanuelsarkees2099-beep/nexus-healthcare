# NEXUS HEALTH — Master Product Transformation Audit

Written after a full inspection of the codebase across many sessions: every
page, component, API route, the clinics data layer, auth via Supabase +
proxy.ts, the design-token system, the service worker, and the dependency set.

This is the excellence blueprint — not the 3-day launch list (that's
`LAUNCH_READINESS.md`). Here, nothing is off the table for cost or time.

**How to read the effort/priority tags:**
Effort = rough engineering weeks for one strong full-stack dev.
P0 = launch-blocking · P1 = first month · P2 = first 6 months · P3 = strategic.

---

# 0. THE ONE-PARAGRAPH TRUTH

NEXUS's durable asset is its **data + routing** (18,938 geocoded clinics, every
US city/ZIP, sub-second radius search) — not its UI, which has been rebuilt ~15
times. The product is a strong *finder* with no *retention loop*, no *revenue
model*, no *tests/CI*, and — until this week — fabricated medical claims. The
transformation thesis: **turn a clinic finder into the trusted care-navigation
layer for the 26M uninsured**, monetized by payers/providers (never patients),
defended by a data + community-verification moat, and operated with the
engineering rigor of a product people's health depends on.

---

# 1. PRODUCT VISION & STRATEGY

**Current state.** Clear, moral mission ("free healthcare, found in seconds").
A finder with a genuinely good core loop. No stated business model, no
retention mechanic, no network effect.

**Critical problems.**
- Finders commoditize; "find free clinics" is a feature, not a company.
- Retention is structurally absent — finding a clinic is a one-time job.
- No revenue path that doesn't betray the mission (can't charge the uninsured).

**Hidden weaknesses.** Single founder, repeated surface rebuilds instead of
demand validation. No design partner, no real users, no data on whether people
actually reach care.

**Missed opportunities.** The dataset could become the *system of record* for
safety-net care access — a place payers, FQHCs, and researchers pay to reach.

**Short-term.** Reposition messaging from *search* to *navigation + advocacy*
(find → afford → get the visit → know your rights). Ship one retention hook
(Care Plans). Recruit 10 real uninsured testers. **P0–P1, 1–2wk.**

**Long-term.** Payer/Medicaid-MCO routing contracts; provider claim-and-manage
flywheel; anonymized public-health demand data platform. **P2–P3, quarters.**

**Innovative ideas.** "Care Passport" that travels with the patient across
clinics; a trust graph where community verification compounds; an advocacy
engine that auto-asserts EMTALA/sliding-scale rights.

**Priority roadmap.** P0 reposition + testers → P1 Care Plans + first provider
convos → P2 payer pilot → P3 national navigation layer.

**Risks.** Mission drift toward monetizable-but-harmful features; incumbents
(Zocdoc/GoodRx) moving down-market; grant dependency.

**Success metrics.** Weekly returning users, % who reach a real clinic
(call/visit confirmed), payer/provider LOIs, clinic-data coverage.

---

# 2. UI DESIGN

**Current state.** A real token system (radius/spacing/type/motion), dark
duotone theme (steel-blue + teal), Bricolage/Inter/Mono stack. Distinctive
landing (Pulse EKG spine, Living Proof, constellation).

**Critical problems.**
- **No shared component library.** Buttons/cards/inputs are re-styled inline on
  every page — the #1 source of visual inconsistency.
- **Tokens applied inconsistently** (historic 5-value radius drift on one card).
- **Dark-only.** The audience (scared, older, low-vision) trusts light/warm UI;
  category leaders (One Medical, Oscar) are light. Dark reads "dev tool."

**Hidden weaknesses.** Inline styles make theming, contrast fixes, and a design
refresh expensive. Motion is heavy on the landing, thin inside the app (where
retention lives).

**Missed opportunities.** A true design system unlocks a light theme, faster
iteration, and consistent polish for near-free thereafter.

**Short-term.** Extract `<Button> <Card> <Input> <Pill> <Sheet> <Stat>`
primitives; migrate the top 5 pages to them; enforce one radius/space scale.
**P1, 1–2wk.**

**Long-term.** Full design-system package (tokens → primitives → patterns →
docs), light + dark themes, a Figma source of truth. **P2, 3–4wk.**

**Innovative ideas.** A "calm mode" for crisis/high-stress flows (Calm-style
reduced visual load); density toggle for CHWs/providers.

**Risks.** A half-migrated system is worse than none — commit to finishing the
primitive migration once started.

**Success metrics.** % of UI using primitives, contrast pass rate, time-to-ship
a new page, visual-consistency review score.

---

# 3. UX

**Current state.** Strong core loop; Living Proof shortcuts it. Typeahead over
every US place. Good search empty-state.

**Critical problems.** No onboarding (users dropped into a dark app + unexplained
dock). Too many destinations historically (mitigated). Feedback gaps on some
async actions.

**Hidden weaknesses.** No first-run "it's free, anonymous, here's how" moment;
no persistent "what do I do next" guidance after a search.

**Missed opportunities.** Delight moments (save→plan, share→friend), a "next
best action" engine, progress through a care journey.

**Short-term.** 3-screen onboarding (free/anonymous/find-care); a "next step"
CTA after every result set; audit each async action for a visible response.
**P1, 1wk.**

**Long-term.** Journey model (search → chosen clinic → prep → visit → follow-up)
with saved state; personalized home for returning users. **P2, 3wk.**

**Innovative ideas.** "Bring-this-to-the-visit" checklist auto-generated from
the clinic + program; a warm handoff to a CHW; a post-visit "did you get care?"
one-tap that also feeds honest outcomes.

**Risks.** Onboarding friction for a tool whose value is immediacy — keep it
skippable and <10s.

**Success metrics.** Activation (search within first session), step-completion
through the journey, return rate, task-success in usability tests.

---

# 4. FRONTEND ARCHITECTURE

**Current state.** Next 16 App Router + Turbopack; dynamic imports for heavy
components; sensible folders. TypeScript strict.

**Critical problems.** **Zero tests.** Inline styles everywhere. Some `any` at
data boundaries. No component primitives (see §2).

**Hidden weaknesses.** State is local-per-page; no shared client cache (repeated
fetches). Large page files (search/page.tsx is ~1,200 lines).

**Missed opportunities.** A typed data layer (React Query/SWR) would cut
refetches, add caching, and simplify pages.

**Short-term.** Introduce a query client for clinics/places/stats; split the
search page into subcomponents; wrap data-boundary casts in typed adapters.
**P1–P2, 2wk.**

**Long-term.** Component library package; module boundaries (features/); Storybook
for primitives. **P2, 3wk.**

**Risks.** Refactoring the search page (highest-traffic) without tests is risky —
add characterization tests first.

**Success metrics.** Test coverage on core flows, bundle size, page LOC, refetch
count, TS `any` count.

---

# 5. BACKEND

**Current state.** Supabase (Postgres + RLS) + Next route handlers. Owned
clinics table with earthdistance radius RPC; DB-first search with live-API
fallback; in-memory GeoNames index; timing-safe cron; SMS webhook verified.

**Critical problems.** In-memory rate limiter (per-instance — resets on deploy,
not shared across serverless instances). No queue for background work (emails,
cache writes are fire-and-forget). Logging is `console.*` only.

**Hidden weaknesses.** The clinics table is seeded once; freshness depends on a
manual re-run. `clinic_cache` write path is best-effort. No structured logs,
no request tracing.

**Missed opportunities.** Seed CMS/SAMHSA/NAFC/NPI to reach ~45k clinics; a real
job queue; a materialized stats view for the honest counters.

**Short-term.** Move rate limiting to Upstash Redis (shared, durable); add
structured logging; seed the remaining clinic sources. **P1–P2, 2wk.**

**Long-term.** Background job system (Inngest/QStash) for emails, seeding,
verification; read replicas if needed; API versioning. **P2–P3.**

**Innovative ideas.** A nightly "clinic freshness" job that pings sites and
flips verified_at; a demand heatmap materialized from anonymous searches.

**Risks.** Serverless cold starts on the 2.4MB places JSON (load once/instance —
acceptable, monitor). Redis adds a dependency + cost.

**Success metrics.** p95 search latency, rate-limit correctness under load, job
success rate, clinic freshness age distribution.

---

# 6. AUTHENTICATION & AUTHORIZATION

**Current state.** Supabase Auth (email + Google), sessions + protected routes +
admin gating in proxy.ts. Now: rate-limited login/signup/reset, signup privilege
guard.

**Critical problems.** No MFA. No Apple Sign-In (App Store requires it if Google
is offered). Unverified end-to-end on the prod domain. RLS unverified (SQL ready).

**Hidden weaknesses.** Long-lived cookies (365d) — consider shorter + refresh.
Admin role is a DB field; ensure it can't be self-set (signup guard added; verify
no other write path).

**Short-term.** Run the RLS SQL; verify auth E2E; shorten session lifetime with
refresh. **P0.**

**Long-term.** MFA (TOTP) for accounts, required for admin/provider; Apple
Sign-In; magic-link polish; enterprise SSO for provider orgs. **P2–P3.**

**Risks.** Locking out users with over-strict RLS (mitigated by the staged SQL);
OAuth misconfig in prod.

**Success metrics.** Auth success rate, % with MFA (admin), zero cross-user data
access in a pen test, session-hijack resistance.

---

# 7. SECURITY

**Current state.** Strong: full headers + CSP, timing-safe cron, SMS signature
check, secrets in env, rate limits on all POST + AI endpoints, zod validation,
signup privilege guard, deps audited (2 moderate transitive left).

**Critical problems.** RLS unverified (the one open item). In-memory rate limiter
isn't shared across instances (bypassable at scale). No WAF/bot protection.

**Hidden weaknesses.** SSRF surface in clinic fallback fetchers (they hit fixed
hosts — low risk, but validate no user-controlled URLs). No secret rotation
policy. No security.txt / disclosure path.

**Short-term.** RLS; move rate limiting to Redis; add security.txt + a disclosure
email. **P0–P1.**

**Long-term.** WAF (Vercel/Cloudflare), automated dependency scanning in CI,
periodic pen test, secret rotation, threat model doc. **P2.**

**Risks.** A single missed RLS policy = cross-user leak — treat the RLS audit as
release-gating.

**Success metrics.** Clean pen test, 0 criticals in CI scans, RLS coverage 100%
of user tables, mean-time-to-patch.

---

# 8. PRIVACY & HEALTHCARE READINESS

**Current state.** Correctly architected to AVOID HIPAA (no server-side PHI;
Passport is local). Strong, honest Privacy + Terms. Universal medical disclaimer
now wired. Accessibility statement added.

**Critical problems.** The privacy page's RLS claim must be TRUE (pending SQL).
No audit logging of admin actions yet. Consent is basic.

**Hidden weaknesses.** GeoIP + search terms, while not stored, transit third
parties (ipapi in dev) — document precisely. No data-retention automation.

**Short-term.** Verify RLS to make the privacy claim true; wire admin audit
logs; confirm no PHI can be entered/stored. **P0–P1.**

**Long-term.** If Passport ever syncs server-side → full HIPAA program (BAAs,
encryption-at-rest guarantees, audit trails, risk assessment) BEFORE building.
SOC2-lite posture doc for partners. **P2–P3.**

**Risks.** Casual server-side PHI sync would trigger HIPAA obligations
retroactively — gate that hard.

**Success metrics.** RLS verified, audit-log coverage, consent completion, zero
PHI in storage (verified), partner security-review pass.

---

# 9. PERFORMANCE

**Current state.** DB-first search <1s; code-splitting; CDN caching; 2.4MB places
JSON confirmed server-only; SW offline. Font subsetting + swap.

**Critical problems.** No measured Lighthouse baseline. Landing runs many
simultaneous animations (constellation + spotlight + Pulse + aurora). Leaflet is
heavy.

**Hidden weaknesses.** In-memory places index adds cold-start memory per
instance. No image pipeline audit (next/image usage unverified everywhere).

**Short-term.** Lighthouse pass on /, /search, /crisis (target ≥90 mobile);
reduce concurrent hero animations; verify next/image + priority on LCP. **P1, 3d.**

**Long-term.** Edge-cache the clinics API responses; consider a KV/edge store for
the hot places lookups; RUM via Speed Insights (already wired). **P2.**

**Risks.** Over-optimizing the landing at the expense of the distinctive feel —
keep the Pulse, trim the rest.

**Success metrics.** LCP <2s mobile, CLS <0.05, Lighthouse ≥90/95/95
(perf/a11y/SEO), search p95 <1s.

---

# 10. FEATURES (keep / redesign / expand / cut + new)

**Keep + deepen.** Search, Eligibility, Triage, Medications, Crisis, Health
Passport, Programs, Stories (as submission), Kids, the honest CHW directory,
honest Impact.

**Redesign.** Onboarding (build it), clinic detail (add hours verification +
booking link), Passport (make it genuinely useful + PDF export).

**Cut/hide from prominence.** Equity Lab, Editorial, Methodology, Advocacy,
Provider (until real) — footer-only, low priority.

**Top 20 new features (ranked).**
1. **Care Plans** — saved, printable "call X, bring Y, ask for sliding scale."
2. **Sliding-scale cost estimator** — public FPL math → "your visit ≈ $25."
3. **Community data verification** — "was this right?" one-tap.
4. **SMS-first mode** — promote the Twilio bot as a headline product.
5. **Real clinic detail pages** (also the SEO engine).
6. **"Tonight" mode** — open-now + 24h + ER-rights for the 2am search.
7. **Interpreter/language filter** as a first-class chip.
8. **Eligibility → application deep links** (per-state).
9. **Medication price + assistance lookup**.
10. **Appointment-prep AI** (what to say/bring/expect).
11. **Provider claim flow** (data flywheel + revenue path).
12. **Saved searches + "new clinic near you" alerts**.
13. **Family profiles** (parent managing kids' care).
14. **Insurance-bridge** → healthcare.gov handoff for likely-eligible.
15. **Referral/share** — "text these 3 clinics to a friend."
16. **Spanish landing** (/es), not just a toggle.
17. **Home-page quick screener** (symptom → care level).
18. **Free dental-day / event calendar** (sourced).
19. **Post-visit outcome capture** (the honest version of the faked data).
20. **Rights advocate** — auto-generated EMTALA/charity-care scripts.

Each: high user impact, mostly orchestration over existing data. Effort ranges
0.5–3wk; priorities P1 (1–6) to P2/P3 (rest).

---

# 11. AI

**Current state.** Triage (Anthropic, structured, guardrailed) + a Groq nav
chat. Rate-limited, input-capped, "never diagnose" prompts.

**Critical problems.** Underused — it's a chatbot, not a navigator. No caching
(cost). No eval harness for answer quality/safety.

**Missed opportunities.** AI as the **navigator**: situation → care level +
honest cost → eligibility → Care Plan → phone script — mostly orchestration over
data you already have.

**Short-term.** Add response caching; a safety eval set (emergencies always
route to 911/988); wire triage → search with context. **P1, 1–2wk.**

**Long-term.** The full navigator; personalization for returning users;
provider-side AI (intake prep); multilingual quality evals. **P2–P3.**

**Innovative ideas.** "Explain my bill," "translate this denial letter," "what
are my rights here" — document-understanding for the underserved.

**Risks.** A wrong medical answer = lawsuit. Constrain hard, log nothing
identifiable, eval before every prompt change.

**Success metrics.** Eval pass rate (safety + accuracy), cost/session, triage→
action handoff rate, user-rated helpfulness.

---

# 12. MOBILE

**Current state.** Real work done (FAB stack, 16px input floor, overflow clip,
cookie sheet, compact search header, safe-area insets). PWA manifest + SW.

**Critical problems.** Auth-gated pages never swept at phone width (need a test
login). No real-device testing (emulator lies about safe-area/keyboard).

**Short-term.** Sweep dashboard/passport/medications/triage at 375px; real-device
pass; Apple Sign-In for store path. **P0–P1.**

**Long-term.** Capacitor wrapper AFTER PWA retention is proven (Apple rejects
thin wrappers — lead with offline + push + native value). **P2.**

**Success metrics.** Real-device task success, PWA install rate, mobile
Lighthouse, crash-free sessions.

---

# 13. ACCESSIBILITY

**Current state.** ARIA on new components, reduced-motion handling, skip-nav,
16px inputs, statement page added. No formal audit.

**Critical problems.** Contrast borderline on the dark theme (blue-on-near-black).
No screen-reader pass on the core loop. Focus states inconsistent.

**Short-term.** axe pass + manual screen-reader walk of search/triage/crisis;
fix contrast failures; standardize focus rings. **P1, 1wk.**

**Long-term.** Formal WCAG 2.1 AA certification; wire the orphaned
AccessibilityControls (font-size/contrast toggles); inclusive-design review with
disabled users. **P2.**

**Risks.** ADA litigation against health sites is active — treat AA as insurance.

**Success metrics.** axe 0 criticals, AA contrast pass, screen-reader task
success, keyboard-only completion of core loop.

---

# 14. BRANDING

**Current state.** Strong type stack, clean 3-node logo, distinctive dark
landing. Name "NEXUS" is generic/common.

**Critical problems.** Dark theme fights the trust conventions of the audience.
Trademark risk on "NEXUS." Empty social proof (fake wall removed → DataSources
added).

**Short-term.** Trademark search; light/warm variant test; founder-story block
for real trust. **P1.**

**Long-term.** Full brand system (voice, motion, illustration language); a
memorable healthcare-native identity beyond "dev-tool dark." **P2.**

**Success metrics.** Brand-recall in tests, trust rating, conversion on the
landing, unaided differentiation vs. competitors.

---

# 15. GROWTH

**Current state.** SEO scaffolding (sitemap, OG, robots). Analytics wired
(PostHog) but keyless. No referral/retention loops.

**Critical problems.** **Programmatic SEO is the whole growth thesis and isn't
built** — 18,938 clinic pages + "free clinics in {city}" pages (how GoodRx/Zocdoc
won). No analytics data yet (no key). No email/notification retention.

**Short-term.** Set the PostHog key; instrument the land→search→clinic-click→call
funnel; ship a referral share. **P1, 3–5d.**

**Long-term.** Programmatic clinic + city pages (months-long compounding asset);
lifecycle email (eligibility re-check, new nearby clinic); partnerships (211s,
NAFC, discharge planners). **P2–P3.**

**Innovative ideas.** "Clinic near you just opened" alerts; a shareable "care map"
for a friend; CHW/discharge-planner referral portal.

**Risks.** Thin programmatic pages get penalized — each clinic page must have
real, unique, useful content (hours, services, rights, directions).

**Success metrics.** Organic sessions, funnel conversion, K-factor (referrals),
retained users, email engagement.

---

# 16. DEPLOYMENT & PRODUCTION

**Current state.** Vercel + GitHub, main = production. Sentry pre-wired. No CI
gate, no staging, no tests.

**Critical problems.** **No CI** — one bad push breaks a health tool with no
gate. No staging environment. No automated backups verification (Supabase does
backups; confirm + test restore).

**Short-term.** GitHub Actions: typecheck + build on every PR; branch protection
on main; confirm Supabase backups + a test restore. **P1, 2–3d.**

**Long-term.** Staging (Vercel preview + separate Supabase); Playwright E2E in
CI on the four critical flows; blue-green/canary releases; on-call + runbook.
**P2.**

**Success metrics.** CI pass gate on 100% of merges, MTTR, failed-deploy rate,
restore-test success.

---

# 17. DEVELOPER EXPERIENCE

**Current state.** TS strict, ESLint present. No tests, no CI, no Storybook,
sparse docs.

**Critical problems.** Zero automated tests is the scariest operational fact for
a health product.

**Short-term.** Playwright E2E on search→call, eligibility, auth, crisis-offline;
CONTRIBUTING + architecture README; CI. **P1, 1–2wk.**

**Long-term.** Unit tests on lib/ (scoring, geocode, care-suggest); Storybook for
primitives; PR templates + review checklist. **P2.**

**Success metrics.** Coverage on critical paths, green-CI rate, onboarding time
for a new dev, review turnaround.

---

# 18. FUTURE INNOVATION (beyond today's category)

- **The Care Passport** — a portable, patient-owned record that travels across
  safety-net clinics, ending the "start over every visit" tax.
- **Rights Advocate AI** — reads a bill/denial and generates the exact appeal or
  EMTALA/charity-care assertion, in the user's language.
- **Demand-signal public good** — anonymized, aggregated "where care is needed"
  data that helps states/FQHCs allocate resources (ethical, never individual).
- **Community trust graph** — verification and reviews from real users +
  CHWs compound into the most trusted safety-net dataset in the country.
- **SMS/USSD for the unconnected** — full care navigation with no smartphone.
- **Discharge-planner portal** — hospitals hand patients to NEXUS at discharge,
  closing the loop that causes readmissions.

---

# 19. UNIFIED MASTER ROADMAP (P0 → P3)

## P0 — Before public launch (this week)
| Task | Effort | Owner | Success metric |
|---|---|---|---|
| Run RLS SQL + verify no cross-user access | 0.5d | you+me | RLS on 100% user tables |
| Prod env vars + OAuth redirect | 0.5d | you | auth works in prod |
| Auth E2E on device | 0.5d | you | all flows pass |
| Auth-gated mobile sweep | 1d | me (needs login) | no broken pages at 375px |
| Lighthouse ≥90 core loop | 0.5d | you+me | ≥90 mobile |
| Cellular smoke test → tag v1.0.0 | 0.5d | you | 5/5 flows pass |

## P1 — First month
Component library + primitives · light theme · Care Plans v1 · cost estimator ·
onboarding · CI (typecheck+build+Playwright) · WCAG AA pass · seed
CMS/SAMHSA/NAFC/NPI · analytics funnel · Redis rate limiting · clinic detail
pages · empty-state/telehealth polish · founder-story social proof.

## P2 — First 6 months
Programmatic SEO (clinic + city pages) · AI navigator · SMS-first product ·
provider claim flow · Spanish landing · staging env · MFA + admin audit logs ·
background job queue · community verification · design-system package + Storybook.

## P3 — Strategic
Payer/Medicaid-MCO routing contracts · employer product · Care Passport · Rights
Advocate AI · demand-signal platform · discharge-planner portal · App Store
wrapper (post-PWA-retention) · SOC2-lite.

---

# 20. SELF-CRITIQUE — is this plan at its peak?

**Where it's strong.** Grounded in the actual codebase (not generic); honest
about what's already built; ties every area back to the two real levers (data
moat + retention); sequences safety/integrity first.

**Where it could be sharper (and the fix):**
1. *Risk of breadth over focus.* 20 features + 18 areas can dilute. **Fix:** the
   P0/P1 list is deliberately short; treat P2/P3 as an options menu, not a
   commitment.
2. *The light-theme call is unresolved* and blocks the design-system direction.
   **Fix:** make it the first P1 decision; everything design flows from it.
3. *Retention is asserted, not proven.* **Fix:** Care Plans is the single bet;
   instrument it and kill it fast if return-rate doesn't move.
4. *Business model needs one concrete first dollar.* **Fix:** P1 adds "one
   provider/payer discovery conversation" as a task, not just P3 strategy.
5. *Testing debt is the biggest silent risk.* **Fix:** promote characterization
   tests on search to P0-adjacent (before any search refactor).

**Verdict.** The plan is comprehensive and correctly sequenced. Its one weakness
is the temptation to build breadth before validating the retention + revenue
bets — so execution must stay ruthlessly P0→P1, proving each bet before funding
the next. With that guardrail, this is the peak version.
