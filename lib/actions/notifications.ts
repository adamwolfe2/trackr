"use server";

import { db } from "@/lib/db";
import { researchJobs, workspaceMembers, softwareSpend, toolSuggestions } from "@/lib/db/schema";
import { eq, desc, and, ne, gte, lte, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type NotificationType = 'job_complete' | 'job_failed' | 'renewal_soon' | 'new_suggestion';

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
        message: `${s.toolName} — ${s.reason.slice(0, 80)}`,
        createdAt: s.createdAt,
        read: seenIds.includes(`suggestion-${s.id}`),
        link: '/feed',
    }));

    // Merge and sort by date (newest first)
    const all = [...jobNotifications, ...renewalNotifications, ...suggestionNotifications]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 15);

    return all;
}

export async function markNotificationsRead(notificationIds: string[]) {
    const user = await currentUser();
    if (!user || notificationIds.length === 0) return;

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
