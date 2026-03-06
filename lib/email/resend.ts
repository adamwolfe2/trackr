import { Resend } from "resend";
import { db } from "@/lib/db";
import { dripEmails } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";

const FROM = "Trackr <noreply@send.trytrackr.com>";
const MAX_RETRIES = 3;

async function sendWithRetry(
    fn: () => Promise<unknown>,
    attempt = 0
): Promise<void> {
    try {
        await fn();
    } catch (err) {
        if (attempt >= MAX_RETRIES - 1) throw err;
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, delay));
        return sendWithRetry(fn, attempt + 1);
    }
}

function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (ch) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] ?? ch
    );
}

function getResend() {
    return new Resend(process.env.RESEND_API_KEY!);
}

function emailWrapper(content: string) {
    return `
        <div style="font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace; max-width: 480px; margin: 0 auto; padding: 32px; border: 2px solid #000; background: #F3F3EF;">
            ${content}
            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #D0D0CC;">
                <a href="https://trytrackr.com" style="font-size: 11px; color: #999; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em;">
                    Trackr — AI-powered software intelligence
                </a>
            </div>
        </div>
    `;
}

function emailButton(href: string, label: string) {
    return `<a href="${href}" style="display: inline-block; background: #000; color: #F3F3EF; padding: 12px 24px; font-family: monospace; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; border: 2px solid #000;">${label}</a>`;
}

export async function sendWelcomeEmail(to: string, firstName: string) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const resend = getResend();
    await sendWithRetry(() => resend.emails.send({
        from: FROM,
        to,
        subject: "Welcome to Trackr",
        html: emailWrapper(`
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                Welcome, ${escapeHtml(firstName)}.
            </h1>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
                Trackr is ready. Here's how to get the most out of it in the next 10 minutes:
            </p>
            <ol style="font-size: 13px; color: #333; line-height: 2; padding-left: 20px; margin: 0 0 24px;">
                <li>Go to <strong>/submit</strong> and paste any tool URL</li>
                <li>Watch agents research it in real time</li>
                <li>Review the scored report at <strong>/tools</strong></li>
                <li>Add your team's monthly spend at <strong>/stack</strong></li>
            </ol>
            ${emailButton(`${appUrl}/tools`, "Open Trackr →")}
        `),
    }));
}

export async function sendInviteEmail(
    to: string,
    workspaceName: string,
    inviterName?: string,
    inviteId?: string,
) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const resend = getResend();
    const invitedBy = inviterName ? ` by ${escapeHtml(inviterName)}` : "";
    const acceptUrl = inviteId
        ? `${appUrl}/invite/accept/${inviteId}`
        : `${appUrl}/sign-up`;
    await sendWithRetry(() => resend.emails.send({
        from: FROM,
        to,
        subject: `You've been invited to ${escapeHtml(workspaceName)} on Trackr`,
        html: emailWrapper(`
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Workspace Invitation</p>
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                Join ${escapeHtml(workspaceName)}
            </h1>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 8px;">
                You've been invited${invitedBy} to collaborate on <strong>${escapeHtml(workspaceName)}</strong>'s software research workspace.
            </p>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
                Trackr helps teams evaluate SaaS tools with AI-powered research, scoring, and spend tracking.
            </p>
            ${emailButton(acceptUrl, "Accept Invitation →")}
        `),
    }));
}

export async function sendResearchCompleteEmail(
    to: string,
    toolName: string,
    toolId: string,
    score: number,
    previousScore?: number | null,
) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const resend = getResend();

    let scoreDeltaHtml = "";
    if (previousScore != null) {
        const delta = score - previousScore;
        if (Math.abs(delta) >= 0.1) {
            const sign = delta > 0 ? "+" : "";
            const color = delta > 0 ? "#111" : "#888";
            scoreDeltaHtml = `<span style="font-size: 14px; color: ${color}; margin-left: 8px;">${sign}${delta.toFixed(1)} vs last</span>`;
        }
    }

    await sendWithRetry(() => resend.emails.send({
        from: FROM,
        to,
        subject: `Research complete: ${escapeHtml(toolName)} (${score.toFixed(1)}/10)`,
        html: emailWrapper(`
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Research Complete</p>
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 8px;">${escapeHtml(toolName)}</h1>
            <div style="font-size: 40px; font-family: Georgia, 'Newsreader', serif; margin: 16px 0; display: flex; align-items: baseline; gap: 8px;">${score.toFixed(1)}<span style="font-size: 18px; color: #999;">/10</span>${scoreDeltaHtml}</div>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
                Your research report is ready. Open it to see the full scorecard, pros/cons, competitor analysis, and pricing breakdown.
            </p>
            ${emailButton(`${appUrl}/tools/${toolId}`, "View Report →")}
        `),
    }));
}

export async function sendResearchFailedEmail(
    to: string,
    toolName: string,
    toolId: string,
    errorMessage: string
) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const resend = getResend();
    await sendWithRetry(() => resend.emails.send({
        from: FROM,
        to,
        subject: `Research failed: ${escapeHtml(toolName)}`,
        html: emailWrapper(`
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Research Failed</p>
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">${escapeHtml(toolName)}</h1>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 8px;">Something went wrong during research:</p>
            <p style="font-size: 12px; color: #C0392B; background: #fff; padding: 8px 12px; margin: 0 0 24px; border: 1px solid #C0392B;">${escapeHtml(errorMessage)}</p>
            ${emailButton(`${appUrl}/tools/${toolId}`, "Retry Research →")}
        `),
    }));
}

export async function sendTrialEndingEmail(
    to: string,
    daysLeft: number,
    planName: string
) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const resend = getResend();
    const urgency = daysLeft <= 3
        ? `<p style="font-size: 13px; color: #C0392B; font-weight: bold; margin: 0 0 16px;">Your trial expires ${daysLeft === 0 ? "today" : `in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}.</p>`
        : `<p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">Your ${escapeHtml(planName)} trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.</p>`;
    await sendWithRetry(() => resend.emails.send({
        from: FROM,
        to,
        subject: `Your Trackr trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
        html: emailWrapper(`
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Trial Ending Soon</p>
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                Don&apos;t lose access
            </h1>
            ${urgency}
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
                Add a payment method to keep your ${escapeHtml(planName)} features — research credits, team members, integrations, and all your saved data.
            </p>
            ${emailButton(`${appUrl}/settings/billing`, "Add Payment Method →")}
        `),
    }));
}

// ── Drip Email Sequence ──────────────────────────────────────────────────────

/**
 * Schedule the full 3-email post-signup drip sequence using Resend's scheduledAt.
 * D+1: Re-engagement (check first report), D+3: Credits nudge, D+7: Upgrade CTA.
 * All three emails are queued at sign-up time — no cron job needed.
 */
export async function scheduleDripSequence(to: string, firstName: string) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const resend = getResend();
    const name = escapeHtml(firstName);

    const d1 = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();
    const d3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const d7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const d14 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const drips: Array<{ type: 'd1' | 'd3' | 'd7' | 'd14'; subject: string; scheduledAt: string; html: string }> = [
        {
            type: 'd1',
            scheduledAt: d1,
            subject: `${firstName}, your first Trackr report is waiting`,
            html: emailWrapper(`
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Day 1 — Getting Started</p>
                <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                    ${name}, ready to research your first tool?
                </h1>
                <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">
                    It takes under 2 minutes. Paste any SaaS tool URL and Trackr's research agents will:
                </p>
                <ul style="font-size: 13px; color: #333; line-height: 2; padding-left: 20px; margin: 0 0 24px;">
                    <li>Scrape the official site for features and pricing</li>
                    <li>Pull reviews from G2, Capterra, TrustRadius, and Reddit</li>
                    <li>Analyze competitors and market position</li>
                    <li>Score the tool across 7 dimensions</li>
                </ul>
                ${emailButton(`${appUrl}/submit`, "Research a Tool Now →")}
            `),
        },
        {
            type: 'd3',
            scheduledAt: d3,
            subject: "Here's how Trackr teams save hours every week",
            html: emailWrapper(`
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Day 3 — Team Tip</p>
                <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                    The typical team evaluates 10-15 tools per quarter.
                </h1>
                <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">
                    That's 40-60 hours of research time — reading landing pages, comparing G2 reviews, building spreadsheets. Trackr reduces it to <strong>under 2 minutes per tool</strong>.
                </p>
                <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
                    Your free plan includes 3 research reports per month. For unlimited tools + 25 reports/month, the Team plan is $50/month — or buy extra credits for $1.50 each.
                </p>
                ${emailButton(`${appUrl}/submit`, "Research a Tool →")}
            `),
        },
        {
            type: 'd7',
            scheduledAt: d7,
            subject: "Is Trackr saving you time?",
            html: emailWrapper(`
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Day 7 — Check-in</p>
                <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                    A week in — how's it going?
                </h1>
                <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">
                    Teams on the Team plan can:
                </p>
                <ul style="font-size: 13px; color: #333; line-height: 2; padding-left: 20px; margin: 0 0 24px;">
                    <li>Run 25 research reports per month</li>
                    <li>Invite up to 5 teammates to share a workspace</li>
                    <li>Get Slack notifications when research completes</li>
                    <li>Export reports to PDF for stakeholder reviews</li>
                    <li>Track monthly SaaS spend across all tools</li>
                    <li>Schedule auto-research (weekly, bi-weekly, monthly)</li>
                </ul>
                <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
                    The Team plan is $50/month — less than the cost of one hour of manual research time at $100/hr blended rate.
                </p>
                ${emailButton(`${appUrl}/pricing`, "Upgrade to Team →")}
            `),
        },
        {
            type: 'd14',
            scheduledAt: d14,
            subject: `${firstName}, two weeks with Trackr — here's what you're missing`,
            html: emailWrapper(`
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Day 14 — Still on free?</p>
                <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                    Two weeks in, ${name}.
                </h1>
                <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">
                    If you've used Trackr this month, you know the core loop — submit a URL, get a scored report in under 2 minutes. Teams that stick with Trackr typically research 10-20 tools per quarter. That's $2,000–$5,000 in ops team time at a $100/hr blended rate.
                </p>
                <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 8px;">
                    The free plan covers 3 reports/month. Here's what Team unlocks for $50/month:
                </p>
                <ul style="font-size: 13px; color: #333; line-height: 2; padding-left: 20px; margin: 0 0 24px;">
                    <li><strong>25 research reports/month</strong> — enough for full quarterly evaluations</li>
                    <li><strong>Auto-research scheduling</strong> — weekly, bi-weekly, or monthly re-research</li>
                    <li><strong>Slack notifications</strong> — research results delivered where your team works</li>
                    <li><strong>3-way comparison</strong> — evaluate finalists side-by-side</li>
                    <li><strong>CSV export</strong> — your full stack in one download</li>
                    <li><strong>5 workspace members</strong> — share research with your team</li>
                </ul>
                <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
                    $50/month is less than 30 minutes of manual research time. Most teams save that in the first week.
                </p>
                ${emailButton(`${appUrl}/settings/billing`, "Upgrade to Team — $50/mo →")}
            `),
        },
    ];

    // Fire-and-forget: schedule each drip and store its Resend ID for potential cancellation
    for (const drip of drips) {
        resend.emails.send({
            from: FROM,
            to,
            subject: drip.subject,
            scheduledAt: drip.scheduledAt,
            html: drip.html,
        }).then((result) => {
            if ('data' in result && result.data?.id) {
                return db.insert(dripEmails).values({
                    email: to,
                    emailType: drip.type,
                    resendEmailId: result.data.id,
                    scheduledAt: new Date(drip.scheduledAt),
                }).catch(() => {});
            }
        }).catch(() => {});
    }
}

/**
 * Cancel all pending (unsent) drip emails for an email address.
 * Called when a user upgrades to Pro or unsubscribes.
 */
export async function cancelDripForUser(email: string) {
    if (!process.env.RESEND_API_KEY) return;
    const resend = getResend();

    const pending = await db.query.dripEmails.findMany({
        where: and(
            eq(dripEmails.email, email),
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
            // Cancellation may fail if already sent — not critical
        }
    }
}

export async function sendRenewalAlertEmail(
    to: string,
    tools: Array<{ name: string; renewalDate: Date; monthlyCost: string | null }>
) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";

    const toolRows = tools.map(t => {
        const date = new Date(t.renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const cost = t.monthlyCost && parseFloat(t.monthlyCost) > 0
            ? `$${parseFloat(t.monthlyCost).toLocaleString("en-US", { minimumFractionDigits: 2 })}/mo`
            : "—";
        return `<tr>
            <td style="padding: 8px; font-size: 13px; border-bottom: 1px solid #D0D0CC;">${escapeHtml(t.name)}</td>
            <td style="padding: 8px; font-size: 13px; text-align: right; border-bottom: 1px solid #D0D0CC;">${date}</td>
            <td style="padding: 8px; font-size: 13px; text-align: right; border-bottom: 1px solid #D0D0CC;">${cost}</td>
        </tr>`;
    }).join("");

    const resend = getResend();
    await sendWithRetry(() => resend.emails.send({
        from: FROM,
        to,
        subject: `${tools.length} tool renewal${tools.length !== 1 ? "s" : ""} coming up`,
        html: emailWrapper(`
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Renewal Alert</p>
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                Upcoming Renewals
            </h1>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">
                The following tools in your stack have renewals in the next 30 days:
            </p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #000;">Tool</th>
                        <th style="text-align: right; padding: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #000;">Renewal</th>
                        <th style="text-align: right; padding: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #000;">Cost</th>
                    </tr>
                </thead>
                <tbody>${toolRows}</tbody>
            </table>
            ${emailButton(`${appUrl}/stack`, "Review Stack →")}
        `),
    }));
}

// ── Stack Health Digest Email ────────────────────────────────────────────────

export interface StackHealthDigestData {
    workspaceName: string;
    totalMonthlySpend: number;
    spendDelta: number; // vs previous period (positive = increased)
    aiScore: number;
    renewals: Array<{ name: string; renewalDate: Date; monthlyCost: string | null }>;
    currentStreak: number;
    recommendation?: string; // AI-generated single recommendation
}

export async function sendStackHealthDigest(to: string, data: StackHealthDigestData) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";

    const spendDirection = data.spendDelta >= 0 ? "+" : "";
    const spendDeltaStr = `${spendDirection}$${Math.abs(Math.round(data.spendDelta))}/mo`;

    const renewalRows = data.renewals.slice(0, 5).map(r => {
        const date = new Date(r.renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const cost = r.monthlyCost && parseFloat(r.monthlyCost) > 0
            ? `$${parseFloat(r.monthlyCost).toLocaleString("en-US", { minimumFractionDigits: 0 })}/mo`
            : "";
        return `<tr>
            <td style="padding:6px 8px;font-size:12px;border-bottom:1px solid #D0D0CC;">${escapeHtml(r.name)}</td>
            <td style="padding:6px 8px;font-size:12px;text-align:right;border-bottom:1px solid #D0D0CC;">${date}</td>
            <td style="padding:6px 8px;font-size:12px;text-align:right;border-bottom:1px solid #D0D0CC;">${cost}</td>
        </tr>`;
    }).join("");

    const streakLine = data.currentStreak > 1
        ? `<p style="font-size:12px;color:#555;margin:0 0 16px;">Week ${data.currentStreak} streak — keep it going.</p>`
        : "";

    const recommendationBlock = data.recommendation
        ? `<div style="background:#fff;border:1px solid #000;padding:12px;margin:0 0 16px;">
               <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 6px;">AI Recommendation</p>
               <p style="font-size:12px;color:#333;margin:0;line-height:1.5;">${escapeHtml(data.recommendation)}</p>
           </div>`
        : "";

    const renewalSection = data.renewals.length > 0
        ? `<p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:16px 0 6px;">Upcoming Renewals</p>
           <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
               <tbody>${renewalRows}</tbody>
           </table>`
        : "";

    const resend = getResend();
    await sendWithRetry(() => resend.emails.send({
        from: FROM,
        to,
        subject: `Stack Health Pulse — $${Math.round(data.totalMonthlySpend)}/mo | AI Score: ${data.aiScore}/100`,
        html: emailWrapper(`
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 8px;">Weekly Stack Health</p>
            <h1 style="font-family:Georgia,'Newsreader',serif;font-weight:normal;font-size:22px;margin:0 0 16px;">
                ${escapeHtml(data.workspaceName)}
            </h1>
            ${streakLine}
            <div style="display:flex;gap:16px;margin:0 0 16px;">
                <div style="flex:1;background:#fff;border:1px solid #000;padding:12px;text-align:center;">
                    <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 4px;">Monthly Spend</p>
                    <p style="font-family:Georgia,serif;font-size:20px;margin:0;">$${Math.round(data.totalMonthlySpend)}</p>
                    <p style="font-size:11px;color:${data.spendDelta > 0 ? "#c00" : data.spendDelta < 0 ? "#060" : "#999"};margin:4px 0 0;">${spendDeltaStr} vs last week</p>
                </div>
                <div style="flex:1;background:#fff;border:1px solid #000;padding:12px;text-align:center;">
                    <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 4px;">AI Nativeness</p>
                    <p style="font-family:Georgia,serif;font-size:20px;margin:0;">${data.aiScore}/100</p>
                </div>
            </div>
            ${recommendationBlock}
            ${renewalSection}
            ${emailButton(`${appUrl}/stack`, "View Full Stack →")}
        `),
    }));
}

// ── Audit Scorecard Email ─────────────────────────────────────────────────────

import type { AuditScorecard } from "@/lib/actions/audit";

interface AuditEmailPayload {
    submission: {
        id?: string;
        contactEmail: string;
        contactName: string | null;
        callOwnerEmail: string | null;
        companyName: string;
        companyWebsite: string | null;
        role: string | null;
    };
    scorecard: AuditScorecard;
    shareUrl?: string;
    adminUrl?: string;
}

export async function sendAuditScorecardEmail({ submission, scorecard, shareUrl, adminUrl }: AuditEmailPayload) {
    if (!process.env.RESEND_API_KEY) return;

    const ADAM_EMAIL = "adamwolfe102@gmail.com";
    const to = submission.callOwnerEmail?.trim() || ADAM_EMAIL;
    const cc = to !== ADAM_EMAIL ? [ADAM_EMAIL] : [];

    const score = scorecard.aiNativeScore.score;
    const companyName = escapeHtml(scorecard.companyName);
    const contactName = escapeHtml(submission.contactName || "there");
    const role = escapeHtml(submission.role || "");

    const scoreColor = score >= 61 ? "#16a34a" : score >= 41 ? "#d97706" : "#dc2626";

    const painPointsHtml = scorecard.painPoints
        .map(p => `
            <tr>
                <td style="padding: 10px 8px; border-bottom: 1px solid #e5e5e0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; white-space: nowrap; vertical-align: top;">${escapeHtml(p.area)}</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #e5e5e0; font-size: 13px; color: #333; line-height: 1.5;">${escapeHtml(p.description)}</td>
            </tr>`)
        .join("");

    const stackHtml = scorecard.currentStack
        .map(t => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e0; font-size: 13px; font-weight: bold;">${escapeHtml(t.name)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(t.aiRole)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e0; font-size: 12px; color: #555;">${escapeHtml(t.usageNotes)}</td>
            </tr>`)
        .join("");

    const recsHtml = scorecard.recommendations
        .map((r, i) => `
            <div style="margin-bottom: 16px; padding: 14px; border-left: 3px solid #000; background: #fff;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">${i + 1}. ${escapeHtml(r.title)}</span>
                    <span style="font-size: 10px; padding: 2px 6px; border: 1px solid #000; white-space: nowrap; margin-left: 8px;">Impact: ${escapeHtml(r.impact)}</span>
                </div>
                <p style="font-size: 13px; color: #444; line-height: 1.5; margin: 0;">${escapeHtml(r.description)}</p>
            </div>`)
        .join("");

    const talkingPointsHtml = (scorecard.talkingPoints ?? [])
        .map((tp, i) => `
            <div style="margin-bottom: 14px; padding: 12px; border: 1px solid #000; background: #fff;">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin-bottom: 6px;">${i + 1}. ${escapeHtml(tp.topic)}</div>
                <div style="font-size: 12px; color: #555; margin-bottom: 6px;"><strong>Found:</strong> ${escapeHtml(tp.observation)}</div>
                <div style="font-size: 12px; color: #000; margin-bottom: 6px;"><strong>Ask:</strong> "${escapeHtml(tp.question)}"</div>
                <div style="font-size: 12px; color: #16a34a;"><strong>Opportunity:</strong> ${escapeHtml(tp.opportunity)}</div>
            </div>`)
        .join("");

    const html = emailWrapper(`
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">AI Readiness Audit · Trackr</p>
        <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 26px; margin: 0 0 4px; line-height: 1.2;">
            ${companyName}
        </h1>
        <p style="font-size: 13px; color: #666; margin: 0 0 24px;">${contactName}${role ? ` · ${role}` : ""}${submission.companyWebsite ? ` · <a href="${escapeHtml(submission.companyWebsite)}" style="color: #000;">${escapeHtml(submission.companyWebsite)}</a>` : ""}</p>

        <!-- Score -->
        <div style="border: 2px solid #000; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 20px;">
            <div style="font-size: 52px; font-weight: 900; color: ${scoreColor}; line-height: 1; min-width: 80px;">${score}<span style="font-size: 20px; color: #999;">/100</span></div>
            <div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin-bottom: 4px;">AI-Native Score</div>
                <div style="font-size: 13px; color: #333; line-height: 1.4;">${escapeHtml(scorecard.aiNativeScore.summary)}</div>
            </div>
        </div>

        <!-- Pain Points -->
        <h2 style="font-family: Georgia, serif; font-weight: normal; font-size: 17px; margin: 0 0 12px; border-bottom: 2px solid #000; padding-bottom: 8px;">Pain Points</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tbody>${painPointsHtml}</tbody>
        </table>

        <!-- Current Stack -->
        <h2 style="font-family: Georgia, serif; font-weight: normal; font-size: 17px; margin: 0 0 12px; border-bottom: 2px solid #000; padding-bottom: 8px;">Current Stack</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
                <tr>
                    <th style="text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #000;">Tool</th>
                    <th style="text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #000;">AI Role</th>
                    <th style="text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #000;">Notes</th>
                </tr>
            </thead>
            <tbody>${stackHtml}</tbody>
        </table>

        <!-- Recommendations -->
        <h2 style="font-family: Georgia, serif; font-weight: normal; font-size: 17px; margin: 0 0 12px; border-bottom: 2px solid #000; padding-bottom: 8px;">Recommendations</h2>
        <div style="margin-bottom: 24px;">${recsHtml}</div>

        <!-- Future target -->
        <div style="background: #000; color: #F3F3EF; padding: 16px; margin-bottom: 24px;">
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; margin-bottom: 4px;">Target AI-Native Score</div>
            <div style="font-size: 32px; font-weight: 900; margin-bottom: 6px;">${scorecard.futureAINativeTarget.targetScore}/100</div>
            <div style="font-size: 13px; opacity: 0.85; line-height: 1.4;">${escapeHtml(scorecard.futureAINativeTarget.summary)}</div>
        </div>

        <!-- Call Prep: Talking Points -->
        ${talkingPointsHtml ? `
        <h2 style="font-family: Georgia, serif; font-weight: normal; font-size: 17px; margin: 0 0 12px; border-bottom: 2px solid #000; padding-bottom: 8px;">Call Prep: Talking Points</h2>
        <div style="margin-bottom: 24px;">${talkingPointsHtml}</div>
        ` : ""}

        <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">
            On the call, walk through this scorecard, prioritize the highest-impact changes, and map out what implementation with Trackr looks like.
        </p>

        ${shareUrl ? `
        <!-- Share link (for screen share on call — do not send to prospect) -->
        <div style="border: 2px solid #000; padding: 16px; margin-bottom: 20px; background: #F3F3EF;">
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin-bottom: 8px;">Scorecard Share Link (Screen Share on Call)</div>
            <p style="font-size: 12px; color: #444; margin: 0 0 10px; line-height: 1.4;">Open this during your call to reveal the scorecard live. Do not send directly to the prospect before the call.</p>
            <a href="${shareUrl}" style="font-size: 12px; color: #000; word-break: break-all; font-family: monospace;">${shareUrl}</a>
        </div>
        ` : ""}

        ${adminUrl ? emailButton(adminUrl, "Manage This Lead →") : emailButton("https://trytrackr.com", "Open Trackr →")}
    `);

    const resend = getResend();
    await sendWithRetry(() =>
        resend.emails.send({
            from: FROM,
            to,
            ...(cc.length > 0 ? { cc } : {}),
            subject: `AI Audit Scorecard – ${scorecard.companyName} (Score: ${score}/100)`,
            html,
        })
    );
}

// ── Prospect Teaser Email ─────────────────────────────────────────────────────

interface ProspectTeaserPayload {
    submission: {
        contactEmail: string;
        contactName: string | null;
        companyName: string;
    };
    score: number;
}

function getTeaserCopy(score: number): { subject: string; hook: string; angle: string } {
    if (score <= 20) {
        return {
            subject: "Your AI readiness report is ready for your call",
            hook: "We found significant gaps in your AI stack — and specific steps to close them fast.",
            angle: "Our team has identified the exact areas holding you back and built a custom roadmap for your call.",
        };
    }
    if (score <= 40) {
        return {
            subject: "We found 5 opportunities your competitors may be closing",
            hook: "You have momentum — but there are critical gaps that could widen the gap between you and AI-native competitors.",
            angle: "Your report identifies the highest-leverage moves to take in the next 90 days before the window closes.",
        };
    }
    if (score <= 60) {
        return {
            subject: "Good progress — and 3 gaps holding you back",
            hook: "You're in the top half, but three specific blockers are keeping you from compounding your AI advantage.",
            angle: "Your scorecard pinpoints exactly where you're leaking value and what to prioritize first.",
        };
    }
    if (score <= 80) {
        return {
            subject: "You're ahead of 80% of companies. Here's the last 20%.",
            hook: "You're operating at a high level — and the nuanced gaps in your stack are exactly what separate good from exceptional.",
            angle: "Your report reveals the high-leverage optimizations that most companies never reach.",
        };
    }
    return {
        subject: "You're in rare company. 2 things worth your attention.",
        hook: "You're operating at near AI-native level. Two specific insights came up that are worth a short conversation.",
        angle: "Your call will be a focused, high-value session — not a basics walkthrough.",
    };
}

export async function sendProspectTeaserEmail({ submission, score }: ProspectTeaserPayload) {
    if (!process.env.RESEND_API_KEY) return;

    const calLink = "https://cal.com/adamwolfe/trackr";
    const { subject, hook, angle } = getTeaserCopy(score);
    const firstName = escapeHtml(submission.contactName?.split(" ")[0] || "there");
    const companyName = escapeHtml(submission.companyName);

    const html = emailWrapper(`
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">AI Readiness Audit · Trackr</p>
        <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 20px; line-height: 1.3;">
            Hi ${firstName},
        </h1>

        <p style="font-size: 14px; color: #333; line-height: 1.7; margin: 0 0 16px;">
            ${hook}
        </p>

        <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 16px;">
            Your full AI readiness report for <strong>${companyName}</strong> is ready and will be reviewed together on your call.
        </p>

        <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 24px;">
            ${angle}
        </p>

        <!-- What to expect -->
        <div style="border-left: 3px solid #000; padding: 14px 16px; margin-bottom: 24px; background: #fff;">
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin-bottom: 10px;">On the call, you'll get:</div>
            <ul style="font-size: 13px; color: #333; line-height: 1.9; padding-left: 18px; margin: 0;">
                <li>Your custom AI readiness scorecard walkthrough</li>
                <li>A pre-built workspace with your tools already loaded</li>
                <li>A 90-day prioritized roadmap specific to your stack</li>
            </ul>
        </div>

        ${emailButton(calLink, "Add to Calendar →")}

        <p style="font-size: 13px; color: #777; margin: 20px 0 0; line-height: 1.5;">See you there,<br><strong>Adam</strong><br>Trackr</p>
    `);

    const resend = getResend();
    await sendWithRetry(() =>
        resend.emails.send({
            from: FROM,
            to: submission.contactEmail,
            subject,
            html,
        })
    );
}

// ── Architect Emails ─────────────────────────────────────────────────────────

export async function sendArchitectApplicationReceived(to: string, firstName: string) {
    if (!process.env.RESEND_API_KEY) return;
    const resend = getResend();
    await sendWithRetry(() =>
        resend.emails.send({
            from: FROM,
            to,
            subject: "Application received — Trackr AI Architect Program",
            html: emailWrapper(`
                <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                    Application received.
                </h1>
                <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 16px;">
                    Hi ${escapeHtml(firstName)},
                </p>
                <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 16px;">
                    Thank you for applying to the Trackr AI Architect Program. We review applications within 48 hours and will follow up with next steps.
                </p>
                <p style="font-size: 13px; color: #777; margin: 20px 0 0; line-height: 1.5;">
                    — The Trackr Team
                </p>
            `),
        })
    );
}

export async function sendArchitectApplicationNotification(applicationId: string, name: string, role: string) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const reviewUrl = `${appUrl}/admin/architects/${applicationId}`;
    const resend = getResend();
    await sendWithRetry(() =>
        resend.emails.send({
            from: FROM,
            to: "adamwolfe102@gmail.com",
            subject: `New Architect Application: ${name} (${role})`,
            html: emailWrapper(`
                <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                    New architect application
                </h1>
                <div style="border: 1px solid #000; padding: 16px; margin-bottom: 20px;">
                    <p style="font-size: 13px; color: #333; margin: 0 0 8px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
                    <p style="font-size: 13px; color: #333; margin: 0;"><strong>Role:</strong> ${escapeHtml(role)}</p>
                </div>
                ${emailButton(reviewUrl, "Review Application")}
            `),
        })
    );
}

export async function sendArchitectApproved(to: string, firstName: string, arcCode: string, onboardingUrl: string) {
    if (!process.env.RESEND_API_KEY) return;
    const resend = getResend();
    await sendWithRetry(() =>
        resend.emails.send({
            from: FROM,
            to,
            subject: "You're approved — Trackr AI Architect Program",
            html: emailWrapper(`
                <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                    Welcome to the program, ${escapeHtml(firstName)}.
                </h1>
                <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 16px;">
                    Your application has been approved. Here's what's next:
                </p>
                <div style="border: 1px solid #000; padding: 16px; margin-bottom: 20px;">
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin: 0 0 8px;">Your Referral Code</p>
                    <p style="font-size: 20px; font-weight: bold; color: #000; letter-spacing: 0.15em; margin: 0;">${escapeHtml(arcCode)}</p>
                </div>
                <div style="border-left: 3px solid #000; padding: 14px 16px; margin-bottom: 24px;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin-bottom: 10px;">Next steps</div>
                    <ol style="font-size: 13px; color: #333; line-height: 1.9; padding-left: 18px; margin: 0;">
                        <li>Sign in to your architect dashboard</li>
                        <li>Complete Stripe Connect setup (to receive payouts)</li>
                        <li>Share your referral link: <a href="https://trytrackr.com/audit?arc=${escapeHtml(arcCode)}" style="color:#000;">trytrackr.com/audit?arc=${escapeHtml(arcCode)}</a></li>
                        <li>When someone you refer becomes a client, earn 20% recurring — forever</li>
                    </ol>
                </div>
                <p style="font-size: 12px; color: #555; line-height: 1.6; margin: 0 0 20px;">
                    Your referral link sends prospects directly to our AI Readiness Audit. Our team handles all calls and onboarding — you earn commission when they close.
                </p>
                ${emailButton(onboardingUrl, "Open Your Dashboard")}
                <p style="font-size: 13px; color: #777; margin: 20px 0 0; line-height: 1.5;">
                    — The Trackr Team
                </p>
            `),
        })
    );
}

export async function sendArchitectRejected(to: string, firstName: string) {
    if (!process.env.RESEND_API_KEY) return;
    const resend = getResend();
    await sendWithRetry(() =>
        resend.emails.send({
            from: FROM,
            to,
            subject: "Architect Program — Application Update",
            html: emailWrapper(`
                <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                    Application update
                </h1>
                <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 16px;">
                    Hi ${escapeHtml(firstName)},
                </p>
                <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 16px;">
                    Thank you for your interest in the Trackr AI Architect Program. After reviewing your application, we're unable to approve it at this time.
                </p>
                <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 16px;">
                    We encourage you to reapply in the future as the program evolves and your experience grows. If you have questions, reply to this email.
                </p>
                <p style="font-size: 13px; color: #777; margin: 20px 0 0; line-height: 1.5;">
                    — The Trackr Team
                </p>
            `),
        })
    );
}

export async function sendArchitectNewLead(to: string, firstName: string, companyName: string, contactEmail: string) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const resend = getResend();
    await sendWithRetry(() =>
        resend.emails.send({
            from: FROM,
            to,
            subject: `New lead: ${companyName}`,
            html: emailWrapper(`
                <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                    You have a new lead.
                </h1>
                <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 16px;">
                    Hi ${escapeHtml(firstName)},
                </p>
                <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 16px;">
                    Someone you referred just completed the AI Readiness Audit. Our team will follow up to qualify them.
                </p>
                <div style="border: 1px solid #000; padding: 16px; margin-bottom: 20px;">
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin: 0 0 4px;">Company</p>
                    <p style="font-size: 14px; font-weight: bold; color: #000; margin: 0 0 12px;">${escapeHtml(companyName)}</p>
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin: 0 0 4px;">Contact</p>
                    <p style="font-size: 13px; color: #333; margin: 0;">${escapeHtml(contactEmail)}</p>
                </div>
                <p style="font-size: 12px; color: #777; line-height: 1.6; margin: 0 0 20px;">
                    If they become a client, you'll earn 20% of their monthly subscription — recurring, forever.
                </p>
                ${emailButton(`${appUrl}/architect/dashboard`, "View Your Dashboard")}
                <p style="font-size: 13px; color: #777; margin: 20px 0 0; line-height: 1.5;">
                    — The Trackr Team
                </p>
            `),
        })
    );
}

export async function sendCommissionEarned(to: string, firstName: string, clientWorkspaceId: string, commissionAmount: number, totalEarnings: number) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const resend = getResend();
    await sendWithRetry(() =>
        resend.emails.send({
            from: FROM,
            to,
            subject: `Commission earned: $${(commissionAmount / 100).toFixed(2)}`,
            html: emailWrapper(`
                <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                    Commission paid.
                </h1>
                <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 16px;">
                    Hi ${escapeHtml(firstName)},
                </p>
                <div style="border: 1px solid #000; padding: 16px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.08em;">This commission</span>
                        <span style="font-size: 18px; font-weight: bold; color: #000;">$${(commissionAmount / 100).toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.08em;">Lifetime earnings</span>
                        <span style="font-size: 14px; color: #333;">$${(totalEarnings / 100).toFixed(2)}</span>
                    </div>
                </div>
                <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 20px;">
                    The funds have been transferred to your Stripe Connect account.
                </p>
                ${emailButton(`${appUrl}/architect/commissions`, "View Commissions")}
                <p style="font-size: 13px; color: #777; margin: 20px 0 0; line-height: 1.5;">
                    — The Trackr Team
                </p>
            `),
        })
    );
}
