"use client";

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="no-print border border-black bg-black text-white px-4 py-2 font-mono text-xs hover:bg-neutral-800 transition-colors"
        >
            Print / Save PDF
        </button>
    );
}
