"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function InteractiveDemo() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        // Simulate a brief delay for effect, then redirect to signup with query
        setTimeout(() => {
            router.push(`/sign-up?demo_query=${encodeURIComponent(query)}`);
        }, 800);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 p-2 shadow-2xl">
            <form onSubmit={handleSearch} className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask Trackr: 'Find me a HIPAA-compliant CRM under $50/mo'..."
                    className="w-full h-14 pl-12 pr-32 bg-transparent border-none text-lg focus-visible:ring-0 placeholder:text-zinc-400"
                />
                <div className="absolute right-2">
                    <Button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Try it</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        )}
                    </Button>
                </div>
            </form>

            {/* Examples */}
            <div className="flex gap-2 mt-2 px-2 pb-1 overflow-x-auto scrollbar-hide">
                {["CRM for agency", "Email marketing tool", "Project management"].map((example) => (
                    <button
                        key={example}
                        type="button"
                        onClick={() => setQuery(example)}
                        className="text-xs px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap"
                    >
                        {example}
                    </button>
                ))}
            </div>
        </div>
    );
}
