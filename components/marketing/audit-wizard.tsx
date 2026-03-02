"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2, Check, Search, X, PlusCircle } from "lucide-react";
import { INTEGRATIONS, getLogoUrl } from "@/lib/constants/integrations";

// ── Types ──────────────────────────────────────────────────────────────────
type Step1Data = {
    companyName: string;
    contactEmail: string;
    website: string;
    industry: string;
    companySize: string;
    role: string;
    revenue: string;
};

type Step2Data = {
    aiToolCount: string;
    dailyAdoptionPct: string;
    hasAIManager: string;
    monthlySpend: string;
    biggestBottleneck: string;
    teamsNeedingAI: string[];
    failedAI: string;
    successDefinition: string;
};

type Step3Data = {
    currentTools: string[];
    toolFrustrations: string;
    manualProcesses: string;
};

// ── Step config data ────────────────────────────────────────────────────────
const INDUSTRIES = ["B2B SaaS", "Agency / Consultancy", "E-commerce", "Professional Services", "FinTech", "Healthcare", "Real Estate", "Logistics", "Manufacturing", "Education", "Other"];
const COMPANY_SIZES = ["1–10 people", "11–50 people", "51–200 people", "201–1,000 people", "1,000+ people"];
const ROLES = ["Founder / CEO", "COO / Head of Operations", "CTO / Engineering Lead", "CMO / Marketing Lead", "Head of Sales", "VP / Director", "Other"];
const REVENUES = ["Pre-revenue", "Under $1M", "$1M – $5M", "$5M – $25M", "$25M – $100M", "$100M+"];
const AI_TOOL_COUNTS = ["0–2 tools", "3–10 tools", "11–25 tools", "25+ tools"];
const ADOPTION_PCTS = ["Less than 10%", "10–30%", "30–60%", "60%+"];
const AI_MANAGERS = ["Yes, we have someone dedicated", "No — it's scattered across teams", "Planning to hire soon"];
const MONTHLY_SPENDS = ["Under $1K/mo", "$1K – $5K/mo", "$5K – $15K/mo", "$15K – $50K/mo", "$50K+/mo"];
const BOTTLENECKS = ["Lead Generation & Prospecting", "Sales Process & Conversion", "Content Creation & Marketing", "Customer Support & Success", "Data Analysis & Reporting", "Internal Operations & Workflows", "Product Development", "Hiring & People Ops"];
const TEAMS = ["Sales", "Marketing", "Operations", "Engineering", "Customer Success", "Finance", "HR / People", "Executive / Strategy"];
const FAILED_AI = ["No — haven't tried much yet", "Yes — minor impact, moved on", "Yes — cost us time and money significantly"];

// ── Reusable option button ───────────────────────────────────────────────────
function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`text-left px-4 py-3 border font-mono text-xs uppercase tracking-wide transition-all ${selected ? "bg-black text-white border-black" : "bg-white text-neutral-700 border-neutral-300 hover:border-black"}`}
        >
            {children}
        </button>
    );
}

// ── Step 1 ──────────────────────────────────────────────────────────────────
function Step1({ data, onChange }: { data: Step1Data; onChange: (d: Partial<Step1Data>) => void }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Company Name *</label>
                    <input
                        type="text"
                        value={data.companyName}
                        onChange={(e) => onChange({ companyName: e.target.value })}
                        placeholder="Acme Corp"
                        className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
                    />
                </div>
                <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Your Work Email *</label>
                    <input
                        type="email"
                        value={data.contactEmail}
                        onChange={(e) => onChange({ contactEmail: e.target.value })}
                        placeholder="you@company.com"
                        className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
                    />
                </div>
            </div>
            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Company Website</label>
                <input
                    type="text"
                    value={data.website}
                    onChange={(e) => onChange({ website: e.target.value })}
                    placeholder="acme.com"
                    className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
                />
            </div>

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Industry</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INDUSTRIES.map((ind) => (
                        <OptionButton key={ind} selected={data.industry === ind} onClick={() => onChange({ industry: ind })}>
                            {ind}
                        </OptionButton>
                    ))}
                </div>
            </div>

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Company Size</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COMPANY_SIZES.map((s) => (
                        <OptionButton key={s} selected={data.companySize === s} onClick={() => onChange({ companySize: s })}>
                            {s}
                        </OptionButton>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Your Role</label>
                    <div className="grid grid-cols-1 gap-2">
                        {ROLES.map((r) => (
                            <OptionButton key={r} selected={data.role === r} onClick={() => onChange({ role: r })}>
                                {r}
                            </OptionButton>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Annual Revenue</label>
                    <div className="grid grid-cols-1 gap-2">
                        {REVENUES.map((r) => (
                            <OptionButton key={r} selected={data.revenue === r} onClick={() => onChange({ revenue: r })}>
                                {r}
                            </OptionButton>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Step 2 ──────────────────────────────────────────────────────────────────
function Step2({ data, onChange }: { data: Step2Data; onChange: (d: Partial<Step2Data>) => void }) {
    const toggleTeam = (team: string) => {
        const current = data.teamsNeedingAI;
        onChange({
            teamsNeedingAI: current.includes(team) ? current.filter((t) => t !== team) : [...current, team],
        });
    };

    return (
        <div className="space-y-7">
            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">How many AI tools does your team actively use today?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AI_TOOL_COUNTS.map((c) => (
                        <OptionButton key={c} selected={data.aiToolCount === c} onClick={() => onChange({ aiToolCount: c })}>{c}</OptionButton>
                    ))}
                </div>
            </div>

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">What % of your team uses AI tools daily?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ADOPTION_PCTS.map((p) => (
                        <OptionButton key={p} selected={data.dailyAdoptionPct === p} onClick={() => onChange({ dailyAdoptionPct: p })}>{p}</OptionButton>
                    ))}
                </div>
            </div>

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Do you have someone dedicated to managing your AI/software stack?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {AI_MANAGERS.map((m) => (
                        <OptionButton key={m} selected={data.hasAIManager === m} onClick={() => onChange({ hasAIManager: m })}>{m}</OptionButton>
                    ))}
                </div>
            </div>

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Estimated monthly AI + software spend</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MONTHLY_SPENDS.map((s) => (
                        <OptionButton key={s} selected={data.monthlySpend === s} onClick={() => onChange({ monthlySpend: s })}>{s}</OptionButton>
                    ))}
                </div>
            </div>

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">What&apos;s your biggest operational bottleneck right now?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {BOTTLENECKS.map((b) => (
                        <OptionButton key={b} selected={data.biggestBottleneck === b} onClick={() => onChange({ biggestBottleneck: b })}>{b}</OptionButton>
                    ))}
                </div>
            </div>

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Which teams need the most AI support? (Select all that apply)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TEAMS.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => toggleTeam(t)}
                            className={`text-left px-3 py-2.5 border font-mono text-xs uppercase tracking-wide transition-all flex items-center gap-2 ${data.teamsNeedingAI.includes(t) ? "bg-black text-white border-black" : "bg-white text-neutral-700 border-neutral-300 hover:border-black"}`}
                        >
                            {data.teamsNeedingAI.includes(t) && <Check className="w-3 h-3 flex-shrink-0" />}
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Have you had failed AI implementations before?</label>
                <div className="grid grid-cols-1 gap-2">
                    {FAILED_AI.map((f) => (
                        <OptionButton key={f} selected={data.failedAI === f} onClick={() => onChange({ failedAI: f })}>{f}</OptionButton>
                    ))}
                </div>
            </div>

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">What does success look like in 90 days? *</label>
                <textarea
                    value={data.successDefinition}
                    onChange={(e) => onChange({ successDefinition: e.target.value })}
                    placeholder="e.g. Our sales team is saving 5 hrs/week on prospecting. Content output has doubled. We've cut 3 redundant subscriptions."
                    rows={4}
                    className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none resize-none"
                />
            </div>
        </div>
    );
}

// ── Step 3 ──────────────────────────────────────────────────────────────────
function Step3({ data, onChange }: { data: Step3Data; onChange: (d: Partial<Step3Data>) => void }) {
    const [toolSearch, setToolSearch] = useState("");
    const [customTools, setCustomTools] = useState<string[]>([]);

    const toggleTool = (name: string) => {
        const current = data.currentTools;
        onChange({
            currentTools: current.includes(name) ? current.filter((t) => t !== name) : [...current, name],
        });
    };

    const addCustomTool = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        if (!customTools.includes(trimmed)) setCustomTools((prev) => [...prev, trimmed]);
        if (!data.currentTools.includes(trimmed)) onChange({ currentTools: [...data.currentTools, trimmed] });
        setToolSearch("");
    };

    const query = toolSearch.trim().toLowerCase();
    const searchResults = query.length > 0
        ? INTEGRATIONS.filter((i) => i.name.toLowerCase().includes(query))
        : null;

    const exactMatchExists = query.length > 0 &&
        (INTEGRATIONS.some((i) => i.name.toLowerCase() === query) ||
         customTools.some((t) => t.toLowerCase() === query));
    const showAddManually = query.length >= 2 && !exactMatchExists;

    const categories = [...new Set(INTEGRATIONS.map((i) => i.category))];

    const ToolChip = ({ name, logoSrc }: { name: string; logoSrc?: string }) => {
        const selected = data.currentTools.includes(name);
        return (
            <button
                key={name}
                type="button"
                onClick={() => toggleTool(name)}
                className={`flex items-center gap-2 px-3 py-2 border font-mono text-xs transition-all ${selected ? "bg-black text-white border-black" : "bg-white text-neutral-700 border-neutral-200 hover:border-black"}`}
            >
                {logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={logoSrc}
                        alt={name}
                        className={`w-4 h-4 object-contain ${selected ? "brightness-0 invert" : ""}`}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                ) : (
                    <span className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold border ${selected ? "border-white/40 text-white" : "border-neutral-200 text-neutral-400"}`}>
                        {name.charAt(0).toUpperCase()}
                    </span>
                )}
                {name}
                {selected && <Check className="w-3 h-3 flex-shrink-0" />}
            </button>
        );
    };

    return (
        <div className="space-y-7">
            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-3">
                    Select the tools your organization currently uses
                    <span className="ml-2 text-neutral-400">({data.currentTools.length} selected)</span>
                </label>

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
                            type="button"
                            onClick={() => setToolSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Search results — flat list */}
                {searchResults !== null ? (
                    <div>
                        {searchResults.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {searchResults.map((tool) => (
                                    <ToolChip key={tool.name} name={tool.name} logoSrc={getLogoUrl(tool)} />
                                ))}
                            </div>
                        )}
                        {searchResults.length === 0 && (
                            <p className="font-mono text-xs text-neutral-400 mb-2">No tools matched &ldquo;{toolSearch}&rdquo;.</p>
                        )}
                        {showAddManually && (
                            <button
                                type="button"
                                onClick={() => addCustomTool(toolSearch)}
                                className="flex items-center gap-2 font-mono text-xs border border-dashed border-black px-4 py-2.5 hover:bg-neutral-100"
                            >
                                <PlusCircle className="w-3.5 h-3.5" />
                                Add &ldquo;{toolSearch.trim()}&rdquo; to my stack
                            </button>
                        )}
                    </div>
                ) : (
                    /* Grouped categories — shown when not searching */
                    <div className="space-y-4">
                        {categories.map((cat) => {
                            const catTools = INTEGRATIONS.filter((i) => i.category === cat);
                            return (
                                <div key={cat}>
                                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">{cat}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {catTools.map((tool) => (
                                            <ToolChip key={tool.name} name={tool.name} logoSrc={getLogoUrl(tool)} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Custom tools section */}
                        {customTools.length > 0 && (
                            <div>
                                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Custom</div>
                                <div className="flex flex-wrap gap-2">
                                    {customTools.map((name) => (
                                        <ToolChip key={`custom-${name}`} name={name} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">What frustrates you most about your current tool stack?</label>
                <textarea
                    value={data.toolFrustrations}
                    onChange={(e) => onChange({ toolFrustrations: e.target.value })}
                    placeholder="e.g. Too many tools that don't talk to each other. We're paying for seats nobody uses. Our sales team ignores the CRM."
                    rows={4}
                    className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none resize-none"
                />
            </div>

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Which processes do you still do manually that you wish were automated?</label>
                <textarea
                    value={data.manualProcesses}
                    onChange={(e) => onChange({ manualProcesses: e.target.value })}
                    placeholder="e.g. Building prospect lists, writing follow-up emails, generating weekly reports, onboarding new hires..."
                    rows={4}
                    className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none resize-none"
                />
            </div>
        </div>
    );
}

// ── Cal.com Embed ────────────────────────────────────────────────────────────
function CalEmbed() {
    useEffect(() => {
        if (typeof window === "undefined") return;
        // Prevent double-init across React re-renders
        // @ts-expect-error — Cal.com custom window property
        if (window.__calTrackrInitialized) return;
        // @ts-expect-error — Cal.com custom window property
        window.__calTrackrInitialized = true;

        // Set up Cal queue if not already present
        // @ts-expect-error — Cal.com embed API
        if (!window.Cal) {
            /* eslint-disable */
            (function (C: any, A: string, L: string) {
                let p = function (a: any, ar: any) { a.q.push(ar); };
                let d = (C as any).document;
                (C as any).Cal = (C as any).Cal || function () {
                    let cal = (C as any).Cal;
                    let ar = arguments;
                    if (!cal.loaded) {
                        cal.ns = {}; cal.q = cal.q || [];
                        d.head.appendChild(d.createElement("script")).src = A;
                        cal.loaded = true;
                    }
                    if (ar[0] === L) {
                        const api: any = function () { p(api, arguments); };
                        const namespace = ar[1];
                        api.q = api.q || [];
                        if (typeof namespace === "string") {
                            cal.ns[namespace] = cal.ns[namespace] || api;
                            p(cal.ns[namespace], ar);
                            p(cal, ["initNamespace", namespace]);
                        } else p(cal, ar);
                        return;
                    }
                    p(cal, ar);
                };
            })(window, "https://app.cal.com/embed/embed.js", "init");
            /* eslint-enable */
        }

        // @ts-expect-error — Cal.com embed API
        const Cal = window.Cal;
        Cal("init", "trackr", { origin: "https://app.cal.com" });
        Cal.ns.trackr("inline", {
            elementOrSelector: "#my-cal-inline-trackr",
            config: { layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "light" },
            calLink: "adamwolfe/trackr",
        });
        Cal.ns.trackr("ui", { theme: "light", hideEventTypeDetails: true, layout: "month_view" });
    }, []);

    return (
        <div
            id="my-cal-inline-trackr"
            style={{ width: "100%", minHeight: "660px", overflow: "scroll" }}
        />
    );
}

// ── Step 4: Booking ─────────────────────────────────────────────────────────
function Step4({ step1, step2 }: { step1: Step1Data; step2: Step2Data }) {
    return (
        <div className="space-y-8">
            {/* Audit summary card */}
            <div className="border border-black p-6 bg-[#F3F3EF]">
                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">Your Audit Profile</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Company", value: step1.companyName || "—" },
                        { label: "Industry", value: step1.industry || "—" },
                        { label: "Size", value: step1.companySize || "—" },
                        { label: "AI Tools Today", value: step2.aiToolCount || "—" },
                        { label: "Monthly Spend", value: step2.monthlySpend || "—" },
                        { label: "Key Bottleneck", value: step2.biggestBottleneck || "—" },
                    ].map((item) => (
                        <div key={item.label}>
                            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-0.5">{item.label}</div>
                            <div className="font-mono text-xs font-medium text-black truncate">{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* What happens next */}
            <div className="border border-black p-6">
                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">What happens on your call</div>
                <div className="space-y-3">
                    {[
                        "Review your current stack and identify what to cut immediately",
                        "Map your pain points to specific tools your competitors don't know about yet",
                        "Build a 90-day AI implementation roadmap with clear ROI targets",
                        "Configure your Trackr workspace and set up ongoing discovery",
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0 mt-0.5" strokeWidth={2} />
                            <span className="font-mono text-xs text-neutral-700">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cal.com embed */}
            <div>
                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">Select a time to speak with an AI architect</div>
                <div className="border border-black bg-white overflow-hidden">
                    <CalEmbed />
                </div>
            </div>
        </div>
    );
}

// ── Main Wizard ──────────────────────────────────────────────────────────────
const STEPS = ["Organization", "AI Readiness", "Current Stack", "Book Call"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuditWizard({ callOwnerEmail, arcCode }: { callOwnerEmail?: string; arcCode?: string }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [step1, setStep1] = useState<Step1Data>({
        companyName: "", contactEmail: "", website: "", industry: "", companySize: "", role: "", revenue: "",
    });
    const [step2, setStep2] = useState<Step2Data>({
        aiToolCount: "", dailyAdoptionPct: "", hasAIManager: "", monthlySpend: "",
        biggestBottleneck: "", teamsNeedingAI: [], failedAI: "", successDefinition: "",
    });
    const [step3, setStep3] = useState<Step3Data>({
        currentTools: [], toolFrustrations: "", manualProcesses: "",
    });

    const canProceed = () => {
        if (currentStep === 0) return step1.companyName.trim().length > 0 && EMAIL_RE.test(step1.contactEmail);
        if (currentStep === 1) return step2.successDefinition.trim().length > 0;
        return true;
    };

    async function handleNext() {
        if (currentStep === 2) {
            // Submit form before showing the booking step
            setIsSubmitting(true);
            setSubmitError(null);
            try {
                const res = await fetch("/api/audit/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contactEmail: step1.contactEmail,
                        companyName: step1.companyName,
                        companyWebsite: step1.website || undefined,
                        industry: step1.industry || undefined,
                        companySize: step1.companySize || undefined,
                        role: step1.role || undefined,
                        revenue: step1.revenue || undefined,
                        callOwnerEmail: callOwnerEmail || undefined,
                        aiToolCount: step2.aiToolCount || undefined,
                        dailyAdoptionPct: step2.dailyAdoptionPct || undefined,
                        hasAIManager: step2.hasAIManager || undefined,
                        monthlySpend: step2.monthlySpend || undefined,
                        biggestBottleneck: step2.biggestBottleneck || undefined,
                        teamsNeedingAI: step2.teamsNeedingAI.length > 0 ? step2.teamsNeedingAI : undefined,
                        failedAI: step2.failedAI || undefined,
                        successDefinition: step2.successDefinition || undefined,
                        currentTools: step3.currentTools.length > 0 ? step3.currentTools : undefined,
                        toolFrustrations: step3.toolFrustrations || undefined,
                        manualProcesses: step3.manualProcesses || undefined,
                        arcCode: arcCode || undefined,
                    }),
                });
                if (!res.ok) {
                    const json = await res.json().catch(() => ({}));
                    setSubmitError((json as { error?: string }).error || "Submission failed. Please try again.");
                    setIsSubmitting(false);
                    return;
                }
                setCurrentStep(3);
            } catch {
                setSubmitError("Network error. Please check your connection and try again.");
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setCurrentStep((p) => p + 1);
        }
    }

    return (
        <div className="border border-black bg-white">
            {/* Progress bar */}
            <div className="border-b border-black">
                <div className="flex">
                    {STEPS.map((step, i) => (
                        <div
                            key={step}
                            className={`flex-1 px-4 py-3 text-center border-r border-black last:border-r-0 transition-colors ${i === currentStep ? "bg-black text-white" : i < currentStep ? "bg-[#F3F3EF] text-black" : "bg-white text-neutral-400"}`}
                        >
                            <div className="font-mono text-[9px] uppercase tracking-widest">{`0${i + 1}`}</div>
                            <div className="font-mono text-[10px] hidden sm:block mt-0.5">{step}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step heading */}
            <div className="border-b border-black px-6 py-5">
                <h3 className="font-serif text-xl font-normal">
                    {currentStep === 0 && "Tell us about your organization"}
                    {currentStep === 1 && "Where does your AI stack stand today?"}
                    {currentStep === 2 && "What tools are you currently running?"}
                    {currentStep === 3 && "Book your AI Audit call"}
                </h3>
                <p className="font-mono text-xs text-neutral-500 mt-1">
                    {currentStep === 0 && "This helps our architects understand your business context before your call."}
                    {currentStep === 1 && "Be honest — this is where we find the biggest opportunities."}
                    {currentStep === 2 && "Select everything you're using. We'll identify overlap, gaps, and tools to cut."}
                    {currentStep === 3 && "You're all set. Your scorecard is being generated and will be ready before your call."}
                </p>
            </div>

            {/* Step content */}
            <div className="px-6 py-6">
                {currentStep === 0 && <Step1 data={step1} onChange={(d) => setStep1((p) => ({ ...p, ...d }))} />}
                {currentStep === 1 && <Step2 data={step2} onChange={(d) => setStep2((p) => ({ ...p, ...d }))} />}
                {currentStep === 2 && <Step3 data={step3} onChange={(d) => setStep3((p) => ({ ...p, ...d }))} />}
                {currentStep === 3 && <Step4 step1={step1} step2={step2} />}
            </div>

            {/* Navigation */}
            {currentStep < 3 && (
                <div className="px-6 py-4 border-t border-black flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => setCurrentStep((p) => p - 1)}
                        disabled={currentStep === 0 || isSubmitting}
                        className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-neutral-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <div className="flex flex-col items-end gap-1">
                        {submitError && (
                            <p className="font-mono text-[10px] text-red-600 text-right">{submitError}</p>
                        )}
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!canProceed() || isSubmitting}
                            className="flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-wide hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-black"
                        >
                            {isSubmitting ? (
                                <>Generating scorecard…</>
                            ) : currentStep === 2 ? (
                                <>Book My Call <ArrowRight className="w-3.5 h-3.5" /></>
                            ) : (
                                <>Continue <ArrowRight className="w-3.5 h-3.5" /></>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
