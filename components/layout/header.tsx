"use client";

import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationsPopover } from "@/components/layout/notifications-popover";

export function Header() {
    return (
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4 w-full max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search tools, reports, or ask a question..."
                        className="w-full bg-muted/50 border-0 pl-9 focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <NotificationsPopover />
                <UserButton afterSignOutUrl="/sign-in" />
            </div>
        </header>
    );
}
