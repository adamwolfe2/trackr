export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaceMembers, subscriptions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getPlanLimits, hasFeature } from "@/lib/config/subscriptions";
import { PlanGate } from "@/components/billing/plan-gate";
import { listSurveys, getTeamLiteracyTrend } from "@/lib/actions/literacy";
import { LiteracyClient } from "@/components/literacy/literacy-client";

export const metadata: Metadata = {
    title: "Team AI Literacy",
    description: "Measure and track your team's AI tool knowledge with pulse surveys.",
};

export default async function LiteracyPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) redirect("/onboarding");

    // Feature gate: teamLiteracy requires Startup+
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, member.workspaceId),
    });
    const planData = getPlanLimits(subscription);
    if (!hasFeature(planData, "teamLiteracy")) {
        return (
            <PlanGate
                featureName="Team AI Literacy Scorecard"
                description="Run pulse surveys to measure your team's AI tool knowledge. Track literacy scores over time and identify training gaps."
                requiredPlan="Startup"
            />
        );
    }

    const [surveys, trend, memberCountResult] = await Promise.all([
        listSurveys(member.workspaceId),
        getTeamLiteracyTrend(member.workspaceId),
        db
            .select({ count: sql<number>`count(*)::int` })
            .from(workspaceMembers)
            .where(eq(workspaceMembers.workspaceId, member.workspaceId)),
    ]);

    const teamMemberCount = memberCountResult[0]?.count ?? 1;

    // Calculate overall stats
    const totalSurveys = surveys.length;
    const closedSurveys = surveys.filter((s) => s.status === "closed");
    const allScores = closedSurveys.flatMap((s) =>
        s.responses.map((r) => r.score).filter((v): v is number => v !== null)
    );
    const avgTeamScore =
        allScores.length > 0
            ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
            : 0;
    const totalResponses = surveys.reduce((sum, s) => sum + s.responses.length, 0);
    const responseRate =
        totalSurveys > 0 && totalResponses > 0
            ? Math.round((totalResponses / (totalSurveys * teamMemberCount)) * 100)
            : 0;

    return (
        <LiteracyClient
            surveys={surveys.map((s) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                status: s.status,
                createdAt: s.createdAt.toISOString(),
                closedAt: s.closedAt?.toISOString() ?? null,
                responseCount: s.responses.length,
                avgScore:
                    s.responses.length > 0
                        ? Math.round(
                              s.responses
                                  .map((r) => r.score)
                                  .filter((v): v is number => v !== null)
                                  .reduce((a, b) => a + b, 0) /
                                  Math.max(
                                      s.responses.filter((r) => r.score !== null).length,
                                      1
                                  )
                          )
                        : null,
            }))}
            trend={trend.map((t) => ({
                title: t.title,
                closedAt: t.closedAt?.toISOString() ?? null,
                averageScore: t.averageScore,
                responseCount: t.responseCount,
            }))}
            stats={{
                totalSurveys,
                avgTeamScore,
                responseRate: Math.min(responseRate, 100),
            }}
            workspaceId={member.workspaceId}
            userId={user.id}
            userName={user.firstName ?? user.emailAddresses?.[0]?.emailAddress ?? "Anonymous"}
        />
    );
}
