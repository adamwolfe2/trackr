"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Share2, Check } from "lucide-react";

interface ReportCardProps {
    id: string;
    title: string;
    period: string;
    createdAt: string;
    shareToken: string | null;
}

const PERIOD_LABELS: Record<string, string> = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    annual: "Annual",
};

export function ReportCard({
    id,
    title,
    period,
    createdAt,
    shareToken,
}: ReportCardProps) {
    const [copied, setCopied] = useState(false);

    function handleShare(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (!shareToken) return;

        const url = `${window.location.origin}/share/report/${shareToken}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    const dateStr = new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <Link
            href={`/reports/${id}`}
            className="block border border-black bg-white p-5 hover:bg-neutral-50 transition-colors group"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 border border-black flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                        <FileText className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-serif text-base font-normal truncate">
                            {title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-1.5 py-0.5 text-neutral-500">
                                {PERIOD_LABELS[period] ?? period}
                            </span>
                            <span className="font-mono text-[10px] text-neutral-400">
                                {dateStr}
                            </span>
                        </div>
                    </div>
                </div>
                {shareToken && (
                    <button
                        onClick={handleShare}
                        className="flex-shrink-0 w-8 h-8 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                        title="Copy share link"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5" />
                        ) : (
                            <Share2 className="w-3.5 h-3.5" />
                        )}
                    </button>
                )}
            </div>
        </Link>
    );
}
