import { PainPointsClient } from "@/components/pain-points/pain-points-client";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspaceId } from "@/lib/db/queries";
import { painPoints, tools } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Pain Points — Trackr",
    description: "Track and manage team pain points to find the right tools.",
};

export default async function PainPointsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) redirect("/onboarding");

    const [points, workspaceTools] = await Promise.all([
        db.query.painPoints.findMany({
            where: eq(painPoints.workspaceId, workspaceId),
            orderBy: [desc(painPoints.createdAt)],
        }),
        db.query.tools.findMany({
            where: eq(tools.workspaceId, workspaceId),
            columns: { id: true, name: true, overallScore: true, category: true, status: true },
        }),
    ]);

    const activeTools = workspaceTools.filter(t => t.status === "active");

    return <PainPointsClient initialData={points} workspaceTools={activeTools} />;
}
