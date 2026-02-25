import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell, Hash, RefreshCw, BarChart2 } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export const metadata: Metadata = {
    title: "Trackr for Slack — AI Tool Research in Your Workflow | Trackr",
    description: "Research any SaaS tool in under 2 minutes, right from Slack. Get scored reports, renewal alerts, and stack updates in the channels where your team already works.",
    openGraph: {
        title: "Trackr for Slack — Tool Research Without Leaving Your Workflow",
        description: "Submit any tool URL, get a scored 7-dimension report in under 2 minutes. Renewal alerts, research notifications, and stack digest — all in Slack.",
        url: "https://trytrackr.com/slack",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr for Slack" }],
    },
    alternates: { canonical: "https://trytrackr.com/slack" },
};

const COMMANDS = [
    {
        command: "/trackr research [url]",
        description:
            "Submit any tool URL for research directly from Slack. The 7-dimension scored report posts to your channel when complete — under 2 minutes.",
    },
    {
        command: "Research completion alerts",
        description:
            "When a research job finishes, Trackr automatically posts the report summary to a configured channel so your whole team sees it immediately.",
    },
    {
        command: "Renewal alerts",
        description:
            "Configurable alerts when a tool in your stack is 60 or 30 days from renewal. Includes current score, last evaluation date, and a quick link to the full report.",
    },
    {
        command: "Weekly stack digest",
        description:
            "Optional weekly summary of your workspace's tool scores, recent evaluations, and upcoming renewals — delivered every Monday morning.",
    },
];

const FEATURES = [
    {
        icon: Hash,
        title: "Research from any channel",
        description: "The /trackr slash command works in any channel after installation. No need to switch to a separate app or open a browser tab.",
    },
    {
        icon: Bell,
        title: "Renewal alerts before they surprise you",
        description: "Trackr tracks renewal dates in your stack and pings the right channel at 60 and 30 days out — before the invoice arrives.",
    },
    {
        icon: RefreshCw,
        title: "Auto-research notifications",
        description: "When Trackr re-researches a tool on schedule and the score changes, your team gets a Slack notification with the delta automatically.",
    },
    {
        icon: BarChart2,
        title: "Shared team context",
        description: "Research results are visible to the whole workspace. No more DMing the ops person to ask \"have we looked at this tool before?\"",
    },
];

const SETUP_STEPS = [
    {
        step: "01",
        title: "Connect in Workspace Settings",
        description: "Go to Settings → Integrations in your Trackr workspace and click \"Connect Slack\". Authorizes in under 2 minutes.",
    },
    {
        step: "02",
        title: "Configure your channel",
        description: "Choose which Slack channel receives research completions, renewal alerts, and the weekly digest. Each notification type is configurable independently.",
    },
    {
        step: "03",
        title: "Use /trackr from anywhere",
        description: "The /trackr slash command is immediately available in all channels. Your team can submit tools for research without needing to log in to Trackr.",
    },
];

export default function SlackPage() {
    return (
        <>
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation isLoggedIn={false} />

                {/* Hero */}
                <section className="pt-16 pb-12 border-b border-black">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 border border-black px-3 py-1 mb-6">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono text-[10px] uppercase tracking-widest">Slack Integration</span>
                        </div>
                        <h1 className="font-serif text-5xl sm:text-6xl font-normal leading-tight mb-6">
                            Research any tool.<br />Without leaving Slack.
                        </h1>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-8 max-w-2xl">
                            Trackr brings AI-powered tool intelligence into your Slack workspace. Research reports,
                            renewal alerts, and stack updates — delivered to the channels where your team already works.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-black text-white font-mono text-sm px-6 py-3 hover:bg-neutral-800 transition-colors"
                            >
                                Connect Slack Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <p className="font-mono text-[11px] text-neutral-500 self-center">
                                Available on Team, Startup, and Enterprise plans.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Commands / capabilities */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">What Trackr does in Slack</p>
                    <div className="space-y-0 border border-black">
                        {COMMANDS.map((cmd, i) => (
                            <div
                                key={cmd.command}
                                className={`flex gap-6 p-6 ${i < COMMANDS.length - 1 ? "border-b border-black" : ""}`}
                            >
                                <div className="w-48 flex-shrink-0">
                                    <code className="font-mono text-[11px] bg-black text-white px-2 py-1 break-all">{cmd.command}</code>
                                </div>
                                <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">{cmd.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Feature grid */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">Why teams use it</p>
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

                {/* Setup */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">Setup in under 2 minutes</p>
                    <div className="space-y-0 border border-black">
                        {SETUP_STEPS.map((step, i) => (
                            <div
                                key={step.step}
                                className={`flex gap-6 p-6 ${i < SETUP_STEPS.length - 1 ? "border-b border-black" : ""}`}
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

                {/* Pricing note */}
                <section className="py-16 border-b border-black">
                    <div className="max-w-2xl">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Pricing</p>
                        <p className="font-mono text-sm text-neutral-700 leading-relaxed mb-4">
                            The Slack integration is included with Team ($50/mo), Startup ($149/mo), and Enterprise plans.
                            All paid plans include full notification controls — choose which events trigger alerts and which channels receive them.
                        </p>
                        <p className="font-mono text-[11px] text-neutral-500">
                            Free plan: 3 tool reports/month, no Slack integration.{" "}
                            <Link href="/pricing" className="underline">Compare plans →</Link>
                        </p>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16">
                    <div className="border border-black p-10">
                        <div className="max-w-xl">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Get started</p>
                            <h2 className="font-serif text-3xl font-normal mb-4">
                                Stop researching tools in a vacuum. Bring your team with you.
                            </h2>
                            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-6">
                                14-day free trial on all paid plans. No credit card required.
                                Slack integration connects in under 2 minutes.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/sign-up"
                                    className="inline-flex items-center gap-2 bg-black text-white font-mono text-sm px-6 py-3 hover:bg-neutral-800 transition-colors"
                                >
                                    Start Free Trial
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
