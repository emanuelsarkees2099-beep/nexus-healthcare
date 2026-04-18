-- Create submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS on submissions so anon key can insert
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS submissions_type_idx ON submissions(type);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions(status);
CREATE INDEX IF NOT EXISTS submissions_user_id_idx ON submissions(user_id);
CREATE INDEX IF NOT EXISTS submissions_created_at_idx ON submissions(created_at DESC);
