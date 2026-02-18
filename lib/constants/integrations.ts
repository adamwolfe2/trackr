export interface Integration {
    name: string;
    file: string;
    category: string;
    url?: string;
}

export const INTEGRATIONS: Integration[] = [
    // Communication
    { name: "Slack", file: "slack-svgrepo-com.svg", category: "Communication", url: "slack.com" },
    { name: "Microsoft Teams", file: "icons8-microsoft-teams.svg", category: "Communication", url: "microsoft.com/teams" },
    { name: "Zoom", file: "icons8-zoom.svg", category: "Communication", url: "zoom.us" },
    { name: "Telegram", file: "telegram-communication-chat-interaction-network-connection-svgrepo-com.svg", category: "Communication", url: "telegram.org" },

    // Email
    { name: "Gmail", file: "gmail.svg", category: "Email", url: "gmail.com" },
    { name: "Microsoft Outlook", file: "icons8-microsoft-outlook-2019.svg", category: "Email", url: "outlook.com" },

    // Productivity
    { name: "Notion", file: "notion.svg", category: "Productivity", url: "notion.so" },
    { name: "Google Drive", file: "google-drive-svgrepo-com.svg", category: "Productivity", url: "drive.google.com" },
    { name: "Google Docs", file: "google-docs-svgrepo-com.svg", category: "Productivity", url: "docs.google.com" },
    { name: "Google Sheets", file: "gsheet-document-svgrepo-com.svg", category: "Productivity", url: "sheets.google.com" },
    { name: "Google Calendar", file: "google-calendar-svgrepo-com.svg", category: "Productivity", url: "calendar.google.com" },
    { name: "Airtable", file: "airtable-svgrepo-com.svg", category: "Productivity", url: "airtable.com" },
    { name: "Trello", file: "trello_logo_icon_167765.png", category: "Productivity", url: "trello.com" },
    { name: "Asana", file: "asana.svg", category: "Productivity", url: "asana.com" },
    { name: "Typeform", file: "typeform.svg", category: "Productivity", url: "typeform.com" },
    { name: "Calendly", file: "calendly.svg", category: "Productivity", url: "calendly.com" },

    // Project Management
    { name: "Linear", file: "linear.svg", category: "Engineering", url: "linear.app" },
    { name: "GitHub", file: "github.svg", category: "Engineering", url: "github.com" },
    { name: "Sentry", file: "Sentry_idovIhtf_y_0.svg", category: "Engineering", url: "sentry.io" },

    // CRM & Sales
    { name: "HubSpot", file: "hubspot-svgrepo-com.svg", category: "CRM & Sales", url: "hubspot.com" },
    { name: "Salesforce", file: "salesforce.svg", category: "CRM & Sales", url: "salesforce.com" },
    { name: "Apollo", file: "apollo.svg", category: "CRM & Sales", url: "apollo.io" },
    { name: "Instantly", file: "instantly.webp", category: "CRM & Sales", url: "instantly.ai" },

    // Marketing
    { name: "Google Ads", file: "google-ads-svgrepo-com.svg", category: "Marketing", url: "ads.google.com" },
    { name: "Klaviyo", file: "klaviyo.svg", category: "Marketing", url: "klaviyo.com" },
    { name: "Attentive", file: "attentive.webp", category: "Marketing", url: "attentive.com" },
    { name: "Search Console", file: "search-console-icon-2025-1.svg", category: "Marketing", url: "search.google.com" },

    // Social
    { name: "LinkedIn", file: "linkedin.svg", category: "Social", url: "linkedin.com" },
    { name: "Instagram", file: "icons8-instagram.svg", category: "Social", url: "instagram.com" },
    { name: "X / Twitter", file: "X_idJxGuURW1_0.svg", category: "Social", url: "x.com" },
    { name: "Reddit", file: "reddit-4.svg", category: "Social", url: "reddit.com" },
    { name: "Pinterest", file: "icons8-pinterest.svg", category: "Social", url: "pinterest.com" },
    { name: "TikTok", file: "tiktok.svg", category: "Social", url: "tiktok.com" },
    { name: "Meta", file: "meta-color.svg", category: "Social", url: "meta.com" },

    // Website & E-commerce
    { name: "Webflow", file: "Webflow_id2IyfqSKv_0.svg", category: "Website", url: "webflow.com" },
    { name: "WordPress", file: "icons8-wordpress.svg", category: "Website", url: "wordpress.com" },
    { name: "Shopify", file: "shopify.svg", category: "E-commerce", url: "shopify.com" },

    // AI
    { name: "OpenAI", file: "openai-svgrepo-com.svg", category: "AI", url: "openai.com" },
    { name: "Firecrawl", file: "firecrawl-logo.webp", category: "AI", url: "firecrawl.dev" },

    // Platform
    { name: "Apple", file: "apple-logo.png", category: "Platform", url: "apple.com" },
];

export const INTEGRATION_CATEGORIES = [...new Set(INTEGRATIONS.map((i) => i.category))];

export const DEFAULT_SCORECARD_DIMENSIONS = [
    { key: "features", label: "Features & Functionality", weight: 20 },
    { key: "pricing_value", label: "Pricing Value", weight: 20 },
    { key: "ease_of_use", label: "Ease of Use", weight: 15 },
    { key: "integration_depth", label: "Integration Depth", weight: 15 },
    { key: "support_quality", label: "Support & Documentation", weight: 10 },
    { key: "security", label: "Security & Compliance", weight: 10 },
    { key: "ai_capabilities", label: "AI Capabilities", weight: 10 },
];
