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
                <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 font-mono text-sm">

                    <div className="flex flex-col gap-4">
                        <span className="font-bold text-black uppercase tracking-wider">Product</span>
                        <Link href="/#how-it-works" className="text-neutral-600 hover:text-black hover:underline">How It Works</Link>
                        <Link href="/#features" className="text-neutral-600 hover:text-black hover:underline">Features</Link>
                        <Link href="/pricing" className="text-neutral-600 hover:text-black hover:underline">Pricing</Link>
                        <Link href="/process" className="text-neutral-600 hover:text-black hover:underline">Our Process</Link>
                        <Link href="/research" className="text-neutral-600 hover:text-black hover:underline">AI Tool Library</Link>
                        <Link href="/changelog" className="text-neutral-600 hover:text-black hover:underline">Changelog</Link>
                        <Link href="/audit" className="text-neutral-600 hover:text-black hover:underline">AI Audit</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="font-bold text-black uppercase tracking-wider">Company</span>
                        <Link href="/about" className="text-neutral-600 hover:text-black hover:underline">About</Link>
                        <Link href="/blog" className="text-neutral-600 hover:text-black hover:underline">Blog</Link>
                        <Link href="/contact" className="text-neutral-600 hover:text-black hover:underline">Contact</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="font-bold text-black uppercase tracking-wider">Get Started</span>
                        <Link href="/sign-up" className="text-neutral-600 hover:text-black hover:underline">Create Account</Link>
                        <Link href="/sign-in" className="text-neutral-600 hover:text-black hover:underline">Sign In</Link>
                        <Link href="/privacy" className="text-neutral-600 hover:text-black hover:underline">Privacy Policy</Link>
                        <Link href="/terms" className="text-neutral-600 hover:text-black hover:underline">Terms of Service</Link>
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
