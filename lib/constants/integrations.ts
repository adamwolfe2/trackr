export interface Integration {
    name: string;
    file?: string;       // local file in /public/integrations/ — optional, Clearbit used as fallback
    category: string;
    url?: string;        // domain used for Clearbit logo lookup
}

/**
 * Returns the best available logo URL for an integration.
 * Priority: local file → Google favicon API (most reliable)
 */
export function getLogoUrl(integration: Integration): string {
    if (integration.file) return `/integrations/${integration.file}`;
    if (integration.url) {
        // Extract domain for Google's favicon service (highly reliable, no rate limits)
        const domain = integration.url.replace(/^https?:\/\//, "").split("/")[0];
        return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
    }
    // Fallback: empty string — UI shows first letter of name
    return "";
}

export const INTEGRATIONS: Integration[] = [
    // ── Communication ─────────────────────────────────────────────────────────
    { name: "Slack", file: "slack-svgrepo-com.svg", category: "Communication", url: "slack.com" },
    { name: "Microsoft Teams", file: "icons8-microsoft-teams.svg", category: "Communication", url: "teams.microsoft.com" },
    { name: "Zoom", file: "icons8-zoom.svg", category: "Communication", url: "zoom.us" },
    { name: "Discord", category: "Communication", url: "discord.com" },
    { name: "Loom", category: "Communication", url: "loom.com" },
    { name: "Google Meet", category: "Communication", url: "meet.google.com" },
    { name: "Telegram", file: "telegram-communication-chat-interaction-network-connection-svgrepo-com.svg", category: "Communication", url: "telegram.org" },
    { name: "Webex", category: "Communication", url: "webex.com" },
    { name: "Intercom", category: "Communication", url: "intercom.com" },

    // ── Email ─────────────────────────────────────────────────────────────────
    { name: "Gmail", file: "gmail.svg", category: "Email", url: "gmail.com" },
    { name: "Microsoft Outlook", file: "icons8-microsoft-outlook-2019.svg", category: "Email", url: "outlook.com" },
    { name: "Front", category: "Email", url: "front.com" },
    { name: "Help Scout", category: "Email", url: "helpscout.com" },
    { name: "Superhuman", category: "Email", url: "superhuman.com" },

    // ── Productivity ──────────────────────────────────────────────────────────
    { name: "Notion", file: "notion.svg", category: "Productivity", url: "notion.so" },
    { name: "Coda", category: "Productivity", url: "coda.io" },
    { name: "Confluence", category: "Productivity", url: "confluence.atlassian.com" },
    { name: "Google Drive", file: "google-drive-svgrepo-com.svg", category: "Productivity", url: "drive.google.com" },
    { name: "Google Docs", file: "google-docs-svgrepo-com.svg", category: "Productivity", url: "docs.google.com" },
    { name: "Google Sheets", file: "gsheet-document-svgrepo-com.svg", category: "Productivity", url: "sheets.google.com" },
    { name: "Google Calendar", file: "google-calendar-svgrepo-com.svg", category: "Productivity", url: "calendar.google.com" },
    { name: "Microsoft 365", category: "Productivity", url: "microsoft.com" },
    { name: "Airtable", file: "airtable-svgrepo-com.svg", category: "Productivity", url: "airtable.com" },
    { name: "Miro", category: "Productivity", url: "miro.com" },
    { name: "Whimsical", category: "Productivity", url: "whimsical.com" },
    { name: "Calendly", file: "calendly.svg", category: "Productivity", url: "calendly.com" },
    { name: "Cal.com", category: "Productivity", url: "cal.com" },
    { name: "Dropbox", category: "Productivity", url: "dropbox.com" },
    { name: "Box", category: "Productivity", url: "box.com" },
    { name: "Typeform", file: "typeform.svg", category: "Productivity", url: "typeform.com" },
    { name: "Tally", category: "Productivity", url: "tally.so" },

    // ── Project Management ────────────────────────────────────────────────────
    { name: "Asana", file: "asana.svg", category: "Project Management", url: "asana.com" },
    { name: "Trello", file: "trello_logo_icon_167765.png", category: "Project Management", url: "trello.com" },
    { name: "Linear", file: "linear.svg", category: "Project Management", url: "linear.app" },
    { name: "Jira", category: "Project Management", url: "atlassian.com" },
    { name: "Monday.com", category: "Project Management", url: "monday.com" },
    { name: "ClickUp", category: "Project Management", url: "clickup.com" },
    { name: "Basecamp", category: "Project Management", url: "basecamp.com" },
    { name: "Height", category: "Project Management", url: "height.app" },

    // ── Engineering ───────────────────────────────────────────────────────────
    { name: "GitHub", file: "github.svg", category: "Engineering", url: "github.com" },
    { name: "GitLab", category: "Engineering", url: "gitlab.com" },
    { name: "Sentry", file: "Sentry_idovIhtf_y_0.svg", category: "Engineering", url: "sentry.io" },
    { name: "Vercel", category: "Engineering", url: "vercel.com" },
    { name: "Netlify", category: "Engineering", url: "netlify.com" },
    { name: "AWS", category: "Engineering", url: "aws.amazon.com" },
    { name: "Google Cloud", category: "Engineering", url: "cloud.google.com" },
    { name: "Azure", category: "Engineering", url: "azure.microsoft.com" },
    { name: "Datadog", category: "Engineering", url: "datadoghq.com" },
    { name: "New Relic", category: "Engineering", url: "newrelic.com" },
    { name: "Cloudflare", category: "Engineering", url: "cloudflare.com" },
    { name: "CircleCI", category: "Engineering", url: "circleci.com" },
    { name: "Retool", category: "Engineering", url: "retool.com" },
    { name: "Postman", category: "Engineering", url: "postman.com" },
    { name: "Stripe", category: "Engineering", url: "stripe.com" },
    { name: "Twilio", category: "Engineering", url: "twilio.com" },
    { name: "PagerDuty", category: "Engineering", url: "pagerduty.com" },
    { name: "Supabase", category: "Engineering", url: "supabase.com" },
    { name: "Firebase", category: "Engineering", url: "firebase.google.com" },

    // ── CRM & Sales ───────────────────────────────────────────────────────────
    { name: "HubSpot", file: "hubspot-svgrepo-com.svg", category: "CRM & Sales", url: "hubspot.com" },
    { name: "Salesforce", file: "salesforce.svg", category: "CRM & Sales", url: "salesforce.com" },
    { name: "Apollo", file: "apollo.svg", category: "CRM & Sales", url: "apollo.io" },
    { name: "Instantly", file: "instantly.webp", category: "CRM & Sales", url: "instantly.ai" },
    { name: "Pipedrive", category: "CRM & Sales", url: "pipedrive.com" },
    { name: "Close", category: "CRM & Sales", url: "close.com" },
    { name: "Outreach", category: "CRM & Sales", url: "outreach.io" },
    { name: "Salesloft", category: "CRM & Sales", url: "salesloft.com" },
    { name: "Gong", category: "CRM & Sales", url: "gong.io" },
    { name: "Chorus", category: "CRM & Sales", url: "chorus.ai" },
    { name: "Zoho CRM", category: "CRM & Sales", url: "zoho.com" },
    { name: "Clay", category: "CRM & Sales", url: "clay.com" },
    { name: "ZoomInfo", category: "CRM & Sales", url: "zoominfo.com" },

    // ── Marketing ─────────────────────────────────────────────────────────────
    { name: "Google Ads", file: "google-ads-svgrepo-com.svg", category: "Marketing", url: "ads.google.com" },
    { name: "Klaviyo", file: "klaviyo.svg", category: "Marketing", url: "klaviyo.com" },
    { name: "Attentive", file: "attentive.webp", category: "Marketing", url: "attentive.com" },
    { name: "Search Console", file: "search-console-icon-2025-1.svg", category: "Marketing", url: "search.google.com" },
    { name: "Mailchimp", category: "Marketing", url: "mailchimp.com" },
    { name: "ActiveCampaign", category: "Marketing", url: "activecampaign.com" },
    { name: "Brevo", category: "Marketing", url: "brevo.com" },
    { name: "Lemlist", category: "Marketing", url: "lemlist.com" },
    { name: "Beehiiv", category: "Marketing", url: "beehiiv.com" },
    { name: "ConvertKit", category: "Marketing", url: "kit.com" },
    { name: "Marketo", category: "Marketing", url: "marketo.com" },
    { name: "Hotjar", category: "Marketing", url: "hotjar.com" },
    { name: "Semrush", category: "Marketing", url: "semrush.com" },
    { name: "Ahrefs", category: "Marketing", url: "ahrefs.com" },
    { name: "Sprout Social", category: "Marketing", url: "sproutsocial.com" },

    // ── Analytics ─────────────────────────────────────────────────────────────
    { name: "Google Analytics", category: "Analytics", url: "analytics.google.com" },
    { name: "Mixpanel", category: "Analytics", url: "mixpanel.com" },
    { name: "Amplitude", category: "Analytics", url: "amplitude.com" },
    { name: "PostHog", category: "Analytics", url: "posthog.com" },
    { name: "Heap", category: "Analytics", url: "heap.io" },
    { name: "Segment", category: "Analytics", url: "segment.com" },
    { name: "Tableau", category: "Analytics", url: "tableau.com" },
    { name: "Looker", category: "Analytics", url: "looker.com" },
    { name: "Metabase", category: "Analytics", url: "metabase.com" },
    { name: "Plausible", category: "Analytics", url: "plausible.io" },

    // ── Design ────────────────────────────────────────────────────────────────
    { name: "Figma", category: "Design", url: "figma.com" },
    { name: "Canva", category: "Design", url: "canva.com" },
    { name: "Adobe Creative Cloud", category: "Design", url: "adobe.com" },
    { name: "Webflow", file: "Webflow_id2IyfqSKv_0.svg", category: "Design", url: "webflow.com" },
    { name: "Framer", category: "Design", url: "framer.com" },
    { name: "Sketch", category: "Design", url: "sketch.com" },
    { name: "InVision", category: "Design", url: "invisionapp.com" },
    { name: "Storybook", category: "Design", url: "storybook.js.org" },

    // ── Finance & HR ──────────────────────────────────────────────────────────
    { name: "QuickBooks", category: "Finance & HR", url: "quickbooks.intuit.com" },
    { name: "Xero", category: "Finance & HR", url: "xero.com" },
    { name: "Brex", category: "Finance & HR", url: "brex.com" },
    { name: "Ramp", category: "Finance & HR", url: "ramp.com" },
    { name: "Rippling", category: "Finance & HR", url: "rippling.com" },
    { name: "Gusto", category: "Finance & HR", url: "gusto.com" },
    { name: "Workday", category: "Finance & HR", url: "workday.com" },
    { name: "BambooHR", category: "Finance & HR", url: "bamboohr.com" },
    { name: "Lattice", category: "Finance & HR", url: "lattice.com" },
    { name: "Greenhouse", category: "Finance & HR", url: "greenhouse.io" },
    { name: "Lever", category: "Finance & HR", url: "lever.co" },

    // ── Support ───────────────────────────────────────────────────────────────
    { name: "Zendesk", category: "Support", url: "zendesk.com" },
    { name: "Freshdesk", category: "Support", url: "freshdesk.com" },
    { name: "Crisp", category: "Support", url: "crisp.chat" },
    { name: "Drift", category: "Support", url: "drift.com" },

    // ── Security & Compliance ─────────────────────────────────────────────────
    { name: "1Password", category: "Security", url: "1password.com" },
    { name: "LastPass", category: "Security", url: "lastpass.com" },
    { name: "Okta", category: "Security", url: "okta.com" },
    { name: "Auth0", category: "Security", url: "auth0.com" },
    { name: "Vanta", category: "Security", url: "vanta.com" },
    { name: "Drata", category: "Security", url: "drata.com" },
    { name: "Snyk", category: "Security", url: "snyk.io" },

    // ── Website & E-commerce ──────────────────────────────────────────────────
    { name: "WordPress", file: "icons8-wordpress.svg", category: "Website", url: "wordpress.com" },
    { name: "Wix", category: "Website", url: "wix.com" },
    { name: "Squarespace", category: "Website", url: "squarespace.com" },
    { name: "Shopify", file: "shopify.svg", category: "E-commerce", url: "shopify.com" },
    { name: "WooCommerce", category: "E-commerce", url: "woocommerce.com" },
    { name: "BigCommerce", category: "E-commerce", url: "bigcommerce.com" },

    // ── Automation & iPaaS ────────────────────────────────────────────────────
    { name: "Zapier", category: "Automation", url: "zapier.com" },
    { name: "Make", category: "Automation", url: "make.com" },
    { name: "n8n", category: "Automation", url: "n8n.io" },
    { name: "Workato", category: "Automation", url: "workato.com" },

    // ── AI ────────────────────────────────────────────────────────────────────
    { name: "OpenAI", file: "openai-svgrepo-com.svg", category: "AI", url: "openai.com" },
    { name: "Claude / Anthropic", category: "AI", url: "anthropic.com" },
    { name: "Perplexity", category: "AI", url: "perplexity.ai" },
    { name: "Gemini", category: "AI", url: "gemini.google.com" },
    { name: "Mistral", category: "AI", url: "mistral.ai" },
    { name: "Cursor", category: "AI", url: "cursor.com" },
    { name: "GitHub Copilot", category: "AI", url: "copilot.github.com" },
    { name: "Codeium", category: "AI", url: "codeium.com" },
    { name: "Tabnine", category: "AI", url: "tabnine.com" },
    { name: "Jasper", category: "AI", url: "jasper.ai" },
    { name: "Copy.ai", category: "AI", url: "copy.ai" },
    { name: "Writesonic", category: "AI", url: "writesonic.com" },
    { name: "Grammarly", category: "AI", url: "grammarly.com" },
    { name: "Midjourney", category: "AI", url: "midjourney.com" },
    { name: "Runway", category: "AI", url: "runwayml.com" },
    { name: "HeyGen", category: "AI", url: "heygen.com" },
    { name: "Synthesia", category: "AI", url: "synthesia.io" },
    { name: "ElevenLabs", category: "AI", url: "elevenlabs.io" },
    { name: "Descript", category: "AI", url: "descript.com" },
    { name: "Otter.ai", category: "AI", url: "otter.ai" },
    { name: "Fireflies.ai", category: "AI", url: "fireflies.ai" },
    { name: "Fathom", category: "AI", url: "fathom.video" },
    { name: "Glean", category: "AI", url: "glean.com" },
    { name: "v0 by Vercel", category: "AI", url: "v0.dev" },
    { name: "Lovable", category: "AI", url: "lovable.dev" },
    { name: "Bolt", category: "AI", url: "bolt.new" },
    { name: "Firecrawl", file: "firecrawl-logo.webp", category: "AI", url: "firecrawl.dev" },

    // ── Social ────────────────────────────────────────────────────────────────
    { name: "LinkedIn", file: "linkedin.svg", category: "Social", url: "linkedin.com" },
    { name: "Instagram", file: "icons8-instagram.svg", category: "Social", url: "instagram.com" },
    { name: "X / Twitter", file: "X_idJxGuURW1_0.svg", category: "Social", url: "x.com" },
    { name: "Reddit", file: "reddit-4.svg", category: "Social", url: "reddit.com" },
    { name: "TikTok", file: "tiktok.svg", category: "Social", url: "tiktok.com" },
    { name: "Pinterest", file: "icons8-pinterest.svg", category: "Social", url: "pinterest.com" },
    { name: "Meta", file: "meta-color.svg", category: "Social", url: "meta.com" },
    { name: "YouTube", category: "Social", url: "youtube.com" },
    { name: "Hootsuite", category: "Social", url: "hootsuite.com" },
    { name: "Buffer", category: "Social", url: "buffer.com" },

    // ── Platform ──────────────────────────────────────────────────────────────
    { name: "Apple", file: "apple-logo.png", category: "Platform", url: "apple.com" },
    { name: "Notion Calendar", category: "Platform", url: "calendar.notion.so" },
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
