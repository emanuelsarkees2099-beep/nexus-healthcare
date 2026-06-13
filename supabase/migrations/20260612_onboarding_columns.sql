-- Migration 002: onboarding profile columns
-- Run this in your Supabase SQL Editor:
--   Dashboard → SQL Editor → New query → paste → Run
--
-- Adds structured onboarding fields to user_profiles so the
-- eligibility engine and clinic matcher can use them server-side.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS zip_code          VARCHAR(10),
  ADD COLUMN IF NOT EXISTS state_code        VARCHAR(2),
  ADD COLUMN IF NOT EXISTS income_bracket    VARCHAR(30),
  ADD COLUMN IF NOT EXISTS household_size    INTEGER,
  ADD COLUMN IF NOT EXISTS care_needs        TEXT[],
  ADD COLUMN IF NOT EXISTS barriers          TEXT[],
  ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(30),
  ADD COLUMN IF NOT EXISTS situation         VARCHAR(40),
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Row-level security: users can only read/write their own row
-- (already enforced by the existing policy; these columns inherit it)

COMMENT ON COLUMN public.user_profiles.zip_code              IS 'US ZIP code entered during onboarding';
COMMENT ON COLUMN public.user_profiles.income_bracket        IS 'Income bracket: under_20k | 20k_40k | 40k_60k | 60k_plus | prefer_not_to_say';
COMMENT ON COLUMN public.user_profiles.household_size        IS 'Number of people in household (1–8+)';
COMMENT ON COLUMN public.user_profiles.care_needs            IS 'Array of care need keys from onboarding: primary, dental, mental, vision, prescriptions, specialist, pregnancy, emergency';
COMMENT ON COLUMN public.user_profiles.barriers              IS 'Array of barrier keys: cost, transport, language, time, fear, documentation, knowledge';
COMMENT ON COLUMN public.user_profiles.preferred_language    IS 'Language key: english, spanish, chinese, arabic, tagalog, other';
COMMENT ON COLUMN public.user_profiles.situation             IS 'Insurance situation: uninsured, underinsured, transition, helper';
COMMENT ON COLUMN public.user_profiles.onboarding_completed_at IS 'Timestamp when user finished the onboarding questionnaire';
