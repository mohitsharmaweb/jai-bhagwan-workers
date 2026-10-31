-- ==============================================================================
-- MIGRATION: Prevent Duplicate Mobile Numbers in 'workers' Table
-- ==============================================================================

-- 1. Query to find existing duplicates by mobile number (commented for reference):
-- SELECT mobile, count(*) AS duplicate_count 
-- FROM public.workers 
-- GROUP BY mobile 
-- HAVING count(*) > 1;

-- 2. Delete duplicate rows, keeping only the oldest record (based on created_at):
DELETE FROM public.workers
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY mobile
             ORDER BY created_at ASC, id ASC
           ) AS rnum
    FROM public.workers
  ) t
  WHERE t.rnum > 1
);

-- 3. Add UNIQUE constraint on the mobile column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    WHERE t.relname = 'workers'
      AND c.contype = 'u'
      AND a.attname = 'mobile'
  ) THEN
    ALTER TABLE public.workers
    ADD CONSTRAINT workers_mobile_unique UNIQUE (mobile);
  END IF;
END $$;

