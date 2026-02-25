// Trackr — ICP-specific landing pages at /for/[role]
// Tailored messaging for 5 key buyer personas

export type IcpPage = {
    role: string;                // URL slug, e.g. "ops-teams"
    title: string;               // <title> tag
    description: string;         // meta description
    headline: string;            // H1
    subheadline: string;         // Supporting text under H1
    painPoints: {
        title: string;
        description: string;
    }[];
    features: {
        title: string;
        description: string;
    }[];
    stat: {
        value: string;
        label: string;
    };
    faqs: {
        q: string;
        a: string;
    }[];
    ctaText: string;
    ctaSubtext: string;
    testimonialQuote: string;
    testimonialAttribution: string;
};

export const ICP_PAGES: IcpPage[] = [
    {
        role: "ops-teams",
        title: "Trackr for Operations Teams — AI Tool Intelligence Layer",
        description: "Ops teams use Trackr to research, score, and track every AI tool in their stack. Cut tool evaluation from 8 hours to 2 minutes.",
        headline: "The ops team's AI tool intelligence layer",
        subheadline: "Research any tool in 2 minutes. Track your full stack. Make every renewal decision with data, not guesswork.",
        painPoints: [
            {
                title: "Tool evaluations take a week",
                description: "Between vendor demos, G2 reviews, and Reddit rabbit holes, evaluating one SaaS tool takes 6–10 hours of research. Multiply that by the 15 tools you evaluate each quarter.",
            },
            {
                title: "No one knows what's actually being used",
                description: "Credit card statements say you're paying for 60+ tools. Half of them are used by one person. Nobody knows which ones are actually driving value.",
            },
            {
                title: "Every renewal is a scramble",
                description: "The renewal notice arrives and you have 30 days to decide. Nobody has current pricing intelligence, competitive context, or utilization data in one place.",
            },
        ],
        features: [
            {
                title: "AI research in 2 minutes",
                description: "Submit any tool URL. Trackr's research agents pull data from the vendor site, G2, Reddit, and Capterra, then generate a scored 7-dimension report with pros, cons, and competitive analysis.",
            },
            {
                title: "Stack-level spend tracking",
                description: "Track every tool's monthly cost and utilization. Identify overlap, zombie subscriptions, and tools that are over-licensed for actual usage.",
            },
            {
                title: "Renewal calendar with 60-day alerts",
                description: "Never get surprised by a renewal again. Trackr tracks contract dates and alerts you with enough lead time to research alternatives and negotiate.",
            },
        ],
        stat: {
            value: "2 min",
            label: "Average research time per tool",
        },
        faqs: [
            {
                q: "How many tools can I track in Trackr?",
                a: "All plans support unlimited tool tracking. Free users can research up to 3 tools per month. Pro users get unlimited research reports.",
            },
            {
                q: "Can I share research reports with my team?",
                a: "Yes — reports are shareable with anyone in your workspace. Team members can view, comment, and add notes to any research report.",
            },
            {
                q: "Does Trackr integrate with procurement tools?",
                a: "Trackr exports research reports as PDF and CSV, and our Slack integration posts research summaries to your team's channels. Native procurement integrations are on the roadmap.",
            },
            {
                q: "How accurate are the AI research reports?",
                a: "Reports are generated from live data sources including the vendor's current website, verified review platforms, and community discussions. We note when data may be outdated and recommend running a fresh report before any renewal or evaluation decision.",
            },
            {
                q: "Is Trackr good for small ops teams?",
                a: "Yes — Trackr is used by solo ops managers and teams of 20+. The free tier covers basic research needs. Most ops managers start with Trackr to handle a quarterly tool audit and renewal cycle.",
            },
        ],
        ctaText: "Start researching your stack",
        ctaSubtext: "Free to start. No credit card required.",
        testimonialQuote: "We used to spend a full day evaluating any new tool. Trackr cut that to an afternoon and the reports are more thorough than anything we'd produce manually.",
        testimonialAttribution: "Operations Lead, Series B SaaS company",
    },
    {
        role: "revops",
        title: "Trackr for RevOps — GTM Tool Intelligence",
        description: "RevOps teams use Trackr to evaluate, track, and optimize their GTM tool stack. One scorecard for every sales, marketing, and CS tool.",
        headline: "RevOps: one scorecard for every GTM tool",
        subheadline: "Evaluate every tool your revenue team uses. Compare alternatives. Negotiate renewals with market data. Keep your GTM stack lean.",
        painPoints: [
            {
                title: "The GTM stack keeps growing",
                description: "Sales wants another prospecting tool. Marketing wants a new attribution platform. CS wants a health scoring solution. Each request triggers a full evaluation cycle — and there's never a consistent process.",
            },
            {
                title: "You're paying for duplicate functionality",
                description: "Your CRM, sales engagement platform, and intent data tools all claim to do enrichment. Your ABM platform and marketing automation both claim to do attribution. The overlap is real and expensive.",
            },
            {
                title: "Renewal negotiations start too late",
                description: "Vendors know their customers rarely switch at renewal. Without competitive intelligence and current pricing data going in, you negotiate from a weak position.",
            },
        ],
        features: [
            {
                title: "7-dimension GTM tool scoring",
                description: "Every tool is scored on core capability, ease of use, integrations, pricing value, AI sophistication, community support, and scalability. Compare any two tools side-by-side in seconds.",
            },
            {
                title: "Competitive intelligence at renewal",
                description: "Every research report includes current competitor analysis, market-rate pricing, and alternatives. Walk into any renewal negotiation knowing exactly what the landscape looks like.",
            },
            {
                title: "Stack overlap detection",
                description: "Trackr's AI stack analysis flags tools that cover the same functionality. Identify consolidation opportunities before your next budget cycle.",
            },
        ],
        stat: {
            value: "~30%",
            label: "Typical GTM stack overlap",
        },
        faqs: [
            {
                q: "Can Trackr research sales tools like Apollo, Gong, and Outreach?",
                a: "Yes — Trackr has curated scorecards for 100+ GTM tools including Apollo, Gong, Outreach, Salesloft, Clay, and all major CRMs. For tools not in our library, submit the URL and get a custom report in 2 minutes.",
            },
            {
                q: "How does Trackr help with CRM evaluations?",
                a: "Submit any CRM URL and Trackr produces a scored report covering data model flexibility, integration depth, reporting quality, AI features, and pricing at your scale. Comparison views let you compare finalists side-by-side.",
            },
            {
                q: "Can I use Trackr to build a business case for or against a tool?",
                a: "Yes — reports include pros, cons, scoring justifications, and competitive alternatives. Export as PDF for sharing with leadership. The structured format makes executive approval conversations much faster.",
            },
            {
                q: "Does Trackr track tool utilization?",
                a: "Trackr's spend tracker lets you log monthly costs and set status (active, trialing, evaluating). Usage data from the tool itself requires native admin access — Trackr tracks the intelligence, not the usage metrics.",
            },
            {
                q: "Is Trackr worth it for a team managing a $500K+ GTM tech stack?",
                a: "Absolutely. At that spend level, finding even 10–15% waste through Trackr's stack analysis pays for years of the subscription. Most RevOps leaders find the renewal negotiation intelligence alone is worth the cost.",
            },
        ],
        ctaText: "Evaluate your GTM stack",
        ctaSubtext: "Free to start. Research 3 tools immediately.",
        testimonialQuote: "Before Trackr, our RevOps tool evaluation process was inconsistent — different people, different criteria, different outputs. Now every evaluation follows the same 7-dimension framework and we have a shared record of every decision.",
        testimonialAttribution: "VP Revenue Operations, Series C SaaS",
    },
    {
        role: "founders",
        title: "Trackr for Founders — Know Which AI Tools Are Worth It",
        description: "Founders use Trackr to make fast, informed tool decisions without wasting time on vendor demos and research rabbit holes.",
        headline: "Know which tools are actually worth it",
        subheadline: "Skip the demo cycle. Get a scored research report on any tool in 2 minutes. Build a lean, high-ROI AI stack without the research overhead.",
        painPoints: [
            {
                title: "Demos cost you 4 hours per tool",
                description: "Discovery call. Demo. Follow-up Q&A. Reference check. By the time you've evaluated three tools, you've lost a full day — and you still don't have a clear answer.",
            },
            {
                title: "The AI tool landscape changes weekly",
                description: "The tool your investor recommended last quarter may have been superseded by two better alternatives. Keeping up requires constant research you don't have time for.",
            },
            {
                title: "You're making six-figure stack decisions on intuition",
                description: "Your SaaS stack costs $200K+ per year. Most of those purchases were made based on demos, referrals, and gut feeling — not systematic evaluation.",
            },
        ],
        features: [
            {
                title: "Research any tool in 2 minutes",
                description: "Submit any URL. Get a complete scorecard with pros, cons, pricing tiers, competitor alternatives, and an overall score. No demo required.",
            },
            {
                title: "Compare finalists side-by-side",
                description: "Run reports on two or three tools and compare their 7-dimension scores directly. Make the decision in a single view, not across 12 browser tabs.",
            },
            {
                title: "Track what you're spending",
                description: "Add every active subscription to your Trackr workspace. See your total monthly spend, identify underutilized tools, and know your renewal dates 60 days in advance.",
            },
        ],
        stat: {
            value: "8 hrs",
            label: "Average time to evaluate a SaaS tool (without Trackr)",
        },
        faqs: [
            {
                q: "How long does a Trackr research report take?",
                a: "Under 2 minutes for most tools. Complex enterprise tools with limited public data may take up to 3 minutes. Reports are available immediately after generation.",
            },
            {
                q: "Is the research data current?",
                a: "Reports pull live data at generation time. Pricing, features, and competitive analysis reflect the current state of the tool — not a cached review from 18 months ago.",
            },
            {
                q: "Can Trackr research any tool, or just popular ones?",
                a: "Any tool with a public website. Our research agents work on the long tail — niche tools, new entrants, and lesser-known solutions that don't have G2 reviews get the same treatment as major platforms.",
            },
            {
                q: "What's the ROI model for Trackr?",
                a: "If Trackr helps you avoid one bad $500/month tool purchase per year, it pays for itself. If it helps you negotiate 10% better pricing on a $50K annual contract, it's an extreme ROI. Most founders find the time savings alone are worth it.",
            },
            {
                q: "Is there a free trial?",
                a: "Yes — Trackr's free tier lets you research 3 tools per month at no cost. No credit card required to start. Pro unlocks unlimited research and team features.",
            },
        ],
        ctaText: "Research your first tool free",
        ctaSubtext: "No demo required. No credit card. Results in 2 minutes.",
        testimonialQuote: "I used to spend half a day evaluating any major tool purchase. Now I do it in 15 minutes. Trackr's reports are more rigorous than what I was producing manually, and I trust the competitive analysis.",
        testimonialAttribution: "Founder & CEO, AI-native startup",
    },
    {
        role: "engineering",
        title: "Trackr for Engineering Teams — Evaluate Dev Tools Without the Rabbit Hole",
        description: "Engineering teams use Trackr to research dev tools, infrastructure platforms, and AI coding tools without wasting sprint cycles on manual research.",
        headline: "Evaluate dev tools without the research rabbit hole",
        subheadline: "Research any engineering tool in 2 minutes. Compare AI coding assistants, CI/CD platforms, databases, and infrastructure tools with AI-powered reports.",
        painPoints: [
            {
                title: "Tool evaluations steal sprint time",
                description: "Every new tool evaluation — whether it's an AI coding assistant, a database platform, or a monitoring tool — pulls engineers into research that takes them away from building.",
            },
            {
                title: "Reddit and Hacker News aren't reliable signals",
                description: "Community opinions are noisy, biased, and often outdated. The 3-year-old thread comparing two database options doesn't reflect today's pricing or features.",
            },
            {
                title: "The AI dev tool landscape is a moving target",
                description: "Cursor vs Copilot vs Continue.dev vs Codeium — the AI coding tool landscape changes every month. Building a systematic evaluation beats starting from scratch each time.",
            },
        ],
        features: [
            {
                title: "AI dev tool scorecards",
                description: "Curated scorecards for 100+ engineering tools — AI coding assistants, databases, CI/CD platforms, observability tools, and infrastructure — all scored on the same 7 dimensions.",
            },
            {
                title: "Head-to-head comparisons",
                description: "Compare any two tools side-by-side on core capability, integration depth, scalability, and pricing. The comparison view surfaces exactly which tool wins on which dimension.",
            },
            {
                title: "Custom reports in 2 minutes",
                description: "New tool not in our library? Submit the URL and get a complete scored report in under 2 minutes — pulling from the vendor's docs, GitHub activity, and community discussions.",
            },
        ],
        stat: {
            value: "100+",
            label: "Engineering tools with curated scorecards",
        },
        faqs: [
            {
                q: "Does Trackr cover AI coding tools like Cursor and GitHub Copilot?",
                a: "Yes — Trackr has curated scorecards for Cursor, GitHub Copilot, CodeRabbit, Codeium, Continue.dev, and all major AI coding tools. Head-to-head comparisons are available for all major pairs.",
            },
            {
                q: "Can Trackr research database and infrastructure tools?",
                a: "Yes — any tool with a public website can be researched. Engineering tools like Neon, PlanetScale, Vercel, Netlify, Datadog, and similar have existing scorecards or can be generated in minutes.",
            },
            {
                q: "Is Trackr relevant for small engineering teams?",
                a: "Yes — even a 3-engineer team evaluating 2–3 new tools per quarter benefits from Trackr. Free tier covers basic usage.",
            },
            {
                q: "How does Trackr score technical tools differently from business tools?",
                a: "The 7 dimensions apply universally, but the weighting of Integration Depth and Scalability tends to matter more for technical infrastructure decisions. Justifications in each dimension are tailored to the technical context of the tool being scored.",
            },
            {
                q: "Can I share a report with my team for discussion?",
                a: "Yes — all reports are shareable within your workspace, and public sharing links are available for external stakeholders. Commenting and notes are supported.",
            },
        ],
        ctaText: "Research your dev stack",
        ctaSubtext: "Free to start. Research 3 tools immediately.",
        testimonialQuote: "We were evaluating three different observability platforms and the research was all over the place. Trackr gave us a consistent scorecard for all three and cut the decision process from 2 weeks to 3 days.",
        testimonialAttribution: "Engineering Lead, Series A startup",
    },
    {
        role: "chiefs-of-staff",
        title: "Trackr for Chiefs of Staff — Answer Every Tool Question in Under 2 Minutes",
        description: "Chiefs of Staff use Trackr to manage AI tool evaluations, track software spend, and give leadership data-driven answers on every technology question.",
        headline: "Answer every tool question in under 2 minutes",
        subheadline: "The research layer for chiefs of staff who field every tool evaluation, renewal decision, and \"should we use this?\" question from leadership.",
        painPoints: [
            {
                title: "You field every tool question",
                description: "\"Should we add this to our stack?\" \"Can we negotiate this contract?\" \"Is this tool better than what we're using?\" The chief of staff gets every technology question — and needs a fast, credible answer.",
            },
            {
                title: "Tool decisions happen ad hoc",
                description: "Without a systematic process, tool purchases happen reactively — a champion hears about a tool, runs a trial, and the subscription appears on the credit card. There's no consistent evaluation and no paper trail.",
            },
            {
                title: "Renewal season is overwhelming",
                description: "Q4 brings a wave of renewals across every department. Evaluating each one with current market data, competitive alternatives, and cost-per-seat analysis requires more bandwidth than one person has.",
            },
        ],
        features: [
            {
                title: "Consistent, defensible research on any tool",
                description: "Every Trackr report follows the same 7-dimension framework. When someone challenges a tool decision, you have a structured report with scoring justifications — not just an opinion.",
            },
            {
                title: "Full stack visibility in one place",
                description: "Track every tool, its monthly cost, its owner, and its renewal date. Produce a full stack audit for leadership in minutes rather than assembling it from credit card statements.",
            },
            {
                title: "Renewal prep in minutes, not days",
                description: "Before any renewal, run a fresh Trackr report to see current pricing benchmarks, competitive alternatives, and whether the tool's score has changed since last year.",
            },
        ],
        stat: {
            value: "60%",
            label: "Faster tool evaluation cycles with Trackr",
        },
        faqs: [
            {
                q: "How does Trackr help with vendor negotiations?",
                a: "Trackr reports include current competitive pricing, alternatives in the category, and scoring on pricing value dimension. This market intelligence gives you a factual basis for negotiation rather than relying on estimates.",
            },
            {
                q: "Can I use Trackr to build a tools roadmap for leadership?",
                a: "Yes — the stack view shows all tools with scores, costs, and statuses in one place. Export to CSV for leadership presentations, or share direct links to individual research reports.",
            },
            {
                q: "How does Trackr handle confidential stack information?",
                a: "Your stack data is private to your workspace by default. Reports you run are not shared publicly unless you explicitly enable public sharing. Individual tool research reports can be made public for external sharing.",
            },
            {
                q: "Can multiple people on my team use Trackr?",
                a: "Yes — workspaces support multiple team members. Team members can run research, view reports, add notes, and track tools together. Pro plans include full team functionality.",
            },
            {
                q: "Is Trackr relevant for operations beyond technology decisions?",
                a: "Trackr is purpose-built for software tool intelligence. For vendor management beyond SaaS tools, you'd need a broader vendor management platform. For the technology stack, Trackr covers the full lifecycle from evaluation to renewal.",
            },
        ],
        ctaText: "Get your stack intelligence layer",
        ctaSubtext: "Free to start. Full team features on Pro.",
        testimonialQuote: "Every department brings me tool requests and every Q4 I'm drowning in renewals. Trackr is the first tool I've found that actually helps me be systematic about it — and give the CEO a real answer instead of 'I'll look into it.'",
        testimonialAttribution: "Chief of Staff, 100-person tech company",
    },
];

export const ICP_ROLES = ICP_PAGES.map((p) => p.role);
