-- ═══════════════════════════════════════════════════════════════════════════════
-- F3 — push_subscriptions table
-- Run this in your Supabase SQL Editor:
--   https://supabase.com/dashboard → your project → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint    TEXT        PRIMARY KEY,
  p256dh      TEXT        NOT NULL DEFAULT '',
  auth        TEXT        NOT NULL DEFAULT '',
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  user_agent  TEXT        NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx
  ON push_subscriptions (user_id)
  WHERE user_id IS NOT NULL;

-- Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anonymous subscriptions are allowed (user_id can be NULL)
CREATE POLICY "Anyone can insert a push subscription"
  ON push_subscriptions FOR INSERT
  WITH CHECK (true);

-- Users can read and delete only their own subscriptions
CREATE POLICY "Users can read their own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Allow upsert (UPDATE) for re-subscribing at the same endpoint
CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (true);

-- Service role (used by push send API) can do everything
-- (service role bypasses RLS automatically — no extra policy needed)
