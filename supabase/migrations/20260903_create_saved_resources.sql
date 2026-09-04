-- ═══════════════════════════════════════════════════════════════════
-- AXVO — Create saved_resources (the actual bookmarks table)
-- Run in: Supabase Dashboard → SQL Editor
--
-- WHY: app/api/bookmarks/route.ts has always queried a table called
-- 'saved_resources' -- confirmed via the full table list in Supabase's
-- Table Editor that it was never created at all (not a rename, not a
-- naming mismatch -- it simply doesn't exist). The bookmark/save-clinic
-- feature has never worked in production. This creates it with exactly
-- the columns and constraints the existing route code already expects
-- (verified directly against app/api/bookmarks/route.ts and
-- lib/validation.ts's BookmarkSchema) -- no app code changes needed
-- after this runs.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.saved_resources (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  resource_type text not null,              -- e.g. 'clinic'
  resource_id   text not null,              -- always stored as a string (BookmarkSchema casts numbers too)
  resource_name text default '',
  resource_data jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now(),

  -- Required for the app's .upsert(..., { onConflict: 'user_id,resource_type,resource_id' })
  unique (user_id, resource_type, resource_id)
);

create index if not exists saved_resources_user_idx on public.saved_resources (user_id, created_at desc);

alter table public.saved_resources enable row level security;

-- Same owner-scoped pattern already used for push_subscriptions -- a
-- user can only ever see/write/delete their own bookmarks.
drop policy if exists sr_all_own on public.saved_resources;
create policy sr_all_own on public.saved_resources
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
