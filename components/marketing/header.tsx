"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
                        T
                    </div>
                    Trackr
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    <Link href="/#features" className="hover:text-black dark:hover:text-white transition-colors">Features</Link>
                    <Link href="/pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
                    <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
                </nav>
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/sign-in" className="text-sm font-medium hover:text-black dark:hover:text-white text-zinc-600 dark:text-zinc-400">Log in</Link>
                    <Link href="/sign-up">
                        <Button className="rounded-full px-6 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                            Get started free
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-zinc-600 dark:text-zinc-400"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 p-4 animate-fade-in-down shadow-xl">
                    <nav className="flex flex-col gap-4">
                        <Link href="/#features" className="text-lg font-medium py-2 border-b border-zinc-100 dark:border-zinc-900" onClick={() => setIsMenuOpen(false)}>Features</Link>
                        <Link href="/pricing" className="text-lg font-medium py-2 border-b border-zinc-100 dark:border-zinc-900" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                        <Link href="/blog" className="text-lg font-medium py-2 border-b border-zinc-100 dark:border-zinc-900" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                        <div className="flex flex-col gap-2 mt-4">
                            <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="outline" className="w-full">Log in</Button>
                            </Link>
                            <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full">Get started free</Button>
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
