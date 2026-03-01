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
    {
        competitor: "zylo",
        competitorName: "Zylo",
        competitorTagline: "Enterprise SaaS management platform",
        title: "Trackr vs Zylo — AI Tool Intelligence vs SaaS Management | Trackr",
        description: "Zylo costs $30K+/year and requires a dedicated implementation. Trackr gives your team AI-powered tool research and stack intelligence, free to start, in 2 minutes.",
        headline: "Zylo is enterprise SaaS management. Trackr is AI tool intelligence.",
        subheadline: "Zylo discovers shadow IT and manages licenses. Trackr researches, scores, and helps you decide what to buy — before the license exists.",
        switchNarrative: `Zylo and Trackr occupy different parts of the SaaS management lifecycle. Understanding which you need — and when — matters before you invest in either.

Zylo is a discovery and governance platform. It connects to your financial systems, scans credit card statements, identifies shadow SaaS usage, and gives IT and finance a consolidated view of what's being paid for. Its core value is visibility into existing spend. For enterprises with hundreds of untracked subscriptions, that visibility can pay for itself in the first quarter.

Trackr is a pre-purchase intelligence layer. Before you decide to add a tool to your stack, Trackr researches it — scoring it across 7 dimensions, surfacing alternatives, and giving your team a consistent evaluation framework. Trackr also tracks your known stack, monitors renewals, and helps you understand the AI nativeness of each tool relative to modern alternatives.

The gap Zylo doesn't fill is evaluation quality. Knowing you're paying for 80 tools is the first step. Understanding which 40 are worth keeping, which 15 have better alternatives, and what new tools are worth adding — that's the Trackr layer. Many mature procurement functions use both: Zylo for the financial governance layer, Trackr for the evaluation intelligence layer.`,
        featureTable: [
            { feature: "AI tool research (2-minute reports)", trackr: true, competitor: false },
            { feature: "Shadow SaaS discovery", trackr: false, competitor: true },
            { feature: "7-dimension scoring framework", trackr: true, competitor: false },
            { feature: "Spend tracking", trackr: "Manual entry", competitor: "Auto-discovered" },
            { feature: "Renewal calendar", trackr: true, competitor: true },
            { feature: "Competitive alternatives", trackr: "In every report", competitor: false },
            { feature: "Stack overlap detection", trackr: true, competitor: "Partial" },
            { feature: "Self-serve setup", trackr: "Minutes", competitor: "Weeks (implementation required)" },
            { feature: "Starting price", trackr: "Free", competitor: "$30K+/year" },
        ],
        advantages: [
            {
                title: "Free to start, no implementation required",
                description: "Zylo requires a dedicated implementation engagement and enterprise contract. Trackr is free to start — submit your first tool URL and get a full research report in under 2 minutes.",
            },
            {
                title: "Research intelligence before you buy",
                description: "Zylo helps you manage what you already have. Trackr helps you decide what to get — with AI-powered research, scoring, and competitive analysis before the purchase decision is made.",
            },
            {
                title: "The evaluation layer Zylo doesn't provide",
                description: "Zylo tells you what tools exist in your stack and what they cost. Trackr tells you whether they're the right tools — with scored reports, pros/cons, and specific recommendations for improvement.",
            },
        ],
        faqs: [
            { q: "Can Trackr replace Zylo?", a: "For most mid-market companies: yes. Zylo's core value is shadow SaaS discovery, which matters most at 500+ employees with complex procurement. For teams under that size, Trackr's manual spend tracking plus AI research intelligence covers the critical use cases without the enterprise price tag." },
            { q: "Does Trackr integrate with financial systems?", a: "Not directly — Trackr uses manually-entered spend data. For teams that need automated financial reconciliation, a dedicated SaaS management platform may add value alongside Trackr." },
            { q: "What size company should use Trackr vs Zylo?", a: "Trackr is purpose-built for teams of 10–500 evaluating and managing their AI and SaaS stack. Zylo is designed for enterprises (500+) with significant shadow IT and complex procurement workflows." },
        ],
        ctaText: "Try Trackr free — no implementation required",
    },
    {
        competitor: "torii",
        competitorName: "Torii",
        competitorTagline: "SaaS operations management platform",
        title: "Trackr vs Torii — AI Research vs SaaS Operations | Trackr",
        description: "Torii automates SaaS operations and license management. Trackr gives your team the intelligence layer to decide what belongs in your stack in the first place.",
        headline: "Torii manages your stack. Trackr helps you build the right one.",
        subheadline: "Torii is an operations platform for managing existing SaaS. Trackr is the intelligence layer for deciding what to buy — with AI research in 2 minutes and scored 7-dimension reports.",
        switchNarrative: `Torii is a SaaS operations platform focused on automation, employee onboarding/offboarding, and license lifecycle management. It connects to your identity provider (Okta, Azure AD), discovers app usage, and automates the provisioning and deprovisioning of licenses at scale.

The core job Torii does is operational: routing license requests, enforcing policies, and reducing manual IT workload on software provisioning. For IT teams drowning in manual access requests, it delivers real operational leverage.

What Torii doesn't provide is evaluation intelligence. When a new tool request comes in, Torii manages the workflow. Trackr tells you whether the tool is worth approving — with current market research, a scored evaluation, competitive alternatives, and specific recommendations tied to your existing stack.

Teams using Torii for operational automation often still rely on scattered Google Docs or Notion pages for the evaluation side. Trackr fills that gap: a consistent, AI-powered evaluation layer that produces the same quality of analysis whether the requester is an engineer submitting a dev tool or a marketer requesting a content platform.`,
        featureTable: [
            { feature: "AI-powered tool research", trackr: true, competitor: false },
            { feature: "License lifecycle automation", trackr: false, competitor: true },
            { feature: "Employee onboarding/offboarding", trackr: false, competitor: true },
            { feature: "7-dimension scoring", trackr: true, competitor: false },
            { feature: "Competitive alternatives in reports", trackr: true, competitor: false },
            { feature: "Spend tracking", trackr: "Manual", competitor: "Automated" },
            { feature: "Renewal alerts", trackr: true, competitor: true },
            { feature: "Tool evaluation framework", trackr: "Structured scorecard", competitor: false },
            { feature: "Pricing transparency", trackr: "Free to start", competitor: "Request pricing" },
        ],
        advantages: [
            {
                title: "Evaluation intelligence, not just workflow routing",
                description: "Torii routes tool requests through a workflow. Trackr answers the harder question: is this tool actually the right choice? Every Trackr report includes a scored evaluation, pros/cons, and competitive alternatives.",
            },
            {
                title: "No identity provider integration required",
                description: "Torii requires Okta, Azure AD, or similar. Trackr works independently — submit any tool URL and get a research report immediately, no integrations needed.",
            },
            {
                title: "Built for the evaluation stage",
                description: "Torii is purpose-built for post-purchase operations. Trackr is purpose-built for the evaluation stage — and maintains context across your full stack as it evolves.",
            },
        ],
        faqs: [
            { q: "Can Trackr and Torii be used together?", a: "Yes — and it's a natural pairing. Use Trackr to evaluate whether a tool should be approved. Use Torii to manage the provisioning workflow after approval. The two cover different stages of the tool lifecycle." },
            { q: "Does Trackr automate software provisioning?", a: "No — Trackr focuses on research and intelligence, not provisioning automation. If your team needs automated license management, onboarding workflows, and SSO-based app discovery, Torii is designed for that." },
            { q: "Is Torii a Trackr competitor?", a: "Indirect. They serve different stages of the SaaS lifecycle. Trackr covers the evaluation and intelligence layer. Torii covers the operational layer. The two are more complementary than competitive for mature IT teams." },
        ],
        ctaText: "Research tools before you provision them",
    },
    {
        competitor: "productiv",
        competitorName: "Productiv",
        competitorTagline: "SaaS intelligence and engagement platform",
        title: "Trackr vs Productiv — AI Tool Research vs SaaS Engagement Analytics | Trackr",
        description: "Productiv measures how employees actually use SaaS tools. Trackr helps you decide which tools are worth buying and keeping — with AI research and scoring in 2 minutes.",
        headline: "Productiv measures usage. Trackr evaluates value.",
        subheadline: "Productiv shows you engagement data on tools you already have. Trackr helps you decide which tools to add, renew, or replace — with AI-powered research and 7-dimension scoring.",
        switchNarrative: `Productiv is a SaaS engagement analytics platform. It integrates with your SSO provider, measures how employees actually use each tool (login frequency, feature adoption, active users), and surfaces underutilized software. For enterprises making renewal decisions based on actual usage data, it provides signal that spreadsheets can't.

The core question Productiv answers is: "How much is this tool actually being used?" That's valuable. Renewal decisions made with real engagement data are better than those made on gut feel or account manager claims.

What Productiv doesn't answer is: "Is this the right tool — and what are the alternatives?" That's Trackr's domain. Before a renewal decision, Trackr can research the current market, score the incumbent tool across 7 dimensions, identify whether better alternatives exist, and give your team a defensible recommendation. Productiv tells you the utilization. Trackr tells you whether the utilization is going into the right tool.

For teams with the budget for both: Productiv surfaces that Tool X has 15% active user engagement. Trackr tells you whether you should replace Tool X with a better-scoring alternative, what that alternative costs, and what the migration considerations are.`,
        featureTable: [
            { feature: "AI tool evaluation reports", trackr: true, competitor: false },
            { feature: "SaaS usage/engagement analytics", trackr: false, competitor: true },
            { feature: "7-dimension scoring", trackr: true, competitor: false },
            { feature: "Competitive alternatives", trackr: "In every report", competitor: false },
            { feature: "Feature adoption tracking", trackr: false, competitor: true },
            { feature: "Renewal recommendations", trackr: "Research-backed", competitor: "Usage-backed" },
            { feature: "Stack spend tracking", trackr: true, competitor: true },
            { feature: "Self-serve start", trackr: "Free, instant", competitor: "Enterprise contract" },
        ],
        advantages: [
            {
                title: "Research-backed renewal decisions",
                description: "Productiv tells you engagement is low. Trackr tells you what to do about it — with current market research on alternatives, scored comparisons, and specific migration recommendations.",
            },
            {
                title: "Pre-purchase intelligence",
                description: "Productiv only works on tools you already have access to. Trackr researches tools before you buy them — giving you scoring, competitive context, and recommendations before the purchase decision.",
            },
            {
                title: "Accessible to teams of any size",
                description: "Productiv requires enterprise SSO integration and contract pricing. Trackr is free to start and designed for teams evaluating and tracking 10–500 tools without enterprise procurement overhead.",
            },
        ],
        faqs: [
            { q: "Should I use Trackr instead of Productiv?", a: "Depends on your primary problem. If you need engagement analytics on existing tools, Productiv provides depth Trackr doesn't. If you need AI-powered research intelligence for evaluating and deciding on tools, Trackr is purpose-built for that. Many teams benefit from both." },
            { q: "Can Trackr measure tool adoption?", a: "Trackr tracks which tools are in your stack and their renewal dates, but doesn't measure employee usage depth. For adoption analytics, a dedicated platform like Productiv provides more granular engagement data." },
        ],
        ctaText: "Add research intelligence to your renewal process",
    },
    {
        competitor: "sastrify",
        competitorName: "Sastrify",
        competitorTagline: "SaaS procurement and optimization platform",
        title: "Trackr vs Sastrify — AI Tool Research vs SaaS Procurement | Trackr",
        description: "Sastrify handles SaaS procurement and negotiation. Trackr gives your team the research intelligence to decide what to buy — with AI-powered scoring in 2 minutes.",
        headline: "Sastrify optimizes what you buy. Trackr helps you decide what to buy.",
        subheadline: "Sastrify is a procurement platform that reduces SaaS costs through negotiation and benchmarking. Trackr is the AI intelligence layer for evaluating whether you're buying the right tools.",
        switchNarrative: `Sastrify is a SaaS procurement optimization platform popular in Europe. It provides visibility into your SaaS spend, benchmarks your contract prices against market rates, and supports negotiation through their procurement team and data. Like Vendr, its core value is downstream — after the buying decision is made.

The gap in Sastrify's offering is pre-purchase evaluation intelligence. Sastrify can tell you whether you're paying a fair price for your CRM. Trackr can tell you whether you have the right CRM — and if not, what the current best alternatives are and why.

For growing companies in Europe where Sastrify is most commonly deployed, Trackr complements the procurement function by providing the research depth that procurement teams typically lack. A procurement analyst can use Trackr to generate a scored evaluation of any tool in 2 minutes — producing the kind of structured analysis that used to require hours of vendor research.`,
        featureTable: [
            { feature: "AI-powered tool research", trackr: true, competitor: false },
            { feature: "Contract price benchmarking", trackr: false, competitor: true },
            { feature: "SaaS negotiation support", trackr: false, competitor: true },
            { feature: "7-dimension scoring", trackr: true, competitor: false },
            { feature: "Competitive alternatives", trackr: "In every report", competitor: false },
            { feature: "Spend visibility", trackr: "Manual entry", competitor: "Automated discovery" },
            { feature: "Renewal management", trackr: true, competitor: true },
            { feature: "Self-serve, no contract needed", trackr: true, competitor: false },
        ],
        advantages: [
            { title: "Intelligence before procurement", description: "Sastrify optimizes contracts after you've decided to buy. Trackr helps you decide whether to buy — and whether the tool you're evaluating is actually the best option in the category." },
            { title: "Free to start with no sales process", description: "Sastrify requires a sales engagement and contract. Trackr is free to start — first tool researched in under 2 minutes, no procurement process required." },
            { title: "Consistent evaluation across all categories", description: "Trackr applies the same 7-dimension framework to every tool — from CRM to design to developer tooling — so your team has consistent intelligence regardless of category." },
        ],
        faqs: [
            { q: "Can Trackr replace Sastrify?", a: "For the procurement optimization piece (price benchmarking, negotiation): no. Sastrify has specialized data and a team for that. For pre-purchase evaluation intelligence and stack tracking: yes — Trackr provides more depth on the research side." },
            { q: "Is Sastrify available outside Europe?", a: "Sastrify serves European markets primarily. Trackr is available globally with no regional restrictions." },
        ],
        ctaText: "Research tools before procurement begins",
    },
    {
        competitor: "zluri",
        competitorName: "Zluri",
        competitorTagline: "SaaS management and automation platform",
        title: "Trackr vs Zluri — AI Tool Intelligence vs SaaS Operations | Trackr",
        description: "Zluri manages SaaS access, provisioning, and spend. Trackr gives your team AI-powered tool research and scoring — free to start, 2-minute reports.",
        headline: "Zluri runs your SaaS operations. Trackr builds your SaaS intelligence.",
        subheadline: "Zluri automates app provisioning, access management, and license renewals. Trackr gives your team the research and scoring intelligence to make better tool decisions before they become operational problems.",
        switchNarrative: `Zluri is a SaaS management platform with strong automation capabilities: app discovery via SSO, automated onboarding/offboarding workflows, and spend tracking. Like similar platforms, it focuses on the operational layer — managing what's already in your stack.

The evaluation question — should this tool be in the stack at all, and is it the best option in its category — is the problem Trackr solves. Before a tool becomes a line item in Zluri, someone has to decide it's worth buying. Trackr provides that decision-support layer with AI-powered research, consistent scoring, and competitive analysis.

For teams growing quickly and adding tools faster than they can evaluate them, Trackr's structured research pipeline reduces the evaluation burden. Submit a URL, get a 7-dimension report with pros, cons, and alternatives in under 2 minutes. That report can then inform the Zluri provisioning decision — whether to approve, delay, or recommend an alternative.`,
        featureTable: [
            { feature: "AI-powered tool research reports", trackr: true, competitor: false },
            { feature: "SSO-based app discovery", trackr: false, competitor: true },
            { feature: "Automated provisioning workflows", trackr: false, competitor: true },
            { feature: "7-dimension scoring", trackr: true, competitor: false },
            { feature: "Competitive tool alternatives", trackr: true, competitor: false },
            { feature: "Spend tracking", trackr: "Manual", competitor: "Automated" },
            { feature: "Works without identity provider", trackr: true, competitor: "Limited" },
            { feature: "Free tier", trackr: true, competitor: false },
        ],
        advantages: [
            { title: "No SSO integration required", description: "Zluri's core discovery relies on SSO/IdP integration. Trackr works immediately — submit any tool URL and get a complete research report, no integrations needed." },
            { title: "Evaluation before provisioning", description: "Zluri manages the provisioning workflow. Trackr gives you the intelligence to decide whether to provision at all — with current market data, competitive analysis, and a scored recommendation." },
            { title: "Research any tool in any category", description: "Trackr's AI agents research tools across every category — from sales to security to analytics — with consistent scoring regardless of how obscure the tool is." },
        ],
        faqs: [
            { q: "Do Trackr and Zluri serve the same market?", a: "Overlapping but different. Both target SaaS-heavy teams. Zluri focuses on IT/operations teams managing access and provisioning. Trackr focuses on the evaluation and intelligence layer — helping any team member research, score, and track tools." },
            { q: "Can I use both Zluri and Trackr?", a: "Yes — they complement each other well. Use Trackr to evaluate whether a tool should be added. Use Zluri to manage the provisioning and lifecycle after it's approved." },
        ],
        ctaText: "Research tools before you provision them",
    },
    {
        competitor: "perplexity",
        competitorName: "Perplexity",
        competitorTagline: "AI-powered search engine and research assistant",
        title: "Trackr vs Perplexity — Structured Tool Research vs AI Search | Trackr",
        description: "Perplexity answers general research questions. Trackr delivers structured, scored tool evaluations — same framework every time, with persistent stack intelligence.",
        headline: "Perplexity searches the web. Trackr evaluates your stack.",
        subheadline: "Perplexity is a general-purpose AI search engine. Trackr is purpose-built for SaaS tool evaluation — delivering consistent 7-dimension scorecards with competitive analysis, pricing intelligence, and stack tracking.",
        switchNarrative: `Perplexity is a powerful general-purpose research tool. For broad questions about a software category or a quick overview of a tool's positioning, it's genuinely useful — and faster than Google for synthesis tasks. Many ops and IT teams use it as a starting point for tool research.

The limitations appear when you try to use Perplexity for systematic tool evaluation. First, the output format varies by prompt — you'll get a different structure, depth, and focus depending on how you phrase the question. Making consistent comparisons across 10 tools evaluated at different times by different team members is nearly impossible.

Second, Perplexity lacks stack context. It doesn't know which tools your team already uses, what your scoring priorities are, or what alternatives are most relevant to your specific situation. Every query starts from zero.

Third, Perplexity is a point-in-time answer engine, not a persistent intelligence layer. Trackr maintains your full stack — tracking what you've researched, when tools were last updated, upcoming renewals, and spend. The stack gets more valuable over time.

For teams that currently use Perplexity for tool research, Trackr provides the structured output layer: consistent scoring, persistent history, and team collaboration features that general AI search engines aren't designed to provide.`,
        featureTable: [
            { feature: "Consistent 7-dimension scoring", trackr: true, competitor: false },
            { feature: "Purpose-built for tool evaluation", trackr: true, competitor: false },
            { feature: "General research questions", trackr: false, competitor: true },
            { feature: "Persistent stack history", trackr: true, competitor: false },
            { feature: "Team collaboration on reports", trackr: true, competitor: false },
            { feature: "Renewal tracking", trackr: true, competitor: false },
            { feature: "Spend tracking", trackr: true, competitor: false },
            { feature: "Structured report output", trackr: "Always", competitor: "Varies by prompt" },
        ],
        advantages: [
            { title: "Consistent output every time", description: "Perplexity produces different formats depending on how you prompt it. Trackr always delivers the same 7-dimension structure — so reports from 3 months ago are directly comparable to reports generated today." },
            { title: "Persistent stack intelligence", description: "Perplexity has no memory of your stack. Trackr tracks every tool you've researched, monitors renewals, flags overlap, and builds an intelligence layer that compounds over time." },
            { title: "Built for team evaluation workflows", description: "Perplexity is a single-user research tool. Trackr supports team workspaces — shared reports, collaborative notes, multi-member evaluation workflows, and shared stack tracking." },
        ],
        faqs: [
            { q: "Should I use Trackr instead of Perplexity?", a: "For systematic tool evaluation: yes. Trackr provides structure, consistency, and persistence that Perplexity can't. For general research questions, market overviews, or broad category research: Perplexity is still excellent. Use both — Perplexity for exploration, Trackr for evaluation." },
            { q: "Does Trackr use Perplexity under the hood?", a: "Trackr's research pipeline optionally uses Perplexity's sonar-reasoning-pro model as one of several research agents. The output is combined with Firecrawl web scraping, Tavily search, and GPT-4o synthesis to produce the final scored report." },
        ],
        ctaText: "Get structured research, not search results",
    },
    {
        competitor: "hubspot",
        competitorName: "HubSpot",
        competitorTagline: "CRM, marketing, and sales platform",
        title: "Trackr for HubSpot Research — Evaluate HubSpot Before You Buy | Trackr",
        description: "Evaluating HubSpot for your team? Trackr researches HubSpot in 2 minutes — scoring it across 7 dimensions with pricing, pros/cons, and alternatives like Salesforce, Attio, and Pipedrive.",
        headline: "Evaluating HubSpot? Get a scored report in 2 minutes.",
        subheadline: "Trackr's AI agents scrape HubSpot's current pricing, pull reviews from G2 and Reddit, analyze Salesforce and Attio as alternatives, and deliver a 7-dimension scored report — without a single vendor call.",
        switchNarrative: `HubSpot is one of the most-evaluated tools in the market. Sales teams, marketing teams, and RevOps leaders evaluate it constantly — and it's a difficult purchase to get wrong. The contract is significant, the migration cost is high, and the alternative landscape (Salesforce, Pipedrive, Attio, Close, Apollo) changes year over year.

The problem with evaluating HubSpot the traditional way is the process itself. You schedule a demo. An account executive gives you the optimistic version. You read G2 reviews of varying vintage and relevance. Someone in a Slack community shares their experience from three years ago. You build a spreadsheet that falls apart when compared across vendors.

Trackr replaces that process with a 2-minute AI research report. Submit HubSpot's URL and Trackr's agents pull current pricing across all tiers, surface community feedback from Reddit and TrustRadius, identify the strongest alternatives for your use case, and score HubSpot across 7 dimensions — all without a vendor call.

The result is a scored evaluation your team can align on, compare against Salesforce or Attio with one more submission, and revisit at renewal time without starting the research process from scratch.`,
        featureTable: [
            { feature: "Current HubSpot pricing analysis", trackr: true, competitor: "Self-reported" },
            { feature: "Independent scoring (not vendor-influenced)", trackr: true, competitor: false },
            { feature: "Competitive alternatives identified", trackr: true, competitor: false },
            { feature: "Community sentiment (Reddit/G2/TrustRadius)", trackr: true, competitor: false },
            { feature: "Comparison with Salesforce/Attio", trackr: "One click", competitor: "Hours of research" },
            { feature: "Renewal reminders", trackr: true, competitor: false },
            { feature: "Team collaboration on evaluation", trackr: true, competitor: false },
            { feature: "Cost: evaluation", trackr: "Free", competitor: "6–8 hours of research" },
        ],
        advantages: [
            { title: "No vendor call required", description: "HubSpot's sales process is designed to gather information and create urgency. Trackr lets you complete a full evaluation independently — current pricing, feature analysis, and competitive comparison — without engaging the sales team until you're ready." },
            { title: "Compare HubSpot vs alternatives in minutes", description: "Submit HubSpot, Salesforce, and Attio to Trackr. Get three scored reports in under 10 minutes. Compare them side-by-side with Trackr's compare feature to make a defensible recommendation." },
            { title: "Revisit at renewal with current data", description: "HubSpot's pricing and features change. Trackr re-researches your tools on schedule — weekly, bi-weekly, or monthly — so your team has current intelligence at renewal time, not a report from when you first evaluated." },
        ],
        faqs: [
            { q: "Can Trackr replace a HubSpot demo?", a: "For initial research and scoring: yes. Trackr's report covers pricing, features, pros/cons, and alternatives. For hands-on testing and custom configuration discussions, a demo still has value — but Trackr lets you go into that demo informed rather than starting from zero." },
            { q: "Does Trackr evaluate HubSpot's competitors too?", a: "Yes — Trackr researches any tool you submit. Submit Salesforce, Attio, Pipedrive, and Close alongside HubSpot to get scored comparisons across the same 7-dimension framework." },
            { q: "Is Trackr affiliated with HubSpot?", a: "No — Trackr is an independent AI research tool. Reports are generated by AI agents pulling public data, not by HubSpot's team or marketing materials." },
        ],
        ctaText: "Research HubSpot in 2 minutes",
    },
    {
        competitor: "salesforce",
        competitorName: "Salesforce",
        competitorTagline: "Enterprise CRM and cloud platform",
        title: "Trackr for Salesforce Research — Evaluate Salesforce Before You Buy | Trackr",
        description: "Evaluating Salesforce? Trackr generates a scored 7-dimension report in 2 minutes — current pricing, pros/cons, and alternatives like HubSpot, Attio, and Pipedrive.",
        headline: "Evaluating Salesforce? Get a scored report before the first demo.",
        subheadline: "Trackr researches Salesforce's current pricing across editions, surfaces independent community feedback, identifies alternatives like HubSpot and Attio, and delivers a 7-dimension scorecard — in 2 minutes, no vendor contact required.",
        switchNarrative: `Salesforce is the most expensive wrong answer in enterprise software. When an org commits to Salesforce, they're committing to a multi-year implementation, significant admin overhead, and a contract that typically grows year over year. Getting the evaluation right the first time matters.

The traditional Salesforce evaluation process is compromised by the same dynamics that affect most enterprise software decisions: you're relying on a highly incentivized sales team for most of your information. By the time you've completed three demos and received a custom proposal, you're in negotiation mode, not evaluation mode.

Trackr changes the timeline. In 2 minutes, you have an independent assessment of Salesforce: current pricing across Essentials, Professional, Enterprise, and Unlimited tiers, community feedback from Reddit and TrustRadius that reflects what Salesforce customers actually experience, alternatives like HubSpot (simpler and faster to implement), Attio (modern and developer-friendly), and Pipedrive (more affordable for SMB), and a scored comparison across 7 dimensions.

That foundation lets your team enter the Salesforce sales process with clarity about what you're evaluating and why — rather than being shaped by the evaluation by your account executive.`,
        featureTable: [
            { feature: "Independent Salesforce pricing research", trackr: true, competitor: "Self-reported" },
            { feature: "Community feedback (Reddit/G2/TrustRadius)", trackr: true, competitor: false },
            { feature: "Alternatives compared (HubSpot, Attio, Pipedrive)", trackr: true, competitor: false },
            { feature: "7-dimension scoring", trackr: true, competitor: false },
            { feature: "Implementation cost context", trackr: "In research report", competitor: false },
            { feature: "Side-by-side comparison with HubSpot", trackr: "Instant", competitor: "Weeks" },
            { feature: "Renewal tracking", trackr: true, competitor: false },
            { feature: "Evaluation cost", trackr: "Free (2 minutes)", competitor: "20+ hours of research" },
        ],
        advantages: [
            { title: "Enter the sales process informed", description: "Most Salesforce evaluations start with a demo. Trackr lets you research Salesforce independently first — understanding pricing, limitations, and alternatives before you engage the account team." },
            { title: "Compare Salesforce vs HubSpot in 10 minutes", description: "Submit both to Trackr. Get scored reports on the same 7-dimension framework. Compare implementation complexity, pricing value, integration depth, and AI sophistication side-by-side before committing to either sales process." },
            { title: "Re-evaluate at every renewal", description: "Salesforce contracts typically auto-renew with price increases. Trackr monitors your renewal dates and can re-research the current market at any cadence — so you always have current intelligence before the negotiation window opens." },
        ],
        faqs: [
            { q: "Can Trackr tell me if Salesforce is right for my company?", a: "Trackr generates an independent scored evaluation with current market data. The report covers pricing, feature depth, community feedback, and competitive alternatives — giving your team the information to make that judgment. Whether Salesforce is right depends on your specific requirements, which your team is best positioned to evaluate." },
            { q: "Does Trackr research Salesforce implementation partners?", a: "Trackr researches the Salesforce product itself — pricing, features, community feedback, and competitive alternatives. Implementation partner research requires a different evaluation framework not currently in Trackr's pipeline." },
        ],
        ctaText: "Research Salesforce independently in 2 minutes",
    },
    {
        competitor: "gong",
        competitorName: "Gong",
        competitorTagline: "Revenue intelligence and conversation analytics platform",
        title: "Trackr for Gong Research — Evaluate Gong Before You Buy | Trackr",
        description: "Evaluating Gong for your revenue team? Trackr researches Gong in 2 minutes — scoring it against Chorus, Clari, Salesloft, and other alternatives with current pricing and independent analysis.",
        headline: "Evaluating Gong? Research it independently before the demo.",
        subheadline: "Trackr's agents pull current Gong pricing, surface community feedback from revenue practitioners, identify alternatives like Chorus and Clari, and score Gong across 7 dimensions — in under 2 minutes.",
        switchNarrative: `Gong is a significant investment. Revenue intelligence platforms typically cost $1,200–$1,800 per user per year, and the evaluation cycle is long — multiple stakeholders, multi-week trials, and complex ROI modeling. Getting the evaluation right matters, especially when alternatives like Chorus (now Zoominfo), Clari, Salesloft, and Outreach each cover overlapping use cases.

The challenge with Gong's evaluation process is information asymmetry. Gong's sales team is excellent and highly prepared. Your evaluation team is starting from scratch each time. By the time you've attended three demos and two ROI workshops, the decision has been substantially shaped by Gong's framing.

Trackr gives revenue and sales ops teams an independent starting point. Submit Gong's URL and get a current assessment: what the product actually does (vs. what the demo emphasizes), how the community rates it after implementation, what Chorus and Clari offer as alternatives, and where Gong scores across the 7 dimensions most relevant to revenue intelligence tools.

That foundation — completed in 2 minutes before your first vendor call — changes the dynamic of the evaluation process and helps you ask better questions when you do engage the sales team.`,
        featureTable: [
            { feature: "Independent Gong pricing research", trackr: true, competitor: "Sales-quoted only" },
            { feature: "Post-implementation community feedback", trackr: true, competitor: false },
            { feature: "Alternatives (Chorus, Clari, Salesloft)", trackr: true, competitor: false },
            { feature: "7-dimension evaluation score", trackr: true, competitor: false },
            { feature: "AI sophistication analysis", trackr: "In every report", competitor: false },
            { feature: "Stack integration analysis", trackr: true, competitor: false },
            { feature: "Renewal tracking", trackr: true, competitor: false },
            { feature: "Evaluation time", trackr: "2 minutes", competitor: "6–8 weeks" },
        ],
        advantages: [
            { title: "Independent intelligence before the sales process", description: "Gong's sales team is highly skilled at shaping the narrative. Trackr gives your team an independent baseline — current pricing, community feedback, and competitive alternatives — before the first demo." },
            { title: "Compare Gong vs Chorus vs Clari in 15 minutes", description: "Submit all three to Trackr. Get scored reports across the same framework. Use Trackr's side-by-side comparison to align your team on the finalists before going deep in any vendor's sales process." },
            { title: "Revisit at contract renewal", description: "Revenue intelligence is a fast-moving category. Trackr re-researches Gong on any schedule you set — so when your contract comes up for renewal, you have current market intelligence to inform the negotiation." },
        ],
        faqs: [
            { q: "Does Trackr know Gong's actual pricing?", a: "Gong doesn't publish pricing publicly, so Trackr's research reflects the best available public information — community reports, third-party benchmarks, and disclosed pricing ranges. The report gives you a realistic range and context for what similar companies pay." },
            { q: "Can I compare Gong vs Salesloft in Trackr?", a: "Yes — submit both URLs to Trackr and use the compare feature to see side-by-side scores across 7 dimensions. This is the fastest way to build a structured comparison before going deep in either vendor's trial." },
        ],
        ctaText: "Research Gong independently in 2 minutes",
    },
    {
        competitor: "microsoft-copilot",
        competitorName: "Microsoft Copilot",
        competitorTagline: "AI assistant built into Microsoft 365",
        title: "Trackr vs Microsoft Copilot — Purpose-Built Tool Research vs General AI | Trackr",
        description: "Microsoft Copilot answers general questions. Trackr researches, scores, and tracks AI tools for your stack — with 7-dimension reports in 2 minutes.",
        headline: "Copilot answers questions. Trackr researches tools.",
        subheadline: "Microsoft 365 Copilot is a general-purpose AI assistant. Trackr is purpose-built for evaluating AI tools — scoring them across 7 dimensions with live data, competitive context, and stack-level spend tracking.",
        switchNarrative: `Microsoft 365 Copilot is embedded in Teams, Word, Excel, and Outlook, and it's excellent at what it does: drafting documents, summarizing meetings, generating Excel formulas, and answering questions in your document context. It's a productivity assistant.

Trackr is not a general assistant. It's a research agent specifically designed to evaluate SaaS tools. When you submit a tool URL to Trackr, the system pulls current pricing from the vendor site, surfaces community feedback from Reddit and practitioner forums, identifies alternatives, and scores the tool across 7 dimensions with written justifications. This structured output is what you need when you're deciding whether to buy a tool — not a chat interface.

The comparison matters because many teams try to use general AI chatbots (Copilot, ChatGPT, Perplexity) as tool research tools. The limitations are real: general AI lacks live internet data, can't track your stack, can't set renewal alerts, and can't enforce a consistent evaluation framework across tools. Trackr was built specifically for this workflow.`,
        featureTable: [
            { feature: "Purpose-built tool evaluation", trackr: true, competitor: false },
            { feature: "7-dimension scoring framework", trackr: true, competitor: false },
            { feature: "Live vendor pricing data", trackr: "Pulled at research time", competitor: false },
            { feature: "Stack tracking and spend management", trackr: true, competitor: false },
            { feature: "Renewal alerts", trackr: "60-day automatic alerts", competitor: false },
            { feature: "Competitive alternatives surfaced", trackr: "In every report", competitor: false },
            { feature: "Microsoft 365 document assistance", trackr: false, competitor: true },
            { feature: "Meeting summarization", trackr: false, competitor: true },
        ],
        advantages: [
            { title: "Structured evaluation, not open-ended chat", description: "Copilot gives you a chat interface. Trackr gives you a scored report: 7 dimensions, pros and cons, competitive alternatives, and current pricing. Structured output is what you need for a procurement decision." },
            { title: "Live data, not training data", description: "Copilot's knowledge has a training cutoff and may not reflect current pricing or recent product changes. Trackr pulls live data from the vendor's current website, community platforms, and pricing databases at the moment you research." },
            { title: "Stack visibility beyond the moment", description: "Copilot doesn't track what you've evaluated or what you're paying. Trackr builds a persistent record of your full AI tool stack — spend, renewal dates, scores, and evaluation history." },
        ],
        faqs: [
            { q: "Can't I just ask Copilot to research a tool for me?", a: "You can, and it may produce a useful starting point. The limitations are: Copilot doesn't pull live pricing data, doesn't enforce a consistent evaluation framework, can't track your stack or set renewal alerts, and may have outdated information. Trackr is built specifically for this workflow." },
            { q: "Does Trackr replace Microsoft 365?", a: "No. Microsoft 365 and Copilot are general-purpose productivity tools that most teams use for email, documents, and collaboration. Trackr is specifically for AI tool research and stack management. They serve different functions." },
            { q: "Who uses both Copilot and Trackr?", a: "Most Trackr customers use Microsoft 365. Copilot assists with daily productivity tasks. Trackr handles structured tool evaluation and stack management. They're complementary, not competing." },
        ],
        ctaText: "Try purpose-built tool research",
    },
    {
        competitor: "clickup",
        competitorName: "ClickUp",
        competitorTagline: "All-in-one productivity and project management platform",
        title: "Trackr vs ClickUp — AI Tool Intelligence vs Project Management | Trackr",
        description: "ClickUp manages your projects. Trackr manages your AI tool evaluations — with scored reports, stack tracking, and renewal intelligence. Different tools, different jobs.",
        headline: "ClickUp tracks your tasks. Trackr tracks your AI stack.",
        subheadline: "ClickUp is a project management and docs platform. Trackr is purpose-built for AI tool research, evaluation scoring, and stack-level spend tracking. Many teams use ClickUp to manage their tool evaluation project — and Trackr to actually do the evaluation.",
        switchNarrative: `Teams often try to run tool evaluations in ClickUp or Notion using custom templates, spreadsheet-style databases, and manual research. The process works — people fill in feature columns, add review links, and score tools in custom fields. It's flexible, familiar, and already paid for.

The problem is that the manual research layer is what takes 8 hours. You still need to visit the vendor site, read G2 reviews, browse Reddit threads, find competitor comparison content, and figure out pricing. ClickUp can organize the output, but it can't generate it.

Trackr generates the evaluation output in 2 minutes. Current pricing, pros and cons, 7-dimension scores with written justifications, and competitive alternatives — delivered as a report. You can still use ClickUp to manage the evaluation process, track decisions, and get approvals. But the core research that typically takes most of a day is handled by Trackr's AI agents instead.`,
        featureTable: [
            { feature: "AI-generated tool research", trackr: true, competitor: false },
            { feature: "7-dimension scoring framework", trackr: true, competitor: "Manual custom fields" },
            { feature: "Live vendor pricing data", trackr: true, competitor: false },
            { feature: "Renewal date alerts", trackr: true, competitor: "Manual reminders only" },
            { feature: "Stack-level spend tracking", trackr: true, competitor: "Manual entry" },
            { feature: "Project and task management", trackr: false, competitor: true },
            { feature: "Document and wiki creation", trackr: false, competitor: true },
            { feature: "Evaluation time per tool", trackr: "2 minutes", competitor: "4–8 hours" },
        ],
        advantages: [
            { title: "Research in 2 minutes vs 8 hours", description: "Trackr's AI agents generate a complete evaluation in under 2 minutes. ClickUp helps you organize the evaluation — but the research still takes hours. Trackr eliminates the hours." },
            { title: "Consistent scoring across all tools", description: "When you score tools manually in ClickUp, consistency depends on whoever filled in the fields. Trackr applies the same 7-dimension framework to every tool — making comparisons meaningful." },
            { title: "Automatic renewal intelligence", description: "ClickUp can hold your contract dates as task due dates, but it won't pull current competitive data at renewal time. Trackr's renewal alerts come with fresh research intelligence — not just a calendar ping." },
        ],
        faqs: [
            { q: "Can I use ClickUp and Trackr together?", a: "Yes, many teams do. Use ClickUp to manage the evaluation project — tracking stakeholders, approvals, and timelines. Use Trackr to generate the actual research reports. Trackr exports to PDF and CSV for easy attachment to your ClickUp tasks." },
            { q: "Does Trackr replace spreadsheet-based tool tracking?", a: "For most teams, yes. Trackr provides a purpose-built interface for tool tracking, spend management, and renewal alerts that's far more reliable than a manually maintained spreadsheet." },
            { q: "Is Trackr a project management tool?", a: "No. Trackr is specifically an AI tool research and stack management platform. It doesn't track tasks, manage team projects, or replace general productivity software like ClickUp." },
        ],
        ctaText: "Research AI tools in 2 minutes",
    },
    {
        competitor: "monday",
        competitorName: "Monday.com",
        competitorTagline: "Work management and team collaboration platform",
        title: "Trackr vs Monday.com — AI Tool Research vs Work Management | Trackr",
        description: "Monday.com manages your team's work. Trackr manages your AI tool evaluations — automatically researching, scoring, and tracking every tool in your stack.",
        headline: "Monday.com manages work. Trackr manages your tool stack.",
        subheadline: "Monday.com is a team collaboration and work management platform. Trackr researches, scores, and tracks every AI tool you evaluate or use — with AI-powered reports in 2 minutes and automatic renewal alerts.",
        switchNarrative: `Many teams manage tool evaluations in Monday.com using boards, custom statuses, and item pages for each tool under consideration. It's a reasonable workflow — Monday.com is flexible and your team is already in it.

The bottleneck is always the research itself. Someone needs to find the pricing, read the reviews, identify the alternatives, and fill in the evaluation criteria. That person spends a day on research that ends up in a board that most stakeholders won't read deeply. The evaluation quality is bounded by how much time that person had.

Trackr's AI research pipeline changes the constraint. Submit a tool URL and in 2 minutes you have: current pricing, independent community sentiment, 7-dimension scores with justifications, pros and cons, and competitive alternatives. That report is the foundation your Monday.com board item builds on — not the other way around.`,
        featureTable: [
            { feature: "AI-generated tool research reports", trackr: true, competitor: false },
            { feature: "7-dimension scoring", trackr: true, competitor: "Manual entry" },
            { feature: "Renewal tracking with alerts", trackr: true, competitor: "Reminders only" },
            { feature: "Spend tracking across tool stack", trackr: true, competitor: "Manual data entry" },
            { feature: "Competitive alternatives in every report", trackr: true, competitor: false },
            { feature: "Work management and project boards", trackr: false, competitor: true },
            { feature: "Team collaboration features", trackr: "Workspaces + comments", competitor: true },
            { feature: "Research time per tool", trackr: "2 minutes", competitor: "Full research day" },
        ],
        advantages: [
            { title: "AI handles the research burden", description: "The value of Monday.com boards is organizing information — but someone still needs to produce the information. Trackr generates scored research reports automatically, removing the manual research burden from your evaluation workflow." },
            { title: "Structured output for better decisions", description: "Trackr's 7-dimension framework produces consistent, comparable evaluations. Manual Monday.com board items vary by whoever filled them in. Consistency makes multi-tool comparisons meaningful." },
            { title: "Purpose-built for tool stack management", description: "Monday.com is a general work management tool. Trackr is specifically designed for AI tool research, spend tracking, and renewal management — with features built for that workflow." },
        ],
        faqs: [
            { q: "Should I use Monday.com or Trackr for tool evaluations?", a: "Both serve different functions. Trackr generates the research and scoring. Monday.com can manage the process — tracking approvals, stakeholders, and timelines. Many teams use Monday.com to manage tool evaluation projects while using Trackr to produce the actual evaluations." },
            { q: "Can Trackr integrate with Monday.com?", a: "Trackr exports reports as PDF and CSV that can be attached to Monday.com items. Direct integration is on the roadmap. The Slack integration can push research summaries to channels your team monitors in conjunction with Monday.com workflows." },
        ],
        ctaText: "Research any tool in 2 minutes",
    },
    {
        competitor: "ramp",
        competitorName: "Ramp",
        competitorTagline: "Corporate card and spend management platform",
        title: "Trackr vs Ramp — Tool Intelligence vs Spend Management | Trackr",
        description: "Ramp tracks what you're spending on SaaS. Trackr tells you whether you should be spending it — with AI tool research and stack intelligence in 2 minutes.",
        headline: "Ramp tracks your SaaS spend. Trackr helps you evaluate what's worth keeping.",
        subheadline: "Ramp identifies what you're paying for SaaS. Trackr helps you decide what to keep, cut, or replace — with AI-powered tool research, 7-dimension scoring, and renewal intelligence.",
        switchNarrative: `Ramp and Trackr serve complementary roles in the software procurement lifecycle. Understanding the overlap and the gap is important for teams evaluating both.

Ramp is a corporate card platform with spend management features. It shows you what you're paying across vendors, flags duplicate subscriptions, and can surface underutilized tools based on SSO signals or card activity. The data Ramp provides answers "what are we spending?" — which is an important question for any team managing a SaaS budget.

Trackr answers "should we be spending it?" When Ramp shows you a $2,400/month bill for a tool you're not sure you need, Trackr researches that tool: current market pricing, whether better alternatives exist, what the community says about ROI, and whether the renewal is defensible. Trackr also fills the gap upstream — researching tools before you buy them, so you make better purchasing decisions in the first place.`,
        featureTable: [
            { feature: "AI tool research and evaluation", trackr: true, competitor: false },
            { feature: "7-dimension scoring", trackr: true, competitor: false },
            { feature: "Renewal date tracking and alerts", trackr: true, competitor: "Partial (card transaction signals)" },
            { feature: "SaaS spend visibility from card transactions", trackr: false, competitor: true },
            { feature: "Competitive alternatives analysis", trackr: true, competitor: false },
            { feature: "Corporate card and expense management", trackr: false, competitor: true },
            { feature: "Pre-purchase evaluation support", trackr: true, competitor: false },
            { feature: "Tool benchmarking and scoring", trackr: true, competitor: false },
        ],
        advantages: [
            { title: "Intelligence, not just visibility", description: "Ramp shows you what you're spending. Trackr tells you whether it's worth spending. The research layer — scoring tools against alternatives, surfacing community feedback, and providing renewal context — is what Trackr adds." },
            { title: "Pre-purchase evaluation, not post-purchase tracking", description: "Ramp's value is in managing spend on tools you've already purchased. Trackr's primary value is in the evaluation phase — helping you make better decisions before committing to a tool and contract." },
            { title: "Evaluation framework for every renewal", description: "Ramp can alert you to an upcoming renewal. Trackr gives you a fresh research report at renewal time — current pricing, competitive alternatives, and community feedback — so you renew with current intelligence, not just a calendar reminder." },
        ],
        faqs: [
            { q: "Can I use both Ramp and Trackr?", a: "Yes, they're complementary. Ramp manages your SaaS spend and corporate card transactions. Trackr handles tool research, evaluation scoring, and renewal intelligence. Many operations and finance teams use both as part of a complete vendor management workflow." },
            { q: "Does Trackr show me my SaaS spending like Ramp does?", a: "Trackr includes manual spend tracking — you can log what you're paying for each tool. But Trackr doesn't have Ramp's card integration for automatic spend detection. For comprehensive spend visibility, Ramp or similar platforms are the right tool." },
            { q: "Is Trackr cheaper than Ramp?", a: "Different pricing models. Ramp's core spend management is free; Trackr starts free with paid tiers for advanced research features. The cost comparison matters less than understanding which job each tool does in your vendor management workflow." },
        ],
        ctaText: "Research your SaaS stack intelligently",
    },
    {
        competitor: "apollo",
        competitorName: "Apollo.io",
        competitorTagline: "Sales intelligence and outreach platform",
        title: "Trackr for Apollo Evaluation — Research Apollo Before You Buy | Trackr",
        description: "Evaluating Apollo.io for your sales team? Trackr generates an independent scored report in 2 minutes — current pricing, alternatives like ZoomInfo and Clay, and 7-dimension analysis.",
        headline: "Evaluating Apollo? Get a scored report before the first demo.",
        subheadline: "Trackr researches Apollo.io's current pricing, surfaces community feedback from sales practitioners, identifies alternatives like ZoomInfo, Clay, and Lusha, and delivers a 7-dimension scorecard — in 2 minutes, before any vendor contact.",
        switchNarrative: `Apollo.io is one of the most-evaluated tools in the sales intelligence and sequencing category. The market is competitive — ZoomInfo, Clay, Lusha, Hunter, Outreach, and Salesloft all compete for overlapping use cases — which makes the evaluation complex. Knowing what Apollo actually does well vs. the alternatives is harder than it should be.

Apollo's data accuracy and database size are frequently discussed in sales practitioner communities with mixed results by company type, geography, and target segment. The platform has evolved significantly from a simple prospecting tool to a full sales engagement platform. Understanding which Apollo you're buying — and whether the full platform or just the database is the right fit — requires research that most evaluators don't do before the first demo.

Trackr generates that research in 2 minutes. You'll see how Apollo's contact database compares to ZoomInfo and Lusha, how the sequencing features compare to dedicated tools like Outreach, what the community says about data accuracy across different market segments, and what you should realistically expect to pay vs. the published pricing. That foundation makes your evaluation conversations with Apollo's sales team substantively better.`,
        featureTable: [
            { feature: "Independent Apollo pricing research", trackr: true, competitor: "Sales-quoted" },
            { feature: "Data accuracy community analysis", trackr: "In research report", competitor: false },
            { feature: "Alternatives (ZoomInfo, Clay, Lusha, Outreach)", trackr: true, competitor: false },
            { feature: "7-dimension scoring", trackr: true, competitor: false },
            { feature: "Contact database and prospecting", trackr: false, competitor: true },
            { feature: "Email sequencing and cadences", trackr: false, competitor: true },
            { feature: "AI-powered outreach features", trackr: false, competitor: true },
            { feature: "Evaluation time", trackr: "2 minutes", competitor: "3–5 week trial" },
        ],
        advantages: [
            { title: "Research Apollo independently before the trial", description: "Most Apollo evaluations start with a trial and only later surface questions about data accuracy, pricing tiers, and alternatives. Trackr gives you independent intelligence first — so your trial is structured around answering the right questions." },
            { title: "Compare Apollo vs ZoomInfo vs Clay in 10 minutes", description: "Submit all three to Trackr and get scored reports on the same 7-dimension framework. Use the comparison to determine which platforms are worth a deeper trial before committing sales team time." },
            { title: "Re-evaluate at annual renewal", description: "The sales intelligence market changes fast. Apollo's pricing, data quality, and feature set evolve constantly. Trackr can re-research Apollo at any interval — so your renewal decision is based on current market intelligence." },
        ],
        faqs: [
            { q: "Does Trackr have Apollo's actual pricing?", a: "Apollo's pricing is partially published and partially custom-quoted. Trackr's research reflects published pricing plus community-reported actual prices for common configurations. This gives you a realistic expectation range before engaging their sales team." },
            { q: "Can Trackr compare Apollo vs ZoomInfo?", a: "Yes — submit both URLs to Trackr and use the compare feature for side-by-side 7-dimension scoring. This is the fastest way to align your team on which platforms to take to a full trial." },
            { q: "Is Trackr useful for evaluating non-AI sales tools?", a: "Yes. Trackr researches any SaaS tool — including traditional sales intelligence, CRM, and outreach platforms. The AI in Trackr is in the research pipeline, not a restriction on what can be researched." },
        ],
        ctaText: "Research Apollo independently in 2 minutes",
    },
];

export const VS_COMPETITORS = VS_PAGES.map((p) => p.competitor);
