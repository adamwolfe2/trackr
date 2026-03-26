import * as Sentry from "@sentry/nextjs";
import { db } from "@/lib/db";
import { tools, workspaceMembers, workspaces, softwareSpend, researchJobs, feedItems, subscriptions } from "@/lib/db/schema";
import { desc, eq, gte, and, lte, sql, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { sendRenewalAlertEmail, sendStackHealthDigest, sendWeeklyDigestEmail } from "@/lib/email/resend";
import { postMessage, renewalAlertBlocks } from "@/lib/services/slack";
import { computeStackInsights } from "@/lib/utils/stack-insights";
import { verifyCronRequest } from "@/lib/middleware/cron-auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const authError = verifyCronRequest(req);
    if (authError) return authError;

    if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });
    }

    try {
        const owners = await db.query.workspaceMembers.findMany({
            where: eq(workspaceMembers.role, 'owner'),
            with: { workspace: true },
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let digestsSent = 0;
        let renewalsSent = 0;
        let stackDigestsSent = 0;
        const clerk = await clerkClient();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";

        // Batch-fetch data for all workspaces upfront to avoid N+1 queries
        const allWorkspaceIds = owners.map(o => o.workspaceId);
        const [allRecentTools, allUpcomingRenewals, allSpendEntries] = await Promise.all([
            db.query.tools.findMany({
                where: and(
                    inArray(tools.workspaceId, allWorkspaceIds),
                    gte(tools.lastResearchedAt, sevenDaysAgo),
                ),
                orderBy: [desc(tools.lastResearchedAt)],
            }),
            db.query.softwareSpend.findMany({
                where: and(
                    inArray(softwareSpend.workspaceId, allWorkspaceIds),
                    eq(softwareSpend.status, "active"),
                    gte(softwareSpend.renewalDate, now),
                    lte(softwareSpend.renewalDate, thirtyDaysFromNow),
                ),
            }),
            db.query.softwareSpend.findMany({
                where: inArray(softwareSpend.workspaceId, allWorkspaceIds),
                limit: 10000,
            }),
        ]);

        // Build lookup maps
        const toolsByWorkspace = new Map<string, typeof allRecentTools>();
        for (const t of allRecentTools) {
            const list = toolsByWorkspace.get(t.workspaceId) ?? [];
            list.push(t);
            toolsByWorkspace.set(t.workspaceId, list);
        }
        const renewalsByWorkspace = new Map<string, typeof allUpcomingRenewals>();
        for (const r of allUpcomingRenewals) {
            const list = renewalsByWorkspace.get(r.workspaceId) ?? [];
            list.push(r);
            renewalsByWorkspace.set(r.workspaceId, list);
        }
        const spendByWorkspace = new Map<string, typeof allSpendEntries>();
        for (const s of allSpendEntries) {
            const list = spendByWorkspace.get(s.workspaceId) ?? [];
            list.push(s);
            spendByWorkspace.set(s.workspaceId, list);
        }

        // Batch-fetch activity counts for streak calculation (avoids N+1 inside the loop)
        const [completedJobCounts, spendChangeCounts] = await Promise.all([
            db.select({
                workspaceId: tools.workspaceId,
                count: sql<number>`count(*)`,
            })
                .from(researchJobs)
                .innerJoin(tools, eq(researchJobs.toolId, tools.id))
                .where(and(
                    inArray(tools.workspaceId, allWorkspaceIds),
                    eq(researchJobs.status, "complete"),
                    gte(researchJobs.completedAt, sevenDaysAgo),
                ))
                .groupBy(tools.workspaceId),
            db.select({
                workspaceId: softwareSpend.workspaceId,
                count: sql<number>`count(*)`,
            })
                .from(softwareSpend)
                .where(and(
                    inArray(softwareSpend.workspaceId, allWorkspaceIds),
                    gte(softwareSpend.createdAt, sevenDaysAgo),
                ))
                .groupBy(softwareSpend.workspaceId),
        ]);

        const completedJobsByWorkspace = new Map<string, number>();
        for (const row of completedJobCounts) {
            completedJobsByWorkspace.set(row.workspaceId, Number(row.count));
        }
        const spendChangesByWorkspace = new Map<string, number>();
        for (const row of spendChangeCounts) {
            spendChangesByWorkspace.set(row.workspaceId, Number(row.count));
        }

        // Batch-fetch feed item counts and credit balances for the weekly digest
        const [feedItemCounts, allSubscriptions] = await Promise.all([
            db.select({
                workspaceId: feedItems.workspaceId,
                count: sql<number>`count(*)`,
            })
                .from(feedItems)
                .where(and(
                    inArray(feedItems.workspaceId, allWorkspaceIds),
                    gte(feedItems.createdAt, sevenDaysAgo),
                ))
                .groupBy(feedItems.workspaceId),
            db.query.subscriptions.findMany({
                where: inArray(subscriptions.workspaceId, allWorkspaceIds),
                columns: { workspaceId: true, creditBalance: true },
            }),
        ]);

        const feedItemsByWorkspace = new Map<string, number>();
        for (const row of feedItemCounts) {
            feedItemsByWorkspace.set(row.workspaceId, Number(row.count));
        }
        const creditsByWorkspace = new Map<string, number>();
        for (const sub of allSubscriptions) {
            creditsByWorkspace.set(sub.workspaceId, sub.creditBalance);
        }

        for (const owner of owners) {
            try {
                const clerkUser = await clerk.users.getUser(owner.userId);
                const email = clerkUser.emailAddresses[0]?.emailAddress;
                if (!email) continue;

                // --- Weekly Research Digest ---
                const recentTools = (toolsByWorkspace.get(owner.workspaceId) ?? []).slice(0, 5);
                const creditsUsed = completedJobsByWorkspace.get(owner.workspaceId) ?? 0;
                const creditsRemaining = creditsByWorkspace.get(owner.workspaceId) ?? 0;
                const newFeedItemCount = feedItemsByWorkspace.get(owner.workspaceId) ?? 0;

                if (recentTools.length > 0) {
                    // Find the top-scoring tool this week
                    const sortedByScore = [...recentTools].sort((a, b) => {
                        const sa = a.overallScore ? Number(a.overallScore) : 0;
                        const sb = b.overallScore ? Number(b.overallScore) : 0;
                        return sb - sa;
                    });
                    const topTool = sortedByScore[0] ?? null;

                    await sendWeeklyDigestEmail({
                        email,
                        workspaceName: owner.workspace.name,
                        toolsResearched: recentTools.length,
                        toolNames: recentTools.map(t => t.name),
                        newFeedItems: newFeedItemCount,
                        creditsUsed,
                        creditsRemaining,
                        topToolName: topTool?.name ?? null,
                        topToolScore: topTool?.overallScore ?? null,
                        dashboardUrl: `${appUrl}/tools`,
                    });
                    digestsSent++;
                }

                // --- Renewal Alerts ---
                const upcomingRenewals = renewalsByWorkspace.get(owner.workspaceId) ?? [];

                if (upcomingRenewals.length > 0) {
                    const renewalData = upcomingRenewals.map(r => ({
                        name: r.toolName,
                        renewalDate: r.renewalDate!,
                        monthlyCost: r.monthlyCost,
                    }));

                    await sendRenewalAlertEmail(email, renewalData);
                    renewalsSent++;

                    // Also post to Slack if enabled (workspace already loaded via `with`)
                    const ws = owner.workspace as { slackEnabled?: boolean; slackChannelId?: string | null; slackBotToken?: string | null };
                    if (ws?.slackEnabled && ws.slackChannelId) {
                        try {
                            await postMessage(
                                ws.slackChannelId,
                                `${renewalData.length} upcoming renewal${renewalData.length !== 1 ? "s" : ""} in the next 30 days`,
                                renewalAlertBlocks(renewalData),
                                ws.slackBotToken ?? undefined,
                            );
                        } catch {
                            // Non-critical
                        }
                    }
                }

                // --- Streak Update ---
                // Use pre-fetched activity counts (batch-queried above)
                const wsData = owner.workspace;
                const hadActivity = (completedJobsByWorkspace.get(owner.workspaceId) ?? 0) > 0
                    || (spendChangesByWorkspace.get(owner.workspaceId) ?? 0) > 0;

                const currentStreak = (wsData as { currentStreak?: number }).currentStreak ?? 0;
                const longestStreak = (wsData as { longestStreak?: number }).longestStreak ?? 0;

                if (hadActivity) {
                    const newStreak = currentStreak + 1;
                    const newLongest = Math.max(longestStreak, newStreak);
                    await db.update(workspaces).set({
                        currentStreak: newStreak,
                        longestStreak: newLongest,
                    }).where(eq(workspaces.id, owner.workspaceId));
                } else if (currentStreak > 0) {
                    await db.update(workspaces).set({ currentStreak: 0 })
                        .where(eq(workspaces.id, owner.workspaceId));
                }

                // --- Weekly Stack Health Digest ---
                const allSpend = (spendByWorkspace.get(owner.workspaceId) ?? []).slice(0, 1000);

                if (allSpend.length > 0) {
                    const insights = computeStackInsights(allSpend);

                    // Upcoming renewals within 14 days for the digest
                    const fourteenDays = new Date();
                    fourteenDays.setDate(fourteenDays.getDate() + 14);
                    const digestRenewals = allSpend
                        .filter(s => s.status === "active" && s.renewalDate && new Date(s.renewalDate) >= now && new Date(s.renewalDate) <= fourteenDays)
                        .map(s => ({ name: s.toolName, renewalDate: s.renewalDate!, monthlyCost: s.monthlyCost }));

                    // Simple recommendation from opportunities
                    const topOpp = insights.opportunities[0];
                    const recommendation = topOpp ? `${topOpp.title}${topOpp.description ? ` — ${topOpp.description.slice(0, 120)}` : ""}` : undefined;

                    const updatedStreak = hadActivity ? currentStreak + 1 : 0;

                    // Spend delta: compare current total to what existed before this week.
                    // Entries added in the last 7 days represent new spend added this period.
                    const previousWeekTotal = allSpend
                        .filter(s => s.status === "active" && s.createdAt < sevenDaysAgo)
                        .reduce((sum, s) => {
                            const cost = parseFloat(s.monthlyCost ?? "0");
                            return sum + (Number.isNaN(cost) ? 0 : cost);
                        }, 0);
                    const spendDelta = insights.totalActiveSpend - previousWeekTotal;

                    await sendStackHealthDigest(email, {
                        workspaceName: wsData.name,
                        totalMonthlySpend: insights.totalActiveSpend,
                        spendDelta,
                        aiScore: insights.score,
                        renewals: digestRenewals,
                        currentStreak: updatedStreak,
                        recommendation,
                    });
                    stackDigestsSent++;
                }
            } catch (err) {
                Sentry.captureException(err);
                // Skip users we can't email
            }
        }

        return NextResponse.json({ success: true, digestsSent, renewalsSent, stackDigestsSent });
    } catch (err) {
        Sentry.captureException(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
