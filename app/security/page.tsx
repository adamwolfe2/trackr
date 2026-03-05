import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Lock, Eye, Server, AlertCircle, Database, Key } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export const metadata: Metadata = {
    title: "Security — Trackr",
    description:
        "How Trackr protects your tool research data, workspace isolation, access controls, and infrastructure security. Built for teams that handle sensitive SaaS stack information.",
    keywords: [
        "trackr security",
        "AI tool research security",
        "SaaS data security",
        "enterprise security",
        "SOC2",
    ],
    openGraph: {
        title: "Security at Trackr",
        description:
            "How Trackr protects your tool research data, workspace isolation, access controls, and our responsible disclosure policy.",
        url: "https://trytrackr.com/security",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Security at Trackr" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Security at Trackr",
        description:
            "How Trackr protects your tool research data, workspace isolation, access controls, and our responsible disclosure policy.",
        images: ["/og.png"],
    },
    alternates: { canonical: "https://trytrackr.com/security" },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebPage",
            "@id": "https://trytrackr.com/security",
            url: "https://trytrackr.com/security",
            name: "Security — Trackr",
            description:
                "How Trackr protects your tool research data, workspace isolation, and access controls.",
            inLanguage: "en-US",
            about: { "@type": "Thing", name: "Information Security" },
            isPartOf: { "@id": "https://trytrackr.com/#website" },
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://trytrackr.com",
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: "Security",
                    item: "https://trytrackr.com/security",
                },
            ],
        },
        {
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "Do you sell our data?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "No. Trackr does not sell, rent, or share your data with third parties for advertising or marketing purposes. Your tool research, stack data, and team notes are yours. We use your data only to operate and improve the Trackr service.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Where is my data stored?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "All workspace data is stored in Neon PostgreSQL — a SOC 2 Type II and ISO 27001 certified database provider running on AWS us-east-1. The application is hosted on Vercel, which is also SOC 2 Type II certified. No data is stored outside these two vendors.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Can I delete my data?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. You can delete individual tools, notes, and spend records at any time from the Trackr dashboard. To delete your account and all associated workspace data permanently, contact support@trytrackr.com. Deletion is irreversible and runs within 30 days.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Do you support SSO?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Authentication is handled by Clerk, which supports Google and GitHub OAuth as standard login options on all plans. Enterprise-grade SAML SSO for corporate identity providers (Okta, Azure AD, etc.) is available on the Enterprise plan. Multi-factor authentication (MFA) is supported and can be enforced workspace-wide.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Is my tool research data visible to other workspaces?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "No. Each workspace's research reports, notes, stack data, spend records, and pain points are fully isolated at the database level. No cross-workspace data access is possible. The only exception is reports you explicitly publish to the public research library or share via a public share link — both require deliberate action by a workspace admin.",
                    },
                },
            ],
        },
    ],
};

const SECTIONS = [
    {
        icon: Lock,
        title: "Data isolation",
        items: [
            "Each workspace's data is fully isolated at the database level. No cross-workspace data access is possible.",
            "Research reports, tool scores, team notes, and spend data are private to your workspace unless you explicitly create a share link or publish a report.",
            "Shared report links use opaque tokens — they do not expose workspace IDs, user IDs, or any other internal identifiers.",
            "When you delete a tool or workspace, all associated data is permanently removed from the database.",
        ],
    },
    {
        icon: Key,
        title: "Authentication and access control",
        items: [
            "Authentication is managed by Clerk — a SOC 2 Type II certified identity provider. Trackr never stores your password.",
            "All API routes authenticate via Clerk session tokens. No request can access workspace data without a valid authenticated session.",
            "Workspace members are role-scoped: Admin and Member. Role checks are enforced server-side on every mutating action, not just in the UI.",
            "Invitation acceptance enforces plan member limits at the database level. Overage is not possible via race condition.",
            "Webhook events (Stripe, Clerk) are validated against HMAC signatures before any processing occurs.",
        ],
    },
    {
        icon: Server,
        title: "Infrastructure security",
        items: [
            "All data is encrypted in transit via TLS 1.3. All storage is encrypted at rest using AES-256 (Neon PostgreSQL).",
            "Database hosted on Neon (SOC 2 Type II, ISO 27001). Application hosted on Vercel (SOC 2 Type II). No self-managed infrastructure.",
            "SSRF protection: outbound research requests block private IP ranges (10.x, 192.168.x, 172.16-31.x, 127.x) and .internal/.local hostnames.",
            "Rate limiting is applied to all authenticated and public endpoints. The in-memory rate limiter is hard-capped at 50,000 entries to prevent state exhaustion.",
            "All production errors are logged. No silent failures in catch blocks — all API routes surface errors to the logging pipeline.",
        ],
    },
    {
        icon: Eye,
        title: "Application security",
        items: [
            "All user-supplied content is escaped before rendering. The markdown-to-HTML renderer escapes raw HTML before applying inline formatting.",
            "Link URLs in rendered content are validated to block javascript: and data: protocol injection.",
            "Workspace names and tool names are HTML-escaped before embedding in transactional email templates.",
            "Slug parameters in all public routes are allowlisted to [a-z0-9-]+ to prevent path traversal.",
            "All ID parameters are validated as proper UUIDs before database queries execute.",
            "Stripe webhook events use atomic INSERT...ON CONFLICT DO NOTHING to prevent duplicate processing on retry.",
        ],
    },
    {
        icon: Database,
        title: "What data we store and do not store",
        items: [
            "We store: workspace metadata, tool research reports and scores, team notes, SaaS spend records you enter, team member email addresses, and Stripe billing references.",
            "We do not store: your browsing history, personal web activity, device identifiers, or any data from the Chrome extension beyond the tool URL you submit for research.",
            "The Chrome extension only activates when you click the icon. It does not run in the background, does not read page content, and only transmits the current tab URL when you explicitly trigger a research request.",
            "Research pipeline inputs (vendor website content scraped by Firecrawl and Tavily) are used to generate your report and are not retained beyond the research run.",
        ],
    },
    {
        icon: AlertCircle,
        title: "Responsible disclosure",
        items: [
            "If you discover a security vulnerability in Trackr, please report it to security@trytrackr.com.",
            "Include a description of the issue, steps to reproduce, and any relevant screenshots or proof-of-concept code.",
            "We will acknowledge receipt within 2 business days and provide a fix timeline within 5 business days for critical issues.",
            "We do not take legal action against researchers who report vulnerabilities in good faith under this policy.",
            "We do not currently offer a paid bug bounty program, but we will publicly acknowledge reporters with their permission.",
        ],
    },
    {
        icon: Shield,
        title: "Compliance and certifications",
        items: [
            "Trackr's infrastructure vendors — Neon and Vercel — are independently SOC 2 Type II certified. Clerk is SOC 2 Type II certified.",
            "Trackr processes data in accordance with GDPR principles: data minimization, purpose limitation, and user rights to access and deletion.",
            "EU customers: all data is stored in AWS us-east-1 (United States). If your compliance requirements mandate EU data residency, contact us to discuss Enterprise data residency options.",
            "Trackr is not yet independently SOC 2 certified. If your procurement requires a SOC 2 report, contact sales@trytrackr.com to discuss Enterprise options.",
        ],
    },
];

const FAQS = [
    {
        question: "Do you sell our data?",
        answer: "No. Trackr does not sell, rent, or share your data with third parties for advertising or marketing purposes. Your tool research, stack data, and team notes are yours. We use your data only to operate and improve Trackr.",
    },
    {
        question: "Where is my data stored?",
        answer: "All workspace data is stored in Neon PostgreSQL — a SOC 2 Type II and ISO 27001 certified database provider running on AWS us-east-1. The application runs on Vercel, which is also SOC 2 Type II certified.",
    },
    {
        question: "Can I delete my data?",
        answer: "Yes. Delete individual tools, notes, and spend records from the dashboard at any time. To delete your account and all workspace data permanently, email support@trytrackr.com. Deletion is completed within 30 days and is irreversible.",
    },
    {
        question: "Do you support SSO?",
        answer: "Google and GitHub OAuth are available on all plans. Enterprise SAML SSO for Okta, Azure AD, and similar providers is available on the Enterprise plan. MFA is supported and can be enforced workspace-wide.",
    },
    {
        question: "Is my tool research visible to other workspaces?",
        answer: "No. Each workspace is fully isolated at the database level. The only data visible outside your workspace is reports you deliberately publish to the public library or share via an explicit share link.",
    },
];

export default function SecurityPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation isLoggedIn={false} />

                {/* Hero */}
                <section className="pt-16 pb-12 border-b border-black">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 border border-black px-3 py-1 mb-6">
                            <Shield className="w-3 h-3" />
                            <span className="font-mono text-[10px] uppercase tracking-widest">Security</span>
                        </div>
                        <h1 className="font-serif text-5xl sm:text-6xl font-normal leading-tight mb-6">
                            Enterprise-grade security,<br />built in.
                        </h1>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed max-w-2xl">
                            Your tool research, team notes, spend data, and stack information are sensitive.
                            This page documents how Trackr handles security at the infrastructure, application,
                            access control, and data isolation levels — and what we do and do not store.
                        </p>
                    </div>
                </section>

                {/* Trust signal grid */}
                <section className="py-10 border-b border-black">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-black bg-black">
                        {[
                            { label: "Data in transit", value: "TLS 1.3" },
                            { label: "Data at rest", value: "AES-256" },
                            { label: "Identity provider", value: "Clerk (SOC 2)" },
                            { label: "Database host", value: "Neon (SOC 2)" },
                        ].map((item) => (
                            <div key={item.label} className="bg-[#F3F3EF] p-5 text-center">
                                <p className="font-serif text-lg font-normal mb-1">{item.value}</p>
                                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Security detail sections */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">
                        Security architecture
                    </p>
                    <div className="space-y-0 border border-black">
                        {SECTIONS.map((section, i) => {
                            const Icon = section.icon;
                            return (
                                <div
                                    key={section.title}
                                    className={`p-8 ${i < SECTIONS.length - 1 ? "border-b border-black" : ""}`}
                                >
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-7 h-7 border border-black flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <h2 className="font-serif text-xl font-normal">{section.title}</h2>
                                    </div>
                                    <ul className="space-y-2 ml-10">
                                        {section.items.map((item, j) => (
                                            <li key={j} className="flex gap-3">
                                                <span className="font-mono text-[10px] text-neutral-300 flex-shrink-0 mt-0.5">
                                                    —
                                                </span>
                                                <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">
                                                    {item}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">
                        Frequently asked questions
                    </p>
                    <div className="space-y-0 border border-black">
                        {FAQS.map((faq, i) => (
                            <div
                                key={i}
                                className={`p-8 ${i < FAQS.length - 1 ? "border-b border-black" : ""}`}
                            >
                                <h3 className="font-serif text-lg font-normal mb-3">{faq.question}</h3>
                                <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="py-16">
                    <div className="border border-black p-10">
                        <div className="max-w-xl">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">
                                Security contact
                            </p>
                            <h2 className="font-serif text-3xl font-normal mb-4">
                                We take security seriously.
                            </h2>
                            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-6">
                                For vulnerability disclosures, write to{" "}
                                <a href="mailto:security@trytrackr.com" className="underline">
                                    security@trytrackr.com
                                </a>
                                . For questions about data handling or GDPR requests, see our{" "}
                                <Link href="/privacy" className="underline">Privacy Policy</Link>
                                {" "}or{" "}
                                <Link href="/contact" className="underline">contact us directly</Link>.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/privacy"
                                    className="inline-flex items-center gap-2 border border-black font-mono text-sm px-6 py-3 hover:bg-black hover:text-white transition-colors"
                                >
                                    Privacy Policy
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/terms"
                                    className="inline-flex items-center gap-2 border border-black font-mono text-sm px-6 py-3 hover:bg-black hover:text-white transition-colors"
                                >
                                    Terms of Service
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </>
    );
}
