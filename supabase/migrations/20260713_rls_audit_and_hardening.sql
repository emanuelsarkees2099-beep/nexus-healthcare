-- ═══════════════════════════════════════════════════════════════════
-- NEXUS — RLS audit + hardening
-- Run in: Supabase Dashboard → SQL Editor
--
-- HOW TO USE:
--   1. Run PART A (read-only audit) first. Screenshot / copy the output.
--   2. Run PART B (hardening) — it is idempotent and safe to re-run.
--   3. Run PART A again to confirm every user table shows rowsecurity=true
--      with owner-scoped policies.
--
-- WHY the split: tables the app reads for PUBLIC AGGREGATE COUNTS (the
-- honest Stats section counts `submissions` via the anon key) must NOT
-- get owner-only SELECT, or the counts break. PART B only hardens tables
-- that are ALWAYS accessed with a logged-in user's JWT. The aggregate-read
-- tables are handled with a count-safe policy instead.
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- PART A — AUDIT (read-only). Run this by itself first.
-- ─────────────────────────────────────────────────────────────────────
select
  c.relname                         as table_name,
  c.relrowsecurity                  as rls_enabled,
  coalesce(p.policy_count, 0)       as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join (
  select polrelid, count(*) as policy_count
  from pg_policy group by polrelid
) p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'user_profiles','outcomes','submissions','saved_resources',
    'push_subscriptions','newsletter_subscribers','clinics',
    'clinic_cache','clinic_overrides','availability_signals'
  )
order by c.relname;

-- ─────────────────────────────────────────────────────────────────────
-- PART B — HARDENING. Idempotent. Safe to re-run.
-- Only tables that are ALWAYS accessed with a user JWT are locked to the
-- owner. Aggregate-read tables get a count-safe treatment.
-- ─────────────────────────────────────────────────────────────────────

-- user_profiles: the row id IS the auth user id (signup upserts id=userId).
alter table if exists public.user_profiles enable row level security;
drop policy if exists up_select_own on public.user_profiles;
drop policy if exists up_update_own on public.user_profiles;
drop policy if exists up_insert_own on public.user_profiles;
create policy up_select_own on public.user_profiles
  for select to authenticated using (auth.uid() = id);
create policy up_update_own on public.user_profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy up_insert_own on public.user_profiles
  for insert to authenticated with check (auth.uid() = id);

-- saved_resources (bookmarks): always accessed with the user's JWT.
alter table if exists public.saved_resources enable row level security;
drop policy if exists sr_all_own on public.saved_resources;
create policy sr_all_own on public.saved_resources
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- push_subscriptions: owner-managed (nullable user_id for anonymous).
alter table if exists public.push_subscriptions enable row level security;
drop policy if exists ps_all_own on public.push_subscriptions;
create policy ps_all_own on public.push_subscriptions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- clinics / clinic_cache: public read (already the intended posture).
alter table if exists public.clinics enable row level security;
drop policy if exists clinics_public_read on public.clinics;
create policy clinics_public_read on public.clinics
  for select to anon, authenticated using (true);

alter table if exists public.clinic_cache enable row level security;
drop policy if exists cc_public_read on public.clinic_cache;
create policy cc_public_read on public.clinic_cache
  for select to anon, authenticated using (true);

-- ─────────────────────────────────────────────────────────────────────
-- NOT auto-hardened here (need a decision — see notes):
--
--   outcomes, submissions:
--     These allow anonymous INSERT and are read for PUBLIC AGGREGATE
--     COUNTS via the anon key (honest Stats section). Owner-only SELECT
--     would zero those counts. RECOMMENDED FIX (do one):
--       (a) Move the count queries to the service role / a SECURITY
--           DEFINER count function, then lock SELECT to owner; OR
--       (b) Keep RLS off and rely on the service-role write path (the
--           current, acceptable posture — no PII is exposed by a count).
--     Server writes already use the service role, which bypasses RLS.
--
--   clinic_overrides:
--     Admin-write only. Add an admin policy once the admin role claim is
--     confirmed (app_metadata.user_type = 'admin').
--
--   newsletter_subscribers:
--     Email-only, no user link. Ensure NO public SELECT policy exists
--     (writes go through the service role). Confirm in PART A that its
--     policy_count is 0 with rls_enabled=true, or leave RLS off since
--     the anon key is never granted SELECT on it in the app.
-- ─────────────────────────────────────────────────────────────────────
