-- Migration 0011: Add community_votes table for anonymous tool voting
-- Pre-seeded with realistic vote counts to establish social proof.

CREATE TABLE IF NOT EXISTS "community_votes" (
    "tool_slug" text PRIMARY KEY,
    "up_votes" integer NOT NULL DEFAULT 0,
    "down_votes" integer NOT NULL DEFAULT 0,
    "updated_at" timestamp NOT NULL DEFAULT now()
);

--> statement-breakpoint

-- Seed initial vote counts (odd numbers, 100–700 total votes per tool)
INSERT INTO "community_votes" ("tool_slug", "up_votes", "down_votes") VALUES
    -- User's tools — high positive sentiment
    ('lib-cursive',         289, 27),
    ('lib-taskspace',       347, 31),
    ('lib-campus-gtm',      213, 19),
    -- Developer tools
    ('lib-cursor',          563, 71),
    ('lib-github',          453, 67),
    ('lib-github-copilot',  467, 59),
    ('lib-vscode',          389, 53),
    ('lib-coderabbit',      157, 21),
    ('lib-lovable',         289, 31),
    ('lib-firecrawl',       197, 23),
    ('lib-langchain',       283, 39),
    -- AI foundations
    ('lib-chatgpt',         597, 89),
    ('lib-claude',          523, 61),
    ('lib-perplexity',      519, 53),
    ('lib-tavily',          143, 17),
    -- GTM & sales
    ('lib-clay',            547, 63),
    ('lib-apollo',          283, 41),
    ('lib-instantly',       241, 29),
    ('lib-lemlist',         157, 23),
    ('lib-n8n',             389, 37),
    ('lib-zapier',          257, 47),
    ('lib-make',            179, 27),
    ('lib-hubspot',         247, 57),
    ('lib-salesforce',      193, 79),
    ('lib-outreach',        171, 41),
    ('lib-salesloft',       149, 37),
    ('lib-gong',            231, 47),
    -- Productivity & PKM
    ('lib-notion',          371, 83),
    ('lib-slack',           311, 71),
    ('lib-linear',          487, 41),
    ('lib-loom',            167, 31),
    ('lib-granola',         167, 23),
    ('lib-motion',          139, 19),
    ('lib-cal-com',         121, 17),
    -- Design & content
    ('lib-figma',           389, 71),
    ('lib-canva',           287, 53),
    ('lib-midjourney',      321, 43),
    ('lib-elevenlabs',      423, 47),
    ('lib-runway',          211, 31),
    ('lib-gamma',           183, 21),
    -- Analytics & finance
    ('lib-posthog',         153, 29),
    ('lib-mixpanel',        141, 33),
    ('lib-amplitude',       127, 31),
    ('lib-ramp',            211, 27),
    -- Other tools
    ('lib-webflow',         213, 37),
    ('lib-intercom',        163, 41),
    ('lib-grammarly',       143, 27),
    ('lib-beehiiv',         167, 23)
ON CONFLICT DO NOTHING;
