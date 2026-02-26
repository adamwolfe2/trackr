// Trackr — Competitor displacement pages at /vs/[competitor]
// Each page positions Trackr against a specific alternative

export type VsPage = {
    competitor: string;          // URL slug, e.g. "g2"
    title: string;               // <title> tag
    description: string;         // meta description
    competitorName: string;      // Display name, e.g. "G2"
    competitorTagline: string;   // What the competitor does
    headline: string;            // H1
    subheadline: string;
    switchNarrative: string;     // 2–3 paragraph switching story
    featureTable: {
        feature: string;
        trackr: string | boolean;
        competitor: string | boolean;
    }[];
    advantages: {
        title: string;
        description: string;
    }[];
    faqs: { q: string; a: string }[];
    ctaText: string;
};

export const VS_PAGES: VsPage[] = [
    {
        competitor: "g2",
        competitorName: "G2",
        competitorTagline: "Crowd-sourced software review platform",
        title: "Trackr vs G2 — AI Research vs Crowd Reviews | Trackr",
        description: "G2 shows you what other buyers thought 18 months ago. Trackr shows you what the tool looks like today — scored to your stack in 2 minutes.",
        headline: "G2 shows you opinions. Trackr shows you scores.",
        subheadline: "G2 aggregates what other buyers thought about a tool in the past. Trackr researches what it looks like right now — scored against your specific requirements, in 2 minutes.",
        switchNarrative: `G2 is a review aggregation platform. Thousands of buyers leave ratings, write reviews, and the platform surfaces an average. For finding a shortlist of tools to evaluate, it's useful. For making a final decision, it falls short in three specific ways.

First, G2 reviews are historical. The review you're reading was written months or years ago — before the product shipped major features, before pricing changed, before the competitive landscape shifted. The tool rated 4.2 stars in 2023 may be a 7.0 or a 3.0 today.

Second, G2 reviews are general. Every reviewer has a different team size, tech stack, use case, and budget. A 5-star review from an enterprise procurement team tells you nothing about whether the tool is right for a 15-person Series A. Trackr scores tools against the current market, with justifications you can evaluate against your context.

Third, G2 is gamed. Vendors actively solicit positive reviews from happy customers and contest negative ones. The G2 score is a marketing artifact, not a neutral assessment. Trackr's AI research pulls from multiple data sources — including community discussions, competitor positioning, and current pricing — and produces a score no vendor can directly influence.`,
        featureTable: [
            { feature: "Current pricing data", trackr: "Live at generation time", competitor: "Often outdated" },
            { feature: "Competitor analysis", trackr: "Included in every report", competitor: "Separate research needed" },
            { feature: "Consistent scoring framework", trackr: "7-dimension scorecard", competitor: "Star ratings (1–5)" },
            { feature: "Stack-specific evaluation", trackr: true, competitor: false },
            { feature: "Report generation time", trackr: "Under 2 minutes", competitor: "Browse time varies" },
            { feature: "Vendor influence on score", trackr: "None — AI-generated", competitor: "High — reviews solicited" },
            { feature: "Private stack tracking", trackr: true, competitor: false },
            { feature: "Renewal intelligence", trackr: true, competitor: false },
        ],
        advantages: [
            {
                title: "Current data, not historical reviews",
                description: "Every Trackr report pulls live data at generation time. Pricing, features, and competitive positioning reflect today's market — not reviews written when the product was two major versions ago.",
            },
            {
                title: "Scores, not star ratings",
                description: "A 4.2-star average from 800 reviews tells you sentiment. A 7.4/10 across 7 scored dimensions — with written justifications — tells you specifically why and where the tool is strong or weak.",
            },
            {
                title: "Research comes to you",
                description: "G2 requires you to find the tool, read reviews, filter by company size, and synthesize across dozens of opinions. Trackr delivers a complete report in under 2 minutes.",
            },
        ],
        faqs: [
            { q: "Should I use Trackr instead of G2?", a: "For final evaluation decisions: yes, Trackr provides more actionable intelligence. G2 is still useful for initial discovery — finding tools in a category you're not familiar with. Use both: G2 to build the shortlist, Trackr to evaluate the finalists." },
            { q: "Is Trackr's data more accurate than G2?", a: "Different, not necessarily more accurate. G2 reflects real user sentiment at scale. Trackr reflects current market data — pricing, features, and competitive positioning — through AI analysis. Neither is perfect; both are useful sources of signal." },
            { q: "Does Trackr have user reviews?", a: "Trackr surfaces community sentiment from Reddit, TrustRadius, and Capterra as part of the research pipeline. But the core differentiator is the scored 7-dimension framework, not review aggregation." },
        ],
        ctaText: "Try Trackr free",
    },
    {
        competitor: "vendr",
        competitorName: "Vendr",
        competitorTagline: "SaaS procurement and negotiation platform",
        title: "Trackr vs Vendr — Tool Intelligence vs Procurement Services | Trackr",
        description: "Vendr negotiates SaaS contracts after you've decided to buy. Trackr helps you decide whether to buy — with AI research in 2 minutes.",
        headline: "Vendr negotiates after you decide. Trackr helps you decide.",
        subheadline: "Vendr is a procurement service that handles SaaS contract negotiations. Trackr is the research layer that tells you what to negotiate for — and whether to buy at all.",
        switchNarrative: `Vendr and Trackr solve different problems at different stages of the procurement lifecycle. Understanding the difference matters if you're evaluating both.

Vendr is a procurement service. You decide to buy a tool, hand the contract to Vendr's team, and they negotiate on your behalf based on their database of historical contract prices. Their value is downstream — after the buying decision is made. For companies spending $1M+ annually on SaaS, the negotiation savings often justify the cost.

Trackr is an intelligence layer. Before you decide to buy, Trackr researches the tool — scoring it across 7 dimensions, pulling current pricing, surfacing competitive alternatives, and identifying whether the tool is the right choice for your stack. Trackr's value is upstream — before the buying decision is made.

The two are complementary for sophisticated procurement functions. Trackr answers "should we buy this, and at what price range?" Vendr answers "how do we get the best contract terms?" Teams with mature vendor management practices use both.`,
        featureTable: [
            { feature: "Pre-purchase tool research", trackr: true, competitor: false },
            { feature: "7-dimension scoring", trackr: true, competitor: false },
            { feature: "Contract negotiation support", trackr: false, competitor: true },
            { feature: "Current market pricing data", trackr: "AI-researched", competitor: "Historical contract database" },
            { feature: "Competitive alternatives", trackr: "In every report", competitor: false },
            { feature: "Stack overlap detection", trackr: true, competitor: false },
            { feature: "Renewal calendar", trackr: true, competitor: "Partial" },
            { feature: "Report generation time", trackr: "2 minutes self-serve", competitor: "Days (human-assisted)" },
            { feature: "Pricing", trackr: "Free to start", competitor: "$30K+/year" },
        ],
        advantages: [
            {
                title: "Intelligence before the decision",
                description: "Vendr is engaged after you've decided to buy. Trackr helps you make the decision — with scored research, competitive alternatives, and current pricing intelligence. Better decisions upstream mean better outcomes downstream.",
            },
            {
                title: "Self-serve in 2 minutes",
                description: "Vendr's process involves a human team and takes days. Trackr produces a complete research report in under 2 minutes. For the evaluation phase, speed matters — especially when the business is waiting on your recommendation.",
            },
            {
                title: "Built for early-stage and growth companies",
                description: "Vendr's model is designed for companies with $500K+ SaaS spend where negotiation savings justify the cost. Trackr's intelligence layer is useful from the first tool evaluation — on the free tier, with no minimum spend.",
            },
        ],
        faqs: [
            { q: "Can I use both Trackr and Vendr?", a: "Yes — they're complementary. Use Trackr in the evaluation phase to identify the right tool and understand fair pricing. Use Vendr in the procurement phase to negotiate the best contract terms. Together they cover the full lifecycle." },
            { q: "Does Trackr help with contract negotiations?", a: "Trackr provides current pricing intelligence and competitive alternatives that inform negotiations. However, we don't provide human negotiation services. For complex enterprise contracts, a service like Vendr provides the hands-on negotiation support." },
            { q: "Is Trackr cheaper than Vendr?", a: "Yes, significantly. Trackr starts free and Pro plans start at a fraction of Vendr's annual cost. The use cases are different — Trackr is intelligence, Vendr is a managed service." },
        ],
        ctaText: "Start researching free",
    },
    {
        competitor: "spreadsheets",
        competitorName: "Spreadsheets",
        competitorTagline: "Manual tracking in Excel or Google Sheets",
        title: "Trackr vs Spreadsheets — Stop Copying Scores Into Notion | Trackr",
        description: "Manual tool tracking in spreadsheets is slow, inconsistent, and nobody can find the file. Trackr is the purpose-built alternative.",
        headline: "Your SaaS tracker spreadsheet doesn't scale",
        subheadline: "The ops team has a spreadsheet for tracking tools. It has 12 columns, was last updated in Q3, and four people have different versions. There's a better way.",
        switchNarrative: `Every ops team starts with a spreadsheet. It's free, flexible, and everyone knows how to use it. The SaaS inventory lives in a tab of the ops dashboard. Tool evaluations get documented in a shared Google Sheet. Renewal dates go in a calendar.

The problem isn't that spreadsheets can't hold the data. The problem is that spreadsheets require constant manual maintenance to stay useful — and that maintenance never happens consistently. The renewal date cell gets updated when someone remembers. The tool score column uses different scales (some 1–5, some 1–10). The last research was done by someone who left the company. The file URL is buried in a Slack message from 2022.

The deeper problem is that spreadsheets don't generate intelligence. They store whatever you put in them. Trackr researches tools automatically, applies a consistent scoring framework to every evaluation, tracks renewal dates with alerts, and flags stack overlap without you having to build the formulas. The shift isn't from spreadsheets to a fancier spreadsheet — it's from manual data entry to automated intelligence.`,
        featureTable: [
            { feature: "Automatic tool research", trackr: true, competitor: false },
            { feature: "Consistent 7-dimension scoring", trackr: "Automated", competitor: "Manual, inconsistent" },
            { feature: "Renewal alerts", trackr: "60-day automatic alerts", competitor: "Calendar reminders if set" },
            { feature: "Stack overlap detection", trackr: true, competitor: false },
            { feature: "Competitive alternatives", trackr: "In every report", competitor: false },
            { feature: "Team collaboration", trackr: "Workspace with permissions", competitor: "Shared file with version issues" },
            { feature: "Current pricing data", trackr: "AI-researched at generation", competitor: "Manual entry only" },
            { feature: "Time to update", trackr: "2 minutes per tool", competitor: "Hours per evaluation" },
        ],
        advantages: [
            {
                title: "Research happens automatically",
                description: "A spreadsheet stores whatever you put in. Trackr researches tools for you — pulling current pricing, scoring on 7 dimensions, and generating competitive analysis without any manual data entry.",
            },
            {
                title: "One version, always current",
                description: "No more 'which version is the latest?' Trackr maintains a single source of truth for your stack. Every team member sees the same data. Reports can be regenerated instantly when things change.",
            },
            {
                title: "Intelligence you can't build in a spreadsheet",
                description: "Stack overlap detection, renewal risk scoring, AI nativeness analysis, and spend optimization recommendations are outputs Trackr generates automatically. Building those in a spreadsheet requires data you don't have.",
            },
        ],
        faqs: [
            { q: "Can I import my existing spreadsheet into Trackr?", a: "Yes — you can add tools to Trackr manually with their website URLs. For bulk imports, CSV import is available on Pro plans. Trackr then researches each tool automatically." },
            { q: "Do I need to give up my spreadsheet entirely?", a: "No — many teams keep a lightweight spreadsheet for budget planning while using Trackr for the research and intelligence layer. They're not mutually exclusive." },
            { q: "What if a tool isn't in Trackr's library?", a: "Submit the URL and Trackr generates a custom research report in under 2 minutes. You're not limited to the curated library — any tool with a public website can be researched." },
        ],
        ctaText: "Upgrade from spreadsheets",
    },
    {
        competitor: "notion",
        competitorName: "Notion",
        competitorTagline: "Flexible docs and database workspace",
        title: "Trackr vs Notion — AI Research vs Manual Docs | Trackr",
        description: "Notion is a great wiki. It doesn't research tools, generate scores, or flag renewal risk. Trackr does.",
        headline: "Notion stores what you know. Trackr finds what you don't.",
        subheadline: "Teams use Notion to document tool decisions. But Notion doesn't research tools, generate scores, or tell you when you're overpaying. That's what Trackr is for.",
        switchNarrative: `Notion is an excellent knowledge management platform. Many teams use it to document their tech stack — a database of tools with tags, statuses, and notes. It's flexible, collaborative, and most teams already use it.

The limitation isn't Notion. It's what Notion doesn't do. Notion stores the information you put into it. You research a tool, add notes to the database, tag it with categories, and update the status. If the notes are good, the database is useful. If nobody updates it, it's just another outdated doc.

Trackr is designed specifically for the SaaS intelligence problem. It doesn't replace your Notion wiki — it creates the research that should inform what goes into your wiki. Submit a tool URL, get a scored 7-dimension report with current pricing, competitive alternatives, and written justifications. That output can live in Notion if you want. But the research itself happens automatically, consistently, and in 2 minutes instead of 8 hours.`,
        featureTable: [
            { feature: "Automated tool research", trackr: true, competitor: false },
            { feature: "7-dimension scoring", trackr: "AI-generated", competitor: "Manual entry only" },
            { feature: "Current market pricing", trackr: "Live at generation", competitor: "Whatever you typed" },
            { feature: "Competitive analysis", trackr: "In every report", competitor: false },
            { feature: "Stack overlap detection", trackr: true, competitor: false },
            { feature: "Renewal tracking with alerts", trackr: true, competitor: "Manual reminders only" },
            { feature: "Spend analytics", trackr: true, competitor: false },
            { feature: "Flexible documentation", trackr: "Limited", competitor: "Excellent" },
        ],
        advantages: [
            {
                title: "Generates intelligence, not just stores it",
                description: "Notion stores what you tell it. Trackr researches tools automatically and generates scored reports with competitive analysis, pricing intelligence, and stack recommendations. The intelligence comes to you.",
            },
            {
                title: "Built for the SaaS evaluation workflow",
                description: "Trackr's 7-dimension framework, comparison views, stack analysis, and renewal calendar are purpose-built for tool intelligence. Building equivalent functionality in Notion requires significant customization and manual data entry.",
            },
            {
                title: "No maintenance required",
                description: "A Notion tool database requires constant updates to stay current. Trackr reports are generated fresh on demand — the market research is always current, and you never need to update a stale row.",
            },
        ],
        faqs: [
            { q: "Can Trackr and Notion work together?", a: "Yes — many teams use Trackr for research and store key decisions in Notion. Trackr exports reports as PDF and shareable links that can be embedded in Notion pages." },
            { q: "Does Trackr have a Notion integration?", a: "A native Notion integration is on the roadmap. Currently, reports export as shareable URLs and PDF. You can manually paste key findings into your Notion stack database." },
            { q: "We already have a tool database in Notion — should we switch?", a: "You don't need to switch. Use Trackr as the research engine that feeds your Notion database. Run a Trackr report when evaluating a tool, then document the decision and score in Notion." },
        ],
        ctaText: "Add AI research to your workflow",
    },
    {
        competitor: "gartner",
        competitorName: "Gartner Peer Insights",
        competitorTagline: "Enterprise analyst research and peer reviews",
        title: "Trackr vs Gartner Peer Insights — Fast Intelligence for Modern Teams | Trackr",
        description: "Gartner is built for enterprise procurement cycles. Trackr is built for the speed modern ops teams actually operate at.",
        headline: "Gartner is built for enterprise. Trackr is built for speed.",
        subheadline: "Gartner Peer Insights requires a paid subscription, takes weeks, and assumes you're in a formal procurement cycle. Trackr delivers scored intelligence in under 2 minutes.",
        switchNarrative: `Gartner serves a specific buyer: the enterprise IT or procurement leader who is managing a multi-month evaluation cycle, needs analyst validation for a committee, and has the budget for Gartner access. That's a real and valuable use case.

Most modern ops teams, RevOps leaders, and founders don't operate that way. They need to evaluate a tool this week — not in a three-month Magic Quadrant cycle. They need intelligence they can act on, not a 40-page analyst report that was commissioned before the category had AI features.

The intelligence gap Trackr fills is the middle ground: structured, scored research that is fast enough for modern decision timelines, deep enough to be defensible, and current enough to reflect the actual market. Not a formal analyst engagement, and not a Google search — something designed for the speed and rigour that growth-stage teams need.`,
        featureTable: [
            { feature: "Time to first insight", trackr: "2 minutes", competitor: "Days to weeks" },
            { feature: "Current feature data", trackr: "Live at generation", competitor: "Report publication date" },
            { feature: "Pricing", trackr: "Free to start", competitor: "$15K–200K+/year" },
            { feature: "Self-serve access", trackr: true, competitor: false },
            { feature: "AI tool coverage", trackr: "100+ with new tools daily", competitor: "Major vendors only" },
            { feature: "Stack-specific scoring", trackr: true, competitor: false },
            { feature: "Renewal intelligence", trackr: true, competitor: false },
            { feature: "Analyst credibility for board/exec", trackr: "Limited", competitor: "Strong" },
        ],
        advantages: [
            {
                title: "Speed that matches modern decision timelines",
                description: "Gartner is designed for formal procurement cycles that run over months. Trackr is designed for the real-world timeline — you need to evaluate a tool this week, not schedule an analyst briefing.",
            },
            {
                title: "Coverage of the emerging tool landscape",
                description: "Gartner's coverage concentrates on established vendors with enough market presence to justify a Magic Quadrant position. The AI tool landscape moves faster than analyst cycles. Trackr covers new entrants as soon as they have a public website.",
            },
            {
                title: "Accessible to teams without enterprise budgets",
                description: "Gartner access starts in the tens of thousands of dollars annually. Trackr starts free. For growth-stage companies that need intelligence without the enterprise analyst price tag, there's no comparison.",
            },
        ],
        faqs: [
            { q: "Is Trackr a replacement for Gartner?", a: "For enterprise procurement with committee sign-off requirements: no. Gartner's analyst credibility and formal methodology serve that need. For growth-stage teams making fast, defensible tool decisions: Trackr is purpose-built for your context." },
            { q: "How does Trackr's methodology compare to Gartner's?", a: "Gartner uses a proprietary evaluation framework with analyst assessments. Trackr uses an AI-powered 7-dimension framework that scores Core Capability, Ease of Use, Integration Depth, Pricing Value, AI Sophistication, Community & Support, and Scalability. Both produce structured scores; Trackr's updates in real time." },
            { q: "Can I use Trackr data to support an internal business case?", a: "Yes — Trackr's scored reports with written justifications are designed to be shareable and defensible. Export as PDF or share a direct link. The structured format makes internal approval conversations much faster." },
        ],
        ctaText: "Try the faster alternative",
    },
    {
        competitor: "capterra",
        competitorName: "Capterra",
        competitorTagline: "Software review and discovery platform",
        title: "Trackr vs Capterra — AI Research vs Software Reviews | Trackr",
        description: "Capterra aggregates user reviews. Trackr generates AI-powered research reports scored to your stack in under 2 minutes. No incentivized reviews.",
        headline: "Capterra aggregates opinions. Trackr generates intelligence.",
        subheadline: "Capterra is a Gartner-owned review platform that aggregates buyer ratings. Trackr is an AI research engine that scores tools against your requirements — no review mining required.",
        switchNarrative: `Capterra is a widely used starting point for software discovery. You search a category, browse tool listings, filter by ratings, and read user reviews. For early-stage discovery — figuring out which tools even exist in a category — it's useful. For making a final decision, the signal breaks down.

Capterra's reviews share the same structural problems as all review platforms. Vendors actively solicit reviews from satisfied customers. Review campaigns run during onboarding when enthusiasm is highest. Churned customers rarely return to update their ratings. The result: a 4.5-star average that reflects a skewed sample, not a neutral assessment of the product.

Trackr doesn't aggregate what other buyers thought — it researches what the tool looks like today. Live pricing from the vendor's website. Current feature set from documentation. Competitive positioning from recent coverage. A scored 7-dimension report generated in under 2 minutes, with no vendor influence on the output.`,
        featureTable: [
            { feature: "Research methodology", trackr: "AI-generated from live sources", competitor: "Crowd-sourced reviews" },
            { feature: "Current pricing data", trackr: "Live at generation time", competitor: "Self-reported by vendors" },
            { feature: "Consistent scoring framework", trackr: "7-dimension scorecard", competitor: "Star ratings (1–5)" },
            { feature: "Stack-specific evaluation", trackr: true, competitor: false },
            { feature: "Vendor influence on score", trackr: "None — AI-generated", competitor: "High — reviews solicited" },
            { feature: "Private stack tracking", trackr: true, competitor: false },
            { feature: "Renewal intelligence", trackr: true, competitor: false },
            { feature: "Report generation time", trackr: "Under 2 minutes", competitor: "Browse time varies" },
        ],
        advantages: [
            {
                title: "No incentivized reviews",
                description: "Capterra pays users to write reviews and vendors pay to appear prominently. Trackr's AI research pulls from vendor documentation, community discussion, and market data — sources no vendor can pay to influence.",
            },
            {
                title: "Scored against your stack",
                description: "Capterra shows you average ratings from thousands of buyers with different contexts. Trackr scores against the specific dimensions that matter for your evaluation — with written justifications you can verify.",
            },
            {
                title: "Current data, not historical sentiment",
                description: "A Capterra review from 2023 reflects a product that may have shipped 40 major updates since. Trackr generates reports from live data at the time you run them — pricing, features, and competitive position as of today.",
            },
        ],
        faqs: [
            { q: "Should I use Capterra instead of Trackr?", a: "For initial discovery of what tools exist in a category, Capterra is useful. For evaluation and decision-making, Trackr produces more actionable intelligence. Use both: Capterra to build your shortlist, Trackr to evaluate the finalists." },
            { q: "Does Trackr include user reviews?", a: "Trackr's research pipeline incorporates community sentiment from Reddit, TrustRadius, and Capterra as one input into the overall score. But the core output is a structured 7-dimension scored report, not review aggregation." },
            { q: "How accurate is Trackr vs Capterra?", a: "Different types of accuracy. Capterra reflects real user sentiment at scale (with incentive bias). Trackr reflects current market data — pricing, features, positioning. Both have value as different signal types." },
        ],
        ctaText: "Try AI-powered research",
    },
    {
        competitor: "spendflo",
        competitorName: "Spendflo",
        competitorTagline: "SaaS spend management and procurement optimization",
        title: "Trackr vs Spendflo — Pre-Purchase Intelligence vs Spend Management | Trackr",
        description: "Spendflo manages SaaS spend after you've bought. Trackr helps you decide what to buy — and whether to renew — with AI research in 2 minutes.",
        headline: "Spendflo manages spend. Trackr justifies it.",
        subheadline: "Spendflo optimizes your existing SaaS contracts. Trackr tells you whether the tools in those contracts are worth keeping — with scored AI research that takes 2 minutes.",
        switchNarrative: `Spendflo and Trackr operate at different stages of the SaaS lifecycle. Understanding the distinction matters when evaluating your software intelligence stack.

Spendflo is a spend management platform. It tracks what you're paying, identifies unused licenses, benchmarks your contracts against market rates, and surfaces savings opportunities in your existing vendor relationships. Its value is primarily in contract optimization — squeezing more value from the tools you've already committed to.

Trackr is a research intelligence platform. Before you buy, Trackr evaluates the tool — scoring it across 7 dimensions, pulling current pricing intelligence, surfacing competitive alternatives, and identifying stack overlap with tools you already have. Trackr's value is in making better buying decisions upstream, before the contract is signed.

The two are genuinely complementary. Use Trackr to research what to buy. Use Spendflo to optimize what you've bought. Together they cover the full SaaS lifecycle for sophisticated ops functions.`,
        featureTable: [
            { feature: "Pre-purchase tool research", trackr: true, competitor: false },
            { feature: "7-dimension AI scoring", trackr: true, competitor: false },
            { feature: "Spend tracking and optimization", trackr: "Basic tracking", competitor: "Full platform" },
            { feature: "Contract negotiation support", trackr: false, competitor: true },
            { feature: "License utilization tracking", trackr: false, competitor: true },
            { feature: "Competitive alternatives", trackr: "In every report", competitor: false },
            { feature: "Renewal calendar", trackr: true, competitor: true },
            { feature: "Self-serve research", trackr: "2 minutes", competitor: "Not applicable" },
            { feature: "Pricing", trackr: "Free to start", competitor: "$25K+/year" },
        ],
        advantages: [
            {
                title: "Research before the commitment",
                description: "Spendflo helps after you've committed. Trackr helps before — evaluating whether a tool is worth buying, what the right price looks like, and which alternatives might serve the same need for less.",
            },
            {
                title: "Accessible to growth-stage teams",
                description: "Spendflo's model is optimized for companies with $500K+ SaaS spend. Trackr's intelligence layer is useful from your first tool evaluation, on the free tier, with no minimum spend required.",
            },
            {
                title: "Self-serve in 2 minutes",
                description: "Spendflo requires integrating your spend data and working with a human team. Trackr delivers a scored research report in under 2 minutes — no setup, no integration, no waiting.",
            },
        ],
        faqs: [
            { q: "Can I use both Trackr and Spendflo?", a: "Yes — they're genuinely complementary. Use Trackr in the evaluation phase to identify and score tools before purchase. Use Spendflo to optimize contracts and license utilization across your existing stack." },
            { q: "Does Trackr replace spend management tools?", a: "No. Trackr includes basic spend tracking for your stack, but doesn't have the contract management, license utilization tracking, or negotiation support that dedicated spend management tools provide." },
            { q: "Is Trackr cheaper than Spendflo?", a: "Significantly. Trackr starts free and paid plans begin at $50/month. Spendflo typically costs $25K+ annually. Different tools for different problems — Trackr is intelligence, Spendflo is spend management." },
        ],
        ctaText: "Research tools before you buy",
    },
    {
        competitor: "trustradius",
        competitorName: "TrustRadius",
        competitorTagline: "Verified B2B software reviews platform",
        title: "Trackr vs TrustRadius — AI Research vs Peer Reviews | Trackr",
        description: "TrustRadius aggregates verified B2B reviews. Trackr generates AI-powered research reports with current data — no reviewer incentives, no historical bias.",
        headline: "TrustRadius shows what buyers said. Trackr shows what's true now.",
        subheadline: "TrustRadius aggregates verified reviews from real B2B buyers. Trackr researches tools using live data — pricing, features, competitive position — at the time you need to decide.",
        switchNarrative: `TrustRadius differentiates from G2 and Capterra by emphasizing verified reviews — buyers must have real accounts and provide detailed responses to publish. The methodology produces more substantive reviews than incentivized platforms, and the verification adds credibility. For certain buyer segments, particularly mid-market and enterprise, TrustRadius is a legitimate research input.

The fundamental limitation remains: reviews are written by specific buyers about specific experiences at specific points in time. A detailed 2024 review from a 500-person financial services company tells you a great deal about that buyer's experience — but may be largely irrelevant to your context as a 50-person SaaS company in 2026.

Trackr generates research about the current market reality, not the historical buyer experience. Current pricing. Current feature set. Current competitive positioning. Score against a consistent 7-dimension framework that you can apply to every tool you evaluate, regardless of whether other buyers have written detailed reviews.`,
        featureTable: [
            { feature: "Research methodology", trackr: "AI-generated from live sources", competitor: "Verified buyer reviews" },
            { feature: "Current pricing data", trackr: "Live at generation time", competitor: "Self-reported by vendors" },
            { feature: "Consistent scoring framework", trackr: "7-dimension scorecard", competitor: "Category-specific ratings" },
            { feature: "Stack-specific evaluation", trackr: true, competitor: false },
            { feature: "Renewal intelligence", trackr: true, competitor: false },
            { feature: "Private stack tracking", trackr: true, competitor: false },
            { feature: "Report generation time", trackr: "Under 2 minutes", competitor: "Browse time varies" },
            { feature: "Vendor influence on score", trackr: "None", competitor: "Review campaign influence" },
        ],
        advantages: [
            {
                title: "Relevant to your context, not theirs",
                description: "TrustRadius reviews are written by specific buyers about their specific use cases. Trackr scores tools against the current market and your specific requirements — the evaluation is calibrated to your context, not an aggregate of others.",
            },
            {
                title: "Always current",
                description: "A verified review from 2024 reflects a product that may have changed significantly since publication. Trackr generates from live data — the report reflects the product as it exists today, not at the time someone last reviewed it.",
            },
            {
                title: "Covers emerging AI tools",
                description: "TrustRadius coverage requires a critical mass of verified reviewers. New AI tools often don't have that coverage for 12-18 months after launch. Trackr can research any tool with a public website the day it launches.",
            },
        ],
        faqs: [
            { q: "Is TrustRadius more reliable than G2 or Capterra?", a: "TrustRadius's verified review methodology addresses some of the incentive problems with other review platforms. Reviews tend to be more detailed. But the core limitations of historical data and context mismatch still apply." },
            { q: "Does Trackr use TrustRadius data?", a: "Trackr's research pipeline incorporates community sentiment from multiple sources including TrustRadius as one signal in the overall research. The primary output is AI-generated scoring, not review aggregation." },
            { q: "Can I use both?", a: "Yes. TrustRadius is a useful signal for understanding real buyer experiences. Trackr is useful for current market data and consistent scoring. They're different signal types that complement each other." },
        ],
        ctaText: "Get current data, not old reviews",
    },
    {
        competitor: "software-advice",
        competitorName: "Software Advice",
        competitorTagline: "Software recommendation and review platform",
        title: "Trackr vs Software Advice — AI Research vs Advisor Recommendations | Trackr",
        description: "Software Advice uses human advisors and crowd reviews to recommend tools. Trackr uses AI to score any tool in 2 minutes against your specific requirements.",
        headline: "Software Advice recommends tools. Trackr researches them.",
        subheadline: "Software Advice connects buyers with human advisors and aggregates user reviews. Trackr generates scored AI research reports in 2 minutes — no advisor calls, no waiting.",
        switchNarrative: `Software Advice occupies an interesting position in the SaaS research landscape. It combines two models: a Gartner-owned review aggregation platform (similar to Capterra and G2, also Gartner properties) and a free phone advisory service where buyers speak with human advisors to get shortlist recommendations.

The advisory service is genuinely useful for buyers who don't know a software category at all and want a guided starting point. The advisor call produces a shortlist. The reviews provide additional context. For total beginners to a category, this is a reasonable path.

The limitations are familiar: advisor recommendations are influenced by vendor relationships and pay-to-play placement. Reviews share the same incentive bias as other Gartner review properties. The evaluation framework isn't consistent across categories or tools. And neither the advisor nor the reviews tell you how the tool scores against your specific use case — they give you a generic recommendation, not a tailored evaluation.

Trackr generates a scored 7-dimension report against your requirements in 2 minutes. No advisor call, no waiting, no generic recommendation. A structured research output you can act on immediately.`,
        featureTable: [
            { feature: "Time to first insight", trackr: "2 minutes self-serve", competitor: "Schedule advisor call" },
            { feature: "Consistent scoring framework", trackr: "7-dimension AI scorecard", competitor: "Star ratings only" },
            { feature: "Stack-specific evaluation", trackr: true, competitor: false },
            { feature: "Vendor influence", trackr: "None — AI-generated", competitor: "Pay-to-appear placement" },
            { feature: "Emerging tool coverage", trackr: "Any tool, any day", competitor: "Established vendors only" },
            { feature: "Private stack tracking", trackr: true, competitor: false },
            { feature: "Renewal intelligence", trackr: true, competitor: false },
            { feature: "Pricing", trackr: "Free to start", competitor: "Free (vendor-funded)" },
        ],
        advantages: [
            {
                title: "Self-serve in 2 minutes, no advisor call needed",
                description: "Software Advice's value requires scheduling time with an advisor and waiting for recommendations. Trackr delivers a complete scored report in under 2 minutes, any time, without speaking to anyone.",
            },
            {
                title: "No pay-to-play bias",
                description: "Software Advice's recommendations are influenced by which vendors pay for premium placement. Trackr's AI research produces scores based on actual product data — no vendor can buy a higher position in our reports.",
            },
            {
                title: "Covers your specific requirements",
                description: "An advisor recommendation is generic — built for the average buyer. Trackr scores tools against your company's specific dimensions, weights, and stack context. The evaluation is tailored, not generic.",
            },
        ],
        faqs: [
            { q: "Is Software Advice free?", a: "Yes — Software Advice is free to buyers and funded by vendor placement fees. This creates incentive to recommend vendors who pay more. Trackr is also free to start, funded by user subscriptions rather than vendor placement." },
            { q: "When should I use a human advisor vs Trackr?", a: "If you're completely new to a software category and don't know what tools exist, a brief advisor call can help you orient. Once you have a shortlist, Trackr produces faster, more consistent evaluation intelligence than advisor recommendations." },
            { q: "Does Software Advice work for new AI tools?", a: "Software Advice's coverage concentrates on established vendors with enough buyer volume to generate reviews. New AI tools often lack coverage. Trackr can research any tool with a public website the day it launches." },
        ],
        ctaText: "Research any tool in 2 minutes",
    },
    {
        competitor: "chatgpt",
        competitorName: "ChatGPT / AI assistants",
        competitorTagline: "General-purpose AI assistant for manual research",
        title: "Trackr vs ChatGPT for SaaS Research — Structured Intelligence vs Ad-hoc AI | Trackr",
        description: "ChatGPT can research tools, but gives inconsistent answers with training cutoffs. Trackr uses live web research and a consistent 7-dimension framework for every tool.",
        headline: "ChatGPT gives opinions. Trackr gives scored reports.",
        subheadline: "You can ask ChatGPT to research a SaaS tool. But you'll get a different answer every time, with a training data cutoff, and no consistent scoring framework. Trackr fixes all three.",
        switchNarrative: `Using ChatGPT or Claude to research SaaS tools is a natural first instinct — these models know a lot about many products, can synthesize information, and produce readable summaries. For a quick gut-check on a well-known tool, it's a reasonable starting point.

The problem shows up when you need to make a real decision. First, general AI assistants have training data cutoffs. The pricing they cite may be months or years out of date. A tool that recently launched an AI tier or changed its pricing model entirely may not be reflected. Trackr uses live web research agents that scrape vendor sites at the time you submit — the data is current.

Second, general AI assistants give inconsistent answers. Ask about the same tool twice and you'll get meaningfully different summaries. There's no consistent framework — the dimensions evaluated vary, the scoring doesn't exist, the output isn't comparable across tools. Trackr applies the same 7-dimension scorecard to every tool, making comparison meaningful.

Third, general AI assistants don't maintain your stack context. Each conversation starts fresh. Trackr tracks your full stack, knows what you already use, and flags overlap, gaps, and renewal risk across your portfolio. ChatGPT helps you research one tool at a time. Trackr helps you manage your entire stack.`,
        featureTable: [
            { feature: "Live pricing data", trackr: "Scraped at generation time", competitor: "Training data cutoff" },
            { feature: "Consistent scoring framework", trackr: "7 dimensions, every tool", competitor: "No framework — varies by prompt" },
            { feature: "Stack tracking", trackr: true, competitor: false },
            { feature: "Renewal management", trackr: true, competitor: false },
            { feature: "Comparable results across tools", trackr: "Always consistent", competitor: "Inconsistent by design" },
            { feature: "Spend tracking", trackr: true, competitor: false },
            { feature: "Shareable reports", trackr: "Permanent URLs + PDF", competitor: "Copy-paste only" },
            { feature: "Research history", trackr: "Stored per tool", competitor: "Conversation-based, not persistent" },
        ],
        advantages: [
            {
                title: "Live data, not training cutoffs",
                description: "ChatGPT's knowledge cuts off at training time. Trackr's research agents scrape vendor sites, documentation, and community sources at the time you submit. Pricing, features, and competitive position reflect today's market.",
            },
            {
                title: "Consistent framework across every evaluation",
                description: "ChatGPT produces different summaries depending on how you phrase the prompt. Trackr applies the same 7-dimension scorecard to every tool — Core Capability, Ease of Use, Integration Depth, Pricing Value, AI Sophistication, Community & Support, Scalability — making comparisons meaningful.",
            },
            {
                title: "Persistent stack intelligence",
                description: "ChatGPT starts fresh each conversation. Trackr maintains your full stack context — tracking every tool you've researched, monitoring renewals, flagging overlap, and building an intelligence layer over time that gets more valuable as you add more tools.",
            },
        ],
        faqs: [
            { q: "Can't I just use ChatGPT to research tools?", a: "For a quick first pass on a well-known tool, yes. For consistent, current, stack-aware intelligence across your entire evaluation process, no — the output is inconsistent, the data may be outdated, and there's no persistent stack context." },
            { q: "Does Trackr use AI?", a: "Yes — Trackr's research pipeline uses multiple AI agents (GPT-4o, Perplexity) plus live web research (Firecrawl, Tavily) to generate reports. The key differences are the consistent scoring framework, live data sourcing, and persistent stack tracking." },
            { q: "Is Trackr more accurate than ChatGPT for tool research?", a: "For current pricing and features: yes, because Trackr uses live web research rather than training data. For general product knowledge about established tools: roughly comparable. The bigger advantage is consistency — Trackr always uses the same framework." },
        ],
        ctaText: "Get structured research, not ad-hoc answers",
    },
];

export const VS_COMPETITORS = VS_PAGES.map((p) => p.competitor);
