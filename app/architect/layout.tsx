import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { architects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default async function ArchitectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const architect = await db.query.architects.findFirst({
        where: eq(architects.userId, user.id),
    });

    if (!architect) {
        // Not an architect — redirect to main app
        redirect("/dashboard");
    }

    if (architect.status === "terminated") {
        return (
            <div className="min-h-screen bg-[#F3F3EF] flex items-center justify-center p-6">
                <div className="border border-black p-8 max-w-sm w-full">
                    <h1 className="font-serif text-2xl font-normal mb-3">Account Terminated</h1>
                    <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                        Your architect account has been terminated. Contact us if you believe this is an error.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F3EF]">
            {/* Simple top nav */}
            <header className="border-b border-black bg-white px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="font-serif text-xl font-normal">Trackr</span>
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest border border-neutral-200 px-2 py-0.5">
                        Architect Portal
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {architect.status === "paused" && (
                        <span className="font-mono text-[10px] text-orange-700 border border-orange-200 px-2 py-0.5 uppercase tracking-widest">
                            Paused
                        </span>
                    )}
                    <span className="font-mono text-xs text-neutral-500">
                        {architect.firstName} {architect.lastName}
                    </span>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}
