import { db } from "@/lib/db";
import { workspaces, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Ensures a workspace + membership exists for the given user.
 * Idempotent: if the user already has a workspace, returns it.
 * If not, creates one with consistent naming/slug format.
 *
 * NOT a server action — cannot be called directly from the client.
 * This is the SINGLE source of truth for workspace creation — used by:
 *   - Clerk webhook (user.created)
 *   - completeOnboarding() fallback
 *   - submitTool() fallback
 */
export async function ensureWorkspace(userId: string, hints?: {
    displayName?: string;
    email?: string;
}) {
    // Check if user already has a workspace
    const existing = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, userId),
        with: { workspace: true },
    });

    if (existing) {
        return { workspaceId: existing.workspaceId, workspace: existing.workspace, created: false };
    }

    // Derive naming from hints
    const displayName = hints?.displayName || hints?.email?.split("@")[0] || "User";
    const slug = `ws-${userId.slice(0, 8).toLowerCase()}`;

    // Use upsert-style insert to handle rare race between webhook + onboarding
    // If slug already exists (another request won the race), look up and return instead
    try {
        const [newWorkspace] = await db.insert(workspaces).values({
            name: `${displayName}'s Workspace`,
            slug,
            companyContext: hints?.email ? `Personal workspace for ${hints.email}` : null,
        }).returning();

        await db.insert(workspaceMembers).values({
            userId,
            workspaceId: newWorkspace.id,
            role: "owner",
        });

        return { workspaceId: newWorkspace.id, workspace: newWorkspace, created: true };
    } catch (err) {
        // Unique constraint on slug — another request won the race
        // Re-query and return existing workspace
        const raceWinner = await db.query.workspaceMembers.findFirst({
            where: eq(workspaceMembers.userId, userId),
            with: { workspace: true },
        });
        if (raceWinner) {
            return { workspaceId: raceWinner.workspaceId, workspace: raceWinner.workspace, created: false };
        }
        // If still not found, the error was something else — re-throw
        throw err;
    }
}
