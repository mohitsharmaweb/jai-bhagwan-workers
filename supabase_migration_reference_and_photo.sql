-- ==============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO ENABLE 'reference' AND 'photo' COLUMNS
-- ==============================================================================

ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS reference text;
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS photo text;
CREATE INDEX IF NOT EXISTS idx_workers_reference ON public.workers(reference);
