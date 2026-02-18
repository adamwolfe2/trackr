"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MarketingNavigation({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="w-full flex items-center justify-between py-8 relative z-50">
            {/* Logo */}
            <Link href="/" className="md:text-3xl text-2xl font-medium tracking-tight font-serif z-50 relative">
                Trackr
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-10 font-mono text-sm">
                <Link href="#how-it-works" className="hover:underline underline-offset-4">How It Works</Link>
                <Link href="#features" className="hover:underline underline-offset-4">Features</Link>
                <Link href="#pricing" className="hover:underline underline-offset-4">Pricing</Link>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-4">
                {isLoggedIn ? (
                    <Link href="/tools" className="font-mono text-sm bg-black text-white border border-black px-4 py-2 hover:bg-neutral-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                        Open Dashboard →
                    </Link>
                ) : (
                    <>
                        <Link href="/sign-in" className="font-mono text-sm border border-black px-4 py-2 hover:bg-neutral-50 transition-colors">
                            Sign In
                        </Link>
                        <Link href="/sign-up" className="font-mono text-sm bg-black text-white border border-black px-4 py-2 hover:bg-neutral-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                            Get Started Free
                        </Link>
                    </>
                )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
                className="md:hidden z-50 relative p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Nav Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-[#F3F3EF] z-40 flex flex-col justify-center px-8 animate-in slide-in-from-top-10 duration-200">
                    <nav className="flex flex-col gap-8 text-2xl font-serif mb-12">
                        <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
                        <Link href="#features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                        <Link href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                    </nav>
                    <div className="flex flex-col gap-4">
                        {isLoggedIn ? (
                            <Link href="/tools" className="w-full text-center font-mono text-sm bg-black text-white border border-black px-4 py-4 uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                Open Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link href="/sign-in" className="w-full text-center font-mono text-sm border border-black px-4 py-4 uppercase">
                                    Sign In
                                </Link>
                                <Link href="/sign-up" className="w-full text-center font-mono text-sm bg-black text-white border border-black px-4 py-4 uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
