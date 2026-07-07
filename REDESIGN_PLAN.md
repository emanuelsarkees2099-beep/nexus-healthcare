# NEXUS — Dark Design Restoration & "Engineered, Not Vibe-Coded" Plan

Goal: return to the original dark identity, then raise it to the standard of a
team that ships for a living. The tell of vibe-coded UI is inconsistency and
decoration without intent. The fix is systems, not more effects.

---

## Phase 0 — Revert to dark (30 min)

- Remount the dark landing in `app/page.tsx` (Hero, Stats, HowItWorks,
  Features, Testimonials, CTA — all still exist in `components/`)
- Restore original Nav/Footer mounting (HomeClientShell, mobile dock, FABs)
- DELETE: `components/landing/LightLanding.tsx` (keep in git history)
- Keep from the experiments (they were real fixes, not styling):
  - Crossfading hero word fix (no blank headline)
  - Honest proof pills (no fabricated user counts)
  - Language modal → non-blocking banner
  - Notification bell hidden for anonymous visitors
  - Orbitron removal (wordmark = display font + tracking)
  - Shimmer sweep on hover only (no infinite loops)

## Phase 1 — The invisible system (this is what "Apple" actually means)

1. **One radius scale, enforced**: 8 / 12 / 16 / 24 / pill. Sweep every
   hardcoded 5/9/10/11/13px radius (ClinicCard alone has five values).
2. **One spacing grid**: 4px base; audit sections to the --space-* tokens.
3. **Type ramp locked**: display (Bricolage 700/800), body (Inter 400/500/600),
   data (Mono 400/500). Five sizes per page maximum. No serif accents.
4. **Icon audit**: icons only where they disambiguate (actions, status).
   Strip decorative iconsax from labels, nav links, list bullets.
5. **Color discipline**: near-black canvas (#050609 family), ONE accent
   (steel-blue #4F8EF0), semantic colors only for meaning. Teal demoted to
   data-viz/status. Every rgba() literal replaced by a token.
6. **Motion constitution**:每 section = one entrance (fade+rise, 300–500ms,
   staggered children 60ms), scroll-triggered once. No loops except live
   status ("Open now" pulse). Hover = translate/shadow, never scale>1.03.

## Phase 2 — The hero that leaves a mark

Concept: **"The hero IS the product, running live."**
Not a mockup, not a screenshot — the real thing, on stage, in the dark.

Composition (desktop):
- Left: static composed headline (2 lines) + subline + search bar (real)
- Right: **Living Proof Panel** — a real, live-rendering results card stack:
  on load it geolocates (IP-level, no permission prompt) and RUNS AN ACTUAL
  SEARCH against /api/clinics, streaming in 3 real clinic cards near the
  visitor with real distances. First-time visitors see their own city's
  free clinics before they've touched anything. That's the surprise —
  not an animation, their actual answer.
  - Fallback (API slow/empty): curated Phoenix demo stack labeled "Preview"
- Beneath both: quiet mono proof strip (live stats from /api/stats)
- One luminous moment: EKG horizon line (kept from Blue Pulse — it earned it)
  drawing once across the hero top on load. No aurora blob, no dot grid.
- Micro-surprise: the search placeholder types itself once (typewriter,
  ~1.5s, then stops forever). Signals "alive" without looping.

Mobile: headline → search → Living Proof (2 cards) → proof strip.

## Phase 3 — Landing body (6 beats, rhythm restored)

Hero → Stats (live, gradient hairlines) → HowItWorks (numbered 01/02/03 mono
eyebrows) → Features (bento, real UI vignettes replacing fake "47K+" tiles) →
one Story (single quote, not a carousel) → CTA. Section eyebrows unified:
`01 — How it works` in mono caps. Same component = same look everywhere.

## Phase 4 — Inner-page migration order

/search (highest traffic + worst seam) → clinic detail → /triage →
/eligibility → auth pages → dashboard → the rest.

---

## DELETE list (dead weight)

- `components/landing/LightLanding.tsx` (after revert)
- `components/LogoMarquee.tsx` — implies partnerships that don't exist
- `components/BeforeAfterBar.tsx` + `components/MissionFreeze.tsx` — fabricated
  metrics ("12× fewer calls") with no data behind them
- `components/hero/HeroMockup.tsx` — fake dashboard, replaced by Living Proof
- `public/hero-concepts/` — design scratch files
- `public/videos/maria-hero.mp4` + cinematic poster placeholders (CinematicHero
  falls back to CSS gradient anyway) — unless you supply real video
- Instrument Serif font import (unused after revert)
- Cycling CYCLE_WORDS remnants if any survive the revert

## YOUR to-dos (only you can)

1. **Real stories**: 1–2 quotes you have consent to publish, ideally with a
   first name + city. Everything else on the page can be honest without you;
   testimonials can't.
2. **Decide on video**: real hero video footage, or we delete the placeholders
   and commit to the typographic hero (my recommendation: delete).
3. Confirm the accent stays steel-blue (vs. the electric blue from Blue Pulse).
4. Nothing else — env vars/domain items are already tracked in LAUNCH_PLAN.md.
