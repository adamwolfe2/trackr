"use client";

import { UserButton } from "@clerk/nextjs";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Header() {
    return (
        <header className="h-14 border-b border-black bg-white sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between gap-4">
            {/* Mobile hamburger */}
            <MobileNav />

            <div className="flex-1" />

            <div className="flex items-center gap-3">
                <NotificationsPopover />
                <UserButton afterSignOutUrl="/sign-in" />
            </div>
        </header>
    );
}
