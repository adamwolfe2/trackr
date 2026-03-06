ALTER TABLE "workspaces" ADD COLUMN "current_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "longest_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "api_logs_workspace_created_idx" ON "api_logs" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "software_spend_renewal_date_idx" ON "software_spend" USING btree ("renewal_date");--> statement-breakpoint
CREATE INDEX "software_spend_status_idx" ON "software_spend" USING btree ("status");