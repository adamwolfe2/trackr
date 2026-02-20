"use server";

import { z } from "zod";
import { Resend } from "resend";

const contactSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Valid email is required"),
    type: z.enum(["general", "sales", "support"]),
    message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export async function submitContactForm(formData: {
    name: string;
    email: string;
    type: "general" | "sales" | "support";
    message: string;
}): Promise<{ success: boolean; error?: string }> {
    const parsed = contactSchema.safeParse(formData);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const { name, email, type, message } = parsed.data;

    const typeLabel = { general: "General Inquiry", sales: "Sales / Enterprise", support: "Support" }[type];

    try {
        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
                from: "Trackr Contact <noreply@trytrackr.com>",
                to: "hello@trytrackr.com",
                replyTo: email,
                subject: `[${typeLabel}] Contact form from ${name}`,
                html: `
                    <div style="font-family: monospace; max-width: 480px; padding: 24px; border: 2px solid #000;">
                        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 8px;">Contact Form Submission</p>
                        <h2 style="font-family: Georgia, serif; font-weight: normal; margin: 0 0 16px;">${typeLabel}</h2>
                        <table style="font-size: 13px; line-height: 1.8;">
                            <tr><td style="color: #999; padding-right: 12px;">Name</td><td>${name}</td></tr>
                            <tr><td style="color: #999; padding-right: 12px;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
                            <tr><td style="color: #999; padding-right: 12px;">Type</td><td>${typeLabel}</td></tr>
                        </table>
                        <div style="margin-top: 16px; padding: 12px; background: #F3F3EF; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
                    </div>
                `,
            });
        }

        return { success: true };
    } catch {
        return { success: false, error: "Failed to send message. Please email hello@trytrackr.com directly." };
    }
}
