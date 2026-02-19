"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createAdCampaign } from "@/lib/actions/ads";
import { toast } from "sonner";
import type { InferSelectModel } from "drizzle-orm";
import type { tools } from "@/lib/db/schema";

interface CreateAdFormProps {
    tools: InferSelectModel<typeof tools>[];
    workspaceId: string;
}

export function CreateAdForm({ tools, workspaceId }: CreateAdFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTool, setSelectedTool] = useState<string>("");
    const [budget, setBudget] = useState<number>(50); // Default $50

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTool) return toast.error("Please select a tool");
        if (budget < 10) return toast.error("Minimum budget is $10");

        setIsLoading(true);
        try {
            const { url } = await createAdCampaign(workspaceId, selectedTool, budget);
            if (url) {
                window.location.href = url;
            } else {
                toast.error("Failed to create checkout session");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wide text-neutral-500 block">
                    Select Tool
                </label>
                <select
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                    className="w-full border border-black px-3 py-2.5 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                    <option value="">Select a tool to promote...</option>
                    {tools.map((tool) => (
                        <option key={tool.id} value={tool.id}>
                            {tool.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="budget" className="text-xs font-mono uppercase tracking-wide text-neutral-500 block">
                    Campaign Budget ($)
                </label>
                <input
                    id="budget"
                    type="number"
                    min="10"
                    step="5"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full border border-black px-3 py-2.5 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs font-mono text-neutral-500">
                    Estimated {(budget / 0.5).toFixed(0)} clicks at $0.50 CPC.
                </p>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-black text-white border border-black px-4 py-3 font-mono text-sm uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Checkout with Stripe
            </button>
        </form>
    );
}
