-- Architect system: applications, profiles, referrals, commissions, payouts

CREATE TABLE IF NOT EXISTS "architect_applications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "first_name" text NOT NULL,
    "last_name" text NOT NULL,
    "email" text NOT NULL,
    "phone" text,
    "linkedin_url" text,
    "role_slug" text NOT NULL,
    "experience" text,
    "portfolio_url" text,
    "referral_source" text,
    "status" text DEFAULT 'pending' NOT NULL,
    "reviewed_at" timestamp,
    "review_notes" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "architect_applications_email_idx" ON "architect_applications" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "architect_applications_status_idx" ON "architect_applications" USING btree ("status");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "architects" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "application_id" uuid NOT NULL REFERENCES "architect_applications"("id"),
    "user_id" text,
    "email" text NOT NULL UNIQUE,
    "first_name" text NOT NULL,
    "last_name" text NOT NULL,
    "role" text NOT NULL,
    "arc_code" text NOT NULL UNIQUE,
    "stripe_connect_account_id" text,
    "stripe_onboarding_complete" boolean DEFAULT false NOT NULL,
    "status" text DEFAULT 'active' NOT NULL,
    "total_earnings" integer DEFAULT 0 NOT NULL,
    "total_clients" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "architects_user_id_idx" ON "architects" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "architects_arc_code_idx" ON "architects" USING btree ("arc_code");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "architect_referrals" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "architect_id" uuid NOT NULL REFERENCES "architects"("id"),
    "workspace_id" uuid REFERENCES "workspaces"("id"),
    "audit_submission_id" uuid REFERENCES "audit_submissions"("id"),
    "status" text DEFAULT 'lead' NOT NULL,
    "attributed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "architect_referrals_architect_id_idx" ON "architect_referrals" USING btree ("architect_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "architect_commissions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "architect_id" uuid NOT NULL REFERENCES "architects"("id"),
    "referral_id" uuid NOT NULL REFERENCES "architect_referrals"("id"),
    "stripe_invoice_id" text NOT NULL,
    "invoice_amount" integer NOT NULL,
    "commission_rate" integer DEFAULT 20 NOT NULL,
    "commission_amount" integer NOT NULL,
    "status" text DEFAULT 'pending' NOT NULL,
    "stripe_transfer_id" text,
    "paid_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "architect_commissions_architect_id_idx" ON "architect_commissions" USING btree ("architect_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "architect_payouts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "architect_id" uuid NOT NULL REFERENCES "architects"("id"),
    "amount" integer NOT NULL,
    "stripe_payout_id" text,
    "status" text DEFAULT 'pending' NOT NULL,
    "period_start" timestamp NOT NULL,
    "period_end" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "architect_payouts_architect_id_idx" ON "architect_payouts" USING btree ("architect_id");
--> statement-breakpoint

-- Add arcCode column to audit_submissions for architect attribution
ALTER TABLE "audit_submissions" ADD COLUMN IF NOT EXISTS "arc_code" text;
