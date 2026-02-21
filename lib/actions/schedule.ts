"use server";

import { db } from "@/lib/db";
import { tools, workspaceMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type ResearchInterval = "manual" | "weekly" | "biweekly" | "monthly";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getNextResearchAt(interval: ResearchInterval): Date | null {
    const now = new Date();
    switch (interval) {
        case "weekly": {
            const d = new Date(now);
            d.setDate(d.getDate() + 7);
            return d;
        }
        case "biweekly": {
            const d = new Date(now);
            d.setDate(d.getDate() + 14);
            return d;
        }
        case "monthly": {
            const d = new Date(now);
            d.setMonth(d.getMonth() + 1);
            return d;
        }
        default:
            return null;
    }
}

export async function updateResearchSchedule(
    toolId: string,
    interval: ResearchInterval,
): Promise<{ success: boolean; error?: string }> {
    if (!UUID_RE.test(toolId)) {
        return { success: false, error: "Invalid tool ID" };
    }

    const validIntervals: ResearchInterval[] = ["manual", "weekly", "biweekly", "monthly"];
    if (!validIntervals.includes(interval)) {
        return { success: false, error: "Invalid interval" };
    }

    const user = await currentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        columns: { workspaceId: true },
    });
    if (!member) return { success: false, error: "Workspace not found" };

    const tool = await db.query.tools.findFirst({
        where: and(eq(tools.id, toolId), eq(tools.workspaceId, member.workspaceId)),
        columns: { id: true },
    });
    if (!tool) return { success: false, error: "Tool not found" };

    const nextResearchAt = getNextResearchAt(interval);

    await db
        .update(tools)
        .set({ researchInterval: interval, nextResearchAt })
        .where(eq(tools.id, toolId));

    revalidatePath(`/tools/${toolId}`);
    return { success: true };
}
