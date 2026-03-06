import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

interface OnboardingChecklistProps {
    toolsCount: number;
    hasActiveResearch: boolean;
    teamMembersCount: number;
    isPaidPlan?: boolean;
}

type Step = {
    label: string;
    description: string;
    href: string;
    done: boolean;
    cta: string;
};

export function OnboardingChecklist({ toolsCount, hasActiveResearch, teamMembersCount, isPaidPlan = false }: OnboardingChecklistProps) {
    const steps: Step[] = [
        {
            label: "Submit your first tool",
            description: "Let research agents evaluate a tool in under 2 minutes.",
            href: "/submit",
            done: toolsCount > 0,
            cta: "Submit a tool →",
        },
        {
            label: "Complete your first research report",
            description: "View the 7-dimension scorecard, pros/cons, and sentiment analysis.",
            href: "/tools",
            done: hasActiveResearch,
            cta: "View tools →",
        },
        {
            label: "Invite a teammate",
            description: "Share your workspace so your whole team evaluates tools together.",
            href: "/workspace",
            done: teamMembersCount > 1,
            cta: "Invite someone →",
        },
        ...(!isPaidPlan ? [{
            label: "Secure your access",
            description: "Add a payment method so research never stops.",
            href: "/settings/billing",
            done: isPaidPlan,
            cta: "Add billing →",
        }] : []),
    ];

    const doneCount = steps.filter(s => s.done).length;
    if (doneCount === steps.length) return null; // fully complete — hide

    const progressPct = Math.round((doneCount / steps.length) * 100);

    return (
        <div className="border border-black bg-white">
            <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="font-mono text-xs uppercase tracking-widest">Getting Started</h2>
                    <span className="font-mono text-[10px] text-neutral-400">
                        {doneCount}/{steps.length} done
                    </span>
                </div>
                {/* Progress bar */}
                <div className="hidden sm:flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-neutral-100 border border-neutral-200">
                        <div
                            className="h-full bg-black transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400">{progressPct}%</span>
                </div>
            </div>

            <div className="divide-y divide-neutral-100">
                {steps.map((step, i) => (
                    <div key={i} className={`flex items-start gap-4 px-5 py-3.5 ${step.done ? "opacity-50" : ""}`}>
                        {step.done ? (
                            <CheckCircle2 className="h-4 w-4 text-black mt-0.5 flex-shrink-0" strokeWidth={2} />
                        ) : (
                            <Circle className="h-4 w-4 text-neutral-300 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-mono text-xs ${step.done ? "line-through text-neutral-400" : "font-medium"}`}>
                                    {step.label}
                                </span>
                            </div>
                            {!step.done && (
                                <p className="font-mono text-[10px] text-neutral-400 mt-0.5 leading-relaxed">
                                    {step.description}
                                </p>
                            )}
                        </div>
                        {!step.done && (
                            <Link
                                href={step.href}
                                className="font-mono text-[10px] border border-black px-2.5 py-1 hover:bg-black hover:text-white transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1"
                            >
                                {step.cta}
                                <ArrowRight className="h-2.5 w-2.5" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
