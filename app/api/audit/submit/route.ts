/**
 * POST /api/audit/submit
 *
 * Public endpoint — no auth required.
 * Accepts /audit form data, persists it, then kicks off the scorecard
 * pipeline in the background via after().
 */

import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { db } from "@/lib/db";
import { auditSubmissions } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { processAuditSubmission } from "@/lib/actions/audit";
import { captureEvent } from "@/lib/analytics/posthog-server";
import { z } from "zod";

const AuditSubmitSchema = z.object({
    contactEmail: z.string().email(),
    contactName: z.string().optional(),
    callOwnerEmail: z.string().email().optional(),
    companyName: z.string().min(1),
    companyWebsite: z.string().optional(),
    industry: z.string().optional(),
    companySize: z.string().optional(),
    role: z.string().optional(),
    revenue: z.string().optional(),
    aiToolCount: z.string().optional(),
    dailyAdoptionPct: z.string().optional(),
    hasAIManager: z.string().optional(),
    monthlySpend: z.string().optional(),
    biggestBottleneck: z.string().optional(),
    teamsNeedingAI: z.array(z.string()).optional(),
    failedAI: z.string().optional(),
    successDefinition: z.string().optional(),
    currentTools: z.array(z.string()).optional(),
    toolFrustrations: z.string().optional(),
    manualProcesses: z.string().optional(),
    arcCode: z.string().optional(),
    employeeCount: z.string().optional(),
});

export async function POST(req: NextRequest) {
    // Rate limit: 5 submissions per IP per hour
    // Use the rightmost (most trustworthy) IP from x-forwarded-for to prevent spoofing
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded
        ? (forwarded.split(",").pop()?.trim() ?? "unknown")
        : (req.headers.get("x-real-ip") ?? "unknown");
    const rl = await rateLimit(`audit-submit:${ip}`, { limit: 5, windowSeconds: 3600 });
    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
        );
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = AuditSubmitSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid form data: " + parsed.error.issues[0]?.message },
            { status: 400 }
        );
    }

    const data = parsed.data;

    // Deduplicate: same email within 24 hours → return existing submission
    const recentCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await db.query.auditSubmissions.findFirst({
        where: and(
            eq(auditSubmissions.contactEmail, data.contactEmail),
            gte(auditSubmissions.createdAt, recentCutoff),
        ),
        columns: { id: true },
    });
    if (existing) {
        return NextResponse.json({ success: true, id: existing.id });
    }

    const [submission] = await db
        .insert(auditSubmissions)
        .values({
            contactEmail: data.contactEmail,
            contactName: data.contactName ?? "unknown",
            callOwnerEmail: data.callOwnerEmail ?? null,
            companyName: data.companyName,
            companyWebsite: data.companyWebsite ?? null,
            industry: data.industry ?? null,
            companySize: data.companySize ?? null,
            role: data.role ?? null,
            revenue: data.revenue ?? null,
            aiToolCount: data.aiToolCount ?? null,
            dailyAdoptionPct: data.dailyAdoptionPct ?? null,
            hasAIManager: data.hasAIManager ?? null,
            monthlySpend: data.monthlySpend ?? null,
            biggestBottleneck: data.biggestBottleneck ?? null,
            teamsNeedingAI: data.teamsNeedingAI ?? [],
            failedAI: data.failedAI ?? null,
            successDefinition: data.successDefinition ?? null,
            currentTools: data.currentTools ?? [],
            toolFrustrations: data.toolFrustrations ?? null,
            manualProcesses: data.manualProcesses ?? null,
            arcCode: data.arcCode ?? null,
            employeeCount: data.employeeCount ?? null,
            status: "pending",
        })
        .returning();

    // Process scorecard in background — survives request timeout
    after(async () => {
        try {
            await processAuditSubmission(submission.id);
        } catch (err) {
            Sentry.captureException(err);
        }
    });

    // Track audit submission (email = distinct_id for anonymous leads)
    after(async () => {
        await captureEvent(data.contactEmail, "audit_submitted", {
            company_name: data.companyName,
            company_size: data.companySize ?? null,
            industry: data.industry ?? null,
            role: data.role ?? null,
            monthly_spend: data.monthlySpend ?? null,
            ai_tool_count: data.aiToolCount ?? null,
            submission_id: submission.id,
        });
    });

    return NextResponse.json({ success: true, id: submission.id });
}
