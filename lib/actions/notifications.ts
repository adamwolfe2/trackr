"use server";

import { db } from "@/lib/db";
// We don't have a notifications table yet, so I will simulate them from researchJobs for now
// or better, I should add a notifications table to the schema if I want true persistence.
// Given strict instructions to "execute phases", let's first check if I should add the table.
// Phase 20 says "In-app inbox".
// Let's create a partial implementation using researchJobs completions as "notifications" for MVP.
// Wait, true notifications usually require a table.
// Let's look at schema again. 

import { researchJobs, tools } from "@/lib/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export type Notification = {
    id: string;
    type: 'job_complete' | 'job_failed';
    title: string;
    message: string;
    createdAt: Date;
    read: boolean;
    link: string;
};

// For this MVP phase, we will generate "virtual" notifications from completed research jobs
// that haven't been "seen" (we might need a 'seen' flag on jobs, or just show recent 5).
// Actually, let's just show the last 5 completed jobs as notifications.

export async function getNotifications(): Promise<Notification[]> {
    const user = await currentUser();
    if (!user) return [];

    // Fetch recent completed jobs
    const jobs = await db.query.researchJobs.findMany({
        where: and(
            ne(researchJobs.status, 'running'),
            ne(researchJobs.status, 'queued')
        ),
        with: {
            tool: true
        },
        orderBy: [desc(researchJobs.completedAt)],
        limit: 10
    });

    return jobs.map(job => ({
        id: job.id,
        type: job.status === 'failed' ? 'job_failed' : 'job_complete',
        title: job.status === 'failed' ? 'Research Failed' : 'Research Complete',
        message: `${job.tool.name} analysis has finished.`,
        createdAt: job.completedAt || job.triggeredAt,
        read: false, // We don't track read state in MVP without a table
        link: `/tools/${job.toolId}`
    }));
}
