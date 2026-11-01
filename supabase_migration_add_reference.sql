-- ==============================================================================
-- MIGRATION: Add 'reference' Column to 'workers' Table
-- ==============================================================================
-- This column stores referral information: who referred the worker or which
-- contractor/builder/shopkeeper/firm they currently work with.

ALTER TABLE public.workers 
ADD COLUMN IF NOT EXISTS reference text;

CREATE INDEX IF NOT EXISTS idx_workers_reference ON public.workers(reference);

