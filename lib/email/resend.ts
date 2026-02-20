import { Resend } from "resend";

const FROM = "Trackr <noreply@trytrackr.com>";
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
    inviterName?: string
) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const resend = getResend();
    const invitedBy = inviterName ? ` by ${escapeHtml(inviterName)}` : "";
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
            ${emailButton(`${appUrl}/sign-up`, "Accept Invitation →")}
        `),
    }));
}

export async function sendResearchCompleteEmail(
    to: string,
    toolName: string,
    toolId: string,
    score: number
) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const resend = getResend();
    await sendWithRetry(() => resend.emails.send({
        from: FROM,
        to,
        subject: `Research complete: ${escapeHtml(toolName)} (${score.toFixed(1)}/10)`,
        html: emailWrapper(`
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Research Complete</p>
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 8px;">${escapeHtml(toolName)}</h1>
            <div style="font-size: 40px; font-family: Georgia, 'Newsreader', serif; margin: 16px 0;">${score.toFixed(1)}<span style="font-size: 18px; color: #999;">/10</span></div>
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

    // D+1: Have you seen your first report?
    resend.emails.send({
        from: FROM,
        to,
        subject: `${firstName}, your first Trackr report is waiting`,
        scheduledAt: d1,
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
    }).catch(() => {});

    // D+3: Credits awareness
    resend.emails.send({
        from: FROM,
        to,
        subject: "Here's how Trackr teams save hours every week",
        scheduledAt: d3,
        html: emailWrapper(`
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Day 3 — Team Tip</p>
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                The typical team evaluates 10-15 tools per quarter.
            </h1>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">
                That's 40-60 hours of research time — reading landing pages, comparing G2 reviews, building spreadsheets. Trackr reduces it to <strong>under 2 minutes per tool</strong>.
            </p>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
                Your free plan includes 3 research runs per month. If you need more, each extra credit costs $2 — or upgrade to Pro for 20 runs/month.
            </p>
            ${emailButton(`${appUrl}/tools`, "View Your Research →")}
        `),
    }).catch(() => {});

    // D+7: Upgrade CTA with specific value props
    resend.emails.send({
        from: FROM,
        to,
        subject: "Is Trackr saving you time?",
        scheduledAt: d7,
        html: emailWrapper(`
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Day 7 — Check-in</p>
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                A week in — how's it going?
            </h1>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 16px;">
                Teams that use Trackr Pro can:
            </p>
            <ul style="font-size: 13px; color: #333; line-height: 2; padding-left: 20px; margin: 0 0 24px;">
                <li>Run 20 research reports per month</li>
                <li>Invite teammates to share a workspace</li>
                <li>Get Slack notifications when research completes</li>
                <li>Export reports to PDF for stakeholder reviews</li>
                <li>Track monthly SaaS spend across all tools</li>
            </ul>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
                Pro is $49/month. That's less than the cost of one hour of manual research time.
            </p>
            ${emailButton(`${appUrl}/pricing`, "Upgrade to Pro →")}
        `),
    }).catch(() => {});
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
