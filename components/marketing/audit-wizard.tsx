"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2, Check } from "lucide-react";
import { INTEGRATIONS } from "@/lib/constants/integrations";

const CALENDLY_URL = "https://calendly.com/trackr-ai/audit"; // Replace with your actual Calendly link

// ── Types ──────────────────────────────────────────────────────────────────
type Step1Data = {
    companyName: string;
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
                    <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Company Website</label>
                    <input
                        type="text"
                        value={data.website}
                        onChange={(e) => onChange({ website: e.target.value })}
                        placeholder="acme.com"
                        className="w-full border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none"
                    />
                </div>
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
    const toggleTool = (name: string) => {
        const current = data.currentTools;
        onChange({
            currentTools: current.includes(name) ? current.filter((t) => t !== name) : [...current, name],
        });
    };

    const categories = [...new Set(INTEGRATIONS.map((i) => i.category))];

    return (
        <div className="space-y-7">
            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-3">
                    Select the tools your organization currently uses
                    <span className="ml-2 text-neutral-400">({data.currentTools.length} selected)</span>
                </label>

                <div className="space-y-4">
                    {categories.map((cat) => {
                        const catTools = INTEGRATIONS.filter((i) => i.category === cat);
                        return (
                            <div key={cat}>
                                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">{cat}</div>
                                <div className="flex flex-wrap gap-2">
                                    {catTools.map((tool) => {
                                        const selected = data.currentTools.includes(tool.name);
                                        return (
                                            <button
                                                key={tool.name}
                                                type="button"
                                                onClick={() => toggleTool(tool.name)}
                                                className={`flex items-center gap-2 px-3 py-2 border font-mono text-xs transition-all ${selected ? "bg-black text-white border-black" : "bg-white text-neutral-700 border-neutral-200 hover:border-black"}`}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={`/integrations/${tool.file}`}
                                                    alt={tool.name}
                                                    className={`w-4 h-4 object-contain ${selected ? "brightness-0 invert" : ""}`}
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                />
                                                {tool.name}
                                                {selected && <Check className="w-3 h-3 flex-shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
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

            {/* Calendly embed */}
            <div>
                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">Select a time to speak with an AI architect</div>
                <div className="border border-black bg-white overflow-hidden">
                    <iframe
                        src={CALENDLY_URL}
                        width="100%"
                        height="660"
                        frameBorder="0"
                        title="Book AI Audit Call"
                    />
                </div>
            </div>
        </div>
    );
}

// ── Main Wizard ──────────────────────────────────────────────────────────────
const STEPS = ["Organization", "AI Readiness", "Current Stack", "Book Call"];

export function AuditWizard() {
    const [currentStep, setCurrentStep] = useState(0);

    const [step1, setStep1] = useState<Step1Data>({
        companyName: "", website: "", industry: "", companySize: "", role: "", revenue: "",
    });
    const [step2, setStep2] = useState<Step2Data>({
        aiToolCount: "", dailyAdoptionPct: "", hasAIManager: "", monthlySpend: "",
        biggestBottleneck: "", teamsNeedingAI: [], failedAI: "", successDefinition: "",
    });
    const [step3, setStep3] = useState<Step3Data>({
        currentTools: [], toolFrustrations: "", manualProcesses: "",
    });

    const canProceed = () => {
        if (currentStep === 0) return step1.companyName.trim().length > 0;
        if (currentStep === 1) return step2.successDefinition.trim().length > 0;
        return true;
    };

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
                    {currentStep === 3 && "You're all set. Pick a time and an AI architect will join you live."}
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
                <div className="px-6 py-4 border-t border-black flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setCurrentStep((p) => p - 1)}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-neutral-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentStep((p) => p + 1)}
                        disabled={!canProceed()}
                        className="flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-wide hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-black"
                    >
                        {currentStep === 2 ? "Book My Call" : "Continue"} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
