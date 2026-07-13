# NEXUS Health — Master Product Audit
### Reviewed as: Apple HI designer · Linear/Vercel PM · UX researcher · YC founder · principal engineer · staff security engineer · healthcare architect · HIPAA consultant · growth PM · VC · health-system exec

---

## TOP-LINE VERDICT (the brutal part)

**The strongest asset you have is not the design — it's the data.** In three
days the search went from ~2 junk results to 100+ real, HRSA-verified clinics
anywhere in the US in under a second, with typeahead over every city and ZIP.
That is a genuine, defensible product. Almost no free tool does this well.

**The biggest risk is not the code — it's you.** I have watched this surface
get rebuilt ~15 times in a handful of days: dark → light → Attio → blue-pulse →
dark again, hero after hero. That is motion, not progress. A VC would see a
founder polishing the lobby of a building with no confirmed tenants. The
single highest-ROI thing you can do is **stop redesigning and put this in
front of 10 real uninsured people**, watch them try to find care, and fix what
actually breaks. Everything below is worthless next to that.

**The thing that could have ended the company: fabricated medical claims.**
Before this audit the app presented 16 invented patient testimonials, three
fake clinical studies *attributed by name to Stanford, Harvard, and Johns
Hopkins*, and invented outcome statistics ("94% success," "$15M saved,"
"284,000 patients"). For a healthcare product that is not exaggeration — it is
false advertising and, for the fake university studies, arguably fraud. I
removed the worst of it this turn (commit c40083e). **The remaining fabricated
content — CHW ratings, care-breakdown percentages — must go before launch.**

Grade today: **Data B+ · Search A- · Landing craft B · Honesty (pre-fix) F ·
Trust/compliance D · Security C · Testing F · Mobile B- · Overall: a
promising, over-designed, under-validated prototype with a real data moat.**

---

## 1. VISION

- The vision — "free healthcare, found in seconds, for the 26M uninsured" — is
  **genuinely compelling and morally clear.** It passes the test: a stranger
  understands it in five seconds. Keep it.
- Where it's weak: it's a *finder*, and finders get commoditized. "Find free
  clinics" is a feature; "the trusted front door to care for people the system
  ignored" is a company. Evolve the language from *search* to *navigation +
  advocacy* (find → understand eligibility → get the visit → know your rights).
- Investor lens: the TAM story is real (26M uninsured + ~100M with medical
  debt) but the *business* is unclear (see §17). Vision compels; the model
  doesn't yet. That's fine pre-seed, fatal at Series A.

## 2. PRODUCT STRATEGY

- **Moat = the clinic dataset + the routing logic**, not the UI. 18,938
  geocoded HRSA sites, radius search, affordability scoring, auto-widening
  fallback. Deepen this until no one can catch up (add CMS RHC, SAMHSA, NAFC,
  NPI, 211 — see §12). Data + trust is the only durable moat here.
- **Retention is your existential weakness.** Finding a clinic is a one-time
  job. Why does anyone come back? Answer must be built in: saved Care Plans,
  Health Passport that's actually useful, medication refill reminders,
  eligibility re-checks when income changes. Without a reason to return you're
  a Google search with a nicer coat.
- **Network effects**: today, zero. Potential: community verification of clinic
  data ("was this info right?") makes every user improve the product for the
  next — the cheapest, most defensible loop in healthcare. Build it.
- **AI strategy**: currently a triage chat. The real opportunity is AI as the
  *navigator* — reads your situation, checks eligibility, builds the plan,
  drafts what to say on the phone. More on this in §13.

## 3. BRANDING

- **Name**: "NEXUS" is fine but generic and heavily used (there's a NEXUS
  in every vertical). "Nexus Health" is safer. Not worth changing pre-launch;
  flag a trademark search before you spend on it.
- **Logo**: the three-node glyph is clean and reads at small sizes. Keep.
- **Typography**: Bricolage (display) + Inter (body) + JetBrains Mono is a
  strong, modern, non-generic stack. You correctly killed Orbitron and the
  serif. This is your most Apple-grade decision. Leave it alone.
- **Color**: near-black canvas + steel-blue/teal duotone is handsome but reads
  *developer tool* (Linear/Vercel), not *healthcare.* The category leaders
  (One Medical, Oscar, Headway) go **light, warm, and human** because sick
  scared people trust calm daylight, not a dark cockpit. Your instinct to try
  light was right; you retreated too fast. **Recommendation: a light,
  warm-neutral primary theme for the marketing + clinical pages, keep dark as
  an option.** This is a real strategic call, not a nitpick — dark is costing
  you trust with your actual audience.
- **Trust cues**: the thing that makes a health product feel safe isn't glow
  effects — it's *specificity and citations* (HRSA-verified badges, "call to
  confirm hours," real source names). Lean into those, not the aurora.

## 4. LANDING PAGE

- **The Pulse (EKG spine) and Living Proof (real clinics near you on load) are
  genuinely distinctive** — better than most YC landing pages. Living Proof in
  particular is a killer idea: the product answers you before you ask.
- Problems:
  - **Too much motion competing for attention.** Constellation + spotlight +
    Pulse + split-flap word + aurora + border-beam, all at once, on a page for
    stressed people. Pick the Pulse + Living Proof as heroes; dial everything
    else to 50%.
  - **Headline is good** ("Free healthcare, found in seconds") but the cycling
    word adds nothing and risks the "found/deserved" swap reading as gimmick.
    Consider making it static.
  - **The dark theme fights the mission** (see §3).
  - **Social proof is now empty** (I removed the fake wall). You need a real
    one: a founder's story block + "Data sources: HRSA · NAFC · NPI · SAMHSA"
    (true and impressive) + a "Be one of the first to share your story" CTA.
  - **Performance**: 2.4MB places JSON must be server-only (verify it's not in
    the client bundle); GSAP + Leaflet are heavy — confirm code-split. Target
    LCP < 2s mobile.
  - **SEO**: the real traffic engine is programmatic — 18,938 clinic pages +
    "free clinics in {city}" pages. That's how GoodRx/Zocdoc won. Not a
    launch blocker; it's the growth thesis.

## 5. UI DESIGN

- **Design tokens exist and are good** (radius scale, spacing scale, motion
  tokens, semantic colors). But they are **inconsistently applied** — the
  clinic card alone used 5 different border-radii historically. A day of
  enforcing one scale everywhere would visibly raise the polish.
- **No shared component library.** Buttons, cards, inputs are re-styled inline
  on every page. This is the #1 source of the "jumbled, inconsistent" feeling
  you flagged on mobile. Extract `<Button>`, `<Card>`, `<Input>`, `<Pill>`,
  `<Sheet>` primitives. ~2 days; pays back forever.
- **Skeletons/loading**: present in search, missing elsewhere. Standardize.
- **Dark mode is the only mode** for the app shell; a light option matters for
  the audience (§3).
- **Microinteractions**: strong on the landing, thin inside the app. The app
  is where retention lives — invest there, not in more hero flair.

## 6. UX

- **Core loop is genuinely good now**: land → search → real clinics → call.
  Living Proof shortcuts it further. This is the win.
- Friction points:
  - **Onboarding is nonexistent** — first-time users are dropped into a dark
    app with a bottom dock they don't understand. A 3-screen "what NEXUS does /
    it's free & anonymous / find care now" intro would lift activation.
  - **Empty states**: what happens on a search with zero results even at 75mi
    (rural AK/HI)? Must show telehealth + SMS + 211 fallbacks, never a blank.
  - **Feedback**: does the user know a clinic was saved? that the search is
    loading? Audit every async action for a visible response.
  - **Too many nav destinations** for a launch. You have ~25 pages. Users need
    ~6. You did triage the mega-menu — finish the job (CHW, Equity, Advocacy,
    Editorial, Methodology, Outcomes are institutional pages that dilute).

## 7. USER AUTHENTICATION

- Supabase Auth (email + Google OAuth), sessions via `proxy.ts`, protected
  routes + admin gating there. Reasonable foundation.
- **Unverified end-to-end** — nobody has walked signup → verify → login →
  reset → OAuth on the production domain. This is a P0 verification task.
- Missing / to confirm:
  - **MFA**: none. Post-launch for patients; **required** the moment provider/
    admin accounts touch any real data.
  - **Magic link**: referenced in UI ("sign in with email link") — verify it
    actually works.
  - **Apple Sign-In**: absent. Needed if you ever wrap for the App Store
    (Apple requires it when you offer Google).
  - **Rate limiting on auth endpoints** (brute force / credential stuffing):
    confirm it exists on login/signup/reset.
  - **Account recovery** and **session timeout** UX: partially built
    (IdleTimeout component) — verify.

## 8. SECURITY

- Done well: timing-safe cron auth, SMS webhook signature check, secrets in
  env, rate limiting on clinics/places, RLS-capable Supabase.
- **Gaps (ordered by risk):**
  1. **RLS is unverified** on user tables (profiles, outcomes, submissions,
     bookmarks, push). If any is missing an owner-scoped policy, one user can
     read another's data. **P0.**
  2. **zod validation is not universal** on POST bodies (submit, subscribe,
     outcomes, bookmarks, triage, ai). Unvalidated input = injection/abuse
     surface. **P0.**
  3. **Rate limits missing on /api/ai and /api/triage** — LLM endpoints are a
     direct cost-abuse vector (someone scripts your Anthropic bill). **P0.**
  4. **Security headers** (CSP, HSTS, X-Content-Type-Options, Referrer-Policy,
     Permissions-Policy) — confirm they're set in next config. **P1.**
  5. **SSRF**: the clinic search fetches external URLs (Overpass, NPI, geo).
     Ensure no user-controlled URL is fetched server-side. **P1.**
  6. **Dependency audit**: run `npm audit`; no Dependabot/CI scanning today.
  7. **No monitoring** — you'd learn about a breach from Twitter. Sentry is P0.
- Threat model: your worst realistic case pre-scale is **cost-abuse of the AI
  endpoints** and **data leakage via missing RLS.** Both are cheap to close.

## 9. HEALTHCARE COMPLIANCE

- **You are (correctly) architected to avoid HIPAA**: no PHI stored server-side
  as designed; Health Passport is local/user-owned. *Say this explicitly* —
  it's a feature, not a gap. The moment the Passport syncs to your server, or
  you store a symptom tied to an identity, you cross into HIPAA-adjacent
  territory and need BAAs, encryption-at-rest guarantees, audit logs, and a
  compliance program. **Do not build server-side PHI sync casually.**
- **Before launch (non-negotiable):**
  - Universal **medical disclaimer** ("not medical advice; call 911 in an
    emergency") on triage, crisis, clinic, and eligibility pages.
  - **Privacy Policy** that truthfully lists: anonymous analytics, optional
    account email, GeoIP city-level lookup, cookies, and "we never sell your
    data / never store your health searches."
  - **Terms** with a data-accuracy liability limit ("verify hours by phone" —
    you already show verified_at, good).
  - **Consent** on cookie banner (exists) and on any data submission.
  - **Accessibility statement** (ADA litigation against health sites is a real
    and active risk).
- Audit logs for admin actions (who changed which submission) — you have the
  table pattern; wire it.

## 10. PERFORMANCE

- Next 16 App Router + Turbopack, dynamic imports for heavy components, DB-
  first search (<1s), CDN caching on clinics/places. Good bones.
- To verify/fix:
  - **2.4MB places JSON must never reach the client.** Confirm it's imported
    only in server routes.
  - **Lighthouse mobile ≥ 90** on /, /search, /crisis — not yet measured.
  - **LCP**: hero H1 paints pre-JS (you solved this with CSS). Verify still true.
  - **Leaflet map**: lazy-loaded — confirm it's not in the initial search bundle.
  - **Font loading**: `display: swap` set; subset confirmed.
  - **`clinics_near` RPC**: has a GiST index — verify query plan uses it at 40k
    rows (it will; confirm after seeding more sources).

## 11. ARCHITECTURE

- **Folder structure is conventional and fine.** Good separation (lib/,
  components/, app/).
- **Technical debt, ranked:**
  - **Dead code**: the clinic search has ~5 fetchers that never fire (state
    endpoints are corpses, disabled keyed APIs). Delete them — they're
    confusing and a maintenance tax.
  - **No shared UI primitives** (§5) — the biggest structural debt.
  - **Inline styles everywhere** — hard to keep consistent; a design-system
    refactor (Tailwind tokens or CSS modules + primitives) would help.
  - **Zero tests** — see §18.
  - **`any` casts** in a few data-boundary spots (NPI, clinics) — acceptable
    but wrap in typed adapters.
- **Scalability**: the DB-first search scales fine to millions of users
  (indexed read, CDN-cached). The AI/triage endpoints are the cost bottleneck.

## 12. FEATURES — keep / cut / add

**Cut or hide for launch** (institutional bloat that dilutes the core):
CHW directory (fictional people — cut or clearly mark demo), Equity Lab,
Advocacy, Editorial, Methodology, Outcomes (fabrication-dense — rebuild or
hide), Provider hub (until real). Ship ~6 destinations, not 25.

**Keep + deepen:** Search, Eligibility, Triage, Medications, Crisis, Health
Passport, Programs, Stories (as submission, not fake wall), Kids.

**The 20 highest-impact additions** (of 100+; ranked):
1. **Care Plans** — saved, printable "call this number, bring these docs, ask
   for sliding scale" checklists. THE retention feature.
2. **Sliding-scale cost estimator** — FQHC fee math is public (FPL bands):
   "household 3, $2,100/mo → visit ≈ $25." Nobody does this. Killer.
3. **Community data verification** — "was this info right?" one-tap. Cheapest
   trust + network-effect loop in healthcare.
4. **SMS-first mode** — promote your Twilio bot to a headline feature for the
   unconnected. Press-worthy.
5. **"Tonight" mode** — open-now + 24h + ER-rights, for the 2am search.
6. **Real clinic detail pages** with hours, services, languages, directions,
   "report wrong info" — also your SEO engine.
7. **Interpreter/language filter** as a first-class chip.
8. **Eligibility → application deep links** (real Medicaid/ACA URLs per state).
9. **Medication price + assistance lookup** (GoodRx-style, but free-care first).
10. **Appointment-prep AI** — "here's what to say, what to bring, what it costs."
11. **Provider claim flow** — clinics verify + maintain their listing (flywheel).
12. **Saved searches + change alerts** (new clinic opens near you).
13. **Offline crisis + saved clinics** (PWA precache — life-safety).
14. **Insurance-bridge** — detect likely-eligible, hand off to healthcare.gov.
15. **Referral/share** — "text these 3 clinics to a friend."
16. **Multi-language landing pages** (/es), not just a toggle — 40% of audience.
17. **Screener quick-triage** on the home page (symptom → right care level).
18. **Family profiles** (parent managing kids' care).
19. **Dental-day / free-event calendar** (real, sourced).
20. **Post-visit outcome capture** — the honest version of the data you faked.

## 13. AI

- Today: a triage chat. Underused.
- The real play: **AI as navigator, not chatbot.** One assistant that (a) reads
  a plain-language situation, (b) determines care level (ER vs clinic vs
  telehealth) with honest cost framing, (c) checks likely program eligibility,
  (d) generates a Care Plan, (e) drafts the phone script. That's a product no
  incumbent has, and it's mostly orchestration over things you already have.
- Guardrails are mandatory: **never diagnose**, always route emergencies to
  911/988, cite sources, log nothing identifiable. A bad AI answer in
  healthcare is a lawsuit; constrain it hard.
- Cost control: rate-limit + cache aggressively; these endpoints are your
  biggest variable cost and abuse surface.

## 14. ACCESSIBILITY

- Partial: ARIA on the new typeahead, reduced-motion handling, skip-nav.
- Gaps: **no formal WCAG pass**, contrast unverified on the dark theme (blue on
  near-black is borderline for AA), focus states inconsistent, screen-reader
  walk of the core loop never done, touch targets fixed on mobile (good) but
  not audited app-wide. For a health product serving disabled and elderly
  users, **AA compliance is both an ethical duty and ADA-litigation insurance.**
  Run axe + a manual screen-reader pass on the core loop. P1.

## 15. MOBILE

- You did real work here (FAB stack, 16px input floor, overflow clip, cookie
  sheet, search-header compaction). It's meaningfully better.
- Still needed: **auth-gated pages never swept** (dashboard, passport,
  medications, triage) — I couldn't see behind login. Real-device testing
  (iOS safe-area, keyboard avoidance, rubber-banding) is irreplaceable — the
  emulator lies. App Store path = Capacitor/PWABuilder wrapper *after* PWA
  retention is proven; Apple will reject a thin wrapper with no native value,
  so lead with offline + push + Apple Sign-In.

## 16. GROWTH

- **Programmatic SEO is the whole game** (§4): clinic pages + city pages.
  This is a months-long compounding asset — start the infrastructure now.
- Referral loop: "share these clinics" is natural and viral in this category.
- Retention: notifications (eligibility re-check, new nearby clinic), email
  digests — but only with real consent and real value, no dark patterns.
- Analytics: **you have none.** You cannot improve what you can't see. PostHog
  or Vercel Analytics is P0 — funnel from land → search → clinic-click → call.

## 17. BUSINESS

- **The hard question a VC will ask: how does this make money without betraying
  the mission?** You cannot charge uninsured people. Honest models, ranked:
  1. **Provider-side** — clinics/FQHCs pay to claim + enhance listings, get
     referrals, see demand data. (Zocdoc's model, aimed at safety-net orgs +
     grants.)
  2. **Payer/Medicaid MCO partnerships** — plans pay to route their members to
     the right care (reduces their ER costs). Real budget here.
  3. **Grants + philanthropy** — RWJF, state health depts, hospital community-
     benefit dollars (hospitals are *required* to spend these).
  4. **Employer/benefits** — a "find affordable care" benefit for hourly/gig
     workforces.
  5. **Anonymized, aggregated demand data** for public-health researchers
     (carefully, ethically, never individual).
- Do NOT: sell patient data, run ads against sick people, or gate care behind
  a paywall. Any of those kills the brand.

## 18. DEVELOPER EXPERIENCE

- **No tests, no CI, main = production with no gate.** This is the scariest
  operational fact. One bad push takes down a healthcare tool people rely on.
  - **P0**: GitHub Actions running typecheck + build on every PR.
  - **P1**: Playwright E2E on the four flows that must never break (search→call,
    eligibility, auth, crisis-loads-offline).
  - **P1**: Sentry (errors) + uptime monitoring.
  - **P2**: staging environment (Vercel preview + separate Supabase).
  - TypeScript strictness is on (good). ESLint present. Add `npm audit` to CI.

## 19. DESIGN INSPIRATION — what to steal from whom

- **One Medical / Oscar** — warm, light, human health UI. Steal the palette
  courage and the calm.
- **Linear** — the app-shell craft, keyboard-first, motion restraint. You
  already borrow this; keep the restraint, drop the darkness for marketing.
- **Stripe** — documentation-grade clarity, trust through precision. Steal the
  "every number is real and sourced" ethos.
- **Arc / Vercel** — the dark-product-on-light-marketing split, product-as-hero
  screenshots (your Living Proof is this idea, done better because it's live).
- **Headway** — how to make finding a scary service (therapy) feel safe and
  simple. Study their onboarding.
- **Airbnb** — map + list search patterns, trust via reviews/verification.
- **Calm** — emotional design for stressed users; the crisis page should feel
  like this.
- **Ramp / Cedar** — dense financial data made legible; your cost estimator
  should look like this.

## 20. FUTURE VISION (v10.0)

If NEXUS became a major American healthcare company: **the trusted navigation
layer for everyone the system fails.** Not a clinic finder — the place you go
the moment you're sick and scared and don't know what you can afford. It knows
your likely eligibility, builds your plan, books or preps the visit, tracks
your meds, holds your records *for you*, speaks your language, works by text
for the unconnected, and advocates for your rights (EMTALA, sliding scale,
charity care). It's funded by the payers and providers who save money when
people get the right care early — never by the patients. It's the anti-Zocdoc:
built for the bottom of the market that everyone else ignored, and it owns that
market because no one else cared to serve it well.

---

# MASTER ROADMAP

## PHASE 1 — CRITICAL BEFORE LAUNCH (your 3 days)  [P0]

| # | Item | Why | Effort | Owner |
|---|------|-----|--------|-------|
| 1 | Finish honest-content sweep (CHW ratings, outcomes %, any remaining) | Fabrication = launch-ending liability | 3h | me |
| 2 | RLS audit on all user tables | Cross-user data leak | 1h me + 5m you | both |
| 3 | zod validation on all POST routes | Injection/abuse | 3h | me |
| 4 | Rate-limit /api/ai + /api/triage | Cost abuse | 1h | me |
| 5 | Security headers (CSP/HSTS/etc.) | Baseline hardening | 2h | me |
| 6 | Auth flow E2E verification (+OAuth prod redirect) | Broken login = no product | 2h | you+me |
| 7 | Universal medical disclaimer + Privacy/Terms rewrite | Legal floor | 3h me + your read | both |
| 8 | Sentry + analytics wired | Fly-blind = fatal | 1h me + accounts you | both |
| 9 | Real social proof (founder story + data sources + share CTA) | Empty landing | 2h | me+you |
| 10 | Nav cut to ~6 destinations | Focus | 1h | me |
| 11 | Lighthouse ≥90 + verify places JSON server-only | Speed/cost | 2h | me |
| 12 | Crisis page works offline (PWA precache) | Life-safety + story | 2h | me |
| 13 | Final phone-over-cellular smoke test | Ship confidence | 1h | you+me |

## PHASE 2 — FIRST MONTH  [P1]

Component-library extraction (Button/Card/Input/Sheet) · light theme for
marketing+clinical · Care Plans v1 · cost estimator v1 · clinic detail pages ·
CI (typecheck+build+Playwright) · WCAG AA pass · seed CMS/SAMHSA/NAFC/NPI into
clinics table · onboarding flow · community "was this right?" verification ·
eligibility→application deep links · empty-state fallbacks · delete dead code.

## PHASE 3 — NEXT SIX MONTHS  [P2]

Programmatic SEO (clinic + city pages) · AI navigator (plan + phone script +
eligibility) · SMS-first product · provider claim flow · Spanish landing ·
FindHelp/211 integration · saved searches + alerts · staging environment ·
provider/payer pilot conversations · MFA + audit logs · App Store wrapper
(after PWA retention proven).

## PHASE 4 — LONG-TERM  [P3]

Payer/Medicaid-MCO routing contracts · employer benefit product · public-health
data platform (ethical, aggregated) · full care-navigation ecosystem
(records + meds + rights + advocacy) · become the safety-net front door
nationally.

---

# WHAT I NEED FROM YOU (unblocks the most work)

1. **Test account** (or make test@… ) so I can sweep the auth-gated pages.
2. **Testimonials decision**: any real, consented quotes — or ship with the
   founder-story + "be the first" version?
3. **Ebook URL** for /kids (or approve hiding the button).
4. **Sentry + PostHog** free accounts (10 min) → send DSN + key.
5. **Google OAuth** redirect URLs for the prod domain (Supabase dashboard).
6. **Theme call**: try the light/warm marketing theme, or commit to dark?
7. Confirm production domain + `NEXT_PUBLIC_APP_URL`.
8. 10 real uninsured testers (the single highest-value thing you can do).
