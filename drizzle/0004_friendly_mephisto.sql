CREATE TABLE "api_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service" text NOT NULL,
	"endpoint" text NOT NULL,
	"method" text DEFAULT 'POST' NOT NULL,
	"status_code" integer,
	"duration_ms" integer,
	"tokens_in" integer,
	"tokens_out" integer,
	"estimated_cost" numeric(10, 6),
	"workspace_id" uuid,
	"tool_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_logs" ADD CONSTRAINT "api_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_logs" ADD CONSTRAINT "api_logs_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_logs_service_idx" ON "api_logs" USING btree ("service");--> statement-breakpoint
CREATE INDEX "api_logs_created_at_idx" ON "api_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "api_logs_workspace_id_idx" ON "api_logs" USING btree ("workspace_id");