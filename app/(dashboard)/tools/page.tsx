import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { tools, workspaceMembers, ads } from "@/lib/db/schema";
import { eq, desc, like, or, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ToolGrid } from "@/components/tools/tool-grid";

export const dynamic = "force-dynamic";

export default async function ToolsPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    // 1. Get user's workspace
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <h1 className="text-2xl font-bold">No Workspace Found</h1>
                <p className="text-muted-foreground">Please contact support or create a new account.</p>
            </div>
        )
    }

    const searchQuery = searchParams.q || "";

    // 2. Fetch Tools with Search
    const toolsList = await db.query.tools.findMany({
        where: and(
            eq(tools.workspaceId, member.workspaceId),
            searchQuery
                ? or(
                    like(tools.name, `%${searchQuery}%`),
                    like(tools.category, `%${searchQuery}%`)
                )
                : undefined
        ),
        orderBy: [desc(tools.submittedAt)],
    });

    // 2.5 Fetch Promoted Tools (Ads)
    const activeAds = await db.query.ads.findMany({
        where: eq(ads.status, 'active'),
        with: {
            tool: true
        },
        limit: 2
    });

    // Transform ads to tool format and dedup
    const promotedTools = activeAds
        .map(ad => ({ ...ad.tool, isPromoted: true }))
        .filter(adTool => !toolsList.some(t => t.id === adTool.id));

    const finalTools = [...promotedTools, ...toolsList];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">AI Tools Database</h1>
                    <p className="text-muted-foreground">
                        Manage and track AI tools for your organization.
                    </p>
                </div>
                <Link href="/submit">
                    <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add Tool
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <form>
                        <Input
                            name="q"
                            type="search"
                            placeholder="Search tools..."
                            className="pl-9"
                            defaultValue={searchQuery}
                        />
                    </form>
                </div>
            </div>

            {toolsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4 border-2 border-dashed rounded-xl">
                    <h2 className="text-xl font-semibold">No tools found</h2>
                    <p className="text-muted-foreground">Try adjusting your search or add a new tool.</p>
                    <Link href="/submit">
                        <Button variant="outline">Add First Tool</Button>
                    </Link>
                </div>
            ) : (
                <div className="mt-6">
                    {/* @ts-ignore */}
                    <ToolGrid tools={finalTools} />
                </div>
            )}
        </div>
    );
}
