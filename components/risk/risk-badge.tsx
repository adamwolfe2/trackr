type AlertLevel = "low" | "medium" | "high" | "critical";

const LEVEL_STYLES: Record<AlertLevel, string> = {
    low: "border-neutral-400 bg-neutral-100 text-neutral-600",
    medium: "border-black bg-neutral-100 text-black",
    high: "border-black bg-neutral-800 text-white",
    critical: "border-black bg-black text-white",
};

export function RiskBadge({ alertLevel }: { alertLevel: AlertLevel }) {
    const style = LEVEL_STYLES[alertLevel] ?? LEVEL_STYLES.low;

    return (
        <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${style}`}>
            {alertLevel}
        </span>
    );
}
