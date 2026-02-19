import { Resend } from "resend";

const FROM = "Trackr <noreply@trytrackr.com>";

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
    await getResend().emails.send({
        from: FROM,
        to,
        subject: "Welcome to Trackr",
        html: emailWrapper(`
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                Welcome, ${firstName}.
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
    });
}

export async function sendInviteEmail(
    to: string,
    workspaceName: string,
    inviterName?: string
) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    const invitedBy = inviterName ? ` by ${inviterName}` : "";
    await getResend().emails.send({
        from: FROM,
        to,
        subject: `You've been invited to ${workspaceName} on Trackr`,
        html: emailWrapper(`
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Workspace Invitation</p>
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
                Join ${workspaceName}
            </h1>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 8px;">
                You've been invited${invitedBy} to collaborate on <strong>${workspaceName}</strong>'s software research workspace.
            </p>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
                Trackr helps teams evaluate SaaS tools with AI-powered research, scoring, and spend tracking.
            </p>
            ${emailButton(`${appUrl}/sign-up`, "Accept Invitation →")}
        `),
    });
}

export async function sendResearchCompleteEmail(
    to: string,
    toolName: string,
    toolId: string,
    score: number
) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    await getResend().emails.send({
        from: FROM,
        to,
        subject: `Research complete: ${toolName} (${score.toFixed(1)}/10)`,
        html: emailWrapper(`
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Research Complete</p>
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 8px;">${toolName}</h1>
            <div style="font-size: 40px; font-family: Georgia, 'Newsreader', serif; margin: 16px 0;">${score.toFixed(1)}<span style="font-size: 18px; color: #999;">/10</span></div>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
                Your research report is ready. Open it to see the full scorecard, pros/cons, competitor analysis, and pricing breakdown.
            </p>
            ${emailButton(`${appUrl}/tools/${toolId}`, "View Report →")}
        `),
    });
}

export async function sendResearchFailedEmail(
    to: string,
    toolName: string,
    toolId: string,
    errorMessage: string
) {
    if (!process.env.RESEND_API_KEY) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com";
    await getResend().emails.send({
        from: FROM,
        to,
        subject: `Research failed: ${toolName}`,
        html: emailWrapper(`
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Research Failed</p>
            <h1 style="font-family: Georgia, 'Newsreader', serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">${toolName}</h1>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 8px;">Something went wrong during research:</p>
            <p style="font-size: 12px; color: #C0392B; background: #fff; padding: 8px 12px; margin: 0 0 24px; border: 1px solid #C0392B;">${errorMessage}</p>
            ${emailButton(`${appUrl}/tools/${toolId}`, "Retry Research →")}
        `),
    });
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
            <td style="padding: 8px; font-size: 13px; border-bottom: 1px solid #D0D0CC;">${t.name}</td>
            <td style="padding: 8px; font-size: 13px; text-align: right; border-bottom: 1px solid #D0D0CC;">${date}</td>
            <td style="padding: 8px; font-size: 13px; text-align: right; border-bottom: 1px solid #D0D0CC;">${cost}</td>
        </tr>`;
    }).join("");

    await getResend().emails.send({
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
    });
}
