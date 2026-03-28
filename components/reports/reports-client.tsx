"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { ReportCard } from "./report-card";
import { GenerateReportDialog } from "./generate-report-dialog";

interface Report {
    id: string;
    title: string;
    period: string;
    createdAt: Date;
    shareToken: string | null;
}

interface ReportsClientProps {
    reports: Report[];
    workspaceId: string;
    userId: string;
}

export function ReportsClient({ reports, workspaceId, userId }: ReportsClientProps) {
    const [showDialog, setShowDialog] = useState(false);

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-normal">Board Reports</h1>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                        Executive-ready reports for stakeholder review
                    </p>
                </div>
                <button
                    onClick={() => setShowDialog(true)}
                    className="border border-black bg-black text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Generate Report
                </button>
            </div>

            {/* Report List */}
            {reports.length === 0 ? (
                <div className="border border-black bg-white p-12 text-center">
                    <div className="w-12 h-12 border border-black flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="font-serif text-xl mb-2">No reports yet</h2>
                    <p className="font-mono text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
                        Generate your first board report to create an executive summary of your AI tool stack, spend, and health metrics.
                    </p>
                    <button
                        onClick={() => setShowDialog(true)}
                        className="border border-black bg-black text-white px-6 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                    >
                        Generate First Report
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map((report) => (
                        <ReportCard
                            key={report.id}
                            id={report.id}
                            title={report.title}
                            period={report.period}
                            createdAt={report.createdAt.toISOString()}
                            shareToken={report.shareToken}
                        />
                    ))}
                </div>
            )}

            {/* Generate Dialog */}
            {showDialog && (
                <GenerateReportDialog
                    workspaceId={workspaceId}
                    userId={userId}
                    onClose={() => setShowDialog(false)}
                />
            )}
        </div>
    );
}
