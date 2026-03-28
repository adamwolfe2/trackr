"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SETTINGS_LINKS = [
    { title: "Workspace", href: "/workspace" },
    { title: "Billing", href: "/settings/billing" },
    { title: "Integrations", href: "/settings/integrations" },
    { title: "Notifications", href: "/settings/notifications" },
    { title: "Public Profile", href: "/settings/public-profile" },
    { title: "Scorecard", href: "/settings/scorecard" },
];

export function SettingsNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/workspace") {
            return pathname === "/workspace" || pathname.startsWith("/workspace/");
        }
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <div className="flex gap-0 border-b border-black mb-6 overflow-x-auto">
            {SETTINGS_LINKS.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "font-mono text-[11px] uppercase tracking-widest px-4 py-2.5 whitespace-nowrap border-b-2 transition-colors",
                        isActive(link.href)
                            ? "border-black text-black"
                            : "border-transparent text-neutral-400 hover:text-black hover:border-neutral-300"
                    )}
                >
                    {link.title}
                </Link>
            ))}
        </div>
    );
}
