-- Create drafts table for versioning (Google Docs style)
CREATE TABLE IF NOT EXISTS public.drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  is_current boolean DEFAULT true,
  created_at timestamp WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "users only see own drafts" ON public.drafts;
CREATE POLICY "users only see own drafts"
ON public.drafts FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index for performance on searches
CREATE INDEX IF NOT EXISTS drafts_user_id_is_current_idx ON public.drafts (user_id, is_current);
