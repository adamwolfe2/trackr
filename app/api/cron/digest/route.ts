import { db } from "@/lib/db";
import { tools, workspaceMembers } from "@/lib/db/schema";
import { desc, eq, gte, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Trackr <noreply@trytrackr.com>";

export async function GET(req: Request) {
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });
    }

    try {
        const owners = await db.query.workspaceMembers.findMany({
            where: eq(workspaceMembers.role, 'owner'),
            with: { workspace: true },
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        let sentCount = 0;
        const clerk = await clerkClient();

        for (const owner of owners) {
            const recentTools = await db.query.tools.findMany({
                where: and(
                    eq(tools.workspaceId, owner.workspaceId),
                    gte(tools.lastResearchedAt, sevenDaysAgo),
                ),
                orderBy: [desc(tools.lastResearchedAt)],
                limit: 5,
            });

            if (recentTools.length === 0) continue;

            try {
                const clerkUser = await clerk.users.getUser(owner.userId);
                const email = clerkUser.emailAddresses[0]?.emailAddress;
                if (!email) continue;

                const toolRows = recentTools.map((t) =>
                    `<tr><td style="padding:8px;font-size:13px;border-bottom:1px solid #eee;">${t.name}</td><td style="padding:8px;font-size:13px;text-align:right;border-bottom:1px solid #eee;">${t.overallScore ? `${Number(t.overallScore).toFixed(1)}/10` : "—"}</td></tr>`
                ).join("");

                await resend.emails.send({
                    from: FROM,
                    to: email,
                    subject: `Your Trackr weekly digest — ${recentTools.length} tool${recentTools.length !== 1 ? "s" : ""} researched`,
                    html: `
                        <div style="font-family:monospace;max-width:480px;margin:0 auto;padding:32px;border:1px solid #000;">
                            <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 8px;">Weekly Digest</p>
                            <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:22px;margin:0 0 16px;">
                                ${owner.workspace.name}
                            </h1>
                            <p style="font-size:13px;color:#555;margin:0 0 16px;">
                                Here's what your team researched in the past 7 days:
                            </p>
                            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                                <thead>
                                    <tr>
                                        <th style="text-align:left;padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #000;">Tool</th>
                                        <th style="text-align:right;padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #000;">Score</th>
                                    </tr>
                                </thead>
                                <tbody>${toolRows}</tbody>
                            </table>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/tools" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;text-decoration:none;">
                                View All Tools →
                            </a>
                        </div>
                    `,
                });

                sentCount++;
            } catch {
                // Skip users we can't email
            }
        }

        return NextResponse.json({ success: true, sent: sentCount });
    } catch (error) {
        console.error("Digest Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
