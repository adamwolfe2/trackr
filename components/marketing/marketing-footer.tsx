"use client";

import Link from "next/link";
import { TrackrLogo } from "@/components/common/trackr-logo";

const PRODUCT_LINKS = [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Our Process", href: "/process" },
    { label: "AI Tool Library", href: "/research" },
    { label: "AI Audit", href: "/audit" },
    { label: "Changelog", href: "/changelog" },
];

const SOLUTIONS_LINKS = [
    { label: "Ops Teams", href: "/for/ops-teams" },
    { label: "RevOps", href: "/for/revops" },
    { label: "Founders", href: "/for/founders" },
    { label: "Engineering", href: "/for/engineering" },
    { label: "Product Managers", href: "/for/product-managers" },
    { label: "Chiefs of Staff", href: "/for/chiefs-of-staff" },
    { label: "All teams \u2192", href: "/for" },
];

const COMPANY_LINKS = [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Use Cases", href: "/use-cases" },
    { label: "Glossary", href: "/glossary" },
    { label: "Contact", href: "/contact" },
    { label: "Integrations", href: "/partners" },
    { label: "Chrome Extension", href: "/chrome" },
];

const INDUSTRIES_LINKS = [
    { label: "Fintech", href: "/industries/fintech" },
    { label: "Healthcare", href: "/industries/healthcare" },
    { label: "SaaS", href: "/industries/saas" },
    { label: "E-Commerce", href: "/industries/ecommerce" },
    { label: "Legal", href: "/industries/legal" },
    { label: "Agencies", href: "/industries/agencies" },
    { label: "All industries \u2192", href: "/industries" },
];

const COMPARE_LINKS = [
    { label: "Trackr vs G2", href: "/vs/g2" },
    { label: "Trackr vs ChatGPT", href: "/vs/chatgpt" },
    { label: "Trackr vs Capterra", href: "/vs/capterra" },
    { label: "Trackr vs Gartner", href: "/vs/gartner" },
    { label: "Trackr vs Vendr", href: "/vs/vendr" },
    { label: "Trackr vs Spreadsheets", href: "/vs/spreadsheets" },
    { label: "All comparisons \u2192", href: "/vs" },
];

const LINK_STYLE = "text-neutral-600 hover:text-black hover:underline";

export function MarketingFooter() {
    return (
        <footer className="w-full border-t border-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-6 sm:gap-8 md:gap-6 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 sm:col-span-2">
                        <h3 className="text-2xl font-serif font-medium mb-3 flex items-center gap-2">
                            <TrackrLogo size={24} />
                            Trackr
                        </h3>
                        <p className="font-mono text-sm text-neutral-500 leading-relaxed mb-6">
                            Research smarter. Evaluate consistently. Stay ahead.
                        </p>
                        <div className="flex gap-4 font-mono text-xs">
                            <Link
                                href="/sign-up"
                                className="border border-black bg-black text-white px-4 py-2 uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="/sign-in"
                                className="border border-black px-4 py-2 uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>

                    {/* Product */}
                    <FooterColumn title="Product" links={PRODUCT_LINKS} />

                    {/* Solutions */}
                    <FooterColumn title="Solutions" links={SOLUTIONS_LINKS} />

                    {/* Industries */}
                    <FooterColumn title="Industries" links={INDUSTRIES_LINKS} />

                    {/* Company */}
                    <FooterColumn title="Company" links={COMPANY_LINKS} />

                    {/* Compare */}
                    <FooterColumn title="Compare" links={COMPARE_LINKS} />
                </div>

                <div className="pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs text-neutral-500 uppercase tracking-wide">
                    <span>&copy; {new Date().getFullYear()} Trackr. All rights reserved.</span>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-black hover:underline">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-black hover:underline">Terms of Service</Link>
                        <Link href="/security" className="hover:text-black hover:underline">Security</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    return (
        <div className="flex flex-col gap-3 font-mono text-sm">
            <span className="font-bold text-black text-xs uppercase tracking-wider">{title}</span>
            {links.map((link) => (
                <Link key={link.href} href={link.href} className={LINK_STYLE}>
                    {link.label}
                </Link>
            ))}
        </div>
    );
}
