ALTER TABLE "reports" ADD COLUMN "share_token" text;--> statement-breakpoint
ALTER TABLE "software_spend" ADD COLUMN "renewal_date" timestamp;--> statement-breakpoint
ALTER TABLE "software_spend" ADD COLUMN "contract_length_months" integer;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "api_key" text;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_share_token_unique" UNIQUE("share_token");--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_api_key_unique" UNIQUE("api_key");