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

    // Fetch Ad details
    const ad = await db.query.ads.findFirst({
        where: eq(ads.id, id),
        with: {
            tool: true
        }
    });

    if (!ad) {
        return new NextResponse("Invoice not found", { status: 404 });
    }

    // Verify ownership
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, ad.workspaceId)
        )
    });

    if (!member) {
        return new NextResponse("Unauthorized", { status: 401 });
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
                customerEmail={user.emailAddresses[0].emailAddress}
            />
        );

        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="invoice-${ad.id.slice(0, 8)}.pdf"`,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate PDF";
        return new NextResponse(message, { status: 500 });
    }
}
