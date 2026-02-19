"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Database,
    Sparkles,
    CreditCard,
    Settings,
    PlusCircle,
    Search,
    Gift,
    Zap,
    MessageSquare,
    SlidersHorizontal,
    Layers,
    BarChart3,
    AlertCircle,
    Rss,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { TrackrLogo } from "@/components/common/trackr-logo";

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Tool Database",
        href: "/tools",
        icon: Database,
    },
    {
        title: "Discover",
        href: "/discover",
        icon: Search,
    },
    {
        title: "Your Feed",
        href: "/feed",
        icon: Rss,
    },
    {
        title: "Research Queue",
        href: "/queue",
        icon: Zap,
    },
    {
        title: "Ask Trackr AI",
        href: "/ask",
        icon: MessageSquare,
    },
    {
        title: "Software Stack",
        href: "/stack",
        icon: Layers,
    },
    {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
    },
    {
        title: "Pain Points",
        href: "/pain-points",
        icon: AlertCircle,
    },
    {
        title: "Scorecard",
        href: "/scorecard",
        icon: SlidersHorizontal,
    },
    {
        title: "Advertise",
        href: "/advertise",
        icon: Sparkles,
    },
    {
        title: "Referrals",
        href: "/referrals",
        icon: Gift,
    },
];

const bottomNavItems = [
    {
        title: "Billing",
        href: "/settings/billing",
        icon: CreditCard,
    },
    {
        title: "Workspace",
        href: "/workspace",
        icon: Settings,
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-black">
            {/* Logo */}
            <div className="p-5 border-b border-black">
                <Link href="/tools" className="flex items-center gap-2 font-serif text-xl font-medium mb-5">
                    <span className="w-7 h-7 bg-black flex items-center justify-center flex-shrink-0">
                        <TrackrLogo size={20} inverted />
                    </span>
                    Trackr
                </Link>
                <Link
                    href="/submit"
                    className="flex items-center justify-center gap-2 w-full bg-black text-white px-3 py-2.5 font-mono text-xs uppercase tracking-wide hover:bg-neutral-800 transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Submit Tool
                </Link>
            </div>

            {/* Main Nav */}
            <div className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 w-full px-3 py-2.5 text-sm font-mono transition-all",
                                active
                                    ? "bg-black text-white"
                                    : "text-neutral-600 hover:text-black hover:bg-neutral-100"
                            )}
                        >
                            <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Nav */}
            <div className="px-3 py-3 border-t border-black space-y-0.5">
                {bottomNavItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 w-full px-3 py-2.5 text-sm font-mono transition-all",
                                active
                                    ? "bg-black text-white"
                                    : "text-neutral-500 hover:text-black hover:bg-neutral-100"
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
    );
}
