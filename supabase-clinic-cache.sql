-- ─────────────────────────────────────────────────────────────────
-- N3 / Clinic Detail Page: clinic_cache + clinic_overrides
--
-- clinic_cache:     auto-populated from search results so the detail
--                   page can serve clinic data without re-fetching APIs
--
-- clinic_overrides: admin-managed overrides (e.g. cal_link) applied
--                   on top of the cached clinic object
--
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────

-- 1. Clinic cache (public read, server-write via anon key + RLS off)
CREATE TABLE IF NOT EXISTS clinic_cache (
  clinic_id    TEXT PRIMARY KEY,
  clinic_data  JSONB NOT NULL,
  source       TEXT,                        -- 'hrsa' | 'nafc' | 'osm' | ...
  cached_at    TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- No RLS — public read, writes only happen from server-side API route
ALTER TABLE clinic_cache DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_clinic_cache_updated ON clinic_cache(updated_at DESC);

-- 2. Admin-managed overrides (cal_link, corrected phone, etc.)
CREATE TABLE IF NOT EXISTS clinic_overrides (
  clinic_id    TEXT PRIMARY KEY,
  cal_link     TEXT,                        -- N3: booking embed URL
  phone        TEXT,                        -- corrected phone (optional)
  hours        TEXT,                        -- corrected hours (optional)
  notes        TEXT,                        -- internal admin notes
  approved_by  TEXT,                        -- admin email
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- No RLS — only admins write here, public can read cal_link
ALTER TABLE clinic_overrides DISABLE ROW LEVEL SECURITY;

-- 3. Auto-update updated_at on clinic_cache
CREATE OR REPLACE FUNCTION touch_clinic_cache_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clinic_cache_updated ON clinic_cache;
CREATE TRIGGER trg_clinic_cache_updated
  BEFORE UPDATE ON clinic_cache
  FOR EACH ROW EXECUTE FUNCTION touch_clinic_cache_updated();

-- 4. Auto-update updated_at on clinic_overrides
CREATE OR REPLACE FUNCTION touch_clinic_overrides_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clinic_overrides_updated ON clinic_overrides;
CREATE TRIGGER trg_clinic_overrides_updated
  BEFORE UPDATE ON clinic_overrides
  FOR EACH ROW EXECUTE FUNCTION touch_clinic_overrides_updated();
