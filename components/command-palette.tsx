"use client";

import { useState, useEffect, useCallback } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard, Database, Search, Rss, Zap, MessageSquare,
    Layers, BarChart3, AlertCircle, GitCompareArrows, SlidersHorizontal,
    Sparkles, Gift, CreditCard, Settings, PlusCircle,
} from "lucide-react";

const NAVIGATION_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Navigation" },
    { label: "Tool Database", href: "/tools", icon: Database, group: "Navigation" },
    { label: "Discover", href: "/discover", icon: Search, group: "Navigation" },
    { label: "Your Feed", href: "/feed", icon: Rss, group: "Navigation" },
    { label: "Research Queue", href: "/queue", icon: Zap, group: "Navigation" },
    { label: "Ask Trackr AI", href: "/ask", icon: MessageSquare, group: "Navigation" },
    { label: "Software Stack", href: "/stack", icon: Layers, group: "Navigation" },
    { label: "Analytics", href: "/analytics", icon: BarChart3, group: "Navigation" },
    { label: "Pain Points", href: "/pain-points", icon: AlertCircle, group: "Navigation" },
    { label: "Compare", href: "/compare", icon: GitCompareArrows, group: "Navigation" },
    { label: "Scorecard", href: "/scorecard", icon: SlidersHorizontal, group: "Navigation" },
    { label: "Advertise", href: "/advertise", icon: Sparkles, group: "Actions" },
    { label: "Referrals", href: "/referrals", icon: Gift, group: "Actions" },
    { label: "Submit a Tool", href: "/submit", icon: PlusCircle, group: "Actions" },
    { label: "Billing", href: "/settings/billing", icon: CreditCard, group: "Settings" },
    { label: "Workspace Settings", href: "/workspace", icon: Settings, group: "Settings" },
];

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            setOpen((prev) => !prev);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const handleSelect = (href: string) => {
        setOpen(false);
        router.push(href);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40"
                onClick={() => setOpen(false)}
            />

            {/* Dialog */}
            <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg">
                <Command
                    className="border border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                    loop
                >
                    {/* Input */}
                    <div className="flex items-center border-b border-black px-4">
                        <Search className="h-4 w-4 text-neutral-400 shrink-0 mr-3" />
                        <Command.Input
                            placeholder="Type a command or search..."
                            className="flex-1 py-4 font-mono text-sm bg-transparent focus:outline-none placeholder:text-neutral-400"
                            autoFocus
                            aria-label="Search commands"
                        />
                        <kbd className="font-mono text-[10px] border border-neutral-300 px-1.5 py-0.5 text-neutral-400 shrink-0">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <Command.List className="max-h-72 overflow-y-auto p-2">
                        <Command.Empty className="py-8 text-center font-mono text-xs text-neutral-400">
                            No results found.
                        </Command.Empty>

                        {["Navigation", "Actions", "Settings"].map((group) => {
                            const items = NAVIGATION_ITEMS.filter((i) => i.group === group);
                            if (items.length === 0) return null;
                            return (
                                <Command.Group
                                    key={group}
                                    heading={group}
                                    className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-neutral-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                                >
                                    {items.map((item) => (
                                        <Command.Item
                                            key={item.href}
                                            value={`${item.label} ${item.group}`}
                                            onSelect={() => handleSelect(item.href)}
                                            className="flex items-center gap-3 px-3 py-2.5 font-mono text-sm cursor-pointer data-[selected=true]:bg-black data-[selected=true]:text-white transition-colors"
                                        >
                                            <item.icon className="h-4 w-4 shrink-0" />
                                            {item.label}
                                        </Command.Item>
                                    ))}
                                </Command.Group>
                            );
                        })}
                    </Command.List>

                    {/* Footer */}
                    <div className="border-t border-black px-4 py-2 flex items-center gap-4 font-mono text-[10px] text-neutral-400">
                        <span className="flex items-center gap-1">
                            <kbd className="border border-neutral-300 px-1 py-0.5">↑↓</kbd> Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="border border-neutral-300 px-1 py-0.5">↵</kbd> Open
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="border border-neutral-300 px-1 py-0.5">ESC</kbd> Close
                        </span>
                    </div>
                </Command>
            </div>
        </div>
    );
}
