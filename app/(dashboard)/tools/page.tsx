import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { tools, workspaceMembers, softwareSpend } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { KanbanBoard } from "@/components/tools/kanban-board";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <h1 className="text-2xl font-bold">No Workspace Found</h1>
                <p className="text-muted-foreground">Please contact support or complete onboarding.</p>
            </div>
        );
    }

    const [toolsList, spendEntries] = await Promise.all([
        db.query.tools.findMany({
            where: eq(tools.workspaceId, member.workspaceId),
            orderBy: [desc(tools.submittedAt)],
        }),
        db.query.softwareSpend.findMany({
            where: eq(softwareSpend.workspaceId, member.workspaceId),
        }),
    ]);

    // Stats
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const scored = toolsList.filter(t => t.overallScore !== null);
    const avgScore = scored.length > 0
        ? (scored.reduce((sum, t) => sum + parseFloat(t.overallScore!), 0) / scored.length).toFixed(1)
        : null;

    const researchedThisMonth = toolsList.filter(t =>
        t.lastResearchedAt && new Date(t.lastResearchedAt) >= firstOfMonth
    ).length;

    const monthlySpend = spendEntries
        .filter(e => e.status === "active")
        .reduce((sum, e) => sum + parseFloat(e.monthlyCost || "0"), 0);

    const stats = { totalTools: toolsList.length, avgScore, researchedThisMonth, monthlySpend };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">AI Tools Portfolio</h1>
                    <p className="text-sm text-muted-foreground">Your team&apos;s AI tool intelligence at a glance.</p>
                </div>
                <Link href="/submit">
                    <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add Tool
                    </Button>
                </Link>
            </div>

            {toolsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4 border-2 border-dashed border-neutral-300 p-12">
                    <h2 className="text-xl font-semibold">No tools yet</h2>
                    <p className="text-muted-foreground text-sm">Add your first AI tool to start building your portfolio.</p>
                    <Link href="/submit">
                        <Button variant="outline">Add First Tool</Button>
                    </Link>
                </div>
            ) : (
                <KanbanBoard tools={toolsList} stats={stats} />
            )}
        </div>
    );
}
