"use client";

import { useState, useTransition } from "react";
import { saveScorecardRecipe } from "@/lib/actions/workspace";
import { toast } from "sonner";
import { Loader2, BookOpen, Building2, Target, XCircle, Sparkles, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

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
    systemContext: "",
    businessUnits: [
        { key: "unit_1", name: "", description: "", priorities: "" },
        { key: "unit_2", name: "", description: "", priorities: "" },
    ],
    evaluationCriteria: "",
    dealBreakers: "",
};

const SCORECARD_PROMPT = `I'm configuring Trackr — an AI tool evaluation platform — to score software tools for our company. I need your help filling out a Scorecard Recipe that will be used by AI research agents to evaluate every tool we research.

Since you know our company context, please fill out these four sections as specifically as possible, then return your answer in the exact JSON format at the bottom.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 1: SYSTEM CONTEXT
Describe our company in full:
• What industry are we in and what is our business model (B2B SaaS, e-commerce, agency, services, etc.)?
• How large is the team and what are the main departments?
• What stage are we at (startup, growth, scale, enterprise)?
• What types of software tools matter most to us right now?
• What does our current tech stack look like (key tools we're already using)?
• How sophisticated is our team at adopting and integrating new tools?
• What are our top organizational priorities this year?

SECTION 2: BUSINESS UNITS
For each major team or department that would evaluate tools differently (e.g. Sales, Engineering, Marketing, Operations, Finance, Customer Success, Product):
• What is the unit's name?
• What is its core function and who is on the team?
• What do they need most from software tools — reliability, integrations, automation, low cost, power features, ease of use?
• What does a "10/10 tool" look like for this unit specifically?

SECTION 3: EVALUATION CRITERIA
What should AI research agents prioritize when scoring tools for us? Be very specific:
• Pricing model preference (monthly, per-seat, usage-based, flat-rate — what works for our budget?)
• Integration requirements (which tools must it connect with — list specifics like Slack, HubSpot, Salesforce, Notion, Zapier, etc.)
• Security & compliance needs (SOC 2, GDPR, HIPAA, SSO/SAML, data residency, etc.)
• Team adoption requirements (how easy does onboarding need to be? do we have dedicated IT?)
• AI-native vs. traditional tool preference (is AI capability a must-have or nice-to-have?)
• Support & SLA expectations (do we need dedicated success managers, 24/7 support?)
• Any scoring factors unique to our business model or industry?

SECTION 4: DEAL BREAKERS
What would immediately disqualify a tool — no matter how good it otherwise is?
Think about: pricing model issues, missing features, compliance gaps, integration blockers, contract requirements, data portability, vendor lock-in, minimum seat counts, etc.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Respond ONLY with this JSON (no intro text, no explanation — just valid JSON):

{
  "systemContext": "Full paragraph: company, industry, model, stage, team size, tech stack, and top priorities",
  "businessUnits": [
    {
      "name": "Unit name (e.g. Sales)",
      "description": "What this unit does, who is on it, and its role in the company",
      "priorities": "Exactly what this unit needs most from software tools, scored priorities"
    }
  ],
  "evaluationCriteria": "Detailed multi-sentence description of what to prioritize when scoring tools for this company",
  "dealBreakers": "Bulleted or line-separated list of absolute disqualifiers"
}`;

interface ScorecardClientProps {
    savedRecipe?: ScorecardRecipe | null;
}

export function ScorecardClient({ savedRecipe }: ScorecardClientProps) {
    const [recipe, setRecipe] = useState<ScorecardRecipe>(
        savedRecipe && savedRecipe.systemContext?.trim().length > 0 ? savedRecipe : DEFAULT_RECIPE
    );
    const [isPending, startTransition] = useTransition();
    const [copied, setCopied] = useState(false);
    const [showPaste, setShowPaste] = useState(false);
    const [pasteText, setPasteText] = useState("");
    const [parseError, setParseError] = useState("");

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

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(SCORECARD_PROMPT);
        setCopied(true);
        setShowPaste(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Prompt copied — paste it into Claude, ChatGPT, or any AI model.");
    };

    const handleApplyResponse = () => {
        setParseError("");
        try {
            // Strip markdown code fences if present
            const cleaned = pasteText.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
            const parsed = JSON.parse(cleaned);

            if (typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Expected a JSON object");

            const incoming: ScorecardRecipe = {
                systemContext: typeof parsed.systemContext === "string" ? parsed.systemContext : "",
                evaluationCriteria: typeof parsed.evaluationCriteria === "string" ? parsed.evaluationCriteria : "",
                dealBreakers: typeof parsed.dealBreakers === "string" ? parsed.dealBreakers : "",
                businessUnits: Array.isArray(parsed.businessUnits)
                    ? parsed.businessUnits.map((u: Record<string, string>, i: number) => ({
                        key: `unit_${i + 1}`,
                        name: typeof u.name === "string" ? u.name : "",
                        description: typeof u.description === "string" ? u.description : "",
                        priorities: typeof u.priorities === "string" ? u.priorities : "",
                    }))
                    : recipe.businessUnits,
            };

            setRecipe(incoming);
            setPasteText("");
            setShowPaste(false);
            toast.success("Form filled from AI response. Review and save when ready.");
        } catch {
            setParseError("Couldn't parse that response. Make sure you copied the full JSON block from your AI model.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Evaluation Config</p>
                    <h1 className="font-serif text-2xl font-normal">Scorecard Recipe</h1>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                        Research agents use this recipe when evaluating tools — the more specific, the better.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleCopyPrompt}
                        className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs uppercase tracking-wide bg-white hover:bg-neutral-100 transition-colors"
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {copied ? "Copied!" : "Ask AI to Fill This"}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-sm uppercase tracking-wide border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Save Recipe
                    </button>
                </div>
            </div>

            {/* AI Paste Panel */}
            {showPaste && (
                <div className="border border-black bg-white">
                    <div className="border-b border-black px-4 py-3 flex items-center justify-between bg-neutral-50">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-mono text-sm font-semibold uppercase tracking-wide">Paste AI Response</span>
                        </div>
                        <button onClick={() => { setShowPaste(false); setPasteText(""); setParseError(""); }} className="font-mono text-xs text-neutral-500 hover:text-black">
                            <ChevronUp className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-4 space-y-3">
                        <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                            1. Paste the prompt into Claude, ChatGPT, or your AI model of choice.<br />
                            2. Copy the full JSON response it returns.<br />
                            3. Paste it below and click <strong>Apply to Form</strong>.
                        </p>
                        <textarea
                            value={pasteText}
                            onChange={(e) => { setPasteText(e.target.value); setParseError(""); }}
                            rows={6}
                            placeholder='Paste the JSON response from your AI here...'
                            className="w-full border border-black px-4 py-3 font-mono text-xs bg-white focus:outline-none resize-none"
                        />
                        {parseError && (
                            <p className="font-mono text-xs text-red-600">{parseError}</p>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={handleApplyResponse}
                                disabled={!pasteText.trim()}
                                className="flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-xs uppercase tracking-wide border border-black disabled:opacity-40"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Apply to Form
                            </button>
                            <button
                                onClick={handleCopyPrompt}
                                className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs uppercase tracking-wide hover:bg-neutral-100"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                {copied ? "Copied!" : "Re-copy Prompt"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* System Context */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-4 py-3 flex items-center gap-2 bg-neutral-50 flex-wrap">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-mono text-sm font-semibold uppercase tracking-wide">System Context</span>
                    <span className="text-xs font-mono text-neutral-500 ml-auto hidden sm:inline">Who you are overall</span>
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
                <div className="border-b border-black px-4 py-3 flex items-center gap-2 bg-neutral-50 flex-wrap">
                    <Building2 className="w-4 h-4" />
                    <span className="font-mono text-sm font-semibold uppercase tracking-wide">Business Units</span>
                    <span className="text-xs font-mono text-neutral-500 ml-auto hidden sm:inline">How each subsidiary evaluates tools differently</span>
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
                <div className="border-b border-black px-4 py-3 flex items-center gap-2 bg-neutral-50 flex-wrap">
                    <Target className="w-4 h-4" />
                    <span className="font-mono text-sm font-semibold uppercase tracking-wide">Evaluation Criteria</span>
                    <span className="text-xs font-mono text-neutral-500 ml-auto hidden sm:inline">What matters most across all tools</span>
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
                <div className="border-b border-black px-4 py-3 flex items-center gap-2 bg-neutral-50 flex-wrap">
                    <XCircle className="w-4 h-4" />
                    <span className="font-mono text-sm font-semibold uppercase tracking-wide">Deal Breakers</span>
                    <span className="text-xs font-mono text-neutral-500 ml-auto hidden sm:inline">Hard no&apos;s — flag these in every report</span>
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
