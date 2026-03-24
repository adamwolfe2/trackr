"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { tools, reports, researchJobs, notes, subscriptions, ads, apiLogs } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, and, count, inArray, ne, gte } from "drizzle-orm";
import { performDeepResearch } from "@/lib/actions/research";
import { ensureWorkspace } from "@/lib/db/ensure-workspace";

import { getWorkspaceId } from "@/lib/db/queries";
import { captureEvent } from "@/lib/analytics/posthog-server";
import { rateLimit } from "@/lib/middleware/rate-limit";

export async function submitTool(formData: FormData) {
    let user;
    try {
        user = await currentUser();
    } catch {
        throw new Error("Authentication error — please refresh and try again.");
    }
    if (!user) throw new Error("Please sign in to add tools.");

    const name = (formData.get("name") as string)?.trim();
    const websiteUrl = (formData.get("website_url") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || "";

    if (!name || name.length < 1 || name.length > 200) {
        throw new Error("Tool name must be 1-200 characters");
    }
    if (!websiteUrl) {
        throw new Error("Website URL is required");
    }
    // Validate URL format
    try {
        new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`);
    } catch {
        throw new Error("Invalid website URL");
    }

    // 1. Get user's workspace (or create one if webhook/onboarding hasn't yet)
    const { workspaceId } = await ensureWorkspace(user.id, {
        displayName: user.firstName || user.username || undefined,
        email: user.primaryEmailAddress?.emailAddress,
    });

    // 1.5 Check Limits + Insert inside a transaction to prevent TOCTOU races
    const { getPlanLimits } = await import("@/lib/config/subscriptions");

    // 2. Generate Embedding + Fetch logo preview in parallel (outside txn — no DB writes)
    const { generateEmbedding } = await import("@/lib/ai/embedding");
    const { previewToolInternal } = await import("@/lib/actions/preview");

    const [embedding, preview] = await Promise.all([
        generateEmbedding(description ? `${name}: ${description} (${websiteUrl})` : `${name}: ${websiteUrl}`).catch(() => null),
        previewToolInternal(websiteUrl).catch(() => null),
    ]);
    const logoUrl = (preview && "image" in preview && preview.image) ? preview.image : null;

    // 3. Check limits then insert (neon-http driver does not support transactions)
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });

    const limits = getPlanLimits(subscription);

    const [{ value: toolCount }] = await db.select({ value: count() })
        .from(tools)
        .where(eq(tools.workspaceId, workspaceId));

    if (limits.limits.tools !== Infinity && toolCount >= limits.limits.tools) {
        throw new Error(`Tool limit reached (${limits.limits.tools} tools on ${limits.name} plan). Upgrade to Team for unlimited tools.`);
    }

    // Pre-check research credits: if monthly limit is reached and no extra credits remain,
    // surface the error synchronously before creating the tool record.
    if (limits.limits.research !== Infinity) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const workspaceToolSubquery = db
            .select({ id: tools.id })
            .from(tools)
            .where(eq(tools.workspaceId, workspaceId));

        const [{ value: jobCount }] = await db
            .select({ value: count() })
            .from(researchJobs)
            .where(and(
                inArray(researchJobs.toolId, workspaceToolSubquery),
                gte(researchJobs.triggeredAt, startOfMonth),
                ne(researchJobs.status, "failed"),
            ));

        if (jobCount >= limits.limits.research && Number(subscription?.creditBalance ?? 0) <= 0) {
            return { error: "insufficient_credits" as const };
        }
    }

    const [newTool] = await db.insert(tools).values({
        workspaceId,
        name,
        websiteUrl,
        logoUrl,
        status: "queued",
        submittedBy: user.id,
        embedding,
    }).returning();

    // 4. Kick off research in the background (runs after redirect is sent)
    after(async () => {
        try {
            await performDeepResearch(newTool.id);
        } catch {
            // Research failure is handled by job status update
        }
    });

    // Track tool submission (after response, non-blocking)
    const captureUserId = user.id;
    after(async () => {
        await captureEvent(captureUserId, "tool_submitted", {
            tool_name: name,
            tool_url: websiteUrl,
            tool_id: newTool.id,
            workspace_id: workspaceId,
        });
    });

    revalidatePath("/tools");
    redirect(`/tools/${newTool.id}`);
}

export async function deleteTool(toolId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    // Verify tool belongs to workspace
    const tool = await db.query.tools.findFirst({
        where: and(eq(tools.id, toolId), eq(tools.workspaceId, workspaceId))
    });

    if (!tool) throw new Error("Tool not found or unauthorized");

    // Delete all related records then the tool (neon-http driver does not support transactions)
    await db.delete(apiLogs).where(eq(apiLogs.toolId, toolId));
    await db.delete(ads).where(eq(ads.toolId, toolId));
    await db.delete(notes).where(eq(notes.toolId, toolId));
    await db.delete(reports).where(eq(reports.toolId, toolId));
    await db.delete(researchJobs).where(eq(researchJobs.toolId, toolId));
    await db.delete(tools).where(eq(tools.id, toolId));

    revalidatePath("/tools");
    revalidatePath("/dashboard");
    return { success: true };
}

const VALID_TOOL_STATUSES = ["queued", "researching", "active", "failed", "paused", "archived"] as const;

/** Maximum tools that can be queued in a single batch to prevent TOCTOU credit races */
const RESEARCH_BATCH_LIMIT = 10;

async function checkResearchCredits(workspaceId: string): Promise<{ allowed: boolean }> {
    const { getPlanLimits } = await import("@/lib/config/subscriptions");
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });
    const limits = getPlanLimits(subscription ?? undefined);

    if (limits.limits.research === Infinity) return { allowed: true };

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const workspaceToolSubquery = db
        .select({ id: tools.id })
        .from(tools)
        .where(eq(tools.workspaceId, workspaceId));

    const [{ value: jobCount }] = await db
        .select({ value: count() })
        .from(researchJobs)
        .where(and(
            inArray(researchJobs.toolId, workspaceToolSubquery),
            gte(researchJobs.triggeredAt, startOfMonth),
            ne(researchJobs.status, "failed"),
        ));

    const creditBalance = subscription?.creditBalance ?? 0;
    if (jobCount >= limits.limits.research && creditBalance <= 0) {
        return { allowed: false };
    }
    return { allowed: true };
}

export async function triggerResearch(toolId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const rl = await rateLimit(`research:${user.id}`, { limit: 5, windowSeconds: 60 });
    if (!rl.success) throw new Error("Too many research requests — please wait a moment and try again.");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const tool = await db.query.tools.findFirst({
        where: and(eq(tools.id, toolId), eq(tools.workspaceId, workspaceId)),
        columns: { id: true, status: true },
    });
    if (!tool) throw new Error("Tool not found or unauthorized");

    // Already in-flight — nothing to do
    if (tool.status === "researching") {
        return { success: true };
    }

    // Pre-check research credits before queuing
    const { allowed } = await checkResearchCredits(workspaceId);
    if (!allowed) return { error: "insufficient_credits" as const };

    await db.update(tools)
        .set({ status: "queued" })
        .where(eq(tools.id, toolId));

    after(async () => {
        try {
            await performDeepResearch(toolId);
        } catch (err) {
            // Research failure is handled by job status update
        }
    });

    revalidatePath("/tools");
    revalidatePath(`/tools/${toolId}`);
    return { success: true };
}

export async function triggerResearchBatch(toolIds: string[]) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const rl = await rateLimit(`research:${user.id}`, { limit: 5, windowSeconds: 60 });
    if (!rl.success) throw new Error("Too many research requests — please wait a moment and try again.");

    if (!toolIds.length) return { success: true, started: 0 };

    // Enforce batch limit to prevent TOCTOU credit race on concurrent after() calls
    if (toolIds.length > RESEARCH_BATCH_LIMIT) {
        throw new Error(`Batch research is limited to ${RESEARCH_BATCH_LIMIT} tools at a time.`);
    }

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    // Pre-check research credits before queuing any tools
    const { allowed } = await checkResearchCredits(workspaceId);
    if (!allowed) return { error: "insufficient_credits" as const };

    // Verify tools belong to workspace and are not already researching
    const eligible = await db.query.tools.findMany({
        where: and(
            inArray(tools.id, toolIds),
            eq(tools.workspaceId, workspaceId),
            ne(tools.status, "researching"),
        ),
        columns: { id: true },
    });

    if (eligible.length === 0) return { success: true, started: 0 };

    const eligibleIds = eligible.map(t => t.id);

    await db.update(tools)
        .set({ status: "queued" })
        .where(inArray(tools.id, eligibleIds));

    for (const tool of eligible) {
        after(async () => {
            try {
                await performDeepResearch(tool.id);
            } catch (err) {
                // Research failure is handled by job status update;
            }
        });
    }

    revalidatePath("/tools");
    return { success: true, started: eligibleIds.length };
}

export async function updateToolStatus(toolId: string, status: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    if (!VALID_TOOL_STATUSES.includes(status as typeof VALID_TOOL_STATUSES[number])) {
        throw new Error("Invalid status");
    }

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    await db.update(tools)
        .set({ status })
        .where(and(eq(tools.id, toolId), eq(tools.workspaceId, workspaceId)));

    revalidatePath("/tools");
    revalidatePath(`/tools/${toolId}`);
    return { success: true };
}

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

export async function publishReport(reportId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const report = await db.query.reports.findFirst({
        where: eq(reports.id, reportId),
    });
    if (!report) throw new Error("Report not found");

    const tool = await db.query.tools.findFirst({
        where: and(eq(tools.id, report.toolId), eq(tools.workspaceId, workspaceId)),
    });
    if (!tool) throw new Error("Tool not found or not in your workspace");

    const baseSlug = slugify(tool.name);

    // If this tool already has a slug, unpublish (toggle off)
    if (tool.publicSlug) {
        await db.update(reports)
            .set({ isPublic: false })
            .where(eq(reports.toolId, tool.id));
        await db.update(tools)
            .set({ publicSlug: null })
            .where(eq(tools.id, tool.id));
        revalidatePath(`/tools/${tool.id}`);
        revalidatePath(`/research/${tool.publicSlug}`);
        revalidatePath("/research");
        return { published: false, slug: null };
    }

    // Generate unique slug then publish (neon-http driver does not support transactions)
    let slug = baseSlug;
    let attempt = 2;
    while (true) {
        const existing = await db.query.tools.findFirst({
            where: eq(tools.publicSlug, slug),
            columns: { id: true },
        });
        if (!existing) break;
        slug = `${baseSlug}-${attempt++}`;
        if (attempt > 50) throw new Error("Could not generate a unique slug");
    }
    // Unpublish any other reports for this tool
    await db.update(reports).set({ isPublic: false }).where(eq(reports.toolId, tool.id));
    // Publish this report
    await db.update(reports).set({ isPublic: true }).where(eq(reports.id, reportId));
    // Set slug on tool
    await db.update(tools).set({ publicSlug: slug }).where(eq(tools.id, tool.id));

    revalidatePath(`/tools/${tool.id}`);
    revalidatePath(`/research/${slug}`);
    revalidatePath("/research");
    return { published: true, slug };
}
