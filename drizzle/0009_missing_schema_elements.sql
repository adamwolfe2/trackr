-- Migration 0009: Add missing schema elements
-- Adds: webhook_events table, drip_emails table, reports.is_public,
--       tools.public_slug, workspace_members unique index

-- webhook_events table (idempotency log for Clerk and Stripe webhooks)
CREATE TABLE IF NOT EXISTS "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	"error" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "webhook_events_source_event_id_unique" ON "webhook_events" ("source", "event_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webhook_events_processed_at_idx" ON "webhook_events" ("processed_at");

--> statement-breakpoint
-- drip_emails table (tracks scheduled Resend drip email IDs for cancellation)
CREATE TABLE IF NOT EXISTS "drip_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_type" text NOT NULL,
	"resend_email_id" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "drip_emails_email_idx" ON "drip_emails" ("email");

--> statement-breakpoint
-- reports.is_public (for public tool library)
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "is_public" boolean DEFAULT false NOT NULL;

--> statement-breakpoint
-- tools.public_slug (URL slug for public research pages)
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "public_slug" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tools_public_slug_unique" ON "tools" ("public_slug") WHERE "public_slug" IS NOT NULL;

--> statement-breakpoint
-- workspace_members unique constraint on (workspace_id, user_id)
CREATE UNIQUE INDEX IF NOT EXISTS "workspace_members_workspace_user_unique" ON "workspace_members" ("workspace_id", "user_id");
