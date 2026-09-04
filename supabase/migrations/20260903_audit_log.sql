-- ═══════════════════════════════════════════════════════════════════
-- AXVO — Audit log for access to another person's data
-- Run in: Supabase Dashboard → SQL Editor
--
-- Scope, deliberately: this logs when someone (almost always an admin)
-- accesses or changes DATA THAT ISN'T THEIR OWN -- viewing a submission,
-- changing its status, deleting an account. It does not log every normal
-- self-service action (a user viewing their own dashboard doesn't need
-- an audit trail entry for looking at their own data). That's the
-- standard "who touched someone else's PHI" scope, not a full click-log.
--
-- Written to from app code via lib/audit.ts, using the service-role
-- client (never client-side -- there is no legitimate reason a browser
-- should be able to write its own audit entries).
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid,                    -- who performed the action (null if system/cron)
  actor_email   text,                    -- denormalized for readability without a join
  action        text not null,           -- e.g. 'submission.view', 'submission.status_change', 'account.delete'
  resource_type text not null,           -- e.g. 'submission', 'user_profile'
  resource_id   text,                    -- the affected row's id
  target_user_id uuid,                   -- whose data this was, if applicable
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists audit_log_actor_idx  on public.audit_log (actor_id, created_at desc);
create index if not exists audit_log_target_idx on public.audit_log (target_user_id, created_at desc);

alter table public.audit_log enable row level security;

-- Admins can read the log (to review it); nobody can read it as a normal
-- user, since it can reveal what data exists on other people.
drop policy if exists audit_select_admin on public.audit_log;
create policy audit_select_admin on public.audit_log
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'user_type') in ('admin', 'super_admin'));

-- No INSERT/UPDATE/DELETE policy for anon or authenticated at all --
-- writes only ever happen through the service-role client from server
-- code (lib/audit.ts), which bypasses RLS entirely. This is intentional:
-- an audit log that any authenticated user could write to isn't trustworthy.
