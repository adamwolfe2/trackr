import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Chrome, Search, Zap, FolderSync, CheckCircle } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export const metadata: Metadata = {
    title: "Trackr Chrome Extension — Research Any Tool Instantly | Trackr",
    description: "Research any SaaS tool while you browse. Get a scored 7-dimension report without leaving the page. Save results to your team workspace. Free for all Trackr users.",
    keywords: ["trackr chrome extension", "SaaS research browser extension", "AI tool research extension", "chrome extension for SaaS", "tool research chrome", "browser extension ops"],
    openGraph: {
        title: "Trackr for Chrome — Research Any Tool Instantly",
        description: "Click any vendor site to get a scored 7-dimension research report. No tab switching. Syncs to your team workspace.",
        url: "https://trytrackr.com/chrome",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr Chrome Extension" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Trackr Chrome Extension — Research Any Tool Instantly",
        description: "Research any SaaS tool while you browse. Scored reports. No tab switching.",
        images: ["/og.png"],
    },
    alternates: { canonical: "https://trytrackr.com/chrome" },
};

const HOW_IT_WORKS = [
    {
        step: "01",
        title: "Install and connect",
        description: "Install the extension and connect your Trackr account. Free account at trytrackr.com — takes under 2 minutes.",
    },
    {
        step: "02",
        title: "Browse to any SaaS tool",
        description: "Navigate to any software vendor's website. The Trackr icon appears in your toolbar whenever you're on a SaaS site.",
    },
    {
        step: "03",
        title: "Click to research or check scores",
        description: "Click the icon to submit the tool for a fresh research run, or instantly see existing scores if your team has already evaluated it.",
    },
    {
        step: "04",
        title: "Reports sync to your workspace",
        description: "Finished reports automatically appear in your team's Trackr workspace. Everyone pulls from the same source of truth.",
    },
];

const FEATURES = [
    {
        icon: Zap,
        title: "One-click research",
        description: "Click the Trackr icon on any SaaS vendor's website to submit it for research. A scored 7-dimension report is ready in under 2 minutes.",
    },
    {
        icon: Search,
        title: "Instant score lookup",
        description: "If a tool has already been researched in your workspace, the extension shows the current score, key findings, and evaluation date immediately.",
    },
    {
        icon: CheckCircle,
        title: "Stack check",
        description: "See at a glance whether the tool you're browsing is already in your stack, being evaluated, or new to your team.",
    },
    {
        icon: FolderSync,
        title: "Send to queue",
        description: "Add a tool to your research queue without triggering immediate research. Useful when you're discovery browsing and want to batch evaluations.",
    },
];

const USE_CASES = [
    "You land on a new CRM's website during a LinkedIn ad click — check your team's existing score before reading the homepage",
    "Discovery browsing 6 alternatives to your current project management tool — queue them all for batch research",
    "A sales rep shows you a tool on a demo call — look it up without leaving the screen share",
    "Your CEO forwards a Product Hunt link — check if you've already evaluated it",
];

const chromeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "SoftwareApplication",
            name: "Trackr Chrome Extension",
            operatingSystem: "Chrome, Brave, Edge (Chromium)",
            applicationCategory: "BusinessApplication",
            description: "Research any SaaS tool while you browse. Get a scored 7-dimension report without leaving the page. Syncs to your team workspace automatically.",
            url: "https://trytrackr.com/chrome",
            offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                description: "Free for all Trackr users",
            },
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                { "@type": "ListItem", position: 2, name: "Chrome Extension", item: "https://trytrackr.com/chrome" },
            ],
        },
        {
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "What does the Trackr Chrome extension do?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "The Trackr Chrome extension lets you research any SaaS tool directly from your browser. Click the icon on any vendor site to get a scored 7-dimension research report in under 2 minutes. Results sync automatically to your team workspace.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Is the Trackr Chrome extension free?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. The Trackr Chrome extension is free and included with all Trackr plans, including the free plan. A Trackr account is required to connect the extension to your workspace.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Does the Trackr extension track my browsing history?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "No. The extension only activates when you click the icon. It does not track browsing history, collect personal data, or run in the background. The only permission requested is access to the current tab URL when you click the icon.",
                    },
                },
            ],
        },
    ],
};

export default function ChromePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(chromeJsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation isLoggedIn={false} />

                {/* Hero */}
                <section className="pt-16 pb-12 border-b border-black">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 border border-black px-3 py-1 mb-6">
                            <Chrome className="w-3 h-3" />
                            <span className="font-mono text-[10px] uppercase tracking-widest">Chrome Extension</span>
                        </div>
                        <h1 className="font-serif text-5xl sm:text-6xl font-normal leading-tight mb-6">
                            Research any tool.<br />Right from your browser.
                        </h1>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-8 max-w-2xl">
                            The Trackr Chrome extension brings AI tool research into your browsing session.
                            Click any vendor site to get a scored report. No tab switching. Reports sync
                            to your team workspace automatically.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-black text-white font-mono text-sm px-6 py-3 hover:bg-neutral-800 transition-colors"
                            >
                                Install Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <p className="font-mono text-[11px] text-neutral-500 self-center">
                                Free Trackr account required. Chrome 88+, Brave, Edge (Chromium).
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features grid */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">Core features</p>
                    <div className="grid sm:grid-cols-2 gap-px border border-black bg-black">
                        {FEATURES.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div key={f.title} className="bg-[#F3F3EF] p-6">
                                    <div className="w-8 h-8 border border-black flex items-center justify-center mb-4">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-serif text-xl font-normal mb-2">{f.title}</h3>
                                    <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">{f.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* How it works */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">How it works</p>
                    <div className="space-y-0 border border-black">
                        {HOW_IT_WORKS.map((step, i) => (
                            <div
                                key={step.step}
                                className={`flex gap-6 p-6 ${i < HOW_IT_WORKS.length - 1 ? "border-b border-black" : ""}`}
                            >
                                <span className="font-mono text-[10px] text-neutral-400 w-6 flex-shrink-0 pt-1">{step.step}</span>
                                <div>
                                    <h3 className="font-serif text-lg font-normal mb-1">{step.title}</h3>
                                    <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Use cases */}
                <section className="py-16 border-b border-black">
                    <div className="grid sm:grid-cols-2 gap-12">
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Who uses it</p>
                            <p className="font-mono text-sm text-neutral-700 leading-relaxed mb-4">
                                Ops managers, RevOps leads, chiefs of staff, and founders who evaluate tools regularly.
                                Particularly useful during vendor discovery and competitive research.
                            </p>
                            <p className="font-mono text-[11px] text-neutral-500 leading-relaxed">
                                Included with all Trackr plans. Connects to your existing workspace with one click.
                            </p>
                        </div>
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Scenarios</p>
                            <ul className="space-y-3">
                                {USE_CASES.map((uc, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="font-mono text-[10px] text-neutral-400 mt-0.5 flex-shrink-0">→</span>
                                        <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">{uc}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Privacy */}
                <section className="py-16 border-b border-black">
                    <div className="max-w-2xl">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Privacy</p>
                        <p className="font-mono text-sm text-neutral-700 leading-relaxed mb-2">
                            The extension only activates when you click the icon. It does not track browsing history,
                            collect personal data, or run in the background.
                        </p>
                        <p className="font-mono text-[11px] text-neutral-500">
                            Permissions requested: access to the current tab URL on click only. No access to tab content.
                            See our{" "}
                            <Link href="/privacy" className="underline">privacy policy</Link>
                            {" "}for full details.
                        </p>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16">
                    <div className="border border-black p-10">
                        <div className="max-w-xl">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Get started free</p>
                            <h2 className="font-serif text-3xl font-normal mb-4">
                                Research tools from anywhere in your browser.
                            </h2>
                            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-6">
                                Free plan includes 3 tool reports per month. No credit card required.
                                The Chrome extension is available on all plans.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/sign-up"
                                    className="inline-flex items-center gap-2 bg-black text-white font-mono text-sm px-6 py-3 hover:bg-neutral-800 transition-colors"
                                >
                                    Install Free
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="inline-flex items-center gap-2 border border-black font-mono text-sm px-6 py-3 hover:bg-black hover:text-white transition-colors"
                                >
                                    View Plans
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
