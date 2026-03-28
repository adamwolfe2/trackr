"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, DollarSign, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { href: "/architect/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/architect/clients", label: "Clients", icon: Users },
    { href: "/architect/commissions", label: "Commissions", icon: DollarSign },
    { href: "/architect/settings", label: "Settings", icon: Settings },
];

export function ArchitectSidebarNav() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop sidebar nav */}
            <nav className="hidden md:block flex-1 py-4">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors",
                                isActive
                                    ? "text-black bg-[#F3F3EF] border-l-2 border-black"
                                    : "text-neutral-500 hover:text-black hover:bg-[#F3F3EF] border-l-2 border-transparent"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Mobile tab nav */}
            <div className="md:hidden flex border-t border-black">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex-1 flex flex-col items-center gap-1 py-2 font-mono text-[8px] uppercase tracking-widest transition-colors",
                                isActive ? "text-black" : "text-neutral-400 hover:text-black"
                            )}
                        >
                            <Icon className={cn("w-3.5 h-3.5", isActive && "stroke-[2.5]")} />
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </>
    );
}
