"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-black bg-white">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-serif text-lg font-medium">
                    <div className="w-7 h-7 bg-black flex items-center justify-center text-white text-xs font-mono font-bold">
                        T
                    </div>
                    Trackr
                </Link>
                <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest">
                    <Link href="/#features" className="text-neutral-600 hover:text-black transition-colors">Features</Link>
                    <Link href="/pricing" className="text-neutral-600 hover:text-black transition-colors">Pricing</Link>
                    <Link href="/audit" className="text-neutral-600 hover:text-black transition-colors">Book Audit</Link>
                    <Link href="/blog" className="text-neutral-600 hover:text-black transition-colors">Blog</Link>
                </nav>
                <div className="hidden md:flex items-center gap-3">
                    <Link href="/sign-in" className="font-mono text-xs text-neutral-600 hover:text-black px-4 py-2">
                        Log in
                    </Link>
                    <Link
                        href="/sign-up"
                        className="border border-black px-5 py-2 font-mono text-xs bg-black text-white hover:bg-neutral-800"
                    >
                        Get started free
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden border border-black p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-black">
                    <nav className="flex flex-col divide-y divide-black/10">
                        <Link href="/#features" className="px-4 py-3 font-mono text-sm hover:bg-neutral-50" onClick={() => setIsMenuOpen(false)}>Features</Link>
                        <Link href="/pricing" className="px-4 py-3 font-mono text-sm hover:bg-neutral-50" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                        <Link href="/audit" className="px-4 py-3 font-mono text-sm hover:bg-neutral-50" onClick={() => setIsMenuOpen(false)}>Book Audit</Link>
                        <Link href="/blog" className="px-4 py-3 font-mono text-sm hover:bg-neutral-50" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                        <div className="p-4 flex flex-col gap-2">
                            <Link href="/sign-in" onClick={() => setIsMenuOpen(false)} className="border border-black px-4 py-2.5 font-mono text-xs text-center hover:bg-neutral-100">
                                Log in
                            </Link>
                            <Link href="/sign-up" onClick={() => setIsMenuOpen(false)} className="border border-black px-4 py-2.5 font-mono text-xs text-center bg-black text-white hover:bg-neutral-800">
                                Get started free
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
