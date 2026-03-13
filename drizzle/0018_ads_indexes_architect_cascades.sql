-- Add missing indexes to ads table
CREATE INDEX IF NOT EXISTS "ads_tool_id_idx" ON "ads" USING btree ("tool_id");
CREATE INDEX IF NOT EXISTS "ads_workspace_id_idx" ON "ads" USING btree ("workspace_id");
CREATE INDEX IF NOT EXISTS "ads_status_idx" ON "ads" USING btree ("status");

-- Add cascade deletes to architect schema foreign keys
ALTER TABLE "architect_referrals" DROP CONSTRAINT IF EXISTS "architect_referrals_architect_id_architects_id_fk";
ALTER TABLE "architect_referrals" ADD CONSTRAINT "architect_referrals_architect_id_architects_id_fk" FOREIGN KEY ("architect_id") REFERENCES "architects"("id") ON DELETE CASCADE;

ALTER TABLE "architect_referrals" DROP CONSTRAINT IF EXISTS "architect_referrals_workspace_id_workspaces_id_fk";
ALTER TABLE "architect_referrals" ADD CONSTRAINT "architect_referrals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;

ALTER TABLE "architect_referrals" DROP CONSTRAINT IF EXISTS "architect_referrals_audit_submission_id_audit_submissions_id_fk";
ALTER TABLE "architect_referrals" ADD CONSTRAINT "architect_referrals_audit_submission_id_audit_submissions_id_fk" FOREIGN KEY ("audit_submission_id") REFERENCES "audit_submissions"("id") ON DELETE SET NULL;

ALTER TABLE "architect_commissions" DROP CONSTRAINT IF EXISTS "architect_commissions_architect_id_architects_id_fk";
ALTER TABLE "architect_commissions" ADD CONSTRAINT "architect_commissions_architect_id_architects_id_fk" FOREIGN KEY ("architect_id") REFERENCES "architects"("id") ON DELETE CASCADE;

ALTER TABLE "architect_commissions" DROP CONSTRAINT IF EXISTS "architect_commissions_referral_id_architect_referrals_id_fk";
ALTER TABLE "architect_commissions" ADD CONSTRAINT "architect_commissions_referral_id_architect_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "architect_referrals"("id") ON DELETE CASCADE;

ALTER TABLE "architect_payouts" DROP CONSTRAINT IF EXISTS "architect_payouts_architect_id_architects_id_fk";
ALTER TABLE "architect_payouts" ADD CONSTRAINT "architect_payouts_architect_id_architects_id_fk" FOREIGN KEY ("architect_id") REFERENCES "architects"("id") ON DELETE CASCADE;
