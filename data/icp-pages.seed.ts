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
    {
        role: "procurement",
        title: "Trackr for Procurement Teams — AI Tool Research and Vendor Intelligence",
        description: "Procurement teams use Trackr to evaluate vendors faster, build defensible business cases, and manage SaaS renewals with AI-powered research in 2 minutes.",
        headline: "Procurement intelligence that keeps up with your evaluation pipeline.",
        subheadline: "AI-powered tool research in 2 minutes. Consistent 7-dimension scoring across every vendor. Renewal alerts with live competitive intelligence — built for modern procurement workflows.",
        painPoints: [
            {
                title: "Vendor evaluations take weeks and still feel incomplete",
                description: "The standard procurement process — RFP, demos, reference calls, internal review — takes 4–8 weeks per tool. By the time the process completes, requirements may have shifted and the team has already lost confidence in the recommendation.",
            },
            {
                title: "Business cases lack independent scoring",
                description: "CFO approvals require defensible justification. But most vendor comparisons are built from vendor-provided materials — feature lists, case studies, and pricing quotes that reflect the best possible framing of each tool's capabilities.",
            },
            {
                title: "SaaS renewal cycles create recurring scrambles",
                description: "Enterprise software contracts renew on schedules that rarely align with procurement bandwidth. Renewals surface with insufficient lead time to re-evaluate the market, negotiate effectively, or consider alternatives.",
            },
        ],
        features: [
            {
                title: "AI research reports in 2 minutes",
                description: "Submit any vendor URL. Trackr's agents generate a scored research report — current pricing, 7-dimension evaluation, pros/cons, competitive alternatives, and community feedback from independent sources.",
            },
            {
                title: "Consistent scoring framework across all vendors",
                description: "The same 7-dimension scorecard applies to every tool you evaluate, producing comparable reports that make multi-vendor comparisons structured and defensible — not dependent on whoever produced the analysis.",
            },
            {
                title: "Renewal calendar with advance intelligence",
                description: "Track all contract renewal dates across your tech stack. Get 60-day alerts with enough lead time to run fresh competitive research, brief stakeholders, and negotiate from a position of current market knowledge.",
            },
        ],
        stat: {
            value: "87%",
            label: "Of procurement teams report AI tool evaluations as their fastest-growing category",
        },
        faqs: [
            { q: "How does Trackr fit into an existing procurement process?", a: "Trackr is the research layer before your formal procurement workflow begins. Submit tool candidates to Trackr during initial discovery — use the scored reports to shortlist vendors before investing in formal RFPs and demos. Trackr also integrates at the renewal stage, providing fresh intelligence when contracts come up for re-evaluation." },
            { q: "Can Trackr help build vendor comparison matrices?", a: "Yes. Trackr's 7-dimension reports apply the same scoring framework to every vendor, making cross-vendor comparison matrices straightforward to build. Export reports as PDF or CSV and attach them to your business case or vendor review documentation." },
            { q: "How does Trackr handle vendors with undisclosed pricing?", a: "For tools with opaque pricing — common in enterprise SaaS — Trackr's research pipeline surfaces community-reported pricing benchmarks, disclosed price ranges from third-party sources, and contextual analysis of what similar companies report paying. The report provides realistic range expectations, not just vendor-quoted list prices." },
            { q: "Is Trackr useful for non-AI software categories?", a: "Yes. Despite the name, Trackr researches any SaaS tool — CRM, ERP, HR platforms, security tools, analytics, and AI-specific tools. The research agents evaluate based on current market data, not category-specific rules." },
        ],
        ctaText: "Streamline your vendor evaluation process",
        ctaSubtext: "Free to start. Team plans for procurement workflows.",
        testimonialQuote: "We cut our initial vendor shortlisting process from 3 weeks to 3 days. Trackr gives us independent scores we can put directly into our approval docs without the 'but that's from the vendor' pushback.",
        testimonialAttribution: "Senior Procurement Manager, enterprise software company",
    },
    {
        role: "vp-strategy",
        title: "Trackr for Strategy Leaders — AI Tool Intelligence for Executive Decision-Making",
        description: "VPs of Strategy and Chief of Staff use Trackr to research AI tools for the business, evaluate build vs. buy decisions, and maintain AI stack intelligence across the organization.",
        headline: "Strategy requires current intelligence. Trackr provides it.",
        subheadline: "Research any AI or SaaS tool in 2 minutes. Get independent scoring, competitive context, and renewal intelligence across your full stack — with the depth and consistency executive decisions require.",
        painPoints: [
            {
                title: "AI tool evaluations arrive from every direction",
                description: "Your team surfaces five new AI tools a week. Sales wants to evaluate a sequencer. Engineering wants a code assistant. Finance wants a forecasting tool. Each evaluation requires independent research — and there's no centralized, consistent framework to evaluate across them.",
            },
            {
                title: "Build vs. buy decisions lack structured intelligence",
                description: "When leadership asks 'should we build this or buy it?', the answer depends on a clear-eyed view of what existing products do and at what cost. That intelligence rarely exists in a structured form that executives can evaluate.",
            },
            {
                title: "The AI stack is fragmented and ungoverned",
                description: "Individual teams make tool decisions independently. By the time strategy leadership gets visibility, there are overlapping tools, redundant subscriptions, and no record of why decisions were made — making consolidation or review impossible.",
            },
        ],
        features: [
            {
                title: "Executive-quality research reports in 2 minutes",
                description: "Submit any tool URL and get an AI-generated report with 7-dimension scoring, independent community analysis, competitive alternatives, and current pricing — structured to brief leadership without hours of preparation.",
            },
            {
                title: "Stack-level visibility across the organization",
                description: "Track every tool across functions — who's using it, what you're paying, and when contracts renew. Get a single view of your AI stack without requiring every team to submit a status update.",
            },
            {
                title: "Structured record of every evaluation decision",
                description: "Every research report is timestamped and archived. When leadership asks 'why did we choose X over Y?', the answer is in Trackr — including what alternatives were considered and what the scores showed at the time.",
            },
        ],
        stat: {
            value: "3.2x",
            label: "More AI tools added to enterprise stacks annually vs. 2023",
        },
        faqs: [
            { q: "Can Trackr support company-wide AI strategy reviews?", a: "Yes. Trackr's workspace feature allows you to track the full AI stack across teams, with spend data, renewal calendars, and research history. This gives strategy leaders the visibility to run structured quarterly reviews of the AI portfolio." },
            { q: "How does Trackr help with build vs. buy decisions?", a: "Trackr generates a comprehensive market view of any solution category — what tools exist, what they score across 7 dimensions, their pricing, and what the community says about ROI. That intelligence is the starting point for any credible build vs. buy analysis." },
            { q: "Is Trackr useful at the executive level or just for individual evaluators?", a: "Both. Individual contributors use Trackr to generate initial research. Strategy leaders use the workspace view to get portfolio-level visibility, run renewal reviews, and build structured AI stack governance." },
        ],
        ctaText: "Build an AI-ready tool intelligence layer",
        ctaSubtext: "Free to start. Enterprise plans for org-wide visibility.",
        testimonialQuote: "I use Trackr to stay current on AI tools before anyone on my team asks for my opinion. When a VP brings a tool recommendation to my desk, I've already seen the independent score.",
        testimonialAttribution: "VP of Strategy, Series C SaaS company",
    },
    {
        role: "security-leaders",
        title: "Trackr for Security Leaders — AI Tool Security Evaluation and Vendor Risk",
        description: "CISOs and security leaders use Trackr to evaluate AI tools for security posture, data handling practices, and compliance risks — before procurement commits.",
        headline: "Every AI tool your company adopts is a security decision.",
        subheadline: "Trackr helps security leaders evaluate AI and SaaS tools for security posture, data handling transparency, and vendor risk — with independent research in 2 minutes and a structured 7-dimension framework.",
        painPoints: [
            {
                title: "AI tool procurement moves faster than security review",
                description: "Teams adopt AI tools on credit cards before security has a chance to evaluate them. By the time security is involved, the tool is embedded in workflows and user data has already been processed through an unreviewed vendor's systems.",
            },
            {
                title: "Security evaluation of AI tools requires specialized knowledge",
                description: "AI tools introduce distinct risk vectors — training on customer data, unclear retention policies, third-party AI model dependencies, and regulatory uncertainty. Evaluating these requires more than a standard vendor questionnaire.",
            },
            {
                title: "No consistent framework for AI tool risk assessment",
                description: "Security teams evaluate tools inconsistently — different criteria for different tools, driven by whoever has bandwidth. Without a standardized framework, risk comparisons across tools are impossible and audit documentation is weak.",
            },
        ],
        features: [
            {
                title: "Security dimension in every research report",
                description: "Every Trackr report includes a security and compliance dimension — covering data handling transparency, SOC 2 status, enterprise security features, and known privacy concerns surfaced from community and compliance sources.",
            },
            {
                title: "Independent vendor analysis before procurement commits",
                description: "Trackr gives security leaders an independent research baseline on any tool — before the vendor sales process begins. Use the report to structure vendor security questionnaires and due diligence around the actual risk vectors for each tool.",
            },
            {
                title: "Centralized AI tool inventory for security governance",
                description: "Track every AI tool deployed across the organization with a persistent record of when each was evaluated, what the security assessment showed, and what the current compliance posture is. Use this for audit documentation and board reporting.",
            },
        ],
        stat: {
            value: "61%",
            label: "Of CISOs report AI tool shadow adoption as a top security concern",
        },
        faqs: [
            { q: "Does Trackr assess a tool's security posture specifically?", a: "Trackr's 7-dimension framework includes a security and compliance dimension that covers data handling policies, SOC 2 / ISO 27001 certification status, enterprise security features, and community-reported concerns. It's an initial assessment tool — not a replacement for a formal security audit or vendor questionnaire." },
            { q: "Can Trackr help with AI tool governance policy?", a: "Trackr provides the inventory and evaluation framework that underpins a governance policy. Security leaders use Trackr to build the approved tool list, document evaluation criteria, and track the AI stack for policy enforcement." },
            { q: "How does Trackr handle AI tools with opaque data practices?", a: "When a tool's data handling practices are unclear or poorly documented, Trackr flags this in the report with appropriate context. Opacity in AI tool data practices is itself a risk signal — Trackr identifies it as part of the security dimension." },
            { q: "Can I share Trackr reports with my security team?", a: "Yes. Reports are shareable within your workspace and can be exported as PDF for distribution to security teams, procurement, and legal. Enterprise plans support team workspaces with role-based access." },
        ],
        ctaText: "Build a secure AI tool evaluation process",
        ctaSubtext: "Free to start. Enterprise plans for security governance.",
        testimonialQuote: "We now require a Trackr report before any AI tool can be expensed. It gives our team a consistent baseline and flags the data handling questions we need answered before procurement commits.",
        testimonialAttribution: "CISO, 800-person enterprise software company",
    },
    {
        role: "data-teams",
        title: "AI Tools for Data Teams | Trackr",
        description: "Data engineers, analysts, and data scientists use Trackr to evaluate AI and analytics tools — scoring them on data pipeline fit, model quality, and integration depth in under 2 minutes.",
        headline: "The data team's AI tool intelligence layer.",
        subheadline: "Evaluate any AI or analytics tool in 2 minutes. Get independent scoring on data pipeline compatibility, model quality, and integration depth — so your stack decisions are defensible.",
        painPoints: [
            {
                title: "AI tool evaluation is a full-time job",
                description: "The AI tooling landscape for data teams changes weekly. New vector databases, orchestration frameworks, observability platforms, and LLM wrappers launch constantly. Evaluating each one properly takes research time your team doesn't have.",
            },
            {
                title: "Integration compatibility is discovered after purchase",
                description: "A tool looks perfect in the demo. Then your engineering team spends two weeks discovering it doesn't integrate cleanly with your warehouse, pipeline orchestrator, or existing ML infrastructure. Integration depth is rarely surfaced in vendor marketing.",
            },
            {
                title: "No consistent framework for cross-tool comparison",
                description: "When your team evaluates three competing data tools, each person uses different criteria. The resulting spreadsheet is a mess of incomparable scores and subjective notes — making it impossible to present a clear recommendation to leadership.",
            },
        ],
        features: [
            {
                title: "Integration depth scoring in every report",
                description: "Trackr's research pipeline specifically evaluates integration compatibility — with major warehouses, orchestration tools, and the most common data stacks. Know what integrates cleanly before you commit.",
            },
            {
                title: "Consistent 7-dimension scoring for every tool",
                description: "Apply the same framework to every evaluation: Core Capability, Ease of Use, Integration Depth, Pricing Value, AI Sophistication, Community & Support, and Scalability. Compare any two tools on the same scale.",
            },
            {
                title: "Community signal from real data practitioners",
                description: "Trackr's research incorporates practitioner discussion from Reddit, data engineering communities, and technical forums — surfacing real-world integration issues, performance problems, and hidden costs that vendor marketing doesn't mention.",
            },
        ],
        stat: {
            value: "4.3x",
            label: "Increase in AI tool evaluations requested of data teams since 2023",
        },
        faqs: [
            { q: "Does Trackr evaluate tools like dbt, Snowflake, or Databricks?", a: "Yes — Trackr can research any SaaS or platform tool with a public website. Data warehouse platforms, transformation tools, orchestration frameworks, and ML platforms are all within scope." },
            { q: "How does Trackr surface integration compatibility?", a: "The Integration Depth dimension of Trackr's 7-dimension framework specifically evaluates documented integrations, connector ecosystem breadth, and community-reported compatibility with common stack components. It's one of the seven scored dimensions in every report." },
            { q: "Is Trackr useful for evaluating open-source tools?", a: "For open-source tools with public documentation and community discussion, Trackr generates research reports. The pricing dimension reflects open-source licensing vs managed cloud offerings, and the Community & Support dimension reflects the health and activity of the project community." },
            { q: "Can Trackr help compare vector databases or LLM frameworks?", a: "Yes — Trackr is particularly well-suited for the AI-native tooling category where the landscape moves fast and standard review sites lack coverage. Submit any vector DB, embedding service, or LLM infrastructure tool for a scored 7-dimension report." },
        ],
        ctaText: "Research your next data tool in 2 minutes",
        ctaSubtext: "Free to start. No demo required. Consistent scoring on every tool.",
        testimonialQuote: "I used to spend a full afternoon evaluating each new tool. Trackr gives me a scored report in 2 minutes that I can actually share with my manager without embarrassing myself.",
        testimonialAttribution: "Senior Data Engineer, Series B fintech company",
    },
    {
        role: "ciso",
        title: "AI Tools for CISOs — Security-First Tool Evaluation | Trackr",
        description: "CISOs use Trackr to evaluate AI and SaaS tools for security posture, data handling risk, and compliance alignment — independent research in 2 minutes before procurement commits.",
        headline: "Every AI tool your company adopts is a security decision.",
        subheadline: "Trackr gives CISOs independent, scored evaluation of any AI or SaaS tool — covering data handling, SOC 2 status, enterprise security features, and vendor risk — before the purchase decision is made.",
        painPoints: [
            {
                title: "AI tool adoption outpaces security review",
                description: "Teams adopt AI tools on personal or department credit cards before security sees them. By the time your team is involved, company data has already been processed through an unreviewed vendor's infrastructure — sometimes trained on, depending on the terms.",
            },
            {
                title: "Vendor security questionnaires take weeks per tool",
                description: "The formal VSQ process is thorough — but slow. By the time security completes a review, the business case has moved on or the team has adopted the tool anyway. You need a faster first-pass assessment to triage which tools warrant full review.",
            },
            {
                title: "No standardized baseline for AI-specific risk",
                description: "Standard vendor questionnaires weren't designed for AI tools. LLM data retention, model training practices, third-party AI API dependencies, and emerging regulatory requirements require AI-specific evaluation criteria that most security frameworks haven't yet codified.",
            },
        ],
        features: [
            {
                title: "Security dimension scored in every report",
                description: "Every Trackr report includes a security and compliance dimension — covering SOC 2 / ISO 27001 certification status, data handling transparency, enterprise security features, and known community-reported concerns. A structured first-pass before the formal VSQ.",
            },
            {
                title: "Centralized AI tool inventory for governance",
                description: "Maintain a persistent record of every AI tool in your organization — when it was evaluated, what the security assessment showed, and what the current posture is. Use this for audit documentation, board reporting, and policy enforcement.",
            },
            {
                title: "Independent research before the sales process starts",
                description: "Trackr gives you an independent view of any tool before the vendor sales team has a chance to shape your perception. Use the research baseline to build targeted VSQ questions around the specific risk vectors each tool introduces.",
            },
        ],
        stat: {
            value: "61%",
            label: "Of CISOs cite unsanctioned AI tool adoption as a top-3 security concern in 2025",
        },
        faqs: [
            { q: "Does Trackr replace a formal vendor security questionnaire?", a: "No — Trackr is a fast first-pass assessment tool, not a replacement for a formal VSQ or audit. It helps security teams triage which tools warrant the full review process and what specific questions to prioritize." },
            { q: "How does Trackr handle tools with opaque data practices?", a: "When a tool's data handling is poorly documented or unclear, Trackr flags this in the security dimension with appropriate context. Opacity in AI data practices is itself a risk signal — Trackr surfaces it consistently." },
            { q: "Can I use Trackr to build an approved AI tools list?", a: "Yes. Trackr's workspace feature lets you track every evaluated tool with its score and security assessment. Many security leaders use this as the foundation for an approved AI tool registry and enforcement policy." },
            { q: "Does Trackr cover regulatory compliance like GDPR or HIPAA?", a: "The security dimension includes community-reported compliance certifications and known regulatory concerns. It's not a substitute for legal review, but it surfaces which tools have documented compliance posture and which lack transparency." },
        ],
        ctaText: "Build a security-first AI evaluation process",
        ctaSubtext: "Free to start. Enterprise plans for org-wide governance.",
        testimonialQuote: "Trackr is how we triage now. Before any formal VSQ, I run a Trackr report to understand what questions I should even be asking. It saves our security team 4 hours per evaluation.",
        testimonialAttribution: "CISO, 1,200-person SaaS company",
    },
    {
        role: "compliance-officers",
        title: "AI Tools for Compliance Officers | Trackr",
        description: "Compliance officers use Trackr to evaluate AI and SaaS tools for regulatory risk, data handling transparency, and compliance posture — independent scoring in 2 minutes before procurement commits.",
        headline: "Research AI tools before compliance finds out the hard way.",
        subheadline: "Trackr gives compliance teams independent, scored evaluation of any AI or SaaS tool — covering data residency, regulatory certifications, and vendor risk — before adoption decisions are made.",
        painPoints: [
            {
                title: "AI adoption creates compliance exposure nobody mapped",
                description: "Sales adopted an AI sequencer. Finance adopted an AI forecasting tool. Legal adopted an AI contract reviewer. Each tool processes company and customer data — often with terms that create GDPR, SOC 2, or industry-specific compliance exposure nobody reviewed.",
            },
            {
                title: "Regulatory requirements for AI tools are still evolving",
                description: "EU AI Act, state-level AI regulations, and sector-specific rules are materializing faster than vendor compliance certifications. Evaluating a tool's regulatory posture requires current intelligence — not a vendor's self-reported compliance page that was last updated in 2023.",
            },
            {
                title: "No systematic way to track the AI tool compliance posture",
                description: "Compliance teams typically learn about AI tool adoption after the fact — through a security incident, an audit finding, or a vendor data breach notification. There's no proactive inventory of what tools are in use and what their compliance posture is.",
            },
        ],
        features: [
            {
                title: "Compliance dimension in every scored report",
                description: "Trackr surfaces SOC 2, ISO 27001, GDPR, HIPAA, and other certification status for any tool — plus data residency options, sub-processor transparency, and community-reported compliance concerns. A fast first-pass before formal review.",
            },
            {
                title: "Persistent compliance inventory across your AI stack",
                description: "Track every AI tool your organization uses with a record of its compliance posture at evaluation time. Use this for audit documentation, board reporting, and demonstrating to regulators that AI adoption was subject to structured review.",
            },
            {
                title: "Community intelligence on regulatory edge cases",
                description: "Trackr's research incorporates community discussion about real-world compliance issues — including cases where a tool's published compliance page differed from actual data handling practices discovered during audits or incidents.",
            },
        ],
        stat: {
            value: "78%",
            label: "Of enterprise compliance teams have discovered unreviewed AI tools during audits",
        },
        faqs: [
            { q: "Can Trackr tell me if a tool is GDPR-compliant?", a: "Trackr surfaces documented GDPR compliance certifications and data processing agreements from vendors, along with community-reported concerns. It's a research starting point — not a substitute for legal review of specific data processing terms." },
            { q: "How current is Trackr's compliance data?", a: "Trackr generates reports from live sources at the time you submit. Compliance certifications, data residency options, and community concerns reflect the current state — not a cached review from 12-18 months ago." },
            { q: "Does Trackr help with AI Act compliance specifically?", a: "Trackr surfaces available information about a tool's AI risk classification, transparency practices, and any community discussion about regulatory positioning. As EU AI Act requirements clarify, Trackr's research pipeline incorporates emerging compliance signals." },
            { q: "Can I export Trackr reports for audit documentation?", a: "Yes — reports export as PDF and shareable links. Many compliance teams include Trackr reports in their vendor evaluation documentation to demonstrate that AI tools were subject to structured independent review." },
        ],
        ctaText: "Research AI tool compliance in 2 minutes",
        ctaSubtext: "Free to start. Enterprise plans for org-wide compliance tracking.",
        testimonialQuote: "Before Trackr, we were finding out about AI tool adoption during audits. Now compliance is part of the evaluation process — and we have documentation to show for it.",
        testimonialAttribution: "Chief Compliance Officer, regulated financial services firm",
    },
    {
        role: "office-managers",
        title: "AI Tools for Office Managers | Trackr",
        description: "Office managers use Trackr to research and track productivity and operations software — evaluating tools quickly, tracking renewals, and avoiding duplicate subscriptions across teams.",
        headline: "Stop drowning in tool subscriptions you didn't fully evaluate.",
        subheadline: "Trackr helps office managers research any productivity or operations tool in 2 minutes, track every renewal date, and flag overlapping subscriptions before the credit card charge hits.",
        painPoints: [
            {
                title: "Every team asks you to evaluate a different tool",
                description: "HR wants a new scheduling tool. Finance wants an expense platform. Facilities wants a visitor management system. You're the de facto tool evaluator for the entire office — and you have zero time to do each evaluation properly.",
            },
            {
                title: "Renewal dates are scattered across inboxes and calendars",
                description: "Eighteen different SaaS subscriptions renew at different times across the year. Some auto-renew. Some require 30-day notice to cancel. The first time you know a renewal is happening is when you see the charge on the company card.",
            },
            {
                title: "You're paying for tools nobody actually uses",
                description: "The tool the previous office manager bought in 2022 is still renewing annually. Three people have logins. Nobody can remember why they bought it. Canceling requires finding the contract, the login, and the contact — none of which are in one place.",
            },
        ],
        features: [
            {
                title: "Research any tool in 2 minutes — no deep dives required",
                description: "Submit a tool URL and get a scored report covering pricing, key features, ease of use, and what real users say — structured to give you a confident recommendation without spending your afternoon on G2 reviews.",
            },
            {
                title: "Renewal calendar with 60-day advance alerts",
                description: "Track every tool subscription in one place with auto-alerts 60 days before renewal. Never get surprised by an annual charge again — and have enough lead time to evaluate, negotiate, or cancel before the contract auto-renews.",
            },
            {
                title: "Overlap detection across your operations stack",
                description: "Trackr flags when two tools in your stack serve overlapping functions — helping you identify redundant subscriptions before they compound. When a new tool request comes in, see immediately if you already have something that does the same job.",
            },
        ],
        stat: {
            value: "34%",
            label: "Of SMB office SaaS subscriptions are unused or duplicated at any given time",
        },
        faqs: [
            { q: "Do I need to be technical to use Trackr?", a: "No — Trackr is designed for non-technical users. Submit a tool's website URL, read the scored report in plain language, and make a confident decision. No coding, no complex setup, no IT required." },
            { q: "Can I track tools purchased on multiple cards?", a: "Yes. Trackr's stack tracker lets you manually add any tool regardless of how it was purchased — by credit card, invoice, or company account. You can note the cost and renewal date for each." },
            { q: "Can I share Trackr reports with the person requesting the tool?", a: "Yes — reports are shareable via URL or PDF export. Send the scored report back to the person who requested the tool so they can see the independent evaluation before you make a recommendation." },
            { q: "Is Trackr useful for one-off tool evaluations or only ongoing stack tracking?", a: "Both. Use it to research a single tool when a request comes in. Use the stack tracker feature for ongoing renewal management. Many office managers start with one-off research and add stack tracking once they see the renewal alert value." },
        ],
        ctaText: "Research your next tool request in 2 minutes",
        ctaSubtext: "Free to start. No technical knowledge required.",
        testimonialQuote: "I used to spend two hours per tool request pulling together research. Now I run a Trackr report, share the link, and move on. The renewal alerts alone have saved us three auto-renew surprises this year.",
        testimonialAttribution: "Office Manager, 120-person professional services firm",
    },
    {
        role: "biz-dev",
        title: "AI Tools for Business Development | Trackr",
        description: "Business development leaders use Trackr to evaluate AI tools for prospecting, partnership intelligence, market research, and BD workflow automation — scored research in 2 minutes.",
        headline: "The BD team's AI tool evaluation layer.",
        subheadline: "Research any AI or BD software tool in 2 minutes. Get independent scoring on prospecting capability, integration fit, and pricing value — before you commit to a tool that buries your team in bad workflow.",
        painPoints: [
            {
                title: "AI BD tools make big promises and deliver inconsistently",
                description: "Every AI prospecting tool claims to find better leads faster. The reality varies wildly — data freshness, intent signal quality, CRM integration depth, and actual email deliverability all differ dramatically from demo to live deployment. The only way to find out is an expensive trial.",
            },
            {
                title: "BD stack decisions are made on vendor demos, not independent research",
                description: "Your vendor evaluation process is three demos and a gut check. By the time you've discovered the tool doesn't integrate cleanly with your CRM or the data coverage is weak in your market, you're six weeks into an annual contract.",
            },
            {
                title: "Stack overlap burns budget on duplicate prospecting data",
                description: "You have ZoomInfo, Apollo, and LinkedIn Sales Navigator. Three tools that partially overlap. Nobody mapped the overlap before purchase — and now you're paying three times for data that partially duplicates.",
            },
        ],
        features: [
            {
                title: "Integration depth scoring for your BD stack",
                description: "Trackr evaluates how deeply any BD tool integrates with CRM platforms, sequencers, and enrichment layers. Know before you buy whether the tool plays nicely with your Salesforce, HubSpot, or Outreach setup.",
            },
            {
                title: "AI nativeness scoring for prospecting tools",
                description: "The AI Sophistication dimension evaluates how meaningfully AI is used versus how much it's just branding. Separate tools that genuinely use AI for intent data and personalization from those with AI-washed feature names.",
            },
            {
                title: "Stack overlap detection across your BD tech",
                description: "Track your full BD stack and Trackr flags functional overlap — identifying where you're paying twice for similar data sources or workflow capabilities. Run a stack rationalization before your next renewal cycle.",
            },
        ],
        stat: {
            value: "6.2x",
            label: "Average number of BD tools evaluated before purchase in 2025",
        },
        faqs: [
            { q: "Can Trackr evaluate sales intelligence platforms like ZoomInfo or Apollo?", a: "Yes — submit any BD or sales intelligence tool's URL and Trackr generates a full scored report. This includes data coverage, pricing tiers, integration depth, CRM compatibility, and community sentiment on data quality." },
            { q: "How does Trackr's AI nativeness score work for BD tools?", a: "The AI Sophistication dimension evaluates whether AI features are core to the product's value delivery or surface-level additions. For BD tools, this includes whether AI genuinely improves lead scoring, intent detection, or personalization versus AI-branded marketing copy." },
            { q: "Can I compare multiple BD tools side by side?", a: "Yes — Trackr applies the same 7-dimension framework to every tool you research. Research Apollo, ZoomInfo, and Clay in the same session and compare their scores across the same dimensions." },
            { q: "Is Trackr useful for evaluating partnership intelligence tools?", a: "Yes. Partnership intelligence platforms, ecosystem management tools, and partner portal software are all within Trackr's research scope. Submit the URL and get scored research regardless of how niche the tool is." },
        ],
        ctaText: "Research your next BD tool in 2 minutes",
        ctaSubtext: "Free to start. Compare multiple tools on the same framework.",
        testimonialQuote: "We used to commit to BD tools after one demo. Now I run every finalist through Trackr first. We've avoided two bad tool decisions this year based on the integration depth scores alone.",
        testimonialAttribution: "Head of Business Development, Series B SaaS company",
    },
    {
        role: "digital-transformation",
        title: "AI Tools for Digital Transformation Leaders | Trackr",
        description: "Digital transformation leaders use Trackr to evaluate AI and enterprise software tools — scoring them on integration depth, scalability, change management fit, and long-term viability before committing.",
        headline: "Digital transformation requires better tool intelligence.",
        subheadline: "Evaluate any enterprise software or AI tool in 2 minutes. Get independent scoring on integration complexity, scalability, vendor viability, and implementation risk — before your team commits to a multi-year rollout.",
        painPoints: [
            {
                title: "Tool selection mistakes are expensive to unwind",
                description: "Choosing the wrong platform at the start of a transformation initiative costs 10x more to fix than getting it right upfront. Implementation sunk costs, change management investment, and integration debt all compound. The vendor evaluation phase is where that risk concentrates.",
            },
            {
                title: "Vendor viability is hard to assess from sales materials",
                description: "Enterprise software vendors are expert at presenting stability and roadmap confidence. The community knows which platforms are being sunsetted, which are over-promising roadmap items, and which are acquiring companies to fill gaps — but that intelligence doesn't surface in a vendor RFP response.",
            },
            {
                title: "Integration complexity is always underestimated",
                description: "Every enterprise software vendor says 'it integrates with everything.' The reality — discovered during implementation — is a patchwork of native connectors, middleware requirements, custom API work, and legacy system workarounds. Trackr surfaces integration depth scores before you commit.",
            },
        ],
        features: [
            {
                title: "Scalability and integration depth scoring",
                description: "Trackr's Scalability and Integration Depth dimensions are specifically designed for enterprise evaluation contexts. Understand how a platform handles growth, multi-entity complexity, and integration with your existing enterprise architecture before the Statement of Work is signed.",
            },
            {
                title: "Community intelligence on implementation reality",
                description: "Trackr's research pulls practitioner discussion about real implementation experiences — including common gotchas, timeline surprises, and post-launch issues that vendors don't mention in demos. Know what the customers who've already implemented it actually say.",
            },
            {
                title: "Structured evaluation framework for RFP processes",
                description: "Apply the same 7-dimension scoring framework across every vendor in your evaluation. Build an objective shortlist before investing in formal RFPs and multi-month evaluation cycles. Share scored reports with steering committees to align on criteria before the final decision.",
            },
        ],
        stat: {
            value: "67%",
            label: "Of digital transformation initiatives cite tool selection as a primary risk factor",
        },
        faqs: [
            { q: "Is Trackr useful for evaluating large enterprise platforms?", a: "Yes — Trackr generates research reports on any platform with a public website, including major enterprise software vendors. For platforms with opaque pricing, Trackr surfaces community-reported cost ranges alongside documented pricing." },
            { q: "How does Trackr assess vendor viability?", a: "The Community & Support dimension incorporates signals about vendor trajectory — funding status, ownership changes, roadmap credibility, and community sentiment about long-term stability. It's one signal among seven, not a definitive financial assessment." },
            { q: "Can Trackr help with build vs. buy analysis?", a: "Yes. By scoring the market alternatives across 7 dimensions, Trackr gives you a clear view of what commercially available solutions offer and at what cost — the starting point for any credible build vs. buy analysis." },
            { q: "Does Trackr cover legacy migration and modernization tools?", a: "Yes — any SaaS tool, platform, or enterprise application with public documentation is within scope. This includes modernization platforms, integration middleware, API management tools, and data migration services." },
        ],
        ctaText: "Evaluate enterprise tools before you commit",
        ctaSubtext: "Free to start. Structured scoring for every evaluation.",
        testimonialQuote: "Every major tool selection in our transformation program goes through Trackr first. The integration depth scores alone have changed three vendor decisions that would have been expensive mistakes.",
        testimonialAttribution: "VP of Digital Transformation, Fortune 500 manufacturing company",
    },
    {
        role: "procurement-directors",
        title: "AI Tools for Procurement Directors | Trackr",
        description: "Procurement directors use Trackr to evaluate AI and SaaS tools — scoring vendors on pricing value, integration depth, and market positioning before formal RFPs and contract negotiations.",
        headline: "Better vendor intelligence. Faster procurement cycles.",
        subheadline: "Research any vendor in 2 minutes with independent AI scoring. Build defensible shortlists before formal RFPs, brief stakeholders with structured analysis, and enter negotiations with current market intelligence.",
        painPoints: [
            {
                title: "Vendor evaluation cycles are too slow for AI tool timelines",
                description: "The AI tool landscape moves faster than a formal procurement cycle. By the time you've completed a 90-day RFP process for an AI platform, three competing products have shipped major updates and pricing has changed. Traditional procurement timelines don't fit AI acquisition speed.",
            },
            {
                title: "Stakeholders make tool requests without procurement-grade justification",
                description: "A business unit head requests a new AI tool based on a conference demo. They want it approved in two weeks. You need vendor due diligence, competitive alternatives analysis, and pricing benchmarking — and you're starting from scratch every time.",
            },
            {
                title: "Pricing benchmarking for AI tools is almost impossible",
                description: "Most AI tools have opaque, negotiable pricing. Without benchmarks, you don't know if you're being quoted a fair rate or a top-of-funnel price that's expected to be negotiated down. Community pricing intelligence is scattered and hard to synthesize.",
            },
        ],
        features: [
            {
                title: "Current pricing intelligence before negotiations",
                description: "Trackr's research pipeline surfaces current vendor pricing — including community-reported actual costs for teams of comparable size. Enter negotiations with a realistic range rather than the vendor's aspirational list price.",
            },
            {
                title: "Structured scoring for vendor shortlisting",
                description: "Apply a consistent 7-dimension framework to every vendor in an evaluation. Build defensible shortlists before investing in formal RFP cycles. Share scored comparisons with stakeholders to align on selection criteria before final vendor meetings.",
            },
            {
                title: "Competitive alternatives in every report",
                description: "Every Trackr research report surfaces the leading alternatives in the category. Use this to expand beyond the vendor your stakeholder requested, pressure-test the shortlist, and enter negotiations with genuine walk-away alternatives.",
            },
        ],
        stat: {
            value: "43%",
            label: "Reduction in time to vendor shortlist when procurement teams use AI research tools",
        },
        faqs: [
            { q: "Can Trackr help me benchmark pricing before a negotiation?", a: "Yes. Trackr's research surfaces current pricing from vendor documentation and community-reported actual costs. For enterprise tools with negotiated pricing, the community pricing data gives you a realistic range to anchor negotiations." },
            { q: "Does Trackr integrate with procurement platforms?", a: "Trackr currently operates as a standalone research tool. Reports export as PDF and shareable links that can be attached to procurement documentation in any system." },
            { q: "Can Trackr help with RFP scoring criteria development?", a: "Yes. The 7-dimension scoring framework — Core Capability, Ease of Use, Integration Depth, Pricing Value, AI Sophistication, Community & Support, Scalability — maps naturally to RFP evaluation criteria and can be adapted for formal procurement scoring matrices." },
            { q: "Is Trackr useful for both software and service vendor evaluation?", a: "Trackr is optimized for SaaS and technology tool evaluation. For professional services vendors, the research pipeline works when a public website and community discussion exist — but the framework is most calibrated for software products." },
        ],
        ctaText: "Streamline vendor evaluation with AI research",
        ctaSubtext: "Free to start. Enterprise plans for procurement teams.",
        testimonialQuote: "Trackr cut our initial vendor shortlisting process from three weeks to three days. The independent scoring gives us something defensible to put in front of stakeholders before we've invested in formal RFPs.",
        testimonialAttribution: "Director of Procurement, global enterprise software company",
    },
    {
        role: "devops",
        title: "AI Tools for DevOps Engineers | Trackr",
        description: "DevOps and platform engineers use Trackr to evaluate AI tools for CI/CD, observability, infrastructure automation, and developer experience — scored research in 2 minutes with integration depth focus.",
        headline: "Research DevOps tools with the same rigor you apply to infrastructure decisions.",
        subheadline: "Evaluate any DevOps, observability, or developer tooling in 2 minutes. Get independent scoring on integration depth, AI sophistication, community health, and actual pricing — not vendor claims.",
        painPoints: [
            {
                title: "AI DevOps tooling is full of overpromises",
                description: "Every observability platform and CI/CD tool now claims AI-powered anomaly detection, root cause analysis, and automated remediation. The actual AI capability behind those claims varies from genuinely useful to marketing rebrand. You need a way to evaluate substance from positioning.",
            },
            {
                title: "Integration compatibility is a hidden landmine",
                description: "A monitoring tool that doesn't work with your existing Kubernetes setup, Terraform state management, or deployment pipeline isn't a solution — it's another integration project. Integration depth evaluation requires research that demos rarely provide.",
            },
            {
                title: "Open-source vs managed trade-offs are rarely analyzed objectively",
                description: "For many DevOps tools, the choice between self-hosted open-source and managed SaaS involves total cost of ownership, maintenance burden, and feature parity questions. That analysis rarely happens in a structured way before the team commits.",
            },
        ],
        features: [
            {
                title: "AI sophistication scoring that cuts through the hype",
                description: "Trackr's AI Sophistication dimension specifically evaluates whether AI features deliver meaningful value or are surface-level additions. For DevOps tools, this means assessing whether 'AI-powered' observability actually improves MTTR — not just whether the marketing says so.",
            },
            {
                title: "Integration depth analysis for your stack",
                description: "The Integration Depth dimension evaluates how well a tool connects with the most common DevOps ecosystems — cloud providers, container orchestration, CI/CD systems, and infrastructure-as-code frameworks. Know before you buy, not during implementation.",
            },
            {
                title: "Community health scoring for open-source and SaaS tools",
                description: "The Community & Support dimension reflects the health of a tool's community — GitHub activity, documentation quality, issue response times, and practitioner sentiment. Evaluate the support ecosystem you're buying into, not just the product.",
            },
        ],
        stat: {
            value: "71%",
            label: "Of DevOps teams have evaluated 5+ tools in the same category before committing",
        },
        faqs: [
            { q: "Does Trackr evaluate tools like Datadog, Grafana, or PagerDuty?", a: "Yes — any observability, monitoring, or DevOps platform with a public website is within Trackr's research scope. Submit the URL and get a scored 7-dimension report in under 2 minutes." },
            { q: "Can Trackr evaluate open-source tools?", a: "Yes. For open-source tools with public documentation and community presence, Trackr generates research reports. The pricing dimension reflects the open-source vs managed cloud cost comparison, and Community & Support reflects project health." },
            { q: "How does Trackr handle tools with complex or opaque pricing like Datadog?", a: "For tools with usage-based or opaque pricing, Trackr surfaces community-reported actual costs for common configurations alongside documented pricing tiers. This gives you a realistic cost range, not just vendor list pricing." },
            { q: "Is Trackr useful for evaluating AI coding assistants like GitHub Copilot or Cursor?", a: "Yes — developer AI tooling is a strong use case for Trackr. The AI Sophistication dimension is particularly relevant for evaluating the actual quality of code completion, context awareness, and model capability across competing coding assistants." },
        ],
        ctaText: "Research your next DevOps tool in 2 minutes",
        ctaSubtext: "Free to start. No vendor spin — independent AI scoring.",
        testimonialQuote: "I evaluated six observability platforms in one afternoon using Trackr. The AI sophistication scores matched what I found in actual testing — and saved me three weeks of POC work on two tools that weren't worth it.",
        testimonialAttribution: "Senior Platform Engineer, cloud-native startup",
    },
    {
        role: "solutions-architects",
        title: "AI Tools for Solutions Architects | Trackr",
        description: "Solutions architects use Trackr to evaluate AI and SaaS tools for client recommendations, integration fit assessments, and technology stack validation — independent scoring in 2 minutes.",
        headline: "Research tools with the rigor your clients expect.",
        subheadline: "Evaluate any technology tool in 2 minutes with independent AI scoring. Build defensible recommendations, assess integration fit, and present clients with structured analysis — not vendor marketing.",
        painPoints: [
            {
                title: "Client tool recommendations need to be defensible",
                description: "When you recommend a platform to a client, you're putting your credibility on the line. 'The vendor demo looked good' isn't a defensible justification. You need structured, independent evaluation that holds up to client scrutiny and implementation reality.",
            },
            {
                title: "Integration assessment requires research across multiple sources",
                description: "Assessing whether a tool integrates cleanly with a client's existing stack requires cross-referencing vendor documentation, community discussion, and practitioner experience. That research is scattered across G2, Reddit, GitHub issues, and Slack communities — time you rarely have.",
            },
            {
                title: "The AI tool landscape changes faster than your knowledge base",
                description: "New AI tools and platform updates ship faster than any architect can track. A recommendation you made 6 months ago may no longer reflect the best option in the category. Clients expect current intelligence, not cached knowledge.",
            },
        ],
        features: [
            {
                title: "Independent scored reports you can share with clients",
                description: "Every Trackr report includes 7-dimension scoring with written justifications. Export as PDF or share via link — a structured, independent evaluation that backs up your recommendation with analysis beyond your personal assessment.",
            },
            {
                title: "Integration depth scoring for any platform",
                description: "The Integration Depth dimension specifically evaluates connector depth, API quality, and community-reported integration success with common enterprise systems. Know which tools integrate cleanly with a client's existing stack before you recommend them.",
            },
            {
                title: "Current data at the time of recommendation",
                description: "Trackr generates reports from live sources at submission time. Pricing, features, and competitive positioning reflect today's market — not a review written before the last major release. Recommendations built on Trackr research are current when you make them.",
            },
        ],
        stat: {
            value: "2 min",
            label: "Average time to generate a scored tool research report in Trackr",
        },
        faqs: [
            { q: "Can I generate Trackr reports for multiple client engagements?", a: "Yes — Trackr's workspace lets you organize research by client or project. Generate reports in the context of a specific evaluation and export or share with the relevant stakeholders." },
            { q: "How should I present Trackr scores in a client recommendation?", a: "Trackr reports are designed to be shared. The 7-dimension scorecard, written justifications, and competitive alternatives section provide the structured analysis that supports a professional client recommendation. Export as PDF for formal delivery." },
            { q: "Does Trackr cover both cloud and on-premise software?", a: "Trackr's research pipeline is optimized for SaaS and cloud-native tools with public documentation. For on-premise enterprise software, coverage depends on available public information — some legacy platforms have limited data." },
            { q: "Is Trackr useful for evaluating infrastructure and cloud platform choices?", a: "For managed cloud services and platforms with public documentation, yes. AWS, Azure, and GCP service comparisons work well. For underlying infrastructure decisions, the tool is most useful when comparing managed service alternatives." },
        ],
        ctaText: "Build defensible client recommendations in 2 minutes",
        ctaSubtext: "Free to start. Shareable reports for every evaluation.",
        testimonialQuote: "I include Trackr scores in every technology recommendation I deliver. Clients appreciate the independent validation — and it takes the 'how did you evaluate this?' question off the table completely.",
        testimonialAttribution: "Independent Solutions Architect, enterprise cloud consulting",
    },
    {
        role: "cro",
        title: "AI Tools for Chief Revenue Officers | Trackr",
        description: "CROs use Trackr to evaluate AI tools for the revenue stack — sales intelligence, forecasting, conversation intelligence, and enablement — with independent scoring before committing to multi-year contracts.",
        headline: "The revenue stack deserves independent evaluation.",
        subheadline: "Research any sales or revenue AI tool in 2 minutes. Get independent scoring across 7 dimensions before your team signs a 2-year contract on a demo that looked great and a reference call that was hand-picked.",
        painPoints: [
            {
                title: "Revenue tech decisions are expensive and hard to reverse",
                description: "Your CRM, sales intelligence platform, conversation intelligence tool, and forecasting layer are foundational. Switching costs are high — data migration, workflow re-training, integration rebuild, and productivity loss during transition. Getting these decisions right the first time matters more than most tool categories.",
            },
            {
                title: "Vendor references are curated, not representative",
                description: "Every CRM and sales platform will connect you with three happy customers. Those customers were hand-picked by the account team. The difficult implementations, the teams that churned, and the customers who hit the rough edges of the product are not on the reference list.",
            },
            {
                title: "AI feature claims in the revenue tech stack are rampant",
                description: "Every forecasting tool, conversation intelligence platform, and sales intelligence product now claims AI-powered everything. Distinguishing genuine AI capability from marketing language requires evaluation depth that demos don't provide.",
            },
        ],
        features: [
            {
                title: "AI sophistication scoring for revenue tools",
                description: "The AI Sophistication dimension evaluates how meaningfully AI improves the product's core function. For revenue tools, this means assessing whether AI forecasting actually improves accuracy, whether conversation intelligence genuinely surfaces useful coaching moments, and whether intent data reflects real signal.",
            },
            {
                title: "Community intelligence beyond curated references",
                description: "Trackr's research pipeline incorporates community discussion — including the customers the vendor didn't put on your reference list. Reddit, G2, and practitioner communities surface the rough edges, pricing surprises, and implementation realities that hand-picked references don't.",
            },
            {
                title: "Competitive alternatives surfaced in every report",
                description: "Every Trackr report includes the leading alternatives in the category with their own scores. Use this to build a genuine shortlist beyond the vendor your sales rep introduced, and enter negotiations with real walk-away options.",
            },
        ],
        stat: {
            value: "$127K",
            label: "Average annual revenue tech stack spend for mid-market sales organizations",
        },
        faqs: [
            { q: "Can Trackr evaluate CRM platforms like Salesforce or HubSpot?", a: "Yes — submit any CRM, sales intelligence, or revenue platform URL and Trackr generates a full scored report. This includes pricing analysis, integration depth, community sentiment, and competitive alternatives." },
            { q: "How does Trackr handle tools with negotiated enterprise pricing?", a: "For tools where pricing is primarily negotiated rather than published, Trackr surfaces community-reported actual costs for comparable company sizes. This gives you a realistic benchmark range for negotiation anchor points." },
            { q: "Can Trackr help evaluate forecasting tools specifically?", a: "Yes. For AI forecasting tools, the AI Sophistication and Core Capability dimensions evaluate how the forecasting engine works, what inputs it uses, and what community practitioners say about real-world accuracy versus vendor claims." },
            { q: "Is Trackr useful for evaluating a full GTM tech stack?", a: "Yes. Research each component of your GTM stack through Trackr — CRM, SEP, conversation intelligence, forecasting, sales intelligence, and enablement. Apply the same scoring framework across all of them for a structured portfolio view." },
        ],
        ctaText: "Evaluate your revenue stack with independent research",
        ctaSubtext: "Free to start. Consistent scoring across every tool.",
        testimonialQuote: "We avoided a $180K annual contract on a CRM we would have regretted. The community intelligence Trackr surfaced — specifically around the implementation complexity — matched exactly what came up in our own diligence a week later.",
        testimonialAttribution: "Chief Revenue Officer, Series C SaaS company",
    },
    {
        role: "agency-owners",
        title: "AI Tools for Agency Owners | Trackr",
        description: "Agency owners use Trackr to evaluate AI tools for client delivery, business development, and internal operations — and to build a defensible AI capability story for their clients.",
        headline: "Research AI tools before you build your agency stack around them.",
        subheadline: "Evaluate any AI or SaaS tool in 2 minutes. Get independent scoring on capability, pricing, and integration fit — so your agency stack decisions are based on analysis, not the vendor who reached out on LinkedIn.",
        painPoints: [
            {
                title: "Every AI tool vendor is pitching agencies right now",
                description: "Your inbox has five AI tool pitches this week. They all claim to transform client delivery, improve output quality, and create new revenue streams. Evaluating each one properly takes time you're using for billable work. Most end up as untested subscriptions.",
            },
            {
                title: "Building client AI recommendations requires current intelligence",
                description: "Clients ask their agency what AI tools they should be using. That question is now a trust signal — get it right and you're an indispensable advisor, get it wrong and you look behind the times. Staying current across the AI tool landscape is a full-time job.",
            },
            {
                title: "Agency stack costs compound and never get rationalized",
                description: "You added tools during fast growth, kept them through a slower period, and now you're paying for 23 subscriptions — some of which have better, cheaper replacements that launched 12 months ago. A rationalization requires research time nobody has.",
            },
        ],
        features: [
            {
                title: "Research any tool in 2 minutes — for client delivery or internal ops",
                description: "Submit any AI or SaaS tool URL and get a scored 7-dimension report. Use it to make internal stack decisions or to build intelligence for client AI strategy recommendations — the same research framework applies to both.",
            },
            {
                title: "Stack tracking with renewal alerts across your full tool inventory",
                description: "Track every tool in your agency stack with renewal dates and spend. Get 60-day alerts before auto-renewals and flag tools for rationalization review. Never lose track of what you're paying for or when it renews.",
            },
            {
                title: "Build an agency AI capabilities narrative backed by research",
                description: "Export Trackr reports and scores as part of client deliverables or capability presentations. Present your AI tool recommendations with independent scoring that demonstrates structured evaluation — not a vendor pitch you're passing through.",
            },
        ],
        stat: {
            value: "89%",
            label: "Of agencies report clients asking about AI tool strategy in every new engagement",
        },
        faqs: [
            { q: "Can I use Trackr to evaluate AI tools I want to recommend to clients?", a: "Yes — this is a core use case. Run Trackr research on any tool you're considering recommending, export the report, and include it in your client deliverable. It gives your recommendation independent backing." },
            { q: "Does Trackr track which tools my whole team is using?", a: "Trackr's workspace feature tracks the tools you add to your stack. For team-wide visibility across multiple users, Pro and team plans support shared workspaces." },
            { q: "Can Trackr help me rationalize my current agency stack?", a: "Yes. Add your current tools to Trackr, run fresh research reports, and compare scores against current alternatives. Tools that score significantly below emerging competitors are good candidates for rationalization." },
            { q: "Is Trackr useful for niche AI tools my agency might not have heard of?", a: "Especially yes. Trackr can research any tool with a public website — including niche tools, new entrants, and lesser-known platforms that aren't yet on G2 or mainstream review sites. This is where the advantage over review platforms is greatest." },
        ],
        ctaText: "Build your agency AI stack with independent research",
        ctaSubtext: "Free to start. Research for internal use and client delivery.",
        testimonialQuote: "We include Trackr scores in every AI audit we deliver to clients. It transformed our AI advisory practice from opinion-based to data-backed — and clients notice the difference.",
        testimonialAttribution: "Founder, digital strategy and AI advisory agency",
    },
    {
        role: "startup-ctos",
        title: "AI Tools for Startup CTOs | Trackr",
        description: "Startup CTOs use Trackr to research AI tools and infrastructure quickly — scoring any tool in 2 minutes so engineering decisions are based on current data, not demos and founder gut checks.",
        headline: "Make your first AI tool decisions count.",
        subheadline: "Evaluate any AI or infrastructure tool in 2 minutes. Get independent scoring on capability, integration fit, pricing, and AI sophistication — before early stack decisions create technical debt you'll spend the next year unwinding.",
        painPoints: [
            {
                title: "Early stack decisions are permanent if you're not careful",
                description: "The AI tool you pick in month 3 becomes the assumption every subsequent decision builds on. Get it wrong — wrong pricing model, wrong integration approach, wrong data handling — and the cost of switching compounds with every engineer you hire and every feature you build.",
            },
            {
                title: "You're evaluating tool categories you've never bought before",
                description: "As a founding or early-stage CTO, you may be making first-time purchases in categories you've only been a user of, not a buyer. Vector databases, AI observability tools, prompt management platforms, and LLM routing layers are new buying decisions with no institutional knowledge to lean on.",
            },
            {
                title: "Everyone has an opinion; nobody has independent data",
                description: "Twitter/X, Discord, and your investor's portfolio company network are full of strong tool opinions. Separating genuine insight from recency bias, vendor relationships, and community hype requires research time you're using to build product.",
            },
        ],
        features: [
            {
                title: "Current AI tool intelligence in 2 minutes",
                description: "Submit any AI tool, infrastructure platform, or SaaS service URL and get a scored 7-dimension report with current pricing, integration depth, AI sophistication, and community sentiment. Current data, not a review written before the last major release.",
            },
            {
                title: "AI nativeness scoring for the tools your stack depends on",
                description: "The AI Sophistication dimension evaluates how meaningfully AI is used in the product's core value delivery. Separate tools that are genuinely AI-native from those with AI-branded features bolted on — a critical distinction as you build an AI-first company.",
            },
            {
                title: "Community health and vendor viability signals",
                description: "The Community & Support dimension reflects GitHub activity, documentation quality, response times, and community sentiment. For early-stage startups especially, the health of the community and vendor you're betting on matters as much as the feature set.",
            },
        ],
        stat: {
            value: "47",
            label: "Average number of AI tools evaluated by a startup engineering team in year one",
        },
        faqs: [
            { q: "Is Trackr useful for evaluating AI infrastructure tools like LLM APIs or vector databases?", a: "Yes — AI infrastructure is a strong use case. Submit any LLM API provider, vector database, embedding service, or AI observability tool URL and Trackr generates a scored 7-dimension research report." },
            { q: "Can Trackr help me decide between building and buying a capability?", a: "Trackr helps by giving you a clear view of what commercially available alternatives offer and at what cost. That market intelligence is the starting point for any credible build vs. buy analysis — especially for AI capabilities." },
            { q: "How does Trackr handle tools without published pricing?", a: "For tools with opaque pricing, Trackr's research pipeline surfaces community-reported actual costs alongside documented pricing tiers. This is particularly valuable for enterprise AI platforms where list pricing is rarely what teams actually pay." },
            { q: "Is Trackr only for technical tools, or can I research business software too?", a: "Trackr covers any SaaS or technology tool — technical infrastructure and business software alike. CTOs often research both for their company, and the same 7-dimension framework applies across all categories." },
        ],
        ctaText: "Make your first AI tool decisions with data",
        ctaSubtext: "Free to start. Results in 2 minutes, no credit card required.",
        testimonialQuote: "Trackr saved me from two early infrastructure decisions that would have been expensive to unwind. The integration depth score on the first tool and the vendor viability signals on the second both flagged things I would have missed in a demo.",
        testimonialAttribution: "CTO, AI-native SaaS startup (Seed)",
    },
    {
        role: "consultants",
        title: "AI Tools for Consultants | Trackr",
        description: "Strategy, management, and technology consultants use Trackr to research AI tools for client recommendations, competitive analysis, and staying current on the enterprise software landscape.",
        headline: "Client AI recommendations backed by independent research.",
        subheadline: "Research any AI or enterprise software tool in 2 minutes. Get independent 7-dimension scoring you can include in client deliverables — structured analysis that reflects current market reality, not vendor marketing.",
        painPoints: [
            {
                title: "Clients expect current AI tool intelligence in every engagement",
                description: "Clients now expect their consultant to have a view on AI tools — what to adopt, what to avoid, and how to evaluate new entrants. That expectation has accelerated dramatically in 18 months. Staying current across every relevant category is no longer optional.",
            },
            {
                title: "Research quality varies across the team",
                description: "When you send three consultants to evaluate a software category, you get three different research methodologies, three different scoring approaches, and three deliverables that can't be compared. A consistent evaluation framework is a practice standard problem, not a tooling problem — until Trackr.",
            },
            {
                title: "Client deliverables that rely on vendor marketing are a liability",
                description: "A technology recommendation built on vendor-provided case studies and demo impressions is professionally exposed. Independent research with documented scoring and sourcing is defensible. The difference matters when a client comes back six months after implementation.",
            },
        ],
        features: [
            {
                title: "Independent scoring for any tool, any category",
                description: "Submit any tool URL and get a scored 7-dimension report in 2 minutes. The same framework applies to any category — AI platforms, enterprise SaaS, analytics tools, and infrastructure. Consistent methodology across every engagement.",
            },
            {
                title: "Shareable reports for client deliverables",
                description: "Export Trackr reports as PDF or share via URL. Include scored research directly in client presentations, strategy decks, or vendor evaluation matrices. Structured, independent analysis that elevates the quality of your deliverable.",
            },
            {
                title: "Current market intelligence, not cached knowledge",
                description: "Trackr generates reports from live sources at submission time. Pricing, features, and competitive positioning reflect the current market — not your knowledge from the last engagement in this category. Every client recommendation is built on fresh intelligence.",
            },
        ],
        stat: {
            value: "3.1x",
            label: "Increase in AI tool advisory requests received by strategy consultants since 2023",
        },
        faqs: [
            { q: "Can I run multiple client evaluations simultaneously in Trackr?", a: "Yes — Trackr's workspace lets you organize research by client or project. Research in the context of a specific engagement and export or share with the client directly." },
            { q: "Is Trackr appropriate for enterprise client engagements?", a: "Yes. Trackr's research methodology and structured scoring are designed to be defensible and shareable at the enterprise level. The PDF export and structured format are suitable for board-level and executive presentations." },
            { q: "Can Trackr help us build a practice standard for AI tool evaluation?", a: "Yes. The 7-dimension scoring framework provides a consistent evaluation standard that can be adopted across your team. Every consultant applies the same methodology, producing comparable outputs regardless of who runs the research." },
            { q: "Is Trackr useful for competitive landscape analysis?", a: "Yes — researching multiple tools in a category gives you a structured competitive landscape with scored comparisons. Use this to build technology market maps, vendor shortlists, and category intelligence sections of client deliverables." },
        ],
        ctaText: "Deliver independent AI research in 2 minutes",
        ctaSubtext: "Free to start. Shareable reports for every engagement.",
        testimonialQuote: "Trackr is now standard methodology for our AI advisory practice. Every technology recommendation goes through Trackr first — the scored reports are included in the deliverable and clients ask for them by name.",
        testimonialAttribution: "Partner, technology advisory practice",
    },
    {
        role: "executive-assistants",
        title: "AI Tools for Executive Assistants | Trackr",
        description: "Executive assistants use Trackr to research and evaluate tools on behalf of executives — producing clear, scored summaries that give leadership what they need to make fast, confident decisions.",
        headline: "Research tools on behalf of your executive in 2 minutes.",
        subheadline: "Submit any tool URL and get a clear, scored research report your executive can act on. No vendor spin, no hours of G2 review reading — structured intelligence that helps leadership decide faster.",
        painPoints: [
            {
                title: "Executives ask for tool research with short turnaround expectations",
                description: "Your executive saw a tool at a conference, heard about it from a peer, or got a cold pitch that caught their attention. They want your assessment by end of day. That means producing defensible research in hours — not the 8-hour deep dive the request actually warrants.",
            },
            {
                title: "G2 and review sites require synthesis skills most EAs aren't hired for",
                description: "Evaluating a software tool from raw reviews requires understanding what dimensions matter, which reviewers are comparable to your organization, and how to weight conflicting signals. That's a research skill set — and most EAs are hired for scheduling and operations, not technology evaluation.",
            },
            {
                title: "There's no standard format for presenting tool research to executives",
                description: "Even when you've done solid research, presenting it clearly to a busy executive in a format they can act on is a separate skill. A wall of notes from G2 isn't the same as a structured recommendation with a clear score and bottom line.",
            },
        ],
        features: [
            {
                title: "Clear, structured reports your executive can read in 5 minutes",
                description: "Trackr's reports are structured for busy decision-makers. A score, a bottom line, written justifications, and clear competitive context — formatted so your executive can read it quickly and ask informed questions rather than asking you to explain what you found.",
            },
            {
                title: "Any tool, any category, in 2 minutes",
                description: "Submit any website URL and Trackr generates a complete research report. No technical knowledge required. No research experience needed. The research happens automatically — you review and forward the report.",
            },
            {
                title: "Shareable PDF and links for fast executive review",
                description: "Export any report as PDF or share via URL. Forward it directly to your executive, include it in a briefing document, or attach it to a meeting agenda. The format is designed for professional sharing, not internal notes.",
            },
        ],
        stat: {
            value: "8 hrs",
            label: "Average time EAs spend on tool research requests per week across their executive's stack",
        },
        faqs: [
            { q: "Do I need any technical knowledge to use Trackr?", a: "No — Trackr is designed for non-technical users. Submit a tool's website URL, receive a scored report in plain language. No technical background or software evaluation experience required." },
            { q: "Can I organize research for multiple executives?", a: "Yes — Trackr's workspace lets you track research by project or context. Research on behalf of multiple executives can be organized and exported separately." },
            { q: "How do I present a Trackr report to my executive?", a: "The easiest approach is to share the report link or forward the PDF export. Trackr reports are formatted for executive consumption — score at the top, justifications and context below. Most executives can review the key points in under 5 minutes." },
            { q: "What if the executive wants me to compare two or three tools?", a: "Run a Trackr report on each tool and share the comparison. Since all reports use the same 7-dimension framework, scores are directly comparable. You can present a side-by-side score comparison without building a custom matrix." },
        ],
        ctaText: "Research any tool your executive needs in 2 minutes",
        ctaSubtext: "Free to start. No technical knowledge required.",
        testimonialQuote: "My executive now expects a Trackr score for every tool that comes across his desk. It changed how he evaluates recommendations — from 'what do you think?' to 'what does it score?' in about two weeks.",
        testimonialAttribution: "Senior Executive Assistant, public company CEO",
    },
];

export const ICP_ROLES = ICP_PAGES.map((p) => p.role);
