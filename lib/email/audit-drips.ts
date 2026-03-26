import { db } from "@/lib/db";
import { dripEmails, auditSubmissions } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { getResend, emailWrapper, emailButton, escapeHtml } from "./resend";

const FROM = "Trackr <team@trytrackr.com>";

type QuickWin = {
    action: string;
    tool: string;
    timeToValue: string;
    expectedOutcome: string;
};

type IndustryBenchmark = {
    peerAvgScore: number;
    peerLabel: string;
    percentile: number;
    insight: string;
    competitiveContext?: string;
};

type ROIProjection = {
    currentAnnualWaste: number;
    projectedSavings: number;
    paybackMonths: number;
    assumptions: string[];
};

type Scorecard = {
    aiNativeScore?: { score: number };
    quickWins?: QuickWin[];
    industryBenchmark?: IndustryBenchmark;
    roiProjection?: ROIProjection;
    [key: string]: unknown;
};

/**
 * Schedule 3-email audit drip sequence using Resend's scheduledAt.
 * D+3: Quick wins, D+7: Competitor pressure, D+14: Expiration urgency.
 * Non-blocking: failures are swallowed so they never block the audit pipeline.
 */
export async function scheduleAuditDripSequence(
    submissionId: string,
    email: string,
    companyName: string,
    scorecard: Scorecard,
): Promise<void> {
    if (!process.env.RESEND_API_KEY) return;

    const resend = getResend();
    const escapedCompany = escapeHtml(companyName);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const calLink = "https://cal.com/thara-rao/schedule-an-audit";

    // Resolve vanity URL for CTA
    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.id, submissionId),
        columns: { publicSlug: true, shareToken: true },
    });
    const scorecardUrl = submission?.publicSlug
        ? `${appUrl}/scorecard/${submission.publicSlug}`
        : submission?.shareToken
            ? `${appUrl}/audit/share/${submission.shareToken}`
            : calLink;

    const quickWins = scorecard.quickWins ?? [];
    const benchmark = scorecard.industryBenchmark;
    const roi = scorecard.roiProjection;
    const score = scorecard.aiNativeScore?.score ?? null;

    const d3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const d7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const d14 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    // ── Day 3: Quick Wins ─────────────────────────────────────────────────────
    const quickWinsHtml = quickWins.length > 0
        ? quickWins.slice(0, 3).map(qw => `
            <div style="border: 1px solid #000; padding: 14px; margin-bottom: 10px; background: #fff;">
                <div style="font-size: 12px; font-weight: bold; margin-bottom: 6px; font-family: monospace;">${escapeHtml(qw.action)}</div>
                <div style="font-size: 11px; color: #555; margin-bottom: 4px;">Tool: ${escapeHtml(qw.tool)} -- ${escapeHtml(qw.timeToValue)}</div>
                <div style="font-size: 11px; color: #333;">${escapeHtml(qw.expectedOutcome)}</div>
            </div>
        `).join("")
        : `<p style="font-size: 13px; color: #555; line-height: 1.6;">Your scorecard has specific recommendations tailored to your stack. These are changes you can make this week with tools you already have.</p>`;

    const day3Html = emailWrapper(`
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Quick Wins for ${escapedCompany}</p>
        <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
            3 things you can do this week
        </h1>
        <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">
            When we audited ${escapedCompany}'s stack, we found quick wins -- changes you can make with tools you already have, no new purchases required.
        </p>
        ${quickWinsHtml}
        <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 16px 0 24px;">
            Your full scorecard has the complete roadmap.
        </p>
        ${emailButton(scorecardUrl, "View Your Scorecard")}
    `);

    const day3Text = `Quick Wins for ${companyName}\n\n3 things you can do this week\n\nWhen we audited ${companyName}'s stack, we found quick wins -- changes you can make with tools you already have.\n\n${quickWins.slice(0, 3).map(qw => `- ${qw.action} (${qw.tool}, ${qw.timeToValue}): ${qw.expectedOutcome}`).join("\n")}\n\nView Your Scorecard: ${scorecardUrl}\n\n--\nTrackr -- AI-powered software intelligence`;

    // ── Day 7: Competitor Pressure ────────────────────────────────────────────
    const benchmarkBlock = benchmark
        ? `
            <div style="border: 2px solid #000; padding: 16px; margin-bottom: 16px; background: #fff;">
                <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                    <div style="text-align: center; flex: 1; padding: 10px; border: 1px solid #d4d4d4;">
                        <div style="font-size: 28px; font-weight: 900;">${score ?? "--"}</div>
                        <div style="font-size: 9px; text-transform: uppercase; color: #999;">Your Score</div>
                    </div>
                    <div style="text-align: center; flex: 1; padding: 10px; border: 1px solid #d4d4d4;">
                        <div style="font-size: 28px; font-weight: 900; color: #666;">${benchmark.peerAvgScore}</div>
                        <div style="font-size: 9px; text-transform: uppercase; color: #999;">Peer Avg</div>
                    </div>
                    <div style="text-align: center; flex: 1; padding: 10px; border: 1px solid #d4d4d4;">
                        <div style="font-size: 28px; font-weight: 900;">${benchmark.percentile}%</div>
                        <div style="font-size: 9px; text-transform: uppercase; color: #999;">Percentile</div>
                    </div>
                </div>
                <div style="font-size: 10px; color: #999; margin-bottom: 6px;">${escapeHtml(benchmark.peerLabel)}</div>
                <div style="font-size: 13px; color: #333; line-height: 1.5;">${escapeHtml(benchmark.insight)}</div>
            </div>
            ${benchmark.competitiveContext ? `<p style="font-size: 13px; color: #333; line-height: 1.6; margin: 0 0 16px;">${escapeHtml(benchmark.competitiveContext)}</p>` : ""}
        `
        : `<p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">Companies in your space are accelerating their AI adoption. The gap between leaders and laggards is widening every quarter.</p>`;

    const day7Html = emailWrapper(`
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Industry Benchmark -- ${escapedCompany}</p>
        <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
            Where ${escapedCompany} stands vs. the competition
        </h1>
        <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">
            We benchmarked ${escapedCompany} against peers in your industry. Here is where you land:
        </p>
        ${benchmarkBlock}
        <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
            Want to walk through what closing the gap looks like? Book a 30-minute strategy call.
        </p>
        ${emailButton(calLink, "Book a Strategy Call")}
    `);

    const day7Text = `Where ${companyName} stands vs. the competition\n\n${benchmark ? `Your Score: ${score ?? "--"} | Peer Avg: ${benchmark.peerAvgScore} | Percentile: ${benchmark.percentile}%\n${benchmark.insight}` : "Companies in your space are accelerating their AI adoption."}\n\nBook a Strategy Call: ${calLink}\n\n--\nTrackr -- AI-powered software intelligence`;

    // ── Day 14: Expiration Urgency ───────────────────────────────────────────
    const roiBlock = roi
        ? `
            <div style="border: 2px solid #000; padding: 16px; margin-bottom: 16px; background: #fff;">
                <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                    <div style="text-align: center; flex: 1; padding: 10px; border: 1px solid #fca5a5; background: #fef2f2;">
                        <div style="font-size: 22px; font-weight: 900; color: #dc2626;">$${Math.round(roi.currentAnnualWaste / 1000)}K</div>
                        <div style="font-size: 9px; text-transform: uppercase; color: #ef4444;">Annual Waste</div>
                    </div>
                    <div style="text-align: center; flex: 1; padding: 10px; border: 1px solid #d4d4d4; background: #f5f5f5;">
                        <div style="font-size: 22px; font-weight: 900; color: #171717;">$${Math.round(roi.projectedSavings / 1000)}K</div>
                        <div style="font-size: 9px; text-transform: uppercase; color: #525252;">Potential Savings</div>
                    </div>
                    <div style="text-align: center; flex: 1; padding: 10px; background: #000;">
                        <div style="font-size: 22px; font-weight: 900; color: #fff;">${roi.paybackMonths}mo</div>
                        <div style="font-size: 9px; text-transform: uppercase; color: rgba(255,255,255,0.5);">Payback</div>
                    </div>
                </div>
                ${roi.assumptions.slice(0, 3).map(a => `<div style="font-size: 11px; color: #555; line-height: 1.5; margin-bottom: 3px;">- ${escapeHtml(a)}</div>`).join("")}
            </div>
        `
        : `<p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">Every month without action, your team absorbs the hidden costs of manual processes, redundant tools, and missed automation opportunities.</p>`;

    const day14Html = emailWrapper(`
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">ROI Report -- ${escapedCompany}</p>
        <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
            The cost of waiting
        </h1>
        <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">
            Two weeks ago we completed ${escapedCompany}'s AI readiness audit. Here is what the numbers show:
        </p>
        ${roiBlock}
        <p style="font-size: 13px; color: #333; line-height: 1.6; margin: 0 0 8px; font-weight: bold;">
            Your scorecard and roadmap are ready. Let's put them to work.
        </p>
        <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
            Book a 30-minute call to walk through the highest-impact moves for ${escapedCompany}.
        </p>
        ${emailButton(calLink, "Book Your Strategy Call")}
    `);

    const day14Text = `The cost of waiting\n\nTwo weeks ago we completed ${companyName}'s AI readiness audit.\n\n${roi ? `Annual Waste: $${Math.round(roi.currentAnnualWaste / 1000)}K | Potential Savings: $${Math.round(roi.projectedSavings / 1000)}K | Payback: ${roi.paybackMonths}mo` : "Every month without action costs your team in manual processes and missed automation."}\n\nBook Your Strategy Call: ${calLink}\n\n--\nTrackr -- AI-powered software intelligence`;

    const drips: Array<{
        type: "audit_d3" | "audit_d7" | "audit_d14";
        subject: string;
        scheduledAt: string;
        html: string;
        text: string;
    }> = [
        {
            type: "audit_d3",
            scheduledAt: d3,
            subject: `3 quick wins for ${companyName} -- no new tools needed`,
            html: day3Html,
            text: day3Text,
        },
        {
            type: "audit_d7",
            scheduledAt: d7,
            subject: `How ${companyName} stacks up against competitors`,
            html: day7Html,
            text: day7Text,
        },
        {
            type: "audit_d14",
            scheduledAt: d14,
            subject: `${companyName}: the cost of waiting`,
            html: day14Html,
            text: day14Text,
        },
    ];

    for (const drip of drips) {
        try {
            const result = await resend.emails.send({
                from: FROM,
                to: email,
                subject: drip.subject,
                scheduledAt: drip.scheduledAt,
                html: drip.html,
                text: drip.text,
            });
            if ("data" in result && result.data?.id) {
                await db.insert(dripEmails).values({
                    email,
                    emailType: drip.type,
                    resendEmailId: result.data.id,
                    scheduledAt: new Date(drip.scheduledAt),
                    auditSubmissionId: submissionId,
                });
            }
        } catch {
            // Drip scheduling failure is non-fatal
        }
    }
}

/**
 * Cancel all pending audit drip emails for a specific submission.
 * Called when a prospect accepts an invite / converts.
 */
export async function cancelAuditDrips(auditSubmissionId: string): Promise<void> {
    if (!process.env.RESEND_API_KEY) return;

    const resend = getResend();

    const pending = await db.query.dripEmails.findMany({
        where: and(
            eq(dripEmails.auditSubmissionId, auditSubmissionId),
            isNull(dripEmails.canceledAt),
        ),
    });

    for (const drip of pending) {
        try {
            await resend.emails.cancel(drip.resendEmailId);
            await db.update(dripEmails)
                .set({ canceledAt: new Date() })
                .where(eq(dripEmails.id, drip.id));
        } catch {
            // Cancellation may fail if already sent -- not critical
        }
    }
}
