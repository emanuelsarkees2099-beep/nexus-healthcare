-- ═══════════════════════════════════════════════════════════════════
-- NEXUS — Clinics master table
-- Owned clinic data (HRSA FQHCs + future sources), searched by radius.
-- Replaces per-request fan-out to 10 live APIs as the primary source.
-- Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- Radius search support
create extension if not exists cube;
create extension if not exists earthdistance;

create table if not exists public.clinics (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,             -- 'hrsa' | 'cms' | 'npi' | 'samhsa' | 'nafc'
  source_id     text not null,             -- stable id within the source
  name          text not null,
  type          text,                      -- 'FQHC' | 'FQHC Look-Alike' | 'Rural Health Clinic' | ...
  address       text,
  city          text,
  state         text,                      -- 2-letter
  zip           text,
  lat           double precision,
  lng           double precision,
  phone         text,
  website       text,
  hours         text,
  weekly_hours  numeric,                   -- HRSA "Operating Hours per Week"
  free          boolean default false,
  sliding_scale boolean default false,
  affordability_score int default 50,
  services      text[] default '{}',
  languages     text[] default '{}',
  verified_at   timestamptz,               -- when the source last verified this record
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (source, source_id)
);

-- Radius index + common filters
create index if not exists clinics_earth_idx
  on public.clinics using gist (ll_to_earth(lat, lng));
create index if not exists clinics_state_idx on public.clinics (state);
create index if not exists clinics_zip_idx   on public.clinics (zip);

-- Read-only to the public; writes via service role only
alter table public.clinics enable row level security;
drop policy if exists "clinics_public_read" on public.clinics;
create policy "clinics_public_read" on public.clinics
  for select to anon, authenticated using (true);

-- ── Radius search RPC ────────────────────────────────────────────────
-- Returns clinics within radius_m meters of (in_lat, in_lng),
-- nearest first. distance_m included for the caller.
create or replace function public.clinics_near(
  in_lat   double precision,
  in_lng   double precision,
  radius_m double precision default 40000,   -- 25 miles
  max_rows int              default 200
)
returns table (
  id uuid, source text, source_id text, name text, type text,
  address text, city text, state text, zip text,
  lat double precision, lng double precision,
  phone text, website text, hours text, weekly_hours numeric,
  free boolean, sliding_scale boolean, affordability_score int,
  services text[], languages text[], verified_at timestamptz,
  distance_m double precision
)
language sql stable as $$
  select
    c.id, c.source, c.source_id, c.name, c.type,
    c.address, c.city, c.state, c.zip,
    c.lat, c.lng,
    c.phone, c.website, c.hours, c.weekly_hours,
    c.free, c.sliding_scale, c.affordability_score,
    c.services, c.languages, c.verified_at,
    earth_distance(ll_to_earth(in_lat, in_lng), ll_to_earth(c.lat, c.lng)) as distance_m
  from public.clinics c
  where c.lat is not null and c.lng is not null
    and earth_box(ll_to_earth(in_lat, in_lng), radius_m) @> ll_to_earth(c.lat, c.lng)
    and earth_distance(ll_to_earth(in_lat, in_lng), ll_to_earth(c.lat, c.lng)) <= radius_m
  order by distance_m asc
  limit max_rows;
$$;

grant execute on function public.clinics_near to anon, authenticated;
