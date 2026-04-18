-- Drop the broken policy
DROP POLICY IF EXISTS "Allow all" ON user_profiles;

-- Create proper RLS policies for user_profiles

-- 1. Users can select their own profile
CREATE POLICY "users_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "users_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. CRITICAL FIX: Allow inserts for anyone (needed for signup)
-- This is safe because the foreign key constraint ensures id exists in auth.users
CREATE POLICY "users_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Admins can view all profiles
CREATE POLICY "admins_select_all" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.user_type = 'admin'
    )
  );

-- Verify policies
SELECT policyname, qual, with_check FROM pg_policies WHERE tablename = 'user_profiles';
