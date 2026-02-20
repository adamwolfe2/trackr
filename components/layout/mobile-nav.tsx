"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, PlusCircle, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { TrackrLogo } from "@/components/common/trackr-logo";
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from "@/lib/config/navigation";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <>
            <button
                className="md:hidden p-2 border border-black/10 hover:bg-neutral-100 transition-colors"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-50 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 w-72 bg-white border-r border-black z-50 flex flex-col transition-transform duration-250 ease-out md:hidden",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Drawer Header */}
                <div className="p-5 border-b border-black/10 flex items-center justify-between">
                    <Link
                        href="/tools"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 font-serif text-xl font-medium"
                    >
                        <TrackrLogo size={24} />
                        Trackr
                    </Link>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-1 hover:bg-neutral-100 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Submit */}
                <div className="px-4 pt-4">
                    <Link
                        href="/submit"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-2 w-full bg-black text-white px-3 py-2.5 font-mono text-xs uppercase tracking-wide hover:bg-neutral-800 transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Submit Tool
                    </Link>
                </div>

                {/* Main Nav */}
                <div className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 w-full px-3 py-2.5 text-sm font-mono transition-all",
                                    active ? "bg-black text-white" : "text-neutral-600 hover:text-black hover:bg-neutral-100"
                                )}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="px-3 py-3 border-t border-black/10">
                    <button
                        onClick={() => {
                            setOpen(false);
                            document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-mono text-neutral-600 hover:text-black hover:bg-neutral-100 transition-all"
                        aria-label="Search"
                    >
                        <Search className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                        <span>Search</span>
                    </button>
                </div>

                {/* Bottom Nav */}
                <div className="px-3 py-3 border-t border-black/10 space-y-0.5">
                    {BOTTOM_NAV_ITEMS.map((item: typeof BOTTOM_NAV_ITEMS[number]) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 w-full px-3 py-2.5 text-sm font-mono transition-all",
                                    active ? "bg-black text-white" : "text-neutral-500 hover:text-black hover:bg-neutral-100"
                                )}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                    <div className="pt-3 px-3 flex items-center gap-3">
                        <UserButton afterSignOutUrl="/" />
                        <span className="text-xs font-mono text-neutral-400">Account</span>
                    </div>
                </div>
            </div>
        </>
    );
}
