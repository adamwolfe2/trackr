// Mock data for the Process page — uses Linear as the example tool throughout

export const DEMO_TOOL = {
  name: "Linear",
  domain: "linear.app",
  url: "https://linear.app",
  score: 91,
  sentiment: "Very Positive",
  sentimentConfidence: 92,
};

export const SERVICE_PROVIDERS = {
  firecrawl: { name: "Firecrawl", domain: "firecrawl.dev" },
  tavily: { name: "Tavily", domain: "tavily.com" },
  perplexity: { name: "Perplexity", domain: "perplexity.ai" },
  openai: { name: "OpenAI GPT-4o", domain: "openai.com" },
};

// Step 1: Site map URLs
export const SITEMAP_URLS = [
  { url: "linear.app", depth: 0, tag: null },
  { url: "linear.app/features", depth: 1, tag: "FEATURES" },
  { url: "linear.app/pricing", depth: 1, tag: "PRICING" },
  { url: "linear.app/about", depth: 1, tag: "ABOUT" },
  { url: "linear.app/changelog", depth: 1, tag: null },
  { url: "linear.app/integrations", depth: 1, tag: "INTEGRATIONS" },
  { url: "linear.app/customers", depth: 1, tag: null },
  { url: "linear.app/method", depth: 1, tag: null },
  { url: "linear.app/docs", depth: 1, tag: "DOCS" },
  { url: "linear.app/security", depth: 1, tag: null },
  { url: "linear.app/blog", depth: 1, tag: null },
  { url: "linear.app/careers", depth: 1, tag: null },
];

export const SELECTED_PAGES = ["Homepage", "Pricing", "Features", "About"];

// Step 2: Scraped page content (truncated markdown snippets)
export const SCRAPED_PAGES = [
  {
    label: "Homepage",
    chars: 12847,
    lines: [
      "# Linear — Plan, build, ship",
      "## Purpose-built for modern teams",
      "Linear is the project management tool",
      "that streamlines software development.",
      "Teams use Linear to plan sprints,",
      "track issues, and ship products.",
      "Built for speed. Designed for scale.",
    ],
  },
  {
    label: "Pricing",
    chars: 4219,
    lines: [
      "# Pricing",
      "## Free — $0/month",
      "For small teams getting started.",
      "Up to 250 issues, unlimited members.",
      "## Standard — $8/user/mo",
      "For growing teams. Unlimited issues.",
      "## Plus — $14/user/mo",
    ],
  },
  {
    label: "Features",
    chars: 9631,
    lines: [
      "# Features",
      "## Issue Tracking",
      "Create, assign, and prioritize issues",
      "with sub-issues and relations.",
      "## Cycles & Projects",
      "Plan sprints with automated workflows",
      "and cross-team project tracking.",
    ],
  },
  {
    label: "About",
    chars: 3502,
    lines: [
      "# About Linear",
      "## Our Mission",
      "We believe software teams deserve",
      "better tools. Linear was founded in",
      "2019 by Karri Saarinen and Tuomas",
      "Artman to build the future of",
      "project management for engineers.",
    ],
  },
];

// Step 3: Review sites & results
export const REVIEW_QUERY = "Linear software reviews user feedback pros cons";

export const REVIEW_DOMAINS = [
  { domain: "g2.com", name: "G2" },
  { domain: "capterra.com", name: "Capterra" },
  { domain: "trustradius.com", name: "TrustRadius" },
  { domain: "getapp.com", name: "GetApp" },
  { domain: "producthunt.com", name: "Product Hunt" },
];

export const REVIEW_RESULTS = [
  {
    source: "G2",
    domain: "g2.com",
    title: "Linear Reviews 2025 — Verified User Feedback",
    score: 94,
    snippet:
      "4.7/5 from 842 reviews. Users praise speed, keyboard shortcuts, and clean design. Most common positive: 'Finally, project management that doesn't feel slow.'",
  },
  {
    source: "Capterra",
    domain: "capterra.com",
    title: "Linear Reviews and Pricing — 2025 Software Advice",
    score: 91,
    snippet:
      "4.6/5 from 327 reviews. Highly rated for ease of use and developer experience. Some users note limited reporting compared to Jira.",
  },
  {
    source: "TrustRadius",
    domain: "trustradius.com",
    title: "Linear Project Management — Real User Reviews",
    score: 89,
    snippet:
      "8.9/10 TrustRadius score. Enterprise users highlight fast adoption and clean UX. Noted gap: advanced time tracking and resource management.",
  },
  {
    source: "Product Hunt",
    domain: "producthunt.com",
    title: "Linear — The issue tracker you'll enjoy using",
    score: 96,
    snippet:
      "Product of the Day. 2,400+ upvotes. 'Makes Jira feel like enterprise software from 2005.' Praised for speed and keyboard-first design.",
  },
];

// Step 4: Trust & reputation sources
export const TRUST_SOURCES = [
  {
    source: "Crunchbase",
    domain: "crunchbase.com",
    signal: "Series B — $35M raised",
    strength: 85,
  },
  {
    source: "BuiltWith",
    domain: "builtwith.com",
    signal: "10,000+ company installs detected",
    strength: 90,
  },
  {
    source: "StackShare",
    domain: "stackshare.io",
    signal: "Used by Vercel, Ramp, Loom, Cash App",
    strength: 92,
  },
  {
    source: "GitHub",
    domain: "github.com",
    signal: "Active SDK — 1.2K stars, weekly commits",
    strength: 78,
  },
];

export const TRUST_SUMMARY =
  "Strong trust signals across funding, adoption, and developer ecosystem. Used by well-known tech companies with active open-source presence.";

// Step 5: Reddit threads
export const REDDIT_LANES = [
  {
    label: "User Experiences",
    query: "Linear app review experience",
    threads: [
      { title: "Switched from Jira to Linear — never going back", sub: "r/webdev", upvotes: 847 },
      { title: "6 months with Linear: what I love and what I miss", sub: "r/SaaS", upvotes: 312 },
      { title: "Linear just added Initiatives — game changer", sub: "r/projectmanagement", upvotes: 156 },
      { title: "Our startup runs entirely on Linear", sub: "r/startups", upvotes: 523 },
      { title: "Linear keyboard shortcuts are addictive", sub: "r/productivity", upvotes: 89 },
    ],
  },
  {
    label: "Comparisons",
    query: "Linear vs Jira vs Asana comparison",
    threads: [
      { title: "Linear vs Jira 2025: which is better for devs?", sub: "r/programming", upvotes: 1247 },
      { title: "Honest comparison: Linear, Jira, Shortcut, Asana", sub: "r/webdev", upvotes: 634 },
      { title: "Why we chose Linear over Asana", sub: "r/SaaS", upvotes: 201 },
      { title: "Linear for a 200-person eng team — does it scale?", sub: "r/ExperiencedDevs", upvotes: 445 },
      { title: "Migrating from Jira to Linear — lessons learned", sub: "r/devops", upvotes: 178 },
    ],
  },
  {
    label: "Pain Points",
    query: "Linear app issues problems limitations",
    threads: [
      { title: "Linear's reporting is still too basic", sub: "r/projectmanagement", upvotes: 234 },
      { title: "Missing time tracking in Linear — workarounds?", sub: "r/webdev", upvotes: 89 },
      { title: "Linear pricing jumped — still worth it?", sub: "r/SaaS", upvotes: 167 },
      { title: "Linear API limitations for custom integrations", sub: "r/programming", upvotes: 56 },
      { title: "Wish Linear had better Gantt/timeline views", sub: "r/projectmanagement", upvotes: 312 },
    ],
  },
];

export const REDDIT_UNIQUE_COUNT = 8;
export const REDDIT_TOTAL_COUNT = 15;

// Step 6: Competitive intel
export const THINKING_LINES = [
  "Analyzing competitive positioning...",
  "Cross-referencing funding data...",
  "Mapping feature parity across alternatives...",
  "Evaluating market sentiment and momentum...",
  "Synthesizing competitive landscape...",
];

export const COMPETITORS = [
  { name: "Jira", domain: "atlassian.com" },
  { name: "Asana", domain: "asana.com" },
  { name: "Shortcut", domain: "shortcut.com" },
  { name: "Height", domain: "height.app" },
  { name: "Plane", domain: "plane.so" },
];

export const MARKET_INTEL = [
  { label: "Founded", value: "2019" },
  { label: "HQ", value: "San Francisco, CA" },
  { label: "Employees", value: "~150" },
  { label: "Funding", value: "$52M (Series B)" },
  { label: "Recent News", value: "Launched Initiatives & Triage features" },
];

// Step 7: AI synthesis context feed
export const CONTEXT_SECTIONS = [
  { label: "Homepage content", size: "12.8KB" },
  { label: "Pricing page", size: "4.2KB" },
  { label: "Features page", size: "9.6KB" },
  { label: "About page", size: "3.5KB" },
  { label: "G2 Reviews (8 sources)", size: "6.1KB" },
  { label: "Trust signals (4 sources)", size: "2.3KB" },
  { label: "Reddit threads (8 unique)", size: "4.8KB" },
  { label: "Competitive analysis", size: "3.2KB" },
];

export const SYNTHESIS_SUMMARY =
  "Linear is a modern, speed-focused project management tool built for software teams. It excels in developer experience, keyboard-driven workflows, and clean design. While it lacks some enterprise features like advanced reporting and time tracking, its rapid iteration and strong community make it a top choice for engineering-first organizations.";

// Report finale data
export const SCORECARD_DIMENSIONS = [
  { label: "Ease of Use", score: 95 },
  { label: "Feature Depth", score: 82 },
  { label: "Pricing Value", score: 88 },
  { label: "User Sentiment", score: 94 },
  { label: "Trust & Reputation", score: 90 },
  { label: "Integration Ecosystem", score: 85 },
  { label: "Momentum & Growth", score: 93 },
];

export const PROS = [
  "Blazing fast interface with keyboard-first design",
  "Clean, opinionated UX reduces decision fatigue",
  "Strong developer ecosystem and API",
  "Rapid feature development and iteration",
];

export const CONS = [
  "Limited advanced reporting and dashboards",
  "No built-in time tracking",
  "Fewer enterprise admin controls vs. Jira",
  "Can feel opinionated for non-engineering teams",
];

export const DATA_SOURCES_SUMMARY = {
  totalSources: 28,
  pagesScraped: 4,
  redditThreads: 8,
};

// Step descriptions for pipeline nodes
export const STEP_DESCRIPTIONS = [
  {
    stepNumber: 1,
    stepName: "Map Site",
    serviceName: "Firecrawl",
    serviceDomain: "firecrawl.dev",
    description:
      "Crawl the tool's website to discover all pages and build a sitemap. We identify key pages like pricing, features, and about — then select the most informative ones for deep scraping.",
    detail: "~$0.01 per crawl · 15s avg",
  },
  {
    stepNumber: 2,
    stepName: "Scrape Pages",
    serviceName: "Firecrawl",
    serviceDomain: "firecrawl.dev",
    description:
      "Scrape the selected pages in parallel, converting HTML to clean markdown. We extract text content, pricing tables, feature lists, and metadata — everything the AI needs to understand the tool.",
    detail: "~$0.004 per page · 4 pages parallel",
  },
  {
    stepNumber: 3,
    stepName: "Review Sites",
    serviceName: "Tavily",
    serviceDomain: "tavily.com",
    description:
      "Search major review platforms for real user feedback. We query G2, Capterra, TrustRadius, and Product Hunt to gather ratings, pros/cons, and sentiment from verified users.",
    detail: "~$0.01 per search · 5 review sites",
  },
  {
    stepNumber: 4,
    stepName: "Trust & Reputation",
    serviceName: "Tavily",
    serviceDomain: "tavily.com",
    description:
      "Verify the tool's trustworthiness by checking funding data, company size, tech stack adoption, and ecosystem signals. This builds a composite trust score from multiple independent sources.",
    detail: "~$0.01 per search · 4 trust sources",
  },
  {
    stepNumber: 5,
    stepName: "Reddit Deep Dive",
    serviceName: "Tavily",
    serviceDomain: "tavily.com",
    description:
      "Run three parallel Reddit searches to find real user experiences, competitive comparisons, and known pain points. Results are merged and deduplicated for the most authentic user signal.",
    detail: "~$0.03 total · 3 parallel queries",
  },
  {
    stepNumber: 6,
    stepName: "Competitive Intel",
    serviceName: "Perplexity",
    serviceDomain: "perplexity.ai",
    description:
      "Use Perplexity's reasoning model to analyze the competitive landscape. Identifies key competitors, maps market positioning, and surfaces funding, team size, and recent developments.",
    detail: "~$0.02 per query · deep reasoning",
  },
  {
    stepNumber: 7,
    stepName: "AI Synthesis",
    serviceName: "OpenAI GPT-4o",
    serviceDomain: "openai.com",
    description:
      "Feed all collected data into GPT-4o with a structured Zod schema. The model synthesizes a comprehensive report with scores, pros/cons, competitor analysis, and a final recommendation.",
    detail: "~$0.04 per report · structured output",
  },
];

// Connector labels between steps
export const CONNECTOR_LABELS = [
  "12 URLs → selecting 4 key pages",
  "4 pages → ~30KB markdown extracted",
  "Markdown + metadata → searching reviews",
  "Reviews collected → verifying trust signals",
  "Trust verified → mining Reddit discussions",
  "Reddit insights → analyzing competition",
  "All data collected → synthesizing report",
];

// Hero stats
export const HERO_STATS = [
  { value: "7", label: "Research Steps" },
  { value: "25+", label: "Data Sources" },
  { value: "<2 min", label: "Total Time" },
  { value: "~$0.12", label: "Per Report" },
];
