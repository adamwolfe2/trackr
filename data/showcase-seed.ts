import type { DemoTool } from "./demo-workspace-seed";

type ReviewSource = { title: string; url: string; score: number };
type RedditThread = { title: string; url: string; subreddit: string; snippet: string };
type MarketIntel = {
  founded?: string;
  headquarters?: string;
  employeeCount?: string;
  funding?: string;
  recentNews?: string[];
};

export type ShowcaseTool = DemoTool & {
  shareToken: string;
  /** Extra sentiment fields the share page renders but DemoTool.sentimentData doesn't include */
  extendedSentiment: {
    reviewSources: ReviewSource[];
    trustSources: ReviewSource[];
    redditThreads: RedditThread[];
    marketIntel: MarketIntel;
    competitorAnalysis: string;
  };
  competitors: string[];
  integrations: string[];
};

export const SHOWCASE_TOOLS: ShowcaseTool[] = [
  // ── Lemon ────────────────────────────────────────────────────────────
  {
    name: "Lemon",
    websiteUrl: "https://heylemon.ai",
    logoUrl: "https://logo.clearbit.com/heylemon.ai",
    categories: ["Voice AI", "Productivity"],
    overallScore: 8.4,
    shareToken: "showcase-lemon-2026w10",
    competitors: ["Gong", "Chorus.ai", "Fireflies.ai", "Otter.ai", "Fathom", "tl;dv"],
    integrations: ["Zoom", "Google Meet", "HubSpot", "Salesforce", "Pipedrive", "Slack", "Zapier", "Google Calendar", "Outlook"],
    report: {
      summary: "Lemon is a voice AI assistant that captures meetings, calls, and conversations, then turns them into structured notes, action items, and CRM updates. It integrates natively with Zoom, Google Meet, and phone calls, offering real-time transcription with speaker identification. Particularly strong for sales teams and customer success orgs that need to extract structured data from unstructured conversations at a fraction of the cost of enterprise alternatives like Gong.",
      pros: [
        "Real-time transcription with 95%+ accuracy across accents and dialects",
        "Automatic action item extraction and follow-up scheduling",
        "Native CRM integrations push call notes directly to HubSpot, Salesforce, Pipedrive",
        "Speaker identification and sentiment tracking per participant",
        "Works across Zoom, Google Meet, phone calls, and in-person via mobile app",
        "80% cheaper than Gong/Chorus for comparable core functionality",
      ],
      cons: [
        "Limited language support outside English and Spanish",
        "Mobile app battery drain during extended recording sessions",
        "CRM field mapping requires initial setup that can be fiddly",
        "No native integration with Microsoft Teams yet",
        "Advanced coaching analytics lag behind Gong's enterprise features",
      ],
      features: [
        "Real-time meeting transcription with speaker diarization",
        "AI-generated meeting summaries and action items",
        "CRM auto-sync (HubSpot, Salesforce, Pipedrive)",
        "Sentiment analysis per speaker",
        "Custom vocabulary and acronym training",
        "Searchable transcript archive with full-text search",
        "Slack and email digest notifications post-meeting",
        "Call coaching insights and talk-time ratios",
        "Deal risk scoring based on conversation signals",
        "Manager dashboard with team call analytics",
      ],
      pricing: [
        { tier: "Free", price: "$0/month (5 meetings/month)" },
        { tier: "Pro", price: "$19/user/month" },
        { tier: "Team", price: "$39/user/month" },
        { tier: "Enterprise", price: "Contact sales" },
      ],
      scorecard: {
        features: { score: 8, justification: "Strong voice AI feature set covering transcription, summaries, action items, CRM sync, and basic coaching. Lacks some advanced revenue intelligence and forecasting found in Gong or Chorus. Deal risk scoring is promising but newer." },
        pricing_value: { score: 9, justification: "Significantly cheaper than Gong ($100+/user). Pro at $19/user delivers 80% of the value at 20% of the cost. Free tier is genuinely useful for individuals. Team tier at $39 includes full analytics." },
        ease_of_use: { score: 9, justification: "One-click calendar integration auto-joins meetings. Transcripts and summaries appear within minutes. Non-technical users productive on day one. CRM field mapping is the only setup friction point." },
        integration_depth: { score: 8, justification: "Native HubSpot, Salesforce, Pipedrive, Slack, Zoom, Google Meet. API for custom integrations. Zapier connector for edge cases. Missing Microsoft Teams and some niche CRMs (Close, Copper)." },
        support_quality: { score: 7, justification: "Responsive email support with <4h response time on business days. Growing knowledge base with video walkthroughs. Community Slack channel is active. No phone support or dedicated CSM on lower tiers." },
        security: { score: 8, justification: "SOC 2 Type II certified since 2025. End-to-end encryption for recordings at rest and in transit. GDPR compliant with DPA available. Data retention policies configurable per workspace. No HIPAA compliance yet." },
        ai_capabilities: { score: 9, justification: "Core AI engine is excellent — transcription accuracy rivals Gong at 95%+, speaker identification works reliably for up to 12 participants, sentiment analysis per speaker is genuinely useful for coaching. Structured data extraction from unstructured conversations is the standout feature." },
      },
      sentimentData: {
        reviewAnswer: "4.6/5 on G2 with 280+ reviews. Users consistently praise transcription accuracy and the speed of post-meeting summaries. Sales teams highlight CRM auto-sync as a workflow game-changer that saves 15-20 minutes per call. Most common complaint: occasional missed action items in fast-paced discussions with heavy cross-talk.",
        trustAnswer: "Series A funded ($22M from a16z). Growing rapidly in the SMB and mid-market segments. No security incidents reported. SOC 2 Type II certified since 2025. Leadership team has ex-Gong and ex-Zoom executives, lending credibility to the voice AI space.",
        redditAnswer: "r/sales and r/SaaS frequently recommend Lemon as a budget-friendly alternative to Gong. Reddit users praise the free tier as genuinely useful for solo founders and small teams. Common thread: 'Lemon does 80% of what Gong does at 20% of the price.' Some power users note the coaching features are still maturing compared to Gong's.",
        sentimentConsensus: {
          overall: "positive",
          confidence: 83,
          sourceAgreement: "G2, Capterra, and Reddit all rate Lemon favorably. Sales teams and CS orgs are the strongest advocates. Enterprise readiness is the main gap cited by larger teams. Value-for-money is the most consistent praise point across all sources.",
        },
        dataSources: 21,
        pagesScraped: 12,
      },
    },
    extendedSentiment: {
      reviewSources: [
        { title: "Lemon Reviews 2026 — G2", url: "https://www.g2.com/products/lemon-ai/reviews", score: 4.6 },
        { title: "Lemon AI Reviews — Capterra", url: "https://www.capterra.com/p/lemon-ai/reviews/", score: 4.5 },
        { title: "Lemon AI — Product Hunt", url: "https://www.producthunt.com/products/lemon-ai", score: 4.7 },
        { title: "Lemon vs Gong — TrustRadius", url: "https://www.trustradius.com/compare-products/lemon-vs-gong", score: 4.4 },
      ],
      trustSources: [
        { title: "Lemon AI Security & Compliance", url: "https://heylemon.ai/security", score: 4.5 },
        { title: "Lemon Series A — TechCrunch", url: "https://techcrunch.com/2025/lemon-ai-series-a/", score: 4.3 },
        { title: "Lemon SOC 2 Type II Report", url: "https://heylemon.ai/trust", score: 4.6 },
      ],
      redditThreads: [
        { title: "Best Gong alternative for small sales teams?", url: "https://reddit.com/r/sales/comments/best_gong_alternative", subreddit: "sales", snippet: "We switched to Lemon 3 months ago. Transcription quality is comparable to Gong and the CRM sync works great. Saving $80/user/month." },
        { title: "Lemon AI review after 6 months", url: "https://reddit.com/r/SaaS/comments/lemon_ai_review", subreddit: "SaaS", snippet: "Genuinely impressed. The free tier got us hooked, then we upgraded to Team. Action item extraction is the killer feature for our CS calls." },
        { title: "Meeting recording tools comparison 2026", url: "https://reddit.com/r/productivity/comments/meeting_recording_tools", subreddit: "productivity", snippet: "Lemon > Otter > Fireflies in my experience. Lemon's AI summaries are noticeably better and the CRM push is automatic." },
        { title: "Anyone using Lemon for customer success calls?", url: "https://reddit.com/r/CustomerSuccess/comments/lemon_cs_calls", subreddit: "CustomerSuccess", snippet: "Using it for all onboarding and QBR calls. The sentiment tracking per speaker helps us identify at-risk accounts before they churn." },
      ],
      marketIntel: {
        founded: "2023",
        headquarters: "San Francisco, CA",
        employeeCount: "45-60",
        funding: "$22M Series A (a16z, 2025)",
        recentNews: [
          "Launched enterprise tier with custom AI model training (Jan 2026)",
          "Announced Microsoft Teams integration on product roadmap for Q2 2026",
          "Reached 5,000 paying teams milestone (Dec 2025)",
          "Hired VP of Engineering from Gong (Nov 2025)",
        ],
      },
      competitorAnalysis: "**Gong** ($100+/user/mo) — Market leader in revenue intelligence. Superior coaching analytics, forecasting, and deal intelligence. Lemon covers ~80% of core recording/transcription at 80% lower cost.\n\n**Chorus.ai (ZoomInfo)** ($80+/user/mo) — Strong enterprise offering bundled with ZoomInfo data. Better for large sales orgs with complex deal cycles. Lemon wins on simplicity and price.\n\n**Fireflies.ai** ($10-19/user/mo) — Similar price point. Fireflies has broader meeting platform support but weaker CRM sync and no sentiment analysis. Lemon's AI quality is noticeably better.\n\n**Otter.ai** ($8-20/user/mo) — General-purpose transcription, not sales-focused. No CRM integration, no coaching features. Lemon is purpose-built for sales/CS workflows.\n\n**Fathom** (Free-$32/mo) — Strong free tier for individual note-taking. Lacks team analytics, CRM auto-sync, and sentiment tracking that Lemon provides.",
    },
  },

  // ── Cursive ──────────────────────────────────────────────────────────
  {
    name: "Cursive",
    websiteUrl: "https://meetcursive.com",
    logoUrl: "https://logo.clearbit.com/meetcursive.com",
    categories: ["Lead Intelligence", "Sales Automation"],
    overallScore: 9.1,
    shareToken: "showcase-cursive-2026w10",
    competitors: ["RB2B", "Clearbit", "6sense", "Demandbase", "ZoomInfo", "Warmly", "Leadfeeder"],
    integrations: ["HubSpot", "Salesforce", "Instantly", "Apollo", "Clay", "Slack", "Zapier", "Make", "Outreach", "Salesloft"],
    report: {
      summary: "Cursive is an AI-powered lead intelligence platform that combines pixel-based visitor identification, audience enrichment, and automated outbound in a single platform. It identifies anonymous website visitors at the individual level, enriches them with firmographic, technographic, and intent data, then delivers qualified leads directly to your CRM or sequencer. The Push/Pull stream architecture lets teams choose between fully automated lead delivery and on-demand audience pulls. Built for growth teams and agencies that want to convert invisible site traffic into qualified pipeline without manual prospecting.",
      pros: [
        "Identifies 30-40% of anonymous website visitors with email-level resolution",
        "Real-time intent signals based on page behavior, time on site, and return visits",
        "AI-generated lead scores that adapt to your ICP over time",
        "Push/Pull stream architecture — choose between automated delivery or on-demand pulls",
        "White-label reporting for agencies managing multiple client domains",
        "Replaces 3-4 separate tools (visitor ID + enrichment + scoring + delivery)",
      ],
      cons: [
        "Requires pixel installation — value depends on existing site traffic volume",
        "Enrichment accuracy varies by industry vertical and company size",
        "Advanced audience builder has a learning curve for non-technical users",
        "Monthly lead caps on lower tiers may limit high-traffic sites",
        "International data coverage weaker outside US/Canada/UK",
      ],
      features: [
        "JavaScript pixel for anonymous visitor identification",
        "AI lead scoring with adaptive ICP modeling",
        "Firmographic and technographic enrichment (company size, tech stack, funding)",
        "Intent signal tracking (pages viewed, session depth, return visits)",
        "Push stream: auto-deliver leads to CRM/sequencer on match",
        "Pull stream: on-demand audience pulls with custom filters",
        "White-label dashboards for agency/multi-tenant use",
        "Native integrations with HubSpot, Salesforce, Instantly, Apollo, Clay",
        "Audience segment builder with boolean logic",
        "Real-time lead alerts via Slack and email",
        "ROI dashboard with pipeline attribution tracking",
        "GDPR/CCPA consent management built-in",
      ],
      pricing: [
        { tier: "Starter", price: "$149/month (500 leads)" },
        { tier: "Growth", price: "$399/month (2,500 leads)" },
        { tier: "Scale", price: "$799/month (10,000 leads)" },
        { tier: "Enterprise", price: "Custom pricing" },
      ],
      scorecard: {
        features: { score: 9, justification: "Comprehensive lead intelligence stack — visitor ID, enrichment, scoring, intent signals, and multi-channel delivery all in one platform. Competes with 3-4 separate tools. Audience builder with boolean logic enables sophisticated segmentation. Missing some ABM features found in 6sense/Demandbase." },
        pricing_value: { score: 9, justification: "Strong value at every tier. Starter at $149/month for 500 identified leads competes favorably with Clearbit ($99/mo for enrichment only), RB2B ($199/mo for visitor ID only), and 6sense ($25K+/yr for intent data). Cost per identified lead decreases meaningfully at higher tiers." },
        ease_of_use: { score: 8, justification: "Pixel installation is simple (one script tag, 2-minute setup). Dashboard is clean and intuitive with clear lead quality indicators. Advanced audience builder requires some learning but is well-documented with video walkthroughs. Onboarding flow guides users from install to first lead delivery." },
        integration_depth: { score: 9, justification: "Native push to HubSpot, Salesforce, Instantly, Apollo, Clay, Outreach, Salesloft. Webhook support for custom flows. Full REST API for programmatic access. Zapier and Make connectors for edge cases. Real-time Slack alerts for hot leads." },
        support_quality: { score: 9, justification: "Dedicated onboarding specialist for all paid tiers. Slack-based support with <2h average response time during business hours. Regular product webinars and use-case walkthroughs. Agency partners get dedicated account managers. Comprehensive help center with video guides." },
        security: { score: 9, justification: "SOC 2 Type II compliant. GDPR and CCPA compliant with built-in consent management. Data encrypted at rest (AES-256) and in transit (TLS 1.3). Configurable data retention policies. Sub-processor transparency. Privacy-first approach to visitor identification." },
        ai_capabilities: { score: 9, justification: "Adaptive ICP modeling improves lead quality over time based on conversion feedback. AI scoring correlates strongly with pipeline conversion rates. Intent signal analysis is genuinely predictive — users report 3-5x higher conversion on high-intent leads. Automatic enrichment waterfall tries multiple data sources to maximize fill rates." },
      },
      sentimentData: {
        reviewAnswer: "4.8/5 on G2 with 150+ reviews. Growth teams praise the visitor identification accuracy and ROI clarity. Most cited benefit: 'turns invisible traffic into qualified pipeline.' Agencies love the white-label capability. Primary critique: lead caps on lower tiers can feel limiting for high-traffic sites.",
        trustAnswer: "Well-funded and growing rapidly in the lead intelligence space. Strong backing from GTM-focused investors. GDPR/CCPA compliance front and center in all marketing materials. No security incidents reported. Trusted by 400+ companies including agencies and SaaS brands. SOC 2 Type II certified.",
        redditAnswer: "r/sales and r/growthmarketing threads recommend Cursive alongside RB2B and Clearbit for different use cases. Users report 3-5x ROI within 60 days of deployment. Common feedback: 'replaced three tools with one Cursive subscription.' Agency owners particularly vocal about the white-label value. Some users note international data coverage could improve.",
        sentimentConsensus: {
          overall: "very_positive",
          confidence: 88,
          sourceAgreement: "Strongly positive across G2, Capterra, and community forums. Growth teams and agencies are the most vocal advocates. Lead quality and ROI are consistently praised. The combination of visitor ID + enrichment + delivery in one tool is the most cited differentiator.",
        },
        dataSources: 24,
        pagesScraped: 13,
      },
    },
    extendedSentiment: {
      reviewSources: [
        { title: "Cursive Reviews 2026 — G2", url: "https://www.g2.com/products/cursive/reviews", score: 4.8 },
        { title: "Cursive Lead Intelligence — Capterra", url: "https://www.capterra.com/p/cursive/reviews/", score: 4.7 },
        { title: "Cursive — Product Hunt", url: "https://www.producthunt.com/products/cursive", score: 4.9 },
        { title: "Cursive vs RB2B vs Clearbit — TrustRadius", url: "https://www.trustradius.com/compare-products/cursive-vs-rb2b", score: 4.6 },
      ],
      trustSources: [
        { title: "Cursive Security & Privacy", url: "https://meetcursive.com/security", score: 4.8 },
        { title: "Cursive SOC 2 Type II Compliance", url: "https://meetcursive.com/trust", score: 4.7 },
        { title: "Cursive GDPR & CCPA Policy", url: "https://meetcursive.com/privacy", score: 4.6 },
      ],
      redditThreads: [
        { title: "Best visitor identification tool for B2B SaaS?", url: "https://reddit.com/r/sales/comments/visitor_id_tools", subreddit: "sales", snippet: "We tested RB2B, Clearbit Reveal, and Cursive. Cursive identified 35% more visitors and the lead scoring is genuinely useful. ROI was positive in week 2." },
        { title: "Cursive vs RB2B — honest comparison after using both", url: "https://reddit.com/r/growthmarketing/comments/cursive_vs_rb2b", subreddit: "growthmarketing", snippet: "RB2B gives you the visitor ID. Cursive gives you visitor ID + enrichment + scoring + delivery. It's a platform vs. a point solution. Worth the price difference." },
        { title: "Agency owners: what lead gen tools are you white-labeling?", url: "https://reddit.com/r/digital_marketing/comments/agency_lead_tools", subreddit: "digital_marketing", snippet: "Cursive white-label is the best I've used for client lead delivery. Dashboard looks professional, clients can see ROI directly. We charge clients $500/mo and use Cursive Growth tier." },
        { title: "How we added $40K/mo pipeline with one tool change", url: "https://reddit.com/r/SaaS/comments/pipeline_growth_cursive", subreddit: "SaaS", snippet: "Installed Cursive pixel, set up ICP filters, pushed to Instantly. Within 30 days we had 180 qualified leads we never would have found. Best tool purchase this year." },
        { title: "Intent data tools that actually work in 2026?", url: "https://reddit.com/r/B2BMarketing/comments/intent_data_2026", subreddit: "B2BMarketing", snippet: "Cursive's intent signals are surprisingly accurate. The combo of page behavior + return visits + session depth gives you a real picture of buying intent. Not just 'they visited your pricing page.'" },
      ],
      marketIntel: {
        founded: "2024",
        headquarters: "Austin, TX",
        employeeCount: "15-25",
        funding: "Seed round (undisclosed, GTM-focused VCs)",
        recentNews: [
          "Launched Scale tier with 10,000 leads/month capacity (Feb 2026)",
          "Added Clay and Outreach native integrations (Jan 2026)",
          "Reached 400+ paying companies milestone (Dec 2025)",
          "White-label agency program launched with 50+ agency partners (Nov 2025)",
          "GDPR/CCPA consent management feature released (Oct 2025)",
        ],
      },
      competitorAnalysis: "**RB2B** ($199-499/mo) — Visitor identification focused. Identifies visitors but limited enrichment and no built-in scoring or delivery. Cursive provides the full pipeline from ID to CRM delivery.\n\n**Clearbit (HubSpot)** ($99-999/mo) — Strong enrichment but no visitor identification pixel. Requires existing contact records. Cursive identifies unknown visitors and enriches in one flow.\n\n**6sense** ($25K+/yr) — Enterprise ABM platform with account-level intent data. Far more expensive and complex. Cursive serves the SMB/mid-market with individual-level identification at 90% lower cost.\n\n**Demandbase** ($30K+/yr) — Similar to 6sense, enterprise-grade ABM. Overkill for teams under 50 people. Cursive's self-serve model is accessible to any growth team.\n\n**Warmly** ($700-1,500/mo) — Website visitor intelligence with real-time engagement. More expensive than Cursive for comparable lead volume. Cursive's Push/Pull architecture is more flexible.\n\n**Leadfeeder** ($99-299/mo) — Company-level visitor identification only (no individual emails). Cursive's email-level resolution is a significant advantage for outbound teams.",
    },
  },

  // ── Raycast ──────────────────────────────────────────────────────────
  {
    name: "Raycast",
    websiteUrl: "https://raycast.com",
    logoUrl: "https://logo.clearbit.com/raycast.com",
    categories: ["Productivity", "Developer Tools"],
    overallScore: 9.5,
    shareToken: "showcase-raycast-2026w10",
    competitors: ["Alfred", "Spotlight", "LaunchBar", "Warp", "Fig", "Keyboard Maestro"],
    integrations: ["GitHub", "Linear", "Jira", "Notion", "Slack", "Figma", "VS Code", "Docker", "Vercel", "AWS", "Google Workspace", "1Password"],
    report: {
      summary: "Raycast is a blazing-fast launcher and productivity platform for macOS that replaces Spotlight with an extensible command palette. It combines app launching, clipboard history, window management, snippets, AI chat, and a massive extension store into a single keyboard-driven interface. Developer and power-user adoption is explosive — Raycast has become the default productivity layer for engineering and ops teams, effectively replacing 4-5 standalone apps with one unified tool. The team features make it a collaboration multiplier for organizations.",
      pros: [
        "Sub-50ms launch time — faster than any alternative including Alfred and Spotlight",
        "Extension store with 1,000+ community-built integrations (Jira, GitHub, Linear, Notion)",
        "Built-in AI chat with GPT-4o, Claude, and custom models via API keys",
        "Window management, clipboard history, and snippets replace 3+ standalone apps",
        "Deeply scriptable — build custom commands in TypeScript, Swift, or shell scripts",
        "Team features: shared snippets, quicklinks, and extensions across org",
        "Beautiful, native macOS UI that feels like a first-party Apple app",
      ],
      cons: [
        "macOS only — no Windows or Linux support",
        "AI features require Pro subscription ($8/mo)",
        "Extension quality varies — some community extensions are unmaintained",
        "Can become overwhelming with too many extensions enabled",
        "No mobile companion app",
      ],
      features: [
        "Launcher with fuzzy search and recent apps",
        "Extension store (1,000+ integrations)",
        "Built-in AI chat (GPT-4o, Claude, Perplexity)",
        "Clipboard history with search and pinning",
        "Window management (halves, thirds, custom layouts)",
        "Snippets with dynamic placeholders (date, clipboard, cursor)",
        "Quicklinks for parameterized URL shortcuts",
        "Script commands (TypeScript, Swift, Bash, Python)",
        "Floating notes for quick capture",
        "Team workspace with shared extensions and config",
        "File search with content preview",
        "Calculator and unit conversion built-in",
      ],
      pricing: [
        { tier: "Free", price: "$0/month (core features)" },
        { tier: "Pro", price: "$8/month (AI, cloud sync, themes)" },
        { tier: "Teams", price: "$12/user/month" },
        { tier: "Enterprise", price: "Contact sales" },
      ],
      scorecard: {
        features: { score: 10, justification: "Replaces 4-5 standalone apps (launcher, clipboard manager, window manager, snippet tool, AI chat). Extension ecosystem covers virtually every developer tool and SaaS platform. Script commands enable infinite customization. Window management alone justifies the install for many users." },
        pricing_value: { score: 9, justification: "Free tier is genuinely powerful — includes launcher, clipboard, window management, snippets, and many extensions. Pro at $8/mo is a steal for AI chat and cloud sync. Teams at $12/user competitive for shared productivity infrastructure. Replaces $30-50/mo of individual tool subscriptions." },
        ease_of_use: { score: 10, justification: "Keyboard-first, discoverable UI with inline hints. New users productive in minutes. Built-in onboarding teaches shortcuts progressively. Fuzzy search means you never need to remember exact command names. Best UX in the productivity tool category, period." },
        integration_depth: { score: 10, justification: "1,000+ extensions covering GitHub, Linear, Jira, Notion, Slack, Figma, VS Code, Docker, Vercel, AWS, and hundreds more. Open API makes building custom extensions straightforward. TypeScript SDK is excellent. Extensions can chain together for complex workflows." },
        support_quality: { score: 9, justification: "Excellent documentation with interactive guides. Active community forum with 50K+ members. Responsive GitHub issues — team closes bugs quickly. Raycast team actively maintains 50+ core extensions. Detailed changelog published with every release." },
        security: { score: 9, justification: "Local-first architecture — clipboard data, snippets, and most operations stay on device. Cloud sync uses end-to-end encryption. SOC 2 Type II in progress. Enterprise tier includes SSO/SCIM. No telemetry without explicit opt-in. Extension permissions are scoped." },
        ai_capabilities: { score: 9, justification: "Built-in AI chat with model selection (GPT-4o, Claude, custom via API key). AI commands can be triggered from any context and chained with extensions. BYO API key option keeps costs transparent. Custom AI commands let teams build domain-specific assistants within Raycast." },
      },
      sentimentData: {
        reviewAnswer: "4.9/5 on G2 with 200+ reviews. Developers describe it as 'indispensable' and 'the best Mac app I use.' Extension ecosystem praised universally. Window management and clipboard history called out as 'features I didn't know I needed.' Only consistent complaint: no Windows version.",
        trustAnswer: "Series B funded ($30M from Accel, 2024). Rapidly growing — 1M+ active users reported as of early 2026. Extremely strong brand in the developer community. No security incidents. Team is transparent and responsive on GitHub. Founded by ex-Facebook engineers with deep systems expertise.",
        redditAnswer: "r/macapps and r/productivity almost unanimously recommend Raycast over Alfred and Spotlight. Power users share custom extensions and workflows regularly. Most common Reddit take: 'I can't use a Mac without Raycast anymore.' The free tier is frequently cited as one of the best free developer tools available.",
        sentimentConsensus: {
          overall: "very_positive",
          confidence: 95,
          sourceAgreement: "Near-universal praise across G2, ProductHunt (Golden Kitty winner), Reddit, Hacker News, and developer blogs. macOS-only limitation is the single consistent criticism. Developer NPS is reportedly among the highest in productivity software. Multiple independent surveys rank it #1 Mac productivity tool.",
        },
        dataSources: 29,
        pagesScraped: 15,
      },
    },
    extendedSentiment: {
      reviewSources: [
        { title: "Raycast Reviews 2026 — G2", url: "https://www.g2.com/products/raycast/reviews", score: 4.9 },
        { title: "Raycast — Product Hunt (Golden Kitty Winner)", url: "https://www.producthunt.com/products/raycast", score: 5.0 },
        { title: "Raycast Productivity Suite — Capterra", url: "https://www.capterra.com/p/raycast/reviews/", score: 4.8 },
        { title: "Raycast vs Alfred — TrustRadius", url: "https://www.trustradius.com/compare-products/raycast-vs-alfred", score: 4.7 },
        { title: "The Best Mac Launcher in 2026 — The Verge", url: "https://www.theverge.com/best-mac-launcher-2026", score: 4.9 },
      ],
      trustSources: [
        { title: "Raycast Security Overview", url: "https://raycast.com/security", score: 4.8 },
        { title: "Raycast Series B — TechCrunch", url: "https://techcrunch.com/2024/raycast-series-b-30m/", score: 4.7 },
        { title: "Raycast Privacy & Data Policy", url: "https://raycast.com/privacy", score: 4.6 },
        { title: "Raycast Open Source Extensions", url: "https://github.com/raycast/extensions", score: 4.9 },
      ],
      redditThreads: [
        { title: "Raycast is the single best app on my Mac", url: "https://reddit.com/r/macapps/comments/raycast_best_app", subreddit: "macapps", snippet: "After 2 years of daily use, Raycast has replaced Spotlight, Rectangle, Flycut, TextExpander, and Alfred. One app, one hotkey, everything I need." },
        { title: "Why I switched from Alfred to Raycast", url: "https://reddit.com/r/productivity/comments/alfred_to_raycast", subreddit: "productivity", snippet: "Alfred served me well for 8 years but Raycast's extension ecosystem is on another level. The GitHub, Linear, and Notion integrations are native-quality. Free tier includes more than Alfred's paid tier." },
        { title: "Raycast AI vs ChatGPT desktop app — which do you use?", url: "https://reddit.com/r/ChatGPT/comments/raycast_ai_vs_chatgpt", subreddit: "ChatGPT", snippet: "Raycast AI wins because it's always one hotkey away. I can highlight text, hit the shortcut, and get an AI response in context. The ChatGPT app requires switching windows." },
        { title: "Best developer productivity tools 2026", url: "https://reddit.com/r/webdev/comments/best_dev_tools_2026", subreddit: "webdev", snippet: "Raycast, Warp terminal, and Cursor editor. That's the holy trinity. Raycast handles everything outside the terminal and editor — window management, clipboard, snippets, quick lookups." },
        { title: "Raycast Teams — worth it for engineering orgs?", url: "https://reddit.com/r/ExperiencedDevs/comments/raycast_teams", subreddit: "ExperiencedDevs", snippet: "Our 40-person eng team shares snippets for common code patterns, PR templates, and deployment commands. $12/user/mo is cheaper than the time we save. Onboarding new engineers is faster too." },
      ],
      marketIntel: {
        founded: "2020",
        headquarters: "Berlin, Germany (remote-first)",
        employeeCount: "60-80",
        funding: "$30M Series B (Accel, 2024)",
        recentNews: [
          "Crossed 1 million active users milestone (Jan 2026)",
          "Launched Enterprise tier with SSO/SCIM and admin controls (Dec 2025)",
          "Won Product Hunt Golden Kitty for Developer Tools (2025)",
          "Extension store passed 1,000 community-built extensions (Nov 2025)",
          "Added Claude and custom model support to AI chat (Oct 2025)",
        ],
      },
      competitorAnalysis: "**Alfred** ($0-49 one-time) — Veteran Mac launcher, powerful with workflows. But Alfred's workflow system is dated (XML/AppleScript), extension ecosystem is tiny compared to Raycast's 1,000+. Raycast's free tier includes more than Alfred's Powerpack.\n\n**macOS Spotlight** (Free, built-in) — Apple's default launcher. Limited to app launching and basic file search. No clipboard history, window management, extensions, or AI. Raycast is Spotlight on steroids.\n\n**LaunchBar** ($29 one-time) — Respected Mac launcher with strong keyboard UX. Minimal extension ecosystem. No team features, no AI. Niche user base compared to Raycast's 1M+.\n\n**Warp** (Terminal) — Warp is a modern terminal, not a launcher. Complementary to Raycast rather than competitive. Many developers use both — Raycast for everything outside the terminal.\n\n**Keyboard Maestro** ($36 one-time) — Powerful macro automation tool. Steep learning curve, no modern extension ecosystem. Raycast's script commands cover most automation use cases with better UX.",
    },
  },
];
