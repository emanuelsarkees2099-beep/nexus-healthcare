# NEXUS — 5-Day Launch Revolution Plan

**Goal:** Ship the best healthcare-access web app online in 5 days.
**Strategy:** Keep the stack (Next.js 16 + Supabase + Vercel — it's already best-in-class).
Spend all 5 days on the things users actually feel: the core loop, design polish, content depth,
speed, and trust. Cut everything that dilutes.

**Deploy policy:** All work stays local. One final push to Vercel at end of Day 5.

**The core loop everything serves:**
`Land → understand in 5 seconds → find free care near me → take action → come back`

---

## DAY 1 — The Core Loop (Search → Clinics → Action)

This is your ZocDoc moment. If a scared, uninsured person lands here, the path from
"I need help" to "here's a free clinic 2 miles away, open now, here's the phone number"
must be flawless, fast, and emotional.

### Morning: Search & Clinics experience overhaul
- [ ] **Instant-feel search**: skeleton loaders, optimistic UI, sub-200ms perceived response
- [ ] **Clinic cards redesign**: distance, open-now status, services offered, "call now" +
      "get directions" as primary actions (one-thumb reachable on mobile)
- [ ] **Zero-friction entry**: ZIP-only search on the homepage hero itself — no navigation
      required to get value (ZocDoc pattern: search box IS the homepage)
- [ ] **Empty/error states with heart**: no results → show telehealth + SMS + crisis
      alternatives, never a dead end
- [ ] **Geolocation "use my location" button** with graceful denial fallback

### Afternoon: Homepage as a conversion machine
- [ ] **Rewrite hero**: one sentence, one promise, one input. "Free healthcare near you.
      No insurance needed." + ZIP box
- [ ] **Trust bar**: real numbers (clinics indexed, programs listed, states covered) —
      pulled live from /api/stats, not hardcoded
- [ ] **Social proof section**: 2–3 story excerpts from /stories with faces/names (with consent)
- [ ] **"How it works" in 3 steps** with the actual product screenshots, not abstract icons
- [ ] **Sticky mobile CTA**: persistent "Find free care" button on scroll

### Exit criteria
Cold visitor on a phone gets from landing to a clinic phone number in ≤ 3 taps, ≤ 10 seconds.

---

## DAY 2 — Feature Triage: Deepen Winners, Kill Fluff

30 pages is too many for launch. Apple ships fewer things, deeper. Audit ruthlessly.

### Morning: The cut list (merge or remove from nav, keep URLs live)
Candidates to demote from primary nav into a single "Resources" hub page:
- [ ] `/methodology`, `/equity`, `/advocacy`, `/outcomes`, `/impact` → merge the best content
      into ONE "Impact" page; the rest become sections, not pages
- [ ] `/provider`, `/chw`, `/verify` → group under a "For partners" footer section
- [ ] `/calendar`, `/offline` → evaluate: if not fully functional, remove from nav entirely
- [ ] Decide: does `/editorial` earn its place at launch, or fold best articles into pages
      where they're contextually relevant?

Primary nav after cut (target ≤ 6 items):
**Find Care · Eligibility · Medications · Crisis · Stories · Dashboard**

### Afternoon: Deepen the three killer features
- [ ] **Triage (AI)**: this is your differentiator. Polish the conversation UI, add suggested
      quick-reply chips, make it hand off to search/crisis/eligibility with pre-filled context
- [ ] **Eligibility checker**: reduce to fewest possible questions, show progress, end with a
      concrete action plan ("You likely qualify for X — here's the application link")
- [ ] **Health Passport**: add export-to-PDF (users need this at clinic front desks),
      make the empty state teach what it's for
- [ ] **Cross-linking**: every feature ends by pointing to the logical next step in the loop

### Exit criteria
Nav has ≤ 6 items. Every remaining page has a clear job. Triage → action handoff works.

---

## DAY 3 — Design System Unification & Content Quality

Apple-level = nothing feels inconsistent. Hunt down every deviation.

### Morning: Design system sweep
- [ ] **Spacing audit**: one spacing scale everywhere (4/8/12/16/24/32/48/64)
- [ ] **Typography audit**: exactly 5 text styles used app-wide; kill one-off font sizes
- [ ] **Color audit**: consolidate accent usage — one primary accent, purposeful secondary
      (kids purple stays scoped to /kids)
- [ ] **Component consolidation**: one Button, one Card, one Input component; replace ad-hoc
      styled divs across pages
- [ ] **Micro-interactions**: hover/press states on every interactive element, focus rings,
      page-transition consistency, skeleton loaders on all async content
- [ ] **Dark theme depth**: subtle gradients/borders like Linear (1px rgba borders,
      layered surface colors) instead of flat panels

### Afternoon: Content pass (the most underrated Apple trait: words)
- [ ] **Rewrite every headline** for clarity + warmth: 8th-grade reading level, second person,
      verbs first ("Find free clinics" not "Clinic Discovery Portal")
- [ ] **Microcopy**: every button says what happens next; every form field has helper text;
      every error message says how to fix it
- [ ] **Crisis page copy review**: warm, immediate, zero jargon — have a human read it aloud
- [ ] **Spanish-language spot check**: top 5 pages read correctly in ES (48-language i18n
      is a headline feature — make sure the most-used one is excellent)
- [ ] **About page**: tell the founder story. People trust people, not platforms.

### Exit criteria
Screenshot any two pages side by side — they look like the same product, same voice.

---

## DAY 4 — Data, Security, Performance, Accessibility

The invisible excellence layer. This is what makes it *feel* like Apple built it.

### Morning: Database & API hardening
- [ ] **Supabase RLS audit**: verify row-level security on every user-data table
      (user_profiles, outcomes, submissions, bookmarks, push subscriptions)
- [ ] **Rate limiting**: add per-IP rate limits on /api/ai, /api/triage, /api/subscribe,
      /api/submit (Vercel middleware or upstash)
- [ ] **Input validation**: zod schemas on every API route body
- [ ] **New table — saved searches / care plans**: let users save a clinic list; this is the
      retention hook that brings people back
- [ ] **Audit logging table**: admin actions logged (who changed what submission when)

### Afternoon: Performance & accessibility
- [ ] **Bundle analysis** (`npm run analyze`): find and dynamic-import the heavy components
- [ ] **Image audit**: next/image everywhere, correct sizes, priority on LCP images
- [ ] **Core Web Vitals**: target LCP < 2.0s, CLS < 0.05 on homepage + search (mobile)
- [ ] **Accessibility sweep**: keyboard-navigate the whole core loop; aria-labels on icon
      buttons; color-contrast check (healthcare = ADA exposure, this is not optional)
- [ ] **Lighthouse ≥ 95** on home, search, crisis (performance + a11y + SEO)
- [ ] **Offline/PWA verification**: service worker caches the crisis page (must work with
      no signal — that's a life-safety feature and a great story)

### Exit criteria
Lighthouse ≥ 95 across the core loop. RLS verified. Every API validates input.

---

## DAY 5 — QA, Launch Ops, Ship

### Morning: Full QA gauntlet
- [ ] **Auth end-to-end**: signup, login, Google OAuth, password reset, idle timeout, logout
- [ ] **Every form submitted** once with good data, once with garbage
- [ ] **Mobile device pass**: real iPhone Safari + Android Chrome (not just devtools) —
      PWA install, safe-area insets, keyboard behavior on inputs
- [ ] **Cross-browser**: Safari, Chrome, Firefox, Edge on the core loop
- [ ] **404/500 pages**: branded, helpful, link back to search
- [ ] **All external links checked** (run the broken-links cron manually)

### Afternoon: Launch operations
- [ ] **Vercel env vars set** (see Manual Tasks below) — verify with a preview deploy
- [ ] **Sentry** (error tracking) + **PostHog or Vercel Analytics** (product analytics) live
- [ ] **OG images verified**: share a link in iMessage/Twitter/Slack, confirm cards render
- [ ] **sitemap.xml + robots.txt** verified on production domain
- [ ] **Google Search Console**: submit sitemap
- [ ] **Uptime monitoring**: UptimeRobot/BetterStack on / and /api/stats
- [ ] **FINAL PUSH → Vercel → production domain**
- [ ] **Post-deploy smoke test**: core loop on production, on a phone, on cellular

### Exit criteria
Production is live, monitored, indexed, and the core loop works on a real phone.

---

## MANUAL TASKS (only you can do these — spread across the week)

| Task | Needed by |
|---|---|
| Set `NEXT_PUBLIC_APP_URL` in Vercel (production domain) | Day 5 AM |
| Set `TWILIO_AUTH_TOKEN`, `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` in Vercel | Day 5 AM |
| Buy/confirm production domain + connect to Vercel | Day 4 |
| Ebook URL for /kids "Read it free" button | Day 2 |
| Real hero video or approve CSS-gradient fallback (delete placeholder files) | Day 1 |
| 2–3 real user stories with consent for homepage social proof | Day 1 PM |
| Sentry account + DSN, PostHog account + key | Day 5 |
| Google Search Console ownership verification | Day 5 |
| Test Google OAuth with your real Google account | Day 5 AM |
| Read crisis page copy out loud, approve tone | Day 3 |

---

## WHAT WE ARE DELIBERATELY NOT DOING (and why)

- **No stack rewrite** — Next.js + Supabase + Vercel is what the companies you admire use
- **No native app** — the PWA covers it; app stores add weeks and review risk
- **No new auth provider** — Supabase Auth works; switching is risk without user benefit
- **No appointment booking engine** — that's ZocDoc's decade-long moat; you win by being
  the best *finder* for free care, then partner/integrate later
- **No feature additions after Day 2** — from Day 3 onward, only deepening and polish

---

## SUCCESS METRICS AT LAUNCH

- Core loop: landing → clinic phone number in ≤ 3 taps
- Lighthouse ≥ 95 (perf/a11y/SEO) on home, search, crisis
- ≤ 6 primary nav items
- Zero console errors on any page
- Crisis page works offline
- 100% of API routes validated + rate-limited
- RLS confirmed on every user table
