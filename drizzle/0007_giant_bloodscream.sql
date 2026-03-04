ALTER TABLE "audit_submissions" ADD COLUMN "employee_count" text;--> statement-breakpoint
ALTER TABLE "architects" ADD COLUMN "calendar_url" text;--> statement-breakpoint
CREATE INDEX "architect_commissions_referral_id_idx" ON "architect_commissions" USING btree ("referral_id");--> statement-breakpoint
CREATE INDEX "architect_referrals_workspace_id_idx" ON "architect_referrals" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "architect_referrals_status_idx" ON "architect_referrals" USING btree ("status");--> statement-breakpoint
ALTER TABLE "architect_commissions" ADD CONSTRAINT "architect_commissions_stripe_invoice_unique" UNIQUE("stripe_invoice_id");--> statement-breakpoint
ALTER TABLE "architect_referrals" ADD CONSTRAINT "architect_referrals_architect_submission_unique" UNIQUE("architect_id","audit_submission_id");