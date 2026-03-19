"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { literacySurveys, literacyResponses } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireWorkspaceMember } from "@/lib/middleware/require-workspace-member";
import { DEFAULT_SURVEYS } from "@/lib/config/default-surveys";
import type { SurveyQuestion } from "@/lib/config/default-surveys";

// ── Types ────────────────────────────────────────────────────────

type CreateSurveyInput = {
    title: string;
    description?: string;
    questions: SurveyQuestion[];
    createdBy: string;
};

type SubmitResponseInput = {
    respondentId: string;
    respondentName?: string;
    answers: Record<string, string | number>;
};

// ── Create Survey ────────────────────────────────────────────────

export async function createSurvey(workspaceId: string, data: CreateSurveyInput) {
    await requireWorkspaceMember(workspaceId);
    const [survey] = await db
        .insert(literacySurveys)
        .values({
            workspaceId,
            title: data.title,
            description: data.description ?? null,
            questions: data.questions,
            status: "draft",
            createdBy: data.createdBy,
        })
        .returning();

    revalidatePath("/literacy");
    return survey;
}

// ── Create Survey From Template ──────────────────────────────────

export async function createSurveyFromTemplate(
    workspaceId: string,
    templateIndex: number,
    createdBy: string
) {
    await requireWorkspaceMember(workspaceId);
    const template = DEFAULT_SURVEYS[templateIndex];
    if (!template) {
        throw new Error("Invalid template index");
    }

    return createSurvey(workspaceId, {
        title: template.title,
        description: template.description,
        questions: template.questions,
        createdBy,
    });
}

// ── Activate Survey ──────────────────────────────────────────────

export async function activateSurvey(surveyId: string, workspaceId: string) {
    await requireWorkspaceMember(workspaceId);
    const [updated] = await db
        .update(literacySurveys)
        .set({ status: "active" })
        .where(
            and(
                eq(literacySurveys.id, surveyId),
                eq(literacySurveys.workspaceId, workspaceId)
            )
        )
        .returning();

    revalidatePath("/literacy");
    return updated;
}

// ── Close Survey ─────────────────────────────────────────────────

export async function closeSurvey(surveyId: string, workspaceId: string) {
    await requireWorkspaceMember(workspaceId);
    const [updated] = await db
        .update(literacySurveys)
        .set({
            status: "closed",
            closedAt: new Date(),
        })
        .where(
            and(
                eq(literacySurveys.id, surveyId),
                eq(literacySurveys.workspaceId, workspaceId)
            )
        )
        .returning();

    revalidatePath("/literacy");
    return updated;
}

// ── Submit Response ──────────────────────────────────────────────

export async function submitResponse(surveyId: string, data: SubmitResponseInput) {
    // Fetch survey to access questions for score computation
    const survey = await db.query.literacySurveys.findFirst({
        where: eq(literacySurveys.id, surveyId),
    });

    if (!survey || survey.status !== "active") {
        throw new Error("Survey not found or not active");
    }

    // Auth: verify caller is a member of the survey's workspace
    await requireWorkspaceMember(survey.workspaceId);

    // Compute score from rating-type answers (1-10 scale, normalized to 0-100)
    const questions = survey.questions as SurveyQuestion[];
    const ratingQuestions = questions.filter((q) => q.type === "rating");
    let score: number | null = null;

    if (ratingQuestions.length > 0) {
        const totalRating = ratingQuestions.reduce((sum, q) => {
            const answer = Number(data.answers[q.id]) || 0;
            return sum + answer;
        }, 0);
        const maxPossible = ratingQuestions.length * 10;
        score = Math.round((totalRating / maxPossible) * 100);
    }

    const [response] = await db
        .insert(literacyResponses)
        .values({
            surveyId,
            respondentId: data.respondentId,
            respondentName: data.respondentName ?? null,
            answers: data.answers,
            score,
        })
        .returning();

    revalidatePath("/literacy");
    return response;
}

// ── Get Survey Results ───────────────────────────────────────────

export async function getSurveyResults(surveyId: string, workspaceId: string) {
    await requireWorkspaceMember(workspaceId);
    const survey = await db.query.literacySurveys.findFirst({
        where: and(
            eq(literacySurveys.id, surveyId),
            eq(literacySurveys.workspaceId, workspaceId)
        ),
        with: {
            responses: true,
        },
    });

    if (!survey) return null;

    const questions = survey.questions as SurveyQuestion[];
    const responses = survey.responses;

    // Compute per-question averages for rating questions
    const questionAverages: Record<string, number> = {};
    // Compute response distributions for multiple choice questions
    const questionDistributions: Record<string, Record<string, number>> = {};

    for (const q of questions) {
        if (q.type === "rating") {
            const values = responses
                .map((r) => Number((r.answers as Record<string, string | number>)[q.id]))
                .filter((v) => !isNaN(v) && v > 0);
            questionAverages[q.id] =
                values.length > 0
                    ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
                    : 0;
        } else if (q.type === "multiple_choice") {
            const dist: Record<string, number> = {};
            for (const r of responses) {
                const answer = String((r.answers as Record<string, string | number>)[q.id] ?? "");
                if (answer) {
                    dist[answer] = (dist[answer] ?? 0) + 1;
                }
            }
            questionDistributions[q.id] = dist;
        }
    }

    // Overall average score
    const scores = responses
        .map((r) => r.score)
        .filter((s): s is number => s !== null);
    const averageScore =
        scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

    return {
        survey,
        responses,
        questionAverages,
        questionDistributions,
        averageScore,
        responseCount: responses.length,
    };
}

// ── List Surveys ─────────────────────────────────────────────────

export async function listSurveys(workspaceId: string) {
    await requireWorkspaceMember(workspaceId);
    return db.query.literacySurveys.findMany({
        where: eq(literacySurveys.workspaceId, workspaceId),
        with: {
            responses: {
                columns: { id: true, score: true },
            },
        },
        orderBy: [desc(literacySurveys.createdAt)],
    });
}

// ── Get Team Literacy Trend ──────────────────────────────────────

export async function getTeamLiteracyTrend(workspaceId: string) {
    await requireWorkspaceMember(workspaceId);
    const surveys = await db.query.literacySurveys.findMany({
        where: and(
            eq(literacySurveys.workspaceId, workspaceId),
            eq(literacySurveys.status, "closed")
        ),
        with: {
            responses: {
                columns: { score: true, completedAt: true },
            },
        },
        orderBy: [desc(literacySurveys.closedAt)],
    });

    return surveys.map((s) => {
        const scores = s.responses
            .map((r) => r.score)
            .filter((v): v is number => v !== null);
        const avg =
            scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 0;
        return {
            surveyId: s.id,
            title: s.title,
            closedAt: s.closedAt,
            averageScore: avg,
            responseCount: s.responses.length,
        };
    });
}
