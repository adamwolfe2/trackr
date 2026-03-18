import type { Metadata } from "next";
import { AddToolWizard } from "@/components/tools/add-tool-wizard";
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
            <AddToolWizard creditBalance={creditBalance} workspaceId={workspaceId} />
        </div>
    );
}
