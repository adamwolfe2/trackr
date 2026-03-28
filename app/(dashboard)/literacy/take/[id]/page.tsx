export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { literacySurveys, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SurveyForm } from "@/components/literacy/survey-form";
import type { SurveyQuestion } from "@/lib/config/default-surveys";

export const metadata: Metadata = {
    title: "Take Survey",
    description: "Complete a team AI literacy survey.",
};

export default async function TakeSurveyPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });
    if (!member) redirect("/onboarding");

    // Fetch survey
    const survey = await db.query.literacySurveys.findFirst({
        where: eq(literacySurveys.id, id),
    });

    if (!survey) notFound();

    // Verify survey belongs to user's workspace
    if (survey.workspaceId !== member.workspaceId) notFound();

    // Verify survey is active
    if (survey.status !== "active") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-full max-w-md border border-black p-8 text-center bg-white">
                    <h2 className="text-2xl font-serif font-normal mb-3">Survey Not Available</h2>
                    <p className="font-mono text-sm text-neutral-500 leading-relaxed mb-6">
                        {survey.status === "draft"
                            ? "This survey has not been activated yet."
                            : "This survey has been closed and is no longer accepting responses."}
                    </p>
                    <a
                        href="/literacy"
                        className="inline-block border border-black bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                    >
                        Back to Surveys
                    </a>
                </div>
            </div>
        );
    }

    const questions = survey.questions as SurveyQuestion[];

    return (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-normal">{survey.title}</h1>
                {survey.description && (
                    <p className="font-mono text-sm text-neutral-500 mt-2">{survey.description}</p>
                )}
            </div>
            <SurveyForm
                surveyId={survey.id}
                questions={questions}
                respondentId={user.id}
                respondentName={user.firstName ?? user.emailAddresses?.[0]?.emailAddress ?? "Anonymous"}
            />
        </div>
    );
}
