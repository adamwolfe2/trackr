"use client";

import { Download, Printer } from "lucide-react";
import { useState } from "react";

interface ExportButtonProps {
    toolName: string;
    report: {
        summary?: string | null;
        scorecardSnapshot?: Record<string, { score: number; justification: string }> | null;
        pros?: string[] | null;
        cons?: string[] | null;
        pricingTiers?: Array<{ tier: string; price: string }>;
    } | null;
}

function toCSV(rows: string[][]): string {
    return rows
        .map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
}

export function ExportButton({ toolName, report }: ExportButtonProps) {
    const [open, setOpen] = useState(false);

    const handleExportCSV = () => {
        if (!report) return;

        const rows: string[][] = [
            ["Tool", "Field", "Value"],
            [toolName, "Summary", report.summary ?? ""],
        ];

        if (report.scorecardSnapshot) {
            const dimLabels: Record<string, string> = {
                features: "Features & Functionality",
                pricing_value: "Pricing Value",
                ease_of_use: "Ease of Use",
                integration_depth: "Integration Depth",
                support_quality: "Support & Documentation",
                security: "Security & Compliance",
                ai_capabilities: "AI Capabilities",
            };
            for (const [key, val] of Object.entries(report.scorecardSnapshot)) {
                rows.push([toolName, dimLabels[key] ?? key, String(val.score) + "/10"]);
                rows.push([toolName, (dimLabels[key] ?? key) + " — Justification", val.justification]);
            }
        }

        if (report.pros?.length) {
            report.pros.forEach((p, i) => rows.push([toolName, `Pro ${i + 1}`, p]));
        }
        if (report.cons?.length) {
            report.cons.forEach((c, i) => rows.push([toolName, `Con ${i + 1}`, c]));
        }
        if (report.pricingTiers?.length) {
            report.pricingTiers.forEach(p => rows.push([toolName, `Pricing: ${p.tier}`, p.price]));
        }

        const csv = toCSV(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${toolName.replace(/\s+/g, "-").toLowerCase()}-report.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setOpen(false);
    };

    const handleExportJSON = () => {
        if (!report) return;
        const data = { tool: toolName, ...report };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${toolName.replace(/\s+/g, "-").toLowerCase()}-report.json`;
        a.click();
        URL.revokeObjectURL(url);
        setOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs bg-white hover:bg-black hover:text-white transition-colors"
            >
                <Download className="h-3.5 w-3.5" />
                Export
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} role="presentation" aria-hidden="true" />
                    <div className="absolute right-0 top-full mt-1 border border-black bg-white z-20 min-w-[140px]">
                        <button
                            onClick={handleExportCSV}
                            disabled={!report}
                            className="w-full text-left px-4 py-2.5 font-mono text-xs hover:bg-black hover:text-white disabled:opacity-40 disabled:cursor-not-allowed border-b border-black"
                        >
                            Export as CSV
                        </button>
                        <button
                            onClick={handleExportJSON}
                            disabled={!report}
                            className="w-full text-left px-4 py-2.5 font-mono text-xs hover:bg-black hover:text-white disabled:opacity-40 disabled:cursor-not-allowed border-b border-black"
                        >
                            Export as JSON
                        </button>
                        <button
                            onClick={() => { setOpen(false); setTimeout(() => window.print(), 50); }}
                            className="w-full text-left px-4 py-2.5 font-mono text-xs hover:bg-black hover:text-white flex items-center gap-2"
                        >
                            <Printer className="h-3 w-3" />
                            Print / Save as PDF
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
