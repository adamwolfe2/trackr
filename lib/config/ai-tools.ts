export type ToolClassification = {
    classification: "ai-native" | "ai-enabled" | "traditional";
    hoursPerUserPerMonth: number;
    aiAlternative?: string;
    category?: string;
};

/**
 * Static classification map for known tools.
 * Keys are lowercase. Lookup is fuzzy: tool name contains key or key contains tool name.
 */
export const AI_TOOLS_MAP: Record<string, ToolClassification> = {
    // ── AI-native (purpose-built AI) ──────────────────────────────────
    "chatgpt": { classification: "ai-native", hoursPerUserPerMonth: 12, category: "AI Assistant" },
    "openai": { classification: "ai-native", hoursPerUserPerMonth: 10, category: "AI Assistant" },
    "claude": { classification: "ai-native", hoursPerUserPerMonth: 12, category: "AI Assistant" },
    "perplexity": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "AI Research" },
    "gemini": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "AI Assistant" },
    "mistral": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "AI Assistant" },
    "github copilot": { classification: "ai-native", hoursPerUserPerMonth: 30, category: "AI Dev Tools" },
    "copilot": { classification: "ai-native", hoursPerUserPerMonth: 25, category: "AI Dev Tools" },
    "cursor": { classification: "ai-native", hoursPerUserPerMonth: 35, category: "AI Dev Tools" },
    "codeium": { classification: "ai-native", hoursPerUserPerMonth: 25, category: "AI Dev Tools" },
    "tabnine": { classification: "ai-native", hoursPerUserPerMonth: 20, category: "AI Dev Tools" },
    "lovable": { classification: "ai-native", hoursPerUserPerMonth: 20, category: "AI Dev Tools" },
    "bolt": { classification: "ai-native", hoursPerUserPerMonth: 20, category: "AI Dev Tools" },
    "v0": { classification: "ai-native", hoursPerUserPerMonth: 15, category: "AI Dev Tools" },
    "replit": { classification: "ai-native", hoursPerUserPerMonth: 20, category: "AI Dev Tools" },
    "jasper": { classification: "ai-native", hoursPerUserPerMonth: 10, category: "AI Content" },
    "copy.ai": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "AI Content" },
    "writesonic": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "AI Content" },
    "midjourney": { classification: "ai-native", hoursPerUserPerMonth: 6, category: "AI Image" },
    "dall-e": { classification: "ai-native", hoursPerUserPerMonth: 4, category: "AI Image" },
    "stable diffusion": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "AI Image" },
    "runway": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "AI Video" },
    "heygen": { classification: "ai-native", hoursPerUserPerMonth: 6, category: "AI Video" },
    "synthesia": { classification: "ai-native", hoursPerUserPerMonth: 6, category: "AI Video" },
    "descript": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "AI Video" },
    "otter.ai": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "AI Meeting" },
    "otter": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "AI Meeting" },
    "fireflies.ai": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "AI Meeting" },
    "fireflies": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "AI Meeting" },
    "fathom": { classification: "ai-native", hoursPerUserPerMonth: 4, category: "AI Meeting" },
    "elevenlabs": { classification: "ai-native", hoursPerUserPerMonth: 6, category: "AI Audio" },
    "gong": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "AI Sales" },
    "chorus": { classification: "ai-native", hoursPerUserPerMonth: 6, category: "AI Sales" },
    "glean": { classification: "ai-native", hoursPerUserPerMonth: 6, category: "AI Search" },
    "notion ai": { classification: "ai-native", hoursPerUserPerMonth: 10, category: "AI Productivity" },
    "grammarly": { classification: "ai-native", hoursPerUserPerMonth: 4, category: "AI Content" },
    "grok": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "AI Assistant" },
    "deepseek": { classification: "ai-native", hoursPerUserPerMonth: 10, category: "AI Assistant" },
    "copilot pro": { classification: "ai-native", hoursPerUserPerMonth: 30, category: "AI Dev Tools" },
    "windsurf": { classification: "ai-native", hoursPerUserPerMonth: 30, category: "AI Dev Tools" },
    "huggingface": { classification: "ai-native", hoursPerUserPerMonth: 6, category: "AI Dev Tools" },
    "hugging face": { classification: "ai-native", hoursPerUserPerMonth: 6, category: "AI Dev Tools" },
    "together ai": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "AI Dev Tools" },
    "replicate": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "AI Dev Tools" },
    "langchain": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "AI Dev Tools" },
    "cohere": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "AI Dev Tools" },
    "suno": { classification: "ai-native", hoursPerUserPerMonth: 4, category: "AI Audio" },
    "udio": { classification: "ai-native", hoursPerUserPerMonth: 4, category: "AI Audio" },
    "pika": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "AI Video" },
    "sora": { classification: "ai-native", hoursPerUserPerMonth: 5, category: "AI Video" },
    "ideogram": { classification: "ai-native", hoursPerUserPerMonth: 4, category: "AI Image" },
    "leonardo.ai": { classification: "ai-native", hoursPerUserPerMonth: 4, category: "AI Image" },
    "leonardo": { classification: "ai-native", hoursPerUserPerMonth: 4, category: "AI Image" },
    "anthropic": { classification: "ai-native", hoursPerUserPerMonth: 12, category: "AI Assistant" },
    "google ai studio": { classification: "ai-native", hoursPerUserPerMonth: 8, category: "AI Assistant" },

    // ── AI-enabled (traditional + meaningful AI features) ─────────────
    "notion": { classification: "ai-enabled", hoursPerUserPerMonth: 5, category: "Productivity" },
    "figma": { classification: "ai-enabled", hoursPerUserPerMonth: 4, category: "Design" },
    "canva": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "Design" },
    "zoom": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Communication" },
    "slack": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Communication" },
    "hubspot": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "CRM" },
    "salesforce": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "CRM" },
    "intercom": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "Support" },
    "zendesk": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Support" },
    "monday": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Project Management" },
    "monday.com": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Project Management" },
    "linear": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Project Management" },
    "jira": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Project Management" },
    "confluence": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Productivity" },
    "microsoft 365": { classification: "ai-enabled", hoursPerUserPerMonth: 4, category: "Productivity" },
    "google workspace": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "Productivity" },
    "asana": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Project Management" },
    "clickup": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Project Management" },
    "loom": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "Communication" },
    "github": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "Dev Tools" },
    "gitlab": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "Dev Tools" },
    "adobe": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "Design" },
    "atlassian": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Project Management" },
    "hubspot crm": { classification: "ai-enabled", hoursPerUserPerMonth: 3, category: "CRM" },
    "google analytics": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Analytics" },
    "mixpanel": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Analytics" },
    "amplitude": { classification: "ai-enabled", hoursPerUserPerMonth: 2, category: "Analytics" },

    // ── Traditional (flagged with aiAlternative where applicable) ──────
    "trello": { classification: "traditional", hoursPerUserPerMonth: 0, aiAlternative: "Linear", category: "Project Management" },
    "basecamp": { classification: "traditional", hoursPerUserPerMonth: 0, aiAlternative: "Linear", category: "Project Management" },
    "microsoft teams": { classification: "traditional", hoursPerUserPerMonth: 0, aiAlternative: "Slack", category: "Communication" },
    "teams": { classification: "traditional", hoursPerUserPerMonth: 0, aiAlternative: "Slack", category: "Communication" },
    "skype": { classification: "traditional", hoursPerUserPerMonth: 0, aiAlternative: "Zoom", category: "Communication" },
    "dropbox": { classification: "traditional", hoursPerUserPerMonth: 0, aiAlternative: "Notion", category: "Productivity" },
    "box": { classification: "traditional", hoursPerUserPerMonth: 0, aiAlternative: "Notion", category: "Productivity" },
    "mailchimp": { classification: "traditional", hoursPerUserPerMonth: 0, category: "Marketing" },
    "quickbooks": { classification: "traditional", hoursPerUserPerMonth: 0, category: "Finance" },
    "xero": { classification: "traditional", hoursPerUserPerMonth: 0, category: "Finance" },
    "freshdesk": { classification: "traditional", hoursPerUserPerMonth: 0, aiAlternative: "Intercom", category: "Support" },
    "freshservice": { classification: "traditional", hoursPerUserPerMonth: 0, aiAlternative: "Intercom", category: "Support" },
    "pipedrive": { classification: "traditional", hoursPerUserPerMonth: 0, aiAlternative: "HubSpot", category: "CRM" },
    "zoho": { classification: "traditional", hoursPerUserPerMonth: 0, aiAlternative: "HubSpot", category: "CRM" },
    "surveymonkey": { classification: "traditional", hoursPerUserPerMonth: 0, category: "Marketing" },
    "typeform": { classification: "traditional", hoursPerUserPerMonth: 0, category: "Marketing" },
    "wordpress": { classification: "traditional", hoursPerUserPerMonth: 0, category: "Marketing" },
    "wix": { classification: "traditional", hoursPerUserPerMonth: 0, category: "Marketing" },
};

/**
 * Fuzzy-lookup a tool by name. Returns the classification or null if not found.
 * Matching priority: exact match → longest key contained in name → longest key containing name.
 * Longer matches win to avoid "copilot" matching before "github copilot".
 */
export function classifyTool(toolName: string): ToolClassification | null {
    const lower = toolName.toLowerCase().trim();
    if (!lower) return null;

    // 1. Exact match
    if (AI_TOOLS_MAP[lower]) return AI_TOOLS_MAP[lower];

    // 2. Collect all substring matches, pick the longest key (most specific)
    let bestMatch: { key: string; classification: ToolClassification } | null = null;

    for (const [key, classification] of Object.entries(AI_TOOLS_MAP)) {
        // Skip very short keys (<=2 chars) for fuzzy to prevent false positives like "v0" matching "devops"
        if (key.length <= 2) continue;

        if (lower.includes(key)) {
            // Tool name contains this map key — prefer longest key
            if (!bestMatch || key.length > bestMatch.key.length) {
                bestMatch = { key, classification };
            }
        }
    }

    if (bestMatch) return bestMatch.classification;

    // 3. Fallback: check if any key contains the tool name (for abbreviated inputs)
    //    Only if tool name is 4+ chars to prevent "ai" matching everything
    if (lower.length >= 4) {
        for (const [key, classification] of Object.entries(AI_TOOLS_MAP)) {
            if (key.includes(lower)) {
                if (!bestMatch || key.length < bestMatch.key.length) {
                    bestMatch = { key, classification };
                }
            }
        }
    }

    return bestMatch?.classification ?? null;
}
