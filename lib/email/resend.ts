import { Resend } from "resend";

const FROM = "Trackr <noreply@trytrackr.com>";

function getResend() {
    return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

export async function sendWelcomeEmail(to: string, firstName: string) {
    if (!process.env.RESEND_API_KEY) return;
    await getResend().emails.send({
        from: FROM,
        to,
        subject: "Welcome to Trackr",
        html: `
            <div style="font-family: monospace; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #000;">
                <h1 style="font-family: Georgia, serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">
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
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/tools" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none;">
                    Open Trackr →
                </a>
            </div>
        `,
    });
}

export async function sendResearchCompleteEmail(
    to: string,
    toolName: string,
    toolId: string,
    score: number
) {
    if (!process.env.RESEND_API_KEY) return;
    await getResend().emails.send({
        from: FROM,
        to,
        subject: `Research complete: ${toolName} (${score.toFixed(1)}/10)`,
        html: `
            <div style="font-family: monospace; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #000;">
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Research Complete</p>
                <h1 style="font-family: Georgia, serif; font-weight: normal; font-size: 24px; margin: 0 0 8px;">${toolName}</h1>
                <div style="font-size: 40px; font-family: Georgia, serif; margin: 16px 0;">${score.toFixed(1)}<span style="font-size: 18px; color: #999;">/10</span></div>
                <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 24px;">
                    Your research report is ready. Open it to see the full scorecard, pros/cons, competitor analysis, and pricing breakdown.
                </p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/tools/${toolId}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none;">
                    View Report →
                </a>
            </div>
        `,
    });
}

export async function sendResearchFailedEmail(
    to: string,
    toolName: string,
    toolId: string,
    errorMessage: string
) {
    if (!process.env.RESEND_API_KEY) return;
    await getResend().emails.send({
        from: FROM,
        to,
        subject: `Research failed: ${toolName}`,
        html: `
            <div style="font-family: monospace; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #000;">
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Research Failed</p>
                <h1 style="font-family: Georgia, serif; font-weight: normal; font-size: 24px; margin: 0 0 16px;">${toolName}</h1>
                <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0 0 8px;">Something went wrong during research:</p>
                <p style="font-size: 12px; color: #c00; background: #fff5f5; padding: 8px; margin: 0 0 24px; border: 1px solid #fcc;">${errorMessage}</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/tools/${toolId}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none;">
                    Retry Research →
                </a>
            </div>
        `,
    });
}
