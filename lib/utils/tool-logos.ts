/**
 * Shared tool logo utilities used across admin leads, share pages, and
 * the recommended-tools editor.
 *
 * Domain lookup resolves tool names to their canonical website domain
 * so Clearbit and Google Favicon services return the correct logo.
 */

// ── Canonical domain map ─────────────────────────────────────────────────────
// Keys are lowercase tool names. Keep sorted by category for readability.

const TOOL_DOMAINS: Record<string, string> = {
    // Google
    "google ads": "ads.google.com",
    "google analytics": "analytics.google.com",
    "google workspace": "workspace.google.com",
    "google drive": "drive.google.com",
    "google sheets": "sheets.google.com",
    "google docs": "docs.google.com",
    "google calendar": "calendar.google.com",
    "google meet": "meet.google.com",
    "google cloud": "cloud.google.com",
    "search console": "search.google.com",
    "gmail": "google.com",
    "gemini": "gemini.google.com",

    // Microsoft
    "microsoft teams": "microsoft.com",
    "microsoft 365": "microsoft.com",
    "microsoft outlook": "microsoft.com",
    "outlook": "microsoft.com",
    "azure": "azure.microsoft.com",
    "microsoft azure": "azure.microsoft.com",
    "onedrive": "microsoft.com",
    "sharepoint": "microsoft.com",
    "power bi": "powerbi.microsoft.com",
    "dynamics 365": "microsoft.com",
    "microsoft copilot": "copilot.microsoft.com",

    // AI / LLM
    "openai": "openai.com",
    "chatgpt": "openai.com",
    "gpt-4": "openai.com",
    "gpt4": "openai.com",
    "claude": "anthropic.com",
    "anthropic": "anthropic.com",
    "grok": "x.ai",
    "perplexity": "perplexity.ai",
    "midjourney": "midjourney.com",

    // Dev tools
    "github": "github.com",
    "github copilot": "github.com",
    "gitlab": "gitlab.com",
    "vercel": "vercel.com",
    "v0 by vercel": "vercel.com",
    "v0": "v0.dev",
    "cursor": "cursor.sh",
    "sentry": "sentry.io",
    "datadog": "datadoghq.com",
    "supabase": "supabase.com",
    "firebase": "firebase.google.com",
    "cloudflare": "cloudflare.com",
    "aws": "aws.amazon.com",

    // Communication
    "slack": "slack.com",
    "zoom": "zoom.us",
    "loom": "loom.com",
    "discord": "discord.com",

    // CRM / Sales
    "hubspot": "hubspot.com",
    "salesforce": "salesforce.com",
    "pipedrive": "pipedrive.com",
    "close": "close.com",
    "close crm": "close.com",
    "apollo": "apollo.io",
    "apollo.io": "apollo.io",
    "clay": "clay.com",
    "instantly": "instantly.ai",
    "lemlist": "lemlist.com",
    "outreach": "outreach.io",
    "salesloft": "salesloft.com",
    "zoom info": "zoominfo.com",
    "zoominfo": "zoominfo.com",
    "copper": "copper.com",
    "freshsales": "freshworks.com",
    "gohighlevel": "gohighlevel.com",
    "ghl": "gohighlevel.com",
    "highlevel": "gohighlevel.com",

    // Productivity / Notes
    "notion": "notion.so",
    "notion ai": "notion.so",
    "notion calendar": "notion.so",
    "airtable": "airtable.com",
    "asana": "asana.com",
    "monday": "monday.com",
    "monday.com": "monday.com",
    "linear": "linear.app",
    "jira": "atlassian.com",
    "confluence": "atlassian.com",
    "trello": "trello.com",
    "clickup": "clickup.com",
    "coda": "coda.io",

    // Automation
    "zapier": "zapier.com",
    "make": "make.com",
    "make.com": "make.com",
    "n8n": "n8n.io",
    "n8n.io": "n8n.io",

    // Design
    "figma": "figma.com",
    "canva": "canva.com",
    "miro": "miro.com",
    "mural": "mural.co",
    "lucidchart": "lucidchart.com",
    "framer": "framer.com",

    // Adobe
    "adobe creative cloud": "adobe.com",
    "adobe": "adobe.com",
    "photoshop": "adobe.com",
    "illustrator": "adobe.com",
    "premiere": "adobe.com",
    "adobe firefly": "adobe.com",

    // Finance
    "stripe": "stripe.com",
    "stripe atlas": "stripe.com",
    "quickbooks": "intuit.com",
    "xero": "xero.com",

    // E-commerce
    "shopify": "shopify.com",
    "webflow": "webflow.com",
    "squarespace": "squarespace.com",
    "wix": "wix.com",
    "wordpress": "wordpress.com",

    // Email / Marketing
    "mailchimp": "mailchimp.com",
    "klaviyo": "klaviyo.com",
    "convertkit": "convertkit.com",
    "beehiiv": "beehiiv.com",
    "sendgrid": "sendgrid.com",

    // Support
    "intercom": "intercom.com",
    "zendesk": "zendesk.com",
    "freshdesk": "freshdesk.com",
    "helpscout": "helpscout.com",
    "drift": "drift.com",
    "crisp": "crisp.chat",
    "tidio": "tidio.com",

    // Analytics
    "tableau": "tableau.com",
    "looker": "looker.com",
    "mixpanel": "mixpanel.com",
    "amplitude": "amplitude.com",
    "posthog": "posthog.com",
    "segment": "segment.com",
    "hotjar": "hotjar.com",
    "fullstory": "fullstory.com",
    "semrush": "semrush.com",
    "ahrefs": "ahrefs.com",

    // Documents / Signing
    "docusign": "docusign.com",
    "pandadoc": "pandadoc.com",
    "dropbox": "dropbox.com",

    // HR
    "rippling": "rippling.com",
    "gusto": "gusto.com",
    "deel": "deel.com",

    // AI Content
    "jasper": "jasper.ai",
    "copy.ai": "copy.ai",
    "grammarly": "grammarly.com",
    "descript": "descript.com",
    "elevenlabs": "elevenlabs.io",
    "runway": "runwayml.com",
    "heygen": "heygen.com",

    // AI Productivity
    "superhuman": "superhuman.com",
    "otter": "otter.ai",
    "otter.ai": "otter.ai",
    "fireflies": "fireflies.ai",
    "fireflies.ai": "fireflies.ai",
    "fathom": "usefathom.com",
    "granola": "granola.so",

    // Scheduling
    "calendly": "calendly.com",
    "cal.com": "cal.com",
    "typeform": "typeform.com",

    // Data
    "snowflake": "snowflake.com",
    "fivetran": "fivetran.com",
    "twilio": "twilio.com",

    // Social
    "instagram": "instagram.com",
    "linkedin": "linkedin.com",
    "tiktok": "tiktok.com",
    "twitter": "twitter.com",
    "x / twitter": "x.com",
    "youtube": "youtube.com",
    "reddit": "reddit.com",
    "pinterest": "pinterest.com",
    "meta": "meta.com",
    "facebook": "facebook.com",

    // Security
    "1password": "1password.com",
    "lastpass": "lastpass.com",
    "okta": "okta.com",
    "crowdstrike": "crowdstrike.com",
};

/**
 * Resolves a tool name to its canonical website domain.
 * Falls back to inferring from the name if not in the lookup table.
 */
export function getToolDomain(name: string, domainHint?: string | null): string {
    if (domainHint) return domainHint;
    const key = name.toLowerCase().trim();
    if (TOOL_DOMAINS[key]) return TOOL_DOMAINS[key];
    // Fallback: strip spaces/special chars and append .com
    return `${key.replace(/\s+/g, "").replace(/[^a-z0-9.]/g, "")}.com`;
}

/**
 * Returns Clearbit (high-quality) and Google Favicon (reliable fallback) URLs
 * for a given tool name + optional domain hint.
 */
export function getToolLogoUrls(name: string, domainHint?: string | null): {
    src: string;
    fallbackSrc: string;
} {
    const domain = getToolDomain(name, domainHint);
    return {
        src: `https://logo.clearbit.com/${domain}`,
        fallbackSrc: `https://www.google.com/s2/favicons?sz=64&domain=${domain}`,
    };
}
