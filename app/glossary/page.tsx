import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export const metadata: Metadata = {
    title: "AI & SaaS Glossary — Key Terms Explained | Trackr",
    description: "Plain-English definitions of 40+ terms used in AI tool evaluation, SaaS management, and tech stack optimization. Used by ops teams and RevOps leaders.",
    openGraph: {
        title: "AI & SaaS Glossary — Key Terms Explained | Trackr",
        description: "Plain-English definitions of 40+ terms used in AI tool evaluation, SaaS management, and tech stack optimization. Used by ops teams and RevOps leaders.",
        url: "https://trytrackr.com/glossary",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "AI & SaaS Glossary" }],
    },
    alternates: { canonical: "https://trytrackr.com/glossary" },
    twitter: {
        card: "summary_large_image",
        title: "AI & SaaS Glossary — Key Terms Explained | Trackr",
        description: "Plain-English definitions of 40+ terms used in AI tool evaluation, SaaS management, and tech stack optimization. Used by ops teams and RevOps leaders.",
        images: ["/og.png"],
    },
    keywords: ["AI tools glossary", "SaaS terminology", "tool evaluation terms", "AI stack terms", "RevOps glossary", "ops team glossary"],
};

type GlossaryTerm = {
    term: string;
    definition: string;
    link?: { href: string; label: string };
};

type GlossaryGroup = {
    letter: string;
    terms: GlossaryTerm[];
};

const GLOSSARY: GlossaryGroup[] = [
    {
        letter: "A",
        terms: [
            {
                term: "AI Readiness Score",
                definition: "A composite metric that rates how prepared an organization's infrastructure, data quality, and team capabilities are to successfully adopt and scale AI tools. In tool evaluation, it helps determine whether a new AI product can be integrated without significant upfront rework of existing systems.",
            },
            {
                term: "AEO (Answer Engine Optimization)",
                definition: "The practice of structuring web content so AI-powered answer engines — including ChatGPT, Perplexity, and Google's AI Overviews — can accurately extract and cite your content in direct responses. AEO focuses on clear definitions, structured FAQ content, and schema markup rather than keyword density alone.",
            },
            {
                term: "API Integration",
                definition: "A technical connection between two software tools via their application programming interfaces. In tool evaluation, API integration depth indicates how well a tool can exchange data with the rest of your stack, automate workflows, and sync records without manual exports or copy-paste processes.",
            },
            {
                term: "Audit Trail",
                definition: "A chronological, tamper-evident log of actions taken within a software system — including who did what, when, and from where. Audit trails are required for compliance in regulated industries and are a key evaluation criterion when assessing enterprise-grade software.",
            },
        ],
    },
    {
        letter: "B",
        terms: [
            {
                term: "Benchmark Score",
                definition: "A standardized score that measures a tool's performance against a defined set of criteria, enabling apples-to-apples comparison across competing products. Trackr's 7-dimension benchmark scores allow teams to compare tools in the same category using consistent methodology regardless of who performed the research.",
            },
            {
                term: "Budget Utilization",
                definition: "The percentage of an allocated software budget that has been spent in a given period relative to the contracted value. Low budget utilization on a SaaS subscription is a signal of underuse and a candidate for consolidation or cancellation during a stack audit.",
            },
        ],
    },
    {
        letter: "C",
        terms: [
            {
                term: "CAC (Customer Acquisition Cost)",
                definition: "The total cost to acquire one new customer, including sales, marketing, and tooling overhead. When evaluating sales and marketing AI tools, calculating the impact on CAC is a primary ROI metric — tools that reduce CAC or increase conversion rates have a compounding return.",
            },
            {
                term: "Churn Risk Signal",
                definition: "A behavioral, engagement, or financial indicator that a software vendor or customer is at elevated risk of churning. In the context of vendor evaluation, churn risk signals — such as declining review volume, leadership changes, or funding gaps — indicate whether a tool you depend on may be discontinued.",
            },
            {
                term: "Contract Lifecycle Management",
                definition: "The process of tracking software contracts from initial signing through renewal, including renewal dates, auto-renewal clauses, price escalation terms, and cancellation windows. Effective contract lifecycle management prevents unexpected renewals and builds the data needed for annual budget planning.",
            },
            {
                term: "Consolidation Opportunity",
                definition: "A situation where two or more tools in your stack perform overlapping functions, suggesting that one could be eliminated without meaningful capability loss. Trackr identifies consolidation opportunities during stack audits by mapping feature overlap across your current subscriptions.",
                link: { href: "/audit", label: "Run a stack audit" },
            },
        ],
    },
    {
        letter: "D",
        terms: [
            {
                term: "Data Portability",
                definition: "The degree to which data stored in a software tool can be exported in standard formats and migrated to other systems. Low data portability is a form of vendor lock-in. When evaluating tools, teams should always confirm export capabilities before committing to a long-term contract.",
            },
            {
                term: "Dead Tool",
                definition: "A tool in your stack with less than 10% adoption among its intended users over a rolling 90-day window. Dead tools represent pure wasted spend — they are typically discovered during stack audits and are the first candidates for immediate cancellation.",
            },
            {
                term: "Dependency Mapping",
                definition: "The process of documenting which tools in your stack depend on each other for data flows, authentication, or workflow triggers. Dependency mapping is critical before canceling any tool, as removing one node can break downstream automations or integrations without warning.",
            },
            {
                term: "Deployment Risk",
                definition: "The probability and magnitude of disruption that would occur when rolling out a new software tool across a team or organization. Factors include migration complexity, integration requirements, training load, and change management overhead. High deployment risk tools require more evaluation before purchase.",
            },
        ],
    },
    {
        letter: "E",
        terms: [
            {
                term: "Evaluation Framework",
                definition: "A structured set of criteria and scoring methodology used to assess software tools consistently. Without a standardized evaluation framework, every tool assessment uses different criteria, making it impossible to compare results across time or across evaluators. Trackr's 7-dimension scorecard is a purpose-built evaluation framework.",
                link: { href: "/scorecard", label: "See the scorecard" },
            },
            {
                term: "Enterprise Software",
                definition: "Software designed for deployment across large organizations, typically featuring advanced security controls, audit logging, SSO, role-based access, SLA guarantees, and dedicated support. When evaluating tools for companies with 500+ employees, enterprise readiness is a critical evaluation dimension.",
            },
            {
                term: "Exit Cost",
                definition: "The total cost of migrating away from a software tool, including data export, re-integration, retraining, and productivity loss during the transition. High exit costs are a primary mechanism of vendor lock-in. Evaluating exit costs upfront prevents being trapped in underperforming contracts.",
            },
        ],
    },
    {
        letter: "F",
        terms: [
            {
                term: "Feature Creep",
                definition: "The gradual accumulation of features in a software product that makes it more complex without meaningfully improving its core value. In tool evaluation, feature creep often signals a product without a clear focus — compare the tool's core capability score against its complexity to identify this pattern.",
            },
            {
                term: "Firecrawl",
                definition: "A web scraping and crawling API used to extract structured data from websites for research and analysis purposes. Trackr uses Firecrawl as one of its data collection layers to pull vendor site content, feature documentation, and pricing information during the tool research process.",
            },
            {
                term: "Free Trial Evaluation",
                definition: "A structured process for assessing a software tool during its free trial period, with predefined success criteria and usage benchmarks. An unstructured free trial produces no useful comparative data. A structured evaluation with the 7-dimension framework provides a scored report you can defend at renewal.",
            },
        ],
    },
    {
        letter: "G",
        terms: [
            {
                term: "Governance (Software)",
                definition: "The policies, processes, and controls that govern how software tools are approved, purchased, deployed, and retired within an organization. Strong software governance prevents shadow IT, controls spend, and ensures all tools meet security and compliance requirements before being added to the stack.",
            },
            {
                term: "Gap Analysis",
                definition: "An assessment of the difference between what your current tool stack provides and what your team actually needs. Gap analyses identify missing capabilities that justify new tool purchases and surface categories where existing tools are underdelivering relative to alternatives.",
            },
        ],
    },
    {
        letter: "I",
        terms: [
            {
                term: "Implementation Risk",
                definition: "The risk that a software tool will not be successfully deployed, adopted, or integrated within the expected timeline and budget. Implementation risk is assessed by reviewing vendor onboarding documentation, integration requirements, and case studies from similar companies during evaluation.",
            },
            {
                term: "Integration Depth",
                definition: "One of Trackr's 7 evaluation dimensions, weighted at 15%. Integration depth measures how many native integrations a tool offers, the quality of its API, whether data sync is bidirectional, and how well it fits into common existing stacks. Isolated tools create data silos and increase manual work.",
            },
            {
                term: "IT Stack",
                definition: "The complete inventory of software tools, infrastructure services, and technology platforms used by an organization. Managing the IT stack strategically — auditing for overlap, tracking spend, and evaluating alternatives at renewal — is a core function of operations and IT teams.",
            },
        ],
    },
    {
        letter: "L",
        terms: [
            {
                term: "LTV (Lifetime Value)",
                definition: "The total revenue or value generated by a customer over the full duration of their relationship with a company. In the context of software tools, LTV calculations help determine which tools in your revenue stack have the highest impact on customer retention and expansion, justifying their cost.",
            },
            {
                term: "License Utilization Rate",
                definition: "The percentage of purchased software licenses that are actively used. A license utilization rate below 60% is a common threshold for flagging a tool as underutilized. During contract renewals, teams should negotiate seat counts down to match actual utilization rates to avoid paying for unused capacity.",
            },
        ],
    },
    {
        letter: "M",
        terms: [
            {
                term: "MQL (Marketing Qualified Lead)",
                definition: "A prospective customer who has met a defined set of behavioral or firmographic criteria indicating sufficient purchase intent to be passed to a sales team. In tool evaluation, MQL volume and conversion rate are key metrics for assessing the ROI of marketing automation and demand generation tools.",
            },
            {
                term: "Multi-Workspace",
                definition: "An architecture in which a software platform supports multiple isolated workspaces — each with separate data, user permissions, and configurations — under one account. Multi-workspace support is important for agencies, holding companies, and organizations managing tools across distinct business units.",
            },
        ],
    },
    {
        letter: "N",
        terms: [
            {
                term: "NPS (Net Promoter Score)",
                definition: "A customer satisfaction metric calculated as the percentage of promoters minus the percentage of detractors on a 0-10 likelihood-to-recommend scale. When evaluating SaaS tools, vendor NPS data from review platforms provides a signal of real customer satisfaction beyond marketing claims.",
            },
            {
                term: "Non-Obvious Cost",
                definition: "A cost associated with a software subscription that is not clearly disclosed in the primary pricing page, including overage fees, API call limits, add-on module charges, implementation fees, and support tier upsells. Identifying non-obvious costs during evaluation prevents sticker shock after signing.",
            },
        ],
    },
    {
        letter: "O",
        terms: [
            {
                term: "Operations Stack",
                definition: "The subset of a company's software tools specifically used for internal operations — project management, documentation, workflow automation, HR, finance, and communication. Operations stack rationalization is one of the highest-ROI auditing activities for growing companies.",
            },
            {
                term: "Overlap Audit",
                definition: "A structured analysis that identifies where two or more tools in your stack serve the same core function, resulting in duplicated spend and fragmented data. Overlap audits are typically triggered by headcount growth or post-merger integration and are a primary use case for Trackr.",
                link: { href: "/audit", label: "Start an overlap audit" },
            },
            {
                term: "Orphaned License",
                definition: "A software license assigned to a user who has left the organization, changed roles, or no longer needs the tool. Orphaned licenses represent direct wasted spend and can also create security risks if former employees retain access. Regular license audits should reclaim orphaned licenses.",
            },
        ],
    },
    {
        letter: "P",
        terms: [
            {
                term: "Point Solution",
                definition: "A software tool designed to solve one specific problem well, rather than a broad platform addressing multiple categories. Point solutions often score higher on core capability but lower on integration depth. The build-vs-buy decision often comes down to comparing a specialized point solution against a broader platform's native feature.",
            },
            {
                term: "Procurement Workflow",
                definition: "The formal process an organization uses to approve, purchase, and onboard new software tools, typically including a vendor evaluation, security review, contract negotiation, and finance approval. Trackr integrates into the procurement workflow by providing the scored evaluation data needed at each gate.",
            },
            {
                term: "Product-Led Growth",
                definition: "A go-to-market strategy in which the product itself — rather than a sales team — is the primary driver of customer acquisition, activation, and expansion. PLG tools typically offer free plans or trials that demonstrate core value before asking for payment, making them strong candidates for free trial evaluation.",
            },
        ],
    },
    {
        letter: "R",
        terms: [
            {
                term: "ROI Calculator",
                definition: "A tool or model that quantifies the expected return on investment from a software purchase by comparing projected value delivered against total cost of ownership. During vendor evaluations, ROI calculators that show pre-built assumptions without customization should be treated with skepticism.",
            },
            {
                term: "Renewal Cliff",
                definition: "The point at which a software contract auto-renews if not actively canceled within the notice window, often 30-90 days before the renewal date. Missing a renewal cliff on a tool with poor utilization results in another year of wasted spend. Tracking renewal cliffs is a core function of stack management.",
            },
            {
                term: "Research Automation",
                definition: "The use of AI agents, web crawlers, and structured data pipelines to automatically gather, synthesize, and score information about software tools — replacing the manual process of reading vendor sites, review platforms, and forum discussions. Trackr is a purpose-built research automation platform for SaaS evaluation.",
            },
            {
                term: "RevOps",
                definition: "Revenue Operations — a cross-functional discipline that aligns sales, marketing, and customer success teams around shared processes, data, and technology. RevOps leaders are among the primary users of Trackr because they own the revenue tech stack and are accountable for its efficiency and ROI.",
                link: { href: "/for/revops", label: "Trackr for RevOps" },
            },
        ],
    },
    {
        letter: "S",
        terms: [
            {
                term: "SaaS Sprawl",
                definition: "The uncontrolled proliferation of software subscriptions across an organization, resulting in duplicated tools, fragmented data, security gaps, and wasted spend. SaaS sprawl typically accelerates when individual teams purchase tools without central oversight. A stack audit is the starting point for reversing it.",
                link: { href: "/audit", label: "Audit your stack" },
            },
            {
                term: "Shadow IT",
                definition: "Software tools adopted and used by employees or teams without the knowledge or approval of the IT or operations function. Shadow IT creates security risks, compliance exposure, and spend that cannot be tracked or optimized. It is frequently discovered during comprehensive stack audits.",
            },
            {
                term: "Spend Analysis",
                definition: "A structured review of all software expenditure — across tools, teams, and time periods — to identify waste, consolidation opportunities, and budget misalignment. Spend analysis is the financial counterpart to a technical stack audit and is typically owned by finance or operations.",
            },
            {
                term: "Stack Rationalization",
                definition: "The process of deliberately reducing the number of tools in a software stack by eliminating redundancies, consolidating overlapping functions, and retiring unused subscriptions. Stack rationalization projects typically reduce software spend by 15-30% for companies with 50+ employees and 20+ SaaS subscriptions.",
                link: { href: "/scorecard", label: "Use the scorecard framework" },
            },
            {
                term: "Subscription Intelligence",
                definition: "Aggregated data and analysis about a company's software subscriptions — including renewal dates, utilization rates, contract terms, and spend by category. Subscription intelligence enables proactive renewal management rather than reactive scrambling when contracts auto-renew.",
            },
        ],
    },
    {
        letter: "T",
        terms: [
            {
                term: "TCO (Total Cost of Ownership)",
                definition: "The complete cost of a software tool including license fees, implementation costs, integration overhead, training time, internal support burden, and opportunity cost of the team's attention. TCO calculations frequently reveal that low-priced tools are more expensive than higher-priced alternatives once all costs are included.",
            },
            {
                term: "Tool Fatigue",
                definition: "The cognitive and operational burden created by using too many software tools — each with its own login, interface, workflow, and notification stream. Tool fatigue reduces productivity, increases error rates, and is a leading cause of employee frustration with operations infrastructure.",
            },
            {
                term: "Trial-to-Paid Conversion",
                definition: "The percentage of free trial users who convert to a paid subscription within a defined window. For tool evaluation purposes, low trial-to-paid conversion rates on review platforms can signal that the tool does not deliver on its promise within the trial experience.",
            },
        ],
    },
    {
        letter: "U",
        terms: [
            {
                term: "Underutilization Rate",
                definition: "The inverse of license utilization rate — the percentage of purchased capacity that goes unused. A high underutilization rate is a primary signal that a tool should be audited for cancellation or right-sized at renewal. Underutilization rates above 40% typically represent an immediate savings opportunity.",
            },
            {
                term: "Usage Analytics",
                definition: "Data about how frequently and in what ways a software tool is used across a team or organization. Usage analytics are the primary evidence in a stack audit — tools with low usage analytics data have a poor case for renewal. Many vendors provide usage dashboards, but these should be requested proactively.",
            },
        ],
    },
    {
        letter: "V",
        terms: [
            {
                term: "Vendor Lock-In",
                definition: "A situation where switching away from a software vendor would be prohibitively costly due to data portability limitations, deep integration dependencies, custom configurations, or contractual terms. Evaluating lock-in risk upfront — particularly data export capabilities and API openness — prevents being trapped in underperforming contracts.",
            },
            {
                term: "Vendor Risk",
                definition: "The risk that a software vendor may be unable to deliver on its commitments due to financial instability, acquisition, product discontinuation, or security breach. Vendor risk assessment should include reviewing funding history, headcount trends, review platform sentiment, and changelog activity.",
            },
            {
                term: "Vulnerability Assessment",
                definition: "A structured evaluation of the security weaknesses in a software tool or its integration with your infrastructure. Vulnerability assessments are a required step in enterprise procurement for tools that access sensitive data, with results feeding directly into the security dimension of a tool evaluation.",
            },
        ],
    },
    {
        letter: "W",
        terms: [
            {
                term: "Workspace Isolation",
                definition: "An architecture in which each customer's data is stored and accessed in a logically or physically separate environment, preventing cross-tenant data leakage. Workspace isolation is a baseline security requirement for multi-tenant SaaS tools used by teams with sensitive business data.",
            },
            {
                term: "Write-Off (Underused License)",
                definition: "The internal accounting treatment for software licenses that are no longer being used productively and are being held for the remainder of a paid contract period before cancellation. Identifying write-offs proactively — rather than at renewal — allows teams to negotiate partial refunds or credits in some cases.",
            },
        ],
    },
];

const ALL_LETTERS = GLOSSARY.map((g) => g.letter);

const ALL_TERMS: GlossaryTerm[] = GLOSSARY.flatMap((g) => g.terms);

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "DefinedTermSet",
            name: "AI & SaaS Glossary",
            description: "Plain-English definitions of 40+ terms used in AI tool evaluation, SaaS management, and tech stack optimization.",
            url: "https://trytrackr.com/glossary",
            hasDefinedTerm: ALL_TERMS.map((t) => ({
                "@type": "DefinedTerm",
                name: t.term,
                description: t.definition,
                inDefinedTermSet: "https://trytrackr.com/glossary",
            })),
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                { "@type": "ListItem", position: 2, name: "Glossary", item: "https://trytrackr.com/glossary" },
            ],
        },
        {
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "What is SaaS sprawl?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "SaaS sprawl is the uncontrolled proliferation of software subscriptions across an organization, resulting in duplicated tools, fragmented data, security gaps, and wasted spend. A stack audit is the starting point for reversing it.",
                    },
                },
                {
                    "@type": "Question",
                    name: "What is vendor lock-in?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Vendor lock-in is a situation where switching away from a software vendor would be prohibitively costly due to data portability limitations, deep integration dependencies, custom configurations, or contractual terms. Evaluating lock-in risk upfront prevents being trapped in underperforming contracts.",
                    },
                },
                {
                    "@type": "Question",
                    name: "What is a stack rationalization?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Stack rationalization is the process of deliberately reducing the number of tools in a software stack by eliminating redundancies, consolidating overlapping functions, and retiring unused subscriptions. Stack rationalization projects typically reduce software spend by 15-30% for companies with 50+ employees.",
                    },
                },
                {
                    "@type": "Question",
                    name: "What is RevOps?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "RevOps, or Revenue Operations, is a cross-functional discipline that aligns sales, marketing, and customer success teams around shared processes, data, and technology. RevOps leaders are accountable for the efficiency and ROI of the revenue tech stack.",
                    },
                },
                {
                    "@type": "Question",
                    name: "What is TCO in software evaluation?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "TCO, or Total Cost of Ownership, is the complete cost of a software tool including license fees, implementation costs, integration overhead, training time, and internal support burden. TCO calculations frequently reveal that low-priced tools are more expensive than higher-priced alternatives once all costs are included.",
                    },
                },
            ],
        },
    ],
};

export default function GlossaryPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation />

                {/* Hero */}
                <section className="py-20 border-t border-black/10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 border border-black px-3 py-1 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-widest">Glossary</span>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mb-6">
                            AI & SaaS Glossary
                        </h1>
                        <p className="font-mono text-base text-neutral-600 mb-8 max-w-xl leading-relaxed">
                            Plain-English definitions of the terms ops teams and RevOps leaders use when evaluating tools, managing stacks, and tracking software spend.
                        </p>
                    </div>

                    {/* Alphabetical jump nav */}
                    <div className="flex flex-wrap gap-1 border-t border-black/10 pt-8">
                        {ALL_LETTERS.map((letter) => (
                            <a
                                key={letter}
                                href={`#letter-${letter}`}
                                className="w-8 h-8 flex items-center justify-center border border-black font-mono text-xs uppercase hover:bg-black hover:text-white transition-colors"
                            >
                                {letter}
                            </a>
                        ))}
                    </div>
                </section>

                {/* Glossary entries */}
                <section className="pb-20">
                    {GLOSSARY.map((group) => (
                        <div key={group.letter} id={`letter-${group.letter}`} className="border-t border-black/10 scroll-mt-8">
                            {/* Letter header */}
                            <div className="py-6 border-b border-black/10">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                    {group.letter}
                                </span>
                            </div>

                            {/* Terms */}
                            <div className="space-y-0 border border-black mt-0 mb-16">
                                {group.terms.map((term, i) => (
                                    <div
                                        key={term.term}
                                        className={`p-8 ${i < group.terms.length - 1 ? "border-b border-black" : ""}`}
                                    >
                                        <h2 className="font-serif text-xl font-normal mb-3 leading-snug">
                                            {term.term}
                                        </h2>
                                        <p className="font-mono text-sm text-neutral-600 leading-relaxed max-w-3xl mb-3">
                                            {term.definition}
                                        </p>
                                        {term.link && (
                                            <Link
                                                href={term.link.href}
                                                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest hover:underline"
                                            >
                                                {term.link.label}
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                {/* CTA */}
                <section className="py-20 border-t border-black">
                    <div className="border border-black p-10">
                        <div className="max-w-xl">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Put the terms to work</p>
                            <h2 className="font-serif text-3xl font-normal mb-4">
                                Ready to audit your stack?
                            </h2>
                            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-6">
                                Start with a free stack audit to identify SaaS sprawl, consolidation opportunities, orphaned licenses, and renewal cliffs before they cost you.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/audit"
                                    className="inline-flex items-center gap-2 bg-black text-white font-mono text-sm px-6 py-3 hover:bg-neutral-800 transition-colors"
                                >
                                    Start Free Audit
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/scorecard"
                                    className="inline-flex items-center gap-2 border border-black font-mono text-sm px-6 py-3 hover:bg-black hover:text-white transition-colors"
                                >
                                    Get the Scorecard
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
