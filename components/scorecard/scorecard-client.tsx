"use client";

import { useState, useTransition } from "react";
import { saveScorecardRecipe } from "@/lib/actions/workspace";
import { toast } from "sonner";
import { Loader2, BookOpen, Building2, Target, XCircle } from "lucide-react";

interface BusinessUnit {
    key: string;
    name: string;
    description: string;
    priorities: string;
}

export interface ScorecardRecipe {
    systemContext: string;
    businessUnits: BusinessUnit[];
    evaluationCriteria: string;
    dealBreakers: string;
}

const DEFAULT_RECIPE: ScorecardRecipe = {
    systemContext: "We are a multi-vertical holding company with four operating subsidiaries across vending, property amenities, healthcare staffing, and technology. Tools must work across very different industries with varying levels of technical sophistication — from field operators managing vending routes to compliance-heavy healthcare workflows.",
    businessUnits: [
        {
            key: "vendingpreneurs",
            name: "Vendingpreneurs",
            description: "Vending machine operating business managing routes, machines, and operators across multiple locations.",
            priorities: "Route management, real-time inventory tracking, mobile-friendly for field operators, contactless payment processing, machine telemetry and alerts. Low per-user cost, multi-location support, works offline or with poor connectivity."
        },
        {
            key: "modern_amenities",
            name: "Modern Amenities",
            description: "Property amenities and lifestyle services business focused on enhancing resident and customer experiences.",
            priorities: "Customer experience, booking and scheduling, CRM and communication tools, white-label or branded capabilities. Professional client-facing UX. Integrations with property management systems."
        },
        {
            key: "medpros",
            name: "MedPros",
            description: "Healthcare staffing and medical professionals services platform.",
            priorities: "HIPAA compliance, credentialing and licensing management, shift scheduling, secure messaging, regulatory documentation and audit trails. Enterprise-grade security is non-negotiable. Integration with healthcare EHR systems preferred."
        },
        {
            key: "aims",
            name: "AIMS",
            description: "AI-integrated management systems for operations and internal tooling.",
            priorities: "AI and automation capabilities, strong API access, developer-friendly documentation, deep integration potential. Innovation-forward with technical depth. Evaluate AI features critically — substance over marketing."
        }
    ],
    evaluationCriteria: "Prioritize tools that:\n1. Work well for non-technical operators in the field\n2. Have strong mobile apps (iOS and Android)\n3. Offer transparent, scalable pricing — ideally self-serve with no sales calls required\n4. Provide reliable support with real response times, not just a chatbot\n5. Integrate well with common business tools (Slack, Google Workspace, Stripe, etc.)\n\nCross-subsidiary utility matters. A tool that serves two or more of our business units at once is significantly more valuable than a narrow single-purpose tool.",
    dealBreakers: "- Enterprise-only pricing: requires a demo call with no self-serve option\n- No mobile app for field use\n- Minimum seat requirements above 10 users\n- No API access or poor documentation\n- No multi-account or multi-tenant support\n- Missing HIPAA compliance (required for any tool touching MedPros data)"
};

interface ScorecardClientProps {
    savedRecipe?: ScorecardRecipe | null;
}

export function ScorecardClient({ savedRecipe }: ScorecardClientProps) {
    const [recipe, setRecipe] = useState<ScorecardRecipe>(
        savedRecipe && savedRecipe.systemContext ? savedRecipe : DEFAULT_RECIPE
    );
    const [isPending, startTransition] = useTransition();

    const updateBusinessUnit = (key: string, field: keyof BusinessUnit, value: string) => {
        setRecipe(prev => ({
            ...prev,
            businessUnits: prev.businessUnits.map(bu =>
                bu.key === key ? { ...bu, [field]: value } : bu
            )
        }));
    };

    const handleSave = () => {
        startTransition(async () => {
            try {
                await saveScorecardRecipe(recipe);
                toast.success("Recipe saved. New research will use this context.");
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save recipe.");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Scorecard Recipe</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Research agents use this recipe when evaluating tools — the more specific, the better.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-sm uppercase tracking-wide border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Recipe
                </button>
            </div>

            {/* System Context */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-4 py-3 flex items-center gap-2 bg-neutral-50">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-mono text-sm font-semibold uppercase tracking-wide">System Context</span>
                    <span className="text-xs font-mono text-neutral-500 ml-auto">Who you are overall</span>
                </div>
                <div className="p-4">
                    <textarea
                        value={recipe.systemContext}
                        onChange={(e) => setRecipe(prev => ({ ...prev, systemContext: e.target.value }))}
                        rows={4}
                        className="w-full font-mono text-sm bg-transparent border-none outline-none resize-none placeholder:text-neutral-400 leading-relaxed"
                        placeholder="Describe your company: industry, business model, team composition, and what kinds of tools matter most across your organization..."
                    />
                </div>
            </div>

            {/* Business Units */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-4 py-3 flex items-center gap-2 bg-neutral-50">
                    <Building2 className="w-4 h-4" />
                    <span className="font-mono text-sm font-semibold uppercase tracking-wide">Business Units</span>
                    <span className="text-xs font-mono text-neutral-500 ml-auto">How each subsidiary evaluates tools differently</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black">
                    {recipe.businessUnits.map((bu, i) => (
                        <div
                            key={bu.key}
                            className={`p-4 space-y-3 ${i >= 2 ? "border-t border-black" : ""}`}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-black" />
                                <input
                                    value={bu.name}
                                    onChange={(e) => updateBusinessUnit(bu.key, "name", e.target.value)}
                                    className="font-mono text-sm font-bold uppercase tracking-wide bg-transparent border-none outline-none flex-1"
                                />
                            </div>
                            <div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">Description</div>
                                <textarea
                                    value={bu.description}
                                    onChange={(e) => updateBusinessUnit(bu.key, "description", e.target.value)}
                                    rows={2}
                                    className="w-full font-mono text-xs bg-transparent border-none outline-none resize-none placeholder:text-neutral-400 leading-relaxed text-neutral-700"
                                    placeholder="What does this business unit do?"
                                />
                            </div>
                            <div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">Priorities for tool evaluation</div>
                                <textarea
                                    value={bu.priorities}
                                    onChange={(e) => updateBusinessUnit(bu.key, "priorities", e.target.value)}
                                    rows={3}
                                    className="w-full font-mono text-xs bg-transparent border-none outline-none resize-none placeholder:text-neutral-400 leading-relaxed text-neutral-700"
                                    placeholder="What does this unit need most from software tools?"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Evaluation Criteria */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-4 py-3 flex items-center gap-2 bg-neutral-50">
                    <Target className="w-4 h-4" />
                    <span className="font-mono text-sm font-semibold uppercase tracking-wide">Evaluation Criteria</span>
                    <span className="text-xs font-mono text-neutral-500 ml-auto">What matters most across all tools</span>
                </div>
                <div className="p-4">
                    <textarea
                        value={recipe.evaluationCriteria}
                        onChange={(e) => setRecipe(prev => ({ ...prev, evaluationCriteria: e.target.value }))}
                        rows={7}
                        className="w-full font-mono text-sm bg-transparent border-none outline-none resize-none placeholder:text-neutral-400 leading-relaxed"
                        placeholder="List the factors the AI should prioritize when scoring any tool. Be specific about what good looks like for your team..."
                    />
                </div>
            </div>

            {/* Deal Breakers */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-4 py-3 flex items-center gap-2 bg-neutral-50">
                    <XCircle className="w-4 h-4" />
                    <span className="font-mono text-sm font-semibold uppercase tracking-wide">Deal Breakers</span>
                    <span className="text-xs font-mono text-neutral-500 ml-auto">Hard no&apos;s — flag these in every report</span>
                </div>
                <div className="p-4">
                    <textarea
                        value={recipe.dealBreakers}
                        onChange={(e) => setRecipe(prev => ({ ...prev, dealBreakers: e.target.value }))}
                        rows={5}
                        className="w-full font-mono text-sm bg-transparent border-none outline-none resize-none placeholder:text-neutral-400 leading-relaxed"
                        placeholder="List anything that would immediately disqualify a tool (e.g. no mobile app, enterprise pricing only, no API access)..."
                    />
                </div>
            </div>

            <p className="text-xs font-mono text-neutral-400">
                Changes take effect on the next research run. Previously scored tools will not be re-scored automatically.
            </p>
        </div>
    );
}
