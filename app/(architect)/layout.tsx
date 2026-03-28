import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { architects } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import Link from "next/link";
import { ArchitectSidebarNav } from "@/components/architect/architect-sidebar-nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

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
                    <ArchitectSidebarNav />
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
                    <ArchitectSidebarNav />
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
