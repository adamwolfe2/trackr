export type AiClassification = "ai-native" | "ai-enabled" | "traditional";

export type ToolClassification = {
    classification: AiClassification;
    hoursPerUserPerMonth: number; // time savings estimate
    aiAlternative?: string; // suggestion for "consider replacing with..."
    category?: string; // normalized category for gap detection
};

/**
 * Static classification map for ~60 known SaaS tools.
 * Keys are LOWERCASE. Lookup is fuzzy: tool name contains key or key contains tool name.
 */
export const AI_TOOLS_MAP: Record<string, ToolClassification> = {
    // ── AI-native (purpose-built AI, 5-40 h/user/mo) ────────────────────

    // AI assistants
    "chatgpt": { classification: "ai-native", hoursPerUserPerMonth: 20, category: "ai-assistant" },
    "openai": { classification: "ai-native", hoursPerUserPerMonth: 20, category: "ai-assistant" },
    "claude": { classification: "ai-native", hoursPerUserPerMonth: 20, category: "ai-assistant" },
    "anthropic": { classification: "ai-native", hoursPerUserPerMonth: 20, category: "ai-assistant" },
    "gemini": { classification: "ai-native", hoursPerUserPerMonth: 15, category: "ai-assistant" },
    "grok": { classification: "ai-native", hoursPerUserPerMonth: 10, category: "ai-assistant" },
    "deepseek": { classification: "ai-native", hoursPerUserPerMonth: 15, category: "ai-assistant" },
    "mistral": { classification: "ai-native", hoursPerUserPerMonth: 12, category: "ai-assistant" },

    // AI search
    "perplexity": { classification: "ai-native", hoursPerUserPerMonth: 10, category: "ai-search" },
    "glean": { classification: "ai-native", hoursPerUserPerMonth: 10, category: "ai-search" },

    // AI dev tools
    "github copilot": { classification: "ai-native", hoursPerUserPerMonth: 35, category: "ai-dev" },
    "copilot": { classification: "ai-native", hoursPerUserPerMonth: 35, category: "ai-dev" },
    "cursor": { classification: "ai-native", hoursPerUserPerMonth: 35, category: "ai-dev" },
    "windsurf": { classification: "ai-native", hoursPerUserPerMonth: 30, category: "ai-dev" },
    "codeium": { classification: "ai-native", hoursPerUserPerMonth: 25, category: "ai-dev" },
    "tabnine": { classification: "ai-native", hoursPerUserPerMonth: 20, category: "ai-dev" },
    "v0": { classification: "ai-native", hoursPerUserPerMonth: 10, category: "ai-dev" },
    "replit": { classification: "ai-native", hoursPerUserPerMonth: 15, category: "ai-dev" },
    "lovable": { classification: "ai-native", hoursPerUserPerMonth: 15, category: "ai-dev" },
    "bolt": { classification: "ai-native", hoursPerUserPerMonth: 15, category: "ai-dev" },

    // AI writing
    "jasper": { classification: "ai-native", hoursPerUserPerMonth: 15, category: "ai-writing" },
    "copy.ai": { classification: "ai-native", hoursPerUserPerMonth: 12, category: "ai-writing" },
    "writesonic": { classification: "ai-native", hoursPerUserPerMonth: 10, category: "ai-writing" },
    "grammarly": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "ai-writing" },

    // AI design / image
    "midjourney": { classification: "ai-native", hoursPerUserPerMonth: 10, category: "ai-design" },
    "dall-e": { classification: "ai-native", hoursPerUserPerMonth: 6, category: "ai-design" },
    "ideogram": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "ai-design" },
    "leonardo.ai": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "ai-design" },
    "leonardo": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "ai-design" },

    // AI video
    "runway": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "ai-video" },
    "heygen": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "ai-video" },
    "synthesia": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "ai-video" },
    "descript": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "ai-video" },
    "pika": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "ai-video" },
    "sora": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "ai-video" },

    // AI meetings
    "otter.ai": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "ai-meetings" },
    "otter": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "ai-meetings" },
    "fireflies.ai": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "ai-meetings" },
    "fireflies": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "ai-meetings" },
    "fathom": { classification: "ai-native", hoursPerUserPerMonth: 6, category: "ai-meetings" },

    // AI audio
    "elevenlabs": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "ai-audio" },
    "suno": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "ai-audio" },

    // AI sales
    "gong": { classification: "ai-native", hoursPerUserPerMonth: 15, category: "ai-sales" },
    "chorus": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "ai-sales" },

    // AI email
    "superhuman": { classification: "ai-native", hoursPerUserPerMonth: 10, category: "ai-email" },

    // ── AI-enabled (traditional + meaningful AI features, 2-10 h/user/mo) ─

    // Docs & productivity
    "notion": { classification: "ai-enabled", hoursPerUserPerMonth: 8, category: "docs" },
    "confluence": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "docs" },
    "microsoft 365": { classification: "ai-enabled", hoursPerUserPerMonth: 5, category: "productivity-suite" },
    "google workspace": { classification: "ai-enabled", hoursPerUserPerMonth: 5, category: "productivity-suite" },

    // Design
    "figma": { classification: "ai-enabled", hoursPerUserPerMonth: 5, category: "design" },
    "canva": { classification: "ai-enabled", hoursPerUserPerMonth: 5, category: "design" },
    "adobe": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "design" },

    // Communication
    "zoom": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "video-conferencing" },
    "slack": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "communication" },
    "loom": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "video" },

    // CRM
    "hubspot": { classification: "ai-enabled", hoursPerUserPerMonth: 5, category: "crm" },
    "salesforce": { classification: "ai-enabled", hoursPerUserPerMonth: 5, category: "crm" },

    // Support
    "intercom": { classification: "ai-enabled", hoursPerUserPerMonth: 4, category: "support" },
    "zendesk": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "support" },

    // Project management
    "monday": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "project-management" },
    "monday.com": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "project-management" },
    "linear": { classification: "ai-enabled", hoursPerUserPerMonth: 5, category: "project-management" },
    "jira": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "project-management" },
    "asana": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "project-management" },
    "clickup": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "project-management" },
    "atlassian": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "project-management" },

    // Database
    "airtable": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "database" },

    // Whiteboard
    "miro": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "whiteboard" },

    // Dev platforms
    "vercel": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "devops" },
    "github": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "dev" },
    "gitlab": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "dev" },

    // Analytics
    "google analytics": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "analytics" },
    "mixpanel": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "analytics" },
    "amplitude": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "analytics" },

    // ── Traditional (0 h saved, aiAlternative where applicable) ──────────

    // Project management
    "trello": { classification: "traditional", hoursPerUserPerMonth: 0, category: "project-management", aiAlternative: "Linear" },
    "basecamp": { classification: "traditional", hoursPerUserPerMonth: 0, category: "project-management", aiAlternative: "Linear" },
    "teamwork": { classification: "traditional", hoursPerUserPerMonth: 0, category: "project-management", aiAlternative: "Linear" },
    "todoist": { classification: "traditional", hoursPerUserPerMonth: 0, category: "task-management", aiAlternative: "Linear" },

    // Storage
    "dropbox": { classification: "traditional", hoursPerUserPerMonth: 0, category: "storage", aiAlternative: "Google Drive" },
    "box": { classification: "traditional", hoursPerUserPerMonth: 0, category: "storage", aiAlternative: "Google Drive" },

    // Email marketing
    "mailchimp": { classification: "traditional", hoursPerUserPerMonth: 0, category: "email-marketing", aiAlternative: "Jasper + Mailchimp AI" },

    // CMS
    "wordpress": { classification: "traditional", hoursPerUserPerMonth: 0, category: "cms", aiAlternative: "Webflow AI" },
    "wix": { classification: "traditional", hoursPerUserPerMonth: 0, category: "cms", aiAlternative: "Webflow AI" },

    // Support
    "freshdesk": { classification: "traditional", hoursPerUserPerMonth: 0, category: "support", aiAlternative: "Intercom" },

    // CRM
    "pipedrive": { classification: "traditional", hoursPerUserPerMonth: 0, category: "crm", aiAlternative: "HubSpot" },

    // Notes
    "evernote": { classification: "traditional", hoursPerUserPerMonth: 0, category: "notes", aiAlternative: "Notion" },

    // Video conferencing
    "webex": { classification: "traditional", hoursPerUserPerMonth: 0, category: "video-conferencing", aiAlternative: "Zoom" },
    "gotomeeting": { classification: "traditional", hoursPerUserPerMonth: 0, category: "video-conferencing", aiAlternative: "Zoom" },

    // Social media
    "hootsuite": { classification: "traditional", hoursPerUserPerMonth: 0, category: "social-media" },
    "buffer": { classification: "traditional", hoursPerUserPerMonth: 0, category: "social-media" },

    // Accounting
    "quickbooks": { classification: "traditional", hoursPerUserPerMonth: 0, category: "accounting" },
    "xero": { classification: "traditional", hoursPerUserPerMonth: 0, category: "accounting" },

    // HR
    "bamboohr": { classification: "traditional", hoursPerUserPerMonth: 0, category: "hr" },
    "gusto": { classification: "traditional", hoursPerUserPerMonth: 0, category: "hr" },
};

/**
 * Fuzzy-lookup a tool by name.
 *
 * Matching priority:
 *   1. Exact match on lowercase key
 *   2. Tool name contains a map key (longest key wins to prefer "github copilot" over "copilot")
 *   3. Map key contains the tool name (shortest key wins, only for 4+ char inputs)
 *
 * Always returns an object. Check `matched` to know if the tool was found in the map.
 * Unmatched tools default to classification "traditional" with 0 hours.
 */
export function classifyTool(toolName: string): ToolClassification & { matched: boolean } {
    const lower = toolName.toLowerCase().trim();

    if (!lower) {
        return { classification: "traditional", hoursPerUserPerMonth: 0, matched: false };
    }

    // 1. Exact match
    if (AI_TOOLS_MAP[lower]) {
        return { ...AI_TOOLS_MAP[lower], matched: true };
    }

    // 2. Tool name contains a map key — pick the longest key (most specific)
    let bestMatch: ToolClassification | null = null;
    let bestKeyLen = 0;

    for (const [key, value] of Object.entries(AI_TOOLS_MAP)) {
        // Skip very short keys (<=2 chars) to prevent false positives like "v0" matching "devops"
        if (key.length <= 2) continue;

        if (lower.includes(key) && key.length > bestKeyLen) {
            bestMatch = value;
            bestKeyLen = key.length;
        }
    }

    if (bestMatch) {
        return { ...bestMatch, matched: true };
    }

    // 3. Fallback: map key contains the tool name (for abbreviated inputs)
    //    Only if tool name is 4+ chars to avoid "ai" matching everything
    if (lower.length >= 4) {
        let fallback: ToolClassification | null = null;
        let fallbackKeyLen = Infinity;

        for (const [key, value] of Object.entries(AI_TOOLS_MAP)) {
            if (key.includes(lower) && key.length < fallbackKeyLen) {
                fallback = value;
                fallbackKeyLen = key.length;
            }
        }

        if (fallback) {
            return { ...fallback, matched: true };
        }
    }

    return { classification: "traditional", hoursPerUserPerMonth: 0, matched: false };
}
