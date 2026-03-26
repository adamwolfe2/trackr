ALTER TABLE "ads" DROP CONSTRAINT "ads_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "ads" DROP CONSTRAINT "ads_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "api_logs" DROP CONSTRAINT "api_logs_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "api_logs" DROP CONSTRAINT "api_logs_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_submissions" DROP CONSTRAINT "audit_submissions_pre_built_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "notes" DROP CONSTRAINT "notes_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "notes" DROP CONSTRAINT "notes_workspace_member_id_workspace_members_id_fk";
--> statement-breakpoint
ALTER TABLE "pain_points" DROP CONSTRAINT "pain_points_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "research_jobs" DROP CONSTRAINT "research_jobs_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "tools" DROP CONSTRAINT "tools_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "workspace_members" DROP CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_referrer_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "architect_commissions" DROP CONSTRAINT "architect_commissions_architect_id_architects_id_fk";
--> statement-breakpoint
ALTER TABLE "architect_commissions" DROP CONSTRAINT "architect_commissions_referral_id_architect_referrals_id_fk";
--> statement-breakpoint
ALTER TABLE "architect_payouts" DROP CONSTRAINT "architect_payouts_architect_id_architects_id_fk";
--> statement-breakpoint
ALTER TABLE "architect_referrals" DROP CONSTRAINT "architect_referrals_architect_id_architects_id_fk";
--> statement-breakpoint
ALTER TABLE "architect_referrals" DROP CONSTRAINT "architect_referrals_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "architect_referrals" DROP CONSTRAINT "architect_referrals_audit_submission_id_audit_submissions_id_fk";
--> statement-breakpoint
ALTER TABLE "architects" DROP CONSTRAINT "architects_application_id_architect_applications_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_submissions" ALTER COLUMN "contact_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pain_points" ALTER COLUMN "created_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "research_jobs" ALTER COLUMN "triggered_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_submissions" ADD COLUMN "share_viewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "audit_submissions" ADD COLUMN "public_slug" text;--> statement-breakpoint
ALTER TABLE "drip_emails" ADD COLUMN "audit_submission_id" uuid;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_logs" ADD CONSTRAINT "api_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_logs" ADD CONSTRAINT "api_logs_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_submissions" ADD CONSTRAINT "audit_submissions_pre_built_workspace_id_workspaces_id_fk" FOREIGN KEY ("pre_built_workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_emails" ADD CONSTRAINT "drip_emails_audit_submission_id_audit_submissions_id_fk" FOREIGN KEY ("audit_submission_id") REFERENCES "public"."audit_submissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_workspace_member_id_workspace_members_id_fk" FOREIGN KEY ("workspace_member_id") REFERENCES "public"."workspace_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pain_points" ADD CONSTRAINT "pain_points_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_jobs" ADD CONSTRAINT "research_jobs_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools" ADD CONSTRAINT "tools_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_workspace_id_workspaces_id_fk" FOREIGN KEY ("referrer_workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "architect_commissions" ADD CONSTRAINT "architect_commissions_architect_id_architects_id_fk" FOREIGN KEY ("architect_id") REFERENCES "public"."architects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "architect_commissions" ADD CONSTRAINT "architect_commissions_referral_id_architect_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."architect_referrals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "architect_payouts" ADD CONSTRAINT "architect_payouts_architect_id_architects_id_fk" FOREIGN KEY ("architect_id") REFERENCES "public"."architects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "architect_referrals" ADD CONSTRAINT "architect_referrals_architect_id_architects_id_fk" FOREIGN KEY ("architect_id") REFERENCES "public"."architects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "architect_referrals" ADD CONSTRAINT "architect_referrals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "architect_referrals" ADD CONSTRAINT "architect_referrals_audit_submission_id_audit_submissions_id_fk" FOREIGN KEY ("audit_submission_id") REFERENCES "public"."audit_submissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "architects" ADD CONSTRAINT "architects_application_id_architect_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."architect_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ads_tool_id_idx" ON "ads" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "ads_workspace_id_idx" ON "ads" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "ads_status_idx" ON "ads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ads_workspace_status_idx" ON "ads" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "api_logs_tool_id_idx" ON "api_logs" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "audit_submissions_public_slug_idx" ON "audit_submissions" USING btree ("public_slug");--> statement-breakpoint
CREATE INDEX "drip_emails_audit_submission_id_idx" ON "drip_emails" USING btree ("audit_submission_id");--> statement-breakpoint
CREATE INDEX "feed_workspace_created_idx" ON "feed_items" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "notes_workspace_member_id_idx" ON "notes" USING btree ("workspace_member_id");--> statement-breakpoint
CREATE INDEX "research_jobs_status_idx" ON "research_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "spend_workspace_status_idx" ON "software_spend" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "tools_last_researched_at_idx" ON "tools" USING btree ("last_researched_at");--> statement-breakpoint
CREATE INDEX "tools_workspace_status_idx" ON "tools" USING btree ("workspace_id","status");--> statement-breakpoint
ALTER TABLE "audit_submissions" ADD CONSTRAINT "audit_submissions_public_slug_unique" UNIQUE("public_slug");