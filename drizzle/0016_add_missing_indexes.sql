-- Add missing indexes for query performance
-- notes.workspace_member_id: used in member lookups and cascade deletes
CREATE INDEX IF NOT EXISTS "notes_workspace_member_id_idx" ON "notes" ("workspace_member_id");

-- api_logs.tool_id: used when deleting tools (cleanup related logs)
CREATE INDEX IF NOT EXISTS "api_logs_tool_id_idx" ON "api_logs" ("tool_id");

-- research_jobs.status: used in cron jobs to find queued/running/stuck jobs
CREATE INDEX IF NOT EXISTS "research_jobs_status_idx" ON "research_jobs" ("status");
