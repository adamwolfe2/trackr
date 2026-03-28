"use client";

import { useState, useTransition } from "react";
import { requestArchitectReview } from "@/lib/actions/managed-service";
import { toast } from "sonner";
import { UserCheck, Calendar, Mail, ExternalLink, Loader2 } from "lucide-react";

interface Architect {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    calendarUrl: string | null;
    arcCode: string;
}

interface ManagedServiceClientProps {
    architect: Architect;
    workspaceId: string;
}

export function ManagedServiceClient({ architect, workspaceId }: ManagedServiceClientProps) {
    const [isPending, startTransition] = useTransition();
    const [notes, setNotes] = useState("");

    const handleRequestReview = () => {
        startTransition(async () => {
            try {
                await requestArchitectReview(workspaceId, notes);
                toast.success("Review request sent to your architect.");
                setNotes("");
            } catch {
                toast.error("Failed to send review request.");
            }
        });
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Managed Service</p>
                <h1 className="font-serif text-2xl font-normal">Your AI Architect</h1>
            </div>

            {/* Architect Profile Card */}
            <div className="border border-black bg-white max-w-2xl">
                <div className="border-b border-black px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-mono text-lg">
                        {architect.firstName[0]}{architect.lastName[0]}
                    </div>
                    <div>
                        <h2 className="font-serif text-lg">{architect.firstName} {architect.lastName}</h2>
                        <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">{architect.role.replace(/-/g, " ")}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-widest border border-black px-2 py-1 bg-white">Active</span>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                            <div>
                                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-0.5">Email</div>
                                <a href={`mailto:${architect.email}`} className="font-mono text-xs hover:underline">{architect.email}</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <UserCheck className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                            <div>
                                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-0.5">Arc Code</div>
                                <span className="font-mono text-xs">{architect.arcCode}</span>
                            </div>
                        </div>
                    </div>

                    {architect.calendarUrl && (
                        <a
                            href={architect.calendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs uppercase tracking-wide hover:bg-neutral-100 transition-colors"
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            Book a Call
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>
            </div>

            {/* Request Review */}
            <div className="border border-black bg-white max-w-2xl">
                <div className="border-b border-black px-6 py-3 bg-neutral-50">
                    <span className="font-mono text-sm font-semibold uppercase tracking-wide">Request Stack Review</span>
                </div>
                <div className="p-6 space-y-4">
                    <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                        Ask your architect to review your current stack, evaluate specific tools, or prepare for upcoming renewals.
                    </p>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="What would you like reviewed? (e.g., evaluate 3 new CRM tools, review upcoming Q2 renewals...)"
                        className="w-full border border-black px-4 py-3 font-mono text-xs bg-white focus:outline-none resize-none"
                    />
                    <button
                        onClick={handleRequestReview}
                        disabled={isPending || !notes.trim()}
                        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-xs uppercase tracking-wide border border-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
                    >
                        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Send Request
                    </button>
                </div>
            </div>

            {/* What Your Architect Does */}
            <div className="border border-black bg-white max-w-2xl">
                <div className="border-b border-black px-6 py-3 bg-neutral-50">
                    <span className="font-mono text-sm font-semibold uppercase tracking-wide">What Your Architect Does</span>
                </div>
                <div className="divide-y divide-neutral-100">
                    {[
                        { title: "Proactive Stack Monitoring", desc: "Your architect monitors your tool scores, risk alerts, and renewal dates — flagging issues before they become problems." },
                        { title: "Tool Evaluations", desc: "Need to evaluate a new category? Your architect runs deep research, scores alternatives, and presents a recommendation with reasoning." },
                        { title: "Vendor Negotiations", desc: "At renewal time, your architect arms you with competitive intelligence and pricing benchmarks to negotiate better terms." },
                        { title: "Quarterly Stack Review", desc: "A comprehensive review of your entire stack: what's working, what's not, what to cut, and what to add." },
                        { title: "Board Report Prep", desc: "Your architect helps prepare executive-ready reports on AI tool strategy, spend trends, and ROI analysis." },
                    ].map((item) => (
                        <div key={item.title} className="px-6 py-4">
                            <h3 className="font-mono text-sm font-bold mb-1">{item.title}</h3>
                            <p className="font-mono text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
