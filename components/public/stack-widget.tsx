type ToolItem = {
    id: string;
    name: string;
    category: string[] | null;
    overallScore: string | null;
    status: string;
    logoUrl: string | null;
    websiteUrl: string | null;
};

type AINativeness = {
    score: number;
    label: string;
    aiNativeCount: number;
    aiEnabledCount: number;
    traditionalCount: number;
};

type HealthScore = {
    score: number;
    breakdown: unknown;
    computedAt: Date;
} | null;

type SpendSummary = {
    totalMonthlySpend: number;
    toolCount: number;
    score: number;
    label: string;
} | null;

type StackWidgetProps = {
    companyName: string;
    headline?: string | null;
    description?: string | null;
    tools: ToolItem[];
    aiNativeness: AINativeness;
    healthScore?: HealthScore;
    spendSummary?: SpendSummary;
    showScores?: boolean;
    showHealth?: boolean;
    showSpend?: boolean;
    compact?: boolean;
};

export function StackWidget({
    companyName,
    headline,
    description,
    tools,
    aiNativeness,
    healthScore,
    spendSummary,
    showScores = true,
    showHealth = true,
    showSpend = false,
    compact = false,
}: StackWidgetProps) {
    // Group tools by category
    const toolsByCategory = new Map<string, ToolItem[]>();
    for (const tool of tools) {
        const cats = tool.category && tool.category.length > 0 ? tool.category : ["Other"];
        for (const cat of cats) {
            if (!toolsByCategory.has(cat)) toolsByCategory.set(cat, []);
            toolsByCategory.get(cat)!.push(tool);
        }
    }

    const displayLimit = compact ? 5 : tools.length;
    const displayTools = tools.slice(0, displayLimit);

    return (
        <div className={compact ? "space-y-4" : "space-y-8"}>
            {/* Header */}
            <div>
                <h1 className={`font-serif font-normal ${compact ? "text-xl" : "text-3xl"}`}>
                    {companyName}
                </h1>
                {headline && (
                    <p className={`font-mono text-neutral-500 mt-1 ${compact ? "text-xs" : "text-sm"}`}>
                        {headline}
                    </p>
                )}
                {!compact && description && (
                    <p className="font-mono text-sm text-neutral-400 mt-2">{description}</p>
                )}
            </div>

            {/* Score Cards */}
            <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
                {/* AI Nativeness */}
                {showScores && (
                    <div className="border border-black bg-white p-4">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                            AI Nativeness
                        </span>
                        <p className={`font-serif ${compact ? "text-xl" : "text-3xl"}`}>
                            {aiNativeness.score}
                            <span className="text-neutral-400 text-sm">/100</span>
                        </p>
                        <p className="font-mono text-xs text-neutral-500 mt-1">
                            {aiNativeness.label}
                        </p>
                        {!compact && (
                            <div className="flex gap-3 mt-3 font-mono text-[10px] text-neutral-400">
                                <span>{aiNativeness.aiNativeCount} native</span>
                                <span>{aiNativeness.aiEnabledCount} enabled</span>
                                <span>{aiNativeness.traditionalCount} traditional</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Health Score */}
                {showHealth && healthScore && (
                    <div className="border border-black bg-white p-4">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                            Stack Health
                        </span>
                        <p className={`font-serif ${compact ? "text-xl" : "text-3xl"}`}>
                            {healthScore.score}
                            <span className="text-neutral-400 text-sm">/100</span>
                        </p>
                        {!compact && (
                            <p className="font-mono text-xs text-neutral-400 mt-1">
                                Last computed{" "}
                                {new Date(healthScore.computedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                )}

                {/* Spend Summary */}
                {showSpend && spendSummary && (
                    <div className="border border-black bg-white p-4">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                            Monthly Spend
                        </span>
                        <p className={`font-serif ${compact ? "text-xl" : "text-3xl"}`}>
                            ${spendSummary.totalMonthlySpend.toLocaleString()}
                        </p>
                        <p className="font-mono text-xs text-neutral-400 mt-1">
                            {spendSummary.toolCount} active tools
                        </p>
                    </div>
                )}
            </div>

            {/* Tool Grid */}
            <div>
                {!compact && (
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                        Tool Stack ({tools.length} tools)
                    </h2>
                )}

                {compact ? (
                    // Compact: simple list
                    <div className="space-y-2">
                        {displayTools.map((tool) => (
                            <div
                                key={tool.id}
                                className="border border-black bg-white p-3 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    {tool.logoUrl ? (
                                        <img
                                            src={tool.logoUrl}
                                            alt={tool.name}
                                            className="w-6 h-6 object-contain"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 border border-neutral-200 bg-neutral-50 flex items-center justify-center font-mono text-[10px]">
                                            {tool.name[0]}
                                        </div>
                                    )}
                                    <span className="font-mono text-xs">{tool.name}</span>
                                </div>
                                {showScores && tool.overallScore && (
                                    <span className="font-mono text-xs font-bold">
                                        {Number(tool.overallScore).toFixed(1)}
                                    </span>
                                )}
                            </div>
                        ))}
                        {tools.length > displayLimit && (
                            <p className="font-mono text-[10px] text-neutral-400 text-center mt-2">
                                +{tools.length - displayLimit} more tools
                            </p>
                        )}
                    </div>
                ) : (
                    // Full: grouped by category
                    <div className="space-y-6">
                        {Array.from(toolsByCategory.entries()).map(([category, categoryTools]) => (
                            <div key={category}>
                                <h3 className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
                                    {category}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {categoryTools.map((tool) => (
                                        <div
                                            key={`${category}-${tool.id}`}
                                            className="border border-black bg-white p-4 flex items-start gap-3"
                                        >
                                            {tool.logoUrl ? (
                                                <img
                                                    src={tool.logoUrl}
                                                    alt={tool.name}
                                                    className="w-8 h-8 object-contain mt-0.5"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 border border-neutral-200 bg-neutral-50 flex items-center justify-center font-mono text-xs shrink-0">
                                                    {tool.name[0]}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-serif text-sm truncate">
                                                        {tool.name}
                                                    </span>
                                                    {showScores && tool.overallScore && (
                                                        <span className="font-mono text-xs font-bold shrink-0">
                                                            {Number(tool.overallScore).toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                                {tool.websiteUrl && (
                                                    <a
                                                        href={tool.websiteUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-mono text-[10px] text-neutral-400 hover:text-black truncate block"
                                                    >
                                                        {tool.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
