"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, ArrowUpRight, Sparkles, Database } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock action for demo purposes if the real one isn't linked yet
// In real implementation, this would import from @/lib/actions/search
const mockSearch = async (query: string) => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay
    // Return different results based on query to make it feel "real"
    if (query.toLowerCase().includes("video")) {
        return {
            results: [
                { id: "1", name: "Runway", description: "Generative video AI.", status: "active", overallScore: "9.5", websiteUrl: "https://runwayml.com" },
                { id: "2", name: "Descript", description: "Video editing as easy as a doc.", status: "active", overallScore: "9.2", websiteUrl: "https://descript.com" },
                { id: "3", name: "Synthesia", description: "AI video generation platform.", status: "researching", overallScore: "8.9", websiteUrl: "https://synthesia.io" },
            ],
            duration: 640
        };
    }
    return {
        results: [
            {
                id: "1",
                name: "Jasper",
                websiteUrl: "https://jasper.ai",
                description: "AI copywriter for marketing teams.",
                status: "active",
                overallScore: "9.2",
            },
            {
                id: "2",
                name: "Copy.ai",
                websiteUrl: "https://copy.ai",
                description: "Marketing copy generator.",
                status: "researching",
                overallScore: "8.8",
            },
            {
                id: "3",
                name: "Midjourney",
                websiteUrl: "https://midjourney.com",
                description: "AI image generator.",
                status: "active",
                overallScore: "9.5",
            }
        ],
        duration: 800
    };
};

export function HeroDemo() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isPending, startTransition] = useTransition();
    const [duration, setDuration] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        startTransition(async () => {
            const { results, duration } = await mockSearch(query);
            setResults(results);
            setDuration(duration);
            setHasSearched(true);
        });
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Search Input */}
            <div className="relative group hover-lift">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <form onSubmit={handleSearch} className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 shadow-xl shadow-zinc-200/50 dark:shadow-none transition-all">
                    <Search className="w-5 h-5 text-zinc-400 ml-3" />
                    <input
                        type="text"
                        className="w-full bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium h-12 px-3 text-lg outline-none"
                        placeholder="Ask Trackr... e.g. 'Best AI for legal contracts'"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
                    </button>
                </form>
            </div>

            {/* Stats */}
            <div className="h-6 mt-3 px-2 flex justify-end">
                {hasSearched && !isPending && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <Database className="w-3 h-3" />
                        found {results.length} results in {duration}ms
                    </motion.div>
                )}
            </div>

            {/* Results Grid */}
            <div className="mt-2 space-y-3 min-h-[300px]">
                <AnimatePresence mode="popLayout">
                    {isPending ? (
                        [1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="h-24 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 animate-pulse"
                            />
                        ))
                    ) : results.length > 0 ? (
                        results.map((tool, i) => (
                            <motion.div
                                key={tool.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 rounded-xl p-4 transition-all duration-300 flex items-start justify-between shadow-sm hover:shadow-md hover:-translate-y-1"
                            >
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-all">
                                        {tool.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-zinc-900 dark:text-white font-semibold flex items-center gap-2 text-lg">
                                            {tool.name}
                                            {tool.overallScore && (
                                                <span className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                                                    {tool.overallScore}
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-zinc-500 text-sm">{tool.description}</p>
                                    </div>
                                </div>
                                <a
                                    href={tool.websiteUrl || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                    <ArrowUpRight className="w-5 h-5" />
                                </a>
                            </motion.div>
                        ))
                    ) : hasSearched ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-zinc-500">
                            No AI tools found. Try searching for "marketing".
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}
