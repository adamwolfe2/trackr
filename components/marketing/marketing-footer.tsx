"use client";

import Link from "next/link";
import { TrackrLogo } from "@/components/common/trackr-logo";

export function MarketingFooter() {
    return (
        <footer className="w-full py-12 border-t border-black">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                {/* Brand */}
                <div className="md:col-span-1">
                    <h3 className="text-2xl font-serif font-medium mb-4 flex items-center gap-2">
                        <TrackrLogo size={24} />
                        Trackr
                    </h3>
                    <p className="font-mono text-sm text-neutral-500 leading-relaxed">
                        Research smarter. Evaluate consistently. Stay ahead.
                    </p>
                </div>

                {/* Links */}
                <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8 font-mono text-sm">

                    <div className="flex flex-col gap-4">
                        <span className="font-bold text-black uppercase tracking-wider">Product</span>
                        <Link href="/#how-it-works" className="text-neutral-600 hover:text-black hover:underline">How It Works</Link>
                        <Link href="/#features" className="text-neutral-600 hover:text-black hover:underline">Features</Link>
                        <Link href="/pricing" className="text-neutral-600 hover:text-black hover:underline">Pricing</Link>
                        <Link href="/process" className="text-neutral-600 hover:text-black hover:underline">Our Process</Link>
                        <Link href="/research" className="text-neutral-600 hover:text-black hover:underline">AI Tool Library</Link>
                        <Link href="/changelog" className="text-neutral-600 hover:text-black hover:underline">Changelog</Link>
                        <Link href="/audit" className="text-neutral-600 hover:text-black hover:underline">AI Audit</Link>
                        <Link href="/chrome" className="text-neutral-600 hover:text-black hover:underline">Chrome Extension</Link>
                        <Link href="/slack" className="text-neutral-600 hover:text-black hover:underline">Slack Integration</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="font-bold text-black uppercase tracking-wider">For Teams</span>
                        <Link href="/for/ops-teams" className="text-neutral-600 hover:text-black hover:underline">Ops Teams</Link>
                        <Link href="/for/revops" className="text-neutral-600 hover:text-black hover:underline">RevOps</Link>
                        <Link href="/for/founders" className="text-neutral-600 hover:text-black hover:underline">Founders</Link>
                        <Link href="/for/engineering" className="text-neutral-600 hover:text-black hover:underline">Engineering</Link>
                        <Link href="/for/chiefs-of-staff" className="text-neutral-600 hover:text-black hover:underline">Chiefs of Staff</Link>
                        <Link href="/for/marketing-teams" className="text-neutral-600 hover:text-black hover:underline">Marketing</Link>
                        <Link href="/for/finance-teams" className="text-neutral-600 hover:text-black hover:underline">Finance</Link>
                        <Link href="/for/it-leaders" className="text-neutral-600 hover:text-black hover:underline">IT Leaders</Link>
                        <Link href="/for/product-managers" className="text-neutral-600 hover:text-black hover:underline">Product Managers</Link>
                        <Link href="/for/sales-leaders" className="text-neutral-600 hover:text-black hover:underline">Sales Leaders</Link>
                        <Link href="/for/customer-success" className="text-neutral-600 hover:text-black hover:underline">Customer Success</Link>
                        <Link href="/for/hr-leaders" className="text-neutral-600 hover:text-black hover:underline">HR Leaders</Link>
                        <Link href="/for/legal-teams" className="text-neutral-600 hover:text-black hover:underline">Legal Teams</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="font-bold text-black uppercase tracking-wider">Company</span>
                        <Link href="/about" className="text-neutral-600 hover:text-black hover:underline">About</Link>
                        <Link href="/blog" className="text-neutral-600 hover:text-black hover:underline">Blog</Link>
                        <Link href="/contact" className="text-neutral-600 hover:text-black hover:underline">Contact</Link>
                        <Link href="/partners" className="text-neutral-600 hover:text-black hover:underline">Integrations</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="font-bold text-black uppercase tracking-wider">Compare</span>
                        <Link href="/vs/g2" className="text-neutral-600 hover:text-black hover:underline">Trackr vs G2</Link>
                        <Link href="/vs/capterra" className="text-neutral-600 hover:text-black hover:underline">Trackr vs Capterra</Link>
                        <Link href="/vs/chatgpt" className="text-neutral-600 hover:text-black hover:underline">Trackr vs ChatGPT</Link>
                        <Link href="/vs/vendr" className="text-neutral-600 hover:text-black hover:underline">Trackr vs Vendr</Link>
                        <Link href="/vs/spreadsheets" className="text-neutral-600 hover:text-black hover:underline">Trackr vs Spreadsheets</Link>
                        <Link href="/vs/notion" className="text-neutral-600 hover:text-black hover:underline">Trackr vs Notion</Link>
                        <Link href="/vs/gartner" className="text-neutral-600 hover:text-black hover:underline">Trackr vs Gartner</Link>
                        <Link href="/vs" className="text-neutral-600 hover:text-black hover:underline font-medium">All comparisons →</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="font-bold text-black uppercase tracking-wider">Get Started</span>
                        <Link href="/sign-up" className="text-neutral-600 hover:text-black hover:underline">Create Account</Link>
                        <Link href="/sign-in" className="text-neutral-600 hover:text-black hover:underline">Sign In</Link>
                        <Link href="/privacy" className="text-neutral-600 hover:text-black hover:underline">Privacy Policy</Link>
                        <Link href="/terms" className="text-neutral-600 hover:text-black hover:underline">Terms of Service</Link>
                        <Link href="/security" className="text-neutral-600 hover:text-black hover:underline">Security</Link>
                    </div>

                </div>
            </div>

            <div className="pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs text-neutral-500 uppercase tracking-wide">
                <span>© 2026 Trackr. All rights reserved.</span>
                <div className="flex gap-8">
                    <Link href="/privacy" className="hover:text-black hover:underline">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-black hover:underline">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
