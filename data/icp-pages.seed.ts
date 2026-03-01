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
    {
        role: "marketing-teams",
        title: "Trackr for Marketing Teams — Research AI Marketing Tools in 2 Minutes",
        description: "Marketing teams use Trackr to evaluate AI writing, SEO, content, and analytics tools. Get scored reports in 2 minutes — not 2 weeks of vendor demos.",
        headline: "Stop spending weeks evaluating marketing tools",
        subheadline: "Research any AI marketing tool in 2 minutes. Compare content platforms, SEO tools, and analytics software side-by-side. Make the business case in an afternoon.",
        painPoints: [
            {
                title: "The AI tool landscape changes every week",
                description: "New AI writing tools, SEO platforms, and content generators launch constantly. By the time you've finished evaluating one, three more have launched. Staying current on the marketing AI landscape is a full-time job.",
            },
            {
                title: "Making the business case takes longer than the evaluation",
                description: "You've found the right tool but need a scored scorecard to get budget approval. Building that comparison doc from scratch — pricing, features, alternatives — takes two days of research time.",
            },
            {
                title: "Renewals sneak up mid-campaign",
                description: "Your current tool renews in 30 days. You're mid-campaign and don't have time to evaluate alternatives. You renew without negotiating because you're out of time.",
            },
        ],
        features: [
            {
                title: "Research any marketing tool in 2 minutes",
                description: "Submit any URL — Jasper, Surfer SEO, Canva, Semrush, Klaviyo — and get a scored 7-dimension report with current pricing, pros/cons, and competitive alternatives. No demo calls required.",
            },
            {
                title: "Compare tools side-by-side",
                description: "Run research on 3-5 finalists and compare them on consistent dimensions. Trackr's compare view puts pricing, feature scores, and AI sophistication ratings side-by-side — built for budget presentations.",
            },
            {
                title: "Track your full marketing stack",
                description: "Every tool your team uses — email, SEO, content, analytics, social — tracked in one place with monthly cost, renewal dates, and score. Identify overlap before budget season.",
            },
        ],
        stat: {
            value: "7 dims",
            label: "Consistent scoring across every tool",
        },
        faqs: [
            {
                q: "Does Trackr cover AI marketing tools specifically?",
                a: "Yes — Trackr's research engine and curated library cover AI writing tools, SEO platforms, email marketing software, social media tools, analytics platforms, and creative AI tools. Submit any tool URL for a custom research report.",
            },
            {
                q: "Can I share Trackr reports with my CMO for budget approval?",
                a: "Yes — Trackr reports export as PDFs and generate shareable URLs. The scored 7-dimension format makes internal presentations straightforward — you have a defensible, structured evaluation rather than a subjective recommendation.",
            },
            {
                q: "How current is Trackr's pricing data?",
                a: "Trackr's research agents scrape vendor sites at report generation time. Pricing data reflects what the vendor currently publishes — more current than review sites, which often show outdated pricing.",
            },
        ],
        ctaText: "Research your marketing stack",
        ctaSubtext: "Free to start. 3 research reports per month.",
        testimonialQuote: "I used to spend 2-3 days building comparison docs for tool budget requests. Now I run a Trackr report on each finalist, export the comparison to PDF, and have everything I need for the business case in under an hour.",
        testimonialAttribution: "VP Marketing, B2B SaaS company",
    },
    {
        role: "finance-teams",
        title: "Trackr for Finance Teams — SaaS Spend Visibility and Renewal Intelligence",
        description: "Finance teams use Trackr to track SaaS spend, surface redundant tools, and build the data layer for annual software budget planning.",
        headline: "SaaS spend visibility your finance team can trust",
        subheadline: "Track every software subscription, surface overlap and waste, and build the data layer for defensible budget decisions — without chasing down spreadsheets from every department.",
        painPoints: [
            {
                title: "No single source of truth for software spend",
                description: "SaaS subscriptions live across credit cards, invoices, and departmental shadow IT. Finance has partial visibility at best. The actual software budget is discovered at year-end, not managed throughout the year.",
            },
            {
                title: "Renewal decisions made without ROI data",
                description: "A $150K annual renewal comes up for approval. The stakeholder says 'we use it constantly.' Finance has no way to verify utilization, compare alternatives, or assess whether the price is market-rate.",
            },
            {
                title: "Budget season built on guesswork",
                description: "Software budget planning requires data from every team about what they're using and what they want. Getting that data is a quarter-long project. Trackr is the system that makes it available year-round.",
            },
        ],
        features: [
            {
                title: "Centralized stack and spend tracking",
                description: "One place for every tool, its monthly cost, renewal date, and owner. Finance gets the aggregated view. Teams maintain their section. Annual software spend becomes a real number, not an estimate.",
            },
            {
                title: "60-day renewal alerts",
                description: "Renewal dates tracked automatically with 60-day alerts. Enough lead time to research alternatives, benchmark pricing, and negotiate before auto-renewal locks you in for another year.",
            },
            {
                title: "Scored intelligence for renewal decisions",
                description: "Run a research report on any tool in 2 minutes. Get current pricing, competitive alternatives, and a 7-dimension score. Give stakeholders real data instead of blank-check approvals.",
            },
        ],
        stat: {
            value: "30%",
            label: "Typical SaaS spend identified as waste or overlap",
        },
        faqs: [
            {
                q: "Can Trackr integrate with our expense management tools?",
                a: "Trackr supports CSV export for spend data. Full integration with expense management platforms is on the roadmap. Currently, teams typically maintain Trackr as their stack intelligence layer and reconcile with finance tooling quarterly.",
            },
            {
                q: "How do we get department heads to add their tools?",
                a: "Trackr workspaces support multiple members with different permissions. Many finance teams assign department admins who maintain their section of the stack. The research automation incentivizes participation — teams get scored reports in 2 minutes on tools they're evaluating.",
            },
            {
                q: "Is Trackr useful for SaaS audit or negotiation prep?",
                a: "Yes — Trackr's spend tracking, renewal calendar, and competitive intelligence are exactly the data layer needed for a SaaS audit or vendor negotiation. Current market pricing from Trackr reports gives finance a benchmark before renewal conversations.",
            },
        ],
        ctaText: "Get SaaS spend visibility",
        ctaSubtext: "Free to start. No credit card required.",
        testimonialQuote: "I had no idea we were paying for three different AI writing tools until Trackr surfaced the overlap. That's $24K a year in redundant subscriptions we're now consolidating.",
        testimonialAttribution: "VP Finance, 200-person SaaS company",
    },
    {
        role: "it-leaders",
        title: "Trackr for IT Leaders — AI Tool Governance and Security Evaluation",
        description: "IT leaders use Trackr to evaluate security posture, compliance readiness, and integration depth of AI tools before employee adoption runs ahead of policy.",
        headline: "AI tool governance before shadow IT becomes a problem",
        subheadline: "Evaluate security posture, data handling, and integration compliance before AI tools reach employees. Build a scored, defensible evaluation process — not a spreadsheet.",
        painPoints: [
            {
                title: "AI tool adoption is outpacing security review",
                description: "Employees are using AI tools before IT has reviewed them. Data handling policies, SSO compatibility, and compliance posture are unknown. The risk is real and growing every quarter.",
            },
            {
                title: "Security evaluations are time-consuming and inconsistent",
                description: "Every AI tool evaluation requires the same security checklist: data retention, SOC 2 status, GDPR compliance, API access controls. Running this manually for every tool request takes hours and produces inconsistent outputs.",
            },
            {
                title: "Business wants speed, IT wants control",
                description: "Teams request tools fast. IT's review process slows things down. The result: shadow IT. Tools get adopted before review, and IT discovers them on the credit card statement.",
            },
        ],
        features: [
            {
                title: "Security dimension in every report",
                description: "Trackr's 7-dimension scorecard includes a dedicated security dimension — evaluating data handling, SOC 2 status, enterprise SSO support, and access control capabilities for any tool in under 2 minutes.",
            },
            {
                title: "Consistent evaluation framework",
                description: "Every tool evaluated against the same 7-dimension scorecard. The output is a defensible, comparable evaluation that IT can approve or reject based on consistent criteria — not a one-off judgment call.",
            },
            {
                title: "Central registry of approved tools",
                description: "Your Trackr stack becomes the approved tool registry. Teams see which tools are researched and scored. IT maintains a single source of truth for what's approved, what's under review, and what's retired.",
            },
        ],
        stat: {
            value: "2 min",
            label: "Security-aware tool evaluation, any tool",
        },
        faqs: [
            {
                q: "Does Trackr include SOC 2 and compliance checks?",
                a: "Trackr's security dimension evaluates publicly available compliance information — SOC 2 status, GDPR compliance, data residency options, and enterprise SSO support. For formal security review, Trackr provides the initial intelligence layer; dedicated security review tools handle deeper assessment.",
            },
            {
                q: "Can we use Trackr to enforce a software approval process?",
                a: "Yes — many IT teams use Trackr as the first step in a tool approval workflow. A requester submits the tool to Trackr, shares the report with IT, and IT evaluates the security score and integration depth before approving. The structured output speeds up the review without reducing rigor.",
            },
            {
                q: "How does Trackr handle sensitive stack information?",
                a: "Your workspace data is private by default. Tool reports are not shared externally unless you explicitly enable public sharing. Enterprise workspaces support role-based access controls for sensitive stack information.",
            },
        ],
        ctaText: "Build your tool governance layer",
        ctaSubtext: "Free to start. Enterprise plans available.",
        testimonialQuote: "We were reactive on AI tool adoption — finding out about tools after employees had already put data into them. Trackr gave us a consistent evaluation framework and now we're ahead of the curve instead of chasing it.",
        testimonialAttribution: "Director of IT, 300-person fintech company",
    },
    {
        role: "product-managers",
        title: "Trackr for Product Managers — AI Tool Research for Product Teams",
        description: "Product managers use Trackr to evaluate project management, analytics, and roadmap tools in 2 minutes. Stop spending days on tool research. Start shipping.",
        headline: "Product managers research tools. Trackr makes it 10x faster.",
        subheadline: "Evaluate any PM tool in 2 minutes. Get scored reports on project management, analytics, roadmap, and collaboration tools — so you can make confident stack decisions and get back to building.",
        painPoints: [
            {
                title: "Tool evaluations interrupt your roadmap",
                description: "Every time someone asks 'should we use Linear or Jira?', that's a 6-hour detour from actual product work. Demos, G2 rabbit holes, Slack polls — all for a decision that still feels uncertain.",
            },
            {
                title: "Your team has opinions, not data",
                description: "Engineering wants Linear. Design wants Figma + Notion. Marketing wants Asana. Everyone has a preference. Nobody has a scored comparison with current pricing and integration analysis.",
            },
            {
                title: "Tool decisions don't age well",
                description: "The analytics tool you chose 18 months ago has been lapped by three new entrants. You have no systematic way to know when to re-evaluate — until the contract renewal forces the conversation.",
            },
        ],
        features: [
            {
                title: "Research any PM tool in 2 minutes",
                description: "Submit any URL — Linear, Jira, Notion, Asana, ClickUp, Mixpanel, Amplitude. Trackr's agents research current pricing, pull G2 and Reddit feedback, identify alternatives, and return a 7-dimension scored report.",
            },
            {
                title: "Side-by-side tool comparison",
                description: "Research two or three tools, then use Trackr's comparison view to evaluate them side-by-side. Share the comparison with your team so decisions are made on data, not whoever talks loudest.",
            },
            {
                title: "Stack renewal alerts",
                description: "Never let a tool auto-renew without a decision. Trackr tracks renewal dates and alerts you with enough lead time to re-evaluate the market and negotiate — or cancel without penalty.",
            },
        ],
        stat: {
            value: "2 min",
            label: "Average research time vs. 6+ hours manual",
        },
        faqs: [
            { q: "Can Trackr research developer tools too?", a: "Yes — Trackr researches tools across every category. Submit any URL including developer platforms, observability tools, CI/CD systems, or any other tool your team evaluates." },
            { q: "Can I share reports with engineering or design?", a: "Yes — reports are shareable with everyone in your workspace. Add team members so engineering can review the integration depth section and design can assess the feature depth before the decision is finalized." },
            { q: "Does Trackr track tools I'm not actively evaluating?", a: "Yes — your full current stack lives in Trackr's spend tracker. You can log every tool, its cost, and its renewal date, and set alerts for renewals 30–90 days out." },
        ],
        ctaText: "Research your next tool decision",
        ctaSubtext: "Free to start. No credit card required.",
        testimonialQuote: "I used to spend half a day on every tool evaluation. Now I submit the URL, get the report in 2 minutes, and spend the rest of the time actually discussing the decision with my team instead of sourcing data.",
        testimonialAttribution: "Senior Product Manager, Series B SaaS company",
    },
    {
        role: "sales-leaders",
        title: "Trackr for Sales Leaders — AI Tool Research for Revenue Teams",
        description: "Sales VPs and revenue leaders use Trackr to evaluate CRM, sales engagement, intelligence, and enablement tools in 2 minutes — with scored reports and alternatives.",
        headline: "Your sales stack is your competitive advantage. Trackr helps you build it right.",
        subheadline: "Research any sales tool in 2 minutes. Score CRM, sales engagement, revenue intelligence, and enablement tools across 7 dimensions — so every stack decision is backed by data, not vendor demos.",
        painPoints: [
            {
                title: "Vendor demos are designed to sell, not inform",
                description: "By the time you've done three Salesforce demos and two HubSpot presentations, you're in negotiation mode before you've completed your evaluation. Sales tool vendors are excellent at shaping the evaluation in their favor.",
            },
            {
                title: "Your reps have tool fatigue",
                description: "Every tool added to the sales stack has an adoption curve that costs quota-carrying time. Adding the wrong tool is worse than adding no tool. Yet most sales tool decisions are made with insufficient research.",
            },
            {
                title: "The revenue intelligence category moves fast",
                description: "Gong, Chorus, Clari, Salesloft, Outreach — the competitive landscape changes every six months. The tool you evaluated last year may not be the best option today, but you have no systematic way to stay current.",
            },
        ],
        features: [
            {
                title: "Research any sales tool in 2 minutes",
                description: "Submit any CRM, sales engagement, intelligence, or enablement tool URL. Trackr's research agents pull current pricing, surface real user feedback from sales practitioners, identify alternatives, and return a scored 7-dimension report.",
            },
            {
                title: "Independent analysis before vendor engagement",
                description: "Complete a full research report before scheduling the first demo. Go into vendor conversations informed about current pricing, known limitations, and competitive alternatives — not shaped by the vendor's narrative.",
            },
            {
                title: "Monitor your sales stack spend",
                description: "Track every tool in your revenue tech stack with monthly cost, seat count, and renewal dates. Identify overlap between tools and surface tools that may be underperforming against newer alternatives.",
            },
        ],
        stat: {
            value: "40%",
            label: "Average sales teams that have tool overlap in their stack",
        },
        faqs: [
            { q: "Can Trackr research sales tools that don't publish pricing?", a: "Yes — Trackr's research pulls from community sources, practitioner forums, and third-party benchmarks to surface realistic pricing ranges even when vendors don't publish rates publicly. The report includes context on what similar companies typically pay." },
            { q: "How does Trackr handle fast-moving categories like revenue intelligence?", a: "You can set any tool to auto-research on a weekly, bi-weekly, or monthly schedule. Trackr re-runs the full pipeline and alerts you when the score changes significantly — so you always have current intelligence without manual effort." },
            { q: "Can I share research with my CRO or CFO to justify a purchase?", a: "Yes — Trackr reports are shareable and printable. The structured format (score, pros/cons, competitive analysis, pricing) is designed to be decision-ready for stakeholder review without additional formatting work." },
        ],
        ctaText: "Build a data-driven sales stack",
        ctaSubtext: "Free to start. First research report in under 2 minutes.",
        testimonialQuote: "We evaluated six sales engagement platforms last quarter. Without Trackr, that would have been a 6-week process. We had scored reports on all six in a morning and went into demos knowing exactly what to ask.",
        testimonialAttribution: "VP of Sales, 120-person B2B SaaS company",
    },
    {
        role: "customer-success",
        title: "Trackr for Customer Success Teams — AI Tool Research for CS Leaders",
        description: "Customer success leaders use Trackr to evaluate CS platforms, health scoring tools, and support software in 2 minutes — with scored reports and competitive alternatives.",
        headline: "The right CS stack retains customers. Trackr helps you build it.",
        subheadline: "Research any customer success, support, or engagement tool in 2 minutes. Score Gainsight, ChurnZero, Intercom, and alternatives across 7 dimensions — before a single vendor demo.",
        painPoints: [
            {
                title: "CS platform decisions have multi-year consequences",
                description: "Gainsight or ChurnZero? Intercom or Zendesk? These are 2–3 year commitments with significant implementation costs. Getting the evaluation right the first time matters enormously.",
            },
            {
                title: "The CS tool landscape is fragmenting",
                description: "Customer health scoring, digital CS, community platforms, support ticketing, onboarding automation — the CS stack has exploded. Most CS leaders are evaluating more tools than ever with less time than ever.",
            },
            {
                title: "Churn is expensive. Wrong tools make it worse.",
                description: "If your CS platform doesn't surface at-risk accounts early enough, the cost isn't just the subscription — it's the customers you lose. Tool decisions in CS have direct revenue consequences.",
            },
        ],
        features: [
            {
                title: "Research any CS tool in 2 minutes",
                description: "Submit Gainsight, ChurnZero, Totango, Intercom, Zendesk, or any other CS tool URL. Get a scored report with current pricing, community feedback from CS practitioners, and alternatives — in under 2 minutes.",
            },
            {
                title: "Compare CS platforms side-by-side",
                description: "Research multiple CS platforms and compare them across the same 7-dimension framework. Bring structured comparisons to your CRO or CFO instead of a deck built from vendor marketing materials.",
            },
            {
                title: "Track your CS stack renewal dates",
                description: "Log every CS tool with its cost and renewal date. Trackr alerts you 30–60 days before renewals so you have time to re-evaluate alternatives and negotiate from a position of knowledge.",
            },
        ],
        stat: {
            value: "3x",
            label: "Faster evaluation cycle compared to traditional methods",
        },
        faqs: [
            { q: "Does Trackr evaluate support tools as well as CS platforms?", a: "Yes — Trackr researches tools across the full customer-facing stack: CS platforms (Gainsight, ChurnZero), support ticketing (Zendesk, Intercom, Freshdesk), community platforms, onboarding tools, and more." },
            { q: "Can I use Trackr to build a business case for a CS platform upgrade?", a: "Yes — Trackr reports include a scored evaluation, pros/cons, competitive alternatives, and pricing context. That structure is well-suited for building a business case document without starting from scratch." },
            { q: "My CS team is small. Is Trackr still useful?", a: "Absolutely — Trackr's free plan covers 3 research reports per month. For a small CS team evaluating tools once a quarter, the free tier often provides everything you need." },
        ],
        ctaText: "Research your CS stack intelligently",
        ctaSubtext: "Free to start. No implementation required.",
        testimonialQuote: "We were about to sign a 2-year Gainsight contract when I ran it through Trackr. The competitive analysis surfaced ChurnZero as a stronger fit for our ARR band. That 2-minute report saved us 6 figures.",
        testimonialAttribution: "Head of Customer Success, 80-person SaaS company",
    },
    {
        role: "hr-leaders",
        title: "Trackr for HR Leaders — AI Tool Research for People Teams",
        description: "HR leaders and CHROs use Trackr to evaluate HRIS, ATS, performance management, and people analytics tools — with AI-powered scoring and competitive alternatives in 2 minutes.",
        headline: "HR tech decisions affect every employee. Make them with data.",
        subheadline: "Research any HR tool in 2 minutes. Score HRIS, ATS, performance management, and learning platforms across 7 dimensions — so you stop relying on vendor demos and start evaluating with independent intelligence.",
        painPoints: [
            {
                title: "HRIS decisions take months and affect everyone",
                description: "Workday, BambooHR, Rippling, Gusto — an HRIS migration touches every employee and every HR workflow. The stakes of getting this decision wrong are high, and the evaluation process is notoriously vendor-controlled.",
            },
            {
                title: "The HR tech landscape is overwhelming",
                description: "HRIS, ATS, L&D, engagement surveys, performance management, payroll, benefits administration — each category has 10+ vendors. HR teams are expected to evaluate all of them without dedicated research resources.",
            },
            {
                title: "No framework for comparing tools across categories",
                description: "You can compare two ATS systems, but how do you compare an ATS against a broader HRIS that includes recruiting? Trackr's 7-dimension framework applies consistently across categories.",
            },
        ],
        features: [
            {
                title: "Research any HR tool in 2 minutes",
                description: "Submit any HRIS, ATS, performance, or L&D tool URL. Trackr's research agents pull current pricing, surface HR practitioner feedback from Reddit and G2, identify alternatives, and return a scored report.",
            },
            {
                title: "Compare HR platforms with one framework",
                description: "Research Workday, Rippling, and BambooHR across the same 7-dimension scorecard. Bring structured comparisons to your CEO or CFO instead of vendor-produced comparison matrices.",
            },
            {
                title: "Track your HR tech stack and renewals",
                description: "Log every HR tool with its cost and renewal date. Identify overlap between tools — especially useful in companies that have grown through acquisition and have duplicate HR systems.",
            },
        ],
        stat: {
            value: "60+",
            label: "Average number of HR tech tools in a 500-person company",
        },
        faqs: [
            { q: "Can Trackr research niche HR tools like specific ATS platforms?", a: "Yes — Trackr researches any tool with a website, including niche ATS platforms, specialized L&D tools, and emerging HR tech products that haven't yet built large G2 review bases. The report will have less community sentiment data for very new tools, but the feature analysis and pricing research is still valuable." },
            { q: "Does Trackr understand HR-specific evaluation criteria?", a: "Trackr's 7-dimension framework covers the core criteria most relevant to HR tools: Core Capability, Ease of Use, Integration Depth, Pricing Value, AI Sophistication, Community & Support, and Scalability. For HR-specific customization, the scorecard recipe feature on Startup+ plans lets you weight these dimensions to match your priorities." },
            { q: "Is Trackr GDPR compliant?", a: "Trackr stores workspace and tool data in a SOC2-compliant cloud environment. We do not store employee data. Your tool research and stack data are private to your workspace by default." },
        ],
        ctaText: "Research your HR tech stack intelligently",
        ctaSubtext: "Free to start. Enterprise plans available.",
        testimonialQuote: "HR tech vendors are very good at demos. Trackr gave our team independent research before we engaged any of them, which completely changed how we ran our ATS evaluation. We asked better questions, pushed back more effectively, and made a faster decision.",
        testimonialAttribution: "CHRO, 400-person B2B company",
    },
    {
        role: "legal-teams",
        title: "Trackr for Legal and Compliance Teams — AI Tool Research for Legal Tech",
        description: "Legal teams and GCs use Trackr to evaluate contract management, e-signature, CLM, and compliance tools — with AI-powered scoring and independent analysis in 2 minutes.",
        headline: "Legal tech decisions deserve the same rigor as legal work.",
        subheadline: "Research any legal, compliance, or contract management tool in 2 minutes. Score CLM platforms, e-signature tools, and legal research software across 7 dimensions — independently, before the vendor sales cycle begins.",
        painPoints: [
            {
                title: "Legal software evaluations are unusually vendor-driven",
                description: "CLM vendors, e-signature platforms, and legal research tools all use high-touch sales processes designed to create urgency and limit your ability to make independent comparisons. Docusign vs Adobe Sign vs PandaDoc shouldn't require a 6-week evaluation cycle.",
            },
            {
                title: "Compliance tools are high-stakes and difficult to evaluate",
                description: "A compliance tool failure can mean regulatory fines or missed obligations. Yet legal and compliance tool evaluations often rely on vendor-provided feature lists and reference calls that vendors curate. Independent analysis is hard to find.",
            },
            {
                title: "Legal team tool decisions often lack structured documentation",
                description: "When legal purchases a CLM platform, the decision rationale often lives in someone's email. Two years later at renewal, nobody can reconstruct why you chose that platform over the alternatives.",
            },
        ],
        features: [
            {
                title: "Research any legal or compliance tool in 2 minutes",
                description: "Submit any CLM, e-signature, legal research, compliance management, or contract analysis tool URL. Get a scored report with independent analysis, community feedback, and competitive alternatives.",
            },
            {
                title: "Defensible documentation of the evaluation",
                description: "Trackr reports create a structured audit trail of every tool decision — scores, pros/cons, alternatives considered, and the date of the evaluation. Useful for renewal justification and internal governance.",
            },
            {
                title: "Track legal tech renewals with alerts",
                description: "Log your full legal tech stack with costs and renewal dates. Get alerts 30–60 days before renewals — with enough lead time to re-evaluate alternatives or negotiate terms.",
            },
        ],
        stat: {
            value: "73%",
            label: "Of legal teams report evaluating new tools in the past 12 months",
        },
        faqs: [
            { q: "Does Trackr understand legal-specific tools like CLM platforms?", a: "Trackr's AI research pipeline evaluates any SaaS tool, including specialized legal tech like CLM (ContractPodAi, Ironclad, DocuSign CLM), e-signature (Adobe Sign, PandaDoc), and legal research platforms. The 7-dimension framework applies across categories." },
            { q: "Can I use Trackr to document tool decisions for compliance purposes?", a: "Trackr reports include a timestamped record of the evaluation — scores, data sources, pros/cons, and alternatives reviewed. This structured documentation can support internal audit and governance requirements." },
            { q: "How does Trackr handle tools where pricing isn't public?", a: "For tools with opaque pricing (common in enterprise legal tech), Trackr's research pulls from community benchmarks, disclosed pricing ranges, and practitioner forums to provide realistic range estimates with appropriate context." },
        ],
        ctaText: "Build a defensible legal tech evaluation process",
        ctaSubtext: "Free to start. Team plans for collaborative evaluation.",
        testimonialQuote: "We evaluated four CLM platforms and needed documentation for our CFO approval. Trackr gave us consistent scored reports on all four that we could put directly into our business case. Saved us 20+ hours of formatting work.",
        testimonialAttribution: "General Counsel, 250-person SaaS company",
    },
];

export const ICP_ROLES = ICP_PAGES.map((p) => p.role);
