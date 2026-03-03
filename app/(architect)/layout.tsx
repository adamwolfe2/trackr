import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { architects } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import Link from "next/link";
import { LayoutDashboard, Users, DollarSign, Settings } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

const NAV_ITEMS = [
    { href: "/architect/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/architect/clients", label: "Clients", icon: Users },
    { href: "/architect/commissions", label: "Commissions", icon: DollarSign },
    { href: "/architect/settings", label: "Settings", icon: Settings },
];

export default async function ArchitectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let user = null;
    try {
        user = await currentUser();
    } catch {
        redirect("/sign-in");
    }

    if (!user) {
        redirect("/sign-in");
    }

    let architect = await db.query.architects.findFirst({
        where: eq(architects.userId, user.id),
    });

    // First sign-in after approval: userId is null, link by email
    if (!architect) {
        const email = user.emailAddresses[0]?.emailAddress?.toLowerCase();
        if (email) {
            const unlinked = await db.query.architects.findFirst({
                where: and(eq(architects.email, email), isNull(architects.userId)),
            });
            if (unlinked) {
                await db
                    .update(architects)
                    .set({ userId: user.id })
                    .where(eq(architects.id, unlinked.id));
                architect = { ...unlinked, userId: user.id };
            }
        }
    }

    if (!architect) {
        redirect("/apply?message=no-architect-record");
    }

    if (architect.status === "paused") {
        return (
            <div className="min-h-screen bg-[#F3F3EF] flex items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-orange-600 mb-4">Account Paused</p>
                    <h1 className="font-serif text-3xl font-normal mb-4">Your account is paused.</h1>
                    <p className="font-mono text-sm text-neutral-600">Please contact us at adamwolfe102@gmail.com to reactivate your architect account.</p>
                </div>
            </div>
        );
    }

    if (architect.status === "terminated") {
        return (
            <div className="min-h-screen bg-[#F3F3EF] flex items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-red-600 mb-4">Account Terminated</p>
                    <h1 className="font-serif text-3xl font-normal mb-4">Your account has been terminated.</h1>
                    <p className="font-mono text-sm text-neutral-600">If you believe this is an error, contact adamwolfe102@gmail.com.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F3EF]">
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-black bg-white">
                    <div className="p-5 border-b border-black">
                        <Link href="/architect/dashboard" className="font-serif text-lg">Trackr</Link>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mt-0.5">Architect Portal</p>
                    </div>
                    <nav className="flex-1 py-4">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-neutral-600 hover:text-black hover:bg-[#F3F3EF] transition-colors"
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-5 border-t border-black">
                        <p className="font-mono text-[10px] text-neutral-400 truncate">{architect.firstName} {architect.lastName}</p>
                        <p className="font-mono text-[9px] text-neutral-400 truncate">{architect.email}</p>
                    </div>
                </aside>

                {/* Mobile nav */}
                <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/architect/dashboard" className="font-serif text-lg">Trackr</Link>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Architect</span>
                    </div>
                    <div className="flex border-t border-black">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex-1 flex flex-col items-center gap-1 py-2 font-mono text-[8px] uppercase tracking-widest text-neutral-500 hover:text-black transition-colors"
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Main content */}
                <main className="flex-1 p-6 md:p-10 md:pt-10 pt-24">
                    <div className="max-w-5xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
