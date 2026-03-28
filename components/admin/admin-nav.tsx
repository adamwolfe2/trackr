"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
    { title: "Leads", href: "/admin/leads" },
    { title: "Analytics", href: "/admin/analytics" },
    { title: "API", href: "/admin/api" },
    { title: "Architects", href: "/admin/architects" },
    { title: "Payouts", href: "/admin/payouts" },
];

export function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-wrap items-center gap-1 mb-8 border-b border-black pb-4">
            {ADMIN_LINKS.map((link, i) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                    <div key={link.href} className="flex items-center">
                        {i > 0 && (
                            <span className="font-mono text-neutral-300 text-xs hidden sm:inline mr-1">|</span>
                        )}
                        <Link
                            href={link.href}
                            className={cn(
                                "font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors",
                                isActive
                                    ? "border-black bg-black text-white"
                                    : "border-transparent hover:border-black"
                            )}
                        >
                            {link.title}
                        </Link>
                    </div>
                );
            })}
        </nav>
    );
}
