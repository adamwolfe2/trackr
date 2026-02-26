CREATE TABLE "audit_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_email" text NOT NULL,
	"contact_name" text,
	"call_owner_email" text,
	"company_name" text NOT NULL,
	"company_website" text,
	"industry" text,
	"company_size" text,
	"role" text,
	"revenue" text,
	"ai_tool_count" text,
	"daily_adoption_pct" text,
	"has_ai_manager" text,
	"monthly_spend" text,
	"biggest_bottleneck" text,
	"teams_needing_ai" text[] DEFAULT '{}',
	"failed_ai" text,
	"success_definition" text,
	"current_tools" text[] DEFAULT '{}',
	"tool_frustrations" text,
	"manual_processes" text,
	"scorecard" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "community_votes" (
	"tool_slug" text PRIMARY KEY NOT NULL,
	"up_votes" integer DEFAULT 0 NOT NULL,
	"down_votes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drip_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_type" text NOT NULL,
	"resend_email_id" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"email" text NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	"error" text
);
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "credit_balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "public_slug" text;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "research_interval" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "next_research_at" timestamp;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "slack_bot_token" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "slack_team_id" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "slack_team_name" text;--> statement-breakpoint
ALTER TABLE "pending_invitations" ADD CONSTRAINT "pending_invitations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_submissions_created_at_idx" ON "audit_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_submissions_contact_email_idx" ON "audit_submissions" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "drip_emails_email_idx" ON "drip_emails" USING btree ("email");--> statement-breakpoint
CREATE INDEX "pending_invitations_email_idx" ON "pending_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "pending_invitations_workspace_id_idx" ON "pending_invitations" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_source_event_id_unique" ON "webhook_events" USING btree ("source","event_id");--> statement-breakpoint
CREATE INDEX "webhook_events_processed_at_idx" ON "webhook_events" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "notes_tool_id_idx" ON "notes" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "pain_points_workspace_id_idx" ON "pain_points" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_workspace_user_unique" ON "workspace_members" USING btree ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX "workspaces_slack_channel_id_idx" ON "workspaces" USING btree ("slack_channel_id");--> statement-breakpoint
ALTER TABLE "tools" ADD CONSTRAINT "tools_public_slug_unique" UNIQUE("public_slug");