import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Lock, Eye, Server, AlertCircle } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const revalidate = false;

export const metadata: Metadata = {
    title: "Security — Trackr",
    description: "Trackr's security architecture, data isolation, access controls, and responsible disclosure policy. Built for teams that handle sensitive SaaS stack data.",
    openGraph: {
        title: "Security at Trackr",
        description: "How Trackr protects your tool research data, workspace isolation, access controls, and our responsible disclosure policy.",
        url: "https://trytrackr.com/security",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Security at Trackr" }],
    },
    alternates: { canonical: "https://trytrackr.com/security" },
};

const SECTIONS = [
    {
        icon: Lock,
        title: "Data isolation",
        items: [
            "Each workspace's data is fully isolated at the database level. No cross-workspace data access is possible.",
            "Research reports, tool scores, team notes, and spend data are private to your workspace unless you explicitly create a share link.",
            "Shared report links use opaque tokens — they do not expose workspace IDs, user IDs, or any other internal identifiers.",
            "When you delete a tool or workspace, all associated data is permanently removed.",
        ],
    },
    {
        icon: Shield,
        title: "Authentication & access control",
        items: [
            "Authentication is managed by Clerk — a SOC 2 Type II certified identity provider. Trackr never stores your password.",
            "All API routes authenticate via Clerk session tokens. No request can access workspace data without a valid authenticated session.",
            "Workspace members are role-scoped: Admin and Member. Role checks are enforced server-side on every mutating action.",
            "Invitation acceptance enforces plan member limits at the database level — not just in the UI.",
            "Webhook events (Stripe, Clerk) are validated against HMAC signatures before processing.",
        ],
    },
    {
        icon: Server,
        title: "Infrastructure security",
        items: [
            "All data is encrypted in transit via TLS 1.2+. All storage is encrypted at rest via AES-256 (Neon PostgreSQL).",
            "Database hosted on Neon (SOC 2 Type II, ISO 27001). Application hosted on Vercel (SOC 2 Type II).",
            "SSRF protection: outbound research requests block private IP ranges (10.x, 192.168.x, 172.16–31.x, 127.x) and .internal/.local hostnames.",
            "Rate limiting on all authenticated and public endpoints. Rate limiter memory is hard-capped to prevent DoS via state exhaustion.",
            "All production errors are logged — no silent failures in catch blocks.",
        ],
    },
    {
        icon: Eye,
        title: "Application security",
        items: [
            "All user-supplied content is escaped before rendering. Markdown-to-HTML rendering escapes HTML before applying formatting.",
            "Link URLs in rendered content are validated to block javascript: and data: protocol injection.",
            "Workspace names and tool names are HTML-escaped before embedding in email templates.",
            "Slug parameters in public routes are allowlisted to [a-z0-9-]+ to prevent path traversal.",
            "All ID parameters are validated as proper UUIDs before database queries execute.",
            "Stripe webhook events use atomic INSERT...ON CONFLICT DO NOTHING to prevent duplicate processing on retry.",
        ],
    },
    {
        icon: AlertCircle,
        title: "Responsible disclosure",
        items: [
            "If you discover a security vulnerability in Trackr, please report it to security@trytrackr.com.",
            "Include a description of the issue, steps to reproduce, and any relevant screenshots or proof of concept.",
            "We will acknowledge receipt within 2 business days and provide a fix timeline within 5 business days for critical issues.",
            "We do not take legal action against researchers who report vulnerabilities in good faith following this policy.",
            "We do not currently offer a bug bounty program, but we will publicly acknowledge reporters with permission.",
        ],
    },
];

export default function SecurityPage() {
    return (
        <>
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
                            How we protect your data.
                        </h1>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed max-w-2xl">
                            Your tool research, team notes, spend data, and stack information are sensitive.
                            This page documents how Trackr handles security at the infrastructure, application,
                            and access control levels.
                        </p>
                    </div>
                </section>

                {/* Quick trust signals */}
                <section className="py-10 border-b border-black">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-black bg-black">
                        {[
                            { label: "Data in transit", value: "TLS 1.2+" },
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

                {/* Security sections */}
                <section className="py-16 border-b border-black">
                    <div className="space-y-0 border border-black">
                        {SECTIONS.map((section, i) => {
                            const Icon = section.icon;
                            return (
                                <div
                                    key={section.title}
                                    className={`p-8 ${i < SECTIONS.length - 1 ? "border-b border-black" : ""}`}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-7 h-7 border border-black flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <h2 className="font-serif text-xl font-normal capitalize">{section.title}</h2>
                                    </div>
                                    <ul className="space-y-2 ml-10">
                                        {section.items.map((item, j) => (
                                            <li key={j} className="flex gap-3">
                                                <span className="font-mono text-[10px] text-neutral-300 flex-shrink-0 mt-0.5">—</span>
                                                <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">{item}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Questions / contact */}
                <section className="py-16">
                    <div className="border border-black p-10">
                        <div className="max-w-xl">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Questions?</p>
                            <h2 className="font-serif text-3xl font-normal mb-4">
                                We take security seriously.
                            </h2>
                            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed mb-6">
                                For security disclosures, write to{" "}
                                <a href="mailto:security@trytrackr.com" className="underline">security@trytrackr.com</a>.
                                For general questions about data handling, see our{" "}
                                <Link href="/privacy" className="underline">Privacy Policy</Link>{" "}or{" "}
                                <Link href="/contact" className="underline">contact us</Link>.
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
