export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { getAssignedArchitect } from "@/lib/actions/managed-service";
import { ManagedServiceClient } from "@/components/managed/managed-service-client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "Your Architect — Trackr",
    description: "Your dedicated AI stack architect on retainer.",
};

export default async function ManagedServicePage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    const architect = await getAssignedArchitect(workspaceId);

    if (!architect) {
        return (
            <div className="space-y-6">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Managed Service</p>
                    <h1 className="font-serif text-2xl font-normal">Your AI Architect</h1>
                </div>

                <div className="border border-black bg-white p-8 max-w-2xl">
                    <h2 className="font-serif text-xl mb-3">Get a dedicated AI stack architect</h2>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-6">
                        A human AI architect manages your tool stack proactively. They handle evaluations, vendor negotiations, renewal optimization, and quarterly stack reviews — so your team can focus on building.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-px border border-black bg-black mb-6">
                        {[
                            { tier: "Basic", price: "$299/mo", features: "Monthly stack review, renewal management, 5 tool evaluations/mo" },
                            { tier: "Premium", price: "$599/mo", features: "Weekly check-ins, unlimited evaluations, vendor negotiations, board report prep" },
                        ].map((t) => (
                            <div key={t.tier} className="bg-white p-5">
                                <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">{t.tier}</div>
                                <div className="font-serif text-xl mb-2">{t.price}</div>
                                <p className="font-mono text-[10px] text-neutral-500 leading-relaxed">{t.features}</p>
                            </div>
                        ))}
                    </div>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                    >
                        Request an Architect <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        );
    }

    return <ManagedServiceClient architect={architect} workspaceId={workspaceId} />;
}
