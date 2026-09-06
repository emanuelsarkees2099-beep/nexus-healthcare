-- ═══════════════════════════════════════════════════════════════════
-- AXVO — Create clinic_cache (backs the clinic detail page)
-- Run in: Supabase Dashboard → SQL Editor
--
-- WHY: app/api/clinics/route.ts has always read/written a table called
-- 'clinic_cache' (singular) -- confirmed via the live Supabase table list
-- that it was never created at all. It's easy to confuse with
-- 'clinics_cache' (plural), which DOES exist but is a completely
-- different, unrelated table (a bulk HRSA seed dump, see
-- scripts/seed-hifld.ts) -- not a fix for this.
--
-- Every clinic search caches its results here (fire-and-forget, so search
-- itself was never affected), and the clinic detail page
-- (app/clinics/[id]/page.tsx, via GET /api/clinics?id=...) reads a single
-- row back by id. Without this table, that read has always silently
-- returned nothing, and every clinic detail page has shown "Clinic not
-- found" -- 100% of the time, for every clinic. This creates it with
-- exactly the columns the existing route code already expects.
--
-- This is the same content as supabase-clinic-cache.sql at the repo root
-- (written earlier, never actually run) -- consolidated here as a proper
-- dated migration alongside the rest.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.clinic_cache (
  clinic_id   text primary key,
  clinic_data jsonb not null,
  source      text,                          -- 'db' | 'hrsa' | 'nafc' | 'osm' | ...
  cached_at   timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_clinic_cache_updated on public.clinic_cache (updated_at desc);

-- Public read (the detail page is reachable without an account), server-only
-- writes (the anon-key client used by app/api/clinics/route.ts's background
-- cache upsert is a bare server-side client, no session -- fine either way,
-- since nothing here is per-user data).
alter table public.clinic_cache enable row level security;

drop policy if exists cc_public_read on public.clinic_cache;
create policy cc_public_read on public.clinic_cache
  for select to anon, authenticated
  using (true);

drop policy if exists cc_write_anon on public.clinic_cache;
create policy cc_write_anon on public.clinic_cache
  for insert to anon, authenticated
  with check (true);

drop policy if exists cc_update_anon on public.clinic_cache;
create policy cc_update_anon on public.clinic_cache
  for update to anon, authenticated
  using (true)
  with check (true);

-- Keep updated_at current on every upsert-as-update.
create or replace function public.touch_clinic_cache_updated()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_clinic_cache_updated on public.clinic_cache;
create trigger trg_clinic_cache_updated
  before update on public.clinic_cache
  for each row execute function public.touch_clinic_cache_updated();
