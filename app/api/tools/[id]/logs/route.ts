import { db } from "@/lib/db";
import { tools } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const tool = await db.query.tools.findFirst({
            where: eq(tools.id, id),
            columns: {
                // @ts-ignore
                researchLogs: true,
                status: true
            }
        });

        if (!tool) {
            return NextResponse.json({ error: "Tool not found" }, { status: 404 });
        }

        // @ts-ignore
        const logs = tool.researchLogs || [];

        return NextResponse.json({ logs, status: tool.status });
    } catch (error) {
        console.error("Failed to fetch logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
