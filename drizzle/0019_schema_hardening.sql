-- Backfill NULLs before adding NOT NULL constraints
UPDATE pain_points SET created_by = '00000000-0000-0000-0000-000000000000' WHERE created_by IS NULL;
UPDATE research_jobs SET triggered_by = 'system' WHERE triggered_by IS NULL;
UPDATE audit_submissions SET contact_name = 'unknown' WHERE contact_name IS NULL;

-- Add NOT NULL constraints
ALTER TABLE pain_points ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE research_jobs ALTER COLUMN triggered_by SET NOT NULL;
ALTER TABLE audit_submissions ALTER COLUMN contact_name SET NOT NULL;
