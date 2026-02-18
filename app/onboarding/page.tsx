"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { processOnboarding } from "@/lib/actions/onboarding";
import { toast } from "sonner";

const PROCESSING_STEPS = [
    "Deploying Firecrawl agent...",
    "Scraping website content...",
    "Analyzing business context with GPT-4o...",
    "Building your custom scorecard...",
    "Finalizing workspace setup...",
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<"input" | "processing" | "complete">("input");
    const [url, setUrl] = useState("");
    const [loadingIndex, setLoadingIndex] = useState(0);
    const [error, setError] = useState("");

    useEffect(() => {
        if (step !== "processing") return;
        const interval = setInterval(() => {
            setLoadingIndex((i) => Math.min(i + 1, PROCESSING_STEPS.length - 1));
        }, 2500);
        return () => clearInterval(interval);
    }, [step]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const trimmedUrl = url.trim();
        if (!trimmedUrl) return;

        try {
            new URL(trimmedUrl);
        } catch {
            setError("Please enter a valid URL including https://");
            return;
        }

        setStep("processing");
        setLoadingIndex(0);

        try {
            await processOnboarding(trimmedUrl);
            setStep("complete");
            setTimeout(() => router.push("/tools"), 1500);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Setup failed. Please try again.";
            toast.error(message);
            setStep("input");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F3EF] px-6">
            {/* Logo */}
            <div className="mb-16">
                <span className="text-3xl font-serif font-medium">Trackr</span>
            </div>

            <div className="w-full max-w-md">
                {step === "input" && (
                    <div>
                        <span className="text-xs font-mono uppercase tracking-widest text-[#8B9A7F] mb-4 block">
                            Step 1 of 1
                        </span>
                        <h1 className="text-3xl font-serif font-normal mb-3 leading-tight">
                            Set up your workspace.
                        </h1>
                        <p className="font-mono text-sm text-neutral-600 mb-10 leading-relaxed">
                            Enter your company website URL. Trackr's agents will scrape it, understand your business context, and build a custom AI scorecard tailored to your evaluation needs.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="url"
                                    placeholder="https://yourcompany.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                    className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-neutral-400"
                                />
                                {error && (
                                    <p className="text-xs font-mono text-red-600 mt-2">{error}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-black text-white px-6 py-3 font-mono text-sm uppercase tracking-wide hover:bg-neutral-800 transition-colors border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                                Generate Workspace
                            </button>
                        </form>

                        <p className="font-mono text-xs text-neutral-400 mt-6 text-center">
                            Takes about 10–15 seconds. No credit card needed.
                        </p>
                    </div>
                )}

                {step === "processing" && (
                    <div className="text-center">
                        <div className="w-12 h-12 border border-black bg-white flex items-center justify-center mb-8 mx-auto shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-serif font-normal mb-3">Agent working...</h2>
                        <p className="font-mono text-sm text-neutral-600 mb-8 animate-pulse">
                            {PROCESSING_STEPS[loadingIndex]}
                        </p>

                        {/* Progress dots */}
                        <div className="flex justify-center gap-2">
                            {PROCESSING_STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 transition-all duration-500 ${i <= loadingIndex ? "w-6 bg-black" : "w-1.5 bg-neutral-300"}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {step === "complete" && (
                    <div className="text-center">
                        <div className="w-12 h-12 border border-black bg-white flex items-center justify-center mb-8 mx-auto shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <CheckCircle className="w-5 h-5 text-[#8B9A7F]" />
                        </div>
                        <h2 className="text-2xl font-serif font-normal mb-3">Workspace ready.</h2>
                        <p className="font-mono text-sm text-neutral-500">
                            Redirecting to your dashboard...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
