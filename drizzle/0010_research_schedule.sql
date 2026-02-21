-- Migration 0010: Add research schedule fields to tools
-- Allows users to configure auto-research intervals per tool

ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "research_interval" text DEFAULT 'manual' NOT NULL;
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "next_research_at" timestamp;

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tools_next_research_at_idx" ON "tools" ("next_research_at") WHERE "next_research_at" IS NOT NULL;
