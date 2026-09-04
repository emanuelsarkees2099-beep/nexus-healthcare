-- ═══════════════════════════════════════════════════════════════════
-- AXVO — CRITICAL: lock down submissions & outcomes SELECT
-- Run in: Supabase Dashboard → SQL Editor
--
-- WHY THIS IS URGENT: confirmed LIVE, via the public anon key (the same
-- key that ships in every page's client bundle), that `submissions`
-- currently returns full, unfiltered rows to anyone who queries it
-- directly -- real names, a real "Mental Health" category personal
-- story, and a real email address were read this way, completely
-- bypassing the app. `outcomes` has the identical gap (it was
-- explicitly excluded from the 2026-07-13 hardening pass, same as
-- submissions) -- it just has no exploitable rows logged yet, so this
-- closes the same hole pre-emptively rather than waiting for it to
-- matter.
--
-- Both tables need anonymous INSERT to keep working (public submission
-- forms, outcome/crisis-visit logging) -- that stays open. Reading raw
-- rows becomes admin-only. The homepage's public "honest stats" count
-- moves to a SECURITY DEFINER function that returns nothing but a
-- number, never row contents.
--
-- Paired app-code changes (already made, this migration alone does
-- nothing without them):
--   - app/api/submit/route.ts and app/api/stats/route.ts now use the
--     service-role key instead of the anon key (both are server-only
--     routes, never exposed to the browser -- this also sidesteps a
--     real Postgres RLS trap: SELECT policies apply to an INSERT's
--     RETURNING clause too, so an anon-key insert's `.select('id')`
--     would silently come back empty once SELECT is admin-only, and
--     break every public submission form).
--   - components/Stats.tsx now calls the submissions_count() RPC
--     below instead of reading the table directly (it's a genuine
--     browser-side component, so it can't use the service role key).
-- ═══════════════════════════════════════════════════════════════════

-- ── submissions ──────────────────────────────────────────────────────
alter table public.submissions enable row level security;

drop policy if exists sub_insert_anyone on public.submissions;
create policy sub_insert_anyone on public.submissions
  for insert to anon, authenticated
  with check (true);

drop policy if exists sub_select_admin on public.submissions;
create policy sub_select_admin on public.submissions
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'user_type') in ('admin', 'super_admin'));

drop policy if exists sub_update_admin on public.submissions;
create policy sub_update_admin on public.submissions
  for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'user_type') in ('admin', 'super_admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'user_type') in ('admin', 'super_admin'));

-- Public count-only RPC for the homepage stats section. SECURITY DEFINER
-- runs with the function owner's privileges (bypassing RLS internally),
-- but the function body only ever returns a bare integer -- there is no
-- way to get row contents out of it.
create or replace function public.submissions_count()
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*) from public.submissions;
$$;
grant execute on function public.submissions_count() to anon, authenticated;

-- ── outcomes ─────────────────────────────────────────────────────────
-- Same shape as submissions: user_id, event_type (includes
-- 'crisis_visited'), and a free-text notes column -- real health
-- information tied to identifiable people. /api/outcomes already reads
-- this via the service role and only ever exposes aggregate counts
-- (never user_id or notes) -- this migration closes the same
-- direct-table-access hole submissions had.
alter table public.outcomes enable row level security;

drop policy if exists out_insert_anyone on public.outcomes;
create policy out_insert_anyone on public.outcomes
  for insert to anon, authenticated
  with check (true);

drop policy if exists out_select_admin on public.outcomes;
create policy out_select_admin on public.outcomes
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'user_type') in ('admin', 'super_admin'));

-- ── clinic_overrides ─────────────────────────────────────────────────
-- Lower urgency than the two above -- this holds clinic-facility
-- corrections (cal_link, phone, hours), not personal data, so public
-- SELECT is fine and intentional (app/api/clinics/route.ts reads it via
-- the anon key to merge corrected info into public clinic listings).
-- Only WRITES need locking down, to stop non-admins from tampering with
-- clinic contact info.
alter table public.clinic_overrides enable row level security;

drop policy if exists co_select_public on public.clinic_overrides;
create policy co_select_public on public.clinic_overrides
  for select to anon, authenticated
  using (true);

drop policy if exists co_write_admin on public.clinic_overrides;
create policy co_write_admin on public.clinic_overrides
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'user_type') in ('admin', 'super_admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'user_type') in ('admin', 'super_admin'));

-- ── Note on the admin JWT claim ──────────────────────────────────────
-- The admin, admin-write, and admin-update policies above all check
-- auth.jwt() -> 'app_metadata' ->> 'user_type', synced from
-- user_profiles.user_type by the trigger in
-- 20260610_jwt_user_type_claims.sql (the same mechanism proxy.ts
-- already relies on for /admin page routing). JWT claims are baked in
-- at token issuance -- if an account is granted admin while already
-- logged in, that session's current token won't reflect it until the
-- next natural token refresh (normally within the hour) or a fresh
-- login. Not a bug, just log out and back in if a brand-new admin
-- grant doesn't seem to take effect immediately.
