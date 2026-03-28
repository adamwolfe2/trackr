import { getROIForWorkspace } from "@/lib/utils/roi-tracking";
import { CheckCircle2, Circle } from "lucide-react";
import { ROIProgressBar } from "./roi-progress-bar";

export async function ROIWidget({ workspaceId }: { workspaceId: string }) {
    const roi = await getROIForWorkspace(workspaceId);
    if (!roi) return null;

    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    });

    return (
        <div className="border border-black">
            <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                <h2 className="font-mono text-xs uppercase tracking-widest">ROI Tracker</h2>
                <span className="font-mono text-[10px] text-neutral-400">{roi.adoptionRate}% adopted</span>
            </div>
            <div className="p-5 space-y-4">
                {/* Hero savings number */}
                <div>
                    <p className="font-serif text-3xl font-normal">{formatter.format(roi.adjustedSavings)}</p>
                    <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                        projected annual savings (adjusted for adoption)
                    </p>
                </div>

                {/* Adoption progress bar */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                            Tool Adoption
                        </span>
                        <span className="font-mono text-[10px] font-bold">
                            {roi.recommendedTools.filter(t => t.adopted).length} / {roi.recommendedTools.length}
                        </span>
                    </div>
                    <ROIProgressBar adoptionRate={roi.adoptionRate} />
                </div>

                {/* Tool checklist */}
                <div className="space-y-1.5">
                    {roi.recommendedTools.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                            {t.adopted ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-black flex-shrink-0" />
                            ) : (
                                <Circle className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                            )}
                            <span
                                className={`font-mono text-xs ${
                                    t.adopted ? "text-black" : "text-neutral-400"
                                }`}
                            >
                                {t.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-200">
                    <div>
                        <p className="font-mono text-lg font-bold">
                            {formatter.format(roi.currentAnnualWaste)}
                        </p>
                        <p className="font-mono text-[9px] text-neutral-400 uppercase">Annual Waste</p>
                    </div>
                    <div>
                        <p className="font-mono text-lg font-bold">
                            {formatter.format(roi.projectedAnnualSavings)}
                        </p>
                        <p className="font-mono text-[9px] text-neutral-400 uppercase">Full Potential</p>
                    </div>
                    <div>
                        <p className="font-mono text-lg font-bold">{roi.paybackMonths}mo</p>
                        <p className="font-mono text-[9px] text-neutral-400 uppercase">Payback</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
