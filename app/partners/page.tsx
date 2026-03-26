import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, TrendingUp, DollarSign, Calendar, Link2 } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export const metadata: Metadata = {
    title: "Partners & Affiliates — Trackr",
    description:
        "Earn recurring commission by referring clients to Trackr. The Architect Partner Program is built for operations consultants, RevOps advisors, and AI implementation specialists.",
    keywords: [
        "trackr affiliate",
        "trackr partner program",
        "AI tool affiliate",
        "SaaS affiliate program",
        "trackr referral",
    ],
    openGraph: {
        title: "Partners & Affiliates — Trackr",
        description:
            "Earn 20% recurring commission by referring clients to Trackr. Built for ops consultants, RevOps advisors, and AI implementation specialists.",
        url: "https://trytrackr.com/partners",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr Partner Program" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Partners & Affiliates — Trackr",
        description:
            "Earn 20% recurring commission by referring clients to Trackr. Built for ops consultants, RevOps advisors, and AI implementation specialists.",
        images: ["/og.png"],
    },
    alternates: { canonical: "https://trytrackr.com/partners" },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebPage",
            "@id": "https://trytrackr.com/partners",
            url: "https://trytrackr.com/partners",
            name: "Partners & Affiliates — Trackr",
            description:
                "Earn recurring commission by referring clients to Trackr. The Architect Partner Program is built for operations consultants and AI advisors.",
            inLanguage: "en-US",
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
                    name: "Partners",
                    item: "https://trytrackr.com/partners",
                },
            ],
        },
        {
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "How much can I earn as a Trackr Architect?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Architects earn 20% recurring commission on every subscription payment made by referred clients, for as long as the client remains a Trackr subscriber. On a Team plan ($50/mo), that is $10/mo per client. On a Startup plan ($149/mo), that is $29.80/mo per client. Earnings compound as you grow your referred client base.",
                    },
                },
                {
                    "@type": "Question",
                    name: "When do I get paid?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Payouts are made monthly via bank transfer or PayPal for any month in which your commissions exceed $50. Commissions are locked 30 days after the referred payment clears to account for refunds and chargebacks.",
                    },
                },
                {
                    "@type": "Question",
                    name: "How are referrals tracked?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Each Architect receives a unique referral code (arc_[yourname]) and a personalized referral link. Referrals are tracked by a 90-day cookie plus a unique code parameter. If a prospect signs up within 90 days of clicking your link — even if they don't convert immediately — the referral is attributed to you.",
                    },
                },
                {
                    "@type": "Question",
                    name: "What tools do I get to share with clients?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Architects receive a dedicated partner kit including: your personalized referral link, a co-branded one-pager PDF, the AI-Native Ops Playbook with your name attached, sample research reports to show clients, and access to the Architect Slack channel for product previews and deal support.",
                    },
                },
            ],
        },
    ],
};

const HOW_IT_WORKS = [
    {
        step: "01",
        title: "Apply",
        description:
            "Submit a short application at /audit. Tell us about your practice, the kinds of clients you serve, and how you plan to introduce Trackr. Most applications receive a response within 2 business days.",
    },
    {
        step: "02",
        title: "Get your arc code",
        description:
            "Once accepted, you receive a unique architect code (arc_[yourname]) and a co-branded partner kit: referral link, one-pager PDF, sample reports, and access to the Architect Slack channel.",
    },
    {
        step: "03",
        title: "Share with clients",
        description:
            "Use your referral link when introducing Trackr to clients. The 90-day cookie means you get credit even if they don't sign up immediately. Include the link in proposals, emails, or your own content.",
    },
    {
        step: "04",
        title: "Earn",
        description:
            "You earn 20% recurring commission on every subscription payment your referred clients make, for as long as they stay subscribed. Monthly payouts when commissions exceed $50.",
    },
];

const STATS = [
    {
        value: "20%",
        label: "Recurring commission",
        detail: "On every subscription payment, for the full life of the client relationship.",
    },
    {
        value: "90 days",
        label: "Cookie window",
        detail: "Referrals are tracked for 90 days from first click — long sales cycles covered.",
    },
    {
        value: "Monthly",
        label: "Payout cadence",
        detail: "Paid every month for any balance over $50, via bank transfer or PayPal.",
    },
    {
        value: "$94K",
        label: "Avg. value identified per client",
        detail: "The average Trackr client identifies $94K in duplicate or underperforming SaaS spend within 90 days.",
    },
];

const WHO_QUALIFIES = [
    {
        title: "Operations consultants",
        description:
            "If you help companies build or audit their SaaS stack, Trackr accelerates your workflow and gives you a shareable research artifact clients trust.",
    },
    {
        title: "RevOps advisors",
        description:
            "RevOps practitioners evaluating CRM, sales tech, and GTM tooling regularly. Trackr's 7-dimension scoring makes your recommendations defensible.",
    },
    {
        title: "AI implementation specialists",
        description:
            "If your practice helps companies adopt AI tools, Trackr's research engine and AI-Native Score give you a structured evaluation framework to anchor engagements.",
    },
    {
        title: "Chiefs of staff and EAs",
        description:
            "Operators who run tool evaluations for executive teams. Trackr turns a 2-week evaluation into a 2-minute report with a shareable PDF your leadership can act on.",
    },
];

const FAQS = [
    {
        question: "How much can I earn as a Trackr Architect?",
        answer: "Architects earn 20% recurring commission on every subscription payment from referred clients, for as long as the client stays subscribed. On a Team plan ($50/mo), that is $10/mo per client. On a Startup plan ($149/mo), that is $29.80/mo per client. Commissions compound as your referred client base grows.",
    },
    {
        question: "When do I get paid?",
        answer: "Payouts are made monthly via bank transfer or PayPal for any month in which your balance exceeds $50. Commissions are locked 30 days after the referred payment clears to account for refunds and chargebacks.",
    },
    {
        question: "How are referrals tracked?",
        answer: "Each Architect receives a unique arc code and personalized referral link. Referrals are tracked by a 90-day cookie plus a unique code parameter. If a prospect signs up within 90 days of clicking your link, the referral is attributed to you regardless of whether they converted immediately.",
    },
    {
        question: "What tools do I get to share with clients?",
        answer: "Your partner kit includes: your personalized referral link, a co-branded one-pager PDF, the AI-Native Ops Playbook, sample research reports to demo the product, and access to the Architect Slack channel for product previews and deal support.",
    },
];

export default function PartnersPage() {
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
                            <Users className="w-3 h-3" />
                            <span className="font-mono text-[10px] uppercase tracking-widest">Architect Partner Program</span>
                        </div>
                        <h1 className="font-serif text-5xl sm:text-6xl font-normal leading-tight mb-6">
                            Earn with Trackr.<br />Get paid for what you build.
                        </h1>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-8 max-w-2xl">
                            If you advise companies on their AI tool stack, you already deliver the value Trackr
                            is built on. The Architect Partner Program lets you earn 20% recurring commission
                            on every client you refer — while giving them a research tool that makes your
                            recommendations faster and more defensible.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/audit"
                                className="inline-flex items-center gap-2 bg-black text-white font-mono text-sm px-6 py-3 hover:bg-neutral-800 transition-colors"
                            >
                                Apply now
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <p className="font-mono text-[11px] text-neutral-500 self-center">
                                20% recurring commission. 90-day cookie. Monthly payouts.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Stats grid */}
                <section className="py-10 border-b border-black">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-black bg-black">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="bg-[#F3F3EF] p-6">
                                <p className="font-serif text-3xl font-normal mb-1">{stat.value}</p>
                                <p className="font-mono text-[10px] text-black uppercase tracking-widest mb-2">{stat.label}</p>
                                <p className="font-mono text-[10px] text-neutral-500 leading-relaxed">{stat.detail}</p>
                            </div>
                        ))}
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
                                <span className="font-mono text-[10px] text-neutral-400 w-6 flex-shrink-0 pt-1">
                                    {step.step}
                                </span>
                                <div>
                                    <h3 className="font-serif text-lg font-normal mb-1">{step.title}</h3>
                                    <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Who qualifies */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">Who qualifies</p>
                    <div className="grid sm:grid-cols-2 gap-px border border-black bg-black">
                        {WHO_QUALIFIES.map((type) => (
                            <div key={type.title} className="bg-[#F3F3EF] p-6">
                                <h3 className="font-serif text-lg font-normal mb-2">{type.title}</h3>
                                <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">{type.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 border border-black p-5">
                        <div className="flex items-start gap-3">
                            <Link2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">
                                The program is open to independent consultants and solo practitioners.
                                Agencies and firms with multiple advisors can apply for a team architect account
                                with shared commission tracking across multiple referrers.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Commission breakdown */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">Commission by plan</p>
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="border border-black min-w-[480px]">
                        <div className="grid grid-cols-3 border-b border-black bg-black">
                            {["Plan", "Client pays / mo", "You earn / mo"].map((col) => (
                                <div key={col} className="bg-[#F3F3EF] px-5 py-3 border-r border-black last:border-r-0">
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">{col}</p>
                                </div>
                            ))}
                        </div>
                        {[
                            { plan: "Team", price: "$50", commission: "$10" },
                            { plan: "Startup", price: "$149", commission: "$29.80" },
                            { plan: "Enterprise", price: "$349", commission: "$69.80" },
                        ].map((row, i) => (
                            <div
                                key={row.plan}
                                className={`grid grid-cols-3 ${i < 2 ? "border-b border-black" : ""}`}
                            >
                                <div className="px-5 py-4 border-r border-black">
                                    <p className="font-serif text-base font-normal">{row.plan}</p>
                                </div>
                                <div className="px-5 py-4 border-r border-black">
                                    <p className="font-mono text-sm">{row.price}</p>
                                </div>
                                <div className="px-5 py-4">
                                    <p className="font-mono text-sm font-medium">{row.commission}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                    <p className="font-mono text-[10px] text-neutral-400 mt-3">
                        Commission is 20% of each subscription payment. Annual plan commissions are paid out monthly over 12 months.
                    </p>
                </section>

                {/* FAQ */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">
                        Common questions
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

                {/* CTA */}
                <section className="py-16">
                    <div className="border border-black p-10">
                        <div className="max-w-xl">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">
                                Apply to the program
                            </p>
                            <h2 className="font-serif text-3xl font-normal mb-4">
                                Ready to become a Trackr Architect?
                            </h2>
                            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-6">
                                Applications take under 5 minutes. Tell us about your practice and how you work
                                with ops and AI-forward teams. Most applicants hear back within 2 business days.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/audit"
                                    className="inline-flex items-center gap-2 bg-black text-white font-mono text-sm px-6 py-3 hover:bg-neutral-800 transition-colors"
                                >
                                    Apply now
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 border border-black font-mono text-sm px-6 py-3 hover:bg-black hover:text-white transition-colors"
                                >
                                    Ask a question
                                </Link>
                            </div>
                            <div className="mt-6 flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                                    <span className="font-mono text-[10px] text-neutral-500">20% recurring</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                    <span className="font-mono text-[10px] text-neutral-500">Monthly payouts</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
                                    <span className="font-mono text-[10px] text-neutral-500">90-day cookie</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </>
    );
}
