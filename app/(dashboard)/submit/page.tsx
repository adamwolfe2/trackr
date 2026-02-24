import type { Metadata } from "next";
import { AddToolWizard } from "@/components/tools/add-tool-wizard";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // allow after() to run research pipeline (~2-5 min) before Vercel kills function

export const metadata: Metadata = {
    title: "Submit Tool — Trackr",
    description: "Submit a new tool for AI-powered research.",
};

export default function SubmitPage() {
    return (
        <div className="max-w-2xl mx-auto animate-fade-in-up py-10">
            <AddToolWizard />
        </div>
    );
}
