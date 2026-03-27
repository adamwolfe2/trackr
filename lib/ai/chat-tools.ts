import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import { db } from "@/lib/db";
import {
    tools,
    reports,
    softwareSpend,
    painPoints,
    notes,
    feedItems,
    workspaceMembers,
} from "@/lib/db/schema";
import {
    stackHealthScores,
    riskAssessments,
    decisionLog,
} from "@/lib/db/enterprise-schema";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { computeStackInsights } from "@/lib/utils/stack-insights";

// ── Tool definitions (Anthropic Tool[] format) ────────────────────────────────

export const chatTools: Tool[] = [
    {
        name: "search_tools",
        description: "Search researched tools in the workspace. Filter by name, category, or status.",
        input_schema: {
            type: "object" as const,
            properties: {
                name: { type: "string", description: "Partial tool name to search for" },
                category: { type: "string", description: "Category to filter by" },
                status: { type: "string", description: "Status filter: submitted, queued, researching, active, testing, archived" },
            },
            required: [],
        },
    },
    {
        name: "get_tool_detail",
        description: "Get full details for a specific tool including its latest research report, scores, pros/cons, pricing, and competitors.",
        input_schema: {
            type: "object" as const,
            properties: {
                tool_name: { type: "string", description: "Exact or partial tool name" },
            },
            required: ["tool_name"],
        },
    },
    {
        name: "get_spend_overview",
        description: "Get total software spend overview with AI classification, top costs, and optimization opportunities.",
        input_schema: {
            type: "object" as const,
            properties: {},
            required: [],
        },
    },
    {
        name: "get_spend_by_tool",
        description: "Get spend details for a specific tool: cost, seats, renewal date, contract length.",
        input_schema: {
            type: "object" as const,
            properties: {
                tool_name: { type: "string", description: "Tool name to look up spend for" },
            },
            required: ["tool_name"],
        },
    },
    {
        name: "compare_tools",
        description: "Compare 2-3 tools side by side on scorecard dimensions, pricing, and pros/cons.",
        input_schema: {
            type: "object" as const,
            properties: {
                tool_names: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of 2-3 tool names to compare",
                },
            },
            required: ["tool_names"],
        },
    },
    {
        name: "get_health_score",
        description: "Get the workspace's stack health score with 6-dimension breakdown and recommendations.",
        input_schema: {
            type: "object" as const,
            properties: {},
            required: [],
        },
    },
    {
        name: "get_pain_points",
        description: "Get active team pain points with title, description, and category.",
        input_schema: {
            type: "object" as const,
            properties: {},
            required: [],
        },
    },
    {
        name: "get_recent_notes",
        description: "Get recent notes and annotations on tools.",
        input_schema: {
            type: "object" as const,
            properties: {
                tool_name: { type: "string", description: "Optional: filter notes for a specific tool" },
            },
            required: [],
        },
    },
    {
        name: "get_decisions",
        description: "Get recent decision log entries: actions taken on tools, spend changes, procurement decisions.",
        input_schema: {
            type: "object" as const,
            properties: {
                limit: { type: "number", description: "Number of entries to return (default 20)" },
            },
            required: [],
        },
    },
    {
        name: "get_risk_alerts",
        description: "Get risk assessments and security alerts for tools in the workspace.",
        input_schema: {
            type: "object" as const,
            properties: {},
            required: [],
        },
    },
    {
        name: "search_feed",
        description: "Search the AI news feed for articles by keyword or category.",
        input_schema: {
            type: "object" as const,
            properties: {
                query: { type: "string", description: "Search query for feed articles" },
            },
            required: ["query"],
        },
    },
    {
        name: "get_renewals",
        description: "Get upcoming software renewals with dates, costs, and contract details.",
        input_schema: {
            type: "object" as const,
            properties: {},
            required: [],
        },
    },
];

// ── Human-friendly labels for tool progress UI ───────────────────────────────

export const toolLabels: Record<string, string> = {
    search_tools: "Searching tools...",
    get_tool_detail: "Fetching tool details...",
    get_spend_overview: "Analyzing spend data...",
    get_spend_by_tool: "Looking up tool spend...",
    compare_tools: "Comparing tools...",
    get_health_score: "Checking stack health...",
    get_pain_points: "Reviewing pain points...",
    get_recent_notes: "Fetching notes...",
    get_decisions: "Loading decision log...",
    get_risk_alerts: "Scanning risk alerts...",
    search_feed: "Searching news feed...",
    get_renewals: "Checking renewals...",
};

// ── Tool executors ───────────────────────────────────────────────────────────

type ToolExecutor = (input: Record<string, unknown>, workspaceId: string) => Promise<string>;

async function searchTools(input: Record<string, unknown>, workspaceId: string): Promise<string> {
    const conditions = [eq(tools.workspaceId, workspaceId)];
    if (input.name) conditions.push(ilike(tools.name, `%${input.name}%`));
    if (input.status) conditions.push(eq(tools.status, input.status as string));

    let results = await db
        .select({
            name: tools.name,
            overallScore: tools.overallScore,
            status: tools.status,
            category: tools.category,
            websiteUrl: tools.websiteUrl,
        })
        .from(tools)
        .where(and(...conditions))
        .orderBy(desc(tools.overallScore))
        .limit(20);

    if (input.category) {
        const cat = (input.category as string).toLowerCase();
        results = results.filter(
            (t) => t.category?.some((c) => c.toLowerCase().includes(cat))
        );
    }

    return JSON.stringify({ tools: results, count: results.length });
}

async function getToolDetail(input: Record<string, unknown>, workspaceId: string): Promise<string> {
    const toolName = input.tool_name as string;
    const tool = await db.query.tools.findFirst({
        where: and(eq(tools.workspaceId, workspaceId), ilike(tools.name, `%${toolName}%`)),
    });
    if (!tool) return JSON.stringify({ error: `Tool "${toolName}" not found in workspace` });

    const latestReport = await db.query.reports.findFirst({
        where: eq(reports.toolId, tool.id),
        orderBy: [desc(reports.createdAt)],
    });

    return JSON.stringify({
        name: tool.name,
        score: tool.overallScore,
        status: tool.status,
        categories: tool.category,
        websiteUrl: tool.websiteUrl,
        report: latestReport
            ? {
                  summary: latestReport.summary,
                  scorecard: latestReport.scorecardSnapshot,
                  pricing: latestReport.pricing,
                  pros: latestReport.pros,
                  cons: latestReport.cons,
                  competitors: latestReport.competitors,
                  integrations: latestReport.integrations,
              }
            : null,
    });
}

async function getSpendOverview(_input: Record<string, unknown>, workspaceId: string): Promise<string> {
    const entries = await db
        .select()
        .from(softwareSpend)
        .where(eq(softwareSpend.workspaceId, workspaceId))
        .orderBy(desc(softwareSpend.monthlyCost));

    const insights = computeStackInsights(entries);

    return JSON.stringify({
        totalMonthlySpend: Math.round(insights.totalActiveSpend),
        totalAnnualSpend: Math.round(insights.totalActiveSpend * 12),
        aiNativenessScore: insights.score,
        aiNativenessLabel: insights.label,
        toolCounts: {
            aiNative: insights.aiNativeCount,
            aiEnabled: insights.aiEnabledCount,
            traditional: insights.traditionalCount,
            unclassified: insights.unknownCount,
        },
        timeSaved: {
            hoursPerMonth: Math.round(insights.timeSavedPerMonth),
            dollarValuePerYear: Math.round(insights.dollarValueSaved),
        },
        topBySpend: entries
            .filter((e) => e.status === "active")
            .slice(0, 10)
            .map((e) => ({
                name: e.toolName,
                monthlyCost: e.monthlyCost,
                seats: e.seatCount,
                category: e.category,
            })),
        opportunities: insights.opportunities,
    });
}

async function getSpendByTool(input: Record<string, unknown>, workspaceId: string): Promise<string> {
    const toolName = input.tool_name as string;
    const entry = await db.query.softwareSpend.findFirst({
        where: and(
            eq(softwareSpend.workspaceId, workspaceId),
            ilike(softwareSpend.toolName, `%${toolName}%`)
        ),
    });
    if (!entry) return JSON.stringify({ error: `No spend entry found for "${toolName}"` });

    return JSON.stringify({
        toolName: entry.toolName,
        monthlyCost: entry.monthlyCost,
        seatCount: entry.seatCount,
        billingCycle: entry.billingCycle,
        status: entry.status,
        renewalDate: entry.renewalDate,
        contractLengthMonths: entry.contractLength,
        category: entry.category,
        notes: entry.notes,
    });
}

async function compareTools(input: Record<string, unknown>, workspaceId: string): Promise<string> {
    const names = input.tool_names as string[];
    if (!names || names.length < 2 || names.length > 3) {
        return JSON.stringify({ error: "Provide 2-3 tool names to compare" });
    }

    const foundTools = await Promise.all(
        names.map((name) =>
            db.query.tools.findFirst({
                where: and(eq(tools.workspaceId, workspaceId), ilike(tools.name, `%${name}%`)),
            })
        )
    );

    const valid = foundTools.filter(Boolean) as NonNullable<(typeof foundTools)[0]>[];
    if (valid.length < 2) return JSON.stringify({ error: "Could not find enough tools to compare" });

    const toolIds = valid.map((t) => t.id);
    const latestReports = await db
        .selectDistinctOn([reports.toolId], {
            toolId: reports.toolId,
            scorecardSnapshot: reports.scorecardSnapshot,
            pricing: reports.pricing,
            pros: reports.pros,
            cons: reports.cons,
        })
        .from(reports)
        .where(inArray(reports.toolId, toolIds))
        .orderBy(reports.toolId, desc(reports.createdAt));

    const reportMap = new Map(latestReports.map((r) => [r.toolId, r]));

    return JSON.stringify({
        comparison: valid.map((t) => {
            const r = reportMap.get(t.id);
            return {
                name: t.name,
                score: t.overallScore,
                categories: t.category,
                scorecard: r?.scorecardSnapshot ?? null,
                pricing: r?.pricing ?? null,
                pros: r?.pros ?? [],
                cons: r?.cons ?? [],
            };
        }),
    });
}

async function getHealthScore(_input: Record<string, unknown>, workspaceId: string): Promise<string> {
    const latest = await db.query.stackHealthScores.findFirst({
        where: eq(stackHealthScores.workspaceId, workspaceId),
        orderBy: [desc(stackHealthScores.computedAt)],
    });
    if (!latest) return JSON.stringify({ error: "No stack health score computed yet. Visit the Health dashboard to generate one." });

    return JSON.stringify({
        score: latest.score,
        breakdown: latest.breakdown,
        recommendations: latest.recommendations,
        computedAt: latest.computedAt,
    });
}

async function getPainPoints(_input: Record<string, unknown>, workspaceId: string): Promise<string> {
    const active = await db
        .select({
            title: painPoints.title,
            description: painPoints.description,
            category: painPoints.category,
            createdAt: painPoints.createdAt,
        })
        .from(painPoints)
        .where(and(eq(painPoints.workspaceId, workspaceId), eq(painPoints.active, true)))
        .orderBy(desc(painPoints.createdAt))
        .limit(15);

    return JSON.stringify({ painPoints: active, count: active.length });
}

async function getRecentNotes(input: Record<string, unknown>, workspaceId: string): Promise<string> {
    // Get workspace member IDs for this workspace
    const members = await db
        .select({ id: workspaceMembers.id })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, workspaceId));

    if (members.length === 0) return JSON.stringify({ notes: [], count: 0 });

    const memberIds = members.map((m) => m.id);
    const conditions = [inArray(notes.workspaceMemberId, memberIds)];

    if (input.tool_name) {
        const tool = await db.query.tools.findFirst({
            where: and(eq(tools.workspaceId, workspaceId), ilike(tools.name, `%${input.tool_name}%`)),
        });
        if (tool) conditions.push(eq(notes.toolId, tool.id));
    }

    const results = await db
        .select({
            content: notes.content,
            noteType: notes.noteType,
            toolId: notes.toolId,
            createdAt: notes.createdAt,
        })
        .from(notes)
        .where(and(...conditions))
        .orderBy(desc(notes.createdAt))
        .limit(20);

    // Enrich with tool names
    if (results.length > 0) {
        const toolIds = [...new Set(results.map((n) => n.toolId))];
        const toolNames = await db
            .select({ id: tools.id, name: tools.name })
            .from(tools)
            .where(inArray(tools.id, toolIds));
        const nameMap = new Map(toolNames.map((t) => [t.id, t.name]));

        return JSON.stringify({
            notes: results.map((n) => ({
                content: n.content,
                type: n.noteType,
                toolName: nameMap.get(n.toolId) ?? "Unknown",
                date: n.createdAt,
            })),
            count: results.length,
        });
    }

    return JSON.stringify({ notes: [], count: 0 });
}

async function getDecisions(input: Record<string, unknown>, workspaceId: string): Promise<string> {
    const limit = Math.min((input.limit as number) || 20, 50);

    const entries = await db
        .select({
            action: decisionLog.action,
            actorName: decisionLog.actorName,
            details: decisionLog.details,
            toolId: decisionLog.toolId,
            createdAt: decisionLog.createdAt,
        })
        .from(decisionLog)
        .where(eq(decisionLog.workspaceId, workspaceId))
        .orderBy(desc(decisionLog.createdAt))
        .limit(limit);

    // Enrich with tool names
    const toolIds = entries.map((e) => e.toolId).filter(Boolean) as string[];
    let nameMap = new Map<string, string>();
    if (toolIds.length > 0) {
        const toolNames = await db
            .select({ id: tools.id, name: tools.name })
            .from(tools)
            .where(inArray(tools.id, toolIds));
        nameMap = new Map(toolNames.map((t) => [t.id, t.name]));
    }

    return JSON.stringify({
        decisions: entries.map((e) => ({
            action: e.action,
            actor: e.actorName ?? "System",
            details: e.details,
            toolName: e.toolId ? nameMap.get(e.toolId) ?? null : null,
            date: e.createdAt,
        })),
        count: entries.length,
    });
}

async function getRiskAlerts(_input: Record<string, unknown>, workspaceId: string): Promise<string> {
    const assessments = await db
        .select({
            toolId: riskAssessments.toolId,
            overallRisk: riskAssessments.overallRisk,
            alertLevel: riskAssessments.alertLevel,
            findings: riskAssessments.findings,
            assessedAt: riskAssessments.assessedAt,
        })
        .from(riskAssessments)
        .where(eq(riskAssessments.workspaceId, workspaceId))
        .orderBy(desc(riskAssessments.overallRisk))
        .limit(20);

    if (assessments.length === 0) return JSON.stringify({ alerts: [], count: 0 });

    // Enrich with tool names
    const toolIds = assessments.map((a) => a.toolId);
    const toolNames = await db
        .select({ id: tools.id, name: tools.name })
        .from(tools)
        .where(inArray(tools.id, toolIds));
    const nameMap = new Map(toolNames.map((t) => [t.id, t.name]));

    return JSON.stringify({
        alerts: assessments.map((a) => ({
            toolName: nameMap.get(a.toolId) ?? "Unknown",
            alertLevel: a.alertLevel,
            riskScore: a.overallRisk,
            findings: a.findings,
            assessedAt: a.assessedAt,
        })),
        count: assessments.length,
    });
}

async function searchFeed(input: Record<string, unknown>, workspaceId: string): Promise<string> {
    const query = input.query as string;
    const results = await db
        .select({
            title: feedItems.title,
            source: feedItems.source,
            summary: feedItems.summary,
            url: feedItems.url,
            categories: feedItems.categories,
            publishedAt: feedItems.publishedAt,
        })
        .from(feedItems)
        .where(
            and(
                eq(feedItems.workspaceId, workspaceId),
                or(
                    ilike(feedItems.title, `%${query}%`),
                    ilike(feedItems.summary, `%${query}%`),
                )
            )
        )
        .orderBy(desc(feedItems.publishedAt))
        .limit(10);

    return JSON.stringify({ articles: results, count: results.length });
}

async function getRenewals(_input: Record<string, unknown>, workspaceId: string): Promise<string> {
    const entries = await db
        .select({
            toolName: softwareSpend.toolName,
            monthlyCost: softwareSpend.monthlyCost,
            renewalDate: softwareSpend.renewalDate,
            contractLengthMonths: softwareSpend.contractLength,
            billingCycle: softwareSpend.billingCycle,
            seatCount: softwareSpend.seatCount,
            status: softwareSpend.status,
        })
        .from(softwareSpend)
        .where(
            and(
                eq(softwareSpend.workspaceId, workspaceId),
                eq(softwareSpend.status, "active")
            )
        )
        .orderBy(softwareSpend.renewalDate)
        .limit(30);

    return JSON.stringify({
        renewals: entries.map((e) => ({
            toolName: e.toolName,
            monthlyCost: e.monthlyCost,
            renewalDate: e.renewalDate,
            contractLengthMonths: e.contractLengthMonths,
            billingCycle: e.billingCycle,
            seats: e.seatCount,
        })),
        count: entries.length,
    });
}

// ── Executor map ─────────────────────────────────────────────────────────────

export const toolExecutors: Record<string, ToolExecutor> = {
    search_tools: searchTools,
    get_tool_detail: getToolDetail,
    get_spend_overview: getSpendOverview,
    get_spend_by_tool: getSpendByTool,
    compare_tools: compareTools,
    get_health_score: getHealthScore,
    get_pain_points: getPainPoints,
    get_recent_notes: getRecentNotes,
    get_decisions: getDecisions,
    get_risk_alerts: getRiskAlerts,
    search_feed: searchFeed,
    get_renewals: getRenewals,
};
