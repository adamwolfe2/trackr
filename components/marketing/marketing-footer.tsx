"use client";

import Link from "next/link";

export function MarketingFooter() {
    return (
        <footer className="w-full py-12 border-t border-black">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                {/* Brand */}
                <div className="md:col-span-1">
                    <h3 className="text-2xl font-serif font-medium mb-4">Trackr</h3>
                    <p className="font-mono text-sm text-neutral-500 leading-relaxed">
                        Research smarter. Evaluate consistently. Stay ahead.
                    </p>
                </div>

                {/* Links */}
                <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8 font-mono text-sm">

                    <div className="flex flex-col gap-4">
                        <span className="font-bold text-black uppercase tracking-wider">Product</span>
                        <Link href="#how-it-works" className="text-neutral-600 hover:text-black hover:underline">How It Works</Link>
                        <Link href="#features" className="text-neutral-600 hover:text-black hover:underline">Features</Link>
                        <Link href="#pricing" className="text-neutral-600 hover:text-black hover:underline">Pricing</Link>
                        <Link href="/discover" className="text-neutral-600 hover:text-black hover:underline">Discover</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="font-bold text-black uppercase tracking-wider">Company</span>
                        <Link href="/about" className="text-neutral-600 hover:text-black hover:underline">About</Link>
                        <Link href="/blog" className="text-neutral-600 hover:text-black hover:underline">Blog</Link>
                        <Link href="/contact" className="text-neutral-600 hover:text-black hover:underline">Contact</Link>
                        <span className="text-neutral-400 cursor-not-allowed">API (Coming Soon)</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="font-bold text-black uppercase tracking-wider">Resources</span>
                        <Link href="/docs" className="text-neutral-600 hover:text-black hover:underline">Documentation</Link>
                        <Link href="#sample-report" className="text-neutral-600 hover:text-black hover:underline">Sample Report</Link>
                        <Link href="/changelog" className="text-neutral-600 hover:text-black hover:underline">Changelog</Link>
                        <Link href="/status" className="text-neutral-600 hover:text-black hover:underline">Status</Link>
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
