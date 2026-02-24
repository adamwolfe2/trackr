import { db } from "@/lib/db";
import { ads, workspaceMembers } from "@/lib/db/schema";
import { InvoiceDocument } from "@/lib/pdf/invoice-template";
import { renderToStream } from "@react-pdf/renderer";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await currentUser();
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // Verify workspace membership first — this scopes the subsequent ad fetch
    // so an attacker can't enumerate ad IDs across workspaces via timing differences
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
        columns: { workspaceId: true },
    });

    if (!member) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch Ad scoped to user's workspace — prevents cross-workspace enumeration
    const ad = await db.query.ads.findFirst({
        where: and(eq(ads.id, id), eq(ads.workspaceId, member.workspaceId)),
        with: {
            tool: true
        }
    });

    if (!ad) {
        return new NextResponse("Invoice not found", { status: 404 });
    }

    // Only allow invoices for paid campaigns
    if (ad.status !== "completed" && ad.status !== "active") {
        return new NextResponse("Invoice not available for this campaign", { status: 404 });
    }

    try {
        // Generate PDF Stream
        const stream = await renderToStream(
            <InvoiceDocument
                id={ad.id}
                date={ad.createdAt}
                amount={ad.budget}
                description={`Ad Campaign for ${ad.tool.name}`}
                customerName={user.fullName || "Valued Customer"}
                customerEmail={user.emailAddresses?.[0]?.emailAddress ?? "customer"}
            />
        );

        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="invoice-${ad.id.slice(0, 8)}.pdf"`,
            },
        });
    } catch (err) {
        console.error("[api/invoices]", err);
        return new NextResponse("Failed to generate invoice", { status: 500 });
    }
}
