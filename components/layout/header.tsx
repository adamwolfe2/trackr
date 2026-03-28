"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { PlanFeatures } from "@/lib/config/subscriptions";

export function Header({ rightExtra, creditBalance, planFeatures }: { rightExtra?: React.ReactNode; creditBalance?: number; planFeatures?: PlanFeatures }) {
    const [isMac, setIsMac] = useState(true);

    useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().includes("MAC"));
    }, []);

    const openCommandPalette = () => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
    };

    return (
        <header className="h-14 border-b border-black bg-white sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between gap-4">
            {/* Mobile hamburger */}
            <MobileNav planFeatures={planFeatures} />

            <button
                onClick={openCommandPalette}
                className="flex items-center gap-2 px-3 py-1.5 border border-neutral-300 hover:border-black transition-colors cursor-pointer bg-white"
                aria-label="Search"
            >
                <Search className="h-4 w-4 text-neutral-400 md:h-3.5 md:w-3.5" />
                <span className="hidden md:inline font-mono text-xs text-neutral-400">Search...</span>
                <kbd className="hidden md:inline font-mono text-[10px] border border-neutral-300 px-1.5 py-0.5 text-neutral-400 ml-4">
                    {isMac ? "⌘" : "Ctrl+"}K
                </kbd>
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-1 sm:gap-3">
                {rightExtra}
                {creditBalance !== undefined && creditBalance <= 2 && (
                    <Link href="/settings/billing" className="font-mono text-[9px] border border-red-200 text-red-600 px-2 py-0.5">
                        {creditBalance} credit{creditBalance === 1 ? "" : "s"} left
                    </Link>
                )}
                <NotificationsPopover />
                <UserButton afterSignOutUrl="/sign-in" />
            </div>
        </header>
    );
}
