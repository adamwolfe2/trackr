import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export const metadata: Metadata = {
    title: "FAQ — Frequently Asked Questions | Trackr",
    description: "Answers to the most common questions about Trackr: how research works, pricing, security, integrations, and how AI tool reports are generated.",
    openGraph: {
        title: "FAQ — Frequently Asked Questions | Trackr",
        description: "Answers to the most common questions about Trackr: how research works, pricing, security, integrations, and how AI tool reports are generated.",
        url: "https://trytrackr.com/faq",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr FAQ" }],
    },
    alternates: { canonical: "https://trytrackr.com/faq" },
    twitter: {
        card: "summary_large_image",
        title: "FAQ — Frequently Asked Questions | Trackr",
        description: "Answers to the most common questions about Trackr: how research works, pricing, security, integrations, and how AI tool reports are generated.",
        images: ["/og.png"],
    },
    keywords: ["trackr FAQ", "AI tool research FAQ", "SaaS evaluation questions", "how does trackr work", "trackr pricing questions"],
};

const FAQ_SECTIONS = [
    {
        id: "getting-started",
        label: "Getting Started",
        questions: [
            {
                q: "What is Trackr?",
                a: "Trackr is an AI tool intelligence layer for operations teams, RevOps leaders, finance teams, and founders. You submit any SaaS or AI tool, and Trackr generates a scored 7-dimension research report by pulling data from the vendor's site, G2, Reddit, Capterra, and other sources — without you scheduling a single demo.",
            },
            {
                q: "How does Trackr research tools?",
                a: "Trackr uses AI research agents to crawl the vendor's public website, pricing pages, review platforms, forums, and changelog history. The agents score the tool across 7 weighted dimensions — Core Capability, Ease of Use, Integration Depth, Pricing Value, AI Sophistication, Community and Support, and Scalability — and produce a written justification for each score.",
            },
            {
                q: "How long does a research report take?",
                a: "Most research reports are ready in under 2 minutes. Complex tools with limited public data may take up to 5 minutes. You're notified in-app and via email when the report is complete, so you don't need to wait at your screen.",
            },
            {
                q: "What tools can Trackr research?",
                a: "Trackr can research any SaaS or AI tool with a public website. This includes CRMs, project management tools, AI writing assistants, data platforms, marketing automation tools, customer support software, and any other tool category where there is vendor-published information to analyze.",
            },
            {
                q: "Do I need a credit card to start?",
                a: "No. Trackr's free plan includes 3 tool reports per month with no credit card required. You can create an account and run your first research report in under 2 minutes at trytrackr.com/sign-up.",
            },
        ],
    },
    {
        id: "research-reports",
        label: "Research Reports",
        questions: [
            {
                q: "How accurate are Trackr reports?",
                a: "Trackr reports pull from public data sources including vendor sites, review platforms, and community discussions. Reports are as accurate as the publicly available information about a tool at the time of research. Scores reflect the state of the tool at the research date, and reports can be refreshed when you want updated findings.",
            },
            {
                q: "Where does Trackr get its data?",
                a: "Trackr sources data from vendor websites, pricing pages, product documentation, G2 and Capterra reviews, Reddit discussions, Product Hunt threads, changelog histories, and LinkedIn company signals. Research agents synthesize this into scored findings with cited sources.",
            },
            {
                q: "How often are reports updated?",
                a: "Reports reflect the state of a tool at the time of research. You can request a fresh research run at any time to get an updated report. On Team and above plans, workspaces can configure automatic refresh intervals for tools in their stack.",
            },
            {
                q: "Can I share a report with someone outside my workspace?",
                a: "Yes. Any report can be shared via a public share link, allowing people outside your Trackr workspace to view the report without needing an account. Share links can be revoked at any time from the report settings.",
            },
            {
                q: "What are the 7 research dimensions?",
                a: "The 7 dimensions are: Core Capability (25% weight), Ease of Use (15%), Integration Depth (15%), Pricing Value (15%), AI Sophistication (15%), Community and Support (10%), and Scalability (5%). Each dimension is scored 1-10 and a weighted overall score is calculated. You can see the full methodology at trytrackr.com/scorecard.",
            },
        ],
    },
    {
        id: "pricing",
        label: "Pricing & Plans",
        questions: [
            {
                q: "What's included in the free plan?",
                a: "The free plan includes 3 tool research reports per month, access to the public research library, basic scorecard comparisons, and the Chrome extension. There is no credit card required and no expiration on free accounts.",
            },
            {
                q: "What counts as a 'credit'?",
                a: "One credit is consumed when you submit a tool for a new research run. Viewing existing reports, sharing reports, and accessing the public library do not consume credits. Refreshing an existing report for updated data counts as one credit.",
            },
            {
                q: "Can I switch plans at any time?",
                a: "Yes. You can upgrade or downgrade your plan at any time from your workspace billing settings. Upgrades take effect immediately. Downgrades take effect at the end of the current billing period, and you keep access to paid features until then.",
            },
            {
                q: "Do you offer annual billing?",
                a: "Yes. Annual billing is available on all paid plans and includes a discount compared to monthly billing. You can switch to annual billing from your workspace settings at any time. The remaining value of your current monthly period is credited toward the annual plan.",
            },
            {
                q: "Is there a discount for non-profits or startups?",
                a: "Yes. Non-profit organizations and early-stage startups (pre-Series A) can apply for discounted pricing. Contact us at trytrackr.com/contact with your organization details and we'll respond within one business day.",
            },
        ],
    },
    {
        id: "team-workspace",
        label: "Team & Workspace",
        questions: [
            {
                q: "How many users can I add to my workspace?",
                a: "The free plan supports a single user. The Starter plan supports up to 3 seats. The Team plan supports up to 15 seats. For larger teams or enterprise requirements, contact us for custom pricing.",
            },
            {
                q: "Can multiple people research the same tool?",
                a: "Yes. When a tool has been researched by anyone in your workspace, all members can view, annotate, and share that report. Research credits are only consumed once per unique tool research run — viewing or sharing a report that already exists does not cost additional credits.",
            },
            {
                q: "How do I invite team members?",
                a: "Go to Settings, then Team Members in your workspace dashboard. Enter the email addresses of the people you want to invite. They'll receive an invitation email and can join your workspace after creating or logging into their Trackr account.",
            },
            {
                q: "What does workspace-level data isolation mean?",
                a: "Workspace-level data isolation means your research reports, notes, stack data, and workspace configurations are only accessible to members of your workspace. Trackr does not share your workspace data across organizations, and workspace data cannot be accessed by members of other workspaces.",
            },
        ],
    },
    {
        id: "integrations",
        label: "Integrations",
        questions: [
            {
                q: "Does Trackr integrate with Slack?",
                a: "Yes. The Trackr Slack integration sends research report summaries, score alerts, and renewal reminders directly to channels or DMs of your choosing. You can also submit tools for research directly from Slack without opening the Trackr dashboard.",
            },
            {
                q: "Is there a Chrome extension?",
                a: "Yes. The Trackr Chrome extension lets you research any SaaS tool directly from your browser. Click the extension icon on any vendor's website to submit it for research or view existing scores from your workspace. Available free with all Trackr plans at trytrackr.com/chrome.",
            },
            {
                q: "Does Trackr have an API?",
                a: "An API is available on Team and above plans. The API allows you to programmatically submit tools for research, retrieve report data, and sync findings with your internal systems. API documentation is available in your workspace dashboard under Settings.",
            },
            {
                q: "What other tools does Trackr integrate with?",
                a: "Trackr currently integrates with Slack and Chrome. Integrations for Notion, Linear, and HubSpot are on the roadmap. If your team uses a tool you'd like Trackr to integrate with, you can submit a request at trytrackr.com/contact.",
            },
        ],
    },
    {
        id: "security",
        label: "Security & Privacy",
        questions: [
            {
                q: "Is my data secure?",
                a: "Yes. Trackr encrypts all data at rest and in transit using AES-256 and TLS 1.3. Workspace data is isolated at the database level. We perform regular security audits and penetration testing. You can review our full security practices at trytrackr.com/security.",
            },
            {
                q: "Do you sell our data to third parties?",
                a: "No. Trackr does not sell, rent, or share your workspace data with third parties. Research submissions, report contents, stack data, and workspace configurations are never used for advertising, benchmarking products sold to others, or any other commercial purpose outside of delivering the Trackr service to you.",
            },
            {
                q: "Can I delete my workspace data?",
                a: "Yes. You can delete individual reports, your full research history, or your entire workspace from the settings dashboard. Workspace deletion is permanent and irreversible. Upon request, we can provide a full data export in JSON format before deletion.",
            },
            {
                q: "Is Trackr GDPR compliant?",
                a: "Yes. Trackr is GDPR compliant. We process only the data necessary to deliver the service, provide data subject access and deletion mechanisms, maintain a data processing agreement for business customers, and do not transfer personal data outside compliant legal frameworks. See our full privacy policy at trytrackr.com/privacy.",
            },
        ],
    },
];

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SECTIONS.flatMap((section) =>
        section.questions.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
            },
        }))
    ),
};

export default function FaqPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation />

                {/* Hero */}
                <section className="py-20 border-t border-black/10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 border border-black px-3 py-1 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-widest">FAQ</span>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mb-6">
                            Frequently Asked Questions
                        </h1>
                        <p className="font-mono text-base text-neutral-600 mb-8 max-w-xl leading-relaxed">
                            Everything you need to know about Trackr.
                        </p>
                    </div>

                    {/* Jump navigation */}
                    <div className="flex flex-wrap gap-2 border-t border-black/10 pt-8">
                        {FAQ_SECTIONS.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
                            >
                                {section.label}
                            </a>
                        ))}
                    </div>
                </section>

                {/* FAQ Sections */}
                {FAQ_SECTIONS.map((section) => (
                    <section key={section.id} id={section.id} className="py-16 border-t border-black/10 scroll-mt-8">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-10">
                            {section.label}
                        </p>
                        <div className="space-y-0 border border-black">
                            {section.questions.map((item, i) => (
                                <div
                                    key={i}
                                    className={`p-8 ${i < section.questions.length - 1 ? "border-b border-black" : ""}`}
                                >
                                    <h2 className="font-serif text-xl font-normal mb-4 leading-snug">
                                        {item.q}
                                    </h2>
                                    <p className="font-mono text-sm text-neutral-600 leading-relaxed max-w-3xl">
                                        {item.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Footer links */}
                <section className="py-16 border-t border-black/10">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-6">More resources</p>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { label: "Pricing", href: "/pricing" },
                            { label: "Security", href: "/security" },
                            { label: "Contact", href: "/contact" },
                            { label: "How It Works", href: "/process" },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="inline-flex items-center gap-1 border border-black px-4 py-2 font-mono text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                            >
                                {item.label}
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        ))}
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
