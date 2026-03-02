export type DemoTool = {
  name: string;
  websiteUrl: string;
  logoUrl: string;
  categories: string[];
  overallScore: number;
  report: {
    summary: string;
    pros: string[];
    cons: string[];
    features: string[];
    pricing: { tier: string; price: string }[];
    scorecard: Record<string, { score: number; justification: string }>;
    sentimentData: {
      reviewAnswer: string;
      trustAnswer: string;
      redditAnswer: string;
      sentimentConsensus: {
        overall: "very_positive" | "positive" | "mixed" | "negative" | "very_negative";
        confidence: number;
        sourceAgreement: string;
      };
      dataSources: number;
      pagesScraped: number;
    };
  };
};

export const DEMO_TOOLS: DemoTool[] = [
  {
    name: "Linear",
    websiteUrl: "https://linear.app",
    logoUrl: "https://logo.clearbit.com/linear.app",
    categories: ["Project Management", "Issue Tracking"],
    overallScore: 9.1,
    report: {
      summary: "Linear is a high-velocity issue tracker built for modern engineering teams. It combines a beautiful, fast interface with deep keyboard shortcuts, Git integration, and a structured project/cycle model that scales from small startups to 500-person eng orgs. Loved by engineering leads for its opinionated workflow and speed.",
      pros: [
        "Blazing fast UI — keyboard-first, no lag even with thousands of issues",
        "Native Git integration with auto-close on merge and branch linking",
        "Excellent cycle planning that maps directly to sprint cadence",
        "Superb roadmap view and initiative grouping for leadership visibility",
        "Clean API and deep Slack/GitHub/Figma integrations",
      ],
      cons: [
        "Limited customization — workflow is opinionated, not flexible",
        "No native time tracking or capacity planning",
        "Can feel heavyweight for non-engineering teams (design, ops)",
        "Pricing jumps significantly from Free to Business tier",
      ],
      features: [
        "Issue tracking with sub-issues and parent/child hierarchy",
        "Cycles (sprints) with automatic carryover",
        "Roadmaps and initiatives for executive view",
        "GitHub, GitLab, Bitbucket integration",
        "Slack notifications and /linear slash command",
        "Keyboard shortcuts for everything",
        "Linear Triage and SLA breach alerts",
        "Embed in Notion, Figma, and Linear Asks in-app",
      ],
      pricing: [
        { tier: "Free", price: "$0/month (up to 250 issues)" },
        { tier: "Basic", price: "$8/user/month" },
        { tier: "Business", price: "$16/user/month" },
        { tier: "Enterprise", price: "Contact sales" },
      ],
      scorecard: {
        features: { score: 9, justification: "Best-in-class issue tracking with Git sync, cycles, roadmaps, and initiatives. Few gaps for engineering workflows." },
        pricing_value: { score: 8, justification: "Competitive for engineering tools. Business tier at $16/user justified by power features. Free tier limited." },
        ease_of_use: { score: 9, justification: "Keyboard-first design, minimal clicks. Learning curve is short for engineers; steeper for non-tech users." },
        integration_depth: { score: 9, justification: "Native GitHub/GitLab, Slack, Figma, Notion, Zapier. API is well-documented and fast." },
        support_quality: { score: 8, justification: "Responsive via Slack community. Docs are excellent. Email support adequate; no live chat on lower tiers." },
        security: { score: 9, justification: "SOC 2 Type II, SSO/SAML on Enterprise, data encryption at rest and in transit." },
        ai_capabilities: { score: 8, justification: "Linear AI for issue triage, auto-labeling, duplicate detection. Solid but not groundbreaking." },
      },
      sentimentData: {
        reviewAnswer: "Linear scores 4.7/5 on G2 with 1,200+ reviews. Engineers universally praise the speed and UI. Top complaints center on limited customization for non-eng workflows.",
        trustAnswer: "No significant complaints on Trustpilot or BBB. Glassdoor shows strong employee satisfaction (4.6). Founded 2019, backed by Sequoia, well-respected brand.",
        redditAnswer: "r/devops and r/SoftwareEngineering regularly recommend Linear over Jira. Most threads agree it's worth the switch. Common Reddit complaint: 'too fast for PM-heavy teams who want customization.'",
        sentimentConsensus: {
          overall: "very_positive",
          confidence: 91,
          sourceAgreement: "G2, Capterra, Reddit, and TrustRadius all show 4.5+ ratings. Engineering community is strongly positive. Non-engineering use cases rated more mixed.",
        },
        dataSources: 28,
        pagesScraped: 14,
      },
    },
  },
  {
    name: "Notion",
    websiteUrl: "https://notion.so",
    logoUrl: "https://logo.clearbit.com/notion.so",
    categories: ["Knowledge Management", "Collaboration"],
    overallScore: 8.4,
    report: {
      summary: "Notion is an all-in-one workspace for docs, wikis, databases, and project management. It excels as a flexible internal knowledge base and operational system-of-record. Teams use it for everything from meeting notes to project tracking to CRM. The tradeoff: ultimate flexibility means teams need to invest in setup.",
      pros: [
        "Unmatched flexibility — can model almost any data structure or workflow",
        "Beautiful page editor with rich embeds, callouts, toggles",
        "Powerful databases with multiple views (table, board, calendar, gallery)",
        "Strong template ecosystem for rapid onboarding",
        "Notion AI for summarization, drafting, and Q&A over docs",
      ],
      cons: [
        "Can become a 'black hole' of docs without governance",
        "Mobile app is noticeably slower than desktop",
        "Not a replacement for purpose-built PM tools for engineering",
        "Permissions can be confusing for large teams",
      ],
      features: [
        "Block-based rich text editor",
        "Relational databases with rollups and formulas",
        "Notion AI (summarize, write, Q&A)",
        "Team wikis with nested page structure",
        "API for building integrations",
        "Notion Projects for task/project tracking",
        "Templates marketplace",
        "Embed 500+ third-party apps",
      ],
      pricing: [
        { tier: "Free", price: "$0/month" },
        { tier: "Plus", price: "$8/user/month" },
        { tier: "Business", price: "$15/user/month" },
        { tier: "Enterprise", price: "Contact sales" },
      ],
      scorecard: {
        features: { score: 9, justification: "Widest feature surface of any wiki/doc tool. Databases, AI, Projects, API — covers most knowledge management use cases." },
        pricing_value: { score: 8, justification: "Free tier is generous. Plus at $8/user is competitive. Business tier unlocks audit log and SAML which enterprise teams need." },
        ease_of_use: { score: 7, justification: "Easy to start, hard to master. Power features require significant setup. Non-technical users may feel overwhelmed." },
        integration_depth: { score: 8, justification: "Strong API, Zapier/Make support, native Slack/GitHub/Jira/Figma integrations. Some integrations lack depth." },
        support_quality: { score: 7, justification: "Docs are excellent. Support response time is 24-48h on lower tiers. Notion community (Reddit, Discord) fills gaps." },
        security: { score: 8, justification: "SOC 2 Type II, SAML/SSO on Enterprise, custom data residency available. Permissions can be misconfigured easily." },
        ai_capabilities: { score: 9, justification: "Notion AI is genuinely best-in-class for doc-centric workflows. Q&A over workspace, auto-fill databases, smart summaries." },
      },
      sentimentData: {
        reviewAnswer: "4.7/5 on G2, 4.7/5 on Capterra. Most loved feature: flexibility and design. Most common complaint: slow mobile app and steep learning curve for new teams.",
        trustAnswer: "Strong brand reputation. No major security incidents. Trusted by 30M+ users globally. Backed by Sequoia and Index Ventures.",
        redditAnswer: "Notion polarizes Reddit — it has devoted fans on r/Notion and frustrated ex-users on r/productivity who found it became unmanageable. Best used with templates and governance.",
        sentimentConsensus: {
          overall: "positive",
          confidence: 82,
          sourceAgreement: "Broadly positive across review platforms. Power users rate highly; teams that over-built Notion complain about sprawl. Net sentiment strongly positive.",
        },
        dataSources: 31,
        pagesScraped: 16,
      },
    },
  },
  {
    name: "Slack",
    websiteUrl: "https://slack.com",
    logoUrl: "https://logo.clearbit.com/slack.com",
    categories: ["Communication", "Collaboration"],
    overallScore: 8.7,
    report: {
      summary: "Slack is the de facto team messaging platform for tech companies. Its channel-based model, app ecosystem (2,600+ integrations), and workflow automation make it a critical communication hub. The major concerns are notification fatigue and cost at scale — but for most SaaS orgs, Slack is simply non-negotiable infrastructure.",
      pros: [
        "Industry-standard — external vendors, partners, investors all use it",
        "2,600+ app integrations via App Directory",
        "Slack Connect for external collaboration channels",
        "Workflow Builder for automation without code",
        "Excellent search and threading for managing information",
      ],
      cons: [
        "Notification overload is a known culture problem",
        "Pricing is $7.25/user — adds up fast for 50+ person teams",
        "Slack AI (search) requires premium tier",
        "Can become anti-async — FOMO culture in always-on teams",
      ],
      features: [
        "Channel-based messaging (public, private, shared)",
        "Slack Connect (external channels with vendors/partners)",
        "Workflow Builder — no-code automation",
        "Slack AI for search, summaries, thread recaps",
        "2,600+ app integrations",
        "Video/audio clips (Huddles)",
        "Canvas for persistent docs in channels",
        "Advanced analytics on Business+ tier",
      ],
      pricing: [
        { tier: "Free", price: "$0/month (90-day message history)" },
        { tier: "Pro", price: "$7.25/user/month" },
        { tier: "Business+", price: "$12.50/user/month" },
        { tier: "Enterprise Grid", price: "Contact sales" },
      ],
      scorecard: {
        features: { score: 9, justification: "Comprehensive messaging platform with channels, threads, automation, Connect, Huddles. Few meaningful gaps." },
        pricing_value: { score: 7, justification: "Gets expensive fast at scale. 50 users = $4,300/yr minimum on Pro. Free tier is very limited (90-day history)." },
        ease_of_use: { score: 9, justification: "Best-in-class UX for team messaging. Minimal onboarding needed. New users productive in minutes." },
        integration_depth: { score: 10, justification: "2,600+ integrations. Every major SaaS tool integrates with Slack. Webhooks, slash commands, app framework." },
        support_quality: { score: 8, justification: "Extensive docs and community. Dedicated support on Enterprise. Chat support on Pro/Business+ with fast response." },
        security: { score: 9, justification: "SOC 2, ISO 27001, HIPAA-eligible on Enterprise. Enterprise Key Management available. Regular security audits." },
        ai_capabilities: { score: 7, justification: "Slack AI launched 2024 — channel recaps, thread summaries, search assistant. Good but early. Costs extra." },
      },
      sentimentData: {
        reviewAnswer: "4.5/5 on G2. Most praised: integrations, ease of use, UI quality. Most criticized: pricing, notification overload, Slack AI being paywalled.",
        trustAnswer: "Part of Salesforce since 2021. Well-regarded. No major security incidents. Enterprise-grade trust signals.",
        redditAnswer: "r/Slack has active community. Many posts about notification management and async best practices. Microsoft Teams vs Slack debates common. Slack usually wins for tech-forward teams.",
        sentimentConsensus: {
          overall: "positive",
          confidence: 85,
          sourceAgreement: "Broadly positive. Enterprise and startup users both rate high. Main complaint is cost at scale and notification culture. Essential infrastructure for most tech teams.",
        },
        dataSources: 24,
        pagesScraped: 12,
      },
    },
  },
  {
    name: "Figma",
    websiteUrl: "https://figma.com",
    logoUrl: "https://logo.clearbit.com/figma.com",
    categories: ["Design", "Collaboration"],
    overallScore: 9.3,
    report: {
      summary: "Figma is the industry-leading collaborative design tool for UI/UX, brand, and product teams. It runs entirely in the browser with real-time multiplayer editing, making it the de facto standard for product design at every stage from wireframe to production handoff. FigJam extends it to whiteboarding and diagramming.",
      pros: [
        "Real-time multiplayer — whole team can edit the same file simultaneously",
        "Dev Mode for pixel-perfect code handoff",
        "Component and variable system for design systems",
        "FigJam for whiteboarding and ideation",
        "Industry standard — every design-adjacent role uses it",
      ],
      cons: [
        "Can get slow with very large files (100+ artboards)",
        "Pricing increased significantly in 2023 — $12/editor/month",
        "Offline mode is limited",
        "Advanced prototyping still behind tools like ProtoPie",
      ],
      features: [
        "Vector editing and design tools",
        "Real-time collaborative editing",
        "Component libraries and design tokens",
        "Prototyping with interactions and animations",
        "Dev Mode for developer handoff",
        "FigJam (whiteboarding)",
        "Plugin ecosystem",
        "Figma AI for design generation",
      ],
      pricing: [
        { tier: "Free", price: "$0/month (3 Figma files)" },
        { tier: "Professional", price: "$12/editor/month" },
        { tier: "Organization", price: "$45/editor/month" },
        { tier: "Enterprise", price: "$75/editor/month" },
      ],
      scorecard: {
        features: { score: 10, justification: "Best-in-class design tool. Covers wireframing, component design, prototyping, Dev Mode, FigJam — all in one product." },
        pricing_value: { score: 7, justification: "2023 price increase was controversial. $12/editor/month is justified for the value but a jump from the old $15/team model." },
        ease_of_use: { score: 9, justification: "Industry standard — most designers already know it. Excellent docs and onboarding. Non-designers can view/comment freely." },
        integration_depth: { score: 9, justification: "Deep integrations with Jira, Notion, Slack, GitHub. Plugin ecosystem extends capabilities significantly." },
        support_quality: { score: 8, justification: "Excellent community and docs. Support is responsive. Figma Academy and YouTube channels are high quality." },
        security: { score: 9, justification: "SOC 2 Type II, SAML/SSO on Organization+, advanced permissions. No major incidents since acquisition attempt." },
        ai_capabilities: { score: 8, justification: "Figma AI launched 2024 — auto-layout suggestions, design generation, rename layers. Promising but still maturing." },
      },
      sentimentData: {
        reviewAnswer: "4.7/5 on G2 with 1,100+ reviews. Designers universally love it. The 2023 pricing controversy led to a brief dip in sentiment but scores rebounded.",
        trustAnswer: "Extremely strong brand. After Adobe acquisition failure, Figma raised at $12.5B valuation. Enterprise trusted by Google, Salesforce, Airbnb.",
        redditAnswer: "r/UI_Design and r/webdev strongly recommend Figma. Post-Adobe-acquisition, many designers expressed concern but tool quality keeps users loyal.",
        sentimentConsensus: {
          overall: "very_positive",
          confidence: 93,
          sourceAgreement: "Overwhelmingly positive across all review platforms. Only significant negative sentiment: 2023 pricing increase. Core tool satisfaction is near-universal.",
        },
        dataSources: 26,
        pagesScraped: 13,
      },
    },
  },
  {
    name: "OpenAI",
    websiteUrl: "https://openai.com",
    logoUrl: "https://logo.clearbit.com/openai.com",
    categories: ["AI / LLM", "Developer Tools"],
    overallScore: 9.0,
    report: {
      summary: "OpenAI provides GPT-4o, o1, and o3-mini via API — the most widely adopted LLM APIs in production. ChatGPT Enterprise targets organizational deployments with SOC 2, admin controls, and private models. The combination of market-leading model quality, extensive documentation, and broad ecosystem support makes OpenAI the default choice for AI-native SaaS teams.",
      pros: [
        "Best model quality in the industry for general tasks (GPT-4o, o1)",
        "Largest ecosystem — most third-party tools, libraries, and examples target OpenAI",
        "Structured output, function calling, and vision are production-ready",
        "ChatGPT Enterprise offers team-wide access with admin controls",
        "Extensive documentation, cookbooks, and community",
      ],
      cons: [
        "Costs can scale unpredictably with high-volume API usage",
        "Rate limits can block production workloads at peak",
        "Privacy concerns — data used for training unless Enterprise",
        "Anthropic Claude and Google Gemini competitive on certain benchmarks",
      ],
      features: [
        "GPT-4o and o1 API access",
        "Batch API (50% cost reduction for async jobs)",
        "Fine-tuning (GPT-3.5, GPT-4o-mini)",
        "Embeddings (text-embedding-3-small, text-embedding-3-large)",
        "Image generation (DALL-E 3)",
        "Speech-to-text (Whisper), TTS",
        "Assistants API with code interpreter and retrieval",
        "ChatGPT Enterprise with admin controls and SOC 2",
      ],
      pricing: [
        { tier: "API (GPT-4o)", price: "$2.50/M input tokens, $10/M output" },
        { tier: "API (o1)", price: "$15/M input tokens, $60/M output" },
        { tier: "API (GPT-4o-mini)", price: "$0.15/M input tokens" },
        { tier: "ChatGPT Team", price: "$30/user/month" },
        { tier: "ChatGPT Enterprise", price: "Contact sales" },
      ],
      scorecard: {
        features: { score: 10, justification: "Widest feature surface of any AI provider. GPT-4o, o1, DALL-E, Whisper, Embeddings, Fine-tuning, Assistants, Batch API." },
        pricing_value: { score: 7, justification: "Competitive per-token pricing. Batch API reduces costs. Enterprise can get expensive. o1 is pricey for large context workloads." },
        ease_of_use: { score: 9, justification: "Best docs and SDK in AI industry. Python and Node SDKs are excellent. Playground makes experimentation fast." },
        integration_depth: { score: 10, justification: "Widest ecosystem. LangChain, LlamaIndex, Vercel AI SDK, every AI framework defaults to OpenAI compatibility." },
        support_quality: { score: 7, justification: "Forum and community support strong. Enterprise gets dedicated support. API status page is transparent on incidents." },
        security: { score: 8, justification: "SOC 2 Type II, GDPR compliant. Enterprise Zero Data Retention. No training on API data. Data residency US-only." },
        ai_capabilities: { score: 10, justification: "This IS the AI capability. GPT-4o and o1 lead most benchmarks. Ongoing model releases maintain competitive position." },
      },
      sentimentData: {
        reviewAnswer: "4.6/5 on G2. Developers love the API quality and docs. ChatGPT Enterprise rated highly by IT admins for controls. Cost predictability is the most common concern.",
        trustAnswer: "Extremely high trust for the API product. Moderate controversy around OpenAI governance (Altman firing/rehiring). Enterprise customers consistently report positive outcomes.",
        redditAnswer: "r/MachineLearning and r/LocalLLaMA debate OpenAI vs alternatives constantly. OpenAI maintains lead for production use cases. Cost concerns growing as usage scales.",
        sentimentConsensus: {
          overall: "positive",
          confidence: 84,
          sourceAgreement: "Developer and enterprise sentiment is strongly positive. Consumer-facing AI controversies don't significantly affect B2B/API perception. Cost is the main friction point.",
        },
        dataSources: 33,
        pagesScraped: 18,
      },
    },
  },
  {
    name: "Perplexity",
    websiteUrl: "https://perplexity.ai",
    logoUrl: "https://logo.clearbit.com/perplexity.ai",
    categories: ["AI / Search", "Research"],
    overallScore: 8.3,
    report: {
      summary: "Perplexity AI is an AI-native search engine that returns sourced, synthesized answers rather than a list of links. The Sonar API enables real-time web search with LLM synthesis, making it ideal for building research tools, competitive intel workflows, and anything requiring up-to-date web data. Perplexity Enterprise offers team-wide access with privacy controls.",
      pros: [
        "Sonar API gives real-time web search + LLM synthesis in one call",
        "Source citations included — answers are verifiable",
        "Pro model is excellent for deep research and multi-step reasoning",
        "Perplexity Pages for generating long-form research documents",
        "Enterprise privacy mode: no data used for training",
      ],
      cons: [
        "Not ideal for creative or structured-output tasks (use GPT-4o for that)",
        "API pricing can be costly for high-volume search queries",
        "Less ecosystem support than OpenAI",
        "Enterprise tier required for most team workflows",
      ],
      features: [
        "Real-time web search with LLM synthesis",
        "Sonar API (sonar-reasoning-pro, sonar-pro, sonar-mini)",
        "Citation-backed answers",
        "Perplexity Pages for research documents",
        "Pro model with extended reasoning",
        "Image and file upload for context",
        "Enterprise SSO and data privacy controls",
        "Collections for saved research",
      ],
      pricing: [
        { tier: "Free", price: "$0/month (5 Pro queries/day)" },
        { tier: "Pro", price: "$20/month" },
        { tier: "Enterprise Pro", price: "$40/user/month" },
        { tier: "Sonar API", price: "$1/1000 queries (sonar-mini)" },
      ],
      scorecard: {
        features: { score: 8, justification: "Strong for research and search-augmented generation. Sonar API is the standout. Less versatile than OpenAI for non-search tasks." },
        pricing_value: { score: 8, justification: "Pro at $20/mo is excellent value for power users. Sonar API pricing competitive for search queries. Enterprise adds up for teams." },
        ease_of_use: { score: 9, justification: "Consumer product is extremely polished. API is simple. No complex setup. Perplexity Pages makes research report generation trivial." },
        integration_depth: { score: 7, justification: "Good API, growing ecosystem. Less integrated into major platforms than OpenAI. Make/Zapier connectors exist." },
        support_quality: { score: 7, justification: "Documentation is improving. Community growing quickly. Enterprise support is good." },
        security: { score: 8, justification: "SOC 2 Type II in progress. Enterprise privacy mode available. GDPR compliant." },
        ai_capabilities: { score: 9, justification: "Best-in-class for real-time web research. Sonar reasoning-pro is exceptional for competitive analysis and synthesis over live web data." },
      },
      sentimentData: {
        reviewAnswer: "4.5/5 on G2. Researchers and ops teams love the real-time search quality. Power users praise the reasoning depth. Occasional complaints about hallucination on niche topics.",
        trustAnswer: "Well-funded ($165M+ raised, $520M Series B). Strong backing from Jeff Bezos, Nvidia. Fast-growing user base — 10M+ users as of 2024.",
        redditAnswer: "r/ChatGPT and r/ArtificialIntelligence frequently recommend Perplexity for research tasks. Growing fanbase among ops/research professionals.",
        sentimentConsensus: {
          overall: "positive",
          confidence: 80,
          sourceAgreement: "Broadly positive, especially for research workflows. API users very satisfied. Consumer product rated highest. Enterprise offering newer but well-received.",
        },
        dataSources: 22,
        pagesScraped: 11,
      },
    },
  },
  {
    name: "Clay",
    websiteUrl: "https://clay.com",
    logoUrl: "https://logo.clearbit.com/clay.com",
    categories: ["Data Enrichment", "Sales Intelligence"],
    overallScore: 8.8,
    report: {
      summary: "Clay is an AI-powered data enrichment and outbound automation platform. It aggregates 50+ data sources (LinkedIn, Apollo, Clearbit, Hunter, etc.) into a spreadsheet-like interface, then uses AI (Claygent) to research, write personalized messages, and push contacts to your CRM or sequencer. The tool of choice for modern growth teams running hyper-personalized outbound.",
      pros: [
        "Aggregates 50+ data providers — find enriched data on almost anyone",
        "Claygent AI agent for custom web research at scale",
        "Waterfall enrichment: tries 5+ sources automatically to maximize fill rate",
        "Native integrations with HubSpot, Salesforce, Instantly, Apollo, Outreach",
        "AI message writing with real personalization (not just merge tags)",
      ],
      cons: [
        "Learning curve — complex for non-ops users",
        "Credit system can be confusing to estimate costs upfront",
        "Slower to run large tables (1000+ row enrichments take time)",
        "Enterprise pricing is significant for small teams",
      ],
      features: [
        "50+ data provider integrations in one interface",
        "Waterfall enrichment logic",
        "Claygent AI research agent",
        "AI-powered personalized message generation",
        "CRM sync (HubSpot, Salesforce, Pipedrive)",
        "Sequencer push (Instantly, Apollo, Outreach, Salesloft)",
        "LinkedIn automation via Clay's enrichment layer",
        "Templates for common GTM workflows",
      ],
      pricing: [
        { tier: "Starter", price: "$149/month (2,000 credits)" },
        { tier: "Explorer", price: "$349/month (10,000 credits)" },
        { tier: "Pro", price: "$800/month (50,000 credits)" },
        { tier: "Enterprise", price: "Custom" },
      ],
      scorecard: {
        features: { score: 9, justification: "Broadest data enrichment surface of any tool in the market. 50+ providers, waterfall enrichment, Claygent, and AI messaging in one platform." },
        pricing_value: { score: 7, justification: "Powerful but expensive. Starter at $149 is accessible; Pro at $800 is for serious outbound programs. Credit system requires careful monitoring." },
        ease_of_use: { score: 7, justification: "Spreadsheet paradigm is familiar but Clay-specific logic requires training. Docs and community are good. YouTube tutorials very helpful." },
        integration_depth: { score: 9, justification: "50+ native data providers. CRM and sequencer integrations are first-class. Zapier/Make connectors for everything else." },
        support_quality: { score: 9, justification: "Best-in-class community support. Clay Circle Slack has 20,000+ active members. Founders respond directly. Video walkthroughs for common workflows." },
        security: { score: 7, justification: "SOC 2 in progress as of 2024. GDPR compliant. Data handling policies are reasonable for a growth-stage startup." },
        ai_capabilities: { score: 9, justification: "Claygent AI research agent is genuinely impressive. Custom AI formulas for enrichment and personalization. Best-in-class for GTM AI workflows." },
      },
      sentimentData: {
        reviewAnswer: "4.8/5 on G2 with 400+ reviews. Overwhelmingly positive. Top-rated for ease of setup and customer support. Common praise: 'replaced 5 tools.'",
        trustAnswer: "Well-funded ($62M Series B, 2024). Strong VC backing (Meritech, Sequoia). Brand beloved by GTM community. Some credit billing confusion reported.",
        redditAnswer: "r/sales and r/leadsgeneration love Clay. Most threads are use-case sharing rather than complaints. Growing GTM community. Considered the gold standard for enrichment.",
        sentimentConsensus: {
          overall: "very_positive",
          confidence: 90,
          sourceAgreement: "GTM community overwhelmingly positive. G2 and Capterra both show 4.8+. Price is the only regular objection. Net Promoter Score reportedly very high.",
        },
        dataSources: 19,
        pagesScraped: 10,
      },
    },
  },
  {
    name: "Intercom",
    websiteUrl: "https://intercom.com",
    logoUrl: "https://logo.clearbit.com/intercom.com",
    categories: ["Customer Support", "Customer Success"],
    overallScore: 8.1,
    report: {
      summary: "Intercom is a customer communication platform combining live chat, AI-powered chatbots, in-app messaging, and email. The Fin AI agent handles support tickets automatically, resolving 40–60% of volume without human intervention. The platform is end-to-end: acquisition chat, onboarding in-app messages, support, and product tours in a unified inbox.",
      pros: [
        "Fin AI agent resolves 40-60% of support tickets automatically",
        "Unified inbox across live chat, email, Slack, and in-app",
        "Product tours and in-app messages for onboarding flows",
        "Deep behavioral targeting for proactive messaging",
        "Well-documented JavaScript SDK for rich customization",
      ],
      cons: [
        "Expensive at scale — pricing based on contacts and seats can surprise",
        "Fin AI quality varies significantly by topic and knowledge base quality",
        "Complex admin setup for routing, SLAs, and targeting rules",
        "Some features (product tours, surveys) are add-ons",
      ],
      features: [
        "Fin AI for autonomous support resolution",
        "Live chat with workspace routing",
        "In-app messages and product tours",
        "Email campaigns and transactional messaging",
        "Help Center with AI-powered article suggestions",
        "CRM integrations (HubSpot, Salesforce)",
        "Behavioral targeting and custom events",
        "Reporting and CSAT tracking",
      ],
      pricing: [
        { tier: "Essential", price: "$39/seat/month" },
        { tier: "Advanced", price: "$99/seat/month" },
        { tier: "Expert", price: "$139/seat/month" },
        { tier: "Fin AI ($0.99/resolution)", price: "Usage-based add-on" },
      ],
      scorecard: {
        features: { score: 8, justification: "Best-in-class for AI-native customer support. Live chat, AI agent, product tours, email, help center — comprehensive but some features are add-ons." },
        pricing_value: { score: 6, justification: "Can become expensive quickly. $0.99/Fin resolution adds up for high-volume support. Seat-based pricing plus contact-based billing is complex." },
        ease_of_use: { score: 8, justification: "Messenger integration is simple (copy/paste JS). Admin configuration for routing and targeting has a learning curve." },
        integration_depth: { score: 9, justification: "Rich integrations with Salesforce, HubSpot, Slack, GitHub, Jira. SDK enables deep customization. Webhooks for custom flows." },
        support_quality: { score: 8, justification: "Good documentation and onboarding. Premier support available on Expert tier. Community forum is active." },
        security: { score: 8, justification: "SOC 2 Type II, GDPR, CCPA. SAML/SSO available. Data processing agreements available on request." },
        ai_capabilities: { score: 9, justification: "Fin AI is among the best AI support agents in the market. 40-60% resolution rate is genuine and well-documented. Continuously improving." },
      },
      sentimentData: {
        reviewAnswer: "4.5/5 on G2 with 3,000+ reviews. Love: Fin AI, unified inbox, product tours. Criticize: pricing complexity, occasional Fin AI misresolutions.",
        trustAnswer: "Unicorn company ($1.2B+ ARR). Highly trusted brand in CS/support category. Some billing complaints on Trustpilot but generally well-managed.",
        redditAnswer: "r/CustomerSuccess discusses Intercom frequently. Most debates are Zendesk vs Intercom. Intercom wins for product-led growth companies; Zendesk for large support teams.",
        sentimentConsensus: {
          overall: "positive",
          confidence: 79,
          sourceAgreement: "Positive across review sites. Pricing is the persistent complaint. Fin AI quality is praised. Product for B2B SaaS companies is near-universal recommendation.",
        },
        dataSources: 27,
        pagesScraped: 15,
      },
    },
  },
];
