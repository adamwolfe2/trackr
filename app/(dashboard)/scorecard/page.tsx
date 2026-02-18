export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ScorecardClient, type ScorecardRecipe } from "@/components/scorecard/scorecard-client";

export default async function ScorecardPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) {
        return <div className="text-center py-12 text-muted-foreground">No workspace found.</div>;
    }

    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, member.workspaceId),
        columns: { scorecardConfig: true },
    });

    const savedRecipe = workspace?.scorecardConfig as ScorecardRecipe | null;

    return <ScorecardClient savedRecipe={savedRecipe} />;
}
