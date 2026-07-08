# NEXUS — "Insane but Appropriate" Transformation Plan
### For the original dark design (cycling-word hero, dark canvas, blue accent)

The base is the current dark landing. GSAP + ScrollTrigger are already
installed and wired — that's our engine. Everything below is executable
with what's in the repo today, no new heavy dependencies.

The one non-negotiable I'm keeping from the audit: honest numbers.
The "284,000+ patients helped · 4.9 · 12K reviews" pill is fabricated and
is the kind of thing that kills a healthcare product in one screenshot on
launch day. The plan keeps the avatar-stack VISUAL (it looks great) but
binds it to true copy (clinics mapped, languages, always free — or live
DB counts once seeded).

---

## THE SIGNATURE: "The Pulse" — one idea that owns the whole page

A single EKG heartbeat line, drawn as one continuous SVG path, that runs
the entire length of the page. It starts under the hero search bar,
weaves left and right between sections, spikes into a heartbeat at each
section heading, and terminates at the CTA button. Scroll-scrubbed with
ScrollTrigger — the visitor literally draws the pulse by scrolling.

Nobody in healthcare tech has this. It converts "scrolling a landing
page" into "tracing a heartbeat," and it gives every section a reason to
feel connected. This is the memorable thing people screenshot.

- Implementation: one absolutely-positioned SVG spanning the page,
  `stroke-dashoffset` scrubbed 0→1 across full scroll; section spikes are
  path segments; a soft glow dot rides the tip of the line.
- Mobile: simplified straight line down the left gutter, same scrub.
- `prefers-reduced-motion`: line renders fully drawn, static.

---

## Phase A — Atmosphere (background & depth)          ~half day

1. **Constellation upgrade** to the existing WebGL canvas: sparse points
   ("clinics") that occasionally connect with a brief line and pulse —
   the network of care, animating at whisper volume behind the hero only.
2. **Cursor spotlight**: 600px radial glow that trails the pointer over
   the hero (transform-only, GPU-cheap; off on touch).
3. **Film grain** overlay (existing noise pattern, promoted page-wide at
   2% opacity) — kills flat-black banding on cheap displays.
4. **Depth rule**: three parallax planes (bg 0.85×, content 1×, floating
   accents 1.1×) — subtle everywhere, never carnival.

## Phase B — Hero: the first 5 seconds                 ~1 day

1. **Cycling word, upgraded**: keep your signature rotating accent word
   (unlocked/possible/deserved/found) but per-character flip with GSAP
   stagger — characters cartwheel out/in like a split-flap airport board.
   Crossfade retained: the headline is NEVER blank.
2. **Living Proof panel** (the surprise): under/beside the search bar, a
   compact card stack that geolocates the visitor (IP-level) and streams
   in 3 REAL clinics near them — name, distance, $0 badge — from the now
   77+ result API. First-timers see their own city's free care before
   touching anything. Skeleton shimmer → cards pop in with spring stagger.
3. **Search bar theatrics**: placeholder typewrites once; focus ignites
   the gradient halo ring; the CTA arrow slides on hover; on submit the
   button morphs arrow→pulse-line while routing.
4. **Honest proof pill**: avatar stack stays, copy becomes live truth
   ("12,400+ free clinics mapped · always free"), counts pulled from
   /api/stats when DB is seeded.
5. **Scroll invitation**: the Pulse line visibly begins below the fold
   with a slow draw hint + "see how" microcopy.

## Phase C — Unique scroll scenes (section by section) ~1.5 days

1. **Stats**: counters (exist) + each stat's hairline draws in; the Pulse
   spikes through the row.
2. **HowItWorks → scroll-pinned story**: section pins; the 3 steps
   advance by scroll scrub instead of a 3.5s timer (user controls the
   demo panel; timer remains as idle fallback). This is the "unique
   scroll animation" centerpiece after the Pulse.
3. **Features bento**: cards enter with 12° 3D tilt settling to flat
   (stagger 80ms); on hover, iconsax icons swap Linear→Bulk variant and
   the card's top hairline ignites (already built).
4. **Real UI vignettes inside bento** (replaces deleted fake-number
   tiles): dark triage chat mock, eligibility "Likely eligible: Medicaid"
   result card, passport card — the Blue Pulse vignettes re-skinned for
   the dark theme. Product screenshots that are actually live markup.
5. **Testimonials**: row scrubs horizontally with scroll (gentle, 10%
   travel); quotes fade up word-cluster by word-cluster.
6. **CTA**: gradient background ignites (opacity+scale of a radial) as it
   enters; the Pulse line terminates INTO the button, which pulses once.

## Phase D — Micro-interactions & transitions          ~1 day

1. **Page transitions**: upgrade PageTransition to fade-through-black
   with 150ms shared-nav persistence (app feels native).
2. **Buttons**: press scale 0.97; success morph (arrow→check) on submits.
3. **Featured card border-beam**: one rotating conic gradient border on
   exactly ONE card per page (the #1 clinic result / featured feature).
4. **Inputs**: unified focus ring + subtle label float on all forms.
5. **Icon grid**: iconsax locked to 16/20/24 sizes, Linear default, Bulk
   on hover/active; decorative icons stripped from plain labels.
6. **Nav**: active-link pill slides between links (layoutId-style morph);
   scrolled nav gains the glass treatment (exists, tune).

## Phase E — Guardrails (what keeps it Apple, not carnival)

- One signature (the Pulse). Everything else supports it.
- transform/opacity only; no animated box-shadows/filters in scroll scenes.
- Every scene ≤ 600ms of perceived motion; scrub scenes are user-paced.
- `prefers-reduced-motion` disables: Pulse scrub (renders drawn), pinning,
  tilt, spotlight, typewriter. Site fully usable without any of it.
- LCP: hero H1 paints pre-JS (already solved via .h1-word CSS).
- Lighthouse gate after each phase: perf ≥ 90 mobile.

---

## Execution order (say go and I run them in sequence)

1. Phase B hero (biggest visible win, includes Living Proof)
2. The Pulse (signature, spans page)
3. Phase C scroll scenes
4. Phase A atmosphere
5. Phase D micro-interactions
6. Perf/a11y pass + commit-per-phase, single push at the end

## Your one manual step (Supabase, 30 seconds — do this anytime)

Dashboard → SQL Editor → paste the contents of
`supabase/migrations/20260706_clinics_master.sql` → Run.
Then tell me "table's in" — I run the seeder and 18,938 real clinics go
live, which also powers the hero's Living Proof panel with real data.
