-- ==============================================================================
-- MIGRATION: Meetings Feature for Admin
-- ==============================================================================

-- 1. Create 'meetings' table
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  meeting_date date NOT NULL,
  meeting_time time NOT NULL,
  location text NOT NULL,
  notes text,
  target_trade text,
  target_area text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON public.meetings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_date ON public.meetings(meeting_date DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- 4. Drop any existing policy to avoid conflicts on re-runs
DROP POLICY IF EXISTS "Allow admins full access to meetings" ON public.meetings;

-- 5. Policy allowing ALL only for authenticated users (Admins). Public (anon) has NO access.
CREATE POLICY "Allow admins full access to meetings"
ON public.meetings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

