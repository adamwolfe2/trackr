"use server";

import { db } from "@/lib/db";
import { researchJobs, workspaceMembers, softwareSpend, toolSuggestions, subscriptions, tools } from "@/lib/db/schema";
import { referrals } from "@/lib/db/referrals-schema";
import { eq, desc, and, ne, gte, lte, lt, isNotNull } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type NotificationType =
    | 'job_complete'
    | 'job_failed'
    | 'renewal_soon'
    | 'new_suggestion'
    | 'referral_signup'
    | 'subscription_change'
    | 'tool_stale'
    | 'renewal_decision';

export type Notification = {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    createdAt: Date;
    read: boolean;
    link: string;
};

export async function getNotifications(): Promise<Notification[]> {
    const user = await currentUser();
    if (!user) return [];

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) return [];

    const seenIds = member.seenJobIds ?? [];
    const now = new Date();

    // 1. Research job completions/failures
    const jobs = await db.query.researchJobs.findMany({
        where: and(
            ne(researchJobs.status, 'running'),
            ne(researchJobs.status, 'queued')
        ),
        with: { tool: true },
        orderBy: [desc(researchJobs.completedAt)],
        limit: 10
    });

    const workspaceJobs = jobs.filter(job => job.tool.workspaceId === member.workspaceId);

    const jobNotifications: Notification[] = workspaceJobs.map(job => ({
        id: job.id,
        type: job.status === 'failed' ? 'job_failed' as const : 'job_complete' as const,
        title: job.status === 'failed' ? 'Research Failed' : 'Research Complete',
        message: `${job.tool.name} analysis has finished.`,
        createdAt: job.completedAt || job.triggeredAt,
        read: seenIds.includes(job.id),
        link: `/tools/${job.toolId}`
    }));

    // 2. Upcoming renewals (within 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const renewals = await db.query.softwareSpend.findMany({
        where: and(
            eq(softwareSpend.workspaceId, member.workspaceId),
            eq(softwareSpend.status, 'active'),
            gte(softwareSpend.renewalDate, now),
            lte(softwareSpend.renewalDate, sevenDaysFromNow),
        ),
        limit: 5,
    });

    const renewalNotifications: Notification[] = renewals.map(r => {
        const daysUntil = Math.ceil((new Date(r.renewalDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
            id: `renewal-${r.id}`,
            type: 'renewal_soon' as const,
            title: 'Renewal Coming Up',
            message: `${r.toolName} renews ${daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`}.`,
            createdAt: now,
            read: seenIds.includes(`renewal-${r.id}`),
            link: '/stack',
        };
    });

    // 3. New tool suggestions (from feed pipeline, last 3 days)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const suggestions = await db.query.toolSuggestions.findMany({
        where: and(
            eq(toolSuggestions.workspaceId, member.workspaceId),
            eq(toolSuggestions.status, 'new'),
            gte(toolSuggestions.createdAt, threeDaysAgo),
        ),
        orderBy: [desc(toolSuggestions.createdAt)],
        limit: 5,
    });

    const suggestionNotifications: Notification[] = suggestions.map(s => ({
        id: `suggestion-${s.id}`,
        type: 'new_suggestion' as const,
        title: 'New Tool Discovered',
        message: `${s.toolName}${s.reason ? ` — ${s.reason.slice(0, 80)}` : ""}`,
        createdAt: s.createdAt,
        read: seenIds.includes(`suggestion-${s.id}`),
        link: '/feed',
    }));

    // 4. Referral signups
    const referral = await db.query.referrals.findFirst({
        where: eq(referrals.referrerWorkspaceId, member.workspaceId),
    });

    const referralNotifications: Notification[] = [];
    if (referral && referral.signups > 0) {
        const id = `referral-${referral.id}`;
        referralNotifications.push({
            id,
            type: 'referral_signup',
            title: 'Referral Signups',
            message: `${referral.signups} workspace${referral.signups > 1 ? 's' : ''} signed up with your link. You've earned ${referral.signups * 5} research credits.`,
            createdAt: referral.createdAt,
            read: seenIds.includes(id),
            link: '/referrals',
        });
    }

    // 5. Subscription status changes
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, member.workspaceId),
    });

    const subscriptionNotifications: Notification[] = [];
    if (subscription) {
        const subId = `sub-${subscription.id}`;
        if (subscription.status === 'past_due') {
            subscriptionNotifications.push({
                id: subId,
                type: 'subscription_change',
                title: 'Payment Due',
                message: 'Your subscription payment failed. Update your billing info to keep your plan active.',
                createdAt: subscription.updatedAt,
                read: seenIds.includes(subId),
                link: '/settings/billing',
            });
        } else if (subscription.status === 'canceled') {
            subscriptionNotifications.push({
                id: subId,
                type: 'subscription_change',
                title: 'Subscription Cancelled',
                message: 'Your subscription has been cancelled. Upgrade anytime to restore full access.',
                createdAt: subscription.updatedAt,
                read: seenIds.includes(subId),
                link: '/settings/billing',
            });
        } else if (subscription.status === 'trialing' && subscription.currentPeriodEnd) {
            const daysLeft = Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 3 && daysLeft >= 0) {
                subscriptionNotifications.push({
                    id: subId,
                    type: 'subscription_change',
                    title: 'Trial Ending Soon',
                    message: `Your trial ends ${daysLeft === 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`}. Add payment to continue.`,
                    createdAt: subscription.updatedAt,
                    read: seenIds.includes(subId),
                    link: '/settings/billing',
                });
            }
        }
    }

    // 6. Stale tools (not researched in 90+ days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const staleTools = await db.query.tools.findMany({
        where: and(
            eq(tools.workspaceId, member.workspaceId),
            eq(tools.status, 'active'),
            isNotNull(tools.lastResearchedAt),
            lt(tools.lastResearchedAt, ninetyDaysAgo),
        ),
        columns: { id: true, name: true, lastResearchedAt: true },
        limit: 5,
    });

    const staleNotifications: Notification[] = staleTools.map(t => {
        const daysSince = Math.floor((now.getTime() - new Date(t.lastResearchedAt!).getTime()) / (1000 * 60 * 60 * 24));
        return {
            id: `stale-${t.id}`,
            type: 'tool_stale' as const,
            title: 'Needs Refresh',
            message: `${t.name} hasn't been researched in ${daysSince} days.`,
            createdAt: now,
            read: seenIds.includes(`stale-${t.id}`),
            link: `/tools/${t.id}`,
        };
    });

    // 7. Renewal decision prompts (14-21 days away, score < 7)
    const fourteenDays = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const twentyOneDays = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
    const renewalDecisionSpend = await db.query.softwareSpend.findMany({
        where: and(
            eq(softwareSpend.workspaceId, member.workspaceId),
            eq(softwareSpend.status, 'active'),
            gte(softwareSpend.renewalDate, fourteenDays),
            lte(softwareSpend.renewalDate, twentyOneDays),
        ),
        limit: 5,
    });

    // Match spend items to tools with low scores — batch query all active tools once
    const renewalDecisionNotifications: Notification[] = [];
    const activeTools = renewalDecisionSpend.length > 0
        ? await db.query.tools.findMany({
            where: and(
                eq(tools.workspaceId, member.workspaceId),
                eq(tools.status, 'active'),
            ),
            columns: { id: true, name: true, overallScore: true },
        })
        : [];
    const toolsByName = new Map(activeTools.map(t => [t.name.toLowerCase(), t]));

    for (const spend of renewalDecisionSpend) {
        const matchedTool = toolsByName.get(spend.toolName.toLowerCase());

        // Check if tool name matches and score < 7
        if (matchedTool && matchedTool.overallScore && parseFloat(matchedTool.overallScore) < 7) {
            const daysUntil = Math.ceil((new Date(spend.renewalDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const annualCost = (parseFloat(spend.monthlyCost ?? "0") * 12).toFixed(0);
            renewalDecisionNotifications.push({
                id: `renewal-decision-${spend.id}`,
                type: 'renewal_decision' as const,
                title: 'Review Before Renewal',
                message: `${spend.toolName} renews in ${daysUntil} days ($${annualCost}/yr). Score: ${parseFloat(matchedTool.overallScore).toFixed(1)}/10. Research alternatives?`,
                createdAt: now,
                read: seenIds.includes(`renewal-decision-${spend.id}`),
                link: '/submit',
            });
        }
    }

    // Merge and sort by date (newest first)
    const all = [
        ...jobNotifications,
        ...renewalNotifications,
        ...suggestionNotifications,
        ...referralNotifications,
        ...subscriptionNotifications,
        ...staleNotifications,
        ...renewalDecisionNotifications,
    ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 15);

    return all;
}

export async function markNotificationsRead(notificationIds: string[]) {
    const user = await currentUser();
    if (!user || notificationIds.length === 0) return;
    if (notificationIds.length > 500) throw new Error("Too many notification IDs");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) return;

    const existing = member.seenJobIds ?? [];
    const merged = Array.from(new Set([...existing, ...notificationIds]));

    // Cap at 200 to prevent unbounded growth
    const capped = merged.slice(-200);

    await db
        .update(workspaceMembers)
        .set({ seenJobIds: capped })
        .where(eq(workspaceMembers.id, member.id));

    revalidatePath("/");
}
