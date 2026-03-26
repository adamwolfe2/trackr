import { db } from "@/lib/db";
import { auditSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const sub = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.publicSlug, slug),
        columns: { companyName: true, scorecard: true },
    });
    if (!sub) return { title: "Scorecard — Trackr" };
    const sc = sub.scorecard as { aiNativeScore?: { score?: number } } | null;
    const score = sc?.aiNativeScore?.score;
    return {
        title: `AI Readiness Scorecard — ${sub.companyName}`,
        description: `AI Readiness Assessment for ${sub.companyName}${score != null ? `. Score: ${score}/100.` : ""}`,
    };
}

export default async function ScorecardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const submission = await db.query.auditSubmissions.findFirst({
        where: eq(auditSubmissions.publicSlug, slug),
        columns: { shareToken: true },
    });
    if (!submission?.shareToken) notFound();
    redirect(`/audit/share/${submission.shareToken}`);
}
