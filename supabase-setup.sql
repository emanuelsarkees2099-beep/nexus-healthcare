-- ============================================================
-- NEXUS — Supabase Setup SQL
-- Run this in your Supabase SQL Editor (nexus project)
-- ============================================================

-- 1. DISABLE RLS on submissions (already done, but just in case)
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- 2. USER PROFILES — enable RLS + policy so users can only see/edit their own
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_profile" ON user_profiles;
CREATE POLICY "users_own_profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Allow service role full access
DROP POLICY IF EXISTS "service_full_access" ON user_profiles;
CREATE POLICY "service_full_access" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- 3. SAVED RESOURCES TABLE
CREATE TABLE IF NOT EXISTS saved_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,       -- 'clinic', 'program', 'story'
  resource_id TEXT NOT NULL,         -- external ID (e.g. HRSA clinic ID)
  resource_name TEXT,
  resource_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, resource_type, resource_id)
);

ALTER TABLE saved_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_bookmarks" ON saved_resources
  FOR ALL USING (auth.uid() = user_id);

-- 4. Add user_id column to submissions (if not already there)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 5. PUBLISHED STORIES TABLE — approved stories shown publicly on /stories
CREATE TABLE IF NOT EXISTS published_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id),
  user_id UUID REFERENCES auth.users(id),
  display_name TEXT,         -- first name + city (e.g. "Maria, Phoenix AZ")
  category TEXT,
  story TEXT NOT NULL,
  quote TEXT,                -- shorter excerpt shown on card
  published_at TIMESTAMPTZ DEFAULT now(),
  featured BOOLEAN DEFAULT false
);

-- Public read access
ALTER TABLE published_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_stories" ON published_stories
  FOR SELECT USING (true);
CREATE POLICY "admin_write_stories" ON published_stories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- 6. FORUM POSTS TABLE (for community discussion on /stories)
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  upvotes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_forum" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "auth_write_forum" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_forum" ON forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. USEFUL INDEXES
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions(type);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_saved_resources_user ON saved_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
