-- Add unique constraint to prevent duplicate workspace memberships
CREATE UNIQUE INDEX IF NOT EXISTS "workspace_members_workspace_user_unique" ON "workspace_members" ("workspace_id", "user_id");
