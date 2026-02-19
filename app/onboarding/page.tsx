"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, Sparkles, ArrowRight, RefreshCw, Search, X, PlusCircle } from "lucide-react";
import { generateCompanyContext, completeOnboarding } from "@/lib/actions/onboarding";
import { INTEGRATIONS, INTEGRATION_CATEGORIES, DEFAULT_SCORECARD_DIMENSIONS, getLogoUrl } from "@/lib/constants/integrations";
import { classifyTool } from "@/lib/config/ai-tools";
import { TrackrLogo } from "@/components/common/trackr-logo";
import { toast } from "sonner";

type Step = 1 | 2 | 3;
type Dimension = { key: string; label: string; weight: number };

export default function OnboardingPage() {
    const [step, setStep] = useState<Step>(1);
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan") ?? "";

    // Step 1
    const [companyName, setCompanyName] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [companyContext, setCompanyContext] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Step 2
    const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [toolSearch, setToolSearch] = useState("");
    const [customTools, setCustomTools] = useState<string[]>([]);

    // Step 3
    const [dimensions, setDimensions] = useState<Dimension[]>(DEFAULT_SCORECARD_DIMENSIONS);

    const categories = ["All", ...INTEGRATION_CATEGORIES];
    const categoryFiltered = activeCategory === "All"
        ? INTEGRATIONS
        : INTEGRATIONS.filter((i) => i.category === activeCategory);

    const query = toolSearch.trim().toLowerCase();
    const searchResults = query.length > 0
        ? INTEGRATIONS.filter((i) => i.name.toLowerCase().includes(query))
        : null; // null = use category filter

    const visibleIntegrations = searchResults ?? categoryFiltered;

    const exactMatchExists = query.length > 0 &&
        (INTEGRATIONS.some((i) => i.name.toLowerCase() === query) ||
         customTools.some((t) => t.toLowerCase() === query));
    const showAddManually = query.length >= 2 && !exactMatchExists;

    const toggleTool = (name: string) => {
        setSelectedTools((prev) => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
    };

    const addCustomTool = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        if (!customTools.includes(trimmed)) setCustomTools((prev) => [...prev, trimmed]);
        setSelectedTools((prev) => { const next = new Set(prev); next.add(trimmed); return next; });
        setToolSearch("");
    };

    const handleGenerateContext = async () => {
        if (!websiteUrl) return;
        setIsGenerating(true);
        try {
            const url = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
            const result = await generateCompanyContext(url);
            if (result.error) {
                toast.error("Could not scrape site — enter context manually.");
            } else {
                setCompanyContext(result.context);
                toast.success("Company context generated.");
            }
        } catch {
            toast.error("Failed to generate context.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleComplete = () => {
        startTransition(async () => {
            try {
                // Include both catalog tools AND custom-added tools
                const catalogTools = INTEGRATIONS
                    .filter((i) => selectedTools.has(i.name))
                    .map((i) => ({ name: i.name, url: i.url }));
                const customSelected = customTools
                    .filter((name) => selectedTools.has(name))
                    .map((name) => ({ name, url: "" }));
                const toolsArray = [...catalogTools, ...customSelected];

                await completeOnboarding({
                    companyName,
                    companyContext,
                    selectedTools: toolsArray,
                    scorecardDimensions: dimensions,
                    plan: plan || undefined,
                });
            } catch {
                toast.error("Failed to save workspace. Please try again.");
            }
        });
    };

    const updateDimensionWeight = (key: string, weight: number) => {
        setDimensions((prev) => prev.map((d) => d.key === key ? { ...d, weight } : d));
    };

    const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0);

    return (
        <div className="min-h-screen bg-[#F3F3EF] flex flex-col">
            {/* Top bar */}
            <div className="border-b border-black bg-[#F3F3EF] px-6 py-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xl font-serif font-medium">
                    <TrackrLogo size={22} />
                    Trackr
                </span>
                <div className="flex items-center gap-2">
                    {([1, 2, 3] as Step[]).map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-6 h-6 border border-black flex items-center justify-center text-xs font-mono
                                ${step === s ? "bg-black text-white" : step > s ? "bg-black text-white" : "bg-white text-black"}`}>
                                {step > s ? <Check className="w-3 h-3" /> : s}
                            </div>
                            {s < 3 && <div className={`w-8 h-px ${step > s ? "bg-black" : "bg-neutral-300"}`} />}
                        </div>
                    ))}
                </div>
            </div>

            {(plan === "team" || plan === "agency") && (
                <div className="border-b border-black bg-black text-white px-6 py-2.5 text-center font-mono text-xs">
                    You&apos;re signing up for the <span className="font-bold uppercase">{plan === "team" ? "Team" : "Agency"}</span> plan.
                    Complete onboarding to activate your subscription.
                </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-start py-12 px-6">

                {/* ── STEP 1: Company Context ── */}
                {step === 1 && (
                    <div className="w-full max-w-lg">
                        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 block">Step 1 of 3</span>
                        <h1 className="text-3xl font-serif font-normal mb-2 leading-tight">Set up your workspace.</h1>
                        <p className="font-mono text-sm text-neutral-600 mb-8 leading-relaxed">
                            Tell us about your company so research agents can tailor reports to your specific needs.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-mono uppercase tracking-wide text-neutral-500 block mb-1">Company Name</label>
                                <input
                                    type="text"
                                    placeholder="Acme Inc."
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-neutral-400"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-mono uppercase tracking-wide text-neutral-500 block mb-1">Website URL (optional)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="https://yourcompany.com"
                                        value={websiteUrl}
                                        onChange={(e) => setWebsiteUrl(e.target.value)}
                                        className="flex-1 border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-neutral-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGenerateContext}
                                        disabled={!websiteUrl || isGenerating}
                                        className="flex items-center gap-2 px-4 py-3 border border-black bg-white font-mono text-sm hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    >
                                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        Auto-fill
                                    </button>
                                </div>
                                <p className="text-xs font-mono text-neutral-400 mt-1">AI will scrape your site and generate context automatically.</p>
                            </div>

                            <div>
                                <label className="text-xs font-mono uppercase tracking-wide text-neutral-500 block mb-1">
                                    Company Context
                                    {companyContext && <span className="text-black ml-2">✓ Generated</span>}
                                </label>
                                <textarea
                                    placeholder="Describe your company, industry, and what you're looking for in tools. This context is used by research agents to tailor every report."
                                    value={companyContext}
                                    onChange={(e) => setCompanyContext(e.target.value)}
                                    rows={4}
                                    className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder:text-neutral-400 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!companyName.trim()}
                                className="flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-sm uppercase tracking-wide border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                className="text-xs font-mono text-neutral-400 hover:text-neutral-600 underline"
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Current Stack ── */}
                {step === 2 && (
                    <div className="w-full max-w-4xl">
                        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 block">Step 2 of 3</span>
                        <h1 className="text-3xl font-serif font-normal mb-2 leading-tight">What tools do you already use?</h1>
                        <p className="font-mono text-sm text-neutral-600 mb-6 leading-relaxed">
                            Select your current stack. These will be tracked in your software spend dashboard.
                            {selectedTools.size > 0 && (
                                <span className="ml-2 bg-black text-white px-2 py-0.5 text-xs font-mono">{selectedTools.size} selected</span>
                            )}
                        </p>

                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                            <input
                                type="text"
                                value={toolSearch}
                                onChange={(e) => setToolSearch(e.target.value)}
                                placeholder="Search tools… e.g. Figma, Datadog, Zapier"
                                className="w-full border border-black pl-9 pr-9 py-2.5 font-mono text-sm bg-white focus:outline-none"
                            />
                            {toolSearch && (
                                <button
                                    onClick={() => setToolSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Category filter — hidden while searching */}
                        {!toolSearch && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-3 py-1 text-xs font-mono border border-black transition-all
                                            ${activeCategory === cat ? "bg-black text-white" : "bg-white hover:bg-neutral-100"}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Logo grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mb-3">
                            {visibleIntegrations.map((integration) => {
                                const selected = selectedTools.has(integration.name);
                                return (
                                    <button
                                        key={integration.name}
                                        onClick={() => toggleTool(integration.name)}
                                        title={integration.name}
                                        className={`group relative flex flex-col items-center gap-1.5 p-3 border transition-all
                                            ${selected
                                                ? "border-black bg-black/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                : "border-black/20 bg-white hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            }`}
                                    >
                                        {selected && (
                                            <div className="absolute top-1 right-1 w-4 h-4 bg-black flex items-center justify-center">
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={getLogoUrl(integration)}
                                                alt={integration.name}
                                                width={32}
                                                height={32}
                                                className="object-contain w-8 h-8"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-mono text-neutral-600 leading-tight text-center line-clamp-2 max-w-[60px]">
                                            {integration.name}
                                        </span>
                                    </button>
                                );
                            })}

                            {/* Custom (manually added) tool tiles */}
                            {customTools.map((name) => {
                                const selected = selectedTools.has(name);
                                return (
                                    <button
                                        key={`custom-${name}`}
                                        onClick={() => toggleTool(name)}
                                        title={name}
                                        className={`group relative flex flex-col items-center gap-1.5 p-3 border transition-all
                                            ${selected
                                                ? "border-black bg-black/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                : "border-black/20 bg-white hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            }`}
                                    >
                                        {selected && (
                                            <div className="absolute top-1 right-1 w-4 h-4 bg-black flex items-center justify-center">
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                        <div className="w-8 h-8 flex items-center justify-center font-mono text-sm font-bold text-neutral-400 border border-neutral-200">
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-[9px] font-mono text-neutral-600 leading-tight text-center line-clamp-2 max-w-[60px]">
                                            {name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* No results + add manually */}
                        {searchResults?.length === 0 && (
                            <p className="font-mono text-xs text-neutral-400 mb-2">No tools matched &ldquo;{toolSearch}&rdquo;.</p>
                        )}
                        {showAddManually && (
                            <button
                                onClick={() => addCustomTool(toolSearch)}
                                className="flex items-center gap-2 font-mono text-xs border border-dashed border-black px-4 py-2.5 hover:bg-neutral-50 mb-6"
                            >
                                <PlusCircle className="w-3.5 h-3.5" />
                                Add &ldquo;{toolSearch.trim()}&rdquo; to my stack
                            </button>
                        )}
                        {!showAddManually && <div className="mb-6" />}

                        {/* AI Nativeness Preview */}
                        {selectedTools.size > 0 && (() => {
                            const allSelected = [...selectedTools];
                            let aiNative = 0, aiEnabled = 0, traditional = 0, unknown = 0;
                            for (const name of allSelected) {
                                const c = classifyTool(name);
                                if (!c.matched) { unknown++; continue; }
                                if (c.classification === "ai-native") aiNative++;
                                else if (c.classification === "ai-enabled") aiEnabled++;
                                else traditional++;
                            }
                            const total = allSelected.length;
                            const score = Math.min(100, Math.round(((aiNative * 2 + aiEnabled * 1) / (total * 2)) * 100));
                            const label = score >= 40 ? "AI Leader" : score >= 20 ? "Early Adopter" : score >= 8 ? "Developing" : "Just Starting";
                            return (
                                <div className="border border-black p-4 mb-6 bg-white">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">AI Nativeness Preview</span>
                                        <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-2 py-0.5">{label}</span>
                                    </div>
                                    <div className="flex items-end gap-4">
                                        <div>
                                            <div className="font-mono text-4xl font-bold">{score}</div>
                                            <div className="font-mono text-[10px] text-neutral-400">/100</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-2 w-full bg-neutral-100 border border-neutral-200">
                                                <div className="h-full bg-black transition-all" style={{ width: `${score}%` }} />
                                            </div>
                                            <div className="flex justify-between mt-1.5">
                                                <span className="font-mono text-[10px] text-neutral-500">{aiNative} AI-native</span>
                                                <span className="font-mono text-[10px] text-neutral-500">{aiEnabled} AI-enabled</span>
                                                <span className="font-mono text-[10px] text-neutral-500">{traditional + unknown} Traditional</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-mono text-[10px] text-neutral-400 mt-3">
                                        Complete setup to unlock full AI Intelligence with time saved estimates, cost insights, and personalized recommendations.
                                    </p>
                                </div>
                            );
                        })()}

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setStep(1)}
                                className="text-xs font-mono text-neutral-400 hover:text-neutral-600 underline"
                            >
                                &larr; Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-sm uppercase tracking-wide border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 3: Scorecard Setup ── */}
                {step === 3 && (
                    <div className="w-full max-w-lg">
                        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 block">Step 3 of 3</span>
                        <h1 className="text-3xl font-serif font-normal mb-2 leading-tight">Set up your scorecard.</h1>
                        <p className="font-mono text-sm text-neutral-600 mb-8 leading-relaxed">
                            Every tool is scored against these dimensions. Adjust weights to match what matters most to your team.
                            {totalWeight !== 100 && (
                                <span className="text-amber-600 ml-1 font-bold">Total: {totalWeight}% (should be 100%)</span>
                            )}
                        </p>

                        <div className="space-y-4 mb-8">
                            {dimensions.map((dim) => (
                                <div key={dim.key} className="border border-black bg-white p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono text-sm font-medium">{dim.label}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateDimensionWeight(dim.key, Math.max(0, dim.weight - 5))}
                                                className="w-6 h-6 border border-black bg-white font-mono text-sm hover:bg-neutral-100 flex items-center justify-center"
                                            >−</button>
                                            <span className="w-10 text-center font-mono text-sm font-bold">{dim.weight}%</span>
                                            <button
                                                onClick={() => updateDimensionWeight(dim.key, Math.min(100, dim.weight + 5))}
                                                className="w-6 h-6 border border-black bg-white font-mono text-sm hover:bg-neutral-100 flex items-center justify-center"
                                            >+</button>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-neutral-200">
                                        <div
                                            className="h-full bg-black transition-all"
                                            style={{ width: `${Math.min(dim.weight, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setStep(2)}
                                className="text-xs font-mono text-neutral-400 hover:text-neutral-600 underline"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={isPending}
                                className="flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-sm uppercase tracking-wide border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                                {isPending ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><Check className="w-4 h-4" /> Launch Workspace</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
