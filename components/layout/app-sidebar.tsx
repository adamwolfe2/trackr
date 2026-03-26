"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PlusCircle, Lock } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { TrackrLogo } from "@/components/common/trackr-logo";
import { NAV_SECTIONS, BOTTOM_NAV_ITEMS } from "@/lib/config/navigation";
import type { PlanFeatures } from "@/lib/config/subscriptions";
import { getRequiredPlan } from "@/lib/config/subscriptions";

export function AppSidebar({ planFeatures }: { planFeatures?: PlanFeatures }) {
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
                    <TrackrLogo size={24} />
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

            {/* Grouped Nav */}
            <div className="flex-1 px-3 py-2 overflow-y-auto">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.label} className="mb-1">
                        <div className="px-3 pt-3 pb-1">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                                {section.label}
                            </span>
                        </div>
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const active = isActive(item.href);
                                const featureKey = item.featureGate as keyof PlanFeatures | undefined;
                                const isLocked = featureKey && planFeatures
                                    ? !planFeatures[featureKey]
                                    : false;

                                if (isLocked) {
                                    const requiredPlan = featureKey ? getRequiredPlan(featureKey) : "Team";
                                    return (
                                        <Link
                                            key={item.href}
                                            href="/settings/billing"
                                            title={`Requires ${requiredPlan} plan`}
                                            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-mono transition-all text-neutral-300 hover:text-neutral-400"
                                        >
                                            <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                                            <span className="truncate">{item.title}</span>
                                            <Lock className="h-3 w-3 flex-shrink-0 ml-auto" strokeWidth={1.5} />
                                        </Link>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 w-full px-3 py-2 text-sm font-mono transition-all",
                                            active
                                                ? "bg-black text-white"
                                                : "text-neutral-600 hover:text-black hover:bg-neutral-100"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                                        <span className="truncate">{item.title}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Nav */}
            <div className="px-3 py-3 border-t border-black space-y-0.5">
                {BOTTOM_NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    const featureKey = item.featureGate as keyof PlanFeatures | undefined;
                    const isLocked = featureKey && planFeatures
                        ? !planFeatures[featureKey]
                        : false;

                    if (isLocked) {
                        const requiredPlan = featureKey ? getRequiredPlan(featureKey) : "Team";
                        return (
                            <Link
                                key={item.href}
                                href="/settings/billing"
                                title={`Requires ${requiredPlan} plan`}
                                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-mono transition-all text-neutral-300 hover:text-neutral-400"
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                                <span>{item.title}</span>
                                <Lock className="h-3 w-3 flex-shrink-0 ml-auto" strokeWidth={1.5} />
                            </Link>
                        );
                    }

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
