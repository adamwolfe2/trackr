"use server";

import { db } from "@/lib/db";
import { researchJobs, workspaceMembers } from "@/lib/db/schema";
import { eq, desc, and, ne, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type Notification = {
    id: string;
    type: 'job_complete' | 'job_failed';
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

    // Fetch recent completed/failed jobs for this workspace
    const jobs = await db.query.researchJobs.findMany({
        where: and(
            ne(researchJobs.status, 'running'),
            ne(researchJobs.status, 'queued')
        ),
        with: { tool: true },
        orderBy: [desc(researchJobs.completedAt)],
        limit: 10
    });

    // Only show jobs belonging to this workspace
    const workspaceJobs = jobs.filter(job => job.tool.workspaceId === member.workspaceId);

    return workspaceJobs.map(job => ({
        id: job.id,
        type: job.status === 'failed' ? 'job_failed' : 'job_complete',
        title: job.status === 'failed' ? 'Research Failed' : 'Research Complete',
        message: `${job.tool.name} analysis has finished.`,
        createdAt: job.completedAt || job.triggeredAt,
        read: seenIds.includes(job.id),
        link: `/tools/${job.toolId}`
    }));
}

export async function markNotificationsRead(jobIds: string[]) {
    const user = await currentUser();
    if (!user || jobIds.length === 0) return;

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) return;

    const existing = member.seenJobIds ?? [];
    const merged = Array.from(new Set([...existing, ...jobIds]));

    await db
        .update(workspaceMembers)
        .set({ seenJobIds: merged })
        .where(eq(workspaceMembers.id, member.id));

    revalidatePath("/");
}
