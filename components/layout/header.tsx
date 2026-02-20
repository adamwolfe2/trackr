"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Header() {
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
            <MobileNav />

            <button
                onClick={openCommandPalette}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-neutral-300 hover:border-black transition-colors cursor-pointer bg-[#F8F8F5]"
            >
                <Search className="h-3.5 w-3.5 text-neutral-400" />
                <span className="font-mono text-xs text-neutral-400">Search...</span>
                <kbd className="font-mono text-[10px] border border-neutral-300 px-1.5 py-0.5 text-neutral-400 ml-4">
                    {isMac ? "⌘" : "Ctrl+"}K
                </kbd>
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
                <NotificationsPopover />
                <UserButton afterSignOutUrl="/sign-in" />
            </div>
        </header>
    );
}
