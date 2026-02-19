export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { softwareSpend, workspaceMembers, tools } from "@/lib/db/schema";
import { eq, desc, and, isNotNull, sql } from "drizzle-orm";
import { StackClient } from "./client";
import { computeStackInsights } from "@/lib/utils/stack-insights";

export default async function StackPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) redirect("/onboarding");

    const [entries, scoredTools] = await Promise.all([
        db.query.softwareSpend.findMany({
            where: eq(softwareSpend.workspaceId, member.workspaceId),
            orderBy: [desc(softwareSpend.createdAt)],
        }),
        db.query.tools.findMany({
            where: and(
                eq(tools.workspaceId, member.workspaceId),
                isNotNull(tools.overallScore),
                sql`${tools.overallScore}::numeric < 6`
            ),
            columns: { name: true },
        }),
    ]);

    const lowScoredNames = scoredTools.map(t => t.name.toLowerCase());
    const insights = computeStackInsights(entries);

    return <StackClient initialData={entries} lowScoredNames={lowScoredNames} insights={insights} />;
}
