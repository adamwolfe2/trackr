CREATE TABLE "board_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"period" text NOT NULL,
	"period_start" timestamp,
	"period_end" timestamp,
	"data" jsonb NOT NULL,
	"share_token" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "board_reports_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"event_date" timestamp NOT NULL,
	"end_date" timestamp,
	"event_type" text NOT NULL,
	"related_tool_id" uuid,
	"related_contract_id" uuid,
	"related_spend_id" uuid,
	"reminder_days" integer[] DEFAULT '{7,30}',
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_intel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"competitor_name" text NOT NULL,
	"competitor_domain" text NOT NULL,
	"discovered_tools" jsonb DEFAULT '[]'::jsonb,
	"last_scanned_at" timestamp,
	"status" text DEFAULT 'tracking' NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"software_spend_id" uuid,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"extracted_terms" jsonb,
	"status" text DEFAULT 'processing' NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decision_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"tool_id" uuid,
	"action" text NOT NULL,
	"actor_id" text NOT NULL,
	"actor_name" text,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'connected' NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"external_account_id" text,
	"metadata" jsonb,
	"last_sync_at" timestamp,
	"error_message" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "literacy_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"respondent_id" text NOT NULL,
	"respondent_name" text,
	"answers" jsonb NOT NULL,
	"score" integer,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "literacy_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"questions" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "procurement_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"requested_by" text NOT NULL,
	"requested_by_name" text,
	"tool_name" text NOT NULL,
	"tool_url" text,
	"justification" text NOT NULL,
	"urgency" text DEFAULT 'medium' NOT NULL,
	"category" text,
	"estimated_budget" numeric(10, 2),
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_by_name" text,
	"review_notes" text,
	"approved_budget" numeric(10, 2),
	"tool_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"headline" text,
	"description" text,
	"show_scores" boolean DEFAULT true NOT NULL,
	"show_spend" boolean DEFAULT false NOT NULL,
	"show_health" boolean DEFAULT true NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "public_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "risk_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tool_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"overall_risk" integer NOT NULL,
	"breakdown" jsonb NOT NULL,
	"alert_level" text DEFAULT 'low' NOT NULL,
	"findings" jsonb,
	"assessed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stack_health_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"breakdown" jsonb NOT NULL,
	"recommendations" jsonb,
	"computed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "board_reports" ADD CONSTRAINT "board_reports_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_related_tool_id_tools_id_fk" FOREIGN KEY ("related_tool_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_related_contract_id_contracts_id_fk" FOREIGN KEY ("related_contract_id") REFERENCES "public"."contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_related_spend_id_software_spend_id_fk" FOREIGN KEY ("related_spend_id") REFERENCES "public"."software_spend"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_intel" ADD CONSTRAINT "competitor_intel_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_software_spend_id_software_spend_id_fk" FOREIGN KEY ("software_spend_id") REFERENCES "public"."software_spend"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_log" ADD CONSTRAINT "decision_log_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_log" ADD CONSTRAINT "decision_log_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "literacy_responses" ADD CONSTRAINT "literacy_responses_survey_id_literacy_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."literacy_surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "literacy_surveys" ADD CONSTRAINT "literacy_surveys_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_requests" ADD CONSTRAINT "procurement_requests_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_requests" ADD CONSTRAINT "procurement_requests_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_profiles" ADD CONSTRAINT "public_profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stack_health_scores" ADD CONSTRAINT "stack_health_scores_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "board_reports_workspace_id_idx" ON "board_reports" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "board_reports_created_at_idx" ON "board_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "calendar_events_workspace_id_idx" ON "calendar_events" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "calendar_events_event_date_idx" ON "calendar_events" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "calendar_events_event_type_idx" ON "calendar_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "competitor_intel_workspace_id_idx" ON "competitor_intel" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "competitor_intel_ws_domain_idx" ON "competitor_intel" USING btree ("workspace_id","competitor_domain");--> statement-breakpoint
CREATE INDEX "contracts_workspace_id_idx" ON "contracts" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "contracts_software_spend_id_idx" ON "contracts" USING btree ("software_spend_id");--> statement-breakpoint
CREATE INDEX "decision_log_workspace_id_idx" ON "decision_log" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "decision_log_tool_id_idx" ON "decision_log" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "decision_log_created_at_idx" ON "decision_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "decision_log_action_idx" ON "decision_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "integrations_workspace_id_idx" ON "integrations" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "integrations_ws_provider_idx" ON "integrations" USING btree ("workspace_id","provider");--> statement-breakpoint
CREATE INDEX "literacy_responses_survey_id_idx" ON "literacy_responses" USING btree ("survey_id");--> statement-breakpoint
CREATE UNIQUE INDEX "literacy_responses_survey_respondent_idx" ON "literacy_responses" USING btree ("survey_id","respondent_id");--> statement-breakpoint
CREATE INDEX "literacy_surveys_workspace_id_idx" ON "literacy_surveys" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "procurement_requests_workspace_id_idx" ON "procurement_requests" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "procurement_requests_status_idx" ON "procurement_requests" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "public_profiles_workspace_id_idx" ON "public_profiles" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "risk_assessments_tool_id_idx" ON "risk_assessments" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "risk_assessments_workspace_id_idx" ON "risk_assessments" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "risk_assessments_alert_level_idx" ON "risk_assessments" USING btree ("alert_level");--> statement-breakpoint
CREATE INDEX "stack_health_scores_workspace_id_idx" ON "stack_health_scores" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "stack_health_scores_computed_at_idx" ON "stack_health_scores" USING btree ("computed_at");