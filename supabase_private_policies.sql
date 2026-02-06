-- CLEANUP: Remove public-oriented triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- SECURITY: Profiles Table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remove old policies
DROP POLICY IF EXISTS "Los perfiles son públicos" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- NEW PRIVATE POLICIES (Model B)
-- Only allow users to see and manage THEIR OWN profile data.
-- No public listing of profiles.

CREATE POLICY "Users read own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users delete own profile"
ON profiles
FOR DELETE
USING (auth.uid() = id);

-- SECURITY: Documents Table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;

CREATE POLICY "Users read own documents"
ON documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own documents"
ON documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own documents"
ON documents
FOR DELETE
USING (auth.uid() = user_id);
