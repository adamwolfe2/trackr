CREATE TABLE IF NOT EXISTS "pending_invitations" (
	"id" uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
	"workspace_id" uuid NOT NULL,
	"email" text NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "pending_invitations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pending_invitations_email_idx" ON "pending_invitations" ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pending_invitations_workspace_id_idx" ON "pending_invitations" ("workspace_id");
