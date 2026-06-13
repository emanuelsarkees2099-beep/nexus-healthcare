-- Availability signals — crowd-reported wait times and open/closed status
-- Used by ClinicCard and clinic detail page for live availability dots.

create table if not exists public.availability_signals (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    text not null,
  status       text not null check (status in ('open', 'limited', 'closed', 'unknown')),
  wait_minutes integer,                 -- null = unknown; 0 = walk-in no wait
  reporter_id  uuid references auth.users(id) on delete set null,
  signal_type  text not null default 'crowd' check (signal_type in ('crowd', 'provider', 'api')),
  created_at   timestamptz not null default now()
);

-- Indexes for the two read patterns: latest signal per clinic, signals by reporter
create index if not exists idx_availability_clinic_time on public.availability_signals (clinic_id, created_at desc);
create index if not exists idx_availability_reporter    on public.availability_signals (reporter_id);

-- Row-level security
alter table public.availability_signals enable row level security;

-- Anyone can read signals
create policy "Public read availability signals"
  on public.availability_signals for select
  using (true);

-- Authenticated users can insert their own reports
create policy "Auth users can report availability"
  on public.availability_signals for insert
  to authenticated
  with check (reporter_id = auth.uid());

-- Notify subscriptions table — users can subscribe to get notified
-- when a clinic's status changes to 'open' or 'limited'
create table if not exists public.availability_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  clinic_id  text not null,
  created_at timestamptz not null default now(),
  unique (user_id, clinic_id)
);

alter table public.availability_subscriptions enable row level security;

create policy "Users manage own subscriptions"
  on public.availability_subscriptions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
