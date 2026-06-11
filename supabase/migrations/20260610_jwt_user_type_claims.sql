-- JWT Custom Claims: sync user_type from user_profiles into auth.users app_metadata
--
-- Run in Supabase Dashboard → SQL Editor, then enable the trigger.
-- This makes user.app_metadata.user_type available in the JWT so proxy.ts
-- can perform role-based routing without a database call on every request.
--
-- STEP 1: Create the function
create or replace function public.sync_user_type_to_jwt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('user_type', new.user_type)
  where id = new.id;
  return new;
end;
$$;

-- STEP 2: Create trigger on user_profiles
drop trigger if exists on_user_profile_upsert on public.user_profiles;
create trigger on_user_profile_upsert
  after insert or update of user_type
  on public.user_profiles
  for each row
  execute procedure public.sync_user_type_to_jwt();

-- STEP 3: Backfill existing users (run once)
update public.user_profiles set user_type = user_type where user_type is not null;
