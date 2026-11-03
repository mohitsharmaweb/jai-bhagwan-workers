-- ==============================================================================
-- MIGRATION: Add 'photo' Column to 'workers' Table
-- ==============================================================================
-- This column stores the worker's identification photo (compressed base64 JPEG / URL).

ALTER TABLE public.workers 
ADD COLUMN IF NOT EXISTS photo text;

