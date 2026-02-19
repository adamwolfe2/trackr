import { db } from "@/lib/db";
import { tools, workspaceMembers, workspaces, softwareSpend } from "@/lib/db/schema";
import { desc, eq, gte, and, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { sendRenewalAlertEmail } from "@/lib/email/resend";
import { postMessage, renewalAlertBlocks } from "@/lib/services/slack";
import { timingSafeEqual } from "crypto";

export const dynamic = 'force-dynamic';

const FROM = "Trackr <noreply@trytrackr.com>";
function getResend() { return new Resend(process.env.RESEND_API_KEY!); }

export async function GET(req: Request) {
    const authHeader = req.headers.get('Authorization') || '';
    const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
    if (!process.env.CRON_SECRET || authHeader.length !== expected.length || !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))) {
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

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let digestsSent = 0;
        let renewalsSent = 0;
        const clerk = await clerkClient();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";

        for (const owner of owners) {
            try {
                const clerkUser = await clerk.users.getUser(owner.userId);
                const email = clerkUser.emailAddresses[0]?.emailAddress;
                if (!email) continue;

                // --- Weekly Research Digest ---
                const recentTools = await db.query.tools.findMany({
                    where: and(
                        eq(tools.workspaceId, owner.workspaceId),
                        gte(tools.lastResearchedAt, sevenDaysAgo),
                    ),
                    orderBy: [desc(tools.lastResearchedAt)],
                    limit: 5,
                });

                if (recentTools.length > 0) {
                    const toolRows = recentTools.map((t) =>
                        `<tr><td style="padding:8px;font-size:13px;border-bottom:1px solid #D0D0CC;">${t.name}</td><td style="padding:8px;font-size:13px;text-align:right;border-bottom:1px solid #D0D0CC;">${t.overallScore ? `${Number(t.overallScore).toFixed(1)}/10` : "—"}</td></tr>`
                    ).join("");

                    await getResend().emails.send({
                        from: FROM,
                        to: email,
                        subject: `Your Trackr weekly digest — ${recentTools.length} tool${recentTools.length !== 1 ? "s" : ""} researched`,
                        html: `
                            <div style="font-family: 'SF Mono', monospace; max-width: 480px; margin: 0 auto; padding: 32px; border: 2px solid #000; background: #F3F3EF;">
                                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Weekly Digest</p>
                                <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 22px; margin: 0 0 16px;">
                                    ${owner.workspace.name}
                                </h1>
                                <p style="font-size: 13px; color: #555; margin: 0 0 16px;">
                                    Here's what your team researched in the past 7 days:
                                </p>
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                                    <thead>
                                        <tr>
                                            <th style="text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #000;">Tool</th>
                                            <th style="text-align: right; padding: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #000;">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>${toolRows}</tbody>
                                </table>
                                <a href="${appUrl}/tools" style="display: inline-block; background: #000; color: #F3F3EF; padding: 12px 24px; font-family: monospace; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; border: 2px solid #000;">
                                    View All Tools →
                                </a>
                                <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #D0D0CC;">
                                    <a href="https://trytrackr.com" style="font-size: 11px; color: #999; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em;">
                                        Trackr — AI-powered software intelligence
                                    </a>
                                </div>
                            </div>
                        `,
                    });
                    digestsSent++;
                }

                // --- Renewal Alerts ---
                const upcomingRenewals = await db.query.softwareSpend.findMany({
                    where: and(
                        eq(softwareSpend.workspaceId, owner.workspaceId),
                        eq(softwareSpend.status, "active"),
                        gte(softwareSpend.renewalDate, now),
                        lte(softwareSpend.renewalDate, thirtyDaysFromNow),
                    ),
                });

                if (upcomingRenewals.length > 0) {
                    const renewalData = upcomingRenewals.map(r => ({
                        name: r.toolName,
                        renewalDate: r.renewalDate!,
                        monthlyCost: r.monthlyCost,
                    }));

                    await sendRenewalAlertEmail(email, renewalData);
                    renewalsSent++;

                    // Also post to Slack if enabled
                    const workspace = await db.query.workspaces.findFirst({
                        where: eq(workspaces.id, owner.workspaceId),
                    });
                    if (workspace?.slackEnabled && workspace.slackChannelId) {
                        try {
                            await postMessage(
                                workspace.slackChannelId,
                                `${renewalData.length} upcoming renewal${renewalData.length !== 1 ? "s" : ""} in the next 30 days`,
                                renewalAlertBlocks(renewalData),
                                workspace.slackBotToken ?? undefined,
                            );
                        } catch {
                            // Non-critical
                        }
                    }
                }
            } catch {
                // Skip users we can't email
            }
        }

        return NextResponse.json({ success: true, digestsSent, renewalsSent });
    } catch (error) {
        console.error("Digest Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
