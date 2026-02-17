"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Database,
    Sparkles,
    Zap,
    Settings,
    PlusCircle,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
    {
        title: "Dashboard",
        href: "/",
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
        title: "Research Queue",
        href: "/queue",
        icon: Zap,
    },
    {
        title: "Workspace Settings",
        href: "/workspace",
        icon: Settings,
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-card border-r border-border">
            <div className="p-6">
                <div className="flex items-center gap-2 font-bold text-xl mb-6">
                    <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-accent-foreground">
                        T
                    </div>
                    Trackr
                </div>
                <Button className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <PlusCircle className="w-4 h-4" />
                    Submit Tool
                </Button>
            </div>
            <div className="flex-1 px-4 py-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group",
                                isActive
                                    ? "bg-secondary text-foreground nav-item-active"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-[18px] w-[18px]",
                                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </div>
            <div className="p-4 border-t border-border">
                {/* User profile or footer could go here */}
            </div>
        </div>
    );
}
