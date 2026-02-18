export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { softwareSpend, workspaceMembers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { StackClient } from "./client";

export default async function StackPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) redirect("/onboarding");

    const entries = await db.query.softwareSpend.findMany({
        where: eq(softwareSpend.workspaceId, member.workspaceId),
        orderBy: [desc(softwareSpend.createdAt)],
    });

    return <StackClient initialData={entries} />;
}
