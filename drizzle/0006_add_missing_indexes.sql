CREATE INDEX IF NOT EXISTS "notes_tool_id_idx" ON "notes" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pain_points_workspace_id_idx" ON "pain_points" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspaces_slack_channel_id_idx" ON "workspaces" USING btree ("slack_channel_id");
