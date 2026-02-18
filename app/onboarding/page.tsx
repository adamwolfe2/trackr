"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, CheckCircle, Globe } from "lucide-react";
import { processOnboarding } from "@/lib/actions/onboarding";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<"input" | "processing" | "complete">("input");
    const [url, setUrl] = useState("");
    const [loadingText, setLoadingText] = useState("Initializing...");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setStep("processing");

        try {
            // Simulate stages for better UX (the server action usually takes 5-10s)
            setLoadingText("Deploying Firecrawl Agent...");
            setTimeout(() => setLoadingText("Scraping website content..."), 2000);
            setTimeout(() => setLoadingText("Analyzing business context..."), 5000);
            setTimeout(() => setLoadingText("Building custom scorecard..."), 8000);

            await processOnboarding(url);

            setStep("complete");
            setTimeout(() => router.push("/dashboard"), 1500);
        } catch (error) {
            console.error(error);
            setStep("input"); // Reset on error
            // In a real app, show error toast
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <Card className="max-w-md w-full shadow-xl border-zinc-200 dark:border-zinc-800">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-white dark:text-zinc-900" />
                    </div>
                    <CardTitle className="text-2xl">Setup your Workspace</CardTitle>
                    <CardDescription>
                        Enter your company URL. We'll use AI to build a custom scorecard for your tools.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AnimatePresence mode="wait">
                        {step === "input" && (
                            <motion.form
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="https://example.com"
                                        className="pl-9 h-11"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        required
                                        type="url"
                                    />
                                </div>
                                <Button type="submit" className="w-full h-11 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
                                    Generate Workspace
                                </Button>
                            </motion.form>
                        )}

                        {step === "processing" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="flex flex-col items-center justify-center py-8 space-y-4"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                                    <Loader2 className="w-12 h-12 animate-spin text-emerald-500 relative z-10" />
                                </div>
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 animate-pulse">
                                    {loadingText}
                                </p>
                            </motion.div>
                        )}

                        {step === "complete" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-8 space-y-4"
                            >
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">Workspace Ready!</h3>
                                    <p className="text-sm text-zinc-500">Redirecting to dashboard...</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}
