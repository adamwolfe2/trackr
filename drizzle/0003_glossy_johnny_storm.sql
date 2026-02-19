ALTER TABLE "workspaces" ADD COLUMN "slack_channel_id" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "slack_enabled" boolean DEFAULT false NOT NULL;