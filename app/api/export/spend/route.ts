import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { softwareSpend, workspaceMembers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";
import { toCSV } from "@/lib/utils/csv";

export async function GET(_req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limit: 5 exports per minute per user
        const rl = await rateLimit(`export-spend:${user.id}`, { limit: 5, windowSeconds: 60 });
        if (!rl.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429, headers: getRateLimitHeaders(rl) }
            );
        }

        const member = await db.query.workspaceMembers.findFirst({
            where: eq(workspaceMembers.userId, user.id),
        });
        if (!member) {
            return NextResponse.json({ error: "No workspace" }, { status: 403 });
        }

        const entries = await db.query.softwareSpend.findMany({
            where: eq(softwareSpend.workspaceId, member.workspaceId),
            orderBy: [desc(softwareSpend.createdAt)],
            limit: 1000,
        });

        const headers = [
            "Tool Name",
            "Category",
            "Status",
            "Monthly Cost",
            "Seats",
            "Billing Cycle",
            "Renewal Date",
            "Contract Length (mo)",
            "Vendor URL",
            "Notes",
        ];

        const rows = entries.map(e => [
            e.toolName,
            e.category ?? "",
            e.status,
            e.monthlyCost ?? "",
            e.seatCount != null ? String(e.seatCount) : "",
            e.billingCycle ?? "",
            e.renewalDate ? new Date(e.renewalDate).toISOString().slice(0, 10) : "",
            e.contractLength != null ? String(e.contractLength) : "",
            e.vendorUrl ?? "",
            e.notes ?? "",
        ]);

        const csv = toCSV(headers, rows);
        const today = new Date().toISOString().slice(0, 10);

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="trackr-spend-${today}.csv"`,
                ...getRateLimitHeaders(rl),
            },
        });
    } catch {
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
