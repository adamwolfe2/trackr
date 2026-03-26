import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AddToolWizard } from "@/components/tools/add-tool-wizard";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { db } from "@/lib/db";
import { subscriptions, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // allow after() to run research pipeline (~2-5 min) before Vercel kills function

export const metadata: Metadata = {
    title: "Submit Tool — Trackr",
    description: "Submit a new tool for AI-powered research.",
};

export default async function SubmitPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        columns: { workspaceId: true },
    });
    const workspaceId = member?.workspaceId;

    const subscription = workspaceId
        ? await db.query.subscriptions.findFirst({
            where: eq(subscriptions.workspaceId, workspaceId),
            columns: { creditBalance: true },
        })
        : null;

    const creditBalance = subscription?.creditBalance ?? 0;

    return (
        <div className="max-w-2xl mx-auto animate-fade-in-up py-10">
            {creditBalance === 0 && (
                <div className="mb-6">
                    <UpgradePrompt
                        feature="Research Credits"
                        plan="Team"
                        message="You've used all your research credits this month. Upgrade for more, or buy a credit pack."
                    />
                </div>
            )}
            {creditBalance > 0 && creditBalance <= 2 && (
                <div className="border border-amber-600 bg-amber-50 px-4 py-3 font-mono text-xs mb-6 flex items-start gap-3">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                    <p className="text-amber-800 leading-relaxed">
                        You have {creditBalance} research credit{creditBalance === 1 ? "" : "s"} remaining this month.{" "}
                        <Link href="/settings/billing" className="underline font-semibold hover:text-amber-950">
                            Manage billing →
                        </Link>
                    </p>
                </div>
            )}
            <AddToolWizard creditBalance={creditBalance} workspaceId={workspaceId} />
        </div>
    );
}
