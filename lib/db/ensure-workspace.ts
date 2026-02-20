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
 *
 * Uses onConflictDoNothing instead of transactions for Neon HTTP compatibility.
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
        if (!existing.workspace) {
            // Orphaned member record — workspace was deleted. Log and try to create fresh.
            console.error(`[ensureWorkspace] Member ${existing.id} has no workspace (workspaceId: ${existing.workspaceId}). Creating new workspace.`);
        } else {
            return { workspaceId: existing.workspaceId, workspace: existing.workspace, created: false };
        }
    }

    // Derive naming from hints
    const displayName = hints?.displayName || hints?.email?.split("@")[0] || "User";
    const slug = `ws-${userId.slice(0, 8).toLowerCase()}`;

    try {
        // Step 1: Insert workspace (idempotent via slug unique constraint)
        const insertedWorkspaces = await db.insert(workspaces).values({
            name: `${displayName}'s Workspace`,
            slug,
            companyContext: hints?.email ? `Personal workspace for ${hints.email}` : null,
        }).onConflictDoNothing().returning();

        // Step 2: Resolve the workspace (either just created or already existing)
        let workspace = insertedWorkspaces[0];
        const created = !!workspace;

        if (!workspace) {
            // Another request already created this workspace (slug conflict)
            // Find it by slug
            const existing = await db.query.workspaces.findFirst({
                where: eq(workspaces.slug, slug),
            });
            if (!existing) {
                throw new Error(`[ensureWorkspace] Workspace with slug ${slug} not found after conflict`);
            }
            workspace = existing;
        }

        // Step 3: Insert member (idempotent via workspace_members_workspace_user_unique)
        await db.insert(workspaceMembers).values({
            userId,
            workspaceId: workspace.id,
            role: "owner",
        }).onConflictDoNothing();

        return { workspaceId: workspace.id, workspace, created };
    } catch (err) {
        console.error(`[ensureWorkspace] Failed for userId=${userId} slug=${slug}:`, err);
        throw err;
    }
}
