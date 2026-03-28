"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, PlusCircle, Search, Lock } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { TrackrLogo } from "@/components/common/trackr-logo";
import { NAV_SECTIONS, BOTTOM_NAV_ITEMS } from "@/lib/config/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { PlanFeatures } from "@/lib/config/subscriptions";
import { getRequiredPlan } from "@/lib/config/subscriptions";

export function MobileNav({ planFeatures }: { planFeatures?: PlanFeatures }) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <>
            <button
                className="md:hidden p-2 border border-black hover:bg-neutral-100 transition-colors"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            <AnimatePresence>
            {/* Overlay */}
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 bg-black/40 z-50 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}
            </AnimatePresence>

            <AnimatePresence>
            {/* Drawer */}
            {open && (
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-y-0 left-0 w-[min(288px,85vw)] bg-white border-r border-black z-50 flex flex-col md:hidden"
            >
                {/* Drawer Header */}
                <div className="p-5 border-b border-black flex items-center justify-between">
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
                <div className="flex-1 px-3 py-2 overflow-y-auto">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label} className="mb-1">
                            <div className="px-3 pt-3 pb-1">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                                    {section.label}
                                </span>
                            </div>
                            {section.items.map((item) => {
                                const active = isActive(item.href);
                                const requiredPlan = item.featureGate ? getRequiredPlan(item.featureGate) : null;
                                const isLocked = requiredPlan !== null && planFeatures && !(item.featureGate! in planFeatures);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 w-full px-3 py-2 text-sm font-mono transition-all",
                                            active ? "bg-black text-white" : "text-neutral-600 hover:text-black hover:bg-neutral-100"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                                        <span className="flex-1">{item.title}</span>
                                        {isLocked && (
                                            <Lock className="h-3 w-3 text-neutral-400 flex-shrink-0" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div className="px-3 py-3 border-t border-black">
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
                <div className="px-3 py-3 border-t border-black space-y-0.5">
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
            </motion.div>
            )}
            </AnimatePresence>
        </>
    );
}
