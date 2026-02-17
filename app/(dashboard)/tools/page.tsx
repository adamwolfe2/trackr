import { db } from "@/lib/db";
import { tools } from "@/lib/db/schema";
import { ToolTable } from "@/components/tools/tool-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
    let toolData: any[] = [];
    try {
        // Attempt to fetch tools usually
        // toolData = await db.select().from(tools).orderBy(desc(tools.submittedAt));
        // Mocking for now since DB might fail connection in this env
        toolData = [];
    } catch (error) {
        console.error("Failed to fetch tools:", error);
        toolData = [];
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Tool Database</h1>
                <Button asChild>
                    <Link href="/tools/submit" className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add Tool
                    </Link>
                </Button>
            </div>

            <ToolTable tools={toolData as any[]} />
        </div>
    );
}
