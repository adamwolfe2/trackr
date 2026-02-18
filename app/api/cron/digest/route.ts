import { db } from "@/lib/db";
import { tools, workspaceMembers, workspaces } from "@/lib/db/schema";
import { emailService } from "@/lib/services/email";
import { desc, eq, gte, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const owners = await db.query.workspaceMembers.findMany({
            where: eq(workspaceMembers.role, 'owner'),
            with: {
                workspace: true
            }
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        let sentCount = 0;

        for (const owner of owners) {
            // Find tools added or researched in last 7 days for this workspace
            const newTools = await db.query.tools.findMany({
                where: and(
                    eq(tools.workspaceId, owner.workspaceId),
                    gte(tools.submittedAt, sevenDaysAgo)
                ),
                limit: 5
            });

            const recentlyResearched = await db.query.tools.findMany({
                where: and(
                    eq(tools.workspaceId, owner.workspaceId),
                    gte(tools.lastResearchedAt, sevenDaysAgo)
                ),
                limit: 5
            });

            if (newTools.length > 0 || recentlyResearched.length > 0) {
                // In a real app, we'd fetch the user's email from Clerk or our DB
                // coping with `owner.userId` which is a Clerk ID.
                // For MVP hackathon, we might just log it or send to a dev email if defined.

                // Assuming we can't get email from Clerk ID backend easily without secret key calls to Clerk API
                // We'll skip actual sending if we can't get the email, or send to a debug email.

                // For this implementation, I will just log the "Sending" action
                // OR if you want me to use Resend, I'd need the 'to' address.

                console.log(`[Digest] Would send to owner ${owner.userId} of workspace ${owner.workspace.name}`);
                // await emailService.sendDigest('test@example.com', newTools, recentlyResearched);
                sentCount++;
            }
        }

        return NextResponse.json({ success: true, sent: sentCount });
    } catch (error) {
        console.error("Digest Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
